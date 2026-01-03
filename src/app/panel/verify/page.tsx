
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, ShieldCheck, User, Building, Phone, Mail, FileUp, Camera, Repeat, Loader2, HeartHandshake, Info } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUserNav } from '@/components/app/user-nav';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const verificationSchema = z.object({
  // User data
  firstName: z.string().min(2, "El nombre es requerido"),
  lastName: z.string().min(2, "El apellido es requerido"),
  dni: z.string().regex(/^\d{7,8}$/, "DNI inválido"),
  cuit: z.string().regex(/^\d{11}$/, "CUIT/CUIL inválido"),
  birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
  
  // Contact data
  address: z.string().min(5, "La dirección es requerida"),
  city: z.string().min(2, "La ciudad es requerida"),
  province: z.string().min(2, "La provincia es requerida"),
  postalCode: z.string().min(4, "El código postal es requerido"),
  country: z.string().min(2, "El país es requerido"),
  phone: z.string().min(8, "El teléfono es requerido"),
  email: z.string().email("El correo electrónico no es válido"),

  // Beneficiary data (optional)
  beneficiaryFullName: z.string().optional(),
  beneficiaryDni: z.string().optional(),
  beneficiaryPhone: z.string().optional(),
  beneficiaryRelationship: z.string().optional(),
  
  // Financial data
  employmentStatus: z.string().min(1, "Selecciona una opción"),
  monthlyIncome: z.number().min(1, "Ingresa tu ingreso mensual"),
  pep: z.enum(['true', 'false']),
  fundsOrigin: z.boolean().refine(val => val === true, { message: "Debes aceptar la declaración de fondos" }),
  
  // Documents
  dniFront: z.any().refine(file => file.length > 0, 'El frente del DNI es requerido.'),
  dniBack: z.any().refine(file => file.length > 0, 'El dorso del DNI es requerido.'),
});

type VerificationForm = z.infer<typeof verificationSchema>;

