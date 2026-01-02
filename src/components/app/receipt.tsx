
'use client';

import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead, TableFooter } from "@/components/ui/table";
import type { Installment, Group, User, Award } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Printer, Ticket, HandCoins, Gift } from "lucide-react";
import { useRef } from "react";

interface ReceiptProps {
    installment: Installment;
    group: Group;
    user: User;
    awards: Award[];
}

export function InstallmentReceipt({ installment, group, user, awards }: ReceiptProps) {
    const receiptRef = useRef<HTMLDivElement>(null);
    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(amount);

    const handlePrint = () => {
        window.print();
    };
    
    const companyData = {
        name: "GROUP DREAMING S.A.S.",
        cuit: "30-71888999-1",
        address: "Av. Rivadavia 5920, Caballito, CABA",
    }
    
    const receiptId = `R${installment.number.toString().padStart(4, '0')}-${group.id.split('-')[1]}`;
    const paymentDate = new Date(); // Simulate payment date as today

    return (
        <div className="bg-white text-black p-4 md:p-8" ref={receiptRef}>
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printable-area, .printable-area * {
                        visibility: visible;
                    }
                    .printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none;
                    }
                }
            `}</style>
            
             <div className="printable-area max-w-2xl mx-auto border bg-background text-foreground rounded-lg p-8 shadow-lg">
                <header className="flex justify-between items-start pb-4 border-b">
                    <div>
                        <h2 className="text-lg font-bold">{companyData.name}</h2>
                        <p className="text-xs text-muted-foreground">CUIT: {companyData.cuit}</p>
                        <p className="text-xs text-muted-foreground">{companyData.address}</p>
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold text-primary">RECIBO</h1>
                        <p className="font-mono text-sm">N°: {receiptId}</p>
                        <p className="text-xs text-muted-foreground">Fecha: {format(paymentDate, "dd/MM/yyyy")}</p>
                    </div>
                </header>

                <section className="grid grid-cols-2 gap-8 my-6">
                    <div>
                        <h3 className="text-sm font-semibold mb-2">Recibimos de:</h3>
                        <p>{user.name}</p>
                        <p className="text-sm text-muted-foreground">DNI: {user.dni}</p>
                        <p className="text-sm text-muted-foreground">CUIT: {user.cuit}</p>
                    </div>
                     <div className="text-right">
                        <h3 className="text-sm font-semibold mb-2">Por el siguiente concepto:</h3>
                        <p>Pago de Cuota N° {installment.number} / {group.plazo}</p>
                        <p className="text-sm text-muted-foreground">Grupo: {group.id}</p>
                        <p className="text-sm text-muted-foreground">Plan: {formatCurrency(group.capital)}</p>
                    </div>
                </section>

                <section>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Concepto</TableHead>
                                <TableHead className="text-right">Importe</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Alícuota Pura</TableCell>
                                <TableCell className="text-right">{formatCurrency(installment.breakdown.alicuotaPura)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Gastos Administrativos (IVA incl.)</TableCell>
                                <TableCell className="text-right">{formatCurrency(installment.breakdown.gastosAdm)}</TableCell>
                            </TableRow>
                             {installment.breakdown.derechoSuscripcion && (
                                <TableRow>
                                    <TableCell>Derecho de Suscripción (IVA incl.)</TableCell>
                                    <TableCell className="text-right">{formatCurrency(installment.breakdown.derechoSuscripcion)}</TableCell>
                                </TableRow>
                            )}
                            <TableRow>
                                <TableCell>Seguro de Vida s/ Saldo</TableCell>
                                <TableCell className="text-right">{formatCurrency(installment.breakdown.seguroVida)}</TableCell>
                            </TableRow>
                        </TableBody>
                        <TableFooter>
                            <TableRow className="font-bold text-base">
                                <TableCell>TOTAL ABONADO</TableCell>
                                <TableCell className="text-right">{formatCurrency(installment.total)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </section>
                
                <section className="mt-6 text-sm">
                    <div className="flex justify-between items-center">
                        <div>
                             <h3 className="text-sm font-semibold mb-2">Forma de Pago:</h3>
                             <p>Débito de Wallet GD</p>
                        </div>
                        <div className="text-right">
                           <h3 className="text-sm font-semibold mb-2">Vencimiento Original:</h3>
                           <p>{format(parseISO(installment.dueDate), 'dd/MM/yyyy')}</p>
                        </div>
                    </div>
                </section>
                
                 {awards.length > 0 && (
                    <section className="mt-6 pt-4 border-t">
                        <h3 className="text-sm font-semibold mb-3">Información de Adjudicación (Mes {installment.number}):</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                             {awards.find(a => a.type === 'sorteo') && (
                                <div className="flex items-center gap-2">
                                    <Ticket className="h-4 w-4 text-blue-500" />
                                    <span>Sorteo: Orden #{awards.find(a => a.type === 'sorteo')?.orderNumber}</span>
                                </div>
                             )}
                             {awards.find(a => a.type === 'licitacion') && (
                                <div className="flex items-center gap-2">
                                    <HandCoins className="h-4 w-4 text-orange-500" />
                                    <span>Licitación: Orden #{awards.find(a => a.type === 'licitacion')?.orderNumber}</span>
                                </div>
                             )}
                              {awards.filter(a => a.type === 'sorteo-especial').map((award, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Gift className="h-4 w-4 text-fuchsia-500" />
                                    <span>Sorteo Especial: Orden #{award.orderNumber > 0 ? award.orderNumber : '??'}</span>
                                </div>
                              ))}
                        </div>
                    </section>
                 )}

                <footer className="mt-8 text-center text-xs text-muted-foreground">
                    <p>Este es un comprobante de pago no fiscal. Válido para uso interno.</p>
                </footer>
            </div>
             <div className="flex justify-end mt-4 no-print">
                <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Recibo
                </Button>
            </div>
        </div>
    );
}
