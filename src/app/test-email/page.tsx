'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface TestResult {
  emailAddress: string
  username: string
  tradeIdeaGenerated: boolean
  emailSent: boolean
}

export default function TestEmailPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const sendTestEmail = async () => {
    if (!user) {
      setError('Please log in first')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`/api/test-email?userId=${user.id}`)
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to send test email')
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Test Email</h1>
          <p className="text-blue-200">Please log in to test email notifications</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Test Email Notification</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">What this will do:</h3>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Generate a new trade idea</li>
              <li>• Send an email to: <span className="font-mono">{user.email}</span></li>
              <li>• Test the email notification system</li>
            </ul>
          </div>

          <button
            onClick={sendTestEmail}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </button>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg">
              <h4 className="font-semibold mb-2">✅ Test Successful!</h4>
              <div className="text-sm space-y-1">
                <p><strong>Email sent to:</strong> {result.emailAddress}</p>
                <p><strong>Username:</strong> {result.username}</p>
                <p><strong>Trade idea generated:</strong> {result.tradeIdeaGenerated ? 'Yes' : 'No'}</p>
                <p><strong>Email delivery:</strong> {result.emailSent ? 'Success' : 'Failed'}</p>
              </div>
              <p className="text-xs mt-2 opacity-75">
                Check your email inbox for the test notification!
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/dashboard" 
            className="text-blue-300 hover:text-blue-200 text-sm underline"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
