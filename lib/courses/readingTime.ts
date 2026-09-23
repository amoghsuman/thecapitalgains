/**
 * Utility to calculate dynamic Estimated Reading Time based on average word counts
 * across lessons, chapters, descriptions, and learning outcomes.
 *
 * Industry benchmark for technical/financial instructional reading:
 * ~180-200 words per minute (WPM).
 */

export interface WordCountSource {
  description?: string | null;
  whatYouLearn?: string[] | null;
  topics?: string[] | null;
  lessonsCount?: number | null;
  duration?: string | null;
}

export function estimateCourseReadingTime(course: WordCountSource): {
  minutes: number;
  formatted: string;
  wordCountEstimate: number;
} {
  // 1. Calculate base word counts from text fields
  let directWords = 0;

  if (course.description) {
    directWords += course.description.trim().split(/\s+/).filter(Boolean).length;
  }

  if (course.whatYouLearn && Array.isArray(course.whatYouLearn)) {
    for (const item of course.whatYouLearn) {
      if (item) directWords += item.trim().split(/\s+/).filter(Boolean).length;
    }
  }

  if (course.topics && Array.isArray(course.topics)) {
    for (const t of course.topics) {
      if (t) directWords += t.trim().split(/\s+/).filter(Boolean).length;
    }
  }

  // 2. Average lesson word count in this curriculum: ~750 - 1100 words per lesson
  // Default to 850 words per technical lesson with formulas, breakdowns, and case studies
  const lessons = Math.max(1, course.lessonsCount || 4);
  const estimatedLessonWords = lessons * 850;

  const totalWords = directWords + estimatedLessonWords;

  // 3. Average reading speed: 190 words per minute for technical finance reading
  const WORDS_PER_MINUTE = 190;
  let estimatedMinutes = Math.round(totalWords / WORDS_PER_MINUTE);

  // If course has explicit duration string like "45 min" or "2 hrs", calibrate sensibly
  if (course.duration) {
    const raw = course.duration.toLowerCase();
    const hoursMatch = raw.match(/(\d+(\.\d+)?)\s*(hr|hour)/);
    const minsMatch = raw.match(/(\d+)\s*(min|minute)/);
    
    if (hoursMatch) {
      const parsedMins = Math.round(parseFloat(hoursMatch[1]) * 60);
      if (parsedMins > 0) {
        estimatedMinutes = parsedMins;
      }
    } else if (minsMatch) {
      const parsedMins = parseInt(minsMatch[1], 10);
      if (parsedMins > 0) {
        estimatedMinutes = parsedMins;
      }
    }
  }

  // Format string nicely (e.g., "18 min read" or "2 hr 15 min read")
  let formatted = "";
  if (estimatedMinutes < 60) {
    formatted = `${Math.max(5, estimatedMinutes)} min read`;
  } else {
    const hrs = Math.floor(estimatedMinutes / 60);
    const remainder = estimatedMinutes % 60;
    if (remainder === 0) {
      formatted = `${hrs} hr read`;
    } else {
      formatted = `${hrs}h ${remainder}m read`;
    }
  }

  return {
    minutes: estimatedMinutes,
    formatted,
    wordCountEstimate: totalWords,
  };
}
