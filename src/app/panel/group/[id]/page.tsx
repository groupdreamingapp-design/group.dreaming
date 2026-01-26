

'use client';

import type { Group, Installment, Award, UserAwardStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Users, Clock, Users2, Calendar, Gavel, HandCoins, Ticket, Info, Trophy, FileX2, TrendingUp, Hand, Scale, CalendarCheck, Gift, Check, X, Award as AwardIcon, Sparkles, Upload, MessageCircleQuestion, Youtube, CalendarDays, LineChart, Bot, ShieldCheck, ShieldAlert, AlertCircle, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useGroups } from '@/hooks/use-groups';
import { generateInstallments, generateExampleInstallments, generateStaticAwards } from '@/lib/data';
import { useMemo, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { addDays, parseISO, format, isBefore, isToday, differenceInMonths, setDate, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useParams, useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useGroupPreferences } from '@/hooks/use-group-preferences';
import { InstallmentReceipt } from '@/components/app/receipt';
import { MPButton } from '@/components/payments/mp-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUserNav } from '@/components/app/user-nav';


// Component to safely format dates on the client side, avoiding hydration mismatch.
function ClientFormattedDate({ dateString, formatString }: { dateString: string | undefined, formatString: string }) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && dateString) {
      try {
        const date = parseISO(dateString);
        setFormattedDate(format(date, formatString, { locale: es }));
      } catch (error) {
        setFormattedDate(dateString); // Fallback on error
      }
    }
  }, [dateString, formatString, isMounted]);

  if (!isMounted || !formattedDate) {
    return <>...</>; // Placeholder for server render and initial client render
  }

  return <>{formattedDate}</>;
}


