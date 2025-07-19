// Core interfaces for internationalization
interface MessageDescriptor {
  id: string;
  defaultMessage: string;
  description?: string;
}

type PrimitiveType = string | number | boolean | null | undefined;
type FormatXMLElementFn<T> = (chunks: T[]) => T;

// Supported locales
export const SUPPORTED_LOCALES = {
  'en-US': 'English (US)',
  'en-GB': 'English (UK)', 
  'es-ES': 'Español (España)',
  'es-MX': 'Español (México)',
  'fr-FR': 'Français (France)',
  'fr-CA': 'Français (Canada)',
  'de-DE': 'Deutsch (Deutschland)',
  'it-IT': 'Italiano (Italia)',
  'pt-BR': 'Português (Brasil)',
  'pt-PT': 'Português (Portugal)',
  'nl-NL': 'Nederlands (Nederland)',
  'pl-PL': 'Polski (Polska)',
  'ru-RU': 'Русский (Россия)',
  'zh-CN': '中文 (简体)',
  'zh-TW': '中文 (繁體)',
  'ja-JP': '日本語 (日本)',
  'ko-KR': '한국어 (대한민국)',
  'ar-SA': 'العربية (السعودية)',
  'he-IL': 'עברית (ישראל)',
  'th-TH': 'ไทย (ประเทศไทย)',
  'vi-VN': 'Tiếng Việt (Việt Nam)',
  'hi-IN': 'हिन्दी (भारत)',
  'tr-TR': 'Türkçe (Türkiye)',
  'cs-CZ': 'Čeština (Česká republika)',
  'da-DK': 'Dansk (Danmark)',
  'fi-FI': 'Suomi (Suomi)',
  'no-NO': 'Norsk (Norge)',
  'sv-SE': 'Svenska (Sverige)',
  'uk-UA': 'Українська (Україна)',
} as const;

export type SupportedLocale = keyof typeof SUPPORTED_LOCALES;

// RTL languages
export const RTL_LOCALES: SupportedLocale[] = ['ar-SA', 'he-IL'];

// Date and number formatting locales
export const DATE_LOCALES = {
  'en-US': 'en-US',
  'en-GB': 'en-GB',
  'es-ES': 'es-ES',
  'es-MX': 'es-MX',
  'fr-FR': 'fr-FR',
  'fr-CA': 'fr-CA',
  'de-DE': 'de-DE',
  'it-IT': 'it-IT',
  'pt-BR': 'pt-BR',
  'pt-PT': 'pt-PT',
  'nl-NL': 'nl-NL',
  'pl-PL': 'pl-PL',
  'ru-RU': 'ru-RU',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'ja-JP': 'ja-JP',
  'ko-KR': 'ko-KR',
  'ar-SA': 'ar-SA',
  'he-IL': 'he-IL',
  'th-TH': 'th-TH',
  'vi-VN': 'vi-VN',
  'hi-IN': 'hi-IN',
  'tr-TR': 'tr-TR',
  'cs-CZ': 'cs-CZ',
  'da-DK': 'da-DK',
  'fi-FI': 'fi-FI',
  'no-NO': 'nb-NO',
  'sv-SE': 'sv-SE',
  'uk-UA': 'uk-UA',
} as const;

interface LocaleDetectionOptions {
  fallback?: SupportedLocale;
  cookieKey?: string;
  localStorageKey?: string;
}

class LocaleDetector {
  private options: LocaleDetectionOptions;
  
  constructor(options: LocaleDetectionOptions = {}) {
    this.options = {
      fallback: 'en-US',
      cookieKey: 'codeforge_locale',
      localStorageKey: 'codeforge_locale',
      ...options,
    };
  }

  /**
   * Detect user's preferred locale from multiple sources
   */
  detectLocale(): SupportedLocale {
    // 1. Check URL parameter
    const urlLocale = this.getUrlLocale();
    if (urlLocale && this.isSupported(urlLocale)) {
      return urlLocale;
    }

    // 2. Check localStorage
    const storageLocale = this.getStorageLocale();
    if (storageLocale && this.isSupported(storageLocale)) {
      return storageLocale;
    }

    // 3. Check cookie
    const cookieLocale = this.getCookieLocale();
    if (cookieLocale && this.isSupported(cookieLocale)) {
      return cookieLocale;
    }

    // 4. Check browser language
    const browserLocale = this.getBrowserLocale();
    if (browserLocale && this.isSupported(browserLocale)) {
      return browserLocale;
    }

    // 5. Fallback
    return this.options.fallback || 'en-US';
  }

