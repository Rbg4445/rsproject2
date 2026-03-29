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
  brandSubline: 'Proje Odaklı Portföy',
  heroBadge: 'Proje Paylaşım ve Geliştirme Platformu',
  heroTitle: 'Projelerini Göster, Yeni Fikirler Üret',
  heroSubtitle:
    'Kişisel ve ekip projelerini tek bir yerde topladığın, sürecini dokümante edip toplulukla paylaştığın modern bir proje platformu.',
  betaLine: 'Bu bir beta sürümüdür',
  aboutTitle: 'Merhaba, ben bu projenin geliştiricisiyim',
  aboutDescription:
    'Bu platformu; yazılım, oyun, tasarım ve her türlü proje fikrini sergileyebileceğin, ilerlemeni kaydedebileceğin ve başkalarına ilham olabileceğin bir alan olarak tasarladım.',
  contactEmail: 'iletisim@projeakademi.com',
  contactPhone: '+90 (555) 000 0000',
  contactLocation: 'İstanbul, Türkiye',
  githubUrl: '#',
  twitterUrl: '#',
  linkedinUrl: '#',
  youtubeUrl: '#',
  footerNote: 'ProjeAkademi, projelerini sergileyebileceğin ve geliştirebileceğin topluluk odaklı bir platformdur.',
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
      const merged = { ...defaultSettings, ...(JSON.parse(saved) as Partial<SiteSettings>) };
      const sanitize = (value: string, fallback: string) => {
        const lower = value.toLowerCase();
        return lower.includes('samo') || lower.includes('kral') ? fallback : value;
      };

      return {
        ...merged,
        betaLine: sanitize(merged.betaLine, defaultSettings.betaLine),
        aboutTitle: sanitize(merged.aboutTitle, defaultSettings.aboutTitle),
        contactEmail: sanitize(merged.contactEmail, defaultSettings.contactEmail),
        footerNote: sanitize(merged.footerNote, defaultSettings.footerNote),
      };
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
