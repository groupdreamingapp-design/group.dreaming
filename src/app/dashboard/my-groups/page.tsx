
'use client';

import { useMemo } from "react";
import { useGroups } from "@/hooks/use-groups";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GroupCard } from "@/components/app/group-card"
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MyGroupsPage() {
  const { groups } = useGroups();

  const myGroups = useMemo(() => groups.filter(g => g.userIsMember), [groups]);
  const activeGroups = useMemo(() => myGroups.filter(g => g.status === 'Activo' || g.status === 'Abierto' || g.status === 'Pendiente'), [myGroups]);
  const closedGroups = useMemo(() => myGroups.filter(g => g.status === 'Cerrado'), [myGroups]);

  return (
    <>
        <div>
            <h1 className="text-3xl font-bold font-headline">Mis Grupos</h1>
            <p className="text-muted-foreground">Un resumen de todos tus planes de ahorro colectivo.</p>
        </div>
      
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="activos" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                <TabsTrigger value="activos">Activos</TabsTrigger>
                <TabsTrigger value="finalizados">Finalizados</TabsTrigger>
              </TabsList>
              <TabsContent value="activos">
                  {activeGroups.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                          {activeGroups.map(group => (
                              <GroupCard key={group.id} group={group} />
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-4">
                          <p>Aún no te has unido a ningún grupo.</p>
                          <Button asChild>
                            <Link href="/dashboard/explore">
                              ¡Explora los grupos disponibles y empieza a cumplir tus sueños!
                            </Link>
                          </Button>
                      </div>
                  )}
              </TabsContent>
              <TabsContent value="finalizados">
                  {closedGroups.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                          {closedGroups.map(group => (
                              <GroupCard key={group.id} group={group} />
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-16 text-muted-foreground">
                          <p>No tienes grupos finalizados.</p>
                      </div>
                  )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
    </>
  );
}
