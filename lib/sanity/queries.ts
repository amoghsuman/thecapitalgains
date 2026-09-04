import { client } from './client'

export async function getAllCourses(learningPath?: string) {
  const filter = learningPath
    ? `*[_type == "course" && learningPath == "${learningPath}"]`
    : `*[_type == "course"]`

  return client.fetch(`
    ${filter} | order(orderRank asc, title asc) {
      _id,
      title,
      "slug": slug.current,
      tag,
      price,
      accessLevel,
      badge,
      subtitle,
      lessonsCount,
      duration,
      description,
      topics,
      learningPath,
      orderRank
    }
  `)
}

export async function getCourseBySlug(slug: string) {
  return client.fetch(`
    *[_type == "course" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      tag,
      price,
      accessLevel,
      badge,
      subtitle,
      lessonsCount,
      duration,
      description,
      topics,
      whatYouLearn,
      chapters[] {
        title,
        lessons[]-> {
          title,
          "slug": slug.current,
          duration,
          isFree,
          body
        }
      }
    }
  `, { slug })
}

export async function getFullCourseForReader(courseSlug: string) {
  return client.fetch(`
    *[_type == "course" && slug.current == $courseSlug][0] {
      title,
      "slug": slug.current,
      accessLevel,
      chapters[] {
        title,
        lessons[]-> {
          title,
          "slug": slug.current,
          duration,
          isFree
        }
      }
    }
  `, { courseSlug })
}

// Deliberately a blanket spread, not a per-`_type` field enumeration. This
// project used to hand-maintain an explicit projection per block `_type`
// here (see git history), which meant every new lesson block type needed a
// matching entry added in two places (the schema AND this query) or its
// fields would be silently stripped on fetch. Empirically confirmed (see
// CLAUDE.md) that `...` already returns every field of every array item
// regardless of `_type`, at any nesting depth — including collapsible's
// nested `content[]` array, whatever block types it contains. With the
// block type surface now large enough that scaling to 1000+ courses means
// scaling to many more block types over time, the blanket spread is the
// simpler, correctness-by-construction choice going forward.
const LESSON_BODY_PROJECTION = `...`

export async function getLessonBySlug(courseSlug: string, lessonSlug: string) {
  const course = await client.fetch(`
    *[_type == "course" && slug.current == $courseSlug][0] {
      title,
      "slug": slug.current,
      accessLevel,
      "lessonRef": (chapters[].lessons[]->{ _id, "slug": slug.current })[slug == $lessonSlug][0]
    }
  `, { courseSlug, lessonSlug })

  if (!course || !course.lessonRef) return null

  const lesson = await client.fetch(`
    *[_id == $lessonId][0] {
      title,
      "slug": slug.current,
      duration,
      isFree,
      body[] {
        ${LESSON_BODY_PROJECTION}
      }
    }
  `, { lessonId: course.lessonRef._id })

  if (!lesson) return null

  return {
    title: course.title,
    slug: course.slug,
    lesson,
  }
}

export async function getLessonContent(courseSlug: string, lessonSlug: string) {
  return client.fetch(`
    *[_type == "course" && slug.current == $courseSlug][0] {
      title,
      price,
      accessLevel,
      "lesson": (chapters[].lessons[]->{
        title,
        "slug": slug.current,
        duration,
        isFree,
        body
      })[slug == $lessonSlug][0]
    }
  `, { courseSlug, lessonSlug })
}
