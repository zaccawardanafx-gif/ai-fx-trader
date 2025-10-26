'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { getUserTradeIdeas, generateTradeIdea } from '@/app/actions/generateTradeIdeas'
import { getAutoGenerationSettings, toggleAutoGenerationPause, updateAutoGenerationSettings, triggerAutoGeneration, type AutoGenerationStatus } from '@/app/actions/autoGeneration'
import { TrendingUp, TrendingDown, ChevronRight, Sparkles, Power, PowerOff } from 'lucide-react'
import TradeIdeaDetail from './TradeIdeaDetail'
import AllTradeIdeasModal from './AllTradeIdeasModal'
import AutoGenerationCountdown from './AutoGenerationCountdown'
import AutoGenerationSettings from './AutoGenerationSettings'

// Confidence Indicator Component
const ConfidenceIndicator = ({ 
  confidence, 
  translations 
}: { 
  confidence: number
  translations: {
    confidence: string
    title: string
    description: string
    high: string
    medium: string
    low: string
  }
}) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top')
  const [tooltipAlignment, setTooltipAlignment] = useState<'left' | 'center' | 'right'>('center')
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const getConfidenceColor = (conf: number) => {
    if (conf >= 70) return { dot: 'bg-green-500', text: 'text-green-600' }
    if (conf >= 50) return { dot: 'bg-yellow-500', text: 'text-yellow-600' }
    return { dot: 'bg-red-500', text: 'text-red-600' }
  }

  const colors = getConfidenceColor(confidence)

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return

    const trigger = triggerRef.current.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    // Much smaller tooltip dimensions
    const tooltipWidth = window.innerWidth < 640 ? 224 : 256 // w-56 = 224px mobile, w-64 = 256px desktop
    const tooltipHeight = 100 // Compact height

    // Default to top
    let position: 'top' | 'bottom' | 'left' | 'right' = 'top'

    // Check if tooltip would be cut off at the top
    if (trigger.top - tooltipHeight - 8 < 0) {
      position = 'bottom'
    }

    // Check if tooltip would be cut off at the bottom
    if (position === 'bottom' && trigger.bottom + tooltipHeight + 8 > viewport.height) {
      position = 'top' // Fall back to top
    }

    // Simplified margins
    const margin = window.innerWidth < 640 ? 8 : 16
    const centerPosition = trigger.left + trigger.width / 2
    const tooltipLeft = centerPosition - tooltipWidth / 2
    const tooltipRight = centerPosition + tooltipWidth / 2
    
    let alignment: 'left' | 'center' | 'right' = 'center'
    
    if (tooltipLeft < margin) {
      // Would be cut off on left, align to left edge of trigger container
      alignment = 'left'
    } else if (tooltipRight > viewport.width - margin) {
      // Would be cut off on right, align to right edge of trigger container
      alignment = 'right'
    }

    setTooltipPosition(position)
    setTooltipAlignment(alignment)
  }, [])

  const handleMouseEnter = () => {
    setShowTooltip(true)
    setTimeout(calculatePosition, 0)
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowTooltip(!showTooltip)
    if (!showTooltip) {
      setTimeout(calculatePosition, 50) // Slightly longer delay for mobile
    }
  }

  // Close tooltip when clicking outside on mobile
  const handleMobileBackdropTouch = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowTooltip(false)
  }

  useEffect(() => {
    if (showTooltip) {
      calculatePosition()
      window.addEventListener('resize', calculatePosition)
      window.addEventListener('scroll', calculatePosition)
      return () => {
        window.removeEventListener('resize', calculatePosition)
        window.removeEventListener('scroll', calculatePosition)
      }
    }
  }, [showTooltip, calculatePosition])

  const getTooltipClasses = () => {
    const base = "absolute z-50 bg-gray-900 text-white rounded-md shadow-lg transition-all duration-200 pointer-events-none"
    
    // Much more compact sizing
    const isMobile = window.innerWidth < 640
    const widthClass = isMobile ? "w-56" : "w-64"
    const paddingClass = "px-3 py-2"
    const marginClass = "mb-2"
    
    let horizontalClass = "left-1/2 transform -translate-x-1/2" // default center
    
    switch (tooltipAlignment) {
      case 'left':
        horizontalClass = "left-0"
        break
      case 'right':
        horizontalClass = "right-0"
        break
      case 'center':
      default:
        horizontalClass = "left-1/2 transform -translate-x-1/2"
        break
    }
    
    switch (tooltipPosition) {
      case 'top':
        return `${base} ${widthClass} ${paddingClass} bottom-full ${horizontalClass} ${marginClass}`
      case 'bottom':
        return `${base} ${widthClass} ${paddingClass} top-full ${horizontalClass} ${marginClass.replace('mb', 'mt')}`
      case 'left':
        return `${base} ${widthClass} ${paddingClass} right-full top-1/2 transform -translate-y-1/2 mr-3`
      case 'right':
        return `${base} ${widthClass} ${paddingClass} left-full top-1/2 transform -translate-y-1/2 ml-3`
      default:
        return `${base} ${widthClass} ${paddingClass} bottom-full ${horizontalClass} ${marginClass}`
    }
  }

  const getArrowClasses = () => {
    let arrowPosition = "left-1/2 transform -translate-x-1/2" // default center
    
    switch (tooltipAlignment) {
      case 'left':
        arrowPosition = "left-6" // Position arrow to point to trigger
        break
      case 'right':
        arrowPosition = "right-6" // Position arrow to point to trigger
        break
      case 'center':
      default:
        arrowPosition = "left-1/2 transform -translate-x-1/2"
        break
    }
    
    switch (tooltipPosition) {
      case 'top':
        return `absolute top-full ${arrowPosition} border-4 border-transparent border-t-gray-900`
      case 'bottom':
        return `absolute bottom-full ${arrowPosition} border-4 border-transparent border-b-gray-900`
      case 'left':
        return "absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"
      case 'right':
        return "absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"
      default:
        return `absolute top-full ${arrowPosition} border-4 border-transparent border-t-gray-900`
    }
  }

  return (
    <>
      <div className="flex items-center mb-2 sm:mb-3 p-2 bg-slate-50/50 rounded-lg border border-slate-200/50">
        <div className="flex items-center space-x-2 flex-1">
          <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
          <span className="text-xs text-slate-500">{translations.confidence}</span>
          <div 
            ref={triggerRef}
            className="relative cursor-help select-none ml-2 transition-colors duration-150 hover:opacity-80"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
          >
            <span className={`text-xs sm:text-sm font-semibold ${colors.text}`}>
              {Math.round(confidence)}%
            </span>
            
            {showTooltip && (
              <div 
                ref={tooltipRef}
                className={`${getTooltipClasses()} ${showTooltip ? 'opacity-100' : 'opacity-0'}`}
              >
              <div className="font-medium mb-1 text-xs">{translations.title}</div>
              <div className="text-gray-300 mb-2 text-xs leading-tight">
                AI confidence based on technical, sentiment & macro analysis
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="flex items-start space-x-1.5">
                  <span className="text-green-400 font-medium w-8 shrink-0">High:</span>
                  <span className="text-gray-300 leading-tight">70-100% • Strong signals</span>
                </div>
                <div className="flex items-start space-x-1.5">
                  <span className="text-yellow-400 font-medium w-8 shrink-0">Med:</span>
                  <span className="text-gray-300 leading-tight">50-69% • Mixed signals</span>
                </div>
                <div className="flex items-start space-x-1.5">
                  <span className="text-red-400 font-medium w-8 shrink-0">Low:</span>
                  <span className="text-gray-300 leading-tight">0-49% • Weak signals</span>
                </div>
              </div>
                <div className={getArrowClasses()}></div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile/tablet backdrop to close tooltip */}
      {showTooltip && (
        <div 
          className="fixed inset-0 z-40 sm:hidden bg-black bg-opacity-10"
          onTouchStart={handleMobileBackdropTouch}
          onTouchEnd={handleMobileBackdropTouch}
        />
      )}
    </>
  )
}

