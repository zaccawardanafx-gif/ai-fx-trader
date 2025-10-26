'use client'

import { useEffect, useState, useRef } from 'react'
import { Bell, Check, X, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { getUserNotifications, markNotificationAsRead, deleteNotification, clearAllNotifications } from '@/app/actions/autoGeneration'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  metadata?: {
    direction?: string
    confidence?: number
    currencyPair?: string
    tradeIdeaId?: string
  }
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearingAll, setClearingAll] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const result = await getUserNotifications(userId)
      if (result.success && result.data) {
        setNotifications(result.data)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [userId])

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current && 
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const result = await markNotificationAsRead(notificationId, userId)
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead)
    await Promise.all(
      unreadNotifications.map(n => markNotificationAsRead(n.id, userId))
    )
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const result = await deleteNotification(notificationId, userId)
      if (result.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const handleClearAll = async () => {
    setClearingAll(true)
    try {
      const result = await clearAllNotifications(userId)
      if (result.success) {
        setNotifications([])
        setShowClearConfirm(false)
        setIsOpen(false)
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error)
    } finally {
      setClearingAll(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'auto_generation_success':
        return '✅'
      case 'auto_generation_error':
        return '⚠️'
      case 'auto_generation_retry':
        return '🔄'
      default:
        return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'auto_generation_success':
        return 'border-green-500/50 bg-green-50/50'
      case 'auto_generation_error':
        return 'border-red-500/50 bg-red-50/50'
      case 'auto_generation_retry':
        return 'border-yellow-500/50 bg-yellow-50/50'
      default:
        return 'border-blue-500/50 bg-blue-50/50'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-600 bg-green-100'
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getDirectionDisplay = (direction?: string) => {
    if (!direction) return null
    
    const isBuy = direction === 'BUY'
    return (
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-md font-semibold text-xs ${
        isBuy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {isBuy ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        <span>{direction}</span>
      </div>
    )
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full transform translate-x-1 -translate-y-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-[500px] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                  title="Clear all notifications"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-slate-500 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  You&apos;ll be notified when trade ideas are generated
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.isRead ? 'text-slate-900' : 'text-slate-700'
                          }`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-slate-400 hover:text-green-600 transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Trade Details - Direction and Confidence */}
                        {notification.metadata?.direction && notification.type === 'auto_generation_success' && (
                          <div className="flex items-center space-x-2 mt-2 mb-1">
                            {getDirectionDisplay(notification.metadata.direction)}
                            {notification.metadata.currencyPair && (
                              <span className="text-xs font-medium text-slate-600">
                                {notification.metadata.currencyPair}
                              </span>
                            )}
                            {notification.metadata.confidence !== undefined && (
                              <div className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                getConfidenceColor(notification.metadata.confidence)
                              }`}>
                                {Math.round(notification.metadata.confidence)}% confidence
                              </div>
                            )}
                          </div>
                        )}
                        
                        <p className="text-sm text-slate-600 mt-1 break-words">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 text-center">
              <button
                onClick={loadNotifications}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      )}

      {/* Clear All Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Clear All Notifications?</h3>
                <p className="text-sm text-slate-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-slate-600 mb-6">
              Are you sure you want to permanently delete all {notifications.length} notification{notifications.length !== 1 ? 's' : ''}? 
              This will remove them from your notification history.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={clearingAll}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                disabled={clearingAll}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {clearingAll ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

