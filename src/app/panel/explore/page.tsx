
'use client';

import { useCollection } from '@/firebase/firestore/use-collection'; // Tu hook existente
import { GroupCard } from '@/components/app/group-card'; // Tu componente visual
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ExplorePage() {
  // Conectamos a la colección REAL "groups"
  const { data: groups, isLoading, error } = useCollection('groups');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error cargando grupos: {error.message}</div>;
  }

  if (!groups || groups.length === 0) {
    return <div>No hay círculos activos. ¡Sé el primero en crear uno!</div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Explorar Círculos de Ahorro</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group: any) => (
          <GroupCard
            key={group.id}
            group={group} // Pasamos el objeto real de Firebase
            actionButton={
              <Button asChild className="w-full">
                <Link href={`/panel/group-public/${group.id}`}>Ver Grupo</Link>
              </Button>
            }
          />
        ))}
      </div>
    </div>
  );
}