'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings2, Sparkles, Image as ImageIcon, Wand2 } from 'lucide-react';
import { useGroupPreferences } from '@/hooks/use-group-preferences';
import { generateMotivationalDescription } from '@/lib/ai-generator';
import { useToast } from '@/hooks/use-toast';

interface PersonalizeGroupDialogProps {
    groupId: string;
    defaultName: string;
    trigger?: React.ReactNode;
}

export function PersonalizeGroupDialog({ groupId, defaultName, trigger }: PersonalizeGroupDialogProps) {
    const { preferences, savePreferences } = useGroupPreferences(groupId);
    const [customName, setCustomName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (preferences) {
            setCustomName(preferences.customName || defaultName);
            setImageUrl(preferences.customImageUrl || '');
            setDescription(preferences.motivationalDescription || '');
        } else {
            setCustomName(defaultName);
        }
    }, [preferences, defaultName]);

    const handleGenerateDescription = () => {
        if (!customName) return;
        const desc = generateMotivationalDescription(customName);
        setDescription(desc);
        toast({
            title: "¡Descripción Generada!",
            description: "La IA ha creado una frase motivadora para tu objetivo.",
            className: "bg-purple-100 border-purple-500 text-purple-700"
        });
    };

    const handleSave = async () => {
        await savePreferences({
            customName,
            customImageUrl: imageUrl,
            motivationalDescription: description
        });
        setIsOpen(false);
        toast({
            title: "Cambios guardados",
            description: "Tu tarjeta ha sido personalizada.",
        });
    };

    // Handle local file selection and convert to Base64 (simple solution for now)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit for Firestore document size safety
                toast({ title: "Error", description: "La imagen es muy pesada. Máximo 1MB.", variant: "destructive" });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20">
                        <Settings2 className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Personalizar mi Objetivo</DialogTitle>
                    <DialogDescription>
                        Dale un toque personal a este grupo para mantenerte motivado.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="c-name">Nombre de tu Meta</Label>
                        <div className="flex gap-2">
                            <Input
                                id="c-name"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                placeholder="Ej: Mi Casa Propia"
                            />
                            <Button size="icon" variant="outline" onClick={handleGenerateDescription} title="Generar Descripción con IA">
                                <Wand2 className="h-4 w-4 text-purple-600" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Imagen de Portada</Label>
                        {imageUrl && (
                            <div className="relative w-full h-32 rounded-md overflow-hidden mb-2 border">
                                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                                    onClick={() => setImageUrl('')}
                                >
                                    &times;
                                </Button>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="w-full relative">
                                <ImageIcon className="mr-2 h-4 w-4" />
                                Subir Imagen (PC)
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="c-desc">Descripción Motivadora</Label>
                        <Textarea
                            id="c-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Escribe algo que te inspire..."
                            className="h-24"
                        />
                        {description && (
                            <div className="flex items-start gap-2 text-xs text-purple-600 bg-purple-50 p-2 rounded">
                                <Sparkles className="h-3 w-3 mt-0.5" />
                                <p>¡Visualiza tu meta cada vez que veas esta tarjeta!</p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Guardar Cambios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
