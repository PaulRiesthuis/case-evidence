/**
 * Forensic Psychology Case Evidence & Likelihood Ratio Workbench
 * Main Application Coordinator
 */

class App {
    constructor() {
        this.activeTab = 'intro';
        this.currentProject = {
            mandate: {
                caseTitle: "Forensic Case Analysis",
                commissioner: "Examining Magistrate / Court",
                expertRole: "Independent Expert Witness in Forensic Psychology",
                evidentiaryScope: "Evaluation of witness memory, identification reliability, and interrogation procedures.",
                selectedPreset: "identification",
                hypothesisHp: "Hypothesis 1 (H1): The eyewitness identification is accurate (The suspect is the person seen by the witness).",
                hypothesisHd: "Hypothesis 2 (H2): The eyewitness identification is mistaken (The suspect is an innocent person mistakenly identified)."
            },
            factors: [],
            lrItems: []
        };
    }

    init() {
        this.loadSavedState();
        this.bindNavigation();
        this.bindThemeToggle();
        this.bindProjectActions();
        this.initFloatingTooltips();

        // Initialize Sub-Apps
        window.checklistApp = new ScientificChecklist();
        window.checklistApp.init();

        window.lrLabApp = new LikelihoodRatioLab();
        window.lrLabApp.init();

        window.mootCourtApp = new MootCourtSimulator();
        window.mootCourtApp.init();

        this.updateProjectUI();
        this.updateNavBadges();
        this.switchTab('intro');
    }

    loadSavedState() {
        const saved = localStorage.getItem('eur_forensic_clean_project_v1');
        if (saved) {
            try {
                this.currentProject = JSON.parse(saved);
            } catch (e) {
                console.error("Error loading saved project:", e);
            }
        }
    }

    saveState() {
        if (this.currentProject) {
            localStorage.setItem('eur_forensic_clean_project_v1', JSON.stringify(this.currentProject));
            this.updateNavBadges();
            this.triggerAutosaveIndicator();
        }
    }

    triggerAutosaveIndicator() {
        const indicator = document.getElementById('autosave-status');
        if (!indicator) return;

        indicator.classList.add('saving');
        indicator.innerHTML = `<i class="fas fa-sync fa-spin"></i> <span>Saving...</span>`;

        if (this._autosaveTimeout) clearTimeout(this._autosaveTimeout);
        this._autosaveTimeout = setTimeout(() => {
            indicator.classList.remove('saving');
            indicator.innerHTML = `<i class="fas fa-check-circle"></i> <span>Saved locally</span>`;
        }, 350);
    }

