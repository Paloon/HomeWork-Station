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
    currentFilterMode: 'active',
    currentFilter: {
        subject: 'all',
        type: 'all'
    }
};

let currentEditingStudentId = null;
let currentEditingTaskId = null;

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

    // Reset filter to show incomplete tasks by default
    if (typeof resetFilterMode === 'function') resetFilterMode();

    renderStudentList();
    renderAssignments();

    // On mobile, auto-switch to tasks tab
    if (window.innerWidth < 768) {
        document.getElementById('student-section').style.display = 'none';
        document.getElementById('assignment-section').style.display = 'flex';
        if (typeof setActiveTab === 'function') setActiveTab('tab-tasks');
    }
}

function renderAssignments() {
    const studentId = state.selectedStudentId;
    const studentSubs = state.submissions[studentId] || {};
    assignmentListEl.innerHTML = '';

    const tasks = Object.entries(state.assignments).filter(([id, task]) => {
        const matchSubject = state.currentFilter.subject === 'all' || task.subject === state.currentFilter.subject;
        const matchType = state.currentFilter.type === 'all' || task.type === state.currentFilter.type;
        const status = studentSubs[id]?.status || '⚪ ยังไม่เริ่ม';

        // Filter mode logic
        let matchMode = true;
        if (state.currentFilterMode === 'active') {
            // ยังไม่ส่ง = ซ่อนเฉพาะ "✅ ส่งแล้ว"
            matchMode = status !== '✅ ส่งแล้ว';
        } else if (state.currentFilterMode === 'completed') {
            // ส่งแล้ว = แสดงเฉพาะ "✅ ส่งแล้ว"
            matchMode = status === '✅ ส่งแล้ว';
        }
        return matchSubject && matchType && matchMode;
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
// Filter mode buttons
document.querySelectorAll('.filter-mode-btn').forEach(btn => {
    btn.onclick = () => {
        state.currentFilterMode = btn.dataset.mode;
        document.querySelectorAll('.filter-mode-btn').forEach(b => {
            b.classList.remove('bg-blue-600', 'text-white', 'active');
            b.classList.add('bg-gray-100', 'text-gray-600');
        });
        btn.classList.remove('bg-gray-100', 'text-gray-600');
        btn.classList.add('bg-blue-600', 'text-white', 'active');
        if (state.selectedStudentId) renderAssignments();
    };
});
document.querySelectorAll('.student-filter-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.student-filter-btn').forEach(b => b.classList.remove('bg-blue-600', 'text-white', 'active'));
        document.querySelectorAll('.student-filter-btn').forEach(b => b.classList.add('bg-gray-100', 'text-gray-600'));
        btn.classList.remove('bg-gray-100', 'text-gray-600');
        btn.classList.add('bg-blue-600', 'text-white', 'active');
        renderStudentList();
    };
});

// ... existing code ...
// Modal & Form Logic
const openModal = (id, contentId) => {
    const modal = document.getElementById(id);
    modal.classList.remove('hidden');
    if (contentId) {
        const content = document.getElementById(contentId);
        if (content) {
            setTimeout(() => {
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            }, 10);
        }
    }
};

const closeModal = (id, contentId) => {
    const modal = document.getElementById(id);
    if (contentId) {
        const content = document.getElementById(contentId);
        if (content) {
            content.classList.add('scale-95', 'opacity-0');
            content.classList.remove('scale-100', 'opacity-100');
        }
    }
    setTimeout(() => modal.classList.add('hidden'), 200);
};

document.getElementById('open-add-task').onclick = () => openModal('modal-add-task', 'modal-content');
document.getElementById('close-modal').onclick = () => closeModal('modal-add-task', 'modal-content');

// --- ADMIN PANEL LOGIC ---
const ADMIN_PASSWORD = '1234'; // Change this to a secure password

document.getElementById('open-admin').onclick = () => {
    openModal('modal-password', 'modal-password-content'); // Note: need to add id to the inner div in HTML if not present, but we can use the modal's child
    // The HTML had the inner div without an ID, let's target it via child or fix HTML.
    // Let's assume we want to animate the first child of the modal.
    const content = document.querySelector('#modal-password > div');
    content.classList.remove('scale-95', 'opacity-0');
    content.classList.add('scale-100', 'opacity-100');
};

