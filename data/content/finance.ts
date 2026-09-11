import type { ModuleContent } from '../../types';

/**
 * Finance & Accounting domain content.
 * Responsible AI is woven through every module: confidential financial data, hallucinated
 * figures, audit trail, bias in credit decisions and human sign-off.
 * All organisations, people and figures are fictional.
 */

const lines = (...l: string[]) => l.join('\n');

// ───────────────────────────── fin-analysis ─────────────────────────────

const FIN_ANALYSIS: ModuleContent = {
  moduleId: 'fin-analysis',
  lessons: [
    {
      id: 'fin-analysis-l1',
      title: 'Analysing financial statements with AI',
      minutes: 12,
      blocks: [
        {
          type: 'explain',
          title: 'What AI adds to financial analysis',
          body: 'AI can speed up the slow parts of analysis: spotting movements in a trial balance, calculating ratios from data you supply, suggesting drivers to investigate and drafting commentary. What it cannot know is your business, such as the contract that slipped, the one-off repair or the ZiG movement, unless you tell it.',
          bullets: ['Structure and summarise data you provide', 'Calculate ratios and variances, then recheck them', 'Suggest possible drivers to investigate', 'Draft commentary for you to refine'],
        },
        {
          type: 'explain',
          title: 'Give it clean, safe data',
          body: "Prepare data before you prompt. State the currency basis (USD, ZiG, or converted and at which rate), label periods clearly and remove client or personal identifiers. Use your organisation's approved AI tool for internal financial data, and never paste unreleased results into a public tool.",
        },
        {
          type: 'ai-example',
          title: 'Prompting for ratio analysis',
          instruction:
            "For this learner's organisation type and industry in Zimbabwe, show a strong prompt asking AI to analyse a small fictional two-quarter income statement: include role, context, currency basis, task, format and the constraint 'show your calculations, list assumptions and do not speculate about causes'. Then show a short AI response with correctly calculated ratios and workings, and questions for the learner to investigate.",
          fallback: lines(
            "Prompt: 'You are a management accountant at a Zimbabwean hardware retailer. Figures are USD thousands; ZiG sales are already converted at month-end rates. Q1 then Q2: Revenue 760, 820. Cost of sales 517, 574. Operating expenses 165, 180. Calculate gross and operating margin for each quarter and the growth in revenue, cost of sales and expenses. Show workings, list your assumptions, and do not guess causes. List questions for me instead.'",
            '',
            'AI response:',
            '• Revenue grew 7.9% (760 to 820).',
            '• Gross margin fell from 32.0% (243/760) to 30.0% (246/820) because cost of sales rose 11.0%.',
            '• Operating expenses rose 9.1%, so operating margin fell from 10.3% (78/760) to 8.0% (66/820).',
            '• Assumptions: no one-off items; conversion rates applied consistently.',
            '• Questions: did supplier prices rise or did the product mix shift? Which expense lines drove the USD 15k increase?',
          ),
        },
        {
          type: 'example',
          title: 'The ratio without the reason',
          scenario:
            "An analyst at Msasa Mutual asked AI why the insurer's claims ratio jumped in the first quarter. It suggested 'weaker underwriting standards'. The real driver, which she knew from the claims team, was a hailstorm in Mashonaland East that damaged dozens of insured greenhouses in a single week.",
          takeaway: 'AI can calculate the movement; you supply the verified business reason.',
        },
        {
          type: 'interactive',
          title: 'Which prompt is more reliable?',
          prompt: 'You want AI help analysing two quarters of results. Which prompt will give the most reliable output?',
          mode: 'choose-better',
          options: [
            { id: 'a', label: "'Analyse our financials and tell me how we're doing.'", correct: false, feedback: 'No data basis, no format and no limits, so the AI will fill the gaps with generic or invented content.' },
            {
              id: 'b',
              label: "'Here is our Q1–Q2 income statement in USD thousands, with no client data. Calculate gross and operating margins, show workings, list the three largest movements and your assumptions. Do not speculate on causes; list questions instead.'",
              correct: true,
              feedback: 'Strong. Clear data, visible workings and a no-speculation constraint make every number checkable.',
            },
            { id: 'c', label: "'You are a genius CFO. Give me powerful insights.'", correct: false, feedback: "A grand role doesn't make up for missing data, and 'powerful insights' invites confident speculation." },
          ],
        },
        {
          type: 'quiz',
          question: 'You paste quarterly figures that mix unlabelled USD and ZiG amounts. What is the main risk?',
          options: [
            'The AI will refuse to answer',
            'The AI will automatically convert everything at the official rate',
            'The AI may add different currencies together and produce misleading ratios',
            'There is no risk as long as the totals are correct',
          ],
          correctIndex: 2,
          explanation: 'AI cannot tell which figures are in which currency unless you say so. Mixed, unlabelled currencies are a common source of badly wrong ratios.',
          skillId: 'financial-analysis',
        },
        {
          type: 'task',
          title: 'Check the calculator',
          instructions:
            'Take a small, non-confidential set of figures, such as a published annual report summary or made-up numbers. Ask AI to calculate two ratios with workings, then recalculate them yourself in a spreadsheet. Note any differences and why they arose.',
          hint: 'Watch for rounding, the wrong denominator, and periods of different lengths.',
        },
      ],
    },
    {
      id: 'fin-analysis-l2',
      title: 'Variance commentary you can sign off',
      minutes: 13,
      blocks: [
        {
          type: 'explain',
          title: 'What good commentary does',
          body: 'Useful variance commentary explains what moved, by how much, why and what happens next, in plain language for the reader. AI is good at turning a variance table into readable sentences. It is poor at knowing why a variance happened. That must come from you, your budget holders and your records.',
          bullets: ['What moved, in USD and %', 'Why: the verified business driver', 'One-off or ongoing?', 'Action or outlook'],
        },
        {
          type: 'ai-example',
          title: 'Weak vs strong prompt for variance commentary',
          instruction:
            "Show a weak vs strong prompt for drafting month-end variance commentary for this learner's organisation type in Zimbabwe, using a small fictional budget-vs-actual table and supplying the known drivers. Show the AI's draft commentary with correctly calculated variances, then point out one sentence the learner must verify before sign-off.",
          fallback: lines(
            "Weak prompt: 'Write variance commentary for this month.'",
            '',
            "Strong prompt: 'You are a management accountant at a Zimbabwean food manufacturer. Draft March variance commentary for the executive team (USD). Budget vs actual: Revenue 450k vs 412k. Raw materials 180k vs 196k. Fuel and power 22k vs 31k. Known drivers: a 10-day maize supply delay cut production; generator use rose during load-shedding. For each line give the variance in USD and %, the driver (only from those I have given, otherwise write driver to be confirmed) and whether it is likely to recur. Maximum 120 words.'",
            '',
            'AI draft: Revenue was USD 412k, USD 38k (8.4%) below budget, because a 10-day maize supply delay reduced production. Raw materials were USD 16k (8.9%) over budget; driver to be confirmed. Fuel and power exceeded budget by USD 9k (40.9%) owing to extra generator use during load-shedding, and is likely to recur while outages continue.',
            '',
            'Verify before sign-off: raw materials rose while production fell. Confirm with procurement whether emergency purchases at higher prices explain this before the commentary goes out.',
          ),
        },
        {
          type: 'example',
          title: "The plausible driver that wasn't",
          scenario:
            "AI-drafted commentary at Kopje Foods Ltd said distribution costs rose 'due to higher fuel prices'. The finance officer checked the ledger: fuel prices were flat, and the increase came from a one-off truck repair after rainy-season damage to a gravel road. The commentary was corrected before it reached the board.",
          takeaway: "Never let AI fill a 'why' gap with a plausible guess.",
        },
        {
          type: 'interactive',
          title: 'Spot the unsupported sentence',
          prompt: 'AI drafted these lines from a table showing only budget and actual figures. Which line must be removed or verified before sign-off?',
          mode: 'spot-the-risk',
          options: [
            { id: 'a', label: 'Salaries were USD 3k (2.1%) above budget.', correct: false, feedback: 'Derived directly from the table. Still recheck the arithmetic, but the claim is supported.' },
            {
              id: 'b',
              label: 'Revenue was 6% below budget because a key competitor cut prices.',
              correct: true,
              feedback: 'Correct. The table says nothing about competitors, so this driver was invented. Confirm the real reason with the sales team.',
            },
            { id: 'c', label: 'Utilities were USD 1.2k below budget.', correct: false, feedback: 'A factual variance from the table. Supported, subject to your arithmetic check.' },
            { id: 'd', label: 'Year-to-date expenses are 1.5% above budget.', correct: false, feedback: 'Calculable from the data provided. Tie it to the management accounts.' },
          ],
        },
        {
          type: 'explain',
          title: 'Your sign-off checklist',
          body: 'Before AI-assisted commentary goes to management, review it like any other working paper, and keep evidence of what you checked.',
          bullets: ['Every figure ties to the management accounts', 'Every driver is confirmed by a record or budget holder', 'Currency and period are stated correctly', 'AI use is recorded in the working file'],
        },
        {
          type: 'quiz',
          question: 'AI-drafted commentary gives a reason for a variance that you never supplied. What should you do?',
          options: [
            'Keep it, because the AI probably knows the industry',
            'Delete the draft and never use AI for commentary again',
            "Add the word 'possibly' and publish it",
            'Treat it as a hypothesis and confirm it with the budget holder or records first',
          ],
          correctIndex: 3,
          explanation: 'An unsupplied driver is at best a hypothesis and at worst a hallucination. Confirm it from evidence, or replace it with "driver to be confirmed".',
          skillId: 'ai-verification',
        },
      ],
    },
  ],
  activity: {
    id: 'fin-analysis-activity',
    title: 'Correct the AI: October variance commentary',
    domainId: 'finance',
    scenario:
      'You are an assistant accountant at Mhofu Agro-Dealers (Pvt) Ltd, a fictional farm-inputs distributor with branches in Chinhoyi, Marondera and Masvingo. The finance manager needs October variance commentary for the monthly management pack. A colleague has already asked an AI tool to draft it from the table below. Review the draft, correct it and produce commentary you would be willing to sign off.',
    data: lines(
      'Mhofu Agro-Dealers: October budget vs actual (USD, all branches)',
      'Line              Budget     Actual     Variance',
      'Revenue          210,000    236,000    +26,000',
      'Cost of sales    147,000    170,000    -23,000',
      'Gross profit      63,000     66,000     +3,000',
      'Transport          9,000     12,600     -3,600',
      'Staff costs       18,000     18,400       -400',
      'Generator fuel     2,500      4,100     -1,600',
      '',
      'Notes from branch managers:',
      '- Early rains brought fertiliser demand forward from November (Chinhoyi and Marondera)',
      '- Main supplier raised fertiliser prices by 6% from 1 October',
      '- Two extra trucks hired to meet early-season deliveries',
      '- Load-shedding increased to 10 hours a day in Masvingo',
      '',
      'AI-generated draft commentary:',
      '"Revenue exceeded budget by USD 26,000 (12.4%), driven by strong demand across all three branches. Gross margin improved from 30.0% to 32.0%, reflecting better pricing. Transport costs were 40% over budget due to fuel price increases. Staff costs were broadly on budget. Overall, October results indicate sustained growth that should continue through the season."',
    ),
    task:
      'Submit: (1) your approach; (2) how you would use AI, including at least one improved prompt; (3) each error or unsupported claim in the AI draft and how you verified it; (4) risks and safeguards, covering data, audit trail and sign-off; (5) your final corrected commentary of no more than 120 words.',
    rubric: [
      { criterion: 'Verification & critical thinking', description: 'Recalculates figures and identifies every error, unsupported driver and omission in the AI draft, with evidence from the table and notes.', weight: 35 },
      { criterion: 'Commentary quality', description: 'Final commentary is accurate, concise and reader-friendly: amount, %, verified driver and outlook for each material line.', weight: 25 },
      { criterion: 'Effective AI use', description: 'Improved prompt supplies data, drivers, currency and format, and forbids invented reasons.', weight: 20 },
      { criterion: 'Responsible AI & controls', description: 'Addresses data confidentiality, approved tools, audit trail of AI use and human sign-off.', weight: 20 },
    ],
    skillIds: ['financial-analysis', 'ai-verification', 'ai-analytics'],
    sampleStrongAnswer: lines(
      "Approach: I recalculated every figure from the table before reading the AI's narrative, then tested each claim against the branch notes.",
      '',
      "AI use: I would re-prompt in the company's approved tool: 'Using only this table and these notes, give each material variance in USD and %, use only the drivers in the notes, write driver to be confirmed where none is given, and keep it under 120 words.'",
      '',
      "Errors found: (1) Gross margin fell from 30.0% to 28.0% (66,000/236,000); it did not rise to 32.0%, and 'better pricing' contradicts the 6% supplier increase. (2) The 40% transport overspend came from two extra truck hires, not fuel prices. (3) 'All three branches' and 'sustained growth' are unsupported: extra demand came from Chinhoyi and Marondera and was pulled forward from November. The draft also omitted generator fuel, 64% over budget.",
      '',
      'Safeguards: no customer data used; the prompt, AI draft and my workings are saved in the month-end file; the finance manager signs off.',
      '',
      'Final commentary: Revenue was USD 236,000, USD 26,000 (12.4%) above budget, as early rains brought fertiliser demand forward from November in Chinhoyi and Marondera, so November revenue may fall short of budget. Gross margin fell to 28.0% (budget 30.0%) after a 6% supplier price rise. Transport was USD 3,600 (40%) over budget because of two extra truck hires. Generator fuel was USD 1,600 (64%) over budget owing to longer load-shedding in Masvingo. Staff costs were in line with budget.',
    ),
  },
};

