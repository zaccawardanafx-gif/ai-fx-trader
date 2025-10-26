'use client'

import { useEffect, useState, useCallback } from 'react'
import { getUserTradeIdeas, generateTradeIdea, updateTradeIdeaStatus } from '@/app/actions/generateTradeIdeas'
import { TrendingUp, TrendingDown, RefreshCw, Clock, Target, Shield, Calendar } from 'lucide-react'
import { useI18n } from '@/lib/i18n-provider'

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

export default function TradeIdeasList({ userId }: { userId: string }) {
  const [tradeIdeas, setTradeIdeas] = useState<TradeIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useI18n()

  const loadTradeIdeas = useCallback(async () => {
    setLoading(true)
    const result = await getUserTradeIdeas(userId)
    if (result.success) {
      setTradeIdeas(result.data)
    } else {
      setError(result.error || 'Failed to load trade ideas')
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    loadTradeIdeas()
  }, [loadTradeIdeas])

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    
    const result = await generateTradeIdea(userId)
    
    if (result.success) {
      await loadTradeIdeas()
    } else {
      setError(result.error || 'Failed to generate trade idea')
    }
    
    setGenerating(false)
  }

  const handleStatusChange = async (ideaId: string, newStatus: string) => {
    const result = await updateTradeIdeaStatus(ideaId, newStatus)
    if (result.success) {
      await loadTradeIdeas()
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const calculatePips = (entry: number, target: number) => {
    return Math.abs((target - entry) * 10000).toFixed(1)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading trade ideas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Quicksand, sans-serif' }}>
          Trade Ideas
        </h2>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? t('common.loading') : 'Generate New'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {tradeIdeas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No trade ideas yet</h3>
          <p className="text-slate-600 mb-6">
            Click &quot;Generate New Idea&quot; to create your first AI-powered trade idea
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tradeIdeas.map((idea) => {
            const isActive = idea.status === 'active'
            const isLong = idea.direction === 'BUY'
            
            return (
              <div
                key={idea.id}
                className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
                  isLong ? 'border-green-500' : 'border-red-500'
                } ${!isActive ? 'opacity-60' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    {isLong ? (
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    )}
                    <span className={`text-xl font-bold ${
                      isLong ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {idea.direction} {idea.currency_pair || 'N/A'}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {idea.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-slate-500">Entry</p>
                      <p className="text-lg font-semibold text-slate-800">{idea.entry.toFixed(5)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-xs text-slate-500">Stop Loss</p>
                      <p className="text-lg font-semibold text-slate-800">
                        {idea.stop_loss.toFixed(5)}
                        <span className="text-xs text-red-600 ml-1">
                          (-{calculatePips(idea.entry, idea.stop_loss)} pips)
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-xs text-slate-500">Take Profit</p>
                      <p className="text-lg font-semibold text-slate-800">
                        {idea.take_profit.toFixed(5)}
                        <span className="text-xs text-green-600 ml-1">
                          (+{calculatePips(idea.entry, idea.take_profit)} pips)
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <div>
                      <p className="text-xs text-slate-500">Expiry</p>
                      <p className="text-sm font-medium text-slate-800">
                        {idea.expiry ? new Date(idea.expiry).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {idea.rationale && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-1">Rationale:</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded">
                      {idea.rationale}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-slate-500 border-t pt-3">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(idea.created_at)}</span>
                  </span>
                  <span>v{idea.prompt_version}</span>
                </div>

                {isActive && (
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleStatusChange(idea.id, 'closed')}
                      className="flex-1 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleStatusChange(idea.id, 'cancelled')}
                      className="flex-1 px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}





