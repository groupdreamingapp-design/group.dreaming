
'use client';

import { useMemo, useState } from "react";
import { useGroups } from "@/hooks/use-groups";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GroupCard } from "@/components/app/group-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Group, GroupStatus } from "@/lib/types";

export default function MyGroupsPage() {
  const { groups } = useGroups();
  const [activeTab, setActiveTab] = useState<GroupStatus | "Todos">("Todos");

  const myGroups = useMemo(() => groups.filter(g => g.userIsMember), [groups]);

  const filteredGroups = useMemo(() => {
    if (activeTab === "Todos") {
      return myGroups.sort((a, b) => {
        const statusOrder = { "Activo": 1, "Abierto": 2, "Pendiente": 3, "Cerrado": 4 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
    }
    return myGroups.filter(g => g.status === activeTab);
  }, [myGroups, activeTab]);

  const tabs: (GroupStatus | "Todos")[] = ["Todos", "Activo", "Abierto", "Pendiente", "Cerrado"];

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold font-headline">Mis Grupos</h1>
        <p className="text-muted-foreground">Un resumen de todos tus planes de ahorro colectivo.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Todos mis planes</CardTitle>
          <CardDescription>Aquí encontrarás todos los grupos a los que te has unido.</CardDescription>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as GroupStatus | "Todos")} className="pt-4">
            <TabsList>
              {tabs.map(tab => {
                const count = tab === "Todos" ? myGroups.length : myGroups.filter(g => g.status === tab).length;
                if (count > 0) {
                  return (
                    <TabsTrigger key={tab} value={tab}>
                      {tab} ({count})
                    </TabsTrigger>
                  );
                }
                return null;
              })}
            </TabsList>
          </Tabs>
        </CardHeader>

        {myGroups.length > 0 ? (
          <div className="p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredGroups.map(group => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
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
      </Card>
    </>
  );
}
