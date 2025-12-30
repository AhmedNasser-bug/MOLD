
let Subject = null;

// Default Configuration (fallback)
const CONFIG = {
    STREAK_MILESTONES: {
        5: '🔥 ON FIRE!',
        10: '⚡ UNSTOPPABLE!',
        15: '💎 LEGENDARY!',
        20: '🏆 GODLIKE!',
        25: '🌟 TRANSCENDENT!'
    },
    BRAINROT_UNLOCK_THRESHOLD: 30,
    PASSING_SCORE: 70,
    TIMERS: {
        BLITZ: { WARNING: 120, DANGER: 180 },
        SPEEDRUN: { WARNING: 2400, DANGER: 3000 }
    }
};

// Global State
let categories = [];
let currentMode = 'speedrun';
let selectedCategory = null;
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let streak = 0;
let maxStreak = 0;
let timer = null;
let seconds = 0;
let answers = [];
let selectedOptions = [];
let matchSelections = { left: null, right: null };
let matchedPairs = [];
let orderItems = [];
let fillBlanks = {};
let isAnswered = false;

// Flashcard State
let flashcards = [];
let currentFlashcardIndex = 0;
let isFlipped = false;
let isDragging = false;

// Mobile Drag Detection
document.addEventListener('touchstart', () => { isDragging = false; }, { passive: true });
document.addEventListener('touchmove', () => { isDragging = true; }, { passive: true });

// Initialization
// Initialization
function init() {
    console.log("Starting App Initialization...");
    // Determine last selected mode from localStorage or default
    const savedMode = localStorage.getItem('lastMode') || 'speedrun';

    // Load Data Synchronously (Local File Support)
    if (typeof _SUBJECT_DATA !== 'undefined' && _SUBJECT_DATA) {
        Subject = _SUBJECT_DATA;
        console.log("Subject Data Loaded:", Subject);
    } else {
        console.error("Critical: _SUBJECT_DATA not found. Ensure data.js is loaded.");
        document.body.innerHTML = `<div style="color:red;padding:20px;"><h1>Error Loading Content</h1><p>Data file missing. Please ensure data.js is loaded.</p></div>`;
        return;
    }

    // Load config
    document.title = Subject.config.title;
    document.querySelector('meta[name="description"]').content = Subject.config.description;

    // Set Header
    const headerTitle = document.querySelector('#homeScreen h1');
    if (headerTitle) headerTitle.textContent = `⛓️ ${Subject.subject.name.toUpperCase()} MASTERY`;
    if (Subject.questions) {
        categories = [...new Set(Subject.questions.map(q => q.category))];
    } else {
        categories = [];
    }

    loadProgress();
    renderCategories();
    updateStats();
    loadHistory();
    setupKeyboardShortcuts();

    // Retroactive Achievement Check
    checkAchievements(null);

    // Check for Brainrot unlock on init
    if (localStorage.getItem('brainrotUnlocked') === 'true') {
        const el = document.getElementById('brainrotLink');
        if (el) el.style.display = 'inline-block';
    }
}

function loadProgress() {
    if (!Subject || !Subject.config) return { runs: [], bestScore: 0, bestStreak: 0 };

    const saved = localStorage.getItem(Subject.config.storageKey);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Error parsing save data", e);
        }
    }
    return { runs: [], bestScore: 0, bestStreak: 0 };
}

function saveProgress(runData) {
    const data = loadProgress();
    data.runs.push(runData);
    if (runData.score > data.bestScore) data.bestScore = runData.score;
    if (runData.maxStreak > data.bestStreak) data.bestStreak = runData.maxStreak;

    localStorage.setItem(Subject.config.storageKey, JSON.stringify(data));
    checkAchievements(runData);
}