document.getElementById('cancel-password').onclick = () => {
    closeModal('modal-password', 'modal-password-content'); // Simple hide since it lacks a specific content ID
};

document.getElementById('confirm-password').onclick = () => {
    const pwd = document.getElementById('admin-password-input').value;
    if (pwd === ADMIN_PASSWORD) {
        closeModal('modal-password', 'modal-password-content');
        openModal('modal-admin', 'admin-content');
        renderAdminTasks();
        renderAdminStudents();
    } else {
        alert('รหัสผ่านไม่ถูกต้อง!');
    }
};

document.getElementById('close-admin').onclick = () => closeModal('modal-admin', 'admin-content');

// Admin Tab Switching
document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.admin-tab-btn').forEach(b => {
            b.classList.remove('bg-blue-600', 'text-white');
            b.classList.add('text-gray-600', 'hover:bg-gray-200');
        });
        btn.classList.add('bg-blue-600', 'text-white');
        btn.classList.remove('text-gray-600', 'hover:bg-gray-200');

        const tabId = btn.dataset.adminTab;
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.add('hidden');
            if (content.id === `admin-tab-${tabId}`) content.classList.remove('hidden');
        });
    };
});

async function renderAdminStudents() {
    const listEl = document.getElementById('admin-student-list');
    listEl.innerHTML = '';

    const students = Object.values(state.students).sort((a, b) => a.no - b.no);
    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-gray-50 transition-all';
        tr.innerHTML = `
            <td class="px-4 py-3 font-medium text-gray-700">${student.no}</td>
            <td class="px-4 py-3">${student.name}</td>
            <td class="px-4 py-3 text-gray-500 text-sm">${student.studentId || '-'}</td>
            <td class="px-4 py-3 text-right space-x-2">
                <button onclick="window.editStudent('${student.id}')" class="text-blue-600 hover:text-blue-800 text-xs font-bold">✏️ แก้ไข</button>
                <button onclick="window.deleteStudent('${student.id}')" class="text-red-500 hover:text-red-700 text-xs font-bold">🗑️ ลบ</button>
            </td>
        `;
        listEl.appendChild(tr);
    });
}

window.deleteStudent = async (id) => {
    if (confirm('ยืนยันการลบนักเรียนคนนี้?')) {
        await remove(ref(db, `students/${id}`));
        await remove(ref(db, `submissions/${id}`));
        renderAdminStudents();
    }
};

async function renderAdminTasks() {
    const listEl = document.getElementById('admin-task-list');
    listEl.innerHTML = '';

    const tasks = Object.entries(state.assignments);
    tasks.forEach(([id, task]) => {
        const tr = document.createElement('tr');
        tr.className = 'border-b hover:bg-gray-50 transition-all';
        tr.innerHTML = `
            <td class="px-4 py-3 font-medium text-gray-700">${task.title}</td>
            <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-600">${task.subject}</span></td>
            <td class="px-4 py-3 text-gray-500 text-sm">${task.deadline}</td>
            <td class="px-4 py-3 text-right space-x-2">
                <button onclick="window.editTask('${id}')" class="text-blue-600 hover:text-blue-800 text-xs font-bold">✏️ แก้ไข</button>
                <button onclick="window.deleteTask('${id}')" class="text-red-500 hover:text-red-700 text-xs font-bold">🗑️ ลบ</button>
            </td>
        `;
        listEl.appendChild(tr);
    });
}

window.deleteTask = async (id) => {
    if (confirm('⚠️ ยืนยันการลบงานนี้? งานนี้จะถูกลบออกจากระบบของนักเรียนทุกคน!')) {
        await remove(ref(db, `assignments/${id}`));
        renderAdminTasks();
    }
};

window.editTask = (id) => {
    const task = state.assignments[id];
    currentEditingTaskId = id;
    document.getElementById('edit-task-title').value = task.title || '';
    document.getElementById('edit-task-subject').value = task.subject || '';
    document.getElementById('edit-task-type').value = task.type || 'ต้องส่ง';
    document.getElementById('edit-task-deadline').value = task.deadline || '';
    document.getElementById('edit-task-description').value = task.description || '';
    const linkEl = document.getElementById('edit-task-link');
    if (linkEl) linkEl.value = task.link || '';
    openModal('modal-edit-task', null);
};

