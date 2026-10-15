import { isLink, site } from '@/lib/data';
import ContactForm from './ContactForm';
import CopyEmail from './CopyEmail';

const host = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

// ฟอร์มพื้นเทา + กล่องช่องทางติดต่อสีเข้ม (ใช้ทั้งหน้าแรกและหน้าติดต่อ)
export default function ContactBlock() {
  const { profile, settings } = site;
  return (
    <div className="contact">
      <ContactForm endpoint={settings.contactEndpoint} />
      <aside className="info">
        <div style={{ display: 'grid', gap: 6 }}>
          <span className="caps">Email</span>
          <CopyEmail email={profile.email} />
        </div>
        {profile.phone && (
          <div style={{ display: 'grid', gap: 6 }}>
            <span className="caps">Phone</span>
            <a href={`tel:${profile.phone.replace(/[^\d+]/g, '')}`}>{profile.phone}</a>
          </div>
        )}
        {isLink(profile.linkedin) && (
          <div style={{ display: 'grid', gap: 6 }}>
            <span className="caps">LinkedIn</span>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              {host(profile.linkedin)} ↗
            </a>
          </div>
        )}
        {isLink(profile.github) && (
          <div style={{ display: 'grid', gap: 6 }}>
            <span className="caps">GitHub</span>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">
              {host(profile.github)} ↗
            </a>
          </div>
        )}
        <div style={{ display: 'grid', gap: 6 }}>
          <span className="caps">Location</span>
          <span>{profile.location}</span>
        </div>
      </aside>
    </div>
  );
}
