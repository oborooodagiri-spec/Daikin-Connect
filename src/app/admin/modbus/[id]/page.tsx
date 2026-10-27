import GatewayDetailView from "./GatewayDetailView";

export default async function GatewayDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;

  return <GatewayDetailView gatewayId={id} initialTab={tab} />;
}