// Logic to check declarative conditions
function checkCondition(condition, stats) {
    if (!condition) return false;

    switch (condition.type) {
        case 'stat':
            const val = stats[condition.field];
            const target = condition.value;
            switch (condition.operator) {
                case '>=': return val >= target;
                case '<=': return val <= target;
                case '>': return val > target;
                case '<': return val < target;
                case '===':
                case '==': return val === target;
                default: return false;
            }
        case 'speed':
            return stats.lastMode === condition.mode && stats.lastTime <= condition.time;
        case 'mode':
            return stats.lastMode === condition.value;
        case 'perfect':
            return stats.lastMode === condition.mode && stats.lastScore === 100;
        case 'completionist': // Assuming generic array check if strictly defined, or just use custom logic if complex
            // If declarative schema has "modes": [...]
            if (condition.modes) {
                return condition.modes.every(m => stats.modesPlayed.includes(m));
            }
            return false;
        default:
            return false;
    }
}

function checkAchievements(lastRun) {
    let data = loadProgress();
    if (!data.achievements) data.achievements = [];
    if (!data.modesPlayed) data.modesPlayed = [];

    // Update modes played
    if (lastRun && lastRun.mode && !data.modesPlayed.includes(lastRun.mode)) {
        data.modesPlayed.push(lastRun.mode);
    }

    const stats = {
        totalRuns: data.runs.length,
        bestStreak: data.bestStreak,
        lastScore: lastRun ? lastRun.score : 0,
        lastTime: lastRun ? lastRun.time : 0,
        lastMode: lastRun ? lastRun.mode : '',
        modesPlayed: data.modesPlayed,
        totalAchievements: data.achievements.length
    };

    let newUnlock = false;
    let newAchievements = [];

    if (Subject.achievements) {
        Subject.achievements.forEach(ach => {
            if (!data.achievements.includes(ach.id)) {
                if (checkCondition(ach.condition, stats)) {
                    data.achievements.push(ach.id);
                    newAchievements.push(ach);
                    newUnlock = true;
                }
            }
        });

        // Re-check for meta-achievements (like collector/whale)
        if (newUnlock) {
            stats.totalAchievements = data.achievements.length;
            Subject.achievements.forEach(ach => {
                if (!data.achievements.includes(ach.id)) {
                    if (checkCondition(ach.condition, stats)) {
                        data.achievements.push(ach.id);
                        newAchievements.push(ach);
                    }
                }
            });
        }
    }

    if (newAchievements.length > 0) {
        localStorage.setItem(Subject.config.storageKey, JSON.stringify(data));
        newAchievements.forEach((ach, index) => {
            setTimeout(() => {
                showNotification(`🏆 Unlocked: ${ach.title}`);
            }, index * 2500);
        });
    } else {
        localStorage.setItem(Subject.config.storageKey, JSON.stringify(data));
    }
}

function showNotification(msg) {
    const popup = document.getElementById('comboPopup');
    const text = document.getElementById('comboText');
    if (!popup || !text) return;

    text.textContent = msg;
    popup.classList.add('active');

    // Explicitly force style to ensure visibility in case CSS is laggy
    popup.style.display = 'block';

    setTimeout(() => {
        popup.classList.remove('active');
        popup.style.display = 'none';
    }, 2000);
}

