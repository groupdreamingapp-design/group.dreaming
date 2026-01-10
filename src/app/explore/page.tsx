
'use client';

import { useState, useEffect, useMemo } from "react";
import { GroupCard } from "@/components/app/group-card";
import { Button } from "@/components/ui/button";
import type { Group } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { useGroups } from "@/hooks/use-groups";
import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


type SortKey = 'capital_asc' | 'capital_desc' | 'plazo_asc' | 'plazo_desc' | 'cuota_asc' | 'cuota_desc' | 'miembros_faltantes';

const MAX_CAPITAL = 100000;

export default function ExploreGroups() {
  const { groups: allGroups, loading: groupsLoading } = useGroups();
  const [sortKey, setSortKey] = useState<SortKey>('miembros_faltantes');
  const { user, loading: userLoading } = useUser();
  const router = useRouter();


  useEffect(() => {
    // Redirect to panel if user is logged in
    if (!userLoading && user) {
      router.replace('/panel/explore');
    }
  }, [user, userLoading, router]);

  const subscribedCapital = useMemo(() => {
    return allGroups
        .filter(g => g.userIsMember && (g.status === 'Activo' || g.status === 'Abierto'))
        .reduce((acc, g) => acc + g.capital, 0);
  }, [allGroups]);


  const processedGroups = useMemo(() => {
    if (groupsLoading) return [];
    let filteredGroups: Group[] = allGroups.filter(g => g.status === 'Abierto' && !g.userIsMember);
    
    // Sorting logic
    filteredGroups.sort((a, b) => {
        switch (sortKey) {
            case 'capital_asc':
                return a.capital - b.capital;
            case 'capital_desc':
                return b.capital - a.capital;
            case 'plazo_asc':
                return a.plazo - b.plazo;
            case 'plazo_desc':
                return b.plazo - a.plazo;
            case 'cuota_asc':
                return a.cuotaPromedio - b.cuotaPromedio;
            case 'cuota_desc':
                return b.cuotaPromedio - a.cuotaPromedio;
            case 'miembros_faltantes':
                return (a.totalMembers - a.membersCount) - (b.totalMembers - b.membersCount);
            default:
                return 0;
        }
    });

    return filteredGroups;
  }, [allGroups, groupsLoading, sortKey]);
  
  if (userLoading || user) {
    return <div className="flex justify-center items-center h-full">Cargando...</div>;
  }

  const renderActionButton = (group: Group) => {
    const exceedsCapital = (subscribedCapital + group.capital) > MAX_CAPITAL;
    const cardLink = `/explore/group/${group.id}`;

    if (exceedsCapital) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">
              <Button size="sm" disabled className="w-full">
                <AlertCircle className="mr-2 h-4 w-4" />
                Cupo Excedido
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>El capital de este grupo excede tu cupo máximo para suscribir.</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
        <Button asChild size="sm">
            <Link href={cardLink}>Ver Detalles</Link>
        </Button>
    );
  }

  return (
    <TooltipProvider>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Explorar Grupos Disponibles</h1>
        <p className="text-muted-foreground">Encuentra el plan perfecto que se adapte a tus sueños.</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div>
          {!groupsLoading && (
            <p className="text-sm text-muted-foreground">
              {processedGroups.length} {processedGroups.length === 1 ? 'grupo encontrado' : 'grupos encontrados'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="sort-by" className="text-sm">Ordenar por:</Label>
          <Select onValueChange={(value: SortKey) => setSortKey(value)} defaultValue={sortKey}>
            <SelectTrigger className="w-[240px]" id="sort-by">
              <SelectValue placeholder="Seleccionar orden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="miembros_faltantes">Miembros Faltantes</SelectItem>
              <SelectItem value="cuota_asc">Cuota (menor a mayor)</SelectItem>
              <SelectItem value="cuota_desc">Cuota (mayor a menor)</SelectItem>
              <SelectItem value="capital_asc">Capital (menor a mayor)</SelectItem>
              <SelectItem value="capital_desc">Capital (mayor a menor)</SelectItem>
              <SelectItem value="plazo_asc">Plazo (menor a mayor)</SelectItem>
              <SelectItem value="plazo_desc">Plazo (mayor a menor)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <section>
        {groupsLoading ? (
            <div className="text-center py-16 text-muted-foreground col-span-full">
                <p>Cargando grupos...</p>
            </div>
        ) : processedGroups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {processedGroups.map(group => (
              <GroupCard 
                key={group.id} 
                group={group}
                actionButton={renderActionButton(group)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground col-span-full">
              <p>No se encontraron grupos disponibles.</p>
          </div>
        )}
      </section>
    </TooltipProvider>
  );
}
