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
        <span className="label">ติดต่อ</span>
        <h1>ติดต่อเรื่องงาน</h1>
        <p className="lede">ส่งข้อความผ่านฟอร์ม หรือติดต่อตามช่องทางด้านล่าง</p>
      </section>
      <section className="two">
        <ContactForm endpoint={settings.contactEndpoint} />
        <div className="col">
          <div className="ci">
            <span className="label">อีเมล</span>
            <CopyEmail email={profile.email} />
          </div>
          {isLink(profile.linkedin) && (
            <div className="ci">
              <span className="label">LinkedIn</span>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                {host(profile.linkedin)}
              </a>
            </div>
          )}
          {isLink(profile.github) && (
            <div className="ci">
              <span className="label">GitHub</span>
              <a href={profile.github} target="_blank" rel="noopener noreferrer">
                {host(profile.github)}
              </a>
            </div>
          )}
          <div className="ci">
            <span className="label">พื้นที่</span>
            <span>{profile.location}</span>
          </div>
        </div>
      </section>
    </>
  );
}