function showAchievements() {
    showScreen('achievementsScreen');
    const data = loadProgress();
    const unlocked = data.achievements || [];
    const total = (Subject && Subject.achievements) ? Subject.achievements.length : 0;

    document.getElementById('achievementStats').textContent = `${unlocked.length} / ${total} Unlocked`;

    const grid = document.getElementById('achievementsList');
    if (Subject && Subject.achievements) {
        grid.innerHTML = Subject.achievements.map(ach => {
            const isUnlocked = unlocked.includes(ach.id);
            return `
                <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}" style="background:var(--bg-card);border:1px solid ${isUnlocked ? 'gold' : 'var(--glass-border)'};padding:15px;border-radius:12px;display:flex;align-items:center;gap:15px;opacity:${isUnlocked ? 1 : 0.6}">
                    <div style="font-size:2rem;filter:${isUnlocked ? 'none' : 'grayscale(100%)'}">${ach.icon}</div>
                    <div>
                        <h3 style="margin:0;color:${isUnlocked ? 'var(--accent-light)' : 'var(--text-muted)'}">${ach.title}</h3>
                        <p style="margin:5px 0 0;font-size:0.9rem;color:var(--text-secondary)">${ach.description}</p>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        grid.innerHTML = '<p>No achievements loaded.</p>';
    }
}

function updateStats() {
    const data = loadProgress();
    const elRuns = document.getElementById('totalRuns');
    if (elRuns) elRuns.textContent = data.runs.length;

    document.getElementById('bestScore').textContent = data.bestScore + '%';
    document.getElementById('bestStreak').textContent = data.bestStreak;

    if (data.runs.length > 0) {
        const avg = Math.round(data.runs.reduce((a, b) => a + b.score, 0) / data.runs.length);
        document.getElementById('avgScore').textContent = avg + '%';
    }

    const awardCount = data.achievements ? data.achievements.length : 0;
    const totalAwards = (Subject && Subject.achievements) ? Subject.achievements.length : 30;
    const awardEl = document.getElementById('totalAwards');
    if (awardEl) awardEl.textContent = `🏆 ${awardCount}/${totalAwards}`;

    if (localStorage.getItem('brainrotUnlocked') === 'true') {
        const el = document.getElementById('brainrotLink');
        if (el) el.style.display = 'inline-block';
    }
}

function loadHistory() {
    const data = loadProgress();
    const container = document.getElementById('historyContainer');
    if (!container) return;

    if (data.runs.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px">No runs yet. Start your first challenge!</p>';
        return;
    }

    const recentRuns = data.runs.slice(-10).reverse();
    let html = '<table class="history-table"><thead><tr><th>Date</th><th>Mode</th><th>Score</th><th>Time</th><th>Grade</th></tr></thead><tbody>';

    recentRuns.forEach(run => {
        const grade = getGrade(run.score);
        const badgeClass = run.score >= 87 ? 'badge-success' : run.score >= 70 ? 'badge-warning' : 'badge-error';
        html += `<tr>
<td>${new Date(run.date).toLocaleDateString()}</td>
<td style="text-transform:capitalize">${run.mode}</td>
<td><strong>${run.score}%</strong></td>
<td>${formatTime(run.time)}</td>
<td><span class="badge ${badgeClass}">${grade}</span></td>
</tr>`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderCategories() {
    const grid = document.getElementById('categoryGrid');
    if (!grid) return;
    grid.innerHTML = categories.map(cat => {
        const count = Subject.questions.filter(q => q.category === cat).length;
        return `<div class="category-card" onclick="selectCategory('${cat}')">
<h3>${cat}</h3>
<span>${count} questions</span>
</div>`;
    }).join('');
}

function selectMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.mode === mode);
    });
    const elSelector = document.getElementById('categorySelector');
    if (elSelector) elSelector.style.display = mode === 'practice' ? 'block' : 'none';
}

function selectCategory(cat) {
    selectedCategory = cat;
    document.querySelectorAll('.category-card').forEach(card => {
        const title = card.querySelector('h3').textContent;
        card.style.borderColor = title === cat ? 'var(--accent)' : 'var(--border)';
        card.style.background = title === cat ? 'rgba(0,183,195,0.1)' : 'var(--bg-input)';
    });
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function startQuiz() {
    if (currentMode === 'practice' && !selectedCategory) {
        alert('Please select a category first!');
        return;
    }

    switch (currentMode) {
        case 'speedrun':
            // Trim to 120 most relevant
            const speedrunPool = Subject.questions.slice(0, 120);
            currentQuestions = shuffleArray(speedrunPool);
            break;
        case 'practice':
            currentQuestions = shuffleArray(Subject.questions.filter(q => q.category === selectedCategory));
            break;
        case 'blitz':
            currentQuestions = shuffleArray(Subject.questions).slice(0, 30);
            break;
        case 'hardcore':
            currentQuestions = shuffleArray(Subject.questions.filter(q => q.category === 'Hardcore'));
            break;
    }

    currentIndex = 0;
    score = 0;
    streak = 0;
    maxStreak = 0;
    seconds = 0;
    answers = [];

    const totalEl = document.getElementById('totalQ');
    if (totalEl) totalEl.textContent = currentQuestions.length;

    showScreen('quizScreen');
    startTimer();
    renderQuestion();
}

function startTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        seconds++;
        const display = document.getElementById('timer');
        if (display) {
            display.textContent = formatTime(seconds);

            if (currentMode === 'blitz') {
                if (seconds > CONFIG.TIMERS.BLITZ.DANGER) display.classList.add('danger');
                else if (seconds > CONFIG.TIMERS.BLITZ.WARNING) display.classList.add('warning');
            } else if (currentMode === 'speedrun') {
                if (seconds > CONFIG.TIMERS.SPEEDRUN.DANGER) display.classList.add('danger');
                else if (seconds > CONFIG.TIMERS.SPEEDRUN.WARNING) display.classList.add('warning');
            }
        }
    }, 1000);
}

function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function renderQuestion() {
    const q = currentQuestions[currentIndex];
    const container = document.getElementById('questionContainer');
    if (!container) return;

    selectedOptions = [];
    matchSelections = { left: null, right: null };
    matchedPairs = [];
    fillBlanks = {};
    isAnswered = false;

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.style.display = 'inline-flex';
        submitBtn.disabled = true;
    }
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) nextBtn.style.display = 'none';

    document.getElementById('currentQ').textContent = currentIndex + 1;
    document.getElementById('liveScore').textContent = score;

    const progress = ((currentIndex) / currentQuestions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';

    const hintBtn = document.getElementById('hintBtn');
    if (hintBtn) hintBtn.style.display = (q.relatedTerms && q.relatedTerms.length > 0) ? 'inline-flex' : 'none';

    let html = `
<div class="question-header">
<span class="question-number">Question ${currentIndex + 1} of ${currentQuestions.length}</span>
<span class="question-category">${q.category}</span>
</div>
<div class="question-type">${getQuestionTypeLabel(q.type)}</div>
<div class="question-text">${q.question}</div>
`;

    switch (q.type) {
        case 'mcq': html += renderMCQ(q); break;
        case 'multi': html += renderMulti(q); break;
        case 'tf': html += renderTF(q); break;
    }

    html += '<div class="feedback" id="feedback"></div>';
    container.innerHTML = html;
    container.classList.remove('shake', 'celebrate');
    void container.offsetWidth;
}

function getQuestionTypeLabel(type) {
    const labels = {
        'mcq': '📝 Single Choice',
        'multi': '☑️ Multiple Choice (Select All That Apply)',
        'tf': '✓✗ True or False'
    };
    return labels[type] || type;
}

function renderMCQ(q) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    // assuming options are in order or handled by shuffle logic in future
    const shuffledOptions = q.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));

    return `<div class="options-grid">
${shuffledOptions.map((opt, idx) => `
<div class="option" onclick="selectMCQ(${idx}, ${opt.originalIndex})" data-idx="${idx}" data-original="${opt.originalIndex}">
    <span class="option-marker">${letters[idx]}</span>
    <span class="option-text">${opt.text}</span>
</div>
`).join('')}
</div>`;
}

function renderMulti(q) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    return `<div class="options-grid multi-select">
${q.options.map((opt, idx) => `
<div class="option" onclick="selectMulti(${idx})" data-idx="${idx}">
    <span class="option-marker">${letters[idx]}</span>
    <span class="option-text">${opt}</span>
</div>
`).join('')}
</div>`;
}

function renderTF(q) {
    return `<div class="tf-grid">
<div class="option tf-option" onclick="selectTF(true)" data-value="true">
<span class="option-marker">✓</span>
<span class="option-text">TRUE</span>
</div>
<div class="option tf-option" onclick="selectTF(false)" data-value="false">
<span class="option-marker">✗</span>
<span class="option-text">FALSE</span>
</div>
</div>`;
}

function selectMCQ(displayIdx, originalIdx) {
    if (isAnswered || isDragging) return;
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    document.querySelector(`.option[data-idx="${displayIdx}"]`).classList.add('selected');
    selectedOptions = [originalIdx];
    document.getElementById('submitBtn').disabled = false;
}

function selectMulti(idx) {
    if (isAnswered || isDragging) return;
    const option = document.querySelector(`.option[data-idx="${idx}"]`);
    option.classList.toggle('selected');
    if (selectedOptions.includes(idx)) {
        selectedOptions = selectedOptions.filter(i => i !== idx);
    } else {
        selectedOptions.push(idx);
    }
    document.getElementById('submitBtn').disabled = selectedOptions.length === 0;
}

function selectTF(value) {
    if (isAnswered || isDragging) return;
    document.querySelectorAll('.tf-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelector(`.tf-option[data-value="${value}"]`).classList.add('selected');
    selectedOptions = [value];
    document.getElementById('submitBtn').disabled = false;
}

function submitAnswer() {
    if (isAnswered || selectedOptions.length === 0) return;

    isAnswered = true;
    const q = currentQuestions[currentIndex];
    let isCorrect = false;

    switch (q.type) {
        case 'mcq':
            isCorrect = selectedOptions[0] === q.correct;
            showMCQFeedback(q.correct);
            break;
        case 'multi':
            const sortedSelected = [...selectedOptions].sort();
            const sortedCorrect = [...q.correct].sort();
            isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
            showMultiFeedback(q.correct);
            break;
        case 'tf':
            isCorrect = selectedOptions[0] === q.correct;
            showTFFeedback(q.correct);
            break;
    }

    answers.push({
        question: q.question,
        correct: isCorrect,
        userAnswer: selectedOptions,
        correctAnswer: q.correct,
        explanation: q.explanation
    });

    const feedback = document.getElementById('feedback');
    const container = document.getElementById('questionContainer');

    if (isCorrect) {
        score++;
        streak++;
        if (streak > maxStreak) maxStreak = streak;

        feedback.className = 'feedback correct';
        feedback.innerHTML = `<span class="feedback-icon">✓</span> Correct! ${q.explanation}`;
        container.classList.add('celebrate');

        updateStreak();
        checkCombo();
    } else {
        streak = 0;
        feedback.className = 'feedback incorrect';
        feedback.innerHTML = `<span class="feedback-icon">✗</span> Incorrect. ${q.explanation}`;
        container.classList.add('shake');
        hideStreak();
    }

    document.getElementById('liveScore').textContent = score;
    document.getElementById('submitBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'inline-flex';
}

function showMCQFeedback(correctIdx) {
    document.querySelectorAll('.option').forEach(opt => {
        const origIdx = parseInt(opt.dataset.original);
        if (origIdx === correctIdx) {
            opt.classList.add('correct');
        } else if (opt.classList.contains('selected')) {
            opt.classList.add('incorrect');
        }
    });
}

function showMultiFeedback(correctIdxs) {
    document.querySelectorAll('.option').forEach(opt => {
        const idx = parseInt(opt.dataset.idx);
        if (correctIdxs.includes(idx)) {
            opt.classList.add('correct');
        } else if (opt.classList.contains('selected')) {
            opt.classList.add('incorrect');
        }
    });
}

function showTFFeedback(correctVal) {
    document.querySelectorAll('.tf-option').forEach(opt => {
        const val = opt.dataset.value === 'true';
        if (val === correctVal) {
            opt.classList.add('correct');
        } else if (opt.classList.contains('selected')) {
            opt.classList.add('incorrect');
        }
    });
}

function updateStreak() {
    if (streak >= 3) {
        const el = document.getElementById('streakIndicator');
        if (el) el.classList.add('active');
        document.getElementById('streakCount').textContent = streak;
    }

    if (streak >= CONFIG.BRAINROT_UNLOCK_THRESHOLD && currentMode !== 'practice') {
        const btn = document.getElementById('brainrotLink');
        if (btn.style.display !== 'inline-block') {
            btn.style.display = 'inline-block';
            localStorage.setItem('brainrotUnlocked', 'true');
            alert("Gamified Version Unlocked! 🎮");
        }
    }
}

function hideStreak() {
    const el = document.getElementById('streakIndicator');
    if (el) el.classList.remove('active');
}

function checkCombo() {
    if (CONFIG.STREAK_MILESTONES[streak]) {
        showComboPopup(CONFIG.STREAK_MILESTONES[streak]);
        createParticles();
    }
}

function showComboPopup(text) {
    const popup = document.getElementById('comboPopup');
    document.getElementById('comboText').textContent = text;
    popup.classList.add('active');
    setTimeout(() => { popup.classList.remove('active'); }, 1500);
}

function createParticles() {
    const container = document.getElementById('particles');
    const colors = ['#0078d4', '#00b7c3', '#00c853', '#ffa000', '#ff4757'];
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
position: absolute;
width: 10px;
height: 10px;
background: ${colors[Math.floor(Math.random() * colors.length)]};
border-radius: 50%;
left: ${50 + (Math.random() - 0.5) * 20}%;
top: 50%;
pointer-events: none;
animation: particleFly ${0.5 + Math.random() * 0.5}s ease-out forwards;
`;
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
}

function skipQuestion() {
    const q = currentQuestions[currentIndex];
    answers.push({
        question: q.question,
        correct: false,
        userAnswer: null,
        correctAnswer: q.correct,
        explanation: q.explanation
    });
    streak = 0;
    hideStreak();
    nextQuestion();
}

function nextQuestion() {
    currentIndex++;
    if (currentIndex < currentQuestions.length) {
        renderQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    clearInterval(timer);
    showScreen('resultsScreen');

    const total = currentQuestions.length;
    const finalScore = Math.round((score / total) * 100);
    const correct = answers.filter(a => a.correct).length;
    const incorrect = total - correct;

    document.getElementById('finalScore').textContent = finalScore + '%';
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('incorrectCount').textContent = incorrect;
    document.getElementById('finalTime').textContent = formatTime(seconds);
    document.getElementById('finalGrade').textContent = getGrade(finalScore);

    saveProgress({
        date: new Date().toISOString(),
        score: finalScore,
        mode: currentMode,
        time: seconds,
        maxStreak: maxStreak
    });
}

function getGrade(score) {
    if (score >= 97) return 'S+';
    if (score >= 93) return 'S';
    if (score >= 90) return 'A+';
    if (score >= 87) return 'A';
    if (score >= 83) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 77) return 'B';
    if (score >= 73) return 'B-';
    if (score >= 70) return 'C+';
    if (score >= 67) return 'C';
    if (score >= 63) return 'C-';
    if (score >= 60) return 'D+';
    if (score >= 50) return 'D';
    return 'F';
}

function showReview() {
    document.getElementById('reviewContainer').style.display = 'block';
    const container = document.getElementById('reviewContent');
    if (!container) return;

    container.innerHTML = answers.map((ans, idx) => {
        // Reconstruct answer text for display
        let userAnsText = 'Skipped';
        const q = currentQuestions.find(q => q.question === ans.question);

        // Note: Logic for displaying generic selected options might need specific handling if options were shuffled differently per question,
        // but since we render based on q.options and indices, we assume index consistency.

        return `
<div class="review-item ${ans.correct ? 'review-correct' : 'review-incorrect'}">
<div class="review-question">${idx + 1}. ${ans.question}</div>
<div class="review-answer">Your Answer: ${JSON.stringify(ans.userAnswer)}</div>
<div class="review-answer">Correct: ${JSON.stringify(ans.correctAnswer)}</div>
<div class="review-answer" style="margin-top:5px;font-style:italic">${ans.explanation}</div>
</div>`;
    }).join('');
}

function goHome() {
    showScreen('homeScreen');
    updateStats();
    loadHistory();
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('quizScreen').classList.contains('active')) {
            if (e.key === 'Enter') {
                if (!document.getElementById('submitBtn').disabled && document.getElementById('submitBtn').style.display !== 'none') {
                    submitAnswer();
                } else if (document.getElementById('nextBtn').style.display !== 'none') {
                    nextQuestion();
                }
            } else if (e.key.toLowerCase() === 's') {
                skipQuestion();
            }
        }
    });

    // Install Button Logic
    let deferredPrompt;
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installBtn.style.display = 'flex';
        });

        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    deferredPrompt = null;
                }
            }
        });

        window.addEventListener('appinstalled', () => {
            installBtn.style.display = 'none';
            deferredPrompt = null;
        });
    }
}

