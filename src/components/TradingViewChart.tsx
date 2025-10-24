'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import dynamic from 'next/dynamic'

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
  const widgetRef = useRef<unknown>(null)
  const [selectedInstrument] = useState(INSTRUMENTS[0])
  const [timeFrame] = useState('1')
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Generate unique container ID to avoid conflicts
  const containerId = useRef(`tradingview-widget-${Math.random().toString(36).substr(2, 9)}`)

  const createWidget = useCallback(() => {
    try {
      if (!window.TradingView || !containerRef.current) return

      const widget = new window.TradingView.widget({
        autosize: true,
        symbol: selectedInstrument.symbol,
        interval: timeFrame,
        timezone: 'Etc/UTC',
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
        width: '100%',
        height: isMobile ? (isCollapsed ? '80px' : '400px') : '500px',
        overrides: {
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
    } catch (error) {
      console.error('TradingView widget creation error:', error)
      setIsLoading(false)
    }
  }, [selectedInstrument.symbol, timeFrame, isMobile, isCollapsed])

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    
    // Check if TradingView is already loaded
    if (window.TradingView) {
      try {
        createWidget()
      } catch (error) {
        console.error('TradingViewChart: Error creating widget with existing TradingView:', error)
        setIsLoading(false)
      }
      return
    }
    
    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="tradingview"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        try {
          if (window.TradingView && containerRef.current) {
            createWidget()
          }
        } catch (error) {
          console.error('TradingViewChart: Error creating widget after existing script load:', error)
          setIsLoading(false)
        }
      })
      return
    }
    
    // Load TradingView widget script
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      try {
        if (window.TradingView && containerRef.current) {
          createWidget()
        }
      } catch (error) {
        console.error('TradingView script onload error:', error)
        setIsLoading(false)
      }
    }
    script.onerror = (error) => {
      console.error('TradingView script load error:', error)
      setIsLoading(false)
    }
    document.head.appendChild(script)

    // Handle resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (widgetRef.current && typeof widgetRef.current === 'object' && widgetRef.current !== null && 'remove' in widgetRef.current) {
        (widgetRef.current as { remove: () => void }).remove()
      }
    }
  }, [createWidget])

  useEffect(() => {
    // Instead of trying to update the widget, recreate it with new parameters
    // This is more reliable than trying to call setSymbol/setInterval methods
    if (widgetRef.current && typeof widgetRef.current === 'object' && widgetRef.current !== null) {
      // Remove the old widget
      try {
        if ('remove' in widgetRef.current) {
          (widgetRef.current as any).remove()
        }
      } catch (error) {
        console.warn('TradingViewChart: Error removing old widget:', error)
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
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-2 sm:p-6 border border-white/20 h-full flex flex-col">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-6 flex-shrink-0">
        <h2 className="text-base sm:text-2xl font-bold text-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
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
      <div className={`relative bg-gradient-to-br from-slate-900/20 to-slate-800/20 rounded-xl p-2 sm:p-4 border border-white/10 overflow-hidden transition-all duration-300 ${
        isMobile && isCollapsed ? 'flex-none' : 'flex-1'
      }`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-xl z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-blue-200 font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Loading TradingView chart...
              </p>
            </div>
          </div>
        )}
        
        {isMobile && isCollapsed ? (
          <div 
            className="flex items-center justify-center h-16 text-blue-200 cursor-pointer hover:bg-white/5 transition-colors rounded-lg"
            onClick={() => setIsCollapsed(false)}
          >
            <p className="text-sm">Chart collapsed - tap to expand</p>
          </div>
        ) : (
          <div className="w-full h-full" style={{ minHeight: isMobile ? '300px' : '450px' }}>
            <div
              ref={containerRef}
              id={containerId.current}
              className="w-full h-full"
              style={{ 
                width: '100%', 
                height: '100%',
                minHeight: isMobile ? '300px' : '450px'
              }}
            />
          </div>
        )}
      </div>


    </div>
  )
}

// Extend Window interface for TradingView
declare global {
  interface Window {
    TradingView: {
      widget: new (config: Record<string, unknown>) => {
        setSymbol: (symbol: string) => void
        setInterval: (interval: string) => void
        remove: () => void
      }
    }
  }
}
