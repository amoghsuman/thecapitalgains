// HOW TO RUN:
// 1. Set environment variables:
//    export SANITY_TOKEN="your_sanity_token"
//    export ANTHROPIC_API_KEY="your_anthropic_api_key"
//    On Windows (PowerShell):
//    $env:SANITY_TOKEN="your_sanity_token"
//    $env:ANTHROPIC_API_KEY="your_anthropic_api_key"
// 2. Run: node generate-lesson-content.mjs <course-slug>
//    Example: node generate-lesson-content.mjs stock-market-from-zero
//
// Dependencies: npm install @anthropic-ai/sdk @sanity/client

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@sanity/client'
import { randomUUID } from 'crypto'

// ─── Env Validation ───────────────────────────────────────────────────────────

const SANITY_TOKEN = process.env.SANITY_TOKEN
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!SANITY_TOKEN) {
  console.error('ERROR: SANITY_TOKEN environment variable is not set.')
  process.exit(1)
}
if (!ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY environment variable is not set.')
  process.exit(1)
}

const courseSlug = process.argv[2]
if (!courseSlug) {
  console.error('ERROR: No course slug provided.')
  console.error('Usage: node generate-lesson-content.mjs <course-slug>')
  console.error('Example: node generate-lesson-content.mjs stock-market-from-zero')
  process.exit(1)
}

// ─── Clients ──────────────────────────────────────────────────────────────────

const sanity = createClient({
  projectId: 'xmblxfh8',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

// ─── Lesson Descriptions (stock-market-from-zero) ────────────────────────────

const LESSON_DESCRIPTIONS = {
  "Why Companies Need Money — and Why You Can Own a Piece":
    "How businesses raise capital by selling shares to the public. The logic of equity ownership explained simply.",
  "BSE and NSE — India's Two Stock Exchanges Explained":
    "History, differences, and roles of Bombay Stock Exchange and National Stock Exchange. What Sensex and Nifty actually measure.",
  "How a Stock Gets Listed — The IPO Process in 5 Minutes":
    "From private company to publicly traded — the journey simplified. Why companies go public and what it means for investors.",
  "Who's Actually Trading? — FIIs, DIIs, Retail Investors and HNIs":
    "The four categories of market participants, how their behaviour differs, and why FII flows move markets.",
  "Demat vs Trading Account — What's the Difference?":
    "Why you need both accounts, what each does, and how they work together when you buy or sell a stock.",
  "Choosing Your Broker — Zerodha vs Groww vs ICICI Direct":
    "A side-by-side comparison of India's top brokers on brokerage, features, platform quality, and who each is best for.",
  "Step-by-Step: Opening Your Demat Account Online":
    "The exact documents needed, the KYC process, nominee addition, and common mistakes to avoid during account opening.",
  "Understanding All the Charges — Brokerage, STT, DP Charges and More":
    "Every fee you'll pay as an investor itemised and explained. How to calculate your true cost per trade.",
  "Market Orders vs Limit Orders — Which Should You Use?":
    "The difference between buying at market price and setting your own price. When each order type makes sense.",
  "CNC vs MIS vs NRML — Order Product Types Explained":
    "Delivery trades, intraday trades, and F&O positions — what these product codes mean and when to select each.",
  "What Happens After You Click Buy — Settlement Explained":
    "T+1 settlement, how shares move to your demat, why you can't sell shares you just bought on the same day in some cases.",
  "Reading a Stock Quote — Price, Volume, Circuit Limits and More":
    "How to read a live stock quote page. Upper and lower circuit limits, 52-week high/low, market cap, and P/E — explained.",
  "What is Nifty 50? — How the Index Is Constructed":
    "Free-float market cap weighting, index rebalancing, and why Nifty 50 is not a simple average of 50 stock prices.",
  "Nifty Sectoral Indices — Bank Nifty, Nifty IT, Nifty Pharma":
    "India's major sectoral indices, what they track, and how traders use them to take sector-level positions.",
  "Why the Market Goes Up and Down — The Real Drivers":
    "Earnings, interest rates, global cues, FII flows, elections, and sentiment — the 6 forces that move Indian markets.",
  "The Difference Between Investing and Trading":
    "Two completely different mindsets, time horizons, and skill sets. Which one is right for you and why mixing them up is dangerous.",
  "How Much Money Do You Need to Start?":
    "Debunking the myth that you need lakhs to begin. Starting with Rs. 500, building habits, and why starting early beats starting big.",
  "The 3 Mistakes Every First-Time Investor Makes":
    "Buying tips, ignoring charges, and panic selling. Real examples of how these mistakes cost retail investors money.",
  "Lesson from the Masters: How Warren Buffett Bought His First Stock at Age 11":
    "Buffett's first trade — Cities Service preferred shares — and the three lessons he took from that early experience that shaped his entire philosophy.",
  "Your 30-Day Plan to Become a Confident Investor":
    "A structured 4-week action plan: week-by-week tasks from opening your account to making your first informed investment decision.",
}

// ─── Portable Text Converter ──────────────────────────────────────────────────

function toPortableText(blocks) {
  return blocks.map(block => {
    if (block.type === 'paragraph') {
      return {
        _type: 'block',
        _key: randomUUID(),
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: randomUUID(),
            text: block.text,
            marks: [],
          },
        ],
      }
    }

    if (block.type === 'callout') {
      return {
        _type: 'callout',
        _key: randomUUID(),
        type: block.calloutType === 'warning' ? 'warning' : 'insight',
        text: block.text,
      }
    }

    if (block.type === 'exercise') {
      return {
        _type: 'exercise',
        _key: randomUUID(),
        title: block.title,
        steps: Array.isArray(block.steps) ? block.steps : [],
      }
    }

    // Unknown block type — skip
    console.warn(`  Warning: Unknown block type "${block.type}" — skipping.`)
    return null
  }).filter(Boolean)
}

