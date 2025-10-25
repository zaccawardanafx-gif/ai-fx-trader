'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { Clock, Pause, Play, Settings } from 'lucide-react'

interface AutoGenerationCountdownProps {
  nextGeneration?: string
  interval: string
  enabled: boolean
  paused: boolean
  onTogglePause: () => void
  onOpenSettings: () => void
}

export default function AutoGenerationCountdown({
  nextGeneration,
  interval,
  enabled,
  paused,
  onTogglePause,
  onOpenSettings
}: AutoGenerationCountdownProps) {
  const { t } = useI18n()
  const [timeLeft, setTimeLeft] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (!enabled || !nextGeneration) {
      setTimeLeft('')
      return
    }

    const updateCountdown = () => {
      const now = new Date()
      const next = new Date(nextGeneration)
      const diff = next.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft(t('autoGeneration.generating'))
        setIsGenerating(true)
        return
      }

      setIsGenerating(false)
      setTimeLeft(formatTimeLeft(diff))
    }

    // Update immediately
    updateCountdown()

    // Update every second
    const timer = setInterval(updateCountdown, 1000)

    return () => clearInterval(timer)
  }, [nextGeneration, enabled, t])

  const formatTimeLeft = (milliseconds: number): string => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24))
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const getIntervalDisplayName = (interval: string): string => {
    const intervalMap: { [key: string]: string } = {
      'hourly': t('autoGeneration.hourly'),
      '4hours': t('autoGeneration.4hours'),
      '6hours': t('autoGeneration.6hours'),
      '8hours': t('autoGeneration.8hours'),
      '12hours': t('autoGeneration.12hours'),
      'daily': t('autoGeneration.daily'),
      'weekly': t('autoGeneration.weekly')
    }
    return intervalMap[interval] || interval
  }

  if (!enabled) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300 flex-shrink-0" />
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-blue-200">
              {paused ? t('autoGeneration.paused') : t('autoGeneration.countdown')}
            </h3>
            <p className={`text-lg sm:text-xl font-bold ${
              isGenerating ? 'text-yellow-300' : 'text-blue-100'
            }`}>
              {paused ? '—' : timeLeft}
            </p>
            <p className="text-xs text-blue-300/80">
              {getIntervalDisplayName(interval)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={onTogglePause}
            className="p-1.5 sm:p-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white transition-colors duration-200"
            title={paused ? t('autoGeneration.resume') : t('autoGeneration.pause')}
          >
            {paused ? (
              <Play className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </button>
          
          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white transition-colors duration-200"
            title={t('autoGeneration.settings')}
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
      
      {isGenerating && (
        <div className="mt-2 flex items-center space-x-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-300"></div>
          <span className="text-xs text-yellow-300">
            {t('autoGeneration.generating')}
          </span>
        </div>
      )}
    </div>
  )
}
