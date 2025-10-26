'use client'

import { useEffect, useState, useRef } from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { Clock, Pause, Play, Settings } from 'lucide-react'

interface AutoGenerationCountdownProps {
  nextGeneration?: string
  interval: string
  enabled: boolean
  paused: boolean
  userId: string
  onTogglePause: () => void
  onOpenSettings: () => void
  onGenerate: () => void
}

export default function AutoGenerationCountdown({
  nextGeneration,
  interval,
  enabled,
  paused,
  userId,
  onTogglePause,
  onOpenSettings,
  onGenerate
}: AutoGenerationCountdownProps) {
  const { t } = useI18n()
  const [timeLeft, setTimeLeft] = useState('')
  
  // Helper function to get Zurich time
  const getZurichTime = (): string => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { 
      timeZone: 'Europe/Zurich',
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }
  
  const [currentTime, setCurrentTime] = useState<string>(() => getZurichTime())
  const [isGenerating, setIsGenerating] = useState(false)
  const lastTriggeredGenerationRef = useRef<string | undefined>(nextGeneration)
  
  // Update current time every second in Zurich timezone
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getZurichTime())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  // Reset generating state when nextGeneration changes (after generation completes)
  useEffect(() => {
    if (nextGeneration && lastTriggeredGenerationRef.current !== undefined && 
        nextGeneration !== lastTriggeredGenerationRef.current &&
        new Date(nextGeneration).getTime() > new Date(lastTriggeredGenerationRef.current).getTime()) {
      // Next generation time has been updated to a future time
      // Generation completed, reset state
      console.log('Next generation time updated, resetting state')
      setIsGenerating(false)
    }
    lastTriggeredGenerationRef.current = nextGeneration
  }, [nextGeneration])

  useEffect(() => {
    if (!enabled || !nextGeneration || paused) {
      setTimeLeft('')
      setIsGenerating(false)
      return
    }

    const updateCountdown = () => {
      const now = new Date()
      const next = new Date(nextGeneration)
      const diff = next.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft(t('autoGeneration.generating'))
        setIsGenerating(true)
        
        // Trigger generation once per nextGeneration value
        if (lastTriggeredGenerationRef.current !== nextGeneration) {
          console.log('Triggering generation for:', nextGeneration)
          lastTriggeredGenerationRef.current = nextGeneration
          onGenerate()
        }
      } else {
        // Countdown is positive - we're waiting
        setIsGenerating(false)
        setTimeLeft(formatTimeLeft(diff))
      }
    }

    // Update immediately
    updateCountdown()

    // Update every second
    const timer = setInterval(updateCountdown, 1000)

    return () => clearInterval(timer)
  }, [nextGeneration, enabled, paused, t, onGenerate])

  const formatTimeLeft = (milliseconds: number): string => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24))
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)

    // Always show days if there are any, or if it's a weekly interval
    if (days > 0 || interval === 'weekly') {
      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`
      } else {
        // Show hours and minutes even when days = 0 for weekly
        return `${hours}h ${minutes}m`
      }
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
            <div className="flex items-center gap-2 text-xs text-blue-300/80">
              <span>{getIntervalDisplayName(interval)}</span>
              <span className="text-blue-400/60">•</span>
              <span>{currentTime} (CET/CEST)</span>
            </div>
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
