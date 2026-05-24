// ── GLOBAL STATE (Firebase listener จะอัปเดตค่าเหล่านี้) ──
window.newsData      = [];
window.partnerData   = [];
window.nextNewsId    = 10;
window.nextPartnerId = 10;

// ── FIREBASE SAVE HELPERS ──
async function saveNews_fb(item){
  const {doc:d,setDoc:s} = window.__fsFn||{};
  if(!d||!window.__db) return;
  await s(d(window.__db,'news',String(item.id)), item);
  if(window.__saveCounters) await window.__saveCounters();
}
async function deleteNews_fb(id){
  const {doc:d,deleteDoc:del} = window.__fsFn||{};
  if(!d||!window.__db) return;
  await del(d(window.__db,'news',String(id)));
}
async function savePartner_fb(item){
  const {doc:d,setDoc:s} = window.__fsFn||{};
  if(!d||!window.__db) return;
  await s(d(window.__db,'partners',String(item.id)), item);
  if(window.__saveCounters) await window.__saveCounters();
}
async function deletePartner_fb(id){
  const {doc:d,deleteDoc:del} = window.__fsFn||{};
  if(!d||!window.__db) return;
  await del(d(window.__db,'partners',String(id)));
}

const TAG_MAP = {'tag-new':'NEW','tag-update':'UPDATE','tag-wip':'IN DEV','tag-info':'INFO'};

// ── LINKIFY ──
function linkify(text){
  const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return escaped.replace(/(https?:\/\/[^\s<]+)/g, url =>
    `<a href="${url}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="color:#a78bfa;word-break:break-all;text-decoration:underline;text-underline-offset:2px;">${url}</a>`
  );
}

// ── RENDER ──
function renderNews(){
  const grid = document.getElementById('news-grid');
  const newsData = window.newsData;
  grid.innerHTML = newsData.map(n => {
    const imgSection = n.img
      ? `<div class="news-img-wrap" style="${n.color?'border-bottom:3px solid '+n.color:''}" onclick="openPostPage(${n.id})"><img src="${n.img}" alt="" loading="lazy"/></div>`
      : (n.color ? `<div style="height:4px;background:${n.color}"></div>` : '');
    return `<div class="news-card rv" style="cursor:pointer" onclick="openPostPage(${n.id})">
      ${imgSection}
      <div class="news-body-wrap">
        <span class="news-tag ${n.tag}">${TAG_MAP[n.tag]||n.tag}</span>
        <div class="news-date">${n.date}</div>
        <div class="news-title">${n.title}</div>
        <div class="news-text" style="white-space:pre-wrap">${linkify(n.desc)}</div>
      </div>
    </div>`;
  }).join('');
  revealAll('#news-grid .rv');
}

