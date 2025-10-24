'use client'

import { useEffect, useState } from 'react'

interface AnimatedBackgroundProps {
  children: React.ReactNode
  className?: string
}

export default function AnimatedBackground({ children, className = '' }: AnimatedBackgroundProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Deterministic data for SSR consistency
  const dataPoints = [
    { left: 77.87, top: 10.31, duration: 9.96, delay: 1.79 },
    { left: 45.33, top: 85.84, duration: 11.56, delay: 1.44 },
    { left: 9.00, top: 30.99, duration: 8.55, delay: 1.91 },
    { left: 2.84, top: 69.19, duration: 9.17, delay: 1.88 },
    { left: 16.50, top: 76.96, duration: 9.00, delay: 1.98 },
    { left: 1.47, top: 54.56, duration: 9.72, delay: 0.25 },
    { left: 78.29, top: 81.26, duration: 8.26, delay: 1.02 },
    { left: 2.59, top: 12.69, duration: 8.33, delay: 1.16 }
  ]

  const lineData = [
    { width: 284.47, top: '20%', duration: 6, delay: 0 },
    { width: 209.53, top: '50%', duration: 8, delay: 1.5 },
    { width: 283.04, top: '80%', duration: 10, delay: 3 }
  ]
  return (
    <div className={`min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 ${className}`}>
      {/* Animated City Map Blueprint Background */}
      <div className="absolute inset-0 opacity-15">
        <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          {/* Italy */}
          <g className="text-blue-400/30">
            <path
              d="M200,200 L250,180 L300,200 L320,250 L310,300 L280,320 L240,310 L200,280 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
            </path>
            {/* Italian cities */}
            <circle cx="220" cy="220" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="280" cy="240" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="260" cy="280" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" begin="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="2s" repeatCount="indefinite" />
            </circle>
            <text x="200" y="190" className="text-xs fill-current">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="4s" repeatCount="indefinite" />
              Italy
            </text>
          </g>
          
          {/* Switzerland */}
          <g className="text-blue-400/30">
            <path
              d="M300,150 L350,140 L380,160 L370,200 L340,220 L310,210 L290,180 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" begin="1s" repeatCount="indefinite" />
            </path>
            {/* Swiss cities */}
            <circle cx="320" cy="170" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" begin="0.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="350" cy="180" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" begin="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="330" cy="200" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" begin="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="2.5s" repeatCount="indefinite" />
            </circle>
            <text x="300" y="135" className="text-xs fill-current">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="4s" begin="1s" repeatCount="indefinite" />
              Switzerland
            </text>
          </g>
          
          {/* Singapore */}
          <g className="text-blue-400/30">
            <path
              d="M800,600 L850,590 L880,610 L870,650 L840,670 L810,660 L790,630 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" begin="2s" repeatCount="indefinite" />
            </path>
            {/* Singapore cities */}
            <circle cx="820" cy="620" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="850" cy="630" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" begin="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="830" cy="650" r="2" fill="currentColor">
              <animate attributeName="r" values="2;4;2" dur="3s" begin="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" begin="3s" repeatCount="indefinite" />
            </circle>
            <text x="800" y="585" className="text-xs fill-current">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="4s" begin="2s" repeatCount="indefinite" />
              Singapore
            </text>
          </g>
          
          {/* Animated Connection Lines */}
          <path
            d="M320,200 L350,180 M350,180 L820,620"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            opacity="0.3"
          >
            <animate attributeName="stroke-dashoffset" values="0;8;0" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
          </path>
          
          {/* Animated Grid Pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)">
            <animate attributeName="opacity" values="0.1;0.3;0.1" dur="6s" repeatCount="indefinite" />
          </rect>
        </svg>
      </div>

      {/* Floating Data Streams - Only render on client to avoid hydration mismatch */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Moving Data Points */}
          {dataPoints.map((point, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
              style={{
                left: `${point.left}%`,
                top: `${point.top}%`,
                animation: `dataFlow ${point.duration}s linear infinite`,
                animationDelay: `${point.delay}s`
              }}
            />
          ))}
          
          {/* Moving Lines */}
          {lineData.map((line, i) => (
            <div
              key={`line-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
              style={{
                width: `${line.width}px`,
                left: `-200px`,
                top: line.top,
                animation: `lineFlow ${line.duration}s linear infinite`,
                animationDelay: `${line.delay}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes dataFlow {
          0% {
            transform: translateY(100vh) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(50px);
            opacity: 0;
          }
        }
        
        @keyframes lineFlow {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100vw);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
