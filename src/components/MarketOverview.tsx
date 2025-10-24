'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { getLatestMarketData } from '@/app/actions/fetchMarketData'
import { getLatestIndicators } from '@/app/actions/computeIndicators'
import { getAverageSentiment } from '@/app/actions/fetchSentimentMacro'
import { TrendingUp, Activity, BarChart3, Brain } from 'lucide-react'

export default function MarketOverview() {
  const [marketData, setMarketData] = useState<any>(null)
  const [indicators, setIndicators] = useState<any>(null)
  const [sentiment, setSentiment] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()

  useEffect(() => {
    const loadData = async () => {
      const [market, inds, sent] = await Promise.all([
        getLatestMarketData(1),
        getLatestIndicators(),
        getAverageSentiment(24)
      ])

      if (market.success && market.data.length > 0) {
        setMarketData(market.data[0])
      }
      
      if (inds.success) {
        setIndicators(inds.data)
      }
      
      if (sent.success) {
        setSentiment(sent.average)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-600'
    if (score < -0.3) return 'text-red-600'
    return 'text-slate-600'
  }

  const getSentimentLabel = (score: number) => {
    if (score > 0.3) return 'Bullish'
    if (score < -0.3) return 'Bearish'
    return 'Neutral'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4" style={{ fontFamily: 'Quicksand, sans-serif' }}>
        {t('dashboard.marketOverview')}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-slate-600">Current Price</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {marketData?.price?.toFixed(5) || 'N/A'}
          </p>
          {marketData && (
            <div className="mt-1 text-xs text-slate-500">
              H: {marketData.high?.toFixed(5)} L: {marketData.low?.toFixed(5)}
            </div>
          )}
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-slate-600">RSI (14)</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {indicators?.rsi?.toFixed(2) || 'N/A'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {indicators?.rsi > 70 ? 'Overbought' : indicators?.rsi < 30 ? 'Oversold' : 'Neutral'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-slate-600">MACD</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {indicators?.macd?.toFixed(5) || 'N/A'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Signal: {indicators?.macd_signal?.toFixed(5) || 'N/A'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-5 h-5 text-green-600" />
            <span className="text-sm text-slate-600">Sentiment (24h)</span>
          </div>
          <p className={`text-2xl font-bold ${getSentimentColor(sentiment)}`}>
            {getSentimentLabel(sentiment)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Score: {sentiment.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}





