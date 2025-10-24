'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { updateUserProfile } from '@/app/actions/profile'
import { Save, AlertCircle } from 'lucide-react'

interface Profile {
  username: string | null
  risk_per_trade: number | null
  pip_target_min: number | null
  pip_target_max: number | null
  breakeven_trigger: number | null
  weekly_pip_target_min: number | null
  weekly_pip_target_max: number | null
  max_risk_pips_per_trade: number | null
  weekly_trade_limit: number | null
  pip_target_per_rotation: number | null
  breakeven_trigger_pips: number | null
  trading_volume_chf: number | null
  leverage_enabled: boolean | null
  max_leverage: number | null
  selected_currency_pair: string | null
  technical_weight: number | null
  sentiment_weight: number | null
  macro_weight: number | null
  alert_frequency: string | null
  notify_email: boolean | null
  notify_whatsapp: boolean | null
}

const CURRENCY_PAIRS = [
  'USD/CHF', 'EUR/USD', 'GBP/USD', 'USD/JPY', 
  'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP', 
  'EUR/JPY', 'GBP/JPY'
]

export default function SettingsForm({ userId, profile }: { userId: string; profile: Profile | null }) {
  const { t } = useI18n()
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    // Weekly targets
    weekly_pip_target_min: profile?.weekly_pip_target_min || 80,
    weekly_pip_target_max: profile?.weekly_pip_target_max || 120,
    max_risk_pips_per_trade: profile?.max_risk_pips_per_trade || 15,
    weekly_trade_limit: profile?.weekly_trade_limit || 5,
    pip_target_per_rotation: profile?.pip_target_per_rotation || 40,
    breakeven_trigger_pips: profile?.breakeven_trigger_pips || 20,
    // Trading volume and leverage
    trading_volume_chf: profile?.trading_volume_chf || 1000000,
    leverage_enabled: profile?.leverage_enabled ?? false,
    max_leverage: profile?.max_leverage || 10,
    // Currency pair
    selected_currency_pair: profile?.selected_currency_pair || 'USD/CHF',
    // Analysis weights
    technical_weight: profile?.technical_weight || 0.4,
    sentiment_weight: profile?.sentiment_weight || 0.3,
    macro_weight: profile?.macro_weight || 0.3,
    // Notifications
    alert_frequency: profile?.alert_frequency || 'daily',
    notify_email: profile?.notify_email ?? true,
    notify_whatsapp: profile?.notify_whatsapp ?? false,
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await updateUserProfile(userId, formData)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const totalWeight = formData.technical_weight + formData.sentiment_weight + formData.macro_weight

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {success && (
        <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/50 text-green-200 px-6 py-4 rounded-xl flex items-center space-x-3">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{t('settings.saved')}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-200 px-6 py-4 rounded-xl flex items-center space-x-3">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Profile
        </h3>
        <div>
          <label className="block text-sm font-medium text-blue-200 mb-2">
            Username
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
            placeholder="Enter your username"
          />
        </div>
      </div>

      {/* Trading Strategy */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          {t('settings.tradingPreferences')}
        </h3>
        <p className="text-blue-200 mb-6">
          {t('settings.subtitle')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Currency Pair
            </label>
            <select
              value={formData.selected_currency_pair}
              onChange={(e) => handleChange('selected_currency_pair', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
            >
              {CURRENCY_PAIRS.map(pair => (
                <option key={pair} value={pair} className="bg-slate-800 text-white">{pair}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Trading Volume (CHF)
            </label>
            <input
              type="number"
              step="100000"
              min="100000"
              value={formData.trading_volume_chf}
              onChange={(e) => handleChange('trading_volume_chf', parseFloat(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
              placeholder="1000000"
            />
            <p className="text-xs text-blue-300/70 mt-2">
              {(formData.trading_volume_chf / 1000000).toFixed(1)}M CHF per position
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Weekly Pip Target (Min)
            </label>
            <input
              type="number"
              min="10"
              value={formData.weekly_pip_target_min}
              onChange={(e) => handleChange('weekly_pip_target_min', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
              placeholder="80"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Weekly Pip Target (Max)
            </label>
            <input
              type="number"
              min="10"
              value={formData.weekly_pip_target_max}
              onChange={(e) => handleChange('weekly_pip_target_max', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
              placeholder="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Max Risk per Trade (Pips)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={formData.max_risk_pips_per_trade}
              onChange={(e) => handleChange('max_risk_pips_per_trade', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
              placeholder="15"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Weekly Trade Limit
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.weekly_trade_limit}
              onChange={(e) => handleChange('weekly_trade_limit', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
              placeholder="5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Pip Target per Rotation
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={formData.pip_target_per_rotation}
              onChange={(e) => handleChange('pip_target_per_rotation', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
              placeholder="40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Breakeven Trigger (Pips)
            </label>
            <input
              type="number"
              min="5"
              max="50"
              value={formData.breakeven_trigger_pips}
              onChange={(e) => handleChange('breakeven_trigger_pips', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
              placeholder="20"
            />
          </div>
        </div>
      </div>

      {/* Leverage Settings */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Leverage Settings
        </h3>
        <p className="text-blue-200 mb-6">
          Configure leverage and risk management
        </p>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="leverage_enabled"
              checked={formData.leverage_enabled}
              onChange={(e) => handleChange('leverage_enabled', e.target.checked)}
              className="w-5 h-5 text-blue-600 bg-white/10 border-white/30 rounded focus:ring-blue-400 focus:ring-2"
            />
            <label htmlFor="leverage_enabled" className="text-blue-200 font-medium">
              Enable Leverage Trading
            </label>
          </div>

          {formData.leverage_enabled && (
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Maximum Leverage
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.max_leverage}
                onChange={(e) => handleChange('max_leverage', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
                placeholder="10"
              />
              <p className="text-xs text-blue-300/70 mt-2">
                Higher leverage increases both potential profits and risks
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Weights */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Analysis Weights
        </h3>
        <p className="text-blue-200 mb-6">
          Configure how much weight each analysis type has in trade decisions
        </p>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Technical Analysis Weight
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.technical_weight}
                onChange={(e) => handleChange('technical_weight', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-blue-300/70 mt-1">
                <span>0%</span>
                <span className="font-medium">{(formData.technical_weight * 100).toFixed(0)}%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Sentiment Analysis Weight
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.sentiment_weight}
                onChange={(e) => handleChange('sentiment_weight', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-blue-300/70 mt-1">
                <span>0%</span>
                <span className="font-medium">{(formData.sentiment_weight * 100).toFixed(0)}%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Macro Analysis Weight
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.macro_weight}
                onChange={(e) => handleChange('macro_weight', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-blue-300/70 mt-1">
                <span>0%</span>
                <span className="font-medium">{(formData.macro_weight * 100).toFixed(0)}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-200 font-medium">Total Weight:</span>
              <span className={`font-bold ${totalWeight === 1 ? 'text-green-300' : 'text-yellow-300'}`}>
                {(totalWeight * 100).toFixed(0)}%
              </span>
            </div>
            {totalWeight !== 1 && (
              <p className="text-xs text-yellow-300/70 mt-1">
                Weights should total 100% for optimal performance
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Notifications
        </h3>
        <p className="text-blue-200 mb-6">
          Configure how you want to receive trading alerts
        </p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">
              Alert Frequency
            </label>
            <select
              value={formData.alert_frequency}
              onChange={(e) => handleChange('alert_frequency', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
            >
              <option value="realtime" className="bg-slate-800 text-white">Real-time</option>
              <option value="hourly" className="bg-slate-800 text-white">Hourly</option>
              <option value="daily" className="bg-slate-800 text-white">Daily</option>
              <option value="weekly" className="bg-slate-800 text-white">Weekly</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="notify_email"
                checked={formData.notify_email}
                onChange={(e) => handleChange('notify_email', e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-white/10 border-white/30 rounded focus:ring-blue-400 focus:ring-2"
              />
              <label htmlFor="notify_email" className="text-blue-200 font-medium">
                Email Notifications
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="notify_whatsapp"
                checked={formData.notify_whatsapp}
                onChange={(e) => handleChange('notify_whatsapp', e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-white/10 border-white/30 rounded focus:ring-blue-400 focus:ring-2"
              />
              <label htmlFor="notify_whatsapp" className="text-blue-200 font-medium">
                WhatsApp Notifications
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg flex items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>{loading ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Custom CSS for slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </form>
  )
}