// ───────────────────────────── fin-automation ─────────────────────────────

const FIN_AUTOMATION: ModuleContent = {
  moduleId: 'fin-automation',
  lessons: [
    {
      id: 'fin-automation-l1',
      title: 'AI in reconciliations and invoice processing',
      minutes: 12,
      blocks: [
        {
          type: 'explain',
          title: 'Where automation helps',
          body: 'Reconciliations and invoice processing are rule-heavy and repetitive, which makes them ideal for automation. AI-enabled tools can read invoices, extract amounts and dates, suggest matches between bank lines and ledger entries, and group unmatched items. Your role shifts from keying and ticking to investigating exceptions and approving.',
          bullets: ['Extract data from invoices and statements', 'Suggest matches with a confidence score', 'Group and explain unmatched items', 'Draft reconciliation summaries'],
        },
        {
          type: 'example',
          title: 'Mobile money reconciliation',
          scenario:
            'Chiedza Microfinance receives thousands of small loan repayments by mobile money each month, many with missing or mistyped references. An AI matching tool now suggests which borrower each payment belongs to, with a confidence score. Staff review every match below 90% confidence and every match over USD 500 before posting.',
          takeaway: 'Automate the matching; keep people on the exceptions and high-value items.',
        },
        {
          type: 'explain',
          title: 'Controls must not disappear',
          body: 'Automation can quietly remove checks that used to happen along the way. Keep segregation of duties, value and confidence thresholds for review, and an audit trail showing what the AI suggested, who accepted it and when. Your auditors will ask.',
          bullets: ['Approval thresholds by value and confidence', 'Segregation of duties', 'Logged AI suggestions and human decisions'],
        },
        {
          type: 'interactive',
          title: 'Spot the control gap',
          prompt: 'A mining supplier is designing an automated invoice process. Which design choice is the biggest risk?',
          mode: 'spot-the-risk',
          options: [
            { id: 'a', label: 'Invoices over USD 5,000 need manager approval.', correct: false, feedback: 'A sensible value-based control.' },
            {
              id: 'b',
              label: 'The AI auto-approves and pays any invoice matched to a purchase order, including ones with changed supplier bank details.',
              correct: true,
              feedback: 'Correct. Changed bank details are a classic invoice-fraud signal. They need independent human verification, such as calling the supplier on a known number, before any payment.',
            },
            { id: 'c', label: 'Unmatched invoices go to a daily exception queue.', correct: false, feedback: 'Good practice. Exceptions get human attention.' },
            { id: 'd', label: "Every AI match is logged with the reviewer's name.", correct: false, feedback: 'Exactly what an audit trail needs.' },
          ],
        },
        {
          type: 'ai-example',
          title: 'Prompting for exception analysis',
          instruction:
            "For this learner's organisation type in Zimbabwe, show a prompt asking AI to classify a small fictional list of unreconciled bank items (anonymised, with customer and supplier codes instead of names) into timing differences, bank charges, possible duplicates and unidentified items. Show the AI's output with the evidence needed to confirm each, and note which items still need human investigation.",
          fallback: lines(
            "Prompt: 'You are an experienced accountant. Below are six unreconciled items from our USD bank reconciliation for June, with names replaced by codes. Classify each as timing difference, bank charge, possible duplicate or unidentified. Give a one-line reason and the evidence that would confirm it. Do not guess customer identities.'",
            '1) Deposit 4,200 from CUST-017 in ledger on 30 Jun, not yet on statement. 2) Charge 18.50 "SVC FEE". 3) Two payments of 1,150 to SUPP-044 on 12 Jun. 4) Cheque 00731 for 2,300 in ledger, not on statement. 5) Receipt 640 with reference "LOAN". 6) Debit 75.00 "INTL TXN".',
            '',
            'AI output: 1: timing difference, deposit in transit; confirm it clears in early July. 2: bank charge; check the bank tariff and post it. 3: possible duplicate; check the supplier statement for two invoices. 4: timing difference, unpresented cheque; follow up if still uncleared after three months. 5: unidentified; check mobile money and remittance records. 6: card charge or bank fee; check the card statement.',
            '',
            "Human follow-up: items 3 and 5 need investigation before anything is posted. The AI's labels are hypotheses, not evidence.",
          ),
        },
        {
          type: 'quiz',
          question: 'After introducing AI-assisted reconciliation, which control is most important to keep?',
          options: [
            'Re-keying every bank line manually as a backup',
            'Hiding confidence scores so staff are not confused',
            'Letting the AI post journals directly to save time',
            'A logged human review of exceptions and high-value matches',
          ],
          correctIndex: 3,
          explanation: 'Automation should remove routine work, not oversight. A logged review of exceptions and high-value items keeps both control and an audit trail.',
          skillId: 'ai-automation',
        },
      ],
    },
    {
      id: 'fin-automation-l2',
      title: 'Month-end reporting without losing control',
      minutes: 13,
      blocks: [
        {
          type: 'explain',
          title: 'Speeding up month-end',
          body: 'At month-end, AI can draft routine commentary, build first-draft report packs from templates, summarise ageing reports and write reminder emails to budget holders. Combined with spreadsheet automation such as macros or Power Query, it can cut days from the close, provided outputs are reviewed and reconciled to the ledger.',
        },
        {
          type: 'ai-example',
          title: 'An automation idea for your close',
          instruction:
            "Suggest one realistic month-end task in this learner's finance role and organisation type in Zimbabwe that could be partly automated with AI. Describe the before-and-after workflow in 4–5 steps, name the human review point and list the control evidence to keep for audit.",
          fallback: lines(
            'Task: the monthly accruals schedule',
            'Before: download the ledger, list open purchase orders by hand, email budget holders, key in replies, draft notes. About two days.',
            'After:',
            '1. Export open purchase orders and goods-received data from the accounting system.',
            '2. Spreadsheet automation flags goods received but not yet invoiced.',
            "3. The approved AI tool drafts an email to each budget holder listing their items, using supplier codes only.",
            '4. The accountant reviews replies, posts accruals and asks AI to draft the schedule notes.',
            '5. Human review point: the financial controller approves every accrual journal over USD 1,000.',
            'Control evidence: the exported data, AI drafts, approval log and reconciled schedule, all saved in the month-end folder.',
          ),
        },
        {
          type: 'example',
          title: 'Faster close, same accuracy',
          scenario:
            "Rukanda Hardware's finance team used to spend three days on the debtors' ageing summary and chase emails. They now export the ageing report into the company's approved AI tool, which drafts the summary and reminder emails. A credit controller reviews every email and figure before anything is sent, and the task takes half a day.",
          takeaway: 'Speed comes from the AI; accuracy still comes from the review.',
        },
        {
          type: 'interactive',
          title: 'What to automate',
          prompt: 'Select every month-end task that is sensible to automate or AI-assist, with review.',
          mode: 'sort',
          options: [
            { id: 'a', label: 'Drafting first-pass commentary from a verified variance table', correct: true, feedback: 'Yes. AI drafts, and you confirm drivers and figures.' },
            { id: 'b', label: "Summarising the debtors' ageing report for the management pack", correct: true, feedback: 'Yes. Summarising structured data you supply is a strong use case.' },
            { id: 'c', label: 'Approving journal entries without review', correct: false, feedback: 'No. Journal approval is a key control and must stay with an accountable person.' },
            { id: 'd', label: 'Drafting reminder emails for overdue accounts', correct: true, feedback: 'Yes, in an approved tool and with a human check before sending.' },
          ],
        },
        {
          type: 'explain',
          title: 'Currency and tax need extra care',
          body: 'Automated outputs are only as good as their inputs and rules. In a USD/ZiG environment, confirm which exchange rate and rate date each conversion uses. For VAT and tax schedules, AI can help structure workings, but figures must reconcile to the ledger and an accountable person must review every return before submission.',
        },
        {
          type: 'quiz',
          question: 'An AI-generated month-end pack converts ZiG sales into USD. What should you verify first?',
          options: [
            'That the rate and rate date match your accounting policy and source',
            'The font and formatting of the tables',
            'That the AI used the latest rate it could find online',
            'Nothing, provided the totals balance',
          ],
          correctIndex: 0,
          explanation: 'Conversions must follow your accounting policy and a documented rate source. Totals can balance perfectly while using the wrong rate.',
          skillId: 'ai-verification',
        },
        {
          type: 'task',
          title: 'Map one process',
          instructions:
            'Choose one repetitive finance task you do every month. List its steps, mark which ones AI or automation could handle, where a person must review, and what evidence (log, sign-off, reconciliation) would satisfy an auditor.',
          hint: "Start with a task that has clear rules and a clear 'right answer' you can check.",
        },
      ],
    },
  ],
};

