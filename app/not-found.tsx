import Link from 'next/link';
import Heading from '@/components/Heading';

export default function NotFound() {
  return (
    <section className="page-h">
      <Heading light="404" bold="ไม่พบหน้านี้" />
      <p className="lede">ลิงก์อาจพิมพ์ผิด หรือผลงานถูกซ่อนไปแล้ว</p>
      <div>
        <Link className="btn" href="/projects/">
          See projects <span className="arrow">→</span>
        </Link>
      </div>
    </section>
  );
}
