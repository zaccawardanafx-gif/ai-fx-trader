'use client'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Z Shape */}
        <path
          d="M8 12 L32 12 L8 28 L32 28"
          stroke="#3B82F6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Upward Trending Line */}
        <path
          d="M12 20 L20 16 L28 12 L32 8"
          stroke="#10B981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Trend Dots */}
        <circle
          cx="12"
          cy="20"
          r="1.5"
          fill="#10B981"
        />
        <circle
          cx="20"
          cy="16"
          r="1.5"
          fill="#10B981"
        />
        <circle
          cx="28"
          cy="12"
          r="1.5"
          fill="#10B981"
        />
        <circle
          cx="32"
          cy="8"
          r="1.5"
          fill="#10B981"
        />
      </svg>
    </div>
  )
}
