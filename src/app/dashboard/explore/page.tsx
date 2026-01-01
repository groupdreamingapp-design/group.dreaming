
'use client';

import { useState, useEffect } from "react";
import { initialGroups } from "@/lib/data";
import { GroupCard } from "@/components/app/group-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Group } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SlidersHorizontal, ListRestart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const capitalOptions = [5000, 10000, 15000, 20000, 25000];
const plazoOptions = [12, 24, 36, 48, 60, 72, 84];
const cuotaRanges = [
  { label: "$0 - $200", min: 0, max: 200 },
  { label: "$201 - $400", min: 201, max: 400 },
  { label: "$401 - $600", min: 401, max: 600 },
  { label: "$601 - $800", min: 601, max: 800 },
  { label: "$801 - $1000", min: 801, max: 1000 },
];

type SortKey = 'capital_asc' | 'capital_desc' | 'plazo_asc' | 'plazo_desc' | 'cuota_asc' | 'cuota_desc' | 'miembros_faltantes';


export default function ExploreGroupsDashboardPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    capital: [] as number[],
    plazo: [] as number[],
    cuota: [] as { min: number; max: number }[],
  });
  const [sortKey, setSortKey] = useState<SortKey>('miembros_faltantes');

  useEffect(() => {
    // Simulate client-side data fetching and processing
    setGroups(initialGroups);
    setLoading(false);
  }, []);

  const handleFilterChange = (type: 'capital' | 'plazo', value: number) => {
    setFilters(prev => {
      const current = prev[type] as number[];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const handleCuotaChange = (range: { min: number; max: number }) => {
    setFilters(prev => {
      const current = prev.cuota;
      const isSelected = current.some(r => r.min === range.min && r.max === range.max);
      const updated = isSelected
        ? current.filter(r => r.min !== range.min || r.max !== range.max)
        : [...current, range];
      return { ...prev, cuota: updated };
    });
  };

  const clearFilters = () => {
    setFilters({ capital: [], plazo: [], cuota: [] });
  };

  const processedGroups = (() => {
    if (loading) return [];
    let filteredGroups: Group[] = groups.filter(g => g.status === 'Abierto' && !g.userIsMember);

    if (filters.capital.length > 0) {
      filteredGroups = filteredGroups.filter(g => filters.capital.includes(g.capital));
    }
    if (filters.plazo.length > 0) {
      filteredGroups = filteredGroups.filter(g => filters.plazo.includes(g.plazo));
    }
    if (filters.cuota.length > 0) {
      filteredGroups = filteredGroups.filter(g => 
        filters.cuota.some(range => g.cuotaPromedio >= range.min && g.cuotaPromedio <= range.max)
      );
    }
    
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

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Explorar Grupos Disponibles</h1>
        <p className="text-muted-foreground">Encuentra el plan perfecto que se adapte a tus sueños.</p>
      </div>

      <Collapsible className="mb-8" defaultOpen>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Filtros de Búsqueda</CardTitle>
                <CardDescription>Usa los filtros para encontrar tu plan ideal.</CardDescription>
            </div>
              <CollapsibleTrigger asChild>
              <Button variant="ghost">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Mostrar/Ocultar Filtros
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Capital (USD)</h3>
                  <ScrollArea className="h-40">
                    <div className="space-y-2 pr-4">
                      {capitalOptions.map(option => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`capital-${option}`} 
                            onCheckedChange={() => handleFilterChange('capital', option)}
                            checked={filters.capital.includes(option)}
                          />
                          <Label htmlFor={`capital-${option}`} className="font-normal">{formatCurrency(option)}</Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Plazo (Meses)</h3>
                  <ScrollArea className="h-40">
                    <div className="space-y-2 pr-4">
                      {plazoOptions.map(option => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`plazo-${option}`} 
                            onCheckedChange={() => handleFilterChange('plazo', option)}
                            checked={filters.plazo.includes(option)}
                          />
                          <Label htmlFor={`plazo-${option}`} className="font-normal">{option} meses</Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Cuota Promedio</h3>
                    <ScrollArea className="h-40">
                    <div className="space-y-2 pr-4">
                      {cuotaRanges.map(range => (
                        <div key={range.label} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`cuota-${range.label}`} 
                            onCheckedChange={() => handleCuotaChange(range)}
                            checked={filters.cuota.some(r => r.min === range.min && r.max === range.max)}
                          />
                          <Label htmlFor={`cuota-${range.label}`} className="font-normal">{range.label}</Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
              <CardFooter>
                <Button variant="ghost" onClick={clearFilters}>
                    <ListRestart className="mr-2 h-4 w-4" />
                    Limpiar Filtros
                </Button>
            </CardFooter>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      
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
                isPublic={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground col-span-full">
              <p>No se encontraron grupos con los filtros seleccionados.</p>
              <p>Intenta modificar tu búsqueda o <Button variant="link" className="p-0 h-auto" onClick={clearFilters}>borrar los filtros</Button>.</p>
          </div>
        )}
      </section>
    </>
  );
}