  private getUrlLocale(): string | null {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('locale') || urlParams.get('lang');
  }

  private getStorageLocale(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(this.options.localStorageKey!);
    } catch {
      return null;
    }
  }

  private getCookieLocale(): string | null {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => 
      c.trim().startsWith(`${this.options.cookieKey}=`)
    );
    return cookie ? cookie.split('=')[1] : null;
  }

  private getBrowserLocale(): string | null {
    if (typeof navigator === 'undefined') return null;
    
    // Try to get the most specific locale first
    const languages = navigator.languages || [navigator.language];
    
    for (const lang of languages) {
      // Try exact match first
      if (this.isSupported(lang)) {
        return lang as SupportedLocale;
      }
      
      // Try language without region
      const langOnly = lang.split('-')[0];
      const fallbackLocale = this.findLocaleByLanguage(langOnly);
      if (fallbackLocale) {
        return fallbackLocale;
      }
    }
    
    return null;
  }

  private findLocaleByLanguage(language: string): SupportedLocale | null {
    const locales = Object.keys(SUPPORTED_LOCALES) as SupportedLocale[];
    return locales.find(locale => locale.startsWith(language)) || null;
  }

  private isSupported(locale: string): locale is SupportedLocale {
    return Object.keys(SUPPORTED_LOCALES).includes(locale);
  }

  /**
   * Save locale preference
   */
  saveLocale(locale: SupportedLocale): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.options.localStorageKey!, locale);
      } catch (e) {
        console.warn('Failed to save locale to localStorage:', e);
      }
    }

    if (typeof document !== 'undefined') {
      document.cookie = `${this.options.cookieKey}=${locale}; max-age=31536000; path=/; SameSite=Lax`;
    }
  }
}

// Message formatting utilities
interface ICUMessage {
  id: string;
  defaultMessage: string;
  description?: string;
}

export class MessageFormatter {
  private locale: SupportedLocale;
  private messages: Record<string, string>;
  private rtl: boolean;

  constructor(locale: SupportedLocale, messages: Record<string, string>) {
    this.locale = locale;
    this.messages = messages;
    this.rtl = RTL_LOCALES.includes(locale);
  }

