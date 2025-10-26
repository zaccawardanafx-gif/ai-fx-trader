'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const INSTRUMENTS = [
  { label: 'USD/CHF', symbol: 'FX:USDCHF' },
  { label: 'EUR/USD', symbol: 'FX:EURUSD' },
  { label: 'GBP/USD', symbol: 'FX:GBPUSD' },
  { label: 'USD/JPY', symbol: 'FX:USDJPY' },
  { label: 'AUD/USD', symbol: 'FX:AUDUSD' },
  { label: 'USD/CAD', symbol: 'FX:USDCAD' },
]

export default function TradingViewChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<TradingViewWidget | null>(null)
  const [selectedInstrument] = useState(INSTRUMENTS[0])
  const [timeFrame] = useState('1')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  
  // Generate unique container ID to avoid conflicts - use timestamp for stability
  const containerId = useRef(`tradingview-widget-${Date.now()}`)

  const createWidget = useCallback(() => {
    try {
      if (!window.TradingView || !containerRef.current) {
        console.warn('TradingView or containerRef not available')
        return
      }

      // Clear any existing timeout
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
      }

      const widget = new window.TradingView.widget({
        autosize: true,
        symbol: selectedInstrument.symbol,
        interval: timeFrame,
        timezone: 'Europe/Zurich',
        theme: 'light',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f4',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        container_id: containerId.current,
        studies: [],
        overrides: {
          'scalesProperties.showBusinessHours': false,
          'scalesProperties.showBidAskLabels': false,
          'scalesProperties.showStudyLastValues': false,
          'scalesProperties.showSymbolLabels': true,
          'paneProperties.background': '#ffffff',
          'paneProperties.vertGridProperties.color': '#e5e7eb',
          'paneProperties.horzGridProperties.color': '#e5e7eb',
          'symbolWatermarkProperties.transparency': 90,
          'scalesProperties.textColor': '#334155',
          'mainSeriesProperties.candleStyle.upColor': '#22c55e',
          'mainSeriesProperties.candleStyle.downColor': '#ef4444',
          'mainSeriesProperties.candleStyle.drawWick': true,
          'mainSeriesProperties.candleStyle.drawBorder': true,
          'mainSeriesProperties.candleStyle.borderColor': '#374151',
          'mainSeriesProperties.candleStyle.borderUpColor': '#22c55e',
          'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
          'mainSeriesProperties.candleStyle.wickUpColor': '#22c55e',
          'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444',
          'scalesProperties.fontSize': isMobile ? 10 : 12,
          'paneProperties.vertGridProperties.style': isMobile ? 0 : 1,
          'paneProperties.horzGridProperties.style': isMobile ? 0 : 1,
        },
      })
      
      // Store the widget reference
      widgetRef.current = widget
      setIsLoading(false)
      setLoadError(null)
      console.log('TradingView widget created successfully')
    } catch (error) {
      console.error('TradingView widget creation error:', error)
      setIsLoading(false)
      setLoadError('Failed to create chart widget')
    }
  }, [selectedInstrument.symbol, timeFrame, isMobile, isCollapsed])

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    retryCountRef.current = 0
    
    // Set a timeout to prevent infinite loading
    loadTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.error('TradingView chart load timeout')
        setIsLoading(false)
        setLoadError('Chart loading timed out. Please refresh the page.')
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current)
        }
      }
    }, 10000) // 10 second timeout
    
    // Wait a bit for the script to be loaded (it's loaded via Next.js Script in layout)
    const checkAndCreateWidget = () => {
      retryCountRef.current += 1
      
      if (window.TradingView && containerRef.current) {
        try {
          createWidget()
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current)
          }
        } catch (error) {
          console.error('TradingViewChart: Error creating widget:', error)
          setIsLoading(false)
          setLoadError('Failed to initialize chart')
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current)
          }
        }
      } else if (retryCountRef.current > 50) {
        // Stop trying after 50 attempts (5 seconds)
        console.error('TradingView script not loaded after multiple retries')
        setIsLoading(false)
        setLoadError('Failed to load chart library')
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current)
        }
      }
    }
    
    // Start checking for TradingView availability every 100ms
    checkIntervalRef.current = setInterval(checkAndCreateWidget, 100)

    // Handle resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      console.log('TradingView component unmounting - cleaning up')
      window.removeEventListener('resize', handleResize)
      
      // Clear all timers and intervals
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
        loadTimeoutRef.current = null
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
      
      // Remove the widget
      if (widgetRef.current) {
        try {
          if ('remove' in widgetRef.current && typeof widgetRef.current.remove === 'function') {
            widgetRef.current.remove()
          }
        } catch (error) {
          console.warn('Error removing TradingView widget:', error)
        }
        widgetRef.current = null
      }
      
      // Clear the container
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [createWidget, isLoading])

  useEffect(() => {
    // Instead of trying to update the widget, recreate it with new parameters
    // This is more reliable than trying to call setSymbol/setInterval methods
    if (widgetRef.current && typeof widgetRef.current === 'object' && widgetRef.current !== null) {
      // Remove the old widget
      try {
        if ('remove' in widgetRef.current && typeof widgetRef.current.remove === 'function') {
          widgetRef.current.remove()
        }
      } catch (error) {
        console.warn('TradingViewChart: Error removing old widget:', error)
      }
      
      // Clear the container
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      
      // Clear the reference
      widgetRef.current = null
      
      // Recreate the widget with new parameters
      if (window.TradingView && containerRef.current) {
        createWidget()
      }
    }
  }, [selectedInstrument, timeFrame, createWidget])

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 h-full flex flex-col overflow-hidden">
      {/* Chart Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-white/10">
        <h2 className="text-base sm:text-xl font-bold text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Live Market Chart
        </h2>
        <div className="flex items-center space-x-2">
          <div className="text-xs sm:text-sm text-blue-200">
            {selectedInstrument.label}
          </div>
          {isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-blue-200 hover:text-white transition-colors"
              title={isCollapsed ? 'Expand chart' : 'Collapse chart'}
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="relative flex-1 bg-white">
        {isLoading && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-blue-200 font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Loading TradingView chart...
              </p>
            </div>
          </div>
        )}
        
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
            <div className="text-center p-6">
              <div className="text-red-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-300 font-medium mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {loadError}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}
        
        {isMobile && isCollapsed ? (
          <div 
            className="flex items-center justify-center h-full text-blue-200 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => setIsCollapsed(false)}
          >
            <p className="text-sm">Chart collapsed - tap to expand</p>
          </div>
        ) : (
          <div
            ref={containerRef}
            id={containerId.current}
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  )
}

// Define TradingView widget interface
interface TradingViewWidget {
  remove: () => void
}

// Extend Window interface for TradingView
declare global {
  interface Window {
    TradingView: {
      widget: new (config: Record<string, unknown>) => TradingViewWidget
    }
  }
}