interface TradeIdea {
  id: string
  user_id: string | null
  prompt_version: number | null
  currency_pair: string | null
  direction: string
  entry: number
  stop_loss: number
  take_profit: number
  pip_target: number | null
  expiry: string | null
  rationale: string | null
  rationale_fr: string | null
  technical_score: number | null
  sentiment_score: number | null
  macro_score: number | null
  confidence: number | null
  technical_weight: number | null
  sentiment_weight: number | null
  macro_weight: number | null
  status: string | null
  spot_price_at_generation: number | null
  created_at: string | null
  updated_at: string | null
}

export default function TradeIdeasWidget({ userId }: { userId: string }) {
  const [tradeIdeas, setTradeIdeas] = useState<TradeIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIdea, setSelectedIdea] = useState<TradeIdea | null>(null)
  const [showAllIdeas, setShowAllIdeas] = useState(false)
  const [autoGenSettings, setAutoGenSettings] = useState<AutoGenerationStatus | null>(null)
  const [showAutoGenSettings, setShowAutoGenSettings] = useState(false)
  const [isAutoGenerating, setIsAutoGenerating] = useState(false)
  const [newTradeIdeaIds, setNewTradeIdeaIds] = useState<Set<string>>(new Set())
  const previousIdeasRef = useRef<string[]>([])
  const { t, locale } = useI18n()

  const loadTradeIdeas = useCallback(async () => {
    setLoading(true)
    try {
      console.log('Loading trade ideas for user:', userId)
      const result = await getUserTradeIdeas(userId, 5, 'active') // Only show active ideas
      console.log('Trade ideas result:', result)
      if (result.success) {
        // Check for new ideas
        const currentIds = result.data.map(idea => idea.id)
        const previousIds = previousIdeasRef.current
        
        // Find newly added ideas
        const newIds = currentIds.filter(id => !previousIds.includes(id))
        if (newIds.length > 0) {
          console.log('New trade ideas detected:', newIds)
          setNewTradeIdeaIds(prev => {
            const newSet = new Set(prev)
            newIds.forEach(id => newSet.add(id))
            return newSet
          })
          
          // Remove animation after 5 seconds
          setTimeout(() => {
            setNewTradeIdeaIds(prev => {
              const updated = new Set(prev)
              newIds.forEach(id => updated.delete(id))
              return updated
            })
          }, 5000)
        }
        
        setTradeIdeas(result.data)
        previousIdeasRef.current = currentIds
        setError(null)
      } else {
        setError(result.error || 'Failed to load trade ideas')
      }
    } catch (error) {
      console.error('Error in loadTradeIdeas:', error)
      setError('Failed to load trade ideas')
    }
    setLoading(false)
  }, [userId])

  const loadAutoGenSettings = useCallback(async () => {
    try {
      const result = await getAutoGenerationSettings(userId)
      if (result.success && result.data) {
        setAutoGenSettings(result.data)
      }
    } catch (error) {
      console.error('Error loading auto-generation settings:', error)
    }
  }, [userId])

  useEffect(() => {
    loadTradeIdeas()
    loadAutoGenSettings()
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadTradeIdeas()
      loadAutoGenSettings()
    }, 30000)
    return () => clearInterval(interval)
  }, [loadTradeIdeas, loadAutoGenSettings])

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    
    try {
      console.log('Generating trade idea for user:', userId)
      const result = await generateTradeIdea(userId)
      console.log('Generate result:', result)
      
      if (result.success) {
        await loadTradeIdeas()
      } else {
        setError(result.error || 'Failed to generate trade idea')
      }
    } catch (error) {
      console.error('Error in handleGenerate:', error)
      setError('Failed to generate trade idea')
    }
    
    setGenerating(false)
  }

  const handleTogglePause = async () => {
    if (!autoGenSettings) return
    
    try {
      const result = await toggleAutoGenerationPause(userId, !autoGenSettings.paused)
      if (result.success) {
        await loadAutoGenSettings()
      }
    } catch (error) {
      console.error('Error toggling pause:', error)
    }
  }

  const handleOpenSettings = () => {
    setShowAutoGenSettings(true)
  }

  const handleSettingsUpdate = async () => {
    await loadAutoGenSettings()
  }

  const handleToggleAutoGeneration = async () => {
    if (!autoGenSettings) return
    
    try {
      const newEnabledState = !autoGenSettings.enabled
      const result = await updateAutoGenerationSettings(userId, {
        enabled: newEnabledState,
        interval: autoGenSettings.interval,
        time: autoGenSettings.time,
        timezone: autoGenSettings.timezone,
        paused: autoGenSettings.paused
      })
      
      if (result.success) {
        await loadAutoGenSettings()
      } else {
        console.error('Error toggling auto-generation:', result.error)
      }
    } catch (error) {
      console.error('Error toggling auto-generation:', error)
    }
  }

  const handleAutoGenerate = async () => {
    // Prevent duplicate calls
    if (isAutoGenerating) {
      console.log('Auto-generation already in progress, skipping...')
      return
    }
    
    // Generate a trade idea when auto-generation timer expires
    console.log('Auto-generating trade idea for user:', userId)
    setIsAutoGenerating(true)
    setGenerating(true)
    setError(null)
    
    try {
      const result = await triggerAutoGeneration(userId)
      
      if (result.success) {
        // Reload trade ideas and settings
        await loadTradeIdeas()
        await loadAutoGenSettings()
      } else {
        setError(result.error || 'Failed to generate trade idea')
      }
    } catch (error) {
      console.error('Error in handleAutoGenerate:', error)
      setError('Failed to generate trade idea')
    } finally {
      setGenerating(false)
      setIsAutoGenerating(false)
    }
  }

  const calculatePips = (entry: number, target: number) => {
    return Math.abs((target - entry) * 10000).toFixed(1)
  }

  if (loading && tradeIdeas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/2"></div>
          <div className="h-20 bg-slate-100 rounded"></div>
          <div className="h-20 bg-slate-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-2 sm:p-6 border border-white/20 h-full flex flex-col">
        <div className="flex justify-between items-center mb-2 sm:mb-6 flex-shrink-0">
          <h2 className="text-base sm:text-2xl font-bold text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {t('tradeIdeas.title')}
          </h2>
          <div className="flex items-center space-x-2">
            {/* Auto-Generation Toggle */}
            {autoGenSettings && (
              <button
                onClick={handleToggleAutoGeneration}
                className={`flex items-center space-x-1 px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg ${
                  autoGenSettings.enabled
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
                }`}
                title={autoGenSettings.enabled ? t('autoGeneration.disableAutoGeneration') : t('autoGeneration.enableAutoGeneration')}
              >
                {autoGenSettings.enabled ? (
                  <Power className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <PowerOff className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                <span className="hidden sm:inline">
                  {autoGenSettings.enabled ? t('autoGeneration.autoOn') : t('autoGeneration.autoOff')}
                </span>
              </button>
            )}
            
            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
              title={t('tradeIdeas.title')}
            >
              <Sparkles className={`w-3 h-3 sm:w-4 sm:h-4 ${generating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{generating ? t('common.loading') : t('tradeIdeas.generateNewIdea')}</span>
            </button>
          </div>
        </div>

        {/* Auto-Generation Countdown */}
        {autoGenSettings && autoGenSettings.enabled && (
          <AutoGenerationCountdown
            nextGeneration={autoGenSettings.nextGeneration}
            interval={autoGenSettings.interval}
            enabled={autoGenSettings.enabled}
            paused={autoGenSettings.paused}
            userId={userId}
            onTogglePause={handleTogglePause}
            onOpenSettings={handleOpenSettings}
            onGenerate={handleAutoGenerate}
          />
        )}

        {/* Auto-Generation Setup Prompt */}
        {autoGenSettings && !autoGenSettings.enabled && (
          <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <PowerOff className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300 flex-shrink-0" />
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-blue-200">
                    {t('autoGeneration.autoGenerationAvailable')}
                  </h3>
                  <p className="text-xs text-blue-300/80">
                    {t('autoGeneration.setupAutoGeneration')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleOpenSettings}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
{t('autoGeneration.setup')}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-200 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm mb-3 sm:mb-4">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4">
          {tradeIdeas.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-blue-300/50 mx-auto mb-3" />
              <p className="text-xs sm:text-sm text-blue-200 mb-3 sm:mb-4">{t('tradeIdeas.noIdeas')}</p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-50 transform hover:scale-105 shadow-lg"
              >
                {t('tradeIdeas.title')}
              </button>
            </div>
          ) : (
            tradeIdeas.map((idea) => {
              const isLong = idea.direction === 'BUY'
              const riskPips = calculatePips(idea.entry, idea.stop_loss)
              const rewardPips = calculatePips(idea.entry, idea.take_profit)
              const isNew = newTradeIdeaIds.has(idea.id)
              
              return (
                <button
                  key={idea.id}
                  onClick={() => setSelectedIdea(idea)}
                  className={`w-full text-left relative bg-gradient-to-br from-slate-50 to-white border-l-4 ${
                    isLong ? 'border-green-500' : 'border-red-500'
                  } rounded-lg p-2 sm:p-4 hover:shadow-md transition-all duration-300 group overflow-hidden ${
                    isNew 
                      ? `shadow-lg ring-2 ring-opacity-50 animate-pulse ${isLong ? 'ring-green-400' : 'ring-red-400'}` 
                      : ''
                  }`}
                  style={{
                    animation: isNew ? 'shimmer 2s ease-in-out' : undefined
                  }}
                >
                  {isNew && (
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-transparent animate-shimmer-slide pointer-events-none ${
                      isLong ? 'via-green-300/20' : 'via-red-300/20'
                    }`} />
                  )}
                  {isNew && (
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r animate-shimmer-slide ${
                      isLong ? 'from-green-500 via-green-400 to-green-500' : 'from-red-500 via-red-400 to-red-500'
                    }`} />
                  )}
                  <div className="flex items-start justify-between mb-2 relative z-10">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      {isLong ? (
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                      )}
                      <div>
                        <span className={`font-bold text-xs sm:text-sm ${isLong ? 'text-green-600' : 'text-red-600'}`}>
                          {idea.direction}
                        </span>
                        <span className="text-slate-600 text-xs sm:text-sm ml-1">{idea.currency_pair || 'N/A'}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  </div>

                  {/* Trade Setup Information */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isLong ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="text-xs text-slate-500">{t('tradeIdeas.entry')}</p>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800">{idea.entry.toFixed(5)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500"></div>
                      <div>
                        <p className="text-xs text-slate-500">{t('tradeIdeas.stopLoss')}</p>
                        <p className="text-xs sm:text-sm font-semibold text-red-600">{idea.stop_loss.toFixed(5)}</p>
                        <p className="text-xs text-slate-400">-{riskPips} pips</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
                      <div>
                        <p className="text-xs text-slate-500">{t('tradeIdeas.takeProfit')}</p>
                        <p className="text-xs sm:text-sm font-semibold text-green-600">{idea.take_profit.toFixed(5)}</p>
                        <p className="text-xs text-slate-400">+{rewardPips} pips</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500"></div>
                      <div>
                        <p className="text-xs text-slate-500">Risk:Reward</p>
                        <p className="text-xs sm:text-sm font-semibold text-purple-600">
                          1:{(parseFloat(rewardPips) / parseFloat(riskPips) || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Level */}
                  {idea.confidence !== null && (
                    <ConfidenceIndicator 
                      confidence={idea.confidence} 
                      translations={{
                        confidence: t('tradeIdeas.confidence'),
                        title: t('tradeIdeas.confidenceTooltip.title'),
                        description: t('tradeIdeas.confidenceTooltip.description'),
                        high: t('tradeIdeas.confidenceTooltip.high'),
                        medium: t('tradeIdeas.confidenceTooltip.medium'),
                        low: t('tradeIdeas.confidenceTooltip.low')
                      }}
                    />
                  )}

                  {/* Rationale Preview */}
                  {(idea.rationale || idea.rationale_fr) && (
                    <div className="mb-2">
                      <p className="text-xs text-slate-500 mb-1">{t('tradeIdeas.reason')}</p>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {(locale === 'fr' ? idea.rationale_fr : idea.rationale)?.split('.')[0]}...
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {new Date(idea.created_at || '').toLocaleDateString()}
                    </span>
                  </div>

                  {/* Confidence and scores not available in current database schema */}
                </button>
              )
            })
          )}
        </div>

        {tradeIdeas.length > 0 && (
          <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-white/20 text-center flex-shrink-0">
            <button
              onClick={() => setShowAllIdeas(true)}
              className="text-xs sm:text-sm text-white hover:text-blue-200 font-medium transition-colors duration-200 px-2 py-1"
            >
              {t('tradeIdeas.viewAll')} →
            </button>
          </div>
        )}
      </div>

      {/* Trade Idea Detail Modal */}
      {selectedIdea && (
        <TradeIdeaDetail
          idea={selectedIdea}
          userId={userId}
          onClose={() => setSelectedIdea(null)}
          onUpdate={loadTradeIdeas}
        />
      )}

      {/* All Trade Ideas Modal */}
      {showAllIdeas && (
        <AllTradeIdeasModal
          userId={userId}
          onClose={() => setShowAllIdeas(false)}
        />
      )}

      {/* Auto-Generation Settings Modal */}
      {showAutoGenSettings && autoGenSettings && (
        <AutoGenerationSettings
          userId={userId}
          initialSettings={autoGenSettings}
          onClose={() => setShowAutoGenSettings(false)}
          onSettingsUpdate={handleSettingsUpdate}
        />
      )}
    </>
  )
}

