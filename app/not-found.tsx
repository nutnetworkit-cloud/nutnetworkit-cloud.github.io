import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="page-h">
      <p className="meta">404</p>
      <h1>ไม่พบหน้านี้</h1>
      <p className="lede">ลิงก์อาจพิมพ์ผิด หรือผลงานถูกซ่อนไปแล้ว</p>
      <div className="hero-links">
        <Link className="ulink" href="/projects/">
          ดูผลงานทั้งหมด →
        </Link>
        <Link className="ulink" href="/">
          กลับหน้าแรก
        </Link>
      </div>
    </section>
  );
}
