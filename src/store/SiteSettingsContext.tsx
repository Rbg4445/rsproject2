import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface SiteSettings {
  brandName: string;
  brandSubline: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  betaLine: string;
  aboutTitle: string;
  aboutDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
  githubUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  footerNote: string;
}

const defaultSettings: SiteSettings = {
  brandName: 'ProjeAkademi',
  brandSubline: 'Egitim & Kodlama',
  heroBadge: 'Egitim & Kodlama Platformu',
  heroTitle: 'Projelerimi Kesfet & Ogren',
  heroSubtitle:
    'Egitim, kodlama ve akademik projelerimi bir arada bulabileceginiz, toplulukla paylasabileceginiz modern platform.',
  betaLine: 'Bu bir BETA surumudur • Samo Kral ile yapilmistir',
  aboutTitle: 'Merhaba, Ben Samo Kral',
  aboutDescription:
    'Yazilim gelistirme, egitim icerigi uretme ve akademik arastirma alanlarinda aktif calisan bir gelistiriciyim.',
  contactEmail: 'samo@projeakademi.com',
  contactPhone: '+90 (555) 000 0000',
  contactLocation: 'Istanbul, Turkiye',
  githubUrl: '#',
  twitterUrl: '#',
  linkedinUrl: '#',
  youtubeUrl: '#',
  footerNote: 'Samo Kral ile yapilmistir',
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  updateSettings: (updates: Partial<SiteSettings>) => void;
  resetSettings: () => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

const LS_SETTINGS_KEY = 'pa_site_settings';

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(LS_SETTINGS_KEY);
      if (!saved) return defaultSettings;
      return { ...defaultSettings, ...(JSON.parse(saved) as Partial<SiteSettings>) };
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const value = useMemo(
    () => ({
      settings,
      updateSettings: (updates: Partial<SiteSettings>) => setSettings((prev) => ({ ...prev, ...updates })),
      resetSettings: () => setSettings(defaultSettings),
    }),
    [settings]
  );

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    throw new Error('useSiteSettings must be used inside SiteSettingsProvider');
  }
  return ctx;
}
