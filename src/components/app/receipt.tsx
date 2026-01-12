

'use client';

import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead, TableFooter } from "@/components/ui/table";
import type { Installment, Group, Award } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Printer, Ticket, HandCoins, Gift } from "lucide-react";
import { useRef } from "react";
import { useUser } from "@/firebase";

interface ReceiptProps {
    installment: Installment;
    group: Group;
    awards: Award[];
}

export function InstallmentReceipt({ installment, group, awards }: ReceiptProps) {
    const { user, loading } = useUser();
    const receiptRef = useRef<HTMLDivElement>(null);
    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(amount);

    const handlePrint = () => {
        const printContent = receiptRef.current;
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Recibo</title>');
                // Manually link the stylesheet
                const styles = Array.from(document.styleSheets)
                    .map(styleSheet => {
                        try {
                            return Array.from(styleSheet.cssRules)
                                .map(rule => rule.cssText)
                                .join('');
                        } catch (e) {
                            return `<link rel="stylesheet" href="${styleSheet.href}">`;
                        }
                    }).join('');

                printWindow.document.write(`<style>${styles}</style></head><body>`);
                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                setTimeout(() => { // Wait for content to load
                    printWindow.print();
                }, 500);
            }
        }
    };
    
    const companyData = {
        name: "GROUP DREAMING S.A.S.",
        cuit: "30-71888999-1",
        address: "Av. Rivadavia 5920, Caballito, CABA",
    }
    
    const receiptId = `R${installment.number.toString().padStart(4, '0')}-${group.id.split('-')[1]}`;
    const paymentDate = new Date(); // Simulate payment date as today
    const isAdvancedPayment = installment.total === installment.breakdown.alicuotaPura;
    const previousMonthNumber = installment.number - 1;

    return (
        <div className="bg-background text-foreground p-4 md:p-8">
             <div ref={receiptRef} className="max-w-2xl mx-auto border bg-background text-foreground rounded-lg p-8 shadow-lg">
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
                        {!loading && user && (
                          <>
                            <p>{user.displayName || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">Email: {user.email || 'N/A'}</p>
                          </>
                        )}
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
                            {isAdvancedPayment ? (
                                <TableRow>
                                    <TableCell>Alícuota Pura (Adelanto)</TableCell>
                                    <TableCell className="text-right">{formatCurrency(installment.breakdown.alicuotaPura)}</TableCell>
                                </TableRow>
                            ) : (
                                <>
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
                                </>
                            )}
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
                             <p>{isAdvancedPayment ? "Adelanto de Saldo" : "Débito de Wallet GD"}</p>
                        </div>
                        <div className="text-right">
                           <h3 className="text-sm font-semibold mb-2">Vencimiento Original:</h3>
                           <p>{format(parseISO(installment.dueDate), 'dd/MM/yyyy')}</p>
                        </div>
                    </div>
                </section>
                
                <section className="mt-6 pt-4 border-t">
                    {previousMonthNumber > 0 && awards.length > 0 && !isAdvancedPayment ? (
                        <div>
                            <h3 className="text-sm font-semibold mb-3">Información de Adjudicación (Mes Anterior: {previousMonthNumber}):</h3>
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
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center">
                           {installment.number === 1 ? "El primer acto de adjudicación se reflejará en su próximo recibo." : "No hubo adjudicaciones para informar del mes anterior."}
                        </p>
                    )}
                </section>

                <footer className="mt-8 text-center text-xs text-muted-foreground">
                    <p>Este es un comprobante de pago no fiscal. Válido para uso interno.</p>
                </footer>
            </div>
             <div className="flex justify-end mt-4">
                <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Recibo
                </Button>
            </div>
        </div>
    );
}
