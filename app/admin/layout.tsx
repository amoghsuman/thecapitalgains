import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAILS = ['your@email.com'] // replace with your actual email

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (!ADMIN_EMAILS.includes(user.email ?? '')) {
    redirect('/')
  }

  return <>{children}</>
}