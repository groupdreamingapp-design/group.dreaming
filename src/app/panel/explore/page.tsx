
'use client';

import { useState, useEffect } from "react";
import { initialGroups } from "@/lib/data";
import { GroupCard } from "@/components/app/group-card";
import { Button } from "@/components/ui/button";
import type { Group } from "@/lib/types";
import { ListRestart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";


type SortKey = 'capital_asc' | 'capital_desc' | 'plazo_asc' | 'plazo_desc' | 'cuota_asc' | 'cuota_desc' | 'miembros_faltantes';


export default function ExploreGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('miembros_faltantes');

  useEffect(() => {
    // Simulate client-side data fetching and processing
    setGroups(initialGroups);
    setLoading(false);
  }, []);

  const processedGroups = (() => {
    if (loading) return [];
    let filteredGroups: Group[] = groups.filter(g => g.status === 'Abierto' && !g.userIsMember);
    
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
  })();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Explorar Grupos Disponibles</h1>
        <p className="text-muted-foreground">Encuentra el plan perfecto que se adapte a tus sueños.</p>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          {!loading && (
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
        {loading ? (
            <div className="text-center py-16 text-muted-foreground col-span-full">
                <p>Cargando grupos...</p>
            </div>
        ) : processedGroups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {processedGroups.map(group => (
              <GroupCard 
                key={group.id} 
                group={group}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground col-span-full">
              <p>No hay grupos disponibles en este momento.</p>
          </div>
        )}
      </section>
    </>
  );
}

