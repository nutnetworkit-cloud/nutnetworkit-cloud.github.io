/**
 * Portfolio — Google Sheet เป็นฐานข้อมูล + Apps Script เป็น API
 *
 * วิธีติดตั้ง (ครั้งแรก):
 *   1. สร้าง Google Sheet ใหม่ → ส่วนขยาย → Apps Script → วางไฟล์นี้ทั้งไฟล์
 *   2. รันฟังก์ชัน setupPortfolio (อนุญาตสิทธิ์) → ได้แท็บทั้งหมดพร้อมข้อมูลตัวอย่าง
 *   3. ทำให้ใช้งานได้ → การทำให้ใช้งานได้รายการใหม่ → เว็บแอป
 *        ดำเนินการในฐานะ: ฉัน · ผู้ที่มีสิทธิ์เข้าถึง: ทุกคน
 *   4. เอา URL /exec ไปใส่ site.config.json ของเว็บ (gasUrl)
 *
 * Endpoint (web app):
 *   GET  ?action=site          ข้อมูลสาธารณะทั้งหมด (เฉพาะผลงานที่ status = published)
 *   GET  ?action=file&id=...   ไฟล์รูป/Resume จาก Drive (base64) — เฉพาะ ID ที่อ้างอิงใน Sheet
 *   POST {name,email,message}  ข้อความจากฟอร์มติดต่อ → แท็บ messages + อีเมลแจ้งเจ้าของ
 *   POST {admin:'...', token}  API ของหน้า /admin/ บนเว็บ (ดู admin_) — ตั้งรหัสผ่านจากเมนู Portfolio ก่อน
 *
 * เผยแพร่: เมนู Portfolio → เผยแพร่เว็บ
 *   ถ้าตั้ง Script Property GITHUB_TOKEN (fine-grained token, สิทธิ์ Actions: Read and write เฉพาะ repo นี้)
 *   จะสั่ง GitHub Actions สร้างเว็บใหม่ให้ทันที ถ้าไม่ตั้ง จะแสดงลิงก์ให้กด Run workflow เอง
 *   (เว็บสร้างใหม่อัตโนมัติทุกวันตี 1 อยู่แล้ว)
 */

const SHEETS = {
  profile: ['key', 'value', 'note'],
  projects: ['id', 'title', 'slug', 'category', 'cover_style', 'hue', 'summary', 'overview', 'problem', 'role',
    'process', 'tech', 'results', 'metric_value', 'metric_label', 'demo_url', 'github_url', 'start', 'end',
    'status', 'featured', 'sort_order', 'cover_image_id', 'updated_at'],
  project_images: ['project_id', 'drive_file_id', 'alt_text', 'sort_order'],
  skills: ['name', 'category', 'sort_order'],
  experiences: ['type', 'organization', 'position', 'start', 'end', 'description', 'sort_order'],
  messages: ['received_at', 'name', 'email', 'message', 'read'],
  settings: ['key', 'value', 'note']
};
const CATEGORIES = ['LINE LIFF', 'Web App', 'AI & Automation', 'Data', 'UI/UX'];
const COVER_STYLES = ['liff', 'web', 'map', 'node', 'data', 'mobile', 'doc'];
const SKILL_CATS = ['ภาษาและ Frontend', 'Backend และแพลตฟอร์ม', 'เครื่องมือและข้อมูล'];
const TEXT_COLS = { projects: ['id', 'slug', 'start', 'end', 'cover_image_id'], project_images: ['project_id', 'drive_file_id'], experiences: ['start', 'end'], profile: ['value'], settings: ['value'] };

/* ---------------- menu ---------------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Portfolio')
    .addItem('ตรวจข้อมูล', 'menuValidate')
    .addItem('เผยแพร่เว็บ', 'menuPublish')
    .addSeparator()
    .addItem('ตั้งรหัสผ่านหน้า admin', 'menuSetAdminPassword')
    .addItem('ตั้ง GitHub token (เผยแพร่ในคลิกเดียว)', 'menuSetGithubToken')
    .addItem('ตั้งค่าครั้งแรก (สร้างแท็บ)', 'setupPortfolio')
    .addToUi();
}

/** อัปเดต updated_at อัตโนมัติเมื่อแก้แถวในแท็บ projects */
function onEdit(e) {
  const sh = e.range.getSheet();
  if (sh.getName() !== 'projects' || e.range.getRow() < 2) return;
  const col = SHEETS.projects.indexOf('updated_at') + 1;
  if (e.range.getColumn() === col && e.range.getNumColumns() === 1) return;
  sh.getRange(e.range.getRow(), col, e.range.getNumRows(), 1).setValue(new Date());
}

/* ---------------- web app ---------------- */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'site';
  try {
    if (action === 'site') return json_(publicSite_());
    if (action === 'file') return json_(publicFile_(String(e.parameter.id || '')));
    return json_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (_) { return json_({ ok: false, error: 'invalid body' }); }
  if (d.admin) {
    try { return json_(admin_(d)); } catch (err) { return json_({ ok: false, error: String(err && err.message || err) }); }
  }
  if (d.website) return json_({ ok: true }); // honeypot: บอทกรอกช่องที่ซ่อนไว้
  const name = String(d.name || '').trim().slice(0, 100);
  const email = String(d.email || '').trim().slice(0, 200);
  const message = String(d.message || '').trim().slice(0, 3000);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json_({ ok: false, error: 'invalid fields' });

  const cache = CacheService.getScriptCache();
  const n = Number(cache.get('msg_count') || 0);
  if (n >= 10) return json_({ ok: false, error: 'too many messages, try later' });
  cache.put('msg_count', String(n + 1), 600);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    // ไม่ใช้ appendRow เพราะคอลัมน์ checkbox ทำให้ทุกแถว "มีข้อมูล" → หาแถวว่างแรกจากคอลัมน์ A แทน
    const sh = sheet_('messages');
    const colA = sh.getRange(1, 1, sh.getMaxRows(), 1).getValues();
    let row = colA.findIndex((r, i) => i > 0 && r[0] === '') + 1;
    if (row < 2) { sh.insertRowAfter(sh.getMaxRows()); row = sh.getMaxRows(); }
    sh.getRange(row, 1, 1, 5).setValues([[new Date(), name, email, message, false]]);
    sh.getRange(row, 5).insertCheckboxes();
  } finally { lock.releaseLock(); }

  try {
    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      replyTo: email,
      subject: '[Portfolio] ข้อความใหม่จาก ' + name,
      body: 'ชื่อ: ' + name + '\nอีเมล: ' + email + '\n\n' + message + '\n\n— ส่งจากฟอร์มติดต่อบนเว็บ Portfolio (ตอบกลับอีเมลนี้ได้เลย)'
    });
  } catch (_) { /* บันทึกลง Sheet แล้ว แม้ส่งอีเมลไม่สำเร็จ */ }
  return json_({ ok: true });
}

