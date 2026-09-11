import type { DomainId } from '../../types';

/**
 * Offline question bank for the Final Knowledge Assessment.
 *
 * Used whenever Gemini is unavailable (or returns something invalid). Every
 * scenario uses FICTIONAL organisations and people in realistic Zimbabwean
 * workplace settings. Options are authored with the correct answer FIRST —
 * the engine shuffles them per learner, so position never gives the answer away.
 */

export type Dimension = 'knowledge' | 'tools' | 'domain' | 'critical' | 'responsible' | 'verification';

export interface BankQuestion {
  id: string;
  dimension: Dimension;
  scenario?: string;
  question: string;
  /** options[0] is the correct answer (shuffled at selection time). */
  options: [string, string, string, string];
  explanation: string;
}

const q = (
  id: string,
  dimension: Dimension,
  scenario: string | undefined,
  question: string,
  options: [string, string, string, string],
  explanation: string,
): BankQuestion => ({ id, dimension, scenario, question, options, explanation });

// ───────────────────────────── Generic questions (all professions) ─────────────────────────────

export const GENERIC_QUESTIONS: BankQuestion[] = [
  // Knowledge
  q(
    'g-k1',
    'knowledge',
    'A generative AI assistant writes a fluent, confident paragraph for Tinashe’s compliance memo, citing “Regulatory Circular 14 of 2025”. Nobody in the team can find the circular.',
    'What best explains how this can happen?',
    [
      'Language models generate plausible text from patterns and can produce convincing references that do not exist (a “hallucination”).',
      'The model searched the internet and found a circular that has since been withdrawn.',
      'AI tools only make mistakes like this when the prompt contains spelling errors.',
      'The model deliberately invented the circular because it was instructed to sound authoritative.',
    ],
    'Generative models predict likely words; they do not look facts up unless connected to a trusted source. Confident tone is not evidence — references must always be checked.',
  ),
  q(
    'g-k2',
    'knowledge',
    'Zambezi Crest Insurance (fictional) is replacing part of its older rules-based claims system with a generative AI assistant.',
    'Which statement best describes how the generative AI assistant differs from the rules-based system?',
    [
      'It generates new content from patterns learned during training, rather than following explicit if-then rules written by staff.',
      'It always returns exactly the same answer to the same question, because it follows fixed rules.',
      'It understands the insurer’s policies in the same way an experienced claims officer does.',
      'It can only work with numbers, whereas the rules-based system can handle text.',
    ],
    'Rules-based systems follow logic people wrote; generative models produce outputs from learned patterns. That makes them flexible — but also less predictable, so outputs need checking.',
  ),
  q(
    'g-k3',
    'knowledge',
    'Tafadzwa asks a general-purpose AI chatbot for today’s ZiG/USD exchange rate so she can price a customer quotation.',
    'What is the most important limitation to recognise?',
    [
      'Unless it is connected to a live, trusted source, the model may give outdated or invented figures — current rates must come from an official source.',
      'Chatbots always have live access to official exchange rates, so the figure can be used directly.',
      'The model will refuse to answer any question about money or currency.',
      'Exchange rates are simple numbers, so AI answers about them are always reliable.',
    ],
    'Models have a training cut-off and no built-in access to live data. Time-sensitive figures such as exchange rates must be taken from an authoritative source.',
  ),
  q(
    'g-k4',
    'knowledge',
    'The operations manager at Mutapa Freight (fictional) asks where AI could add value first with the lowest risk.',
    'Which use case is the most sensible starting point?',
    [
      'Drafting routine customer delivery-update messages that staff review before sending.',
      'Automatically approving credit terms for new customers without any review.',
      'Deciding which drivers to discipline based on an AI analysis of complaints.',
      'Replacing the monthly vehicle safety inspection with an AI-generated checklist.',
    ],
    'Low-risk, high-volume drafting with human review is a classic first use case. Decisions about credit, discipline or safety carry higher stakes and need stronger controls.',
  ),

  // AI tool usage
  q(
    'g-t1',
    'tools',
    'Nyasha typed “Summarise this report” into an AI assistant. The result was vague, generic and far too long for her director.',
    'Which change would most improve the output?',
    [
      'Add context, audience and format — who it is for, what decision it supports, and the length and structure wanted.',
      'Repeat the same prompt several times until a better answer appears.',
      'Ask the AI to “try harder” and be more intelligent.',
      'Paste in a longer version of the report so the AI has more to work with.',
    ],
    'Good prompts give the model a role, context, the audience, the task and the output format. Vague prompts produce vague outputs.',
  ),
  q(
    'g-t2',
    'tools',
    'The first AI draft of a tender response for Kopje Hardware (fictional) is generic and does not address the client’s scoring criteria.',
    'What is the most effective next step?',
    [
      'Give specific feedback in a follow-up prompt — add the client’s requirements, your firm’s real evidence and the scoring criteria — and ask for a revised draft.',
      'Accept it, because AI drafts cannot be improved by further prompting.',
      'Open a new chat and paste exactly the same prompt again.',
      'Ask the AI to invent impressive project references to make the response stronger.',
    ],
    'Iterating with precise feedback is how professionals get strong AI output. Inventing references would be dishonest and could disqualify the bid.',
  ),
  q(
    'g-t3',
    'tools',
    'Rufaro wants an AI tool to classify 200 customer comments into “billing”, “network”, “service” and “other”.',
    'Which technique will most improve the consistency of the results?',
    [
      'Define each category clearly, include a few labelled example comments in the prompt, then spot-check a sample of results.',
      'Let the AI decide its own categories each time it runs.',
      'Include customers’ phone numbers with each comment so the AI has full context.',
      'Use the shortest possible prompt so the AI is not confused by instructions.',
    ],
    'Clear definitions plus a few examples (few-shot prompting) make classification far more consistent. Personal data adds risk and no value.',
  ),
  q(
    'g-t4',
    'tools',
    'You need AI to extract the invoice number, date, supplier and amount from 50 scanned supplier invoices into a spreadsheet.',
    'Which approach is most sensible?',
    [
      'Ask for a fixed table with named columns and flagged unreadable fields, then reconcile the totals and check a sample against the originals.',
      'Ask for a narrative summary of each invoice and retype the figures yourself.',
      'Trust the extracted amounts, because AI reads scanned documents perfectly.',
      'Ask the AI to fill any unreadable amounts with its best estimate, without flagging them.',
    ],
    'Structured output makes AI extraction useful; reconciliation and sampling make it trustworthy. Silent estimates would corrupt the records.',
  ),

  // Domain application (generic — used when domain-specific questions do not fill the slots)
  q(
    'g-d1',
    'domain',
    'A small hardware business in Gweru wants to use AI to respond to customer WhatsApp enquiries.',
    'Which workflow design is most appropriate?',
    [
      'AI drafts replies to common questions from an approved FAQ; staff handle sensitive or unusual cases, and customers can always reach a person.',
      'AI answers every message, including refunds and complaints, with no human involvement.',
      'Staff paste customers’ full chat histories into any free AI tool to save time.',
      'Avoid AI completely, because it cannot help with customer enquiries.',
    ],
    'Good AI workflows automate the routine, route the sensitive to people, and keep customer data protected.',
  ),
  q(
    'g-d2',
    'domain',
    'A team at Msasa Logistics (fictional) has been given an AI writing tool. Leadership wants to know if it is actually improving the work.',
    'What is the best way to measure its value?',
    [
      'Agree a baseline (such as time per task and error rate), pilot the tool on real work, and compare results including quality checks.',
      'Ask staff whether they like the tool and use that as the only measure.',
      'Assume it works because the vendor says it saves 40% of time.',
      'Count how many prompts each person sends per day.',
    ],
    'Value should be measured against a baseline on real tasks, including quality — not usage volume or vendor claims.',
  ),
  q(
    'g-d3',
    'domain',
    'Your organisation is designing a process in which AI contributes to a decision about a person — for example a loan, a hire or a disciplinary case.',
    'Where should AI sit in that process?',
    [
      'As decision support: it prepares information and highlights patterns, while an accountable person reviews the evidence and decides.',
      'As the final decision-maker, because it is more consistent than people.',
      'Nowhere — AI must never be used anywhere near decisions about people.',
      'As the decision-maker, with people only informed after the decision is made.',
    ],
    'High-stakes decisions about people need meaningful human oversight and accountability. AI can inform the decision; it should not make it alone.',
  ),

  // Critical thinking
  q(
    'g-c1',
    'critical',
    'An AI analysis recommends cutting the marketing budget by 40% because “sales show no relationship with marketing spend”. It used six months of data, during which a national fuel shortage depressed sales.',
    'What is the best response?',
    [
      'Question the conclusion: the period is short and unusual, so another factor may hide the relationship — ask for a longer data window before deciding.',
      'Accept it, because AI analysis removes human bias.',
      'Stop using AI analysis for any future budget decisions.',
      'Cut the budget by 20% as a compromise between the AI and the team.',
    ],
    'Unusual periods and confounding factors can produce misleading patterns. Critical evaluation means testing the data and assumptions behind a recommendation.',
  ),
  q(
    'g-c2',
    'critical',
    'Credit officers at Tsoro Microfinance (fictional) approve 98% of AI loan recommendations without opening the supporting notes.',
    'Which risk does this most clearly illustrate?',
    [
      'Automation bias — people over-trusting AI outputs and no longer applying their own judgement.',
      'Data minimisation — collecting too little data about borrowers.',
      'Model drift — the model becoming faster over time.',
      'Prompt injection — borrowers typing instructions into the AI.',
    ],
    'Automation bias turns “human in the loop” into a rubber stamp. Oversight only works if people genuinely review the evidence.',
  ),
  q(
    'g-c3',
    'critical',
    'Two AI route-planning tools give different “best” delivery routes for a Bulawayo distribution hub.',
    'What should you do?',
    [
      'Examine the assumptions and data each tool used, test both against recent actual delivery times, and involve the dispatch team’s local knowledge.',
      'Choose the tool from the better-known vendor.',
      'Average the two routes to get a balanced answer.',
      'Ask a third AI tool to break the tie and follow its choice.',
    ],
    'When outputs disagree, investigate why. Real-world evidence and local expertise beat brand names or averaging.',
  ),

  // Responsible AI
  q(
    'g-r1',
    'responsible',
    'Chipo wants to use a free public AI chatbot to summarise a spreadsheet of 300 employees’ names, national ID numbers and salaries.',
    'What should she do?',
    [
      'Not paste it: remove or anonymise the personal data, or use an organisation-approved tool that meets data-protection requirements.',
      'Paste it, as long as she deletes the chat afterwards.',
      'Paste only the first 150 rows to halve the risk.',
      'Paste it, because summarising data is not the same as sharing it.',
    ],
    'Pasting personal data into unapproved tools can breach data-protection law (such as Zimbabwe’s Cyber and Data Protection Act) and company policy. Deleting the chat afterwards does not undo the disclosure.',
  ),
  q(
    'g-r2',
    'responsible',
    'An AI CV-screening tool shortlists far fewer applicants from rural schools than the applicant pool would suggest.',
    'What is the most responsible action?',
    [
      'Pause reliance on the tool, investigate its criteria and training data for bias, and have people review the affected applications.',
      'Continue, because software is objective and cannot be biased.',
      'Add a note to job adverts warning that rural applicants are less likely to be shortlisted.',
      'Keep using the tool, but only for senior roles.',
    ],
    'AI can reproduce historical bias through proxies such as school or location. Disparities must be investigated and people must review affected decisions.',
  ),
  q(
    'g-r3',
    'responsible',
    'A customer chatting on Kariba Connect’s (fictional) help line asks: “Am I talking to a real person?” They are talking to an AI assistant.',
    'What is the right response?',
    [
      'Tell them honestly that it is an AI assistant and explain how to reach a person.',
      'Say it is a person, to maintain the customer’s trust.',
      'Avoid the question and move on to solving the problem.',
      'Tell them it depends on the time of day.',
    ],
    'Transparency is a core responsible-AI principle: people should know when they are interacting with AI and how to reach a human.',
  ),
  q(
    'g-r4',
    'responsible',
    'An AI-drafted report sent to a client contained an incorrect figure that caused the client a financial loss.',
    'Who is accountable?',
    [
      'The organisation and the professional who approved and sent the report — using AI does not remove human accountability.',
      'Only the AI vendor, because its tool made the error.',
      'No one, because the error came from an AI system.',
      'The client, for relying on the report.',
    ],
    'Professionals remain accountable for work they approve, regardless of the tools used to produce it.',
  ),
  q(
    'g-r5',
    'responsible',
    'Your team wants to use AI to draft Shona and Ndebele messages for a community health awareness campaign.',
    'What is the most responsible approach?',
    [
      'Use AI for first drafts, then have fluent speakers review them for accuracy, tone and cultural appropriateness before release.',
      'Publish the AI translations directly — AI translation is always accurate.',
      'Only produce the campaign in English to avoid any translation risk.',
      'Ask the AI to rate its own translations and publish those it scores highly.',
    ],
    'AI can widen reach in local languages, but quality and cultural fit need native-speaker review — especially for health messages.',
  ),

  // Verification of AI outputs
  q(
    'g-v1',
    'verification',
    'An AI summary for the board pack states: “Branch B’s revenue grew 25% quarter-on-quarter.”',
    'How should you verify this before it goes to the board?',
    [
      'Recalculate the figure from the source data (for example the ledger or sales report) and confirm which periods are being compared.',
      'Ask the same AI tool whether it is sure.',
      'Check that the summary reads well and has no spelling errors.',
      'Accept it if it matches what you expected.',
    ],
    'Verification means checking against an independent, authoritative source. Asking the same model to confirm itself is not verification.',
  ),
  q(
    'g-v2',
    'verification',
    'An AI assistant provides three academic references to support a staff training proposal.',
    'What is the most reliable way to verify them?',
    [
      'Look up each reference in the original source (library database, journal or publisher) and confirm it exists and says what is claimed.',
      'Check the references are formatted correctly.',
      'Ask the AI for DOI numbers, which prove the references are real.',
      'Keep them if the author names sound credible.',
    ],
    'AI can fabricate references — including realistic-looking DOIs. Only the original source can confirm a reference exists and supports the claim.',
  ),
  q(
    'g-v3',
    'verification',
    'An AI-written spreadsheet formula calculates overtime pay for 80 staff.',
    'What should you do before using it for payroll?',
    [
      'Test it on a handful of cases you calculate by hand — including edge cases such as public holidays — and have a second person review it.',
      'Use it, because a formula is either correct or it shows an error.',
      'Run it for all staff and fix any complaints afterwards.',
      'Ask the AI to rewrite it in a different style to be safe.',
    ],
    'Formulas can run without errors and still be wrong. Test cases, edge cases and a second reviewer catch the mistakes that matter.',
  ),
];

