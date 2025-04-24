import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';

export type Locale = 'en' | 'fr';

export function useLocale() {
    const [locale, setLocale] = useState<Locale>(() => {
        // Check localStorage first
        const savedLocale = localStorage.getItem('locale') as Locale;
        
        // If not in localStorage, use the html lang attribute which will be set by Laravel
        return savedLocale || (document.documentElement.lang as Locale) || 'en';
    });

    useEffect(() => {
        // Update the document lang attribute when locale changes
        document.documentElement.lang = locale;
        localStorage.setItem('locale', locale);
        
        // Send the locale to the server
        axios.post(route('settings.locale.update'), { locale }, {
            headers: { 'Accept-Language': locale }
        });
    }, [locale]);

    const updateLocale = (newLocale: Locale) => {
        setLocale(newLocale);
        
        // Add the locale to all subsequent requests
        axios.defaults.headers.common['Accept-Language'] = newLocale;
        
        // Refresh the current page to update translations
        router.reload();
    };

    return { locale, updateLocale };
} 