// ---------------- FLASHCARD FEATURE ----------------

function startFlashcards(mode = 'terminology') {
    console.log("Starting Flashcards in mode:", mode);
    showScreen('flashcardScreen');
    currentFlashcardIndex = 0;

    if (!Subject) {
        alert("CRITICAL ERROR: Subject data not loaded!");
        return;
    }

    if (mode === 'questionBank') {
        const source = (Subject.flashcards && Subject.flashcards.length > 0) ? Subject.flashcards : [];
        if (source.length === 0) {
            alert("No flashcard data available in Subject.flashcards.");
            return;
        }
        const shuffled = shuffleArray([...source]);
        flashcards = shuffled.map(item => ({
            frontContent: `<div class="flashcard-content"><h2 style="font-size:1.4rem">${item.front}</h2></div>`,
            backContent: `
                <div style="font-weight:bold;margin-bottom:10px;color:var(--accent)">Answer</div>
                <div>${item.back}</div>
                ${item.hook ? `<div style="margin-top:15px;font-style:italic;color:var(--text-secondary)">💡 ${item.hook}</div>` : ''}
            `
        }));
    } else {
        // Default to Terminology
        if (!Subject.terminology) {
            alert("Terminology data object is missing in Subject!");
            return;
        }
        const keys = Object.keys(Subject.terminology);
        console.log(`Found ${keys.length} terminology keys.`);

        if (keys.length === 0) {
            alert("Terminology data is empty!");
            return;
        }

        const randomKeys = shuffleArray(keys);
        flashcards = randomKeys.map(key => {
            const termData = Subject.terminology[key];
            const termName = key.replace(/_/g, ' ');
            return {
                frontContent: `
                    <div class="flashcard-content">
                        <h2 class="fc-term-title">${termName}</h2>
                        <div class="fc-tap-hint" style="margin-top: 2rem;">
                            ${termData.Where_it_is_used ? `<p><strong>Where:</strong> ${termData.Where_it_is_used}</p>` : ''}
                            ${termData.When_it_is_used ? `<p><strong>When:</strong> ${termData.When_it_is_used}</p>` : ''}
                        </div>
                        <p class="click-instruction" style="margin-top: auto; opacity: 0.7; font-size: 0.8rem;">Click to reveal meaning</p>
                    </div>
                `,
                backContent: `
                    <div class="flashcard-content">
                        <div class="term-category" style="color:var(--accent);margin-bottom:10px">${termData.Category || 'General'}</div>
                        <p><strong>Meaning:</strong> ${termData.Meaning}</p>
                        ${termData.Analogy ? `<p class="analogy" style="margin-top:15px;font-style:italic;color:var(--text-secondary)"><strong>Analogy:</strong> ${termData.Analogy}</p>` : ''}
                    </div>
                `
            };
        });
    }

    console.log(`Loaded ${flashcards.length} flashcards.`);
    renderFlashcard();
}

