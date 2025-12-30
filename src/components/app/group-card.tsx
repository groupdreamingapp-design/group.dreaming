import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Group } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, CheckCircle2, Lock, Hourglass, Ticket, Gavel, Trophy, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type GroupCardProps = {
  group: Group;
  showJoinButton?: boolean;
};

const statusConfig = {
  Abierto: { icon: Users, color: "bg-blue-500", text: "text-blue-500" },
  Pendiente: { icon: Hourglass, color: "bg-yellow-500", text: "text-yellow-500" },
  Activo: { icon: CheckCircle2, color: "bg-green-500", text: "text-green-500" },
  Cerrado: { icon: Lock, color: "bg-gray-500", text: "text-gray-500" },
};

export function GroupCard({ group, showJoinButton = false }: GroupCardProps) {
  const { icon: StatusIcon } = statusConfig[group.status];
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const progressValue = group.status === 'Abierto'
    ? (group.membersCount / group.totalMembers) * 100
    : group.status === 'Activo'
    ? ((group.monthsCompleted || 0) / group.plazo) * 100
    : group.status === 'Cerrado'
    ? 100 : 0;

  const progressText = group.status === 'Abierto'
    ? `${group.membersCount} de ${group.totalMembers} miembros`
    : group.status === 'Activo'
    ? `${group.monthsCompleted} de ${group.plazo} meses`
    : 'Grupo finalizado';

  return (
    <Card className="flex flex-col">
      <Link href={`/dashboard/group/${group.id}`} className="flex flex-col flex-grow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardDescription>{group.id}</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(group.capital)}</CardTitle>
            </div>
            <div className="relative">
              <Badge className={cn(statusConfig[group.status].text, "border-current")} variant="outline">
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {group.status}
              </Badge>
              {group.userIsAwarded && (
                  <div className="absolute -top-3 -right-3 animate-bounce">
                      <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-400" />
                  </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Progreso</span>
                <span>{progressText}</span>
              </div>
              <Progress value={progressValue} aria-label={`Progreso del grupo ${progressValue.toFixed(0)}%`} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{group.totalMembers} Miembros</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{group.plazo} Meses</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex justify-between items-center bg-muted/50 p-4 mt-4">
        <div className="text-center">
            <p className="text-xs text-muted-foreground">Cuota Promedio</p>
            <p className="font-bold text-lg">{formatCurrency(group.cuotaPromedio)}</p>
        </div>
        {showJoinButton ? (
          <Button disabled={group.status !== 'Abierto'}>Unirse</Button>
        ) : (
          <Button asChild variant="secondary" size="sm">
            <Link href={`/dashboard/group/${group.id}`}>
              Ver Detalles <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}