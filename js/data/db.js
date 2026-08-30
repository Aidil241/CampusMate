/**
 * db.js
 * Storage layer aplikasi. Semua akses localStorage HARUS lewat modul ini,
 * jangan panggil localStorage langsung dari file lain — supaya kalau nanti
 * mau ganti ke IndexedDB/API, cukup ubah di satu tempat.
 */

/** Generate id unik sederhana, contoh: "id-lz3f9k-a1b2c3d" */
export function uid() {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

const KEYS = {
  courses: 'cm_courses',
  tasks: 'cm_tasks',
  notes: 'cm_notes',
  grades: 'cm_grades',
  schedules: 'cm_schedules',
  settings: 'cm_settings',
  seeded: 'cm_seeded'
};

function get(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}

function set(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export const DB = {
  KEYS,
  get,
  set,

  courses: {
    all() { return get(KEYS.courses); },
    find(id) { return DB.courses.all().find(c => c.id === id); },
    save(item) {
      const list = DB.courses.all();
      if (item.id) {
        const i = list.findIndex(c => c.id === item.id);
        list[i] = item;
      } else {
        item.id = uid();
        list.unshift(item);
      }
      DB.set(KEYS.courses, list);
      return item;
    },
    /** Hapus mata kuliah beserta seluruh data turunannya (tugas, catatan, nilai, jadwal). */
    remove(id) {
      DB.set(KEYS.courses, DB.courses.all().filter(c => c.id !== id));
      DB.set(KEYS.tasks, DB.tasks.all().filter(t => t.course_id !== id));
      DB.set(KEYS.notes, DB.notes.all().filter(n => n.course_id !== id));
      DB.set(KEYS.grades, DB.grades.all().filter(g => g.course_id !== id));
      DB.set(KEYS.schedules, DB.schedules.all().filter(s => s.course_id !== id));
    }
  },

  tasks: {
    all() { return get(KEYS.tasks); },
    find(id) { return DB.tasks.all().find(t => t.id === id); },
    save(item) {
      const list = DB.tasks.all();
      if (item.id) {
        const i = list.findIndex(t => t.id === item.id);
        list[i] = item;
      } else {
        item.id = uid();
        item.created_at = new Date().toISOString();
        list.unshift(item);
      }
      DB.set(KEYS.tasks, list);
      return item;
    },
    remove(id) { DB.set(KEYS.tasks, DB.tasks.all().filter(t => t.id !== id)); }
  },

  notes: {
    all() { return get(KEYS.notes); },
    find(id) { return DB.notes.all().find(n => n.id === id); },
    save(item) {
      const list = DB.notes.all();
      const now = new Date().toISOString();
      if (item.id) {
        const i = list.findIndex(n => n.id === item.id);
        item.updated_at = now;
        list[i] = item;
      } else {
        item.id = uid();
        item.created_at = now;
        item.updated_at = now;
        list.unshift(item);
      }
      DB.set(KEYS.notes, list);
      return item;
    },
    remove(id) { DB.set(KEYS.notes, DB.notes.all().filter(n => n.id !== id)); }
  },

  grades: {
    all() { return get(KEYS.grades); },
    find(id) { return DB.grades.all().find(g => g.id === id); },
    save(item) {
      const list = DB.grades.all();
      if (item.id) {
        const i = list.findIndex(g => g.id === item.id);
        list[i] = item;
      } else {
        item.id = uid();
        list.unshift(item);
      }
      DB.set(KEYS.grades, list);
      return item;
    },
    remove(id) { DB.set(KEYS.grades, DB.grades.all().filter(g => g.id !== id)); }
  },

  schedules: {
    all() { return get(KEYS.schedules); },
    find(id) { return DB.schedules.all().find(s => s.id === id); },
    save(item) {
      const list = DB.schedules.all();
      if (item.id) {
        const i = list.findIndex(s => s.id === item.id);
        list[i] = item;
      } else {
        item.id = uid();
        list.unshift(item);
      }
      DB.set(KEYS.schedules, list);
      return item;
    },
    remove(id) { DB.set(KEYS.schedules, DB.schedules.all().filter(s => s.id !== id)); }
  },

  settings: {
    get() {
      return Object.assign({ dark: false, name: 'Mahasiswa' }, JSON.parse(localStorage.getItem(KEYS.settings) || '{}'));
    },
    save(s) { localStorage.setItem(KEYS.settings, JSON.stringify(s)); }
  }
};