// ─── Claude Generation ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a financial educator writing course content for The Capital Gains, a premium Indian retail investing education platform. Your writing style is:
- Direct and clear, like a sharp teacher explaining to a smart adult
- Uses Indian market context: NSE, BSE, Nifty, Zerodha, SEBI, INR, etc.
- No em dashes (—) anywhere. Use commas, colons, or shorter sentences instead
- Bullet lists are allowed and encouraged where they genuinely aid clarity, such as listing steps, comparing options, or enumerating items. Do not avoid them artificially.
- Lesson openers are fine. They should be engaging and hook the reader into the topic, not dry procedural statements like "In this lesson we will cover X, Y and Z."
- No filler phrases like "it is important to note" or "as we discussed"
- Start immediately with the substance of the topic
- Vary sentence length. Short sentences land punches. Longer ones build context.
- Each lesson is a standalone text-first reading experience`

function buildUserPrompt(courseTitle, chapterTitle, lessonTitle, description, duration) {
  return `Course: ${courseTitle}
Chapter: ${chapterTitle}
Lesson title: ${lessonTitle}
Lesson description: ${description || 'No description available.'}
Estimated reading time: ${duration || 'Unknown'}

Write the full lesson content. Structure it as flowing paragraphs.
After every 3-4 paragraphs of explanation, add either:
- A CALLOUT block (type: insight or warning) for a key takeaway or caution
- Or an EXERCISE block with a title and 3-5 practical steps the reader should do

Return your response as a JSON object with this exact structure:
{
  "blocks": [
    {
      "type": "paragraph",
      "text": "paragraph text here"
    },
    {
      "type": "callout",
      "calloutType": "insight",
      "text": "callout text here"
    },
    {
      "type": "callout",
      "calloutType": "warning",
      "text": "callout text here"
    },
    {
      "type": "exercise",
      "title": "exercise title",
      "steps": ["step 1", "step 2", "step 3"]
    }
  ]
}

Return ONLY the JSON object. No markdown fences, no explanation outside the JSON.`
}

async function generateLessonBody(courseTitle, chapterTitle, lessonTitle, description, duration) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(courseTitle, chapterTitle, lessonTitle, description, duration),
      },
    ],
  })

  const rawText = message.content[0]?.text ?? ''

  // Strip markdown fences if Claude added them despite instructions
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch (err) {
    console.warn(`  Warning: Claude returned invalid JSON for "${lessonTitle}". Using empty body.`)
    console.warn(`  Raw response (first 200 chars): ${rawText.slice(0, 200)}`)
    return []
  }

  if (!Array.isArray(parsed?.blocks)) {
    console.warn(`  Warning: Claude response had no "blocks" array for "${lessonTitle}". Using empty body.`)
    return []
  }

  return toPortableText(parsed.blocks)
}

// ─── Delay ────────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nFetching course "${courseSlug}" from Sanity...`)

  const course = await sanity.fetch(
    `*[_type == "course" && slug.current == $slug][0]`,
    { slug: courseSlug }
  )

  if (!course) {
    console.error(`ERROR: Course "${courseSlug}" not found in Sanity.`)
    process.exit(1)
  }

  console.log(`Found: "${course.title}"`)

  const chapters = course.chapters ?? []
  const totalLessons = chapters.reduce((sum, ch) => sum + (ch.lessons?.length ?? 0), 0)

  console.log(`Chapters: ${chapters.length}  |  Total lessons: ${totalLessons}\n`)

  let lessonCounter = 0

  // Deep clone chapters so we can mutate lesson bodies
  const updatedChapters = JSON.parse(JSON.stringify(chapters))

  for (const chapter of updatedChapters) {
    for (const lesson of chapter.lessons ?? []) {
      lessonCounter++
      const description = LESSON_DESCRIPTIONS[lesson.title] ?? ''

      process.stdout.write(
        `Generating lesson ${lessonCounter}/${totalLessons}: "${lesson.title}"...\n`
      )

      const body = await generateLessonBody(
        course.title,
        chapter.title,
        lesson.title,
        description,
        lesson.duration,
      )

      lesson.body = body
      console.log(`  Done. ${body.length} blocks generated.`)

      // 1 second delay between API calls to avoid rate limiting
      if (lessonCounter < totalLessons) {
        await sleep(1000)
      }
    }
  }

  console.log(`\nPatching Sanity document...`)

  await sanity
    .patch(course._id)
    .set({ chapters: updatedChapters })
    .commit()

  console.log(`Course updated successfully.\n`)
  console.log(`──────────────────────────────────────────`)
  console.log(`${lessonCounter} lessons written to "${course.title}"`)
  console.log(`──────────────────────────────────────────\n`)
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})