// ───────────────────────────── Domain-specific scenario questions ─────────────────────────────

export const DOMAIN_QUESTIONS: Record<DomainId, BankQuestion[]> = {
  finance: [
    q(
      'fin-q1',
      'domain',
      'At Marula Mutual Finance (fictional), AI drafts the monthly variance commentary. It states: “Staff costs rose 18% due to new hires.” HR confirms headcount was flat; a backdated cost-of-living adjustment was paid this month.',
      'What should the accountant do?',
      [
        'Correct the commentary to reflect the backdated adjustment — the AI inferred a cause that the data does not support.',
        'Keep the AI explanation, because new hires are the most common cause of rising staff costs.',
        'Remove the staff-cost line from the report to avoid confusion.',
        'Ask the AI to rephrase the sentence more cautiously but keep the same cause.',
      ],
      'AI often invents plausible explanations for variances. The accountant must confirm the real driver with source evidence before commentary is published.',
    ),
    q(
      'fin-q2',
      'domain',
      'The finance team wants AI to help with the monthly bank reconciliation of about 4,000 transactions in USD and ZiG.',
      'Which use of AI is most appropriate?',
      [
        'Use AI to match transactions and flag unmatched or unusual items, with an accountant investigating exceptions and approving the reconciliation.',
        'Let AI clear all unmatched items automatically to save time.',
        'Let AI convert ZiG amounts using an exchange rate it estimates.',
        'Skip the reconciliation, because the AI matching tool is 99% accurate.',
      ],
      'AI speeds up matching; accountants keep control of exceptions and sign-off. Rates must come from an authoritative source, never an AI estimate.',
    ),
    q(
      'fin-q3',
      'critical',
      'An AI fraud-detection model flags 120 mobile-money transfers as suspicious. Last quarter, 90% of its flags were false positives.',
      'What is the best course of action?',
      [
        'Review the flags in order of risk, verify with customers through trusted channels before blocking, and feed the outcomes back to improve the model.',
        'Block all 120 accounts immediately.',
        'Ignore the flags, since most turn out to be false positives.',
        'Let the AI decide which customers to report to the authorities.',
      ],
      'Alerts are signals, not verdicts. Risk-based human review balances fraud prevention against the harm of wrongly blocking customers.',
    ),
  ],
  hr: [
    q(
      'hr-q1',
      'domain',
      'An AI tool drafts a job advert for a Relationship Manager at Savanna Crest Bank (fictional). It asks for “young, energetic graduates” who are “native English speakers”.',
      'What should the HR officer do?',
      [
        'Rewrite the requirements around the skills and experience the role needs, removing age- and origin-related wording that could discriminate.',
        'Publish it — the AI reflects what successful candidates have looked like in the past.',
        'Keep the wording but add “equal opportunity employer” at the end.',
        'Ask the AI to use more formal language but keep the same requirements.',
      ],
      'AI can reproduce discriminatory patterns from its training data. HR must ensure adverts are fair, lawful and based on genuine job requirements.',
    ),
    q(
      'hr-q2',
      'domain',
      'Branch staff turnover is 22% compared with 9% at head office. HR wants to use AI to understand why.',
      'What is the best first step?',
      [
        'Define the question and gather anonymised data — tenure, exit reasons, pay bands, manager changes — then use AI to explore patterns for HR to interpret.',
        'Upload named exit-interview transcripts to a public chatbot for analysis.',
        'Ask AI to predict which individual employees will resign and warn their managers.',
        'Accept the first reason the AI suggests as the cause.',
      ],
      'Good people analytics starts with a clear question and privacy-protected data. AI surfaces patterns; HR interprets them in context.',
    ),
    q(
      'hr-q3',
      'responsible',
      'A manager asks HR to use an AI tool to monitor employees’ WhatsApp work-group messages for “negative attitudes”.',
      'What is the most appropriate HR response?',
      [
        'Decline — this is intrusive and likely unlawful without a legitimate purpose, policy and consent; suggest transparent alternatives such as anonymous engagement surveys.',
        'Agree, as long as employees are not told, so that results are honest.',
        'Agree, but only monitor employees the manager is concerned about.',
        'Agree, because messages in work groups belong to the employer.',
      ],
      'Covert AI surveillance erodes trust and can breach privacy and labour law. HR should protect employees while still helping the manager understand engagement.',
    ),
  ],
  marketing: [
    q(
      'mkt-q1',
      'domain',
      'AI generates 20 social-media posts for the launch of Mazowe Fresh Juices’ (fictional) new low-sugar drink.',
      'What is the best way to use them?',
      [
        'Select and edit the strongest drafts against the brand voice and audience, check every claim and price, and test a few variants before scaling.',
        'Publish all 20 immediately to maximise reach.',
        'Publish the ones with the most emojis, because they perform best.',
        'Let the AI schedule and publish them without review, because it understands social-media trends.',
      ],
      'AI is a fast first-draft engine. Marketers add brand judgement, accuracy checks and testing before content goes live.',
    ),
    q(
      'mkt-q2',
      'critical',
      'AI segments 15,000 customers and labels one group “low value — stop marketing to them”. Most of that group live in rural areas with limited data access.',
      'What is the best response?',
      [
        'Investigate the segment — low recorded spend may reflect access and channel issues rather than low potential; test channels such as SMS or radio before deciding.',
        'Stop marketing to the group, as the AI recommends.',
        'Delete the group from the customer database to save costs.',
        'Ask the AI to rename the segment so the label sounds less negative.',
      ],
      'Segments reflect the data collected. Critical thinking asks what the data cannot see before acting — and avoids unfairly excluding customers.',
    ),
    q(
      'mkt-q3',
      'verification',
      'An AI-written advert for the new drink says it “boosts immunity and is doctor-recommended”.',
      'What should the marketing officer do?',
      [
        'Remove or substantiate the claims — health claims need evidence and may breach advertising standards; verify every factual claim before publication.',
        'Keep the claims, because AI would not write something untrue.',
        'Keep the claims but make the font smaller.',
        'Change “doctor-recommended” to “recommended by experts” and publish.',
      ],
      'AI readily produces persuasive but unsupported claims. Marketers are responsible for the accuracy and legality of every claim they publish.',
    ),
  ],
  software: [
    q(
      'sw-q1',
      'domain',
      'An AI assistant suggests this code for a customer portal at Bvumba Tech Solutions (fictional): query = "SELECT * FROM accounts WHERE id = \'" + userId + "\'"',
      'What is the main problem?',
      [
        'It is vulnerable to SQL injection — use parameterised queries and review AI-generated code for security flaws.',
        'It is slow, because it uses SELECT *.',
        'It will not compile in any mainstream language.',
        'Nothing — AI-generated code follows security best practice by default.',
      ],
      'AI assistants frequently reproduce insecure patterns from public code. Engineers must review suggestions with a security mindset.',
    ),
    q(
      'sw-q2',
      'responsible',
      'A developer wants to paste the full source of a payment integration — including live API keys — into a public AI assistant to debug it.',
      'What should they do instead?',
      [
        'Remove secrets, share only a minimal reproducible snippet or use an approved enterprise tool, and rotate any keys that may have been exposed.',
        'Paste it — AI providers never store what you type.',
        'Paste it, but ask the AI not to remember the keys.',
        'Email the code to a personal account and paste it from home instead.',
      ],
      'Secrets and proprietary code must not go into unapproved tools. Exposed credentials should be treated as compromised and rotated.',
    ),
    q(
      'sw-q3',
      'domain',
      'AI generates unit tests for a mobile-money fee calculator, and every test passes on the first run.',
      'What should the engineer do next?',
      [
        'Review the tests themselves — check they cover edge cases (zero, limits, rounding in USD and ZiG) and assert correct expected values, not just current behaviour.',
        'Merge immediately, since passing tests prove the code is correct.',
        'Delete the tests, because AI-written tests are never useful.',
        'Ask the AI to generate more tests until coverage reaches 100%.',
      ],
      'Tests generated from the code can simply mirror its bugs. Engineers verify that tests encode the real business rules and edge cases.',
    ),
  ],
  'customer-service': [
    q(
      'cs-q1',
      'domain',
      'A chatbot at Kariba Connect (fictional) is handling billing enquiries. A customer writes that her husband has recently died, his account is still being charged, and she is very distressed.',
      'What should happen?',
      [
        'Escalate promptly to a trained human agent with the conversation context, because this is sensitive and needs empathy and authority to resolve.',
        'Let the chatbot continue with the standard account-closure script.',
        'Ask the customer to email a death certificate to the chatbot and wait.',
        'Close the chat and send an automated survey.',
      ],
      'Good chatbot design includes escalation rules for vulnerable customers and sensitive situations, with a warm hand-over to a person.',
    ),
    q(
      'cs-q2',
      'verification',
      'AI drafts a reply to a complaint about a three-day network outage, promising “a full refund for the whole month”.',
      'What should the agent do before sending?',
      [
        'Check the compensation policy and edit the reply so it offers only what the company has authorised, keeping the empathetic tone.',
        'Send it — generous offers improve customer satisfaction.',
        'Send it, but add that the refund is “subject to approval”.',
        'Delete the refund sentence and send without mentioning compensation at all.',
      ],
      'AI does not know your policies unless given them. Agents must verify commitments before they reach the customer.',
    ),
    q(
      'cs-q3',
      'critical',
      'Management wants to use AI sentiment analysis of 10,000 recorded calls to rate individual agents’ performance.',
      'What is the most sound approach?',
      [
        'Use sentiment trends to find process and training needs, check accuracy on mixed Shona-English calls, and avoid using the scores as the sole basis for judging individuals.',
        'Rank all agents by sentiment score and discipline the bottom 10%.',
        'Trust the scores, because sentiment analysis is always accurate.',
        'Share each agent’s score publicly to motivate the team.',
      ],
      'Sentiment models can misread code-switched language and context. They are useful for trends but unfair as the only measure of a person.',
    ),
  ],
  operations: [
    q(
      'ops-q1',
      'domain',
      'A predictive-maintenance model at Mukuvisi Packaging (fictional) reports a 12% probability that a conveyor gearbox fails in the next 30 days.',
      'How should the maintenance planner interpret this?',
      [
        'As a probability that informs prioritisation alongside inspection results, the asset’s criticality and spares availability — not a certainty either way.',
        'As a guarantee that the gearbox will not fail this month.',
        'As an instruction to replace the gearbox immediately.',
        'As meaningless, because 12% is a low number.',
      ],
      'Predictions are probabilities. Planners combine them with engineering judgement and operational context.',
    ),
    q(
      'ops-q2',
      'critical',
      'An AI demand forecast for maize-meal packaging assumes last year’s pattern will repeat. A new competitor has entered the market and a drought is expected.',
      'What should the planner do?',
      [
        'Adjust the forecast with scenarios for the new information, document the assumptions, and monitor actual orders closely.',
        'Use the forecast unchanged — the model has more data than the planner.',
        'Double the forecast to be safe.',
        'Stop forecasting until conditions return to normal.',
      ],
      'Models learn from the past. When conditions change, planners must challenge assumptions and plan for scenarios.',
    ),
    q(
      'ops-q3',
      'responsible',
      'An AI camera system at the plant detects workers without hard hats. Management proposes using it to fine workers automatically.',
      'What is the most responsible approach?',
      [
        'Use it to support safety coaching and fix root causes, with human review, a clear policy and consultation with workers — not automatic penalties.',
        'Fine workers automatically, because the camera is objective.',
        'Switch the system off, because monitoring is never acceptable.',
        'Use it secretly so that workers do not change their behaviour.',
      ],
      'AI can strengthen safety, but automated penalties without review or consultation are unfair and damage trust. Humans stay accountable.',
    ),
  ],
  management: [
    q(
      'mgmt-q1',
      'domain',
      'AI recommends closing two branches of Zambezi Crest Insurance (fictional) based on last year’s profitability. The analysis excludes agency revenue those branches earn through mobile-money partners.',
      'What should the manager do?',
      [
        'Treat the recommendation as incomplete — add the missing revenue, consider customer and staff impact, and decide through the normal governance process.',
        'Close the branches, because AI analysis is data-driven.',
        'Reject all AI analysis for strategic decisions in future.',
        'Close one branch now and decide about the other later.',
      ],
      'AI recommendations are only as good as their inputs. Leaders test completeness and weigh people, customers and strategy before deciding.',
    ),
    q(
      'mgmt-q2',
      'domain',
      'After new AI tools are introduced, several team members are anxious that their jobs will disappear.',
      'What is the best leadership response?',
      [
        'Communicate openly about how roles will change, involve staff in pilots, invest in reskilling and be honest about what is and is not yet known.',
        'Reassure everyone that nothing will ever change.',
        'Avoid discussing it until decisions are final.',
        'Tell staff that those who do not adapt will be replaced.',
      ],
      'Responsible AI adoption is change leadership: transparency, participation and reskilling build trust and capability.',
    ),
    q(
      'mgmt-q3',
      'responsible',
      'Different teams are using various free AI tools with no guidance. Some have pasted customer data into them.',
      'What should leadership do first?',
      [
        'Introduce a simple AI-use policy — approved tools, data rules, verification and accountability — supported by training.',
        'Ban all AI use permanently.',
        'Let each team decide for itself.',
        'Wait for a data breach before acting.',
      ],
      'Clear, practical governance lets people use AI productively while protecting customers and the organisation.',
    ),
  ],
  agriculture: [
    q(
      'agri-q1',
      'domain',
      'An AI planting-advisory app recommends planting maize on 1 November based on historical averages. This year’s seasonal forecast predicts a late onset of rains in Masvingo province.',
      'What should the extension officer advise?',
      [
        'Combine the app’s advice with the current seasonal forecast and local knowledge — for example staggered planting or drought-tolerant varieties.',
        'Follow the app exactly, because it uses more data than any person.',
        'Ignore both the app and the forecast and plant as usual.',
        'Advise farmers to wait until the app updates itself.',
      ],
      'Historical averages do not capture this season. Good advice blends AI with current forecasts and local expertise.',
    ),
    q(
      'agri-q2',
      'verification',
      'Satellite-based AI monitoring shows a sharp drop in crop vigour on several plots belonging to the Mhondoro Growers Co-operative (fictional).',
      'What should happen before advising farmers on treatment?',
      [
        'Ground-truth by visiting the plots to identify the actual cause — such as fall armyworm, moisture stress or nutrient deficiency.',
        'Recommend pesticide for all flagged plots immediately.',
        'Assume the satellite image is wrong and do nothing.',
        'Ask the AI to guess the cause and send that advice to all farmers.',
      ],
      'Remote sensing shows that something is wrong, not why. Field verification prevents costly and harmful wrong treatments.',
    ),
    q(
      'agri-q3',
      'domain',
      'The co-operative wants to use AI to send weekly advice to 2,000 smallholders, many of whom use basic phones and prefer Shona or Ndebele.',
      'Which approach will work best?',
      [
        'Send short SMS or voice messages in local languages, reviewed by extension officers for accuracy, with a way to ask a person.',
        'Send long English emails generated by AI.',
        'Only serve farmers who own smartphones.',
        'Publish AI advice on a website and assume farmers will find it.',
      ],
      'AI advisory must fit farmers’ channels and languages — with human review so that advice is correct and trusted.',
    ),
  ],
  healthcare: [
    q(
      'hc-q1',
      'domain',
      'At Hillside Community Clinic (fictional), an AI triage tool rates a patient’s chest pain as “low urgency”. The nurse notices sweating and a history of hypertension.',
      'What should the nurse do?',
      [
        'Apply clinical judgement — escalate according to protocol based on the assessment, and report the discrepancy so the tool can be reviewed.',
        'Follow the AI rating, because it is based on thousands of cases.',
        'Ask the patient to wait and re-run the AI tool in an hour.',
        'Send the patient home with self-care advice.',
      ],
      'Clinicians remain responsible for patient safety. AI decision support never overrides clinical signs and protocols.',
    ),
    q(
      'hc-q2',
      'verification',
      'AI drafts discharge summaries from clinicians’ notes to save time.',
      'What control is essential?',
      [
        'A clinician checks every summary against the record — especially medicines, doses and follow-up dates — before signing it.',
        'Spot-check one summary per month.',
        'Let patients point out any errors after discharge.',
        'Ask the AI to mark the summaries it is unsure about and trust the rest.',
      ],
      'Errors in medicines or follow-up can cause serious harm. Every AI-drafted clinical document needs clinician verification.',
    ),
    q(
      'hc-q3',
      'responsible',
      'A researcher wants to share patient records with an external AI vendor to build a malaria-prediction model.',
      'What must be in place first?',
      [
        'Proper approvals, a data-sharing agreement, de-identification, a lawful basis under data-protection law, and sharing only the minimum data needed.',
        'Nothing — research for the public good does not need approval.',
        'A verbal agreement with the vendor.',
        'Removing patient names only, then sharing everything else.',
      ],
      'Health data is highly sensitive. Governance, de-identification and data minimisation protect patients and keep research lawful and trusted.',
    ),
  ],
  education: [
    q(
      'edu-q1',
      'verification',
      'A teacher at Msasa Park Secondary School (fictional) uses AI to create a Form 3 Geography worksheet on Zimbabwe’s natural regions. The worksheet says that Natural Region I receives the least rainfall.',
      'What should the teacher do?',
      [
        'Correct it — Region I receives the highest rainfall and Region V the lowest — and check all AI content against the syllabus and trusted sources.',
        'Use it, since the rest of the worksheet looks correct.',
        'Ask learners to find the error themselves as homework, without telling them there is one.',
        'Ask the AI whether it is sure and use its answer.',
      ],
      'AI can confidently produce factual errors. Teachers must verify content before it reaches learners.',
    ),
    q(
      'edu-q2',
      'domain',
      'A teacher suspects that several learners used AI to write their history essays.',
      'What is the fairest approach?',
      [
        'Talk to learners about their process, use tasks that show thinking (drafts, oral explanation), and apply a clear, fair policy — AI detectors alone are unreliable.',
        'Give zero to any essay an AI detector flags.',
        'Ban all technology from the school.',
        'Ignore it, because AI use cannot be addressed.',
      ],
      'AI detectors produce false positives. Good assessment design and clear policies uphold integrity fairly.',
    ),
    q(
      'edu-q3',
      'domain',
      'A class has learners with very different reading levels. The teacher wants to use AI to differentiate a science text.',
      'Which approach is best?',
      [
        'Ask AI for versions of the text at different reading levels that keep the same key concepts, then check accuracy and suitability before use.',
        'Give weaker readers a shorter version with the difficult concepts removed.',
        'Let each learner use any AI chatbot unsupervised.',
        'Use only the original text, because differentiation is unfair.',
      ],
      'AI makes differentiation faster; teachers make sure every version is accurate and keeps the learning goals.',
    ),
  ],
  'data-analytics': [
    q(
      'da-q1',
      'verification',
      'AI writes a SQL query to calculate monthly revenue per branch for Mopane Retail Group (fictional). The totals come out 12% higher than the finance report.',
      'What should the analyst do?',
      [
        'Investigate — check for joins that duplicate rows, missing filters for returns or voids, and the date field used — then reconcile with finance.',
        'Use the AI figures, since finance reports are often late.',
        'Scale the results down by 12% to match finance.',
        'Ask the AI to rewrite the query until the totals look right.',
      ],
      'Reconciling to a trusted source is the analyst’s key check. One-to-many joins are a common cause of inflated totals.',
    ),
    q(
      'da-q2',
      'critical',
      'AI finds that stores with more staff have higher sales and suggests hiring more staff to increase sales.',
      'What is the flaw in this reasoning?',
      [
        'Correlation is not causation — larger, busier stores may have both more staff and more sales; control for store size and footfall before recommending.',
        'There is no flaw — the data clearly shows staff drive sales.',
        'The analysis should use fewer stores to be accurate.',
        'The flaw is that AI cannot analyse sales data.',
      ],
      'Confounding factors can create misleading correlations. Analysts test causal claims before they drive decisions.',
    ),
    q(
      'da-q3',
      'domain',
      'You ask AI to design an executive dashboard. For 18 months of sales across four regions, it proposes a 3D pie chart.',
      'What should you do?',
      [
        'Replace it with a line chart per region, clear labels and a headline stating the key insight — AI suggestions still need your visualisation judgement.',
        'Keep it — 3D charts look more professional.',
        'Use 18 separate pie charts, one per month.',
        'Present the raw table only.',
      ],
      'Trends over time are clearest as line charts. Analysts apply visualisation principles rather than accepting the first AI design.',
    ),
  ],
};
