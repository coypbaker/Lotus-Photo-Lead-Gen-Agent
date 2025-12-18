'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  onClick,
  type = 'button',
}: ButtonProps) {
  const baseClasses = 'relative overflow-hidden inline-flex items-center justify-center font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-[#0c0a15] shadow-lg shadow-[#14b8a6]/25 hover:shadow-[#14b8a6]/40',
    secondary: 'bg-gradient-to-r from-[#f43f5e] to-[#e11d48] text-white shadow-lg shadow-[#f43f5e]/25 hover:shadow-[#f43f5e]/40',
    accent: 'bg-gradient-to-r from-[#a855f7] to-[#9333ea] text-white shadow-lg shadow-[#a855f7]/25 hover:shadow-[#a855f7]/40',
    ghost: 'bg-transparent text-[#a9a4b8] hover:text-[#f0eef5] hover:bg-[#1e1830]',
    outline: 'bg-transparent text-[#f0eef5] border border-[#2d2640] hover:border-[#14b8a6]/50 hover:bg-[#1e1830]/50',
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg gap-1.5',
    md: 'px-6 py-3 text-sm rounded-xl gap-2',
    lg: 'px-8 py-4 text-base rounded-2xl gap-2.5',
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
    >
      {/* Shine effect for gradient buttons */}
      {['primary', 'secondary', 'accent'].includes(variant) && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}
      
      <span className="relative flex items-center gap-2">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-4 w-4" />
          </motion.div>
        ) : (
          icon && iconPosition === 'left' && icon
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </span>
    </motion.button>
  )
}

interface IconButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  className = '',
  onClick,
  disabled,
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  }

  const variantClasses = {
    primary: 'bg-[#14b8a6]/10 text-[#14b8a6] hover:bg-[#14b8a6]/20',
    secondary: 'bg-[#f43f5e]/10 text-[#f43f5e] hover:bg-[#f43f5e]/20',
    accent: 'bg-[#a855f7]/10 text-[#a855f7] hover:bg-[#a855f7]/20',
    ghost: 'text-[#6b6480] hover:text-[#f0eef5] hover:bg-[#1e1830]',
    outline: 'text-[#a9a4b8] border border-[#2d2640] hover:border-[#14b8a6]/50 hover:text-[#14b8a6]',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`rounded-xl transition-all duration-200 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}
