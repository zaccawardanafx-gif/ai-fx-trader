'use client'

import { useState, useEffect } from 'react'
import { Responsive, WidthProvider, Layout } from 'react-grid-layout'
import TradeIdeasWidget from './TradeIdeasWidget'
import TradingViewChart from './TradingViewChart'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

// Default layouts for different breakpoints - moved outside component to prevent re-creation
const defaultLayouts = {
  lg: [
    { i: 'chart', x: 0, y: 0, w: 7, h: 24, minW: 4, minH: 12 },
    { i: 'trade-ideas', x: 7, y: 0, w: 5, h: 24, minW: 3, minH: 12 },
  ],
  md: [
    { i: 'chart', x: 0, y: 0, w: 6, h: 20, minW: 4, minH: 12 },
    { i: 'trade-ideas', x: 6, y: 0, w: 4, h: 20, minW: 3, minH: 12 },
  ],
  sm: [
    { i: 'chart', x: 0, y: 0, w: 6, h: 16, minW: 4, minH: 10 },
    { i: 'trade-ideas', x: 0, y: 16, w: 6, h: 16, minW: 3, minH: 10 },
  ],
  xs: [
    { i: 'chart', x: 0, y: 0, w: 4, h: 12, minW: 2, minH: 8 },
    { i: 'trade-ideas', x: 0, y: 12, w: 4, h: 14, minW: 2, minH: 8 },
  ],
}

interface DashboardGridProps {
  userId: string
}

export default function DashboardGrid({ userId }: DashboardGridProps) {
  const [layouts, setLayouts] = useState<{ lg: Layout[], md: Layout[], sm: Layout[], xs: Layout[] } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [chartHidden, setChartHidden] = useState(false)

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
  }, [defaultLayouts])

  const toggleChartVisibility = () => {
    const newState = !chartHidden
    setChartHidden(newState)
    localStorage.setItem('chart-hidden', String(newState))
  }

  const handleLayoutChange = (currentLayout: Layout[], allLayouts: Record<string, Layout[]>) => {
    if (mounted) {
      setLayouts(allLayouts as { lg: Layout[], md: Layout[], sm: Layout[], xs: Layout[] })
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
          <div style={{ height: '500px' }}>
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
    <div className="h-full relative w-full">
      <ResponsiveGridLayout
        className="layout w-full h-full"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
        rowHeight={36}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
        isDraggable={true}
        isResizable={true}
        compactType="vertical"
        preventCollision={false}
        margin={[8, 8]}
      >
        <div key="chart" className="relative h-full">
          <div className="drag-handle absolute top-1 left-1 right-1 sm:top-2 sm:left-2 sm:right-2 h-6 sm:h-8 cursor-move z-10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-blue-600 text-white text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-lg inline-block pointer-events-auto">
              📊 Drag to move
            </div>
          </div>
          <div className="h-full widget-content">
            <TradingViewChart />
          </div>
        </div>
      
        <div key="trade-ideas" className="relative h-full">
          <div className="drag-handle absolute top-1 left-1 right-1 sm:top-2 sm:left-2 sm:right-2 h-6 sm:h-8 cursor-move z-10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-blue-600 text-white text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-lg inline-block pointer-events-auto">
              💡 Drag to move
            </div>
          </div>
          <div className="h-full widget-content">
            <TradeIdeasWidget userId={userId} />
          </div>
        </div>
      </ResponsiveGridLayout>
    </div>
  )
}

