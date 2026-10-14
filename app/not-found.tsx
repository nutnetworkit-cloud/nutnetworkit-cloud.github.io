import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="page-h">
      <span className="label">404</span>
      <h1>ไม่พบหน้านี้</h1>
      <p className="lede">ลิงก์อาจพิมพ์ผิด หรือผลงานถูกซ่อนไปแล้ว</p>
      <div className="ctas">
        <Link className="btn pri" href="/projects/">
          ดูผลงานทั้งหมด
        </Link>
        <Link className="btn ghost" href="/">
          กลับหน้าแรก
        </Link>
      </div>
    </section>
  );
}