    updateNavBadges() {
        const factors = this.currentProject?.factors || [];
        const badge1 = document.getElementById('nav-badge-step1');
        const badge2 = document.getElementById('nav-badge-step2');
        const badge3 = document.getElementById('nav-badge-step3');
        const badge4 = document.getElementById('nav-badge-step4');
        const badge5 = document.getElementById('nav-badge-step5');

        // Step 1: Case Scenarios & Hypotheses
        if (badge1) {
            const hasH1 = !!(this.currentProject?.mandate?.hypothesisHp?.trim());
            const hasH2 = !!(this.currentProject?.mandate?.hypothesisHd?.trim());
            if (hasH1 && hasH2) {
                badge1.textContent = 'H₁ vs H₂ Set';
                badge1.className = 'nav-tab-badge badge-complete';
            } else {
                badge1.textContent = 'Incomplete';
                badge1.className = 'nav-tab-badge badge-pending';
            }
        }

        // Step 2: Identified Case Factors
        if (badge2) {
            badge2.textContent = factors.length === 1 ? '1 Factor' : `${factors.length} Factors`;
            badge2.className = factors.length > 0 ? 'nav-tab-badge badge-complete' : 'nav-tab-badge';
        }

        // Step 3: Scientific Quality (3 Pillars)
        if (badge3) {
            if (factors.length === 0) {
                badge3.textContent = '0 Factors';
                badge3.className = 'nav-tab-badge';
            } else {
                const completeCount = factors.filter(f => 
                    f.replicabilityScore !== null && f.replicabilityScore !== undefined &&
                    f.generalizabilityScore !== null && f.generalizabilityScore !== undefined &&
                    f.relevanceScore !== null && f.relevanceScore !== undefined
                ).length;

                if (completeCount === factors.length) {
                    badge3.textContent = `All ${factors.length} Rated ✓`;
                    badge3.className = 'nav-tab-badge badge-complete';
                } else {
                    badge3.textContent = `${completeCount}/${factors.length} Rated`;
                    badge3.className = 'nav-tab-badge badge-pending';
                }
            }
        }

        // Step 4: Likelihood Ratios
        if (badge4) {
            let lrVal = 1.0;
            if (window.lrLabApp && typeof window.lrLabApp.calculateCompoundLR === 'function') {
                lrVal = window.lrLabApp.calculateCompoundLR();
            } else if (window.lrLabApp && typeof window.lrLabApp.calculateRawCompoundLR === 'function') {
                lrVal = window.lrLabApp.calculateRawCompoundLR();
            }
            badge4.textContent = `LR: ${lrVal.toFixed(2)}`;
            badge4.className = 'nav-tab-badge';
        }

        // Step 5: Moot Court
        if (badge5) {
            const totalQ = APP_DATA?.mootQuestions?.length || 22;
            badge5.textContent = `${totalQ} Qs`;
            badge5.className = 'nav-tab-badge';
        }

        // Also update banner stat chips if present
        const statPreset = document.getElementById('stat-scenario-preset');
        if (statPreset && this.currentProject?.mandate?.selectedPreset) {
            const presetId = this.currentProject.mandate.selectedPreset;
            const pObj = APP_DATA?.scenarioPresets?.find(p => p.id === presetId);
            statPreset.textContent = pObj ? pObj.name.split(' ')[0] : 'Custom';
        }
    }

    resetProject() {
        if (!confirm("Start a new blank case? This will reset the current factors and calculations.")) return;

        this.currentProject = {
            mandate: {
                caseTitle: "New Forensic Case",
                commissioner: "Examining Magistrate / Court",
                expertRole: "Independent Expert Witness in Forensic Psychology",
                evidentiaryScope: "Evaluation of witness statements and identification evidence.",
                selectedPreset: "identification",
                hypothesisHp: "Hypothesis 1 (H1): The eyewitness identification is accurate (The suspect is the person seen by the witness).",
                hypothesisHd: "Hypothesis 2 (H2): The eyewitness identification is mistaken (The suspect is an innocent person mistakenly identified)."
            },
            factors: [],
            lrItems: []
        };

        this.saveState();
        if (window.checklistApp) window.checklistApp.init();
        if (window.lrLabApp) window.lrLabApp.init();
        this.updateProjectUI();
        this.switchTab('case-setup');
        this.showNotification("Started fresh blank case project!", "info");
    }

