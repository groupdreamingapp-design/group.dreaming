
'use client';

import { useState, useEffect } from "react";
import { generateInstallments } from "@/lib/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Tag, TrendingUp, Gavel, ArrowUp, Bot, BookText, AlertTriangle, Info, ShieldAlert, CheckCircle, SearchX } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserNav } from "@/components/app/user-nav";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGroups } from "@/hooks/use-groups";
import type { Group, Auction } from "@/lib/types";


function ClientCountdown({ endDate, isUrgent }: { endDate: string, isUrgent?: boolean }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const calculateTimeLeft = () => {
      const end = new Date(endDate);
      const now = new Date();
      const difference = end.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft("Finalizada");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
      const totalHours = days * 24 + parseInt(hours, 10);
      const minutes = Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0');
      const seconds = Math.floor((difference / 1000) % 60).toString().padStart(2, '0');

      setTimeLeft(`${totalHours.toString().padStart(2, '0')}:${minutes}:${seconds}`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!isMounted) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span>Calculando...</span>
      </div>
    );
  }

  return (
    <div className={cn(
       "flex items-center gap-2",
       isUrgent && "text-orange-600 font-semibold"
     )}>
      {isUrgent ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
      <span>{isUrgent ? 'Cierre Urgente' : 'Termina en'} {timeLeft}</span>
    </div>
  );
}