window.editStudent = (id) => {
    const student = state.students[id];
    currentEditingStudentId = id;
    document.getElementById('edit-student-no').value = student.no || '';
    document.getElementById('edit-student-name').value = student.name || '';
    document.getElementById('edit-student-id').value = student.studentId || '';
    openModal('modal-edit-student', null);
};

// Save Edit Student
document.getElementById('save-edit-student').onclick = async () => {
    const no = parseInt(document.getElementById('edit-student-no').value);
    const name = document.getElementById('edit-student-name').value.trim();
    const studentId = document.getElementById('edit-student-id').value.trim();
    if (!name) { alert('กรุณากรอกชื่อ-นามสกุล'); return; }
    try {
        await update(ref(db, `students/${currentEditingStudentId}`), { no, name, studentId });
        alert('✅ บันทึกเรียบร้อย!');
        closeModal('modal-edit-student', null);
        renderAdminStudents();
    } catch (e) { alert('❌ เกิดข้อผิดพลาด: ' + e.message); }
};
document.getElementById('cancel-edit-student').onclick = () => closeModal('modal-edit-student', null);

// Save Edit Task
document.getElementById('save-edit-task').onclick = async () => {
    const title = document.getElementById('edit-task-title').value.trim();
    const subject = document.getElementById('edit-task-subject').value.trim();
    const type = document.getElementById('edit-task-type').value;
    const deadline = document.getElementById('edit-task-deadline').value;
    const description = document.getElementById('edit-task-description').value.trim();
    const linkEl = document.getElementById('edit-task-link');
    const link = linkEl ? linkEl.value.trim() : '';
    if (!title || !subject || !deadline) { alert('กรุณากรอกข้อมูลให้ครบ'); return; }
    try {
        await update(ref(db, `assignments/${currentEditingTaskId}`), { title, subject, type, deadline, description, link });
        alert('✅ บันทึกเรียบร้อย!');
        closeModal('modal-edit-task', null);
        renderAdminTasks();
        if (state.selectedStudentId) renderAssignments();
    } catch (e) { alert('❌ เกิดข้อผิดพลาด: ' + e.message); }
};
document.getElementById('cancel-edit-task').onclick = () => closeModal('modal-edit-task', null);