// ───────────────────────────── fin-risk (advanced) ─────────────────────────────

const FIN_RISK: ModuleContent = {
  moduleId: 'fin-risk',
  lessons: [
    {
      id: 'fin-risk-l1',
      title: 'How AI flags fraud and anomalies',
      minutes: 12,
      blocks: [
        {
          type: 'explain',
          title: 'How anomaly detection works',
          body: "Fraud detection models learn what normal looks like, such as typical amounts, times, locations, counterparties and patterns, and flag transactions that differ. Some use rules, for example repeated deposits just under a reporting threshold; others use machine-learning risk scores. A flag is a signal to investigate, not proof of fraud.",
          bullets: ['Rules: known red flags', 'Machine learning: unusual patterns', 'Scores: a likelihood, not a verdict'],
        },
        {
          type: 'example',
          title: 'Structuring caught early',
          scenario:
            "Savanna Crest Bank's monitoring system flagged a customer who made eleven cash deposits of just under USD 1,000 across four branches in two days. The analyst reviewed the account, found no business reason on the KYC file, and escalated through the compliance officer under the bank's AML procedures.",
          takeaway: 'AI spots the pattern; trained people decide what it means and act within procedure.',
        },
        {
          type: 'explain',
          title: 'False positives and false negatives',
          body: 'No model is perfect. False positives flag innocent customers, causing blocked payments, frustrated clients and wasted investigation time. False negatives miss real fraud. Tuning a model to catch more fraud usually raises false alarms too, so organisations must choose the balance deliberately and monitor it.',
          bullets: ['False positive: innocent activity flagged', 'False negative: fraud missed', 'Track both, not just the catches'],
        },
        {
          type: 'interactive',
          title: 'Flagged, but not fraud',
          prompt: 'Select every situation that could be flagged as unusual but have a legitimate explanation.',
          mode: 'sort',
          options: [
            { id: 'a', label: 'A tobacco farmer receives a large one-off payment during auction season', correct: true, feedback: 'Yes. Seasonal income spikes are normal in agriculture but look unusual to a model.' },
            { id: 'b', label: 'A company pays salaries early before a public holiday', correct: true, feedback: 'Yes. The timing is unusual but the reason is legitimate.' },
            {
              id: 'c',
              label: 'A dormant account suddenly receives many small transfers from unrelated senders, all withdrawn immediately',
              correct: false,
              feedback: 'This is a classic money-mule pattern. It needs investigation and possible escalation, not a quick dismissal.',
            },
            { id: 'd', label: 'A relative abroad sends a larger remittance than usual for January school fees', correct: true, feedback: 'Yes. Diaspora remittances often peak around school terms.' },
          ],
        },
        {
          type: 'ai-example',
          title: 'Anomalies in your context',
          instruction:
            "For this learner's organisation type in Zimbabwe (bank, microfinance, retailer, mining supplier or similar), give three realistic anomaly patterns an AI monitoring tool might flag. For each, give a legitimate explanation, a fraud explanation and the evidence that would tell them apart. Use fictional details only.",
          fallback: lines(
            'Example: a microfinance lender',
            '1. Repayments for several borrowers from one mobile money number. Legitimate: a group leader paying for a solidarity group. Fraud: a loan officer recycling funds to hide ghost loans. Evidence: group records and borrower confirmation calls.',
            "2. A loan disbursed and fully repaid within a week. Legitimate: a trader's quick turnaround after a good sale. Fraud: testing a stolen identity or laundering funds. Evidence: KYC documents and the source of repayment funds.",
            '3. A spike in new loans at one branch in the last week of the month. Legitimate: a planting-season promotion. Fraud: fictitious loans created to hit targets. Evidence: site visits, customer verification and the approval trail.',
          ),
        },
        {
          type: 'quiz',
          question: 'A model flags a transaction with a 92% fraud risk score. What does this mean?',
          options: [
            'The transaction is definitely fraudulent',
            'The customer should be told they are under suspicion',
            'The model is 92% accurate overall',
            'The pattern closely resembles past fraud and should be investigated',
          ],
          correctIndex: 3,
          explanation: 'A risk score shows how closely activity matches fraud patterns. It prioritises investigation; it does not prove guilt. Customers must never be tipped off.',
          skillId: 'fraud-detection',
        },
      ],
    },
    {
      id: 'fin-risk-l2',
      title: 'Acting on alerts and credit decisions responsibly',
      minutes: 13,
      blocks: [
        {
          type: 'explain',
          title: 'From alert to decision',
          body: "A good alert workflow is consistent and documented. Escalate to compliance where AML rules require it. Never tip off a customer that they are under suspicion, and never close an alert just because the model is 'usually wrong'.",
          bullets: ['Triage by risk', 'Investigate from source records', 'Decide and document the rationale', 'Escalate where required'],
        },
        {
          type: 'explain',
          title: 'Bias in credit and risk models',
          body: 'Credit and risk models can disadvantage groups unfairly, such as informal traders, women without collateral in their own names, or rural borrowers with thin credit histories. This can happen even without using protected characteristics, because location or phone type can act as proxies. Fairness testing, clear reasons and human review of declines are essential.',
        },
        {
          type: 'example',
          title: 'The thin-file problem',
          scenario:
            'Chiedza Microfinance piloted an AI credit score for market vendors. Declines clustered among women trading in Mbare and Sakubva, many with strong mobile money repayment records but no formal bank history. The team added mobile money history as an input, required human review of every decline and now tracks approval rates by gender and location.',
          takeaway: "Test who the model says 'no' to, and why.",
        },
        {
          type: 'interactive',
          title: 'Spot the governance failure',
          prompt: 'Which practice in a fraud and credit team is the biggest governance risk?',
          mode: 'spot-the-risk',
          options: [
            { id: 'a', label: 'False-positive rates are reviewed monthly.', correct: false, feedback: 'Good practice. It keeps the model tuned and customers treated fairly.' },
            {
              id: 'b',
              label: "Applicants declined by the AI score are told only 'the system said no', with no route to appeal.",
              correct: true,
              feedback: 'Correct. People affected by automated decisions need an explanation and a way to challenge them, and a human must be accountable.',
            },
            { id: 'c', label: 'Analysts record a rationale for every cleared alert.', correct: false, feedback: 'Exactly what auditors and regulators expect.' },
            { id: 'd', label: 'Model changes are approved by a risk committee.', correct: false, feedback: 'Sound model governance.' },
          ],
        },
        {
          type: 'ai-example',
          title: 'Writing an alert rationale',
          instruction:
            "Using a fictional, anonymised alert relevant to this learner's organisation type in Zimbabwe, show how AI could help draft a clear, factual investigation note (evidence reviewed, legitimate explanations considered, decision, next steps). Then highlight what the analyst must personally verify and decide.",
          fallback: lines(
            "Anonymised facts given to the approved AI tool: Alert 2291, customer C-4471, retail account. Five incoming transfers totalling USD 18,600 in three days from four senders; funds withdrawn in cash within 24 hours. KYC profile: self-employed hair salon owner, expected monthly turnover USD 2,000.",
            '',
            "AI draft note: 'Activity is inconsistent with the declared profile: three days of inflows exceeded nine months of expected turnover, and rapid cash withdrawal limits traceability. Legitimate explanations considered: sale of salon equipment; family contributions for a funeral. No supporting documents on file. Recommended next step: escalate to the compliance officer.'",
            '',
            "The analyst must personally: check every figure against the transaction records, confirm whether any explanation is documented, decide whether to escalate, and make sure the customer is not tipped off. The decision and sign-off belong to the analyst, not the AI.",
          ),
        },
        {
          type: 'quiz',
          question: 'Your AI credit model declines far more applicants from one province. What is the most responsible first step?',
          options: [
            'Ignore it, because a data-driven model is objective',
            'Investigate whether location or a proxy is driving unfair outcomes, and review the affected declines',
            'Stop lending in that province',
            'Remove human review so decisions stay consistent',
          ],
          correctIndex: 1,
          explanation: 'A skewed outcome is a warning sign. Investigate the drivers, review affected applicants and correct the model or process where it is unfair.',
          skillId: 'bias-awareness',
        },
      ],
    },
  ],
};

