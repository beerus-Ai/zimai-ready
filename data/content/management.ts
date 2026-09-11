import type { ModuleContent } from '../../types';

/**
 * Management & Leadership learning content.
 * All organisations and people are fictional (e.g. Baobab Hardware Stores, Runde Cold Chain Ltd,
 * Musasa Trust Bank, Zambezi Connect Telecom, Mbirimi Town Council).
 */
export const MANAGEMENT_CONTENT: ModuleContent[] = [
  // ───────────────────────────── mgmt-decisions ─────────────────────────────
  {
    moduleId: 'mgmt-decisions',
    lessons: [
      {
        id: 'mgmt-decisions-l1',
        title: 'Using AI to frame decisions, not make them',
        minutes: 12,
        blocks: [
          {
            type: 'explain',
            title: "What AI adds to a leader's decision",
            body: "AI can summarise long reports, lay out options, list pros and cons, run ‘what if’ scenarios and argue against your preferred choice. Used well, it widens your thinking and saves preparation time. But it does not know your people, your politics, your values or facts it was never given — and it cannot be held accountable. The decision, and its consequences, stay with you.",
            bullets: ['Use AI to widen options', 'Ask it to argue against you', 'Supply the context it lacks', 'Own the final call'],
          },
          {
            type: 'example',
            title: 'A depot in Masvingo?',
            scenario: "Rutendo, regional manager at Kopje Foods (fictional), was weighing a new distribution depot in Masvingo. She asked an approved AI tool for three options — a new depot, a shared warehouse or more trucks from Harare — with the assumptions behind each, and a pre-mortem: ‘Imagine this failed in 18 months. Why?’ The AI raised fuel price swings and rainy-season road access. She checked demand figures with the sales team and chose a six-month shared-warehouse pilot.",
            takeaway: "AI broadened the options and surfaced risks; Rutendo's verification and judgement shaped the decision.",
          },
          {
            type: 'interactive',
            title: 'Which prompt supports good judgement?',
            prompt: "You are deciding whether to outsource your company's delivery fleet. Which prompt is best?",
            mode: 'choose-better',
            options: [
              { id: 'a', label: '‘Should we outsource our deliveries?’', correct: false, feedback: 'Without data or context, the AI gives a generic answer that sounds authoritative but reflects nothing about your business.' },
              { id: 'b', label: '‘Act as a critical adviser. Here are our fleet costs (USD), delivery volumes and service levels for 12 months. Give three options, the assumptions behind each, key risks for staff and customers, what data is missing and what would change your view. Do not recommend until you have listed the assumptions.’', correct: true, feedback: 'Grounded, balanced and honest about uncertainty — it helps you think rather than thinking for you.' },
              { id: 'c', label: '‘Explain why outsourcing our deliveries is the right decision.’', correct: false, feedback: 'A leading prompt. The AI will build a persuasive case for whatever you asked — confirmation bias on demand.' },
            ],
          },
          {
            type: 'explain',
            title: 'Decision traps AI can amplify',
            body: 'AI is fluent and fast, which makes some classic traps more dangerous. Leading prompts produce confirmation. Precise-looking numbers hide weak data. A confident tone triggers authority bias. And the AI never mentions what it was not given. Counter these deliberately, especially when a decision affects jobs, customers or large sums in USD or ZiG.',
            bullets: ['Confirmation bias from leading prompts', 'False precision in figures', 'Trusting a confident tone', 'Silence about missing data'],
          },
          {
            type: 'quiz',
            question: 'Which is the most responsible way for a manager to use an AI recommendation?',
            options: [
              'Adopt it whenever the AI states high confidence',
              'Treat it as one input: test its assumptions, check key facts, then make and own the decision',
              'Ignore it, since AI cannot understand business',
              'Ask a second AI tool and go with the majority view',
            ],
            correctIndex: 1,
            explanation: 'AI output is decision support. Leaders test assumptions, verify facts, weigh people and values — and remain accountable for the outcome.',
            skillId: 'decision-support',
          },
          {
            type: 'ai-example',
            title: "AI as your devil's advocate",
            instruction: "For the learner's industry and management level in Zimbabwe, show how a manager could use AI as a devil's advocate on a realistic pending decision (e.g. a hiring freeze, a new branch, switching suppliers, investing in solar power). Give the prompt, 4–5 challenge questions the AI might raise, and a short note on which of those the manager must verify with people or data before deciding. Use a fictional organisation.",
            fallback: "Decision: Musasa Trust Bank (fictional) plans to move 60% of branch services to a mobile app within a year.\nPrompt: ‘Act as a sceptical board member. Challenge this plan: give the strongest arguments against it, who could be harmed, and what evidence would change your mind.’\nChallenge questions the AI raises:\n1. What share of rural customers have reliable data and a smartphone?\n2. How will elderly or low-literacy customers be served?\n3. What is the fraud and cybersecurity plan for the app?\n4. What happens to branch staff — redeployment, retraining?\n5. Are the savings based on current data prices and realistic USD/ZiG assumptions?\nVerify before deciding: questions 1, 2 and 5 need real customer and cost data; question 4 needs a people plan agreed with HR and staff representatives.",
          },
        ],
      },
      {
        id: 'mgmt-decisions-l2',
        title: 'Analysing business information critically',
        minutes: 13,
        blocks: [
          {
            type: 'explain',
            title: 'Check the data before the conclusion',
            body: 'Most bad AI-assisted decisions start with bad inputs. Before trusting an analysis, check that the data is complete, covers the right period, uses consistent currency (a USD and ZiG mix can distort every comparison), defines terms the same way across branches, and that the calculations add up. Then ask the most important question: what is not in this data?',
            bullets: ['Complete, and the right period?', 'Consistent currency and definitions?', 'Do the numbers reconcile?', 'What is missing?'],
          },
          {
            type: 'example',
            title: "The branch that wasn't failing",
            scenario: "An AI dashboard at Baobab Hardware Stores (fictional) showed the Bindura branch 40% behind the others and flagged it for review. Finance manager Tapiwa noticed that Bindura recorded most sales in ZiG, converted at an out-of-date exchange rate, while other branches reported mainly in USD. Recalculated at the correct rates, the gap was 8% — explained by a road closure during the rains.",
            takeaway: "Currency, timing and definitions can turn a normal branch into a ‘failing’ one. Check the inputs before judging the outcome.",
          },
          {
            type: 'interactive',
            title: 'Which AI finding is riskiest to act on?',
            prompt: 'Your AI assistant produced four findings for the executive meeting. Which is most dangerous to act on without further checking?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: "‘Last quarter's board papers mention supplier delays 14 times — consider a supplier review.’", correct: false, feedback: 'A useful prompt for discussion — low risk and easy to verify.' },
              { id: 'b', label: "‘Branch C's profit fell 35% in two months — recommend closure to save US$90,000 a year.’", correct: true, feedback: 'This is the risk. Two months is too short, the cause is unknown, and closure affects staff, customers and communities. Verify the data, the period and the reasons before any such decision.' },
              { id: 'c', label: '‘Customer complaints mention long queues on month-end Fridays — consider extra staff on those days.’', correct: false, feedback: 'A sensible, reversible action that can be tested quickly.' },
              { id: 'd', label: '‘Staff survey response rate was 62%; the top concern is transport costs.’', correct: false, feedback: 'A factual summary to check against the survey tool, but low risk.' },
            ],
          },
          {
            type: 'explain',
            title: 'Show your working: decision records',
            body: 'For significant decisions, keep a short record: the question, the data used, what AI contributed, what you checked and how, the options considered, who decided and why. It takes ten minutes, protects you and your team, helps the board or auditors understand the decision, and makes it easy to learn if the outcome disappoints.',
          },
          {
            type: 'quiz',
            question: "An AI analysis compares branch performance but mixes USD sales with ZiG sales converted at last year's rate. What is the right first step?",
            options: [
              'Accept the ranking — small currency differences do not matter',
              'Recalculate using consistent, current conversion rates before drawing conclusions',
              'Drop the ZiG-reporting branches from the analysis',
              'Ask the AI to explain its ranking more confidently',
            ],
            correctIndex: 1,
            explanation: 'Inconsistent currency conversion can distort every comparison. Fix the inputs first; conclusions drawn from flawed data are unreliable however well presented.',
            skillId: 'critical-thinking',
          },
          {
            type: 'task',
            title: 'Try it: three verification questions',
            instructions: 'Think of a recent report, dashboard or AI summary you used for a decision. Write three verification questions you should have asked — about completeness, definitions or currency, and what was missing — and who could answer each.',
            hint: "Good questions are specific: ‘Does this include the two weeks the Mutare system was offline?’ beats ‘Is the data right?’",
          },
        ],
      },
    ],
    activity: {
      id: 'mgmt-decisions-activity',
      domainId: 'management',
      title: "Solar or diesel? Test the AI's investment case",
      scenario: 'Runde Cold Chain Ltd (fictional) runs a cold-storage warehouse in Harare for fresh produce. Load-shedding forces the company to run diesel generators for long hours. The finance team asked an AI tool to compare a US$120,000 solar-and-battery system with staying on diesel, and the AI strongly recommends solar. As operations director, you must advise the board whether to approve the investment.',
      data: `COMPANY FIGURES (fictional)
- Warehouse power need: about 60 kW, 24 hours a day
- Load-shedding over the last 12 months: average 8 hours/day in winter (May–Aug), 4 hours/day the rest of the year
- Diesel use: about 20 litres per generator hour at current load; price assumed US$1.60/litre
- Current generator: 6 years old; overhaul due next year (US$15,000)
- Solar + battery quote: US$120,000 installed; batteries need replacing in year 7 (US$35,000)
- Finance: 3-year loan at 14% interest
- Cold store: any power gap over 2 hours risks spoiling about US$30,000 of stock

AI ANALYSIS (to review)
"Load-shedding: 12 hours/day all year.
Diesel cost avoided: 12 h x 20 L x US$1.60 x 365 = US$140,160 per year.
Payback: US$120,000 / US$140,160 = 10 months.
Recommendation: Approve immediately and sell the generator to recover cash. Risk: low."`,
      task: "Submit your advice to the board covering: (1) how you analysed the AI's case; (2) how you would use AI to improve the analysis, with at least two example prompts; (3) the flawed assumptions and missing costs, and how you would verify them; (4) risks and safeguards, including stock safety and accountability for the decision; (5) your recommendation, with conditions.",
      rubric: [
        { criterion: 'Analysis & business judgement', description: 'Rebuilds the case with realistic figures and weighs cost, risk and operational continuity.', weight: 25 },
        { criterion: 'Effective AI use', description: 'Uses AI to recalculate, surface assumptions and run scenarios rather than to decide.', weight: 15 },
        { criterion: 'Verification & critical thinking', description: "Finds the 12-hour assumption, the missing loan interest, battery replacement and overhaul costs, and the unsupported ‘low risk’ claim; checks against company records.", weight: 35 },
        { criterion: 'Responsible decision-making & accountability', description: 'Protects stock and customers with backup power, documents the decision and keeps the board accountable rather than deferring to the AI.', weight: 25 },
      ],
      skillIds: ['decision-support', 'critical-thinking', 'ai-verification', 'domain-management'],
      sampleStrongAnswer: "Analysis: the AI's arithmetic is right but its key assumption is wrong. It assumes 12 hours of load-shedding every day, while our records show 8 hours in winter and 4 hours otherwise — about 1,950 generator hours a year, not 4,380. At 20 litres an hour and US$1.60 a litre, diesel avoided is roughly US$62,000 a year, so simple payback is nearer two years than ten months. It also omits 14% loan interest, the US$35,000 battery replacement and the US$15,000 overhaul we would avoid.\n\nAI use: ‘Recalculate diesel savings using 8 hours a day May–August and 4 hours otherwise; show workings.’ ‘Build a 10-year cash flow including loan interest, battery replacement and overhaul, with low, likely and high diesel prices.’ ‘List what could make this investment fail.’\n\nVerification: load-shedding hours from the generator logbook, fuel use from receipts, quote terms from the supplier and the loan rate from the bank.\n\nRisks: selling the generator removes our backup, and a two-hour gap could spoil US$30,000 of stock, so we keep it serviced.\n\nRecommendation: solar still looks worthwhile on the revised numbers. Approve subject to a verified 10-year cash flow, batteries sized for night loads and retained generator backup. The board, not the AI, owns this decision; I will record the assumptions and review actual savings after six months.",
    },
  },

  // ───────────────────────────── mgmt-strategy ─────────────────────────────
  {
    moduleId: 'mgmt-strategy',
    lessons: [
      {
        id: 'mgmt-strategy-l1',
        title: 'Finding AI opportunities that create real value',
        minutes: 12,
        blocks: [
          {
            type: 'explain',
            title: 'Start with problems, not tools',
            body: "The best AI initiatives start from a real business problem: slow customer responses, hours lost compiling reports, errors in data capture, queues at service points. Look for work that is high-volume, repetitive, text- or data-heavy, and low-risk to start with. Then weigh value against feasibility: data quality, connectivity, power, licence costs in USD and your team's skills.",
            bullets: ['Value: time, quality, customer impact', 'Feasibility: data, cost, connectivity, skills', 'Risk: privacy, safety, fairness', 'Start small, measure, then scale'],
          },
          {
            type: 'example',
            title: 'A council starts small',
            scenario: 'The town clerk of Mbirimi Town Council (fictional) wanted faster service without new hires. Rather than buying a large system, her team piloted an approved AI assistant for two tasks: drafting replies to routine ratepayer queries and summarising council minutes. Staff reviewed every draft. After three months, response times had fallen by a third. The council deliberately kept AI out of decisions on rates arrears and water disconnections.',
            takeaway: 'Pick pilots with clear value and low risk — and decide early where AI will not be used.',
          },
          {
            type: 'interactive',
            title: 'Strong first AI pilots',
            prompt: 'Select every option that is a sensible first AI pilot for a mid-sized Zimbabwean business.',
            mode: 'sort',
            options: [
              { id: 'a', label: 'Summarising monthly branch reports into a two-page management pack, reviewed by an analyst', correct: true, feedback: 'High value, low risk and easy to check — a classic first pilot.' },
              { id: 'b', label: 'Drafting replies to routine customer queries, with agents reviewing before sending', correct: true, feedback: 'Clear time savings with a human check on every message.' },
              { id: 'c', label: 'Automatically dismissing staff whose AI productivity score falls below a threshold', correct: false, feedback: "High-stakes, unfair and legally risky. Decisions about people's jobs need human judgement, evidence and due process." },
              { id: 'd', label: 'Fully automated loan approvals with no human review, launched company-wide', correct: false, feedback: 'Too high-risk for a first pilot — credit decisions affect livelihoods and need fairness testing and oversight.' },
            ],
          },
          {
            type: 'ai-example',
            title: 'An AI opportunity shortlist for your team',
            instruction: "For the learner's industry, team and management role in Zimbabwe, generate a shortlist of 3 AI use cases. Score each 1–5 on value, feasibility and risk with a one-line reason, recommend one as the first pilot, and give one success measure and one ‘where we will not use AI’ boundary. Use a fictional organisation.",
            fallback: "Team: regional operations office, Zambezi Connect Telecom (fictional)\n1. Drafting weekly network-fault summaries for management — Value 4, Feasibility 5, Risk 1 (internal data, easy to check)\n2. AI-assisted WhatsApp replies to billing queries — Value 5, Feasibility 4, Risk 3 (customer data; needs privacy controls and agent review)\n3. Forecasting fuel for tower-site generators during load-shedding — Value 4, Feasibility 3, Risk 2 (depends on clean fuel logs)\n\nFirst pilot: option 1 — a quick win that builds confidence and skills.\nSuccess measure: report preparation time down from 6 hours to 2, with no increase in errors found by the reviewing engineer.\nBoundary: AI will not be used to set staff performance ratings or to disconnect customers.",
          },
          {
            type: 'quiz',
            question: 'Which factor should weigh most in choosing a first AI pilot?',
            options: [
              'Which tool has the most impressive demo',
              'A clear business problem with measurable value and manageable risk',
              'Whichever process employs the most staff, so savings look biggest',
              'What competitors say they are doing',
            ],
            correctIndex: 1,
            explanation: 'Pilots succeed when they solve a real problem, can be measured and carry risk the organisation can manage. Demos and hype do not deliver value on their own.',
            skillId: 'ai-strategy',
          },
          {
            type: 'task',
            title: 'Try it: a one-line pilot charter',
            instructions: 'Complete this for your team: ‘We will use AI to [task] for [users], so that [measurable benefit], with [human check], and we will not use it for [boundary]. We will review after [timeframe].’',
            hint: 'If you cannot name the measurable benefit, the pilot is not ready yet.',
          },
        ],
      },
      {
        id: 'mgmt-strategy-l2',
        title: 'Bringing your team along: change, skills and value',
        minutes: 13,
        blocks: [
          {
            type: 'explain',
            title: 'People first',
            body: "Teams often hear ‘AI’ and think ‘job losses’. Leaders who succeed are honest: some tasks will change or disappear, while new ones — reviewing, handling complex cases, improving processes — grow. Involve staff in choosing use cases, invest in training, recognise early adopters and make it safe to report AI mistakes. Adoption is a people project, not a software installation.",
            bullets: ['Be honest about how roles change', 'Co-design with frontline staff', 'Train before you roll out', 'Reward reporting of AI errors'],
          },
          {
            type: 'example',
            title: 'The call-centre rollout',
            scenario: 'Grace, a call-centre manager at Zambezi Connect Telecom (fictional), introduced AI-drafted replies for 40 agents, and anxiety was high. She ran co-design sessions in which agents chose which query types to start with and wrote the tone guide the AI would follow. Quality, not just speed, was measured. Within two months routine queries were faster, and experienced agents had moved to complex and vulnerable-customer cases — work they valued.',
            takeaway: 'Involving people turned fear into ownership and redesigned roles instead of cutting them.',
          },
          {
            type: 'interactive',
            title: 'Announcing an AI rollout',
            prompt: 'Which message should a manager send to the team?',
            mode: 'choose-better',
            options: [
              { id: 'a', label: '‘AI will soon show us who the slow performers are.’', correct: false, feedback: 'Creates fear and signals surveillance. Staff will resist, hide mistakes and avoid the tools.' },
              { id: 'b', label: "‘We're piloting AI to draft routine replies so you can spend more time on complex cases. Your role will change — we'll train everyone, you'll help shape how we use it, and a person always reviews what goes to customers.’", correct: true, feedback: 'Honest about change, clear on purpose, involves staff and keeps human oversight — the foundation for adoption.' },
              { id: 'c', label: '‘Nothing about your jobs will change.’', correct: false, feedback: 'Well meant but untrue. When roles do change, trust is lost.' },
            ],
          },
          {
            type: 'explain',
            title: 'Measuring value honestly',
            body: 'Set a baseline before the pilot, then track a balanced set of measures: time saved, quality and error rates, customer or citizen satisfaction, adoption, and incidents such as privacy slips or wrong answers. Count the full costs — licences in USD, data bundles, training and review time. At the end, decide deliberately: stop, adjust or scale.',
            bullets: ['Baseline first', 'Quality as well as speed', 'Full costs, including review time', 'Stop, adjust or scale'],
          },
          {
            type: 'quiz',
            question: 'Three months into an AI pilot, replies are 50% faster but complaints about wrong answers have doubled. What should the manager do?',
            options: [
              'Scale it up — speed is the main goal',
              'Pause and investigate the errors, strengthen review and fix the knowledge source before scaling',
              'Stop measuring complaints',
              'Blame the agents for not checking',
            ],
            correctIndex: 1,
            explanation: 'Speed without quality harms customers and trust. Balanced measures exist to catch exactly this. Fix the cause, then decide whether to scale.',
            skillId: 'domain-management',
          },
          {
            type: 'task',
            title: 'Try it: choose three pilot measures',
            instructions: 'For an AI use case your team could adopt, write three measures: one for efficiency, one for quality and one for risk or trust. Note the baseline you would need before starting.',
            hint: 'Example: average handling time; % of AI drafts needing major edits; number of privacy or accuracy incidents.',
          },
        ],
      },
    ],
  },

  // ───────────────────────────── mgmt-governance (advanced) ─────────────────────────────
  {
    moduleId: 'mgmt-governance',
    lessons: [
      {
        id: 'mgmt-governance-l1',
        title: 'Setting AI policy and guardrails for your team',
        minutes: 12,
        blocks: [
          {
            type: 'explain',
            title: 'What a practical AI policy covers',
            body: "An AI policy does not need to be long. It should answer five questions: Which tools are approved? What data may go into them? Which outputs need human review? Who is accountable for each AI use? How are mistakes and incidents reported? Align it with Zimbabwe's Cyber and Data Protection Act and any sector rules, and review it at least yearly.",
            bullets: ['Approved tools and uses', 'Data rules: what never goes in', 'Human review and accountability', 'Incident reporting'],
          },
          {
            type: 'example',
            title: 'Traffic-light data rules',
            scenario: 'At Musasa Trust Bank (fictional), the head of operations discovered staff pasting customer statements into free AI websites to write summaries. Instead of banning AI, she introduced traffic-light rules: Red (customer personal and financial data) — only in the bank’s approved internal assistant; Amber (internal, non-personal) — approved tools, no full-document uploads; Green (public information) — any approved tool. Training and a reference card followed, and unapproved AI use fell sharply within a quarter.',
            takeaway: 'Clear, simple rules plus a safe approved option work better than bans that push AI use into the shadows.',
          },
          {
            type: 'interactive',
            title: 'Spot the weak policy statement',
            prompt: 'Which statement in this draft AI policy creates the biggest risk?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: '‘Staff may use any free AI tool for any task, as long as they are careful.’', correct: true, feedback: "This is the risk. ‘Be careful’ is not a control. Without approved tools and data rules, customer and company data can leak and nobody is accountable." },
              { id: 'b', label: '‘AI-generated content sent to customers must be reviewed by a trained staff member.’', correct: false, feedback: 'A clear, workable control.' },
              { id: 'c', label: '‘Each AI use case has a named business owner responsible for its outcomes.’', correct: false, feedback: 'Good — accountability sits with a person, not the tool.' },
              { id: 'd', label: '‘Suspected AI errors or data leaks must be reported within 24 hours, without blame.’', correct: false, feedback: 'Good — fast, blame-free reporting surfaces problems early.' },
            ],
          },
          {
            type: 'explain',
            title: 'Accountability never transfers to the machine',
            body: "When an AI-assisted decision goes wrong, ‘the system said so’ is not a defence. Leaders remain accountable — even when the tool came from a vendor. Assign a named owner to every AI use case, make clear which decisions need a human decision-maker, and document reviews. Higher-stakes uses, such as credit, hiring, safety or service disconnections, need stronger oversight.",
          },
          {
            type: 'quiz',
            question: 'Who is accountable when an AI tool used in your department makes a harmful decision about a customer?',
            options: [
              'The AI vendor, because it built the tool',
              'Nobody, because the decision was automated',
              'The organisation and the named managers responsible for that AI use',
              'The customer, for accepting the terms and conditions',
            ],
            correctIndex: 2,
            explanation: 'Organisations and their leaders remain accountable for decisions made with AI. That is why every use case needs a named owner, human oversight and records.',
            skillId: 'ai-governance',
          },
          {
            type: 'ai-example',
            title: 'A one-page AI policy for your team',
            instruction: "For the learner's industry, team size and role in Zimbabwe, draft a concise one-page AI use policy outline: purpose, approved tools, traffic-light data rules with sector-relevant examples, permitted uses, prohibited uses, human review requirements, accountability, incident reporting and review date. Keep each section to one or two lines and use a fictional organisation.",
            fallback: "AI Use Policy — Operations Department, Kopje Foods (fictional)\nPurpose: use AI to work faster and better while protecting people, data and safety.\nApproved tools: the company AI assistant; others only with IT approval.\nData rules: Red — staff, customer and supplier personal or pricing data: approved assistant only. Amber — internal reports: approved tools, no full uploads. Green — public information: any approved tool.\nPermitted: drafting reports, summarising logs, analysing anonymised data, preparing training material.\nProhibited: food-safety release decisions, disciplinary decisions, sharing supplier bids, any use that bypasses safety procedures.\nReview: any output used externally or for decisions is checked by a named staff member.\nAccountability: each use has a named owner; the Operations Manager owns this policy.\nIncidents: report errors or leaks to IT and your manager within 24 hours — no blame for reporting.\nReview date: every 12 months, or after any major incident.",
          },
        ],
      },
      {
        id: 'mgmt-governance-l2',
        title: 'Managing AI risk: vendors, bias and incidents',
        minutes: 13,
        blocks: [
          {
            type: 'explain',
            title: 'An AI risk register',
            body: 'Treat AI like any other business risk. For each use case, list what could go wrong — inaccurate outputs, bias, privacy breaches, security weaknesses, vendor lock-in, data stored outside Zimbabwe, and dependence on connectivity and power. Rate likelihood and impact, assign controls and an owner, and revisit whenever the tool, the data or the use changes.',
            bullets: ['Accuracy and bias', 'Privacy, security and data location', 'Vendor and connectivity dependence', 'Owner, controls and review date'],
          },
          {
            type: 'example',
            title: 'The device-financing model',
            scenario: 'Zambezi Connect Telecom (fictional) used an AI model to approve smartphone financing. After six months, a risk review showed rural applicants were rejected twice as often as urban applicants with similar incomes — the model leaned heavily on mobile money history, which is thinner where agents are scarce. The executive team paused automatic rejections, added human review for borderline cases and asked the vendor to test alternative data.',
            takeaway: 'Bias often hides in proxies. Leaders must ask who is being disadvantaged — and act when the answer is uncomfortable.',
          },
          {
            type: 'interactive',
            title: 'Questions to ask an AI vendor',
            prompt: 'Before signing a contract for an AI tool, which questions should you ask? Select all that apply.',
            mode: 'sort',
            options: [
              { id: 'a', label: 'Where is our data stored and processed, and is it used to train your models?', correct: true, feedback: 'Essential for privacy, confidentiality and compliance with data protection law.' },
              { id: 'b', label: 'How can we test accuracy and bias on our own data, and see why the tool produced an output?', correct: true, feedback: "You need evidence the tool works fairly for your customers, not just in the vendor's demo." },
              { id: 'c', label: 'What happens when connectivity or power fails — is there an offline fallback?', correct: true, feedback: 'Critical in Zimbabwe, where load-shedding and outages are part of operating reality.' },
              { id: 'd', label: 'Can you guarantee the AI will never make a mistake?', correct: false, feedback: 'No honest vendor can. Ask instead for measured error rates, monitoring and how errors are corrected.' },
            ],
          },
          {
            type: 'explain',
            title: 'When AI goes wrong: incident response',
            body: 'Plan for AI incidents before they happen. Contain: pause the tool or the affected use. Assess: who was affected, and how badly. Inform: tell affected customers or staff honestly, and regulators where the law requires. Fix: correct the data, prompt or process. Learn: update the risk register and training — and thank the people who reported the problem early.',
          },
          {
            type: 'quiz',
            question: 'An internal review finds your AI screening tool treats one customer group unfairly. What is the most responsible first step?',
            options: [
              'Keep using it while the vendor investigates, because it saves time',
              'Pause or restrict the affected use, add human review and investigate the cause',
              'Remove that group from the data so the problem disappears',
              'Keep the finding confidential to avoid reputational damage',
            ],
            correctIndex: 1,
            explanation: 'Contain the harm first, then investigate and fix. Hiding the issue or deleting data does not remove the unfairness — it only hides it.',
            skillId: 'responsible-ai',
          },
          {
            type: 'task',
            title: 'Try it: three rows of an AI risk register',
            instructions: 'Pick one AI use in your organisation (current or planned). Write three risks, each with likelihood (low/medium/high), impact, one control and the role of the named owner.',
            hint: 'Include at least one risk about people (bias or privacy) and one about operations (accuracy, connectivity or vendor).',
          },
        ],
      },
    ],
  },

  // ───────────────────────────── mgmt-challenge ─────────────────────────────
  {
    moduleId: 'mgmt-challenge',
    lessons: [
      {
        id: 'mgmt-challenge-l1',
        title: 'Challenge briefing: the branch closure recommendation',
        minutes: 6,
        blocks: [
          {
            type: 'explain',
            title: 'What this challenge tests',
            body: 'You will review an AI analysis for Baobab Hardware Stores (fictional) that recommends closing a branch. You are assessed on whether you use AI to analyse the information well, test its reasoning rather than simply accept it, consider staff and customers, and produce a clear, accountable recommendation for the board.',
            bullets: ['Using AI to analyse, not decide', 'Testing data and assumptions', 'Weighing people and customers', 'A clear recommendation you own'],
          },
          {
            type: 'ai-example',
            title: 'Using AI on a big decision',
            instruction: "For the learner's industry and management level in Zimbabwe, show a short 4-step workflow for using AI on a major business decision (e.g. closing a site, cutting a product line, restructuring a team): data check, alternative options, pre-mortem or devil's advocate, and a decision memo. Give an example prompt and the human verification for each step. Use a fictional organisation.",
            fallback: "1. Data check — ‘List any gaps, inconsistencies or period effects in this branch data (currency conversion, missing months, one-off events).’ Human check: finance confirms the figures.\n2. Options — ‘Give four alternatives to closure, with costs, risks and assumptions.’ Human check: branch and regional managers test feasibility.\n3. Pre-mortem — ‘Assume we closed the branch and it went badly within a year. Why?’ Human check: talk to staff, key customers and suppliers.\n4. Decision memo — ‘Draft a one-page memo with the recommendation, evidence, assumptions and what would change our minds.’ Human check: the executive responsible owns and signs the decision.",
          },
          {
            type: 'interactive',
            title: 'Responsible-AI reminder: which move is risky?',
            prompt: 'Preparing your recommendation, which action is the risk?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: "Presenting the AI's closure recommendation to the board as ‘the data-driven answer’.", correct: true, feedback: "This is the risk. It hides the AI's assumptions and shifts accountability onto a tool. The board needs your tested judgement, with the evidence." },
              { id: 'b', label: 'Noting in the memo which figures came from AI and how you checked them.', correct: false, feedback: 'Good — transparency builds trust in the analysis.' },
              { id: 'c', label: 'Considering the impact on staff and on customers who depend on the branch.', correct: false, feedback: 'Essential — closure decisions affect livelihoods and communities.' },
              { id: 'd', label: 'Asking AI for alternatives to closure before deciding.', correct: false, feedback: 'Good — it widens the options before a costly, hard-to-reverse decision.' },
            ],
          },
          {
            type: 'quiz',
            question: "The AI's closure recommendation is based on the branch's weakest quarter, during the rainy season. What is the best response?",
            options: [
              'Accept it — recent data is always the most relevant',
              'Request a full-year comparison and investigate seasonal and one-off causes before deciding',
              'Close two branches to be safe',
              'Ignore the data and rely on instinct',
            ],
            correctIndex: 1,
            explanation: 'A short, seasonal window can make a sound branch look like a failure. Leaders ask for the full picture and the causes before hard-to-reverse decisions.',
            skillId: 'decision-support',
          },
        ],
      },
    ],
    activity: {
      id: 'mgmt-challenge-activity',
      domainId: 'management',
      title: "Branch closure: don't take the AI's word for it",
      scenario: 'Baobab Hardware Stores (fictional) has six branches selling building materials and farming supplies. The CEO asked an AI tool to analyse branch performance, and it recommends closing the Chinhoyi branch. You are the general manager responsible for branches and must advise the board next week.',
      data: `BRANCH FIGURES (fictional; quarter Jan–Mar)
Branch       Revenue (USD equiv.)  Operating profit (USD)  Staff  Notes
Harare CBD   310,000               46,000                  18
Msasa        260,000               39,000                  15
Bulawayo     240,000               31,000                  14
Mutare       180,000               22,000                  11
Gweru        150,000               14,000                   9
Chinhoyi      95,000               -6,000                   8     ZiG sales converted at December's rate; highway bridge closed 5 weeks in Feb (rains)

EXTRA INFORMATION (not given to the AI)
- Chinhoyi full-year results last year: revenue US$520,000, operating profit US$41,000
- Chinhoyi serves about 1,100 small-scale farmers on account; peak season is Aug–Nov (seed, fertiliser, fencing)
- Chinhoyi lease runs to 2028; early-exit penalty US$25,000
- Nearest alternative branch: Harare, about 120 km away

AI ANALYSIS & RECOMMENDATION (to review)
"Chinhoyi is the lowest-performing branch, with a loss of US$6,000 this quarter, and its profit has declined 100% compared to the average branch. Closing it will save approximately US$90,000 per year and improve company margin by 2 percentage points. Customers can be served by the Harare branch. Recommendation: close Chinhoyi by June. Confidence: high."`,
      task: 'Submit a board recommendation covering: (1) your approach to analysing the information; (2) how you would use AI, with at least two example prompts; (3) the weaknesses in the AI’s data, reasoning and recommendation, and how you would verify them; (4) risks and safeguards — staff, customers, reputation and accountability; (5) your final recommendation, with conditions and a review point.',
      rubric: [
        { criterion: 'Analysis & business judgement', description: 'Uses all available information, including full-year and seasonal data, and weighs financial, customer and people factors.', weight: 25 },
        { criterion: 'Effective AI use', description: 'Uses AI to analyse, generate alternatives and stress-test — not to make the decision.', weight: 15 },
        { criterion: 'Verification & critical thinking', description: "Identifies the single-quarter window, the stale ZiG conversion, the unsupported savings and ‘100%’ claims, and the missing lease, customer and seasonal factors.", weight: 35 },
        { criterion: 'Responsible leadership & accountability', description: 'Considers staff and farmer customers, is transparent about the role AI played, and takes ownership of the recommendation.', weight: 25 },
      ],
      skillIds: ['domain-management', 'decision-support', 'critical-thinking', 'ai-verification'],
      sampleStrongAnswer: "Approach: I compared the AI's single quarter with last year's full-year results and the context the AI was never given.\n\nWeaknesses: January–March is Chinhoyi's off-season, and a five-week bridge closure cut access in February. Its ZiG sales were converted at December's rate, understating revenue. Last year it made US$41,000 profit on US$520,000 revenue — a solid performer over a full year. ‘Profit declined 100% compared to the average branch’ is meaningless, and the US$90,000 saving has no workings; it ignores the US$25,000 lease penalty, redundancy costs and lost account customers.\n\nAI use: ‘Recalculate Chinhoyi's revenue with ZiG sales converted at actual monthly rates; show workings.’ ‘Compare each branch's profit over the last eight quarters and flag seasonality.’ ‘Give four alternatives to closure with costs and risks.’\n\nVerification: finance confirms conversion rates and lease terms; the branch manager confirms the bridge closure's impact; we ask a sample of farmer customers whether they would travel 120 km to Harare.\n\nRisks: eight jobs, 1,100 farmers losing a local supplier before peak season, and reputational damage in the region.\n\nRecommendation: do not close Chinhoyi. Keep it open through the August–November peak, reduce off-season costs such as opening hours, and review in December against a full-year target. I will record the evidence and assumptions; the board and I, not the AI, are accountable for this decision.",
    },
  },
];