function publicSite_() {
  const projects = readTable_('projects')
    .filter(p => String(p.status).toLowerCase() === 'published' && p.slug)
    .map(p => { const o = Object.assign({}, p); delete o.status; return o; });
  const ids = new Set(projects.map(p => String(p.id)));
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    profile: readKv_('profile'),
    settings: readKv_('settings'),
    projects: projects,
    images: readTable_('project_images').filter(i => ids.has(String(i.project_id)) && i.drive_file_id),
    skills: readTable_('skills'),
    experiences: readTable_('experiences')
  };
}

/** ส่งไฟล์จาก Drive เฉพาะที่ Sheet อ้างอิงไว้ (กันการดึงไฟล์อื่นใน Drive) */
function publicFile_(id) {
  const site = publicSite_();
  const allowed = new Set();
  site.projects.forEach(p => p.cover_image_id && allowed.add(String(p.cover_image_id)));
  site.images.forEach(i => allowed.add(String(i.drive_file_id)));
  if (site.settings.resume_drive_id) allowed.add(String(site.settings.resume_drive_id));
  if (!id || !allowed.has(id)) return { ok: false, error: 'file not allowed' };
  const file = DriveApp.getFileById(id);
  const blob = file.getBlob();
  return { ok: true, name: file.getName(), mime: blob.getContentType(), b64: Utilities.base64Encode(blob.getBytes()) };
}

/* ---------------- validate & publish ---------------- */
function validate_() {
  const errs = [];
  const projects = readTable_('projects');
  const seen = {};
  projects.forEach((p, i) => {
    const row = i + 2, label = 'projects แถว ' + row + (p.title ? ' (' + p.title + ')' : '');
    if (!p.id) errs.push(label + ': ไม่มี id');
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(p.slug))) errs.push(label + ': slug ต้องเป็น a-z, 0-9 คั่นด้วย -');
    else if (seen[p.slug]) errs.push(label + ': slug ซ้ำกับแถว ' + seen[p.slug]);
    else seen[p.slug] = row;
    if (String(p.status).toLowerCase() === 'published') {
      if (!p.title) errs.push(label + ': ไม่มีชื่อผลงาน');
      if (!p.summary) errs.push(label + ': ไม่มีคำอธิบายสั้น (summary)');
    }
    if (p.category && CATEGORIES.indexOf(p.category) < 0) errs.push(label + ': category ไม่อยู่ในรายการ');
    ['demo_url', 'github_url'].forEach(k => { if (p[k] && !/^https?:\/\//.test(p[k])) errs.push(label + ': ' + k + ' ต้องขึ้นต้นด้วย https://'); });
    if (p.cover_image_id && !driveExists_(p.cover_image_id)) errs.push(label + ': เปิดไฟล์รูปปก ' + p.cover_image_id + ' ไม่ได้');
  });
  readTable_('project_images').forEach((r, i) => {
    if (r.drive_file_id && !driveExists_(r.drive_file_id)) errs.push('project_images แถว ' + (i + 2) + ': เปิดไฟล์ ' + r.drive_file_id + ' ไม่ได้');
  });
  const st = readKv_('settings');
  if (st.resume_drive_id && !driveExists_(st.resume_drive_id)) errs.push('settings: เปิดไฟล์ Resume ไม่ได้');
  return errs;
}

function menuValidate() {
  const errs = validate_();
  SpreadsheetApp.getUi().alert(errs.length ? 'พบ ' + errs.length + ' จุดที่ต้องแก้:\n\n' + errs.join('\n') : 'ข้อมูลถูกต้อง พร้อมเผยแพร่');
}

/** ใช้ร่วมกันทั้งเมนูใน Sheet และปุ่มในหน้า admin */
function publish_() {
  const errs = validate_();
  if (errs.length) return { ok: false, errors: errs, error: 'ยังเผยแพร่ไม่ได้ แก้ ' + errs.length + ' จุดก่อน' };
  const repo = readKv_('settings').github_repo;
  if (!repo) return { ok: false, error: 'ใส่ github_repo ในแท็บ settings ก่อน เช่น owner/owner.github.io' };
  const actionsUrl = 'https://github.com/' + repo + '/actions/workflows/deploy.yml';
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) return { ok: true, mode: 'link', url: actionsUrl };
  const res = UrlFetchApp.fetch('https://api.github.com/repos/' + repo + '/actions/workflows/deploy.yml/dispatches', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' },
    payload: JSON.stringify({ ref: 'main' })
  });
  if (res.getResponseCode() === 204) return { ok: true, mode: 'dispatched', url: 'https://github.com/' + repo + '/actions' };
  return { ok: false, mode: 'link', url: actionsUrl, error: 'GitHub ตอบกลับ ' + res.getResponseCode() + ' — token อาจหมดอายุหรือสิทธิ์ไม่พอ' };
}

function menuPublish() {
  const ui = SpreadsheetApp.getUi();
  const r = publish_();
  if (r.errors) { ui.alert(r.error + ':\n\n' + r.errors.join('\n')); return; }
  if (r.mode === 'dispatched') { ui.alert('สั่งสร้างเว็บใหม่แล้ว เว็บจะอัปเดตภายใน 1–3 นาที'); return; }
  if (!r.url) { ui.alert(r.error); return; }
  const html = HtmlService.createHtmlOutput(
    '<div style="font-family:sans-serif;font-size:14px;line-height:1.6">' +
    (r.error ? '<p style="color:#b3261e">' + r.error + '</p>' : '') +
    '<p>ข้อมูลถูกต้องแล้ว เปิดหน้า GitHub Actions แล้วกด <b>Run workflow</b> เว็บจะอัปเดตภายใน 1–3 นาที</p>' +
    '<p><a href="' + r.url + '" target="_blank">เปิดหน้า GitHub Actions ↗</a></p>' +
    '<p style="color:#666">ถ้าไม่กด เว็บจะอัปเดตเองทุกวันตี 1</p></div>').setWidth(420).setHeight(190);
  ui.showModalDialog(html, 'เผยแพร่เว็บ');
}

