# Cambridge Exam System
## Complete Multi-Exam Management Platform

---

## What's included

```
exam-system/
├── index.html          ← Student portal (lists all exams)
├── take-exam.html      ← Dynamic exam player (renders any exam)
├── results.html        ← Student results page
│
├── css/
│   └── style.css       ← All styles
│
├── js/
│   ├── storage.js      ← localStorage data layer
│   └── seed.js         ← Pre-loads Test 6 on first run
│
└── admin/
    └── index.html      ← Full admin dashboard
```

---

## Deploy to GitHub Pages

1. Unzip → go to github.com → New repo → `cambridge-exams` (Public)
2. Drag the `exam-system` folder contents in → Commit
3. Settings → Pages → main branch → Save
4. Live at: `https://YOUR-USERNAME.github.io/cambridge-exams/`

---

## Admin Panel

URL: `https://YOUR-USERNAME.github.io/cambridge-exams/admin/`
Default password: `cambridge2024` (change in Settings tab)

### Tabs:
- **All Exams** — view, publish/unpublish, duplicate, delete exams
- **Exam Builder** — create exams manually OR use AI import
- **Results Log** — see all student submissions, filter, export CSV
- **Settings** — change password, Google Sheets URL, portal title

---

## Adding a New Exam — 3 ways

### Way 1: Type it manually
1. Admin → Exam Builder
2. Fill in title, subject, duration
3. Click **+ Add Question** for each question
4. Set question text, options A/B/C, correct answer
5. Click **Save & Publish**

### Way 2: AI Import (upload PDF or image)
1. Admin → Exam Builder
2. Enter your Anthropic API key (get one at console.anthropic.com)
3. Drop a PDF or JPG scan of your exam paper
4. Click **Extract Questions with AI**
5. Claude reads the paper and fills in all questions automatically
6. Review, adjust if needed, then **Save & Publish**

### Way 3: Duplicate and edit
1. Admin → All Exams → click 📋 on any existing exam
2. Edit the copy in the Builder

---

## Changing Answers

Admin → Exam Builder → Edit the exam → change the **Correct Answer** dropdown per question → Save.
No file editing needed.

---

## Google Sheets Logging

### Per-exam (recommended):
In Exam Builder, paste your Apps Script URL into the **Google Sheets URL** field.

### Global fallback:
Admin → Settings → Global Google Sheets URL

### Apps Script code:
```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.timestamp, data.studentName, data.studentClass,
    data.examTitle, data.examSubject, data.timeTaken,
    data.correct, data.total, data.pct, data.grade
  ]);
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
}
```

Deploy as Web App → Execute as: Me → Anyone can access → copy URL.

---

## Supported Question Types

| Type | How to create |
|------|--------------|
| Multiple choice with sign/notice | AI import or manual + image URL |
| Multiple choice with phone message | AI import |
| Multiple choice with email/letter | AI import |
| Multiple choice with social post | AI import |
| Reading passage + table questions | AI import (auto-detected) |
| Image stimulus | Manual — paste image URL |

---

## Data Backup

Admin → Settings → **Export All Data (JSON)**
This saves all exams + results. Re-import on any device.
