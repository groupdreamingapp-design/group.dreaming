'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations, Language } from '@/lib/i18n';
import { useUser } from '@/firebase';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'group-dreaming-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('es'); // Default to Spanish
    const [isInitialized, setIsInitialized] = useState(false);
    const { user } = useUser();

    // Load from LocalStorage on mount
    useEffect(() => {
        const savedLang = localStorage.getItem(LOCAL_STORAGE_KEY) as Language;
        if (savedLang && ['es', 'en'].includes(savedLang)) {
            setLanguageState(savedLang);
        }
        setIsInitialized(true);
    }, []);

    // Load from Firestore when user logs in
    useEffect(() => {
        if (!user) return;

        const fetchUserPreference = async () => {
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data.language && ['es', 'en'].includes(data.language)) {
                        setLanguageState(data.language as Language);
                        localStorage.setItem(LOCAL_STORAGE_KEY, data.language);
                    }
                }
            } catch (error) {
                console.error("Error fetching language preference:", error);
            }
        };

        fetchUserPreference();
    }, [user]);

    const setLanguage = useCallback(async (newLang: Language) => {
        setLanguageState(newLang);
        localStorage.setItem(LOCAL_STORAGE_KEY, newLang);

        if (user) {
            try {
                const userDocRef = doc(db, 'users', user.uid);
                await setDoc(userDocRef, { language: newLang }, { merge: true });
            } catch (error) {
                console.error("Error saving language preference:", error);
            }
        }
    }, [user]);

    const t = useCallback((path: string): string => {
        const keys = path.split('.');
        let current: any = translations[language];

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation key not found: ${path} for language ${language}`);
                return path;
            }
            current = current[key];
        }

        return current as string;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
