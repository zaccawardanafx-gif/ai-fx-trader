'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import DashboardGrid from '@/components/DashboardGrid'
import AnimatedBackground from '@/components/AnimatedBackground'

interface User {
  id: string
  email?: string
}

interface Profile {
  id: string
  username: string | null
  email: string | null
  risk_per_trade: number | null
  pip_target_min: number | null
  pip_target_max: number | null
  breakeven_trigger: number | null
  technical_weight: number | null
  sentiment_weight: number | null
  macro_weight: number | null
  alert_frequency: string | null
  notify_email: boolean | null
  notify_whatsapp: boolean | null
  is_admin: boolean | null
  created_at: string | null
  updated_at: string | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profile)
      setLoading(false)
    }

    loadUser()
  }, [router, supabase])

  if (loading) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex flex-col">
        <Header username={profile?.username} />
        
        <main className="flex-1 w-full px-2 sm:px-4 lg:px-6 py-2 pb-16">
          {user && <DashboardGrid userId={user.id} />}
        </main>
      </div>
    </AnimatedBackground>
  )
}

