
'use client';

import { useState, useRef, ChangeEvent } from "react";
import { user, savingsGoal as initialSavingsGoal, transactions } from "@/lib/data"
import type { SavingsGoal } from "@/lib/types";
import { StatCard } from "@/components/app/stat-card"
import { DollarSign, Edit, Repeat, Users, Wallet } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import { DailyEncouragement } from "@/components/app/daily-encouragement"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";


const goalFormSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  targetAmount: z.coerce.number().positive({ message: "El monto debe ser mayor a 0." }),
  imageId: z.string().optional(),
  customImage: z.any().optional(),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

export default function DashboardPage() {
  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal>(initialSavingsGoal);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const progress = (savingsGoal.currentAmount / savingsGoal.targetAmount) * 100;
  
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: savingsGoal.name,
      targetAmount: savingsGoal.targetAmount,
      imageId: PlaceHolderImages.find(img => img.imageUrl === savingsGoal.imageUrl)?.id || 'goal-car',
    },
  });
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue('imageId', undefined); // Deselect dropdown
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: GoalFormValues) => {
    let newImageUrl = savingsGoal.imageUrl;
    let newImageHint = savingsGoal.imageHint;

    if (imagePreview) {
      newImageUrl = imagePreview;
      newImageHint = "custom goal image";
    } else if (data.imageId) {
      const selectedImage = PlaceHolderImages.find(img => img.id === data.imageId);
      if (selectedImage) {
        newImageUrl = selectedImage.imageUrl;
        newImageHint = selectedImage.imageHint;
      }
    }
    
    setSavingsGoal(prev => ({
      ...prev,
      name: data.name,
      targetAmount: data.targetAmount,
      imageUrl: newImageUrl,
      imageHint: newImageHint,
    }));
    
    toast({
      title: "¡Meta actualizada!",
      description: "Tu meta principal ha sido modificada con éxito.",
    });
    setIsDialogOpen(false);
    setImagePreview(null);
    form.reset({
      name: data.name,
      targetAmount: data.targetAmount,
      imageId: data.imageId,
    });
  };

  const goalImages = PlaceHolderImages.filter(img => img.id.startsWith('goal-'));

  return (
    <>
      <h1 className="text-3xl font-bold font-headline">Hola, {user.name.split(' ')[0]}!</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Saldo Disponible" value={formatCurrency(4835)} icon={Wallet} description="+20% que el mes pasado" />
        <StatCard title="Próxima Cuota" value={formatCurrency(615)} icon={Repeat} description="Vence en 15 días" />
        <StatCard title="Grupos Activos" value="3" icon={Users} description="1 adjudicado" />
        <StatCard title="Total Ahorrado" value={formatCurrency(savingsGoal.currentAmount)} icon={DollarSign} description="Hacia tu meta" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Últimos Movimientos</CardTitle>
            <CardDescription>Tus transacciones más recientes en la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div className="font-medium">{tx.description}</div>
                      <div className="text-sm text-muted-foreground md:hidden">{tx.date}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline">{tx.type}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{tx.date}</TableCell>
                    <TableCell className={cn("text-right", tx.amount > 0 ? "text-green-600" : "text-red-600")}>
                      {formatCurrency(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="lg:col-span-3 space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                    <Image
                        src={savingsGoal.imageUrl}
                        alt={savingsGoal.name}
                        fill
                        className="object-cover"
                        data-ai-hint={savingsGoal.imageHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute top-2 right-2">
                        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
                          setIsDialogOpen(isOpen);
                          if (!isOpen) {
                            setImagePreview(null);
                            form.reset();
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Meta Principal</DialogTitle>
                              <DialogDescription>
                                Actualiza tu objetivo de ahorro para que se ajuste a tus nuevos sueños.
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Nombre de la meta</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Ej: Viaje a Europa" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="targetAmount"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Monto Objetivo (USD)</FormLabel>
                                      <FormControl>
                                        <Input type="number" placeholder="Ej: 15000" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormLabel>Imagen representativa</FormLabel>
                                
                                <FormField
                                  control={form.control}
                                  name="imageId"
                                  render={({ field }) => (
                                    <FormItem>
                                      <Select onValueChange={(value) => {
                                        field.onChange(value);
                                        setImagePreview(null);
                                        if (fileInputRef.current) {
                                          fileInputRef.current.value = "";
                                        }
                                      }} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una imagen predefinida" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {goalImages.map(img => (
                                            <SelectItem key={img.id} value={img.id}>{img.description}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <div className="flex items-center justify-center">
                                  <Separator className="flex-1" />
                                  <span className="px-4 text-sm text-muted-foreground">O</span>
                                  <Separator className="flex-1" />
                                </div>
                                
                                <FormField
                                  control={form.control}
                                  name="customImage"
                                  render={() => (
                                    <FormItem>
                                      <FormLabel>Sube tu propia imagen</FormLabel>
                                      <FormControl>
                                        <Input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {imagePreview && (
                                  <div className="relative w-full h-40 rounded-md overflow-hidden border">
                                    <Image src={imagePreview} alt="Vista previa de la meta" layout="fill" objectFit="cover" />
                                  </div>
                                )}

                                <Button type="submit">Guardar Cambios</Button>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                    </div>
                    <div className="absolute bottom-0 left-0 p-4">
                        <CardTitle className="text-2xl font-bold text-white">{savingsGoal.name}</CardTitle>
                        <CardDescription className="text-sm text-white/90">Tu Meta Principal</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-muted-foreground text-sm">Progreso</span>
                    <span className="font-bold text-lg">{formatCurrency(savingsGoal.currentAmount)} <span className="text-sm font-normal text-muted-foreground">de {formatCurrency(savingsGoal.targetAmount)}</span></span>
                </div>
                <Progress value={progress} aria-label={`${progress.toFixed(0)}% completado`} />
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <p className="text-xs text-muted-foreground">{progress.toFixed(0)}% del camino recorrido. ¡Sigue así!</p>
            </CardFooter>
          </Card>
          <DailyEncouragement goal={savingsGoal} />
        </div>
      </div>
    </>
  
    