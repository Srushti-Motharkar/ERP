// ---------- ADD/EDIT ----------
  function openAddModal() {
    editId = null;
    document.getElementById('modalTitle').textContent = 'Add Enquiry';
    ['name','phone','email','notes'].forEach(f => document.getElementById('f-'+f).value = '');
    document.getElementById('f-type').value = 'Student';
    document.getElementById('f-status').value = 'New';
    document.getElementById('f-source').value = 'Walk-in';
    document.getElementById('f-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('f-course').value = 'Full Stack Web Development';
    new bootstrap.Modal(document.getElementById('addModal')).show();
  }

  function editEnquiry(id) {
    const e = enquiries.find(x => x.id === id);
    if (!e) return;
    editId = id;
    document.getElementById('modalTitle').textContent = 'Edit Enquiry';
    document.getElementById('f-name').value = e.name;
    document.getElementById('f-phone').value = e.phone || '';
    document.getElementById('f-email').value = e.email || '';
    document.getElementById('f-notes').value = e.notes || '';
    document.getElementById('f-type').value = e.type;
    document.getElementById('f-status').value = e.status;
    document.getElementById('f-source').value = e.source || 'Walk-in';
    document.getElementById('f-date').value = e.date || '';
    document.getElementById('f-course').value = e.course;
    new bootstrap.Modal(document.getElementById('addModal')).show();
  }

  function saveEnquiry() {
    const name = document.getElementById('f-name').value.trim();
    const phone = document.getElementById('f-phone').value.trim();
    if (!name) { alert('Please enter full name.'); return; }
    if (!phone) { alert('Please enter phone number.'); return; }
    const data = {
      name, phone,
      email: document.getElementById('f-email').value.trim(),
      type: document.getElementById('f-type').value,
      course: document.getElementById('f-course').value,
      status: document.getElementById('f-status').value,
      source: document.getElementById('f-source').value,
      totalFees: document.getElementById("f-totalfees").value,

      paidFees: document.getElementById("f-paidfees").value,
      pendingFees: document.getElementById("f-pendingfees").value,
      date: document.getElementById('f-date').value,
      notes: document.getElementById('f-notes').value.trim(),
    };
    if (editId) {
      const idx = enquiries.findIndex(e => e.id === editId);
      enquiries[idx] = { ...enquiries[idx], ...data };
    } else {
      data.id = Date.now().toString();
      data.notified = false;
      enquiries.push(data);
    }
    saveData();
    bootstrap.Modal.getInstance(document.getElementById('addModal')).hide();
    if (currentSection === 'dashboard') renderDashboard();
    else renderTable();
  }

// ---------- DATA ----------
let enquiries = JSON.parse(localStorage.getItem('edutrack_enquiries') || '[]');

let editId = null;
let deleteTarget = null;
let notifyTarget = null;
let currentSection = 'dashboard';

// ---------- SAVE ----------
function saveData() {
localStorage.setItem('edutrack_enquiries', JSON.stringify(enquiries));
}

// ---------- LOGOUT ----------
function logout() {
if(confirm("Are you sure you want to logout?")){
localStorage.removeItem('rememberedUser');
window.location.href = "login.html";
}
}

// ---------- PENDING FEES ----------
function calculatePending(){

let total = parseFloat(document.getElementById("f-totalfees").value) || 0;
let paid = parseFloat(document.getElementById("f-paidfees").value) || 0;

let pending = total - paid;

if(pending < 0) pending = 0;

document.getElementById("f-pendingfees").value = pending;

}

// ---------- SECTIONS ----------
function showSection(section){

currentSection = section;

document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));

document.getElementById('nav-'+section).classList.add('active');

const titles = {
dashboard:'Dashboard',
new:'New Enquiries',
admitted:'Admitted',
dropped:'Dropped',
clients:'Clients'
};

document.getElementById('page-title').textContent = titles[section];

document.getElementById('section-dashboard').style.display =
section === 'dashboard' ? '' : 'none';

document.getElementById('section-enquiries').style.display =
section !== 'dashboard' ? '' : 'none';

if(section === 'dashboard') renderDashboard();
else renderTable();

}

