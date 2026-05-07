document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  
  // -- DASHBOARD LOGIC --
  if (document.getElementById('exams-table')) {
    loadExamsList();

    function loadExamsList() {
      const exams = JSON.parse(localStorage.getItem('exams') || '[]');
      const tbody = document.getElementById('exams-list');
      tbody.innerHTML = '';

      if (exams.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No exams created yet.</td></tr>';
        return;
      }

      exams.forEach(exam => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><span class="badge ${exam.published ? 'badge-grammar' : 'badge-listening'}">${exam.published ? 'Published' : 'Draft'}</span></td>
          <td style="font-weight: 600;">${exam.title}</td>
          <td>${exam.subject}</td>
          <td>${exam.questions.length}</td>
          <td>${exam.duration}m</td>
          <td>
            <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.875rem;" onclick="togglePublish('${exam.id}')">${exam.published ? 'Unpublish' : 'Publish'}</button>
            <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.875rem; color: var(--danger); border-color: var(--danger);" onclick="deleteExam('${exam.id}')">Delete</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    window.togglePublish = (id) => {
      let exams = JSON.parse(localStorage.getItem('exams') || '[]');
      let exam = exams.find(e => e.id === id);
      if (exam) {
        exam.published = !exam.published;
        localStorage.setItem('exams', JSON.stringify(exams));
        loadExamsList();
      }
    };

    window.deleteExam = (id) => {
      if(confirm('Are you sure you want to delete this exam?')) {
        let exams = JSON.parse(localStorage.getItem('exams') || '[]');
        exams = exams.filter(e => e.id !== id);
        localStorage.setItem('exams', JSON.stringify(exams));
        loadExamsList();
      }
    };

    // JSON Export/Import
    document.getElementById('btn-export-json').addEventListener('click', () => {
      const exams = localStorage.getItem('exams') || '[]';
      const blob = new Blob([exams], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exams.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('btn-import-json').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const exams = JSON.parse(event.target.result);
          if (Array.isArray(exams)) {
            localStorage.setItem('exams', JSON.stringify(exams));
            loadExamsList();
            alert('Exams imported successfully!');
          }
        } catch (err) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    });
  }

  // -- SETTINGS LOGIC --
  if (document.getElementById('anthropic-key')) {
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    document.getElementById('anthropic-key').value = settings.anthropicKey || '';
    document.getElementById('gsheets-url').value = settings.googleSheetsUrl || '';

    document.getElementById('btn-save-settings').addEventListener('click', () => {
      const anthropicKey = document.getElementById('anthropic-key').value.trim();
      const googleSheetsUrl = document.getElementById('gsheets-url').value.trim();

      localStorage.setItem('adminSettings', JSON.stringify({
        anthropicKey,
        googleSheetsUrl
      }));

      const toast = document.getElementById('toast');
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
      setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
      }, 3000);
    });
  }

  // -- EXAM BUILDER LOGIC --
  if (document.getElementById('exam-title')) {
    let currentQuestions = [];
    
    // Check for API key
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    if (!settings.anthropicKey) {
      document.getElementById('ai-key-warning').style.display = 'block';
    }

    // Toggle Audio Input based on subject
    const subjectSelect = document.getElementById('exam-subject');
    const audioGroup = document.getElementById('audio-input-group');
    subjectSelect.addEventListener('change', (e) => {
      if (e.target.value === 'Listening') {
        audioGroup.style.display = 'block';
      } else {
        audioGroup.style.display = 'none';
        document.getElementById('exam-audio').value = '';
      }
    });

    document.getElementById('btn-add-question').addEventListener('click', () => {
      currentQuestions.push({
        text: 'New Question',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0
      });
      renderQuestions();
    });

    function renderQuestions() {
      const container = document.getElementById('questions-list');
      container.innerHTML = '';
      
      if (currentQuestions.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No questions added yet. Add manually or use AI extraction.</p></div>';
        return;
      }

      currentQuestions.forEach((q, index) => {
        const div = document.createElement('div');
        div.style.border = '1px solid var(--border-color)';
        div.style.padding = '1rem';
        div.style.borderRadius = 'var(--radius-md)';
        div.style.marginBottom = '1rem';
        div.style.position = 'relative';

        div.innerHTML = `
          <button class="btn btn-outline" style="position: absolute; right: 1rem; top: 1rem; padding: 0.2rem 0.5rem; color: var(--danger); border: none;" onclick="removeQuestion(${index})">X</button>
          <div class="form-group">
            <label class="form-label">Question ${index + 1}</label>
            <input type="text" class="form-control" value="${q.text}" onchange="updateQuestion(${index}, 'text', this.value)">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
            ${q.options.map((opt, oIdx) => `
              <input type="text" class="form-control" value="${opt}" onchange="updateOption(${index}, ${oIdx}, this.value)" placeholder="Option">
            `).join('')}
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.875rem;">Correct Answer (0-3)</label>
            <select class="form-control" onchange="updateCorrect(${index}, this.value)" style="width: auto;">
              <option value="0" ${q.correctAnswer == 0 ? 'selected' : ''}>Option 1</option>
              <option value="1" ${q.correctAnswer == 1 ? 'selected' : ''}>Option 2</option>
              <option value="2" ${q.correctAnswer == 2 ? 'selected' : ''}>Option 3</option>
              <option value="3" ${q.correctAnswer == 3 ? 'selected' : ''}>Option 4</option>
            </select>
          </div>
        `;
        container.appendChild(div);
      });
    }

    window.removeQuestion = (index) => {
      currentQuestions.splice(index, 1);
      renderQuestions();
    };

    window.updateQuestion = (idx, field, val) => { currentQuestions[idx][field] = val; };
    window.updateOption = (qIdx, oIdx, val) => { currentQuestions[qIdx].options[oIdx] = val; };
    window.updateCorrect = (idx, val) => { currentQuestions[idx].correctAnswer = parseInt(val); };

    // File Drop & AI logic
    const fileInput = document.getElementById('ai-file-input');
    fileInput.addEventListener('change', handleFile);

    async function handleFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
      if (!settings.anthropicKey) {
        alert('Please set your Anthropic API Key in Settings first.');
        return;
      }

      document.getElementById('ai-status').style.display = 'block';
      document.getElementById('ai-status-text').textContent = 'Extracting text...';

      try {
        const base64Image = await toBase64(file);
        
        document.getElementById('ai-status-text').textContent = 'Sending to Claude...';
        
        // Call Anthropic API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': settings.anthropicKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 2000,
            system: "You are an exam parser. Extract all multiple choice questions from the image. Output ONLY a valid JSON array of objects. Each object must have: 'text' (string), 'options' (array of exactly 4 strings), 'correctAnswer' (integer 0-3 representing the correct index). Guess the correct answer if not marked.",
            messages: [{
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: file.type,
                    data: base64Image.split(',')[1]
                  }
                },
                { type: 'text', text: "Extract questions into the specified JSON format." }
              ]
            }]
          })
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error?.message || 'API Error');
        }

        const data = await response.json();
        const text = data.content[0].text;
        
        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          currentQuestions = [...currentQuestions, ...parsed];
          renderQuestions();
          document.getElementById('ai-status-text').textContent = 'Done!';
        } else {
          throw new Error('Could not parse JSON from Claude response');
        }

      } catch (err) {
        console.error(err);
        alert('Error extracting questions: ' + err.message);
        document.getElementById('ai-status-text').textContent = 'Failed.';
      }

      setTimeout(() => { document.getElementById('ai-status').style.display = 'none'; }, 2000);
    }

    function toBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    }

    // Save Exam
    document.getElementById('btn-save-exam').addEventListener('click', () => {
      const title = document.getElementById('exam-title').value.trim();
      const subject = document.getElementById('exam-subject').value;
      const duration = document.getElementById('exam-duration').value;
      const audioFile = document.getElementById('exam-audio').value.trim();

      if (!title || currentQuestions.length === 0) {
        alert('Please enter a title and add at least one question.');
        return;
      }

      const exam = {
        id: 'exam_' + Date.now(),
        title,
        subject,
        duration: parseInt(duration),
        questions: currentQuestions,
        published: true,
        createdAt: new Date().toISOString()
      };
      
      if (subject === 'Listening' && audioFile) {
        exam.audioFile = audioFile;
      }

      const exams = JSON.parse(localStorage.getItem('exams') || '[]');
      exams.push(exam);
      localStorage.setItem('exams', JSON.stringify(exams));

      window.location.href = 'index.html';
    });
  }
});