function renderPartners(){
  const grid = document.getElementById('partner-grid');
  const ICONS = {
    yt:  {cls:'p-link-yt',  svg:'<svg viewBox="0 0 24 24" fill="white" width="13" height="13"><path d="M23.5 6.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C17.4 2.7 12 2.7 12 2.7s-5.4 0-8.3.2c-.5.1-1.5.1-2.3 1-.7.7-.9 2.3-.9 2.3S.2 8 .2 9.8v1.7c0 1.8.3 3.6.3 3.6s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.2 7.6.2s5.4 0 8.3-.3c.5-.1 1.5-.1 2.3-1 .7-.7.9-2.3.9-2.3s.3-1.8.3-3.6V9.8C23.8 8 23.5 6.2 23.5 6.2zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>'},
    dc:  {cls:'p-link-dc',  svg:'<svg viewBox="0 0 24 24" fill="white" width="13" height="13"><path d="M20.3 4.4A19.7 19.7 0 0015 3c-.2.4-.5.9-.7 1.3a18.3 18.3 0 00-4.6 0A13 13 0 009 3a19.7 19.7 0 00-5.3 1.4C1.3 8.3.7 12 1 15.7a19.9 19.9 0 006 3 15 15 0 001.3-2.1 13 13 0 01-2-.9l.5-.4a14.2 14.2 0 0012.4 0l.5.4a13 13 0 01-2 .9 15 15 0 001.3 2.1 19.8 19.8 0 006-3c.3-4.2-.7-7.9-3.7-11.3zM8.5 13.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm7 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"/></svg>'},
    tt:  {cls:'p-link-tt',  svg:'<svg viewBox="0 0 24 24" fill="white" width="13" height="13"><path d="M19.6 3h-3v9.5a2.5 2.5 0 01-2.5 2.5 2.5 2.5 0 01-2.5-2.5 2.5 2.5 0 012.5-2.5c.2 0 .4 0 .6.1V7a6 6 0 00-.6 0 5.5 5.5 0 00-5.5 5.5 5.5 5.5 0 005.5 5.5 5.5 5.5 0 005.5-5.5V8.3a7.7 7.7 0 004.5 1.4V6.8A4.5 4.5 0 0119.6 3z"/></svg>'},
    tw:  {cls:'p-link-tw',  svg:'<svg viewBox="0 0 24 24" fill="white" width="13" height="13"><path d="M18.3 5H21l-5.9 6.8L22 21h-5.4l-3.8-5-4.4 5H6l6.3-7.2L2 5h5.6l3.5 4.6L18.3 5zm-1 14.3h1.5L6.7 6.5H5.1l12.2 12.8z"/></svg>'},
    fb:  {cls:'p-link-fb',  svg:'<svg viewBox="0 0 24 24" fill="white" width="13" height="13"><path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5v-2.2c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9H13.5v7C18.3 21.1 22 17 22 12z"/></svg>'},
    web: {cls:'p-link-web', svg:'🌐'},
  };
  function buildLinks(p){
    let out='';
    if(p.yt)  out+=`<a href="${p.yt}"  target="_blank" class="p-link-btn p-link-yt"  title="YouTube">${ICONS.yt.svg}</a>`;
    if(p.dc)  out+=`<a href="${p.dc}"  target="_blank" class="p-link-btn p-link-dc"  title="Discord">${ICONS.dc.svg}</a>`;
    if(p.tt)  out+=`<a href="${p.tt}"  target="_blank" class="p-link-btn p-link-tt"  title="TikTok">${ICONS.tt.svg}</a>`;
    if(p.tw)  out+=`<a href="${p.tw}"  target="_blank" class="p-link-btn p-link-tw"  title="Twitter/X">${ICONS.tw.svg}</a>`;
    if(p.fb)  out+=`<a href="${p.fb}"  target="_blank" class="p-link-btn p-link-fb"  title="Facebook">${ICONS.fb.svg}</a>`;
    if(p.web) out+=`<a href="${p.web}" target="_blank" class="p-link-btn p-link-web" title="Website" style="font-size:.8rem">${ICONS.web.svg}</a>`;
    return out;
  }
  const partnerData = window.partnerData;
  grid.innerHTML = partnerData.map(p => {
    const imgHtml = p.img
      ? `<img src="${p.img}" alt="${p.name}"/>`
      : `<div class="p-img-placeholder">🌐</div>`;
    const borderStyle = p.color ? `border:2px solid ${p.color}` : '';
    const bgStyle = p.img ? `background-image:url('${p.img}')` : (p.color ? `background:${p.color}` : '');
    const links = buildLinks(p);
    return `<div class="partner-card rv" style="${borderStyle}">
      <div class="pc-bg" style="${bgStyle}"></div>
      <div class="pc-inner">
        <div class="p-img-wrap">${imgHtml}</div>
        <div class="p-info">
          <div class="p-name">${p.name}</div>
          <div class="p-role">${p.role}</div>
          ${links ? `<div class="p-links">${links}</div>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
  revealAll('#partner-grid .rv');
}

function revealAll(sel){
  setTimeout(()=>{document.querySelectorAll(sel).forEach(el=>el.classList.add('vis'));},80);
}

// ── ADMIN LIST RENDER ──
function renderAdminNews(){
  const newsData = window.newsData;
  document.getElementById('admin-news-list').innerHTML = newsData.map(n=>`
    <div class="admin-item">
      ${n.img ? `<img class="admin-item-img" src="${n.img}" alt=""/>` : `<div class="admin-item-img-placeholder">🖼</div>`}
      <div class="admin-item-body">
        <div class="admin-item-title">${n.title}</div>
        <div class="admin-item-sub">${TAG_MAP[n.tag]} · ${n.date}</div>
      </div>
      <div class="admin-item-actions">
        <button class="admin-item-edit" onclick="editNews(${n.id})">✏ Edit</button>
        <button class="admin-item-del" onclick="delNews(${n.id})">ลบ</button>
      </div>
    </div>`).join('');
}

function renderAdminPartners(){
  const partnerData = window.partnerData;
  document.getElementById('admin-partner-list').innerHTML = partnerData.map(p=>`
    <div class="admin-item">
      ${p.img ? `<img class="admin-item-img" src="${p.img}" alt=""/>` : `<div class="admin-item-img-placeholder">🌐</div>`}
      <div class="admin-item-body">
        <div class="admin-item-title">${p.name}</div>
        <div class="admin-item-sub">${p.role}</div>
      </div>
      <div class="admin-item-actions">
        <button class="admin-item-edit" onclick="editPartner(${p.id})">✏ Edit</button>
        <button class="admin-item-del" onclick="delPartner(${p.id})">ลบ</button>
      </div>
    </div>`).join('');
}

// ── PAGE NAVIGATION ──
function goPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  window.scrollTo(0,0);
  document.querySelectorAll('.nav-links a').forEach(a=>a.classList.remove('nav-active'));
  const map={home:'nl-home',download:'nl-dl'};
  if(map[name]) document.getElementById(map[name])?.classList.add('nav-active');
  setTimeout(()=>{document.querySelectorAll('#page-'+name+' .rv').forEach(el=>el.classList.add('vis'));},80);
}
function later(id){setTimeout(()=>scrollSec(id),120);}
function scrollSec(id){const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth'});}

// ── REVEAL ──
const ro=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('vis');});},{threshold:.1});
document.querySelectorAll('.rv').forEach(el=>ro.observe(el));

