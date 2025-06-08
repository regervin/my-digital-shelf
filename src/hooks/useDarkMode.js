import { useState, useEffect } from 'react'

export function useDarkMode() {
  // Check if user has a preference stored
  const savedPreference = localStorage.getItem('darkMode')
  
  // Check if user has a system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  // Initialize state based on saved preference or system preference
  const [isDarkMode, setIsDarkMode] = useState(
    savedPreference !== null 
      ? savedPreference === 'true'
      : prefersDark
  )

  // Update the theme when the state changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Save the preference to localStorage
    localStorage.setItem('darkMode', isDarkMode)
  }, [isDarkMode])

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      // Only update if user hasn't set a preference
      if (localStorage.getItem('darkMode') === null) {
        setIsDarkMode(mediaQuery.matches)
      }
    }
    
    // Add event listener
    mediaQuery.addEventListener('change', handleChange)
    
    // Clean up
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Toggle function
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode)
  }

  return { isDarkMode, toggleDarkMode }
}
