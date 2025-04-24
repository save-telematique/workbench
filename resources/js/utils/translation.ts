import { usePage } from '@inertiajs/react';

type TranslationParams = Record<string, string | number | null>;
type TranslationValue = string | Record<string, unknown>;
type TranslationsObject = Record<string, Record<string, TranslationValue>>;

/**
 * React hook to get the translation function.
 * Must be used within a React component.
 */
export function useTranslation() {
    const { props } = usePage();
    const translations = props.translations as TranslationsObject;
    
    /**
     * Get the translation for the given key.
     * This is similar to Laravel's __() function.
     * 
     * @param key The translation key (e.g. 'common.settings')
     * @param params Optional parameters to replace in the translation
     * @param fallback Fallback text if translation is not found
     * @returns The translated string
     */
    const __ = (key: string, params: TranslationParams = {}, fallback?: string): string => {
        if (!translations) {
            return fallback || key;
        }

        // Split the key into parts (e.g. 'common.settings' => ['common', 'settings'])
        const parts = key.split('.');
        
        if (parts.length < 2) {
            return fallback || key;
        }
        
        // Get the file and the actual key parts
        const [file, ...keyParts] = parts;
        
        // Check if the file exists
        if (!translations[file]) {
            return fallback || key;
        }
        
        // Get the translation
        let translation = getNestedTranslation(translations[file], keyParts);
        
        // Return the key or fallback if translation not found
        if (translation === undefined) {
            return fallback || key;
        }
        
        // Replace parameters
        if (params && Object.keys(params).length > 0) {
            translation = replaceParameters(translation, params);
        }
        
        return translation;
    };
    
    return { __ };
}

/**
 * Get a nested translation value
 */
function getNestedTranslation(obj: Record<string, TranslationValue>, keyParts: string[]): string | undefined {
    let current = obj;
    
    for (const part of keyParts) {
        if (current === undefined || typeof current !== 'object' || current[part] === undefined) {
            return undefined;
        }
        current = current[part] as Record<string, TranslationValue>;
    }
    
    return typeof current === 'string' ? current : undefined;
}

/**
 * Replace parameters in the translation string
 * Supports both :parameter and {parameter} syntax
 */
function replaceParameters(translation: string, params: TranslationParams): string {
    let result = translation;
    
    // Replace each parameter
    Object.entries(params).forEach(([key, value]) => {
        // Replace Laravel-style :parameter
        result = result.replace(new RegExp(`:${key}\\b`, 'g'), String(value));
        
        // Replace React-style {parameter}
        result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });
    
    return result;
} 