// ── ADMIN LOGIN POPUP ──
function toggleAdminLogin(){
  const p=document.getElementById('admin-popup');
  p.classList.toggle('open');
  if(p.classList.contains('open')){
    document.getElementById('ap-user').value='';
    document.getElementById('ap-pass').value='';
    document.getElementById('ap-err').style.display='none';
  }
}
document.addEventListener('click',e=>{
  const pop=document.getElementById('admin-popup');
  const fab=document.getElementById('admin-fab');
  if(pop.classList.contains('open')&&!pop.contains(e.target)&&!fab.contains(e.target)) pop.classList.remove('open');
});
async function doAdminLogin(){
  const email = document.getElementById('ap-user').value.trim();
  const pass  = document.getElementById('ap-pass').value;
  const errEl = document.getElementById('ap-err');
  const btn   = document.querySelector('.ap-submit');

  if(!email || !pass){
    errEl.textContent = 'กรุณากรอก Email และ Password';
    errEl.style.display = 'block';
    return;
  }

  btn.textContent = 'กำลังเข้าสู่ระบบ…';
  btn.disabled = true;
  errEl.style.display = 'none';

  try {
    await window.__adminLogin(email, pass);
    document.getElementById('admin-popup').classList.remove('open');
    document.getElementById('ap-pass').value = '';
    openAdminPanel();
  } catch(e) {
    let msg = 'Email หรือ Password ไม่ถูกต้อง';
    if(e.code === 'auth/too-many-requests') msg = 'ลองใหม่ภายหลัง (พยายามเข้าบ่อยเกินไป)';
    if(e.code === 'auth/user-disabled')     msg = 'บัญชีนี้ถูกปิดใช้งาน';
    errEl.textContent = msg;
    errEl.style.display = 'block';
    document.getElementById('ap-pass').value = '';
  } finally {
    btn.textContent = 'เข้าสู่ระบบ';
    btn.disabled = false;
  }
}
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&document.getElementById('admin-popup').classList.contains('open')) doAdminLogin();
});