export default function Auctions() {
  const [offerAmount, setOfferAmount] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [maxBid, setMaxBid] = useState('');
  const [autoIncrement, setAutoIncrement] = useState('');
  const [hasReadRules, setHasReadRules] = useState(false);
  const { toast } = useToast();
  const { isVerified } = useUserNav();
  const { groups } = useGroups();

  const auctions = groups
    .filter(g => g.status === 'Subastado')
    .map(g => {
        const installments = g.activationDate ? generateInstallments(g.capital, g.plazo, g.activationDate) : [];
        const totalCuotasEmitidas = installments
              .slice(0, g.monthsCompleted || 0)
              .reduce((acc, installment) => acc + installment.total, 0);

        const precioBase = totalCuotasEmitidas * 0.5;

        const auctionStartDate = g.auctionStartDate ? new Date(g.auctionStartDate) : new Date();
        const endDate = new Date(auctionStartDate.getTime() + 48 * 60 * 60 * 1000).toISOString();


        return {
            id: g.id,
            groupId: g.id,
            orderNumber: 42,
            capital: g.capital,
            plazo: g.plazo,
            cuotasPagadas: g.monthsCompleted || 0,
            highestBid: precioBase, // Start with the base price as the highest bid
            endDate: endDate,
            numberOfBids: 0, // Start with 0 bids
            isMine: g.userIsMember,
            isPostAdjudicacion: !!g.userIsAwarded,
            activationDate: g.activationDate,
        } as Auction
    });
  
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(amount);
  const formatCurrencyNoDecimals = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  
  const handleConfirmOffer = (auction: Auction) => {
    if (!termsAccepted) {
        toast({
            variant: "destructive",
            title: "Términos y Condiciones",
            description: "Debes aceptar los términos y condiciones para continuar.",
        });
        return;
    }
    
    if (autoBidEnabled) {
        toast({
            title: "¡Oferta automática configurada!",
            description: `Tu puja automática para ${auction.groupId} con un máximo de ${formatCurrency(Number(maxBid))} ha sido guardada.`,
        });
    } else {
        toast({
          title: "¡Oferta realizada con éxito!",
          description: `Tu oferta de ${formatCurrency(Number(offerAmount))} por el plan ${auction.groupId} ha sido registrada.`,
        });
    }
    
    handleOpenChange(auction.id, false);
  };
  
  const resetDialog = () => {
    setOfferAmount('');
    setTermsAccepted(false);
    setAutoBidEnabled(false);
    setMaxBid('');
    setAutoIncrement('');
    setHasReadRules(false);
  }

  const handleOpenChange = (auctionId: string, open: boolean) => {
    setOpenDialogs(prev => ({ ...prev, [auctionId]: open }));
    if (!open) {
      resetDialog();
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Subastas (Mercado Secundario)</h1>
          <p className="text-muted-foreground">Adquiere planes avanzados y acorta tu camino a la adjudicación.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/panel/auctions/rules">
            <BookText className="mr-2 h-4 w-4" />
            Ver Reglamento
          </Link>
        </Button>
      </div>

      {auctions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {auctions.map(auction => {
            const mockActivationDate = auction.activationDate || '2024-01-01T00:00:00.000Z';
            const installments = generateInstallments(auction.capital, auction.plazo, mockActivationDate);
            
            const totalCuotasEmitidas = installments
              .slice(0, auction.cuotasPagadas)
              .reduce((acc, installment) => acc + installment.total, 0);

            const precioBase = totalCuotasEmitidas * 0.5;
            const startBid = Math.max(precioBase, auction.highestBid);

            const minBidIncrement = startBid * 0.03;
            const nextMinBid = startBid + minBidIncrement;

            const isManualOfferInvalid = !autoBidEnabled && (!offerAmount || Number(offerAmount) < nextMinBid);
            const isMaxBidInvalid = autoBidEnabled && (!maxBid || Number(maxBid) <= startBid);
            const isAutoIncrementInvalid = autoBidEnabled && (!autoIncrement || Number(autoIncrement) < minBidIncrement);
            
            const isOfferValid = autoBidEnabled
              ? !isMaxBidInvalid && !isAutoIncrementInvalid
              : !isManualOfferInvalid && !!offerAmount;
            
            return (
              <Card key={auction.id} className="flex flex-col">
                <CardHeader>
                  <CardDescription>Subasta del plan {auction.groupId} (Orden #{auction.orderNumber})</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrencyNoDecimals(auction.capital)} en {auction.plazo} meses</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                          <div>
                              <p className="text-sm text-muted-foreground">Mejor Oferta</p>
                              <p className="text-2xl font-bold text-primary">{formatCurrency(startBid)}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-sm text-muted-foreground">Precio Base</p>
                              <p className="text-base font-semibold">{formatCurrency(precioBase)}</p>
                          </div>
                      </div>
                      <div className="text-sm text-center border-t border-dashed pt-2">
                          <span className="text-muted-foreground">Puja mínima: </span>
                          <span className="font-semibold flex items-center justify-center gap-1"><ArrowUp className="h-4 w-4 text-green-500" />{formatCurrency(minBidIncrement)}</span>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span>{auction.cuotasPagadas} cuotas pagadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>{(auction.cuotasPagadas/auction.plazo * 100).toFixed(0)}% de avance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gavel className="h-4 w-4 text-muted-foreground" />
                      <span>{auction.numberOfBids} oferta{auction.numberOfBids !== 1 && 's'}</span>
                    </div>
                    <ClientCountdown endDate={auction.endDate} isUrgent={auction.isPostAdjudicacion} />
                  </div>
                </CardContent>
                <CardFooter className="flex-col items-stretch gap-2 pt-4">
                  <Dialog open={openDialogs[auction.id] || false} onOpenChange={(open) => handleOpenChange(auction.id, open)}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-full">
                            <Button 
                              className="w-full"
                              onClick={() => !auction.isMine && handleOpenChange(auction.id, true)} 
                              disabled={auction.isMine}
                            >
                              Hacer una oferta
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {auction.isMine && (
                          <TooltipContent>
                            <p>No puedes ofertar en tu propio plan.</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Hacer una oferta por el plan {auction.groupId}</DialogTitle>
                        <DialogDescription>Tu oferta debe ser igual o mayor a la próxima puja mínima.</DialogDescription>
                      </DialogHeader>
                      
                      {!isVerified ? (
                          <div className="space-y-4">
                              <Alert variant="destructive">
                                  <ShieldAlert className="h-4 w-4" />
                                  <AlertTitle>Verificación de Identidad Requerida</AlertTitle>
                                  <AlertDescription>
                                      Para poder realizar una oferta, primero debes completar el proceso de verificación de identidad. Es un requisito legal para garantizar la seguridad de todos los miembros.
                                  </AlertDescription>
                              </Alert>
                              <DialogFooter>
                                  <DialogClose asChild>
                                      <Button type="button" variant="secondary">Cancelar</Button>
                                  </DialogClose>
                                  <Button asChild>
                                      <Link href="/panel/verify">Ir a Verificar</Link>
                                  </Button>
                              </DialogFooter>
                          </div>
                      ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="font-medium">Puja Actual:</div>
                              <div className="text-right font-bold">{formatCurrency(startBid)}</div>
                              <div className="font-medium">Próxima Puja Mínima:</div>
                              <div className="text-right font-bold">{formatCurrency(nextMinBid)}</div>
                            </div>
                            
                            <Separator />

                            <div className="flex items-center justify-between">
                                <Label htmlFor="autobid-switch" className="flex items-center gap-2">
                                  <Bot className="h-5 w-5" />
                                  <span>Oferta Automática</span>
                                </Label>
                                <Switch id="autobid-switch" checked={autoBidEnabled} onCheckedChange={setAutoBidEnabled} disabled={termsAccepted}/>
                              </div>
                              
                              {autoBidEnabled ? (
                                  <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                                    <p className="text-xs text-muted-foreground">El sistema pujará por ti hasta alcanzar tu límite, usando el incremento que definas.</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="max-bid">Oferta Máxima (USD)</Label>
                                          <Input 
                                              id="max-bid" 
                                              type="number" 
                                              placeholder={`> ${formatCurrency(startBid)}`}
                                              value={maxBid}
                                              onChange={(e) => setMaxBid(e.target.value)}
                                              className={cn(Number(maxBid) > 0 && isMaxBidInvalid && "border-red-500")}
                                              disabled={termsAccepted}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="auto-increment">Incremento por Puja (USD)</Label>
                                          <Input 
                                              id="auto-increment" 
                                              type="number" 
                                              placeholder={`Min: ${formatCurrency(minBidIncrement)}`}
                                              value={autoIncrement}
                                              onChange={(e) => setAutoIncrement(e.target.value)}
                                              className={cn(Number(autoIncrement) > 0 && isAutoIncrementInvalid && "border-red-500")}
                                              disabled={termsAccepted}
                                          />
                                        </div>
                                    </div>
                                  </div>
                              ) : (
                                  <div className="space-y-2">
                                      <Label htmlFor="offer-amount">Tu Oferta (USD)</Label>
                                      <Input 
                                          id="offer-amount" 
                                          type="number" 
                                          placeholder={formatCurrency(nextMinBid)}
                                          value={offerAmount}
                                          onChange={(e) => setOfferAmount(e.target.value)}
                                          className={cn(isManualOfferInvalid && offerAmount && "border-red-500")}
                                          disabled={termsAccepted}
                                      />
                                  </div>
                              )}
                            
                            <div className="items-top flex space-x-2 pt-2">
                                <Switch id="terms" checked={termsAccepted} onCheckedChange={setTermsAccepted} disabled={!isOfferValid || !hasReadRules} />
                                <div className="grid gap-1.5 leading-none">
                                  <Label htmlFor="terms" className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2", (!isOfferValid || !hasReadRules) && "text-muted-foreground")}>
                                    Acepto los términos y condiciones
                                    <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                                      <Link href="/panel/auctions/rules" target="_blank" onClick={() => setHasReadRules(true)}>
                                        (Ver Reglamento)
                                      </Link>
                                    </Button>
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    Si ganas la subasta, te comprometes a pagar el monto ofertado. Se aplicará una comisión del 2% (+IVA) sobre el valor final.
                                  </p>
                                  {!hasReadRules && (
                                      <p className="text-xs text-amber-600 font-semibold">
                                      Debes hacer clic en 'Ver Reglamento' para poder aceptar los términos.
                                      </p>
                                  )}
                                  {hasReadRules && !isOfferValid && (
                                      <p className="text-xs text-amber-600 font-semibold">
                                          Debes ingresar una oferta válida para poder aceptar los términos.
                                      </p>
                                  )}
                                </div>
                              </div>
                            
                              <DialogFooter>
                                  <DialogClose asChild>
                                      <Button type="button" variant="secondary">Cancelar</Button>
                                  </DialogClose>
                                  <Button 
                                      type="button" 
                                      onClick={() => handleConfirmOffer(auction)}
                                      disabled={!termsAccepted || !isOfferValid}
                                  >
                                      Confirmar Oferta
                                  </Button>
                              </DialogFooter>
                          </div>
                      )}

                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-4 border border-dashed rounded-lg">
            <SearchX className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold">No hay subastas activas</h3>
            <p className="max-w-md">
                En este momento, no hay planes en el mercado secundario. ¡Vuelve a consultar más tarde o sé el primero en poner un plan en subasta!
            </p>
        </div>
      )}
    </>
  );
}
