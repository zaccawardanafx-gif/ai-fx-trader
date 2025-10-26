'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n-provider'
import Header from '@/components/Header'
import PromptEditor from '@/components/PromptEditor'
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

export default function PromptsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { t } = useI18n()


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
      <Header username={profile?.username} userId={user?.id} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {t('prompts.title')}
          </h1>
          <p className="text-blue-200 text-lg">
            {t('prompts.subtitle')}
          </p>
        </div>

        {user && <PromptEditor userId={user.id} />}
      </main>
    </AnimatedBackground>
  )
}