/* ---------------- admin: หน้า /admin/ บนเว็บ ----------------
 * ล็อกอินด้วยรหัสผ่านที่เจ้าของตั้งเองจากเมนู (เก็บเป็น hash ใน Script Properties)
 * ได้ session token อายุ 6 ชม. (ต่ออายุทุกครั้งที่ใช้) · ผิด 5 ครั้งล็อก 15 นาที
 */
const ADMIN_TTL = 6 * 60 * 60;

function admin_(d) {
  const cache = CacheService.getScriptCache();
  const props = PropertiesService.getScriptProperties();
  if (d.admin === 'login') return adminLogin_(String(d.password || ''), cache, props);
  const token = String(d.token || '');
  const epoch = props.getProperty('ADMIN_EPOCH') || '';
  if (!/^[a-f0-9-]{36}$/.test(token) || !epoch || cache.get('adm_' + token) !== epoch) return { ok: false, auth: false, error: 'กรุณาเข้าสู่ระบบใหม่' };
  cache.put('adm_' + token, epoch, ADMIN_TTL);
  switch (d.admin) {
    case 'logout': cache.remove('adm_' + token); return { ok: true };
    case 'get': return adminGet_(props);
    case 'saveKv': return locked_(() => saveKv_(d.sheet, d.values));
    case 'saveProject': return locked_(() => saveProject_(d.row || {}));
    case 'deleteProject': return locked_(() => deleteProject_(String(d.id || '')));
    case 'saveTable': return locked_(() => saveTable_(d.sheet, d.rows, String(d.project_id || '')));
    case 'setRead': return locked_(() => setRead_(Number(d.row), d.read === true));
    case 'upload': return upload_(d, props);
    case 'file': return adminFile_(String(d.id || ''));
    case 'validate': return { ok: true, errors: validate_() };
    case 'publish': return publish_();
  }
  return { ok: false, error: 'unknown action' };
}

function adminLogin_(pw, cache, props) {
  const fails = Number(cache.get('adm_fail') || 0);
  if (fails >= 5) return { ok: false, error: 'ใส่รหัสผิดหลายครั้ง รอ 15 นาทีแล้วลองใหม่' };
  const hash = props.getProperty('ADMIN_HASH');
  if (!hash) return { ok: false, error: 'ยังไม่ได้ตั้งรหัสผ่าน — เปิด Google Sheet → เมนู Portfolio → ตั้งรหัสผ่านหน้า admin' };
  Utilities.sleep(300);
  if (hash_(pw, props.getProperty('ADMIN_SALT')) !== hash) {
    cache.put('adm_fail', String(fails + 1), 900);
    return { ok: false, error: 'รหัสผ่านไม่ถูกต้อง' };
  }
  cache.remove('adm_fail');
  const token = Utilities.getUuid();
  cache.put('adm_' + token, props.getProperty('ADMIN_EPOCH'), ADMIN_TTL);
  return { ok: true, token: token };
}

function hash_(pw, salt) {
  let h = salt + pw;
  for (let i = 0; i < 200; i++) h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + salt, Utilities.Charset.UTF_8));
  return h;
}

function menuSetAdminPassword() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('ตั้งรหัสผ่านหน้า admin', 'อย่างน้อย 10 ตัวอักษร ใช้เข้าหน้า /admin/ บนเว็บ\n(ตั้งใหม่เมื่อไหร่ ทุกเครื่องที่ล็อกอินค้างไว้จะถูกออกจากระบบ)', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const pw = r.getResponseText();
  if (pw.length < 10) { ui.alert('รหัสผ่านสั้นเกินไป ต้องมีอย่างน้อย 10 ตัวอักษร'); return; }
  const salt = Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperties({ ADMIN_SALT: salt, ADMIN_HASH: hash_(pw, salt), ADMIN_EPOCH: Utilities.getUuid() });
  ui.alert('ตั้งรหัสผ่านแล้ว\nเข้าหน้า admin ได้ที่ https://' + String(readKv_('settings').github_repo || '').split('/')[1] + '/admin/');
}

function menuSetGithubToken() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('GitHub token', 'วาง fine-grained token (เฉพาะ repo เว็บนี้ · สิทธิ์ Actions: Read and write)\nเว้นว่างแล้วกด OK = ลบ token เดิม', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const t = r.getResponseText().trim();
  const props = PropertiesService.getScriptProperties();
  if (t) props.setProperty('GITHUB_TOKEN', t); else props.deleteProperty('GITHUB_TOKEN');
  ui.alert(t ? 'บันทึก token แล้ว ปุ่มเผยแพร่จะสั่งสร้างเว็บให้ทันที' : 'ลบ token แล้ว');
}

function adminGet_(props) {
  return {
    ok: true,
    profile: readKvRows_('profile'),
    settings: readKvRows_('settings'),
    projects: readTable_('projects'),
    images: readTable_('project_images'),
    skills: readTable_('skills'),
    experiences: readTable_('experiences'),
    messages: readMessages_(),
    lists: { categories: CATEGORIES, coverStyles: COVER_STYLES, skillCats: SKILL_CATS },
    oneClickPublish: !!props.getProperty('GITHUB_TOKEN')
  };
}

function readKvRows_(name) {
  return sheet_(name).getDataRange().getValues().slice(1)
    .filter(r => String(r[0]).trim())
    .map(r => ({ key: String(r[0]).trim(), value: cell_(r[1]), note: String(r[2] || '') }));
}

function readMessages_() {
  return sheet_('messages').getDataRange().getValues().slice(1)
    .map((r, i) => ({ row: i + 2, received_at: cell_(r[0]), name: String(r[1]), email: String(r[2]), message: String(r[3]), read: r[4] === true }))
    .filter(m => m.name || m.message)
    .reverse();
}

