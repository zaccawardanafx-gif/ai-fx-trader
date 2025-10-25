'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n-provider'
import { X, Clock, Globe, Settings as SettingsIcon } from 'lucide-react'
import { 
  updateAutoGenerationSettings, 
  toggleAutoGenerationPause,
  type AutoGenerationSettings as AutoGenSettings
} from '@/app/actions/autoGeneration'

interface AutoGenerationSettingsProps {
  userId: string
  initialSettings?: {
    enabled: boolean
    interval: string
    time?: string
    timezone: string
    paused: boolean
  }
  onClose: () => void
  onSettingsUpdate: () => void
}

export default function AutoGenerationSettings({
  userId,
  initialSettings,
  onClose,
  onSettingsUpdate
}: AutoGenerationSettingsProps) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [settings, setSettings] = useState<AutoGenSettings>({
    enabled: initialSettings?.enabled || false,
    interval: initialSettings?.interval || 'weekly',
    time: initialSettings?.time || '09:00',
    timezone: initialSettings?.timezone || 'UTC',
    paused: initialSettings?.paused || false
  })

  const intervalOptions = [
    { value: 'hourly', label: t('autoGeneration.hourly') },
    { value: '4hours', label: t('autoGeneration.4hours') },
    { value: '6hours', label: t('autoGeneration.6hours') },
    { value: '8hours', label: t('autoGeneration.8hours') },
    { value: '12hours', label: t('autoGeneration.12hours') },
    { value: 'daily', label: t('autoGeneration.daily') },
    { value: 'weekly', label: t('autoGeneration.weekly') }
  ]

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'EST/EDT (New York)' },
    { value: 'America/Chicago', label: 'CST/CDT (Chicago)' },
    { value: 'America/Denver', label: 'MST/MDT (Denver)' },
    { value: 'America/Los_Angeles', label: 'PST/PDT (Los Angeles)' },
    { value: 'Europe/London', label: 'GMT/BST (London)' },
    { value: 'Europe/Paris', label: 'CET/CEST (Paris)' },
    { value: 'Europe/Zurich', label: 'CET/CEST (Zurich)' },
    { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
    { value: 'Asia/Shanghai', label: 'CST (Shanghai)' },
    { value: 'Australia/Sydney', label: 'AEST/AEDT (Sydney)' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const result = await updateAutoGenerationSettings(userId, settings)
      
      if (result.success) {
        setSuccess(true)
        onSettingsUpdate()
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setError(result.error || 'Failed to update settings')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePause = async () => {
    setLoading(true)
    setError('')

    try {
      const newPausedState = !settings.paused
      const result = await toggleAutoGenerationPause(userId, newPausedState)
      
      if (result.success) {
        setSettings(prev => ({ ...prev, paused: newPausedState }))
        onSettingsUpdate()
      } else {
        setError(result.error || 'Failed to toggle pause')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle pause')
    } finally {
      setLoading(false)
    }
  }

  const showTimeField = settings.interval === 'daily' || settings.interval === 'weekly'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">
                {t('autoGeneration.settings')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <SettingsIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {t('autoGeneration.enabled')}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Automatically generate trade ideas
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.enabled && (
              <>
                {/* Interval */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    {t('autoGeneration.interval')}
                  </label>
                  <select
                    value={settings.interval}
                    onChange={(e) => setSettings(prev => ({ ...prev, interval: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {intervalOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time (for daily/weekly) */}
                {showTimeField && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      {t('autoGeneration.time')}
                    </label>
                    <input
                      type="time"
                      value={settings.time}
                      onChange={(e) => setSettings(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('autoGeneration.timePlaceholder')}
                    />
                  </div>
                )}

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    {t('autoGeneration.timezone')}
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {timezoneOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pause/Resume */}
                {settings.enabled && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {settings.paused ? t('autoGeneration.paused') : 'Active'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {settings.paused ? 'Auto-generation is currently paused' : 'Auto-generation is running'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTogglePause}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        settings.paused
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      } disabled:opacity-50`}
                    >
                      {loading ? '...' : settings.paused ? t('autoGeneration.resume') : t('autoGeneration.pause')}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                Settings updated successfully!
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
