// FILE: js/storage.js
// All localStorage read/write in one place.
// Every page imports this before doing anything with exam data.

const Storage = {

  // ── MIGRATION ──────────────────────────────────────────────
  _migrate() {
    if (localStorage.getItem('bhashi_migrated')) return;
    const old = { cms_exams: 'bhashi_exams', cms_results: 'bhashi_results', cms_settings: 'bhashi_settings' };
    Object.entries(old).forEach(([oldKey, newKey]) => {
      const v = localStorage.getItem(oldKey);
      if (v && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, v);
      }
    });
    localStorage.setItem('bhashi_migrated', '1');
  },

  // ── EXAMS ──────────────────────────────────────────────────
  getExams() {
    this._migrate();
    try { return JSON.parse(localStorage.getItem('bhashi_exams') || '[]'); }
    catch { return []; }
  },

  saveExams(exams) {
    localStorage.setItem('bhashi_exams', JSON.stringify(exams));
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
    return 'exam_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  },

  // ── RESULTS ────────────────────────────────────────────────
  getResults() {
    this._migrate();
    try { return JSON.parse(localStorage.getItem('bhashi_results') || '[]'); }
    catch { return []; }
  },

  saveResult(result) {
    const results = this.getResults();
    results.push({ id: 'r_' + Date.now(), timestamp: new Date().toISOString(), ...result });
    if (results.length > 500) results.splice(0, results.length - 500);
    localStorage.setItem('bhashi_results', JSON.stringify(results));
  },

  clearResults() {
    localStorage.removeItem('bhashi_results');
  },

  // ── SETTINGS ───────────────────────────────────────────────
  getSettings() {
    this._migrate();
    try { return JSON.parse(localStorage.getItem('bhashi_settings') || '{}'); }
    catch { return {}; }
  },

  saveSetting(key, value) {
    const s = this.getSettings();
    s[key] = value;
    localStorage.setItem('bhashi_settings', JSON.stringify(s));
  },

  getSetting(key, def = '') {
    return this.getSettings()[key] ?? def;
  },

  // ── API KEY ─────────────────────────────────────────────────
  getApiKey() {
    return localStorage.getItem('bhashi_api_key') || this.getSetting('apiKey') || '';
  },

  saveApiKey(key) {
    localStorage.setItem('bhashi_api_key', key);
    this.saveSetting('apiKey', key);
  },

  // ── SUBJECTS ───────────────────────────────────────────────
  getSubjects() {
    try { return JSON.parse(localStorage.getItem('bhashi_subjects') || '[]'); }
    catch { return []; }
  },

  saveSubjects(list) {
    localStorage.setItem('bhashi_subjects', JSON.stringify(list));
  },

  addSubject(name) {
    const list = this.getSubjects();
    if (!list.find(s => s.name === name)) {
      list.push({ name, topics: [] });
      this.saveSubjects(list);
    }
  },

  deleteSubject(name) {
    this.saveSubjects(this.getSubjects().filter(s => s.name !== name));
  },

  addTopic(subjectName, topic) {
    const list = this.getSubjects();
    const s = list.find(s => s.name === subjectName);
    if (s && !s.topics.includes(topic)) {
      s.topics.push(topic);
      this.saveSubjects(list);
    }
  },

  deleteTopic(subjectName, topic) {
    const list = this.getSubjects();
    const s = list.find(s => s.name === subjectName);
    if (s) {
      s.topics = s.topics.filter(t => t !== topic);
      this.saveSubjects(list);
    }
  },

  // ── THEORY ─────────────────────────────────────────────────
  getTheory() {
    try { return JSON.parse(localStorage.getItem('bhashi_theory') || '[]'); }
    catch { return []; }
  },

  saveTheoryEntry(entry) {
    const list = this.getTheory();
    const idx = list.findIndex(t => t.id === entry.id);
    if (idx >= 0) list[idx] = entry;
    else list.push(entry);
    localStorage.setItem('bhashi_theory', JSON.stringify(list));
  },

  deleteTheoryEntry(id) {
    const list = this.getTheory().filter(t => t.id !== id);
    localStorage.setItem('bhashi_theory', JSON.stringify(list));
  },

  // ── EXPORT / IMPORT ────────────────────────────────────────
  exportAll() {
    return JSON.stringify({
      exams:    this.getExams(),
      results:  this.getResults(),
      subjects: this.getSubjects(),
      theory:   this.getTheory(),
      exported: new Date().toISOString()
    }, null, 2);
  },

  importAll(jsonStr) {
    const data = JSON.parse(jsonStr);
    if (data.exams)    this.saveExams(data.exams);
    if (data.subjects) this.saveSubjects(data.subjects);
    if (data.theory)   localStorage.setItem('bhashi_theory', JSON.stringify(data.theory));
    return data;
  },

  // ── FACTORY RESET ──────────────────────────────────────────
  factoryReset() {
    ['bhashi_exams', 'bhashi_results', 'bhashi_settings', 'bhashi_subjects',
     'bhashi_theory', 'bhashi_api_key', 'bhashi_migrated'].forEach(k => localStorage.removeItem(k));
  }
};