function saveKv_(name, values) {
  if (['profile', 'settings'].indexOf(name) < 0) throw new Error('แก้แท็บนี้ไม่ได้');
  const sh = sheet_(name);
  const keys = sh.getRange(1, 1, sh.getMaxRows(), 1).getValues().map(r => String(r[0]).trim());
  Object.keys(values || {}).forEach(k => {
    if (!k || k === 'key') return;
    let row = keys.indexOf(k) + 1;
    if (row < 2) { row = firstEmptyRow_(sh); keys[row - 1] = k; sh.getRange(row, 1).setValue(k); }
    sh.getRange(row, 2).setValue(clean_(values[k]));
  });
  return { ok: true };
}

function saveProject_(row) {
  const sh = sheet_('projects');
  const head = headOf_(sh);
  const ids = sh.getRange(1, 1, sh.getMaxRows(), 1).getValues().map(r => String(r[0]).trim());
  let id = String(row.id || '').trim();
  if (!id) { let n = 1; while (ids.indexOf('p' + n) >= 0) n++; id = 'p' + n; }
  const slug = String(row.slug || '').trim();
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error('slug ต้องเป็น a-z, 0-9 คั่นด้วย - เช่น my-project');
  const slugCol = head.indexOf('slug');
  const all = sh.getDataRange().getValues();
  const dup = all.findIndex((r, i) => i > 0 && String(r[0]).trim() !== id && String(r[slugCol]).trim() === slug);
  if (dup > 0) throw new Error('slug "' + slug + '" ซ้ำกับผลงานแถว ' + (dup + 1));
  let r = ids.indexOf(id) + 1;
  if (r < 2) r = firstEmptyRow_(sh);
  const cur = sh.getRange(r, 1, 1, head.length).getValues()[0];
  const out = head.map((h, i) => h === 'id' ? id : h === 'updated_at' ? new Date() : h === 'featured' ? row.featured === true :
    Object.prototype.hasOwnProperty.call(row, h) ? clean_(row[h]) : cur[i]);
  sh.getRange(r, 1, 1, out.length).setValues([out]);
  return { ok: true, id: id };
}

function deleteProject_(id) {
  const sh = sheet_('projects');
  const r = sh.getRange(1, 1, sh.getMaxRows(), 1).getValues().findIndex((x, i) => i > 0 && String(x[0]).trim() === id) + 1;
  if (r < 2) throw new Error('ไม่พบผลงาน ' + id);
  sh.deleteRow(r);
  saveTable_('project_images', [], id); // ลบเฉพาะแถวอ้างอิงรูป ไฟล์ใน Drive ยังอยู่
  return { ok: true };
}

/** เขียนทับทั้งตาราง (ลำดับตามที่ส่งมา) · project_images แทนที่เฉพาะแถวของผลงานที่ระบุ */
function saveTable_(name, rows, pid) {
  if (['skills', 'experiences', 'project_images'].indexOf(name) < 0) throw new Error('แก้แท็บนี้ไม่ได้');
  const sh = sheet_(name);
  const head = headOf_(sh);
  let list = (rows || []).map((o, i) => head.map(h => h === 'sort_order' ? i + 1 : clean_(o[h])));
  if (name === 'project_images') {
    if (!pid) throw new Error('ไม่ระบุผลงาน');
    const pc = head.indexOf('project_id');
    list.forEach(r => { r[pc] = pid; });
    list = list.filter(r => String(r[head.indexOf('drive_file_id')]).trim());
    const keep = readTable_(name).filter(o => String(o.project_id) !== pid).map(o => head.map(h => o[h] === undefined ? '' : o[h]));
    list = keep.concat(list);
  }
  list = list.filter(r => String(r[0]).trim() !== '');
  const last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, head.length).clearContent();
  if (list.length) sh.getRange(2, 1, list.length, head.length).setValues(list);
  return { ok: true };
}

function setRead_(row, read) {
  const sh = sheet_('messages');
  if (!(row >= 2 && row <= sh.getLastRow())) throw new Error('ไม่พบข้อความ');
  sh.getRange(row, SHEETS.messages.indexOf('read') + 1).setValue(read);
  return { ok: true };
}

