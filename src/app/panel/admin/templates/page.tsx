'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Loader2, Plus, Trash2, LayoutTemplate } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schema for the Template
const templateSchema = z.object({
    name: z.string().min(2, "El nombre es requerido"),
    purpose: z.string().min(2, "El propósito es requerido"),
    capital: z.coerce.number().min(100, "Capital mínimo 100"),
    plazo: z.coerce.number().min(1, "Plazo mínimo 1 mes"),
    raffleAdjudications: z.coerce.number().min(0, "Mínimo 0"),
    auctionAdjudications: z.coerce.number().min(0, "Mínimo 0"),
    imageUrl: z.string().url("Debe ser una URL válida"),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

type Template = TemplateFormValues & { id: string };

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<TemplateFormValues>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: "",
            purpose: "",
            capital: 1000,
            plazo: 60,
            raffleAdjudications: 1,
            auctionAdjudications: 0,
            imageUrl: PlaceHolderImages[0].imageUrl
        }
    });

    // Real-time subscription to templates
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'group_templates'), (snapshot) => {
            const temps: Template[] = [];
            snapshot.forEach((doc) => {
                temps.push({ id: doc.id, ...doc.data() } as Template);
            });
            setTemplates(temps);
        });
        return () => unsubscribe();
    }, []);

    const onSubmit = async (data: TemplateFormValues) => {
        setIsLoading(true);
        try {
            await addDoc(collection(db, 'group_templates'), data);
            toast({ title: "Plantilla creada", className: "bg-green-100 border-green-500 text-green-700" });
            reset();
        } catch (error: any) {
            console.error(error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta plantilla?")) return;
        try {
            await deleteDoc(doc(db, 'group_templates', id));
            toast({ title: "Plantilla eliminada" });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-5xl">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <LayoutTemplate className="h-8 w-8 text-primary" />
                Gestión de Plantillas
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario de Creación */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Nueva Plantilla</CardTitle>
                        <CardDescription>Define un modelo base para futuros grupos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre Modelo</Label>
                                <Input id="name" {...register('name')} placeholder="Ej: Plan Auto" />
                                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="purpose">Propósito / Descripción</Label>
                                <Input id="purpose" {...register('purpose')} placeholder="Ej: Para comprar tu primer 0km" />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label htmlFor="capital">Capital</Label>
                                    <Input id="capital" type="number" {...register('capital')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="plazo">Plazo (Meses)</Label>
                                    <Input id="plazo" type="number" {...register('plazo')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label htmlFor="raffle">Sorteo/Mes</Label>
                                    <Input id="raffle" type="number" {...register('raffleAdjudications')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="auction">Licitación/Mes</Label>
                                    <Input id="auction" type="number" {...register('auctionAdjudications')} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Imágen de Portada</Label>

                                {/* Upload Input */}
                                <div className="flex gap-2 items-center">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            try {
                                                // Dynamic import to avoid SSR issues if any, though here it's client comp
                                                const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
                                                const { storage } = await import("@/lib/firebase");

                                                setIsLoading(true);
                                                const storageRef = ref(storage, `template_covers/${Date.now()}_${file.name}`);
                                                await uploadBytes(storageRef, file);
                                                const url = await getDownloadURL(storageRef);

                                                setValue('imageUrl', url);
                                                toast({ title: "Imagen subida correctamete" });
                                            } catch (error: any) {
                                                console.error("Upload failed", error);
                                                toast({ title: "Error subiendo imagen", description: error.message, variant: "destructive" });
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }}
                                    />
                                </div>

                                <p className="text-xs text-muted-foreground">O selecciona una predeterminada:</p>
                                <Select onValueChange={(val) => setValue('imageUrl', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar de galería..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PlaceHolderImages.map((img) => (
                                            <SelectItem key={img.id} value={img.imageUrl}>
                                                {img.alt}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {watch('imageUrl') && (
                                    <div className="relative h-24 w-full rounded-md overflow-hidden border mt-2">
                                        <img src={watch('imageUrl')} alt="Preview" className="object-cover w-full h-full" />
                                    </div>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : <><Plus className="mr-2 h-4 w-4" /> Guardar Modelo</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Lista de Plantillas */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.length === 0 && (
                        <div className="col-span-full text-center text-gray-500 py-10">
                            No hay plantillas creadas.
                        </div>
                    )}
                    {templates.map((temp) => (
                        <Card key={temp.id} className="relative group hover:shadow-md transition-shadow">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                onClick={() => handleDelete(temp.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="h-32 relative bg-gray-100 rounded-t-lg overflow-hidden">
                                <img src={temp.imageUrl} alt={temp.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                    <div className="text-white">
                                        <h3 className="font-bold text-lg leading-none">{temp.name}</h3>
                                        <p className="text-xs opacity-90">{temp.purpose}</p>
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-4 text-sm grid grid-cols-2 gap-y-2">
                                <div>
                                    <span className="text-muted-foreground text-xs block">Capital</span>
                                    ${temp.capital.toLocaleString()}
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs block">Plazo</span>
                                    {temp.plazo} meses
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs block">Adjudicaciones</span>
                                    {temp.raffleAdjudications} S / {temp.auctionAdjudications} L
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
