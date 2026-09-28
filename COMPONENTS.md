# CampusMate Component Library: Global M3 Overlay & Picker Standard

## Overview & Policy

**Standard Name**: Global CampusMate M3 Overlay & Picker Standard  
**Module Path**: [`www/js/ui/picker.js`](file:///d:/t99/campusmate-android/www/js/ui/picker.js)  
**Applicability**: **Mandatory** across all existing and future CampusMate modules (`Courses`, `Tasks`, `Schedule`, `Grades`, `Exams`, `Notes`, `Pomodoro`, `Settings`, `Stats`).

To maintain the calm, disciplined academic precision of **"The Focused Scholar"** and adhere to Android Material Design 3 / Material You principles, all overlay, picker, and confirmation interactions must use this shared component system.

### Mandatory Rules:
1. **Touch Ergonomics Floor**: Every interactive control, trigger card, day cell, time preset, and button must satisfy a minimum **48×48dp** touch target.
2. **Tonal Surface Hierarchy**: Depth is communicated via Material 3 tonal containers (`bg-base-100 dark:bg-slate-900/60` and crisp hairline borders `border-base-200 dark:border-slate-800`). Arbitrary floating shadows (`shadow-sm`, `shadow-md`) are forbidden.
3. **Zero Native Form Dialogs**: Never invoke native HTML `<select>` dropdowns, native `<input type="datetime-local">`, `<input type="date">`, or `<input type="time">` browser/system wheels.
4. **Zero Platform Alert/Confirm**: Never use `window.alert()` or `window.confirm()`. All confirmations and notices must use M3 in-sheet subviews or toasts.
5. **Zero Raw Emojis**: Never render platform emojis (`📅`, `🗑️`, `⚠️`, `🏆`). All glyphs must use standardized SVG strings from [`www/js/utils/icons.js`](file:///d:/t99/campusmate-android/www/js/utils/icons.js).
6. **Preserve User Work & Safety**: Delete confirmation must render as a toggleable sub-view inside the existing bottom sheet. Tapping "Batal" must restore the active form with all unsaved user inputs intact without re-initializing or resetting state.
7. **Strict Serialization Contracts**: Pickers must maintain exact database-compatible value representations (e.g. `YYYY-MM-DDTHH:mm` for timestamps, UUID strings for courses).

---

## Component Catalog & API Reference

### 1. Course Picker (`renderCourseTrigger` & `openCoursePicker`)

Provides an Android-first Material 3 course selection experience showing course title, credit weight (SKS), and lecturer name.

#### Trigger Card
```javascript
import { renderCourseTrigger, updateCourseTriggerUI, openCoursePicker } from '../ui/picker.js';

// In Form HTML:
${renderCourseTrigger({
  id: 'trigger_ex_course',
  courseId: selectedCourseId,
  label: 'Mata Kuliah',
  required: false,
  placeholder: 'Pilih Mata Kuliah...'
})}
```

#### Event Wiring
```javascript
const courseBtn = document.getElementById('trigger_ex_course');
if (courseBtn) {
  courseBtn.onclick = () => {
    openCoursePicker({
      containerId: 'form_sub_sheet',
      mainViewId: 'form_main_view',
      currentVal: selectedCourseId,
      allowEmpty: true,
      emptyLabel: 'Tanpa Mata Kuliah',
      onSelect: (courseId) => {
        selectedCourseId = courseId;
        updateCourseTriggerUI('trigger_ex_course', courseId);
      },
      onBack: () => {
        // Optional return hook
      }
    });
  };
}
```

---

### 2. Date & Time Picker (`renderDateTimeTrigger` & `openDateTimePicker`)

Provides a unified Material 3 calendar and time picker sheet tailored for university schedules and exam deadlines. Replaces native `<input type="datetime-local">`.

#### Value Contract
Returns exact ISO / local datetime string: `YYYY-MM-DDTHH:mm` (e.g., `2026-10-15T09:30`).

#### Features:
- **Segmented Tab Switcher**: Seamless switching between `[ Tanggal ]` and `[ Waktu ]`.
- **Indonesian Calendar Grid**: Month navigation, localized day-of-week headers (`Sen`, `Sel`, `Rab`, `Kam`, `Jum`, `Sab`, `Min`), active selection ring, and today indicator.
- **Quick Date Chips**: `[ Hari Ini ]`, `[ Besok ]`, `[ +7 Hari ]`, `[ +14 Hari ]`.
- **Academic Time Presets**: One-tap standard university lecture slots (`07:30`, `08:00`, `09:40`, `10:30`, `13:00`, `15:30`).
- **Hour & Minute Grid**: Ergonomic 48dp selection for 24-hour time.

#### Usage Example:
```javascript
import { renderDateTimeTrigger, updateDateTimeTriggerUI, openDateTimePicker } from '../ui/picker.js';

// In Form HTML:
${renderDateTimeTrigger({
  id: 'trigger_ex_datetime',
  value: selectedExamDate,
  label: 'Tanggal & Waktu Ujian',
  required: true,
  placeholder: 'Pilih Tanggal & Waktu...'
})}

// In Event Wiring:
const dtBtn = document.getElementById('trigger_ex_datetime');
if (dtBtn) {
  dtBtn.onclick = () => {
    openDateTimePicker({
      containerId: 'form_sub_sheet',
      mainViewId: 'form_main_view',
      currentVal: selectedExamDate,
      onSelect: (dtStr) => {
        selectedExamDate = dtStr; // '2026-10-15T09:30'
        updateDateTimeTriggerUI('trigger_ex_datetime', dtStr);
      }
    });
  };
}
```

---

### 3. Selection Sheet (`openSelectionSubSheet`)

Generic, multi-purpose Material 3 selection sheet for options such as categories, task priority, days of week, or semester filter.

```javascript
import { openSelectionSubSheet } from '../ui/picker.js';

openSelectionSubSheet({
  containerId: 'form_sub_sheet',
  mainViewId: 'form_main_view',
  title: 'Pilih Hari Kuliah',
  subtitle: 'Tentukan hari perkuliahan rutin setiap minggu',
  currentVal: selectedDay,
  options: [
    { id: 'Senin', label: 'Senin', desc: 'Hari Perkuliahan', icon: ICON.calendar },
    { id: 'Selasa', label: 'Selasa', desc: 'Hari Perkuliahan', icon: ICON.calendar },
    // ...
  ],
  onSelect: (value, item) => {
    selectedDay = value;
    updateDayUI(value);
  }
});
```

---

### 4. Delete Confirmation Sheet (`openDeleteConfirmation`)

Replaces destructive immediate deletion and modal wipeouts with a safe, reversible 2-step in-sheet confirmation sub-view.

#### Behavior:
- Main form inputs remain rendered in `#form_main_view` (hidden via `hidden` class).
- Sub-sheet `#form_sub_sheet` renders danger badge, item summary card, warning copy, and action buttons.
- Tapping **Batal**: Hides sub-view, reveals main form. All user edits are 100% intact.
- Tapping **Ya, Hapus**: Shows inline loading spinner, executes async callback, handles errors inline, and dismisses sheet upon success.

#### Usage Example:
```javascript
import { openDeleteConfirmation } from '../ui/picker.js';

openDeleteConfirmation({
  containerId: 'form_sub_sheet',
  mainViewId: 'form_main_view',
  title: 'Hapus Jadwal Ujian Ini?',
  entityName: 'Jadwal Ujian',
  entityDetailsHtml: `
    <div class="text-xs font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-0.5">Informasi Ujian</div>
    <div class="font-display font-bold text-sm text-base-content dark:text-slate-100">${esc(exam.title)}</div>
    <div class="text-xs text-base-content/80 dark:text-slate-300 mt-1">
      ${esc(course.name)} · ${formatExamDate(exam.exam_date)}
    </div>
  `,
  warningText: 'Tindakan ini permanen. Jadwal ujian akan dihapus dari daftar kalender dan tidak dapat dikembalikan.',
  onCancel: () => {
    // Optional: reset sheet title
  },
  onConfirm: async () => {
    const { error } = await supabase.from('exams').delete().eq('id', exam.id);
    if (error) throw error;
    closeSheet();
    showToast('Jadwal ujian berhasil dihapus');
    fetchData();
  }
});
```

---

## Host Shell Layout Standard

CampusMate uses a single-page responsive container shell inside [`www/index.html`](file:///d:/t99/campusmate-android/www/index.html):
- **Top Bar Shell** (`#topbar`): Managed by `topbar.js`. Renders page title, subtitle, and dark mode toggle. **Pages must never render their own duplicated topbar title**.
- **Bottom Navigation Shell** (`#bottomnav`): Managed by `bottomnav.js`. Exactly **one** bottom navigation bar exists across the entire app. **Pages must never render local bottom navigation bars**.
- **Page Main Content** (`#page`): Rendered per active route. Section headings inside `#page` must use distinct section titles (e.g., `Agenda Ujian`, `Semester Aktif`) rather than repeating the shell topbar title.