    bindNavigation() {
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;
                this.switchTab(target);
            });
        });
    }

    switchTab(tabId) {
        this.activeTab = tabId;

        const navBar = document.getElementById('main-nav-bar');
        const headerGuideBtn = document.getElementById('btn-header-guide');
        const headerResetBtn = document.getElementById('btn-reset-project');

        if (tabId === 'intro') {
            if (navBar) navBar.style.display = 'none';
            if (headerGuideBtn) headerGuideBtn.style.display = 'none';
            if (headerResetBtn) headerResetBtn.style.display = 'none';
        } else {
            if (navBar) navBar.style.display = 'block';
            if (headerGuideBtn) headerGuideBtn.style.display = 'inline-flex';
            if (headerResetBtn) headerResetBtn.style.display = 'inline-flex';
        }

        // Update nav buttons
        document.querySelectorAll('.nav-tab-btn').forEach(b => {
            if (b.dataset.tab === tabId) {
                b.classList.add('active');
                if (window.innerWidth <= 992) {
                    b.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }
            } else {
                b.classList.remove('active');
            }
        });

        // Update tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            if (pane.id === `tab-${tabId}`) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });

        // Refresh components when tab is displayed
        if (tabId === 'case-setup') {
            this.renderScenarioPresetPills();
        }
        if (tabId === 'factors') {
            if (window.checklistApp) window.checklistApp.renderFactorIdentificationTable();
        }
        if (tabId === 'checklist' && window.checklistApp) window.checklistApp.init();
        if (tabId === 'likelihood-ratio' && window.lrLabApp) window.lrLabApp.init();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    bindThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle-btn');
        if (!toggleBtn) return;

        const currentTheme = localStorage.getItem('eur_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        this.updateThemeIcon(currentTheme);

        toggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('eur_theme', next);
            this.updateThemeIcon(next);
        });
    }

    updateThemeIcon(theme) {
        const toggleBtn = document.getElementById('theme-toggle-btn');
        if (!toggleBtn) return;
        if (theme === 'dark') {
            toggleBtn.innerHTML = `<i class="fas fa-sun"></i> <span>Light Mode</span>`;
        } else {
            toggleBtn.innerHTML = `<i class="fas fa-moon"></i> <span>Dark Mode</span>`;
        }
    }

    bindProjectActions() {
        // Reset Button
        const resetBtn = document.getElementById('btn-reset-project');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetProject());
        }

        // Mandate Inputs in Tab 2 (Case Setup)
        const caseTitleInput = document.getElementById('mandate-case-title');
        const commInput = document.getElementById('mandate-commissioner');
        const hpInput = document.getElementById('mandate-hp');
        const hdInput = document.getElementById('mandate-hd');

        const updateMandateFromInputs = () => {
            if (!this.currentProject.mandate) this.currentProject.mandate = {};
            if (caseTitleInput) this.currentProject.mandate.caseTitle = caseTitleInput.value;
            if (commInput) this.currentProject.mandate.commissioner = commInput.value;
            
            let userEditedHypo = false;
            if (hpInput) {
                this.currentProject.mandate.hypothesisHp = hpInput.value;
                const lrHp = document.getElementById('lr-input-hp');
                if (lrHp && lrHp.value !== hpInput.value) lrHp.value = hpInput.value;
                userEditedHypo = true;
            }
            if (hdInput) {
                this.currentProject.mandate.hypothesisHd = hdInput.value;
                const lrHd = document.getElementById('lr-input-hd');
                if (lrHd && lrHd.value !== hdInput.value) lrHd.value = hdInput.value;
                userEditedHypo = true;
            }

            // Check if current text matches a known preset, else mark 'custom'
            if (userEditedHypo && APP_DATA.scenarioPresets) {
                const matched = APP_DATA.scenarioPresets.find(p => p.id !== 'custom' && p.h1 === hpInput?.value && p.h2 === hdInput?.value);
                this.currentProject.mandate.selectedPreset = matched ? matched.id : 'custom';
                this.renderScenarioPresetPills();
            }

            this.saveState();
        };

        [caseTitleInput, commInput, hpInput, hdInput].forEach(inp => {
            if (inp) inp.addEventListener('input', updateMandateFromInputs);
        });
    }

    renderScenarioPresetPills() {
        const container = document.getElementById('scenario-preset-pills');
        if (!container || !APP_DATA.scenarioPresets) return;

        const currentPreset = this.currentProject?.mandate?.selectedPreset || 'identification';

        container.innerHTML = APP_DATA.scenarioPresets.map(p => {
            const isActive = currentPreset === p.id;
            const tooltipHTML = p.id === 'custom'
                ? `&lt;div style=&quot;font-size: 0.8rem; line-height: 1.4;&quot;&gt;&lt;strong style=&quot;color: #38bdf8;&quot;&gt;Custom Scenario&lt;/strong&gt;&lt;p style=&quot;margin: 0.25rem 0 0 0; color: #cbd5e1;&quot;&gt;Write your own custom primary and alternative propositions.&lt;/p&gt;&lt;/div&gt;`
                : `&lt;div style=&quot;font-size: 0.8rem; line-height: 1.45; max-width: 320px;&quot;&gt;&lt;div style=&quot;font-weight: 700; color: #38bdf8; margin-bottom: 0.3rem;&quot;&gt;${p.name}&lt;/div&gt;&lt;div style=&quot;color: #94a3b8; font-size: 0.74rem; margin-bottom: 0.35rem;&quot;&gt;${p.description}&lt;/div&gt;&lt;div style=&quot;background: rgba(255,255,255,0.06); padding: 0.35rem 0.5rem; border-radius: 4px; font-size: 0.72rem;&quot;&gt;&lt;strong style=&quot;color: #60a5fa;&quot;&gt;H1:&lt;/strong&gt; ${p.h1}&lt;br/&gt;&lt;strong style=&quot;color: #fbbf24; margin-top: 0.2rem; display: inline-block;&quot;&gt;H2:&lt;/strong&gt; ${p.h2}&lt;/div&gt;&lt;/div&gt;`;

            return `
                <button type="button" class="preset-pill-btn ${isActive ? 'active' : ''}" 
                    onclick="window.app.applyScenarioPreset('${p.id}')"
                    data-preset="${p.id}"
                    data-tooltip="${tooltipHTML}">
                    <i class="${p.icon}"></i>
                    <span>${p.name}</span>
                </button>
            `;
        }).join('');
    }

    toggleCollapsibleBox(boxId) {
        const box = document.getElementById(boxId);
        if (!box) return;
        box.classList.toggle('collapsed');
    }

    applyScenarioPreset(presetId) {
        if (!APP_DATA.scenarioPresets) return;
        const preset = APP_DATA.scenarioPresets.find(p => p.id === presetId);
        if (!preset) return;

        if (!this.currentProject.mandate) this.currentProject.mandate = {};
        this.currentProject.mandate.selectedPreset = presetId;

        const hpInput = document.getElementById('mandate-hp');
        const hdInput = document.getElementById('mandate-hd');
        const lrHp = document.getElementById('lr-input-hp');
        const lrHd = document.getElementById('lr-input-hd');

        if (presetId !== 'custom') {
            this.currentProject.mandate.hypothesisHp = preset.h1;
            this.currentProject.mandate.hypothesisHd = preset.h2;
            if (hpInput) hpInput.value = preset.h1;
            if (hdInput) hdInput.value = preset.h2;
            if (lrHp) lrHp.value = preset.h1;
            if (lrHd) lrHd.value = preset.h2;
            this.showNotification(`Applied scenario preset: ${preset.name}`, "info");
        } else {
            if (hpInput) hpInput.focus();
            this.showNotification(`Custom scenario: Enter your competing hypotheses`, "info");
        }

        this.renderScenarioPresetPills();
        this.saveState();

        if (window.lrLabApp) {
            window.lrLabApp.renderHypothesesHeader();
        }
    }

    updateProjectUI() {
        if (!this.currentProject) return;
        const m = this.currentProject.mandate || {};

        const caseTitleInput = document.getElementById('mandate-case-title');
        const commInput = document.getElementById('mandate-commissioner');
        const hpInput = document.getElementById('mandate-hp');
        const hdInput = document.getElementById('mandate-hd');
        const lrHp = document.getElementById('lr-input-hp');
        const lrHd = document.getElementById('lr-input-hd');

        if (caseTitleInput) caseTitleInput.value = m.caseTitle || '';
        if (commInput) commInput.value = m.commissioner || '';
        if (hpInput) hpInput.value = m.hypothesisHp || '';
        if (hdInput) hdInput.value = m.hypothesisHd || '';
        if (lrHp) lrHp.value = m.hypothesisHp || '';
        if (lrHd) lrHd.value = m.hypothesisHd || '';

        this.renderScenarioPresetPills();
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '<i class="fas fa-info-circle"></i>';
        if (type === 'success') icon = '<i class="fas fa-check-circle"></i>';
        if (type === 'warning') icon = '<i class="fas fa-exclamation-triangle"></i>';
        if (type === 'danger') icon = '<i class="fas fa-times-circle"></i>';

        toast.innerHTML = `${icon} <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    initFloatingTooltips() {
        // Create global tooltip element attached to body (avoids all overflow clippings)
        let tooltipElem = document.getElementById('global-concept-tooltip');
        if (!tooltipElem) {
            tooltipElem = document.createElement('div');
            tooltipElem.id = 'global-concept-tooltip';
            tooltipElem.className = 'global-concept-tooltip';
            document.body.appendChild(tooltipElem);
        }

        let currentTarget = null;

        const showTooltip = (target) => {
            const tipText = target.getAttribute('data-tooltip') || target.getAttribute('data-tip');
            if (!tipText) return;

            currentTarget = target;
            tooltipElem.innerHTML = tipText;
            tooltipElem.classList.add('visible');

            // Compute smart coordinates avoiding screen edges
            const targetRect = target.getBoundingClientRect();
            const tooltipRect = tooltipElem.getBoundingClientRect();
            const tipWidth = tooltipRect.width;
            const tipHeight = tooltipRect.height;

            // Horizontal alignment: Center above the target
            let left = targetRect.left + (targetRect.width / 2) - (tipWidth / 2);

            // Left & Right viewport boundary protection
            if (left < 14) {
                left = 14;
            } else if (left + tipWidth > window.innerWidth - 14) {
                left = window.innerWidth - tipWidth - 14;
            }

            // Vertical alignment: Prefer above the target; flip below if near top
            let top;
            if (targetRect.top - tipHeight - 12 < 10) {
                // Not enough room above -> place below target
                top = targetRect.bottom + window.scrollY + 10;
            } else {
                // Place above target
                top = targetRect.top + window.scrollY - tipHeight - 10;
            }

            tooltipElem.style.left = `${Math.round(left)}px`;
            tooltipElem.style.top = `${Math.round(top)}px`;
        };

        const hideTooltip = () => {
            currentTarget = null;
            tooltipElem.classList.remove('visible');
        };

        // Delegated event listeners
        document.addEventListener('mouseover', (e) => {
            const tipEl = e.target.closest('[data-tooltip], [data-tip], .concept-tip');
            if (tipEl) {
                // If title attribute exists on element, strip it to prevent duplicate browser tooltip
                if (tipEl.hasAttribute('title') && !tipEl.hasAttribute('data-tooltip')) {
                    tipEl.setAttribute('data-tooltip', tipEl.getAttribute('title'));
                    tipEl.removeAttribute('title');
                }
                showTooltip(tipEl);
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (currentTarget && !currentTarget.contains(e.relatedTarget)) {
                hideTooltip();
            }
        });

        // Click / Tap support for tooltips on mobile and touch devices
        document.addEventListener('click', (e) => {
            const tipEl = e.target.closest('[data-tooltip], [data-tip], .concept-tip, .info-tip, .info-tip-trigger');
            if (tipEl) {
                if (currentTarget === tipEl) {
                    hideTooltip();
                } else {
                    if (tipEl.hasAttribute('title') && !tipEl.hasAttribute('data-tooltip')) {
                        tipEl.setAttribute('data-tooltip', tipEl.getAttribute('title'));
                        tipEl.removeAttribute('title');
                    }
                    showTooltip(tipEl);
                }
            } else if (currentTarget && !e.target.closest('#global-concept-tooltip')) {
                hideTooltip();
            }
        });

        window.addEventListener('scroll', () => {
            if (currentTarget && window.innerWidth > 768) hideTooltip();
        }, { passive: true });

        window.addEventListener('resize', () => {
            if (currentTarget) hideTooltip();
        }, { passive: true });
    }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});