export default function GroupDetail() {
  const params = useParams();
  const router = useRouter();
  const groupId = typeof params.id === 'string' ? params.id : '';
  const { groups, joinGroup, leaveGroup, resetGroupMembers, auctionGroup, acceptAward, approveAward, advanceInstallments, advancedInstallments } = useGroups();
  const { toast } = useToast();

  const [cuotasToAdvance, setCuotasToAdvance] = useState<number>(0);
  const [termsAcceptedAdvance, setTermsAcceptedAdvance] = useState(false);

  const [cuotasToBid, setCuotasToBid] = useState<number>(0);
  const [termsAcceptedBid, setTermsAcceptedBid] = useState(false);

  const [bidType, setBidType] = useState<'comun' | 'plus'>('comun');

  const [termsAcceptedAuction, setTermsAcceptedAuction] = useState(false);
  const [termsAcceptedBaja, setTermsAcceptedBaja] = useState(false);

  const [awardTermsAccepted, setAwardTermsAccepted] = useState(false);
  const [hasReadAwardRules, setHasReadAwardRules] = useState(false);

  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Installment | null>(null);
  const [nextAdjudicationInfo, setNextAdjudicationInfo] = useState<Date | null>(null);

  const resetBiddingDialog = () => {
    setCuotasToBid(0);
    setTermsAcceptedBid(false);
    setBidType('comun');
  };

  const resetAdvanceDialog = () => {
    setCuotasToAdvance(0);
    setTermsAcceptedAdvance(false);
  };

  const resetAuctionDialog = () => {
    setTermsAcceptedAuction(false);
  };

  const resetBajaDialog = () => {
    setTermsAcceptedBaja(false);
  };

  const resetAwardDialog = () => {
    setAwardTermsAccepted(false);
    setHasReadAwardRules(false);
  };


  const { user } = useUserNav();
  const [memberData, setMemberData] = useState<any>(null);

  const group = useMemo(() => groups.find(g => g.id === groupId), [groups, groupId]);

  useEffect(() => {
    if (!user || !groupId) return;
    const memberRef = doc(db, 'groups', groupId, 'members', user.uid);
    const groupRef = doc(db, 'groups', groupId); // Ref to group

    const unsubscribe = onSnapshot(memberRef, async (docSnap) => {
      if (docSnap.exists()) {
        setMemberData(docSnap.data());
      } else {
        // Document missing. Let's try to fix it or at least display correct data.

        // Fetch group doc freshly to be sure about members list
        try {
          const groupSnap = await getDoc(groupRef);
          if (groupSnap.exists()) {
            const gData = groupSnap.data();
            const membersList = gData.members || [];
            const idx = membersList.indexOf(user.uid);

            if (idx !== -1) {
              const retroactiveOrder = idx + 1;

              // Create the missing sub-document
              const newMemberData = {
                orderNumber: retroactiveOrder,
                joinedAt: new Date().toISOString(),
                status: 'Activo',
                subscriptionPaid: true,
                installmentsPaid: 1
              };

              await setDoc(memberRef, newMemberData);
              setMemberData(newMemberData); // Update local state immediately
            }
          }
        } catch (e) {
          console.error("Auto-fix failed", e);
        }
      }
    });
    return () => unsubscribe();
  }, [user, groupId]);

  const groupAwards = useMemo(() => {
    if (!group) return [];
    return generateStaticAwards(group);
  }, [group]);

  const installments = useMemo(() => {
    if (!group) return [];
    if ((group.status === 'Activo' || group.status === 'Subastado' || group.status === 'Cerrado') && group.activationDate) {
      return generateInstallments(group.capital, group.plazo, group.activationDate);
    }
    if (group.status === 'Abierto' || group.status === 'Pendiente') {
      return generateExampleInstallments(group.capital, group.plazo);
    }
    return [];
  }, [group]);

  const calculatedOrder = useMemo(() => {
    if (!group || !user) return null;
    const list = group.members || [];
    const idx = list.indexOf(user.uid);
    if (idx !== -1) return idx + 1;
    if (group.userIsMember) return group.membersCount || 1;
    return null;
  }, [group, user]);

  const userOrderNumber = memberData?.orderNumber ?? calculatedOrder ?? (group?.userIsMember ? (group?.membersCount || 1) : "-");

  const installmentsIssued = group?.monthsCompleted || 0;
  const installmentsPaidCount = memberData?.installmentsPaid ?? (group?.userIsMember ? 1 : 0);

  // Ensure consistency for existing logic
  const installmentsPaid = installmentsPaidCount;

  useEffect(() => {
    if (!installments.length) { // Removed !installmentsPaid check to avoid issues if 0
      setNextAdjudicationInfo(null);
      return;
    }

    const calculateNextAdjudication = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const nextInstallment = installments.find(inst => inst.number > installmentsPaid && !isBefore(parseISO(inst.dueDate), today));

      if (!nextInstallment) {
        setNextAdjudicationInfo(null);
        return;
      }

      const nextInstallmentDate = parseISO(nextInstallment.dueDate);
      let adjudicationDate = setDate(nextInstallmentDate, 15);

      if (isBefore(adjudicationDate, today)) {
        const nextMonthDate = addMonths(nextInstallmentDate, 1);
        adjudicationDate = setDate(nextMonthDate, 15);
      }
      setNextAdjudicationInfo(adjudicationDate);
    };

    calculateNextAdjudication();
  }, [installments, installmentsPaid]);


  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <FileX2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Grupo no encontrado</h1>
        <p className="text-muted-foreground">El grupo que buscas no existe o fue eliminado.</p>
        <Button asChild className="mt-4">
          <Link href="/panel/my-groups">Volver a Mis Grupos</Link>
        </Button>
      </div>
    );
  }

  const isMember = group.userIsMember;

  const realInstallments = useMemo(() => {
    if (!group || !group.activationDate) return [];
    return generateInstallments(group.capital, group.plazo, group.activationDate);
  }, [group?.capital, group?.plazo, group?.activationDate]);

  const userAwardInfo = useMemo(() => {
    if (!group) return undefined;
    for (let i = 0; i < groupAwards.length; i++) {
      const monthAward = groupAwards[i].find(a => a.orderNumber === userOrderNumber);
      if (monthAward) {
        return { month: i + 1, type: monthAward.type };
      }
    }
    return undefined;
  }, [groupAwards, group, userOrderNumber]);


  const awardMonth = userAwardInfo?.month;

  const hasNoOverduePayments = useMemo(() => {
    if (!group.activationDate) return true;
    const groupInstallments = generateInstallments(group.capital, group.plazo, group.activationDate);
    const today = new Date();
    return !groupInstallments.some(inst => inst.number <= installmentsPaid && isBefore(parseISO(inst.dueDate), today));
  }, [group, installmentsPaid]);

  const alicuotaPuraTotal = realInstallments.length > 0 ? realInstallments[0].breakdown.alicuotaPura : (group.capital / group.plazo);
  const capitalAportadoPuro = installmentsPaid * alicuotaPuraTotal;

  const IVA = 1.21;
  const penalidadBaja = capitalAportadoPuro * 0.05 * IVA;

  const totalCuotasEmitidas = realInstallments
    .slice(0, installmentsIssued)
    .reduce((acc, installment) => acc + installment.total, 0);

  const precioBaseSubasta = totalCuotasEmitidas * 0.5;
  const comisionVenta = precioBaseSubasta * 0.02 * IVA;
  const liquidacionEstimada = precioBaseSubasta - comisionVenta;

  const isPlanActive = group.status === 'Activo';

  const pendingInstallmentIndex = useMemo(() => {
    if (!isPlanActive) return -1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return installments.findIndex(inst => inst.number > installmentsPaid && !isBefore(parseISO(inst.dueDate), today));
  }, [installments, installmentsPaid, isPlanActive]);

  const cuotasFuturas = useMemo(() => {
    if (!isPlanActive || !group.activationDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const advancedCount = advancedInstallments[group.id] || 0;

    return installments.filter(inst => {
      const isAdvanced = inst.number > group.plazo - advancedCount;
      if (isAdvanced) return false;
      if (inst.number <= installmentsPaid) return false;

      const dueDate = parseISO(inst.dueDate);
      return !isBefore(dueDate, today);
    }).length;
  }, [installments, isPlanActive, installmentsPaid, advancedInstallments, group.id, group.plazo, group.activationDate]);


  const futureInstallmentsForCalculation = useMemo(() => {
    if (!isPlanActive || !group.activationDate) return [];
    if (pendingInstallmentIndex === -1) return []; // No future installments to calculate
    return realInstallments.slice(pendingInstallmentIndex);
  }, [isPlanActive, pendingInstallmentIndex, realInstallments, group.activationDate]);

  const isAdvanceInputValid = cuotasToAdvance > 0 && cuotasToAdvance <= cuotasFuturas;

  // Bidding logic
  const canBid = isPlanActive && installmentsPaid >= 2;
  const isManualBidInvalid = cuotasToBid < 1 || cuotasToBid > cuotasFuturas;
  const isBidValid = cuotasToBid > 0 && !isManualBidInvalid;

  const calculateSavings = (cuotasCount: number) => {
    if (cuotasCount <= 0 || cuotasCount > futureInstallmentsForCalculation.length) return { totalToPay: 0, totalOriginal: 0, totalSaving: 0 };

    const installmentsToConsider = futureInstallmentsForCalculation.slice(futureInstallmentsForCalculation.length - cuotasCount);
    const totalToPay = installmentsToConsider.reduce((acc, inst) => acc + inst.breakdown.alicuotaPura, 0);
    const totalOriginal = installmentsToConsider.reduce((acc, inst) => acc + inst.total, 0);
    const totalSaving = totalOriginal - totalToPay;

    return { totalToPay, totalOriginal, totalSaving };
  }

  const advanceSavings = calculateSavings(cuotasToAdvance);
  const bidSavings = calculateSavings(cuotasToBid);
  const plusBidRetention = bidSavings.totalToPay * 0.05 * 1.21;


  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(amount);
  const formatCurrencyNoDecimals = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  const handleAuctionConfirm = () => {
    if (!group) return;
    auctionGroup(group.id);
    toast({
      title: "¡Plan puesto en subasta!",
      description: `Tu plan ${group.id} ahora está visible en el mercado secundario.`,
    });
  };

  const handleAcceptAward = () => {
    if (!group) return;
    acceptAward(group.id);
  };

  const handleApproveAward = () => {
    if (!group) return;
    approveAward(group.id);
  }

  const handleAdvanceInstallments = () => {
    if (!group || !isAdvanceInputValid) return;
    advanceInstallments(group.id, cuotasToAdvance);
    toast({
      title: "¡Adelanto Exitoso!",
      description: `Has adelantado ${cuotasToAdvance} cuota(s) desde tu Wallet GD.`,
      className: 'bg-green-100 border-green-500 text-green-700'
    });
  }

  const handleConfirmBid = () => {
    toast({
      title: "¡Licitación registrada!",
      description: `Tu oferta de ${cuotasToBid} cuota(s) ha sido registrada para el próximo acto.`,
    });
  }

  const awardStatusText: Record<UserAwardStatus, string> = {
    "No Adjudicado": "Pendiente",
    "Adjudicado - Pendiente Aceptación": "Adjudicado (Pend. Aceptación)",
    "Adjudicado - Pendiente Garantías": "Adjudicado (Pend. Garantías)",
    "Adjudicado - Aprobado": "Adjudicado (Aprobado)",
  };
  const awardStatusIcon: Record<UserAwardStatus, React.ElementType> = {
    "No Adjudicado": Calendar,
    "Adjudicado - Pendiente Aceptación": MessageCircleQuestion,
    "Adjudicado - Pendiente Garantías": Upload,
    "Adjudicado - Aprobado": Trophy,
  };
  const AwardStatusIconComponent = awardStatusIcon[group.userAwardStatus];

  const { preferences } = useGroupPreferences(group?.id);

  const dynamicMotivation = useMemo(() => {
    // Cast group to any to avoid strict type checks on status strings if they mismatch
    const g = group as any;
    if (g?.status === 'Subastado') return "Tu plan está en el mercado secundario. Pronto recibirás noticias de tu inversión.";
    if (g?.userAwardStatus && g.userAwardStatus.startsWith('Adjudicado')) return "¡El momento ha llegado! Tu sueño está más cerca que nunca.";
    if (!isPlanActive && g?.status !== 'Abierto' && g?.status !== 'Pendiente') return "Gracias por ser parte de Group Dreaming.";

    // Default to personalized motivation or generic
    return preferences?.motivationalDescription || "Mantén tu objetivo en mente. Cada cuota te acerca a tu sueño.";
  }, [group, preferences, isPlanActive]);

  const heroImage = preferences?.customImageUrl || '/images/default-dream.jpg'; // We need a default fallback if no image
  const displayTitle = preferences?.customName || `Grupo ${group?.id}`;

  return (
    <TooltipProvider>
      <div className="mb-6 space-y-4">
        <Link href="/panel/my-groups" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Volver a Mis Grupos
        </Link>

        {/* HERO CARD */}
        <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-lg group">
          {preferences?.customImageUrl ? (
            <img src={preferences.customImageUrl} alt="Dream" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

          <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-headline tracking-tight">{displayTitle}</h1>
                <p className="text-white/90 text-sm md:text-lg max-w-2xl font-light italic opacity-90">"{dynamicMotivation}"</p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-white/80 text-sm font-semibold tracking-wider font-mono mb-2">{group?.id}</p>
                <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-1">Capital del Plan</p>
                <p className="text-white text-2xl font-bold">{formatCurrencyNoDecimals(group?.capital || 0)}</p>
              </div>
            </div>
          </div>

          {/* Status Badge overlay */}
          <div className="absolute top-4 right-4">
            <Badge variant={isPlanActive ? "default" : "secondary"} className="text-xs px-3 py-1 uppercase tracking-wide bg-white/20 hover:bg-white/30 backdrop-blur-md border-0 text-white shadow-sm">
              {group?.status}
            </Badge>
          </div>
        </div>
        {/* End Hero Card */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={cn("lg:col-span-3 flex flex-col md:flex-row gap-4", !isMember && "lg:col-span-2")}>
          {isMember && (
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle>Mi Plan</CardTitle>
                <CardDescription>Tu estado personal dentro del grupo.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm flex-grow">
                <div className="flex items-center gap-2"><Info className="h-4 w-4 text-primary" /><span>N° de Orden: <strong>{userOrderNumber}</strong></span></div>
                <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /><span>Cuotas Pagadas: <strong>{installmentsPaid}/{installmentsIssued}</strong></span></div>
                <div className="flex items-center gap-2"><HandCoins className="h-4 w-4 text-primary" /><span>Capital Aportado (Puro): <strong>{formatCurrency(capitalAportadoPuro)}</strong></span></div>
                <div className="flex items-center gap-2">
                  <AwardStatusIconComponent className={cn("h-4 w-4", group.userAwardStatus === "Adjudicado - Aprobado" ? "text-yellow-500" : "text-primary")} />
                  <span>Adjudicación: <strong className={cn(group.userAwardStatus === 'Adjudicado - Aprobado' && "text-green-600")}>{awardStatusText[group.userAwardStatus]} {group.userAwardStatus !== "No Adjudicado" && `(Mes ${awardMonth})`}</strong></span>
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Info del Grupo</CardTitle>
              <CardDescription>Datos generales y vitales del grupo.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><span>Miembros: <strong>{group.membersCount}/{group.totalMembers}</strong></span></div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /><span>Plazo: <strong>{group.plazo} meses</strong></span></div>
              <div className="flex items-center gap-2"><Scale className="h-4 w-4 text-primary" /><span>Cuota Promedio: <strong>{formatCurrency(group.cuotaPromedio)}</strong></span></div>
              <div className="flex items-center gap-2"><Users2 className="h-4 w-4 text-primary" /><span>Adjudicaciones: <strong>2 por mes</strong></span></div>
            </CardContent>
          </Card>
          {isPlanActive && (
            <Card className="flex-1 bg-blue-500/5 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-300">Próximo Acto de Adjudicación</CardTitle>
                <CardDescription className="text-blue-700/80 dark:text-blue-300/80">Información sobre el siguiente sorteo y licitación.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">Fecha del Acto</p>
                    <p><ClientFormattedDate dateString={nextAdjudicationInfo?.toISOString()} formatString="EEEE, dd 'de' MMMM" /></p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">Cierre de Licitación</p>
                    <p>El acto abre 8:30hs. La licitación se define 9:00hs.</p>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="#" target="_blank">
                    <Youtube className="mr-2 h-4 w-4" /> Ver acto en vivo
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>


        {isMember && (isPlanActive || group.userAwardStatus.startsWith('Adjudicado')) && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Acciones del Plan</CardTitle>
                <CardDescription>Opciones disponibles para tu plan.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {hasOverduePayments && group.userAwardStatus.startsWith("Adjudicado") && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Deuda Pendiente</AlertTitle>
                    <AlertDescription>
                      Tienes cuotas vencidas. Debes regularizar tu situación para poder aceptar la adjudicación y continuar con el proceso.
                    </AlertDescription>
                  </Alert>
                )}
                {group.userAwardStatus === "Adjudicado - Pendiente Aceptación" && !hasOverduePayments && (
                  <Dialog onOpenChange={(open) => !open && resetAwardDialog()}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="default" className='bg-green-600 hover:bg-green-700'>
                        <AwardIcon className="mr-2 h-4 w-4" /> Aceptar Adjudicación
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>¡Felicitaciones! Has sido adjudicado</DialogTitle>
                        <DialogDescription>Tienes 48hs para aceptar. Al aceptar, te comprometes a presentar las garantías y pagar la licitación (si aplica) en las próximas 72hs.</DialogDescription>
                      </DialogHeader>
                      <div className="items-top flex space-x-2 pt-4">
                        <Switch
                          id="award-terms"
                          checked={awardTermsAccepted}
                          onCheckedChange={setAwardTermsAccepted}
                          disabled={!hasReadAwardRules}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor="award-terms"
                            className={cn("text-sm font-medium leading-none", !hasReadAwardRules && "text-muted-foreground cursor-not-allowed")}
                          >
                            He leído y acepto el <Button variant="link" className="p-0 h-auto" asChild><Link href="/panel/rules" target="_blank" onClick={() => setHasReadAwardRules(true)}>Reglamento de Adjudicación</Link></Button>.
                          </Label>
                          {!hasReadAwardRules && (
                            <p className="text-xs text-amber-600 font-semibold">
                              Debes hacer clic en 'Reglamento de Adjudicación' para poder aceptar.
                            </p>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild><Button variant="destructive">Rechazar</Button></DialogClose>
                        <Button className='bg-green-600 hover:bg-green-700' disabled={!awardTermsAccepted} onClick={handleAcceptAward}>Aceptar Adjudicación</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                {group.userAwardStatus === "Adjudicado - Pendiente Garantías" && !hasOverduePayments && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="default">
                        <Upload className="mr-2 h-4 w-4" /> Presentar Garantías
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Presentación de Garantías</DialogTitle>
                        <DialogDescription>Sube la documentación requerida para asegurar tu capital. Tienes 72hs.</DialogDescription>
                      </DialogHeader>
                      <div className='space-y-6'>
                        {userAwardInfo?.type === 'licitacion' && (
                          <Alert>
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>Acción Requerida: Pagar Licitación</AlertTitle>
                            <AlertDescription className='flex justify-between items-center'>
                              <span>Monto a pagar: <strong>{formatCurrency(5000)}</strong></span>
                              <MPButton
                                title={`Integración Licitación Grupo ${group.id}`}
                                price={5000} // This should ideally be dynamic based on the winning bid
                                description="Pagar Licitación"
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                              />
                            </AlertDescription>
                          </Alert>
                        )}

                        <Card>
                          <CardContent className="p-4 space-y-4">
                            <h3 className='font-semibold text-center'>Opción 1: Seguro de Caución (Recomendado)</h3>
                            <p className="text-xs text-center text-muted-foreground">La forma más rápida y sencilla. Sin garantes ni propiedades.</p>
                            <Button className="w-full" onClick={handleApproveAward}>
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Contratar Seguro de Caución
                            </Button>
                          </CardContent>
                        </Card>

                        <div className="relative">
                          <Separator />
                          <span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-popover px-2 text-sm text-muted-foreground">Otras Garantías</span>
                        </div>

                        <Card>
                          <CardContent className="p-4 space-y-4">
                            <h3 className='font-semibold text-center'>Opción 2: Subir Documentación</h3>
                            <div className="space-y-2">
                              <Label htmlFor="dniFront">Recibo de Sueldo / Comprobante de Ingresos</Label>
                              <Input id="dniFront" type="file" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="dniBack">Garantía Propietaria</Label>
                              <Input id="dniBack" type="file" />
                            </div>
                            <DialogFooter className="mt-4">
                              <DialogClose asChild>
                                <Button type="button" onClick={handleApproveAward} className="w-full">Enviar Documentación</Button>
                              </DialogClose>
                            </DialogFooter>
                          </CardContent>
                        </Card>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                <Dialog onOpenChange={(open) => !open && resetAdvanceDialog()}>
                  <DialogTrigger asChild><Button size="sm" variant="secondary" disabled={!isPlanActive}><TrendingUp className="mr-2 h-4 w-4" /> Adelantar</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Adelantar Cuotas</DialogTitle><DialogDescription>Paga cuotas futuras para acortar tu plan y obtén una bonificación.</DialogDescription></DialogHeader>
                    <div className="space-y-4">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="cuotas-adelantar">Cantidad de cuotas a adelantar</Label>
                        <Input
                          id="cuotas-adelantar"
                          type="number"
                          placeholder={`Entre 1 y ${cuotasFuturas}`}
                          value={cuotasToAdvance > 0 ? cuotasToAdvance : ''}
                          onChange={(e) => setCuotasToAdvance(Number(e.target.value))}
                          className={cn(cuotasToAdvance > 0 && !isAdvanceInputValid && "border-red-500")}
                          disabled={cuotasFuturas === 0}
                        />
                        <p className="text-xs text-muted-foreground">Adelantas las últimas cuotas de tu plan. No compite por adjudicación.</p>
                      </div>
                      {isAdvanceInputValid ? (
                        <Card className="bg-muted/50">
                          <CardContent className="p-4 text-sm space-y-1">
                            <p>Pagarías (valor puro): <strong>{formatCurrency(advanceSavings.totalToPay)}</strong></p>
                            <p>En lugar de (valor final): <span className='line-through'>{formatCurrency(advanceSavings.totalOriginal)}</span></p>
                            <p className="text-green-600 font-semibold">¡Ahorras {formatCurrency(advanceSavings.totalSaving)} en gastos administrativos y seguros!</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {cuotasFuturas > 0 ? 'Ingresa un número de cuotas válido para ver el ahorro.' : 'No tienes cuotas futuras para adelantar.'}
                        </p>
                      )}
                      <div className="items-top flex space-x-2 pt-2">
                        <Switch id="terms-advance" checked={termsAcceptedAdvance} onCheckedChange={setTermsAcceptedAdvance} disabled={!isAdvanceInputValid} />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor="terms-advance" className={cn("font-medium", !isAdvanceInputValid && "text-muted-foreground")}>
                            Acepto que el débito se realizará desde mi Wallet GD y es irreversible.
                          </Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAdvanceInstallments}
                          disabled={!termsAcceptedAdvance || !isAdvanceInputValid}>
                          Pagar con Wallet GD
                        </Button>
                      </DialogClose>
                      <MPButton
                        title={`Adelanto ${cuotasToAdvance} cuotas - Grupo ${group.id}`}
                        price={advanceSavings.totalToPay}
                        description="Pagar con MercadoPago"
                        disabled={!termsAcceptedAdvance || !isAdvanceInputValid}
                        onBeforePayment={async () => {
                          // Normally we would register the advance intent here
                          console.log("Initiating advance payment via MP");
                        }}
                      />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {group.userAwardStatus === "No Adjudicado" && (
                  <>
                    <Dialog onOpenChange={(open) => !open && resetBiddingDialog()}>
                      <DialogTrigger asChild>
                        <Button size="sm" disabled={!canBid}>
                          <Gavel className="mr-2 h-4 w-4" /> Licitar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Licitar por Adjudicación</DialogTitle>
                          <DialogDescription>Ofrece adelantar cuotas para ganar la adjudicación. La subasta dura desde el día 11 hasta el 15 a las 9am.</DialogDescription>
                        </DialogHeader>

                        <Tabs value={bidType} onValueChange={(value) => setBidType(value as any)} className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="comun">Licitación Común</TabsTrigger>
                            <TabsTrigger value="plus">Licitación Plus</TabsTrigger>
                          </TabsList>
                          <TabsContent value="comun" className="space-y-4 pt-4">
                            <Alert variant='default'>
                              <Info className="h-4 w-4" />
                              <AlertTitle>Con Fondos Propios</AlertTitle>
                              <AlertDescription>
                                Si ganas, deberás integrar el capital ofertado desde tu cuenta bancaria en un plazo de 72hs.
                              </AlertDescription>
                            </Alert>
                          </TabsContent>
                          <TabsContent value="plus" className="space-y-4 pt-4">
                            <Alert variant='default'>
                              <Sparkles className="h-4 w-4" />
                              <AlertTitle>Con Retención de Capital</AlertTitle>
                              <AlertDescription>
                                Si ganas, el monto ofertado se descontará del capital que recibes. Tiene un costo de retención del 5% (+IVA) sobre tu oferta.
                              </AlertDescription>
                            </Alert>
                          </TabsContent>
                        </Tabs>

                        <div className="space-y-4">
                          <Card className="bg-muted/50 p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Mejor Oferta Actual:</span>
                              <span className="font-bold">7 Cuotas (Orden #23)</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Próxima Oferta Mínima:</span>
                              <span className="font-bold flex items-center gap-1"><ArrowUp className="h-4 w-4 text-green-500" />8 Cuotas</span>
                            </div>
                          </Card>
                          <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="cuotas-licitar">Tu Oferta (en cuotas)</Label>
                            <Input
                              id="cuotas-licitar"
                              type="number"
                              placeholder={`Mínimo 8`}
                              value={cuotasToBid > 0 ? cuotasToBid : ''}
                              onChange={(e) => setCuotasToBid(Number(e.target.value))}
                              className={cn(cuotasToBid > 0 && isManualBidInvalid && "border-red-500")}
                              disabled={cuotasFuturas === 0 || termsAcceptedBid}
                            />
                            <p className="text-xs text-muted-foreground">Tu oferta competirá con otros miembros. Si ganas, cancelas las últimas cuotas.</p>
                          </div>

                          {isBidValid && (
                            <div className="space-y-2">
                              <Card className="bg-muted/50">
                                <CardContent className="p-4 text-sm space-y-1">
                                  <p>Monto de la oferta (valor puro): <strong>{formatCurrency(bidSavings.totalToPay)}</strong></p>
                                  {bidType === 'plus' && (
                                    <p className="text-red-500 font-semibold">Retención Licitación Plus (5% + IVA): -{formatCurrency(plusBidRetention)}</p>
                                  )}
                                  <p className="text-green-600 font-semibold">Ahorro estimado (gastos adm. y seguros): {formatCurrency(bidSavings.totalSaving)}</p>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                          <div className="items-top flex space-x-2 pt-2">
                            <Switch id="terms-bid" checked={termsAcceptedBid} onCheckedChange={setTermsAcceptedBid} disabled={!isBidValid} />
                            <div className="grid gap-1.5 leading-none">
                              <Label htmlFor="terms-bid" className={cn("font-medium", !isBidValid && "text-muted-foreground")}>
                                Acepto los términos y condiciones de licitación.
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Si ganas y no integras el capital, se aplicará una multa del 2% (+IVA) sobre tu oferta.
                              </p>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button
                              type="button"
                              onClick={handleConfirmBid}
                              disabled={!termsAcceptedBid || !isBidValid}>
                              Confirmar Licitación
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog onOpenChange={(open) => !open && resetAuctionDialog()}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="secondary" disabled={!isPlanActive || installmentsPaid < 3}>
                          <Hand className="mr-2 h-4 w-4" /> Subastar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Subastar Plan (Vender)</DialogTitle><DialogDescription>Ofrece tu plan en el mercado secundario a otros inversores.</DialogDescription></DialogHeader>
                        <div className="space-y-4 text-sm">
                          <p>Esta es tu vía de salida flexible. A continuación un ejemplo del cálculo del precio base y lo que recibirías.</p>
                          <Card className="bg-muted/50 p-4 space-y-2">
                            <div className="flex justify-between"><span>Total Cuotas Emitidas:</span><strong>{formatCurrency(totalCuotasEmitidas)}</strong></div>
                            <div className="flex justify-between"><span>Precio Base Subasta (50%):</span><strong>{formatCurrency(precioBaseSubasta)}</strong></div>
                            <div className="flex justify-between text-red-600"><span>Comisión por Venta (2% + IVA):</span><strong>-{formatCurrency(comisionVenta)}</strong></div>
                            <div className="flex justify-between font-bold border-t pt-2"><span>Liquidación Estimada (al Precio Base):</span><strong>{formatCurrency(liquidacionEstimada)}</strong></div>
                            <p className="text-xs text-muted-foreground mt-2">El valor final dependerá del precio de venta en la subasta.</p>
                          </Card>
                          <div className="items-top flex space-x-2 pt-2">
                            <Switch id="terms-auction" checked={termsAcceptedAuction} onCheckedChange={setTermsAcceptedAuction} />
                            <div className="grid gap-1.5 leading-none">
                              <Label htmlFor="terms-auction" className="font-medium">
                                Acepto los términos y condiciones de la subasta.
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Confirmo que entiendo que el precio base es una estimación y el valor final dependerá de la oferta ganadora.
                              </p>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button
                              type="button"
                              onClick={handleAuctionConfirm}
                              disabled={!termsAcceptedAuction}
                            >
                              Poner en Subasta
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog onOpenChange={(open) => !open && resetBajaDialog()}>
                      <DialogTrigger asChild><Button size="sm" variant="destructive" disabled={!isPlanActive}><FileX2 className="mr-2 h-4 w-4" /> Dar de Baja</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Dar de Baja el Plan</DialogTitle><DialogDescription>Rescinde tu contrato. Aplica solo para planes no adjudicados.</DialogDescription></DialogHeader>
                        <div className="space-y-4 text-sm">
                          <p>Se te devolverá el capital puro aportado al finalizar el grupo, menos una penalidad. Ejemplo del cálculo:</p>
                          <Card className="bg-muted/50 p-4 space-y-2">
                            <div className="flex justify-between"><span>Capital Aportado (Puro):</span><strong>{formatCurrency(capitalAportadoPuro)}</strong></div>
                            <div className="flex justify-between text-red-600"><span>Penalidad (5% + IVA):</span><strong>-{formatCurrency(penalidadBaja)}</strong></div>
                            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>Monto a Devolver (al final):</span><strong>{formatCurrency(capitalAportadoPuro - penalidadBaja)}</strong></div>
                          </Card>
                          <p className="text-xs text-muted-foreground">La devolución se efectuará una vez finalizado el plazo original del grupo para no afectar al resto de los miembros.</p>
                          <div className="items-top flex space-x-2 pt-2">
                            <Switch id="terms-baja" checked={termsAcceptedBaja} onCheckedChange={setTermsAcceptedBaja} />
                            <div className="grid gap-1.5 leading-none">
                              <Label htmlFor="terms-baja" className="font-medium">
                                Acepto los términos y condiciones de la baja.
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Entiendo que la devolución se hará al final del ciclo y que se aplicará la penalidad indicada.
                              </p>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" variant="destructive" disabled={!termsAcceptedBaja} onClick={() => {
                            leaveGroup(group.id);
                            resetBajaDialog();
                            // Optionally redirect
                            router.push('/panel/my-groups');
                          }}>Confirmar Baja</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button size="sm" variant="destructive" onClick={() => resetGroupMembers(group.id)} className="ml-2">
                      <FileX2 className="mr-2 h-4 w-4" /> Resetear (Admin)
                    </Button>
                  </>
                )}
                {isPlanActive && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/panel/group/${group.id}/financial-health`}>
                      <LineChart className="mr-2 h-4 w-4" /> Ver Salud Financiera
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {isMember && group.status === 'Subastado' && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className='text-orange-600'>Plan en Subasta</CardTitle>
                <CardDescription>
                  Este plan se encuentra en el mercado secundario. Las acciones ya no están disponibles aquí.
                  Puedes seguir el estado de la subasta en el módulo correspondiente.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {(group.status === 'Abierto' || group.status === 'Pendiente' || group.status === 'Activo' || group.status === 'Subastado' || group.status === 'Cerrado') && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Plan de Cuotas {(group.status === 'Abierto' || group.status === 'Pendiente') ? '(Ejemplo)' : ''}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cuota</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Info Adjudicación</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {installments.map((inst, index) => {
                      let currentStatus: Installment['status'] = 'Futuro';
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      const advancedCount = advancedInstallments[group.id] || 0;
                      const isAdvanced = inst.number > group.plazo - advancedCount;
                      const paidInstallmentsCount = (group.monthsCompleted || 0) - (group.missedPayments || 0);

                      if (isMember && inst.number === 1) {
                        currentStatus = 'Pagado'; // Adhesion payment covers the first installment
                      } else if (group.userAwardStatus === 'Adjudicado - Aprobado' && inst.number > paidInstallmentsCount) {
                        currentStatus = 'Pagado'; // All future installments are considered paid for an awarded user
                      } else if (isAdvanced) {
                        currentStatus = 'Pagado';
                      } else if (group.status === 'Activo' || group.status === 'Subastado' || group.status === 'Cerrado') {
                        if (inst.number <= paidInstallmentsCount) {
                          currentStatus = 'Pagado';
                        } else {
                          const dueDate = parseISO(inst.dueDate);
                          if (isBefore(dueDate, today) && inst.number > paidInstallmentsCount) {
                            currentStatus = 'Vencido';
                          } else if (index === pendingInstallmentIndex) {
                            currentStatus = 'Pendiente';
                          } else {
                            currentStatus = 'Futuro';
                          }
                        }
                      }

                      const awardsForReceipt = groupAwards[inst.number - 2] || [];
                      const awardDateString = (isPlanActive || group.status === 'Cerrado') && awardsForReceipt.length > 0 && inst.dueDate && !inst.dueDate.startsWith('Mes') ? setDate(parseISO(inst.dueDate), 15).toISOString() : undefined;
                      const showAdjudicationInfo = inst.number <= (group.monthsCompleted || 0) + 1 && (group.status === 'Activo' || group.status === 'Cerrado' || group.status === 'Subastado');


                      const handleReceiptClick = () => {
                        let receiptData = inst;

                        if (group.userAwardStatus === 'Adjudicado - Aprobado' && inst.number > paidInstallmentsCount) {
                          receiptData = { // Show a zeroed-out receipt
                            ...inst,
                            total: 0,
                            breakdown: { alicuotaPura: 0, gastosAdm: 0, seguroVida: 0, derechoSuscripcion: 0 }
                          };
                        } else if (isAdvanced) {
                          receiptData = {
                            ...inst,
                            total: inst.breakdown.alicuotaPura,
                            breakdown: {
                              alicuotaPura: inst.breakdown.alicuotaPura,
                              gastosAdm: 0,
                              seguroVida: 0,
                              derechoSuscripcion: 0
                            }
                          };
                        }
                        setSelectedReceipt(receiptData);
                      };

                      return (
                        <TableRow key={inst.id}>
                          <TableCell>{inst.number}</TableCell>
                          <TableCell>{inst.dueDate.startsWith('Mes') ? inst.dueDate : <ClientFormattedDate dateString={inst.dueDate} formatString="dd/MM/yyyy" />}</TableCell>
                          <TableCell>
                            <Badge variant={currentStatus === 'Pagado' ? 'default' : currentStatus === 'Pendiente' ? 'secondary' : currentStatus === 'Vencido' ? 'destructive' : 'outline'}
                              className={cn(
                                currentStatus === 'Pagado' && 'bg-green-500/20 text-green-700 border-green-500/30',
                                currentStatus === 'Pendiente' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
                                currentStatus === 'Vencido' && 'bg-red-500/20 text-red-700 border-red-500/30',
                              )}
                            >{currentStatus}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {showAdjudicationInfo && awardDateString && awardsForReceipt.length > 0 && isBefore(new Date(), parseISO(awardDateString)) && (
                              <div className="flex items-center gap-2">
                                <CalendarCheck className="h-4 w-4" />
                                <span><ClientFormattedDate dateString={awardDateString} formatString="dd/MM/yyyy" /></span>
                              </div>
                            )}
                            {showAdjudicationInfo && awardsForReceipt.length > 0 && (
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                {awardsForReceipt?.map(award => (
                                  <div key={`${award.type}-${award.orderNumber}`} className="flex items-center gap-1">
                                    {award.type === 'sorteo' && <Ticket className="h-4 w-4 text-blue-500" />}
                                    {award.type === 'licitacion' && <HandCoins className="h-4 w-4 text-orange-500" />}
                                    {award.type === 'sorteo-especial' && (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Gift className="h-4 w-4 text-fuchsia-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>¡Premio Sorpresa!</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                    <span className={cn(award.orderNumber === userOrderNumber && "font-bold text-primary")}>#{award.orderNumber > 0 ? award.orderNumber : '??'}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {isAdvanced ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help">{formatCurrency(inst.breakdown.alicuotaPura)}*</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Pago adelantado (solo alícuota pura).</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              formatCurrency(inst.total)
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {currentStatus === 'Pagado' ? (
                              <Button variant="outline" size="sm" onClick={handleReceiptClick}>
                                Ver Recibo
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => setSelectedInstallment(inst)}>
                                Ver Detalle
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {selectedInstallment && (
        <Dialog open={!!selectedInstallment} onOpenChange={(open) => !open && setSelectedInstallment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalle de la Cuota #{selectedInstallment.number}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between"><span>Alícuota Pura:</span><strong>{formatCurrency(selectedInstallment.breakdown.alicuotaPura)}</strong></div>
              <div className="flex justify-between"><span>Gastos Adm (IVA incl.):</span><strong>{formatCurrency(selectedInstallment.breakdown.gastosAdm)}</strong></div>
              {selectedInstallment.breakdown.derechoSuscripcion && (
                <div className="flex justify-between"><span>Derecho Suscripción (IVA incl.):</span><strong>{formatCurrency(selectedInstallment.breakdown.derechoSuscripcion)}</strong></div>
              )}
              <div className="flex justify-between"><span>Seguro de Vida:</span><strong>{formatCurrency(selectedInstallment.breakdown.seguroVida)}</strong></div>
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>Total:</span><span>{formatCurrency(selectedInstallment.total)}</span></div>
            </div>
            {(selectedInstallment.number > (group.monthsCompleted || 0) || group.missedPayments > 0) && (
              <div className="mt-4 pt-4 border-t">
                <MPButton
                  title={`Cuota ${selectedInstallment.number} - Grupo ${group.id}`}
                  price={selectedInstallment.total}
                  description={`Pagar Cuota #${selectedInstallment.number}`}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                />
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Se redirigirá a MercadoPago. El pago se acreditará automáticamente.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {selectedReceipt && group && (
        <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
          <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="sr-only">Recibo de Cuota</DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto">
              <InstallmentReceipt
                installment={selectedReceipt}
                group={group}
                awards={groupAwards[selectedReceipt.number - 2] || []}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </TooltipProvider>
  );
}