function upload_(d, props) {
  const mime = String(d.mime || '');
  if (!/^image\/(png|jpeg|webp|gif)$/.test(mime) && mime !== 'application/pdf') throw new Error('รองรับเฉพาะรูป PNG/JPG/WebP และไฟล์ PDF');
  const bytes = Utilities.base64Decode(String(d.b64 || ''));
  if (!bytes.length || bytes.length > 10 * 1024 * 1024) throw new Error('ไฟล์ว่างหรือใหญ่เกิน 10 MB');
  const name = String(d.name || 'upload').replace(/[\\/:*?"<>|]/g, '_').slice(0, 120);
  let folder = null;
  const fid = props.getProperty('UPLOAD_FOLDER');
  if (fid) { try { folder = DriveApp.getFolderById(fid); } catch (_) { folder = null; } }
  if (!folder) { folder = DriveApp.createFolder('Portfolio — รูปและไฟล์'); props.setProperty('UPLOAD_FOLDER', folder.getId()); }
  return { ok: true, id: folder.createFile(Utilities.newBlob(bytes, mime, name)).getId() };
}

/** รูปตัวอย่างในหน้า admin — เฉพาะไฟล์ที่ Sheet อ้างถึง (รวมผลงานที่ยังเป็น draft) */
function adminFile_(id) {
  const allowed = new Set();
  readTable_('projects').forEach(p => p.cover_image_id && allowed.add(String(p.cover_image_id)));
  readTable_('project_images').forEach(i => i.drive_file_id && allowed.add(String(i.drive_file_id)));
  if (!id || !allowed.has(id)) return { ok: false, error: 'file not allowed' };
  const file = DriveApp.getFileById(id);
  const blob = file.getThumbnail() || file.getBlob();
  return { ok: true, mime: blob.getContentType() || 'image/png', b64: Utilities.base64Encode(blob.getBytes()) };
}

/* ---------------- setup ---------------- */
function setupPortfolio() {
  const ss = SpreadsheetApp.getActive();
  Object.keys(SHEETS).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() > 0) return; // มีข้อมูลแล้ว ไม่เขียนทับ
    const head = SHEETS[name];
    (TEXT_COLS[name] || []).forEach(c => sh.getRange(1, head.indexOf(c) + 1, sh.getMaxRows(), 1).setNumberFormat('@'));
    const rows = seedRows_(name);
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#e9eeec');
    if (rows.length) sh.getRange(2, 1, rows.length, head.length).setValues(rows);
    sh.setFrozenRows(1);
    const col = c => sh.getRange(2, head.indexOf(c) + 1, Math.max(sh.getMaxRows() - 1, 1), 1);
    const list = (c, vals) => col(c).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(vals, true).setAllowInvalid(false).build());
    if (name === 'projects') {
      list('category', CATEGORIES); list('cover_style', COVER_STYLES); list('status', ['draft', 'published']);
      col('featured').insertCheckboxes();
      ['summary', 'overview', 'problem', 'role', 'process', 'results'].forEach(c => sh.setColumnWidth(head.indexOf(c) + 1, 280));
      col('process').setWrap(true); col('results').setWrap(true);
    }
    if (name === 'skills') list('category', SKILL_CATS);
    if (name === 'experiences') list('type', ['work', 'edu']);
    if (name === 'messages') col('read').insertCheckboxes();
    if (name === 'profile' || name === 'settings') { sh.setColumnWidth(2, 420); sh.setColumnWidth(3, 320); col('value').setWrap(true); }
  });
  ['Sheet1', 'แผ่น1', 'ชีต1'].forEach(n => { const s = ss.getSheetByName(n); if (s && s.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s); });
  try { SpreadsheetApp.getUi().alert('สร้างแท็บและข้อมูลตัวอย่างเรียบร้อย\nขั้นต่อไป: ทำให้ใช้งานได้เป็นเว็บแอป (ดำเนินการในฐานะ: ฉัน · ผู้มีสิทธิ์: ทุกคน)'); } catch (_) {}
}

function seedRows_(name) {
  const S = SEED;
  if (name === 'profile') return Object.keys(S.profile).map(k => [k, S.profile[k][0], S.profile[k][1]]);
  if (name === 'settings') return Object.keys(S.settings).map(k => [k, S.settings[k][0], S.settings[k][1]]);
  if (name === 'projects') return S.projects.map((p, i) => SHEETS.projects.map(c =>
    c === 'sort_order' ? i + 1 : c === 'updated_at' ? new Date() :
      Array.isArray(p[c]) ? p[c].join(c === 'tech' ? ', ' : '\n') : (p[c] === undefined ? '' : p[c])));
  if (name === 'skills') return S.skills.map((s, i) => [s[0], s[1], i + 1]);
  if (name === 'experiences') return S.experiences.map((e, i) => [e.type, e.organization, e.position, e.start, e.end, e.description, i + 1]);
  return [];
}

/* ---------------- helpers ---------------- */
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function sheet_(name) { const s = SpreadsheetApp.getActive().getSheetByName(name); if (!s) throw new Error('ไม่พบแท็บ ' + name + ' — รัน setupPortfolio ก่อน'); return s; }
function cell_(v) { return v instanceof Date ? v.toISOString() : v; }
function clean_(v) { return typeof v === 'boolean' || typeof v === 'number' ? v : String(v == null ? '' : v).slice(0, 20000); }
function headOf_(sh) { return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(h => String(h).trim()); }
function locked_(fn) { const l = LockService.getScriptLock(); l.waitLock(15000); try { return fn(); } finally { l.releaseLock(); } }

/** แถวว่างแรกจากคอลัมน์ A (appendRow ใช้ไม่ได้เพราะคอลัมน์ checkbox ทำให้ทุกแถว "มีข้อมูล") */
function firstEmptyRow_(sh) {
  const r = sh.getRange(1, 1, sh.getMaxRows(), 1).getValues().findIndex((x, i) => i > 0 && x[0] === '') + 1;
  if (r >= 2) return r;
  sh.insertRowAfter(sh.getMaxRows());
  return sh.getMaxRows();
}

function readTable_(name) {
  const v = sheet_(name).getDataRange().getValues();
  if (v.length < 2) return [];
  const head = v[0].map(h => String(h).trim());
  return v.slice(1)
    .filter(r => String(r[0]).trim() !== '')
    .map(r => { const o = {}; head.forEach((h, i) => { if (h) o[h] = typeof r[i] === 'string' ? r[i].trim() : cell_(r[i]); }); return o; })
    .sort((a, b) => (Number(a.sort_order) || 9999) - (Number(b.sort_order) || 9999));
}

function readKv_(name) {
  const o = {};
  sheet_(name).getDataRange().getValues().slice(1).forEach(r => { const k = String(r[0]).trim(); if (k) o[k] = typeof r[1] === 'string' ? r[1].trim() : cell_(r[1]); });
  return o;
}

function driveExists_(id) { try { DriveApp.getFileById(String(id)).getName(); return true; } catch (_) { return false; } }

