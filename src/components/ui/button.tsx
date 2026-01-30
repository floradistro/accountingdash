'use client'

import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-[#fafafa] text-[#09090b] hover:bg-[#e4e4e7]',
    secondary: 'bg-[rgba(255,255,255,0.03)] text-[#fafafa] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)]',
    ghost: 'bg-transparent text-[#fafafa] hover:bg-[rgba(255,255,255,0.03)]',
    destructive: 'bg-[#F36368] text-[#fafafa] hover:bg-[#e54950]',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[rgba(255,255,255,0.1)] focus:ring-offset-2 focus:ring-offset-[#09090b]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
