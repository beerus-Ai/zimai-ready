import type { ModuleContent } from '../../types';

/**
 * Healthcare domain content — documentation, decision support, health data and clinic workflows.
 * Responsible-AI thread: patient confidentiality and clinical safety. AI supports; clinicians decide.
 */
export const HEALTHCARE_CONTENT: ModuleContent[] = [
  // ───────────────────────── hc-admin ─────────────────────────
  {
    moduleId: 'hc-admin',
    lessons: [
      {
        id: 'hc-admin-l1',
        title: 'AI for Clinical Notes, Letters and Discharge Summaries',
        minutes: 10,
        blocks: [
          {
            type: 'explain',
            title: 'Less typing, same accountability',
            body: 'AI can turn rough notes into structured discharge summaries, referral letters and handover notes in seconds, giving nurses and doctors more time with patients. But AI can drop an allergy, change a dose or invent a follow-up plan. Whoever signs the document is responsible for every word, so each AI draft must be checked against the patient record.',
            bullets: [
              'Use only tools your facility has approved',
              'Never paste identifiable patient data into public chatbots',
              'Check allergies, medicines, doses and dates line by line',
              'The clinician signs, not the AI',
            ],
          },
          {
            type: 'example',
            title: 'The missing allergy',
            scenario: 'At Mazowe Valley Clinic (fictional), a nurse used an approved AI tool to draft a referral letter to the district hospital. The draft was clear and well organised, but it listed "no known allergies". The patient card recorded a sulphonamide allergy. The nurse corrected the letter before sending it, and the clinic added "check allergies against the card" to its AI checklist.',
            takeaway: 'AI drafts are often polished and wrong in exactly the places that matter most. Always verify allergies, medicines and doses against the source record.',
          },
          {
            type: 'interactive',
            title: 'Which prompt is safer and better?',
            prompt: 'A ward nurse wants help drafting a discharge summary. Which request is the right way to use AI?',
            mode: 'choose-better',
            options: [
              { id: 'a', label: 'Paste the full patient file, including name, ID number and HIV status, into a free public chatbot and ask for a summary', correct: false, feedback: 'This breaches patient confidentiality. Public tools may store and reuse what you type.' },
              { id: 'b', label: 'In the facility-approved tool, use de-identified notes and ask for a summary in the ward template, flagging anything uncertain for review', correct: true, feedback: 'Correct. An approved tool, minimal identifiers, a set template and a request to flag uncertainty keep the nurse in control.' },
              { id: 'c', label: 'Ask AI to write the summary from memory of "typical pneumonia cases" without the notes', correct: false, feedback: 'The summary would be generic and possibly invented. Documentation must reflect this patient’s actual care.' },
            ],
          },
          {
            type: 'ai-example',
            title: 'From rough notes to a structured summary',
            instruction: "Show de-identified rough clinical notes relevant to the learner's healthcare role (fictional patient referred to as 'the patient', Zimbabwean clinic or district hospital context). Then show a prompt for a facility-approved AI tool asking for a structured summary with set headings and a request to flag missing or unclear information. Then show the AI output, including at least one flagged item for the clinician to check.",
            fallback: `Rough notes (de-identified): "Adult F, 3 days fever, cough, RR 26. CXR: R lower lobe consolidation. Rx IV abx per protocol x3 days, now afebrile 48h, eating. Allergy: penicillin (rash). D/C on oral doxycycline 100mg BD 5/7. Review OPD 1/52."

Prompt: "Using only these notes, draft a discharge summary with headings: Diagnosis, Treatment given, Allergies, Discharge medicines, Follow-up, Advice to patient. Do not add anything not in the notes. Flag any unclear or missing information."

AI output (excerpt):
Diagnosis: Right lower lobe pneumonia.
Allergies: Penicillin (rash).
Discharge medicines: Doxycycline 100 mg twice daily for 5 days.
Follow-up: Outpatient review in 1 week.
⚠ Flag: the name of the IV antibiotic is not stated — please add from the treatment chart.`,
          },
          {
            type: 'quiz',
            question: 'Who is accountable for an AI-drafted discharge summary once it is signed?',
            options: [
              'The company that built the AI tool',
              'The clinician who reviewed and signed it',
              'Nobody, because AI wrote it',
              'The patient, who should check it at home',
            ],
            correctIndex: 1,
            explanation: 'AI is a drafting aid. The clinician who signs the record is professionally accountable for its accuracy.',
            skillId: 'domain-healthcare',
          },
        ],
      },
      {
        id: 'hc-admin-l2',
        title: 'Smarter Clinic Administration with AI',
        minutes: 10,
        blocks: [
          {
            type: 'explain',
            title: 'Where admin AI helps most',
            body: 'Clinics spend hours on registers, monthly returns, appointment reminders and stock requests. AI can draft reports from tallies, predict medicine stock-outs, send reminders in local languages and summarise meeting minutes. The safest wins are tasks where errors are easy to spot and no clinical decision is made by the AI.',
            bullets: [
              'Drafting monthly reports from tallied data',
              'Forecasting medicine and supply needs',
              'SMS appointment and refill reminders',
              'Summarising minutes and circulars',
            ],
          },
          {
            type: 'ai-example',
            title: 'A stock-out early warning',
            instruction: "Show a short example relevant to the learner's healthcare role in Zimbabwe: a small fictional table of monthly consumption and current stock for 3–4 essential medicines at a rural clinic, a prompt asking AI to estimate months of stock remaining and flag items to reorder (accounting for rainy-season demand where relevant), the AI answer, and one thing the pharmacist or nurse-in-charge must verify.",
            fallback: `Data (fictional, Chipinge Road Clinic):
Medicine            | Avg monthly use | In stock
Malaria RDT kits    | 300 (Nov–Mar: 520) | 700
ORS sachets         | 400             | 1,500
Paracetamol 500 mg  | 6,000 tablets   | 9,000
Amoxicillin 250 mg  | 2,500 capsules  | 10,000

Prompt: "Estimate months of stock left for each item, using rainy-season use from November to March where given, and flag anything under 2 months."

AI answer: "Malaria RDTs: about 1.3 months at rainy-season use — reorder now. Paracetamol: 1.5 months — reorder. ORS: 3.8 months. Amoxicillin: 4 months."

Verify: count the physical stock and check expiry dates — stock that expires before use does not count.`,
          },
          {
            type: 'interactive',
            title: 'Spot the risky use of AI',
            prompt: 'A district hospital administrator lists planned AI uses. Which one carries the most risk?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: 'AI drafts the monthly outpatient report from tallied totals; the records officer checks it', correct: false, feedback: 'Low risk — aggregated data and a human check.' },
              { id: 'b', label: 'An AI SMS bot sends appointment reminders in Shona, Ndebele and English', correct: false, feedback: 'Reasonable, provided messages avoid sensitive details like diagnoses.' },
              { id: 'c', label: 'An AI bot automatically replies to patients’ WhatsApp questions about medicine doses with no clinician review', correct: true, feedback: 'Highest risk. Dosing advice is clinical; an unreviewed bot could cause harm. It must escalate to a clinician or pharmacist.' },
              { id: 'd', label: 'AI summarises Ministry circulars for staff meetings', correct: false, feedback: 'Low risk, as long as staff can read the original for detail.' },
            ],
          },
          {
            type: 'example',
            title: 'Reminders that respect privacy',
            scenario: 'Hope Springs Mission Hospital (fictional) introduced AI-written SMS reminders for ART refill appointments. Early drafts read "Your HIV medicine refill is due Friday." Staff realised phones are often shared and changed the message to "Reminder: your clinic appointment is on Friday at 9am. Hope Springs Hospital." Attendance still improved by 14%.',
            takeaway: 'Confidentiality applies to messages as well as records. Design every AI output assuming someone other than the patient might read it.',
          },
          {
            type: 'quiz',
            question: 'Which AI task is most appropriate for a busy rural clinic to start with?',
            options: [
              'Letting AI decide which patients get seen first',
              'Using AI to draft routine monthly reports from tallied data, checked by staff',
              'Letting AI prescribe for common conditions',
              'Uploading all patient files to a free chatbot for analysis',
            ],
            correctIndex: 1,
            explanation: 'Start with low-risk administrative tasks on aggregated data, with human checks. Clinical decisions and identifiable data need much stronger safeguards.',
            skillId: 'responsible-ai',
          },
          {
            type: 'task',
            title: 'Find one admin task to improve',
            instructions: 'List three administrative tasks that take you the most time each week. For one of them, write: what AI could draft, what data it would need (and whether that data is identifiable), and who would check the output.',
            hint: 'Tasks using totals or templates are safer starting points than those using named patient records.',
          },
        ],
      },
    ],
    activity: {
      id: 'hc-admin-activity',
      domainId: 'healthcare',
      title: 'Review an AI-Drafted Discharge Summary',
      scenario: 'You are a senior nurse at Chiedza District Hospital (fictional). A junior colleague, short on time, pasted a patient’s ward notes into a free public AI chatbot and asked it to write a discharge summary and a sick note for the patient’s employer. You must review both before the patient goes home.',
      data: `Ward notes (key points):
- Adult, 34. Admitted with community-acquired pneumonia.
- Treated with IV antibiotics per protocol for 3 days; afebrile for 48 hours.
- ALLERGY: penicillin (rash, 2023).
- Known HIV-positive, stable on ART; continue usual regimen.
- Discharge plan: oral doxycycline 100 mg twice daily for 5 days. Review at outpatient clinic in 7 days. Off work for 7 days.

AI-drafted discharge summary (excerpt):
"Diagnosis: pneumonia. Allergies: none known. Discharge medicines: amoxicillin 500 mg three times daily for 5 days. Follow-up: none required."

AI-drafted sick note for employer:
"[Full name], ID [number], was admitted with pneumonia secondary to HIV infection and is on antiretroviral therapy. Please excuse from work for 7 days."`,
      task: 'Write your review and corrective action. Include: (1) your approach, (2) how AI should have been used, including a safer prompt, (3) every error you found and how you verified it, (4) the privacy and safety risks and what you will do about them, and (5) the corrected discharge medicines/follow-up section and a corrected sick note.',
      rubric: [
        { criterion: 'Verification & clinical safety', description: 'Identifies the missing penicillin allergy, the wrong antibiotic (amoxicillin vs doxycycline) and the missing follow-up, verified against the ward notes.', weight: 30 },
        { criterion: 'Patient confidentiality & responsible AI', description: 'Recognises the use of a public chatbot and the disclosure of HIV status to the employer; proposes reporting and safer practice.', weight: 30 },
        { criterion: 'Effective AI use', description: 'Describes appropriate use: approved tool, de-identified notes, fixed template, instruction not to add information, flagged uncertainties.', weight: 15 },
        { criterion: 'Corrected output & communication', description: 'Produces accurate, minimal-disclosure documents and a supportive, clear message to the colleague.', weight: 25 },
      ],
      skillIds: ['domain-healthcare', 'ai-verification', 'data-privacy', 'ai-writing'],
      sampleStrongAnswer: `Approach: I stopped both documents from leaving the ward and compared every line with the ward notes and treatment chart.

Errors: (1) Allergies says "none known" — the notes record a penicillin allergy. (2) The AI replaced doxycycline with amoxicillin, a penicillin; giving it could cause a serious reaction. (3) "No follow-up" is wrong — outpatient review is due in 7 days. I verified each against the notes and the drug chart before correcting.

Privacy and safety: the ward notes were pasted into a public chatbot, so identifiable health information left the hospital. I will inform the nurse-in-charge and follow our data-incident procedure. The sick note discloses the diagnosis and HIV status to an employer, which is not necessary or permitted without consent.

Safer AI use: only the hospital-approved tool, with de-identified notes: "Using only these notes, complete the discharge template (Diagnosis, Allergies, Medicines, Follow-up). Do not add information; flag anything missing."

Corrected section: Allergies: penicillin (rash). Discharge medicines: doxycycline 100 mg twice daily for 5 days; continue usual ART. Follow-up: outpatient clinic in 7 days.

Corrected sick note: "This patient was admitted to Chiedza District Hospital and is medically unfit for work for 7 days from [date]." No diagnosis.

I will also talk supportively with my colleague — the pressure was real — and share our AI checklist.`,
    },
  },

  // ───────────────────────── hc-decision ─────────────────────────
  {
    moduleId: 'hc-decision',
    lessons: [
      {
        id: 'hc-decision-l1',
        title: 'How Diagnostic and Triage AI Works',
        minutes: 12,
        blocks: [
          {
            type: 'explain',
            title: 'Pattern recognition, not clinical judgement',
            body: 'Clinical decision-support AI learns patterns from thousands of past cases: chest X-rays screened for TB, skin photos, ECGs or symptoms entered at triage. It gives a score or flag, not a diagnosis. It does not examine the patient, know the history or weigh social context. The clinician combines the AI signal with everything else and makes the decision.',
            bullets: [
              'Sensitivity: how many true cases it catches',
              'Specificity: how many healthy people it clears correctly',
              'Every tool misses some cases',
              'Clinicians decide and document why',
            ],
          },
          {
            type: 'example',
            title: 'TB screening at an outreach camp',
            scenario: 'A fictional mobile screening team from Ruwa Community Health Trust used AI to read digital chest X-rays at a mining community camp. The AI flagged 42 of 600 people as "likely TB". Clinicians requested sputum tests for all 42, and also for three people the AI scored as low risk but who had a two-month cough and weight loss. One of those three tested positive.',
            takeaway: 'AI screening speeds up finding likely cases, but symptoms and history still override a reassuring score.',
          },
          {
            type: 'interactive',
            title: 'What should the clinician do?',
            prompt: 'A triage AI rates a patient "low urgency". The nurse notices the patient is pale, sweaty and has chest pain spreading to the left arm. What is the right action?',
            mode: 'choose-better',
            options: [
              { id: 'a', label: 'Follow the AI rating — it has analysed thousands of cases', correct: false, feedback: 'This is automation bias. The AI may not have captured these signs, and delay could be fatal.' },
              { id: 'b', label: 'Escalate immediately based on clinical signs and document why the AI rating was overridden', correct: true, feedback: 'Correct. Clinical judgement overrides the tool, and documenting the override helps improve it.' },
              { id: 'c', label: 'Re-enter the symptoms until the AI gives a higher score', correct: false, feedback: 'Gaming the tool wastes time; act on your assessment.' },
            ],
          },
          {
            type: 'ai-example',
            title: 'Reading an AI decision-support output',
            instruction: "Show a short, fictional decision-support output relevant to the learner's clinical or health role in a Zimbabwean setting (e.g. malaria risk, TB X-ray flag, maternal risk score, paediatric danger signs). Include the score, the stated confidence and the top contributing factors. Then list three questions the clinician should ask before acting, and a sentence on how to document the decision.",
            fallback: `Decision-support output (fictional maternal risk tool, Kurai Clinic):
"Pre-eclampsia risk: HIGH (score 0.81). Top factors: BP 148/96, first pregnancy, age 17. Confidence: moderate — urine protein not recorded."

Questions before acting:
1. Has the BP been rechecked after rest, with the correct cuff size?
2. Can we test urine protein now to fill the missing data?
3. Are there danger signs (headache, visual changes, swelling) the tool did not capture?

Documentation: "AI risk tool flagged high risk; BP confirmed on repeat, urine protein 2+; referred to district hospital per protocol."`,
          },
          {
            type: 'quiz',
            question: 'A TB screening AI has high sensitivity but moderate specificity. What does this mean in practice?',
            options: [
              'It rarely misses TB, but some people it flags will not have TB and need confirmatory tests',
              'It never makes mistakes',
              'It misses most TB cases',
              'It can replace sputum testing',
            ],
            correctIndex: 0,
            explanation: 'High sensitivity catches most true cases; moderate specificity means false positives. That is why flagged patients receive confirmatory testing.',
            skillId: 'decision-support',
          },
        ],
      },
      {
        id: 'hc-decision-l2',
        title: 'Where Clinical AI Fails — and Staying in Charge',
        minutes: 13,
        blocks: [
          {
            type: 'explain',
            title: 'Know the failure modes',
            body: 'Clinical AI can fail when the patients in front of it differ from those it learned from — different populations, equipment, disease patterns or image quality. It can also fail silently when data are missing. Chatbots may give fluent but unsafe medical answers. The biggest human risk is automation bias: trusting the tool over your own observations.',
            bullets: [
              'Dataset shift: trained elsewhere, used here',
              'Poor inputs: blurry images, missing vitals',
              'Hallucinated drug or dose information',
              'Automation bias in busy shifts',
            ],
          },
          {
            type: 'interactive',
            title: 'Spot the unsafe practice',
            prompt: 'Which of these practices is unsafe when using clinical decision-support AI?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: 'Checking a drug-interaction alert against the national formulary before acting', correct: false, feedback: 'Safe — verifying against an authoritative source is good practice.' },
              { id: 'b', label: 'Using a general chatbot’s paediatric dose calculation without checking it', correct: true, feedback: 'Unsafe. Chatbots can produce plausible but wrong doses; paediatric dosing errors can be fatal. Use approved references and double-check.' },
              { id: 'c', label: 'Recording when you override an AI recommendation and why', correct: false, feedback: 'Safe — this supports accountability and helps improve the tool.' },
              { id: 'd', label: 'Asking the vendor how the tool performed on patients similar to yours', correct: false, feedback: 'Safe and wise — performance can drop in populations the tool was not tested on.' },
            ],
          },
          {
            type: 'example',
            title: 'A skin tool that did not see local skin',
            scenario: 'A fictional pilot at Makoni Provincial Hospital tested a skin-lesion AI marketed as "95% accurate". Doctors noticed it performed poorly on darker skin tones. The vendor admitted most training images came from light-skinned patients overseas. The hospital paused the pilot until the vendor provided evidence from African populations.',
            takeaway: 'Ask where a tool was trained and tested. Headline accuracy means little if it was measured on different patients from yours.',
          },
          {
            type: 'ai-example',
            title: 'Using AI to support, not replace, a clinical question',
            instruction: "Show how a healthcare worker in the learner's role could safely use a general AI assistant for a non-urgent knowledge question (e.g. summarising guideline differences or preparing a patient education leaflet), with a prompt that asks for sources and limitations. Show the AI answer and a note on how the worker verifies it against national guidelines or an approved formulary. No patient-identifiable data.",
            fallback: `Prompt: "Explain in simple language, for a patient leaflet, the warning signs of dehydration in children under 5 with diarrhoea, and when to return to the clinic. Keep it to 8 bullet points. Say which points should be checked against national guidelines."

AI answer (excerpt): "Return to the clinic immediately if your child: is very sleepy or hard to wake; cannot drink or breastfeed; has sunken eyes; has blood in the stool; is vomiting everything…"

Verification: the nurse compares each point with the national child-health guidelines, removes an item the AI added about a specific medicine brand, and asks a colleague to check the Shona translation before printing.`,
          },
          {
            type: 'quiz',
            question: 'An AI tool was validated in hospitals abroad with digital X-ray machines. Your clinic uses older equipment and has a different patient population. What is the main concern?',
            options: [
              'None — AI works the same everywhere',
              'Dataset shift: performance may be lower here, so it needs local validation before routine use',
              'The tool will work better because older machines are simpler',
              'Only the price matters',
            ],
            correctIndex: 1,
            explanation: 'Tools can perform worse when equipment, populations or disease patterns differ. Local validation and ongoing monitoring are essential.',
            skillId: 'ai-verification',
          },
          {
            type: 'task',
            title: 'Write your override rule',
            instructions: 'Think of a decision-support tool you use or may use (triage score, risk calculator, drug-interaction checker). Write one sentence describing when you would override it, and one sentence describing how you would document the override.',
            hint: 'Danger signs, patient history and your own examination come first.',
          },
        ],
      },
    ],
  },

  // ───────────────────────── hc-data (advanced) ─────────────────────────
  {
    moduleId: 'hc-data',
    lessons: [
      {
        id: 'hc-data-l1',
        title: 'Patient Privacy When Health Data Meets AI',
        minutes: 12,
        blocks: [
          {
            type: 'explain',
            title: 'Health data is among the most sensitive data there is',
            body: 'Diagnoses, HIV status, pregnancies and mental-health records can lead to stigma, discrimination or violence if exposed. Before any health data is used with AI, ask: is it needed, is it identifiable, who will see it, and where is it stored? Removing names is not always enough — in a small community, a village, age and diagnosis can identify someone.',
            bullets: [
              'Identifiable: names, IDs, phone numbers, exact addresses',
              'Indirect identifiers: rare condition plus small village',
              'Aggregate where possible; suppress very small counts',
              'Store data only in approved, access-controlled systems',
            ],
          },
          {
            type: 'interactive',
            title: 'Could this identify a patient?',
            prompt: 'A health information officer is preparing data for an AI analysis. Which of these could identify an individual? Select all that apply.',
            mode: 'sort',
            options: [
              { id: 'a', label: 'Patient phone numbers', correct: true, feedback: 'Yes — a phone number is a direct identifier.' },
              { id: 'b', label: 'District-level monthly malaria totals', correct: false, feedback: 'Aggregated district totals are generally safe to use.' },
              { id: 'c', label: 'Age 16, pregnant, from a village of 200 people', correct: true, feedback: 'Yes — in a small community, a combination of details can point to one person.' },
              { id: 'd', label: 'Exact date of birth plus ward and clinic', correct: true, feedback: 'Yes — combined, these can identify someone. Use age bands instead.' },
            ],
          },
          {
            type: 'example',
            title: 'One case in a small place',
            scenario: 'A fictional district health team shared a dashboard showing "1 new HIV case, age 15–19, Ward 7" for a ward where everyone knows the only teenage clinic visitor that month. After a community complaint, the team adopted a rule: counts below 5 are shown as "<5", and small wards are combined for reporting.',
            takeaway: 'Aggregation protects privacy only if the groups are big enough. Suppress small numbers.',
          },
          {
            type: 'ai-example',
            title: 'De-identifying data before analysis',
            instruction: "Show a small fictional patient-level table (5 rows) relevant to the learner's health role in Zimbabwe, containing names, phone numbers, exact dates of birth, village and diagnosis. Then show the de-identified version suitable for an approved AI analysis (IDs replaced with codes, age bands, village replaced by ward or district, sensitive fields removed if not needed), and list the steps taken.",
            fallback: `Original (fictional):
Name        | Phone      | DOB        | Village    | Diagnosis
T. Moyo     | 077xxxxxxx | 2008-03-14 | Chitsva    | Malaria
R. Dube     | 071xxxxxxx | 1979-11-02 | Mhakwe     | Hypertension

De-identified:
ID    | Age band | Ward   | Diagnosis
P-001 | 15–19    | Ward 4 | Malaria
P-002 | 45–49    | Ward 4 | Hypertension

Steps: removed names and phones; replaced with random codes (the code key stays locked at the facility); converted birth dates to 5-year age bands; replaced villages with wards; checked that no group has fewer than 5 people before sharing results.`,
          },
          {
            type: 'quiz',
            question: 'A researcher asks for patient-level data to train an AI model. What should happen first?',
            options: [
              'Email the full patient spreadsheet so they can start quickly',
              'Confirm approval and purpose, share only the minimum de-identified data under an agreement, and store it securely',
              'Post the data on a shared drive so anyone can use it',
              'Remove the names column only and send the rest',
            ],
            correctIndex: 1,
            explanation: 'Health data sharing needs approval, a clear purpose, minimisation, de-identification and secure storage. Removing names alone may not be enough.',
            skillId: 'data-privacy',
          },
        ],
      },
      {
        id: 'hc-data-l2',
        title: 'Health Analytics That Helps — and Its Blind Spots',
        minutes: 13,
        blocks: [
          {
            type: 'explain',
            title: 'From registers to early warnings',
            body: 'AI-assisted analytics can spot a rise in malaria or diarrhoea cases early in the rainy season, predict medicine demand, and show which clinics have long waiting times. But analytics is only as good as the data: late returns from clinics without connectivity, paper registers and inconsistent coding can make a quiet area look healthy when it is simply unreported.',
            bullets: [
              'Check reporting completeness before comparing areas',
              'Compare with the same weeks in previous years',
              'Treat AI alerts as signals to investigate',
              'Share findings in aggregate only',
            ],
          },
          {
            type: 'ai-example',
            title: 'Spotting an outbreak signal',
            instruction: "Show a small fictional table of weekly case counts (e.g. malaria or diarrhoea) for 3–4 clinics in a Zimbabwean district during the rainy season, including one clinic with missing reports. Show a prompt asking AI to identify unusual increases compared with the same weeks last year and to note data-quality issues, then the AI answer and the action the health team takes.",
            fallback: `Weekly malaria cases (fictional district), weeks 3–5, 2027 (same weeks 2026 in brackets):
Clinic         | Wk 3    | Wk 4    | Wk 5
Hill View      | 22 (20) | 41 (19) | 63 (24)
Riverside      | 15 (14) | 16 (15) | 14 (17)
Tsanga Valley  | 9 (11)  | —       | —
Mhururu        | 30 (28) | 33 (31) | 35 (29)

Prompt: "Identify any clinic with an unusual increase compared with the same weeks last year, and list data-quality issues that could affect conclusions."

AI answer: "Hill View cases have roughly tripled against last year by week 5 — a possible outbreak signal. Tsanga Valley has not reported for two weeks, so its situation is unknown."

Action: the district team phones Hill View to confirm the counts and RDT stocks, and sends an officer to collect Tsanga Valley's paper register — no report does not mean no cases.`,
          },
          {
            type: 'interactive',
            title: 'Spot the misleading conclusion',
            prompt: 'An AI summary of district data makes four statements. Which is most likely misleading?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: '"Tsanga Valley has the lowest disease burden in the district — zero cases in weeks 4–5."', correct: true, feedback: 'Misleading. Zero may simply mean missing reports (connectivity, staff shortages). Check completeness before concluding.' },
              { id: 'b', label: '"Hill View cases are about three times higher than the same week last year."', correct: false, feedback: 'Supported by the data, and appropriately compared with last year.' },
              { id: 'c', label: '"Reporting completeness this month is 82%."', correct: false, feedback: 'A useful data-quality statement.' },
              { id: 'd', label: '"Further investigation is recommended before resource allocation."', correct: false, feedback: 'A sensible, cautious recommendation.' },
            ],
          },
          {
            type: 'example',
            title: 'The bias in "no data"',
            scenario: 'A fictional provincial dashboard ranked clinics by performance using data from an electronic system. Rural clinics that still used paper registers appeared at the bottom because their data arrived late. Resources were almost redirected away from the clinics that needed them most. The team added a "reporting complete" column and paused rankings for clinics below 80% completeness.',
            takeaway: 'Missing data is not random. Rural and low-connectivity facilities are often under-represented — design analytics that make that visible.',
          },
          {
            type: 'quiz',
            question: 'Why should a health analyst check reporting completeness before comparing clinics?',
            options: [
              'It is only a formality',
              'Clinics with missing or late reports can look healthier or worse than they are, leading to wrong decisions',
              'Complete data is needed to train staff',
              'AI tools cannot read incomplete tables',
            ],
            correctIndex: 1,
            explanation: 'Incomplete reporting distorts comparisons. Without checking, resources can be misdirected away from under-reported, often rural, facilities.',
            skillId: 'ai-analytics',
          },
          {
            type: 'task',
            title: 'Write a data-quality note',
            instructions: 'Think of a report or dashboard you use (monthly returns, stock reports, case counts). Write a two-line note that should appear beside it, stating how complete the data is and one limitation readers should know.',
            hint: 'For example: "Data from 14 of 17 clinics; three rural clinics had not reported due to network outages."',
          },
        ],
      },
    ],
  },

  // ───────────────────────── hc-challenge ─────────────────────────
  {
    moduleId: 'hc-challenge',
    lessons: [
      {
        id: 'hc-challenge-l1',
        title: 'Challenge Briefing: Improve the Clinic, Protect the Patient',
        minutes: 8,
        blocks: [
          {
            type: 'explain',
            title: 'What this challenge tests',
            body: 'You will redesign a busy fictional clinic’s outpatient workflow using AI where it genuinely helps. A vendor has proposed tools with attractive claims and hidden risks. You are assessed on how you use AI, how you test claims against the clinic’s real constraints, and how you protect patient safety, confidentiality and access for everyone.',
            bullets: [
              'Start with the problem, not the tool',
              'Test vendor claims against local data',
              'Keep clinical decisions with clinicians',
              'Design for patients without smartphones or data',
            ],
          },
          {
            type: 'ai-example',
            title: 'Using AI to analyse a workflow',
            instruction: "Show a prompt a healthcare worker in the learner's role could use to ask AI to analyse a fictional clinic's patient-flow data (arrival times, waiting times, patient types — no identifiable data) and suggest low-risk improvements, listing assumptions. Then show a short AI response and one point the worker must verify with staff.",
            fallback: `Prompt: "Here is anonymised patient-flow data for a rural clinic: average wait by day, arrival times, and the share of visits that are medicine refills. Suggest three low-risk ways to reduce waiting times that do not involve AI making clinical decisions. List your assumptions."

AI response (excerpt): "1. Fast-track stable refill patients with a separate queue. 2. Stagger appointments with SMS reminders. 3. Move vital-signs checks to a triage nurse at arrival. Assumption: refill patients are clinically stable and records are available."

Verify with staff: whether there is a room and a nurse available for a refill queue on Mondays.`,
          },
          {
            type: 'interactive',
            title: 'Responsible-AI reminders',
            prompt: 'Which of these should be part of your redesigned workflow? Select all that apply.',
            mode: 'sort',
            options: [
              { id: 'a', label: 'Patient consent before any consultation is recorded by an AI scribe', correct: true, feedback: 'Yes — patients must know and agree before being recorded.' },
              { id: 'b', label: 'A chatbot that tells patients their diagnosis before they see a clinician', correct: false, feedback: 'No — diagnosis is a clinical decision and must not be made by a chatbot.' },
              { id: 'c', label: 'A non-smartphone option (walk-in, SMS or USSD)', correct: true, feedback: 'Yes — access must not depend on having a smartphone or data.' },
              { id: 'd', label: 'A data-processing agreement stating where patient data is stored', correct: true, feedback: 'Yes — the clinic stays responsible for patient data held by vendors.' },
            ],
          },
          {
            type: 'quiz',
            question: 'A vendor says its chatbot cut waiting times by 70% at a city hospital. What is the most important question to ask?',
            options: [
              'What colour is the chatbot’s logo?',
              'Would the result hold here, given our patients, languages, connectivity and staffing — and how was it measured?',
              'Can we start tomorrow?',
              'Is 70% the highest result they have ever had?',
            ],
            correctIndex: 1,
            explanation: 'Results from a different setting may not transfer. Ask how it was measured and whether the conditions match yours.',
            skillId: 'critical-thinking',
          },
        ],
      },
    ],
    activity: {
      id: 'hc-challenge-activity',
      domainId: 'healthcare',
      title: 'Outpatient Workflow Redesign: Mazowe Valley Clinic',
      scenario: 'You are the nurse-in-charge at Mazowe Valley Clinic (fictional), a rural clinic serving about 12,000 people. Monday queues are very long. A vendor, CareFlow AI (fictional), has proposed an AI package, and the district office has asked for your recommendation.',
      data: `Clinic data (last 8 weeks, anonymised):
Day | Avg patients | Avg wait (hours)
Mon | 140          | 3.2
Tue | 95           | 2.1
Wed | 90           | 1.9
Thu | 85           | 1.8
Fri | 100          | 2.3
- 60% of patients arrive before 08:00
- 30% of visits are stable medicine refills (ART, hypertension, diabetes)
- Staff: 2 nurses, 1 clinical officer; 1 records clerk
- Connectivity: intermittent 3G; load-shedding 6–8 hours a day
- About 45% of patients use basic (non-smart) phones; many prefer Shona

CareFlow AI proposal:
1. WhatsApp chatbot (English only) that "diagnoses symptoms and gives each patient a priority number".
2. AI scribe that records every consultation automatically; audio stored on overseas servers.
3. "Proven 70% reduction in waiting time" (pilot at a private city hospital).
4. Automatic SMS of lab results, including HIV results, to the phone number on file.`,
      task: 'Write your recommendation to the district office. Include: (1) your approach and analysis of the problem, (2) how you would use AI (with at least one prompt), (3) how you tested the vendor’s claims, (4) patient safety, confidentiality and access risks with safeguards, and (5) your recommended workflow, stating which parts of the proposal to accept, change or reject.',
      rubric: [
        { criterion: 'Verification & critical thinking', description: 'Uses the clinic data to identify the real bottleneck (Monday, early arrivals, refills) and challenges the 70% claim and its city-hospital context.', weight: 30 },
        { criterion: 'Patient safety & confidentiality', description: 'Rejects chatbot diagnosis and automatic HIV result SMS; requires consent for recording, local or agreed data storage, and clinician decisions.', weight: 30 },
        { criterion: 'Access & inclusion', description: 'Designs for basic phones, Shona speakers, load-shedding and patients without data.', weight: 15 },
        { criterion: 'Practical workflow & AI use', description: 'Proposes a realistic workflow with low-risk AI uses and clear prompts, and a way to measure results.', weight: 25 },
      ],
      skillIds: ['domain-healthcare', 'data-privacy', 'critical-thinking', 'decision-support'],
      sampleStrongAnswer: `Approach: I analysed eight weeks of anonymised flow data before looking at tools. The bottleneck is Mondays (140 patients, 3.2-hour wait) with 60% arriving before 08:00. Thirty per cent of visits are stable refills that do not need a full consultation.

AI use: I asked an approved AI tool, with no patient identifiers: "Using this anonymised data, suggest three ways to reduce Monday waits without AI making clinical decisions, and list assumptions." It suggested a refill fast-track, staggered appointments and nurse triage on arrival — all verified as feasible with staff.

Vendor claims: the 70% result comes from a private city hospital with smartphones, stable internet and more staff. It does not transfer to our clinic. I would ask how it was measured and request a small, monitored local pilot first.

Safety and privacy: reject chatbot diagnosis — prioritisation must stay with the triage nurse. Reject automatic SMS of HIV and lab results; phones are shared and results need counselling. The AI scribe is acceptable only with patient consent, an opt-out, and a data agreement confirming where audio is stored and deleted.

Access: 45% use basic phones, so reminders must be SMS in Shona and English, and walk-ins remain welcome. Offline mode is essential during load-shedding.

Recommendation: (1) refill fast-track queue with 3-month supplies where guidelines allow; (2) SMS appointment reminders to spread Monday demand; (3) nurse-led triage using the national protocol; (4) pilot the AI scribe with consent. Measure Monday waits monthly and review after three months.`,
    },
  },
];
