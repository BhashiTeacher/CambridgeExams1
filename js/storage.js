// storage.js — All localStorage read/write in one place.
// Every page imports this before doing anything with exam data.

const Storage = {

  // ── EXAMS ──────────────────────────────────────────────────
  getExams() {
    try { return JSON.parse(localStorage.getItem('cms_exams') || '[]'); }
    catch { return []; }
  },

  saveExams(exams) {
    localStorage.setItem('cms_exams', JSON.stringify(exams));
  },

  getExam(id) {
    return this.getExams().find(e => e.id === id) || null;
  },

  saveExam(exam) {
    const exams = this.getExams();
    const idx = exams.findIndex(e => e.id === exam.id);
    if (idx >= 0) exams[idx] = exam;
    else exams.push(exam);
    this.saveExams(exams);
  },

  deleteExam(id) {
    this.saveExams(this.getExams().filter(e => e.id !== id));
  },

  newExamId() {
    return 'exam_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
  },

  // ── RESULTS ────────────────────────────────────────────────
  getResults() {
    try { return JSON.parse(localStorage.getItem('cms_results') || '[]'); }
    catch { return []; }
  },

  saveResult(result) {
    const results = this.getResults();
    results.push({ id: 'r_' + Date.now(), timestamp: new Date().toISOString(), ...result });
    // Keep last 500
    if (results.length > 500) results.splice(0, results.length - 500);
    localStorage.setItem('cms_results', JSON.stringify(results));
  },

  clearResults() {
    localStorage.removeItem('cms_results');
  },

  // ── SETTINGS ───────────────────────────────────────────────
  getSettings() {
    try { return JSON.parse(localStorage.getItem('cms_settings') || '{}'); }
    catch { return {}; }
  },

  saveSetting(key, value) {
    const s = this.getSettings();
    s[key] = value;
    localStorage.setItem('cms_settings', JSON.stringify(s));
  },

  getSetting(key, def = '') {
    return this.getSettings()[key] ?? def;
  },

  // ── EXPORT / IMPORT ────────────────────────────────────────
  exportAll() {
    return JSON.stringify({
      exams: this.getExams(),
      results: this.getResults(),
      exported: new Date().toISOString()
    }, null, 2);
  },

  importAll(jsonStr) {
    const data = JSON.parse(jsonStr);
    if (data.exams) this.saveExams(data.exams);
    return data;
  }
};
