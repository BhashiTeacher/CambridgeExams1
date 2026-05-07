document.addEventListener('DOMContentLoaded', () => {
  // Common State
  const currentPath = window.location.pathname;
  let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

  // --- INDEX.HTML LOGIC ---
  if (document.getElementById('login-form')) {
    const loginForm = document.getElementById('login-form');
    const welcomeScreen = document.getElementById('student-login');
    const examSelection = document.getElementById('exam-selection');
    const examsContainer = document.getElementById('exams-container');
    const btnLogout = document.getElementById('btn-logout');

    // Check if logged in
    if (currentUser) {
      welcomeScreen.style.display = 'none';
      examSelection.style.display = 'block';
      document.getElementById('student-greeting').textContent = `Available Exams for ${currentUser.name}`;
      loadExams();
    }

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('student-name').value.trim();
      const studentClass = document.getElementById('student-class').value.trim();
      
      if (name && studentClass) {
        currentUser = { name, class: studentClass };
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        welcomeScreen.style.display = 'none';
        examSelection.style.display = 'block';
        document.getElementById('student-greeting').textContent = `Available Exams for ${currentUser.name}`;
        loadExams();
      }
    });

    btnLogout.addEventListener('click', () => {
      sessionStorage.removeItem('currentUser');
      window.location.reload();
    });

    function loadExams() {
      // Get from local storage
      const storedExams = JSON.parse(localStorage.getItem('exams') || '[]');
      const publishedExams = storedExams.filter(e => e.published);

      examsContainer.innerHTML = '';

      if (publishedExams.length === 0) {
        examsContainer.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <h3>No exams available right now</h3>
            <p>Please check back later or contact your teacher.</p>
          </div>
        `;
        return;
      }

      publishedExams.forEach(exam => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="card-meta">
            <span class="badge badge-${exam.subject.toLowerCase()}">${exam.subject}</span>
            <span>⏱️ ${exam.duration} min</span>
          </div>
          <h3 class="card-title">${exam.title}</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">${exam.questions.length} questions</p>
          <button class="btn btn-primary" onclick="startExam('${exam.id}')">Start Exam</button>
        `;
        examsContainer.appendChild(card);
      });
    }
  }

  // --- TAKE-EXAM.HTML LOGIC ---
  if (document.getElementById('exam-form')) {
    if (!currentUser) {
      window.location.href = 'index.html'; // Redirect if not logged in
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('id');
    
    if (!examId) {
      alert("Invalid exam ID");
      window.location.href = 'index.html';
      return;
    }

    const storedExams = JSON.parse(localStorage.getItem('exams') || '[]');
    const exam = storedExams.find(e => e.id === examId);

    if (!exam) {
      alert("Exam not found or has been removed.");
      window.location.href = 'index.html';
      return;
    }

    // Set up exam
    document.getElementById('exam-title-display').textContent = exam.title;
    const subjectBadge = document.getElementById('exam-subject-display');
    subjectBadge.textContent = exam.subject;
    subjectBadge.className = `badge badge-${exam.subject.toLowerCase()}`;

    if (exam.subject === 'Listening' && exam.audioFile) {
      const audioContainer = document.getElementById('audio-container');
      const audioSource = document.getElementById('audio-source');
      const audioPlayer = document.getElementById('exam-audio-player');
      
      audioSource.src = `audio/${exam.audioFile}`;
      audioPlayer.load();
      audioContainer.style.display = 'block';
    }

    // Render questions
    const container = document.getElementById('questions-container');
    exam.questions.forEach((q, index) => {
      const qBlock = document.createElement('div');
      qBlock.className = 'question-card';
      
      let optionsHtml = '';
      q.options.forEach((opt, optIdx) => {
        const optId = `q${index}-opt${optIdx}`;
        optionsHtml += `
          <label class="option-label" for="${optId}">
            <input type="radio" name="question_${index}" id="${optId}" value="${optIdx}" class="option-input" required>
            <span>${opt}</span>
          </label>
        `;
      });

      qBlock.innerHTML = `
        <div class="question-text">${index + 1}. ${q.text}</div>
        <div class="options-grid">
          ${optionsHtml}
        </div>
      `;
      container.appendChild(qBlock);
    });

    // Update progress bar
    const inputs = container.querySelectorAll('input[type="radio"]');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        const answered = new Set([...container.querySelectorAll('input[type="radio"]:checked')].map(i => i.name)).size;
        const total = exam.questions.length;
        const pct = (answered / total) * 100;
        document.getElementById('progress-fill').style.width = `${pct}%`;
      });
    });

    // Timer logic
    let secondsLeft = exam.duration * 60;
    const timerDisplay = document.getElementById('time-left');
    
    const timerInterval = setInterval(() => {
      secondsLeft--;
      const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
      const s = (secondsLeft % 60).toString().padStart(2, '0');
      timerDisplay.textContent = `${m}:${s}`;

      if (secondsLeft <= 300) {
        document.getElementById('exam-timer').style.color = 'var(--danger)'; // red when < 5 mins
      }

      if (secondsLeft <= 0) {
        clearInterval(timerInterval);
        submitExam();
      }
    }, 1000);

    // Form submit
    document.getElementById('exam-form').addEventListener('submit', (e) => {
      e.preventDefault();
      clearInterval(timerInterval);
      submitExam();
    });

    function submitExam() {
      const formData = new FormData(document.getElementById('exam-form'));
      let correct = 0;
      const total = exam.questions.length;

      exam.questions.forEach((q, index) => {
        const selected = formData.get(`question_${index}`);
        if (selected !== null && parseInt(selected) === q.correctAnswer) {
          correct++;
        }
      });

      const pct = Math.round((correct / total) * 100);
      let grade = 'F';
      if (pct >= 90) grade = 'A*';
      else if (pct >= 80) grade = 'A';
      else if (pct >= 70) grade = 'B';
      else if (pct >= 60) grade = 'C';
      else if (pct >= 50) grade = 'D';

      const timeTaken = exam.duration * 60 - secondsLeft;
      const timeTakenStr = `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`;

      const result = {
        timestamp: new Date().toISOString(),
        studentName: currentUser.name,
        studentClass: currentUser.class,
        examTitle: exam.title,
        examSubject: exam.subject,
        timeTaken: timeTakenStr,
        correct,
        total,
        pct: `${pct}%`,
        grade
      };

      // Save locally
      const results = JSON.parse(localStorage.getItem('results') || '[]');
      results.push(result);
      localStorage.setItem('results', JSON.stringify(results));

      // Push to Google Sheets if configured
      const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
      if (settings.googleSheetsUrl) {
        fetch(settings.googleSheetsUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result)
        }).catch(err => console.error('Error logging to Google Sheets:', err));
      }

      // Show modal
      document.getElementById('score-display').textContent = `${correct}/${total}`;
      document.getElementById('result-modal').classList.add('active');
    }
  }
});

// Global function for onclick
window.startExam = function(id) {
  window.location.href = `take-exam.html?id=${id}`;
};
