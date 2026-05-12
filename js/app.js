import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
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
    currentFilter: 'all'
};

// Constants
const STATUS_CYCLE = ['⚪ ยังไม่เริ่ม', '🟡 กำลังทำ', '🟢 เสร็จแล้ว', '✅ ส่งแล้ว'];

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

// Initialize Data (Students 1-35)
async function initStudents() {
    try {
        const studentsRef = ref(db, 'students');
        onValue(studentsRef, (snapshot) => {
            if (!snapshot.exists()) {
                console.log("Initializing student data...");
                const initialStudents = [
                    { id: '1', no: 1, name: 'นายประกาศิต สุริยะ' },
                    ...Array.from({ length: 34 }, (_, i) => ({
                        id: (i + 2).toString(),
                        no: i + 2,
                        name: `นักเรียน คนที่ ${i + 2}`
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
    const showOnlyPending = document.getElementById('filter-pending').checked;

    studentListEl.innerHTML = '';

    const studentsArray = Object.values(state.students).sort((a, b) => a.no - b.no);

    if (studentsArray.length === 0) {
        studentListEl.innerHTML = '<div class="p-4 text-center text-gray-400">กำลังโหลดข้อมูลจาก Firebase...</div>';
        return;
    }

    studentsArray.forEach(student => {
        if (searchTerm && !student.name.toLowerCase().includes(searchTerm) && !student.id.includes(searchTerm)) return;

        const studentSubs = state.submissions[student.id] || {};
        const totalTasks = Object.keys(state.assignments).length;
        const submittedTasks = Object.values(studentSubs).filter(s => s.status === '✅ ส่งแล้ว').length;
        const progress = totalTasks === 0 ? 0 : Math.round((submittedTasks / totalTasks) * 100);

        if (showOnlyPending && progress === 100) return;

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
    selectedStudentIdEl.innerText = `เลขที่ ${student.no}`;

    noStudentSelectedEl.classList.add('hidden');
    assignmentViewEl.classList.remove('hidden');

    renderStudentList();
    renderAssignments();
}

function renderAssignments() {
    const studentId = state.selectedStudentId;
    const studentSubs = state.submissions[studentId] || {};
    assignmentListEl.innerHTML = '';

    const filteredAssignments = Object.entries(state.assignments).filter(([id, task]) => {
        return state.currentFilter === 'all' || task.subject === state.currentFilter;
    });

    if (filteredAssignments.length === 0) {
        assignmentListEl.innerHTML = '<div class="text-center py-10 text-gray-400">ไม่พบรายการงาน</div>';
        return;
    }

    filteredAssignments.forEach(([taskId, task]) => {
        const status = studentSubs[taskId]?.status || '⚪ ยังไม่เริ่ม';
        const deadline = new Date(task.deadline);
        const now = new Date();
        const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

        let colorClass = 'bg-green-100 text-green-700';
        if (diffDays < 0) colorClass = 'bg-red-900 text-white';
        else if (diffDays < 3) colorClass = 'bg-red-500 text-white';
        else if (diffDays < 7) colorClass = 'bg-orange-500 text-white';

        const item = document.createElement('div');
        item.className = 'bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center gap-4 transition-all hover:shadow-md';
        item.innerHTML = `
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase">${task.subject}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${colorClass}">${task.deadline}</span>
                </div>
                <h4 class="font-bold text-gray-800">${task.title}</h4>
                <p class="text-xs text-gray-500">${task.type} ${task.link ? `<a href="${task.link}" target="_blank" class="text-blue-500 underline ml-1">ดูไฟล์แนบ</a>` : ''}</p>
            </div>
            <button class="status-btn px-3 py-2 rounded-lg text-xs font-bold border bg-white hover:bg-gray-50 transition-all" data-task-id="${taskId}" data-current-status="${status}">
                ${status}
            </button>
        `;

        item.querySelector('.status-btn').onclick = () => toggleStatus(taskId, status);
        assignmentListEl.appendChild(item);
    });

    updateStudentProgress();
}

function toggleStatus(taskId, currentStatus) {
    const nextIndex = (STATUS_CYCLE.indexOf(currentStatus) + 1) % STATUS_CYCLE.length;
    const nextStatus = STATUS_CYCLE[nextIndex];

    update(ref(db, `submissions/${state.selectedStudentId}/${taskId}`), {
        status: nextStatus
    });
}

function updateStudentProgress() {
    const studentId = state.selectedStudentId;
    const studentSubs = state.submissions[studentId] || {};
    const totalTasks = Object.keys(state.assignments).length;
    const submittedTasks = Object.values(studentSubs).filter(s => s.status === '✅ ส่งแล้ว').length;
    const progress = totalTasks === 0 ? 0 : Math.round((submittedTasks / totalTasks) * 100);

    studentProgressBarEl.style.width = `${progress}%`;
    studentProgressTextEl.innerText = `ความคืบหน้า ${progress}%`;
}

function renderSubjectFilters() {
    const subjects = [...new Set(Object.values(state.assignments).map(a => a.subject))];
    const filterContainer = document.querySelector('.p-4.flex.gap-2.overflow-x-auto');

    const allBtn = filterContainer.querySelector('[data-filter="all"]');
    filterContainer.innerHTML = '';
    filterContainer.appendChild(allBtn);

    subjects.forEach(subject => {
        const btn = document.createElement('button');
        btn.className = `filter-btn px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white transition-all`;
        btn.innerText = subject;
        btn.dataset.filter = subject;
        btn.onclick = () => {
            state.currentFilter = subject;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('bg-blue-600', 'text-white'));
            btn.classList.add('bg-blue-600', 'text-white');
            renderAssignments();
        };
        filterContainer.appendChild(btn);
    });
}

document.getElementById('open-add-task').onclick = () => modalAddTask.classList.remove('hidden');
document.getElementById('close-modal').onclick = () => modalAddTask.classList.add('hidden');

taskForm.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(taskForm);
    const newTask = {
        title: formData.get('title'),
        subject: formData.get('subject'),
        type: formData.get('type'),
        deadline: formData.get('deadline'),
        link: formData.get('link'),
        createdAt: new Date().toISOString()
    };

    const tasksRef = ref(db, 'assignments');
    const new laRef = push(tasksRef);
    await set(ref(db, `assignments/${new laRef.key}`), newTask);

    taskForm.reset();
    modalAddTask.classList.add('hidden');
};

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
document.getElementById('filter-pending').onchange = renderStudentList;

initStudents();
startSync();
