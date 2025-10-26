'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Settings, LogOut, Menu, X, Home, MessageSquare } from 'lucide-react'
import { useI18n } from '@/lib/i18n-provider'
import Logo from './Logo'
import { LanguageSwitcher } from './LanguageSwitcher'
import NotificationBell from './NotificationBell'

export default function Header({ username, userId }: { username?: string | null; userId?: string | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useI18n()


  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b border-slate-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-3 group">
                <Logo size="md" className="group-hover:scale-105 transition-transform duration-200" />
                <span className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  ZacFX Trader
                </span>
              </Link>

              <nav className="hidden md:flex space-x-4">
                <Link
                  href="/dashboard"
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  suppressHydrationWarning
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  href="/prompts"
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  suppressHydrationWarning
                >
                  {t('nav.prompts')}
                </Link>
                <Link
                  href="/settings"
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  suppressHydrationWarning
                >
                  {t('nav.settings')}
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {username && (
                <span className="hidden sm:block text-sm text-slate-600">
                  Welcome, <span className="font-medium text-slate-800">{username}</span>
                </span>
              )}
              
              {/* Notification Bell */}
              {userId && (
                <NotificationBell userId={userId} />
              )}
              
              {/* Language Switcher */}
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>
              
              {/* Desktop Sign Out */}
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center space-x-2 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                suppressHydrationWarning
              >
                <LogOut className="w-4 h-4" />
                <span suppressHydrationWarning>{t('nav.logout')}</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeMobileMenu}
          />
          <div className="fixed top-0 right-0 h-full w-80 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <Logo size="sm" />
                  <span className="text-lg font-bold text-slate-800" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    ZacFX Trader
                  </span>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="flex-1 px-4 py-6">
                {/* User Info */}
                {username && (
                  <div className="mb-6 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Welcome back,</p>
                    <p className="font-medium text-slate-800">{username}</p>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="space-y-2">
                  <Link
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    <span className="font-medium" suppressHydrationWarning>{t('nav.dashboard')}</span>
                  </Link>
                  
                  <Link
                    href="/prompts"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium" suppressHydrationWarning>{t('nav.prompts')}</span>
                  </Link>
                  
                  <Link
                    href="/settings"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium" suppressHydrationWarning>{t('nav.settings')}</span>
                  </Link>
                </nav>
              </div>

              {/* Mobile Menu Footer */}
              <div className="p-4 border-t border-slate-200 space-y-2">
                {/* Mobile Language Switcher */}
                <div className="mb-2">
                  <LanguageSwitcher />
                </div>
                
                <button
                  onClick={() => {
                    closeMobileMenu()
                    handleSignOut()
                  }}
                  className="flex items-center space-x-3 w-full px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium" suppressHydrationWarning>{t('nav.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}