function renderFlashcard() {
    const card = flashcards[currentFlashcardIndex];
    if (!card) {
        console.error("renderFlashcard: No card found at index", currentFlashcardIndex);
        return;
    }

    // Reset State
    isFlipped = false;
    const flashcardEl = document.getElementById('currentFlashcard');
    if (flashcardEl) {
        flashcardEl.classList.remove('flipped');
    } else {
        console.error("renderFlashcard: #currentFlashcard element not found!");
    }

    // Update Content
    const frontFace = document.querySelector('.flashcard-front-face');
    if (frontFace) frontFace.innerHTML = card.frontContent;
    else console.error("renderFlashcard: .flashcard-front-face not found!");

    const backFace = document.querySelector('.flashcard-back-face');
    if (backFace) backFace.innerHTML = card.backContent;

    // Update Progress
    const progressText = document.getElementById('fcProgressText');
    if (progressText) progressText.textContent = `Card ${currentFlashcardIndex + 1} / ${flashcards.length}`;

    const progressBar = document.getElementById('fcProgressBar');
    if (progressBar) progressBar.style.width = `${((currentFlashcardIndex + 1) / flashcards.length) * 100}%`;

    // Show controls (optional, if we want them visible always or only on back)
    const controls = document.getElementById('fcControls');
    if (controls) controls.style.display = 'flex';
}

