
import { groups, installments } from '@/lib/data';
import { GroupDetailClient } from './group-detail-client';

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const groupId = params.id;
  const group = groups.find(g => g.id === groupId);
  const groupInstallments = installments; // In a real app, this would be filtered by group

  return <GroupDetailClient group={group} installments={groupInstallments} />;
}
