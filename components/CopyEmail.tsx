'use client';

import { useRef, useState } from 'react';

export default function CopyEmail({ email }: { email: string }) {
  const ref = useRef<HTMLElement>(null);
  const [label, setLabel] = useState('คัดลอก');

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
    <div className="copy-row">
      <code ref={ref}>{email}</code>
      <button type="button" className="btn ghost sm" onClick={copy}>
        {label}
      </button>
    </div>
  );
}
