import type { DomainId } from '../../types';

/**
 * Practical capstone briefs — one per profession.
 *
 * Every brief is a FICTIONAL Zimbabwean workplace scenario with realistic
 * fictional data that contains deliberate problems (incorrect AI conclusions,
 * privacy or fairness issues, security flaws…). The learner must use AI
 * responsibly, verify its output and make a sound professional recommendation.
 * `planted` is the answer key used by the offline evaluator and revealed after
 * submission as learning feedback.
 */

export interface PlantedIssue {
  label: string;
  /** Detected when EVERY group has at least one keyword present in the submission (lower-case substrings). */
  match: string[][];
}

export interface CapstoneBrief {
  domainId: DomainId;
  title: string;
  organisation: string;
  role: string;
  context: string;
  dataTitle: string;
  data: string;
  dataKind: 'table' | 'code' | 'text';
  task: string;
  deliverables: string[];
  planted: PlantedIssue[];
  domainConcepts: string[];
}

// ───────────────────────────── Scoring criteria (transparent, shown upfront) ─────────────────────────────

export type CriterionId = 'approach' | 'aiUsage' | 'domain' | 'verification' | 'critical' | 'responsible' | 'quality';

export const CAPSTONE_CRITERIA: { id: CriterionId; label: string; weight: number; description: string }[] = [
  { id: 'approach', label: 'Approach', weight: 15, description: 'A clear, logical plan: understanding the problem, steps, stakeholders and priorities.' },
  { id: 'aiUsage', label: 'AI usage', weight: 15, description: 'Appropriate, specific use of AI — well-structured prompts with context, constraints and format.' },
  { id: 'domain', label: 'Domain understanding', weight: 15, description: 'Sound professional knowledge of your field applied to the scenario.' },
  { id: 'verification', label: 'Verification', weight: 15, description: 'How you checked AI outputs against the data and trusted sources — and what you caught.' },
  { id: 'critical', label: 'Critical thinking', weight: 15, description: 'Spotting flawed assumptions, missing information and weak conclusions rather than accepting them.' },
  { id: 'responsible', label: 'Responsible AI', weight: 15, description: 'Privacy, fairness and bias, transparency and meaningful human oversight.' },
  { id: 'quality', label: 'Quality of final result', weight: 10, description: 'A clear, actionable, well-justified recommendation or output.' },
];

// ───────────────────────────── Submission sections ─────────────────────────────

export type SectionId = 'approach' | 'aiUse' | 'verification' | 'risks' | 'recommendation';
export type CapstoneSections = Record<SectionId, string>;

export const CAPSTONE_SECTIONS: { id: SectionId; number: number; title: string; helper: string; placeholder: string; minChars: number; maxChars: number }[] = [
  {
    id: 'approach',
    number: 1,
    title: 'Your approach',
    helper: 'How will you tackle this? Describe your steps, who you would involve and what you would prioritise.',
    placeholder: 'First, I would… Then… I would involve… My priority is…',
    minChars: 150,
    maxChars: 4000,
  },
  {
    id: 'aiUse',
    number: 2,
    title: 'How you would use AI (include your prompts)',
    helper: 'Which tasks would AI help with, and which would stay with people? Write out at least one real prompt you would use — with role, context, constraints and output format.',
    placeholder: 'I would use AI to… My prompt: "You are… Context:… Task:… Format:…"',
    minChars: 180,
    maxChars: 4000,
  },
  {
    id: 'verification',
    number: 3,
    title: 'How you verified the AI output',
    helper: 'How would you check the AI’s work against the data and trusted sources? Name any errors, gaps or weak conclusions you found in the scenario.',
    placeholder: 'I checked… against… I found that… is incorrect because…',
    minChars: 150,
    maxChars: 4000,
  },
  {
    id: 'risks',
    number: 4,
    title: 'Risks & safeguards — privacy, bias, human oversight',
    helper: 'What could go wrong for people and the organisation? Cover data privacy, bias and fairness, transparency and who stays accountable.',
    placeholder: 'Privacy: … Bias: … Human oversight: … Transparency: …',
    minChars: 150,
    maxChars: 4000,
  },
  {
    id: 'recommendation',
    number: 5,
    title: 'Final recommendation / output',
    helper: 'Your final professional recommendation or deliverable. Be specific: what should happen, who owns it, by when and how success will be measured.',
    placeholder: 'I recommend… Next steps: 1… 2… 3… Owner… Timeline… Measure…',
    minChars: 150,
    maxChars: 5000,
  },
];

export const emptySections = (): CapstoneSections => ({ approach: '', aiUse: '', verification: '', risks: '', recommendation: '' });

// ───────────────────────────── Briefs ─────────────────────────────

