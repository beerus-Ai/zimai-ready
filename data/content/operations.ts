import type { ModuleContent } from '../../types';

/**
 * Operations learning content — also used by administration, procurement, engineering and
 * mining/manufacturing operations staff.
 * All organisations and people are fictional (e.g. Mhondoro Mining Co., Kopje Foods,
 * Kudzai Packaging Works).
 */
export const OPERATIONS_CONTENT: ModuleContent[] = [
  // ───────────────────────────── ops-process ─────────────────────────────
  {
    moduleId: 'ops-process',
    lessons: [
      {
        id: 'ops-process-l1',
        title: 'Mapping processes and finding bottlenecks with AI',
        minutes: 12,
        blocks: [
          {
            type: 'explain',
            title: 'AI as your process analyst',
            body: 'Operations, admin and procurement teams sit on process data: approval timestamps, job cards, delivery notes, shift logs. AI can turn messy notes into a clear step-by-step map, draft standard operating procedures, calculate waiting times and suggest where work piles up. It cannot see the shop floor, the stores yard or the approval queue — so walk the process with the people who do it.',
            bullets: ['Map steps, owners and hand-offs', 'Measure waiting time, not just work time', 'Ask AI for questions to verify', 'Validate on the floor before changing'],
          },
          {
            type: 'example',
            title: 'Nine days to raise a purchase order',
            scenario: "At Kopje Foods (fictional), procurement officer Tatenda pasted six months of anonymised requisition timestamps into the company's approved AI tool and asked where time was lost. The AI showed that raising a purchase order averaged nine days — five of them waiting for a second signature from a plant manager who was usually on the factory floor. After checking with finance, the team introduced delegated approval for routine spares under US$500, with monthly spot checks.",
            takeaway: 'AI found the delay in the data; people designed a fix that kept financial controls intact.',
          },
          {
            type: 'interactive',
            title: 'Which prompt maps the process best?',
            prompt: 'You want AI to help map the diesel-issuing process at a haulage depot. Which prompt should you use?',
            mode: 'choose-better',
            options: [
              { id: 'a', label: '‘Draw me a process map for fuel.’', correct: false, feedback: "Too vague — the AI will produce a generic textbook process that doesn't match your depot." },
              { id: 'b', label: '‘Here are my notes on how diesel is issued at our depot (roles, forms, timings, no names). Turn them into numbered steps with the owner of each step, average work time and waiting time. Highlight likely bottlenecks and control gaps, and list questions I should verify with the fuel attendant and transport supervisor.’', correct: true, feedback: 'Specific and grounded in your notes; it asks for owners, times and control gaps — and builds in verification with the people who do the work.' },
              { id: 'c', label: '‘Design the most efficient possible fuel process and I will implement it tomorrow.’', correct: false, feedback: "Skips the reality check. An ‘optimal’ AI process may remove the controls that prevent fuel theft or ignore safety rules at the pump." },
            ],
          },
          {
            type: 'ai-example',
            title: 'A process breakdown from your workplace',
            instruction: "For the learner's role and industry in Zimbabwe (operations, administration, procurement, engineering, mining or manufacturing), generate a short AI-style breakdown of one workflow they are likely to handle (e.g. stores requisition, fuel issuance, permit processing, job-card close-out). Show 5–7 numbered steps with owner and typical time, identify one bottleneck and one control risk, and list two facts the learner must verify on the ground before changing anything. Use fictional names.",
            fallback: "Workflow: stores requisition for plant spares — Kudzai Packaging Works (fictional)\n1. Artisan raises paper requisition — Artisan — 10 min\n2. Supervisor signs — Shift supervisor — waits 1 day on average\n3. Stores checks stock — Storeman — 20 min\n4. If out of stock, buyer requests 3 quotes — Buyer — 3–5 days\n5. Finance approves (over US$300) — Finance officer — waits 2 days\n6. Purchase order issued — Buyer — 30 min\n7. Goods received and issued — Storeman — depends on supplier\n\nBottleneck: steps 2 and 5 — the requisition waits for signatures rather than being worked on.\nControl risk: the same buyer requests quotes and issues the PO, with no independent check.\nVerify first: (1) are the waiting times real, or are forms signed late but back-dated? (2) is the US$300 threshold from the current finance policy?",
          },
          {
            type: 'quiz',
            question: 'AI analysis shows that a permit-approval process spends 80% of its time waiting between steps. What does this suggest first?',
            options: [
              'Staff are working too slowly at each step',
              'The biggest gains come from reducing hand-offs and queues, not speeding up individual tasks',
              'The whole process should be automated immediately',
              'The data must be wrong because waiting cannot take that long',
            ],
            correctIndex: 1,
            explanation: 'In most admin and operations workflows, work waits far longer than it is worked on. Target hand-offs, approvals and queues — and confirm the pattern with the people involved.',
            skillId: 'domain-operations',
          },
          {
            type: 'task',
            title: 'Try it: map one process in 10 minutes',
            instructions: 'Choose a routine process you are part of (for example requisitions, shift handovers or vehicle bookings). Write rough notes of the steps, remove names, and ask an approved AI tool for a numbered map with owners, times and likely bottlenecks. Mark one thing the AI got wrong or could not have known.',
            hint: "Ask the AI to list ‘questions to verify with the team’ — its assumptions become your checklist.",
          },
        ],
      },
      {
        id: 'ops-process-l2',
        title: 'Automating routine steps safely',
        minutes: 13,
        blocks: [
          {
            type: 'explain',
            title: 'What to automate — and what not to',
            body: 'Good candidates for AI automation are repetitive, rule-based, high-volume and low-risk: drafting daily production reports from logs, comparing supplier quotes, matching delivery notes to purchase orders, summarising shift handovers. Keep a human decision wherever money is committed, safety is involved, or rules require a named authority to sign.',
            bullets: ['Automate drafting, matching and summarising', 'Keep people on approvals and payments', 'Never automate safety sign-offs', 'Log what the automation did'],
          },
          {
            type: 'interactive',
            title: 'Good candidates for automation',
            prompt: 'At Mhondoro Mining Co. (fictional), select every task that is a sensible candidate for AI-assisted automation with human review.',
            mode: 'sort',
            options: [
              { id: 'a', label: 'Drafting the daily shift handover summary from equipment and production logs', correct: true, feedback: 'Repetitive and text-heavy — AI drafts, the incoming supervisor checks.' },
              { id: 'b', label: 'Building a comparison table of three supplier quotes for conveyor belting', correct: true, feedback: 'Saves time and reduces errors — the buyer still verifies the figures and makes the recommendation.' },
              { id: 'c', label: 'Approving a lockout-tagout isolation permit before maintenance on the crusher', correct: false, feedback: 'A safety-critical authorisation that must be given by a competent, named person following the procedure — AI must not sign off.' },
              { id: 'd', label: 'Awarding a US$120,000 tender to the lowest-priced bidder', correct: false, feedback: 'Tender awards need human evaluation, documented reasons and procurement governance, not automated selection.' },
            ],
          },
          {
            type: 'example',
            title: 'Generator scheduling around load-shedding',
            scenario: "Kudzai Packaging Works (fictional) runs two production lines and a 500 kVA standby generator. The admin officer built an AI-assisted workflow that combines the published load-shedding schedule, the weekly production plan and diesel stock to draft a generator run plan every Monday, which the production manager approves. In week three the draft looked odd: the AI had used the previous week's schedule. The team added a rule that the schedule's publication date must appear on every draft.",
            takeaway: 'Automation saves hours, but build in checks on input freshness. A plan based on stale data is confidently wrong.',
          },
          {
            type: 'explain',
            title: 'Confidential data and procurement integrity',
            body: 'Supplier prices, bids, contracts and staff records are confidential. Never paste tender submissions or quotes into public AI tools — it can breach confidentiality and procurement rules and unfairly advantage competitors. Use approved tools, share only what the task needs, and keep an audit trail: who ran the automation, on what data, and who approved the result.',
          },
          {
            type: 'quiz',
            question: 'Which automation design is safest for processing supplier invoices?',
            options: [
              'AI reads each invoice and pays automatically when the amount looks reasonable',
              'AI extracts details and matches them to the purchase order and delivery note; mismatches go to a person and payments still need approval',
              'AI emails suppliers and negotiates discounts on its own',
              'Staff paste all invoices into a free online AI tool to save time',
            ],
            correctIndex: 1,
            explanation: 'Three-way matching is ideal for automation, but exceptions and payment approval stay with people — and the data stays in approved systems.',
            skillId: 'ai-automation',
          },
          {
            type: 'task',
            title: 'Try it: specify a small automation',
            instructions: 'Pick one weekly report or routine document you prepare. In five lines, describe: the input data, what AI should produce, the human check, what must never be automated, and how you will know it is working.',
            hint: 'Start with drafting and summarising tasks — they are low-risk and easy to check.',
          },
        ],
      },
    ],
    activity: {
      id: 'ops-process-activity',
      domainId: 'operations',
      title: 'Review an AI plan to speed up requisition-to-delivery',
      scenario: 'Kopje Foods (fictional) runs a bakery and a maize-meal mill in Harare. Production has stopped three times this quarter while waiting for spares. The operations manager asked an AI tool to analyse the requisition-to-delivery process and recommend improvements. You are the operations/procurement officer asked to review the recommendation before it goes to the executive team.',
      data: `PROCESS DATA (average of 42 requisitions, Jan–Mar; anonymised)
Step                               Work time   Waiting time
1 Artisan raises requisition       15 min      —
2 Supervisor approval              5 min       1.5 days
3 Stores stock check               20 min      0.5 days
4 Buyer obtains 3 quotes           2 hrs       4 days
5 Finance approval (> US$500)      10 min      3 days
6 PO issued to supplier            20 min      0.5 days
7 Supplier delivery                —           6 days (local) / 18 days (imported via Beitbridge)
Total average: about 16 days (local) / 28 days (imported)

Notes: 9 of the 42 requisitions were for imported mill parts. Stock records were last reconciled in October. Two stock-outs happened in the rainy season when deliveries were delayed.

AI RECOMMENDATION (to review)
1. "Remove supervisor and finance approval for all requisitions under US$5,000 to cut 4.5 days."
2. "Let the AI automatically choose the cheapest supplier and issue the PO."
3. "Average delivery is 6 days, so set reorder points using a 6-day lead time for all parts."
4. "Stock data is accurate; no physical count is needed."
5. "Expected result: total cycle time reduced to 5 days, saving US$40,000 per year in downtime."`,
      task: 'Submit a short review for the executive team covering: (1) your assessment of each AI recommendation — what is useful and what is flawed; (2) how you would use AI to improve the analysis, with at least two example prompts; (3) how you would verify the data and the savings claim; (4) risks and safeguards (financial controls, supplier fairness, confidentiality, production and food-safety impact); (5) your own improved process recommendation.',
      rubric: [
        { criterion: 'Process analysis & practical fix', description: 'Correctly identifies where waiting time accumulates and proposes a realistic improved process.', weight: 25 },
        { criterion: 'Verification & critical thinking', description: 'Spots the imported-parts lead-time error, stale stock data, unsupported savings figure and missing seasonality; explains how to check each.', weight: 30 },
        { criterion: 'Effective AI use', description: 'Clear, grounded prompts that use the data, ask for workings and separate facts from assumptions.', weight: 20 },
        { criterion: 'Responsible AI & controls', description: 'Keeps approvals, segregation of duties and human supplier selection proportionate to risk; protects confidential supplier data.', weight: 25 },
      ],
      skillIds: ['ai-automation', 'domain-operations', 'ai-verification', 'critical-thinking'],
      sampleStrongAnswer: "Assessment: the AI correctly sees that waiting, not work, drives the 16 days — but its fixes are flawed. (1) Removing all approvals under US$5,000 breaks financial controls; a delegated limit of US$500 for routine spares, with monthly spot checks, saves time while keeping control. (2) ‘Cheapest supplier, automatic PO’ ignores quality, reliability and fairness — buyers should decide, helped by an AI comparison table. (3) A 6-day lead time is wrong for the 9 imported mill parts, which take 18 days and longer in the rains; reorder points need lead times per part. (4) Stock data last reconciled in October cannot be called accurate — we need a physical count of critical spares. (5) The US$40,000 saving has no workings.\n\nAI use: ‘Using only this table, calculate cycle time separately for local and imported parts and show your workings.’ ‘List the assumptions behind a 5-day target and what data would test each one.’\n\nVerification: trace three requisitions end to end, check downtime costs against production records and confirm Beitbridge lead times with our clearing agent.\n\nSafeguards: no supplier quotes in public AI tools; approvals proportionate to value; a named buyer and finance officer stay accountable.\n\nRecommendation: electronic approvals with a 24-hour target, pre-approved suppliers for common spares, minimum stock of critical imported parts and a monthly cycle-time review.",
    },
  },

  // ───────────────────────────── ops-maintenance ─────────────────────────────
  {
    moduleId: 'ops-maintenance',
    lessons: [
      {
        id: 'ops-maintenance-l1',
        title: 'Predictive maintenance: how AI reads your equipment',
        minutes: 12,
        blocks: [
          {
            type: 'explain',
            title: 'From fixed schedules to condition-based maintenance',
            body: "Predictive maintenance uses sensor and history data — vibration, temperature, oil analysis, run-hours, past breakdowns — to learn what ‘normal’ looks like for each machine and flag drift before failure. It helps plan parts, labour and shutdowns. But the model only knows what the data shows: sensor gaps during load-shedding, loose mounts or unrecorded repairs can mislead it.",
            bullets: ['An alert starts an inspection', 'Check the sensor as well as the machine', 'Record every repair so the model learns', 'Statutory inspections still apply'],
          },
          {
            type: 'example',
            title: 'The winder bearing',
            scenario: 'At Mhondoro Mining Co. (fictional), vibration monitoring on the No. 2 shaft winder motor flagged a rising trend and estimated bearing failure in about three weeks. The engineering foreman confirmed it with a handheld vibration reading and an oil sample, ordered the bearing from Harare and replaced it during the planned Sunday shutdown. A week later, a similar alert on a conveyor turned out to be a loose sensor bracket.',
            takeaway: 'Treat alerts as well-founded questions. Confirm with a physical check, then act — or fix the sensor.',
          },
          {
            type: 'interactive',
            title: 'Spot the risky response to a maintenance alert',
            prompt: 'Which of these responses at a processing plant is the risk?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: 'An alert on the ball mill gearbox is cross-checked with an oil analysis before parts are ordered.', correct: false, feedback: 'Good — independent confirmation before spending money.' },
              { id: 'b', label: "Because the model rates the crusher ‘healthy’, the statutory monthly inspection is skipped to save production time.", correct: true, feedback: "This is the risk. A model's ‘healthy’ rating cannot replace legally required inspections by competent persons. Models miss failure modes they have never seen." },
              { id: 'c', label: 'A false alarm caused by a loose sensor is recorded so the team and the model can learn from it.', correct: false, feedback: 'Good practice — logging false alarms improves the system and trust in it.' },
              { id: 'd', label: 'Parts for a predicted pump failure are ordered early because imported spares take three weeks.', correct: false, feedback: "A sensible use of the forecast's lead time." },
            ],
          },
          {
            type: 'ai-example',
            title: 'An alert explained for your equipment',
            instruction: "For the learner's industry and role in Zimbabwe, describe a realistic AI maintenance alert for an asset they may work with (e.g. mill, boiler, standby generator, haul truck, borehole pump, packaging-line motor). Explain in plain words what data triggered it and what the probability or time-to-failure means, then give three human checks before acting and one reason the alert could be wrong. Use a fictional organisation.",
            fallback: "Asset: 500 kVA standby generator, Kopje Foods bakery (fictional)\nAlert: ‘Coolant temperature 8% above normal under similar load for 10 days. Estimated 65% chance of an overheating fault within 30 days.’\nIn plain words: the engine is running hotter than usual while doing the same work. ‘65% in 30 days’ means that in similar past cases about two in three led to a fault — not that failure is certain, and not that the engine is safe until day 30.\nHuman checks: (1) inspect the radiator for dust and blockage — common in the dry season; (2) check coolant level and hoses; (3) compare with the engine-hours logbook — longer load-shedding runs mean more heat.\nWhy it could be wrong: the temperature sensor was replaced last month and may read higher than the old one.",
          },
          {
            type: 'quiz',
            question: 'A model says: ‘Conveyor motor — 70% probability of failure within 20 days.’ What does this mean?',
            options: [
              'The motor will definitely fail on day 20',
              'The motor is safe to run for at least 20 days',
              'Failure is likely enough to plan an inspection and parts now — but it is a probability, not a certainty',
              'The model is 70% accurate overall',
            ],
            correctIndex: 2,
            explanation: 'Forecasts express likelihood, not certainty. Use them to plan inspections, parts and shutdowns — and never assume a machine is safe until the predicted date.',
            skillId: 'ai-maintenance',
          },
          {
            type: 'task',
            title: 'Try it: write an alert response checklist',
            instructions: 'For one critical asset in your workplace, write a four-step checklist for what happens when an AI or monitoring system raises an alert: who checks, what physical check is done, who decides, and how the outcome is recorded.',
            hint: 'Include what happens if the alert arrives on night shift or during load-shedding, when the usual engineer is not on site.',
          },
        ],
      },
      {
        id: 'ops-maintenance-l2',
        title: 'Supply chain and inventory forecasting — and its limits',
        minutes: 13,
        blocks: [
          {
            type: 'explain',
            title: 'How AI forecasts demand and stock',
            body: 'Forecasting tools learn from sales history, seasonality, lead times and usage to predict what you will need and when — useful for reorder points, fleet planning and production schedules. But shocks common in Zimbabwe, such as currency changes, fuel shortages, border delays and rainy-season road closures, may be missing from the history. A forecast is a range with assumptions, not a promise.',
            bullets: ['Ask for ranges, not single numbers', 'List the assumptions behind it', 'Compare past forecasts with actuals', 'Check with drivers, stores and suppliers'],
          },
          {
            type: 'example',
            title: "The lead time that wasn't",
            scenario: "Kopje Foods' AI inventory tool recommended reordering mill screens when stock fell to 10, assuming a 7-day lead time. The buyer, Nyasha, noticed the history came mostly from local suppliers. The screens are imported through Beitbridge, where December congestion pushes delivery to 21 days or more. She reset the reorder point for imported parts and asked for lead times to be tracked per supplier.",
            takeaway: 'Most forecast failures are assumption failures. Find the assumption, then test it against reality.',
          },
          {
            type: 'interactive',
            title: 'Which forecasting prompt is most useful?',
            prompt: 'You are asking AI to forecast diesel needs for a 20-truck fleet for the next quarter.',
            mode: 'choose-better',
            options: [
              { id: 'a', label: '‘How much diesel will we need next quarter?’', correct: false, feedback: 'No data and no assumptions — you will get a plausible-sounding number with nothing behind it.' },
              { id: 'b', label: '‘Using the attached 18 months of fuel logs, forecast monthly diesel use for October–December as a low/likely/high range. State your assumptions (routes, rainy-season detours, generator use during load-shedding), show your calculation and flag unusual months in the history.’', correct: true, feedback: 'Grounded in your data, asks for a range, makes assumptions visible and highlights anomalies for you to check.' },
              { id: 'c', label: '‘Give me the lowest diesel figure you can justify so the budget looks good.’', correct: false, feedback: 'This steers the AI towards a biased answer. Under-budgeting fuel can strand trucks and stop deliveries.' },
            ],
          },
          {
            type: 'explain',
            title: 'Verify a forecast before you act',
            body: "Before a forecast drives orders, budgets or shutdown plans, test it. Back-test: how did last quarter's forecast compare with what actually happened? Stress-test: what if fuel prices rise 20% or the rains close a key route? Sense-check it with people who know the ground. And decide in advance what change in the data would make you revise it.",
            bullets: ['Back-test against actuals', 'Run a bad-case scenario', 'Ask the people on the ground', 'Set a trigger to revisit'],
          },
          {
            type: 'quiz',
            question: 'An AI demand forecast was built on the last 12 months of sales. Which new event most needs a human adjustment?',
            options: [
              'A public holiday that also fell in the same month last year',
              'A newly announced currency change affecting customer prices',
              'A small change in the colour of the packaging',
              'A routine staff rotation in the warehouse',
            ],
            correctIndex: 1,
            explanation: 'A currency change is a structural shock the history has never seen, so the model cannot anticipate its effect on demand. People must adjust or scenario-test the forecast.',
            skillId: 'predictive-analytics',
          },
          {
            type: 'task',
            title: 'Try it: list the hidden assumptions',
            instructions: 'Take one forecast or plan you rely on (stock, fuel, production or budget). Write down three assumptions it depends on and, for each, one local event that could break it — such as border delays, rainy-season road closures, fuel shortages or longer load-shedding.',
            hint: "Ask an AI tool: ‘What assumptions would a forecast like this rely on?’ — then check its list against what you know.",
          },
        ],
      },
    ],
  },

  // ───────────────────────────── ops-safety (advanced) ─────────────────────────────
  {
    moduleId: 'ops-safety',
    lessons: [
      {
        id: 'ops-safety-l1',
        title: 'AI supports — never replaces — safety',
        minutes: 10,
        blocks: [
          {
            type: 'explain',
            title: 'Where AI helps safety teams',
            body: "AI can watch for missing PPE on cameras, find patterns in near-miss reports, predict gas build-up from sensor trends and detect driver fatigue on haul trucks. It extends what safety teams can see. It does not replace statutory procedures, permits to work, isolation, gas testing, competent persons' sign-off, or any worker's right to stop unsafe work.",
            bullets: ['AI flags; people verify and decide', 'Procedures and permits always apply', 'Anyone can stop unsafe work', 'Report AI failures like near-misses'],
          },
          {
            type: 'example',
            title: 'Fatigue alerts on night shift',
            scenario: "At Mhondoro Mining Co.'s open pit (fictional), in-cab cameras flagged fatigue events three times more often on night shift. Rather than disciplining drivers, safety officer Blessing met the crews. The cause: drivers were queuing for fuel before their shifts, then working 12 hours. Management changed the fuelling schedule and rotated breaks. Alerts halved — and the camera data was used for improvement, not punishment.",
            takeaway: 'AI surfaces patterns; people find causes. Use monitoring data to fix systems, and be open with workers about how it is used.',
          },
          {
            type: 'interactive',
            title: 'Spot the unsafe use of AI',
            prompt: 'Which of these is the dangerous use of AI in a mine or plant?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: 'Using an AI gas-trend forecast to allow re-entry after blasting without the required gas test by a competent person.', correct: true, feedback: 'This is the risk. Re-entry must follow the gas-testing procedure. A forecast is not a measurement, and sensors can fail or drift.' },
              { id: 'b', label: 'Using AI to group 400 near-miss reports and finding that most occur around shift change.', correct: false, feedback: 'A valuable insight for the safety committee to investigate.' },
              { id: 'c', label: 'Camera alerts for missing hard hats at the plant gate, followed up by a supervisor.', correct: false, feedback: 'A sensible support, provided manual checks continue in low light and dust.' },
              { id: 'd', label: 'Gas-sensor analytics that alert the control room to rising readings earlier than fixed thresholds.', correct: false, feedback: 'Useful early warning — the standard alarm and evacuation procedures still apply.' },
            ],
          },
          {
            type: 'explain',
            title: 'Automation bias and alarm fatigue',
            body: 'Two human traps make safety AI dangerous. Automation bias: people trust a green light and stop looking. Alarm fatigue: after too many false alerts, people start ignoring them — including the real one. Counter both by keeping physical checks, tuning alert thresholds with the people who respond, and reviewing every missed or false alert as a learning event.',
          },
          {
            type: 'quiz',
            question: 'An AI camera system reports ‘100% PPE compliance’ on a dusty night shift. What should the supervisor do?',
            options: [
              'Reduce manual PPE checks, since the system is reliable',
              'Keep manual checks — dust and low light can stop cameras detecting people or PPE correctly',
              'Switch the cameras off at night',
              'Report the score to management as proof the shift is safe',
            ],
            correctIndex: 1,
            explanation: 'A perfect score in poor conditions is a warning sign. Cameras can miss people entirely in dust or darkness. Human checks remain part of the safety system.',
            skillId: 'safety-ai',
          },
          {
            type: 'ai-example',
            title: 'Finding patterns in incident reports',
            instruction: "For the learner's industry in Zimbabwe (mining, manufacturing, construction, logistics, utilities or office-based operations), show how AI could analyse fictional near-miss or incident reports: give 4 short anonymised example reports, the pattern AI might find, the questions a safety committee must verify, and the decisions that must remain with people. Use a fictional organisation.",
            fallback: "Near-miss reports (anonymised) — Kudzai Packaging Works (fictional)\n1. ‘Forklift reversed close to pedestrian walkway, 06:10, poor lighting.’\n2. ‘Worker slipped on oil near Line 2 during shift change.’\n3. ‘Guard left open on bottle capper after a jam, 18:05.’\n4. ‘Pallet fell from racking while a truck was loading, 05:55.’\n\nPattern AI might find: 3 of the 4 events happened within 20 minutes of a shift change.\nThe safety committee should verify: does the pattern hold across 12 months, or only this sample? Are shift changes under-staffed? Was lighting affected by load-shedding?\nDecisions that stay with people: changing shift overlap, retraining, guarding improvements and any disciplinary steps — all made by management and the safety committee after investigation.",
          },
        ],
      },
      {
        id: 'ops-safety-l2',
        title: 'Quality monitoring and risk dashboards',
        minutes: 10,
        blocks: [
          {
            type: 'explain',
            title: 'AI on the production line',
            body: 'Vision systems can check fill levels, labels, seals and loaf weights at line speed; statistical models can predict when a process is drifting out of specification. This catches defects earlier and cuts waste. But the final release of food, medicine or safety-critical parts rests with qualified people and lab results — and every system needs regular calibration.',
            bullets: ['Great for 100% inspection at speed', 'Calibrate cameras and sensors', 'AI screens; lab tests confirm', 'People release product'],
          },
          {
            type: 'example',
            title: 'When rejects spike overnight',
            scenario: "On Kopje Foods' bread line (fictional), the AI vision system's reject rate jumped from 2% to 9% overnight. Before stopping the line, QC supervisor Chiedza weighed a sample of ‘rejected’ loaves — all were within specification. Flour dust had built up on the camera lens after a busy night. The lens was cleaned, the system recalibrated, and a lens check was added to the shift start-up checklist.",
            takeaway: 'When an AI quality signal changes suddenly, check the instrument as well as the product.',
          },
          {
            type: 'interactive',
            title: 'Reading a risk dashboard',
            prompt: "A plant's AI risk dashboard shows the ‘site risk score’ fell from 72 to 40 this month. Which response is best?",
            mode: 'choose-better',
            options: [
              { id: 'a', label: 'Celebrate and reduce the frequency of safety walks.', correct: false, feedback: 'A falling score is not proof of lower risk. It may have dropped because data stopped flowing.' },
              { id: 'b', label: 'Ask what drove the change — which inputs moved, whether any sensors or reports went missing, and whether frontline supervisors see the same improvement.', correct: true, feedback: 'Right — understand the drivers and check data completeness before trusting a headline score.' },
              { id: 'c', label: 'Ignore the dashboard; scores like this are meaningless.', correct: false, feedback: 'Dashboards are useful when understood. Dismissing them wastes early warnings.' },
            ],
          },
          {
            type: 'explain',
            title: 'Monitoring people fairly',
            body: "Cameras, fatigue sensors and productivity analytics collect data about workers. Be open about what is collected and why, limit its use to safety and quality, restrict access and involve worker representatives. Never use AI outputs alone for disciplinary action — investigate, hear the worker's side and look for system causes. Trust is itself a safety control.",
          },
          {
            type: 'quiz',
            question: 'Which statement best describes the role of AI in quality and safety monitoring?',
            options: [
              'It replaces inspectors and safety officers',
              'It screens and alerts, while qualified people verify, decide and remain accountable',
              'It only works in very large, fully automated factories',
              'It guarantees zero defects once installed',
            ],
            correctIndex: 1,
            explanation: 'AI extends detection and speed. Verification, release decisions and accountability stay with qualified people following procedures.',
            skillId: 'data-interpretation',
          },
          {
            type: 'task',
            title: 'Try it: design an alert response card',
            instructions: 'For one AI or sensor alert in your workplace (quality, safety or equipment), write a pocket card: what the alert means, the first physical check, who has authority to stop the line or process, and how to record false alarms.',
            hint: 'Keep it to five lines — it must be usable at 2 am on a noisy plant floor.',
          },
        ],
      },
    ],
  },

  // ───────────────────────────── ops-challenge ─────────────────────────────
  {
    moduleId: 'ops-challenge',
    lessons: [
      {
        id: 'ops-challenge-l1',
        title: 'Challenge briefing: challenge the maintenance forecast',
        minutes: 6,
        blocks: [
          {
            type: 'explain',
            title: 'What this challenge tests',
            body: "You will review an AI maintenance forecast for the processing plant at Mhondoro Mining Co. (fictional) and recommend what the plant should do. You are assessed on how well you use the data, test the AI's assumptions, protect safety and propose a practical plan that the engineering and production teams could act on.",
            bullets: ['Reading logs and forecasts', 'Testing assumptions and data gaps', 'Safety-first recommendations', 'A clear, practical output'],
          },
          {
            type: 'ai-example',
            title: 'Using AI on operational data',
            instruction: "For the learner's industry in Zimbabwe, show a short 4-step workflow for using AI to analyse maintenance or downtime logs: summarising patterns, surfacing assumptions, running a what-if scenario and drafting a recommendation. For each step give an example prompt and the human verification that must follow. Mention data gaps from load-shedding or seasonal effects. Use a fictional organisation.",
            fallback: "1. Summarise — ‘From these downtime logs, list failures by asset, cause and month, with counts and totals.’ Human check: totals match the maintenance system.\n2. Surface assumptions — ‘What assumptions does this forecast make about operating conditions, data completeness and season?’ Human check: compare with what engineers know, such as wet ore in the rains.\n3. What-if — ‘Re-run the estimate assuming the logger was offline for two weeks and three failures were missed in that period.’ Human check: confirm the gap dates with the control room.\n4. Draft — ‘Draft a one-page recommendation with options, risks and a safety statement.’ Human check: the engineering manager reviews it; statutory inspections stay unchanged.",
          },
          {
            type: 'interactive',
            title: 'Responsible-AI reminder: where is the line?',
            prompt: 'Which recommendation must never be accepted from an AI tool, however good its data?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: 'Plan the next shutdown for the week with the lowest forecast production loss.', correct: false, feedback: 'A reasonable planning input for engineering and production to confirm.' },
              { id: 'b', label: 'Skip the weekly conveyor guard and emergency-stop inspection to gain four production hours.', correct: true, feedback: 'This is the line. Safety inspections and guarding are non-negotiable controls; AI may optimise schedules, never safety.' },
              { id: 'c', label: 'Order spare mill liners early because the forecast shows rising wear.', correct: false, feedback: 'A sensible, low-risk action supported by the data.' },
              { id: 'd', label: 'Flag that the forecast excludes two weeks of logger downtime.', correct: false, feedback: 'Good critical thinking — data gaps must be surfaced.' },
            ],
          },
          {
            type: 'quiz',
            question: 'An AI forecast recommends extending a maintenance interval because failures have been rare. The data covers only dry-season months. What is the key concern?',
            options: [
              'Dry-season data is always more accurate',
              'The forecast may not reflect rainy-season conditions, when failure patterns can differ',
              'Maintenance intervals should never be changed',
              'The forecast is too cautious and should be more aggressive',
            ],
            correctIndex: 1,
            explanation: 'Data that misses a season misses its risks — wet ore, flooding and power disruptions can change failure rates. Test the assumption before changing any interval.',
            skillId: 'ai-verification',
          },
        ],
      },
    ],
    activity: {
      id: 'ops-challenge-activity',
      domainId: 'operations',
      title: 'Plant maintenance: challenge the AI forecast',
      scenario: 'Mhondoro Mining Co. (fictional) runs a gold processing plant where a main conveyor feeds a ball mill. Production is under pressure, and the plant manager asked an AI tool to analyse downtime logs and recommend how to cut maintenance downtime before the rainy season. You are the maintenance planner / operations officer. Review the AI output and recommend a plan to the engineering manager.',
      data: `DOWNTIME LOG SUMMARY (ball mill & main conveyor, fictional)
Month  Run hrs  Unplanned stops  Main cause                              Notes
Jan    560      4                Conveyor belt misalignment (wet ore)    Heavy rains
Feb    540      3                Mill motor overheating                  Load-shedding: frequent generator switching
Mar    600      1                Liner bolt failure
Apr    610      1                Conveyor idler bearing
May    620      0                —
Jun    615      0                —
Jul    630      1                Mill lube pump                          Logger offline 12–26 Jul (power outage)
Aug    625      0                —

Current planned maintenance interval: every 500 run hours
Standby generator diesel: 3 days' stock; supplier deliveries are often delayed in the rains

AI FORECAST & RECOMMENDATION (to review)
"Analysis period: March–August. Failure rate is low (0.5 stops/month) and stable.
Recommendation 1: Extend the planned maintenance interval from 500 to 800 run hours — adds about 60 production hours per quarter.
Recommendation 2: Run the plant on the standby generator through load-shedding without reducing throughput.
Recommendation 3: Skip the weekly conveyor guard and emergency pull-wire inspection during peak weeks; the model shows these faults are rare.
Confidence: high."`,
      task: 'Submit a recommendation to the engineering manager covering: (1) your approach to analysing the data; (2) how you would use AI, with at least two example prompts; (3) the flawed assumptions and data gaps in the AI forecast and how you would verify them; (4) safety risks and safeguards; (5) your final recommendation, including what you would and would not change.',
      rubric: [
        { criterion: 'Data analysis & practical plan', description: 'Uses the full log, including the rainy-season months, and proposes a realistic plan the plant could act on.', weight: 20 },
        { criterion: 'Effective AI use', description: 'Prompts ask for workings, assumptions and scenarios rather than a single answer.', weight: 15 },
        { criterion: 'Verification & critical thinking', description: 'Identifies the excluded rainy-season months, the July logger gap, the generator and diesel assumption and the unjustified ‘high’ confidence; explains how to check each.', weight: 35 },
        { criterion: 'Safety & responsible AI', description: 'Rejects skipping guard and pull-wire inspections; keeps statutory and safety procedures under human authority; clear accountability.', weight: 30 },
      ],
      skillIds: ['domain-operations', 'ai-verification', 'critical-thinking', 'safety-ai', 'ai-maintenance'],
      sampleStrongAnswer: "Approach: I reviewed all eight months, not just the AI's March–August window. January and February — the rainy months — had 7 of the 10 unplanned stops, from wet-ore belt misalignment and motor overheating during generator switching. The ‘low and stable’ failure rate describes the dry season only.\n\nAI use: ‘Using the full January–August log, calculate stops per 100 run hours by month and cause, and show your workings.’ ‘List every assumption behind extending the interval to 800 hours and what data would test each.’ ‘Re-estimate assuming failures went unrecorded during the 12–26 July logger outage.’\n\nFlaws and verification: the excluded rainy season; the July logger gap, which I would check against artisans' job cards and the control-room log; the generator plan, which ignores 3 days' diesel stock and rainy-season delivery delays (confirm with stores); and ‘high’ confidence based on six dry months.\n\nSafety: Recommendation 3 is rejected outright. Guard and pull-wire inspections are safety controls, not optional downtime, and remain under the engineering manager's authority.\n\nRecommendation: keep the 500-hour interval through the rains; from April, trial 600 hours on the conveyor only, with condition monitoring; pre-stock belt-alignment spares; reduce throughput during load-shedding whenever diesel falls below five days' stock; and review monthly with the engineering manager, who remains accountable for the decision.",
    },
  },
];
