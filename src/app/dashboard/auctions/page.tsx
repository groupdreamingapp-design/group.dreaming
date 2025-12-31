
import { auctions } from "@/lib/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Tag, TrendingUp, Gavel, ArrowUp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuctionsPage() {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(amount);
  
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold font-headline">Subastas (Mercado Secundario)</h1>
        <p className="text-muted-foreground">Adquiere planes avanzados y acorta tu camino a la adjudicación.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {auctions.map(auction => {
          const minBidIncrement = auction.precioMinimo * 0.03;
          const nextMinBid = auction.highestBid + minBidIncrement;
          return (
            <Card key={auction.id} className="flex flex-col">
              <CardHeader>
                <CardDescription>Plan del {auction.groupId}</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(auction.capital)} en {auction.plazo} meses</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Mejor Oferta</p>
                            <p className="text-2xl font-bold text-primary">{formatCurrency(auction.highestBid)}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm text-muted-foreground">Precio Base</p>
                             <p className="text-base font-semibold">{formatCurrency(auction.precioMinimo)}</p>
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
                    <span>{auction.numberOfBids} ofertas</span>
                  </div>
                   <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Termina en 48 horas</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-2 pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Hacer una oferta</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Hacer una oferta por el plan {auction.groupId}</DialogTitle>
                      <DialogDescription>Tu oferta debe ser igual o mayor a la próxima puja mínima.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="font-medium">Mejor Oferta Actual:</div>
                        <div className="text-right font-bold">{formatCurrency(auction.highestBid)}</div>
                        <div className="font-medium">Próxima Puja Mínima:</div>
                        <div className="text-right font-bold">{formatCurrency(nextMinBid)}</div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="offer-amount">Tu Oferta (USD)</Label>
                        <Input id="offer-amount" type="number" placeholder={formatCurrency(nextMinBid)} />
                      </div>
                       <p className="text-xs text-muted-foreground">Si ganas la subasta, te comprometes a pagar el monto ofertado. Se aplicará una comisión del 2% (+IVA) sobre el valor final de la adjudicación.</p>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Confirmar Oferta</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </>
  );
}