// ---------- BADGES ----------
function updateBadges(){

const counts = {New:0,Admitted:0,Dropped:0};
let clients = 0;

enquiries.forEach(e=>{
if(counts[e.status] !== undefined) counts[e.status]++;
if(e.type === "Client") clients++;
});

document.getElementById('badge-new').textContent = counts.New;
document.getElementById('badge-admitted').textContent = counts.Admitted;
document.getElementById('badge-dropped').textContent = counts.Dropped;
document.getElementById('badge-clients').textContent = clients;

}

// ---------- DASHBOARD ----------
function renderDashboard(){

const total = enquiries.length;
const newC = enquiries.filter(e=>e.status==="New").length;
const admitted = enquiries.filter(e=>e.status==="Admitted").length;
const dropped = enquiries.filter(e=>e.status==="Dropped").length;

const rate = total ? Math.round((admitted/total)*100) : 0;

document.getElementById('dash-total').textContent = total;
document.getElementById('dash-new').textContent = newC;
document.getElementById('dash-admitted').textContent = admitted;
document.getElementById('dash-dropped').textContent = dropped;
document.getElementById('dash-rate').textContent = rate + "%";
document.getElementById('dash-progress').style.width = rate + "%";

updateBadges();

}

// ---------- FILTER ----------
function getFilteredEnquiries(){

const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
const fs = document.getElementById('filterStatus')?.value || '';
const ft = document.getElementById('filterType')?.value || '';

return enquiries.filter(e=>{

let matchSection = true;

if(currentSection==="new") matchSection = e.status==="New";
if(currentSection==="admitted") matchSection = e.status==="Admitted";
if(currentSection==="dropped") matchSection = e.status==="Dropped";
if(currentSection==="clients") matchSection = e.type==="Client";

const name = (e.name||"").toLowerCase();
const course = (e.course||"").toLowerCase();
const phone = (e.phone||"");

const matchSearch =
!q ||
name.includes(q) ||
course.includes(q) ||
phone.includes(q);

const matchStatus = !fs || e.status===fs;
const matchType = !ft || e.type===ft;

return matchSection && matchSearch && matchStatus && matchType;

});

}

// ---------- TABLE ----------
function renderTable(){

const data = getFilteredEnquiries();

const tbody = document.getElementById('enquiry-tbody');
const empty = document.getElementById('empty-state');

if(!data.length){

tbody.innerHTML="";
empty.style.display="block";
return;

}

empty.style.display="none";

tbody.innerHTML = data.map((e,i)=>`

<tr>

<td><input type="checkbox" class="row-check" value="${e.id}"></td>

<td>${i+1}</td>

<td>
<b>${e.name}</b><br>
<small>${e.email||''}</small>
</td>

<td>${e.type}</td>

<td>${e.course}</td>

<td>${e.phone}</td>

<td>${e.status}</td>

<td>
${e.notified
? '<span class="badge bg-success">Notified</span>'
: '<span class="badge bg-secondary">Pending</span>'}
</td>

<td>

<button onclick="viewEnquiry('${e.id}')">View</button>

<button onclick="editEnquiry('${e.id}')">Edit</button>

<button onclick="openNotify('${e.id}')">Notify</button>

<button onclick="openDelete('${e.id}')">Delete</button>

</td>

</tr>

`).join("");

updateBadges();

}

// ---------- ADD ----------
function openAddModal(){

editId=null;

document.getElementById('modalTitle').textContent="Add Enquiry";

document.getElementById('f-name').value="";
document.getElementById('f-phone').value="";
document.getElementById('f-email').value="";
document.getElementById('f-notes').value="";

new bootstrap.Modal(document.getElementById('addModal')).show();

}

