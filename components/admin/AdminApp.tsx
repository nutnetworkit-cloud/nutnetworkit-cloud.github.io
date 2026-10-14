'use client';

import { createContext, useCallback, useContext, useEffect, useState, type FormEvent } from 'react';

/* หน้า admin: ทุกอย่างบันทึกลง Google Sheet ผ่าน Apps Script (POST {admin, token})
   เว็บจริงอัปเดตหลังกด "เผยแพร่เว็บ" (GitHub Actions สร้างเว็บใหม่จาก Sheet) */

type Row = Record<string, unknown>;
type KV = { key: string; value: unknown; note: string };
type Msg = { row: number; received_at: string; name: string; email: string; message: string; read: boolean };
type Data = {
  profile: KV[];
  settings: KV[];
  projects: Row[];
  images: Row[];
  skills: Row[];
  experiences: Row[];
  messages: Msg[];
  lists: { categories: string[]; coverStyles: string[]; skillCats: string[] };
  oneClickPublish: boolean;
};
type Res = { ok: boolean; error?: string; auth?: boolean; errors?: string[]; [k: string]: unknown };
type Api = (action: string, body?: Row) => Promise<Res>;
type Notice = { kind: 'ok' | 'err' | 'busy'; text: string; list?: string[]; link?: string };

const TOKEN_KEY = 'pf_admin_token';
const store = {
  get: () => { try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } },
  set: (t: string) => { try { if (t) sessionStorage.setItem(TOKEN_KEY, t); else sessionStorage.removeItem(TOKEN_KEY); } catch { /* ไม่มี storage ก็ใช้ได้ แค่ต้องล็อกอินใหม่เมื่อรีเฟรช */ } }
};

const s = (v: unknown) => (v == null ? '' : String(v));
const bool = (v: unknown) => v === true || s(v).toUpperCase() === 'TRUE';

const Ctx = createContext<{ api: Api; notify: (n: Notice | null) => void; thumbs: Record<string, string>; loadThumb: (id: string) => void }>(null!);

