import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';

export type Locale = 'en' | 'fr';

export function useLocale() {
    // @ts-expect-error: typage inertia complexe
    const user = usePage().props.auth?.user;
    
    const [locale, setLocale] = useState<Locale>(
        // Utiliser la locale de l'utilisateur si disponible, sinon 'en'
        (user?.locale as Locale) || 
        // Fallback sur l'attribut HTML lang (défini par Laravel)
        (document.documentElement.lang as Locale) || 
        'en'
    );

    const updateLocale = (newLocale: Locale) => {
        // Mettre à jour l'état local
        setLocale(newLocale);
        
        // Envoyer la mise à jour au serveur
        axios.post(route('settings.locale.update'), { locale: newLocale })
            .then(() => {
                // Rafraîchir la page pour mettre à jour les traductions
                router.reload();
            });
    };

    return { locale, updateLocale };
} 