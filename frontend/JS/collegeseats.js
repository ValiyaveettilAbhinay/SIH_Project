// Sample data — in real app replace with API calls
const SAMPLE = [
  { id:1, name:'Govt Degree College A', distance_km:2.4, programs:[
      {code:'BA', seats:60, filled:30}, {code:'BSc', seats:60, filled:48}, {code:'BCom', seats:40, filled:25}
    ], has_hostel:true, internet:true, cutoff:'35%'},
  { id:2, name:'Govt Arts & Science B', distance_km:8.0, programs:[
      {code:'BA', seats:80, filled:70}, {code:'BSc', seats:50, filled:50}
    ], has_hostel:false, internet:false, cutoff:'40%'},
  { id:3, name:'Government Commerce C', distance_km:5.1, programs:[
      {code:'BCom', seats:50, filled:20}, {code:'BBA', seats:40, filled:10}
    ], has_hostel:true, internet:true, cutoff:'45%'}
];

// Utilities to persist seat changes & alerts in localStorage
const STORAGE_KEY = 'sip_colleges_v1';
const ALERTS_KEY = 'sip_college_alerts';

// Load data (merge SAMPLE with persisted modifications)
function loadData(){
  const raw = localStorage.getItem(STORAGE_KEY);
  let saved = raw ? JSON.parse(raw) : null;
  if(!saved){
    // initialize from SAMPLE
    saved = SAMPLE;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }
  return saved;
}

