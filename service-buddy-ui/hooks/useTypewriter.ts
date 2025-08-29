import { useState, useEffect, useRef } from 'react'

interface UseTypewriterOptions {
  phrases: string[]
  typeSpeed?: number
  deleteSpeed?: number
  pauseDuration?: number
  respectReducedMotion?: boolean
}

export function useTypewriter({
  phrases,
  typeSpeed = 100,
  deleteSpeed = 50,
  pauseDuration = 2000,
  respectReducedMotion = true
}: UseTypewriterOptions) {
  const [currentText, setCurrentText] = useState('')
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = respectReducedMotion && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      // For reduced motion, just cycle through phrases instantly
      const interval = setInterval(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
        setCurrentText(phrases[currentPhraseIndex])
      }, pauseDuration)

      return () => clearInterval(interval)
    }

    const currentPhrase = phrases[currentPhraseIndex]
    
    const typewriterEffect = () => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentPhrase.length) {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1))
          timeoutRef.current = setTimeout(typewriterEffect, typeSpeed)
        } else {
          // Finished typing, pause then start deleting
          timeoutRef.current = setTimeout(() => {
            setIsDeleting(true)
            typewriterEffect()
          }, pauseDuration)
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1))
          timeoutRef.current = setTimeout(typewriterEffect, deleteSpeed)
        } else {
          // Finished deleting, move to next phrase
          setIsDeleting(false)
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
          timeoutRef.current = setTimeout(typewriterEffect, typeSpeed)
        }
      }
    }

    timeoutRef.current = setTimeout(typewriterEffect, typeSpeed)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [currentText, currentPhraseIndex, isDeleting, phrases, typeSpeed, deleteSpeed, pauseDuration, respectReducedMotion])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return currentText
}
