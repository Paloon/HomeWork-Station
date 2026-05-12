import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import firebaseConfig from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Application State
let state = {
    students: {},
    assignments: {},
    submissions: {},
    selectedStudentId: null,
    currentFilter: {
        subject: 'all',
        type: 'all',
        status: 'all'
    }
};

// Constants
const STATUS_CYCLE = ['⚪ ยังไม่เริ่ม', '🟡 กำลังทำ', '🟢 เสร็จแล้ว', '✅ ส่งแล้ว'];
const STATUS_COLORS = {
    '⚪ ยังไม่เริ่ม': 'bg-gray-100 text-gray-500 border-gray-300',
    '🟡 กำลังทำ': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    '🟢 เสร็จแล้ว': 'bg-green-100 text-green-700 border-green-300',
    '✅ ส่งแล้ว': 'bg-blue-100 text-blue-700 border-blue-300'
};

// DOM Elements
const studentListEl = document.getElementById('student-list');
const assignmentViewEl = document.getElementById('assignment-view');
const noStudentSelectedEl = document.getElementById('no-student-selected');
const selectedStudentNameEl = document.getElementById('selected-student-name');
const selectedStudentIdEl = document.getElementById('selected-student-id');
const studentProgressBarEl = document.getElementById('student-progress-bar');
const studentProgressTextEl = document.getElementById('student-progress-text');
const assignmentListEl = document.getElementById('assignment-list');
const taskForm = document.getElementById('task-form');
const modalAddTask = document.getElementById('modal-add-task');
const modalDashboard = document.getElementById('modal-dashboard');

// Initialize Data (Students 1-35)
async function initStudents() {
    try {
        const studentsRef = ref(db, 'students');
        onValue(studentsRef, (snapshot) => {
            if (!snapshot.exists()) {
                console.log("Initializing real student data...");
                const initialStudents = [
                    { id: '1', no: 1, studentId: '21807', name: 'นายประกาศิต สุริยะ' },
                    { id: '2', no: 2, studentId: '21824', name: 'นายคุณธรรม ปาละพงษ์' },
                    { id: '3', no: 3, studentId: '21825', name: 'นายจักรพงศ์ วงศ์ปัญญา' },
                    { id: '4', no: 4, studentId: '21826', name: 'นายณชพล ชินวรรธนวงศ์' },
                    { id: '5', no: 5, studentId: '21827', name: 'นายดนุพนธ์ ใจธรรม' },
                    { id: '6', no: 6, studentId: '21829', name: 'นายทัศนัย มณีทอง' },
                    { id: '7', no: 7, studentId: '21830', name: 'นายปุณณกรณ์ วงค์วัน' },
                    { id: '8', no: 8, studentId: '21831', name: 'นายปุณณกันต์ วงค์วัน' },
                    { id: '9', no: 9, studentId: '21833', name: 'นายพัทธดนย์ สุราใหม่' },
                    { id: '10', no: 10, studentId: '21835', name: 'นายภูรินทร์ วงค์ห้อ' },
                    { id: '11', no: 11, studentId: '21860', name: 'นายณัฐพล คำเพียว' },
                    { id: '12', no: 12, studentId: '21936', name: 'นายรตนมรรค กันทาดง' },
                    { id: '13', no: 13, studentId: '22776', name: 'นายนนทกร ถานี' },
                    { id: '14', no: 14, studentId: '21837', name: 'นางสาวกนกวรรณ คำเพียว' },
                    { id: '15', no: 15, studentId: '21838', name: 'นางสาวกมลชนก ตุ้มปามา' },
                    { id: '16', no: 16, studentId: '21840', name: 'นางสาวกุศลิน อุตนะวงษ์' },
                    { id: '17', no: 17, studentId: '21841', name: 'นางสาวคณิตา คำภิไร' },
                    { id: '18', no: 18, studentId: '21842', name: 'นางสาวจริยาพร ตนะพงษ์' },
                    { id: '19', no: 19, studentId: '21843', name: 'นางสาวชัญญพัชร์ โรจน์ปัญจสิริ' },
                    { id: '20', no: 20, studentId: '21844', name: 'นางสาวณธิดา เมธีสุประดิษฐ์' },
                    { id: '21', no: 21, studentId: '21845', name: 'นางสาวณัฐธิดา ศรียอดพิรุณ' },
                    { id: '22', no: 22, studentId: '21846', name: 'นางสาวปทุมพร ล้อลำเลียง' },
                    { id: '23', no: 23, studentId: '21847', name: 'นางสาวปนัดดา เขตสาลี' },
                    { id: '24', no: 24, studentId: '21849', name: 'นางสาวพลอยไพลิน แก้วมูล' },
                    { id: '25', no: 25, studentId: '21850', name: 'นางสาวพิชญาภัค ใจดี' },
                    { id: '26', no: 26, studentId: '21853', name: 'นางสาวสุภิญญา วงค์อุด' },
                    { id: '27', no: 27, studentId: '21855', name: 'นางสาวอินฑิรา กันทะโล' },
                    { id: '28', no: 28, studentId: '21941', name: 'นางสาวดาววารัตน์ ดวงจิตโสภณ' },
                    { id: '29', no: 29, studentId: '23843', name: 'นางสาวกนกพร แก้วตุ่น' },
                    { id: '30', no: 30, studentId: '23844', name: 'นางสาวปภธิดา นิมิตรปัญญาดี' },
                    ...Array.from({ length: 5 }, (_, i) => ({
                        id: (i + 31).toString(),
                        no: i + 31,
                        studentId: '',
                        name: `นักเรียน คนที่ ${i + 31}`
                    }))
                ];

                initialStudents.forEach(student => {
                    set(ref(db, `students/${student.id}`), student);
                });
            }
        }, { onlyOnce: true });
    } catch (error) {
        console.error("Error initializing students:", error);
    }
}

