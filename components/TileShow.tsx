'use client';
import { useEffect, useRef, useState } from 'react';

const STEP = 1500; // ms ต่อรูป
const SWIPE = 40; // px ขั้นต่ำที่นับเป็นการปัด

/* รูปของการ์ดผลงาน: เอาเมาส์ชี้ = วนรูปปก + รูปประกอบ, เอาเมาส์ออก = กลับรูปปก
   มือถือ/จอสัมผัส: วนเองตอนการ์ดอยู่บนจอ + ปัดซ้าย/ขวาเพื่อเปลี่ยนรูปเอง
   ผู้ใช้ตั้งลดการเคลื่อนไหว = ไม่วนเอง (แต่ยังปัดได้) */
export default function TileShow({ srcs, alt }: { srcs: string[]; alt: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const manual = useRef(false);
  const [i, setI] = useState(0);
  const [on, setOn] = useState(false);
  const [kick, setKick] = useState(0); // เปลี่ยนเมื่อปัด เพื่อเริ่มนับเวลาใหม่
  const n = srcs.length;
  const cur = i % n; // กันเลขเกินเมื่อสไลด์หน้าแรกสลับไปผลงานที่มีรูปน้อยกว่า

  useEffect(() => {
    const el = ref.current;
    const host = el?.closest('a') || el?.parentElement;
    if (!el || !host || n < 2) return;
    const off: (() => void)[] = [];
    const listen = <K extends keyof HTMLElementEventMap>(t: K, f: (e: HTMLElementEventMap[K]) => void, capture = false) => {
      host.addEventListener(t, f, capture);
      off.push(() => host.removeEventListener(t, f, capture));
    };

    // ปัดเปลี่ยนรูป (ทุกอุปกรณ์ที่เป็นจอสัมผัส)
    let x0 = 0, y0 = 0, swiped = false;
    listen('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; swiped = false; }, true);
    listen('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) < SWIPE || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      swiped = true;
      manual.current = true;
      setI((x) => (x + (dx < 0 ? 1 : -1) + n) % n);
      setKick((k) => k + 1);
    });
    // ปัดแล้วไม่ให้นับเป็นการแตะเปิดหน้าผลงาน
    listen('click', (e) => { if (swiped) { e.preventDefault(); e.stopPropagation(); swiped = false; } }, true);

    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
        listen('mouseenter', () => setOn(true));
        listen('mouseleave', () => { setOn(false); setI(0); });
      } else {
        const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.5 });
        io.observe(el);
        off.push(() => io.disconnect());
      }
    }
    return () => off.forEach((f) => f());
  }, [n]);

  useEffect(() => {
    if (!on) { manual.current = false; return; }
    if (!manual.current) setI((x) => (x + 1) % n); // เปลี่ยนรูปแรกทันที ไม่ต้องรอ (ยกเว้นเพิ่งปัดเอง)
    manual.current = false;
    const t = setInterval(() => setI((x) => (x + 1) % n), STEP);
    return () => clearInterval(t);
  }, [on, n, kick]);

  return (
    <span ref={ref} className="tile-show">
      {srcs.map((s, k) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={s} src={s} alt={k === 0 ? alt : ''} loading="lazy" className={k === cur ? 'on' : ''} />
      ))}
      {n > 1 && (
        <span className="tile-dots">
          {srcs.map((s, k) => <i key={s} className={k === cur ? 'on' : ''} />)}
        </span>
      )}
    </span>
  );
}
