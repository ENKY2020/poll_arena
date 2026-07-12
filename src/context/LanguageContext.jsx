import { createContext, useContext, useEffect, useState } from 'react'
import english from '../translations/english'
import swahili from '../translations/swahili'

const LanguageContext = createContext()

const translations = {
  en: english,
  sw: swahili,
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(true)
  const t = translations[language] || translations.en

  useEffect(() => {
    const savedLanguage = localStorage.getItem('pollarena_language')

    if (savedLanguage) {
      setLanguage(savedLanguage)
    }

    setLoading(false)
  }, [])

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage)
    localStorage.setItem('pollarena_language', newLanguage)
  }

  return (
    <LanguageContext.Provider
      value={{
    language,
    changeLanguage,
    loading,
    t,
}}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}