let tasks = [];
let filter = 'all';
let nextId = 1;

const input = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('task-list');
const statsRow = document.getElementById('stats-row');
const clearRow = document.getElementById('clear-row');
const clearBtn = document.getElementById('clear-done-btn');
const dateLabel = document.getElementById('date-label');

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function load() {
  dateLabel.textContent = todayLabel();
  try {
    const saved = JSON.parse(localStorage.getItem('todo_tasks_v1'));
    if (saved) {
      tasks = saved.tasks || [];
      nextId = saved.nextId || (tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1);
    }
  } catch(e) { tasks = []; nextId = 1; }
  render();
}

function save() {
  localStorage.setItem('todo_tasks_v1', JSON.stringify({ tasks, nextId }));
}

function addTask() {
  const name = input.value.trim();
  if (!name) { input.focus(); return; }
  tasks.unshift({ id: nextId++, name, complete: false, date: Date.now() });
  input.value = '';
  save();
  render();
  input.focus();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) { t.complete = !t.complete; save(); render(); }
}

function deleteTask(id) {
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(8px)';
    el.style.transition = 'all 0.15s ease';
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      save(); render();
    }, 150);
  }
}

function clearDone() {
  tasks = tasks.filter(t => !t.complete);
  save(); render();
}

function getFiltered() {
  if (filter === 'active') return tasks.filter(t => !t.complete);
  if (filter === 'done') return tasks.filter(t => t.complete);
  return tasks;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function render() {
  const total = tasks.length;
  const done = tasks.filter(t => t.complete).length;
  const active = total - done;
  
  const percentage =
      total === 0 ? 0 :
      (done / total) * 100;

  document.querySelector(".progress-fill")
      .style.width = `${percentage}%`;

  document.getElementById("progress-text")
      .textContent =
      `${done} / ${total} completed`;

  statsRow.innerHTML = total === 0
    ? ''
    : `<span class="pill"><span class="pill-dot"></span>${active} remaining</span>` +
      (done > 0 ? `<span class="pill complete"><span class="pill-dot"></span>${done} done</span>` : '');

  const filtered = getFiltered();
  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <div class="empty-icon">◦</div>
      <p class="empty-text">${filter === 'done' ? 'Nothing completed yet' : filter === 'active' ? 'All caught up' : 'Nothing here yet'}</p>
    </div>`;
  } else {
    list.innerHTML = filtered.map(task => `
      <div class="task-item${task.complete ? ' done-item' : ''}" data-id="${task.id}">
        <button class="check-btn${task.complete ? ' checked' : ''}" data-action="toggle" aria-label="${task.complete ? 'Mark incomplete' : 'Mark complete'}">
          <svg class="check-icon" viewBox="0 0 10 8"><polyline points="1,4 4,7 9,1"/></svg>
        </button>
        <span class="task-name">${escHtml(task.name)}</span>
        <span class="task-meta">${formatTime(task.date)}</span>
        <button class="delete-btn" data-action="delete" aria-label="Delete task">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/>
          </svg>
        </button>
      </div>
    `).join('');
  }

  clearRow.style.display = done > 0 && filter !== 'active' ? 'flex' : 'none';

  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === filter);
  });
}

addBtn.addEventListener('click', addTask);
input.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
clearBtn.addEventListener('click', clearDone);

list.addEventListener('click', e => {
  const item = e.target.closest('[data-id]');
  if (!item) return;
  const id = Number(item.dataset.id);
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  if (btn.dataset.action === 'toggle') toggleTask(id);
  if (btn.dataset.action === 'delete') deleteTask(id);
});

document.querySelectorAll('.filter-btn').forEach(b => {
  b.addEventListener('click', () => { filter = b.dataset.filter; render(); });
});
load();
