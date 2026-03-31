import { redirect } from 'next/navigation';

export default async function UnitRedirectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  redirect(`/passport/${token}`);
}
