import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import CopyEmail from '@/components/CopyEmail';
import { isLink, site } from '@/lib/data';

export const metadata: Metadata = { title: 'ติดต่อ' };

const host = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

export default function ContactPage() {
  const { profile, settings } = site;
  return (
    <>
      <section className="page-h">
        <p className="meta">ติดต่อ</p>
        <h1>คุยเรื่องงานกันได้</h1>
        <p className="lede">ส่งอีเมลโดยตรง หรือฝากข้อความไว้ในฟอร์ม จะตอบกลับภายใน 1–2 วันทำการ</p>
      </section>
      <section className="contact">
        <div className="channels">
          <div>
            <span className="meta">อีเมล</span>
            <CopyEmail email={profile.email} />
          </div>
          {isLink(profile.linkedin) && (
            <div>
              <span className="meta">LinkedIn</span>
              <a className="ulink" style={{ justifySelf: 'start' }} href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                {host(profile.linkedin)} ↗
              </a>
            </div>
          )}
          {isLink(profile.github) && (
            <div>
              <span className="meta">GitHub</span>
              <a className="ulink" style={{ justifySelf: 'start' }} href={profile.github} target="_blank" rel="noopener noreferrer">
                {host(profile.github)} ↗
              </a>
            </div>
          )}
          <div>
            <span className="meta">พื้นที่</span>
            <span>{profile.location}</span>
          </div>
        </div>
        <ContactForm endpoint={settings.contactEndpoint} />
      </section>
    </>
  );
}
