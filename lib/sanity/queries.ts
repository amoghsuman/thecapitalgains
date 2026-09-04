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

const LESSON_BODY_PROJECTION = `
  ...,
  _type == "callout" => {
    _type,
    _key,
    type,
    text
  },
  _type == "exercise" => {
    _type,
    _key,
    variant,
    title,
    steps,
    scenario,
    prompt,
    modelAnswer,
    question,
    options,
    correctIndex,
    explanation
  },
  _type == "mathBlock" => {
    _type,
    _key,
    latex,
    caption
  },
  _type == "keyFact" => {
    _type,
    _key,
    label,
    "value": value,
    context
  },
  _type == "table" => {
    _type,
    _key,
    caption,
    headers,
    rows
  },
  _type == "statGrid" => {
    _type,
    _key,
    stats
  }
`

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
