'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { getUserTradeIdeas, generateTradeIdea } from '@/app/actions/generateTradeIdeas'
import { TrendingUp, TrendingDown, ChevronRight, Sparkles } from 'lucide-react'
import TradeIdeaDetail from './TradeIdeaDetail'
import AllTradeIdeasModal from './AllTradeIdeasModal'

interface TradeIdea {
  id: string
  currency_pair: string
  direction: string
  entry: number
  stop_loss: number
  take_profit: number
  pip_target: number | null
  expiry: string | null
  rationale: string | null
  rationale_fr: string | null
  status: string | null
  created_at: string | null
  confidence: number | null
  technical_score: number | null
  sentiment_score: number | null
  macro_score: number | null
}

export default function TradeIdeasWidget({ userId }: { userId: string }) {
  const [tradeIdeas, setTradeIdeas] = useState<TradeIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIdea, setSelectedIdea] = useState<TradeIdea | null>(null)
  const [showAllIdeas, setShowAllIdeas] = useState(false)
  const { t, locale } = useI18n()

  const loadTradeIdeas = async () => {
    setLoading(true)
    try {
      console.log('Loading trade ideas for user:', userId)
      const result = await getUserTradeIdeas(userId, 5, 'active') // Only show active ideas
      console.log('Trade ideas result:', result)
      if (result.success) {
        setTradeIdeas(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to load trade ideas')
      }
    } catch (error) {
      console.error('Error in loadTradeIdeas:', error)
      setError('Failed to load trade ideas')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTradeIdeas()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadTradeIdeas, 30000)
    return () => clearInterval(interval)
  }, [userId])

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
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-2 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
            title={t('tradeIdeas.title')}
          >
            <Sparkles className={`w-3 h-3 sm:w-4 sm:h-4 ${generating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{generating ? t('common.loading') : 'New'}</span>
          </button>
        </div>

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
              
              return (
                <button
                  key={idea.id}
                  onClick={() => setSelectedIdea(idea)}
                  className={`w-full text-left bg-gradient-to-br from-slate-50 to-white border-l-4 ${
                    isLong ? 'border-green-500' : 'border-red-500'
                  } rounded-lg p-2 sm:p-4 hover:shadow-md transition-shadow group`}
                >
                  <div className="flex items-start justify-between mb-2">
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
                        <span className="text-slate-600 text-xs sm:text-sm ml-1">{idea.currency_pair}</span>
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

                  {/* Rationale Preview */}
                  {(idea.rationale || idea.rationale_fr) && (
                    <div className="mb-2">
                      <p className="text-xs text-slate-500 mb-1">{t('tradeIdeas.reason')}</p>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {(locale === 'fr' && idea.rationale_fr ? idea.rationale_fr : idea.rationale)?.split('.')[0]}...
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      {idea.confidence !== null && (
                        <span className={`px-2 py-0.5 rounded ${
                          idea.confidence >= 70 
                            ? 'bg-green-100 text-green-700' 
                            : idea.confidence >= 50 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {idea.confidence}% {t('tradeIdeas.confidence')}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400">
                      {new Date(idea.created_at || '').toLocaleDateString()}
                    </span>
                  </div>

                  {/* Compact score indicators */}
                  {(idea.technical_score !== null || idea.sentiment_score !== null || idea.macro_score !== null) && (
                    <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-slate-100">
                      {idea.technical_score !== null && (
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-slate-500">Tech</span>
                            <span className="text-xs font-medium text-slate-700">{Math.round(idea.technical_score)}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1">
                            <div 
                              className="bg-blue-600 h-1 rounded-full transition-all"
                              style={{ width: `${idea.technical_score}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      {idea.sentiment_score !== null && (
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-slate-500">Sent</span>
                            <span className="text-xs font-medium text-slate-700">{Math.round(idea.sentiment_score)}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1">
                            <div 
                              className="bg-purple-600 h-1 rounded-full transition-all"
                              style={{ width: `${idea.sentiment_score}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      {idea.macro_score !== null && (
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-slate-500">Macro</span>
                            <span className="text-xs font-medium text-slate-700">{Math.round(idea.macro_score)}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1">
                            <div 
                              className="bg-amber-600 h-1 rounded-full transition-all"
                              style={{ width: `${idea.macro_score}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
    </>
  )
}