// Sync Real-time Data
function startSync() {
    onValue(ref(db, 'students'), (snapshot) => {
        state.students = snapshot.val() || {};
        renderStudentList();
    });

    onValue(ref(db, 'assignments'), (snapshot) => {
        state.assignments = snapshot.val() || {};
        renderSubjectFilters();
        if (state.selectedStudentId) renderAssignments();
    });

    onValue(ref(db, 'submissions'), (snapshot) => {
        state.submissions = snapshot.val() || {};
        renderStudentList();
        if (state.selectedStudentId) renderAssignments();
    });
}

// UI Logic: Render Student List
function renderStudentList() {
    const searchTerm = document.getElementById('search-student').value.toLowerCase();
    const activeFilter = document.querySelector('.student-filter-btn.active').dataset.filterStudent;

    studentListEl.innerHTML = '';

    const studentsArray = Object.values(state.students).sort((a, b) => a.no - b.no);

    studentsArray.forEach(student => {
        if (searchTerm && !student.name.toLowerCase().includes(searchTerm) && !student.id.includes(searchTerm)) return;

        const studentSubs = state.submissions[student.id] || {};
        const totalTasks = Object.keys(state.assignments).length;
        const submittedTasks = Object.values(studentSubs).filter(s => s.status === '✅ ส่งแล้ว').length;
        const progress = totalTasks === 0 ? 0 : Math.round((submittedTasks / totalTasks) * 100);

        // Filter Logic
        if (activeFilter !== 'all') {
            if (activeFilter === 'pending') {
                const overdue = Object.entries(state.assignments).filter(([taskId, task]) => {
                    const status = studentSubs[taskId]?.status || '⚪ ยังไม่เริ่ม';
                    return status !== '✅ ส่งแล้ว' && new Date(task.deadline) < new Date();
                }).length;
                if (overdue === 0) return;
            } else if (activeFilter === 'urgent') {
                const urgent = Object.entries(state.assignments).filter(([taskId, task]) => {
                    const status = studentSubs[taskId]?.status || '⚪ ยังไม่เริ่ม';
                    const diff = (new Date(task.deadline) - new Date()) / (1000*60*60*24);
                    return status !== '✅ ส่งแล้ว' && diff <= 3;
                }).length;
                if (urgent === 0) return;
            } else if (activeFilter === 'complete') {
                if (progress < 100) return;
            }
        }

        const item = document.createElement('div');
        item.className = `p-4 cursor-pointer border-b hover:bg-blue-50 transition-all ${state.selectedStudentId === student.id ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''}`;
        item.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700">#${student.no} ${student.name}</span>
                <span class="text-xs font-bold ${progress === 100 ? 'text-green-600' : 'text-blue-600'}">${progress}%</span>
            </div>
            <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-blue-600 transition-all duration-500" style="width: ${progress}%"></div>
            </div>
        `;
        item.onclick = () => selectStudent(student.id);
        studentListEl.appendChild(item);
    });
}

function selectStudent(id) {
    state.selectedStudentId = id;
    const student = state.students[id];

    selectedStudentNameEl.innerText = student.name;
    selectedStudentIdEl.innerText = `เลขที่ ${student.no} | รหัสประจำตัว ${student.studentId || '-'}`;
    document.getElementById('selected-student-avatar').innerText = student.no;

    noStudentSelectedEl.classList.add('hidden');
    assignmentViewEl.classList.remove('hidden');

    renderStudentList();
    renderAssignments();
}

function renderAssignments() {
    const studentId = state.selectedStudentId;
    const studentSubs = state.submissions[studentId] || {};
    assignmentListEl.innerHTML = '';

    const tasks = Object.entries(state.assignments).filter(([id, task]) => {
        const matchSubject = state.currentFilter.subject === 'all' || task.subject === state.currentFilter.subject;
        const matchType = state.currentFilter.type === 'all' || task.type === state.currentFilter.type;
        const status = studentSubs[id]?.status || '⚪ ยังไม่เริ่ม';
        const matchStatus = state.currentFilter.status === 'all' || status === state.currentFilter.status;
        return matchSubject && matchType && matchStatus;
    });

    if (tasks.length === 0) {
        assignmentListEl.innerHTML = '<div class="text-center py-10 text-gray-400">ไม่พบรายการงานที่ตรงกับตัวกรอง</div>';
        return;
    }

    // Sorting and Grouping by Priority
    const groups = {
        'Overdue': { label: '🔴 เลยกำหนดส่ง', color: 'text-red-900', items: [] },
        'Urgent': { label: '🔴 เร่งด่วน (< 3 วัน)', color: 'text-red-600', items: [] },
        'Soon': { label: '🟠 สำคัญ (< 7 วัน)', color: 'text-orange-600', items: [] },
        'Normal': { label: '🟡 ปกติ', color: 'text-yellow-600', items: [] },
        'Safe': { label: '🟢 ปลอดภัย', color: 'text-green-600', items: [] }
    };

    tasks.forEach(([taskId, task]) => {
        const deadline = new Date(task.deadline);
        const now = new Date();
        const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        let group = 'Safe';
        if (diffDays < 0) group = 'Overdue';
        else if (diffDays <= 3) group = 'Urgent';
        else if (diffDays <= 7) group = 'Soon';
        else if (diffDays <= 14) group = 'Normal';

        groups[group].items.push({ id: taskId, ...task });
    });

    Object.entries(groups).forEach(([key, group]) => {
        if (group.items.length === 0) return;

        const groupTitle = document.createElement('h3');
        groupTitle.className = `text-sm font-bold mb-3 uppercase tracking-wider ${group.color}`;
        groupTitle.innerText = group.label;
        assignmentListEl.appendChild(groupTitle);

        group.items.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).forEach(task => {
            const status = studentSubs[task.id]?.status || '⚪ ยังไม่เริ่ม';
            const item = document.createElement('div');
            item.className = 'bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 transition-all hover:shadow-md mb-4';

            // Status Button Group
            const statusButtons = STATUS_CYCLE.map(s => `
                <button onclick="window.updateTaskStatus('${task.id}', '${s}')"
                    class="px-3 py-1 rounded-md text-[10px] font-bold border transition-all ${status === s ? 'ring-2 ring-blue-500 ' + STATUS_COLORS[s] : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}"
                >
                    ${s}
                </button>
            `).join('');

            item.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">${task.subject}</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">${task.type}</span>
                        </div>
                        <h4 class="font-bold text-gray-800 text-lg">${task.title}</h4>
                        <p class="text-sm text-gray-500 mt-1">${task.description || 'ไม่มีคำอธิบาย'}</p>
                    </div>
                    <div class="text-right">
                        <span class="text-[11px] font-bold text-gray-400 uppercase block">Deadline</span>
                        <span class="text-sm font-bold ${group === 'Overdue' ? 'text-red-900' : 'text-gray-700'}">${task.deadline}</span>
                    </div>
                </div>
                <div class="flex justify-between items-center pt-4 border-t border-gray-50">
                    <div class="flex gap-1">
                        ${statusButtons}
                    </div>
                    ${task.link ? `<a href="${task.link}" target="_blank" class="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">📎 ไฟล์แนบ</a>` : ''}
                </div>
            `;
            assignmentListEl.appendChild(item);
        });
    });

    updateStudentProgress();
}