/* ---------------- ข้อมูลตัวอย่าง (ใช้ตอน setupPortfolio ครั้งแรกเท่านั้น) ---------------- */
const SEED = {
  profile: {
    name: ['[ชื่อ นามสกุล]', 'ชื่อที่แสดงบนเว็บ'],
    title: ['Web Developer', 'ตำแหน่งที่สมัคร'],
    tagline: ['สร้างระบบที่ทีมหน้างานใช้ได้จริง ตั้งแต่แอปใน LINE เว็บแอปจัดการงาน ไปจนถึงระบบสั่งแก้จอ Digital Signage จากระยะไกล', 'แนะนำตัวสั้น บนหน้าแรก'],
    bio: ['พัฒนาระบบภายในให้ Push Media บริษัทที่ดูแลจอ Digital Signage ตามสาขาห้าง ทำทั้งเก็บความต้องการจากผู้ใช้ ออกแบบข้อมูล เขียนโค้ด ไปจนถึงทำคู่มือและส่งมอบ\nงานส่วนใหญ่เริ่มจากปัญหาที่ทีมเจอทุกวัน เช่น ตารางงานกระจายอยู่ในแชท หรือเคสจอเสียที่ต้องรีโมตเข้าทีละเครื่อง แล้วแก้ด้วยเครื่องมือที่ทีมเปิดใช้ได้ทันทีโดยไม่ต้องติดตั้งอะไรเพิ่ม', 'หน้าเกี่ยวกับ · ขึ้นบรรทัดใหม่ = ย่อหน้าใหม่ (Ctrl+Enter ในช่อง)'],
    goal: ['อยากทำงานในทีมพัฒนาเว็บที่มีผู้ใช้จริงจำนวนมาก ได้ฝึก code review, testing และสถาปัตยกรรมระบบที่ใหญ่ขึ้น', 'เป้าหมายในสายอาชีพ'],
    location: ['กรุงเทพฯ', ''],
    email: ['you@example.com', 'อีเมลที่แสดงบนเว็บ (ข้อความจากฟอร์มส่งไปที่อีเมลเจ้าของ Sheet)'],
    github: ['https://github.com/nutnetworkit-cloud', ''],
    linkedin: ['', 'เว้นว่างได้ถ้ายังไม่มี'],
    available: [true, 'TRUE = แสดงป้าย "เปิดรับงาน"']
  },
  settings: {
    seo_title: ['Web Developer Portfolio', 'ชื่อเว็บบน Google และแท็บเบราว์เซอร์'],
    seo_description: ['ผลงานพัฒนาเว็บแอป LINE LIFF และระบบอัตโนมัติสำหรับองค์กร', 'ไม่เกิน 160 ตัวอักษร'],
    show_resume: [true, 'TRUE = แสดงหน้า Resume'],
    resume_drive_id: ['', 'ID ไฟล์ Resume PDF ใน Drive (ส่วนหลัง /d/ ในลิงก์) — เว้นว่างได้'],
    github_repo: ['nutnetworkit-cloud/nutnetworkit-cloud.github.io', 'ใช้กับเมนูเผยแพร่เว็บ']
  },
  skills: [
    ['JavaScript', SKILL_CATS[0]], ['TypeScript', SKILL_CATS[0]], ['React / Next.js', SKILL_CATS[0]], ['HTML / CSS', SKILL_CATS[0]], ['LINE LIFF', SKILL_CATS[0]],
    ['Google Apps Script', SKILL_CATS[1]], ['Node.js', SKILL_CATS[1]], ['WebSocket', SKILL_CATS[1]], ['REST API', SKILL_CATS[1]], ['Cloudflare Tunnel', SKILL_CATS[1]],
    ['Google Sheets', SKILL_CATS[2]], ['GitHub Actions', SKILL_CATS[2]], ['PowerShell', SKILL_CATS[2]], ['Excel / SheetJS', SKILL_CATS[2]], ['Odoo', SKILL_CATS[2]]
  ],
  experiences: [
    { type: 'work', organization: 'Push Media', position: '[ตำแหน่งของคุณ]', start: '[ปีที่เริ่ม]', end: 'ปัจจุบัน', description: 'พัฒนาระบบภายในองค์กร 8 ระบบ ครอบคลุมงานพนักงาน งานเมสเซนเจอร์ ทรัพย์สิน IT ประกันจอ และระบบจัดการจอ Digital Signage' },
    { type: 'edu', organization: '[ชื่อมหาวิทยาลัย]', position: '[คณะ / สาขา]', start: '[ปี]', end: '[ปี]', description: '' }
  ],
  projects: [
    { id: 'p1', title: 'Workforce Task Manager', slug: 'workforce-task-manager', category: 'LINE LIFF', cover_style: 'liff', hue: 152,
      summary: 'ระบบตารางงานและมอบหมายงานพนักงานผ่าน LINE พนักงานดูงานของตัวเองจากมือถือ หัวหน้าเห็นภาพรวมแยกรายทีม',
      overview: 'เว็บแอปที่เปิดใน LINE (LIFF) ล็อกอินด้วยบัญชี LINE ของพนักงาน แสดงตารางงานรายวัน งานที่ได้รับมอบหมาย และ Dashboard วิเคราะห์ภาระงานของแต่ละทีม',
      problem: 'ตารางงานเดิมกระจายอยู่ในไฟล์และกลุ่มแชท หัวหน้าไม่เห็นภาระงานของแต่ละทีมแบบทันที พนักงานต้องถามซ้ำว่าวันนี้ต้องไปที่ไหน',
      role: 'ออกแบบและพัฒนาทั้งระบบคนเดียว ทั้ง backend บน Google Apps Script หน้า LIFF และ Dashboard',
      process: ['เก็บความต้องการจากหัวหน้าทีมและพนักงานหน้างาน', 'ออกแบบโครงสร้างข้อมูลบน Google Sheets และ API ผ่าน Apps Script', 'ทำหน้า LIFF ที่ล็อกอินด้วย LINE โฮสต์บน GitHub Pages', 'เพิ่ม Dashboard วิเคราะห์แยกรายทีม และแยกทีม Service ออกจาก ranking', 'ปรับความเร็วการโหลดบนมือถือ'],
      tech: ['Google Apps Script', 'LINE LIFF', 'JavaScript', 'GitHub Pages', 'Google Sheets'],
      results: ['พนักงานเปิดดูงานใน LINE ได้ทันที ไม่ต้องติดตั้งแอปเพิ่ม', 'ปรับปรุงต่อเนื่องจากการใช้งานจริงเกือบ 200 เวอร์ชัน'],
      metric_value: 'v199', metric_label: 'เวอร์ชันที่ deploy', status: 'published', featured: true },
    { id: 'p2', title: 'Messenger System', slug: 'messenger-system', category: 'Web App', cover_style: 'map', hue: 28,
      summary: 'ระบบสั่งงานเมสเซนเจอร์รับ-ส่งเอกสารและวางบิล มีแผนที่เส้นทาง ระยะทางรวม และรายงาน PDF / Excel',
      overview: 'ผู้ขอใช้กรอกงานผ่านเว็บ ผู้ดูแลมอบหมายให้เมสเซนเจอร์ ติดตามสถานะบนแผนที่ และออกรายงานสรุปได้ในหน้าเดียว',
      problem: 'งานเมสเซนเจอร์สั่งผ่านแชท ติดตามสถานะยาก การสรุประยะทางและงานล่าช้าต้องทำมือทุกเดือน',
      role: 'ออกแบบและพัฒนาทั้งระบบบน Google Apps Script รวมถึงหน้า Dashboard Map และระบบรายงาน',
      process: ['ทำฟอร์มสั่งงานที่ไม่ต้องล็อกอิน', 'ระบบมอบหมายงานและอัปเดตสถานะจากหน้างาน', 'Dashboard Map แสดงจุดรับ-ส่งและระยะทางรวม', 'ปุ่มออกรายงาน PDF และ Excel'],
      tech: ['Google Apps Script', 'JavaScript', 'Google Maps', 'PDF / Excel export'],
      results: ['รายงานเหตุผลการยกเลิกและผลส่งงานตรงเวลา/ล่าช้า ออกได้ในคลิกเดียว', 'ผู้ดูแลเห็นงานทั้งหมดบนแผนที่พร้อมระยะทางแยกจุด'],
      metric_value: 'PDF + Excel', metric_label: 'รายงานอัตโนมัติ', end: '2026-09', status: 'published', featured: true },
    { id: 'p3', title: 'codexAssist Device Management', slug: 'codexassist-device-management', category: 'AI & Automation', cover_style: 'node', hue: 172,
      summary: 'Agent บนเครื่องเล่นจอ + Command Gateway + Dashboard ให้บอทบริการลูกค้าและทีม IT สั่งแก้จอได้จากระยะไกล',
      overview: 'ชุดระบบ 3 ส่วน: Device Agent บนเครื่องเล่นจอ Windows เชื่อมขาออกไปที่ Gateway, Gateway ตรวจสิทธิ์และส่งคำสั่ง, Dashboard แสดงจอ online/offline และปัญหาแบบสด พร้อม Action Skills ให้บอทเลือกวิธีแก้ตามอาการ',
      problem: 'เคสจอเสียตามสาขาต้องให้ IT รีโมตเข้าทีละเครื่อง เป้าหมายคือให้บอทแก้ปัญหาที่พบบ่อยได้เองโดยไม่ต้องรอคน',
      role: 'วิเคราะห์ข้อมูลเคส ออกแบบสถาปัตยกรรม เขียนโค้ด agent / gateway / ตัวติดตั้ง และเขียนคู่มือ',
      process: ['วิเคราะห์ Service Report จริง 1,049 เคส แยกว่าเคสไหนบอทแก้เองได้', 'ออกแบบ playbook จับคู่อาการกับคำสั่งแก้', 'เขียน Agent ที่เชื่อม WebSocket ขาออก ไม่ต้องเปิดพอร์ตที่สาขา', 'ลงลายเซ็นคำสั่งด้วย HMAC และรับเฉพาะคำสั่งใน allowlist', 'ทำตัวติดตั้งเป็นไฟล์ .exe เดียวพร้อมคู่มือ'],
      tech: ['Node.js', 'WebSocket', 'HMAC', 'PowerShell', 'Cloudflare Tunnel', 'Ubuntu / systemd'],
      results: ['ประเมินว่าบอทปิดเคสเองได้จาก 24% เพิ่มเป็น ~69% เมื่อทำครบ 3 เฟส', 'ทดสอบ end-to-end ผ่าน 13 จาก 13 กรณี'],
      metric_value: '24% → 69%', metric_label: 'เคสที่บอทปิดเองได้ (ประเมิน)', start: '2026-09', status: 'published', featured: true },
    { id: 'p4', title: 'Warranty Service', slug: 'warranty-service', category: 'Web App', cover_style: 'web', hue: 200,
      summary: 'เว็บแอปติดตามสัญญา MA และประกันจอ Digital Signage แยกตามสาขาห้าง ใช้งานจริงแล้ว',
      overview: 'รวมข้อมูลประกันและสัญญาบำรุงรักษาของจอทุกเครื่องไว้ที่เดียว ค้นหาตามสาขา ดูวันหมดอายุ และมีระบบล็อกอินสำหรับผู้ใช้',
      problem: 'ข้อมูลประกันอยู่ใน Google Sheet ที่พิมพ์มือประมาณ 50 กลุ่มข้อมูล รูปแบบไม่ตรงกัน หาเครื่องที่ใกล้หมดประกันได้ยาก',
      role: 'ออกแบบและพัฒนาทั้งระบบ รวมถึงแปลงข้อมูลจาก Sheet เดิมให้ใช้เป็นฐานข้อมูลได้',
      process: ['สำรวจโครงสร้าง Sheet เดิม', 'ทำตัวอ่านข้อมูลที่รองรับรูปแบบที่ไม่สม่ำเสมอ', 'ทำหน้าเว็บค้นหาและแสดงสถานะประกัน', 'เพิ่มระบบล็อกอินและ deploy ใช้งานจริง'],
      tech: ['Google Apps Script', 'Google Sheets', 'JavaScript'],
      results: ['ทีมดูสถานะประกันของจอได้จากเว็บเดียว ไม่ต้องเปิดไฟล์', 'ใช้งานจริงตั้งแต่ ก.ย. 2026'],
      metric_value: '~50', metric_label: 'กลุ่มข้อมูลจาก Sheet เดิม', start: '2026-09', status: 'published', featured: false },
    { id: 'p5', title: 'Asset & ServiceDesk', slug: 'asset-servicedesk', category: 'Web App', cover_style: 'web', hue: 222,
      summary: 'ทะเบียนทรัพย์สินองค์กรและระบบแจ้งซ่อม IT ในเว็บเดียว แยกหน้าผู้ดูแลกับหน้าผู้ใช้ทั่วไป',
      overview: 'ผู้ดูแลจัดการทะเบียนทรัพย์สินและงานซ่อม ส่วนพนักงานใช้หน้าผู้ใช้แจ้งปัญหาและติดตามสถานะ',
      problem: 'ข้อมูลทรัพย์สิน IT และงานแจ้งซ่อมแยกกันอยู่ ไม่รู้ประวัติการซ่อมของอุปกรณ์แต่ละชิ้น',
      role: 'ออกแบบและพัฒนาทั้งระบบ',
      process: ['ออกแบบข้อมูลทรัพย์สินและใบแจ้งซ่อม', 'ทำหน้าผู้ดูแลและหน้าผู้ใช้แยกกัน', 'จำกัดสิทธิ์เข้าใช้เฉพาะบัญชีองค์กร'],
      tech: ['Google Apps Script', 'JavaScript', 'Google Workspace'],
      results: ['พนักงานแจ้งซ่อมเองได้ IT เห็นประวัติของอุปกรณ์ในที่เดียว'],
      status: 'published', featured: false },
    { id: 'p6', title: 'Sign-off Builder', slug: 'signoff-builder', category: 'UI/UX', cover_style: 'doc', hue: 44,
      summary: 'กรอกฟอร์มแล้วได้เอกสาร Sign-off งานติดตั้ง Kiosk / Signage เป็น PDF พร้อมเซ็น',
      overview: 'Prototype ที่ให้ทีมติดตั้งกรอกรายละเอียดงานผ่านฟอร์ม แล้วสร้างเอกสารส่งมอบตามแบบฟอร์มบริษัท',
      problem: 'เอกสาร Sign-off ทำจาก template ที่แก้ด้วยมือ ข้อมูลผิดบ่อยและใช้เวลานาน',
      role: 'ออกแบบ UX และทำ prototype ที่คลิกได้จริงเพื่อนำเสนอผู้บริหาร',
      process: ['ศึกษา template เดิม', 'ออกแบบฟอร์มตามลำดับงานติดตั้ง', 'ทำ prototype สร้างเอกสารตัวอย่างจากฟอร์ม'],
      tech: ['HTML / CSS', 'JavaScript', 'PDF'],
      results: ['ผู้บริหารเห็นภาพระบบได้ก่อนลงทุนพัฒนาจริง'],
      start: '2026-09', end: '2026-09', status: 'published', featured: false },
    { id: 'p7', title: 'Odoo HR Data Migration', slug: 'odoo-hr-migration', category: 'Data', cover_style: 'data', hue: 96,
      summary: 'แปลงข้อมูลพนักงาน 95 คนเป็นไฟล์นำเข้า Odoo HR พร้อมทำ JD และ KPI 32 ตำแหน่ง',
      overview: 'เตรียมข้อมูลพนักงานจากไฟล์เดิมให้ตรงโครงสร้างของ Odoo HR และจัดทำเอกสารหน้าที่งานกับตัวชี้วัด',
      problem: 'ข้อมูลพนักงานอยู่หลายไฟล์ คอลัมน์ไม่ตรงกับที่ Odoo ต้องการ',
      role: 'map ข้อมูล เขียนสคริปต์แปลงไฟล์ และจัดทำเอกสาร JD / KPI',
      process: ['map คอลัมน์ข้อมูลเดิมกับฟิลด์ของ Odoo', 'เขียนสคริปต์ Node.js + SheetJS แปลงเป็น xlsx และ csv', 'ทำ JD และ KPI 32 ตำแหน่งเป็น PDF'],
      tech: ['Node.js', 'SheetJS', 'Odoo', 'Excel'],
      results: ['ได้ไฟล์ import พร้อมใช้สำหรับพนักงาน 95 คน'],
      metric_value: '95', metric_label: 'พนักงานที่ map ข้อมูล', start: '2026-10', status: 'published', featured: false },
    { id: 'p8', title: 'Employee Portal', slug: 'employee-portal', category: 'UI/UX', cover_style: 'mobile', hue: 338,
      summary: 'ออกแบบแอปพนักงานและ HR บนมือถือ เป็น prototype ที่คลิกได้จริง',
      overview: 'ขั้นตอนออกแบบ UI / UX ของแอปพนักงาน ยังไม่มี backend',
      role: 'ออกแบบ UI / UX และทำ prototype',
      process: ['ร่าง flow หลักของพนักงาน', 'ทำ prototype HTML ที่คลิกได้'],
      tech: ['HTML / CSS', 'JavaScript'],
      start: '2026-09', status: 'draft', featured: false },
    { id: 'p9', title: 'Portfolio Website', slug: 'portfolio-website', category: 'Web App', cover_style: 'web', hue: 168,
      summary: 'เว็บนี้เอง: Next.js สร้างหน้าเว็บสำเร็จรูป ดึงข้อมูลจาก Google Sheet ผ่าน Apps Script และ deploy อัตโนมัติด้วย GitHub Actions',
      overview: 'แยกข้อมูลออกจากโค้ด เจ้าของเว็บแก้ผลงานใน Google Sheet แล้วกดเผยแพร่ ระบบจะสร้างเว็บใหม่และขึ้น GitHub Pages ให้เอง ไม่มีค่าใช้จ่าย',
      problem: 'อยากได้ Portfolio ที่เพิ่มผลงานได้เองโดยไม่ต้องแก้โค้ด โหลดเร็ว และไม่มีค่าเซิร์ฟเวอร์',
      role: 'ออกแบบและพัฒนาทั้งหมด',
      process: ['ทำ prototype หน้าเว็บและหลังบ้านเพื่อตกลงหน้าตา', 'ออกแบบโครงสร้างข้อมูลเป็นแท็บใน Google Sheet', 'เขียน Apps Script เป็น API อ่านข้อมูลและรับข้อความจากฟอร์ม', 'Next.js สร้างหน้าเว็บสำเร็จรูปตอน build และย่อรูปจาก Drive ด้วย sharp', 'GitHub Actions build และ deploy ขึ้น GitHub Pages ทุกครั้งที่กดเผยแพร่'],
      tech: ['Next.js', 'TypeScript', 'Google Apps Script', 'GitHub Actions', 'GitHub Pages'],
      results: ['ค่าใช้จ่าย 0 บาท', 'เพิ่มผลงานใหม่ได้จาก Google Sheet โดยไม่ต้องแตะโค้ด'],
      metric_value: '0 บาท', metric_label: 'ค่าโฮสติ้งต่อเดือน', github_url: 'https://github.com/nutnetworkit-cloud/nutnetworkit-cloud.github.io', start: '2026-10', status: 'published', featured: false }
  ]
};
