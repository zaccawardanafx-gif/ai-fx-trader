'use client'

import { useEffect, useState, useCallback } from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { getUserPrompts, getActivePrompt, createPrompt, updatePrompt, setActivePrompt } from '@/app/actions/userPrompts'
import { FileText, Save, Plus, Check } from 'lucide-react'

interface UserPrompt {
  id: string
  version: number | null
  title: string | null
  prompt_text: string
  is_active: boolean | null
  created_at: string | null
}

export default function PromptEditor({ userId }: { userId: string }) {
  const { t } = useI18n()
  const [prompts, setPrompts] = useState<UserPrompt[]>([])
  const [activePrompt, setActivePromptState] = useState<UserPrompt | null>(null)
  const [editingPrompt, setEditingPrompt] = useState<UserPrompt | null>(null)
  const [title, setTitle] = useState('')
  const [promptText, setPromptText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  const loadPrompts = useCallback(async () => {
    setLoading(true)
    const [promptsResult, activeResult] = await Promise.all([
      getUserPrompts(userId),
      getActivePrompt(userId)
    ])

    if (promptsResult.success) {
      setPrompts(promptsResult.data)
    }

    if (activeResult.success && activeResult.data) {
      setActivePromptState(activeResult.data)
      setTitle(activeResult.data.title || '')
      setPromptText(activeResult.data.prompt_text)
      setEditingPrompt(activeResult.data)
    } else if (promptsResult.data.length > 0) {
      // If no active prompt, use the latest one
      const latest = promptsResult.data[0]
      setActivePromptState(latest)
      setTitle(latest.title || '')
      setPromptText(latest.prompt_text)
      setEditingPrompt(latest)
    }

    setLoading(false)
  }, [userId])

  useEffect(() => {
    loadPrompts()
  }, [loadPrompts])

  const getDefaultPrompt = () => {
    return `# Context
You are an expert FX trader analyzing ${activePrompt?.title || 'USD/CHF'} with access to:
- Real-time price data
- Technical indicators (RSI, MACD, Moving Averages, Support/Resistance)
- Market sentiment data
- Macroeconomic factors

# Risk Management Rules
- Maximum risk: 15 pips per trade
- Target: 40 pips per rotation
- Stop loss: Based on technical structure, max 15 pips
- Position sizing: 1M CHF per position
- Weekly target: 80-120 pips
- Maximum 5 trades per week

# Analysis Framework
1. Technical Analysis (40% weight)
   - Chart patterns and key levels
   - Indicator confluence
   - Price action signals
   - Support/resistance levels

2. Sentiment Analysis (30% weight)
   - Market mood and positioning
   - News sentiment impact
   - Risk-on/risk-off flows
   - Trader sentiment indicators

3. Macro Analysis (30% weight)
   - Economic data releases
   - Central bank policy
   - Geopolitical factors
   - Interest rate differentials

# Ask
Generate ONE high-probability trade setup that:
1. Respects all risk management rules above
2. Weighs technical (40%), sentiment (30%), and macro (30%) factors
3. Provides clear entry, stop loss, and take profit levels
4. Includes a comprehensive rationale that MUST cover all three analysis types

# Format
- Direction: BUY or SELL
- Entry: Precise price level
- Stop Loss: Based on technical structure, max 15 pips
- Take Profit: Target 40 pips
- Confidence: 0-100 based on signal alignment
- Rationale: MUST include detailed analysis of:
  * TECHNICAL: Chart patterns, indicators, key levels
  * SENTIMENT: Market psychology, news sentiment, trader positioning
  * MACRO: Economic data, central bank policy, geopolitical factors

# Rationale Requirements
Your rationale must be a comprehensive analysis that:
1. Starts with technical setup (chart patterns, indicators, key levels)
2. Incorporates sentiment analysis (market mood, news impact, positioning)
3. Includes macro context (economic fundamentals, policy implications)
4. Concludes with risk assessment and trade conviction
5. Uses specific data points from the provided market context
6. Explains WHY this setup has edge and probability

# Tone
Professional, data-driven, and actionable. Focus on quality insights that justify the trade.

# Important
- Only suggest trades when you have HIGH conviction (60%+ confidence)
- If conditions are unclear or choppy, it's okay to wait for better setups
- Always explain your reasoning clearly for educational value`
  }

  const handleSave = async () => {
    if (!title.trim() || !promptText.trim()) {
      setError('Title and prompt text are required')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    let result
    if (isCreatingNew || !editingPrompt) {
      result = await createPrompt(userId, title, promptText)
    } else {
      result = await updatePrompt(editingPrompt.id, title, promptText)
    }

    if (result.success) {
      setSuccess(true)
      setIsCreatingNew(false)
      await loadPrompts()
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || 'Failed to save prompt')
    }

    setSaving(false)
  }

  const handleNewPrompt = () => {
    setIsCreatingNew(true)
    setEditingPrompt(null)
    setTitle('New Prompt')
    setPromptText(getDefaultPrompt())
  }

  const handleSelectPrompt = async (prompt: UserPrompt) => {
    setEditingPrompt(prompt)
    setTitle(prompt.title || '')
    setPromptText(prompt.prompt_text)
    setIsCreatingNew(false)
  }

  const handleSetActive = async (prompt: UserPrompt) => {
    const result = await setActivePrompt(userId, prompt.id)
    if (result.success) {
      await loadPrompts()
    } else {
      setError(result.error || 'Failed to set active prompt')
    }
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center border border-white/20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
        <p className="mt-4 text-blue-200">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Prompt History Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              Prompt Versions
            </h3>
            <button
              onClick={handleNewPrompt}
              className="p-3 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all duration-200 hover:scale-105"
              title="Create new prompt"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {prompts.length === 0 ? (
              <p className="text-sm text-blue-200/70 text-center py-4">No prompts yet</p>
            ) : (
              prompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleSelectPrompt(prompt)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                    editingPrompt?.id === prompt.id
                      ? 'bg-blue-500/20 border-2 border-blue-400 shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 border-2 border-transparent hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-white text-sm">
                      {prompt.title}
                    </span>
                    {prompt.is_active && (
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-lg border border-green-500/30">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-blue-200/70">
                    <span>v{prompt.version}</span>
                    <span>•</span>
                    <span>{prompt.created_at ? new Date(prompt.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Prompt Editor */}
      <div className="lg:col-span-2">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              {isCreatingNew ? 'Create New Prompt' : 'Edit Prompt'}
            </h3>
          </div>

          {success && (
            <div className="mb-6 bg-green-500/20 backdrop-blur-sm border border-green-500/50 text-green-200 px-6 py-4 rounded-xl flex items-center space-x-3">
              <Check className="w-5 h-5" />
              <span className="font-medium">Prompt saved successfully!</span>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-200 px-6 py-4 rounded-xl">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Prompt Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
                placeholder="e.g., Conservative Day Trading Prompt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Prompt Content
              </label>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={16}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none font-mono text-sm transition-all duration-200"
                placeholder="Enter your custom AI prompt here..."
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !title.trim() || !promptText.trim()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? 'Saving...' : 'Save Prompt'}</span>
                </button>

                {editingPrompt && !editingPrompt.is_active && (
                  <button
                    onClick={() => handleSetActive(editingPrompt)}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>Set Active</span>
                  </button>
                )}
              </div>

              <div className="text-sm text-blue-200/70">
                {promptText.length} characters
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}