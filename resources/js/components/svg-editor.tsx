import { useRef, useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface SvgEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function SvgEditor({ value, onChange }: SvgEditorProps) {
    const [currentTab, setCurrentTab] = useState<string>("code");
    const [error, setError] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    // Fonction pour valider que la chaîne est un SVG valide
    const validateSvg = (svg: string): boolean => {
        if (!svg?.trim()) return true; // Une chaîne vide est valide
        
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(svg, 'image/svg+xml');
            const errorNode = doc.querySelector('parsererror');
            if (errorNode) {
                setError("SVG invalide: vérifiez votre code");
                return false;
            }
            
            // Vérifier que la racine est un élément svg
            const rootElement = doc.documentElement;
            if (rootElement.tagName.toLowerCase() !== 'svg') {
                setError("Le document doit avoir un élément racine <svg>");
                return false;
            }
            
            setError(null);
            return true;
        } catch {
            setError("Erreur lors de l'analyse du SVG");
            return false;
        }
    };

    // Fonction pour ajouter les classes h-full et w-full au SVG
    const addClassesToSvg = (svg: string): string => {
        if (!svg?.trim()) return svg;
        
        try {
            // Créer un DOM temporaire pour manipuler le SVG
            const parser = new DOMParser();
            const doc = parser.parseFromString(svg, 'image/svg+xml');
            
            // Vérifier s'il y a une erreur ou si ce n'est pas un SVG valide
            const errorNode = doc.querySelector('parsererror');
            if (errorNode || doc.documentElement.tagName.toLowerCase() !== 'svg') {
                return svg;
            }
            
            // Ajouter les classes au SVG root
            const svgElement = doc.documentElement;
            svgElement.classList.add('h-full', 'w-full');
            
            // Convertir le document modifié en chaîne
            const serializer = new XMLSerializer();
            return serializer.serializeToString(doc);
        } catch {
            // En cas d'erreur, retourner le SVG original
            return svg;
        }
    };

    // Fonction pour mettre à jour la prévisualisation
    const updatePreview = () => {
        if (!previewRef.current) return;
        
        if (!value?.trim()) {
            previewRef.current.innerHTML = '';
            return;
        }
        
        // Toujours tenter d'afficher le SVG, même s'il est invalide
        try {
            // Tenter d'ajouter les classes si c'est un SVG valide
            const modifiedSvg = addClassesToSvg(value);
            previewRef.current.innerHTML = modifiedSvg;
        } catch {
            // En cas d'erreur, afficher le contenu brut
            previewRef.current.innerHTML = value;
        }
    };

    const handleChange = (newValue: string) => {
        // On met à jour la valeur même si invalide pour permettre à l'utilisateur de corriger
        onChange(newValue);
        
        if (validateSvg(newValue)) {
            // Modifier le SVG avant de le sauvegarder si valide
            const modifiedSvg = addClassesToSvg(newValue);
            onChange(modifiedSvg);
        }

        // Si on est en mode prévisualisation, mettre à jour immédiatement
        if (currentTab === 'preview') {
            setTimeout(() => updatePreview(), 0);
        }
    };

    // Déclencher la mise à jour de la prévisualisation lors du changement d'onglet
    useEffect(() => {
        if (currentTab === 'preview') {
            setTimeout(() => updatePreview(), 0);
        }
    }, [currentTab]);

    // Prévisualisation lors du changement de la valeur
    useEffect(() => {
        if (currentTab === 'preview') {
            updatePreview();
        }
    }, [value]);

    // Prévisualisation initiale au montage du composant
    useEffect(() => {
        // Force la mise à jour de la prévisualisation lors du montage initial
        if (previewRef.current && value?.trim()) {
            setTimeout(() => updatePreview(), 0);
        }
    }, []);

    return (
        <div className="space-y-4 pb-6">
            <div className="flex flex-col space-y-2">
                <Label htmlFor="svg-editor">Logo SVG</Label>
                
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                    <TabsList className="mb-2">
                        <TabsTrigger value="code">Code SVG</TabsTrigger>
                        <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="code" className="space-y-4">
                        <Textarea
                            id="svg-editor"
                            value={value || ''}
                            onChange={(e) => handleChange(e.target.value)}
                            className="font-mono min-h-[200px]"
                            placeholder='<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">...</svg>'
                        />
                        
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription className="flex items-center">
                                    <Info className="h-4 w-4 mr-2" />
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="text-sm text-neutral-500">
                            Collez le code SVG de votre logo. Assurez-vous qu'il s'agit d'un SVG valide.
                            <br />
                            <span className="text-xs text-neutral-400">Les classes "h-full" et "w-full" seront automatiquement ajoutées au SVG.</span>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="preview" className="min-h-[200px] p-4 border rounded-md flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
                        <div ref={previewRef} className="w-full h-full flex items-center justify-center min-h-[150px]"></div>
                        {!value?.trim() && <div className="text-neutral-400">Pas de logo défini</div>}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
} 