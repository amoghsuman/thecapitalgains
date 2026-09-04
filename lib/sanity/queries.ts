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
        lessons[] {
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
        lessons[] {
          title,
          "slug": slug.current,
          duration,
          isFree
        }
      }
    }
  `, { courseSlug })
}

export async function getLessonBySlug(courseSlug: string, lessonSlug: string) {
  const course = await client.fetch(`
    *[_type == "course" && slug.current == $courseSlug][0] {
      title,
      "slug": slug.current,
      accessLevel,
      chapters[] {
        title,
        lessons[] {
          title,
          "slug": slug.current,
          duration,
          isFree,
          body[] {
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
          }
        }
      }
    }
  `, { courseSlug })

  if (!course) return null

  for (const chapter of course.chapters || []) {
    for (const lesson of chapter.lessons || []) {
      if (lesson.slug === lessonSlug) {
        return {
          title: course.title,
          slug: course.slug,
          lesson,
        }
      }
    }
  }

  return null
}

export async function getLessonContent(courseSlug: string, lessonSlug: string) {
  return client.fetch(`
    *[_type == "course" && slug.current == $courseSlug][0] {
      title,
      price,
      accessLevel,
      "lesson": chapters[].lessons[slug.current == $lessonSlug][0] {
        title,
        "slug": slug.current,
        duration,
        isFree,
        body
      }
    }
  `, { courseSlug, lessonSlug })
}