export default function AdminApp({ endpoint }: { endpoint: string }) {
  const [token, setToken] = useState('');
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const [tab, setTab] = useState('projects');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [dirty, setDirty] = useState(false);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  useEffect(() => { setToken(store.get()); setReady(true); }, []);

  const logout = useCallback(() => { store.set(''); setToken(''); setData(null); }, []);

  const api: Api = useCallback(
    async (action, body = {}) => {
      let r: Res;
      try {
        const res = await fetch(endpoint, { method: 'POST', body: JSON.stringify({ ...body, admin: action, token: store.get() }) });
        r = (await res.json()) as Res;
      } catch {
        r = { ok: false, error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองใหม่' };
      }
      if (r.auth === false) logout();
      return r;
    },
    [endpoint, logout]
  );

  const reload = useCallback(async () => {
    const r = await api('get');
    if (r.ok) setData(r as unknown as Data);
    else setNotice({ kind: 'err', text: r.error || 'โหลดข้อมูลไม่สำเร็จ' });
  }, [api]);

  useEffect(() => { if (token) void reload(); }, [token, reload]);

  const loadThumb = useCallback(
    (id: string) => {
      if (!id || thumbs[id] !== undefined) return;
      setThumbs((t) => ({ ...t, [id]: '' }));
      void api('file', { id }).then((r) => r.ok && setThumbs((t) => ({ ...t, [id]: `data:${s(r.mime)};base64,${s(r.b64)}` })));
    },
    [api, thumbs]
  );

  const saved = async (r: Res, okText: string) => {
    if (!r.ok) { setNotice({ kind: 'err', text: r.error || 'บันทึกไม่สำเร็จ' }); return false; }
    setDirty(true);
    setNotice({ kind: 'ok', text: okText + ' — กด "เผยแพร่เว็บ" เพื่อให้ขึ้นเว็บจริง' });
    await reload();
    return true;
  };

  async function check() {
    setNotice({ kind: 'busy', text: 'กำลังตรวจข้อมูล…' });
    const r = await api('validate');
    const errs = (r.errors as string[]) || [];
    setNotice(!r.ok ? { kind: 'err', text: r.error || 'ตรวจไม่สำเร็จ' } : errs.length ? { kind: 'err', text: `พบ ${errs.length} จุดที่ต้องแก้`, list: errs } : { kind: 'ok', text: 'ข้อมูลถูกต้อง พร้อมเผยแพร่' });
  }

  async function publish() {
    setNotice({ kind: 'busy', text: 'กำลังตรวจข้อมูลและสั่งเผยแพร่…' });
    const r = await api('publish');
    if (r.errors) return setNotice({ kind: 'err', text: r.error || '', list: r.errors });
    if (r.mode === 'dispatched') { setDirty(false); return setNotice({ kind: 'ok', text: 'สั่งสร้างเว็บใหม่แล้ว เว็บจริงจะอัปเดตภายใน 1–3 นาที', link: s(r.url) }); }
    if (r.mode === 'link') return setNotice({ kind: r.error ? 'err' : 'ok', text: (r.error ? r.error + ' · ' : 'ข้อมูลถูกต้องแล้ว · ') + 'เปิดหน้า GitHub Actions แล้วกด Run workflow (หรือรอเว็บอัปเดตเองตอนตี 1)', link: s(r.url) });
    setNotice({ kind: 'err', text: r.error || 'เผยแพร่ไม่สำเร็จ' });
  }

  if (!ready) return null;
  if (!endpoint) return <p className="err">ยังไม่ได้ตั้งค่า gasUrl ใน site.config.json</p>;
  if (!token) return <Login api={api} onToken={(t) => { store.set(t); setToken(t); }} />;

  const unread = data ? data.messages.filter((m) => !m.read).length : 0;
  const TABS: [string, string][] = [
    ['projects', 'ผลงาน'],
    ['profile', 'โปรไฟล์'],
    ['skills', 'ทักษะ'],
    ['experiences', 'ประสบการณ์'],
    ['messages', unread ? `ข้อความ (${unread})` : 'ข้อความ'],
    ['settings', 'ตั้งค่า']
  ];

  return (
    <Ctx.Provider value={{ api, notify: setNotice, thumbs, loadThumb }}>
      <div className="adm">
        <div className="adm-bar">
          <nav className="filters adm-tabs" aria-label="ส่วนที่แก้ไข">
            {TABS.map(([k, label]) => (
              <button key={k} type="button" className={tab === k ? 'on' : ''} onClick={() => { setTab(k); setNotice(null); }}>
                {label}
              </button>
            ))}
          </nav>
          <div className="adm-actions">
            <button type="button" className="adm-ghost" onClick={check}>ตรวจข้อมูล</button>
            <button type="button" className="btn" onClick={publish}>เผยแพร่เว็บ <span className="arrow">↗</span></button>
            <button type="button" className="adm-ghost" onClick={() => { void api('logout'); logout(); }}>ออกจากระบบ</button>
          </div>
        </div>
        {dirty && !notice && <p className="adm-note">มีการแก้ไขที่ยังไม่ขึ้นเว็บจริง กด &quot;เผยแพร่เว็บ&quot; เมื่อแก้ครบแล้ว</p>}
        {notice && (
          <div className={`adm-notice ${notice.kind}`} role="status">
            <span>{notice.text}</span>
            {notice.link && <a href={notice.link} target="_blank" rel="noopener noreferrer">เปิด GitHub Actions ↗</a>}
            {notice.list && <ul>{notice.list.map((e) => <li key={e}>{e}</li>)}</ul>}
            {notice.kind !== 'busy' && <button type="button" aria-label="ปิด" onClick={() => setNotice(null)}>×</button>}
          </div>
        )}
        {!data ? (
          <p className="adm-empty">กำลังโหลดข้อมูล…</p>
        ) : tab === 'projects' ? (
          <Projects data={data} saved={saved} />
        ) : tab === 'profile' ? (
          <KvForm sheet="profile" rows={data.profile} saved={saved} />
        ) : tab === 'settings' ? (
          <KvForm sheet="settings" rows={data.settings} saved={saved} oneClick={data.oneClickPublish} />
        ) : tab === 'skills' ? (
          <Skills data={data} saved={saved} />
        ) : tab === 'experiences' ? (
          <Experiences data={data} saved={saved} />
        ) : (
          <Messages data={data} reload={reload} />
        )}
      </div>
    </Ctx.Provider>
  );
}

type Saved = (r: Res, okText: string) => Promise<boolean>;

/* ---------------- login ---------------- */
function Login({ api, onToken }: { api: Api; onToken: (t: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const pw = String(new FormData(e.currentTarget).get('password') || '');
    if (!pw) return setErr('ใส่รหัสผ่าน');
    setBusy(true);
    setErr('');
    const r = await api('login', { password: pw });
    setBusy(false);
    if (r.ok && r.token) onToken(s(r.token));
    else setErr(r.error || 'เข้าสู่ระบบไม่สำเร็จ');
  }
  return (
    <form className="adm-login panel" onSubmit={submit}>
      <h2 className="sec-title">เข้าสู่ระบบ</h2>
      <p>แก้ไขผลงาน โปรไฟล์ และข้อมูลทั้งหมดของเว็บ</p>
      <label className="adm-f">
        <span>รหัสผ่าน</span>
        <input type="password" name="password" autoComplete="current-password" autoFocus />
      </label>
      {err && <p className="err">{err}</p>}
      <button className="btn" type="submit" disabled={busy}>{busy ? 'กำลังตรวจ…' : 'เข้าสู่ระบบ'} <span className="arrow">→</span></button>
      <p className="adm-hint">ยังไม่มีรหัสผ่าน: เปิด Google Sheet &quot;Portfolio Database&quot; → เมนู Portfolio → ตั้งรหัสผ่านหน้า admin</p>
    </form>
  );
}

/* ---------------- ผลงาน ---------------- */
const EMPTY_PROJECT: Row = {
  id: '', title: '', slug: '', category: 'Web App', cover_style: 'web', hue: 210, summary: '', overview: '', problem: '', role: '', process: '', tech: '',
  results: '', metric_value: '', metric_label: '', demo_url: '', github_url: '', start: '', end: '', status: 'draft', featured: false, sort_order: '', cover_image_id: ''
};

function Projects({ data, saved }: { data: Data; saved: Saved }) {
  const [edit, setEdit] = useState<Row | null>(null);
  if (edit) return <ProjectEditor data={data} initial={edit} saved={saved} close={() => setEdit(null)} />;
  const next = Math.max(0, ...data.projects.map((p) => Number(p.sort_order) || 0)) + 1;
  return (
    <section>
      <div className="adm-head">
        <h2 className="sec-title">ผลงาน <small>{data.projects.length}</small></h2>
        <button type="button" className="btn" onClick={() => setEdit({ ...EMPTY_PROJECT, sort_order: next })}>+ เพิ่มผลงาน</button>
      </div>
      <div className="adm-list">
        {data.projects.map((p) => (
          <button type="button" className="adm-item" key={s(p.id)} onClick={() => setEdit(p)}>
            <Thumb id={s(p.cover_image_id)} label={s(p.title)} />
            <span className="adm-item-main">
              <b>{s(p.title) || '(ไม่มีชื่อ)'}</b>
              <small>{s(p.category)} · /projects/{s(p.slug)}/</small>
            </span>
            <span className="adm-tags">
              {bool(p.featured) && <em className="adm-tag">หน้าแรก</em>}
              <em className={`adm-tag ${s(p.status) === 'published' ? 'pub' : 'draft'}`}>{s(p.status) === 'published' ? 'แสดงบนเว็บ' : 'ฉบับร่าง'}</em>
            </span>
            <span className="adm-edit">แก้ไข →</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ProjectEditor({ data, initial, saved, close }: { data: Data; initial: Row; saved: Saved; close: () => void }) {
  const { api, notify } = useContext(Ctx);
  const [p, setP] = useState<Row>(initial);
  const [imgs, setImgs] = useState<Row[]>(() => data.images.filter((i) => s(i.project_id) === s(initial.id) && s(initial.id)));
  const [busy, setBusy] = useState(false);
  const isNew = !s(initial.id);
  const set = (k: string, v: unknown) => setP((o) => ({ ...o, [k]: v }));

  async function save() {
    if (!s(p.title).trim()) return notify({ kind: 'err', text: 'ใส่ชื่อผลงานก่อน' });
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s(p.slug))) return notify({ kind: 'err', text: 'ชื่อในลิงก์ (slug) ใช้ได้เฉพาะ a-z, 0-9 และ - เช่น asset-servicedesk' });
    setBusy(true);
    notify({ kind: 'busy', text: 'กำลังบันทึก…' });
    const r = await api('saveProject', { row: p });
    let ok = r.ok;
    if (ok) {
      const r2 = await api('saveTable', { sheet: 'project_images', project_id: s(r.id), rows: imgs });
      ok = await saved(r2, `บันทึก "${s(p.title)}" แล้ว`);
    } else await saved(r, '');
    setBusy(false);
    if (ok) close();
  }

  async function remove() {
    if (!window.confirm(`ลบผลงาน "${s(p.title)}" ออกจาก Sheet?\n(ถ้าแค่อยากซ่อน ให้เปลี่ยนสถานะเป็น "ฉบับร่าง" แทน)`)) return;
    setBusy(true);
    const ok = await saved(await api('deleteProject', { id: s(p.id) }), `ลบ "${s(p.title)}" แล้ว`);
    setBusy(false);
    if (ok) close();
  }

  const text = (k: string, label: string, hint = '', rows = 0) => (
    <label className="adm-f" key={k}>
      <span>{label}</span>
      {rows ? <textarea rows={rows} value={s(p[k])} onChange={(e) => set(k, e.target.value)} /> : <input value={s(p[k])} onChange={(e) => set(k, e.target.value)} />}
      {hint && <small>{hint}</small>}
    </label>
  );

  return (
    <section className="adm-editor">
      <div className="adm-head">
        <button type="button" className="adm-ghost" onClick={close}>← กลับไปรายการ</button>
        <h2 className="sec-title">{isNew ? 'เพิ่มผลงาน' : s(p.title)}</h2>
      </div>

      <div className="adm-grid">
        <div className="adm-col">
          <fieldset className="panel">
            <legend>ข้อมูลหลัก</legend>
            {text('title', 'ชื่อผลงาน')}
            {text('slug', 'ชื่อในลิงก์ (slug)', 'ภาษาอังกฤษตัวเล็ก คั่นด้วย - เช่น asset-servicedesk')}
            <div className="adm-row">
              <label className="adm-f">
                <span>หมวด</span>
                <select value={s(p.category)} onChange={(e) => set('category', e.target.value)}>
                  {data.lists.categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="adm-f">
                <span>สถานะ</span>
                <select value={s(p.status) || 'draft'} onChange={(e) => set('status', e.target.value)}>
                  <option value="published">แสดงบนเว็บ</option>
                  <option value="draft">ฉบับร่าง (ซ่อน)</option>
                </select>
              </label>
            </div>
            <div className="adm-row">
              {text('start', 'เริ่ม', 'เช่น 2026-01')}
              {text('end', 'เสร็จ', 'เว้นว่าง = ปัจจุบัน')}
              <label className="adm-f">
                <span>ลำดับ</span>
                <input type="number" min={1} value={s(p.sort_order)} onChange={(e) => set('sort_order', e.target.value === '' ? '' : Number(e.target.value))} />
              </label>
            </div>
            <label className="adm-check">
              <input type="checkbox" checked={bool(p.featured)} onChange={(e) => set('featured', e.target.checked)} />
              <span>แสดงในสไลด์หน้าแรก (ผลงานเด่น)</span>
            </label>
          </fieldset>

          <fieldset className="panel">
            <legend>บนการ์ด</legend>
            {text('summary', 'สรุปสั้น', '1–2 บรรทัด แสดงบนการ์ดและสไลด์', 3)}
            <div className="adm-row">
              {text('metric_value', 'ตัวเลขเด่น', 'เช่น 69%')}
              {text('metric_label', 'คำอธิบายตัวเลข', 'เช่น เคสที่บอทปิดเอง')}
            </div>
          </fieldset>

          <fieldset className="panel">
            <legend>รายละเอียด (หน้าผลงาน)</legend>
            {text('overview', 'ภาพรวม', '', 4)}
            {text('problem', 'ปัญหาที่แก้', '', 4)}
            {text('role', 'บทบาทของฉัน', '', 3)}
            {text('process', 'ขั้นตอนการทำงาน', 'ขึ้นบรรทัดใหม่ = ข้อใหม่', 5)}
            {text('results', 'ผลลัพธ์', 'ขึ้นบรรทัดใหม่ = ข้อใหม่', 4)}
            {text('tech', 'เทคโนโลยี', 'คั่นด้วย , เช่น Next.js, Google Apps Script')}
          </fieldset>

          <fieldset className="panel">
            <legend>ลิงก์ (เว้นว่างได้)</legend>
            {text('demo_url', 'ลิงก์ Demo', 'ต้องขึ้นต้นด้วย https://')}
            {text('github_url', 'ลิงก์ GitHub', 'ห้ามใส่ลิงก์ระบบภายในบริษัท')}
          </fieldset>
        </div>

        <div className="adm-col">
          <fieldset className="panel">
            <legend>รูปปก</legend>
            <ImageSlot id={s(p.cover_image_id)} onChange={(id) => set('cover_image_id', id)} />
          </fieldset>
          <fieldset className="panel">
            <legend>รูปเพิ่มเติม (แกลเลอรี)</legend>
            {imgs.map((im, i) => (
              <div className="adm-gal" key={s(im.drive_file_id) + i}>
                <Thumb id={s(im.drive_file_id)} label="" />
                <input placeholder="คำอธิบายรูป" value={s(im.alt_text)} onChange={(e) => setImgs((a) => a.map((x, j) => (j === i ? { ...x, alt_text: e.target.value } : x)))} />
                <Order i={i} list={imgs} move={(to) => setImgs((a) => moveItem(a, i, to))} remove={() => setImgs((a) => a.filter((_, j) => j !== i))} />
              </div>
            ))}
            <Uploader label="+ เพิ่มรูป" accept="image/*" onDone={(id) => setImgs((a) => [...a, { drive_file_id: id, alt_text: '' }])} />
          </fieldset>
        </div>
      </div>

      <div className="adm-savebar">
        <button type="button" className="btn" disabled={busy} onClick={save}>{busy ? 'กำลังบันทึก…' : 'บันทึก'} <span className="arrow">→</span></button>
        <button type="button" className="adm-ghost" onClick={close}>ยกเลิก</button>
        {!isNew && <button type="button" className="adm-danger" disabled={busy} onClick={remove}>ลบผลงาน</button>}
      </div>
    </section>
  );
}

/* ---------------- รูป ---------------- */
function Thumb({ id, label }: { id: string; label: string }) {
  const { thumbs, loadThumb } = useContext(Ctx);
  useEffect(() => loadThumb(id), [id, loadThumb]);
  const src = thumbs[id];
  return <span className="adm-thumb">{src ? <img src={src} alt="" /> : <i>{id ? '…' : label.slice(0, 2) || '—'}</i>}</span>;
}

function ImageSlot({ id, onChange }: { id: string; onChange: (id: string) => void }) {
  return (
    <div className="adm-slot">
      {id ? <Thumb id={id} label="" /> : <span className="adm-thumb big"><i>ยังไม่มีรูป</i></span>}
      <div className="adm-slot-act">
        <Uploader label={id ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'} accept="image/*" onDone={onChange} />
        {id && <button type="button" className="adm-ghost" onClick={() => onChange('')}>เอารูปออก</button>}
      </div>
      <small>แนะนำภาพหน้าจอแนวนอน · ระบบย่อเหลือกว้างไม่เกิน 1920px ก่อนอัปโหลด</small>
    </div>
  );
}

function Uploader({ label, accept, onDone }: { label: string; accept: string; onDone: (id: string) => void }) {
  const { api, notify } = useContext(Ctx);
  const [busy, setBusy] = useState(false);
  async function pick(f: File | undefined) {
    if (!f) return;
    setBusy(true);
    notify({ kind: 'busy', text: `กำลังอัปโหลด ${f.name}…` });
    try {
      const { b64, mime, name } = f.type.startsWith('image/') ? await shrink(f) : { b64: await toB64(f), mime: f.type, name: f.name };
      const r = await api('upload', { b64, mime, name });
      if (r.ok) { onDone(s(r.id)); notify({ kind: 'ok', text: 'อัปโหลดแล้ว — อย่าลืมกดบันทึก' }); }
      else notify({ kind: 'err', text: r.error || 'อัปโหลดไม่สำเร็จ' });
    } catch {
      notify({ kind: 'err', text: 'อ่านไฟล์ไม่ได้' });
    }
    setBusy(false);
  }
  return (
    <label className={`adm-ghost adm-upload${busy ? ' busy' : ''}`}>
      {busy ? 'กำลังอัปโหลด…' : label}
      <input type="file" accept={accept} disabled={busy} onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ''; }} />
    </label>
  );
}

function toB64(f: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1] || '');
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}

/** ย่อรูปฝั่งเบราว์เซอร์ก่อนส่ง (กว้างไม่เกิน 1920px, JPEG 88%) — PNG เล็ก ๆ ส่งตามเดิม */
async function shrink(f: File) {
  const bmp = await createImageBitmap(f);
  const scale = Math.min(1, 1920 / bmp.width);
  if (scale === 1 && f.size < 1.5e6) return { b64: await toB64(f), mime: f.type, name: f.name };
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/jpeg', 0.88));
  return { b64: await toB64(blob), mime: 'image/jpeg', name: f.name.replace(/\.\w+$/, '') + '.jpg' };
}

/* ---------------- ลำดับ / ลบ ---------------- */
function moveItem<T>(a: T[], from: number, to: number) {
  const b = [...a];
  const [x] = b.splice(from, 1);
  b.splice(to, 0, x);
  return b;
}

/** ลูกศรเลื่อนลำดับ — same() จำกัดให้สลับเฉพาะกับรายการกลุ่มเดียวกัน (ใช้กับทักษะแยกหมวด) */
function Order({ i, list, move, remove, same = () => true }: { i: number; list: Row[]; move: (to: number) => void; remove: () => void; same?: (r: Row) => boolean }) {
  const prev = list.findLastIndex((r, j) => j < i && same(r));
  const next = list.findIndex((r, j) => j > i && same(r));
  return (
    <span className="adm-order">
      <button type="button" aria-label="เลื่อนขึ้น" disabled={prev < 0} onClick={() => move(prev)}>↑</button>
      <button type="button" aria-label="เลื่อนลง" disabled={next < 0} onClick={() => move(next)}>↓</button>
      <button type="button" aria-label="ลบ" className="x" onClick={remove}>×</button>
    </span>
  );
}

/* ---------------- โปรไฟล์ / ตั้งค่า ---------------- */
const LABELS: Record<string, string> = {
  name: 'ชื่อ นามสกุล', title: 'ตำแหน่งที่สมัคร', tagline: 'แนะนำตัวสั้น (หน้าแรก)', bio: 'ประวัติ (หน้า About)', goal: 'เป้าหมายในสายอาชีพ',
  location: 'ที่อยู่ / จังหวัด', email: 'อีเมลที่แสดงบนเว็บ', github: 'ลิงก์ GitHub', linkedin: 'ลิงก์ LinkedIn', available: 'แสดงป้าย "เปิดรับงาน"',
  seo_title: 'ชื่อเว็บ (Google / แท็บเบราว์เซอร์)', seo_description: 'คำอธิบายเว็บบน Google', show_resume: 'แสดงหน้า Resume',
  resume_drive_id: 'ไฟล์ Resume (PDF)', github_repo: 'GitHub repo ของเว็บ'
};
const LONG = new Set(['tagline', 'bio', 'goal', 'seo_description']);

function KvForm({ sheet, rows, saved, oneClick }: { sheet: 'profile' | 'settings'; rows: KV[]; saved: Saved; oneClick?: boolean }) {
  const { api } = useContext(Ctx);
  const [v, setV] = useState<Record<string, unknown>>(() => Object.fromEntries(rows.map((r) => [r.key, r.value])));
  const [busy, setBusy] = useState(false);
  const set = (k: string, x: unknown) => setV((o) => ({ ...o, [k]: x }));
  async function save() {
    setBusy(true);
    await saved(await api('saveKv', { sheet, values: v }), sheet === 'profile' ? 'บันทึกโปรไฟล์แล้ว' : 'บันทึกการตั้งค่าแล้ว');
    setBusy(false);
  }
  return (
    <section>
      <div className="adm-head">
        <h2 className="sec-title">{sheet === 'profile' ? 'โปรไฟล์' : 'ตั้งค่า'}</h2>
      </div>
      <div className="panel adm-kv">
        {rows.map(({ key, value, note }) => {
          const isBool = typeof value === 'boolean' || /^(TRUE|FALSE)$/i.test(s(value));
          return (
            <div className="adm-f" key={key}>
              <span>{LABELS[key] || key}</span>
              {isBool ? (
                <label className="adm-check">
                  <input type="checkbox" checked={bool(v[key])} onChange={(e) => set(key, e.target.checked)} />
                  <span>{bool(v[key]) ? 'เปิด' : 'ปิด'}</span>
                </label>
              ) : key === 'resume_drive_id' ? (
                <div className="adm-slot-act">
                  <em className="adm-file">{s(v[key]) ? 'มีไฟล์แล้ว' : 'ยังไม่มีไฟล์'}</em>
                  <Uploader label={s(v[key]) ? 'เปลี่ยนไฟล์ PDF' : 'อัปโหลด PDF'} accept="application/pdf" onDone={(id) => set(key, id)} />
                  {s(v[key]) && <button type="button" className="adm-ghost" onClick={() => set(key, '')}>เอาออก</button>}
                </div>
              ) : LONG.has(key) ? (
                <textarea rows={key === 'bio' ? 6 : 3} value={s(v[key])} onChange={(e) => set(key, e.target.value)} />
              ) : (
                <input value={s(v[key])} onChange={(e) => set(key, e.target.value)} />
              )}
              {note && <small>{note}</small>}
            </div>
          );
        })}
        {sheet === 'settings' && (
          <div className="adm-f">
            <span>เผยแพร่ในคลิกเดียว</span>
            <em className="adm-file">{oneClick ? 'เปิดอยู่ (ตั้ง GitHub token แล้ว)' : 'ยังไม่ได้ตั้ง — ปุ่มเผยแพร่จะพาไปหน้า GitHub Actions ให้กด Run workflow เอง'}</em>
            <small>ตั้งได้ใน Google Sheet → เมนู Portfolio → ตั้ง GitHub token</small>
          </div>
        )}
      </div>
      <div className="adm-savebar">
        <button type="button" className="btn" disabled={busy} onClick={save}>{busy ? 'กำลังบันทึก…' : 'บันทึก'} <span className="arrow">→</span></button>
      </div>
    </section>
  );
}

/* ---------------- ทักษะ ---------------- */
function Skills({ data, saved }: { data: Data; saved: Saved }) {
  const { api } = useContext(Ctx);
  const [list, setList] = useState<Row[]>(data.skills);
  const [busy, setBusy] = useState(false);
  const upd = (i: number, k: string, x: string) => setList((a) => a.map((r, j) => (j === i ? { ...r, [k]: x } : r)));
  async function save() {
    setBusy(true);
    await saved(await api('saveTable', { sheet: 'skills', rows: list.filter((r) => s(r.name).trim()) }), 'บันทึกทักษะแล้ว');
    setBusy(false);
  }
  return (
    <section>
      <div className="adm-head">
        <h2 className="sec-title">ทักษะ <small>{list.length}</small></h2>
      </div>
      <div className="adm-cats">
        {data.lists.skillCats.map((cat) => (
          <div className="panel" key={cat}>
            <h3>{cat}</h3>
            {list.map((r, i) =>
              s(r.category) !== cat ? null : (
                <div className="adm-line" key={i}>
                  <input value={s(r.name)} placeholder="ชื่อทักษะ" onChange={(e) => upd(i, 'name', e.target.value)} />
                  <select value={cat} aria-label="หมวด" onChange={(e) => upd(i, 'category', e.target.value)}>
                    {data.lists.skillCats.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <Order i={i} list={list} same={(x) => s(x.category) === cat} move={(to) => setList((a) => moveItem(a, i, to))} remove={() => setList((a) => a.filter((_, j) => j !== i))} />
                </div>
              )
            )}
            <button type="button" className="adm-ghost" onClick={() => setList((a) => [...a, { name: '', category: cat }])}>+ เพิ่มทักษะ</button>
          </div>
        ))}
      </div>
      <div className="adm-savebar">
        <button type="button" className="btn" disabled={busy} onClick={save}>{busy ? 'กำลังบันทึก…' : 'บันทึก'} <span className="arrow">→</span></button>
      </div>
    </section>
  );
}

/* ---------------- ประสบการณ์ / การศึกษา ---------------- */
function Experiences({ data, saved }: { data: Data; saved: Saved }) {
  const { api } = useContext(Ctx);
  const [list, setList] = useState<Row[]>(data.experiences);
  const [busy, setBusy] = useState(false);
  const upd = (i: number, k: string, x: string) => setList((a) => a.map((r, j) => (j === i ? { ...r, [k]: x } : r)));
  async function save() {
    setBusy(true);
    await saved(await api('saveTable', { sheet: 'experiences', rows: list.filter((r) => s(r.organization).trim()) }), 'บันทึกประสบการณ์แล้ว');
    setBusy(false);
  }
  const field = (i: number, k: string, label: string, ph = '') => (
    <label className="adm-f">
      <span>{label}</span>
      <input value={s(list[i][k])} placeholder={ph} onChange={(e) => upd(i, k, e.target.value)} />
    </label>
  );
  return (
    <section>
      <div className="adm-head">
        <h2 className="sec-title">ประสบการณ์ &amp; การศึกษา</h2>
      </div>
      <div className="adm-list">
        {list.map((r, i) => (
          <div className="panel adm-exp" key={i}>
            <div className="adm-row">
              <label className="adm-f">
                <span>ประเภท</span>
                <select value={s(r.type) || 'work'} onChange={(e) => upd(i, 'type', e.target.value)}>
                  <option value="work">การทำงาน</option>
                  <option value="edu">การศึกษา</option>
                </select>
              </label>
              {field(i, 'organization', s(r.type) === 'edu' ? 'สถานศึกษา' : 'บริษัท / องค์กร')}
              <Order i={i} list={list} move={(to) => setList((a) => moveItem(a, i, to))} remove={() => setList((a) => a.filter((_, j) => j !== i))} />
            </div>
            <div className="adm-row">
              {field(i, 'position', s(r.type) === 'edu' ? 'คณะ / สาขา' : 'ตำแหน่ง')}
              {field(i, 'start', 'เริ่ม', 'เช่น 2023')}
              {field(i, 'end', 'สิ้นสุด', 'เช่น ปัจจุบัน')}
            </div>
            <label className="adm-f">
              <span>รายละเอียด</span>
              <textarea rows={3} value={s(r.description)} onChange={(e) => upd(i, 'description', e.target.value)} />
            </label>
          </div>
        ))}
      </div>
      <div className="adm-savebar">
        <button type="button" className="adm-ghost" onClick={() => setList((a) => [...a, { type: 'work', organization: '', position: '', start: '', end: '', description: '' }])}>+ เพิ่มรายการ</button>
        <button type="button" className="btn" disabled={busy} onClick={save}>{busy ? 'กำลังบันทึก…' : 'บันทึก'} <span className="arrow">→</span></button>
      </div>
    </section>
  );
}

/* ---------------- ข้อความจากฟอร์มติดต่อ ---------------- */
function Messages({ data, reload }: { data: Data; reload: () => Promise<void> }) {
  const { api, notify } = useContext(Ctx);
  async function toggle(m: Msg) {
    const r = await api('setRead', { row: m.row, read: !m.read });
    if (!r.ok) notify({ kind: 'err', text: r.error || 'บันทึกไม่สำเร็จ' });
    await reload();
  }
  return (
    <section>
      <div className="adm-head">
        <h2 className="sec-title">ข้อความ <small>{data.messages.length}</small></h2>
      </div>
      {!data.messages.length && <p className="adm-empty">ยังไม่มีข้อความจากฟอร์มติดต่อ</p>}
      <div className="adm-list">
        {data.messages.map((m) => (
          <article className={`panel adm-msg${m.read ? '' : ' unread'}`} key={m.row}>
            <header>
              <b>{m.name}</b>
              <a href={`mailto:${m.email}`}>{m.email}</a>
              <time>{m.received_at ? new Date(m.received_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</time>
            </header>
            <p>{m.message}</p>
            <footer>
              <a className="adm-ghost" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ข้อความจากเว็บ Portfolio')}`}>ตอบกลับทางอีเมล</a>
              <button type="button" className="adm-ghost" onClick={() => toggle(m)}>{m.read ? 'ทำเป็นยังไม่อ่าน' : 'ทำเป็นอ่านแล้ว'}</button>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