  /**
   * Format a message with ICU syntax support
   */
  formatMessage(
    descriptor: MessageDescriptor,
    values?: Record<string, PrimitiveType | FormatXMLElementFn<string>>
  ): string {
    const message = this.messages[descriptor.id] || descriptor.defaultMessage;
    
    if (!values) {
      return message;
    }

    // Basic ICU placeholder replacement
    return message.replace(/{(\w+)}/g, (match, key) => {
      const value = values[key];
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Format numbers according to locale
   */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    const dateLocale = DATE_LOCALES[this.locale] || this.locale;
    return new Intl.NumberFormat(dateLocale, options).format(value);
  }

  /**
   * Format dates according to locale
   */
  formatDate(value: Date | number, options?: Intl.DateTimeFormatOptions): string {
    const dateLocale = DATE_LOCALES[this.locale] || this.locale;
    return new Intl.DateTimeFormat(dateLocale, options).format(value);
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    const dateLocale = DATE_LOCALES[this.locale] || this.locale;
    const rtf = new Intl.RelativeTimeFormat(dateLocale, { numeric: 'auto' });
    return rtf.format(value, unit);
  }

  /**
   * Pluralization support
   */
  formatPlural(
    count: number,
    descriptor: {
      zero?: string;
      one?: string;
      two?: string;
      few?: string;
      many?: string;
      other: string;
    }
  ): string {
    const rules = new Intl.PluralRules(this.locale);
    const rule = rules.select(count);
    
    return descriptor[rule] || descriptor.other;
  }

  /**
   * Check if current locale is RTL
   */
  isRTL(): boolean {
    return this.rtl;
  }

  /**
   * Get text direction for CSS
   */
  getDirection(): 'ltr' | 'rtl' {
    return this.rtl ? 'rtl' : 'ltr';
  }
}

// Locale context for React
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocaleContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  formatter: MessageFormatter;
  t: (id: string, defaultMessage?: string, values?: Record<string, any>) => string;
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
}

const LocaleContext = createContext<LocaleContextType | null>(null);

interface LocaleProviderProps {
  children: ReactNode;
  messages: Record<SupportedLocale, Record<string, string>>;
  defaultLocale?: SupportedLocale;
}

export function LocaleProvider({ 
  children, 
  messages, 
  defaultLocale = 'en-US' 
}: LocaleProviderProps) {
  const detector = new LocaleDetector({ fallback: defaultLocale });
  const [locale, setLocale] = useState<SupportedLocale>(() => detector.detectLocale());
  
  // Create formatter for current locale
  const formatter = new MessageFormatter(locale, messages[locale] || messages[defaultLocale]);

  // Update HTML attributes for RTL support
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = formatter.getDirection();
    }
  }, [locale, formatter]);

  // Save locale preference when changed
  const handleSetLocale = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
    detector.saveLocale(newLocale);
  };

  // Translation helper function
  const t = (id: string, defaultMessage?: string, values?: Record<string, any>): string => {
    return formatter.formatMessage(
      { id, defaultMessage: defaultMessage || id },
      values
    );
  };

  const contextValue: LocaleContextType = {
    locale,
    setLocale: handleSetLocale,
    formatter,
    t,
    isRTL: formatter.isRTL(),
    direction: formatter.getDirection(),
  };

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
}

// Hook to use locale context
export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

// Translation hook
export function useTranslation() {
  const { t, formatter, locale } = useLocale();
  
  return {
    t,
    locale,
    formatNumber: formatter.formatNumber.bind(formatter),
    formatDate: formatter.formatDate.bind(formatter),
    formatRelativeTime: formatter.formatRelativeTime.bind(formatter),
    formatPlural: formatter.formatPlural.bind(formatter),
  };
}

// Utility functions
export function getLocaleDisplayName(locale: SupportedLocale): string {
  return SUPPORTED_LOCALES[locale] || locale;
}

export function getLanguageFromLocale(locale: SupportedLocale): string {
  return locale.split('-')[0];
}

export function isRTLLocale(locale: SupportedLocale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function getTextDirection(locale: SupportedLocale): 'ltr' | 'rtl' {
  return isRTLLocale(locale) ? 'rtl' : 'ltr';
}

// Default messages loader
export async function loadMessages(locale: SupportedLocale): Promise<Record<string, string>> {
  try {
    // In a real implementation, this would dynamically import message files
    // For now, return basic English messages as fallback
    const fallbackMessages = {
      'app.title': 'CodeForge',
      'app.welcome': 'Welcome to CodeForge',
      'nav.dashboard': 'Dashboard',
      'nav.projects': 'Projects',
      'nav.models': 'AI Models',
      'nav.settings': 'Settings',
      'ai.completion.generating': 'Generating code...',
      'ai.completion.complete': 'Completion ready',
      'workspace.create': 'Create Workspace',
      'workspace.open': 'Open Project',
      'models.download': 'Download Model',
      'models.status.ready': 'Ready',
      'models.status.downloading': 'Downloading...',
    };
    return fallbackMessages;
  } catch (error) {
    console.warn(`Failed to load messages for locale ${locale}:`, error);
    return {};
  }
}

// Message extractor for development
export function extractMessages(messages: Record<string, ICUMessage>): Record<string, string> {
  const extracted: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(messages)) {
    extracted[value.id] = value.defaultMessage;
  }
  
  return extracted;
}

export default {
  LocaleProvider,
  useLocale,
  useTranslation,
  MessageFormatter,
  LocaleDetector,
  SUPPORTED_LOCALES,
  RTL_LOCALES,
  loadMessages,
  extractMessages,
  getLocaleDisplayName,
  getLanguageFromLocale,
  isRTLLocale,
  getTextDirection,
}; 