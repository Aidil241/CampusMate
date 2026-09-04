/**
 * utils/reminder.js
 * Sistem Pengingat (Reminder) menggunakan Web Notification API & Supabase.
 */
import { supabase } from '../data/supabase.js';

// Menyimpan ID yang sudah dinotifikasi agar tidak spam berkali-kali
const notifiedItems = new Set();

function getTodayName() {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[new Date().getDay()];
}

export const ReminderSys = {
  init() {
    // Hanya jalan jika fitur diaktifkan dari pengaturan & browser mengizinkan
    if (localStorage.getItem('app_reminder') === '1' && 'Notification' in window && Notification.permission === 'granted') {
      this.check(); // Cek pertama kali saat aplikasi dibuka
      
      // Cek berkala setiap 5 menit (300.000 ms)
      setInterval(() => this.check(), 300000);
    }
  },

  async check() {
    try {
      const now = new Date();
      const today = getTodayName();

      // 1. Cek Jadwal Kuliah (30 Menit Sebelum Mulai)
      const { data: schedules } = await supabase.from('schedules').select('id, course_id, start_time, room').eq('day', today);
      if (schedules && schedules.length > 0) {
        const { data: courses } = await supabase.from('courses').select('id, name');
        schedules.forEach(sch => {
          const [hours, minutes] = sch.start_time.split(':');
          const classTime = new Date();
          classTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          const diffMinutes = (classTime - now) / (1000 * 60);
          
          // Jika kelas mulai dalam 1-30 menit dan belum dinotif hari ini
          if (diffMinutes > 0 && diffMinutes <= 30 && !notifiedItems.has('sch_' + sch.id)) {
            const c = courses.find(c => c.id === sch.course_id);
            this.pushNotify('Kelas Segera Mulai! 📚', `Matkul ${c ? c.name : ''} di ruangan ${sch.room || '-'} mulai pukul ${sch.start_time}.`);
            notifiedItems.add('sch_' + sch.id);
          }
        });
      }

      // 2. Cek Tugas (Deadline kurang dari 24 Jam)
      const { data: tasks } = await supabase.from('tasks').select('id, title, deadline').eq('status', 'Belum dikerjakan');
      if (tasks && tasks.length > 0) {
        tasks.forEach(t => {
          if (!t.deadline) return;
          const dlDate = new Date(t.deadline);
          const diffHours = (dlDate - now) / (1000 * 60 * 60);
          
          if (diffHours > 0 && diffHours <= 24 && !notifiedItems.has('tsk_' + t.id)) {
            this.pushNotify('Deadline Tugas Terdekat! ⚠️', `Tugas "${t.title}" harus dikumpulkan besok atau hari ini!`);
            notifiedItems.add('tsk_' + t.id);
          }
        });
      }
    } catch (err) {
      console.error('Reminder error:', err);
    }
  },

  pushNotify(title, body) {
    new Notification(title, { body });
  }
};