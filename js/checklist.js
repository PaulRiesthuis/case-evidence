/**
 * Forensic Psychology Scientific Quality Checklist Engine (Replicability, Generalizability, Practical Relevance)
 * Student-Driven Factor Analysis with 3 Pillar Tabs, SESOI Practical Relevance, and 1-10 Importance Rating
 */

class ScientificChecklist {
    constructor() {
        this.selectedFactorId = null;
        this.activeFilter = 'all';
        this.activePillarTab = 'replicability'; // 'replicability' | 'generalizability' | 'relevance'
        this.editingFactorId = null;
    }

    getFactors() {
        if (!window.app || !window.app.currentProject) return [];
        return window.app.currentProject.factors || [];
    }

    init() {
        const factors = this.getFactors();
        if (factors.length > 0 && (!this.selectedFactorId || !factors.find(f => f.id === this.selectedFactorId))) {
            this.selectedFactorId = factors[0].id;
        }

        this.renderFactorIdentificationTable();
        this.renderChecklistFactorList();
        this.renderChecklistFactorDetail(this.selectedFactorId);
        this.bindEvents();
        this.updateSummaryStats();
    }

    bindEvents() {
        if (this.eventsBound) return;
        this.eventsBound = true;

        // Tab 1: Open Factor Modal Button
        const addNewFactorBtn = document.getElementById('btn-add-case-factor');
        if (addNewFactorBtn) {
            addNewFactorBtn.addEventListener('click', () => this.openFactorModal());
        }

        // Tab 2: Filter Buttons
        document.querySelectorAll('.factor-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.factor-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeFilter = btn.dataset.filter;
                this.renderChecklistFactorList();
            });
        });

        // Factor Form Submit Handler
        const factorForm = document.getElementById('factor-editor-form');
        if (factorForm) {
            factorForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveFactorFromForm();
            });
        }
    }

    /* ===================================================================
       PAGE 1: FACTOR IDENTIFICATION & DESCRIPTION (TABLE VIEW)
       =================================================================== */
    renderFactorIdentificationTable() {
        const container = document.getElementById('factor-identification-list');
        if (!container) return;

        const factors = this.getFactors();

        if (factors.length === 0) {
            container.innerHTML = `
                <div class="empty-state-card" style="padding: 3rem 2rem; text-align: center;">
                    <i class="fas fa-search-plus" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3>No Factors Identified Yet</h3>
                    <p style="color: var(--text-secondary); max-width: 520px; margin: 0.5rem auto 1.5rem auto;">
                        Review your case materials and identify factors (e.g. intoxication, distance, stress, showup procedure, suggestive questioning, delay) that may increase or decrease testimony validity.
                    </p>
                    <button class="btn btn-primary" onclick="window.checklistApp.openFactorModal()">
                        <i class="fas fa-plus-circle"></i> Add First Case Factor
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="factors-table-wrapper">
                <table class="factors-table">
                    <thead>
                        <tr>
                            <th>Factor Name & Target</th>
                            <th>Category</th>
                            <th>Impact on Validity</th>
                            <th>Importance (1-10)</th>
                            <th>Case Description</th>
                            <th style="text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${factors.map(f => {
                            const isEstimator = f.category === 'estimator';
                            const badgeClass = isEstimator ? 'badge-estimator' : 'badge-system';
                            const badgeLabel = isEstimator ? 'Estimator' : 'System';
                            const tipText = isEstimator ? 'Estimator Factor: Inherent context/witness variable.' : 'System Factor: Police/interview controllable procedure.';

                            let dirBadge = '<span class="badge badge-dir-decreases"><i class="fas fa-arrow-down"></i> Decreases Validity</span>';
                            if (f.direction === 'increases') {
                                dirBadge = '<span class="badge badge-dir-increases"><i class="fas fa-arrow-up"></i> Increases Validity</span>';
                            } else if (f.direction === 'mixed') {
                                dirBadge = '<span class="badge badge-dir-mixed"><i class="fas fa-exchange-alt"></i> Mixed</span>';
                            }

                            const importance = f.importance !== undefined && f.importance !== null ? f.importance : '—';

                            return `
                                <tr>
                                    <td>
                                        <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">${f.name}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted);"><i class="fas fa-user-tag"></i> Target: <strong style="color: var(--eur-cyan);">${f.target || 'Witness'}</strong></div>
                                    </td>
                                    <td><span class="badge ${badgeClass} concept-tip" data-tooltip="${tipText}">${badgeLabel} <i class="fas fa-info-circle"></i></span></td>
                                    <td>${dirBadge}</td>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 0.35rem;">
                                            <span style="font-weight: 800; color: var(--eur-gold); font-family: var(--font-mono); font-size: 0.95rem;">${importance}</span>
                                            <span style="font-size: 0.75rem; color: var(--text-muted);">${importance !== '—' ? '/ 10' : ''}</span>
                                        </div>
                                    </td>
                                    <td style="font-size: 0.85rem; color: var(--text-secondary); max-width: 320px;">
                                        ${f.caseDescription ? (
                                            f.caseDescription.length > 75 
                                                ? `<span class="info-tip-trigger" data-tooltip="${f.caseDescription.replace(/"/g, '&quot;')}">${f.caseDescription.substring(0, 72)}... <span class="info-tip">ⓘ</span></span>`
                                                : f.caseDescription
                                        ) : '<span style="color: var(--text-muted); font-style: italic;">No description provided.</span>'}
                                    </td>
                                    <td style="text-align: right; white-space: nowrap;">
                                        <button class="btn btn-secondary btn-sm" onclick="window.checklistApp.openFactorModal('${f.id}')" title="Edit Factor"><i class="fas fa-edit"></i> Edit</button>
                                        <button class="btn btn-secondary btn-sm" onclick="window.checklistApp.deleteFactor('${f.id}')" style="color: var(--eur-danger);" title="Delete Factor"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <div style="margin-top: 1.25rem;">
                <button class="btn btn-secondary" onclick="window.checklistApp.openFactorModal()">
                    <i class="fas fa-plus"></i> Add Another Factor
                </button>
            </div>
        `;
    }

    /* ===================================================================
       PAGE 2: 3-PILLAR EVALUATION WITH SUB-TABS (NO CITATION BOXES)
       =================================================================== */
    getFilteredFactors() {
        const factors = this.getFactors();
        if (this.activeFilter === 'all') return factors;
        if (this.activeFilter === 'estimator') return factors.filter(f => f.category === 'estimator');
        if (this.activeFilter === 'system') return factors.filter(f => f.category === 'system');
        if (this.activeFilter === 'needs-rating') {
            return factors.filter(f => 
                f.replicabilityScore === null || f.replicabilityScore === undefined ||
                f.generalizabilityScore === null || f.generalizabilityScore === undefined ||
                f.relevanceScore === null || f.relevanceScore === undefined
            );
        }
        if (this.activeFilter === 'completed') {
            return factors.filter(f => 
                f.replicabilityScore !== null && f.replicabilityScore !== undefined &&
                f.generalizabilityScore !== null && f.generalizabilityScore !== undefined &&
                f.relevanceScore !== null && f.relevanceScore !== undefined
            );
        }
        return factors;
    }

    renderChecklistFactorList() {
        const container = document.getElementById('checklist-factor-list-container');
        if (!container) return;

        const filtered = this.getFilteredFactors();

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state-card" style="padding: 1.5rem; text-align: center;">
                    <p style="font-size: 0.8rem; color: var(--text-muted);">No factors in this category.<br/>Add factors on Step 1.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(factor => {
            const isSelected = factor.id === this.selectedFactorId;
            const isEstimator = factor.category === 'estimator';
            const categoryBadgeClass = isEstimator ? 'badge-estimator' : 'badge-system';
            const categoryLabel = isEstimator ? 'Estimator' : 'System';

            const rep = factor.replicabilityScore;
            const gen = factor.generalizabilityScore;
            const rel = factor.relevanceScore;

            const isFullyRated = rep !== null && rep !== undefined && gen !== null && gen !== undefined && rel !== null && rel !== undefined;
            const ratedCount = [rep, gen, rel].filter(v => v !== null && v !== undefined).length;
            const avgQuality = isFullyRated ? ((rep + gen + rel) / 3).toFixed(1) : null;

            return `
                <div class="factor-card ${isSelected ? 'selected' : ''}" data-id="${factor.id}" onclick="window.checklistApp.selectFactor('${factor.id}')">
                    <div class="factor-card-header">
                        <span class="badge ${categoryBadgeClass}">${categoryLabel}</span>
                        <span class="factor-target"><i class="fas fa-user-tag"></i> ${factor.target || 'Witness'}</span>
                    </div>
                    <h4 class="factor-card-title">${factor.name}</h4>
                    <p class="factor-card-summary">${factor.caseDescription || 'Click to evaluate scientific literature...'}</p>
                    
                    <div style="margin-bottom: 0.4rem;">
                        ${isFullyRated ? `
                            <span class="badge" style="background: rgba(0, 163, 112, 0.15); color: var(--eur-green); border: 1px solid rgba(0, 163, 112, 0.35); font-size: 0.7rem;">
                                <i class="fas fa-check-circle"></i> Complete (${avgQuality} / 5.0)
                            </span>
                        ` : `
                            <span class="badge" style="background: rgba(239, 68, 68, 0.12); color: var(--eur-danger); border: 1px solid rgba(239, 68, 68, 0.3); font-size: 0.7rem;">
                                <i class="fas fa-exclamation-circle"></i> Pending (${ratedCount}/3 Rated)
                            </span>
                        `}
                    </div>

                    <div class="factor-card-metrics">
                        <div class="metric-pill" title="Replicability (1-5)"><span class="metric-label">Rep:</span> <span class="metric-val">${rep !== null && rep !== undefined ? `${rep}/5` : '—'}</span></div>
                        <div class="metric-pill" title="Generalizability (1-5)"><span class="metric-label">Gen:</span> <span class="metric-val">${gen !== null && gen !== undefined ? `${gen}/5` : '—'}</span></div>
                        <div class="metric-pill" title="Practical Relevance (1-5)"><span class="metric-label">Rel:</span> <span class="metric-val">${rel !== null && rel !== undefined ? `${rel}/5` : '—'}</span></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    selectFactor(factorId) {
        this.selectedFactorId = factorId;
        this.renderChecklistFactorList();
        this.renderChecklistFactorDetail(factorId);
    }

    switchPillarTab(pillarKey, scroll = false) {
        this.activePillarTab = pillarKey;
        const factor = this.getFactors().find(f => f.id === this.selectedFactorId);
        if (!factor) return;

        // Smoothly update tab buttons and pillar content without resetting the outer detail card
        const nav = document.querySelector('.pillar-tabs-nav');
        if (nav) {
            const rep = factor.replicabilityScore;
            const gen = factor.generalizabilityScore;
            const rel = factor.relevanceScore;
            nav.innerHTML = `
                <button class="btn ${this.activePillarTab === 'replicability' ? 'btn-primary' : 'btn-secondary'}" 
                    onclick="window.checklistApp.switchPillarTab('replicability')">
                    <i class="fas fa-sync-alt"></i> 1. Replicability (${rep !== null && rep !== undefined ? `${rep}/5` : '⚠️ Unrated'})
                </button>
                <button class="btn ${this.activePillarTab === 'generalizability' ? 'btn-primary' : 'btn-secondary'}" 
                    onclick="window.checklistApp.switchPillarTab('generalizability')">
                    <i class="fas fa-globe"></i> 2. Generalizability (${gen !== null && gen !== undefined ? `${gen}/5` : '⚠️ Unrated'})
                </button>
                <button class="btn ${this.activePillarTab === 'relevance' ? 'btn-primary' : 'btn-secondary'}" 
                    onclick="window.checklistApp.switchPillarTab('relevance')">
                    <i class="fas fa-gavel"></i> 3. Practical Relevance (${rel !== null && rel !== undefined ? `${rel}/5` : '⚠️ Unrated'})
                </button>
            `;
        }

        const contentArea = document.querySelector('.pillar-tab-content');
        if (contentArea) {
            contentArea.innerHTML = this.renderActivePillarContent(factor);
        } else {
            this.renderChecklistFactorDetail(this.selectedFactorId);
        }

        if (scroll) {
            const detailCard = document.getElementById(`factor-detail-card-${this.selectedFactorId}`);
            if (detailCard) {
                detailCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    goToNextFactor(nextFactorId) {
        this.selectedFactorId = nextFactorId;
        this.activePillarTab = 'replicability';
        this.renderChecklistFactorList();
        this.renderChecklistFactorDetail(nextFactorId);

        const detailCard = document.getElementById(`factor-detail-card-${nextFactorId}`);
        if (detailCard) {
            detailCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    renderChecklistFactorDetail(factorId) {
        const container = document.getElementById('checklist-factor-detail-container');
        if (!container) return;

        const factors = this.getFactors();
        const factor = factors.find(f => f.id === factorId);

        if (!factor) {
            container.innerHTML = `
                <div class="empty-state-card" style="padding: 3rem; text-align: center;">
                    <i class="fas fa-clipboard-check" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3>No Factor Selected for Evaluation</h3>
                    <p style="color: var(--text-secondary); max-width: 480px; margin: 0.5rem auto 1.5rem auto;">
                        Please add factors in Step 2 (Identified Factors) and select one from the left sidebar to evaluate the literature across the 3 Pillars.
                    </p>
                    <button class="btn btn-primary" onclick="window.app.switchTab('factors')">
                        <i class="fas fa-arrow-left"></i> Go to Step 2: Identified Factors
                    </button>
                </div>
            `;
            return;
        }

        if (!factor.guidedAnswers) factor.guidedAnswers = {};

        const rep = factor.replicabilityScore;
        const gen = factor.generalizabilityScore;
        const rel = factor.relevanceScore;
        const importance = factor.importance !== null && factor.importance !== undefined ? factor.importance : 'Not Set';

        container.innerHTML = `
            <div class="factor-detail-card" id="factor-detail-card-${factor.id}">
                <!-- Header -->
                <div class="factor-detail-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <div class="factor-tags">
                            <span class="badge ${factor.category === 'system' ? 'badge-system' : 'badge-estimator'}">
                                ${factor.category === 'system' ? 'System Factor (Police Controllable)' : 'Estimator Factor (Crime Context / Witness Inherent)'}
                            </span>
                            <span class="badge badge-outline"><i class="fas fa-user"></i> Focus: ${factor.target || 'Witness'}</span>
                            <span class="badge" style="background: rgba(229, 168, 35, 0.15); color: var(--eur-gold); border: 1px solid rgba(229, 168, 35, 0.35);">
                                <i class="fas fa-star"></i> Case Importance: ${importance}/10
                            </span>
                        </div>
                        <h2 class="factor-detail-title" style="margin-top: 0.4rem;">${factor.name}</h2>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);"><strong>Case Description:</strong> ${factor.caseDescription || 'No description entered on Step 2.'}</p>
                    </div>
                </div>

                <!-- 3 Pillar Navigation Buttons -->
                <div class="pillar-tabs-nav" style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; flex-wrap: wrap;">
                    <button class="btn ${this.activePillarTab === 'replicability' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="window.checklistApp.switchPillarTab('replicability')">
                        <i class="fas fa-sync-alt"></i> 1. Replicability (${rep !== null && rep !== undefined ? `${rep}/5` : '⚠️ Unrated'})
                    </button>
                    <button class="btn ${this.activePillarTab === 'generalizability' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="window.checklistApp.switchPillarTab('generalizability')">
                        <i class="fas fa-globe"></i> 2. Generalizability (${gen !== null && gen !== undefined ? `${gen}/5` : '⚠️ Unrated'})
                    </button>
                    <button class="btn ${this.activePillarTab === 'relevance' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="window.checklistApp.switchPillarTab('relevance')">
                        <i class="fas fa-gavel"></i> 3. Practical Relevance (${rel !== null && rel !== undefined ? `${rel}/5` : '⚠️ Unrated'})
                    </button>
                </div>

                <!-- Active Pillar Content Area -->
                <div class="pillar-tab-content">
                    ${this.renderActivePillarContent(factor)}
                </div>
            </div>
        `;
    }

    proceedToLikelihoodRatios() {
        const factors = this.getFactors();
        const unrated = factors.filter(f => f.replicabilityScore === null || f.replicabilityScore === undefined ||
            f.generalizabilityScore === null || f.generalizabilityScore === undefined ||
            f.relevanceScore === null || f.relevanceScore === undefined);

        if (unrated.length > 0) {
            const factorNames = unrated.map(f => `• ${f.name}`).join('\n');
            const confirmProceed = confirm(`⚠️ Warning: The following factor(s) have unrated scientific quality pillars:\n\n${factorNames}\n\nResponding to Replicability, Generalizability, and Practical Relevance is mandatory to accurately calculate Likelihood Ratios.\n\nDo you still want to view the Likelihood Ratio Lab?`);
            if (!confirmProceed) return;
        }

        window.app.switchTab('likelihood-ratio');
    }

    renderActivePillarContent(factor) {
        if (this.activePillarTab === 'replicability') {
            const rep = factor.replicabilityScore;
            const labels = {
                1: "Fragile / Single-Study / Contested",
                2: "Limited / Heterogeneous Replications",
                3: "Moderate Multi-Lab Replications",
                4: "Strong Meta-Analytic Support",
                5: "Robust Multi-Lab Registered Replications"
            };

            return `
                <div class="pillar-box-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <div>
                            <h3 style="font-size: 1.1rem; color: var(--eur-cyan);"><i class="fas fa-sync-alt"></i> Pillar 1: Replicability & Robustness</h3>
                            <p style="font-size: 0.8rem; color: var(--text-secondary);">
                                How robust is the empirical literature on this factor across independent studies, meta-analyses, and registered replications?
                            </p>
                        </div>
                    </div>

                    <!-- Questions -->
                    <div class="guided-questions-container">
                        ${APP_DATA.guidedQuestionsTemplate.replicability.map(q => this.renderGuidedQuestion(factor, q)).join('')}
                    </div>

                    <!-- Overall Score Pill Selector (Mandatory) -->
                    <div class="pillar-score-selector-box" style="margin-top: 1.25rem; background: var(--bg-surface-elevated); padding: 1.15rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <label style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.35rem;">
                                <i class="fas fa-award" style="color: var(--eur-gold);"></i> Assign Replicability Score (1 – 5): <span style="color: var(--eur-danger);">* Mandatory</span>
                                <span class="info-tip" data-tooltip="&lt;div style=&quot;font-size:0.78rem; line-height:1.4;&quot;&gt;&lt;strong style=&quot;color:#38bdf8;&quot;&gt;Replicability Scale Guidance&lt;/strong&gt;&lt;br/&gt;• 1: Single small study / contested findings&lt;br/&gt;• 3: Several multi-lab replications&lt;br/&gt;• 5: Large multi-site Registered Replication Reports &amp; meta-analyses.&lt;/div&gt;">ⓘ</span>
                            </label>
                            <span id="rep-val-${factor.id}" style="font-weight: 800; font-family: var(--font-mono); color: ${rep !== null && rep !== undefined ? 'var(--eur-gold)' : 'var(--eur-danger)'}; font-size: 0.95rem;">
                                ${rep !== null && rep !== undefined ? `${rep} / 5` : '⚠️ Not Yet Rated'}
                            </span>
                        </div>
                        <div class="score-pill-selector">
                            ${[1, 2, 3, 4, 5].map(val => `
                                <button type="button" class="score-pill-btn ${rep === val ? 'active' : ''}" 
                                    onclick="window.checklistApp.updateScore('${factor.id}', 'replicabilityScore', ${val}, 'rep-val-${factor.id}')"
                                    data-tooltip="&lt;strong style=&quot;color:#38bdf8;&quot;&gt;Replicability Score ${val}/5:&lt;/strong&gt; ${labels[val]}">
                                    <span class="pill-number">${val}</span>
                                    <span class="pill-desc">${labels[val]}</span>
                                </button>
                            `).join('')}
                        </div>
                        ${rep === null || rep === undefined ? `
                            <div style="margin-top: 0.6rem; font-size: 0.75rem; color: var(--eur-danger); display: flex; align-items: center; gap: 0.35rem;">
                                <i class="fas fa-exclamation-circle"></i> Please select a score (1 to 5) based on your literature analysis to complete this pillar.
                            </div>
                        ` : ''}
                    </div>

                    <!-- Dedicated Replicability Notes & Literature Citations -->
                    <div class="pillar-notes-box" style="margin-top: 1.25rem; background: var(--bg-surface-elevated); padding: 1.15rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <div style="font-weight: 700; font-size: 0.88rem; color: var(--eur-cyan); margin-bottom: 0.35rem; display: flex; align-items: center; justify-content: space-between;">
                            <span><i class="fas fa-book-open"></i> 1. Replicability Notes & Literature Citations</span>
                            <span class="info-tip" data-tooltip="&lt;div style=&quot;font-size:0.78rem; line-height:1.4;&quot;&gt;Cite key meta-analyses, sample sizes, and registered replications justifying why this score was selected.&lt;/div&gt;">ⓘ</span>
                        </div>
                        <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 0.45rem;">
                            Cite relevant empirical studies, meta-analyses, or multi-lab replications, and explain why you consider this Replicability rating fair:
                        </p>
                        <textarea class="form-textarea" id="rep-notes-${factor.id}" style="width: 100%; min-height: 85px; font-size: 0.82rem; padding: 0.65rem 0.8rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-family: inherit; line-height: 1.45; box-sizing: border-box; display: block; resize: vertical;"
                            placeholder="Provide citations (e.g. meta-analyses) and explain why this Replicability rating is fair for this factor..."
                            oninput="window.checklistApp.updatePillarNote('${factor.id}', 'replicabilityNotes', this.value)">${factor.replicabilityNotes || ''}</textarea>
                    </div>

                    <!-- Bottom Navigation: Back to Step 2 or Go Next to Generalizability -->
                    <div class="pillar-transition-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-color); flex-wrap: wrap; gap: 0.5rem;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="window.app.switchTab('factors')">
                            <i class="fas fa-arrow-left"></i> Back to Step 2: Identified Factors
                        </button>
                        <button type="button" class="btn btn-primary" onclick="window.checklistApp.switchPillarTab('generalizability', true)">
                            Go Next to 2. Generalizability <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        if (this.activePillarTab === 'generalizability') {
            const gen = factor.generalizabilityScore;
            const labels = {
                1: "High Lab-Field Gap (Static / Artificial)",
                2: "Low Match (Low Arousal / Vignettes)",
                3: "Moderate Match (Realistic Staging / Moderate Stress)",
                4: "High Match (Field Studies / Similar Demographics)",
                5: "Direct Real-World Validation in Similar Conditions"
            };

            return `
                <div class="pillar-box-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <div>
                            <h3 style="font-size: 1.1rem; color: var(--eur-gold);"><i class="fas fa-globe"></i> Pillar 2: Generalizability & Ecological Validity</h3>
                            <p style="font-size: 0.8rem; color: var(--text-secondary);">
                                Evaluate how well findings translate from experimental paradigms to the real-world conditions and populations of this case.
                            </p>
                        </div>
                    </div>

                    <!-- Questions -->
                    <div class="guided-questions-container">
                        ${APP_DATA.guidedQuestionsTemplate.generalizability.map(q => this.renderGuidedQuestion(factor, q)).join('')}
                    </div>

                    <!-- Overall Score Pill Selector (Mandatory) -->
                    <div class="pillar-score-selector-box" style="margin-top: 1.25rem; background: var(--bg-surface-elevated); padding: 1.15rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <label style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.35rem;">
                                <i class="fas fa-award" style="color: var(--eur-gold);"></i> Assign Generalizability Score (1 – 5): <span style="color: var(--eur-danger);">* Mandatory</span>
                                <span class="info-tip" data-tooltip="&lt;div style=&quot;font-size:0.78rem; line-height:1.4;&quot;&gt;&lt;strong style=&quot;color:#fbbf24;&quot;&gt;Generalizability Scale Guidance&lt;/strong&gt;&lt;br/&gt;• 1: Lab-only vignette / static slides&lt;br/&gt;• 3: Realistic video staging with student volunteers&lt;br/&gt;• 5: Validated with real crime victims &amp; field police studies.&lt;/div&gt;">ⓘ</span>
                            </label>
                            <span id="gen-val-${factor.id}" style="font-weight: 800; font-family: var(--font-mono); color: ${gen !== null && gen !== undefined ? 'var(--eur-gold)' : 'var(--eur-danger)'}; font-size: 0.95rem;">
                                ${gen !== null && gen !== undefined ? `${gen} / 5` : '⚠️ Not Yet Rated'}
                            </span>
                        </div>
                        <div class="score-pill-selector">
                            ${[1, 2, 3, 4, 5].map(val => `
                                <button type="button" class="score-pill-btn ${gen === val ? 'active' : ''}" 
                                    onclick="window.checklistApp.updateScore('${factor.id}', 'generalizabilityScore', ${val}, 'gen-val-${factor.id}')"
                                    data-tooltip="&lt;strong style=&quot;color:#fbbf24;&quot;&gt;Generalizability Score ${val}/5:&lt;/strong&gt; ${labels[val]}">
                                    <span class="pill-number">${val}</span>
                                    <span class="pill-desc">${labels[val]}</span>
                                </button>
                            `).join('')}
                        </div>
                        ${gen === null || gen === undefined ? `
                            <div style="margin-top: 0.6rem; font-size: 0.75rem; color: var(--eur-danger); display: flex; align-items: center; gap: 0.35rem;">
                                <i class="fas fa-exclamation-circle"></i> Please select a score (1 to 5) based on your literature analysis to complete this pillar.
                            </div>
                        ` : ''}
                    </div>

                    <!-- Dedicated Generalizability Notes & Literature Citations -->
                    <div class="pillar-notes-box" style="margin-top: 1.25rem; background: var(--bg-surface-elevated); padding: 1.15rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <div style="font-weight: 700; font-size: 0.88rem; color: var(--eur-gold); margin-bottom: 0.35rem; display: flex; align-items: center; justify-content: space-between;">
                            <span><i class="fas fa-globe"></i> 2. Generalizability Notes & Ecological Validity</span>
                            <span class="info-tip" data-tooltip="&lt;div style=&quot;font-size:0.78rem; line-height:1.4;&quot;&gt;Discuss population matching (age/stress/cognition) and how physical boundary conditions (distance, lighting, delay) map onto this case.&lt;/div&gt;">ⓘ</span>
                        </div>
                        <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 0.45rem;">
                            Discuss ecological validity, field vs. lab research, population/arousal match to this case, and why you consider this Generalizability rating fair:
                        </p>
                        <textarea class="form-textarea" id="gen-notes-${factor.id}" style="width: 100%; min-height: 85px; font-size: 0.82rem; padding: 0.65rem 0.8rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-family: inherit; line-height: 1.45; box-sizing: border-box; display: block; resize: vertical;"
                            placeholder="Provide citations and explain how well lab findings generalize to this case, and why this rating is fair..."
                            oninput="window.checklistApp.updatePillarNote('${factor.id}', 'generalizabilityNotes', this.value)">${factor.generalizabilityNotes || ''}</textarea>
                    </div>

                    <!-- Bottom Navigation: Back to Replicability or Go Next to Practical Relevance -->
                    <div class="pillar-transition-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-color); flex-wrap: wrap; gap: 0.5rem;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="window.checklistApp.switchPillarTab('replicability', true)">
                            <i class="fas fa-arrow-left"></i> Back to 1. Replicability
                        </button>
                        <button type="button" class="btn btn-primary" onclick="window.checklistApp.switchPillarTab('relevance', true)">
                            Go Next to 3. Practical Relevance <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        if (this.activePillarTab === 'relevance') {
            const rel = factor.relevanceScore;
            const labels = {
                1: "Below SESOI / Trivial Effect Size",
                2: "Small Effect / Dampened by Case Conditions",
                3: "Moderate Effect (Exceeds SESOI)",
                4: "Substantial Effect (Amplified by Case Conditions)",
                5: "Decisive Legal Effect on Validity in this Case"
            };

            const allFactors = this.getFactors();
            const currentIndex = allFactors.findIndex(f => f.id === factor.id);
            const nextFactor = (currentIndex >= 0 && currentIndex < allFactors.length - 1) ? allFactors[currentIndex + 1] : null;

            return `
                <div class="pillar-box-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <div>
                            <h3 style="font-size: 1.1rem; color: var(--eur-green);"><i class="fas fa-gavel"></i> Pillar 3: Practical Relevance (SESOI & Case Moderators)</h3>
                            <p style="font-size: 0.8rem; color: var(--text-secondary);">
                                Evaluate whether the effect exceeds the <strong>Smallest Effect Size of Interest (SESOI)</strong> for this case, and whether case variables <strong>increase (amplify)</strong> or <strong>decrease (dampen)</strong> the effect.
                            </p>
                        </div>
                    </div>

                    <!-- Questions -->
                    <div class="guided-questions-container">
                        ${APP_DATA.guidedQuestionsTemplate.relevance.map(q => this.renderGuidedQuestion(factor, q)).join('')}
                    </div>

                    <!-- Overall Score Pill Selector (Mandatory) -->
                    <div class="pillar-score-selector-box" style="margin-top: 1.25rem; background: var(--bg-surface-elevated); padding: 1.15rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <label style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.35rem;">
                                <i class="fas fa-award" style="color: var(--eur-gold);"></i> Assign Practical Relevance Score (1 – 5): <span style="color: var(--eur-danger);">* Mandatory</span>
                                <span class="info-tip" data-tooltip="&lt;div style=&quot;font-size:0.78rem; line-height:1.4;&quot;&gt;&lt;strong style=&quot;color:#10b981;&quot;&gt;Practical Relevance &amp; SESOI Guidance&lt;/strong&gt;&lt;br/&gt;• 1: Below smallest effect size of interest&lt;br/&gt;• 3: Moderate effect, meaningfully shifts diagnosticity&lt;br/&gt;• 5: Decisive impact on legal testimony validity.&lt;/div&gt;">ⓘ</span>
                            </label>
                            <span id="rel-val-${factor.id}" style="font-weight: 800; font-family: var(--font-mono); color: ${rel !== null && rel !== undefined ? 'var(--eur-gold)' : 'var(--eur-danger)'}; font-size: 0.95rem;">
                                ${rel !== null && rel !== undefined ? `${rel} / 5` : '⚠️ Not Yet Rated'}
                            </span>
                        </div>
                        <div class="score-pill-selector">
                            ${[1, 2, 3, 4, 5].map(val => `
                                <button type="button" class="score-pill-btn ${rel === val ? 'active' : ''}" 
                                    onclick="window.checklistApp.updateScore('${factor.id}', 'relevanceScore', ${val}, 'rel-val-${factor.id}')"
                                    data-tooltip="&lt;strong style=&quot;color:#10b981;&quot;&gt;Practical Relevance Score ${val}/5:&lt;/strong&gt; ${labels[val]}">
                                    <span class="pill-number">${val}</span>
                                    <span class="pill-desc">${labels[val]}</span>
                                </button>
                            `).join('')}
                        </div>
                        ${rel === null || rel === undefined ? `
                            <div style="margin-top: 0.6rem; font-size: 0.75rem; color: var(--eur-danger); display: flex; align-items: center; gap: 0.35rem;">
                                <i class="fas fa-exclamation-circle"></i> Please select a score (1 to 5) based on your literature analysis to complete this pillar.
                            </div>
                        ` : ''}
                    </div>

                    <!-- Dedicated Practical Relevance Notes & Case Moderators -->
                    <div class="pillar-notes-box" style="margin-top: 1.25rem; background: var(--bg-surface-elevated); padding: 1.15rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <div style="font-weight: 700; font-size: 0.88rem; color: var(--eur-green); margin-bottom: 0.35rem; display: flex; align-items: center; justify-content: space-between;">
                            <span><i class="fas fa-gavel"></i> 3. Practical Relevance Notes, SESOI & Case Moderators</span>
                            <span class="info-tip" data-tooltip="&lt;div style=&quot;font-size:0.78rem; line-height:1.4;&quot;&gt;Explain whether effect size exceeds SESOI, and describe which specific case factors amplify or dampen the effect.&lt;/div&gt;">ⓘ</span>
                        </div>
                        <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 0.45rem;">
                            Explain whether this effect exceeds the Smallest Effect Size of Interest (SESOI), which case variables increase (amplify) or decrease (dampen) the effect, and why you consider this rating fair:
                        </p>
                        <textarea class="form-textarea" id="rel-notes-${factor.id}" style="width: 100%; min-height: 85px; font-size: 0.82rem; padding: 0.65rem 0.8rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-family: inherit; line-height: 1.45; box-sizing: border-box; display: block; resize: vertical;"
                            placeholder="Explain SESOI thresholds, case-specific amplifying/dampening variables, and why this Practical Relevance rating is fair..."
                            oninput="window.checklistApp.updatePillarNote('${factor.id}', 'relevanceNotes', this.value)">${factor.relevanceNotes || ''}</textarea>
                    </div>

                    <!-- Bottom Navigation: Back to Generalizability or Go to Next Factor / Proceed to Step 4 -->
                    <div class="pillar-transition-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-color); flex-wrap: wrap; gap: 0.5rem;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="window.checklistApp.switchPillarTab('generalizability', true)">
                            <i class="fas fa-arrow-left"></i> Back to 2. Generalizability
                        </button>
                        ${nextFactor ? `
                            <button type="button" class="btn btn-primary" onclick="window.checklistApp.goToNextFactor('${nextFactor.id}')">
                                Go to Next Factor: ${nextFactor.name} (1. Replicability) <i class="fas fa-arrow-right"></i>
                            </button>
                        ` : `
                            <button type="button" class="btn btn-primary" onclick="window.checklistApp.proceedToLikelihoodRatios()">
                                All Factors Evaluated: Proceed to Step 4 (Likelihood Ratios) <i class="fas fa-arrow-right"></i>
                            </button>
                        `}
                    </div>
                </div>
            `;
        }

        return '';
    }

    renderGuidedQuestion(factor, question) {
        const factorAnswers = factor.guidedAnswers || {};
        const currentAnswer = factorAnswers[question.id] || {};
        const selectedOption = currentAnswer.selected || '';
        const otherText = currentAnswer.otherText || '';
        const isOther = selectedOption === '__OTHER__';

        return `
            <div class="guided-question-card" style="background: var(--bg-base); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.85rem; margin-bottom: 0.75rem;">
                <div style="font-weight: 600; font-size: 0.85rem; margin-bottom: 0.5rem; color: var(--text-primary);">${question.label}</div>
                
                <div style="display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.8rem;">
                    ${question.options.map(opt => `
                        <label style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer; color: var(--text-secondary);">
                            <input type="radio" name="${factor.id}_${question.id}" value="${opt}" 
                                ${selectedOption === opt ? 'checked' : ''} 
                                onchange="window.checklistApp.updateGuidedAnswer('${factor.id}', '${question.id}', this.value, '')" 
                                style="margin-top: 3px;">
                            <span>${opt}</span>
                        </label>
                    `).join('')}

                    <!-- Other (Write-In) Option -->
                    <label style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer; color: var(--text-secondary);">
                        <input type="radio" name="${factor.id}_${question.id}" value="__OTHER__" 
                            ${isOther ? 'checked' : ''} 
                            onchange="window.checklistApp.updateGuidedAnswer('${factor.id}', '${question.id}', '__OTHER__', document.getElementById('other_${factor.id}_${question.id}')?.value || '')" 
                            style="margin-top: 3px;">
                        <span>Other (specify):</span>
                    </label>

                    ${isOther ? `
                        <input type="text" id="other_${factor.id}_${question.id}" class="form-input" style="font-size: 0.8rem; margin-left: 1.5rem; width: calc(100% - 1.5rem);" 
                            placeholder="Specify your reasoning or case observation..." 
                            value="${otherText}" 
                            oninput="window.checklistApp.updateGuidedAnswer('${factor.id}', '${question.id}', '__OTHER__', this.value)">
                    ` : ''}
                </div>
            </div>
        `;
    }

    updateGuidedAnswer(factorId, questionId, selectedOption, otherText) {
        const factors = this.getFactors();
        const factor = factors.find(f => f.id === factorId);
        if (!factor) return;

        if (!factor.guidedAnswers) factor.guidedAnswers = {};
        factor.guidedAnswers[questionId] = {
            selected: selectedOption,
            otherText: otherText
        };

        window.app.saveState();
        this.renderChecklistFactorDetail(factorId);
    }

    updatePillarNote(factorId, pillarField, value) {
        const factors = this.getFactors();
        const factor = factors.find(f => f.id === factorId);
        if (factor) {
            factor[pillarField] = value;
            window.app.saveState();
        }
    }

    updateFactorConclusion(factorId, text) {
        const factors = this.getFactors();
        const factor = factors.find(f => f.id === factorId);
        if (factor) {
            factor.factorConclusion = text;
            factor.caseSynthesis = text; // Keep synced
            window.app.saveState();
        }
    }

    updateCaseSynthesis(factorId, text) {
        this.updateFactorConclusion(factorId, text);
    }

    updateScore(factorId, field, value, displayElemId) {
        const factors = this.getFactors();
        const factor = factors.find(f => f.id === factorId);
        if (!factor) return;

        factor[field] = parseInt(value);
        this.renderChecklistFactorList();
        this.renderChecklistFactorDetail(factorId);
        this.updateSummaryStats();
        window.app.saveState();
        if (window.lrLabApp) window.lrLabApp.syncFromIdentifiedFactors(false);
    }

    updateSummaryStats() {
        const factors = this.getFactors();
        const total = factors.length;
        const estimators = factors.filter(f => f.category === 'estimator').length;
        const systems = factors.filter(f => f.category === 'system').length;
        
        let fullyRated = 0;
        let totalScore = 0;
        factors.forEach(f => {
            if (f.replicabilityScore !== null && f.replicabilityScore !== undefined &&
                f.generalizabilityScore !== null && f.generalizabilityScore !== undefined &&
                f.relevanceScore !== null && f.relevanceScore !== undefined) {
                fullyRated++;
                totalScore += (f.replicabilityScore + f.generalizabilityScore + f.relevanceScore) / 3;
            }
        });
        const avgOverall = fullyRated > 0 ? (totalScore / fullyRated).toFixed(1) : '—';

        const badgeTotal = document.getElementById('stat-total-factors');
        const badgeEst = document.getElementById('stat-estimator-factors');
        const badgeSys = document.getElementById('stat-system-factors');
        const badgeAvg = document.getElementById('stat-avg-quality');

        if (badgeTotal) badgeTotal.textContent = total;
        if (badgeEst) badgeEst.textContent = estimators;
        if (badgeSys) badgeSys.textContent = systems;
        if (badgeAvg) badgeAvg.textContent = fullyRated > 0 ? `${avgOverall} / 5.0` : 'Pending';
    }

    /* ===================================================================
       FACTOR MODAL MANAGEMENT (MULTIPLE CHOICE TARGET & MANDATORY IMPORTANCE)
       =================================================================== */
    openFactorModal(factorId = null) {
        const modal = document.getElementById('factor-editor-modal');
        if (!modal) return;

        this.editingFactorId = factorId;
        const titleElem = document.getElementById('factor-modal-title');
        const nameInput = document.getElementById('input-factor-name');
        const catEstimator = document.getElementById('input-cat-estimator');
        const catSystem = document.getElementById('input-cat-system');
        const dirDecreases = document.getElementById('input-dir-decreases');
        const dirIncreases = document.getElementById('input-dir-increases');
        const dirMixed = document.getElementById('input-dir-mixed');
        const descInput = document.getElementById('input-factor-desc');

        let currentImportance = null;
        let currentTarget = 'Witness';

        if (factorId) {
            // Edit Mode
            const factors = this.getFactors();
            const factor = factors.find(f => f.id === factorId);
            if (!factor) return;

            if (titleElem) titleElem.textContent = "Edit Case Factor";
            if (nameInput) nameInput.value = factor.name || '';
            if (factor.category === 'system') {
                if (catSystem) catSystem.checked = true;
            } else {
                if (catEstimator) catEstimator.checked = true;
            }

            if (factor.direction === 'increases') {
                if (dirIncreases) dirIncreases.checked = true;
            } else if (factor.direction === 'mixed') {
                if (dirMixed) dirMixed.checked = true;
            } else {
                if (dirDecreases) dirDecreases.checked = true;
            }

            currentTarget = factor.target || 'Witness';
            if (descInput) descInput.value = factor.caseDescription || '';
            currentImportance = factor.importance !== undefined && factor.importance !== null ? factor.importance : null;
        } else {
            // Create New Mode
            if (titleElem) titleElem.textContent = "Add New Case Factor";
            if (nameInput) nameInput.value = '';
            if (catEstimator) catEstimator.checked = true;
            if (dirDecreases) dirDecreases.checked = true;
            if (descInput) descInput.value = '';
            currentTarget = 'Witness';
            currentImportance = null; // Unselected initially (Mandatory)
        }

        // Set Target Multiple Choice Radios
        this.setTargetRoleUI(currentTarget);

        // Render Importance 1-10 Pill Buttons
        this.renderImportancePills(currentImportance);

        modal.style.display = 'flex';
    }

    setTargetRoleUI(target) {
        const specBox = document.getElementById('target-other-spec-box');
        const otherInput = document.getElementById('input-factor-target-other');
        const standardTargets = ['Suspect', 'Victim', 'Witness'];

        if (standardTargets.includes(target)) {
            const radio = document.getElementById(`target-role-${target.toLowerCase()}`);
            if (radio) radio.checked = true;
            if (specBox) specBox.style.display = 'none';
            if (otherInput) otherInput.value = '';
        } else {
            const otherRadio = document.getElementById('target-role-other');
            if (otherRadio) otherRadio.checked = true;
            if (specBox) specBox.style.display = 'block';
            if (otherInput) otherInput.value = target || '';
        }
    }

    handleTargetRoleChange() {
        const isOther = document.getElementById('target-role-other')?.checked;
        const specBox = document.getElementById('target-other-spec-box');
        const otherInput = document.getElementById('input-factor-target-other');

        if (specBox) {
            specBox.style.display = isOther ? 'block' : 'none';
            if (isOther && otherInput) {
                otherInput.focus();
            }
        }
    }

    renderImportancePills(selectedVal) {
        const container = document.getElementById('importance-pills-container');
        const hiddenInput = document.getElementById('input-factor-importance');
        const disp = document.getElementById('display-factor-importance');

        if (hiddenInput) hiddenInput.value = selectedVal !== null ? selectedVal : '';
        if (disp) {
            disp.textContent = selectedVal !== null ? `${selectedVal} / 10` : "Please select (1 - 10)";
            disp.style.color = selectedVal !== null ? "var(--eur-gold)" : "var(--eur-danger)";
        }

        if (!container) return;

        container.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => `
            <button type="button" class="imp-pill-btn ${selectedVal === num ? 'active' : ''}" 
                onclick="window.checklistApp.selectImportance(${num})">
                ${num}
            </button>
        `).join('');
    }

    selectImportance(num) {
        const hiddenInput = document.getElementById('input-factor-importance');
        const disp = document.getElementById('display-factor-importance');

        if (hiddenInput) hiddenInput.value = num;
        if (disp) {
            disp.textContent = `${num} / 10`;
            disp.style.color = "var(--eur-gold)";
        }

        document.querySelectorAll('.imp-pill-btn').forEach((btn, idx) => {
            if (idx + 1 === num) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    closeFactorModal() {
        const modal = document.getElementById('factor-editor-modal');
        if (modal) modal.style.display = 'none';
        this.editingFactorId = null;
    }

    saveFactorFromForm() {
        const nameInput = document.getElementById('input-factor-name');
        const catSystem = document.getElementById('input-cat-system');
        const dirIncreases = document.getElementById('input-dir-increases');
        const dirMixed = document.getElementById('input-dir-mixed');
        const descInput = document.getElementById('input-factor-desc');
        const impInput = document.getElementById('input-factor-importance');

        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) {
            alert("Please provide a Factor Name.");
            if (nameInput) nameInput.focus();
            return;
        }

        // Validate Target Person
        let target = 'Witness';
        if (document.getElementById('target-role-suspect')?.checked) target = 'Suspect';
        else if (document.getElementById('target-role-victim')?.checked) target = 'Victim';
        else if (document.getElementById('target-role-witness')?.checked) target = 'Witness';
        else if (document.getElementById('target-role-other')?.checked) {
            const otherVal = document.getElementById('input-factor-target-other')?.value.trim();
            if (!otherVal) {
                alert("Please specify the target person role for 'Other'.");
                document.getElementById('input-factor-target-other')?.focus();
                return;
            }
            target = otherVal;
        }

        // Validate Importance (Mandatory)
        const impVal = impInput ? impInput.value : '';
        if (!impVal || isNaN(parseInt(impVal))) {
            alert("Please select a Case Importance rating from 1 to 10.");
            return;
        }
        const importance = parseInt(impVal);

        const category = (catSystem && catSystem.checked) ? 'system' : 'estimator';
        let direction = 'decreases';
        if (dirIncreases && dirIncreases.checked) direction = 'increases';
        if (dirMixed && dirMixed.checked) direction = 'mixed';

        const desc = descInput ? descInput.value.trim() : '';

        if (!window.app.currentProject.factors) window.app.currentProject.factors = [];

        if (this.editingFactorId) {
            // Update existing
            const factor = window.app.currentProject.factors.find(f => f.id === this.editingFactorId);
            if (factor) {
                factor.name = name;
                factor.category = category;
                factor.direction = direction;
                factor.target = target;
                factor.caseDescription = desc;
                factor.importance = importance;
            }
            window.app.showNotification(`Updated factor "${name}"!`, 'info');
        } else {
            // Create new factor (with initial scores set to null - Mandatory Student Evaluation)
            const newFactor = {
                id: `factor_${Date.now()}`,
                name: name,
                category: category,
                direction: direction,
                target: target,
                caseDescription: desc,
                importance: importance,
                guidedAnswers: {},
                replicabilityScore: null,
                generalizabilityScore: null,
                relevanceScore: null,
                replicabilityNotes: "",
                generalizabilityNotes: "",
                relevanceNotes: "",
                factorConclusion: "",
                caseSynthesis: ""
            };
            window.app.currentProject.factors.push(newFactor);
            this.selectedFactorId = newFactor.id;
            window.app.showNotification(`Added factor "${name}" (Importance: ${importance}/10)!`, 'success');
        }

        this.closeFactorModal();
        this.renderFactorIdentificationTable();
        this.renderChecklistFactorList();
        this.renderChecklistFactorDetail(this.selectedFactorId);
        this.updateSummaryStats();
        window.app.saveState();
        if (window.lrLabApp) window.lrLabApp.syncFromIdentifiedFactors(false);
    }

    deleteFactor(factorId) {
        if (!confirm("Are you sure you want to remove this factor from your case analysis?")) return;

        window.app.currentProject.factors = window.app.currentProject.factors.filter(f => f.id !== factorId);
        const remaining = this.getFactors();
        this.selectedFactorId = remaining.length > 0 ? remaining[0].id : null;

        this.renderFactorIdentificationTable();
        this.renderChecklistFactorList();
        this.renderChecklistFactorDetail(this.selectedFactorId);
        this.updateSummaryStats();
        window.app.saveState();
        if (window.lrLabApp) window.lrLabApp.syncFromIdentifiedFactors(false);
        window.app.showNotification("Factor removed.", "info");
    }
}
