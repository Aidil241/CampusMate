/**
 * fab.js
 * Tombol aksi mengambang (Floating Action Button), aksinya berbeda
 * tergantung halaman aktif — dan tersembunyi di halaman yang tidak butuh.
 */
import { state } from '../core/state.js';
import { navigate } from '../core/router.js';
import { ICON } from '../utils/icons.js';
import { openCourseForm } from '../pages/courses.js';
import { openNoteForm } from '../pages/notes.js';
import { openGradeForm } from '../pages/grades.js';

const FAB_ACTIONS = {
  home: () => (typeof window.openTaskForm === 'function' ? window.openTaskForm() : navigate('tasks')),
  tasks: () => window.openTaskForm(),
  schedule: () => window.openScheduleForm(), 
  courses: () => openCourseForm(),
  notes: () => openNoteForm(),
  grades: () => openGradeForm(),
  exams: () => window.openExamForm(),
};

export function renderFab() {
  const fab = document.getElementById('fabBtn');
  const action = FAB_ACTIONS[state.route];
  if (action) {
    fab.classList.remove('hidden');
    fab.innerHTML = ICON.plus;
    fab.onclick = action;
  } else {
    fab.classList.add('hidden');
  }
}