function flipFlashcard() {
    const container = document.getElementById('currentFlashcard');
    if (!container) return;
    isFlipped = !isFlipped;
    if (isFlipped) container.classList.add('flipped');
    else container.classList.remove('flipped');
}

function nextFlashcard(difficulty = 'good') {
    // difficulty argument can be used for SRS algorithm in future
    if (currentFlashcardIndex < flashcards.length - 1) {
        currentFlashcardIndex++;
        renderFlashcard();
    } else {
        alert("Session Complete!");
        saveProgress({
            date: new Date().toISOString(),
            score: 100,
            mode: 'flashcards',
            time: 0,
            maxStreak: 0
        });
        goHome();
    }
}

// ---------------- REVISION FEATURE ----------------

function renderRevision(categoryFilter = 'All') {
    const container = document.getElementById('revisionContent');
    const filterSelect = document.getElementById('revisionCategoryFilter');
    if (!container) return;

    // Populate filter if empty
    if (filterSelect && filterSelect.options.length <= 1) {
        // Keep 'All'
        Subject.categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            filterSelect.appendChild(opt);
        });
    }

    if (!Subject.terminology) {
        container.innerHTML = '<p>No terminology loaded.</p>';
        return;
    }

    const categories = {};
    Object.keys(Subject.terminology).forEach(key => {
        const item = Subject.terminology[key];
        const cat = item.Category || 'Uncategorized';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push({ key, ...item });
    });

    let html = '';
    const catsToSort = Object.keys(categories).sort();

    catsToSort.forEach(cat => {
        if (categoryFilter !== 'All' && cat !== categoryFilter) return;

        html += `<h2 class="revision-category">${cat}</h2><div class="terms-grid">`;
        categories[cat].forEach(term => {
            const name = term.key.replace(/_/g, ' ');
            html += `
             <div class="term-card" onclick="toggleTerm(this)">
                 <div class="term-header">
                     <h3>${name}</h3>
                     <span class="expand-icon">+</span>
                 </div>
                 <div class="term-details">
                     <p><strong>Meaning:</strong> ${term.Meaning}</p>
                     <p><strong>Context:</strong> ${term.Context}</p>
                     ${term.Analogy ? `<p class="analogy"><strong>Analogy:</strong> ${term.Analogy}</p>` : ''}
                 </div>
             </div>`;
        });
        html += `</div>`;
    });

    container.innerHTML = html;
}

