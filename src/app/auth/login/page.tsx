'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n-provider'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { t } = useI18n()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated City Map Blueprint Background */}
      <div className="absolute inset-0 opacity-15">
        <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          {/* Italy */}
          <g className="text-blue-400/30">
            <path
              d="M200,200 L250,180 L300,200 L320,250 L310,300 L280,320 L240,310 L200,280 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
            </path>
            {/* Italian cities */}
            <circle cx="220" cy="220" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="280" cy="240" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="260" cy="280" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" begin="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="2s" repeatCount="indefinite" />
            </circle>
            <text x="200" y="190" className="text-xs fill-current">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="4s" repeatCount="indefinite" />
              Italy
            </text>
          </g>
          
          {/* Switzerland */}
          <g className="text-blue-400/30">
            <path
              d="M300,150 L350,140 L380,160 L370,200 L340,220 L310,210 L290,180 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" begin="1s" repeatCount="indefinite" />
            </path>
            {/* Swiss cities */}
            <circle cx="320" cy="170" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" begin="0.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="350" cy="180" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" begin="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="330" cy="200" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" begin="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="2.5s" repeatCount="indefinite" />
            </circle>
            <text x="300" y="135" className="text-xs fill-current">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="4s" begin="1s" repeatCount="indefinite" />
              Switzerland
            </text>
          </g>
          
          {/* Singapore */}
          <g className="text-blue-400/30">
            <path
              d="M800,600 L850,590 L880,610 L870,650 L840,670 L810,660 L790,630 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" begin="2s" repeatCount="indefinite" />
            </path>
            {/* Singapore cities */}
            <circle cx="820" cy="620" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="850" cy="630" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" begin="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="830" cy="650" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" begin="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="3s" repeatCount="indefinite" />
            </circle>
            <text x="800" y="585" className="text-xs fill-current">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="4s" begin="2s" repeatCount="indefinite" />
              Singapore
            </text>
          </g>
          
          {/* Animated Connection Lines */}
          <path
            d="M320,200 L350,180 M350,180 L820,620"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            opacity="0.3"
          >
            <animate attributeName="stroke-dashoffset" values="0;8;0" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
          </path>
          
          {/* Animated Grid Pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)">
            <animate attributeName="opacity" values="0.1;0.3;0.1" dur="6s" repeatCount="indefinite" />
          </rect>
        </svg>
      </div>

      {/* Floating Data Streams */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Moving Data Points */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `dataFlow ${8 + Math.random() * 4}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
          
          {/* Moving Lines */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`line-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
              style={{
                width: `${200 + Math.random() * 100}px`,
                left: `${-200}px`,
                top: `${20 + i * 30}%`,
                animation: `lineFlow ${6 + i * 2}s linear infinite`,
                animationDelay: `${i * 1.5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="lg" className="animate-pulse hover:scale-110 transition-transform duration-300" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 animate-fade-in" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              ZacFX Trader
            </h1>
            
            {/* Language Switcher */}
            <div className="flex justify-center mb-4">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  {t('auth.login.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-white placeholder-blue-200 backdrop-blur-sm transition-all duration-200"
                  placeholder="trader@zacfx.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  {t('auth.login.password')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-white placeholder-blue-200 backdrop-blur-sm transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t('auth.login.submit')}...
                  </div>
                ) : (
                  t('auth.login.submit')
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-blue-200 text-sm">
                {t('auth.login.noAccount')}{' '}
                <Link href="/auth/signup" className="text-white hover:text-blue-200 font-semibold transition-colors duration-200">
                  {t('auth.login.signUp')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes dataFlow {
          0% {
            transform: translateY(100vh) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(50px);
            opacity: 0;
          }
        }
        
        @keyframes lineFlow {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100vw);
            opacity: 0;
          }
        }
        
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        
        /* Glowing effect for form */
        .bg-white\/10 {
          animation: glow 3s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
          from {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
          }
          to {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
          }
        }
      `}</style>
    </div>
  )
}

