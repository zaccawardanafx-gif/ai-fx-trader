'use client'

import { useState } from 'react'
import { X, TrendingUp, TrendingDown, Target, Shield, Activity, Brain, Newspaper, Globe, Play, Ban, Settings, BarChart3 } from 'lucide-react'
import { updateTradeIdeaStatus } from '@/app/actions/generateTradeIdeas'
import { useI18n } from '@/lib/i18n-provider'

interface TradeIdea {
  id: string
  currency_pair: string | null
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
  technical_weight: number | null
  sentiment_weight: number | null
  macro_weight: number | null
}

interface TradeIdeaDetailProps {
  idea: TradeIdea
  userId: string
  onClose: () => void
  onUpdate: () => void
}

export default function TradeIdeaDetail({ idea, onClose, onUpdate }: TradeIdeaDetailProps) {
  const [executing, setExecuting] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const { t, locale } = useI18n()

  const isLong = idea.direction === 'BUY'
  const riskPips = Math.abs((idea.entry - idea.stop_loss) * 10000)
  const rewardPips = Math.abs((idea.take_profit - idea.entry) * 10000)
  const riskRewardRatio = rewardPips / riskPips

  const handleExecute = async () => {
    setExecuting(true)
    setMessage(null)
    
    // Show "Coming Soon" message instead of executing
    setMessage({ type: 'success', text: t('tradeIdeas.detail.comingSoon') })
    
    setExecuting(false)
    
    // Uncomment below to enable actual trade execution
    // const result = await executeTrade(idea.id, userId)
    // 
    // if (result.success) {
    //   setMessage({ type: 'success', text: result.message || t('tradeIdeas.detail.executeSuccess') })
    //   setTimeout(() => {
    //     onUpdate()
    //     onClose()
    //   }, 2000)
    // } else {
    //   setMessage({ type: 'error', text: result.error || t('tradeIdeas.detail.executeFailed') })
    // }
    // 
    // setExecuting(false)
  }

  const handleCancel = async () => {
    setCancelling(true)
    setMessage(null)
    
    const result = await updateTradeIdeaStatus(idea.id, 'cancelled')
    
    if (result.success) {
      setMessage({ type: 'success', text: t('tradeIdeas.detail.cancelSuccess') })
      setTimeout(() => {
        onUpdate()
        onClose()
      }, 1500)
    } else {
      setMessage({ type: 'error', text: t('tradeIdeas.detail.cancelFailed') })
    }
    
    setCancelling(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-start z-50 p-0">
      <div className="bg-gradient-to-br from-[#E5E7E8] via-[#f5f6f7] to-[#E5E7E8] shadow-2xl w-full h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`p-4 sm:p-6 border-b-4 ${isLong ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {isLong ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
              <div>
                <h2 className={`text-2xl font-bold ${isLong ? 'text-green-700' : 'text-red-700'}`} style={{ fontFamily: 'Quicksand, sans-serif' }}>
                  {idea.direction} {idea.currency_pair || 'N/A'}
                </h2>
                <p className="text-sm text-slate-600">
                  {t('tradeIdeas.detail.generated')} {new Date(idea.created_at || '').toLocaleString()}
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Message */}
          {message && (
            <div className={`px-4 py-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* AI Rationale */}
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {t('tradeIdeas.detail.aiRationale')}
              </h3>
            </div>
            {(idea.rationale || idea.rationale_fr) ? (
              <div className="space-y-4">
                {(locale === 'fr' && idea.rationale_fr ? idea.rationale_fr : idea.rationale)!
                  .split(/\.(?=\s+[A-Z])|\.(?=\s*$)/)
                  .filter(sentence => sentence.trim().length > 0)
                  .map((sentence, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                      <p className="text-slate-700 leading-relaxed text-sm">
                        {sentence.trim()}.
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-slate-500 italic text-center py-8">
                {t('tradeIdeas.detail.noRationale')}
              </div>
            )}
          </div>

          {/* Risk Parameters Section */}
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-800" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {t('tradeIdeas.detail.riskParameters')}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Analysis Weights */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {t('tradeIdeas.detail.analysisWeights')}
                </h4>
                <div className="space-y-3">
                  {/* Technical Analysis Weight */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-slate-600">{t('tradeIdeas.detail.technicalAnalysis')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${((idea.technical_weight || 0.4) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-800 w-8">
                        {Math.round((idea.technical_weight || 0.4) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Sentiment Analysis Weight */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Newspaper className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-slate-600">{t('tradeIdeas.detail.sentimentAnalysis')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${((idea.sentiment_weight || 0.3) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-800 w-8">
                        {Math.round((idea.sentiment_weight || 0.3) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Macro Analysis Weight */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-slate-600">{t('tradeIdeas.detail.macroAnalysis')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-amber-600 h-2 rounded-full transition-all"
                          style={{ width: `${((idea.macro_weight || 0.3) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-800 w-8">
                        {Math.round((idea.macro_weight || 0.3) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trade Parameters */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  {t('tradeIdeas.detail.tradeMetrics')}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-slate-600">{t('tradeIdeas.detail.risk')}</span>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      {riskPips.toFixed(1)} {t('tradeIdeas.detail.pips')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-slate-600">{t('tradeIdeas.detail.reward')}</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {rewardPips.toFixed(1)} {t('tradeIdeas.detail.pips')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-slate-600">{t('tradeIdeas.detail.riskReward')}</span>
                    </div>
                    <span className="text-sm font-medium text-purple-600">
                      1:{riskRewardRatio.toFixed(2)}
                    </span>
                  </div>
                  
                  {idea.confidence !== null && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm text-slate-600">{t('tradeIdeas.detail.aiConfidence')}</span>
                      </div>
                      <span className={`text-sm font-medium ${
                        idea.confidence >= 70 ? 'text-green-600' : 
                        idea.confidence >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Math.round(idea.confidence)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>{t('tradeIdeas.detail.noteTitle')}</strong> {t('tradeIdeas.detail.noteText')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {idea.status === 'active' && (
          <div className="p-4 sm:p-6 border-t border-slate-200 bg-white flex items-center justify-between space-x-4">
            <button
              onClick={handleCancel}
              disabled={cancelling || executing}
              className="flex items-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Ban className="w-4 h-4" />
              <span>{cancelling ? t('tradeIdeas.detail.cancelling') : t('tradeIdeas.detail.cancelIdea')}</span>
            </button>
            
            <button
              onClick={handleExecute}
              disabled={executing || cancelling}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              <span>{executing ? t('tradeIdeas.detail.executing') : t('tradeIdeas.detail.executeTrade')}</span>
            </button>
          </div>
        )}

        {idea.status === 'executed' && (
          <div className="p-4 sm:p-6 border-t border-slate-200 bg-green-50">
            <p className="text-center text-green-700 font-medium">
              ✓ {t('tradeIdeas.detail.tradeExecuted')}
            </p>
          </div>
        )}

        {idea.status === 'cancelled' && (
          <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50">
            <p className="text-center text-slate-600 font-medium">
              {t('tradeIdeas.detail.tradeCancelled')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

