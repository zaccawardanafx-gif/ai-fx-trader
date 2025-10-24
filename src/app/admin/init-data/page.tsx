'use client'

import { useState } from 'react'
import { fetchMarketData } from '@/app/actions/fetchMarketData'
import { computeIndicators } from '@/app/actions/computeIndicators'
import { fetchSentimentMacro } from '@/app/actions/fetchSentimentMacro'
import { CheckCircle, XCircle, Loader2, Play } from 'lucide-react'

export default function InitDataPage() {
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<{
    market?: { success: boolean; error?: string }
    indicators?: { success: boolean; error?: string }
    sentiment?: { success: boolean; error?: string }
  }>({})

  const handleInitialize = async () => {
    setRunning(true)
    setResults({})

    // Fetch market data
    const marketResult = await fetchMarketData()
    setResults(prev => ({ ...prev, market: marketResult }))

    if (!marketResult.success) {
      setRunning(false)
      return
    }

    // Small delay to ensure data is written
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Compute indicators
    const indicatorsResult = await computeIndicators()
    setResults(prev => ({ ...prev, indicators: indicatorsResult }))

    // Fetch sentiment
    const sentimentResult = await fetchSentimentMacro()
    setResults(prev => ({ ...prev, sentiment: sentimentResult }))

    setRunning(false)
  }

  const ResultItem = ({ 
    label, 
    result 
  }: { 
    label: string
    result?: { success: boolean; error?: string } 
  }) => {
    if (!result) {
      return (
        <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
          <div className="w-6 h-6 rounded-full bg-slate-200" />
          <span className="text-slate-600">{label}</span>
          <span className="ml-auto text-slate-400">Waiting...</span>
        </div>
      )
    }

    return (
      <div className={`flex items-center space-x-3 p-4 rounded-lg ${
        result.success ? 'bg-green-50' : 'bg-red-50'
      }`}>
        {result.success ? (
          <CheckCircle className="w-6 h-6 text-green-600" />
        ) : (
          <XCircle className="w-6 h-6 text-red-600" />
        )}
        <span className={result.success ? 'text-green-900' : 'text-red-900'}>
          {label}
        </span>
        <span className={`ml-auto text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
          {result.success ? 'Success' : result.error || 'Failed'}
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5E7E8] via-[#f5f6f7] to-[#E5E7E8] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            Initialize Data
          </h1>
          <p className="text-slate-600 mb-8">
            Run this once to populate the database with initial market data, indicators, and sentiment.
          </p>

          <div className="space-y-3 mb-8">
            <ResultItem label="Fetch Market Data" result={results.market} />
            <ResultItem label="Compute Technical Indicators" result={results.indicators} />
            <ResultItem label="Fetch Sentiment & Macro" result={results.sentiment} />
          </div>

          <button
            onClick={handleInitialize}
            disabled={running}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Start Initialization</span>
              </>
            )}
          </button>

          {Object.keys(results).length > 0 && !running && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                {results.market?.success && results.indicators?.success && results.sentiment?.success ? (
                  <>
                    ✅ All data initialized successfully! You can now go to the dashboard and generate trade ideas.
                  </>
                ) : (
                  <>
                    ⚠️ Some steps failed. Check the errors above and try again.
                  </>
                )}
              </p>
            </div>
          )}

          <div className="mt-8 p-4 border border-slate-200 rounded-lg">
            <h3 className="font-semibold text-slate-800 mb-2 text-sm">📝 Note</h3>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• This page is for initial setup only</li>
              <li>• After initialization, the cron job will handle automatic updates</li>
              <li>• You can visit this page anytime to manually refresh data</li>
              <li>• For production, use the /api/cron endpoint with proper authentication</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}






