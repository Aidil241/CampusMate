/**
 * app-namespace.js
 * `App` adalah satu-satunya objek yang diekspos ke window, karena template
 * HTML memakai inline handler seperti onclick="App.navigate('tasks')".
 * Modul lain (pages/*, ui/*) menambahkan method ke objek ini masing-masing,
 * sehingga tidak ada satupun modul yang perlu tahu isi lengkap App.
 */
export const App = {};
window.App = App;