// ── ADMIN PANEL ──
function openAdminPanel(){
  renderAdminNews();
  renderAdminPartners();
  document.getElementById('admin-panel-overlay').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeAdminPanel(){
  document.getElementById('admin-panel-overlay').classList.remove('open');
  document.body.style.overflow='';
}
async function adminLogout(){
  if(!confirm('ต้องการออกจากระบบ?')) return;
  await window.__adminLogout();
  closeAdminPanel();
}
document.getElementById('admin-panel-overlay').addEventListener('click',e=>{
  if(e.target===document.getElementById('admin-panel-overlay')) closeAdminPanel();
});
function switchTab(id,btn){
  document.querySelectorAll('.ap-tab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.ap-section').forEach(s=>s.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById(id).classList.add('on');
}

// ── IMAGE PREVIEW ──
function previewImg(input,previewId){
  const file=input.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    const img=document.getElementById(previewId);
    img.src=e.target.result;
    img.style.display='block';
  };
  reader.readAsDataURL(file);
}

// ── IMAGE URL PREVIEW ──
function previewImgUrl(url, previewId) {
  const img = document.getElementById(previewId);
  if (!img) return;
  if (url) {
    img.src = url;
    img.style.display = 'block';
    img.onerror = () => { img.style.display = 'none'; };
  } else {
    img.src = '';
    img.style.display = 'none';
  }
}

// ── COLOR PICKER ──
function pickColor(rowId,el,color){
  document.querySelectorAll('#'+rowId+' .color-swatch').forEach(s=>s.classList.remove('picked'));
  el.classList.add('picked');
  el.dataset.selected=color;
}
function getPickedColor(rowId){
  const picked=document.querySelector('#'+rowId+' .color-swatch.picked');
  return picked ? picked.dataset.color||'' : '';
}

// ── IMAGE → BASE64 (compress + resize, max 800px, 1MB) ──
async function uploadImgToStorage(inputId, folder) {
  const input = document.getElementById(inputId);
  if (!input || !input.files || !input.files[0]) return '';
  return await compressToBase64(input.files[0]);
}

async function compressToBase64(file) {
  const base64 = await new Promise(res => {
    const r = new FileReader();
    r.onload = e => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else       { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        res(canvas.toDataURL('image/webp', 0.82));
      };
      img.src = e.target.result;
    };
    r.readAsDataURL(file);
  });
  // เช็คขนาดหลัง compress (1MB)
  const bytes = Math.round((base64.length * 3) / 4);
  if (bytes > 1 * 1024 * 1024) {
    alert('รูปภาพใหญ่เกินไป กรุณาใช้รูปที่เล็กกว่านี้ หรือใส่ URL รูปแทน');
    return '';
  }
  return base64;
}

// เก็บไว้เพื่อ backward-compat (ใช้สำหรับ preview เท่านั้น ไม่ได้เซฟแล้ว)
function getImgData(inputId) {
  const input = document.getElementById(inputId);
  if (input && input.files && input.files[0]) {
    return new Promise(res => {
      const r = new FileReader();
      r.onload = e => res(e.target.result);
      r.readAsDataURL(input.files[0]);
    });
  }
  return Promise.resolve('');
}

// ── ADD / DELETE NEWS ──
async function addNews(){
  const title=document.getElementById('n-title').value.trim();
  const desc=document.getElementById('n-desc').value.trim();
  const tag=document.getElementById('n-tag').value;
  if(!title){alert('กรุณากรอกหัวข้อ');return;}
  const btn = document.querySelector('#tab-project .add-btn');
  if(btn){ btn.textContent='⏳ กำลังอัปโหลด…'; btn.disabled=true; }
  try {
    const imgUrl = document.getElementById('n-img-url')?.value.trim() || '';
    const imgBase64 = imgUrl ? '' : await uploadImgToStorage('n-img-file','news');
    const img = imgUrl || imgBase64;
    const color=getPickedColor('n-color-row');
    const now=new Date();
    const date=`${now.getDate()} ${['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'][now.getMonth()]} ${now.getFullYear()+543}`;
    const item = {id:window.nextNewsId++,title,tag,date,desc,img,color};
    await saveNews_fb(item);
    document.getElementById('n-title').value='';
    document.getElementById('n-desc').value='';
    document.getElementById('n-img-file').value='';
    document.getElementById('n-img-preview').style.display='none';
    document.getElementById('n-img-url').value='';
    document.getElementById('n-img-url-preview').style.display='none';
    pickColor('n-color-row',document.querySelector('#n-color-row .no-color'),'');
  } finally {
    if(btn){ btn.textContent='+ เพิ่มโพสต์'; btn.disabled=false; }
  }
}
async function delNews(id){
  if(!confirm('ลบโพสต์นี้?')) return;
  await deleteNews_fb(id);
}

