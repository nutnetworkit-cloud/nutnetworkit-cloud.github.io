'use client';

import { useState, type FormEvent } from 'react';

type State = { kind: 'idle' | 'sending' | 'sent' | 'error'; msg?: string };

export default function ContactForm({ endpoint }: { endpoint: string }) {
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const data = {
      name: String(f.get('name') || '').trim(),
      email: String(f.get('email') || '').trim(),
      message: String(f.get('message') || '').trim(),
      website: String(f.get('website') || '') // ช่องดักบอท ซ่อนจากคน
    };
    if (!data.name || !data.message) return setState({ kind: 'error', msg: 'กรอกชื่อและข้อความก่อนส่ง' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return setState({ kind: 'error', msg: 'อีเมลไม่ถูกต้อง ตรวจรูปแบบ เช่น name@company.com' });
    if (!endpoint) return setState({ kind: 'error', msg: 'ฟอร์มยังไม่ได้เชื่อมต่อ ติดต่อทางอีเมลด้านข้างแทนได้เลย' });

    setState({ kind: 'sending' });
    try {
      // Apps Script ไม่ส่ง CORS header → ส่งแบบ no-cors (อ่านผลตอบกลับไม่ได้ แต่ข้อความถูกบันทึก)
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      });
      form.reset();
      setState({ kind: 'sent', msg: 'ส่งข้อความแล้ว จะติดต่อกลับทางอีเมลภายใน 1–2 วันทำการ' });
    } catch {
      setState({ kind: 'error', msg: 'ส่งไม่สำเร็จ ตรวจการเชื่อมต่ออินเทอร์เน็ตแล้วลองอีกครั้ง หรือติดต่อทางอีเมลแทน' });
    }
  }

  return (
    <form className="panel form" onSubmit={onSubmit} noValidate>
      <div className="row2">
        <label className="field">
          <span>ชื่อ / บริษัท</span>
          <input type="text" name="name" id="c-name" maxLength={100} required />
        </label>
        <label className="field">
          <span>อีเมลสำหรับตอบกลับ</span>
          <input type="email" name="email" id="c-email" maxLength={200} required />
        </label>
      </div>
      <label className="field">
        <span>ข้อความ</span>
        <textarea name="message" id="c-body" rows={5} maxLength={3000} required placeholder="เช่น ตำแหน่งที่เปิดรับ และช่วงเวลาที่สะดวกสัมภาษณ์" />
      </label>
      <label className="hp" aria-hidden="true">
        เว็บไซต์ <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {state.msg && <p className={state.kind === 'sent' ? 'ok-msg' : 'err'} role="status">{state.msg}</p>}
      <button className="btn pri" type="submit" disabled={state.kind === 'sending'} style={{ justifySelf: 'start' }}>
        {state.kind === 'sending' ? 'กำลังส่ง…' : 'ส่งข้อความ'}
      </button>
    </form>
  );
}
