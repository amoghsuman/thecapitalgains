import { client } from './client'

export async function getAllCourses() {
  return client.fetch(`
    *[_type == "course"] | order(_createdAt asc) {
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
      topics
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