export default function Verification() {
    const { isVerified, setIsVerified } = useUserNav();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // States for biometric check
    const [biometricStep, setBiometricStep] = useState<'idle' | 'capturing' | 'success' | 'failed'>('idle');
    const [hasCameraPermission, setHasCameraPermission] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);


    const { register, handleSubmit, control, formState: { errors } } = useForm<VerificationForm>({
        resolver: zodResolver(verificationSchema),
        defaultValues: {
            pep: 'false',
        },
    });

    const onSubmit = (data: VerificationForm) => {
        setIsSubmitting(true);
        console.log(data);
        
        // Simulate API call
        setTimeout(() => {
            setIsVerified(true);
            setIsSubmitting(false);
            toast({
                title: "¡Verificación Enviada!",
                description: "Tus datos han sido enviados y tu cuenta ha sido verificada.",
                className: "bg-green-100 border-green-500 text-green-700",
            });
            router.push('/panel');
        }, 2000);
    };

    const handleStartBiometric = async () => {
        setBiometricStep('capturing');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasCameraPermission(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            // Simulate capture and success
            setTimeout(() => {
                if (videoRef.current && videoRef.current.srcObject) {
                    const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                    tracks.forEach(track => track.stop());
                }
                setBiometricStep('success');
            }, 3000);
        } catch (error) {
            console.error("Error accessing camera: ", error);
            setHasCameraPermission(false);
            setBiometricStep('failed');
        }
    };
    
    const handleRetryBiometric = () => {
        setBiometricStep('idle');
        setHasCameraPermission(true);
    };

    if (isVerified) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h1 className="text-2xl font-bold">Tu cuenta ya está verificada</h1>
                <p className="text-muted-foreground max-w-md">
                    Ya completaste el proceso de verificación de identidad. No es necesario que lo hagas de nuevo. Ya puedes operar en la plataforma.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/panel">Volver al Panel</Link>
                </Button>
              </div>
        )
    }

    return (
      <TooltipProvider>
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
                <Button asChild variant="ghost" className="mb-2 -ml-4">
                  <Link href="/panel">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Panel
                  </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline">Verificación de Identidad (KYC)</h1>
                <p className="text-muted-foreground">
                    Completa tus datos para operar sin límites. Estos se usarán para confeccionar el contrato de adhesión y se toman como válidos bajo declaración jurada. Es un requisito legal para la seguridad de todos.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personal Data */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User className="text-primary" /> Datos Personales</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Nombres</Label>
                                <Input id="firstName" {...register("firstName")} />
                                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Apellidos</Label>
                                <Input id="lastName" {...register("lastName")} />
                                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dni">DNI</Label>
                                <Input id="dni" {...register("dni")} />
                                {errors.dni && <p className="text-red-500 text-xs">{errors.dni.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cuit">CUIT/CUIL</Label>
                                <Input id="cuit" {...register("cuit")} />
                                {errors.cuit && <p className="text-red-500 text-xs">{errors.cuit.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                                <Input id="birthDate" type="date" {...register("birthDate")} />
                                {errors.birthDate && <p className="text-red-500 text-xs">{errors.birthDate.message}</p>}
                            </div>
                        </CardContent>
                    </Card>

                     {/* Contact Data */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Mail className="text-primary" /> Datos de Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Domicilio (Calle y Número)</Label>
                                <Input id="address" {...register("address")} />
                                {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
                            </div>
                           <div className="space-y-2">
                                <Label htmlFor="city">Ciudad</Label>
                                <Input id="city" {...register("city")} />
                                {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="postalCode">Código Postal</Label>
                                <Input id="postalCode" {...register("postalCode")} />
                                {errors.postalCode && <p className="text-red-500 text-xs">{errors.postalCode.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="province">Provincia</Label>
                                <Input id="province" {...register("province")} />
                                {errors.province && <p className="text-red-500 text-xs">{errors.province.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="country">País</Label>
                                <Input id="country" {...register("country")} />
                                {errors.country && <p className="text-red-500 text-xs">{errors.country.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input id="phone" {...register("phone")} />
                                {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input id="email" type="email" {...register("email")} />
                                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                            </div>
                        </CardContent>
                    </Card>

                     {/* Beneficiary Data */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><HeartHandshake className="text-primary" /> Beneficiario del Seguro de Vida</CardTitle>
                            <CardDescription>Esta persona recibirá el capital en caso de fallecimiento del titular. (Opcional)</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="beneficiaryFullName">Nombre y Apellido</Label>
                                <Input id="beneficiaryFullName" {...register("beneficiaryFullName")} />
                                {errors.beneficiaryFullName && <p className="text-red-500 text-xs">{errors.beneficiaryFullName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="beneficiaryDni">DNI</Label>
                                <Input id="beneficiaryDni" {...register("beneficiaryDni")} />
                                {errors.beneficiaryDni && <p className="text-red-500 text-xs">{errors.beneficiaryDni.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="beneficiaryPhone">Teléfono</Label>
                                <Input id="beneficiaryPhone" {...register("beneficiaryPhone")} />
                                {errors.beneficiaryPhone && <p className="text-red-500 text-xs">{errors.beneficiaryPhone.message}</p>}
                            </div>
                             <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="beneficiaryRelationship">Parentesco</Label>
                                <Input id="beneficiaryRelationship" {...register("beneficiaryRelationship")} />
                                {errors.beneficiaryRelationship && <p className="text-red-500 text-xs">{errors.beneficiaryRelationship.message}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Data */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Building className="text-primary" /> Información Financiera y Legal</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Situación Laboral</Label>
                                <Controller
                                    name="employmentStatus"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="employed">En relación de dependencia</SelectItem>
                                                <SelectItem value="self-employed">Autónomo / Monotributista</SelectItem>
                                                <SelectItem value="unemployed">Desempleado</SelectItem>
                                                <SelectItem value="other">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.employmentStatus && <p className="text-red-500 text-xs">{errors.employmentStatus.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="monthlyIncome">Ingresos Mensuales (USD)</Label>
                                <Input id="monthlyIncome" type="number" {...register("monthlyIncome", { valueAsNumber: true })} />
                                {errors.monthlyIncome && <p className="text-red-500 text-xs">{errors.monthlyIncome.message}</p>}
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Label>¿Eres una Persona Expuesta Políticamente (PEP)?</Label>
                                    <Tooltip>
                                        <TooltipTrigger type="button"><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            <p>Según la Resolución 134/2018 de la UIF, se consideran PEP a quienes desempeñan o han desempeñado funciones públicas destacadas en el país o en el extranjero. Esto incluye a funcionarios, jueces, legisladores, etc. Su declaración es obligatoria.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                               <Controller
                                    name="pep"
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="false" id="pep-no" /><Label htmlFor="pep-no">No</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="true" id="pep-yes" /><Label htmlFor="pep-yes">Sí</Label></div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                             <div className="md:col-span-2 flex items-start space-x-3 pt-4">
                                <Controller
                                    name="fundsOrigin"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox id="fundsOrigin" checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                               <div className="grid gap-1.5 leading-none">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="fundsOrigin">Declaro bajo juramento que los fondos que utilizaré son de origen lícito.</Label>
                                        <Tooltip>
                                            <TooltipTrigger type="button"><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                <p>Esta declaración es un requisito obligatorio bajo las normativas de la UIF (Unidad de Información Financiera) para la prevención del Lavado de Activos y Financiación del Terrorismo.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    {errors.fundsOrigin && <p className="text-red-500 text-xs">{errors.fundsOrigin.message}</p>}
                               </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                 {/* Documents & Biometrics Column */}
                <div className="lg:col-span-1 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileUp className="text-primary" /> Documentación</CardTitle>
                             <CardDescription>Sube una foto clara de tu DNI.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="dniFront">Frente del DNI</Label>
                                <Input id="dniFront" type="file" accept="image/*" {...register("dniFront")} />
                                {errors.dniFront && <p className="text-red-500 text-xs">{(errors.dniFront as any).message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="dniBack">Dorso del DNI</Label>
                                <Input id="dniBack" type="file" accept="image/*" {...register("dniBack")} />
                                {errors.dniBack && <p className="text-red-500 text-xs">{(errors.dniBack as any).message}</p>}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Camera className="text-primary" /> Control Biométrico</CardTitle>
                             <CardDescription>Verificaremos tu identidad con una selfie.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {biometricStep === 'idle' && (
                                <Button onClick={handleStartBiometric} className="w-full">
                                    <Camera className="mr-2" /> Iniciar Verificación Facial
                                </Button>
                            )}
                            
                            {biometricStep === 'capturing' && (
                                <div className="space-y-4 text-center">
                                    <div className="w-full aspect-video bg-black rounded-md overflow-hidden relative">
                                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                        {!hasCameraPermission && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                <p className="text-white text-sm text-center p-4">Se requiere acceso a la cámara.</p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 border-8 border-primary/50 rounded-md animate-pulse"></div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Mantén tu rostro dentro del marco...</p>
                                </div>
                            )}

                             {biometricStep === 'failed' && (
                                <div className="space-y-4">
                                     <Alert variant="destructive">
                                        <AlertTitle>Error de Cámara</AlertTitle>
                                        <AlertDescription>No se pudo acceder a la cámara. Revisa los permisos de tu navegador.</AlertDescription>
                                    </Alert>
                                    <Button onClick={handleRetryBiometric} variant="outline" className="w-full"><Repeat className="mr-2"/>Reintentar</Button>
                                </div>
                            )}

                             {biometricStep === 'success' && (
                                <div className="space-y-4">
                                     <Alert className="border-green-500 text-green-700">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <AlertTitle>¡Verificación Exitosa!</AlertTitle>
                                        <AlertDescription>Tu identidad facial ha sido confirmada.</AlertDescription>
                                    </Aler>
                                    <Button onClick={handleRetryBiometric} variant="outline" className="w-full"><Repeat className="mr-2"/>Repetir Verificación</Button>
                                </div>
                            )}

                        </CardContent>
                    </Card>

                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || biometricStep !== 'success'}>
                        {isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <ShieldCheck className="mr-2" />}
                        {isSubmitting ? 'Enviando...' : 'Enviar y Verificar Cuenta'}
                    </Button>
                    {biometricStep !== 'success' && <p className="text-xs text-center text-muted-foreground">Debes completar el control biométrico para poder enviar el formulario.</p>}
                </div>
            </div>
        </form>
      </TooltipProvider>
    );
}
