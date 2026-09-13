/**
 * Forensic Psychology Case Evidence & Likelihood Ratio Workbench
 * Educational Data Definitions & Moot Court Question Bank
 */

const APP_DATA = {
    // Preset Scenario Formulations (Identification, Testimony, Confession, Prosecution vs Defense, Custom)
    scenarioPresets: [
        {
            id: "identification",
            name: "Identification Accuracy",
            icon: "fas fa-user-check",
            badge: "Eyewitness",
            description: "Identification is accurate (True perpetrator) vs. mistaken (Innocent bystander/foil)",
            h1: "Hypothesis 1 (H1): The eyewitness identification is accurate (The suspect is the person seen by the witness).",
            h2: "Hypothesis 2 (H2): The eyewitness identification is mistaken (The suspect is an innocent person mistakenly identified)."
        },
        {
            id: "testimony",
            name: "Testimony Validity",
            icon: "fas fa-comment-dots",
            badge: "Statement",
            description: "Statement is reliable & uncorrupted vs. distorted / contaminated by suggestive questioning",
            h1: "Hypothesis 1 (H1): The witness statement/testimony is valid, accurate, and uncorrupted.",
            h2: "Hypothesis 2 (H2): The witness statement/testimony is invalid, distorted, or contaminated by suggestion/misinformation."
        },
        {
            id: "confession",
            name: "Confession Veracity",
            icon: "fas fa-balance-scale",
            badge: "Interrogation",
            description: "Confession is true & voluntary vs. coerced / compliant / internalized false confession",
            h1: "Hypothesis 1 (H1): The confession statement is true, voluntary, and factually accurate.",
            h2: "Hypothesis 2 (H2): The confession is false, coerced, compliant, or contaminated by interrogation pressure."
        },
        {
            id: "prosecution_defense",
            name: "Prosecution vs. Defense",
            icon: "fas fa-gavel",
            badge: "Case Theory",
            description: "Prosecution theory of guilt (Hp) vs. Defense theory of innocence (Hd)",
            h1: "Prosecution Hypothesis (Hp / H1): The suspect committed the alleged offense as charged.",
            h2: "Defense Hypothesis (Hd / H2): The suspect is innocent / did not commit the alleged offense."
        },
        {
            id: "court",
            name: "Prosecution vs. Defense (General)",
            icon: "fas fa-gavel",
            badge: "Court Mandate",
            description: "Primary proposition of the commissioning party vs. competing alternative proposition",
            h1: "Hypothesis 1 (H1): The primary proposition (prosecution/commissioning party account) is true.",
            h2: "Hypothesis 2 (H2): The alternative proposition (defense/competing account) is true."
        },
        {
            id: "custom",
            name: "Custom / Open Scenario",
            icon: "fas fa-pen-fancy",
            badge: "Custom",
            description: "Define your own specific competing hypotheses for this case",
            h1: "",
            h2: ""
        }
    ],

    // Default Case Presets for quick student experimentation
    casePresets: [
        {
            id: "case1",
            name: "Case 1: Robbery at Night (Eyewitness)",
            mandate: {
                caseTitle: "State v. Nigel - Robbery Case Evaluation",
                commissioner: "Examining Magistrate / District Court",
                expertRole: "Independent Expert Witness in Forensic Psychology",
                evidentiaryScope: "Evaluation of witness perceptual factors, retention interval, and identification lineup reliability.",
                selectedPreset: "identification",
                hypothesisHp: "Hypothesis 1 (H1): The eyewitness identification is accurate (The suspect is the perpetrator seen during the robbery).",
                hypothesisHd: "Hypothesis 2 (H2): The eyewitness identification is mistaken (The suspect is an innocent person mistakenly identified)."
            },
            factors: [
                {
                    id: "f_c1_dist",
                    name: "Observation Distance & Lighting",
                    target: "Witness de Jong",
                    category: "estimator",
                    direction: "decreases",
                    importance: 8,
                    caseDescription: "Observation occurred at 20 meters under dim street lighting (approx. 10 lux).",
                    replicabilityScore: 4,
                    generalizabilityScore: 4,
                    relevanceScore: 4,
                    replicabilityNotes: "Well-established psycho-physical visual acuity thresholds (Wagenaar & van der Schrier, 1996; Loftus & Harley, 2005).",
                    generalizabilityNotes: "Controlled optical simulations and field tests confirm facial recognition drops sharply beyond 15 meters in poor illumination.",
                    relevanceNotes: "SESOI exceeded: 20m in dim light reduces facial feature recognition accuracy by over 30% relative to baseline.",
                    factorConclusion: "Strong empirical evidence that distance and lighting significantly reduce identification reliability in this case."
                },
                {
                    id: "f_c1_showup",
                    name: "Immediate Showup Procedure",
                    target: "Suspect Nigel",
                    category: "system",
                    direction: "decreases",
                    importance: 9,
                    caseDescription: "Single suspect showup 15 minutes after arrest.",
                    replicabilityScore: 5,
                    generalizabilityScore: 4,
                    relevanceScore: 5,
                    replicabilityNotes: "Extensively replicated meta-analyses demonstrate that single-suspect showups produce higher false identification rates than fair lineups (Steblay et al., 2003).",
                    generalizabilityNotes: "Real police archival cases and laboratory simulations show showups are inherently suggestive.",
                    relevanceNotes: "High practical impact: Showup procedure directly increased the probability of mistaken identification.",
                    factorConclusion: "The single-suspect showup is an inherently suggestive system factor that undermines the probative value of the identification."
                },
                {
                    id: "f_c1_lineup",
                    name: "Pristine Identification Lineup",
                    target: "Suspect",
                    category: "system",
                    direction: "increases",
                    importance: 8,
                    caseDescription: "Immediate double-blind lineup.",
                    replicabilityScore: 5,
                    generalizabilityScore: 5,
                    relevanceScore: 4,
                    replicabilityNotes: "Double-blind simultaneous/sequential lineups with verified known-innocent fillers prevent administrator leakage (Wells et al., 2020).",
                    generalizabilityNotes: "Supported across major lab paradigms and real-world police departments.",
                    relevanceNotes: "Substantially enhances evidentiary diagnosticity when conducted properly.",
                    factorConclusion: "Double-blind administration protects against unconscious cueing, supporting identification validity."
                }
            ]
        },
        {
            id: "case2",
            name: "Case 2: Store Hold-up (Contaminated Statement)",
            mandate: {
                caseTitle: "State v. Miller - Store Hold-up Witness Evaluation",
                commissioner: "Defense Counsel",
                expertRole: "Independent Expert Witness in Forensic Psychology",
                evidentiaryScope: "Assessment of co-witness discussion, leading questioning, and retention delay on statement veracity.",
                selectedPreset: "testimony",
                hypothesisHp: "Hypothesis 1 (H1): The witness statement is accurate, uncontaminated, and independently recalled.",
                hypothesisHd: "Hypothesis 2 (H2): The witness statement is contaminated, distorted, or shaped by post-event suggestion."
            },
            factors: [
                {
                    id: "f_c2_cowitness",
                    name: "Co-Witness Discussion (Memory Conformity)",
                    target: "Witnesses A & B",
                    category: "system",
                    direction: "decreases",
                    importance: 9,
                    caseDescription: "Witnesses discussed the event together for 20 minutes before police arrived.",
                    replicabilityScore: 5,
                    generalizabilityScore: 4,
                    relevanceScore: 5,
                    replicabilityNotes: "Replicated extensively across MORI technique and confederate paradigms (Wright et al., 2000; Gabbert et al., 2003).",
                    generalizabilityNotes: "Memory conformity occurs robustly in both lab discussions and real social interactions.",
                    relevanceNotes: "SESOI clearly exceeded: over 70% of co-witness pairs incorporate non-witnessed details into their subsequent statements.",
                    factorConclusion: "Unsupervised co-witness discussion creates a high risk of memory conformity and shared misinformation."
                }
            ]
        }
    ],

    // Primary Likelihood Ratio Verbal Interpretation Scale: Jarosz & Wiley (2014) / Rassin et al. (2022)
    jaroszWileyScale: [
        { minLR: 100, maxLR: Infinity, text: "Decisive evidence for H1", badgeClass: "badge-lr-extreme-hp", shortText: "Decisive for H1" },
        { minLR: 30, maxLR: 100, text: "Very strong evidence for H1", badgeClass: "badge-lr-modstrong-hp", shortText: "Very strong for H1" },
        { minLR: 10, maxLR: 30, text: "Strong evidence for H1", badgeClass: "badge-lr-strong-hp", shortText: "Strong for H1" },
        { minLR: 3, maxLR: 10, text: "Substantial evidence for H1", badgeClass: "badge-lr-moderate-hp", shortText: "Substantial for H1" },
        { minLR: 1.05, maxLR: 3, text: "Anecdotal evidence for H1", badgeClass: "badge-lr-weak-hp", shortText: "Anecdotal for H1" },
        { minLR: 0.95, maxLR: 1.05, text: "No evidence / Neutral (LR ≈ 1)", badgeClass: "badge-lr-neutral", shortText: "No evidence (Neutral)" },
        { minLR: 0.333, maxLR: 0.95, text: "Anecdotal evidence for H2", badgeClass: "badge-lr-weak-hd", shortText: "Anecdotal for H2" },
        { minLR: 0.100, maxLR: 0.333, text: "Substantial evidence for H2", badgeClass: "badge-lr-moderate-hd", shortText: "Substantial for H2" },
        { minLR: 0.033, maxLR: 0.100, text: "Strong evidence for H2", badgeClass: "badge-lr-strong-hd", shortText: "Strong for H2" },
        { minLR: 0.010, maxLR: 0.033, text: "Very strong evidence for H2", badgeClass: "badge-lr-modstrong-hd", shortText: "Very strong for H2" },
        { minLR: 0, maxLR: 0.010, text: "Decisive evidence for H2", badgeClass: "badge-lr-extreme-hd", shortText: "Decisive for H2" }
    ],

    // Reference ENFSI Scale (For hover comparison notes)
    enfsiScale: [
        { minLR: 1000000, maxLR: Infinity, text: "Extremely strong support" },
        { minLR: 10000, maxLR: 1000000, text: "Very strong support" },
        { minLR: 1000, maxLR: 10000, text: "Strong support" },
        { minLR: 100, maxLR: 1000, text: "Moderately strong support" },
        { minLR: 10, maxLR: 100, text: "Moderate support" },
        { minLR: 1.5, maxLR: 10, text: "Weak / Limited support" },
        { minLR: 0.67, maxLR: 1.5, text: "Inconclusive / Neutral" }
    ],

    // 3-Pillar Guided Questions Template (Generic & Broadly Applicable to Any Factor/Research)
    guidedQuestionsTemplate: {
        replicability: [
            {
                id: "q_rep_literature",
                label: "1.1 What level of empirical replication supports this psychological finding?",
                options: [
                    "High: Systematic reviews / meta-analyses across multiple independent laboratories (registered reports / multi-site replications)",
                    "Multiple independent peer-reviewed laboratory experiments with consistent findings",
                    "A few single-lab studies with mixed or heterogeneous results",
                    "Primarily exploratory or theoretical claims with limited direct testing"
                ]
            },
            {
                id: "q_rep_consistency",
                label: "1.2 How consistent is the direction and magnitude of the effect across independent research teams?",
                options: [
                    "Highly consistent direction and effect magnitude across multiple independent research groups",
                    "Consistent effect direction, but notable variation in magnitude depending on task design",
                    "Contested or conflicting findings (some studies find null or opposite effects)",
                    "Limited independent replication attempts available in the literature"
                ]
            },
            {
                id: "q_rep_bias",
                label: "1.3 What is the assessed risk of publication / file-drawer bias in this literature?",
                options: [
                    "Low risk: Meta-analyses conducted formal publication bias tests (e.g. funnel plot, p-curve, trim-and-fill)",
                    "Moderate risk: Some evidence of small-study effects or unpublished null findings noted in reviews",
                    "High / Unknown risk: Mostly small-sample studies without preregistration"
                ]
            }
        ],
        generalizability: [
            {
                id: "q_gen_paradigm",
                label: "2.1 Ecological & Task Match: How well does the research paradigm translate to the real-world setting and task of this case?",
                options: [
                    "High match: Validated in field studies, realistic simulations, or real-world forensic contexts",
                    "Moderate match: Controlled laboratory simulation approximating key real-world constraints",
                    "Low match: Highly artificial laboratory task with substantial translational gaps"
                ]
            },
            {
                id: "q_gen_arousal",
                label: "2.2 Subject & Internal State Characteristics: How do subject characteristics and internal states (e.g., stress, arousal, cognitive capacity, age, impairment) compare between the literature and this case?",
                options: [
                    "High match: Research examined subject characteristics and internal states comparable to those in this case",
                    "Moderate match: Research tested baseline or differing internal states (e.g., calm laboratory participants vs. acute situational distress or impairment)",
                    "Low match: Subject characteristics or internal conditions in this case deviate substantially from the studied population"
                ]
            },
            {
                id: "q_gen_boundary",
                label: "2.3 External / Contextual Conditions: Do the situational, contextual, and temporal parameters of this case fall within empirical boundary conditions?",
                options: [
                    "Within tested boundaries: Case conditions fall well within established empirical ranges tested in the literature",
                    "Near/exceeding boundary thresholds: Case conditions approach or exceed critical empirical boundary limits (e.g., extreme duration/delay, atypical procedural conditions)",
                    "Unaddressed combination: The specific combination of situational parameters in this case is not systematically addressed in existing research"
                ]
            }
        ],
        relevance: [
            {
                id: "q_rel_sesoi",
                label: "3.1 Smallest Effect Size of Interest (SESOI): Does the literature effect exceed the minimum threshold needed to matter in this case?",
                options: [
                    "Clearly exceeds SESOI: The documented effect is substantial and large enough to have meaningful practical impact on the outcome in this case",
                    "Borderline / Uncertain: The effect is around the minimum threshold; might matter only in combination with other factors",
                    "Below SESOI: The effect is too small to meaningfully impact or explain the outcome in this case (statistically significant, but practically trivial)"
                ]
            },
            {
                id: "q_rel_moderators_increase",
                label: "3.2 Case Amplifiers: Are there specific variables in this case that might INCREASE the effect?",
                options: [
                    "Yes, strong amplifying variables present (e.g., high situational intensity, compounding impairments, suggestive procedures)",
                    "Moderate amplifiers present",
                    "No amplifying variables present in this case"
                ]
            },
            {
                id: "q_rel_moderators_decrease",
                label: "3.3 Case Dampeners: Are there specific variables in this case that might DECREASE or counteract the effect?",
                options: [
                    "Yes, strong dampening/protective factors present that counteract or mitigate the effect",
                    "Partial dampening/protective factors present",
                    "No dampening or protective variables present in this case"
                ]
            }
        ]
    },

    // Expanded Moot Court Cross-Examination Question Bank (12 Comprehensive Questions)
    mootQuestions: [
        {
            id: "mq1",
            role: "Prosecution",
            question: "Expert witness, the victim sat in open court and pointed directly at the defendant, testifying under oath that they are 100% certain this is the perpetrator. How can you challenge the certainty of an eyewitness who was there?",
            topic: "Post-Identification Feedback & Confidence Inflation",
            keyPointsToHit: [
                "Distinguish initial uncontaminated confidence from post-identification inflated confidence.",
                "Cite Steblay, Wells, & Bradfield (2014) meta-analysis on the post-identification feedback effect.",
                "Explain the psychological mechanisms of confidence inflation (interviewer feedback, repeated questioning, public commitment).",
                "Emphasize that confidence at trial has near-zero diagnostic validity if system procedures were suggestive."
            ],
            modelResponse: "Members of the court, psychological science clearly distinguishes between initial confidence recorded at the first pristine test and confidence expressed later in court. As demonstrated across 72 independent empirical tests (Steblay et al., 2014), post-event factors—such as confirmatory feedback, repeated questioning, or knowing a suspect was charged—powerfully inflate witness certainty without any corresponding increase in memory accuracy. If system procedures were suggestive, a witness will genuinely feel 100% confident while being mistaken. Therefore, retrospective certainty cannot be used to infer historical accuracy.",
            pitfall: "Accusing the witness of lying or arguing guilt/innocence directly."
        },
        {
            id: "mq2",
            role: "Prosecution",
            question: "You based your entire analysis on laboratory experiments conducted with university students watching videotapes in a classroom. Why should this court give any weight to artificial lab exercises when judging a real, violent crime?",
            topic: "Ecological Validity & Generalizability",
            keyPointsToHit: [
                "Address the 3-pillar framework: Replicability, Generalizability, and Practical Relevance.",
                "Explain that basic psycho-physical laws (optics, distance, visual contrast) apply identically across lab and field.",
                "Highlight that real-world extreme stress and fear actually *impair* memory more severely than calm lab tests (Deffenbacher et al., 2004).",
                "Cite archival field studies of real police cases confirming that laboratory findings generalize to real investigations."
            ],
            modelResponse: "That is a central question regarding scientific generalizability. While laboratory experiments use controlled stimuli to isolate cognitive variables, these findings have been thoroughly tested across archival field studies of real police cases and high-stress military simulations (Morgan et al., 2004). In fact, real-world extreme fear and physical trauma degrade cognitive encoding even more severely than calm laboratory settings. Furthermore, physical optical laws—such as acuity thresholds beyond 15 meters (Wagenaar & van der Schrier, 1996)—are governed by the human visual system and apply universally in real-world environments.",
            pitfall: "Pretending laboratory research has no limitations or becoming defensive."
        },
        {
            id: "mq3",
            role: "Judge",
            question: "Expert witness, in your evaluation you calculated a Likelihood Ratio of approximately 1.5 to 2.0. As the judge deciding this case, does your calculation mean that the defendant is probably guilty or probably innocent?",
            topic: "Likelihood Ratios & The Ultimate Issue (Rassin et al., 2022)",
            keyPointsToHit: [
                "Distinguish the expert's scientific role (evaluating P(Evidence|Hypothesis)) from the Court's judicial role (determining P(Hypothesis|Evidence) / guilt).",
                "Explain that LR = 1.5 - 2.0 corresponds to 'weak/limited support' on the ENFSI scale.",
                "Explicitly warn against the Prosecutor's Fallacy (Transposing the Conditional).",
                "Explain that the Court must combine the expert's LR with prior case evidence to reach a verdict."
            ],
            modelResponse: "Your Honor, as a psychological expert witness, my mandate is strictly limited to evaluating the probability of the psychological evidence under two competing scenarios: P(Evidence | Suspect is Perpetrator) versus P(Evidence | Suspect is an Innocent Person). A Likelihood Ratio of 1.5 to 2.0 indicates 'weak or limited support' on the ENFSI scale, meaning the observed identification evidence is almost equally likely to occur if the defendant is innocent as if they are guilty. Determining whether the defendant is guilty is the exclusive prerogative of this Court, which must combine this Likelihood Ratio with prior case evidence and legal standards of proof.",
            pitfall: "Answering the Ultimate Issue or conflating P(E|H) with P(H|E)."
        },
        {
            id: "mq4",
            role: "Defense",
            question: "Expert witness, what is the scientific difference between Estimator Factors and System Factors, and why is this distinction critical for the court to understand?",
            topic: "Estimator vs System Factors (Wells, 1978)",
            keyPointsToHit: [
                "Define Estimator Factors (inherent to crime scene/witness, e.g. lighting, distance, intoxication, stress; non-controllable).",
                "Define System Factors (procedures under police/investigative control, e.g. lineup format, double-blind testing, suggestive questions).",
                "Explain how system factors can permanently contaminate an already compromised estimator-level memory trace.",
                "Emphasize that system factors are the primary source of preventable miscarriages of justice."
            ],
            modelResponse: "In legal psychology, following Wells (1978), we divide evidence factors into two categories. Estimator factors are inherent to the crime event itself—such as viewing distance, darkness, witness intoxication, and acute trauma. The justice system cannot change them; an expert can only estimate their impact on initial encoding. System factors, by contrast, are under direct police control—such as whether a showup or double-blind lineup was used, how questions were phrased, and whether feedback was given. When initial encoding is already fragile due to negative estimator factors, suggestive system procedures create irreversible memory contamination.",
            pitfall: "Confusing which factors belong in which category."
        },
        {
            id: "mq5",
            role: "Prosecution",
            question: "The witness had consumed some alcohol, but was still walking and conversing normally. Isn't it true that alcohol only affects memory if a person is completely blacked out?",
            topic: "Alcohol Intoxication & Memory (BAC Thresholds)",
            keyPointsToHit: [
                "Cite empirical literature and meta-analyses on acute alcohol intoxication (Flowe et al., 2017; Jores et al., 2019).",
                "Explain that BAC ≥ 0.08% significantly reduces descriptive completeness and increases false alarm rates in culprit-absent lineups.",
                "Clarify that alcohol impairs divided attention and fine feature discrimination long before clinical blackouts occur.",
                "Explain that intoxicated witnesses are more vulnerable to post-event misinformation and suggestive questioning."
            ],
            modelResponse: "Empirical research does not support that assumption. Comprehensive meta-analyses (Flowe et al., 2017; Jores et al., 2019) establish that acute alcohol intoxication at blood alcohol concentrations of 0.08% and above measurably degrades perceptual encoding and working memory. While intoxicated individuals can identify culprits in immediate, unbiased lineups, they exhibit significantly higher false alarm rates when the culprit is absent. Alcohol disrupts the encoding of peripheral and fine facial details long before gross motor failure or blackouts occur, and substantially increases vulnerability to post-event suggestion.",
            pitfall: "Claiming an intoxicated witness can remember absolutely nothing, rather than specifying diagnostic error rates."
        },
        {
            id: "mq6",
            role: "Judge",
            question: "Expert witness, in a case where a witness observed an incident from 20 meters away at night, can you tell the court the scientific threshold for human facial recognition at a distance?",
            topic: "Viewing Distance & Illumination (Wagenaar & van der Schrier)",
            keyPointsToHit: [
                "Cite Wagenaar & van der Schrier (1996) and Loftus & Harley (2005) regarding the empirical 'Rule of 15 Meters'.",
                "Explain that human visual acuity drops to near chance levels for facial feature recognition beyond 12-15 meters.",
                "Detail the compounding degradation of poor illumination (scotopic/mesopic lighting).",
                "Explain that at 20m, human vision perceives low-spatial-frequency information (gross silhouettes/clothing) rather than fine facial landmarks."
            ],
            modelResponse: "Your Honor, human facial recognition at a distance is constrained by well-established optical and psycho-physical limits. The classic 'Rule of 15 Meters' established by Wagenaar and van der Schrier (1996) demonstrates that under optimal daylight, facial recognition accuracy drops sharply beyond 12 to 15 meters, approaching chance levels at 20 meters. Under poor nighttime illumination, contrast sensitivity is further reduced. At a distance of 20 meters in darkness, the human visual system can discern gross silhouettes and clothing colors, but lacks the optical resolution to encode distinctive facial landmarks.",
            pitfall: "Stating it is 'impossible' to see anything, rather than distinguishing between gross clothing outlines and fine facial features."
        },
        {
            id: "mq7",
            role: "Prosecution",
            question: "A firearm was pointed at the victim for only 30 seconds. Are you arguing that looking at a weapon completely erases a person's ability to see who is holding it?",
            topic: "Weapon Focus Effect (Fawcett et al., 2013)",
            keyPointsToHit: [
                "Cite meta-analyses on the Weapon Focus Effect (Fawcett et al., 2013; Steblay, 1992).",
                "Explain the mechanism of attentional narrowing under acute threat / novelty.",
                "Clarify that weapon focus does not 'erase' memory, but statistically reduces facial encoding duration and accuracy.",
                "Emphasize the practical effect size in brief, high-threat encounters."
            ],
            modelResponse: "Weapon focus does not erase memory, but empirical meta-analyses (Fawcett et al., 2013) demonstrate that the presence of a visible weapon reliably diverts visual and cognitive attention away from the perpetrator's face. Under acute threat and unexpected novelty, attention naturally narrows onto the source of danger. In a brief encounter of 30 seconds, visual fixations on the weapon significantly reduce the cumulative encoding time available for processing facial features, leading to measurably lower identification accuracy.",
            pitfall: "Exaggerating the effect into total amnesia."
        },
        {
            id: "mq8",
            role: "Defense",
            question: "Expert witness, why is presenting a single suspect to an eyewitness in a showup procedure considered so much more dangerous than a properly constructed photo lineup?",
            topic: "Showup vs Lineup Diagnostic Accuracy (Steblay et al., 2003, 2014)",
            keyPointsToHit: [
                "Cite Steblay et al. (2003, 2014) meta-analyses comparing showups to lineups.",
                "Explain the lack of filler protection in a showup (any bias lands 100% on the suspect).",
                "Highlight that innocent suspects matching a general clothing description are at very high risk of false identification in showups.",
                "Explain why showups have lower diagnostic feature-efficacy."
            ],
            modelResponse: "A showup is inherently suggestive because it presents the witness with only one choice, conveying the implicit message that police believe this individual is the culprit. In a properly constructed 6-person lineup, known innocent fillers protect an innocent suspect: if the witness guesses or matches general clothing, they have a 5-in-6 chance of picking a filler. In a showup, there is zero filler protection. Any inclination to guess lands 100% on the suspect, drastically inflating false identification rates of innocent lookalikes.",
            pitfall: "Using emotional language rather than explaining the diagnostic mechanism of filler protection."
        },
        {
            id: "mq9",
            role: "Judge",
            question: "If an eyewitness is interviewed multiple times over several days, why shouldn't repeated questioning simply help them remember more details accurately?",
            topic: "Suggestive Questioning & Misinformation Effect (Loftus, 2005)",
            keyPointsToHit: [
                "Cite Loftus (2005) and Otgaar et al. (2014) on the misinformation effect and memory contamination.",
                "Explain that episodic memory is reconstructive, not a video recording.",
                "Explain how suggestive questions, leading prompts, and social demand characteristics introduce post-event misinformation.",
                "Differentiate between structured non-leading Cognitive Interviews and coercive/suggestive questioning."
            ],
            modelResponse: "Your Honor, human memory is reconstructive rather than reproductive. When a witness is repeatedly interviewed, especially if questions contain suggestive details, assumptions, or pressure, the memory trace is modified. As documented across hundreds of studies on the misinformation effect (Loftus, 2005), post-event suggestions become integrated into the witness's episodic memory. The witness genuinely comes to believe they saw details that were actually introduced by the interviewer, creating false confidence in contaminated information.",
            pitfall: "Assuming all interviews are bad; be sure to contrast suggestive questioning with proper Cognitive Interview techniques."
        },
        {
            id: "mq10",
            role: "Prosecution",
            question: "The identification took place three weeks after the crime. People remember important events for years—why are you claiming a three-week delay makes an identification unreliable?",
            topic: "Retention Interval & Forgetting Curve (Ebbinghaus / Deffenbacher)",
            keyPointsToHit: [
                "Cite the empirical forgetting curve (Ebbinghaus; Deffenbacher et al., 2008; Wixted & Ebbesen, 1991).",
                "Explain that memory decay follows a logarithmic curve: rapid initial forgetting followed by a slower plateau.",
                "Explain that fine perceptual facial features decay much faster than general gist memory of the event.",
                "Note that longer delays also increase the opportunity for intervening memory contamination."
            ],
            modelResponse: "While individuals remember the general gist of traumatic events over time, fine perceptual details follow a steep logarithmic forgetting curve (Deffenbacher et al., 2008). In the initial days following an incident, subtle facial configurations fade rapidly from memory, leaving only generalized schemas. Over three weeks, baseline perceptual trace strength diminishes substantially, and the window for post-event interference expands, making a delayed identification significantly more vulnerable to filler bias or guessing.",
            pitfall: "Confusing memory for the occurrence of an event with memory for specific facial landmarks."
        },
        {
            id: "mq11",
            role: "Defense",
            question: "If police compound multiple pieces of evidence—such as a showup identification and statements from repeated interviews—can the court simply multiply these factors together to reach a strong conclusion?",
            topic: "Conditional Interdependence & Double-Counting",
            keyPointsToHit: [
                "Explain conditional independence vs conditional dependence in psychological evidence.",
                "Explain why repeated statements from the same witness after suggestive feedback are causally interconnected.",
                "Explain that naive multiplication of correlated system errors violates probability theory and creates false evidence inflation.",
                "Explain how experts apply conservative, bounded compound Likelihood Ratios."
            ],
            modelResponse: "No, in probability theory and forensic psychology (Rassin et al., 2022), multiplying evidence items requires strict conditional independence. When an initial showup identification is followed by suggestive interviews and inflated confidence from the same witness, these evidence items are causally linked through the same contaminated memory process. Treating them as independent pieces of corroborating evidence constitutes double-counting and artificially inflates the apparent certainty. Correlated system errors cannot be multiplied.",
            pitfall: "Getting bogged down in abstract math formulas without explaining the common-sense danger of double-counting."
        },
        {
            id: "mq12",
            role: "Prosecution",
            question: "The suspect was arrested a few blocks away wearing clothing matching the victim's description. Doesn't this circumstantial clothing match independently prove the witness was right?",
            topic: "Clothing Base Rates & Circular Confirmation Bias",
            keyPointsToHit: [
                "Distinguish high base-rate clothing (e.g. generic dark/brown hoodie) from diagnostic physical features.",
                "Explain base rates in urban nightlife districts.",
                "Warn against circular confirmation bias: using a clothing match to validate a degraded facial identification.",
                "Explain that clothing similarity has low diagnostic specificity."
            ],
            modelResponse: "From a psychological perspective, the diagnostic value of clothing depends entirely on base rates. In an urban nightlife district on a cold night, generic clothing such as dark hoodies or jackets is worn by a substantial percentage of the population. A match on a generic clothing category carries low diagnostic specificity. Using a common clothing match to retroactively validate a compromised facial identification creates circular confirmation bias, as it conflates common attire with definitive personal identity.",
            pitfall: "Arguing legal admissibility rather than psychological base rates and diagnostic specificity."
        },
        {
            id: "mq13",
            role: "Judge",
            question: "Expert witness, after selecting the suspect from the lineup, the detective told the witness: 'Good, you identified our main suspect.' The witness is now 100% certain. How does post-identification feedback scientifically affect subsequent witness confidence?",
            topic: "Post-Identification Confirmatory Feedback (Wells & Bradfield, 1998)",
            keyPointsToHit: [
                "Cite Wells & Bradfield (1998) and Steblay et al. (2014) meta-analyses on the Feedback Effect.",
                "Explain that confirmatory feedback retroactively inflates a witness's reported confidence, perceived viewing conditions, and attention.",
                "Explain that inflated confidence destroys the diagnostic relationship between certainty and accuracy.",
                "Emphasize that pristine initial confidence at the moment of identification is the only reliable predictor of accuracy."
            ],
            modelResponse: "Your Honor, post-identification confirmatory feedback produces what psychological literature terms the 'Feedback Effect' (Wells & Bradfield, 1998; Steblay et al., 2014). When an officer confirms an identification, the witness retroactively inflates their memory of how clearly they saw the culprit, how much attention they paid, and how confident they felt at the time. Crucially, feedback completely destroys the diagnostic value of later in-court confidence. Only the witness's unprompted confidence recorded immediately at the first identification carries diagnostic validity.",
            pitfall: "Failing to explain that feedback alters not just confidence, but also the witness's memory of their original viewing conditions."
        },
        {
            id: "mq14",
            role: "Prosecution",
            question: "The witness and the perpetrator belong to different racial backgrounds, but the witness has lived in a diverse city for years. Why are you claiming this cross-race identification is inherently less reliable?",
            topic: "Cross-Race Effect / Own-Race Bias (Meissner & Brigham, 2001)",
            keyPointsToHit: [
                "Cite Meissner & Brigham (2001) meta-analysis on the Cross-Race Effect (CRE).",
                "Explain the mirror effect: higher false alarm rates and lower correct identification rates for other-race faces.",
                "Explain that mere casual contact in a diverse city does not eliminate holistic facial encoding deficits.",
                "Clarify that CRE is a cognitive-perceptual phenomenon, not an indicator of racial prejudice."
            ],
            modelResponse: "The Cross-Race Effect (CRE) is one of the most robustly replicated findings in facial recognition memory (Meissner & Brigham, 2001). Extensive empirical research demonstrates a 'mirror effect': individuals are significantly less accurate at identifying other-race faces and exhibit substantially higher false alarm rates on innocent lookalikes. While high-quality interracial social relationships can attenuate this effect, general residency in a diverse urban environment does not eliminate the basic perceptual encoding differences between own-race and cross-race facial processing.",
            pitfall: "Framing the cross-race effect as racial bias rather than a perceptual and cognitive processing phenomenon."
        },
        {
            id: "mq15",
            role: "Defense",
            question: "Expert witness, the defendant confessed after an intense 14-hour overnight interrogation. Common sense suggests an innocent person would never confess to a serious crime. What does empirical psychological research reveal about interrogation pressures and false confessions?",
            topic: "Interrogation Pressure & False Confessions (Kassin et al., 2010)",
            keyPointsToHit: [
                "Cite Kassin et al. (2010) White Paper and Gudjonsson (2003) on false confessions.",
                "Explain risk factors: sleep deprivation, extreme duration (>6 hours), false evidence ploys, and minimization tactics.",
                "Distinguish coerced-compliant confessions (confessing for immediate escape from interrogation) from coerced-internalized confessions.",
                "Highlight that DNA exonerations prove over 25% of wrongful convictions involved false confessions."
            ],
            modelResponse: "Decades of empirical psychological research (Kassin et al., 2010; Gudjonsson, 2003) and innocence project exonerations prove that innocent individuals do confess under specific coercive conditions. Sleep deprivation, prolonged interrogation exceeding 6 hours, minimization tactics implying leniency, and fabricated evidence ploys impair executive functioning and decision-making. Under severe exhaustion, individuals exhibit short-term myopia, confessing simply to escape the immediate psychological torment of the interrogation room with the belief that their innocence will later be sorted out.",
            pitfall: "Speculating on whether this specific confession is true or false, rather than explaining the empirical risk factors."
        },
        {
            id: "mq16",
            role: "Judge",
            question: "Expert witness, how does the Cognitive Interview protocol scientifically reduce errors compared to standard police questioning?",
            topic: "The Cognitive Interview Protocol (Fisher & Geiselman, 1992)",
            keyPointsToHit: [
                "Cite Fisher & Geiselman (1992) and Memon et al. (2010) meta-analyses.",
                "Explain core principles: mental context reinstatement, open-ended narrative recall, varied temporal retrieval paths.",
                "Explain how avoiding interruptions and leading questions prevents memory distortion.",
                "Cite the empirical effect size: ~30-40% increase in correct detail without a significant increase in errors."
            ],
            modelResponse: "Your Honor, the Cognitive Interview (Fisher & Geiselman, 1992; Memon et al., 2010) is grounded in principles of cognitive encoding specificity and associative memory networks. It utilizes four retrieval mnemonics: mental context reinstatement (recreating environmental and emotional states), exhaustive open-ended recall without interruption, reversing chronological order, and adopting different physical perspectives. Meta-analyses demonstrate that the Cognitive Interview elicits 30% to 40% more correct details than standard police questioning without inflating false information.",
            pitfall: "Failing to mention the mechanism of mental context reinstatement."
        },
        {
            id: "mq17",
            role: "Prosecution",
            question: "The witness took the stand in this courtroom today, pointed directly at the defendant, and declared under oath: 'I am 100% positive that is the man.' Why should the court discount this absolute certainty?",
            topic: "In-Court Identification vs Initial Confidence (Wixted & Wells, 2017)",
            keyPointsToHit: [
                "Cite Wixted & Wells (2017) and Wixted et al. (2015) on pristine lineup conditions vs in-court showups.",
                "Explain that in-court identification is a non-blind, 100% suggestive single-person showup where the defendant is seated at the defense table.",
                "Explain that repeated retrieval, pre-trial preparation, and courtroom atmosphere artificially inflate confidence to 100%.",
                "Emphasize that the only scientifically diagnostic confidence is the pristine confidence recorded at the initial test."
            ],
            modelResponse: "While in-court declarations of 100% certainty appear compelling, empirical legal psychology (Wixted & Wells, 2017) establishes that an in-court identification has zero diagnostic value. The courtroom is the ultimate suggestive showup: the defendant is seated at the defense table next to counsel. Through months of case preparation, hearings, and memory reconstruction, witness confidence naturally inflates to ceiling levels. Psychological science proves that only the witness's pristine confidence recorded during the initial, unbiased lineup predicts accuracy.",
            pitfall: "Accusing the witness of lying, rather than explaining the unconscious cognitive inflation of confidence over time."
        },
        {
            id: "mq18",
            role: "Defense",
            question: "Expert witness, how does the selection of filler photographs in a photo lineup influence the risk of an innocent suspect being falsely selected?",
            topic: "Lineup Fairness, Filler Selection & Structural Bias (Tredoux, 1998)",
            keyPointsToHit: [
                "Cite Malpass & Lindsay (1999) and Tredoux (1998) on effective lineup size and mock witness testing.",
                "Explain 'match-to-description' vs 'match-to-suspect' filler selection strategies.",
                "Explain that if fillers do not fit the initial perpetrator description, the suspect stands out (structural bias).",
                "Explain how structural bias reduces effective lineup size from 6 down to 1 or 2, drastically increasing false alarm rates."
            ],
            modelResponse: "A lineup only protects an innocent suspect if the known-innocent fillers are viable alternatives. According to established scientific guidelines (Wells et al., 2020), all fillers must match the witness's initial physical description of the perpetrator. If an innocent suspect is the only person in the array who has dark hair or matches the general description, the lineup suffers from structural bias. The effective lineup size drops from 6 to 1, concentrating all guessing or descriptive bias onto the suspect and dramatically increasing false identifications.",
            pitfall: "Demanding that fillers look like identical twins to the suspect, rather than matching the witness's verbal description."
        },
        {
            id: "mq19",
            role: "Judge",
            question: "In this case, two eyewitnesses spoke together immediately after the robbery before police arrived. What is the psychological impact of co-witness discussions on memory fidelity?",
            topic: "Co-Witness Contamination & Memory Conformity (Wright et al., 2000)",
            keyPointsToHit: [
                "Cite Wright et al. (2000) and Paterson & Kemp (2006) on the Memory Conformity effect.",
                "Explain that co-witnesses frequently assimilate details mentioned by the other into their own episodic memory.",
                "Explain that once memory conformity occurs, witnesses report the shared details with high confidence and cannot distinguish what they personally saw.",
                "Emphasize that two discussing witnesses no longer provide independent corroborating evidence."
            ],
            modelResponse: "Your Honor, when co-witnesses discuss an incident before giving separate statements, it frequently produces 'Memory Conformity' (Wright et al., 2000; Paterson & Kemp, 2006). In empirical studies, over 70% of witnesses incorporate erroneous details introduced by a co-witness into their own subsequent accounts. Crucially, witnesses absorb this misinformation into their genuine episodic memory, reporting it with high confidence. From an evidentiary perspective, two witnesses who have discussed the event no longer provide independent corroboration.",
            pitfall: "Treating co-witness statements as independent corroboration when post-event discussion has occurred."
        },
        {
            id: "mq20",
            role: "Prosecution",
            question: "This was a terrifying armed robbery. Isn't it true that severe trauma 'burns' the perpetrator's face indelibly into the victim's memory like a photographic flashbulb?",
            topic: "Trauma, Stress & Memory Distortion (Morgan et al., 2004; Talarico & Rubin, 2003)",
            keyPointsToHit: [
                "Cite Morgan et al. (2004) military survival school study and Deffenbacher et al. (2004) meta-analysis.",
                "Dismantle the 'photographic memory' myth: human memory is reconstructive, not an unchangeable recording.",
                "Explain the Yerkes-Dodson law / high arousal: high stress impairs facial feature encoding while maintaining high subjective confidence.",
                "Cite Talarico & Rubin (2003) showing that emotional intensity increases confidence, but not accuracy."
            ],
            modelResponse: "The belief that traumatic events are burned into memory like a photograph is a common misconception. Rigorous empirical studies in high-stress military survival training (Morgan et al., 2004) and comprehensive meta-analyses (Deffenbacher et al., 2004) show that extreme acute stress significantly impairs facial encoding, resulting in lower correct identification rates and higher false alarms. While trauma creates vivid, enduring central memories of the event's occurrence and high subjective confidence, it degrades the precision of fine perceptual facial details.",
            pitfall: "Arguing that stress creates total amnesia rather than explaining that stress impairs fine feature discrimination while inflating subjective certainty."
        },
        {
            id: "mq21",
            role: "Defense",
            question: "Expert witness, why is the sequential presentation of photos (one at a time) often compared to simultaneous presentation (all six photos at once)?",
            topic: "Simultaneous vs Sequential Lineups & Relative Judgment (Lindsay & Wells, 1985; Steblay et al., 2011)",
            keyPointsToHit: [
                "Cite Lindsay & Wells (1985) and Steblay et al. (2011) meta-analysis.",
                "Explain the psychological mechanism of 'Relative Judgment' in simultaneous lineups (picking the person who looks *most like* the culprit relative to others).",
                "Explain 'Absolute Judgment' in sequential lineups (comparing each photo against memory).",
                "Highlight that sequential presentations substantially reduce false identifications in culprit-absent lineups."
            ],
            modelResponse: "In a simultaneous lineup where all photos are shown at once, witnesses tend to engage in 'relative judgment'—comparing photos against each other to determine who looks *most like* the perpetrator. In a culprit-absent lineup, someone will always look the most similar, leading to false identifications of innocent lookalikes. Sequential presentation (viewing photos one by one) encourages 'absolute judgment', comparing each photo individually against the witness's mental memory trace, which meta-analyses show reduces false alarm rates by nearly half.",
            pitfall: "Claiming sequential lineups eliminate all errors rather than explaining the diagnostic shift from relative to absolute judgment."
        },
        {
            id: "mq22",
            role: "Judge",
            question: "Expert witness, in forensic evidence reporting, why is it considered a fatal scientific error for an expert to confuse the Probability of the Evidence given a Hypothesis, P(E|H), with the Probability of the Hypothesis given the Evidence, P(H|E)?",
            topic: "Transposing the Conditional / The Prosecutor's Fallacy (Rassin et al., 2022; ENFSI)",
            keyPointsToHit: [
                "Define 'Transposing the Conditional' (The Prosecutor's Fallacy).",
                "Explain the mathematical difference between P(Evidence | Innocent) and P(Innocent | Evidence).",
                "Provide an intuitive counter-example (e.g., P(Animal is a Dog | Animal has 4 legs) vs P(Animal has 4 legs | Animal is a Dog)).",
                "Emphasize that transposing the conditional usurps the role of the jury/judge by making an unauthorized legal finding on guilt."
            ],
            modelResponse: "Your Honor, transposing the conditional—often called the Prosecutor's Fallacy—is a critical logical and legal error (Rassin et al., 2022; ENFSI, 2015). A psychological expert evaluates the probability of observing the evidence given a hypothesis, P(E|H). For example, finding that an evidence item has P(E|Innocent) = 0.05 does NOT mean the defendant has only a 5% probability of being innocent. Transposing P(E|H) into P(H|E) improperly ignores prior probabilities, base rates, and all other non-psychological evidence in the trial, thereby usurping this Court's exclusive role in deciding guilt.",
            pitfall: "Using dense mathematical formulas without an intuitive, plain-language legal explanation of why transposing usurps judicial responsibility."
        }
    ]
};
