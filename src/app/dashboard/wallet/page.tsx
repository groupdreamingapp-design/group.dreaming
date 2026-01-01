
'use client';

import { useState } from 'react';
import { transactions } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, Upload, Calendar as CalendarIcon, ListRestart } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { PaymentMethods } from '@/components/app/payment-methods';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


type TransactionTypeFilter = 'todos' | 'ingreso' | 'egreso';

export default function WalletPage() {
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('todos');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(amount);
  const availableBalance = transactions.reduce((acc, tx) => acc + tx.amount, 0);

  const filteredTransactions = transactions.filter(tx => {
    const transactionDate = parseISO(tx.date);
    
    // Filter by type
    if (typeFilter === 'ingreso' && tx.amount <= 0) return false;
    if (typeFilter === 'egreso' && tx.amount > 0) return false;

    // Filter by date range
    if (dateRange?.from) {
        if (transactionDate < startOfDay(dateRange.from)) return false;
    }
    if (dateRange?.to) {
        if (transactionDate > endOfDay(dateRange.to)) return false;
    }

    return true;
  });
  
  const resetFilters = () => {
    setTypeFilter('todos');
    setDateRange(undefined);
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold font-headline">Billetera</h1>
        <p className="text-muted-foreground">Tu centro de control financiero en Group Dreaming.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Saldo Disponible</CardTitle>
            <CardDescription>Dinero disponible para usar en la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{formatCurrency(availableBalance)}</p>
            <p className="text-sm text-muted-foreground">USDC</p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button className="w-full">
              <Upload className="mr-2 h-4 w-4" /> Depositar
            </Button>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" /> Retirar
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2">
           <CardHeader>
                <CardTitle>Métodos de Pago</CardTitle>
                <CardDescription>Configura cómo se realizarán tus pagos de débito automático.</CardDescription>
            </CardHeader>
            <CardContent>
                <PaymentMethods />
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Historial de Movimientos</CardTitle>
              <CardDescription>Consulta y filtra todas tus transacciones.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TransactionTypeFilter)}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los tipos</SelectItem>
                      <SelectItem value="ingreso">Ingresos</SelectItem>
                      <SelectItem value="egreso">Egresos</SelectItem>
                    </SelectContent>
                </Select>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full md:w-[300px] justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                
                <Button variant="ghost" onClick={resetFilters} className="text-muted-foreground">
                    <ListRestart className="mr-2 h-4 w-4" />
                    Limpiar
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{format(parseISO(tx.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant={tx.amount > 0 ? "outline" : "secondary"} className={cn(
                      tx.amount > 0 && "border-green-500/50 text-green-700",
                      tx.amount <= 0 && "border-red-500/50 text-red-700",
                    )}>
                      {tx.amount > 0 ? "Ingreso" : "Egreso"}
                    </Badge>
                  </TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell className={cn("text-right font-mono", tx.amount > 0 ? "text-green-600" : "text-red-600")}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={tx.status === "Completado" ? "default" : "secondary"} className={cn(tx.status === "Completado" ? "bg-green-500/20 text-green-700 border-green-500/30" : "")}>{tx.status}</Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No se encontraron transacciones con los filtros seleccionados.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
