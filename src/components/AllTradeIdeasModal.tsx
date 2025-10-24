'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { X, TrendingUp, TrendingDown, Activity, Brain, Newspaper, Globe, ChevronDown, ChevronUp } from 'lucide-react'
import { getUserTradeIdeas } from '@/app/actions/generateTradeIdeas'

interface TradeIdea {
  id: string
  user_id: string | null
  prompt_version: number | null
  entry: number
  stop_loss: number
  take_profit: number
  expiry: string | null
  rationale: string | null
  technical_weight: number | null
  sentiment_weight: number | null
  macro_weight: number | null
  status: string | null
  created_at: string | null
  updated_at: string | null
}

interface AllTradeIdeasModalProps {
  userId: string
  onClose: () => void
}

export default function AllTradeIdeasModal({ userId, onClose }: AllTradeIdeasModalProps) {
  const { t, locale } = useI18n()
  const [tradeIdeas, setTradeIdeas] = useState<TradeIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRationales, setExpandedRationales] = useState<Set<string>>(new Set())

  const loadAllTradeIdeas = async () => {
    setLoading(true)
    try {
      // Load all trade ideas (not just active ones)
      const result = await getUserTradeIdeas(userId, 50, undefined) // Get more ideas, all statuses
      if (result.success) {
        setTradeIdeas(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to load trade ideas')
      }
    } catch (error) {
      console.error('Error loading trade ideas:', error)
      setError('Failed to load trade ideas')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAllTradeIdeas()
  }, [userId])

  const calculatePips = (entry: number, target: number) => {
    return Math.abs((target - entry) * 10000).toFixed(1)
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'executed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const toggleRationale = (ideaId: string) => {
    setExpandedRationales(prev => {
      const newSet = new Set(prev)
      if (newSet.has(ideaId)) {
        newSet.delete(ideaId)
      } else {
        newSet.add(ideaId)
      }
      return newSet
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-start z-50 p-0">
      <div className="bg-gradient-to-br from-[#E5E7E8] via-[#f5f6f7] to-[#E5E7E8] shadow-2xl w-full h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b-4 border-indigo-500 bg-indigo-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-indigo-600" />
              <div>
                <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                  All Trade Ideas
                </h2>
                <p className="text-sm text-slate-600">
                  Complete overview of all your AI-generated trading opportunities
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-slate-600">Loading trade ideas...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-800 border border-red-200 rounded-lg p-4 text-center">
              {error}
            </div>
          ) : tradeIdeas.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No trade ideas found</p>
              <p className="text-slate-500 text-sm">Generate your first trade idea to get started!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {tradeIdeas.map((idea) => {
                const isLong = true // Default to BUY since direction is not in database
                const riskPips = calculatePips(idea.entry, idea.stop_loss)
                const rewardPips = calculatePips(idea.entry, idea.take_profit)
                const riskRewardRatio = parseFloat(rewardPips) / parseFloat(riskPips) || 0

                return (
                  <div
                    key={idea.id}
                    className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden"
                  >
                    {/* Trade Idea Header */}
                    <div className={`p-4 border-l-4 ${isLong ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {isLong ? (
                            <TrendingUp className="w-6 h-6 text-green-600" />
                          ) : (
                            <TrendingDown className="w-6 h-6 text-red-600" />
                          )}
                          <div>
                            <h3 className={`text-lg font-bold ${isLong ? 'text-green-700' : 'text-red-700'}`}>
                              BUY USD/CHF
                            </h3>
                            <p className="text-sm text-slate-600">
                              {new Date(idea.created_at || '').toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(idea.status)}`}>
                            {idea.status?.toUpperCase() || 'UNKNOWN'}
                          </span>
                          {/* Confidence not available in current database schema */}
                        </div>
                      </div>
                    </div>

                    {/* Trade Setup */}
                    <div className="p-4 bg-slate-50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${isLong ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                          <div>
                            <p className="text-xs text-slate-500">Entry</p>
                            <p className="text-sm font-semibold text-slate-800">{idea.entry.toFixed(5)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div>
                            <p className="text-xs text-slate-500">Stop Loss</p>
                            <p className="text-sm font-semibold text-red-600">{idea.stop_loss.toFixed(5)}</p>
                            <p className="text-xs text-slate-400">-{riskPips} pips</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <div>
                            <p className="text-xs text-slate-500">Take Profit</p>
                            <p className="text-sm font-semibold text-green-600">{idea.take_profit.toFixed(5)}</p>
                            <p className="text-xs text-slate-400">+{rewardPips} pips</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          <div>
                            <p className="text-xs text-slate-500">Risk:Reward</p>
                            <p className="text-sm font-semibold text-purple-600">
                              1:{riskRewardRatio.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* AI Rationale */}
                      {idea.rationale && (
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                          <button
                            onClick={() => toggleRationale(idea.id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <Brain className="w-4 h-4 text-indigo-600" />
                              <h4 className="text-sm font-bold text-slate-800">{t('tradeIdeas.reason')}</h4>
                            </div>
                            {expandedRationales.has(idea.id) ? (
                              <ChevronUp className="w-4 h-4 text-slate-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-600" />
                            )}
                          </button>
                          {expandedRationales.has(idea.id) && (
                            <div className="px-4 pb-4 space-y-2 border-t border-slate-100">
                              {idea.rationale!
                                .split(/\.(?=\s+[A-Z])|\.(?=\s*$)/)
                                .filter(sentence => sentence.trim().length > 0)
                                .map((sentence, index) => (
                                  <div key={index} className="flex items-start space-x-3 pt-2">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                      {sentence.trim()}.
                                    </p>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Technical Analysis Scores - not available in current database schema */}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
