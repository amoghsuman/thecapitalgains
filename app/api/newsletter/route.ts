import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body: { email?: unknown; tag?: unknown } = await request.json()
    const email = typeof body.email === 'string' ? body.email : ''

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Optional tag (e.g. "portfolio-alerts") is stored in the existing
    // `source` column so no schema change is needed. Only known tags are kept.
    const ALLOWED_TAGS = ['portfolio-alerts'] as const
    const tag = typeof body.tag === 'string' && (ALLOWED_TAGS as readonly string[]).includes(body.tag) ? body.tag : null

    const supabase = await createClient()

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.toLowerCase().trim(), ...(tag ? { source: tag } : {}) })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
