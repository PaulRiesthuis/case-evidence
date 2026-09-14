/**
 * Forensic Psychology Case Evidence & Likelihood Ratio Lab
 * Methodology based on Rassin et al. (2022)
 * Rassin, E., Arbiyah, N., Boskovic, I., Otgaar, H., & Merckelbach, H. (2022).
 * Likelihood ratios in psychological expert opinion, and their reception by professional judges.
 * The International Journal of Evidence & Proof, 26(4), 325-341.
 * 
 * Focuses purely on Likelihood Ratios (P(E|Hp) / P(E|Hd)) and the verbal scales without prior probabilities.
 * Automatically derives conditional probabilities from student scores (Importance, Replicability, Generalizability, Practical Relevance).
 */

class LikelihoodRatioLab {
    constructor() {
        this.compoundingMode = 'direct'; // 'direct' (Rassin et al. 2022 multiplication) or 'interdependent' (shared variance)
    }

    getLRItems() {
        if (!window.app || !window.app.currentProject) return [];
        const items = window.app.currentProject.lrItems || [];
        const factors = window.app.currentProject.factors || [];
        // Ensure every item has target and category directly from its source factor
        items.forEach(it => {
            const f = factors.find(fact => fact.id === it.factorId);
            if (f) {
                if (!it.target) it.target = f.target || 'Witness';
                if (!it.category) it.category = f.category || 'estimator';
                if (!it.name) it.name = f.name;
            }
        });
        return items;
    }

    getHypotheses() {
        if (!window.app || !window.app.currentProject || !window.app.currentProject.mandate) {
            return {
                hp: "Hypothesis 1 (H1): The eyewitness identification is accurate (The suspect is the person seen by the witness).",
                hd: "Hypothesis 2 (H2): The eyewitness identification is mistaken (The suspect is an innocent person mistakenly identified)."
            };
        }
        return {
            hp: window.app.currentProject.mandate.hypothesisHp || "Hypothesis 1 (H1): The primary proposition is true.",
            hd: window.app.currentProject.mandate.hypothesisHd || "Hypothesis 2 (H2): The alternative proposition is true."
        };
    }

    init() {
        this.syncFromIdentifiedFactors(false);
        this.renderHypothesesHeader();
        this.renderEvidenceCards();
        this.renderCalculations();
        this.bindEvents();
    }

    bindEvents() {
        if (this.eventsBound) return;
        this.eventsBound = true;

        // Hypotheses Inputs
        const hpInput = document.getElementById('lr-input-hp');
        const hdInput = document.getElementById('lr-input-hd');

        if (hpInput) {
            hpInput.addEventListener('input', (e) => {
                if (!window.app.currentProject.mandate) window.app.currentProject.mandate = {};
                window.app.currentProject.mandate.hypothesisHp = e.target.value;
                this.renderHypothesesHeader();
                window.app.saveState();
            });
        }

        if (hdInput) {
            hdInput.addEventListener('input', (e) => {
                if (!window.app.currentProject.mandate) window.app.currentProject.mandate = {};
                window.app.currentProject.mandate.hypothesisHd = e.target.value;
                this.renderHypothesesHeader();
                window.app.saveState();
            });
        }

        // Independence Toggle
        const indepToggle = document.getElementById('toggle-independence');
        if (indepToggle) {
            indepToggle.addEventListener('change', (e) => {
                this.assumeIndependence = e.target.checked;
                this.renderCalculations();
                if (window.app) window.app.updateNavBadges();
            });
        }

        // Auto-Recalculate Button
        const autoCalcBtn = document.getElementById('btn-recalculate-all-lrs');
        if (autoCalcBtn) {
            autoCalcBtn.addEventListener('click', () => {
                this.syncFromIdentifiedFactors(true);
            });
        }
    }

    renderHypothesesHeader() {
        const hypos = this.getHypotheses();
        const hpInput = document.getElementById('lr-input-hp');
        const hdInput = document.getElementById('lr-input-hd');

        if (hpInput && hpInput.value !== hypos.hp) hpInput.value = hypos.hp;
        if (hdInput && hdInput.value !== hypos.hd) hdInput.value = hypos.hd;
    }

    /**
     * Automatic Probability Derivation Algorithm (Rassin et al., 2022)
     * Logical, Monotonic Mapping:
     * - If scores are unrated (null), flags awaiting evaluation.
     * - Lowest scores (1/5) & low importance (1/10) => LR = 1.00 (No evidence / Neutral)
     * - Increases validity => higher scores yield higher LR (1.00 -> 7.33+, supporting H1)
     * - Decreases validity => higher scores yield lower LR (1.00 -> 0.39, supporting H2 / Unreliability)
     * - Mixed validity => LR = 1.00
     */
    deriveProbabilitiesFromFactor(factor) {
        const imp = factor.importance !== undefined && factor.importance !== null ? parseInt(factor.importance) : null;
        const rep = factor.replicabilityScore !== undefined && factor.replicabilityScore !== null ? parseInt(factor.replicabilityScore) : null;
        const gen = factor.generalizabilityScore !== undefined && factor.generalizabilityScore !== null ? parseInt(factor.generalizabilityScore) : null;
        const rel = factor.relevanceScore !== undefined && factor.relevanceScore !== null ? parseInt(factor.relevanceScore) : null;
        const dir = factor.direction || 'decreases';

        // Check if scientific quality pillars have been completed by the student
        const isPending = rep === null || gen === null || rel === null || imp === null;

        if (isPending) {
            return {
                php: 0.50,
                phd: 0.50,
                isPending: true,
                rationale: "⚠️ Awaiting evaluation: Complete the 3-pillar scientific quality evaluation (Replicability, Generalizability, Practical Relevance) in Step 3 to derive probabilities."
            };
        }

        // Average scientific quality across 3 pillars (1.0 to 5.0)
        const qualityAvg = (rep + gen + rel) / 3;

        // Normalized scales from 0.0 (minimum score 1) to 1.0 (maximum score 5 or 10)
        const qualityNorm = Math.max(0, Math.min(1, (qualityAvg - 1) / 4)); // 1->0.0, 3->0.5, 5->1.0
        const impNorm = Math.max(0, Math.min(1, (imp - 1) / 9)); // 1->0.0, 5->0.44, 10->1.0

        // Combined diagnostic strength index S in [0.0, 1.0]
        // 60% weight to scientific literature quality, 40% weight to case importance
        const strength = (0.60 * qualityNorm) + (0.40 * impNorm);

        let php = 0.50;
        let phd = 0.50;
        let rationale = "";

        if (dir === 'increases') {
            // Factor INCREASES validity (e.g. pristine lineup, close distance, immediate recall)
            // S = 0.0 (lowest scores) => P(E|H1)=0.50, P(E|H2)=0.50 => LR = 1.00
            // S = 1.0 (highest scores) => P(E|H1)=0.88, P(E|H2)=0.12 => LR = 7.33 (Substantial to Strong support for H1)
            php = 0.50 + (0.38 * strength);
            phd = 0.50 - (0.38 * strength);

            php = Math.round(php * 100) / 100;
            phd = Math.round(phd * 100) / 100;
            const lr = php / Math.max(0.01, phd);
            const scale = this.getJaroszWileyScale(lr);

            rationale = `Auto-Derived: Factor increases testimony validity (Importance: ${imp}/10, Scientific Quality: ${qualityAvg.toFixed(1)}/5). The evidence is more probable under H1 than H2, yielding LR = ${lr.toFixed(2)} (${scale.text}).`;
        } else if (dir === 'decreases') {
            // Factor DECREASES validity (e.g. intoxication, 20m darkness, suggestive showup)
            // S = 0.0 (lowest scores) => P(E|H1)=0.50, P(E|H2)=0.50 => LR = 1.00 (Neutral)
            // S = 1.0 (highest scores) => P(E|H1)=0.28, P(E|H2)=0.72 => LR = 0.39 (Anecdotal to Substantial for H2 / Alternative)
            php = 0.50 - (0.22 * strength);
            phd = 0.50 + (0.22 * strength);

            php = Math.round(php * 100) / 100;
            phd = Math.round(phd * 100) / 100;
            const lr = php / Math.max(0.01, phd);
            const scale = this.getJaroszWileyScale(lr);

            rationale = `Auto-Derived: Factor decreases testimony validity (Importance: ${imp}/10, Scientific Quality: ${qualityAvg.toFixed(1)}/5). Due to cognitive/system impairment, the evidence is more probable under H2 (Mistaken / Invalid) than under H1, yielding LR = ${lr.toFixed(2)} (${scale.text}).`;
        } else {
            // Mixed / Contextual
            php = 0.50;
            phd = 0.50;
            rationale = `Auto-Derived: Mixed validity impact yields equal probability under both hypotheses (LR = 1.00: No evidence / Neutral).`;
        }

        return { php, phd, isPending: false, rationale };
    }

