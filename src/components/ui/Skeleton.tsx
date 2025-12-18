'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = 'relative overflow-hidden bg-[#1e1830]'
  
  const variantClasses = {
    text: 'h-4 rounded-lg',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'rounded-2xl',
  }

  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { x: '100%' },
  }

  const renderSkeleton = () => (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ 
        width: width || (variant === 'circular' ? height : '100%'),
        height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? width : '100%'),
      }}
    >
      <motion.div
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2d2640]/50 to-transparent"
      />
    </div>
  )

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={{ 
              width: i === lines - 1 ? '75%' : '100%',
              height: height || '1rem',
            }}
          >
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.1,
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2d2640]/50 to-transparent"
            />
          </div>
        ))}
      </div>
    )
  }

  return renderSkeleton()
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={100} />
      <div className="flex gap-3">
        <Skeleton variant="rectangular" height={40} className="flex-1" />
        <Skeleton variant="rectangular" width={100} height={40} />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-[#2d2640]">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="text" className="flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-[#2d2640] last:border-0">
          <div className="flex gap-4 items-center">
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" className="flex-1" />
            <Skeleton variant="text" width={80} />
            <Skeleton variant="rectangular" width={100} height={32} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="circular" width={48} height={48} />
          </div>
          <Skeleton variant="text" width="30%" height={32} />
          <Skeleton variant="rectangular" height={4} className="mt-4" />
        </div>
      ))}
    </div>
  )
}