// Modal and Form Logic (Keep these)
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

    // Safe set for optional elements
    const safeSet = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };
    safeSet('stat-pending-students', `${pendingStudents} คน`);
    safeSet('stat-total-tasks', `${tasks.length} งาน`);

    const now = new Date();
    const urgent = tasks.filter(t => {
        const diff = (new Date(t.deadline) - now) / (1000*60*60*24);
        return diff >= 0 && diff <= 3;
    }).length;
    const overdue = tasks.filter(t => new Date(t.deadline) < now).length;

    safeSet('stat-urgent-tasks', `${urgent} งาน`);
    safeSet('stat-overdue-tasks', `${overdue} งาน`);

    // Urgent task list - hide tasks where ALL students have submitted
    const urgentListEl = document.getElementById('urgent-list');
    if (urgentListEl) {
        const urgentTasks = tasks.filter(t => {
            const diff = (new Date(t.deadline) - now) / (1000*60*60*24);
            if (diff > 3) return false;
            // Check if ALL students submitted this task
            const taskId = Object.entries(state.assignments).find(([id, a]) => a === t)?.[0];
            if (taskId && totalStudents > 0) {
                const allSubmitted = students.every(s => {
                    const ss = subs[s.id] || {};
                    return ss[taskId]?.status === '✅ ส่งแล้ว';
                });
                if (allSubmitted) return false; // Hide if everyone submitted
            }
            return true;
        }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 5);
        urgentListEl.innerHTML = urgentTasks.length === 0
            ? '<p class="text-gray-400 text-sm italic">ไม่มีงานเร่งด่วน 🎉</p>'
            : urgentTasks.map(t => {
                const d = Math.ceil((new Date(t.deadline) - now) / (1000*60*60*24));
                const color = d < 0 ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50';
                return `<div class="flex justify-between items-center p-3 rounded-xl ${color}">
                    <span class="font-medium text-sm">${t.title}</span>
                    <span class="text-xs font-bold">${d < 0 ? 'เลย ' + Math.abs(d) + ' วัน' : 'อีก ' + d + ' วัน'}</span>
                </div>`;
            }).join('');
    }

    // Chart
    const chartEl = document.getElementById('chart-completion');
    if (chartEl) {
        const ctx = chartEl.getContext('2d');
        if (window._dashChart) window._dashChart.destroy();
        const totalPairs = totalStudents * tasks.length;
        let doneCount = 0;
        students.forEach(s => {
            const ss = subs[s.id] || {};
            doneCount += Object.values(ss).filter(v => v.status === '✅ ส่งแล้ว').length;
        });
        window._dashChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['ส่งแล้ว', 'ยังไม่ส่ง'],
                datasets: [{ data: [doneCount, Math.max(0, totalPairs - doneCount)], backgroundColor: ['#3b82f6', '#e5e7eb'], borderWidth: 0 }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    }

    // Top Performers
    const topStudents = students.map(s => {
        const sSubs = subs[s.id] || {};
        const progress = Object.keys(state.assignments).length === 0 ? 0 :
            Math.round((Object.values(sSubs).filter(v => v.status === '✅ ส่งแล้ว').length / Object.keys(state.assignments).length) * 100);
        return { ...s, progress };
    }).sort((a, b) => b.progress - a.progress).slice(0, 5);

    const topEl = document.getElementById('stat-top-students');
    if (topEl) {
        topEl.innerHTML = topStudents.map((s, i) => `
            <div class="flex justify-between items-center text-sm p-3 rounded-xl ${i === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'} mb-2">
                <span class="font-medium text-gray-700">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i+1)+'.'} ${s.name}</span>
                <span class="font-bold text-blue-600">${s.progress}%</span>
            </div>
        `).join('');
    }
}

// === Bottom Nav Tab Switching ===
function setActiveTab(activeId) {
    document.querySelectorAll('.btm-nav-btn').forEach(b => {
        b.classList.remove('active', 'text-blue-600');
        b.classList.add('text-gray-400');
    });
    const btn = document.getElementById(activeId);
    if (btn) { btn.classList.add('active', 'text-blue-600'); btn.classList.remove('text-gray-400'); }
}

document.getElementById('tab-students').onclick = () => {
    document.getElementById('student-section').style.display = '';
    document.getElementById('assignment-section').style.display = 'none';
    setActiveTab('tab-students');
};

document.getElementById('tab-tasks').onclick = () => {
    if (!state.selectedStudentId) {
        alert('กรุณาเลือกนักเรียนก่อน');
        return;
    }
    document.getElementById('student-section').style.display = 'none';
    document.getElementById('assignment-section').style.display = 'flex';
    setActiveTab('tab-tasks');
};

// Mobile: Dashboard tab
const tabDashMobile = document.getElementById('tab-dashboard-mobile');
if (tabDashMobile) {
    tabDashMobile.onclick = () => {
        setActiveTab('tab-dashboard-mobile');
        openModal('modal-dashboard', 'dashboard-content');
        updateDashboardStats();
    };
}

// Mobile: Admin tab
const tabAdminMobile = document.getElementById('tab-admin-mobile');
if (tabAdminMobile) {
    tabAdminMobile.onclick = () => {
        setActiveTab('tab-admin-mobile');
        openModal('modal-password', 'modal-password-content');
        const content = document.querySelector('#modal-password > div');
        if (content) {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }
    };
}

// Reset filter mode when selecting student
function resetFilterMode() {
    state.currentFilterMode = 'active';
    document.querySelectorAll('.filter-mode-btn').forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'active');
        b.classList.add('bg-gray-100', 'text-gray-600');
    });
    const activeBtn = document.querySelector('[data-mode="active"]');
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-100', 'text-gray-600');
        activeBtn.classList.add('bg-blue-600', 'text-white', 'active');
    }
}

document.getElementById('search-student').oninput = renderStudentList;

initStudents();
startSync();
