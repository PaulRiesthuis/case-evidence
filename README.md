# Forensic Psychology Evidence & Likelihood Ratio Student Workbench

A browser-based educational and professional tool for **forensic psychology students, legal researchers, and expert witnesses**. 

This workbench guides users through evaluating eyewitness testimony, interrogation methods, and memory evidence using the **Three Pillars of Scientific Scrutiny**, mathematically deriving **Likelihood Ratios (Rassin et al., 2022)**, generating courtroom-compliant **Expert Witness Reports** (PDF / Word export), and practicing **Moot Court Cross-Examinations**.

---

## 🏛️ The 5-Step Forensic Evidence Workflow

```
┌─────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│ 1. Case         │ ──> │ 2. Identified        │ ──> │ 3. Scientific        │
│    Scenarios    │     │    Factors           │     │    Quality (3-Pillar)│
└─────────────────┘     └──────────────────────┘     └──────────────────────┘
                                                                │
                                                                ▼
┌─────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│ 5. Moot Court   │ <── │ 4. Likelihood Ratios │ <───┘ Auto-derived from    │
│    Practice     │     │    & Expert Report   │     │ 3-pillar scores      │
└─────────────────┘     └──────────────────────┘     └──────────────────────┘
```

1. **Step 1: Case Scenarios & Competing Hypotheses ($H_1$ vs. $H_2$)**
   * Define the legal mandate, case reference, commissioner, and expert role.
   * Formulate mutually exclusive propositions using quick scenario presets (*Eyewitness Lineup, Coerced Confession, Child Memory Contamination, Alibi Assessment, or Custom*).

2. **Step 2: Identified Factors**
   * Catalog Estimator and System variables affecting witness perception, memory trace, or procedures.
   * Rate case-specific importance (1–10) and assign the direction of validity impact (*Increases*, *Decreases*, *Mixed/Neutral*).

3. **Step 3: Scientific Quality (The Three Pillars)**
   * **Pillar 1: Replicability** — Meta-analytic convergence, multi-lab replications, sample sizes, and registered reports.
   * **Pillar 2: Generalizability (Ecological Validity)** — Boundary condition matching (lighting, distance, retention delay, acute trauma/stress).
   * **Pillar 3: Practical Relevance (SESOI)** — Smallest Effect Size of Interest thresholds and real-world legal impact.

4. **Step 4: Likelihood Ratios & Expert Witness Report**
   * **Automated & Manual Probability Derivation**: $LR = \frac{P(\text{Evidence} \mid H_1)}{P(\text{Evidence} \mid H_2)}$
   * **Verbal Evidence Scales**: Reference tables for legal & psychological literature (**Jarosz & Wiley, 2014**) and official forensic science guidelines (**ENFSI, 2015**).
   * **Methodological Compounding**: Choose between *Direct Multiplication* (independent observers/procedures) and *Conservative Weighted Compounding* (shared cognitive variance on a single witness trace; Rassin et al., 2022).
   * **Prosecutor's Fallacy Safeguards**: Explicitly guides students to report $P(\text{Evidence} \mid \text{Hypothesis})$ without unlawfully transposing the conditional or declaring guilt/innocence.
   * **Export Tools**: One-click generation and export of formatted **PDF** and **Word Document (.doc)** Expert Witness Reports.

5. **Step 5: Moot Court Practice**
   * Interactive courtroom cross-examination simulator.
   * Practice oral defense against randomized, challenging questions from **Prosecution**, **Defense**, and **Judge** perspectives.
   * Features countdown response timers, audio recording & playback, model expert answers, and objective self-rubrics (*"Defend, don't be defensive"*).

---

## 💻 Tech Stack & Architecture

* **100% Client-Side**: No backend, no databases, and no external server dependencies.
* **Core**: Vanilla HTML5, CSS3 (Custom Design System with Dark & Light modes), Modern ES6+ JavaScript.
* **Persistence**: Browser `localStorage` auto-saves all case evaluations and factor scores automatically.
* **Zero Build Steps**: Runs instantly out of the box in any modern web browser.

---

## 🚀 Running Locally

1. Download or clone this repository to your computer:
   ```bash
   git clone https://github.com/your-username/forensic-evidence-workbench.git
   ```
2. Double-click **`index.html`** or right-click and choose **Open with > Chrome / Firefox / Safari / Edge**.

---

## 📁 Repository Structure

```
├── index.html            # Main HTML single-page application
├── README.md             # Documentation and usage guide
├── css/
│   └── style.css         # Responsive stylesheet (dark/light themes, mobile support)
└── js/
    ├── app.js            # Main application coordinator & tooltip manager
    ├── caseData.js       # Preloaded case presets & psychological factors database
    ├── checklist.js      # Step 2 & 3: Factor catalog and 3-pillar scrutiny logic
    ├── likelihoodRatio.js# Step 4: Likelihood ratio calculations & report generation
    └── mootCourt.js      # Step 5: Moot court simulation, timer & audio practice
```

---

## 📚 References & Scientific Literature

* **Rassin, E., de Poot, C., & Schoemaker, J. (2022).** Assessing the strength of eyewitness evidence using likelihood ratios. *Psychiatry, Psychology and Law*, 29(4), 578–592.
* **Jarosz, A. F., & Wiley, J. (2014).** What are the odds? A practical guide to computing and reporting Bayes factors. *The Journal of Problem Solving*, 7(1), 2.
* **ENFSI (2015).** *ENFSI Guideline for Evaluative Reporting in Forensic Science*. European Network of Forensic Science Institutes.
* **Wagenaar, W. A., & van der Schrier, J. H. (1996).** Face recognition as a function of distance and illumination: A practical tool for use in the courtroom. *Psychology, Crime & Law*, 2(4), 321–332.
* **Fawcett, J. M., Russell, E. J., Peace, K. A., & Christie, J. (2013).** Of guns and geese: A meta-analytic review of the ‘weapon focus’ effect. *Psychology, Crime & Law*, 19(1), 35–66.

---

## 📄 License

This project is created for educational and scientific research purposes. Open for academic use and student training.
