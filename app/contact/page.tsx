import type { Metadata } from 'next';
import ContactBlock from '@/components/ContactBlock';
import Heading from '@/components/Heading';

export const metadata: Metadata = { title: 'ติดต่อ' };

export default function ContactPage() {
  return (
    <>
      <section className="page-h">
        <Heading light="Contact" bold="Information" />
        <p className="lede">ส่งอีเมลโดยตรง หรือฝากข้อความไว้ในฟอร์ม จะตอบกลับภายใน 1–2 วันทำการ</p>
      </section>
      <ContactBlock />
    </>
  );
}
