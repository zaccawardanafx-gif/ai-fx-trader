'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n-provider'

export default function ResetLayoutButton() {
  const [isResetting, setIsResetting] = useState(false)
  const { t } = useI18n()

  const handleReset = () => {
    setIsResetting(true)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dashboard-layouts')
      window.location.reload()
    }
  }

  return (
    <button
      onClick={handleReset}
      disabled={isResetting}
      className="px-4 py-2 text-sm bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-md transition-colors border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isResetting ? `${t('dashboard.resetLayout')}...` : t('dashboard.resetLayout')}
    </button>
  )
}
