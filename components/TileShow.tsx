'use client';
import { useEffect, useRef, useState } from 'react';

const STEP = 1500; // ms ต่อรูป

/* รูปของการ์ดผลงาน: เอาเมาส์ชี้ = วนรูปปก + รูปประกอบ, เอาเมาส์ออก = กลับรูปปก
   จอสัมผัส (ไม่มี hover) วนเองตอนการ์ดอยู่บนจอ · ผู้ใช้ตั้งลดการเคลื่อนไหว = ไม่วน */
export default function TileShow({ srcs, alt }: { srcs: string[]; alt: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [i, setI] = useState(0);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const host = el?.closest('a') || el?.parentElement;
    if (!el || !host || srcs.length < 2) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (matchMedia('(hover: hover)').matches) {
      const enter = () => setOn(true);
      const leave = () => { setOn(false); setI(0); };
      host.addEventListener('mouseenter', enter);
      host.addEventListener('mouseleave', leave);
      return () => { host.removeEventListener('mouseenter', enter); host.removeEventListener('mouseleave', leave); };
    }
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [srcs.length]);

  useEffect(() => {
    if (!on) return;
    setI((x) => (x + 1) % srcs.length); // เปลี่ยนรูปแรกทันทีที่ชี้ ไม่ต้องรอ
    const t = setInterval(() => setI((x) => (x + 1) % srcs.length), STEP);
    return () => clearInterval(t);
  }, [on, srcs.length]);

  return (
    <span ref={ref} className="tile-show">
      {srcs.map((s, k) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={s} src={s} alt={k === 0 ? alt : ''} loading="lazy" className={k === i ? 'on' : ''} />
      ))}
      {srcs.length > 1 && (
        <span className="tile-dots">
          {srcs.map((s, k) => <i key={s} className={k === i ? 'on' : ''} />)}
        </span>
      )}
    </span>
  );
}
