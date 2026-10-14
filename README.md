# Portfolio

เว็บ Portfolio สาย Web Developer — Next.js สร้างเป็นหน้าเว็บสำเร็จรูป, ข้อมูลทั้งหมดอยู่ใน Google Sheet, deploy อัตโนมัติขึ้น GitHub Pages

```
Google Sheet ──(Apps Script API)──▶ GitHub Actions: fetch-data → next build ──▶ GitHub Pages
      ▲                                                                          │
      └──────────── ฟอร์มติดต่อ (POST ไป Apps Script → แท็บ messages + อีเมล) ◀───┘
```

## โครงสร้าง
| ส่วน | ที่อยู่ |
|---|---|
| หน้าเว็บ (App Router) | `app/` — หน้าแรก, about, projects, projects/[slug], experience, resume, contact |
| คอมโพเนนต์ | `components/` |
| ข้อมูลที่หน้าเว็บใช้ | `data/site.json` (สร้างจาก Sheet ตอน build) |
| ดึงข้อมูล + ย่อรูป | `scripts/fetch-data.mjs`, `scripts/normalize.mjs` |
| ตั้งค่า | `site.config.json` — `gasUrl` = URL เว็บแอป Apps Script |
| Deploy | `.github/workflows/deploy.yml` — push, Run workflow, และทุกวัน 01:00 |

## แก้ข้อมูล / เพิ่มผลงาน
1. แก้ใน Google Sheet (แท็บ `projects`, `profile`, `skills`, `experiences`, `settings`)
2. รูป: อัปโหลดเข้า Google Drive แล้วใส่ ID ไฟล์ใน `cover_image_id` หรือแท็บ `project_images`
3. เมนู **Portfolio → เผยแพร่เว็บ** (หรือกด Run workflow ในแท็บ Actions)

## รันในเครื่อง
```bash
npm install
npm run build      # ดึงข้อมูลจาก Sheet แล้ว build → out/
npm run dev        # ใช้ data/site.json ที่มีอยู่
```