window.updateTaskStatus = (taskId, newStatus) => {
    update(ref(db, `submissions/${state.selectedStudentId}/${taskId}`), {
        status: newStatus
    });
};

function updateStudentProgress() {
    const studentId = state.selectedStudentId;
    const studentSubs = state.submissions[studentId] || {};
    const totalTasks = Object.keys(state.assignments).length;
    const submittedTasks = Object.values(studentSubs).filter(s => s.status === '✅ ส่งแล้ว').length;
    const progress = totalTasks === 0 ? 0 : Math.round((submittedTasks / totalTasks) * 100);

    studentProgressBarEl.style.width = `${progress}%`;
    studentProgressTextEl.innerText = `Progress ${progress}%`;
}

function renderSubjectFilters() {
    const subjects = [...new Set(Object.values(state.assignments).map(a => a.subject))];
    const filterContainer = document.getElementById('subject-filters');

    const allBtn = document.createElement('button');
    allBtn.className = `filter-btn px-3 py-1 rounded-full text-xs font-medium transition-all ${state.currentFilter.subject === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`;
    allBtn.innerText = 'ทุกวิชา';
    allBtn.dataset.filter = 'all';
    allBtn.onclick = () => {
        state.currentFilter.subject = 'all';
        renderSubjectFilters();
        renderAssignments();
    };
    filterContainer.innerHTML = '';
    filterContainer.appendChild(allBtn);

    subjects.forEach(subject => {
        const btn = document.createElement('button');
        btn.className = `filter-btn px-3 py-1 rounded-full text-xs font-medium transition-all ${state.currentFilter.subject === subject ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`;
        btn.innerText = subject;
        btn.dataset.filter = subject;
        btn.onclick = () => {
            state.currentFilter.subject = subject;
            renderSubjectFilters();
            renderAssignments();
        };
        filterContainer.appendChild(btn);
    });
}