const BRIEFS: CapstoneBrief[] = [
  {
    domainId: 'hr',
    title: 'Fair, AI-assisted recruitment for 40 branch roles',
    organisation: 'Savanna Crest Bank (fictional)',
    role: 'HR Officer — Talent Acquisition',
    context:
      'Savanna Crest Bank must recruit 40 Customer Service Officers for 12 branches within six weeks, and expects around 3,200 applications. A vendor, HireSwift AI (fictional), has proposed an AI screening service and shared the results of a pilot on 400 past applications.\n\nThe vendor proposal: the model scores every CV and automatically rejects the lowest-scoring 80% with no human review. It uses features including age, home suburb, school attended and employment gaps, and was trained on the bank’s hires from the last five years. Candidates’ CVs and national ID copies would be uploaded to the vendor’s servers outside Zimbabwe, and the vendor also offers “culture-fit” scores based on candidates’ public social-media profiles.\n\nThe Head of HR has asked you to recommend whether — and how — the bank should use AI in this recruitment campaign.',
    dataTitle: 'HireSwift AI — pilot on 400 past applications',
    dataKind: 'table',
    data: `Group                         Applicants   Shortlisted   Rate
Harare / Bulawayo                  210            63        30%
Other urban areas                  110            20        18%
Rural areas                         80             5         6%
Women                              190            28        15%
Men                                210            60        29%
Candidates with a career gap        70             3         4%

Vendor claim: "Cuts screening time by 85% and finds the best culture fit."`,
    task: 'Design an AI-assisted recruitment workflow for the campaign and advise the Head of HR on the vendor proposal.',
    deliverables: ['A recommended end-to-end recruitment workflow showing where AI helps and where people decide', 'Your assessment of the pilot results', 'The safeguards the bank must require before using any AI screening'],
    planted: [
      { label: 'Automatic rejection of 80% of applicants with no human review', match: [['automatic', 'auto-reject', 'auto reject', 'no human', 'without human', 'human review', 'human in the loop', 'human oversight', 'reviewed by a person', 'recruiter review']] },
      { label: 'Shortlisting disparities for rural candidates, women and people with career gaps (possible bias)', match: [['rural', 'women', 'gender', 'career gap', 'disparit', 'adverse impact', '6%', '15%']] },
      { label: 'Features such as age, suburb and school act as proxies for discrimination', match: [['age', 'suburb', 'school', 'proxy', 'proxies', 'protected']] },
      { label: 'Uploading CVs and national ID copies to servers outside Zimbabwe (data protection)', match: [['national id', 'id cop', 'outside zimbabwe', 'cross-border', 'cross border', 'data protection', 'offshore', 'data residency']] },
      { label: 'Social-media “culture-fit” scraping is intrusive and unfair', match: [['social media', 'social-media', 'culture fit', 'culture-fit', 'scrap']] },
      { label: 'Training on five years of past hires can repeat historical bias', match: [['historical', 'past hires', 'training data', 'trained on', 'previous hires']] },
    ],
    domainConcepts: ['job description', 'competenc', 'shortlist', 'structured interview', 'interview panel', 'selection criteria', 'assessment', 'candidate experience', 'equal opportunit', 'labour act', 'onboarding', 'time-to-hire', 'diversity', 'reference check', 'job analysis', 'scoring rubric'],
  },
  {
    domainId: 'finance',
    title: 'Check the AI’s quarterly results summary before it reaches the board',
    organisation: 'Marula Mutual Finance (fictional)',
    role: 'Management Accountant',
    context:
      'Marula Mutual Finance is a mid-sized lender. The Finance Director used an AI assistant to draft the Q2 board summary from the management accounts and wants to send it tomorrow. She has asked you to review it, correct anything that is wrong and provide a board-ready commentary with a recommendation.\n\nThe AI summary sounds confident. Your job is to establish whether every conclusion is supported by the numbers.',
    dataTitle: 'Management accounts (USD ’000) and the AI-generated summary',
    dataKind: 'table',
    data: `Line item                       Q1 2026     Q2 2026
Interest income                   1,840       1,910
Fee & commission income             620         540
Total income                      2,460       2,450
Staff costs                         890         960
Other operating costs               610         640
Loan impairment charges             180         320
Total costs                       1,680       1,920
Profit before tax                   780         530
Gross loan book                  14,200      14,900
Non-performing loans (NPLs)         710       1,040

AI-GENERATED SUMMARY (draft)
1. Interest income rose 3.8% quarter-on-quarter, supported by loan-book growth.
2. Total income grew 4% in Q2, driven by strong fee and commission income.
3. Operating costs (staff and other) increased by about 7%.
4. Profit before tax fell from 780 to 530.
5. Asset quality improved in Q2, so the rise in impairments is a one-off and can be ignored.
6. Recommendation: increase Q3 lending targets by 20%.`,
    task: 'Review the AI summary, identify and correct any errors, and produce an accurate board commentary with a responsible recommendation.',
    deliverables: ['A list of statements you verified and those you corrected, with the correct figures', 'A corrected board commentary', 'Your recommendation on the proposed 20% lending increase'],
    planted: [
      { label: 'Statement 2 is wrong: total income fell slightly (−0.4%) and fee income fell about 13%', match: [['total income', 'fee', 'statement 2', 'point 2', 'conclusion 2'], ['fell', 'declin', 'decreas', 'drop', 'lower', 'wrong', 'incorrect', 'did not grow', 'not grow', 'overstat', 'false', 'error']] },
      { label: 'Statement 5 is wrong: NPL ratio worsened from 5.0% to about 7.0% and impairments rose 78%', match: [['asset quality', 'npl', 'non-performing', 'impairment', 'statement 5', 'point 5', 'conclusion 5'], ['worse', 'deteriorat', 'rose', 'increase', '7%', '7.0', 'wrong', 'incorrect', 'not improv', 'not a one-off', 'cannot be ignored', 'should not be ignored', 'false', 'error']] },
      { label: 'Profit before tax fell about 32% — driven mainly by impairments, not a small change', match: [['32', 'profit'], ['impairment', 'fell', 'drop', 'declin']] },
      { label: 'The 20% lending increase is not supported while credit quality is deteriorating', match: [['lending', '20%'], ['risk', 'caution', 'not support', 'reject', 'not justified', 'hold', 'defer', 'review', 'premature', 'against']] },
    ],
    domainConcepts: ['variance', 'ratio', 'npl', 'impairment', 'provision', 'ifrs', 'margin', 'cost-to-income', 'cost to income', 'liquidity', 'reconcil', 'ledger', 'quarter-on-quarter', 'board', 'audit', 'credit risk', 'management accounts', 'percentage'],
  },
  {
    domainId: 'software',
    title: 'Secure and fix an AI-generated payment reconciliation module',
    organisation: 'Bvumba Tech Solutions (fictional)',
    role: 'Software Engineer',
    context:
      'Bvumba Tech Solutions builds a member portal for a fictional savings and credit co-operative. A colleague used an AI coding assistant to write the nightly job that reconciles mobile-money statement rows against the payments table, and opened a pull request that is due to go live on Friday.\n\nThe code runs without errors on the colleague’s test file. Your lead has asked you to review it before it is merged, fix what is wrong and explain how the team should use AI coding assistants safely.',
    dataTitle: 'reconcile.py — AI-generated pull request',
    dataKind: 'code',
    data: `import sqlite3, logging

API_KEY = "live_sk_93hf82hfa7c1e0d4"   # payment gateway key

def reconcile(db, statement_rows, merchant_id):
    matched, unmatched = [], []
    for row in statement_rows:
        ref = row["reference"]
        amount = float(row["amount"])
        query = f"SELECT id, amount FROM payments WHERE ref = '{ref}' AND merchant = '{merchant_id}'"
        record = db.execute(query).fetchone()
        logging.info(f"Checking {row['phone']} {row['member_name']} {ref} {amount}")
        if record and record[1] == amount:
            matched.append(ref)
        elif record and abs(record[1] - amount) < 1:
            matched.append(ref)          # close enough
        else:
            unmatched.append(ref)
    return matched, unmatched

# Statement rows contain USD and ZiG transactions: {"reference","amount","currency","phone","member_name"}`,
    task: 'Review the AI-generated code, identify the security and correctness problems, propose fixes and describe a safe AI-assisted development workflow.',
    deliverables: ['The problems you found, ranked by severity', 'Your corrected approach (code or pseudo-code)', 'The tests and review steps you would add before merging'],
    planted: [
      { label: 'SQL injection — the query is built with an f-string from statement data', match: [['injection', 'parameteri', 'prepared statement', 'placeholder', 'f-string', 'string concaten', 'sanitis', 'sanitiz']] },
      { label: 'Hard-coded live API key committed to source code', match: [['api key', 'api_key', 'secret', 'hard-coded', 'hardcoded', 'hard coded', 'credential'], ['environment', 'vault', 'rotate', 'remove', 'secret manager', 'config', 'never', 'exposed', 'commit']] },
      { label: '“Close enough” tolerance of under 1 hides discrepancies (and float money arithmetic)', match: [['close enough', 'tolerance', '< 1', 'less than 1', 'abs(', 'float', 'decimal', 'rounding', 'cents']] },
      { label: 'Personal data (phone numbers, member names) written to logs', match: [['log', 'logging', 'logged', 'logger'], ['phone', 'name', 'personal', 'pii', 'mask', 'privacy', 'sensitive']] },
      { label: 'Currency (USD vs ZiG) and duplicate references are not checked', match: [['currency', 'zig', 'usd', 'duplicate', 'idempot']] },
    ],
    domainConcepts: ['parameteri', 'unit test', 'test case', 'code review', 'pull request', 'decimal', 'idempot', 'edge case', 'logging', 'environment variable', 'static analysis', 'owasp', 'ci', 'linter', 'transaction', 'exception', 'integration test', 'least privilege'],
  },
  {
    domainId: 'management',
    title: 'The AI says “close the Chinhoyi branch” — should you?',
    organisation: 'Kopje Hardware & Building Supplies (fictional)',
    role: 'Regional Operations Manager',
    context:
      'Kopje Hardware operates six branches. The Managing Director asked an AI assistant to analyse FY2025 branch performance, and it recommends closing the Chinhoyi branch immediately. The MD wants your recommendation for Monday’s executive meeting.\n\nThe AI was given only the branch performance table. You also have an email from the regional manager with additional information.',
    dataTitle: 'Data given to the AI, its recommendation, and the regional manager’s email',
    dataKind: 'table',
    data: `Branch performance FY2025 (USD ’000)
Branch        Revenue   Operating cost   Profit   Staff
Harare CBD     2,950        2,210          740      24
Bulawayo       2,100        1,650          450      18
Mutare         1,380        1,120          260      12
Gweru          1,150          960          190      10
Masvingo         990          860          130       9
Chinhoyi         610          680          -70       8

AI RECOMMENDATION: "Close Chinhoyi immediately. It is the only loss-making
branch; closing it will raise group profit by USD 70,000."

EMAIL FROM THE REGIONAL MANAGER
- Chinhoyi opened in March 2025, so FY2025 covers only ~9 months of trading;
  monthly revenue has grown about 11% per month since opening.
- It hosts the regional warehouse that supplies Mutare and Gweru; its cost
  line includes about USD 150,000 of shared logistics costs.
- About 35% of its revenue comes from two contractors on a rural housing project.
- Retrenching the 8 staff would cost an estimated USD 48,000.`,
    task: 'Evaluate the AI recommendation and give the MD a sound, responsible recommendation on the future of the Chinhoyi branch.',
    deliverables: ['Your assessment of the AI analysis and what it missed', 'Options considered with their trade-offs', 'A clear recommendation with next steps and how you would measure success'],
    planted: [
      { label: 'Only ~9 months of trading — a new branch still ramping up', match: [['9 months', 'nine months', 'partial year', 'opened in march', 'new branch', 'ramp', 'growing', 'growth', '11%']] },
      { label: 'Shared warehouse/logistics costs are allocated to Chinhoyi (it serves other branches)', match: [['warehouse', 'shared', 'allocat', 'logistics', '150']] },
      { label: 'Closing it would not simply add USD 70,000 — retrenchment and supply impacts', match: [['70', 'retrench', '48', 'cost of closing', 'closure cost'], ['not', 'cost', 'ignore', 'miss', 'wrong', 'overstat', 'impact']] },
      { label: 'Staff, customers and contractor relationships are affected', match: [['staff', 'employee', 'customer', 'contractor', 'housing project', 'community']] },
      { label: 'The AI used incomplete data — the decision needs human judgement and governance', match: [['incomplete', 'missing', 'only given', 'limited data', 'did not have', 'not given', 'partial data', 'lacked']] },
    ],
    domainConcepts: ['stakeholder', 'strategy', 'scenario', 'sensitivity', 'payback', 'kpi', 'governance', 'board', 'communication', 'change management', 'options', 'turnaround', 'review period', 'contribution', 'break-even', 'break even', 'executive', 'trade-off'],
  },
  {
    domainId: 'customer-service',
    title: 'Handle a complaint surge after a fibre outage — with AI, safely',
    organisation: 'Kariba Connect (fictional internet provider)',
    role: 'Customer Service Team Leader',
    context:
      'A major fibre outage in Bulawayo has generated 1,850 complaints in 48 hours. Queues are over two hours long and social media is getting heated. Marketing has used AI to draft a bulk reply to be sent by the chatbot to every customer who complains.\n\nEngineering says the cause is still under investigation and estimates restoration in 24–36 hours. Company policy is a pro-rata credit for days without service; business customers receive credits according to their service-level agreements.',
    dataTitle: 'Complaint breakdown and the AI-drafted chatbot reply',
    dataKind: 'text',
    data: `Complaints received (48 hours)          Count
Service outage — home fibre              1,120
Service outage — business lines            310
Billing: charged during outage             260
Requests for compensation                  120
Threats to cancel / switch provider         40
Total                                    1,850

AI-DRAFTED BULK REPLY (proposed for the chatbot)
"Dear Customer, we apologise for the outage caused by vandalism of our cables.
All customers will receive a full refund for March. To process your refund,
reply with your full name, national ID number and account password.
Service will be fully restored within 2 hours."`,
    task: 'Plan how your team will use AI to manage the complaint surge, fix the proposed reply, and protect customers and service quality.',
    deliverables: ['A corrected customer message', 'How AI and human agents will share the workload, including escalation rules', 'The safeguards and quality checks you will put in place'],
    planted: [
      { label: 'Never ask customers for passwords or ID numbers by chat — a security and privacy failure (phishing risk)', match: [['password', 'id number', 'national id', 'phishing'], ['never', 'remove', 'not ask', "don't ask", 'do not ask', 'security', 'privacy', 'risk', 'wrong']] },
      { label: '“Vandalism” is an unconfirmed cause', match: [['vandalism', 'cause', 'unconfirmed', 'not confirmed', 'speculat', 'under investigation']] },
      { label: 'A “full refund” contradicts the pro-rata credit policy', match: [['full refund', 'pro-rata', 'pro rata', 'policy', 'credit']] },
      { label: 'The “2 hours” restoration promise contradicts engineering’s 24–36 hour estimate', match: [['2 hours', 'two hours', '24', '36', 'restoration', 'eta', 'timeline', 'overpromis']] },
      { label: 'Business lines and vulnerable customers need priority human handling', match: [['business', 'vulnerable', 'priority', 'sla', 'escalat']] },
    ],
    domainConcepts: ['empathy', 'escalation', 'sla', 'first contact resolution', 'csat', 'knowledge base', 'tone', 'channel', 'whatsapp', 'ticket', 'triage', 'callback', 'queue', 'hand-over', 'handover', 'status page', 'quality assurance', 'script'],
  },
  {
    domainId: 'operations',
    title: 'Should Line 2 move to 8-weekly maintenance as the AI suggests?',
    organisation: 'Mukuvisi Packaging Ltd (fictional)',
    role: 'Operations & Maintenance Planner',
    context:
      'Mukuvisi Packaging makes plastic packaging for food and beverage clients. A new beverage client is expected to increase demand by 35% from May. An AI analytics tool reviewed six months of Line 2 data and recommends doubling the preventive-maintenance interval to free up production time.\n\nThe Plant Manager likes the idea and has asked you to evaluate the recommendation and propose a maintenance and capacity plan.',
    dataTitle: 'Extruder Line 2 — October to March, and the AI recommendation',
    dataKind: 'table',
    data: `Metric                              Value
Average line utilisation            61%  (load-shedding ~9 h/day)
Unplanned stoppages                 3   (all bearing-related)
Planned maintenance                 every 4 weeks, 6 hours each
Mean time between failures          540 operating hours
Manufacturer guidance               service every 500 operating hours
                                    or 6 weeks, whichever comes first
AI demand forecast                  +35% from May (new beverage client)

AI RECOMMENDATION: "Extend planned maintenance to every 8 weeks. Failures are
rare (only 3 in six months), so longer intervals will cut maintenance downtime
by 50% and support the 35% demand increase."`,
    task: 'Evaluate the AI recommendation and propose a safe, practical maintenance and capacity plan for Line 2.',
    deliverables: ['Your assessment of the AI recommendation and its assumptions', 'A proposed maintenance plan', 'Risks, safeguards and how you will monitor results'],
    planted: [
      { label: 'Data reflects only 61% utilisation during load-shedding — not representative of higher future demand', match: [['61', 'utilisation', 'utilization', 'load-shedding', 'load shedding', 'representative', 'operating hours', 'running hours']] },
      { label: '8 weeks conflicts with the manufacturer’s 500-hour / 6-week guidance (and possibly warranty)', match: [['manufacturer', 'oem', '500', '6 weeks', 'six weeks', 'warranty']] },
      { label: 'All three stoppages were bearing-related — a pattern needing root-cause analysis', match: [['bearing', 'root cause', 'root-cause']] },
      { label: 'Higher demand increases wear — more running hours mean maintenance is needed sooner, not later', match: [['35', 'demand', 'more hours', 'higher utilisation', 'increased load', 'wear'], ['sooner', 'more frequent', 'increase', 'wear', 'risk', 'failure']] },
      { label: 'Safety and quality risks of running equipment longer between services', match: [['safety', 'lockout', 'injur', 'hazard', 'quality']] },
    ],
    domainConcepts: ['preventive', 'predictive', 'condition monitoring', 'mtbf', 'oee', 'downtime', 'spares', 'root cause', 'vibration', 'sop', 'shift', 'capacity', 'throughput', 'kpi', 'work order', 'cmms', 'lubrication', 'inspection'],
  },
  {
    domainId: 'marketing',
    title: 'Fix an AI-generated launch campaign before it goes live',
    organisation: 'Mazowe Fresh Juices (fictional)',
    role: 'Marketing Officer',
    context:
      'Mazowe Fresh Juices is launching “Mazowe Zero”, a low-sugar juice, with a budget of USD 18,000. Your manager used AI to create the launch campaign plan and wants to approve it this week. She has asked you to review it and produce a campaign plan the company can confidently run.',
    dataTitle: 'AI-generated campaign plan — “Mazowe Zero” launch',
    dataKind: 'text',
    data: `Budget: USD 18,000
Audience: urban adults 18–35. "Rural customers excluded — low value."
Key message: "Clinically proven to lower blood sugar. Doctor-recommended."

Channels & budget
  Social media ads ........................ USD 7,500
  WhatsApp blast to 50,000 purchased numbers  USD 2,000
  Radio (Shona & Ndebele) ................. USD 4,000
  School tuck-shop sampling ............... USD 3,500
  Influencers ............................. USD 3,000
  Total ................................... USD 18,000

Projected result: "200% sales uplift in 3 months."`,
    task: 'Review the AI campaign plan, fix its problems and produce a responsible, effective launch plan within budget.',
    deliverables: ['The issues you found in the AI plan', 'Your revised audience, message and channel plan within USD 18,000', 'How you will measure results and test the campaign'],
    planted: [
      { label: 'Unsubstantiated health claims (“clinically proven”, “doctor-recommended”)', match: [['clinically', 'health claim', 'doctor', 'blood sugar', 'substantiat', 'misleading']] },
      { label: 'The channel budget actually adds up to USD 20,000, not 18,000', match: [['20,000', '20 000', '20000', '20k', 'add up', 'adds up', 'overspend', 'over budget', 'miscalculat', '2,000 over']] },
      { label: 'Messaging to 50,000 purchased numbers without consent', match: [['purchased', 'consent', 'opt-in', 'opt in', 'spam', 'bought']] },
      { label: 'Sampling in school tuck-shops targets children', match: [['school', 'children', 'minors', 'tuck']] },
      { label: 'Excluding rural customers as “low value” is an unsupported, biased assumption', match: [['rural'], ['exclu', 'low value', 'bias', 'assumption', 'unfair', 'include']] },
      { label: 'The “200% uplift” projection has no baseline or evidence', match: [['200%', 'uplift', 'projection', 'unrealistic', 'baseline']] },
    ],
    domainConcepts: ['target audience', 'segment', 'positioning', 'brand', 'kpi', 'conversion', 'a/b', 'reach', 'engagement', 'roi', 'funnel', 'message testing', 'persona', 'channel mix', 'cost per', 'awareness', 'advertising standards', 'campaign'],
  },
  {
    domainId: 'agriculture',
    title: 'Stress-test an AI season plan for 1,200 smallholder farmers',
    organisation: 'Mhondoro Growers Co-operative (fictional)',
    role: 'Agricultural Extension & Advisory Officer',
    context:
      'The co-operative has 1,200 members farming an average of 1.8 hectares in Natural Region IV (450–650 mm of rainfall a year). The board asked an AI tool for a season plan, and it produced the recommendation below. The chairperson wants to send it to all members next week and has asked you to review it first.',
    dataTitle: 'Co-operative profile and the AI season plan',
    dataKind: 'text',
    data: `Co-operative profile
- 1,200 members · average 1.8 ha · Natural Region IV (450–650 mm/year)
- Seasonal outlook (fictional summary): below-normal rainfall, late onset of rains
- Member phones: 38% smartphones, 62% basic phones; most prefer Shona

AI SEASON PLAN (generated from a public dataset of Mashonaland Central farms)
- Plant long-season hybrid maize "SC-X" on all plots on 15 November
- Expected yield: 6.5 t/ha
- Fertiliser: 400 kg/ha Compound D + 300 kg/ha AN at USD 18 per 50 kg bag
- Send the plan to members through the co-op's smartphone app (English only)`,
    task: 'Evaluate the AI season plan and produce practical, responsible advice for the co-operative’s members.',
    deliverables: ['What the AI plan gets wrong or leaves out', 'Your recommended season plan', 'How you will communicate advice to members and check it works'],
    planted: [
      { label: 'Plan is based on data from a different, higher-rainfall region (Mashonaland Central vs Region IV)', match: [['mashonaland', 'region iv', 'different region', 'another region', 'high-rainfall', 'higher rainfall', 'dataset']] },
      { label: 'Ignores the below-normal rainfall and late-onset forecast', match: [['forecast', 'below-normal', 'below normal', 'late onset', 'drought', 'el nino', 'el niño', 'dry']] },
      { label: 'A single long-season variety is high risk — consider drought-tolerant, short-season or small grains and staggered planting', match: [['drought-tolerant', 'drought tolerant', 'short-season', 'short season', 'sorghum', 'millet', 'small grain', 'divers', 'stagger']] },
      { label: '6.5 t/ha is unrealistic for Region IV smallholders', match: [['6.5', 't/ha', 'yield'], ['unrealistic', 'too high', 'overestimat', 'not realistic', 'optimistic', 'unlikely']] },
      { label: '62% of members use basic phones and prefer Shona — an English-only app excludes most', match: [['basic phone', 'sms', 'shona', 'language', 'voice', 'radio', 'feature phone', '62%']] },
      { label: 'Fertiliser rates and prices are unverified and may be unaffordable', match: [['fertiliser', 'fertilizer', 'price', 'cost', 'afford', 'input']] },
    ],
    domainConcepts: ['extension', 'conservation agriculture', 'pfumvudza', 'soil', 'moisture', 'agronomy', 'input', 'market', 'harvest', 'pest', 'fall armyworm', 'ground-truth', 'ground truth', 'crop insurance', 'rainfall', 'planting window', 'field day', 'lead farmer'],
  },
  {
    domainId: 'healthcare',
    title: 'Evaluate an AI triage pilot at a busy community clinic',
    organisation: 'Hillside Community Clinic (fictional)',
    role: 'Clinic Nurse Manager',
    context:
      'Hillside Community Clinic sees about 180 patients a day, and average waiting times exceed four hours. A vendor ran a two-week pilot of an AI symptom-checker at reception that rates patients’ urgency and sends “low-risk” patients home with self-care advice without seeing a nurse. The vendor also proposes automated appointment-reminder SMS messages and uploading patient records to its cloud platform to “improve the model”.\n\nThe district health team has asked for your recommendation on whether to adopt the system.',
    dataTitle: 'Two-week AI triage pilot results',
    dataKind: 'table',
    data: `Pilot metric                                   Value
Patients triaged by AI                         1,240
Rated "low risk — self-care, go home"            410
  of whom returned within 72 hours                37
  of whom later needed admission                   6  (incl. 2 children with pneumonia)
Average waiting time                           4.1 h → 2.6 h
Languages supported by the tool                English only

Proposed reminder SMS:
"Hi Tendai, your HIV viral load review is due on 14 May at Hillside Clinic."

Vendor request: upload full patient records to its cloud platform (no de-identification).`,
    task: 'Assess the pilot and recommend whether and how the clinic should use AI in triage and patient communication, keeping patients safe.',
    deliverables: ['Your assessment of the pilot’s benefits and harms', 'A safe workflow for any AI use, including clinical oversight', 'Your recommendation and the safeguards required'],
    planted: [
      { label: 'Under-triage: 6 “low-risk” patients needed admission, including 2 children with pneumonia', match: [['admission', 'admitted', 'pneumonia', 'under-triage', 'undertriage', 'missed', 'returned', 'false negative', 'patient safety']] },
      { label: 'The reminder SMS discloses an HIV diagnosis (confidentiality and stigma)', match: [['hiv', 'diagnosis', 'viral load'], ['sms', 'message', 'confidential', 'stigma', 'disclos', 'privacy', 'reminder']] },
      { label: 'Patients sent home without seeing a nurse — clinicians must stay in the loop', match: [['nurse', 'clinician', 'clinical oversight', 'human', 'without seeing']] },
      { label: 'English-only tool excludes many patients', match: [['english only', 'english-only', 'shona', 'ndebele', 'language']] },
      { label: 'Uploading identifiable records to a vendor cloud needs consent, de-identification and a data agreement', match: [['de-identif', 'deidentif', 'anonymi', 'consent', 'data protection', 'data sharing', 'data-sharing', 'cloud', 'vendor']] },
    ],
    domainConcepts: ['triage', 'clinical', 'protocol', 'patient safety', 'audit', 'consent', 'record', 'confidential', 'escalat', 'quality improvement', 'incident', 'ethics', 'vital signs', 'paediatric', 'pediatric', 'referral', 'guideline', 'monitoring'],
  },
  {
    domainId: 'education',
    title: 'Review AI-generated revision notes and an AI marking plan',
    organisation: 'Msasa Park Secondary School (fictional)',
    role: 'Head of Science Department',
    context:
      'The school head wants to save teachers time. She has approved AI-generated Form 4 Biology revision notes for 140 learners and proposed an AI-assisted marking plan for coursework. Before anything is shared with learners, she has asked you, as Head of Science, to review both and recommend how the department should use AI.',
    dataTitle: 'AI revision notes (extract) and the proposed marking plan',
    dataKind: 'text',
    data: `AI-GENERATED REVISION NOTES — Form 4 Biology: Human Circulation (extract)
1. The heart has four chambers: two atria and two ventricles.
2. The right ventricle pumps oxygenated blood to the body through the aorta.
3. Veins carry blood towards the heart and have valves to prevent backflow.
4. Red blood cells contain haemoglobin, which carries oxygen.
5. The pulmonary artery carries oxygenated blood from the lungs to the heart.

PROPOSED AI MARKING PLAN
- AI grades all 140 coursework essays; teachers only check the top 10.
- Any essay scoring above 60% on "AIDetect" receives zero for suspected AI use.
- Upload the class list (names, candidate numbers, marks) to a free AI tool
  to generate report-card comments.`,
    task: 'Review the notes and marking plan, correct what is wrong, and design a responsible way for the department to use AI in teaching and assessment.',
    deliverables: ['Corrections to the revision notes', 'Your revised marking and feedback workflow', 'A short department guideline for AI use'],
    planted: [
      { label: 'Statement 2 is wrong: the LEFT ventricle pumps oxygenated blood through the aorta', match: [['left ventricle', 'statement 2', 'point 2', 'note 2', 'number 2']] },
      { label: 'Statement 5 is wrong: the pulmonary artery carries deoxygenated blood to the lungs; the pulmonary vein returns oxygenated blood', match: [['pulmonary vein', 'deoxygenated', 'statement 5', 'point 5', 'note 5', 'number 5']] },
      { label: 'AI detectors are unreliable — automatic zeros would be unfair (false positives)', match: [['detector', 'aidetect', 'false positive', 'unreliable'], ['unfair', 'unreliable', 'false', 'not', 'wrong', 'zero', 'penal']] },
      { label: 'Teachers checking only the top 10 essays is not meaningful oversight — moderation is needed', match: [['moderat', 'sample', 'all essays', 'teacher review', 'teachers review', 'top 10', 'human', 'oversight']] },
      { label: 'Uploading learners’ names, candidate numbers and marks to a free tool breaches privacy', match: [['name', 'candidate number', 'class list', 'learner data', 'student data'], ['privacy', 'anonymi', 'consent', 'free tool', 'data protection', 'confidential', 'remove']] },
    ],
    domainConcepts: ['syllabus', 'curriculum', 'learning outcome', 'differentiat', 'formative', 'summative', 'moderation', 'rubric', 'feedback', 'academic integrity', 'lesson plan', 'assessment', 'marking scheme', 'misconception', 'parents', 'guardian', 'learner'],
  },
  {
    domainId: 'data-analytics',
    title: 'Verify an AI analysis of loyalty data before it drives decisions',
    organisation: 'Mopane Retail Group (fictional)',
    role: 'Data Analyst',
    context:
      'Mopane Retail Group runs nine supermarkets. The commercial director asked an AI analytics assistant to analyse six months of loyalty-card transactions, and it produced the findings below. The director plans to present them to the board and act on the recommendations. She has asked you to verify the analysis and prepare the insights and recommendations the board should actually see.',
    dataTitle: 'Dataset description and the AI analysis output',
    dataKind: 'text',
    data: `DATASET: loyalty_transactions.csv (Jan–Jun 2026) — 186,400 rows
Columns: txn_id, store, date, customer_name, phone, loyalty_member (Y/N),
         basket_usd, line_items (joined from basket_items table)
Known issue: Chinhoyi and Kadoma stores' POS data missing for March (system outage)
Finance-reported revenue Jan–Jun: USD 8.72m

AI ANALYSIS OUTPUT
1. Total revenue Jan–Jun: USD 9.84m.
2. Loyalty members spend 38% more per basket. "The loyalty programme causes
   higher spending — expand it to all stores and double the points."
3. March revenue fell 14% across the group. "Demand is weakening — reduce stock
   orders by 15%."
4. Top 20 customers by spend (names and phone numbers attached) for a
   marketing campaign.`,
    task: 'Verify the AI analysis, correct it and present sound insights and recommendations to the board.',
    deliverables: ['Which AI findings are wrong or unsupported, and why', 'Your corrected analysis approach and key insights', 'Recommendations for the board, including data safeguards'],
    planted: [
      { label: 'Revenue of USD 9.84m does not reconcile to finance’s 8.72m — likely duplicated rows from the line-items join', match: [['9.84', '8.72', 'reconcil', 'duplicat', 'join', 'double count', 'double-count', 'inflat', 'mismatch']] },
      { label: 'Correlation is not causation — loyalty members may already be higher spenders', match: [['causation', 'correlation', 'selection bias', 'self-select', 'confound', 'causal']] },
      { label: 'March “decline” is caused by missing data from two stores, not weak demand', match: [['missing', 'outage', 'chinhoyi', 'kadoma', 'incomplete', 'data gap']] },
      { label: 'Sharing named customers with phone numbers for marketing raises privacy and consent issues', match: [['name', 'phone', 'personal', 'pii', 'customer data'], ['privacy', 'anonymi', 'consent', 'remove', 'data protection', 'confidential', 'mask']] },
      { label: 'Cutting stock orders by 15% based on a data artefact could cause stock-outs', match: [['stock', 'order'], ['15%', 'cut', 'reduc', 'stock-out', 'stockout', 'shortage', 'artefact', 'artifact', 'not weak', 'premature']] },
    ],
    domainConcepts: ['sql', 'query', 'dashboard', 'visualis', 'visualiz', 'kpi', 'cohort', 'segment', 'significan', 'sample', 'control group', 'data quality', 'cleaning', 'validation', 'a/b', 'baseline', 'distinct', 'group by', 'aggregate'],
  },
];

export const CAPSTONE_BRIEFS: Record<DomainId, CapstoneBrief> = Object.fromEntries(BRIEFS.map((b) => [b.domainId, b])) as Record<DomainId, CapstoneBrief>;

export const getCapstoneBrief = (domainId: DomainId): CapstoneBrief => CAPSTONE_BRIEFS[domainId] ?? CAPSTONE_BRIEFS.operations;

export const CAPSTONE_MINUTES = '60–90 minutes';
