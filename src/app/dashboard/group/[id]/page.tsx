import GroupDetailClient from './group-detail-client';

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  return <GroupDetailClient groupId={params.id} />;
}
