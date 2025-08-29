'use client'

import { useTypewriter } from '../hooks/useTypewriter'

interface TypewriterTextProps {
  phrases: string[]
  className?: string
  staticText?: string
  typeSpeed?: number
  deleteSpeed?: number
  pauseDuration?: number
}

export default function TypewriterText({
  phrases,
  className = '',
  staticText = '',
  typeSpeed = 40,
  deleteSpeed = 40,
  pauseDuration = 2000
}: TypewriterTextProps) {
  const dynamicText = useTypewriter({
    phrases,
    typeSpeed,
    deleteSpeed,
    pauseDuration
  })

  return (
    <span className={className}>
      {staticText}
      <span className="text-blue-600 font-medium">
        {dynamicText}
        <span className="animate-pulse text-blue-400">|</span>
      </span>
    </span>
  )
}
