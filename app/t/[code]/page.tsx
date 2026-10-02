import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ code: string }>;
}

export default async function PrivateTicketRedirectPage({ params }: Props) {
  const { code } = await params;
  if (code) {
    redirect(`/?ticket=${encodeURIComponent(code)}`);
  } else {
    redirect('/');
  }
}
