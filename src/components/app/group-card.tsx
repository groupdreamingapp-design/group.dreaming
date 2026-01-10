
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Group } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, CheckCircle2, Lock, Hourglass, ArrowRight, Trophy, Gavel, CalendarCheck, Zap, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { calculateTotalFinancialCost } from "@/lib/data";
import Image from "next/image";
import { useUser } from "@/firebase";

type GroupCardProps = {
  group: Group;
};

// Component to safely format dates on the client side, avoiding hydration mismatch.
function ClientFormattedDate({ dateString, formatString }: { dateString: string, formatString: string }) {
  const [formattedDate, setFormattedDate] = useState(dateString);

  useEffect(() => {
    try {
      const date = parseISO(dateString);
      setFormattedDate(format(date, formatString, { locale: es }));
    } catch (error) {
      setFormattedDate(dateString); // Fallback to original string on error
    }
  }, [dateString, formatString]);

  return <>{formattedDate}</>;
}


const statusConfig = {
  Abierto: { icon: Users, color: "bg-blue-500", text: "text-blue-500" },
  Pendiente: { icon: Hourglass, color: "bg-yellow-500", text: "text-yellow-700" },
  Activo: { icon: CheckCircle2, color: "bg-green-500", text: "text-green-700" },
  Cerrado: { icon: Lock, color: "bg-gray-500", text: "text-gray-500" },
  Subastado: { icon: Gavel, color: "bg-red-500", text: "text-red-700" },
};

export function GroupCard({ group }: GroupCardProps) {
  const { user } = useUser();
  const { icon: StatusIcon } = statusConfig[group.status];
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  const totalFinancialCost = calculateTotalFinancialCost(group.capital, group.plazo);

  const progressValue = group.status === 'Abierto'
    ? (group.membersCount / group.totalMembers) * 100
    : group.status === 'Activo' || group.status === 'Subastado'
    ? ((group.monthsCompleted || 0) / group.plazo) * 100
    : group.status === 'Cerrado'
    ? 100 : (group.status === 'Pendiente' ? 100 : 0);
  
  const membersMissing = group.totalMembers - group.membersCount;
  const isFewMembersLeft = membersMissing > 0 && membersMissing <= 5 && !group.isImmediateActivation;

  const progressText = group.status === 'Abierto'
    ? `${group.membersCount} de ${group.totalMembers} miembros`
    : (group.status === 'Activo' || group.status === 'Subastado')
    ? `${group.monthsCompleted} de ${group.plazo} meses`
    : group.status === 'Pendiente'
    ? `Validando (${group.totalMembers}/${group.totalMembers})`
    : 'Grupo finalizado';
    
  const getCardLink = () => {
    if (user) {
      return group.userIsMember ? `/panel/group/${group.id}` : `/panel/group-public/${group.id}`;
    }
    return `/explore/group/${group.id}`;
  };

  const cardLink = getCardLink();


  const renderAction = () => {
    if (group.userIsMember) {
        return (
            <Button asChild variant="secondary" size="sm">
                <Link href={cardLink}>
                    Ver Detalles <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        );
    }

     if (user) {
        return (
            <Button asChild size="sm" disabled={group.status !== 'Abierto'}>
                <Link href={cardLink}>Unirme</Link>
            </Button>
        );
    }

    return (
        <Button asChild size="sm">
            <Link href={cardLink}>Ver Detalles</Link>
        </Button>
    )
  }

  const badgeClassName = cn(
    "border-current",
    group.status === 'Pendiente' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
    group.status === 'Activo' && 'bg-green-500/20 text-green-700 border-green-500/30',
    group.status === 'Abierto' && 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    group.status === 'Subastado' && 'bg-orange-500/20 text-orange-700 border-orange-500/30'
  );

  return (
    <TooltipProvider>
      <Card className="flex flex-col">
        <Link href={cardLink} className="flex flex-col flex-grow">
          <CardHeader className="p-0 relative">
            <div className="relative h-32 w-full">
              <Image 
                src={group.imageUrl}
                alt={group.name}
                fill
                className="object-cover rounded-t-lg"
                data-ai-hint={group.imageHint}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute bottom-2 left-4 text-white">
                <CardTitle className="text-xl [text-shadow:1px_1px_2px_rgba(0,0,0,0.8)]">{group.name}</CardTitle>
                <CardDescription className="text-white/90 [text-shadow:1px_1px_2px_rgba(0,0,0,0.8)]">{formatCurrency(group.capital)}</CardDescription>
              </div>
            </div>
             <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
                <Badge className={badgeClassName} variant="outline">
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {group.status}
                </Badge>
                {group.isImmediateActivation && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-red-500/20 text-red-700 border-red-500/30 animate-pulse">
                        <Zap className="mr-1 h-3 w-3" />
                        Activación Inmediata
                      </Badge>
                    </TooltipTrigger>
                     <TooltipContent>
                      <p>Este grupo se activa al instante. ¡El débito de la cuota 1 es inmediato!</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                 {isFewMembersLeft && (
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-red-500/20 text-red-700 border-red-500/30">
                        <Users className="mr-1 h-3 w-3" />
                        ¡Quedan pocos lugares!
                      </Badge>
                    </TooltipTrigger>
                     <TooltipContent>
                      <p>Este grupo está a punto de llenarse. ¡Asegura tu lugar!</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {group.userAwardStatus === 'Adjudicado - Aprobado' && (
                    <div className="absolute -top-1 -right-1 animate-bounce">
                        <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-400" />
                    </div>
                )}
              </div>
          </CardHeader>
          <CardContent className="flex-grow p-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progreso</span>
                  <span>{progressText}</span>
                </div>
                <div className="relative">
                  <Progress value={progressValue} aria-label={`Progreso del grupo ${progressValue.toFixed(0)}%`} className={cn(group.status === 'Abierto' && membersMissing > 0 && "bg-primary/20")} />
                  {group.status === 'Abierto' && membersMissing > 0 && !group.isImmediateActivation && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-neutral-800">Faltan {membersMissing}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{group.totalMembers} Miembros</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{group.plazo} Meses</span>
                </div>
                 {group.activationDate && (
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    <span>Activo desde: <ClientFormattedDate dateString={group.activationDate} formatString="dd/MM/yy" /></span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="cursor-help">CFT Promedio: <strong>{totalFinancialCost.toFixed(2)}%</strong></span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Costo Financiero Total promedio del plan.</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
              </div>
            </div>
          </CardContent>
        </Link>
        <CardFooter className="flex justify-between items-center bg-muted/50 p-3 mt-auto">
          <div className="text-center">
              <p className="text-xs text-muted-foreground">Cuota Promedio</p>
              <p className="font-bold text-base">{formatCurrency(group.cuotaPromedio)}</p>
          </div>
          {renderAction()}
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
