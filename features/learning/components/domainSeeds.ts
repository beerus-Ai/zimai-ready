import type { DomainId } from '../../../types';

/**
 * Fictional, Zimbabwe-grounded workplace seeds per learning domain.
 * Used by the deterministic fallbacks (generated lessons, practical activities,
 * "explain it differently", offline tutor). All organisations and people are fictional.
 */
export interface DomainSeed {
  org: string;
  task: string; // typical AI-assisted task, lower-case phrase ("drafting month-end variance commentary")
  source: string; // what outputs should be verified against
  example: { scenario: string; takeaway: string };
  analogy: string;
  risk: string;
  activity: { title: string; scenario: string; data: string; task: string; sample: string };
}

export const DOMAIN_SEEDS: Record<DomainId, DomainSeed> = {
  finance: {
    org: 'Msasa Hardware Holdings',
    task: 'drafting month-end variance commentary',
    source: 'the general ledger, bank statements and your reconciliations',
    example: {
      scenario:
        'At Msasa Hardware Holdings, an accountant pastes an anonymised trial-balance summary into an AI assistant and asks for variance commentary. The draft reads well, but it explains a 14% rise in fuel costs as "higher pump prices" — the ledger shows a one-off generator purchase during load-shedding.',
      takeaway: 'AI drafts fast; you check every number and explanation against the ledger before it reaches management.',
    },
    analogy: 'Think of AI as a very fast junior clerk: excellent at a first draft, but you still review the working and sign off.',
    risk: 'figures or explanations that do not reconcile to the ledger',
    activity: {
      title: 'Branch Revenue Variance Commentary',
      scenario:
        'You are an accountant at Msasa Hardware Holdings (fictional). The finance manager wants a short Q3 revenue variance commentary for the board pack by tomorrow. You decide to use an AI assistant to speed up the first draft.',
      data: `Branch       | Q2 Revenue (USD) | Q3 Revenue (USD) | Change
-------------|------------------|------------------|--------
Harare CBD   | 182,400          | 171,900          | -5.8%
Bulawayo     |  96,300          | 104,800          | +8.8%
Mutare       |  58,700          |  49,200          | -16.2%
Gweru        |  41,900          |  43,100          | +2.9%
Note: Mutare closed for 9 trading days in August for refurbishment.
AI draft (excerpt): "Mutare's decline reflects weakening customer demand in the Eastern region."`,
      task: 'Explain how you would use AI to produce the commentary. Include your prompt, what you would keep from the AI draft, what you checked or corrected (with figures), how you protected confidential information, and your final recommendation to the finance manager.',
      sample:
        'Prompt: "You are a management accountant. Using ONLY the table below, draft five bullet points of Q3 revenue variance commentary for a board pack. Flag anything you are unsure about." Before pasting, I removed customer and supplier names and used an approved AI tool. I kept the AI points on Bulawayo (+8.8%) and Gweru (+2.9%). I corrected the claim that Mutare fell because of weaker demand — the note shows the branch was closed for 9 trading days, so the -16.2% is mainly a timing issue. I recalculated every percentage in Excel, e.g. (49,200 - 58,700) / 58,700 = -16.2%, and checked totals to the ledger. Recommendation: report Mutare as a one-off closure impact, monitor its Q4 recovery, and investigate the Harare CBD decline. The finance manager reviews and approves the commentary before it goes to the board.',
    },
  },
  hr: {
    org: 'Mukuvisi Building Society',
    task: 'shortlisting applicants and drafting job adverts',
    source: 'the approved job profile, HR policy and the original CVs',
    example: {
      scenario:
        'An HR officer at Mukuvisi Building Society asks an AI tool to rank 60 CVs for a Relationship Officer role. The shortlist arrives in seconds, but every applicant with a career break is ranked low — the tool learned to prefer unbroken employment histories.',
      takeaway: 'Set fair, job-related criteria, check shortlists for patterns of bias and keep a human accountable for every hiring decision.',
    },
    analogy: 'AI is like a new recruitment assistant who has read thousands of CVs but never met your candidates — useful, but you must check their judgement.',
    risk: 'unfair or biased decisions about candidates and employees',
    activity: {
      title: 'Reviewing an AI-Assisted Shortlist',
      scenario:
        'You are an HR officer at Mukuvisi Building Society (fictional). A vendor AI tool has scored applicants for a Relationship Officer vacancy. Your manager wants to invite the top three to interview this week.',
      data: `Candidate | Experience | Qualification             | AI score | AI comment
----------|------------|---------------------------|----------|---------------------------------------
C-101     | 2 yrs      | BCom Banking              | 91%      | "Recent graduate, energetic"
C-102     | 14 yrs     | Diploma in Banking        | 58%      | "Overqualified, may expect high salary"
C-103     | 6 yrs      | BCom Marketing            | 84%      | "Strong sales record"
C-104     | 9 yrs      | BSc Economics             | 62%      | "Career gap 2021-2022"
C-105     | 3 yrs      | BCom Banking (part-time)  | 77%      | "Studied part-time, lower commitment?"`,
      task: 'Review the AI-assisted shortlist. Identify any risks of bias or unfairness, explain how you would verify the scores, how you would protect applicant data, and propose a fair, human-led shortlisting process.',
      sample:
        'The AI comments reveal bias: C-102 is marked down as "overqualified", C-104 for a career gap (which may relate to illness or caregiving) and C-105 because part-time study is treated as low commitment — none of these are job-related criteria. I would not accept the ranking. I would re-score all five against the published criteria (banking experience, customer skills, qualifications) using a structured scoring sheet, and ask a second HR colleague to score independently, then compare. Before any AI use I would remove names, ages, photos and contact details, and only use an approved tool, in line with the Cyber and Data Protection Act. The AI can help summarise CVs, but the interview panel makes and documents the shortlist decision, and we would review outcomes by gender and age for fairness.',
    },
  },
  marketing: {
    org: 'Chimanimani Fresh Foods',
    task: 'drafting campaign copy and social media posts',
    source: 'product specifications, approved brand claims and campaign data',
    example: {
      scenario:
        'A marketing officer at Chimanimani Fresh Foods uses AI to write social posts for a new mango juice. The copy is catchy, but it claims the juice "boosts immunity" — a health claim the company cannot support.',
      takeaway: 'AI speeds up content; you check claims, brand voice and audience fit before anything is published.',
    },
    analogy: 'AI is like a talented copywriter on their first day: lots of ideas, but they do not yet know your brand rules or what you can legally claim.',
    risk: 'unsupported claims or off-brand messages reaching customers',
    activity: {
      title: 'Reallocating a Campaign Budget with AI',
      scenario:
        'You are a marketing officer at Chimanimani Fresh Foods (fictional). Last month’s launch campaign for a mango juice ran across four channels. Your manager asks how to split next month’s USD 4,300 budget and wants one sample post.',
      data: `Channel        | Spend (USD) | Reach    | Clicks | Sales attributed
---------------|-------------|----------|--------|-----------------
Facebook       | 1,200       | 84,000   | 2,310  | 146
WhatsApp list  |   300       |  6,500   | 1,020  | 188
Local radio    | 2,000       | 150,000* | n/a    |  95 (promo code)
Instagram      |   800       | 41,000   | 1,190  |  52
* estimated listenership
AI draft post: "Our mango juice boosts immunity and is the healthiest drink in Zimbabwe!"`,
      task: 'Use AI to help recommend next month’s budget split and draft one post. Explain your prompt, the analysis you verified (show cost per sale), any claims you removed, how you handled customer data, and your final recommendation.',
      sample:
        'I prompted: "Act as a marketing analyst. Using only this table, calculate cost per attributed sale per channel and suggest a budget split for USD 4,300, stating assumptions." I checked the maths myself: WhatsApp USD 1.60 per sale (300/188), Facebook 8.22, Instagram 15.38, radio 21.05. Radio reach is only an estimate and promo codes under-count sales, so I treated that result with caution rather than cutting radio completely. Recommendation: WhatsApp 900, Facebook 1,500, radio 1,400, Instagram 500, then review weekly. I removed the AI’s "boosts immunity" and "healthiest in Zimbabwe" claims because we cannot prove them. The WhatsApp list is opted-in customer data, so I never pasted phone numbers into the AI tool. My manager approves the final plan and post.',
    },
  },
  software: {
    org: 'Zambezi Pay',
    task: 'writing, reviewing and testing code with an AI assistant',
    source: 'tests, documentation, code review and security scanners',
    example: {
      scenario:
        'A developer at Zambezi Pay, a fictional mobile-wallet start-up, accepts an AI-suggested database query. It works in testing — but it builds SQL by joining strings, leaving the wallet API open to SQL injection.',
      takeaway: 'Treat AI-generated code like a pull request from a stranger: review it, test it and scan it before it ships.',
    },
    analogy: 'An AI coding assistant is like a keen pair-programmer who types very fast but never runs the tests — you are still the engineer in charge.',
    risk: 'insecure or subtly wrong code reaching production',
    activity: {
      title: 'Reviewing AI-Suggested Wallet API Code',
      scenario:
        'You are a developer at Zambezi Pay (fictional). A colleague used an AI assistant to write a wallet-lookup endpoint and wants to merge it today before a product demo.',
      data: `// AI-suggested endpoint (Node.js / Express)
app.get('/api/wallet', async (req, res) => {
  const phone = req.query.phone;
  const rows = await db.query(
    "SELECT * FROM wallets WHERE phone = '" + phone + "'"
  );
  console.log('Wallet lookup', phone, rows);
  res.json(rows);
});`,
      task: 'Review this AI-suggested code before it is merged. Identify the security, privacy and correctness problems, explain how you would verify the fix (tests, review, AI use), and propose improved code or steps.',
      sample:
        'Problems: (1) SQL injection — the query concatenates user input; use a parameterised query: db.query("SELECT id, balance, currency FROM wallets WHERE phone = $1", [phone]). (2) No authentication or authorisation — any caller can read any wallet; require a session token and check the wallet belongs to the user. (3) SELECT * returns every column, possibly PINs or KYC data — return only needed fields. (4) console.log writes phone numbers and balances to logs — a privacy breach; log a request ID instead. (5) No input validation or error handling. Verification: I would ask the AI to explain its code and list risks, but not trust it blindly; write unit tests including an injection string (\' OR 1=1 --), run a SAST scanner, and require a human code review before merge. I would not paste real customer data into the AI tool.',
    },
  },
  'customer-service': {
    org: 'Kariba Connect',
    task: 'drafting replies to customer queries and complaints',
    source: 'the knowledge base, account records and current service notices',
    example: {
      scenario:
        'An agent at Kariba Connect, a fictional internet provider, uses AI to reply to an outage complaint. The draft is warm and polite, but it promises a full refund — something the company policy does not offer.',
      takeaway: 'Let AI draft the tone and structure; you check every promise, fact and policy before pressing send.',
    },
    analogy: 'AI is like a friendly new agent who knows how to sound helpful but has not read the policy manual yet.',
    risk: 'incorrect promises or customer data shared with the wrong tool',
    activity: {
      title: 'Handling an Outage Complaint Surge',
      scenario:
        'You are a customer service agent at Kariba Connect (fictional). A fibre outage in Harare’s eastern suburbs has triggered a surge of complaints. Your team lead wants you to use AI to respond faster without harming quality.',
      data: `Ticket | Channel  | Message (anonymised)
-------|----------|---------------------------------------------------------------
T-481  | WhatsApp | "Internet down since 6am. I work from home, this is costing me money!"
T-482  | Email    | "Please update my ID number 63-XXXXXXX-X-42 and change my plan."
T-483  | Call     | "My elderly father relies on a medical alarm on this line. Urgent."
T-484  | Twitter  | "Worst provider ever. Refund me now or I go to the regulator."
Policy: service credit of 2 days per 24h outage; no cash refunds; restoration ETA 4pm today.`,
      task: 'Explain how you would use AI to triage and respond to these tickets. Which responses can AI draft, which must be escalated to a human and why, how you would verify replies, and how you would protect customer data.',
      sample:
        'I would ask AI to classify tickets by urgency and draft empathetic replies using only the policy text: 2 days’ service credit per 24h outage, no cash refunds, ETA 4pm. T-481 and T-484 can be AI-drafted, then I check the draft does not promise a refund and quotes the correct ETA. T-483 must be escalated to a human immediately — a medical alarm is a safety risk and needs a priority fault check. T-482 contains an ID number, so I would not paste it into an AI tool; identity changes need verification through the secure account process. Every AI draft is reviewed by me before sending, and I log recurring themes so the team lead can update the knowledge base.',
    },
  },
  operations: {
    org: 'Mabvuku Packaging Works',
    task: 'planning maintenance and stock levels with AI forecasts',
    source: 'maintenance logs, sensor readings and physical stock counts',
    example: {
      scenario:
        'The operations team at Mabvuku Packaging Works, a fictional factory, uses an AI forecast to plan maintenance. The model flags Line 2 as low risk — but it was trained before the line started running double shifts.',
      takeaway: 'Forecasts are only as good as their data; check assumptions against what is actually happening on the floor.',
    },
    analogy: 'An AI forecast is like a weather report for your plant: very useful for planning, but you still look out of the window.',
    risk: 'decisions based on outdated data or ignored safety signals',
    activity: {
      title: 'Acting on an AI Maintenance Forecast',
      scenario:
        'You are an operations officer at Mabvuku Packaging Works (fictional). An AI maintenance tool has produced this week’s risk forecast. Your plant manager wants to cut maintenance hours to save costs.',
      data: `Machine        | AI failure risk | Hours since service | Recent observation
---------------|-----------------|---------------------|---------------------------------
Line 1 sealer  | 12% (low)       | 310                 | Normal
Line 2 cutter  | 18% (low)       | 890                 | Now on double shifts; noisy bearing
Boiler B       | 64% (high)      | 150                 | Pressure valve replaced last week
Forklift F3    | 22% (low)       | 540                 | Brake complaint logged Monday
Model last retrained: 5 months ago (single-shift operation).`,
      task: 'Use AI to help decide where to focus maintenance this week. Explain which AI outputs you trust or challenge and why, how you would verify them, any safety risks, and your recommendation to the plant manager.',
      sample:
        'I would not simply follow the AI ranking. The model was retrained five months ago on single-shift data, so Line 2 (890 hours, now double shifts, noisy bearing) is probably under-estimated — I would inspect it first. Forklift F3 has a brake complaint: that is a safety issue and must be checked before use regardless of the 22% score. Boiler B’s high score may be a false positive because the valve was just replaced — I would verify with a pressure test rather than ignore it. I would prompt the AI to explain which inputs drove each score, compare with maintenance logs and technician observations, and ask for the model to be retrained on current shift patterns. Recommendation: do not cut maintenance hours this week; prioritise F3, Line 2 and a Boiler B check, with the maintenance supervisor signing off.',
    },
  },
  management: {
    org: 'Harare Horizon Logistics',
    task: 'preparing decision papers and analysing options',
    source: 'financial data, operational reports and the people affected',
    example: {
      scenario:
        'A manager at Harare Horizon Logistics asks AI to compare three depot locations. It confidently recommends Chinhoyi — but the analysis ignored fuel costs and the road conditions the drivers know well.',
      takeaway: 'Use AI to frame options and surface questions; the decision, and accountability for it, stays with you.',
    },
    analogy: 'AI is like a sharp analyst who has read every report but never visited your depots — use their analysis, then apply your judgement.',
    risk: 'accepting a confident recommendation without checking its assumptions',
    activity: {
      title: 'Challenging an AI Recommendation',
      scenario:
        'You manage operations at Harare Horizon Logistics (fictional). The executive team used AI to evaluate where to open a new depot and wants your view before Friday’s board meeting.',
      data: `Option     | Set-up cost (USD) | Est. monthly revenue | AI score | AI note
-----------|-------------------|----------------------|----------|------------------------------
Chinhoyi   | 240,000           | 38,000               | 8.7/10   | "Best growth corridor"
Masvingo   | 210,000           | 31,000               | 7.1/10   | "Moderate demand"
Kwekwe     | 180,000           | 29,500               | 6.4/10   | "Lower revenue potential"
AI assumptions: diesel USD 1.45/litre, no road-works delays, 95% truck availability.
Driver feedback: Chinhoyi road under repair until next June; truck availability last quarter 81%.`,
      task: 'Evaluate the AI-assisted recommendation. Explain which assumptions you would test, how you would verify the analysis, who else you would involve, and what you would recommend to the board.',
      sample:
        'I would not accept the 8.7/10 score at face value. Two assumptions are already contradicted: truck availability was 81%, not 95%, and the Chinhoyi road is under repair until June, which will raise fuel and delay costs. I would ask the AI to rerun the comparison with 81% availability, a realistic diesel range and a delay scenario, and to show its calculations; then check payback periods myself (Kwekwe: 180,000 / 29,500 ≈ 6.1 months of revenue vs Chinhoyi 6.3). I would involve finance to validate costs and drivers and depot staff for on-the-ground knowledge. Recommendation to the board: defer the final choice two weeks, present Chinhoyi and Kwekwe under revised assumptions, and make clear the decision is ours, with AI used as analysis support only.',
    },
  },
  agriculture: {
    org: 'Mazowe Valley Growers Co-operative',
    task: 'planning planting and advising farmers with AI forecasts',
    source: 'local rainfall records, extension officer knowledge and market prices',
    example: {
      scenario:
        'An extension officer at the fictional Mazowe Valley Growers Co-operative uses an AI app to advise on planting dates. It suggests early November planting — but it is using regional averages, not this season’s late onset of rains.',
      takeaway: 'AI forecasts support decisions; local knowledge and current observations decide what farmers actually do.',
    },
    analogy: 'AI advice is like a well-read visitor from the city: informed, but farmers and extension officers know the soil and the season.',
    risk: 'generic advice that ignores local conditions',
    activity: {
      title: 'Planning the Season with AI Forecasts',
      scenario:
        'You are an extension officer supporting the Mazowe Valley Growers Co-operative (fictional). Members want advice on what to plant and when, and the co-op manager suggests using an AI advisory tool.',
      data: `AI seasonal outlook (district): "Normal to above-normal rainfall; plant maize from 1 November."
Local rain gauge: 18 mm by 10 November (last 5-year average by this date: 62 mm)
Prices (USD/tonne): maize 290 (GMB-style floor), sugar beans 1,150, soya 540
Member survey: 64% have no irrigation; 30% received seed late last season`,
      task: 'Explain how you would use the AI advisory tool to plan the season. Which parts of the AI output you would test against local reality, what advice you would give members, and how you would communicate uncertainty responsibly.',
      sample:
        'The AI outlook is district-level and says plant from 1 November, but our gauge shows only 18 mm by 10 November versus a 62 mm average, so the rains are late. I would not tell members to plant now. I would ask the AI for a staggered planting plan and drought-tolerant variety options, then check them with the district agronomist and the local rain data. Because 64% of members have no irrigation, I would advise planting after an effective rain of about 25 mm, splitting maize with sugar beans (a higher price per tonne) and soya to spread risk. I would explain to members that forecasts are uncertain, share advice in Shona and English at meetings, and not collect or share farmers’ personal data in the AI tool.',
    },
  },
  healthcare: {
    org: 'Tariro Community Clinic',
    task: 'summarising clinical notes and preparing administrative reports',
    source: 'the patient record, clinical guidelines and a qualified clinician',
    example: {
      scenario:
        'A nurse at the fictional Tariro Community Clinic tries an AI tool to summarise discharge notes. The summary is neat, but it drops a penicillin allergy that was mentioned once in the handwritten notes.',
      takeaway: 'AI can reduce paperwork, but a clinician checks every clinical detail — and patient data only goes into approved, secure tools.',
    },
    analogy: 'AI is like a helpful scribe: fast at writing things up, but never the one who makes clinical decisions.',
    risk: 'missed clinical details or exposed patient information',
    activity: {
      title: 'Reducing Clinic Waiting Times Safely',
      scenario:
        'You work at Tariro Community Clinic (fictional). Waiting times have grown and the sister-in-charge asks you to explore how AI could help with administration without putting patients at risk.',
      data: `Day       | Patients | Avg wait (min) | Staff on duty | Main delay
----------|----------|----------------|---------------|-------------------------
Monday    | 142      | 118            | 6             | Record retrieval
Tuesday   | 97       | 64             | 6             | Vitals queue
Wednesday | 121      | 95             | 5             | Record retrieval
Thursday  | 88       | 52             | 6             | Pharmacy
Friday    | 133      | 110            | 5             | Record retrieval
Idea from a colleague: "Paste patient files into a free chatbot to summarise them faster."`,
      task: 'Propose how AI could help reduce waiting times. Explain which tasks AI could support, which must stay with clinicians, how you would verify AI outputs, and how you would protect patient privacy.',
      sample:
        'Record retrieval is the main delay on the three busiest days (Monday 118 min, Friday 110, Wednesday 95). AI could help with administration: drafting appointment reminders, predicting busy days to schedule staff, and summarising non-identifiable queue data. I would reject the idea of pasting patient files into a free chatbot — that breaches confidentiality and data-protection law; any AI summarising records must be an approved, secure system. Clinical decisions, triage and medication stay with qualified clinicians. Every AI-generated summary would be checked against the record by a nurse, especially allergies and medication. I would pilot AI scheduling for four weeks, measure the average wait again, and review results with the sister-in-charge.',
    },
  },
  education: {
    org: 'Chengetedzo Secondary School',
    task: 'planning lessons, creating resources and giving feedback',
    source: 'the syllabus, trusted textbooks and your own subject knowledge',
    example: {
      scenario:
        'A teacher at the fictional Chengetedzo Secondary School asks AI for a Form 3 geography worksheet on the Kariba Dam. It looks polished, but it states the wrong completion year and uses examples from another country’s syllabus.',
      takeaway: 'AI can draft resources in minutes; you check facts, syllabus fit and inclusiveness before learners see them.',
    },
    analogy: 'AI is like a student teacher with endless energy: great for first drafts, but you are still the qualified teacher.',
    risk: 'inaccurate content or unfair treatment of learners',
    activity: {
      title: 'Designing an AI-Supported Revision Plan',
      scenario:
        'You teach at Chengetedzo Secondary School (fictional). Form 3 mid-term mathematics results are mixed and your head of department asks how AI could help you plan targeted revision.',
      data: `Topic               | Class average | Learners below 50%
--------------------|---------------|-------------------
Algebra             | 61%           | 9 of 38
Geometry            | 48%           | 21 of 38
Statistics          | 55%           | 14 of 38
Financial maths     | 70%           | 5 of 38
Note: 6 learners have no internet access at home; 2 learners have visual impairments.`,
      task: 'Explain how you would use AI to plan revision for this class. Include your prompt, how you would check the AI resources for accuracy and syllabus fit, how you would make the plan inclusive, and how you would protect learner data.',
      sample:
        'Geometry is the priority (48% average, 21 of 38 below 50%), then statistics. I would prompt: "Act as a Form 3 maths teacher following the national syllabus. Create a two-week geometry revision plan with worked examples, differentiated for three ability levels, printable without internet." I would check every worked example myself and compare with the syllabus and textbook, because AI can get calculations wrong. For inclusion, printed packs for the 6 learners without internet and large-print or audio versions for the 2 learners with visual impairments. I would never paste learners’ names or marks into the AI tool — only anonymised topic averages. I decide the final plan and review progress with a short quiz after two weeks.',
    },
  },
  'data-analytics': {
    org: 'Kudu Retail Group',
    task: 'cleaning, querying and summarising data with AI',
    source: 'the source data, independent calculations and pivot tables',
    example: {
      scenario:
        'An analyst at the fictional Kudu Retail Group asks AI to write SQL for monthly sales by branch. The query runs, but it groups by invoice date instead of payment date — so the totals do not match the finance report.',
      takeaway: 'AI writes queries and summaries fast; you reconcile the results against an independent source before sharing insight.',
    },
    analogy: 'AI is like a quick analyst intern: speedy with formulas, but you check the working before anything reaches a dashboard.',
    risk: 'plausible-looking numbers that are wrong',
    activity: {
      title: 'Verifying an AI-Assisted Sales Analysis',
      scenario:
        'You are a data analyst at Kudu Retail Group (fictional). The regional manager wants to know which branch is growing fastest and asks you to use AI to speed up the analysis.',
      data: `month   | branch    | sales_usd | returns_usd
--------|-----------|-----------|------------
2026-06 | Harare    | 120,500   | 3,200
2026-06 | Bulawayo  |  64,200   | 1,100
2026-07 | Harare    | 118,900   | 2,900
2026-07 | Bulawayo  |  71,800   | 9,600
2026-07 | Bulawayo  |  71,800   | 9,600   <- duplicate row?
AI summary: "Bulawayo sales grew 123.7% in July, the fastest growth in the group."`,
      task: 'Explain how you would check and correct the AI-assisted analysis. Identify the data-quality problems, show the corrected figures, explain how you would verify them, and what insight you would present to the regional manager.',
      sample:
        'The AI’s 123.7% growth claim is wrong: it summed a duplicate July Bulawayo row (71,800 twice = 143,600). After removing the duplicate, Bulawayo grew from 64,200 to 71,800 = 11.8%, and net of returns from 63,100 to 62,200 = -1.4%, because July returns jumped to 9,600. Harare fell 1.3% gross. I would verify by recalculating in a pivot table, running a SQL check for duplicates (GROUP BY month, branch HAVING COUNT(*) > 1) and asking the data owner why returns spiked. I would not share customer-level data with the AI tool. Insight for the manager: Bulawayo gross sales grew 11.8%, but high returns wiped out the gain — investigate the returns before celebrating growth.',
    },
  },
};

export const seedFor = (domainId?: DomainId) => DOMAIN_SEEDS[domainId ?? 'operations'] ?? DOMAIN_SEEDS.operations;
