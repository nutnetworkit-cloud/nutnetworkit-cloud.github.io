import type { Metadata } from 'next';
import AdminApp from '@/components/admin/AdminApp';
import Heading from '@/components/Heading';
import { site } from '@/lib/data';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <>
      <section className="page-h">
        <Heading light="Site" bold="Admin" />
      </section>
      <AdminApp endpoint={site.settings.contactEndpoint} />
    </>
  );
}
