
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { ArrowRight, Building, Car, Handshake, Lightbulb, PieChart, Search, Sparkles, Store, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

const profileSchema = z.object({
  hasDefinedGoal: z.enum(['yes', 'no'], { required_error: 'Debes seleccionar una opción.' }),
  goalDescription: z.string().optional(),
  interests: z.object({
    vehicles: z.boolean().default(false),
    realEstate: z.boolean().default(false),
    furniture: z.boolean().default(false),
    ventures: z.boolean().default(false),
    businessFunds: z.boolean().default(false),
    other: z.boolean().default(false),
  }).optional(),
  otherInterest: z.string().optional(),
}).refine(data => {
    if (data.hasDefinedGoal === 'no') {
        return Object.values(data.interests || {}).some(val => val === true);
    }
    return true;
}, { message: 'Selecciona al menos un área de interés.', path: ['interests'] })
.refine(data => {
    if (data.interests?.other) {
        return !!data.otherInterest && data.otherInterest.length > 0;
    }
    return true;
}, { message: 'Por favor, especifica tu otro interés.', path: ['otherInterest'] });


type ProfileForm = z.infer<typeof profileSchema>;

const interestOptions = [
    { id: 'vehicles', label: 'Vehículos', icon: Car },
    { id: 'realEstate', label: 'Inmuebles', icon: Building },
    { id: 'furniture', label: 'Mobiliario', icon: Sparkles },
    { id: 'ventures', label: 'Emprendimientos', icon: Lightbulb },
    { id: 'businessFunds', label: 'Fondos de Comercio', icon: Store },
] as const;

export default function ProfileSetupPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { toast } = useToast();
    const { control, handleSubmit, watch, formState: { errors } } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema)
    });
    
    const hasDefinedGoal = watch('hasDefinedGoal');
    const interests = watch('interests');

    const onSubmit = (data: ProfileForm) => {
        console.log(data);
        toast({
            title: "¡Perfil guardado!",
            description: "Tus preferencias han sido guardadas correctamente.",
        });
        setIsSubmitted(true);
    };

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Card>
                {isSubmitted ? (
                     <CardContent className="p-10 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold mb-2">¡Gracias por completar tu perfil!</h2>
                        <p className="text-muted-foreground mb-8">
                            Tu viaje con Group Dreaming acaba de comenzar. Explora las herramientas que hemos creado para ayudarte a alcanzar tus metas.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button asChild>
                                <Link href="/dashboard/explore">
                                    <Search className="mr-2 h-4 w-4" /> Explorar Grupos
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/dashboard/transparency">
                                    <PieChart className="mr-2 h-4 w-4" /> Ver Transparencia
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                ) : (
                    <>
                        <CardHeader>
                            <CardTitle className="text-2xl">¡Bienvenido a Group Dreaming!</CardTitle>
                            <CardDescription>
                                Ayúdanos a conocerte mejor. Esta información nos permitirá buscar beneficios y convenios que se ajusten a tus intereses.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-base font-semibold">¿El capital que deseas suscribir tiene un fin definido?</Label>
                                    <Controller
                                        name="hasDefinedGoal"
                                        control={control}
                                        render={({ field }) => (
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-6">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id="goal-yes" />
                                                    <Label htmlFor="goal-yes" className="font-normal">Sí</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id="goal-no" />
                                                    <Label htmlFor="goal-no" className="font-normal">No, estoy explorando</Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                    {errors.hasDefinedGoal && <p className="text-red-500 text-xs">{errors.hasDefinedGoal.message}</p>}
                                </div>
                                
                                {hasDefinedGoal && (
                                    <div className="space-y-8 animate-in fade-in-50">
                                      <div className="space-y-6">
                                          <div>
                                            <Label className="font-semibold">¿Sobre qué categorías te gustaría recibir propuestas o beneficios?</Label>
                                            <p className="text-sm text-muted-foreground">Puedes marcar varias opciones. Esto nos ayudará a encontrar convenios para ti.</p>
                                          </div>
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                              {interestOptions.map((item) => (
                                                   <Controller
                                                      key={item.id}
                                                      name={`interests.${item.id}`}
                                                      control={control}
                                                      render={({ field }) => (
                                                          <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                                              <Checkbox 
                                                                id={`interest-${item.id}`} 
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                              />
                                                              <Label htmlFor={`interest-${item.id}`} className="font-medium w-full flex items-center gap-2 cursor-pointer">
                                                                  <item.icon className="h-5 w-5" />
                                                                  {item.label}
                                                              </Label>
                                                          </div>
                                                      )}
                                                  />
                                              ))}
                                              <Controller
                                                    name="interests.other"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                                                            <Checkbox 
                                                              id="interest-other" 
                                                              checked={field.value}
                                                              onCheckedChange={field.onChange}
                                                            />
                                                            <Label htmlFor="interest-other" className="font-medium w-full flex items-center gap-2 cursor-pointer">
                                                                <Handshake className="h-5 w-5" />
                                                                Otros
                                                            </Label>
                                                        </div>
                                                    )}
                                                />
                                          </div>
                                          {errors.interests && <Alert variant="destructive" className="mt-4"><AlertDescription>{errors.interests.message}</AlertDescription></Alert>}

                                          {interests?.other && (
                                            <div className="space-y-2 animate-in fade-in-50">
                                              <Label htmlFor="other-interest">Por favor, especifica tu otro interés</Label>
                                              <Controller
                                                name="otherInterest"
                                                control={control}
                                                render={({field}) => <Input id="other-interest" {...field} />}
                                              />
                                              {errors.otherInterest && <p className="text-red-500 text-xs">{errors.otherInterest.message}</p>}
                                            </div>
                                          )}
                                      </div>

                                      {hasDefinedGoal === 'yes' && (
                                          <div className="space-y-2">
                                              <Label htmlFor="goal-description" className="font-semibold">Describe tu objetivo (Opcional)</Label>
                                              <p className="text-sm text-muted-foreground">Ej: "Comprar un auto familiar", "Adelanto para mi primera casa", "Invertir en maquinaria para mi taller".</p>
                                              <Controller
                                                  name="goalDescription"
                                                  control={control}
                                                  render={({ field }) => <Textarea id="goal-description" rows={4} {...field} />}
                                              />
                                              {errors.goalDescription && <p className="text-red-500 text-xs">{errors.goalDescription.message}</p>}
                                          </div>
                                      )}
                                    </div>
                                )}
                                
                                {hasDefinedGoal && (
                                    <div className="flex justify-end pt-4">
                                        <Button type="submit">
                                            Guardar y Continuar <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                            </form>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}