function toggleTerm(card) {
    card.classList.toggle('active');
    const icon = card.querySelector('.expand-icon');
    icon.textContent = card.classList.contains('active') ? '−' : '+';
}

function showHint() {
    const q = currentQuestions[currentIndex];
    if (!q || !q.relatedTerms || q.relatedTerms.length === 0) {
        alert("No hint available for this question.");
        return;
    }

    const terms = q.relatedTerms;
    let hintText = "";

    terms.forEach(termKey => {
        if (Subject.terminology && Subject.terminology[termKey]) {
            const term = Subject.terminology[termKey];
            hintText += `${termKey.replace(/_/g, ' ')}:\n${term.Meaning}\n\n`;
        }
    });

    if (hintText) {
        alert("💡 HINT:\n\n" + hintText);
    } else {
        alert("Hint data references missing terms.");
    }
}


// Expose functions to window
window.init = init;
window.selectCategory = selectCategory;
window.selectMode = selectMode;
window.startQuiz = startQuiz;
window.skipQuestion = skipQuestion;
window.submitAnswer = submitAnswer;
window.nextQuestion = nextQuestion;
window.showReview = showReview;
window.goHome = goHome;
window.showAchievements = showAchievements;
window.startFlashcards = startFlashcards;
window.flipFlashcard = flipFlashcard;
window.nextFlashcard = nextFlashcard;
window.renderRevision = renderRevision;
window.toggleTerm = toggleTerm;
window.selectMCQ = selectMCQ;
window.selectMulti = selectMulti;
window.selectTF = selectTF;
window.showHint = showHint;

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

