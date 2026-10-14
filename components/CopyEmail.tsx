'use client';

import { useRef, useState } from 'react';

export default function CopyEmail({ email }: { email: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [label, setLabel] = useState('คัดลอกอีเมล');

  function selectText() {
    if (!ref.current) return;
    const r = document.createRange();
    r.selectNodeContents(ref.current);
    const s = window.getSelection();
    s?.removeAllRanges();
    s?.addRange(r);
    setLabel('เลือกไว้แล้ว กด Ctrl+C');
  }

  function copy() {
    try {
      navigator.clipboard.writeText(email).then(() => setLabel('คัดลอกแล้ว'), selectText);
    } catch {
      selectText();
    }
  }

  return (
    <>
      <a ref={ref} className="info-email" href={`mailto:${email}`}>
        {email}
      </a>
      <button type="button" className="textbtn" onClick={copy}>
        {label}
      </button>
    </>
  );
}
