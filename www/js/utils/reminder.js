/**
 * utils/reminder.js
 * Sistem Pengingat & Notifikasi Android Asli (Native System Notification)
 * Menggunakan @capacitor/local-notifications dengan fallback browser.
 * CampusMate v1.1.0
 */
import { supabase } from '../data/supabase.js';

const CHANNEL_ID = 'academic_reminders';
let isListenerAttached = false;

// Helper mendapatkan plugin Capacitor LocalNotifications
function getPlugin() {
  if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins) {
    return window.Capacitor.Plugins.LocalNotifications || null;
  }
  return null;
}

// Menghasilkan ID integer 32-bit deterministik dari ID string (Task/Exam UUID)
// Range aman integer Android: 1 .. 2,147,483,647
export function getNotificationId(entityId, typeOffset = 1) {
  let hash = 5381;
  const str = String(entityId || '');
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 40000000) * 10 + typeOffset;
}

export const ReminderSys = {
  // Cek apakah plugin didukung
  isNative() {
    const plugin = getPlugin();
    return !!plugin;
  },

  // Inisialisasi pada saat aplikasi dibuka (startup)
  // CATATAN PENTING: Jangan langsung meminta permission di startup!
  async init() {
    try {
      const isEnabled = localStorage.getItem('app_reminder') === '1';
      if (!isEnabled) return;

      const hasPerm = await this.checkPermission();
      if (hasPerm) {
        await this.ensureChannel();
        this.setupTapListener();
        // Sinkronisasi jadwal secara silent di latar belakang
        this.syncAll().catch(err => console.warn('[ReminderSys] Sync error:', err));
      }
    } catch (err) {
      console.warn('[ReminderSys] Init error:', err);
    }
  },

  // Cek status izin tanpa memunculkan prompt dialog
  async checkPermission() {
    const plugin = getPlugin();
    if (plugin && plugin.checkPermissions) {
      try {
        const res = await plugin.checkPermissions();
        return res && res.display === 'granted';
      } catch (e) {
        return false;
      }
    }
    // Web fallback
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  },

  // Minta izin notifikasi (Android 13+ POST_NOTIFICATIONS)
  // HANYA dipanggil saat user mengaktifkan toggle di pengaturan
  async requestPermission() {
    const plugin = getPlugin();
    if (plugin && plugin.requestPermissions) {
      try {
        const res = await plugin.requestPermissions();
        return res && res.display === 'granted';
      } catch (e) {
        console.error('[ReminderSys] Gagal meminta permission native:', e);
        return false;
      }
    }
    // Web fallback
    if (typeof Notification !== 'undefined') {
      const res = await Notification.requestPermission();
      return res === 'granted';
    }
    return false;
  },

  // Pastikan Android 8+ Notification Channel terdaftar
  async ensureChannel() {
    const plugin = getPlugin();
    if (plugin && plugin.createChannel) {
      try {
        await plugin.createChannel({
          id: CHANNEL_ID,
          name: 'Pengingat Akademik',
          description: 'Notifikasi pengingat tenggat tugas dan jadwal ujian CampusMate',
          importance: 4, // IMPORTANCE_HIGH (suara + heads-up banner)
          visibility: 1, // VISIBILITY_PUBLIC
          sound: null, // default system notification sound
          vibration: true,
          lights: true,
          lightColor: '#4F46E5'
        });
      } catch (e) {
        console.warn('[ReminderSys] CreateChannel warning:', e);
      }
    }
  },

  // Pasang listener tap notifikasi agar routing ke halaman terkait
  setupTapListener() {
    if (isListenerAttached) return;
    const plugin = getPlugin();
    if (plugin && plugin.addListener) {
      try {
        plugin.addListener('localNotificationActionPerformed', (notificationAction) => {
          const extra = notificationAction?.notification?.extra;
          if (extra && extra.route && window.App && typeof window.App.navigate === 'function') {
            window.App.navigate(extra.route);
          }
        });
        isListenerAttached = true;
      } catch (e) {
        console.warn('[ReminderSys] Gagal memasang listener tap:', e);
      }
    }
  },

  // Jadwalkan notifikasi untuk tugas dengan deadline
  async scheduleTaskReminder(task) {
    if (!task || !task.id || !task.deadline || task.status === 'Selesai') {
      if (task && task.id) {
        await this.cancelTaskReminder(task.id);
      }
      return;
    }

    const isEnabled = localStorage.getItem('app_reminder') === '1';
    if (!isEnabled) return;

    const hasPerm = await this.checkPermission();
    if (!hasPerm) return;

    // Bersihkan jadwal lama terlebih dahulu agar tidak duplikat
    await this.cancelTaskReminder(task.id);

    const dlStr = String(task.deadline).trim();
    // Parse tanggal deadline (format YYYY-MM-DD atau ISO)
    const dlParts = dlStr.slice(0, 10).split('-').map(Number);
    if (dlParts.length < 3 || isNaN(dlParts[0])) return;

    const now = new Date();
    const notifications = [];

    // 1. Notifikasi H-1 Pukul 08:00 WIB
    const hMinus1 = new Date(dlParts[0], dlParts[1] - 1, dlParts[2] - 1, 8, 0, 0);
    if (hMinus1 > now) {
      notifications.push({
        id: getNotificationId(task.id, 1),
        title: 'Tenggat Tugas Besok ⚠️',
        body: `Tugas "${task.title}" harus dikumpulkan besok. Selesaikan tepat waktu!`,
        schedule: { at: hMinus1 },
        channelId: CHANNEL_ID,
        extra: { route: 'tasks', id: task.id }
      });
    }

    // 2. Notifikasi Hari-H Pukul 07:00 WIB
    const hariH = new Date(dlParts[0], dlParts[1] - 1, dlParts[2], 7, 0, 0);
    if (hariH > now) {
      notifications.push({
        id: getNotificationId(task.id, 2),
        title: 'Tenggat Tugas Hari Ini ⚠️',
        body: `Tugas "${task.title}" memiliki tenggat hari ini. Periksa dan kumpulkan!`,
        schedule: { at: hariH },
        channelId: CHANNEL_ID,
        extra: { route: 'tasks', id: task.id }
      });
    }

    if (notifications.length > 0) {
      const plugin = getPlugin();
      if (plugin && plugin.schedule) {
        try {
          await plugin.schedule({ notifications });
        } catch (e) {
          console.warn('[ReminderSys] Gagal menjadwalkan notifikasi tugas:', e);
        }
      }
    }
  },

  // Batalkan notifikasi untuk suatu tugas
  async cancelTaskReminder(taskId) {
    if (!taskId) return;
    const plugin = getPlugin();
    if (plugin && plugin.cancel) {
      try {
        await plugin.cancel({
          notifications: [
            { id: getNotificationId(taskId, 1) },
            { id: getNotificationId(taskId, 2) }
          ]
        });
      } catch (e) {
        // Abaikan error jika notifikasi memang belum pernah dijadwalkan
      }
    }
  },

  // Jadwalkan notifikasi untuk ujian
  async scheduleExamReminder(exam, courseName = '') {
    if (!exam || !exam.id || !exam.exam_date) {
      if (exam && exam.id) {
        await this.cancelExamReminder(exam.id);
      }
      return;
    }

    const isEnabled = localStorage.getItem('app_reminder') === '1';
    if (!isEnabled) return;

    const hasPerm = await this.checkPermission();
    if (!hasPerm) return;

    // Bersihkan jadwal lama terlebih dahulu agar tidak duplikat
    await this.cancelExamReminder(exam.id);

    const examDate = new Date(exam.exam_date);
    if (isNaN(examDate.getTime())) return;

    const now = new Date();
    const notifications = [];

    const labelMatkul = courseName || 'Mata Kuliah';
    const timeFormatted = examDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const roomInfo = exam.room ? ` di ruangan ${exam.room}` : '';

    // 1. Notifikasi H-1 Ujian Pukul 08:00 WIB
    const hMinus1 = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate() - 1, 8, 0, 0);
    if (hMinus1 > now) {
      notifications.push({
        id: getNotificationId(exam.id, 3),
        title: 'Jadwal Ujian Besok 📝',
        body: `Ujian ${labelMatkul} besok pukul ${timeFormatted}${roomInfo}. Siapkan perlengkapanmu!`,
        schedule: { at: hMinus1 },
        channelId: CHANNEL_ID,
        extra: { route: 'exams', id: exam.id }
      });
    }

    // 2. Notifikasi 1 Jam Sebelum Ujian
    const oneHourBefore = new Date(examDate.getTime() - 60 * 60 * 1000);
    if (oneHourBefore > now) {
      notifications.push({
        id: getNotificationId(exam.id, 4),
        title: 'Ujian Segera Dimulai ⏳',
        body: `Ujian ${labelMatkul}${roomInfo} mulai 1 jam lagi (${timeFormatted}). Semoga sukses!`,
        schedule: { at: oneHourBefore },
        channelId: CHANNEL_ID,
        extra: { route: 'exams', id: exam.id }
      });
    }

    if (notifications.length > 0) {
      const plugin = getPlugin();
      if (plugin && plugin.schedule) {
        try {
          await plugin.schedule({ notifications });
        } catch (e) {
          console.warn('[ReminderSys] Gagal menjadwalkan notifikasi ujian:', e);
        }
      }
    }
  },

  // Batalkan notifikasi untuk suatu ujian
  async cancelExamReminder(examId) {
    if (!examId) return;
    const plugin = getPlugin();
    if (plugin && plugin.cancel) {
      try {
        await plugin.cancel({
          notifications: [
            { id: getNotificationId(examId, 3) },
            { id: getNotificationId(examId, 4) }
          ]
        });
      } catch (e) {
        // Abaikan error jika notifikasi memang belum pernah dijadwalkan
      }
    }
  },

  // Sinkronisasi penuh semua tugas & ujian aktif
  async syncAll() {
    const isEnabled = localStorage.getItem('app_reminder') === '1';
    if (!isEnabled) return;

    const hasPerm = await this.checkPermission();
    if (!hasPerm) return;

    await this.ensureChannel();
    this.setupTapListener();

    try {
      // Ambil data tugas aktif, ujian mendatang, dan referensi mata kuliah
      const [tasksRes, examsRes, coursesRes] = await Promise.all([
        supabase.from('tasks').select('id, title, deadline, status').eq('status', 'Belum dikerjakan'),
        supabase.from('exams').select('id, course_id, exam_date, room'),
        supabase.from('courses').select('id, name')
      ]);

      const coursesMap = new Map();
      if (coursesRes.data) {
        coursesRes.data.forEach(c => coursesMap.set(c.id, c.name));
      }

      // Jadwalkan tugas aktif
      if (tasksRes.data) {
        for (const task of tasksRes.data) {
          await this.scheduleTaskReminder(task);
        }
      }

      // Jadwalkan ujian mendatang
      if (examsRes.data) {
        for (const exam of examsRes.data) {
          const courseName = coursesMap.get(exam.course_id) || '';
          await this.scheduleExamReminder(exam, courseName);
        }
      }
    } catch (err) {
      console.warn('[ReminderSys] SyncAll error:', err);
    }
  },

  // Batalkan seluruh notifikasi terjadwal saat fitur dimatikan
  async cancelAll() {
    const plugin = getPlugin();
    if (plugin && plugin.getPending && plugin.cancel) {
      try {
        const pending = await plugin.getPending();
        if (pending && pending.notifications && pending.notifications.length > 0) {
          await plugin.cancel({
            notifications: pending.notifications.map(n => ({ id: n.id }))
          });
        }
      } catch (e) {
        console.warn('[ReminderSys] CancelAll warning:', e);
      }
    }
  }
};