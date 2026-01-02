

'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Group } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, CheckCircle2, Lock, Hourglass, ArrowRight, Trophy, Gavel, CalendarCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type GroupCardProps = {
  group: Group;
  isPublic?: boolean;
};

const statusConfig = {
  Abierto: { icon: Users, color: "bg-blue-500", text: "text-blue-500" },
  Pendiente: { icon: Hourglass, color: "bg-yellow-500", text: "text-yellow-700" },
  Activo: { icon: CheckCircle2, color: "bg-green-500", text: "text-green-700" },
  Cerrado: { icon: Lock, color: "bg-gray-500", text: "text-gray-500" },
  Subastado: { icon: Gavel, color: "bg-red-500", text: "text-red-700" },
};

export function GroupCard({ group, isPublic = false }: GroupCardProps) {
  const { icon: StatusIcon } = statusConfig[group.status];
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  
  const [formattedActivationDate, setFormattedActivationDate] = useState<string | null>(null);

  useEffect(() => {
    if (group.activationDate) {
      const date = parseISO(group.activationDate);
      setFormattedActivationDate(format(date, 'dd/MM/yy'));
    }
  }, [group.activationDate]);


  const progressValue = group.status === 'Abierto'
    ? (group.membersCount / group.totalMembers) * 100
    : group.status === 'Activo' || group.status === 'Subastado'
    ? ((group.monthsCompleted || 0) / group.plazo) * 100
    : group.status === 'Cerrado'
    ? 100 : (group.status === 'Pendiente' ? 100 : 0);
  
  const membersMissing = group.totalMembers - group.membersCount;

  const progressText = group.status === 'Abierto'
    ? `${group.membersCount} de ${group.totalMembers} miembros`
    : (group.status === 'Activo' || group.status === 'Subastado')
    ? `${group.monthsCompleted} de ${group.plazo} meses`
    : group.status === 'Pendiente'
    ? `Validando (${group.totalMembers}/${group.totalMembers})`
    : 'Grupo finalizado';
    
  const cardLink = group.userIsMember ? `/panel/group/${group.id}` : `/panel/group-public/${group.id}`;

  const renderAction = () => {
    if (isPublic) {
      return (
        <Button asChild>
          <Link href="/register">Registrarse</Link>
        </Button>
      );
    }
    
    if (group.userIsMember) {
        return (
            <Button asChild variant="secondary" size="sm">
                <Link href={cardLink}>
                    Ver Detalles <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        );
    }

    return (
       <Button asChild size="sm" disabled={group.status !== 'Abierto'}>
          <Link href={cardLink}>Unirse</Link>
        </Button>
    );
  }

  const badgeClassName = cn(
    "border-current",
    group.status === 'Pendiente' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
    group.status === 'Activo' && 'bg-green-500/20 text-green-700 border-green-500/30',
    group.status === 'Abierto' && 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    group.status === 'Subastado' && 'bg-red-500/20 text-red-700 border-red-500/30'
  );

  return (
    <TooltipProvider>
      <Card className="flex flex-col">
        <Link href={cardLink} className="flex flex-col flex-grow">
          <CardHeader className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <CardDescription>{group.id}</CardDescription>
                <CardTitle className="text-xl">{formatCurrency(group.capital)}</CardTitle>
              </div>
              <div className="relative flex flex-col items-end gap-2">
                <Badge className={badgeClassName} variant="outline">
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {group.status}
                </Badge>
                {group.isImmediateActivation && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-fuchsia-500/20 text-fuchsia-700 border-fuchsia-500/30">
                        <Zap className="mr-1 h-3 w-3" />
                        Activación Inmediata
                      </Badge>
                    </TooltipTrigger>
                     <TooltipContent>
                      <p>Este grupo está a punto de activarse, ¡solo faltan {membersMissing}!</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {group.userIsAwarded && !isPublic && (
                    <div className="absolute -top-3 -right-3 animate-bounce">
                        <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-400" />
                    </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-4 pt-0">
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
                    <span>Activo desde: {formattedActivationDate || '...'}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Link>
        <CardFooter className="flex justify-between items-center bg-muted/50 p-3 mt-4">
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
