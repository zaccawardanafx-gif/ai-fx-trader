'use client'

import { useState, useEffect } from 'react'
import { Responsive, WidthProvider, Layout } from 'react-grid-layout'
import TradeIdeasWidget from './TradeIdeasWidget'
import TradingViewChart from './TradingViewChart'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

interface DashboardGridProps {
  userId: string
}

export default function DashboardGrid({ userId }: DashboardGridProps) {
  const [layouts, setLayouts] = useState<{ lg: Layout[], md: Layout[], sm: Layout[], xs: Layout[] } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [chartHidden, setChartHidden] = useState(false)

  // Default layouts for different breakpoints
  const defaultLayouts = {
    lg: [
      { i: 'chart', x: 0, y: 0, w: 7, h: 20, minW: 4, minH: 8 },
      { i: 'trade-ideas', x: 7, y: 0, w: 5, h: 20, minW: 3, minH: 8 },
    ],
    md: [
      { i: 'chart', x: 0, y: 0, w: 6, h: 12, minW: 4, minH: 8 },
      { i: 'trade-ideas', x: 6, y: 0, w: 4, h: 12, minW: 3, minH: 8 },
    ],
    sm: [
      { i: 'chart', x: 0, y: 0, w: 6, h: 12, minW: 4, minH: 6 },
      { i: 'trade-ideas', x: 0, y: 12, w: 6, h: 12, minW: 3, minH: 6 },
    ],
    xs: [
      { i: 'chart', x: 0, y: 0, w: 4, h: 10, minW: 2, minH: 5 },
      { i: 'trade-ideas', x: 0, y: 10, w: 4, h: 12, minW: 2, minH: 6 },
    ],
  }

  useEffect(() => {
    setMounted(true)
    const mobile = window.innerWidth < 768
    setIsMobile(mobile)
    
    // Load saved layout from localStorage
    const savedLayouts = localStorage.getItem('dashboard-layouts')
    if (savedLayouts) {
      try {
        setLayouts(JSON.parse(savedLayouts))
      } catch (e) {
        console.error('Failed to parse saved layouts:', e)
        setLayouts(defaultLayouts)
      }
    } else {
      setLayouts(defaultLayouts)
    }

    // Load chart visibility state only on mobile
    if (mobile) {
      const savedChartHidden = localStorage.getItem('chart-hidden')
      if (savedChartHidden) {
        setChartHidden(savedChartHidden === 'true')
      }
    } else {
      // Always show chart on desktop
      setChartHidden(false)
    }

    // Handle resize
    const handleResize = () => {
      const isMobileNow = window.innerWidth < 768
      setIsMobile(isMobileNow)
      
      // Reset chart visibility when switching to desktop
      if (!isMobileNow) {
        setChartHidden(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleChartVisibility = () => {
    const newState = !chartHidden
    setChartHidden(newState)
    localStorage.setItem('chart-hidden', String(newState))
  }

  const handleLayoutChange = (currentLayout: Layout[], allLayouts: Record<string, Layout[]>) => {
    if (mounted) {
      setLayouts(allLayouts)
      // Save to localStorage
      localStorage.setItem('dashboard-layouts', JSON.stringify(allLayouts))
    }
  }

  if (!mounted || !layouts) {
    // Return a loading state or placeholder
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6 h-96 animate-pulse"></div>
        <div className="bg-white rounded-lg shadow-lg p-6 h-64 animate-pulse"></div>
      </div>
    )
  }

  // On mobile with chart hidden, show only trade ideas in a simple layout
  if (isMobile && chartHidden) {
    return (
      <div className="min-h-screen relative pb-4">
        {/* Mobile Chart Toggle Button */}
        <div className="fixed top-16 right-2 z-50">
          <button
            onClick={toggleChartVisibility}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-medium transition-colors"
            title="Show chart"
          >
            📊 Show Chart
          </button>
        </div>

        <div className="py-2">
          <TradeIdeasWidget userId={userId} />
        </div>
      </div>
    )
  }

  // Mobile view with scrollable layout
  if (isMobile) {
    return (
      <div className="min-h-screen relative pb-4">
        {/* Mobile Chart Toggle Button */}
        <div className="fixed top-16 right-2 z-50">
          <button
            onClick={toggleChartVisibility}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-medium transition-colors"
            title="Hide chart"
          >
            📊 Hide Chart
          </button>
        </div>

        <div className="space-y-4 py-2">
          <div style={{ height: '450px' }}>
            <TradingViewChart />
          </div>
          <div style={{ minHeight: '600px' }}>
            <TradeIdeasWidget userId={userId} />
          </div>
        </div>
      </div>
    )
  }

  // Desktop view with grid layout
  return (
    <div className="h-screen relative w-full">
      <ResponsiveGridLayout
        className="layout h-full w-full"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
        rowHeight={30}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
        isDraggable={true}
        isResizable={true}
        compactType="vertical"
        preventCollision={false}
        margin={[8, 8]}
      >
        <div key="chart" className="relative">
          <div className="drag-handle absolute top-1 left-1 right-1 sm:top-2 sm:left-2 sm:right-2 h-6 sm:h-8 cursor-move z-10 opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-blue-600 text-white text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-lg inline-block">
              📊 Drag to move
            </div>
          </div>
          <TradingViewChart />
        </div>
      
        <div key="trade-ideas" className="relative">
          <div className="drag-handle absolute top-1 left-1 right-1 sm:top-2 sm:left-2 sm:right-2 h-6 sm:h-8 cursor-move z-10 opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-blue-600 text-white text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-lg inline-block">
              💡 Drag to move
            </div>
          </div>
          <TradeIdeasWidget userId={userId} />
        </div>
      </ResponsiveGridLayout>
    </div>
  )
}

