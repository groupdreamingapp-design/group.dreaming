'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { calculateCuotaPromedio } from '@/lib/data';
import { Loader2, Database, Trash2, PlusCircle, Settings2 } from 'lucide-react';

// Schema update to include new breakdown
const formSchema = z.object({
    templateId: z.string().optional(), // To track which template was selected
    name: z.string().min(2, "El nombre es requerido"),
    capital: z.coerce.number().min(100, "Capital mínimo 100 USD"),
    plazo: z.coerce.number().min(12, "Plazo mínimo 12 meses"),
    raffleAdjudications: z.coerce.number().min(0, "Mínimo 0"),
    auctionAdjudications: z.coerce.number().min(0, "Mínimo 0"),
    purposeCode: z.string().min(1, "Requerido"), // We can store the purpose TEXT here
    imageUrl: z.string(),
    autoRenew: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

type Template = {
    id: string;
    name: string;
    purpose: string;
    capital: number;
    plazo: number;
    raffleAdjudications: number;
    auctionAdjudications: number;
    imageUrl: string;
};

export default function SeedPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);
    const { toast } = useToast();

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            capital: 0,
            plazo: 0,
            raffleAdjudications: 1,
            auctionAdjudications: 0,
            purposeCode: "",
            imageUrl: "",
            autoRenew: false
        }
    });

    // 1. Fetch Dynamic Templates
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'group_templates'), (snapshot) => {
            const temps: Template[] = [];
            snapshot.forEach((doc) => temps.push({ id: doc.id, ...doc.data() } as Template));
            setTemplates(temps);
        });
        return () => unsubscribe();
    }, []);

    // 2. Handle Template Selection
    const handleTemplateChange = (templateId: string) => {
        const selected = templates.find(t => t.id === templateId);
        if (selected) {
            setValue('templateId', selected.id);
            setValue('name', selected.name); // Pre-fill name, user can edit
            setValue('purposeCode', selected.purpose); // Store text description as purpose
            setValue('capital', selected.capital);
            setValue('plazo', selected.plazo);
            setValue('raffleAdjudications', selected.raffleAdjudications);
            setValue('auctionAdjudications', selected.auctionAdjudications);
            setValue('imageUrl', selected.imageUrl);
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm("⚠️ ¿Estás seguro? Se intentará eliminar TODOS los grupos vacíos.")) return;

        setIsDeleting(true);
        try {
            const querySnapshot = await getDocs(collection(db, "groups"));

            let deletedCount = 0;
            let skippedCount = 0;
            const deletePromises: Promise<void>[] = [];

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.membersCount && data.membersCount > 0) {
                    skippedCount++;
                } else {
                    deletePromises.push(deleteDoc(doc(db, "groups", docSnap.id)));
                    deletedCount++;
                }
            });

            await Promise.all(deletePromises);

            toast({
                title: "Limpieza finalizada",
                description: `Eliminados: ${deletedCount}. Protegidos: ${skippedCount}.`,
            });

        } catch (error: any) {
            console.error("Error deleting groups:", error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        try {
            // Logic for total members: usually equal to Plazo * (Adjudications per month).
            // Example: 60 months, 2 winners/month => 120 members needed.
            const adjudicationsTotal = data.raffleAdjudications + data.auctionAdjudications;
            if (adjudicationsTotal === 0) {
                throw new Error("Debe haber al menos 1 adjudicación por mes (Sorteo o Licitación)");
            }

            const totalMembers = data.plazo * adjudicationsTotal;

            const groupData = {
                name: data.name,
                capital: data.capital,
                plazo: data.plazo,
                raffleAdjudications: data.raffleAdjudications, // NEW
                auctionAdjudications: data.auctionAdjudications, // NEW
                adjudicationsPerMonth: adjudicationsTotal, // Legacy support
                purposeCode: "DYNAMIC", // Flag
                purposeDescription: data.purposeCode, // The actual text description
                imageUrl: data.imageUrl,
                imageHint: "custom",
                cuotaPromedio: calculateCuotaPromedio(data.capital, data.plazo),
                totalMembers: totalMembers,
                membersCount: 0,
                status: 'Abierto',
                userIsMember: false,
                userAwardStatus: "No Adjudicado",
                monthsCompleted: 0,
                acquiredInAuction: false,
                autoRenew: data.autoRenew,
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'groups'), groupData);

            toast({
                title: "Grupo Creado Exitosamente",
                description: `Se creó "${data.name}" con ${totalMembers} cupos.`,
                className: "bg-green-100 border-green-500 text-green-700"
            });

        } catch (error: any) {
            console.error("Error creating group:", error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Settings2 className="h-8 w-8 text-primary" />
                        Creador de Grupos
                    </h1>
                    <p className="text-muted-foreground">Carga desde plantilla o crea a medida.</p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAll} disabled={isDeleting || isLoading}>
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Limpiar Vacíos
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Configurar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 p-4 bg-slate-50 border rounded-lg">
                            <Label className="mb-2 block">Cargar Plantilla Preestablecida</Label>
                            <Select onValueChange={handleTemplateChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un modelo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name} (USD {t.capital})</SelectItem>
                                    ))}
                                    {templates.length === 0 && <SelectItem value="none" disabled>No hay plantillas creadas</SelectItem>}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                                Gestiona estas opciones en <a href="/panel/admin/templates" className="underline">Plantillas</a>
                            </p>
                        </div>

                        <form id="create-group-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre del Grupo</Label>
                                <Input id="name" {...register('name')} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="capital">Capital (USD)</Label>
                                    <Input id="capital" type="number" {...register('capital')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="plazo">Plazo (Meses)</Label>
                                    <Input id="plazo" type="number" {...register('plazo')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="raffle">Ganadores Sorteo/Mes</Label>
                                    <Input id="raffle" type="number" {...register('raffleAdjudications')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="auction">Ganadores Licitación/Mes</Label>
                                    <Input id="auction" type="number" {...register('auctionAdjudications')} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="purpose">Propósito / Descripción</Label>
                                <Input id="purpose" {...register('purposeCode')} placeholder="Ej: Comprar moto" />
                            </div>

                            <div className="flex items-center space-x-4 rounded-md border p-4 bg-muted/50">
                                <Switch
                                    id="auto-renew"
                                    checked={watch('autoRenew')}
                                    onCheckedChange={(val) => setValue('autoRenew', val)}
                                />
                                <div className="flex-1 space-y-1">
                                    <Label htmlFor="auto-renew" className="font-medium">Auto-Renovación</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Crear copia al llenarse.
                                    </p>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-6">
                        <div className="text-xs text-muted-foreground">
                            Cuota: <span className="font-bold text-primary">${calculateCuotaPromedio(watch('capital'), watch('plazo')).toFixed(2)}</span>
                        </div>
                        <Button type="submit" form="create-group-form" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                            Crear
                        </Button>
                    </CardFooter>
                </Card>

                {/* Preview Card */}
                <Card className="bg-muted/30 border-dashed h-fit">
                    <CardHeader>
                        <CardTitle className="text-sm">Vista Previa</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        {watch('imageUrl') && (
                            <img src={watch('imageUrl')} alt="Cover" className="w-full h-32 object-cover rounded-md mb-2" />
                        )}
                        <div>
                            <span className="font-semibold block">Adjudicaciones Mensuales:</span>
                            {watch('raffleAdjudications') + watch('auctionAdjudications')} ganadores
                        </div>
                        <div>
                            <span className="font-semibold block">Total Miembros:</span>
                            {(watch('plazo') * (watch('raffleAdjudications') + watch('auctionAdjudications')))} personas
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