    syncFromIdentifiedFactors(notify = true) {
        const factors = window.app?.currentProject?.factors || [];
        if (factors.length === 0) {
            window.app.currentProject.lrItems = [];
            this.renderEvidenceCards();
            this.renderCalculations();
            if (notify) alert("No factors found on Step 2. Add factors first!");
            return;
        }

        const existingItems = window.app.currentProject.lrItems || [];

        const newItems = factors.map(f => {
            const derived = this.deriveProbabilitiesFromFactor(f);
            const existing = existingItems.find(item => item.factorId === f.id || item.id === `lr_factor_${f.id}`);
            const isManual = existing && existing.manuallyEdited && !notify;

            // Preserve student manual edits on the rationale; otherwise use auto-derived rationale
            let explanation = derived.rationale;
            if (existing && existing.explanation && existing.manuallyEdited) {
                explanation = existing.explanation;
            }

            return {
                id: `lr_factor_${f.id}`,
                factorId: f.id,
                title: `Evidence: ${f.name} (${f.target || 'Witness'})`,
                description: f.caseDescription || `Psychological evidence regarding ${f.name}.`,
                importance: f.importance !== null && f.importance !== undefined ? f.importance : null,
                direction: f.direction || 'decreases',
                isPending: derived.isPending,
                php: isManual ? existing.php : derived.php,
                phd: isManual ? existing.phd : derived.phd,
                explanation: explanation,
                manuallyEdited: isManual ? true : false,
                autoDerived: true
            };
        });

        window.app.currentProject.lrItems = newItems;
        this.renderEvidenceCards();
        this.renderCalculations();
        window.app.saveState();
        if (notify) window.app.showNotification("Calculated Likelihood Ratios from your factor evaluations!", "success");
    }

