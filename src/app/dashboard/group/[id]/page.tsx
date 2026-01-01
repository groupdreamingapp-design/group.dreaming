
import GroupDetailClient from './group-detail-client';

type GroupDetailPageProps = {
  params: { id: string };
};

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  return <GroupDetailClient groupId={params.id} />;
}