// ───────────────────────────── fin-challenge ─────────────────────────────

const FIN_CHALLENGE: ModuleContent = {
  moduleId: 'fin-challenge',
  lessons: [
    {
      id: 'fin-challenge-l1',
      title: 'Challenge briefing: trust, but verify',
      minutes: 6,
      blocks: [
        {
          type: 'explain',
          title: 'Your challenge',
          body: 'You will act as a finance officer reviewing an AI-generated analysis of fictional quarterly results before a board meeting. Your job is neither to reject the AI nor to trust it, but to use it well: prompt clearly, check its conclusions against the data, protect confidential information and produce a recommendation you would sign.',
          bullets: ['Recalculate the key figures', 'Challenge every conclusion', 'Protect data and record AI use', 'Give a clear, verified output'],
        },
        {
          type: 'example',
          title: 'What strong answers do',
          scenario:
            "The strongest submissions recalculate the AI's ratios first, list each unsupported claim with evidence from the data, rewrite the prompt so the errors cannot recur, and end with a short recommendation that clearly separates verified facts from open questions.",
          takeaway: 'Show your verification. Visible checking scores higher than a polished answer.',
        },
        {
          type: 'interactive',
          title: 'Your first move',
          prompt: 'You receive the AI summary and the data table. Which first step is best?',
          mode: 'choose-better',
          options: [
            { id: 'a', label: "Copy the AI's summary into your answer and polish the wording.", correct: false, feedback: 'This passes any AI errors straight to the board under your name.' },
            {
              id: 'b',
              label: 'Recalculate the headline figures from the table and mark each AI claim as supported, wrong or unsupported.',
              correct: true,
              feedback: 'Correct. Independent recalculation is the backbone of verification.',
            },
            { id: 'c', label: 'Ask the AI whether its own summary is correct.', correct: false, feedback: 'The AI cannot independently verify itself. It may simply agree with its earlier answer.' },
          ],
        },
        {
          type: 'quiz',
          question: 'The AI says net profit rose, but your recalculation from the table shows it fell. What should your submission do?',
          options: [
            'Use the AI figure, since it may have data you lack',
            'Average the two figures',
            'Report the recalculated figure, show the working and flag the AI error',
            'Leave profit out of the analysis',
          ],
          correctIndex: 2,
          explanation: 'Your figure is traceable to the source; the AI figure is not. Showing the working and naming the error is exactly what verification looks like.',
          skillId: 'ai-verification',
        },
      ],
    },
  ],
  activity: {
    id: 'fin-challenge-activity',
    title: 'Board briefing: can the AI analysis be trusted?',
    domainId: 'finance',
    scenario:
      "You are a finance officer at Kopje Foods Ltd, a fictional Harare food manufacturer that sells maize meal, cooking oil and snacks through wholesalers and retail chains, invoicing in both USD and ZiG. The CFO needs a one-page briefing for Thursday's board meeting on Q3 performance and on whether to draw a USD 400,000 working-capital loan to expand snack production. A colleague pasted the quarterly figures into an AI tool and received the summary below. The CFO wants to know whether the AI's conclusions can be trusted, and what the board should actually be told.",
    data: lines(
      "Kopje Foods Ltd: quarterly results (USD '000; ZiG sales converted at month-end rates)",
      '                             Q2 2026    Q3 2026',
      'Revenue                        2,400      2,640',
      '  of which snacks                480        600',
      'Cost of sales                  1,680      1,900',
      'Gross profit                     720        740',
      'Operating expenses               430        470',
      '  of which generator fuel         35         62',
      'Finance costs                     40         42',
      'Net profit before tax            250        228',
      'Trade receivables                610        860',
      'Cash at bank                     310        180',
      '',
      'Other notes:',
      '- ZiG share of revenue rose from 20% to 30% in Q3',
      '- Wholesaler W12 owes USD 190k of the receivables, now 120 days overdue',
      '- Maize grain prices rose 9% in August (supplier notice)',
      '- Load-shedding hours increased through Q3',
      '',
      'AI-generated summary:',
      '"Q3 was a strong quarter for Kopje Foods. Revenue grew 10% to USD 2.64m and net profit increased to USD 268k, a net margin of 10.2%. Gross margin held steady at 30%, showing that cost pressures are under control. Snack revenue grew 25%, confirming strong consumer demand, so the proposed USD 400k loan for snack expansion is low-risk and should be approved. Receivables growth is in line with sales growth and is not a concern."',
    ),
    task:
      'Prepare your submission covering: (1) Approach: how you would tackle the analysis. (2) AI use: how you would use AI, including at least one improved prompt. (3) Verification: each error or unsupported conclusion in the AI summary, with your recalculation or evidence. (4) Risks and safeguards: data confidentiality, customer information, currency, audit trail and sign-off. (5) Final output: a board-ready summary of no more than 150 words with your recommendation on the loan and the further information needed.',
    rubric: [
      { criterion: 'Verification & critical thinking', description: "Recalculates key figures and correctly identifies the AI's errors (net profit, gross margin, receivables) and its unsupported loan conclusion, with workings.", weight: 30 },
      { criterion: 'Financial analysis & insight', description: 'Interprets margins, working capital, cash, customer concentration and USD/ZiG currency effects soundly.', weight: 25 },
      { criterion: 'Effective AI use & prompting', description: 'Improved prompt supplies data and currency basis, requires workings and assumptions, and keeps the decision with people.', weight: 15 },
      { criterion: 'Responsible AI & governance', description: 'Protects confidential and customer data, uses approved tools, records AI use and keeps human sign-off on the lending decision.', weight: 15 },
      { criterion: 'Board-ready output', description: 'Clear, concise, accurate summary that separates verified facts from open questions and makes a justified recommendation.', weight: 15 },
    ],
    skillIds: ['domain-finance', 'ai-verification', 'critical-thinking', 'financial-analysis'],
    sampleStrongAnswer: lines(
      'Approach: I recalculated the headline figures from the table first, then tested each AI claim against the data and notes.',
      '',
      "AI use: in the company's approved tool, using customer codes only: 'You are a management accountant. Using only this table (USD thousands), calculate gross and net margin, revenue and receivables growth and debtor days for Q2 and Q3, showing workings. List what the data supports and what it cannot answer. Do not make a lending recommendation.'",
      '',
      'Verification: (1) Net profit fell 8.8% to USD 228k (740 − 470 − 42); it did not rise to 268k. Net margin fell from 10.4% to 8.6%. (2) Gross margin fell from 30.0% to 28.0%, consistent with the 9% maize increase, while generator fuel rose 77%. (3) Receivables rose 41% against 10% sales growth; debtor days rose from about 23 to 30, W12 owes USD 190k at 120 days, and cash fell 42%. (4) "Low-risk, approve" is unsupported: snack growth may partly reflect ZiG conversion and W12 sales, and there is no cash-flow forecast.',
      '',
      'Safeguards: no customer names in prompts; AI output and workings filed; AI assistance disclosed; CFO sign-off.',
      '',
      'Board summary: Q3 revenue grew 10%, but profit fell 8.8% as margins tightened and working capital weakened. Defer the loan until a 12-month cash-flow forecast, a W12 recovery plan and a ZiG sensitivity analysis are reviewed.',
    ),
  },
};

export const FINANCE_CONTENT: ModuleContent[] = [FIN_ANALYSIS, FIN_AUTOMATION, FIN_RISK, FIN_CHALLENGE];