// ── ADD / DELETE PARTNER ──
async function addPartner(){
  const name=document.getElementById('p-name').value.trim();
  const role=document.getElementById('p-role').value.trim();
  if(!name){alert('กรุณากรอกชื่อ');return;}
  const btn = document.querySelector('#tab-partner .add-btn');
  if(btn){ btn.textContent='⏳ กำลังอัปโหลด…'; btn.disabled=true; }
  try {
    const img=await uploadImgToStorage('p-img-file','partners');
    const color=getPickedColor('p-color-row');
    const yt  = document.getElementById('p-yt').value.trim();
    const dc  = document.getElementById('p-dc').value.trim();
    const tt  = document.getElementById('p-tt').value.trim();
    const tw  = document.getElementById('p-tw').value.trim();
    const fb  = document.getElementById('p-fb').value.trim();
    const web = document.getElementById('p-web').value.trim();
    const item = {id:window.nextPartnerId++,name,role,img,color,yt,dc,tt,tw,fb,web};
    await savePartner_fb(item);
    ['p-name','p-role','p-yt','p-dc','p-tt','p-tw','p-fb','p-web'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('p-img-file').value='';
    document.getElementById('p-img-preview').style.display='none';
    pickColor('p-color-row',document.querySelector('#p-color-row .no-color'),'');
  } finally {
    if(btn){ btn.textContent='+ เพิ่มพันธมิตร'; btn.disabled=false; }
  }
}
async function delPartner(id){
  if(!confirm('ลบพันธมิตรนี้?')) return;
  await deletePartner_fb(id);
}



// ── POST PAGE ──
function openPostPage(id){
  const n = window.newsData.find(x=>x.id===id);
  if(!n) return;
  const banner = document.getElementById('pp-banner');
  if(n.img){ banner.src=n.img; banner.style.display='block'; }
  else { banner.style.display='none'; banner.src=''; }
  // color divider
  const div = document.querySelector('.pp-divider');
  if(div) div.style.background = n.color ? n.color : 'linear-gradient(90deg,var(--accent2),var(--accent))';
  document.getElementById('pp-tag').className = 'news-tag '+n.tag;
  document.getElementById('pp-tag').textContent = TAG_MAP[n.tag]||n.tag;
  document.getElementById('pp-date').textContent = n.date;
  document.getElementById('pp-title').textContent = n.title;
  document.getElementById('pp-body').innerHTML = linkify(n.desc);
  // link button
  const ppLink = document.getElementById('pp-link');
  if(ppLink){ ppLink.style.display = 'none'; }
  goPage('post');
}

// ── LIGHTBOX ──
function openLightbox(src){
  document.getElementById('lb-img').src=src;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeLightbox(){
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lb-img').src='';
  document.body.style.overflow='';
}
document.getElementById('lightbox').addEventListener('click',e=>{
  if(e.target===document.getElementById('lightbox')) closeLightbox();
});

// ── EDIT MODAL ──
function closeEditModal(){
  document.getElementById('edit-modal-overlay').classList.remove('open');
  document.body.style.overflow='';
}
document.getElementById('edit-modal-overlay').addEventListener('click',e=>{
  if(e.target===document.getElementById('edit-modal-overlay')) closeEditModal();
});

function editNews(id){
  const n = window.newsData.find(x=>x.id===id);
  if(!n) return;
  document.getElementById('em-title').textContent = '✏ แก้ไขโพสต์';
  document.getElementById('em-body').innerHTML = `
    <div class="form-row"><div class="f-group">
      <label class="f-lbl">หัวข้อ</label>
      <input type="text" class="f-inp" id="e-title" value="${n.title.replace(/"/g,'&quot;')}"/>
    </div><div class="f-group">
      <label class="f-lbl">Tag</label>
      <select class="f-sel" id="e-tag">
        <option value="tag-new" ${n.tag==='tag-new'?'selected':''}>NEW</option>
        <option value="tag-update" ${n.tag==='tag-update'?'selected':''}>UPDATE</option>
        <option value="tag-wip" ${n.tag==='tag-wip'?'selected':''}>IN DEV</option>
        <option value="tag-info" ${n.tag==='tag-info'?'selected':''}>INFO</option>
      </select>
    </div></div>
    <div class="form-row single"><div class="f-group">
      <label class="f-lbl">คำอธิบาย</label>
      <textarea class="f-textarea" id="e-desc">${n.desc}</textarea>
    </div></div>
    <div class="form-row single"><div class="f-group">
      <label class="f-lbl">รูปภาพใหม่ — อัปโหลด <span style="color:var(--gray);font-weight:400">(บีบอัดอัตโนมัติ max 800px)</span></label>
      <div class="img-upload-area" onclick="this.querySelector('input').click()">
        <input type="file" accept="image/*" id="e-img-file" style="display:none" onchange="previewImg(this,'e-img-preview');document.getElementById('e-img-url').value=''"/>
        <div class="upload-hint">${n.img ? 'มีรูปแล้ว — คลิกเพื่อเปลี่ยน' : 'คลิกเพื่อเลือกรูป'}</div>
        ${n.img ? `<img id="e-img-preview" class="img-preview" src="${n.img}" style="display:block"/>` : `<img id="e-img-preview" class="img-preview"/>`}
      </div>
    </div></div>
    <div class="form-row single"><div class="f-group">
      <label class="f-lbl">หรือใส่ URL รูป <span style="color:var(--gray);font-weight:400">(ความชัดสูง — จะใช้แทนรูปอัปโหลด)</span></label>
      <input type="text" class="f-inp" id="e-img-url" value="${n.imgUrl||''}" placeholder="https://i.imgur.com/..." oninput="previewImgUrl(this.value,'e-img-url-preview')"/>
      ${(n.imgUrl) ? `<img id="e-img-url-preview" class="img-preview" src="${n.imgUrl}" style="display:block;margin-top:.6rem"/>` : `<img id="e-img-url-preview" class="img-preview" style="margin-top:.6rem"/>`}
    </div></div>
    <div class="form-row single"><div class="f-group">
      <label class="f-lbl">สีกรอบรูป</label>
      <div class="color-row" id="e-color-row">
        <div class="color-swatch no-color ${!n.color?'picked':''}" data-color="" onclick="pickColor('e-color-row',this,'')">✕</div>
        ${['#a855f7','#3b82f6','#22c55e','#ef4444','#f59e0b','#ec4899','#ffffff'].map(c=>`
        <div class="color-swatch ${n.color===c?'picked':''}" style="background:${c}" data-color="${c}" onclick="pickColor('e-color-row',this,'${c}')"></div>`).join('')}
      </div>
    </div></div>
    <button class="save-btn" onclick="saveNews(${id})">💾 บันทึก</button>
  `;
  document.getElementById('edit-modal-overlay').classList.add('open');
  document.body.style.overflow='hidden';
}

async function saveNews(id){
  const newsData = window.newsData;
  const idx = newsData.findIndex(x=>x.id===id);
  if(idx===-1) return;
  const title = document.getElementById('e-title').value.trim();
  if(!title){alert('กรุณากรอกหัวข้อ');return;}
  const btn = document.querySelector('#edit-modal .save-btn');
  if(btn){ btn.textContent='⏳ กำลังบันทึก…'; btn.disabled=true; }
  try {
    // URL มีลำดับความสำคัญกว่า → base64 อัปโหลด → รูปเดิม
    const editUrl = document.getElementById('e-img-url')?.value.trim() || '';
    const newBase64 = editUrl ? '' : await uploadImgToStorage('e-img-file','news');
    const updated = {
      ...newsData[idx],
      title,
      tag: document.getElementById('e-tag').value,
      desc: document.getElementById('e-desc').value.trim(),
      img: editUrl || newBase64 || newsData[idx].img,
      imgUrl: editUrl,
      color: getPickedColor('e-color-row'),
    };
    await saveNews_fb(updated);
    closeEditModal();
  } finally {
    if(btn){ btn.textContent='💾 บันทึก'; btn.disabled=false; }
  }
}

function editPartner(id){
  const p = window.partnerData.find(x=>x.id===id);
  if(!p) return;
  document.getElementById('em-title').textContent = '✏ แก้ไขพันธมิตร';
  document.getElementById('em-body').innerHTML = `
    <div class="form-row">
      <div class="f-group"><label class="f-lbl">ชื่อ</label><input type="text" class="f-inp" id="ep-name" value="${p.name.replace(/"/g,'&quot;')}"/></div>
      <div class="f-group"><label class="f-lbl">บทบาท</label><input type="text" class="f-inp" id="ep-role" value="${p.role.replace(/"/g,'&quot;')}"/></div>
    </div>
    <div class="form-row single"><div class="f-group">
      <label class="f-lbl">รูปภาพใหม่ (ปล่อยว่างเพื่อคงรูปเดิม)</label>
      <div class="img-upload-area" onclick="this.querySelector('input').click()">
        <input type="file" accept="image/*" id="ep-img-file" style="display:none" onchange="previewImg(this,'ep-img-preview')"/>
        <div class="upload-hint">${p.img ? 'มีรูปแล้ว — คลิกเพื่อเปลี่ยน' : 'คลิกเพื่อเลือกรูป'}</div>
        ${p.img ? `<img id="ep-img-preview" class="img-preview" src="${p.img}" style="display:block"/>` : `<img id="ep-img-preview" class="img-preview"/>`}
      </div>
    </div></div>
    <div class="form-row single"><div class="f-group">
      <label class="f-lbl">สีกรอบการ์ด</label>
      <div class="color-row" id="ep-color-row">
        <div class="color-swatch no-color ${!p.color?'picked':''}" data-color="" onclick="pickColor('ep-color-row',this,'')">✕</div>
        ${['#a855f7','#3b82f6','#22c55e','#ef4444','#f59e0b','#ec4899','#ffffff'].map(c=>`
        <div class="color-swatch ${p.color===c?'picked':''}" style="background:${c}" data-color="${c}" onclick="pickColor('ep-color-row',this,'${c}')"></div>`).join('')}
      </div>
    </div></div>
    <div class="form-row">
      <div class="f-group"><label class="f-lbl">🔴 YouTube</label><input type="text" class="f-inp" id="ep-yt" value="${p.yt||''}"/></div>
      <div class="f-group"><label class="f-lbl">🟣 Discord</label><input type="text" class="f-inp" id="ep-dc" value="${p.dc||''}"/></div>
    </div>
    <div class="form-row">
      <div class="f-group"><label class="f-lbl">⚫ TikTok</label><input type="text" class="f-inp" id="ep-tt" value="${p.tt||''}"/></div>
      <div class="f-group"><label class="f-lbl">🔵 Twitter/X</label><input type="text" class="f-inp" id="ep-tw" value="${p.tw||''}"/></div>
    </div>
    <div class="form-row">
      <div class="f-group"><label class="f-lbl">🔵 Facebook</label><input type="text" class="f-inp" id="ep-fb" value="${p.fb||''}"/></div>
      <div class="f-group"><label class="f-lbl">🌐 เว็บไซต์</label><input type="text" class="f-inp" id="ep-web" value="${p.web||''}"/></div>
    </div>
    <button class="save-btn" onclick="savePartner(${id})">💾 บันทึก</button>
  `;
  document.getElementById('edit-modal-overlay').classList.add('open');
  document.body.style.overflow='hidden';
}

async function savePartner(id){
  const partnerData = window.partnerData;
  const idx = partnerData.findIndex(x=>x.id===id);
  if(idx===-1) return;
  const name = document.getElementById('ep-name').value.trim();
  if(!name){alert('กรุณากรอกชื่อ');return;}
  const btn = document.querySelector('#edit-modal .save-btn');
  if(btn){ btn.textContent='⏳ กำลังบันทึก…'; btn.disabled=true; }
  try {
    const newImg = await uploadImgToStorage('ep-img-file','partners');
    const updated = {
      ...partnerData[idx],
      name,
      role: document.getElementById('ep-role').value.trim(),
      img: newImg || partnerData[idx].img,
      color: getPickedColor('ep-color-row'),
      yt:  document.getElementById('ep-yt').value.trim(),
      dc:  document.getElementById('ep-dc').value.trim(),
      tt:  document.getElementById('ep-tt').value.trim(),
      tw:  document.getElementById('ep-tw').value.trim(),
      fb:  document.getElementById('ep-fb').value.trim(),
      web: document.getElementById('ep-web').value.trim(),
    };
    await savePartner_fb(updated);
    closeEditModal();
  } finally {
    if(btn){ btn.textContent='💾 บันทึก'; btn.disabled=false; }
  }
}


// ── INIT ──
