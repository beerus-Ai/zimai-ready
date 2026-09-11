import type { ModuleContent } from '../../types';

/**
 * Human Resources — domain lesson content.
 * All organisations and people are fictional.
 */
export const HR_CONTENT: ModuleContent[] = [
  // ───────────────────────────── hr-recruitment ─────────────────────────────
  {
    moduleId: "hr-recruitment",
    lessons: [
      {
        id: "hr-recruitment-l1",
        title: "Inclusive Job Adverts with AI",
        minutes: 12,
        blocks: [
          {
            type: "explain",
            title: "Where AI helps in recruitment",
            body: "AI can draft job adverts, structure interview questions, summarise applications and handle scheduling. It speeds up the admin, but it learns from past text and hiring data, and that includes old biases. HR stays accountable for every hiring decision. Treat AI as a fast first-draft assistant, never as the gatekeeper who decides who gets through.",
            bullets: [
              "Drafting adverts and job descriptions",
              "Structuring interview questions",
              "Summarising applications for human review",
              "Scheduling and candidate updates",
            ],
          },
          {
            type: "example",
            title: "The 'young and dynamic' advert",
            scenario: "Tatenda, an HR Officer at Mhondoro Capital, a fictional Harare microfinance firm, asked AI for a Loan Officer advert. The polished draft asked for a 'young, dynamic graduate from a top university' with 'native English'. It read well, but it would put off older applicants, graduates of provincial universities and candidates whose first language is Shona or Ndebele. None of those factors predicts loan-officer performance.",
            takeaway: "Polished wording can hide bias. Test every requirement: does it genuinely predict success in this role?",
          },
          {
            type: "ai-example",
            title: "A better job-advert prompt for your organisation",
            instruction: "Show a weak prompt and an improved prompt for drafting an inclusive job advert for a role typical of the learner's industry in Zimbabwe (use a fictional organisation name). The improved prompt should state role outcomes, must-have vs nice-to-have skills, inclusive-language rules (no age, gender, marital status, tribe/ethnicity or specific-university preferences), a reasonable-adjustments statement for applicants with disabilities, and ask the AI to flag any wording that could exclude qualified applicants. Keep it under 160 words.",
            fallback: "Weak prompt: 'Write a job advert for a Relationship Officer.'\n\nImproved prompt: 'You are an HR officer at Savanna Crest Bank, a fictional Zimbabwean bank. Draft a job advert for a Relationship Officer (SME banking, Bulawayo branch). Outcomes: grow a portfolio of 60 SME clients, meet KYC standards, help clients adopt mobile banking. Must-haves: 2+ years in customer-facing financial services, strong numeracy, clear written English. Nice-to-haves: credit analysis experience; Ndebele or Shona for client conversations. Use plain, gender-neutral language. Do not mention age, gender, marital status, tribe or specific universities. Add a short statement welcoming applicants with disabilities and offering reasonable adjustments. After the advert, list any wording that could discourage qualified applicants.'",
          },
          {
            type: "interactive",
            title: "Which requirement belongs in the advert?",
            prompt: "An AI tool suggested four requirements for a Payroll Administrator. Choose the one that is fair and job-relevant.",
            mode: "choose-better",
            options: [
              { id: "a", label: "Aged 25–35 with a smart, professional appearance", correct: false, feedback: "Age limits and appearance are not job-relevant and exclude capable people. Describe the skills instead." },
              { id: "b", label: "Experience running payroll in USD and ZiG, including PAYE and NSSA deductions", correct: true, feedback: "Correct. A specific, measurable skill that genuinely predicts success in the role." },
              { id: "c", label: "Graduate of one of the country's 'top three' universities only", correct: false, feedback: "University prestige is a proxy for social background. Ask for the qualification or skill, from any accredited institution." },
              { id: "d", label: "Male candidates preferred because of late month-end closing", correct: false, feedback: "Gender preferences are discriminatory. Late working is a job condition to state, not a gender requirement." },
            ],
          },
          {
            type: "quiz",
            question: "An AI-drafted advert asks for 'digital natives'. What is the main concern?",
            options: [
              "It is too informal for a bank",
              "It indirectly signals a preference for younger candidates",
              "It is too long for a WhatsApp post",
              "It breaks copyright rules",
            ],
            correctIndex: 1,
            explanation: "'Digital native' is coded language for youth. Ask for the actual skill instead, e.g. 'confident using online banking systems and spreadsheets'.",
            skillId: "bias-awareness",
          },
          {
            type: "task",
            title: "Try it: de-bias one advert",
            instructions: "Take a recent job advert (or the Relationship Officer example). Ask your approved AI tool to list any wording that could discourage qualified applicants because of age, gender, disability, ethnicity or university background. Pick one flagged phrase and rewrite it as a job-relevant skill.",
            hint: "Remove names, salary details and any internal information before pasting a real advert into an AI tool.",
          },
        ],
      },
      {
        id: "hr-recruitment-l2",
        title: "Fair AI-Assisted Screening & Interviews",
        minutes: 13,
        blocks: [
          {
            type: "explain",
            title: "How screening bias creeps in",
            body: "AI screening tools rank CVs using patterns learnt from previous hires. If past hires were mostly men from two universities, the tool may quietly favour similar profiles. Proxies matter too: graduation year, surname, home area and career gaps can stand in for age, ethnicity, social background, gender or disability. Bias does not need a 'gender' column to appear.",
            bullets: [
              "Graduation year → age",
              "Surname or home area → ethnicity",
              "Career gaps → maternity or illness",
              "University name → social background",
            ],
          },
          {
            type: "interactive",
            title: "Spot the risky screening instruction",
            prompt: "An HR assistant drafted these instructions for an AI CV-screening step. Which one is the risk?",
            mode: "spot-the-risk",
            options: [
              { id: "a", label: "Score each CV against the five must-have criteria in the job description and quote the evidence", correct: false, feedback: "Good practice: criteria-based and evidence-linked, so a human can check it." },
              { id: "b", label: "Downgrade applicants with employment gaps of more than a year", correct: true, feedback: "This is the risk. Gaps often reflect maternity, caregiving, illness, disability or a tough job market. It screens out capable people for reasons unrelated to the job." },
              { id: "c", label: "Remove names, photos, dates of birth and home addresses before scoring", correct: false, feedback: "Good practice: it reduces the chance of age, gender or ethnic bias." },
              { id: "d", label: "Send a sample of AI-rejected CVs to a human reviewer every week", correct: false, feedback: "Good practice: sampling rejections is how you detect a tool going wrong." },
            ],
          },
          {
            type: "example",
            title: "Privacy under pressure",
            scenario: "Pushed to fill 12 teller vacancies before month-end, Kudzai pasted 200 full CVs into a free public chatbot to 'rank the best 20'. The CVs included national ID numbers, phone numbers and health notes from medical forms. Candidates had not been told their data would leave the bank's systems, and the chatbot's terms allowed the provider to keep inputs.",
            takeaway: "Use only approved tools, strip identifiers, never share health data, and tell candidates how AI is used in your process.",
          },
          {
            type: "explain",
            title: "Human decisions, transparent process",
            body: "AI may summarise and suggest; people decide. Keep a named reviewer for every shortlist and rejection, record reasons in job-related terms, and give candidates a way to request human review. Tell applicants when AI assists screening. Zimbabwe's Cyber and Data Protection Act expects personal data to be processed lawfully, for a clear purpose, and kept secure.",
            bullets: [
              "A named human decision-maker",
              "Reasons recorded against criteria",
              "Candidates told about AI use",
              "Pass rates checked by group",
            ],
          },
          {
            type: "ai-example",
            title: "Structured interview questions",
            instruction: "Generate 4 structured, competency-based interview questions for a role common in the learner's industry in Zimbabwe (fictional organisation), each with a short scoring guide (1 = weak, 3 = strong). Include one question on ethical judgement. Do not include questions about age, family plans, religion, tribe or health.",
            fallback: "Role: Customer Service Officer, Savanna Crest Bank (fictional)\n1. Tell us about a time a customer was upset about a failed mobile-money transfer. What did you do? (1 = blames the system; 3 = calms, explains, follows up and logs the issue)\n2. How would you explain a new ZiG account fee to an elderly customer? (1 = jargon; 3 = plain language, checks understanding)\n3. A colleague asks you to skip a KYC step for a 'trusted' client. What do you do? (1 = complies; 3 = declines politely, explains the risk, escalates)\n4. Systems are slow during load-shedding and the queue is growing. How do you prioritise? (1 = no plan; 3 = clear triage, communicates wait times honestly)",
          },
          {
            type: "quiz",
            question: "An AI tool shortlisted 20 applicants for teller roles. Only 3 are women, although 55% of applicants were women. What should HR do first?",
            options: [
              "Accept the list, because the AI is objective",
              "Pause, investigate which criteria and proxies drive the gap, and manually review a sample of rejected CVs",
              "Add three more women to the list at random",
              "Rerun the applications through a different AI tool",
            ],
            correctIndex: 1,
            explanation: "A large gap in pass rates is a warning sign. Find the cause before anyone is rejected; random fixes or tool-hopping do not address it.",
            skillId: "ai-recruitment",
          },
        ],
      },
    ],
    activity: {
      id: "hr-recruitment-activity",
      title: "Fix an AI-Drafted Job Advert and Scoring Rubric",
      domainId: "hr",
      scenario: "Savanna Crest Bank (fictional) is hiring two Credit Analysts for its Harare and Bulawayo branches. A busy line manager used a generic AI chatbot to draft the job advert and a CV-scoring rubric, and wants both published on Friday. HR has asked you to review them before anything goes live.",
      data: "AI-DRAFTED ADVERT (excerpt)\n\"Savanna Crest Bank seeks energetic young Credit Analysts (maximum age 30). Ideal candidates are graduates of top-tier universities, native English speakers and able to work late without family commitments. Send your CV, a full-length photo, your national ID number and details of any medical conditions to careers@savannacrest.example.\"\n\nAI-DRAFTED CV SCORING RUBRIC\n- Degree from a top-3 university: +20\n- Graduated within the last 5 years: +15\n- No employment gaps: +10\n- Credit analysis experience (IFRS 9, cash-flow lending): +25\n- Advanced Excel / financial modelling: +20\n- Lives within 10 km of the branch: +10",
      task: "Submit: (1) the bias and privacy problems you find in the advert and rubric, with the reason each is a problem; (2) the prompts you would use with an approved AI tool to produce fair revised versions; (3) how you would verify the revised output before publishing; (4) a short revised scoring rubric.",
      rubric: [
        { criterion: "Bias identification", description: "Finds direct and proxy bias (age, gender/family status, language origin, university prestige, career gaps, location) and explains why each is not job-related.", weight: 30 },
        { criterion: "Privacy & responsible AI", description: "Challenges collection of photos, ID numbers and medical data; applies data minimisation; uses approved tools with no candidate data in prompts; candidates told how they are assessed.", weight: 20 },
        { criterion: "AI use & prompting", description: "Writes specific prompts with job-related criteria, inclusive-language rules and a request to flag exclusionary wording.", weight: 20 },
        { criterion: "Verification & human oversight", description: "Checks AI output against the approved job description, involves a second reviewer, and plans to monitor pass rates by group after screening.", weight: 20 },
        { criterion: "Quality of revised rubric", description: "Revised rubric is job-relevant, weighted sensibly and free of proxies.", weight: 10 },
      ],
      skillIds: ["ai-recruitment", "bias-awareness", "data-privacy"],
      sampleStrongAnswer: "Problems: the advert excludes people by age ('young', 'maximum age 30'), family status ('without family commitments'), language background ('native English') and university prestige. None of these predicts credit-analysis performance. The rubric repeats them through proxies: 'top-3 university' (social background), 'graduated within 5 years' (age), 'no employment gaps' (penalises maternity, illness and caregiving) and 'lives within 10 km' (location and income). Privacy: requesting photos, ID numbers and medical conditions at application stage is excessive; ID checks belong at offer stage, and health information is only shared voluntarily for adjustments.\n\nAI use: in the bank's approved tool, with no candidate data, I would prompt: 'Rewrite this Credit Analyst advert in plain, gender-neutral language. Keep only job-related requirements: IFRS 9 credit assessment, cash-flow lending analysis, advanced Excel, clear written recommendations. Remove references to age, family, language origin, university and location. Add a reasonable-adjustments statement. Then list any wording that could still exclude qualified applicants.' Second prompt: 'Turn these five competencies into a scoring rubric with evidence descriptors for scores 1, 3 and 5.'\n\nVerification: I would compare every requirement with the approved job description, ask a second HR colleague and the line manager to review, and check the rubric does not reintroduce proxies. After screening, I would compare pass rates by gender and branch.\n\nRevised rubric: credit analysis experience 30; financial modelling 25; written credit recommendations 20; KYC/AML understanding 15; relevant qualification from any accredited institution 10. The hiring panel makes the decisions, and candidates are told how applications are assessed.",
    },
  },

  // ───────────────────────────── hr-analytics ─────────────────────────────
  {
    moduleId: "hr-analytics",
    lessons: [
      {
        id: "hr-analytics-l1",
        title: "Asking HR Data the Right Questions",
        minutes: 12,
        blocks: [
          {
            type: "explain",
            title: "What AI adds to HR analytics",
            body: "AI can summarise engagement-survey comments, spot turnover patterns across branches and draft workforce-planning scenarios in minutes. It is good at finding patterns and poor at knowing why they exist. Start with a business question, give the AI clean, anonymised data, and ask it to show its working so you can check the numbers yourself.",
            bullets: [
              "Turnover and exit-interview themes",
              "Engagement-survey comments",
              "Absence and overtime trends",
              "Headcount and skills planning",
            ],
          },
          {
            type: "example",
            title: "Exit interviews in an afternoon",
            scenario: "Rumbidzai, HR Officer at Kopje Foods, a fictional Bulawayo food manufacturer, had 140 anonymised exit-interview notes. She asked AI to group the reasons for leaving and count each theme. The top theme was 'pay eroded by currency changes', followed by 'shift patterns during load-shedding'. Before presenting to management, she read 20 notes herself to confirm the AI had grouped them correctly.",
            takeaway: "AI speeds up theme-finding. A human sample check is what makes the result trustworthy.",
          },
          {
            type: "ai-example",
            title: "A strong HR analytics prompt",
            instruction: "Show a strong prompt an HR professional in the learner's industry in Zimbabwe could use to analyse an anonymised turnover dataset (list the columns). It should ask for turnover rate by department and tenure band, the formula used, the top 3 patterns, and warnings about small groups. Then show a short excerpt of the kind of answer to expect, with realistic fictional numbers.",
            fallback: "Prompt: 'Here is an anonymised table of 2025 leavers at a fictional bank (columns: department, grade, tenure band, exit month, exit reason code) and a second table with average headcount by department. Calculate annual turnover by department and tenure band, show the formula you used, list the 3 strongest patterns, and flag any group with fewer than 10 employees where the rate may mislead. Do not guess reasons that are not in the data.'\n\nExpected answer (excerpt): 'Retail Banking turnover: 18% (27 leavers ÷ 150 average headcount). 60% of all leavers had under 2 years' tenure. Treasury shows 25%, but it has only 8 staff (2 leavers), so treat this with caution.'",
          },
          {
            type: "interactive",
            title: "What is safe to share with an approved AI tool?",
            prompt: "You are analysing absence trends across branches. Select ALL the items that are appropriate to include.",
            mode: "sort",
            options: [
              { id: "a", label: "Department, branch and grade", correct: true, feedback: "Needed for the analysis and low-risk when results are reported in groups." },
              { id: "b", label: "Monthly absence days per anonymised employee code", correct: true, feedback: "Anonymised codes let you analyse patterns without identifying individuals." },
              { id: "c", label: "Employee names and national ID numbers", correct: false, feedback: "Not needed for trend analysis. Identifiers add privacy risk with no analytical benefit." },
              { id: "d", label: "Doctors' notes describing diagnoses", correct: false, feedback: "Health data is highly sensitive. Exclude it entirely; the absence days are enough." },
            ],
          },
          {
            type: "quiz",
            question: "Which question is best suited to an AI-assisted HR analysis?",
            options: [
              "Who is most likely to resign next month so we can manage them out?",
              "Which departments and tenure bands had the highest turnover last year, and what were the most common exit themes?",
              "Which named employees complained the most in the anonymous survey?",
              "Is our HR team better than other banks' HR teams?",
            ],
            correctIndex: 1,
            explanation: "It is clear, aggregate and business-focused. Targeting individuals or de-anonymising survey comments damages trust and can breach privacy.",
            skillId: "ai-analytics",
          },
          {
            type: "task",
            title: "Try it: frame one HR question",
            instructions: "Write one HR question your organisation needs answered this quarter (for example, overtime cost by branch or turnover among new joiners). List the data columns you would need, the identifiers you would remove, and one check you would run on the AI's answer.",
            hint: "A good check is to recalculate one number by hand or in a spreadsheet.",
          },
        ],
      },
      {
        id: "hr-analytics-l2",
        title: "Reading AI People Insights Critically",
        minutes: 13,
        blocks: [
          {
            type: "explain",
            title: "Correlation is not cause",
            body: "AI will readily explain patterns, such as 'employees who skip training leave sooner'. That may be true, a coincidence, or caused by something else, like poor managers who also block training. Ask for the evidence, the size of each group and alternative explanations. Never turn a group pattern into a judgement about an individual.",
            bullets: [
              "How many people is it based on?",
              "What else could explain it?",
              "Is the data complete and current?",
              "Could acting on it be unfair?",
            ],
          },
          {
            type: "example",
            title: "The attrition-risk score",
            scenario: "A people-analytics tool at Mosi Connect, a fictional telecoms firm, gave every employee an 'attrition risk' score. Some managers began leaving high-risk staff out of promotions. A later review found the score leaned heavily on distance from the office and recent parental leave, which penalised young parents and staff living in high-density suburbs.",
            takeaway: "Predictive scores need transparency, bias testing and strict rules on use. Use them to improve conditions for groups, not to label individuals.",
          },
          {
            type: "interactive",
            title: "Spot the risky insight",
            prompt: "AI produced four findings from an engagement survey with 45 respondents. Which one is the risk?",
            mode: "spot-the-risk",
            options: [
              { id: "a", label: "Engagement fell from 72% to 64%; the drop is larger in branches that lost staff", correct: false, feedback: "Aggregate and verifiable: a sound starting point for discussion." },
              { id: "b", label: "The only Ndebele-speaking respondent in Finance is the most negative employee", correct: true, feedback: "This is the risk. It identifies a person and links an ethnic characteristic to their answers, breaking the survey's anonymity promise." },
              { id: "c", label: "Workload during load-shedding is mentioned in 18 comments", correct: false, feedback: "A theme count across many people: useful and safe." },
              { id: "d", label: "Groups smaller than 5 have been merged into 'Other'", correct: false, feedback: "Good practice that protects respondents' anonymity." },
            ],
          },
          {
            type: "ai-example",
            title: "Challenge the AI's conclusion",
            instruction: "Show an AI-generated HR insight relevant to the learner's industry in Zimbabwe that sounds convincing but is weakly supported. Follow it with 3–4 critical follow-up prompts the learner should ask to test it (sample size, alternative explanations, data quality, fairness impact).",
            fallback: "AI insight: 'Staff hired through referrals stay 40% longer, so hire mainly through referrals.'\n\nFollow-up prompts:\n1. 'How many referral and non-referral hires is this based on, and over what period?'\n2. 'What else differs between the two groups: roles, branches, pay grades?'\n3. 'Would relying on referrals reduce diversity by gender, ethnicity or university background? Show the current mix.'\n4. 'What would we need to measure to test whether referrals actually cause longer tenure?'",
          },
          {
            type: "quiz",
            question: "An AI tool finds that staff over 50 take more sick days and recommends 'prioritising younger hires'. What is the best response?",
            options: [
              "Adopt the recommendation to cut costs",
              "Reject it: age-based hiring is discriminatory. Verify the data and look at wellbeing support instead",
              "Keep it confidential and apply it informally",
              "Ask the AI to phrase it more politely",
            ],
            correctIndex: 1,
            explanation: "Hiring on age is discriminatory. The responsible use of the insight is to check it and improve support for staff wellbeing.",
            skillId: "bias-awareness",
          },
          {
            type: "quiz",
            question: "You are presenting an AI-assisted turnover analysis to the executive committee. What should accompany it?",
            options: [
              "Only the headline chart, to keep it simple",
              "The data source, method, group sizes, limitations and what a person has verified",
              "The raw employee file, for full transparency",
              "The AI tool's name as the author",
            ],
            correctIndex: 1,
            explanation: "Decision-makers need to know how reliable the insight is. Sharing raw personal data is never the answer, and a person remains accountable for the analysis.",
            skillId: "domain-hr",
          },
        ],
      },
    ],
  },

  // ───────────────────────────── hr-experience (advanced) ─────────────────────────────
  {
    moduleId: "hr-experience",
    lessons: [
      {
        id: "hr-experience-l1",
        title: "Personalised Onboarding & Policy Q&A",
        minutes: 10,
        blocks: [
          {
            type: "explain",
            title: "AI across the employee journey",
            body: "AI can draft tailored onboarding plans, answer routine policy questions through an HR assistant and turn dense policies into plain-language guides. Done well, HR spends less time on repeat queries and more on people. Done badly, an assistant gives confident wrong answers about leave or benefits. Ground every answer in approved policies and keep a human route.",
            bullets: [
              "Onboarding plans by role and branch",
              "Plain-language policy FAQs",
              "Assistants limited to approved documents",
              "Escalation to a named HR contact",
            ],
          },
          {
            type: "example",
            title: "The leave-policy chatbot",
            scenario: "Savanna Crest Bank (fictional) piloted an HR chatbot. An employee asked about compassionate leave to attend a funeral in her rural home area. The bot, drawing on a generic answer, said '3 days'. The bank's policy allows 5 days plus travel time. HR restricted the bot to the approved policy library and added a rule: if unsure, say so and refer to HR.",
            takeaway: "An HR assistant must answer only from your policies, and must say when it does not know.",
          },
          {
            type: "ai-example",
            title: "A personalised onboarding plan",
            instruction: "Generate a concise first-two-weeks onboarding plan for a new hire in a role typical of the learner's industry in Zimbabwe (fictional organisation), personalised for role and branch. Include a buddy, systems access, compliance training, a load-shedding contingency briefing and a check-in. Then list what personal data should NOT be included in the prompt.",
            fallback: "New Relationship Officer, Gweru branch (Savanna Crest Bank, fictional)\nWeek 1: Day 1 welcome from the branch manager, buddy introduction, laptop and core-banking access. Days 2–3 KYC and anti-money-laundering e-learning. Days 4–5 shadow the buddy on SME client visits.\nWeek 2: Mobile-banking product training; first supervised client call; load-shedding contingency briefing (generator, offline procedures); Day 10 check-in with HR and the line manager.\n\nDo NOT include in the prompt: the new hire's ID number, salary, medical information, home address or bank details.",
          },
          {
            type: "interactive",
            title: "Which answer should the HR assistant give?",
            prompt: "An employee asks the bank's HR assistant: 'Can I carry over my unused annual leave?' Choose the best response.",
            mode: "choose-better",
            options: [
              { id: "a", label: "'Yes, you can carry over all your leave indefinitely.'", correct: false, feedback: "Confident but invented: no policy reference, and likely wrong." },
              { id: "b", label: "'Under HR Policy 4.2 (Annual Leave), you may carry over up to 10 days, to be used by 31 March. For exceptions, contact your HR Business Partner.'", correct: true, feedback: "Correct. It is grounded in a cited policy, specific, and offers a human route." },
              { id: "c", label: "'Most companies in Zimbabwe allow carry-over, so probably yes.'", correct: false, feedback: "A generic guess, not your organisation's policy." },
              { id: "d", label: "'Please send your employee number, ID number and leave history so I can decide.'", correct: false, feedback: "It collects unnecessary personal data and implies the bot makes the decision." },
            ],
          },
          {
            type: "quiz",
            question: "What is the most important safeguard for an AI HR policy assistant?",
            options: [
              "A friendly tone with emojis",
              "Answers grounded only in approved, current policies, with clear escalation to HR",
              "Permission to approve leave requests automatically",
              "Training it on employees' private chat messages",
            ],
            correctIndex: 1,
            explanation: "Accuracy and a human route matter most. Automated approvals and private data remove accountability and break trust.",
            skillId: "domain-hr",
          },
          {
            type: "task",
            title: "Try it: plain-language policy",
            instructions: "Take one paragraph from an HR policy (no personal data). Ask AI to rewrite it in plain English for a new employee. Then check every fact against the original and note one thing the AI changed, softened or dropped.",
            hint: "AI often softens conditions such as deadlines, eligibility rules or 'subject to approval'. Check those first.",
          },
        ],
      },
      {
        id: "hr-experience-l2",
        title: "Communicating Change with AI",
        minutes: 10,
        blocks: [
          {
            type: "explain",
            title: "AI as a drafting partner for change",
            body: "Restructures, new systems and policy changes create anxiety. AI can help draft clear FAQs, manager talking points and messages in English, Shona and Ndebele. But tone, timing and truth are HR's job. Never let AI invent reassurances, dates or numbers, and have fluent reviewers check every translation for meaning and respect.",
            bullets: [
              "Draft, then fact-check every promise",
              "Adapt tone for each audience",
              "Fluent review of translations",
              "Offer a channel for questions",
            ],
          },
          {
            type: "example",
            title: "Announcing AI without fear",
            scenario: "Zambezi Assurance, a fictional insurer, was introducing AI to help triage claims. The first AI-drafted memo said 'AI will make the claims process fully automated'. Staff read it as job losses. HR rewrote it to explain which tasks would change, how assessors stay in control of decisions, the reskilling programme and where to ask questions. The rumours faded within a week.",
            takeaway: "Frame AI honestly as augmentation and role change: be specific, truthful and human.",
          },
          {
            type: "interactive",
            title: "Spot the risky sentence",
            prompt: "AI drafted an announcement about a new performance-management system. Which sentence is the risk?",
            mode: "spot-the-risk",
            options: [
              { id: "a", label: "'Your line manager will hold a one-to-one with you before the new system starts.'", correct: false, feedback: "Clear and human." },
              { id: "b", label: "'The system uses AI to rank all staff and will decide annual bonuses automatically.'", correct: true, feedback: "This is the risk. Automated pay decisions without human review damage trust. Decisions must stay with accountable people, with a route to appeal." },
              { id: "c", label: "'Questions can be sent to the HR inbox or raised at branch meetings.'", correct: false, feedback: "Good: it gives people a channel." },
              { id: "d", label: "'Training runs from 3 to 14 March, with offline options for branches affected by load-shedding.'", correct: false, feedback: "Helpful and inclusive. Just confirm the dates before sending." },
            ],
          },
          {
            type: "ai-example",
            title: "An honest change FAQ",
            instruction: "Generate 4 FAQ entries an HR team in the learner's industry in Zimbabwe could use to announce a new AI tool. Write them honestly with an augmentation framing (tasks change, people stay accountable, reskilling is offered), and mark any facts HR must confirm in [square brackets].",
            fallback: "Q: Will AI replace my job?\nA: The new assistant takes over routine tasks such as drafting standard letters. Your role shifts towards advising customers and checking AI outputs. We are funding [number] hours of training per person.\n\nQ: Who decides if something goes wrong?\nA: People do. Every AI-assisted decision is reviewed by a named staff member.\n\nQ: What happens to my data?\nA: The tool uses only work data approved by our [Data Protection Officer]. Personal messages are not analysed.\n\nQ: Where can I ask more?\nA: Email [HR inbox] or come to the branch meeting on [date].",
          },
          {
            type: "quiz",
            question: "You used AI to translate a change announcement into Shona and Ndebele. What is the essential next step?",
            options: [
              "Publish immediately, because AI translation is accurate",
              "Have fluent speakers review it for meaning, tone and cultural appropriateness",
              "Publish only in English to avoid any risk",
              "Ask the AI whether its own translation is correct",
            ],
            correctIndex: 1,
            explanation: "AI translation can be literal, awkward or disrespectful. Fluent human review keeps messages accurate and inclusive; dropping local languages excludes people.",
            skillId: "ai-writing",
          },
          {
            type: "task",
            title: "Try it: manager talking points",
            instructions: "Pick a real or upcoming change in your organisation. Ask AI to draft five talking points for line managers. Edit them so every promise is true, add a question channel, and remove anything that sounds vague or alarming.",
          },
        ],
      },
    ],
  },

  // ───────────────────────────── hr-challenge ─────────────────────────────
  {
    moduleId: "hr-challenge",
    lessons: [
      {
        id: "hr-challenge-l1",
        title: "Challenge Briefing: A Fair, Private, Human-Led Recruitment Workflow",
        minutes: 6,
        blocks: [
          {
            type: "explain",
            title: "What this challenge tests",
            body: "You will design an AI-assisted recruitment workflow for a fictional bank, starting from an AI-generated shortlist that contains hidden bias and privacy problems. Assessors look for judgement: where AI genuinely helps, where people must decide, how you verify AI outputs, and how you protect candidates throughout the process.",
            bullets: [
              "Workflow across the hiring stages",
              "Spotting bias and privacy risks",
              "Prompts and verification steps",
              "Clear human accountability",
            ],
          },
          {
            type: "interactive",
            title: "How should you use AI in this challenge?",
            prompt: "Choose the approach that will score best, and reflects good practice at work.",
            mode: "choose-better",
            options: [
              { id: "a", label: "Ask AI to 'pick the best 5 candidates' and submit its list", correct: false, feedback: "This hands the decision to the tool and repeats the very problem the challenge asks you to fix." },
              { id: "b", label: "Use AI to draft the workflow and criteria, test them for bias, check each claim against the data and explain what you changed", correct: true, feedback: "Correct. Show your prompts, your checks and your reasoning; that is what assessors reward." },
              { id: "c", label: "Avoid AI entirely so there is nothing to verify", correct: false, feedback: "The challenge assesses responsible AI use. Show how you use it well rather than avoiding it." },
              { id: "d", label: "Paste real CVs from your organisation to make it realistic", correct: false, feedback: "Never put real candidate data into an exercise or unapproved tool. The scenario data is fictional for a reason." },
            ],
          },
          {
            type: "explain",
            title: "Responsible-AI reminders",
            body: "Candidates should know when AI assists and be able to ask for human review. Collect only the data the job requires. Look for proxies such as graduation year, home area, career gaps and university name, not just obvious gender or age fields. A named person, or panel, must own every shortlisting and hiring decision.",
            bullets: [
              "Tell candidates about AI use",
              "Minimum personal data",
              "Check pass rates by group",
              "People sign off decisions",
            ],
          },
          {
            type: "quiz",
            question: "In your workflow, who should make the final shortlisting decision?",
            options: [
              "The AI screening tool, because it is consistent",
              "A trained hiring panel using documented criteria, with AI summaries as supporting input",
              "Whoever has the highest AI score is shortlisted automatically",
              "Whichever HR officer is available that day",
            ],
            correctIndex: 1,
            explanation: "Consistency is not the same as fairness. Accountable people applying documented, job-related criteria keep the process fair and defensible.",
            skillId: "domain-hr",
          },
        ],
      },
    ],
    activity: {
      id: "hr-challenge-activity",
      title: "Design a Fair, Private, Human-Led AI Recruitment Workflow",
      domainId: "hr",
      scenario: "Savanna Crest Bank (fictional) received 640 applications for 8 Graduate Trainee posts across Harare, Bulawayo and Mutare. To save time, the talent team ran every application through a newly purchased AI screening tool, which produced the shortlist below. The Chief People Officer has asked you to design the bank's AI-assisted recruitment workflow for this and future intakes, and to advise whether this shortlist can be used.",
      data: "AI SCREENING TOOL: SHORTLIST (top 6 of 20 shown)\nRank | Candidate | Gender | Score | AI rationale\n1 | T. Chikore | M | 94 | 'Top-tier university, graduated 2025, lives in a low-density suburb, strong culture fit'\n2 | B. Sibanda | M | 91 | 'Top-tier university, no employment gaps, excellent English'\n3 | K. Mutsvairo | M | 89 | 'Rugby captain, natural leader, age 22'\n4 | R. Dube | F | 86 | 'Distinction in economics. Note: career break 2023 (maternity)'\n5 | P. Marufu | M | 85 | 'Same university as 70% of current graduate trainees'\n6 | L. Ncube | F | 84 | 'Strong analytics. Note: wheelchair user, may need branch adjustments'\n\nSUMMARY: 20 shortlisted = 16 men, 4 women (applicant pool: 52% women). 17 of 20 from two universities. Only 1 of 20 from Mutare applicants.\n\nTOOL SET-UP: trained on the bank's 2015–2024 hiring decisions. Inputs: full CV, photo, date of birth, home address and the 'medical declaration' form.\nCANDIDATE NOTICE: applicants were not told AI would be used.",
      task: "Submit a recruitment workflow proposal covering: (1) your approach: the hiring stages and where AI should and should not be used; (2) the bias and privacy problems you identify in the shortlist and tool set-up, with evidence from the data; (3) at least two prompts you would use with an approved AI tool, and how you would verify its outputs; (4) safeguards: candidate transparency, data minimisation, human sign-off and ongoing monitoring; (5) your recommendation on whether this shortlist can be used, and what happens next.",
      rubric: [
        { criterion: "Workflow design & AI use", description: "Clear stages with AI used where it adds value (drafting, structuring, summarising against criteria) and purposeful, specific prompts; AI does not rank or reject on its own.", weight: 20 },
        { criterion: "Bias identification", description: "Identifies the gender skew, university, age, location and 'culture fit' proxies, and the maternity and disability notes as unfair factors, using evidence from the data.", weight: 25 },
        { criterion: "Privacy & responsible AI", description: "Removes photos, dates of birth, addresses and medical data from screening; candidate notice and route to human review; approved tools; retention limits; data-protection sign-off.", weight: 20 },
        { criterion: "Verification & critical thinking", description: "Does not accept the shortlist at face value; checks pass rates by group, reviews samples of rejected applications, questions the training data and tests outputs before use.", weight: 25 },
        { criterion: "Recommendation & accountability", description: "Gives a clear, justified recommendation with named human decision-makers and next steps.", weight: 10 },
      ],
      skillIds: ["domain-hr", "bias-awareness", "data-privacy", "ai-recruitment", "critical-thinking"],
      sampleStrongAnswer: "Recommendation: do not use this shortlist. Women are 52% of applicants but 20% of the shortlist; 17 of 20 come from two universities; and the rationales rely on 'culture fit', graduation year, age, a wealthy suburb, a maternity break and a wheelchair user's needs. The tool learnt from 2015–2024 decisions, so it copies past patterns, and it processed photos, dates of birth, addresses and medical declarations. Candidates were never told AI was used.\n\nWorkflow: (1) HR and hiring managers agree job-related criteria; AI drafts an inclusive advert and structured rubric, which HR edits. (2) Applications collect minimum data: no photo, date of birth, address or health data. (3) An approved AI tool summarises each anonymised CV against the criteria, quoting evidence; it does not rank or reject. (4) Two trained reviewers score independently and discuss differences. (5) Structured interviews use AI-drafted, panel-approved questions. (6) The panel decides and records reasons.\n\nPrompts: 'Summarise this anonymised CV against these five criteria, quoting evidence. Write \"no evidence\" where missing. Do not infer age, gender, ethnicity or health.' And: 'Review this rubric for criteria that could act as proxies for protected characteristics.'\n\nVerification: compare pass rates by gender, university and region at every stage; manually review a sample of 'no evidence' cases; audit the process each intake.\n\nSafeguards: a privacy notice explaining AI's supporting role and a right to human review; retention limits; Data Protection Officer sign-off. Next step: rescreen all 640 applications using this process before any candidate is contacted.",
    },
  },
];