// Filtering Event Listeners
document.getElementById('filter-type').onchange = (e) => {
    state.currentFilter.type = e.target.value;
    renderAssignments();
};
document.getElementById('filter-status').onchange = (e) => {
    state.currentFilter.status = e.target.value;
    renderAssignments();
};
document.querySelectorAll('.student-filter-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.student-filter-btn').forEach(b => b.classList.remove('bg-blue-600', 'text-white', 'active'));
        document.querySelectorAll('.student-filter-btn').forEach(b => b.classList.add('bg-gray-100', 'text-gray-600'));
        btn.classList.remove('bg-gray-100', 'text-gray-600');
        btn.classList.add('bg-blue-600', 'text-white', 'active');
        renderStudentList();
    };
});

// Modal & Form Logic
const openModal = (id, contentId) => {
    const modal = document.getElementById(id);
    const content = document.getElementById(contentId);
    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
};

const closeModal = (id, contentId) => {
    const modal = document.getElementById(id);
    const content = document.getElementById(contentId);
    content.classList.add('scale-95', 'opacity-0');
    content.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => modal.classList.add('hidden'), 200);
};

document.getElementById('open-add-task').onclick = () => openModal('modal-add-task', 'modal-content');
document.getElementById('close-modal').onclick = () => closeModal('modal-add-task', 'modal-content');

