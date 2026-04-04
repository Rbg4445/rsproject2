import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { getGlobalSettings, updateGlobalSettings as updateFS } from '../firebase/firestoreService';

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
  chatEnabled: boolean;
  maintenanceMode: boolean;
}

export interface SiteSettingsContextType {
  settings: SiteSettings;
  updateSettings: (updates: Partial<SiteSettings>) => void;
  resetSettings: () => void;
  isLoaded: boolean;
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
  chatEnabled: true,
  maintenanceMode: false,
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

const LS_SETTINGS_KEY = 'pa_site_settings';

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    // 1. Önce LocalStorage'dan yükle (Hızlı başlangıç)
    const saved = localStorage.getItem(LS_SETTINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Local settings load error:", e);
      }
    }

    if (!isFirebaseConfigured || !db) {
       setIsLoaded(true);
       return;
    }
    
    // 2. Firestore'dan canlı veriyi yakala (Gerçek kaynak)
    console.log("🔗 Connecting to global site settings...");
    const unsubscribe = onSnapshot(doc(db, 'system', 'settings'), (snapshot) => {
      if (snapshot.exists()) {
         const data = snapshot.data() as SiteSettings;
         console.log("✅ Site settings synced with cloud:", data);
         setSettings(prev => {
            const next = { ...prev, ...data };
            localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(next));
            return next;
         });
      } else {
         console.warn("⚠️ No global settings found in Firestore.");
      }
      setIsLoaded(true);
    }, (error) => {
      console.error("❌ Firestore Sync Error:", error);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      settings,
      isLoaded,
      updateSettings: (updates: Partial<SiteSettings>) => {
        setSettings((prev) => {
          const next = { ...prev, ...updates };
          updateFS(next);
          localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(next));
          return next;
        });
      },
      resetSettings: () => {
        setSettings(defaultSettings);
        updateFS(defaultSettings);
        localStorage.removeItem(LS_SETTINGS_KEY);
      },
    }),
    [settings, isLoaded]
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
