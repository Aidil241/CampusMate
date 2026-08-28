(function(){
"use strict";

/* ============================================================
   ICONS (SVG Bawaan)
   ============================================================ */
const ICON = {
  home:'<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>',
  tasks:'<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="7" height="7" rx="1.5"/><path d="m5.5 7.5 1.2 1.2L8.5 6.6"/><rect x="4" y="14" width="7" height="6" rx="1.5"/><path d="M14 6h6M14 10h6M14 16h6M14 19h4"/></svg>',
  calendar:'<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h2M14 14h2M8 17h2M14 17h2"/></svg>',
  grid:'<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.8"/></svg>',
  plus:'<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  close:'<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  chevR:'<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  chevL:'<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
  check:'<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  book:'<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20"/></svg>',
  note:'<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M8 13h6M8 17h4"/></svg>',
  award:'<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5.5"/><path d="m8.2 13-1.3 7 5.1-2.6 5.1 2.6-1.3-7"/></svg>',
  settings:'<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.9l.06.06a2.1 2.1 0 1 1-2.94 2.94l-.06-.06a1.7 1.7 0 0 0-1.9-.34 1.7 1.7 0 0 0-1 1.55v.17a2.1 2.1 0 1 1-4.2 0v-.09a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.9.34l-.06.06a2.1 2.1 0 1 1-2.94-2.94l.06-.06a1.7 1.7 0 0 0 .34-1.9 1.7 1.7 0 0 0-1.55-1H4.5a2.1 2.1 0 1 1 0-4.2h.09A1.7 1.7 0 0 0 6.14 7.3a1.7 1.7 0 0 0-.34-1.9l-.06-.06a2.1 2.1 0 1 1 2.94-2.94l.06.06a1.7 1.7 0 0 0 1.9.34h.08A1.7 1.7 0 0 0 11.7 1.2v-.17a2.1 2.1 0 1 1 4.2 0v.09a1.7 1.7 0 0 0 1 1.55h.08a1.7 1.7 0 0 0 1.9-.34l.06-.06a2.1 2.1 0 1 1 2.94 2.94l-.06.06a1.7 1.7 0 0 0-.34 1.9v.08c.24.63.8 1.07 1.55 1.1h.17a2.1 2.1 0 1 1 0 4.2h-.09a1.7 1.7 0 0 0-1.55 1Z"/></svg>',
  trash:'<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7m2 0v13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7h10Z"/><path d="M10 11v6M14 11v6"/></svg>',
  edit:'<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></svg>',
  bell:'<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z"/><path d="M9.5 17a2.5 2.5 0 0 0 5 0"/></svg>',
  moon:'<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/></svg>',
  mapPin:'<svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.3-7-11.5a7 7 0 1 1 14 0C19 14.7 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.3"/></svg>',
  user:'<svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.3-3.7 4.3-6 7.5-6s6.2 2.3 7.5 6"/></svg>',
  logo:'<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 8l10 5 10-5-10-5Z"/><path d="M6 10.5V16c0 1.5 2.7 3.5 6 3.5s6-2 6-3.5v-5.5"/></svg>',
  empty:'<svg class="w-8 h-8 mx-auto text-base-content/30 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h16M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-2 0v11a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V8"/><path d="M9.5 12.5h5"/></svg>'
};

/* ============================================================
   STORAGE LAYER (LOCALSTORAGE)
   ============================================================ */
const DB = {
  KEYS:{courses:'cm_courses',tasks:'cm_tasks',notes:'cm_notes',grades:'cm_grades',schedules:'cm_schedules',settings:'cm_settings',seeded:'cm_seeded',lastReminder:'cm_last_reminder'},
  get(key){ try{ return JSON.parse(localStorage.getItem(key)) || []; }catch(e){ return []; } },
  set(key,val){ localStorage.setItem(key, JSON.stringify(val)); },
  courses:{
    all(){ return DB.get(DB.KEYS.courses); },
    find(id){ return DB.courses.all().find(c=>c.id===id); },
    save(item){
      const list = DB.courses.all();
      if(item.id){ const i=list.findIndex(c=>c.id===item.id); list[i]=item; }
      else{ item.id = uid(); list.unshift(item); }
      DB.set(DB.KEYS.courses,list); return item;
    },
    remove(id){
      DB.set(DB.KEYS.courses, DB.courses.all().filter(c=>c.id!==id));
      DB.set(DB.KEYS.tasks, DB.tasks.all().filter(t=>t.course_id!==id));
      DB.set(DB.KEYS.notes, DB.notes.all().filter(n=>n.course_id!==id));
      DB.set(DB.KEYS.grades, DB.grades.all().filter(g=>g.course_id!==id));
      DB.set(DB.KEYS.schedules, DB.schedules.all().filter(s=>s.course_id!==id));
    }
  },
  tasks:{
    all(){ return DB.get(DB.KEYS.tasks); },
    find(id){ return DB.tasks.all().find(t=>t.id===id); },
    save(item){
      const list = DB.tasks.all();
      if(item.id){ const i=list.findIndex(t=>t.id===item.id); list[i]=item; }
      else{ item.id = uid(); item.created_at = new Date().toISOString(); list.unshift(item); }
      DB.set(DB.KEYS.tasks,list); return item;
    },
    remove(id){ DB.set(DB.KEYS.tasks, DB.tasks.all().filter(t=>t.id!==id)); }
  },
  notes:{
    all(){ return DB.get(DB.KEYS.notes); },
    find(id){ return DB.notes.all().find(n=>n.id===id); },
    save(item){
      const list = DB.notes.all();
      const now = new Date().toISOString();
      if(item.id){ const i=list.findIndex(n=>n.id===item.id); item.updated_at=now; list[i]=item; }
      else{ item.id = uid(); item.created_at = now; item.updated_at = now; list.unshift(item); }
      DB.set(DB.KEYS.notes,list); return item;
    },
    remove(id){ DB.set(DB.KEYS.notes, DB.notes.all().filter(n=>n.id!==id)); }
  },
  grades:{
    all(){ return DB.get(DB.KEYS.grades); },
    find(id){ return DB.grades.all().find(g=>g.id===id); },
    save(item){
      const list = DB.grades.all();
      if(item.id){ const i=list.findIndex(g=>g.id===item.id); list[i]=item; }
      else{ item.id = uid(); list.unshift(item); }
      DB.set(DB.KEYS.grades,list); return item;
    },
    remove(id){ DB.set(DB.KEYS.grades, DB.grades.all().filter(g=>g.id!==id)); }
  },
  schedules:{
    all(){ return DB.get(DB.KEYS.schedules); },
    find(id){ return DB.schedules.all().find(s=>s.id===id); },
    save(item){
      const list = DB.schedules.all();
      if(item.id){ const i=list.findIndex(s=>s.id===item.id); list[i]=item; }
      else{ item.id = uid(); list.unshift(item); }
      DB.set(DB.KEYS.schedules,list); return item;
    },
    remove(id){ DB.set(DB.KEYS.schedules, DB.schedules.all().filter(s=>s.id!==id)); }
  },
  settings:{
    get(){ return Object.assign({dark:false, name:'Mahasiswa'}, JSON.parse(localStorage.getItem(DB.KEYS.settings)||'{}')); },
    save(s){ localStorage.setItem(DB.KEYS.settings, JSON.stringify(s)); }
  }
};

function uid(){ return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,9); }

/* ============================================================
   UTILS & CALCULATIONS
   ============================================================ */
const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
function todayDayName(){ const jsDay = new Date().getDay(); return DAYS[(jsDay+6)%7]; }
function fmtDateLong(d){ return d.toLocaleDateString('id-ID',{weekday:'long', day:'numeric', month:'long', year:'numeric'}); }
function toDateOnly(str){ return new Date(str+'T00:00:00'); }
function daysDiff(dateStr){
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.round((toDateOnly(dateStr)-today)/86400000);
}
function deadlineBadge(dateStr, status){
  if(status==='Selesai') return {cls:'badge-success', text:'Selesai'};
  const diff = daysDiff(dateStr);
  if(diff<0) return {cls:'badge-error', text:'Terlambat '+Math.abs(diff)+' hr'};
  if(diff===0) return {cls:'badge-error', text:'Hari ini'};
  if(diff===1) return {cls:'badge-warning', text:'Besok'};
  if(diff<=3) return {cls:'badge-warning', text:'H-'+diff};
  return {cls:'badge-ghost', text:'H-'+diff};
}
function priorityBadgeClass(p){ return p==='Tinggi'?'badge-error':(p==='Sedang'?'badge-warning':'badge-success'); }
function esc(str){ return (str||'').toString().replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function courseName(id){ const c = DB.courses.find(id); return c ? c.name : 'Umum'; }
function fmtTime(t){ return t || '--:--'; }

function scoreToIP(score){
  if(score>=80) return 4; if(score>=75) return 3.5; if(score>=70) return 3;
  if(score>=65) return 2.5; if(score>=60) return 2; if(score>=50) return 1; return 0;
}
function scoreToLetter(score){
  if(score>=80) return 'A'; if(score>=75) return 'AB'; if(score>=70) return 'B';
  if(score>=65) return 'BC'; if(score>=60) return 'C'; if(score>=50) return 'D'; return 'E';
}
function courseFinalScore(courseId){
  const items = DB.grades.all().filter(g=>g.course_id===courseId);
  const totalWeight = items.reduce((a,g)=>a+Number(g.weight||0),0);
  if(!items.length || totalWeight===0) return null;
  return items.reduce((a,g)=>a+(Number(g.weight||0)*Number(g.score||0)),0)/totalWeight;
}
function computeIPK(){
  const courses = DB.courses.all();
  let totalCredits=0, totalPoints=0, counted=0;
  courses.forEach(c=>{
    const fin = courseFinalScore(c.id);
    if(fin!==null){
      totalCredits += Number(c.credits||0);
      totalPoints += scoreToIP(fin)*Number(c.credits||0);
      counted++;
    }
  });
  return (counted===0 || totalCredits===0) ? null : (totalPoints/totalCredits).toFixed(2);
}

/* ============================================================
   SEED DUMMY DATA
   ============================================================ */
function seedIfEmpty(){
  if(localStorage.getItem(DB.KEYS.seeded)) return;
  const c1=uid(), c2=uid(), c3=uid(), c4=uid(), c5=uid();
  DB.set(DB.KEYS.courses,[
    {id:c1, name:'Pemrograman Web', lecturer:'Dr. Andi Wijaya, M.Kom', credits:3, room:'Lab RPL 2', notes:'Fokus HTML, CSS, JS.'},
    {id:c2, name:'Basis Data Lanjut', lecturer:'Siti Rahma, M.Kom', credits:3, room:'R.301', notes:'Normalisasi & Query.'},
    {id:c3, name:'Kecerdasan Buatan', lecturer:'Prof. Budi Santoso', credits:3, room:'R.204', notes:''},
    {id:c4, name:'Manajemen Proyek TI', lecturer:'Rina Kartika, M.T.', credits:2, room:'R.105', notes:''},
    {id:c5, name:'Bahasa Inggris Teknik', lecturer:'Mark Thompson, S.Pd.', credits:2, room:'R.010', notes:''}
  ]);

  DB.set(DB.KEYS.schedules,[
    {id:uid(), course_id:c1, day:'Senin', start_time:'08:00', end_time:'10:30', room:'Lab RPL 2', notes:''},
    {id:uid(), course_id:c2, day:'Senin', start_time:'13:00', end_time:'15:00', room:'R.301', notes:''},
    {id:uid(), course_id:c3, day:'Selasa', start_time:'09:00', end_time:'11:30', room:'R.204', notes:'Bawa laptop'},
    {id:uid(), course_id:c5, day:'Rabu', start_time:'10:00', end_time:'11:40', room:'R.010', notes:''},
    {id:uid(), course_id:c4, day:'Kamis', start_time:'08:00', end_time:'09:40', room:'R.105', notes:''},
    {id:uid(), course_id:c1, day:'Jumat', start_time:'13:00', end_time:'15:30', room:'Lab RPL 2', notes:'Praktikum'}
  ]);

  const today = new Date();
  const plus = n => { const d=new Date(today); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
  DB.set(DB.KEYS.tasks,[
    {id:uid(), course_id:c1, title:'Kerjakan tugas Responsive Landing Page', description:'Gunakan Flexbox & Grid.', deadline:plus(1), deadline_time:'23:59', priority:'Tinggi', status:'Sedang dikerjakan', notes:'', created_at:today.toISOString()},
    {id:uid(), course_id:c2, title:'Laporan Normalisasi Database', description:'Sampai 3NF.', deadline:plus(3), deadline_time:'17:00', priority:'Sedang', status:'Belum dikerjakan', notes:'', created_at:today.toISOString()},
    {id:uid(), course_id:c3, title:'Quiz Machine Learning Dasar', description:'Quiz LMS.', deadline:plus(0), deadline_time:'20:00', priority:'Tinggi', status:'Belum dikerjakan', notes:'', created_at:today.toISOString()},
    {id:uid(), course_id:c4, title:'Susun Timeline Proyek Kelompok', description:'', deadline:plus(6), deadline_time:'', priority:'Rendah', status:'Belum dikerjakan', notes:'', created_at:today.toISOString()},
    {id:uid(), course_id:c5, title:'Kumpulkan Essay Bahasa Inggris', description:'500 kata.', deadline:plus(-1), deadline_time:'', priority:'Sedang', status:'Belum dikerjakan', notes:'Terlambat!', created_at:today.toISOString()}
  ]);

  DB.set(DB.KEYS.notes,[
    {id:uid(), course_id:c1, title:'Ringkasan CSS Grid', content:'Grid template columns dan rows untuk layout 2D.', created_at:today.toISOString(), updated_at:today.toISOString()}
  ]);

  DB.set(DB.KEYS.grades,[
    {id:uid(), course_id:c1, component:'Tugas Harian', weight:20, score:88},
    {id:uid(), course_id:c1, component:'UTS', weight:30, score:80},
    {id:uid(), course_id:c1, component:'UAS', weight:50, score:85}
  ]);

  localStorage.setItem(DB.KEYS.seeded,'1');
}

/* ============================================================
   ROUTER & APP STATE
   ============================================================ */
const App = window.App = {};
let state = { route:'home', taskFilterStatus:'Semua', taskFilterPrio:'Semua', schedView:'harian', schedDay: todayDayName(), courseDetail:null };

function applyTheme(){
  const s = DB.settings.get();
  document.documentElement.setAttribute('data-theme', s.dark ? 'dark' : 'light');
}

function navigate(route){
  state.route = route;
  render();
  document.getElementById('page').scrollTo(0,0);
}
App.navigate = navigate;

/* ============================================================
   TOASTS & REMINDERS
   ============================================================ */
function showToast(title, msg){
  const stack = document.getElementById('toastStack');
  const el = document.createElement('div');
  el.className = 'alert alert-info shadow-lg text-xs p-3';
  el.innerHTML = `<div><b>${esc(title)}</b><br>${esc(msg)}</div>`;
  stack.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

function checkDeadlineReminders(){
  const todayKey = new Date().toISOString().slice(0,10);
  if(localStorage.getItem(DB.KEYS.lastReminder) === todayKey) return;
  const urgent = DB.tasks.all().filter(t => t.status !== 'Selesai' && [0,1].includes(daysDiff(t.deadline)));
  urgent.slice(0,2).forEach(t => showToast(daysDiff(t.deadline)===0?'Deadline Hari Ini!':'Deadline Besok!', t.title));
  localStorage.setItem(DB.KEYS.lastReminder, todayKey);
}

/* ============================================================
   TOPBAR & BOTTOM NAV
   ============================================================ */
const PAGE_TITLES = {
  home:{title:'', sub:''},
  tasks:{title:'Tugas', sub:'Kelola semua tugas kuliahmu'},
  schedule:{title:'Jadwal Kuliah', sub:'Atur jadwal mingguanmu'},
  courses:{title:'Mata Kuliah', sub:'Daftar mata kuliah'},
  notes:{title:'Catatan', sub:'Catatan materi'},
  grades:{title:'Nilai Akademik', sub:'Pantau nilai & IPK'},
  settings:{title:'Pengaturan', sub:'Preferensi aplikasi'},
  courseDetail:{title:'Detail Mata Kuliah', sub:''}
};

function renderTopbar(){
  const bar = document.getElementById('topbar');
  if(state.route==='home'){ bar.innerHTML=''; bar.classList.add('hidden'); return; }
  bar.classList.remove('hidden');
  const info = PAGE_TITLES[state.route] || {title:'',sub:''};
  const showBack = ['courseDetail','gradeDetail'].includes(state.route);
  
  bar.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        ${showBack ? `<button class="btn btn-ghost btn-sm btn-circle" id="btnBack">${ICON.chevL}</button>` : ''}
        <div>
          <h1 class="font-bold text-base line-clamp-1">${esc(state.route==='courseDetail' ? (DB.courses.find(state.courseDetail)?.name||'Detail') : info.title)}</h1>
          ${info.sub && !showBack ? `<p class="text-xs text-base-content/60">${esc(info.sub)}</p>` : ''}
        </div>
      </div>
      <button class="btn btn-ghost btn-sm btn-circle" id="btnTheme">${ICON.moon}</button>
    </div>
  `;
  if(showBack) document.getElementById('btnBack').onclick = () => navigate(state.route==='gradeDetail'?'grades':'courses');
  document.getElementById('btnTheme').onclick = () => { const s=DB.settings.get(); s.dark=!s.dark; DB.settings.save(s); applyTheme(); };
}

function renderBottomNav(){
  const nav = document.getElementById('bottomnav');
  const items = [
    {key:'home', label:'Home', icon:ICON.home},
    {key:'tasks', label:'Tugas', icon:ICON.tasks},
    {key:'schedule', label:'Jadwal', icon:ICON.calendar},
    {key:'more', label:'Lainnya', icon:ICON.grid}
  ];
  const moreActive = ['courses','notes','grades','settings','courseDetail','gradeDetail'].includes(state.route);

  nav.innerHTML = items.map(it => {
    const active = it.key==='more' ? moreActive : state.route===it.key;
    return `<button data-nav="${it.key}" class="${active ? 'active text-brand font-bold' : 'text-base-content/60'}">
      ${it.icon}<span class="btm-nav-label text-[10px]">${it.label}</span>
    </button>`;
  }).join('');

  nav.querySelectorAll('[data-nav]').forEach(btn => {
    btn.onclick = () => {
      const key = btn.dataset.nav;
      if(key==='more') openMoreSheet();
      else navigate(key);
    };
  });
}

function openMoreSheet(){
  openSheet('Lainnya', `
    <div class="grid grid-cols-2 gap-3">
      <button data-go="courses" class="btn btn-neutral btn-outline flex flex-col h-auto py-4 items-center gap-2">
        <div class="text-brand">${ICON.book}</div><span class="text-xs">Mata Kuliah</span>
      </button>
      <button data-go="notes" class="btn btn-neutral btn-outline flex flex-col h-auto py-4 items-center gap-2">
        <div class="text-success">${ICON.note}</div><span class="text-xs">Catatan</span>
      </button>
      <button data-go="grades" class="btn btn-neutral btn-outline flex flex-col h-auto py-4 items-center gap-2">
        <div class="text-warning">${ICON.award}</div><span class="text-xs">Nilai Akademik</span>
      </button>
      <button data-go="settings" class="btn btn-neutral btn-outline flex flex-col h-auto py-4 items-center gap-2">
        <div class="text-error">${ICON.settings}</div><span class="text-xs">Pengaturan</span>
      </button>
    </div>
  `);
  document.querySelectorAll('[data-go]').forEach(el => el.onclick = () => { closeSheet(); navigate(el.dataset.go); });
}

/* ============================================================
   MODAL / BOTTOM SHEET
   ============================================================ */
function openSheet(title, bodyHtml){
  document.getElementById('sheetTitle').textContent = title;
  document.getElementById('sheetBody').innerHTML = bodyHtml;
  document.getElementById('sheetModal').showModal();
}
function closeSheet(){
  document.getElementById('sheetModal').close();
}

/* ============================================================
   FAB BUTTON
   ============================================================ */
function renderFab(){
  const fab = document.getElementById('fabBtn');
  const map = { tasks:()=>openTaskForm(), schedule:()=>openScheduleForm(), courses:()=>openCourseForm(), notes:()=>openNoteForm(), grades:()=>openGradeForm() };
  if(map[state.route]){
    fab.classList.remove('hidden');
    fab.innerHTML = ICON.plus;
    fab.onclick = map[state.route];
  } else fab.classList.add('hidden');
}

/* ============================================================
   PAGES
   ============================================================ */
function pageHome(){
  const s = DB.settings.get();
  const todayName = todayDayName();
  const todaySched = DB.schedules.all().filter(sc=>sc.day===todayName);
  const tasks = DB.tasks.all();
  const pending = tasks.filter(t=>t.status!=='Selesai').slice(0,4);
  const doneCount = tasks.filter(t=>t.status==='Selesai').length;
  const progressPct = tasks.length ? Math.round(doneCount/tasks.length*100) : 0;
  const ipk = computeIPK();

  return `
    <!-- Hero Banner -->
    <div class="bg-gradient-to-br from-brand to-brand-dark text-white p-5 rounded-3xl shadow-lg mb-6">
      <p class="text-xs opacity-80 font-medium">Selamat Datang, ${esc(s.name)} 👋</p>
      <h1 class="text-xl font-bold mt-1">Yuk cek agenda kamu</h1>
      <p class="text-xs opacity-75 mt-1">${fmtDateLong(new Date())}</p>
      <div class="grid grid-cols-3 gap-2 mt-4 text-center">
        <div class="bg-white/10 backdrop-blur p-2 rounded-xl">
          <b class="text-lg block">${todaySched.length}</b><span class="text-[9px] uppercase tracking-wider opacity-80">Jadwal</span>
        </div>
        <div class="bg-white/10 backdrop-blur p-2 rounded-xl">
          <b class="text-lg block">${pending.length}</b><span class="text-[9px] uppercase tracking-wider opacity-80">Tugas Aktif</span>
        </div>
        <div class="bg-white/10 backdrop-blur p-2 rounded-xl">
          <b class="text-lg block">${ipk??'-'}</b><span class="text-[9px] uppercase tracking-wider opacity-80">IPK</span>
        </div>
      </div>
    </div>

    <!-- Jadwal Hari Ini -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-bold text-sm">Jadwal Hari Ini</h2>
        <button onclick="App.navigate('schedule')" class="text-xs text-brand font-semibold">Lihat semua</button>
      </div>
      ${todaySched.length ? `<div class="space-y-2">${todaySched.map(sc => `
        <div class="flex items-center gap-3 p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm">
          <div class="text-center font-bold text-xs text-brand pr-3 border-r border-base-200">
            ${fmtTime(sc.start_time)}<small class="block text-[9px] text-base-content/50">${fmtTime(sc.end_time)}</small>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-xs truncate">${esc(courseName(sc.course_id))}</h4>
            <p class="text-[11px] text-base-content/60">${ICON.mapPin} ${esc(sc.room||'-')}</p>
          </div>
        </div>`).join('')}</div>` : `<div class="text-center p-6 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty}Tidak ada jadwal hari ini</div>`}
    </div>

    <!-- Deadline Terdekat -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-bold text-sm">Deadline Terdekat</h2>
        <button onclick="App.navigate('tasks')" class="text-xs text-brand font-semibold">Lihat semua</button>
      </div>
      ${pending.length ? `<div class="space-y-2">${pending.map(t => {
        const b = deadlineBadge(t.deadline, t.status);
        return `<div class="flex items-start gap-3 p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm">
          <input type="checkbox" onclick="App.toggleTask('${t.id}')" class="checkbox checkbox-sm checkbox-primary mt-0.5" />
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-xs">${esc(t.title)}</h4>
            <div class="flex gap-1.5 mt-1 flex-wrap">
              <span class="text-[10px] text-base-content/60 font-medium">${esc(courseName(t.course_id))}</span>
              <span class="badge ${b.cls} badge-xs font-semibold">${b.text}</span>
            </div>
          </div>
        </div>`;
      }).join('')}</div>` : `<div class="text-center p-6 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty}Semua tugas beres!</div>`}
    </div>

    <!-- Progress Tugas -->
    <div class="card bg-base-100 border border-base-200 p-4 rounded-2xl shadow-sm">
      <div class="flex justify-between text-xs font-semibold mb-2">
        <span class="text-base-content/60">Penyelesaian Tugas</span>
        <span class="text-brand font-bold">${progressPct}%</span>
      </div>
      <progress class="progress progress-primary w-full" value="${progressPct}" max="100"></progress>
    </div>
  `;
}

function pageTasks(){
  let list = DB.tasks.all();
  if(state.taskFilterStatus!=='Semua') list = list.filter(t=>t.status===state.taskFilterStatus);
  return `
    <div class="flex gap-2 overflow-x-auto pb-2 mb-4">
      ${['Semua','Belum dikerjakan','Sedang dikerjakan','Selesai'].map(s => `
        <button onclick="App.setTaskFilter('${s}')" class="btn btn-xs ${state.taskFilterStatus===s ? 'btn-primary' : 'btn-ghost border-base-300'}">${s}</button>
      `).join('')}
    </div>
    <div class="space-y-2">
      ${list.length ? list.map(t => {
        const b = deadlineBadge(t.deadline, t.status);
        return `<div class="flex items-start gap-3 p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm">
          <input type="checkbox" ${t.status==='Selesai'?'checked':''} onclick="App.toggleTask('${t.id}')" class="checkbox checkbox-sm checkbox-primary mt-0.5" />
          <div class="flex-1 min-w-0" onclick="App.editTask('${t.id}')">
            <h4 class="font-bold text-xs ${t.status==='Selesai'?'line-through opacity-40':''}">${esc(t.title)}</h4>
            <div class="flex gap-1.5 mt-1 flex-wrap items-center">
              <span class="text-[10px] text-base-content/60">${esc(courseName(t.course_id))}</span>
              <span class="badge ${b.cls} badge-xs font-semibold">${b.text}</span>
              <span class="badge ${priorityBadgeClass(t.priority)} badge-xs">${t.priority}</span>
            </div>
          </div>
        </div>`;
      }).join('') : `<div class="text-center p-8 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty}Belum ada tugas</div>`}
    </div>
  `;
}

App.setTaskFilter = (s) => { state.taskFilterStatus = s; render(); };
App.toggleTask = (id) => {
  const t = DB.tasks.find(id); if(!t) return;
  t.status = t.status==='Selesai' ? 'Belum dikerjakan' : 'Selesai';
  DB.tasks.save(t); render();
};
App.editTask = (id) => openTaskForm(DB.tasks.find(id));

function openTaskForm(existing){
  const t = existing || {course_id:'', title:'', description:'', deadline:new Date().toISOString().slice(0,10), priority:'Sedang', status:'Belum dikerjakan'};
  openSheet(existing?'Edit Tugas':'Tambah Tugas', `
    <div class="form-control gap-3 text-xs">
      <div>
        <label class="label label-text font-bold">Judul Tugas</label>
        <input id="f_title" class="input input-bordered input-sm w-full" value="${esc(t.title)}" />
      </div>
      <div>
        <label class="label label-text font-bold">Mata Kuliah</label>
        <select id="f_course" class="select select-bordered select-sm w-full">
          <option value="">Umum</option>
          ${DB.courses.all().map(c => `<option value="${c.id}" ${t.course_id===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="label label-text font-bold">Deadline</label>
          <input type="date" id="f_deadline" class="input input-bordered input-sm w-full" value="${t.deadline}" />
        </div>
        <div>
          <label class="label label-text font-bold">Prioritas</label>
          <select id="f_prio" class="select select-bordered select-sm w-full">
            ${['Rendah','Sedang','Tinggi'].map(p=>`<option ${t.priority===p?'selected':''}>${p}</option>`).join('')}
          </select>
        </div>
      </div>
      <div>
        <label class="label label-text font-bold">Status</label>
        <select id="f_status" class="select select-bordered select-sm w-full">
          ${['Belum dikerjakan','Sedang dikerjakan','Selesai'].map(s=>`<option ${t.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="flex gap-2 mt-4">
        ${existing ? `<button class="btn btn-error btn-sm flex-1" id="btnDelT">${ICON.trash} Hapus</button>` : ''}
        <button class="btn btn-primary btn-sm flex-1" id="btnSaveT">Simpan</button>
      </div>
    </div>
  `);

  document.getElementById('btnSaveT').onclick = () => {
    const title = document.getElementById('f_title').value.trim();
    if(!title) return;
    DB.tasks.save({
      id: t.id, title,
      course_id: document.getElementById('f_course').value,
      deadline: document.getElementById('f_deadline').value,
      priority: document.getElementById('f_prio').value,
      status: document.getElementById('f_status').value
    });
    closeSheet(); render();
  };
  if(existing) document.getElementById('btnDelT').onclick = () => { DB.tasks.remove(t.id); closeSheet(); render(); };
}

function pageSchedule(){
  const all = DB.schedules.all();
  const list = all.filter(s=>s.day===state.schedDay);
  return `
    <div class="flex gap-1 overflow-x-auto pb-2 mb-4">
      ${DAYS.map(d => `<button onclick="App.setSchedDay('${d}')" class="btn btn-xs ${state.schedDay===d?'btn-primary':'btn-ghost border-base-300'}">${d}</button>`).join('')}
    </div>
    <div class="space-y-2">
      ${list.length ? list.map(sc => `
        <div onclick="App.editSched('${sc.id}')" class="flex items-center gap-3 p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm">
          <div class="text-center font-bold text-xs text-brand pr-3 border-r border-base-200">
            ${fmtTime(sc.start_time)}<small class="block text-[9px] text-base-content/50">${fmtTime(sc.end_time)}</small>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-xs truncate">${esc(courseName(sc.course_id))}</h4>
            <p class="text-[11px] text-base-content/60">${esc(sc.room||'-')}</p>
          </div>
        </div>
      `).join('') : `<div class="text-center p-8 border border-dashed border-base-300 rounded-2xl text-xs text-base-content/50">${ICON.empty}Tidak ada kelas di hari ${state.schedDay}</div>`}
    </div>
  `;
}
App.setSchedDay = (d) => { state.schedDay = d; render(); };
App.editSched = (id) => openScheduleForm(DB.schedules.find(id));

function openScheduleForm(existing){
  const s = existing || {course_id:'', day:todayDayName(), start_time:'08:00', end_time:'09:40', room:''};
  openSheet(existing?'Edit Jadwal':'Tambah Jadwal', `
    <div class="form-control gap-3 text-xs">
      <div>
        <label class="label label-text font-bold">Mata Kuliah</label>
        <select id="f_course" class="select select-bordered select-sm w-full">
          ${DB.courses.all().map(c => `<option value="${c.id}" ${s.course_id===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="label label-text font-bold">Hari</label>
        <select id="f_day" class="select select-bordered select-sm w-full">
          ${DAYS.map(d=>`<option ${s.day===d?'selected':''}>${d}</option>`).join('')}
        </select>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div><label class="label label-text font-bold">Mulai</label><input type="time" id="f_start" class="input input-bordered input-sm w-full" value="${s.start_time}" /></div>
        <div><label class="label label-text font-bold">Selesai</label><input type="time" id="f_end" class="input input-bordered input-sm w-full" value="${s.end_time}" /></div>
      </div>
      <div><label class="label label-text font-bold">Ruangan</label><input id="f_room" class="input input-bordered input-sm w-full" value="${esc(s.room)}" /></div>
      <div class="flex gap-2 mt-4">
        ${existing ? `<button class="btn btn-error btn-sm flex-1" id="btnDelS">${ICON.trash} Hapus</button>` : ''}
        <button class="btn btn-primary btn-sm flex-1" id="btnSaveS">Simpan</button>
      </div>
    </div>
  `);
  document.getElementById('btnSaveS').onclick = () => {
    DB.schedules.save({
      id: s.id, course_id: document.getElementById('f_course').value,
      day: document.getElementById('f_day').value,
      start_time: document.getElementById('f_start').value,
      end_time: document.getElementById('f_end').value,
      room: document.getElementById('f_room').value
    });
    closeSheet(); render();
  };
  if(existing) document.getElementById('btnDelS').onclick = () => { DB.schedules.remove(s.id); closeSheet(); render(); };
}

function pageCourses(){
  const list = DB.courses.all();
  return `<div class="space-y-2">
    ${list.map(c => `
      <div onclick="App.editCourse('${c.id}')" class="flex items-center gap-3 p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm">
        <div class="p-2.5 bg-brand/10 text-brand rounded-xl">${ICON.book}</div>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-xs">${esc(c.name)}</h4>
          <p class="text-[11px] text-base-content/60">${esc(c.lecturer||'-')} · ${c.credits} SKS</p>
        </div>
      </div>
    `).join('')}
  </div>`;
}
App.editCourse = (id) => openCourseForm(DB.courses.find(id));

function openCourseForm(existing){
  const c = existing || {name:'', lecturer:'', credits:3, room:''};
  openSheet(existing?'Edit Matkul':'Tambah Matkul', `
    <div class="form-control gap-3 text-xs">
      <div><label class="label label-text font-bold">Nama Mata Kuliah</label><input id="f_name" class="input input-bordered input-sm w-full" value="${esc(c.name)}" /></div>
      <div><label class="label label-text font-bold">Dosen</label><input id="f_lect" class="input input-bordered input-sm w-full" value="${esc(c.lecturer)}" /></div>
      <div class="grid grid-cols-2 gap-2">
        <div><label class="label label-text font-bold">SKS</label><input type="number" id="f_cred" class="input input-bordered input-sm w-full" value="${c.credits}" /></div>
        <div><label class="label label-text font-bold">Ruangan</label><input id="f_room" class="input input-bordered input-sm w-full" value="${esc(c.room)}" /></div>
      </div>
      <div class="flex gap-2 mt-4">
        ${existing ? `<button class="btn btn-error btn-sm flex-1" id="btnDelC">${ICON.trash} Hapus</button>` : ''}
        <button class="btn btn-primary btn-sm flex-1" id="btnSaveC">Simpan</button>
      </div>
    </div>
  `);
  document.getElementById('btnSaveC').onclick = () => {
    const name = document.getElementById('f_name').value.trim();
    if(!name) return;
    DB.courses.save({id: c.id, name, lecturer: document.getElementById('f_lect').value, credits: Number(document.getElementById('f_cred').value||0), room: document.getElementById('f_room').value});
    closeSheet(); render();
  };
  if(existing) document.getElementById('btnDelC').onclick = () => { DB.courses.remove(c.id); closeSheet(); render(); };
}

function pageNotes(){
  const list = DB.notes.all();
  return `<div class="space-y-2">
    ${list.map(n => `
      <div onclick="App.editNote('${n.id}')" class="p-4 bg-base-100 border border-base-200 rounded-2xl shadow-sm space-y-1">
        <h4 class="font-bold text-xs">${esc(n.title)}</h4>
        <p class="text-xs text-base-content/70 line-clamp-2">${esc(n.content)}</p>
        <span class="badge badge-ghost badge-xs font-semibold mt-2">${esc(courseName(n.course_id))}</span>
      </div>
    `).join('')}
  </div>`;
}
App.editNote = (id) => openNoteForm(DB.notes.find(id));

function openNoteForm(existing){
  const n = existing || {course_id:'', title:'', content:''};
  openSheet(existing?'Edit Catatan':'Tambah Catatan', `
    <div class="form-control gap-3 text-xs">
      <div><label class="label label-text font-bold">Judul</label><input id="f_title" class="input input-bordered input-sm w-full" value="${esc(n.title)}" /></div>
      <div>
        <label class="label label-text font-bold">Mata Kuliah</label>
        <select id="f_course" class="select select-bordered select-sm w-full">
          <option value="">Umum</option>
          ${DB.courses.all().map(c => `<option value="${c.id}" ${n.course_id===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div><label class="label label-text font-bold">Isi Catatan</label><textarea id="f_content" class="textarea textarea-bordered w-full h-28">${esc(n.content)}</textarea></div>
      <div class="flex gap-2 mt-4">
        ${existing ? `<button class="btn btn-error btn-sm flex-1" id="btnDelN">${ICON.trash} Hapus</button>` : ''}
        <button class="btn btn-primary btn-sm flex-1" id="btnSaveN">Simpan</button>
      </div>
    </div>
  `);
  document.getElementById('btnSaveN').onclick = () => {
    const title = document.getElementById('f_title').value.trim();
    if(!title) return;
    DB.notes.save({id: n.id, title, course_id: document.getElementById('f_course').value, content: document.getElementById('f_content').value});
    closeSheet(); render();
  };
  if(existing) document.getElementById('btnDelN').onclick = () => { DB.notes.remove(n.id); closeSheet(); render(); };
}

function pageGrades(){
  const ipk = computeIPK();
  return `
    <div class="bg-gradient-to-r from-warning/20 to-warning/5 border border-warning/30 p-4 rounded-2xl flex justify-between items-center mb-4">
      <div><span class="text-xs text-base-content/60 font-medium">IPK Berjalan</span><b class="text-2xl block font-extrabold text-warning">${ipk??'-'}</b></div>
      <div class="text-warning">${ICON.award}</div>
    </div>
    <div class="space-y-2">
      ${DB.courses.all().map(c => {
        const fin = courseFinalScore(c.id);
        return `<div class="p-3 bg-base-100 border border-base-200 rounded-2xl shadow-sm flex justify-between items-center">
          <div><h4 class="font-bold text-xs">${esc(c.name)}</h4><span class="text-[10px] text-base-content/50">${c.credits} SKS</span></div>
          ${fin!==null ? `<span class="badge badge-success font-bold">${fin.toFixed(1)} (${scoreToLetter(fin)})</span>` : `<span class="badge badge-ghost text-[10px]">Belum Ada</span>`}
        </div>`;
      }).join('')}
    </div>
  `;
}
function openGradeForm(){
  openSheet('Tambah Nilai', `
    <div class="form-control gap-3 text-xs">
      <div>
        <label class="label label-text font-bold">Mata Kuliah</label>
        <select id="f_course" class="select select-bordered select-sm w-full">
          ${DB.courses.all().map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div><label class="label label-text font-bold">Komponen (UTS/UAS/Tugas)</label><input id="f_comp" class="input input-bordered input-sm w-full" placeholder="UTS" /></div>
      <div class="grid grid-cols-2 gap-2">
        <div><label class="label label-text font-bold">Bobot (%)</label><input type="number" id="f_weight" class="input input-bordered input-sm w-full" value="30" /></div>
        <div><label class="label label-text font-bold">Nilai (0-100)</label><input type="number" id="f_score" class="input input-bordered input-sm w-full" value="85" /></div>
      </div>
      <button class="btn btn-primary btn-sm mt-4 w-full" id="btnSaveG">Simpan</button>
    </div>
  `);
  document.getElementById('btnSaveG').onclick = () => {
    DB.grades.save({
      course_id: document.getElementById('f_course').value,
      component: document.getElementById('f_comp').value || 'Nilai',
      weight: Number(document.getElementById('f_weight').value),
      score: Number(document.getElementById('f_score').value)
    });
    closeSheet(); render();
  };
}

function pageSettings(){
  const s = DB.settings.get();
  return `
    <div class="space-y-4">
      <div class="p-3 bg-base-100 border border-base-200 rounded-2xl flex justify-between items-center">
        <div><b class="text-xs block">Mode Gelap</b><span class="text-[10px] text-base-content/60">Ubah tema tampilan</span></div>
        <input type="checkbox" ${s.dark?'checked':''} id="toggleDark" class="toggle toggle-primary toggle-sm" />
      </div>
      <div class="p-3 bg-base-100 border border-base-200 rounded-2xl space-y-2">
        <b class="text-xs block">Nama Mahasiswa</b>
        <input id="f_name" class="input input-bordered input-sm w-full text-xs" value="${esc(s.name)}" />
      </div>
      <button id="btnReset" class="btn btn-error btn-outline btn-sm w-full mt-4">${ICON.trash} Reset Data Contoh</button>
    </div>
  `;
}

/* ============================================================
   MASTER RENDER
   ============================================================ */
function render(){
  applyTheme();
  renderTopbar();
  renderBottomNav();
  const page = document.getElementById('page');
  switch(state.route){
    case 'home': page.innerHTML = pageHome(); break;
    case 'tasks': page.innerHTML = pageTasks(); break;
    case 'schedule': page.innerHTML = pageSchedule(); break;
    case 'courses': page.innerHTML = pageCourses(); break;
    case 'notes': page.innerHTML = pageNotes(); break;
    case 'grades': page.innerHTML = pageGrades(); break;
    case 'settings': page.innerHTML = pageSettings(); break;
    default: page.innerHTML = pageHome();
  }
  renderFab();
  bindEvents();
}

function bindEvents(){
  const toggleDark = document.getElementById('toggleDark');
  if(toggleDark) toggleDark.onchange = () => { const s=DB.settings.get(); s.dark=!s.dark; DB.settings.save(s); applyTheme(); };
  
  const fname = document.getElementById('f_name');
  if(fname) fname.onchange = () => { const s=DB.settings.get(); s.name=fname.value||'Mahasiswa'; DB.settings.save(s); };
  
  const btnReset = document.getElementById('btnReset');
  if(btnReset) btnReset.onclick = () => {
    if(confirm('Reset semua data kembali ke contoh awal?')){
      Object.values(DB.KEYS).forEach(k=>localStorage.removeItem(k));
      seedIfEmpty(); navigate('home');
    }
  };
}

/* INIT */
seedIfEmpty();
applyTheme();
render();
setTimeout(checkDeadlineReminders, 500);

})();