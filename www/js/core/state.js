/**
 * state.js
 * Satu objek state global yang sederhana (bukan Redux/store reaktif).
 * Semua page membaca/menulis field yang relevan langsung dari sini.
 */
import { todayDayName } from '../utils/date.js';

export const state = {
  route: 'home',
  taskFilterStatus: 'Semua',
  schedDay: todayDayName(),
  courseDetail: null
};
