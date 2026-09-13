/**
 * Forensic Psychology Moot Court Oral Defense Simulator & Cross-Examination Practice
 * Example Cross-Examination Questions across Prosecution, Defense & Judge
 */

class MootCourtSimulator {
    constructor() {
        this.questions = JSON.parse(JSON.stringify(APP_DATA.mootQuestions));
        this.currentIndex = 0;
        this.activeRoleFilter = 'all';
        this.timerSeconds = 120; // 2 minutes default
        this.timerRemaining = 120;
        this.timerInterval = null;
        this.isTimerRunning = false;
    }

    init() {
        this.renderQuestion(this.currentIndex);
        this.bindEvents();
        this.updateStats();
    }

    getFilteredQuestions() {
        if (this.activeRoleFilter === 'all') return this.questions;
        return this.questions.filter(q => q.role.toLowerCase() === this.activeRoleFilter.toLowerCase());
    }

    bindEvents() {
        if (this.eventsBound) return;
        this.eventsBound = true;

        const nextBtn = document.getElementById('btn-next-question');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }

        const prevBtn = document.getElementById('btn-prev-question');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevQuestion());
        }

        const randomBtn = document.getElementById('btn-random-question');
        if (randomBtn) {
            randomBtn.addEventListener('click', () => this.randomQuestion());
        }

        const startTimerBtn = document.getElementById('btn-start-timer');
        if (startTimerBtn) {
            startTimerBtn.addEventListener('click', () => this.toggleTimer());
        }

        const resetTimerBtn = document.getElementById('btn-reset-timer');
        if (resetTimerBtn) {
            resetTimerBtn.addEventListener('click', () => this.resetTimer());
        }

        const setTimeSelect = document.getElementById('select-timer-duration');
        if (setTimeSelect) {
            setTimeSelect.addEventListener('change', (e) => {
                this.timerSeconds = parseInt(e.target.value);
                this.resetTimer();
            });
        }

        const addQBtn = document.getElementById('btn-add-custom-moot-q');
        if (addQBtn) {
            addQBtn.addEventListener('click', () => this.addCustomQuestion());
        }

        // Role filter buttons
        document.querySelectorAll('.moot-role-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.moot-role-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeRoleFilter = btn.dataset.role;
                this.currentIndex = 0;
                this.renderQuestion(this.currentIndex);
            });
        });
    }

    renderQuestion(index) {
        const container = document.getElementById('moot-court-question-card');
        if (!container) return;

        const filtered = this.getFilteredQuestions();
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state-card" style="padding: 2.5rem; text-align: center;">
                    <p style="color: var(--text-muted);">No questions found for this role filter.</p>
                </div>
            `;
            return;
        }

        if (index >= filtered.length) index = 0;
        if (index < 0) index = filtered.length - 1;
        this.currentIndex = index;

        const q = filtered[this.currentIndex];

        let roleBadgeClass = 'badge-role-judge';
        let roleIcon = 'fa-gavel';
        if (q.role === 'Prosecution') {
            roleBadgeClass = 'badge-role-prosecution';
            roleIcon = 'fa-bolt';
        } else if (q.role === 'Defense') {
            roleBadgeClass = 'badge-role-defense';
            roleIcon = 'fa-shield-alt';
        }

        container.innerHTML = `
            <div class="moot-q-header">
                <div class="moot-q-meta" style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                    <span class="badge ${roleBadgeClass}"><i class="fas ${roleIcon}"></i> Example ${q.role} Cross-Examination</span>
                    <span class="badge badge-outline"><i class="fas fa-tag"></i> Topic: ${q.topic || 'Forensic Psychology'}</span>
                    <span class="moot-q-counter" style="margin-left: auto; font-size: 0.8rem; color: var(--text-muted);">Example Question ${this.currentIndex + 1} of ${filtered.length}</span>
                </div>
            </div>

            <div class="moot-question-box">
                <div class="quote-icon"><i class="fas fa-quote-left"></i></div>
                <div class="moot-question-text">${q.question}</div>
            </div>

            <div class="moot-prep-grid">
                <div class="prep-box key-points-box">
                    <div class="prep-title"><i class="fas fa-bullseye"></i> Key Scientific Principles You Could State</div>
                    <ul class="key-points-list">
                        ${q.keyPointsToHit.map(pt => `<li><i class="fas fa-check"></i> ${pt}</li>`).join('')}
                    </ul>
                </div>

                <div class="prep-box traps-box">
                    <div class="prep-title"><i class="fas fa-exclamation-triangle"></i> Adversarial Traps to Avoid</div>
                    <div class="trap-content">
                        <strong>Common Error:</strong> ${q.pitfall}
                    </div>
                </div>
            </div>

            <div class="model-answer-section">
                <button class="btn btn-secondary btn-reveal-model" onclick="window.mootCourtApp.toggleModelAnswer('${q.id}')">
                    <i class="fas fa-eye"></i> Reveal / Hide Example Expert Witness Response
                </button>

                <div class="model-answer-content" id="model-ans-${q.id}" style="display: none;">
                    <div class="model-header"><i class="fas fa-award"></i> Example Defense Response (Forensic Benchmark)</div>
                    <p class="model-text">"${q.modelResponse}"</p>
                </div>
            </div>
        `;

        this.resetTimer();
    }

    toggleModelAnswer(qId) {
        const elem = document.getElementById(`model-ans-${qId}`);
        if (!elem) return;
        if (elem.style.display === 'none' || !elem.style.display) {
            elem.style.display = 'block';
        } else {
            elem.style.display = 'none';
        }
    }

    nextQuestion() {
        const filtered = this.getFilteredQuestions();
        if (this.currentIndex < filtered.length - 1) {
            this.currentIndex++;
        } else {
            this.currentIndex = 0;
        }
        this.renderQuestion(this.currentIndex);
    }

    prevQuestion() {
        const filtered = this.getFilteredQuestions();
        if (this.currentIndex > 0) {
            this.currentIndex--;
        } else {
            this.currentIndex = filtered.length - 1;
        }
        this.renderQuestion(this.currentIndex);
    }

    randomQuestion() {
        const filtered = this.getFilteredQuestions();
        if (filtered.length === 0) return;
        const rand = Math.floor(Math.random() * filtered.length);
        this.currentIndex = rand;
        this.renderQuestion(this.currentIndex);
    }

    toggleTimer() {
        const btn = document.getElementById('btn-start-timer');
        if (this.isTimerRunning) {
            clearInterval(this.timerInterval);
            this.isTimerRunning = false;
            if (btn) btn.innerHTML = `<i class="fas fa-play"></i> Start Speaking Timer`;
        } else {
            this.isTimerRunning = true;
            if (btn) btn.innerHTML = `<i class="fas fa-pause"></i> Pause Timer`;
            this.timerInterval = setInterval(() => {
                if (this.timerRemaining > 0) {
                    this.timerRemaining--;
                    this.updateTimerDisplay();
                } else {
                    clearInterval(this.timerInterval);
                    this.isTimerRunning = false;
                    if (btn) btn.innerHTML = `<i class="fas fa-redo"></i> Time Up! Restart`;
                    window.app.showNotification("Time's up! Conclude your response calmly and clearly.", "warning");
                }
            }, 1000);
        }
    }

    resetTimer() {
        clearInterval(this.timerInterval);
        this.isTimerRunning = false;
        this.timerRemaining = this.timerSeconds;
        this.updateTimerDisplay();
        const btn = document.getElementById('btn-start-timer');
        if (btn) btn.innerHTML = `<i class="fas fa-play"></i> Start Speaking Timer`;
    }

    updateTimerDisplay() {
        const display = document.getElementById('moot-timer-display');
        if (!display) return;

        const mins = Math.floor(this.timerRemaining / 60);
        const secs = this.timerRemaining % 60;
        display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        if (this.timerRemaining <= 15) {
            display.className = 'timer-display timer-urgent';
        } else {
            display.className = 'timer-display';
        }
    }

    updateStats() {
        const totalCountElem = document.getElementById('stat-moot-questions-total');
        if (totalCountElem) totalCountElem.textContent = this.questions.length;
    }

    addCustomQuestion() {
        const questionText = prompt("Enter the Cross-Examination Question from the Judge or Counsel:");
        if (!questionText) return;

        const role = prompt("Who is asking? ('Prosecution', 'Defense', or 'Judge'):", "Prosecution") || "Prosecution";
        const topic = prompt("Question Topic (e.g. 'Distance Acuity', 'Alcohol BAC', 'Showup Bias'):", "Case Evidence") || "Case Evidence";
        const keyPoint = prompt("Key scientific principle to state in defense:", "Cite relevant meta-analyses and avoid the ultimate issue.") || "Cite relevant literature.";
        const trap = prompt("Common trap to avoid:", "Getting defensive or asserting guilt/innocence directly.") || "Avoid ultimate issue.";
        const model = prompt("Model expert answer summary:", "Answer objectively anchoring in empirical literature.") || "Objective scientific answer.";

        const newQ = {
            id: `cq_${Date.now()}`,
            role: role,
            question: questionText,
            topic: topic,
            keyPointsToHit: [keyPoint],
            pitfall: trap,
            modelResponse: model
        };

        this.questions.push(newQ);
        this.currentIndex = this.questions.length - 1;
        this.renderQuestion(this.currentIndex);
        this.updateStats();
        window.app.showNotification("Added custom cross-examination question!", "success");
    }
}