// ---------- SAVE ----------
function saveEnquiry(){

const name=document.getElementById('f-name').value;
const phone=document.getElementById('f-phone').value;

if(!name || !phone){
alert("Please enter name and phone");
return;
}

const data = {

name,
phone,
email:document.getElementById('f-email').value,
type:document.getElementById('f-type').value,
course:document.getElementById('f-course').value,
status:document.getElementById('f-status').value,
totalFees:document.getElementById("f-totalfees").value,
paidFees:document.getElementById("f-paidfees").value,
pendingFees:document.getElementById("f-pendingfees").value,
date:document.getElementById('f-date').value,
notes:document.getElementById('f-notes').value

};

if(editId){

const i = enquiries.findIndex(e=>e.id===editId);
enquiries[i] = {...enquiries[i],...data};

}else{

data.id = Date.now().toString();
data.notified=false;

enquiries.push(data);

}

saveData();

bootstrap.Modal.getInstance(document.getElementById('addModal')).hide();

renderTable();

}

function viewEnquiry(id) {

  const e = enquiries.find(x => x.id === id);
  if (!e) return;

  document.getElementById('viewBody').innerHTML = `
    <div class="row g-3">
      ${field('Name', e.name)}
      ${field('Type', e.type)}
      ${field('Phone', e.phone || '-')}
      ${field('Email', e.email || '-')}
      ${field('Course / Service', e.course)}
      ${field('Status', e.status)}
      ${field('Source', e.source || '-')}
      ${field('Total Fees', e.totalFees || '0')}
      ${field('Paid Fees', e.paidFees || '0')}
      ${field('Pending Fees', e.pendingFees || '0')}
      ${field('Date', e.date || '-')}
      ${field('Notified', e.notified ? 'Yes' : 'No')}

      ${e.notes ? `
        <div class="col-12">
          <div class="form-label">Notes</div>
          <div style="background:#f8fafc;border-radius:8px;padding:10px;font-size:0.85rem">
            ${e.notes}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  new bootstrap.Modal(document.getElementById('viewModal')).show();
}  
function field(label, val) {
  return `
    <div class="col-md-6">
      <div class="form-label">${label}</div>
      <div style="font-weight:600;font-size:0.88rem">${val}</div>
    </div>
  `;
}
// ---------- OPEN NOTIFY ----------
function openNotify(id){

  notifyTarget = id;

  const e = enquiries.find(x => x.id === id);
  if(!e) return;

  // Show name
  document.getElementById('notify-name-display').textContent =
    "Send Notification to " + e.name + " (" + (e.email || 'No Email') + ")";

  // Get fields
  const dateInput = document.getElementById('notify-date');
  const msgBox = document.getElementById('notify-msg');

  // ---------- STUDENT ----------
  if(e.type === "Student"){

    dateInput.style.display = "block"; // show date

    msgBox.value = `Dear ${e.name},

Your course "${e.course}" is starting soon.

Please confirm your admission.

Course Details:
Course: ${e.course}
Total Fees: ${e.totalFees}
Pending Fees: ${e.pendingFees}

Regards,
PSK Technologies pvt ltd.IT Company Nagpur`;

  }

  // ---------- CLIENT ----------
  else if(e.type === "Client"){

    

    msgBox.value = `Dear ${e.name},

Thank you for choosing our services.

We are excited to work with you on "${e.course}".

Our team will contact you shortly with further details.

Service Details:
Service: ${e.course}

Regards,
PSK Technologies pvt ltd.IT Company Nagpur`;

  }

  // Open modal
  new bootstrap.Modal(document.getElementById('notifyModal')).show();
}
// ---------- SEND EMAIL ----------
function confirmNotify(){

if(!notifyTarget) return;

const e = enquiries.find(x=>x.id===notifyTarget);

const msg = document.getElementById('notify-msg').value;

const subject = encodeURIComponent("Course Notification");

const body = encodeURIComponent(msg);

const email = e.email;

const mailURL = `mailto:${email}?subject=${subject}&body=${body}`;

window.location.href = mailURL;

e.notified = true;

saveData();

renderTable();

bootstrap.Modal.getInstance(document.getElementById('notifyModal')).hide();

notifyTarget = null;

}

// ---------- DELETE ----------
function openDelete(id){

deleteTarget=id;

new bootstrap.Modal(document.getElementById('deleteModal')).show();

}

function confirmDelete(){

enquiries = enquiries.filter(e=>e.id!==deleteTarget);

saveData();

renderTable();

bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();

}

// ---------- INIT ----------
renderDashboard();
updateBadges();