taskForm.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(taskForm);
    const newTask = {
        title: formData.get('title'),
        subject: formData.get('subject'),
        type: formData.get('type'),
        description: formData.get('description'),
        assignDate: formData.get('assignDate'),
        deadline: formData.get('deadline'),
        link: formData.get('link'),
        createdAt: new Date().toISOString()
    };

    const tasksRef = ref(db, 'assignments');
    const newTaskRef = push(tasksRef);
    await set(ref(db, `assignments/${newTaskRef.key}`), newTask);

    taskForm.reset();
    closeModal('modal-add-task', 'modal-content');
};

// Dashboard Logic
document.getElementById('open-dashboard').onclick = () => {
    openModal('modal-dashboard', 'dashboard-content');
    updateDashboardStats();
};
document.getElementById('close-dashboard').onclick = () => closeModal('modal-dashboard', 'dashboard-content');

function updateDashboardStats() {
    const students = Object.values(state.students);
    const tasks = Object.values(state.assignments);
    const subs = state.submissions || {};

    const totalStudents = students.length;
    const completedStudents = students.filter(s => {
        const sSubs = subs[s.id] || {};
        return Object.keys(state.assignments).length > 0 &&
               Object.values(sSubs).filter(val => val.status === '✅ ส่งแล้ว').length === Object.keys(state.assignments).length;
    }).length;

    const pendingStudents = students.filter(s => {
        const sSubs = subs[s.id] || {};
        return Object.entries(state.assignments).some(([tid, t]) => (sSubs[tid]?.status || '⚪ ยังไม่เริ่ม') !== '✅ ส่งแล้ว');
    }).length;

    document.getElementById('stat-total-students').innerText = `${totalStudents} คน`;
    document.getElementById('stat-complete-students').innerText = `${completedStudents} คน`;
    document.getElementById('stat-pending-students').innerText = `${pendingStudents} คน`;
    document.getElementById('stat-total-tasks').innerText = `${tasks.length} งาน`;

    const now = new Date();
    const urgent = tasks.filter(t => {
        const diff = (new Date(t.deadline) - now) / (1000*60*60*24);
        return diff >= 0 && diff <= 3;
    }).length;
    const overdue = tasks.filter(t => new Date(t.deadline) < now).length;

    document.getElementById('stat-urgent-tasks').innerText = `${urgent} งาน`;
    document.getElementById('stat-overdue-tasks').innerText = `${overdue} งาน`;

    // Top Performers
    const topStudents = students.map(s => {
        const sSubs = subs[s.id] || {};
        const progress = Object.keys(state.assignments).length === 0 ? 0 :
            Math.round((Object.values(sSubs).filter(v => v.status === '✅ ส่งแล้ว').length / Object.keys(state.assignments).length) * 100);
        return { ...s, progress };
    }).sort((a, b) => b.progress - a.progress).slice(0, 3);

    const topEl = document.getElementById('stat-top-students');
    topEl.innerHTML = topStudents.map((s, i) => `
        <div class="flex justify-between items-center text-sm bg-white p-2 rounded-lg border">
            <span class="text-gray-600 font-medium">${i+1}. ${s.name}</span>
            <span class="font-bold text-blue-600">${s.progress}%</span>
        </div>
    `).join('');
}

// Tab Navigation
document.getElementById('tab-students').onclick = () => {
    document.getElementById('student-section').classList.remove('hidden');
    document.getElementById('assignment-section').classList.add('hidden');
    document.getElementById('tab-students').classList.add('border-blue-600', 'text-blue-600');
    document.getElementById('tab-tasks').classList.remove('border-blue-600', 'text-blue-600');
};

document.getElementById('tab-tasks').onclick = () => {
    if (!state.selectedStudentId) {
        alert('กรุณาเลือกนักเรียนก่อน');
        return;
    }
    document.getElementById('student-section').classList.add('hidden');
    document.getElementById('assignment-section').classList.remove('hidden');
    document.getElementById('tab-tasks').classList.add('border-blue-600', 'text-blue-600');
    document.getElementById('tab-students').classList.remove('border-blue-600', 'text-blue-600');
};

document.getElementById('search-student').oninput = renderStudentList;

initStudents();
startSync();