    renderEvidenceCards() {
        const container = document.getElementById('lr-items-container');
        if (!container) return;

        const items = this.getLRItems();
        const factors = window.app?.currentProject?.factors || [];

        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state-card" style="padding: 2.5rem; text-align: center;">
                    <i class="fas fa-calculator" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 0.75rem;"></i>
                    <h4>No Evidence Items Available</h4>
                    <p style="color: var(--text-secondary); max-width: 460px; margin: 0 auto 1.25rem auto;">
                        Please add factors in Step 2 and evaluate them across the 3 pillars in Step 3. They will automatically be translated into Likelihood Ratios here.
                    </p>
                    <button class="btn btn-primary" onclick="window.app.switchTab('factors')">
                        <i class="fas fa-plus"></i> Go to Step 2: Add Factors
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map((item, idx) => {
            const php = item.php || 0.5;
            const phd = item.phd || 0.5;
            const lr = php / Math.max(0.001, phd);
            const scale = this.getJaroszWileyScale(lr);
            const importance = item.importance !== null && item.importance !== undefined ? `${item.importance}/10` : 'Not set';
            const factor = factors.find(f => f.id === item.factorId);

            // Build rich Step 3 literature tooltip HTML
            let notesTooltipHTML = '';
            let avgQuality = '—';
            if (factor) {
                const rep = factor.replicabilityScore;
                const gen = factor.generalizabilityScore;
                const rel = factor.relevanceScore;
                if (rep !== null && gen !== null && rel !== null && rep !== undefined && gen !== undefined && rel !== undefined) {
                    avgQuality = ((rep + gen + rel) / 3).toFixed(1);
                }

                notesTooltipHTML = `&lt;div style=&quot;font-size: 0.8rem; line-height: 1.45; max-width: 380px;&quot;&gt;&lt;div style=&quot;font-weight: 800; color: #10b981; margin-bottom: 0.35rem; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 0.25rem;&quot;&gt;&lt;i class=&quot;fas fa-microscope&quot;&gt;&lt;/i&gt; Step 3 Scientific Quality for ${factor.name.replace(/"/g, '&quot;')}&lt;/div&gt;`
                    + (factor.replicabilityNotes ? `&lt;div style=&quot;margin-bottom: 0.3rem;&quot;&gt;&lt;strong style=&quot;color: #38bdf8;&quot;&gt;1. Replicability (${rep !== null && rep !== undefined ? `${rep}/5` : '—'}):&lt;/strong&gt; &lt;span style=&quot;color: #cbd5e1;&quot;&gt;${factor.replicabilityNotes.replace(/"/g, '&quot;')}&lt;/span&gt;&lt;/div&gt;` : '')
                    + (factor.generalizabilityNotes ? `&lt;div style=&quot;margin-bottom: 0.3rem;&quot;&gt;&lt;strong style=&quot;color: #fbbf24;&quot;&gt;2. Generalizability (${gen !== null && gen !== undefined ? `${gen}/5` : '—'}):&lt;/strong&gt; &lt;span style=&quot;color: #cbd5e1;&quot;&gt;${factor.generalizabilityNotes.replace(/"/g, '&quot;')}&lt;/span&gt;&lt;/div&gt;` : '')
                    + (factor.relevanceNotes ? `&lt;div&gt;&lt;strong style=&quot;color: #10b981;&quot;&gt;3. Practical Relevance (${rel !== null && rel !== undefined ? `${rel}/5` : '—'}):&lt;/strong&gt; &lt;span style=&quot;color: #cbd5e1;&quot;&gt;${factor.relevanceNotes.replace(/"/g, '&quot;')}&lt;/span&gt;&lt;/div&gt;` : '')
                    + `&lt;/div&gt;`;
            }

            return `
                <div class="lr-card" id="lr-card-${item.id}">
                    <!-- Card Header -->
                    <div class="lr-card-header">
                        <div>
                            <div class="lr-item-title">${item.title}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem; display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
                                <span><i class="fas fa-star" style="color: var(--eur-gold);"></i> Importance: <strong>${importance}</strong></span>
                                <span><i class="fas fa-tag" style="color: var(--eur-cyan);"></i> Validity Impact: <strong>${item.direction || 'decreases'}</strong></span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                            ${item.isPending ? `
                                <span class="badge" style="background: rgba(239, 68, 68, 0.12); color: var(--eur-danger); border: 1px solid rgba(239, 68, 68, 0.35);">
                                    <i class="fas fa-exclamation-circle"></i> Step 3 Incomplete
                                </span>
                                <button class="btn btn-secondary btn-sm" onclick="window.app.switchTab('checklist')">
                                    <i class="fas fa-edit"></i> Rate in Step 3
                                </button>
                            ` : `
                                <span class="lr-badge ${scale.badgeClass}">${scale.text} (LR: ${lr.toFixed(2)})</span>
                                <button class="btn btn-secondary btn-sm" onclick="window.lrLabApp.resetItemToAuto('${item.id}')" title="Reset this item to auto-calculated probabilities"><i class="fas fa-magic"></i> Auto</button>
                            `}
                            <button class="card-collapse-btn" onclick="window.lrLabApp.toggleCardCollapse('${item.id}')" title="Collapse or expand this evidence card">
                                <i class="fas fa-chevron-down"></i>
                            </button>
                        </div>
                    </div>

                    <p class="lr-card-desc">${item.description}</p>

                    <!-- Compact Step 3 Quality Hover Trigger (Replaces massive text block) -->
                    ${factor && (factor.replicabilityNotes || factor.generalizabilityNotes || factor.relevanceNotes) ? `
                        <div style="margin-bottom: 0.75rem;">
                            <span class="info-hover-badge" data-tooltip="${notesTooltipHTML}">
                                <i class="fas fa-microscope"></i> Step 3 Scientific Quality: <strong>${avgQuality} / 5.0</strong> (Hover to view citations &amp; literature notes)
                            </span>
                        </div>
                    ` : ''}

                    <!-- Sliders Grid -->
                    <div class="lr-sliders-grid">
                        <!-- P(E | H1) -->
                        <div class="slider-group">
                            <div class="slider-header">
                                <label class="info-tip-trigger" data-tooltip="&lt;div style=&quot;font-size:0.78rem;&quot;&gt;&lt;strong style=&quot;color:#60a5fa;&quot;&gt;P(Evidence | H1):&lt;/strong&gt; Probability of observing this witness statement/identification if Hypothesis 1 is TRUE.&lt;/div&gt;">
                                    <i class="fas fa-check-circle text-primary"></i> P(Evidence | H<sub>1</sub>) <span class="info-tip"><i class="fas fa-info"></i></span>
                                </label>
                                <span class="prob-val" id="val-php-${item.id}">${(php * 100).toFixed(0)}%</span>
                            </div>
                            <div class="slider-sub">Probability of this evidence if <strong>H1 is TRUE</strong> (Primary Proposition)</div>
                            <input type="range" min="0.01" max="0.99" step="0.01" value="${php}" 
                                oninput="window.lrLabApp.updateProbability('${item.id}', 'php', this.value)">
                        </div>

                        <!-- P(E | H2) -->
                        <div class="slider-group">
                            <div class="slider-header">
                                <label class="info-tip-trigger" data-tooltip="&lt;div style=&quot;font-size:0.78rem;&quot;&gt;&lt;strong style=&quot;color:#fbbf24;&quot;&gt;P(Evidence | H2):&lt;/strong&gt; Probability of observing this witness statement/identification if Hypothesis 2 is TRUE.&lt;/div&gt;">
                                    <i class="fas fa-times-circle text-warning"></i> P(Evidence | H<sub>2</sub>) <span class="info-tip"><i class="fas fa-info"></i></span>
                                </label>
                                <span class="prob-val" id="val-phd-${item.id}">${(phd * 100).toFixed(0)}%</span>
                            </div>
                            <div class="slider-sub">Probability of this evidence if <strong>H2 is TRUE</strong> (Alternative Proposition)</div>
                            <input type="range" min="0.01" max="0.99" step="0.01" value="${phd}" 
                                oninput="window.lrLabApp.updateProbability('${item.id}', 'phd', this.value)">
                        </div>
                    </div>

                    <!-- Clean Mathematical Display with Hover Context -->
                    <div class="clean-math-display" id="math-display-${item.id}">
                        <div class="math-fraction-group info-tip-trigger" data-tooltip="&lt;div style=&quot;font-size:0.78rem;&quot;&gt;&lt;strong style=&quot;color:#38bdf8;&quot;&gt;Likelihood Ratio (Rassin et al., 2022)&lt;/strong&gt;&lt;br/&gt;LR = P(E|H1) / P(E|H2) = ${php.toFixed(2)} / ${phd.toFixed(2)} = ${lr.toFixed(2)}&lt;br/&gt;Log-diagnosticity: log10(LR) = ${Math.log10(lr).toFixed(2)}&lt;/div&gt;">
                            <span class="math-var">LR</span>
                            <span class="math-op">=</span>
                            <div class="math-frac">
                                <span class="frac-top">P(Evidence | H<sub>1</sub>)</span>
                                <span class="frac-bottom">P(Evidence | H<sub>2</sub>)</span>
                            </div>
                            <span class="math-op">=</span>
                            <div class="math-frac">
                                <span class="frac-top">${php.toFixed(2)}</span>
                                <span class="frac-bottom">${phd.toFixed(2)}</span>
                            </div>
                            <span class="math-op">=</span>
                            <span class="math-result"><strong>${lr.toFixed(2)}</strong></span>
                            <span class="math-log">[log₁₀(LR) = ${Math.log10(lr).toFixed(2)}]</span>
                        </div>
                    </div>

                    <!-- Explanatory Text Box -->
                    <div class="lr-rationale-box">
                        <div class="exp-title"><i class="fas fa-pen"></i> Forensic Rationale (Rassin et al., 2022)</div>
                        <textarea class="lr-exp-textarea" placeholder="Explain the psychological and empirical rationale for these conditional probabilities in your case..."
                            oninput="window.lrLabApp.updateExplanation('${item.id}', this.value)">${item.explanation || ''}</textarea>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateProbability(itemId, type, value) {
        const items = this.getLRItems();
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        item.manuallyEdited = true;
        const valFloat = parseFloat(value);
        if (type === 'php') {
            item.php = valFloat;
            const disp = document.getElementById(`val-php-${itemId}`);
            if (disp) disp.textContent = `${(valFloat * 100).toFixed(0)}%`;
        } else {
            item.phd = valFloat;
            const disp = document.getElementById(`val-phd-${itemId}`);
            if (disp) disp.textContent = `${(valFloat * 100).toFixed(0)}%`;
        }

        const php = item.php || 0.5;
        const phd = item.phd || 0.5;
        const lr = php / Math.max(0.001, phd);
        const scale = this.getJaroszWileyScale(lr);
        
        const card = document.getElementById(`lr-card-${itemId}`);
        if (card) {
            const badge = card.querySelector('.lr-badge');
            if (badge) {
                badge.className = `lr-badge ${scale.badgeClass}`;
                badge.textContent = `${scale.text} (LR: ${lr.toFixed(2)})`;
            }
            const mathGroup = card.querySelector('.math-fraction-group');
            if (mathGroup) {
                mathGroup.innerHTML = `
                    <span class="math-var">LR</span>
                    <span class="math-op">=</span>
                    <div class="math-frac">
                        <span class="frac-top">P(Evidence | H<sub>1</sub>)</span>
                        <span class="frac-bottom">P(Evidence | H<sub>2</sub>)</span>
                    </div>
                    <span class="math-op">=</span>
                    <div class="math-frac">
                        <span class="frac-top">${php.toFixed(2)}</span>
                        <span class="frac-bottom">${phd.toFixed(2)}</span>
                    </div>
                    <span class="math-op">=</span>
                    <span class="math-result"><strong>${lr.toFixed(2)}</strong></span>
                    <span class="math-log">[log₁₀(LR) = ${Math.log10(lr).toFixed(2)}]</span>
                `;
            }
        }

        this.renderCalculations();
        window.app.saveState();
    }

    resetItemToAuto(itemId) {
        const items = this.getLRItems();
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        item.manuallyEdited = false;
        const factors = window.app?.currentProject?.factors || [];
        const factor = factors.find(f => f.id === item.factorId) || {
            importance: item.importance,
            direction: item.direction,
            replicabilityScore: null,
            generalizabilityScore: null,
            relevanceScore: null
        };

        const derived = this.deriveProbabilitiesFromFactor(factor);
        item.php = derived.php;
        item.phd = derived.phd;
        item.isPending = derived.isPending;
        item.explanation = derived.rationale;

        this.renderEvidenceCards();
        this.renderCalculations();
        window.app.saveState();
        window.app.showNotification(`Reset item to auto-calculated probabilities!`, 'info');
    }

    updateExplanation(itemId, text) {
        const items = this.getLRItems();
        const item = items.find(i => i.id === itemId);
        if (item) {
            item.explanation = text;
            window.app.saveState();
        }
    }

    toggleCardCollapse(itemId) {
        const card = document.getElementById(`lr-card-${itemId}`);
        if (!card) return;
        const isCollapsed = card.classList.toggle('collapsed');
        const btnIcon = card.querySelector('.card-collapse-btn i');
        if (btnIcon) {
            btnIcon.className = isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-down';
        }
    }

    toggleCollapseAllCards() {
        const cards = document.querySelectorAll('.lr-card');
        if (cards.length === 0) return;

        const anyExpanded = Array.from(cards).some(c => !c.classList.contains('collapsed'));
        const targetCollapsed = anyExpanded;

        cards.forEach(card => {
            if (targetCollapsed) {
                card.classList.add('collapsed');
                const btnIcon = card.querySelector('.card-collapse-btn i');
                if (btnIcon) btnIcon.className = 'fas fa-chevron-right';
            } else {
                card.classList.remove('collapsed');
                const btnIcon = card.querySelector('.card-collapse-btn i');
                if (btnIcon) btnIcon.className = 'fas fa-chevron-down';
            }
        });

        const toggleBtn = document.getElementById('btn-toggle-all-cards');
        if (toggleBtn) {
            toggleBtn.innerHTML = targetCollapsed 
                ? `<i class="fas fa-expand-alt"></i> <span>Expand All</span>` 
                : `<i class="fas fa-compress-alt"></i> <span>Collapse All</span>`;
        }
    }

    getJaroszWileyScale(lr) {
        const match = APP_DATA.jaroszWileyScale.find(s => lr >= s.minLR && lr < s.maxLR);
        return match || { text: "No evidence / Neutral (LR ≈ 1)", badgeClass: "badge-lr-neutral" };
    }

    // Retained for backward-compatibility
    getENFSIVerbalScale(lr) {
        return this.getJaroszWileyScale(lr);
    }

    setCompoundingMode(mode) {
        this.compoundingMode = mode;
        this.renderCalculations();
        if (window.app) window.app.saveState();
    }

    calculateDirectCompoundLR() {
        const items = this.getLRItems();
        if (items.length === 0) return 1.0;
        let compound = 1.0;
        items.forEach(item => {
            const php = item.php || 0.5;
            const phd = item.phd || 0.5;
            compound *= (php / Math.max(0.001, phd));
        });
        return compound;
    }

    calculateRawCompoundLR() {
        return this.calculateDirectCompoundLR();
    }

    calculateInterdependentCompoundLR() {
        const items = this.getLRItems();
        if (items.length === 0) return 1.0;
        if (items.length === 1) {
            const php = items[0].php || 0.5;
            const phd = items[0].phd || 0.5;
            return php / Math.max(0.001, phd);
        }

        // Group factors by person/source (e.g. Witness de Jong, Suspect Nigel, Victim)
        const groups = {};
        items.forEach(item => {
            const person = (item.target || 'Witness').trim();
            if (!groups[person]) groups[person] = [];
            groups[person].push(item);
        });

        // Compute compound LR:
        // Within each person/observer group with k >= 2 factors, apply correlation dampening (rho = 0.35).
        // Across separate independent observers/groups, multiply directly.
        let compoundLR = 1.0;
        const rho = 0.35;

        Object.values(groups).forEach(groupItems => {
            let groupDirectLR = 1.0;
            groupItems.forEach(it => {
                const php = it.php || 0.5;
                const phd = it.phd || 0.5;
                groupDirectLR *= (php / Math.max(0.001, phd));
            });

            const k = groupItems.length;
            if (k <= 1 || groupDirectLR <= 0) {
                compoundLR *= groupDirectLR;
            } else {
                const inflFactor = 1 + (k - 1) * rho;
                const log10Group = Math.log10(groupDirectLR);
                const dampenedGroupLR = Math.pow(10, log10Group / inflFactor);
                compoundLR *= dampenedGroupLR;
            }
        });

        return compoundLR;
    }

    calculateCompoundLR() {
        return this.compoundingMode === 'interdependent'
            ? this.calculateInterdependentCompoundLR()
            : this.calculateDirectCompoundLR();
    }

    renderCalculations() {
        const directLR = this.calculateDirectCompoundLR();
        const dependentLR = this.calculateInterdependentCompoundLR();
        const effectiveLR = this.calculateCompoundLR();
        const items = this.getLRItems();
        const scale = this.getJaroszWileyScale(effectiveLR);

        // Update DOM
        const lrValElem = document.getElementById('res-compound-lr');
        const lrVerbalElem = document.getElementById('res-verbal-scale');
        const warningElem = document.getElementById('compound-dependence-warning');

        if (lrValElem) lrValElem.textContent = effectiveLR.toFixed(2);
        if (lrVerbalElem) {
            lrVerbalElem.textContent = scale.text;
            lrVerbalElem.className = `verbal-scale-display ${scale.badgeClass}`;
        }

        if (warningElem) {
            if (items.length > 1) {
                const isDirect = this.compoundingMode !== 'interdependent';
                const textColor = isDirect ? '#10b981' : '#f59e0b';
                const n = items.length;

                // Build formula string with colored items
                const formulaParts = items.map((item, idx) => {
                    const php = item.php || 0.5;
                    const phd = item.phd || 0.5;
                    const itemLR = php / Math.max(0.001, phd);
                    return `<span style="color: ${textColor}; font-weight: 600;">LR<sub>${idx + 1}</sub> (${itemLR.toFixed(2)})</span>`;
                });
                const formulaStr = formulaParts.join(` <span style="color: ${textColor}; font-weight: 700;">&times;</span> `);

                // Group analysis for Conservative Mode
                const groups = {};
                items.forEach(item => {
                    const person = (item.target || 'Witness').trim();
                    if (!groups[person]) groups[person] = [];
                    groups[person].push(item);
                });

                const groupEntries = Object.entries(groups);
                const hasMultiFactorPerson = groupEntries.some(([person, gItems]) => gItems.length > 1);

                const wagenaarTooltipHTML = `&lt;div style=&quot;font-size: 0.8rem; line-height: 1.5; max-width: 440px;&quot;&gt;&lt;div style=&quot;font-weight: 800; color: #38bdf8; margin-bottom: 0.35rem; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 0.25rem;&quot;&gt;&lt;i class=&quot;fas fa-graduation-cap&quot;&gt;&lt;/i&gt; Compounding Case Example (Rassin et al., 2022 / Wagenaar &amp; van der Schrier, 1996)&lt;/div&gt;&lt;p style=&quot;margin: 0 0 0.45rem 0;&quot;&gt;In the robbery case analyzed by Rassin et al. (2022), two separate witnesses evaluated the perpetrator under different physical conditions:&lt;/p&gt;&lt;div style=&quot;background: rgba(255,255,255,0.08); padding: 0.5rem 0.65rem; border-radius: 4px; margin-bottom: 0.45rem; border-left: 3px solid #10b981;&quot;&gt;&lt;strong style=&quot;color: #10b981;&quot;&gt;1. Witness 1 (de Jong - Close proximity, 10 lux):&lt;/strong&gt;&lt;br/&gt;&amp;bull; Identified suspect: P(E|Guilt) = 82%, P(E|Innocence) = 6%&lt;br/&gt;&amp;bull; &lt;strong&gt;LR&lt;sub&gt;1&lt;/sub&gt; = 82% / 6% = 13.67 &amp;approx; 14.00&lt;/strong&gt; (Strong support for Guilt)&lt;br/&gt;&lt;strong style=&quot;color: #f59e0b; margin-top: 0.3rem; display: inline-block;&quot;&gt;2. Witness 2 (Offermans - 7 meters distance, 10 lux):&lt;/strong&gt;&lt;br/&gt;&amp;bull; Non-identification: P(E|Guilt) = 28%, P(E|Innocence) = 93%&lt;br/&gt;&amp;bull; &lt;strong&gt;LR&lt;sub&gt;2&lt;/sub&gt; = 28% / 93% = 0.301 &amp;approx; 0.30&lt;/strong&gt; (Substantial support for Innocence)&lt;br/&gt;&lt;div style=&quot;border-top: 1px dashed rgba(255,255,255,0.2); margin-top: 0.35rem; padding-top: 0.35rem;&quot;&gt;&lt;strong style=&quot;color: #38bdf8;&quot;&gt;Compound Likelihood Ratio:&lt;/strong&gt;&lt;br/&gt;&lt;strong&gt;Compound LR = LR&lt;sub&gt;1&lt;/sub&gt; &amp;times; LR&lt;sub&gt;2&lt;/sub&gt; = 14.00 &amp;times; 0.30 = 4.20&lt;/strong&gt;&lt;br/&gt;&lt;em&gt;(Verbal Scale: Substantial support for Guilt / H&lt;sub&gt;1&lt;/sub&gt;)&lt;/em&gt;&lt;/div&gt;&lt;/div&gt;&lt;div style=&quot;font-size: 0.72rem; color: #cbd5e1;&quot;&gt;&lt;i class=&quot;fas fa-info-circle&quot;&gt;&lt;/i&gt; &lt;strong&gt;Methodological Takeaway:&lt;/strong&gt; Because de Jong and Offermans are two independent observers with separate cognitive systems, direct compounding is methodologically sound. If multiple factors co-occur on a &lt;em&gt;single witness's memory trace&lt;/em&gt;, discuss shared cognitive variance in your report or use the conservative option.&lt;/div&gt;&lt;/div&gt;`;

                const inflFactor = (1 + (n - 1) * 0.35).toFixed(2);

                warningElem.style.display = 'block';
                warningElem.innerHTML = `
                    <div class="methodology-nuance-card" style="font-size: 0.76rem; margin-top: 0.75rem; background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.25); padding: 0.95rem; border-radius: var(--radius-md); line-height: 1.45;">
                        <div style="font-weight: 800; color: var(--eur-cyan); margin-bottom: 0.6rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.3rem;">
                            <span style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem;">
                                <i class="fas fa-calculator" style="color: var(--eur-gold);"></i> Methodological Compounding Models
                            </span>
                            <span class="badge" style="background: ${isDirect ? 'rgba(0, 163, 112, 0.2)' : 'rgba(217, 119, 6, 0.2)'}; color: ${isDirect ? '#10b981' : '#f59e0b'}; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: var(--radius-full);">
                                <i class="${isDirect ? 'fas fa-check-circle' : 'fas fa-balance-scale'}"></i> ${isDirect ? 'Direct Product Active' : 'Conservative Dampened Active'}
                            </span>
                        </div>

                        <!-- Interactive Compounding Mode Switcher -->
                        <div class="compounding-mode-bar">
                            <button type="button" class="compounding-mode-btn ${isDirect ? 'active direct-active' : ''}" onclick="window.lrLabApp.setCompoundingMode('direct')" title="Direct multiplication (Rassin et al., 2022) for independent witnesses/evidence">
                                <i class="fas fa-calculator"></i>
                                <span>Direct Product</span>
                                <span class="mode-val-badge">${directLR.toFixed(2)}</span>
                            </button>
                            <button type="button" class="compounding-mode-btn ${!isDirect ? 'active conservative-active' : ''}" onclick="window.lrLabApp.setCompoundingMode('interdependent')" title="Dampened for correlated factors on the same single witness memory trace">
                                <i class="fas fa-shield-halved"></i>
                                <span>Conservative</span>
                                <span class="mode-val-badge">${dependentLR.toFixed(2)}</span>
                            </button>
                        </div>

                        <!-- Calculation Formula Breakdown (Color Themed: Green for Direct, Yellow/Gold for Conservative) -->
                        <div style="background: ${isDirect ? 'rgba(0, 163, 112, 0.08)' : 'rgba(217, 119, 6, 0.08)'}; border: 1px solid ${isDirect ? 'rgba(0, 163, 112, 0.4)' : 'rgba(217, 119, 6, 0.4)'}; border-radius: var(--radius-sm); padding: 0.65rem 0.85rem; margin-bottom: 0.65rem; font-family: var(--font-mono); font-size: 0.75rem; line-height: 1.5; color: ${textColor};">
                            ${isDirect ? `
                                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.35rem;">
                                    <span><strong style="color: #10b981;"><i class="fas fa-calculator"></i> Direct Product:</strong> ${formulaStr}</span>
                                    <span style="font-weight: 800; color: #10b981; font-size: 0.9rem;">= ${directLR.toFixed(2)}</span>
                                </div>
                            ` : `
                                <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.35rem; border-bottom: 1px dashed rgba(217, 119, 6, 0.25); padding-bottom: 0.35rem;">
                                        <span><strong style="color: #f59e0b;"><i class="fas fa-layer-group"></i> 1. Individual Factors Base:</strong> ${formulaStr}</span>
                                        <span style="font-weight: 700; color: #f59e0b; font-size: 0.82rem;">= ${directLR.toFixed(2)}</span>
                                    </div>
                                    ${hasMultiFactorPerson ? `
                                        <div style="font-size: 0.73rem; line-height: 1.45; color: #f59e0b;">
                                            <strong style="color: #f59e0b;"><i class="fas fa-user-group"></i> 2. Person/Source Trace Adjustment (ρ = 0.35 on co-occurring factors):</strong><br/>
                                            ${groupEntries.map(([person, gItems]) => {
                                                const k = gItems.length;
                                                let gLR = 1.0;
                                                const gParts = gItems.map(it => {
                                                    const idx = items.indexOf(it) + 1;
                                                    const itLR = (it.php || 0.5) / Math.max(0.001, it.phd || 0.5);
                                                    gLR *= itLR;
                                                    return `LR<sub>${idx}</sub> (${itLR.toFixed(2)})`;
                                                });
                                                if (k > 1) {
                                                    const gInfl = (1 + (k - 1) * 0.35).toFixed(2);
                                                    const dLR = Math.pow(10, Math.log10(gLR) / (1 + (k - 1) * 0.35));
                                                    return `&bull; <strong>${person}</strong> (${k} shared cues): ${gParts.join(' &times; ')} = ${gLR.toFixed(2)} &rarr; Dampened: <strong>${dLR.toFixed(2)}</strong>`;
                                                } else {
                                                    return `&bull; <strong>${person}</strong> (1 cue / independent): ${gParts[0]}`;
                                                }
                                            }).join('<br/>')}
                                        </div>
                                    ` : `
                                        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.35rem;">
                                            <span><strong style="color: #f59e0b;"><i class="fas fa-shield-halved"></i> 2. Single-Source Adjustment (ρ = 0.35, n = ${n}):</strong> 10^[ log₁₀(${directLR.toFixed(2)}) / ${(1 + (n - 1) * 0.35).toFixed(2)} ]</span>
                                            <span style="font-weight: 800; color: #f59e0b; font-size: 0.88rem;">= ${dependentLR.toFixed(2)}</span>
                                        </div>
                                    `}
                                </div>
                            `}
                        </div>

                        <!-- 2 Nuance Scenarios: Clickable Interactive Selection Cards -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.55rem;">
                            <!-- Scenario 1: Separate Witnesses -->
                            <div class="compounding-scenario-card" onclick="window.lrLabApp.setCompoundingMode('direct')"
                                 style="background: ${isDirect ? 'rgba(0, 163, 112, 0.14)' : 'rgba(0, 163, 112, 0.04)'}; border: 1px solid rgba(0, 163, 112, ${isDirect ? '0.6' : '0.2'}); border-left: 3px solid #10b981; border-radius: var(--radius-sm); padding: 0.5rem 0.6rem;"
                                 data-tooltip="&lt;div style=&quot;font-size:0.8rem; line-height:1.45;&quot;&gt;&lt;strong style=&quot;color:#10b981;&quot;&gt;Independent Evidence Sources (Rassin et al., 2022)&lt;/strong&gt;&lt;p style=&quot;margin:0.25rem 0 0 0;&quot;&gt;When factors stem from separate witnesses or separate procedures, errors are independent. Direct multiplication (LR1 &times; LR2 &times; ...) is mathematically and methodologically sound.&lt;/p&gt;&lt;/div&gt;">
                                <div style="font-weight: 700; color: #10b981; margin-bottom: 0.2rem; font-size: 0.74rem; display: flex; align-items: center; justify-content: space-between;">
                                    <span><i class="fas fa-check-circle"></i> Separate Observers</span>
                                    <span class="info-tip"><i class="fas fa-info"></i></span>
                                </div>
                                <p style="margin: 0; color: var(--text-secondary); font-size: 0.7rem; line-height: 1.35;">
                                    Independent witnesses / distinct procedures → Direct multiplication applies.
                                </p>
                            </div>

                            <!-- Scenario 2: Same Witness Memory Trace -->
                            <div class="compounding-scenario-card" onclick="window.lrLabApp.setCompoundingMode('interdependent')"
                                 style="background: ${!isDirect ? 'rgba(217, 119, 6, 0.14)' : 'rgba(217, 119, 6, 0.04)'}; border: 1px solid rgba(217, 119, 6, ${!isDirect ? '0.6' : '0.2'}); border-left: 3px solid #f59e0b; border-radius: var(--radius-sm); padding: 0.5rem 0.6rem;"
                                 data-tooltip="&lt;div style=&quot;font-size:0.8rem; line-height:1.45;&quot;&gt;&lt;strong style=&quot;color:#fbbf24;&quot;&gt;Shared Cognitive Variance&lt;/strong&gt;&lt;p style=&quot;margin:0.25rem 0 0 0;&quot;&gt;Multiple estimator variables affecting the same witness memory trace share underlying variance. Apply conservative dampening or address correlation in your written expert opinion.&lt;/p&gt;&lt;/div&gt;">
                                <div style="font-weight: 700; color: #f59e0b; margin-bottom: 0.2rem; font-size: 0.74rem; display: flex; align-items: center; justify-content: space-between;">
                                    <span><i class="fas fa-balance-scale"></i> Same Witness Trace</span>
                                    <span class="info-tip"><i class="fas fa-info"></i></span>
                                </div>
                                <p style="margin: 0; color: var(--text-secondary); font-size: 0.7rem; line-height: 1.35;">
                                    Shared cognitive variance → Use conservative mode or add nuance in court.
                                </p>
                            </div>
                        </div>

                        <!-- Tooltip Interactive Hover -->
                        <div style="display: flex; justify-content: flex-end; align-items: center; border-top: 1px dashed var(--border-color); padding-top: 0.4rem;">
                            <span class="concept-tip" style="cursor: pointer; text-decoration: underline dotted; color: var(--eur-cyan); font-weight: 600; font-size: 0.72rem;" data-tooltip="${wagenaarTooltipHTML}">
                                <i class="fas fa-book-open"></i> Hover for Wagenaar (1996) / Rassin (2022) 2-witness case study &amp; calculation
                            </span>
                        </div>
                    </div>
                `;
            } else {
                warningElem.style.display = 'none';
            }
        }

        // Render Dynamic Forensic Verbal Interpretation & Prosecutor's Fallacy Safeguard
        const interpretationContainer = document.getElementById('dynamic-forensic-interpretation-container');
        if (interpretationContainer) {
            const hypos = this.getHypotheses();
            const hypoH1Text = hypos.hp ? `H₁: ${hypos.hp}` : 'H₁ (Primary Proposition)';
            const hypoH2Text = hypos.hd ? `H₂: ${hypos.hd}` : 'H₂ (Alternative Proposition)';

            let correctStatement = "";
            let prohibitedPct = 50;

            if (effectiveLR > 1.05) {
                prohibitedPct = Math.min(99, Math.max(50, Math.round((effectiveLR / (1 + effectiveLR)) * 100)));
                const ratioStr = effectiveLR >= 100 ? `${Math.round(effectiveLR)}` : effectiveLR.toFixed(2);
                correctStatement = `The psychological evidence is approximately <strong>${ratioStr} times more likely</strong> under the primary hypothesis (<em>${hypoH1Text}</em>) than under the alternative hypothesis (<em>${hypoH2Text}</em>), providing <strong>${scale.text.toLowerCase()}</strong>.`;
            } else if (effectiveLR < 0.95) {
                const invLR = 1 / Math.max(0.001, effectiveLR);
                prohibitedPct = Math.min(99, Math.max(50, Math.round((invLR / (1 + invLR)) * 100)));
                const ratioStr = invLR >= 100 ? `${Math.round(invLR)}` : invLR.toFixed(2);
                correctStatement = `The psychological evidence is approximately <strong>${ratioStr} times more likely</strong> under the alternative hypothesis (<em>${hypoH2Text}</em>) than under the primary hypothesis (<em>${hypoH1Text}</em>), providing <strong>${scale.text.toLowerCase()}</strong>.`;
            } else {
                correctStatement = `The psychological evidence is <strong>equally likely</strong> under both hypotheses (<em>${hypoH1Text}</em> vs. <em>${hypoH2Text}</em>), providing <strong>neutral / inconclusive evidence</strong> (LR = 1.00).`;
            }

            interpretationContainer.innerHTML = `
                <div class="forensic-interpretation-card" style="margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 0.85rem;">
                    <div style="font-size: 0.84rem; font-weight: 700; color: var(--eur-cyan); margin-bottom: 0.55rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.35rem;">
                        <span style="display: flex; align-items: center; gap: 0.35rem;">
                            <i class="fas fa-gavel" style="color: var(--eur-gold);"></i> Forensic Verbal Interpretation & Phrasing
                        </span>
                        <span class="badge ${scale.badgeClass}" style="font-size: 0.7rem; font-weight: 700;">
                            Compound LR: ${effectiveLR.toFixed(2)}
                        </span>
                    </div>

                    <!-- 1. Collapsible: Scientifically & Legally Sound Statement (Click to expand) -->
                    <div class="collapsible-box collapsed" id="lr-statement-box" style="margin-top: 0.5rem; border-left: 3.5px solid var(--eur-green); background: var(--bg-surface-elevated);">
                        <div class="collapsible-header" onclick="window.app.toggleCollapsibleBox('lr-statement-box')" style="padding: 0.65rem 0.85rem;">
                            <div style="display: flex; align-items: center; gap: 0.45rem; font-size: 0.78rem; font-weight: 700; color: var(--eur-green);">
                                <i class="fas fa-check-circle"></i>
                                <span>Scientifically & Legally Sound Statement (for Report & Court)</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.45rem;">
                                <span class="badge badge-outline" style="font-size: 0.68rem;">Click to expand</span>
                                <i class="fas fa-chevron-down collapse-icon" style="font-size: 0.75rem;"></i>
                            </div>
                        </div>
                        <div class="collapsible-content" style="padding: 0.8rem 0.95rem; font-size: 0.8rem; line-height: 1.5; color: var(--text-primary); background: rgba(0, 163, 112, 0.04);">
                            <div style="font-style: italic; margin-bottom: 0.4rem; color: var(--text-primary); border-left: 2px solid var(--eur-green); padding-left: 0.6rem;">
                                "${correctStatement}"
                            </div>
                            <div style="font-size: 0.72rem; color: var(--text-muted);">
                                <i class="fas fa-info-circle"></i> <strong>Court Guidance:</strong> This statement describes the likelihood of the psychological evidence under both competing propositions without expressing an opinion on guilt.
                            </div>
                        </div>
                    </div>

                    <!-- 2. Collapsible: Avoid the Prosecutor's Fallacy (Click to expand) -->
                    <div class="collapsible-box collapsed" id="lr-fallacy-box" style="margin-top: 0.55rem; border-left: 3.5px solid var(--eur-danger); background: var(--bg-surface-elevated);">
                        <div class="collapsible-header" onclick="window.app.toggleCollapsibleBox('lr-fallacy-box')" style="padding: 0.65rem 0.85rem;">
                            <div style="display: flex; align-items: center; gap: 0.45rem; font-size: 0.78rem; font-weight: 700; color: var(--eur-danger);">
                                <i class="fas fa-ban"></i>
                                <span>Avoid the Prosecutor's Fallacy (Transposing the Conditional)</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.45rem;">
                                <span class="badge badge-outline" style="font-size: 0.68rem;">Click to expand</span>
                                <i class="fas fa-chevron-down collapse-icon" style="font-size: 0.75rem;"></i>
                            </div>
                        </div>
                        <div class="collapsible-content" style="padding: 0.8rem 0.95rem; font-size: 0.75rem; line-height: 1.48; background: rgba(239, 68, 68, 0.04);">
                            <p style="margin: 0 0 0.4rem 0; color: var(--text-secondary);">
                                <strong style="color: var(--eur-danger);">Prohibited Statement:</strong> Never state posterior probabilities of hypotheses or guilt (e.g. <em>"There is a ${prohibitedPct}% probability that the hypothesis is true"</em> or <em>"The suspect is innocent with ${prohibitedPct}% certainty"</em>).
                            </p>
                            <p style="margin: 0; color: var(--text-secondary); font-size: 0.73rem;">
                                As an expert witness, you evaluate <code style="color: var(--eur-cyan);">P(Evidence | Hypothesis)</code>, NOT <code style="color: var(--eur-gold);">P(Hypothesis | Evidence)</code>. Calculating posterior hypothesis probabilities requires prior odds and usurps the Court's exclusive authority over the ultimate issue!
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    switchScaleTab(scaleKey) {
        const btnJw = document.getElementById('tab-scale-jw');
        const btnEnfsi = document.getElementById('tab-scale-enfsi');
        const tableJw = document.getElementById('scale-table-jw');
        const tableEnfsi = document.getElementById('scale-table-enfsi');

        if (scaleKey === 'enfsi') {
            if (btnJw) btnJw.classList.remove('active');
            if (btnEnfsi) btnEnfsi.classList.add('active');
            if (tableJw) tableJw.style.display = 'none';
            if (tableEnfsi) tableEnfsi.style.display = 'block';
        } else {
            if (btnJw) btnJw.classList.add('active');
            if (btnEnfsi) btnEnfsi.classList.remove('active');
            if (tableJw) tableJw.style.display = 'block';
            if (tableEnfsi) tableEnfsi.style.display = 'none';
        }
    }

    /* ===================================================================
       REPORT GENERATION & EXPORT (PDF & WORD .DOC)
       =================================================================== */
    buildReportHTML() {
        const project = window.app.currentProject || {};
        const mandate = project.mandate || {};
        const factors = project.factors || [];
        const lrItems = this.getLRItems();
        const hypos = this.getHypotheses();
        const rawCompoundLR = this.calculateRawCompoundLR();
        const dependentCompoundLR = this.calculateInterdependentCompoundLR();
        const effectiveLR = this.calculateCompoundLR();
        const compoundScale = this.getJaroszWileyScale(effectiveLR);

        const currentDate = new Date().toLocaleDateString('en-GB', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        return `
            <div class="forensic-report" style="font-family: 'Times New Roman', serif, 'Calibri'; color: #082117; line-height: 1.6; max-width: 820px; margin: 0 auto; background: #ffffff; padding: 2.5rem; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                <!-- Report Header -->
                <div style="border-bottom: 3px double #004c38; padding-bottom: 1.25rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h1 style="font-size: 1.6rem; color: #004c38; margin: 0 0 0.3rem 0; font-family: 'Newsreader', Georgia, serif; font-weight: 700;">EXPERT WITNESS REPORT</h1>
                            <div style="font-size: 0.95rem; color: #244739; font-weight: 600;">Evaluation of Psychological Evidence & Likelihood Ratios</div>
                            <div style="font-size: 0.8rem; color: #527a69;">Methodology: Rassin et al. (2022); Scale: Jarosz & Wiley (2014)</div>
                        </div>
                        <div style="text-align: right; font-size: 0.85rem; color: #244739;">
                            <div><strong>Date:</strong> ${currentDate}</div>
                            <div><strong>Field:</strong> Legal & Forensic Psychology</div>
                            <div><strong>Role:</strong> Forensic Psychology Expert</div>
                        </div>
                    </div>
                </div>

                <!-- Section 1: Case Details & Mandate -->
                <div style="margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.15rem; color: #004c38; border-bottom: 1px solid #c4ded2; padding-bottom: 0.25rem; margin-bottom: 0.75rem;">1. Case Information & Competing Hypotheses</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.85rem;">
                        <tr>
                            <td style="padding: 6px; border: 1px solid #c4ded2; background: #f2f7f4; width: 25%;"><strong>Case Reference:</strong></td>
                            <td style="padding: 6px; border: 1px solid #c4ded2;">${mandate.caseTitle || 'Forensic Case Analysis'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px; border: 1px solid #c4ded2; background: #f2f7f4;"><strong>Commissioned By:</strong></td>
                            <td style="padding: 6px; border: 1px solid #c4ded2;">${mandate.commissioner || 'Examining Magistrate / Court'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px; border: 1px solid #c4ded2; background: #f2f7f4;"><strong>Primary Scenario (H1 / Hp):</strong></td>
                            <td style="padding: 6px; border: 1px solid #c4ded2; color: #004c38;"><strong>${hypos.hp}</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 6px; border: 1px solid #c4ded2; background: #f2f7f4;"><strong>Alternative Scenario (H2 / Hd):</strong></td>
                            <td style="padding: 6px; border: 1px solid #c4ded2; color: #d97706;"><strong>${hypos.hd}</strong></td>
                        </tr>
                    </table>
                </div>

                <!-- Section 2: Identified Case Factors Table -->
                <div style="margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.15rem; color: #004c38; border-bottom: 1px solid #c4ded2; padding-bottom: 0.25rem; margin-bottom: 0.75rem;">2. Case Factors & Validity Assessment</h2>
                    ${factors.length === 0 ? '<p style="font-size: 0.85rem; color: #688d7f;">No factors identified yet.</p>' : `
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 1rem;">
                        <thead>
                            <tr style="background: #eaf2ed;">
                                <th style="padding: 6px; border: 1px solid #c4ded2; text-align: left;">Factor Name & Target</th>
                                <th style="padding: 6px; border: 1px solid #c4ded2; text-align: left;">Type</th>
                                <th style="padding: 6px; border: 1px solid #c4ded2; text-align: left;">Validity Impact</th>
                                <th style="padding: 6px; border: 1px solid #c4ded2; text-align: center;">Importance</th>
                                <th style="padding: 6px; border: 1px solid #c4ded2; text-align: left;">Case Facts Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${factors.map(f => `
                                <tr>
                                    <td style="padding: 6px; border: 1px solid #c4ded2;"><strong>${f.name}</strong><br/><span style="font-size: 0.75rem; color: #527a69;">(${f.target || 'Witness'})</span></td>
                                    <td style="padding: 6px; border: 1px solid #c4ded2;">${f.category === 'system' ? 'System Factor' : 'Estimator Factor'}</td>
                                    <td style="padding: 6px; border: 1px solid #c4ded2;">${f.direction === 'increases' ? 'Increases Validity' : (f.direction === 'mixed' ? 'Mixed' : 'Decreases Validity')}</td>
                                    <td style="padding: 6px; border: 1px solid #c4ded2; text-align: center; font-weight: bold;">${f.importance !== null && f.importance !== undefined ? `${f.importance}/10` : '—'}</td>
                                    <td style="padding: 6px; border: 1px solid #c4ded2; font-size: 0.8rem;">${f.caseDescription || 'N/A'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    `}
                </div>

                <!-- Section 3: 3-Pillar Scientific Literature Evaluation -->
                <div style="margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.15rem; color: #004c38; border-bottom: 1px solid #c4ded2; padding-bottom: 0.25rem; margin-bottom: 0.75rem;">3. Scientific Quality Evaluation (The 3 Pillars)</h2>
                    <p style="font-size: 0.85rem; color: #244739; margin-bottom: 0.75rem;">
                        Empirical literature was systematically evaluated across Replicability, Generalizability, and Practical Relevance (Smallest Effect Size of Interest - SESOI & Case Moderators):
                    </p>
                    ${factors.length === 0 ? '<p style="font-size: 0.85rem; color: #688d7f;">No factors evaluated yet.</p>' : factors.map(f => {
                        const rep = f.replicabilityScore !== null && f.replicabilityScore !== undefined ? `${f.replicabilityScore}/5` : 'Unrated';
                        const gen = f.generalizabilityScore !== null && f.generalizabilityScore !== undefined ? `${f.generalizabilityScore}/5` : 'Unrated';
                        const rel = f.relevanceScore !== null && f.relevanceScore !== undefined ? `${f.relevanceScore}/5` : 'Unrated';
                        const isFullyRated = f.replicabilityScore && f.generalizabilityScore && f.relevanceScore;
                        const avgScore = isFullyRated ? ((f.replicabilityScore + f.generalizabilityScore + f.relevanceScore) / 3).toFixed(1) : '—';

                        // Guided questions answers
                        const answers = f.guidedAnswers || {};
                        const repQ = (APP_DATA.guidedQuestionsTemplate.replicability || []).map(q => {
                            const a = answers[q.id];
                            if (!a || !a.selected) return null;
                            const text = a.selected === '__OTHER__' ? `Other: ${a.otherText || 'Specified by student'}` : a.selected;
                            return `<div style="margin-bottom: 0.25rem;"><strong>${q.label}:</strong> <span style="color: #244739;">${text}</span></div>`;
                        }).filter(Boolean);

                        const genQ = (APP_DATA.guidedQuestionsTemplate.generalizability || []).map(q => {
                            const a = answers[q.id];
                            if (!a || !a.selected) return null;
                            const text = a.selected === '__OTHER__' ? `Other: ${a.otherText || 'Specified by student'}` : a.selected;
                            return `<div style="margin-bottom: 0.25rem;"><strong>${q.label}:</strong> <span style="color: #244739;">${text}</span></div>`;
                        }).filter(Boolean);

                        const relQ = (APP_DATA.guidedQuestionsTemplate.relevance || []).map(q => {
                            const a = answers[q.id];
                            if (!a || !a.selected) return null;
                            const text = a.selected === '__OTHER__' ? `Other: ${a.otherText || 'Specified by student'}` : a.selected;
                            return `<div style="margin-bottom: 0.25rem;"><strong>${q.label}:</strong> <span style="color: #244739;">${text}</span></div>`;
                        }).filter(Boolean);

                        const allQ = [...repQ, ...genQ, ...relQ];

                        return `
                            <div style="background: #f2f7f4; border: 1px solid #c4ded2; border-radius: 6px; padding: 0.85rem; margin-bottom: 1rem; font-size: 0.85rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; font-weight: bold; color: #082117; margin-bottom: 0.4rem; border-bottom: 1px solid #c4ded2; padding-bottom: 0.35rem; flex-wrap: wrap; gap: 0.4rem;">
                                    <span style="font-size: 0.95rem; color: #004c38;">${f.name} <span style="font-size: 0.8rem; font-weight: normal; color: #527a69;">(Focus: ${f.target || 'Witness'} • Importance: ${f.importance !== null ? `${f.importance}/10` : '—'})</span></span>
                                    <span style="font-family: monospace; font-size: 0.82rem; color: #082117;">Rep: ${rep} • Gen: ${gen} • Rel (SESOI): ${rel} [Avg: ${avgScore}/5]</span>
                                </div>
                                
                                <!-- 1. Replicability Section -->
                                <div style="background: #ffffff; border: 1px solid #c4ded2; border-radius: 4px; padding: 0.6rem 0.75rem; margin: 0.4rem 0; font-size: 0.8rem;">
                                    <div style="font-weight: bold; color: #004c38; margin-bottom: 0.25rem;">1. Replicability Evaluation (${rep})</div>
                                    ${repQ.length > 0 ? `<div style="margin-bottom: 0.3rem;">${repQ.join('')}</div>` : ''}
                                    ${f.replicabilityNotes ? `<div style="color: #1a3328; background: #f8fbf9; padding: 0.4rem 0.6rem; border-radius: 3px; font-size: 0.78rem;"><strong>Student Replicability Notes & Citations:</strong> ${f.replicabilityNotes}</div>` : '<em style="color: #688d7f; font-size: 0.75rem;">No Replicability notes entered.</em>'}
                                </div>

                                <!-- 2. Generalizability Section -->
                                <div style="background: #ffffff; border: 1px solid #c4ded2; border-radius: 4px; padding: 0.6rem 0.75rem; margin: 0.4rem 0; font-size: 0.8rem;">
                                    <div style="font-weight: bold; color: #004c38; margin-bottom: 0.25rem;">2. Generalizability & Ecological Validity (${gen})</div>
                                    ${genQ.length > 0 ? `<div style="margin-bottom: 0.3rem;">${genQ.join('')}</div>` : ''}
                                    ${f.generalizabilityNotes ? `<div style="color: #1a3328; background: #f8fbf9; padding: 0.4rem 0.6rem; border-radius: 3px; font-size: 0.78rem;"><strong>Student Generalizability Notes & Citations:</strong> ${f.generalizabilityNotes}</div>` : '<em style="color: #688d7f; font-size: 0.75rem;">No Generalizability notes entered.</em>'}
                                </div>

                                <!-- 3. Practical Relevance Section -->
                                <div style="background: #ffffff; border: 1px solid #c4ded2; border-radius: 4px; padding: 0.6rem 0.75rem; margin: 0.4rem 0; font-size: 0.8rem;">
                                    <div style="font-weight: bold; color: #004c38; margin-bottom: 0.25rem;">3. Practical Relevance (SESOI & Case Moderators) (${rel})</div>
                                    ${relQ.length > 0 ? `<div style="margin-bottom: 0.3rem;">${relQ.join('')}</div>` : ''}
                                    ${f.relevanceNotes ? `<div style="color: #1a3328; background: #f8fbf9; padding: 0.4rem 0.6rem; border-radius: 3px; font-size: 0.78rem;"><strong>Student Practical Relevance & SESOI Notes:</strong> ${f.relevanceNotes}</div>` : '<em style="color: #688d7f; font-size: 0.75rem;">No Practical Relevance notes entered.</em>'}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Section 4: Likelihood Ratios -->
                <div style="margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.15rem; color: #004c38; border-bottom: 1px solid #c4ded2; padding-bottom: 0.25rem; margin-bottom: 0.75rem;">4. Likelihood Ratios (Rassin et al., 2022; Jarosz & Wiley, 2014)</h2>
                    <p style="font-size: 0.85rem; color: #244739; margin-bottom: 0.75rem;">
                        Likelihood Ratios express the relative probability of observing the evidence under the primary hypothesis compared to the alternative hypothesis:
                        <br/><code>LR = P(Evidence | H1) / P(Evidence | H2)</code>
                    </p>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-bottom: 1rem;">
                        <thead>
                            <tr style="background: #eaf2ed;">
                                <th style="padding: 6px; border: 1px solid #c4ded2; text-align: left; width: 42%;">Evidence Item & Forensic Rationale</th>
                                <th style="padding: 6px; border: 1px solid #c4ded2; text-align: center; width: 12%;">P(E | H1)</th>
                                <th style="padding: 6px; border: 1px solid #c4ded2; text-align: center; width: 12%;">P(E | H2)</th>
                                <th style="padding: 6px; border: 1px solid #c4ded2; text-align: center; width: 10%;">LR</th>
                                <th style="padding: 6px; border: 1px solid #c4ded2; text-align: left; width: 24%;">Verbal Scale (Jarosz & Wiley, 2014)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lrItems.map(item => {
                                const php = item.php || 0.5;
                                const phd = item.phd || 0.5;
                                const lr = php / Math.max(0.001, phd);
                                const scale = this.getJaroszWileyScale(lr);
                                return `
                                    <tr>
                                        <td style="padding: 6px; border: 1px solid #c4ded2;">
                                            <strong>${item.title}</strong>
                                            ${item.explanation ? `<div style="font-size: 0.75rem; color: #3b5a4d; margin-top: 0.25rem;"><strong>Rationale:</strong> ${item.explanation}</div>` : ''}
                                        </td>
                                        <td style="padding: 6px; border: 1px solid #c4ded2; text-align: center; font-weight: 600;">${(php * 100).toFixed(0)}%</td>
                                        <td style="padding: 6px; border: 1px solid #c4ded2; text-align: center; font-weight: 600;">${(phd * 100).toFixed(0)}%</td>
                                        <td style="padding: 6px; border: 1px solid #c4ded2; text-align: center; font-weight: bold; color: #004c38; font-family: monospace;">${lr.toFixed(2)}</td>
                                        <td style="padding: 6px; border: 1px solid #c4ded2;"><strong>${scale.text}</strong></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>

                    <!-- Compound Summary Box -->
                    <div style="background: #f2f7f4; border-left: 4px solid #004c38; padding: 0.85rem; border-radius: 4px; font-size: 0.85rem;">
                        <div style="font-weight: bold; color: #004c38; font-size: 0.95rem; margin-bottom: 0.3rem;">
                            Compound Evidentiary Assessment: LR ≈ ${effectiveLR.toFixed(2)} (${compoundScale.text})
                        </div>
                        <p style="margin: 0; color: #244739; font-size: 0.8rem;">
                            <strong>Compounding Methodology (Rassin et al., 2022):</strong> ${this.compoundingMode === 'interdependent' ? `Conservative interdependence model applied (Compound LR = ${dependentCompoundLR.toFixed(2)} vs. naive product = ${rawCompoundLR.toFixed(2)}), adjusting for shared cognitive variance across multiple factors on a single witness's memory trace.` : `Direct multiplication applied (Compound LR = ${rawCompoundLR.toFixed(2)}). Where evidence items stem from independent observers (e.g. separate witnesses) or distinct investigative procedures, conditional independence holds. For multiple factors on a single witness, potential shared variance is noted qualitatively (conservative model yields LR = ${dependentCompoundLR.toFixed(2)}).`}
                            <br/><strong>Forensic Guidance:</strong> When presenting multiple factors in court, experts should distinguish between independent evidence streams (where direct compounding holds) and repeated/overlapping factors on a single memory trace (where shared cognitive variance must be addressed).
                        </p>
                    </div>
                </div>

                <!-- Section 5: Legal Caveat & Expert Signature -->
                <div style="border-top: 1px solid #c4ded2; padding-top: 1rem; margin-top: 1.5rem; font-size: 0.8rem; color: #527a69;">
                    <p style="margin-bottom: 1.5rem;">
                        <strong>Methodological Caveat on The Ultimate Issue:</strong> As an independent psychological expert witness, this evaluation reports exclusively on the probative value of the psychological findings under the stated hypotheses. The determination of ultimate guilt, innocence, or legal liability remains the sole prerogative of the Court.
                    </p>
                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                        <div>
                            <div>____________________________________</div>
                            <div style="font-weight: bold; color: #082117; margin-top: 0.2rem;">Forensic Psychological Expert</div>
                            <div>Legal & Forensic Psychology • Expert Evaluation Unit</div>
                        </div>
                        <div style="text-align: right;">
                            <div>____________________________________</div>
                            <div style="color: #082117; margin-top: 0.2rem;">Date & Official Seal</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    openReportPreview() {
        const modal = document.getElementById('report-preview-modal');
        const body = document.getElementById('report-modal-body');
        if (!modal || !body) return;

        body.innerHTML = this.buildReportHTML();
        modal.style.display = 'flex';
    }

    closeReportPreview() {
        const modal = document.getElementById('report-preview-modal');
        if (modal) modal.style.display = 'none';
    }

    exportPDFReport() {
        const reportHTML = this.buildReportHTML();
        const project = window.app.currentProject || {};
        const caseTitle = (project.mandate?.caseTitle || 'Forensic_Expert_Report').replace(/[^a-z0-9]/gi, '_');

        // Check if an existing print iframe exists, or create one
        let printFrame = document.getElementById('report-print-iframe');
        if (!printFrame) {
            printFrame = document.createElement('iframe');
            printFrame.id = 'report-print-iframe';
            printFrame.style.position = 'fixed';
            printFrame.style.right = '0';
            printFrame.style.bottom = '0';
            printFrame.style.width = '0';
            printFrame.style.height = '0';
            printFrame.style.border = 'none';
            printFrame.style.visibility = 'hidden';
            document.body.appendChild(printFrame);
        }

        try {
            const frameDoc = printFrame.contentWindow.document;
            frameDoc.open();
            frameDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>${caseTitle} - Forensic Expert Witness Report</title>
                    <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 15mm 12mm 15mm 12mm;
                        }
                        * {
                            box-sizing: border-box;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            font-family: 'Newsreader', Georgia, 'Times New Roman', serif;
                            color: #0f172a;
                            background: #ffffff;
                            font-size: 10pt;
                            line-height: 1.5;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .forensic-report {
                            max-width: 100% !important;
                            box-shadow: none !important;
                            padding: 0 !important;
                            border: none !important;
                            background: #ffffff !important;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            page-break-inside: avoid;
                            margin: 8px 0 12px 0;
                        }
                        th, td {
                            border: 1px solid #cbd5e1;
                            padding: 6px 8px;
                            text-align: left;
                            font-size: 8.5pt;
                            vertical-align: top;
                        }
                        th {
                            background-color: #f1f5f9 !important;
                            font-weight: 700;
                            color: #1e3a8a;
                        }
                        h1, h2, h3 {
                            font-family: 'Newsreader', Georgia, serif;
                            color: #1e3a8a;
                            margin: 0 0 4px 0;
                        }
                        h1 { font-size: 17pt; font-weight: 700; }
                        h2 { font-size: 11.5pt; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 3px; margin-top: 14px; }
                        code {
                            font-family: 'JetBrains Mono', monospace;
                            font-size: 8.5pt;
                            background: #f8fafc;
                            padding: 2px 4px;
                            border-radius: 3px;
                            color: #0369a1;
                        }
                        .badge {
                            display: inline-block;
                            padding: 2px 6px;
                            border-radius: 4px;
                            font-size: 8pt;
                            font-family: 'Inter', sans-serif;
                            font-weight: 600;
                        }
                    </style>
                </head>
                <body>
                    ${reportHTML}
                </body>
                </html>
            `);
            frameDoc.close();

            setTimeout(() => {
                printFrame.contentWindow.focus();
                printFrame.contentWindow.print();
                window.app.showNotification("Print / PDF export dialog opened!", "success");
            }, 350);
        } catch (err) {
            console.error("Print frame error, using window fallback:", err);
            this.openReportPreview();
            setTimeout(() => window.print(), 250);
        }
    }

    exportWordReport() {
        const reportHTML = this.buildReportHTML();
        const project = window.app.currentProject || {};
        const caseTitle = (project.mandate?.caseTitle || 'Forensic_Case').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        const docContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>Forensic Psychology Expert Report</title>
                <style>
                    body { font-family: 'Calibri', 'Times New Roman', sans-serif; font-size: 11pt; line-height: 1.5; color: #0f172a; }
                    h1 { color: #1e3a8a; font-size: 18pt; border-bottom: 2pt solid #1e3a8a; padding-bottom: 4pt; }
                    h2 { color: #1e3a8a; font-size: 13pt; margin-top: 14pt; border-bottom: 1pt solid #cbd5e1; }
                    table { width: 100%; border-collapse: collapse; margin: 10pt 0; font-size: 10pt; }
                    th { background-color: #f1f5f9; border: 1pt solid #94a3b8; padding: 6pt; text-align: left; font-weight: bold; }
                    td { border: 1pt solid #cbd5e1; padding: 6pt; }
                </style>
            </head>
            <body>
                ${reportHTML}
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword;charset=utf-8' });
        const dlLink = document.createElement('a');
        dlLink.href = URL.createObjectURL(blob);
        dlLink.download = `${caseTitle}_expert_report.doc`;
        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
        URL.revokeObjectURL(dlLink.href);

        window.app.showNotification("Downloaded formatted Word document (.doc)!", "success");
    }
}