function saveData(data){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getAlerts(){ return JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]'); }
function saveAlerts(a){ localStorage.setItem(ALERTS_KEY, JSON.stringify(a)); }

// Rendering
const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');
const filterEl = document.getElementById('programFilter');
const sortEl = document.getElementById('sortBy');
const detailEl = document.getElementById('detail');
const detailContent = document.getElementById('detailContent');
const closeDetailBtn = document.getElementById('closeDetail');
const toggleAdminBtn = document.getElementById('toggleAdmin');
const adminPanel = document.getElementById('adminPanel');

let data = loadData();

// build program filter options
function buildProgramOptions(){
  const programs = new Set();
  data.forEach(c=> c.programs.forEach(p=> programs.add(p.code)));
  filterEl.innerHTML = '<option value="">All programs</option>';
  for(const p of Array.from(programs).sort()){
    const opt = document.createElement('option'); opt.value=p; opt.textContent=p; filterEl.appendChild(opt);
  }
}
buildProgramOptions();

// list render
function renderList(){
  listEl.innerHTML = '';
  const q = searchEl.value.trim().toLowerCase();
  const filter = filterEl.value;
  const sortBy = sortEl.value;

  let items = data.filter(col => {
    if(q){
      if(col.name.toLowerCase().includes(q)) return true;
      if(col.programs.some(p=> p.code.toLowerCase().includes(q))) return true;
      return false;
    }
    return true;
  });

  if(filter) items = items.filter(c => c.programs.some(p=> p.code === filter));

  // compute vacancy for sorting
  items.forEach(c => {
    c.totalVacancy = c.programs.reduce((s,p)=> s + Math.max(0, p.seats - p.filled), 0);
  });

  items.sort((a,b)=>{
    if(sortBy === 'distance') return a.distance_km - b.distance_km;
    if(sortBy === 'vacancy') return b.totalVacancy - a.totalVacancy;
    if(sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  items.forEach(col => {
    const div = document.createElement('div'); div.className='card';
    div.innerHTML = `
      <h3>${col.name}</h3>
      <div class="meta"><span class="small">Distance: ${col.distance_km} km</span> • <span class="small">Cutoff: ${col.cutoff}</span></div>
      <div class="small">Programs: ${col.programs.map(p=>p.code + ' (' + (p.seats - p.filled) + ' available)').join(' • ')}</div>
      <div style="margin-top:10px">
        <button class="btn view-btn" data-id="${col.id}">View</button>
        <button class="btn secondary alert-btn" data-id="${col.id}">Request Alert</button>
      </div>
    `;
    listEl.appendChild(div);
  });
}

renderList();

// events
searchEl.addEventListener('input', renderList);
filterEl.addEventListener('change', renderList);
sortEl.addEventListener('change', renderList);

// view detail
listEl.addEventListener('click', (e)=>{
  const v = e.target.closest('.view-btn');
  const a = e.target.closest('.alert-btn');
  if(v){
    const id = Number(v.dataset.id);
    openDetail(id);
  } else if(a){
    const id = Number(a.dataset.id);
    requestAlert(id);
  }
});

closeDetailBtn.addEventListener('click', ()=> detailEl.classList.add('hidden'));

// detail panel content
function openDetail(id){
  const col = data.find(x=> x.id===id);
  if(!col) return;
  detailContent.innerHTML = `
    <h2>${col.name}</h2>
    <div class="small">Distance: ${col.distance_km} km • Cutoff: ${col.cutoff}</div>
    <table class="program-table">
      <thead><tr><th>Program</th><th>Seats</th><th>Filled</th><th>Available</th><th></th></tr></thead>
      <tbody>
        ${col.programs.map(p=>`<tr>
          <td>${p.code}</td>
          <td>${p.seats}</td>
          <td>${p.filled}</td>
          <td>${Math.max(0,p.seats-p.filled)}</td>
          <td><button class="btn book-btn" data-col="${col.id}" data-prog="${p.code}">Book Seat</button></td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div style="margin-top:12px">
      <button id="closePanel" class="btn secondary">Close</button>
    </div>
  `;
  detailEl.classList.remove('hidden');
  // book handlers
  detailContent.querySelectorAll('.book-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const cid = Number(btn.dataset.col);
      const prog = btn.dataset.prog;
      bookSeat(cid, prog);
    });
  });
  document.getElementById('closePanel').addEventListener('click', ()=> detailEl.classList.add('hidden'));
}

// booking simulation
function bookSeat(colId, progCode){
  const col = data.find(c=> c.id===colId);
  const p = col.programs.find(x=> x.code===progCode);
  if(!p) return alert('Program not found');
  const available = Math.max(0, p.seats - p.filled);
  if(available <= 0) return alert('No seats available for this program');
  if(!confirm(`Confirm booking 1 seat in ${col.name} / ${progCode}?`)) return;
  p.filled += 1;
  saveData(data);
  alert('Seat booked (simulated).');
  renderList();
  openDetail(colId);
}

// request alert
function requestAlert(colId){
  const alerts = getAlerts();
  if(alerts.includes(colId)) {
    alert('You already requested alert for this college.');
    return;
  }
  alerts.push(colId);
  saveAlerts(alerts);
  alert('Alert requested. You will be notified (simulated).');
  renderList();
}

// SIMPLE admin panel for demo
toggleAdminBtn.addEventListener('click', ()=>{
  adminPanel.classList.toggle('hidden');
  buildAdmin();
});

function buildAdmin(){
  const adminCollege = document.getElementById('adminCollege');
  adminCollege.innerHTML = '';
  data.forEach(c=> {
    const o = document.createElement('option'); o.value = c.id; o.textContent = c.name; adminCollege.appendChild(o);
  });
  adminCollege.addEventListener('change', renderAdminPrograms);
  renderAdminPrograms();
}

function renderAdminPrograms(){
  const colId = Number(document.getElementById('adminCollege').value) || data[0].id;
  const col = data.find(c=> c.id===colId);
  const adminPrograms = document.getElementById('adminPrograms');
  adminPrograms.innerHTML = '';
  col.programs.forEach(p=>{
    const row = document.createElement('div'); row.className='admin-program-row';
    row.innerHTML = `<div style="flex:1">${p.code}</div>
      <input type="number" min="0" value="${p.seats}" data-prog="${p.code}" class="admin-seat-input" />
      <input type="number" min="0" value="${p.filled}" data-prog-filled="${p.code}" class="admin-filled-input" />`;
    adminPrograms.appendChild(row);
  });
}

document.getElementById('saveAdmin').addEventListener('click', ()=>{
  const colId = Number(document.getElementById('adminCollege').value);
  const col = data.find(c=> c.id===colId);
  const seatInputs = Array.from(document.querySelectorAll('.admin-seat-input'));
  const filledInputs = Array.from(document.querySelectorAll('.admin-filled-input'));
  seatInputs.forEach(inp=>{
    const code = inp.dataset.prog;
    const p = col.programs.find(x=> x.code===code);
    p.seats = Number(inp.value);
  });
  filledInputs.forEach(inp=>{
    const code = inp.dataset.progFilled;
    const p = col.programs.find(x=> x.code===code);
    p.filled = Number(inp.value);
  });
  saveData(data);
  alert('Saved admin updates');
  renderList();
  adminPanel.classList.add('hidden');
});

document.getElementById('closeAdmin').addEventListener('click', ()=> adminPanel.classList.add('hidden'));
