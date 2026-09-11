import type { ModuleContent } from '../../types';

/**
 * Shared core modules shown to every profession.
 * Core text stays cross-profession; `domainExamples` and 'ai-example' blocks personalise it.
 * All organisations and people are fictional.
 */

const lines = (...l: string[]) => l.join('\n');

// ───────────────────────────── core-fundamentals ─────────────────────────────

const FUNDAMENTALS: ModuleContent = {
  moduleId: 'core-fundamentals',
  domainExamples: {
    finance: {
      scenario:
        "An accountant at Msasa Mutual uses an AI assistant to turn a trial balance extract into a first-draft management report narrative in minutes. When she asks it for the prevailing ZiG rate to restate some figures, it offers a confident number with no source, so she takes the rate from the official daily publication instead.",
      takeaway: 'Let AI draft the words; take the numbers from your own records and official sources.',
    },
    hr: {
      scenario:
        'An HR officer at Savanna Crest Bank uses AI to draft a job advert and interview questions for a branch teller role in an afternoon rather than a week. She does not let it rank CVs on its own, because the model can repeat biases in its training data and cannot explain its choices.',
      takeaway: 'AI speeds up HR paperwork; decisions about people stay with people.',
    },
    marketing: {
      scenario:
        "A marketing officer at Kopje Foods Ltd asks AI for 20 social media captions for a new maputi snack. The drafts are lively, but several miss local humour and one quotes a price in the wrong currency, so she picks the best five and localises them herself.",
      takeaway: 'AI is a fast idea generator; local judgement turns ideas into content that works.',
    },
    software: {
      scenario:
        'A developer at Mukuvisi Digital uses an AI assistant to generate unit tests and explain an unfamiliar legacy payroll module. It saves hours, but one suggested function calls a library method that does not exist, which he catches when the tests fail.',
      takeaway: 'AI accelerates coding; the engineer still owns correctness.',
    },
    'customer-service': {
      scenario:
        "A contact-centre agent at Kariba Connect uses AI to suggest replies to customers complaining about expired data bundles. The suggestions are polite and quick, but the tool cannot see the customer's account, so she checks the billing record before promising anything.",
      takeaway: 'AI can phrase the reply; only your systems can tell you the facts.',
    },
    operations: {
      scenario:
        "A plant supervisor at Vumba Timber Works uses AI to turn handwritten shift notes into a tidy maintenance log. When he asks it why a saw keeps breaking down, it gives generic reasons, because it has no access to the machine's service history.",
      takeaway: 'AI organises what you give it; it cannot diagnose what it cannot see.',
    },
    management: {
      scenario:
        'The operations director of Shangani Engineering uses AI to summarise three long consultant reports before a board meeting. The summaries help her prepare quickly, but she reads the recommendations in full herself, because that is where the decisions and accountability sit.',
      takeaway: 'Use AI to get up to speed, not to form your final judgement.',
    },
    agriculture: {
      scenario:
        "An extension officer supporting smallholder farmers in Masvingo uses AI to turn planting advice into short, simple Shona messages. When he asks it about this season's rainfall, it gives a generic answer, so he relies on the official seasonal forecast instead.",
      takeaway: 'AI helps communicate advice; local data must come from trusted local sources.',
    },
    healthcare: {
      scenario:
        'A nurse at a district clinic uses AI to draft a patient leaflet on taking malaria medication, in plain English and Ndebele. A clinician checks every dosage statement before printing, because a fluent leaflet with one wrong dose could cause real harm.',
      takeaway: 'Fluent is not the same as safe; clinical facts need clinical checking.',
    },
    education: {
      scenario:
        'A secondary school teacher in Gweru uses AI to create reading questions at three levels for a Form 3 geography lesson. It is quick and helpful, but the passage it wrote about Lake Kariba includes invented dates, so she checks it against the textbook before class.',
      takeaway: 'AI saves preparation time; the teacher remains the subject expert.',
    },
    'data-analytics': {
      scenario:
        "An analyst at Chiedza Microfinance asks AI to explain a messy Excel dataset of loan repayments and suggest a first analysis. It proposes sensible charts, but its 'average default rate' is wrong because it guessed the meaning of columns it could not see properly.",
      takeaway: 'Use AI to plan and explain analysis; compute or verify the numbers yourself.',
    },
  },
  lessons: [
    {
      id: 'core-fundamentals-l1',
      title: 'What AI actually is',
      minutes: 7,
      blocks: [
        {
          type: 'explain',
          title: 'AI in plain language',
          body: "Artificial intelligence is software that learns patterns from data rather than following only hand-written rules. Most workplace AI does narrow jobs: flagging an unusual transaction, predicting demand, sorting emails. It does not understand your work the way you do. It recognises patterns and produces the most likely useful output.",
          bullets: ['Traditional software: follows explicit rules', 'Machine learning: learns patterns from past data', 'Generative AI: creates new text, images or code'],
        },
        {
          type: 'explain',
          title: 'Generative AI and large language models',
          body: 'Assistants such as ChatGPT, Gemini and Copilot run on large language models (LLMs). An LLM is trained on vast amounts of text to predict the next word. That simple mechanism produces fluent drafts, summaries and explanations, but fluency is not accuracy. Unless it is connected to a trusted source, it generates plausible text rather than looking facts up.',
        },
        {
          type: 'example',
          title: 'Same tool, two very different answers',
          scenario:
            'Tariro, an administrator at Kopje Foods Ltd, asks an AI assistant to summarise a 12-page supplier contract. The summary is clear and saves her an hour. She then asks it for the current ZiG exchange rate, and it confidently gives a figure that is weeks out of date.',
          takeaway: 'LLMs are strong at working with text you give them, and unreliable for live facts they must recall.',
        },
        {
          type: 'ai-example',
          title: 'How an LLM would handle your work',
          instruction:
            "For this learner's job title and industry in Zimbabwe, give three short examples of everyday tasks where a large language model genuinely helps (drafting, summarising, restructuring text they provide) and one task where it is likely to give a confident but wrong answer. Explain why in one sentence each. Use fictional names only.",
          fallback: lines(
            'Where an LLM helps in a typical office role:',
            '• Drafting: turning your bullet points into a clear email or memo. It is good at fluent, well-structured text.',
            '• Summarising: condensing a long report or policy you paste in. It works from the text you provide.',
            '• Restructuring: converting messy meeting notes into an action list with owners and dates.',
            '',
            'Where it is likely to be confidently wrong:',
            "• 'What is today's official USD/ZiG rate?' The model recalls patterns from its training data, so it may give an outdated or invented figure. Always use the official published rate.",
          ),
        },
        {
          type: 'interactive',
          title: 'Spot the generative AI',
          prompt: 'Select every example that uses generative AI.',
          mode: 'sort',
          options: [
            { id: 'a', label: 'An assistant drafting a reply to a customer complaint', correct: true, feedback: 'Yes. It generates new text based on the complaint.' },
            { id: 'b', label: 'A spreadsheet formula adding up a column', correct: false, feedback: 'No. This is a fixed calculation rule, not AI.' },
            { id: 'c', label: 'A tool that writes a first-draft job advert from bullet points', correct: true, feedback: 'Yes. Creating a new draft from notes is classic generative AI.' },
            { id: 'd', label: 'A bank system that blocks a card after three wrong PINs', correct: false, feedback: 'No. This is a simple hand-written rule.' },
          ],
        },
        {
          type: 'quiz',
          question: 'Why can an LLM give a fluent answer that is factually wrong?',
          options: [
            'It is designed to mislead users',
            'It predicts likely-sounding text rather than checking facts',
            'It only works properly in English',
            'It deliberately uses outdated data',
          ],
          correctIndex: 1,
          explanation: 'LLMs generate the most plausible next words. Plausible and true often overlap, but not always, and the tone sounds equally confident either way.',
          skillId: 'ai-fundamentals',
        },
      ],
    },
    {
      id: 'core-fundamentals-l2',
      title: 'What AI is good at, and where it falls short',
      minutes: 7,
      blocks: [
        {
          type: 'explain',
          title: 'Where AI shines',
          body: 'Generative AI is genuinely useful for first drafts, summarising long documents, rewording for different audiences, brainstorming options and explaining unfamiliar ideas. These tasks share one feature: you can quickly judge whether the output is good.',
          bullets: ['Drafting and rewriting', 'Summarising and restructuring', 'Brainstorming and explaining', 'Finding patterns in data you provide'],
        },
        {
          type: 'explain',
          title: 'Where AI struggles',
          body: 'AI is weakest where accuracy depends on recalled facts, exact calculation, local context or human judgement. It can invent figures, sources and policies, miss Zimbabwean realities such as ZiG pricing or local regulations, and reflect biases in its training data. It also carries no accountability. You do.',
          bullets: ['Recent or local facts', 'Exact arithmetic and totals', 'Judgements about people', 'Anything it cannot see, such as your files'],
        },
        {
          type: 'interactive',
          title: 'Good fit for AI?',
          prompt: 'Which task is the best fit for a general AI assistant?',
          mode: 'choose-better',
          options: [
            { id: 'a', label: 'Turn my rough meeting notes into a clear action list', correct: true, feedback: 'Correct. You supply the content and can easily check the result.' },
            { id: 'b', label: 'Tell me the exact balance owed by our top ten debtors', correct: false, feedback: 'The assistant cannot see your ledger, so it would have to guess or invent figures.' },
            { id: 'c', label: 'Decide which of two colleagues should be promoted', correct: false, feedback: 'This is a judgement about people that needs context, fairness and accountability.' },
          ],
        },
        {
          type: 'example',
          title: 'The schedule built on guesses',
          scenario:
            "A logistics coordinator at Mazowe Freight asked an AI tool to plan this week's deliveries around load-shedding. It produced a neat timetable, but the outage times were invented, because the tool had never seen the published schedule.",
          takeaway: 'If you have not given the AI the facts, assume it is guessing.',
        },
        {
          type: 'quiz',
          question: 'Which task carries the highest risk if you rely on AI without checking?',
          options: [
            'Rewording an email to sound more polite',
            'Brainstorming names for a staff wellness day',
            'Stating a tax penalty rate in a client letter',
            'Summarising notes you pasted in yourself',
          ],
          correctIndex: 2,
          explanation: 'Specific rates, rules and figures are exactly where AI hallucinates, and an error in a client letter has real consequences.',
          skillId: 'ai-fundamentals',
        },
        {
          type: 'task',
          title: 'Map your week',
          instructions:
            "List five tasks you did this week. Label each one 'AI could draft or speed this up', 'AI could assist, but I must check carefully' or 'Keep human-only'. Choose one task to try with AI in the next few days.",
          hint: 'Tasks that start from text you already have are usually the safest place to begin.',
        },
      ],
    },
    {
      id: 'core-fundamentals-l3',
      title: 'Where AI shows up at work',
      minutes: 6,
      blocks: [
        {
          type: 'explain',
          title: 'Tasks change, roles evolve',
          body: 'AI rarely replaces a whole job. It changes the mix of tasks: routine drafting, sorting and first-pass analysis get faster, while judgement, relationships, checking and decisions become a larger share of the role. Professionals who learn to direct and check AI usually become more valuable, not less.',
          bullets: ['Automate: repetitive, rules-based steps', 'Augment: drafts and analysis you refine', 'Keep human: judgement, empathy, accountability'],
        },
        {
          type: 'example',
          title: 'Augmentation in practice',
          scenario:
            'Loan officers at Chiedza Microfinance used to spend two hours a day writing visit reports. An AI assistant now drafts each report from their voice notes, and officers correct and approve it. The time saved goes into more client visits and closer support for struggling borrowers.',
          takeaway: 'The best AI use frees time for the parts of the job that need a person.',
        },
        {
          type: 'explain',
          title: 'AI you may already use',
          body: 'AI is often built into everyday tools: email that suggests replies, spreadsheets that suggest formulas, phones that transcribe voice notes, banking apps that flag unusual payments and chatbots on help lines. Noticing it helps you use it deliberately and recognise when it might be wrong.',
        },
        {
          type: 'ai-example',
          title: 'AI exposure in your role',
          instruction:
            "For this learner's job title and industry in Zimbabwe, list which typical tasks are likely to be automated, which augmented and which remain human-led, with a one-line reason each. End with one sentence on how the role is transforming. Use an encouraging, role-transformation framing and never suggest the learner will lose their job.",
          fallback: lines(
            'Example: Accounts Officer at a Harare retailer',
            'Likely automated: matching routine supplier invoices to purchase orders. It is rules-based and repetitive.',
            'Augmented: month-end commentary. AI drafts; you add the real business reasons and check the figures.',
            'Augmented: supplier queries. AI suggests replies; you confirm the facts.',
            'Human-led: agreeing payment plans, judging unusual transactions and signing off reports. These need judgement, relationships and accountability.',
            'The shift: less keying and ticking, more analysis, investigation and advice, which are skills that grow your value.',
          ),
        },
        {
          type: 'interactive',
          title: 'Which habit is risky?',
          prompt: 'Four colleagues describe how they use AI. Tap the approach that creates the most risk.',
          mode: 'spot-the-risk',
          options: [
            { id: 'a', label: 'I use it for first drafts, then edit them myself.', correct: false, feedback: 'A healthy habit. You stay in control of the final version.' },
            { id: 'b', label: "I let it write client emails and send them straight away. It's usually right.", correct: true, feedback: "Right. 'Usually right' is not good enough when your name is on the email. Every client-facing output needs a human read." },
            { id: 'c', label: 'I ask it to explain concepts, then confirm with a colleague.', correct: false, feedback: 'Good practice. You treat AI as a starting point and verify it.' },
            { id: 'd', label: 'I never paste confidential data into public tools.', correct: false, feedback: 'Exactly right. This protects clients and your organisation.' },
          ],
        },
        {
          type: 'quiz',
          question: "Which statement best describes AI's impact on most professional roles?",
          options: [
            'Most roles will disappear within a year',
            'AI only affects IT staff',
            'AI changes the mix of tasks, raising the value of judgement and oversight',
            'AI has no real impact on office work',
          ],
          correctIndex: 2,
          explanation: 'AI exposure mostly means task change: routine work is automated or augmented while human judgement, relationships and accountability matter more.',
          skillId: 'ai-fundamentals',
        },
      ],
    },
  ],
};

// ───────────────────────────── core-prompting ─────────────────────────────

const PROMPTING: ModuleContent = {
  moduleId: 'core-prompting',
  domainExamples: {
    finance: {
      scenario:
        "A management accountant at Msasa Mutual needed commentary on a claims spike. Instead of asking the AI to 'explain the claims increase', she gave it the role of insurance analyst, an anonymised USD table and a 100-word limit, asked for each variance in USD and %, and told it to mark any driver she had not supplied as 'to be confirmed'. The draft needed only light editing.",
      takeaway: "Context, format and a 'do not guess' constraint make finance prompts reliable.",
    },
    hr: {
      scenario:
        "Rutendo, an HR officer at Savanna Crest Bank, needed interview questions for a branch customer relations role. Her prompt gave the role profile and the bank's four values, asked for eight competency-based questions with a scoring guide, and ruled out questions about age, marital status, religion or tribe.",
      takeaway: 'Constraints can build fairness into the output from the start.',
    },
    marketing: {
      scenario:
        'A brand officer at Kopje Foods Ltd pasted two past social posts that performed well and asked for five new posts for a cooking oil promotion in the same voice, under 40 words each. She asked for prices as [USD price] and [ZiG price] placeholders so the AI could not invent them.',
      takeaway: 'Examples set the tone; placeholders stop AI inventing facts.',
    },
    software: {
      scenario:
        "A developer at Mukuvisi Digital asked AI to 'fix my code' and got a vague answer. He then gave the language version, the exact error, the expected behaviour and asked for a minimal fix, an explanation and a unit test. The second answer solved the bug in minutes.",
      takeaway: 'Precise context and a defined output turn AI into a useful pair programmer.',
    },
    'customer-service': {
      scenario:
        'A team leader at Kariba Connect asked AI to act as a patient support agent and draft a reply, under 100 words, to a customer whose data bundle expired early during load-shedding. Her prompt required an apology, steps to check bundle validity and an offer to escalate, and ruled out promising refunds. Agents now reuse it as a template.',
      takeaway: 'Constraints stop AI making promises your policy does not allow.',
    },
    operations: {
      scenario:
        'A supply chain officer at Vumba Timber Works asked AI for a weekly delivery plan, then refined it in three turns: adding load-shedding windows, then rainy-season road restrictions, then asking for a table by day and truck. Each round made the plan more realistic.',
      takeaway: 'Iteration turns a generic plan into one that fits local reality.',
    },
    management: {
      scenario:
        "The general manager of Shangani Engineering asked AI to compare two expansion options and 'list the assumptions behind each recommendation'. The answer revealed it had assumed a stable exchange rate, which she then stress-tested with her finance team before the board meeting.",
      takeaway: 'Asking for assumptions exposes exactly where your judgement is needed.',
    },
    agriculture: {
      scenario:
        'An extension officer asked AI for advice on fall armyworm. Adding context about smallholder maize farmers in a dry region with little cash for pesticides, and asking for SMS messages in Shona under 160 characters, produced practical messages he checked with the agronomist before sending.',
      takeaway: 'Local context and format constraints make advice usable in the field.',
    },
    healthcare: {
      scenario:
        'A clinic administrator asked AI to create an appointment reminder template. She supplied the clinic rules, the reading level and the languages needed, and used placeholders such as [Patient first name] and [Date], so no real patient details ever went into the tool.',
      takeaway: 'Placeholders let you get AI help without exposing patient data.',
    },
    education: {
      scenario:
        "A primary school teacher in Chitungwiza asked AI for 'maths worksheets' and got generic sheets. Her improved prompt specified Grade 5 fractions, a market-day context of buying tomatoes and bread in USD, three difficulty levels and an answer key.",
      takeaway: 'Specifying level, context and format produces classroom-ready material.',
    },
    'data-analytics': {
      scenario:
        'Farai, moving from accounts into analytics, asked AI to write a SQL query for monthly sales by branch. He described the table and column names, the data types and the expected output, and asked the AI to explain each clause so he could check it and learn at the same time.',
      takeaway: 'Describe your data precisely and ask AI to explain its working.',
    },
  },
  lessons: [
    {
      id: 'core-prompting-l1',
      title: 'The five-part prompt',
      minutes: 8,
      blocks: [
        {
          type: 'explain',
          title: 'Why prompts matter',
          body: 'AI only knows what you tell it. A vague request gets a generic answer; a clear, structured request gets something close to usable. Good prompting is not a trick. It is the same skill as briefing a capable new colleague who knows nothing about your organisation.',
        },
        {
          type: 'explain',
          title: 'Role, context, task, format, constraints',
          body: 'Strong workplace prompts usually cover five things. You will not always need all five, but running through them turns a guess into a proper brief.',
          bullets: ['Role: who the AI should act as', 'Context: situation, audience and purpose', 'Task: the specific output you need', 'Format and constraints: structure, length, tone, limits'],
        },
        {
          type: 'ai-example',
          title: 'Weak vs strong prompt for your work',
          instruction:
            "Show a weak one-line prompt and a strong five-part prompt (role, context, task, format, constraints) for a common writing task in this learner's role and industry in Zimbabwe. Label each part in the strong prompt, then explain in two sentences why it produces a better result. Use fictional names and no confidential data.",
          fallback: lines(
            "Weak prompt: 'Write an email about the late reports.'",
            '',
            "Strong prompt: 'You are an experienced operations supervisor [role]. Branch teams have sent weekly stock reports late for three weeks, mainly because load-shedding disrupts evening work [context]. Draft an email to the five branch managers asking for reports by Friday 12:00 and offering a morning submission option [task]. Friendly but firm, under 150 words, with a clear subject line and the new deadline in bullet points [format and constraints].'",
            '',
            'Why it works: the AI knows who is writing, why the problem exists and what outcome is needed, so the draft needs minutes of editing instead of a rewrite.',
          ),
        },
        {
          type: 'interactive',
          title: 'Pick the stronger prompt',
          prompt: 'You need a summary of a 20-page leave policy for new staff. Which prompt is strongest?',
          mode: 'choose-better',
          options: [
            { id: 'a', label: "'Summarise this.'", correct: false, feedback: 'No audience, length or focus, so the AI has to guess what matters.' },
            {
              id: 'b',
              label: "'Summarise the attached leave policy for new junior staff in under 200 words, as five plain-English bullet points showing what they must do and by when.'",
              correct: true,
              feedback: 'Strong. It sets the audience, length, format and focus.',
            },
            { id: 'c', label: "'Make this policy shorter and better.'", correct: false, feedback: "'Better' means nothing to the AI unless you say better for whom and how." },
          ],
        },
        {
          type: 'task',
          title: 'Rebuild a prompt',
          instructions:
            "Take a request you might type into an AI tool this week, for example 'write a report on sales'. Rewrite it using role, context, task, format and constraints. Check that someone who has never met you could act on it.",
          hint: 'If your prompt is under 20 words, it is probably missing context or format.',
        },
        {
          type: 'quiz',
          question: "What is most clearly missing from this prompt: 'You are an HR adviser. Write a letter to a staff member.'?",
          options: ['A role for the AI', 'Context about the situation and purpose of the letter', 'The name of the AI model', 'A polite greeting to the AI'],
          correctIndex: 1,
          explanation: 'It has a role and a vague task, but no context. Is it a warning, a promotion or a transfer? Without context the AI will produce something generic.',
          skillId: 'prompt-engineering',
        },
      ],
    },
    {
      id: 'core-prompting-l2',
      title: 'Examples, few-shot prompting and iteration',
      minutes: 8,
      blocks: [
        {
          type: 'explain',
          title: "Show, don't just tell",
          body: 'The quickest way to get the style you want is to include an example. Giving the AI one to three examples of output you like, known as few-shot prompting, helps it match your format, tone and level of detail far better than describing them in words.',
          bullets: ['Use a past good example with sensitive details removed', "Label it: 'Example of the style I want'", 'Ask it to follow the structure, not copy the content'],
        },
        {
          type: 'example',
          title: 'Few-shot in action',
          scenario:
            "Nokuthula, a team leader at Kariba Connect, wanted consistent replies to billing queries. She pasted two anonymised replies written by her best agent and asked the AI to answer five new queries in the same style. The drafts matched the team's tone on the first attempt.",
          takeaway: 'One good example is often worth a paragraph of instructions.',
        },
        {
          type: 'explain',
          title: 'Iterate like a conversation',
          body: "Your first prompt is a starting point. Review the output, then refine it: ask for a shorter version, a different tone, a table instead of paragraphs, or a focus on one issue. Specific feedback such as 'cut the second section and add a deadline' works far better than 'make it better'.",
        },
        {
          type: 'interactive',
          title: 'The better follow-up',
          prompt: 'The AI drafted a staff notice that is too long and too formal. Which follow-up will improve it most?',
          mode: 'choose-better',
          options: [
            { id: 'a', label: "'Try again.'", correct: false, feedback: 'The AI does not know what was wrong, so it may repeat the same problems.' },
            { id: 'b', label: "'That's not good.'", correct: false, feedback: 'Honest, but gives the AI nothing to act on.' },
            { id: 'c', label: "'Cut this to 120 words, use a warmer tone and put the three key dates in bullet points at the top.'", correct: true, feedback: 'Specific, actionable feedback gets a much better second draft.' },
          ],
        },
        {
          type: 'ai-example',
          title: 'A few-shot prompt for your role',
          instruction:
            "Create a few-shot prompt for a repetitive writing task in this learner's role and industry in Zimbabwe: include two short fictional, anonymised examples of the desired output, then a new input, and show the AI's resulting output. Keep it under 180 words.",
          fallback: lines(
            "Prompt: 'You write short, friendly supplier payment updates. Follow the style of these examples.",
            "Example 1. Input: invoice INV-204, approved, paying Friday. Output: Good news: invoice INV-204 has been approved and will be paid this Friday. Thank you for your patience.",
            'Example 2. Input: invoice INV-219, missing delivery note. Output: Thank you for invoice INV-219. We can process it as soon as we receive the signed delivery note. Could you send it this week?',
            "New input: invoice INV-233, amount is USD 120 more than the purchase order.'",
            '',
            'AI output: Thank you for invoice INV-233. The amount is USD 120 higher than our purchase order. Could you send a credit note or confirm the difference so we can process payment?',
          ),
        },
        {
          type: 'quiz',
          question: 'What is few-shot prompting?',
          options: [
            'Asking the AI several unrelated questions at once',
            'Keeping prompts as short as possible',
            'Including a few examples of the output you want in the prompt',
            'Using AI only a few times a day',
          ],
          correctIndex: 2,
          explanation: 'Few-shot prompting means showing the AI a small number of examples so it can copy the pattern, style and structure.',
          skillId: 'prompt-engineering',
        },
      ],
    },
    {
      id: 'core-prompting-l3',
      title: 'Reasoning, assumptions and what never goes in a prompt',
      minutes: 9,
      blocks: [
        {
          type: 'explain',
          title: 'Ask AI to show its working',
          body: 'For analysis or recommendations, ask the AI to list its assumptions, explain its reasoning step by step and say what information is missing. This makes weak logic visible, so you can challenge it before you rely on the answer.',
          bullets: ["'List the assumptions you made.'", "'What would change your conclusion?'", "'What information do you need from me?'"],
        },
        {
          type: 'example',
          title: 'Surfacing a hidden assumption',
          scenario:
            'Farai, an accounts clerk at a Harare retail chain, asked AI why gross margin fell last quarter. It blamed rising supplier prices. When he asked it to list its assumptions, it admitted it had treated all sales as USD. A third were in ZiG, and the exchange-rate movement explained most of the drop.',
          takeaway: 'Asking for assumptions turns a confident answer into one you can test.',
        },
        {
          type: 'explain',
          title: 'Never paste confidential data',
          body: "Public AI tools may store or reuse what you type. Never paste client names, ID or account numbers, salaries, medical details, passwords or unreleased results. Use your organisation's approved tools and anonymise first: replace names with roles, mask identifiers and round or remove sensitive figures.",
          bullets: ["Replace names with 'Client A' or 'Employee 1'", 'Mask account and ID numbers', 'Use approved enterprise tools for sensitive work'],
        },
        {
          type: 'interactive',
          title: 'Spot the risky prompt',
          prompt: 'Which prompt should never be sent to a public AI tool?',
          mode: 'spot-the-risk',
          options: [
            { id: 'a', label: "'Suggest a structure for a quarterly team update.'", correct: false, feedback: 'Safe. There is no confidential information here.' },
            {
              id: 'b',
              label: "'Summarise this complaint: Mrs T. Chikore, ID 63-123456-X-45, account 4410029937, says her loan payment was missed.'",
              correct: true,
              feedback: 'Correct. A name, national ID and account number are personal data that must not leave approved systems. Anonymise first.',
            },
            { id: 'c', label: "'Explain accrual versus cash accounting in simple terms.'", correct: false, feedback: 'Safe. This is a general knowledge question.' },
            { id: 'd', label: "'Make this anonymised paragraph more concise.'", correct: false, feedback: 'Safe, provided it really is anonymised.' },
          ],
        },
        {
          type: 'ai-example',
          title: 'Anonymise before you prompt',
          instruction:
            "Using a realistic fictional document from this learner's role and industry, show an original passage containing confidential details, the anonymised version that is safe to use, and the final prompt. Then list which details were removed and why.",
          fallback: lines(
            "Original (do NOT paste): 'Mr Blessing Mhlanga (account 4410029937, ID 63-123456-X-45) of Borrowdale says a USD 2,450 debit order was taken twice on 3 March.'",
            '',
            "Anonymised: 'A customer says a USD 2,450 debit order was taken twice on 3 March.'",
            '',
            "Safe prompt: 'You are a customer service specialist at a Zimbabwean bank. Draft a short, empathetic reply to a customer reporting a duplicated debit order. Say we are investigating, that any confirmed duplicate will be reversed, and include a placeholder [X working days]. Under 120 words.'",
            '',
            "Removed: name, account number, national ID and suburb. None are needed for a good draft, and the real details are added only inside the bank's own system.",
          ),
        },
        {
          type: 'quiz',
          question: "You want AI help replying to a named client's dispute. What is the best approach?",
          options: [
            'Paste the full email thread so the AI has all the context',
            'Remove names, account numbers and identifying details, then use an approved tool',
            'Use AI only outside working hours when fewer people are online',
            'Paste everything into any free tool as long as you delete the chat afterwards',
          ],
          correctIndex: 1,
          explanation: "The AI does not need identities to draft a good reply. Anonymising and using approved tools protects the client and your organisation.",
          skillId: 'data-privacy',
        },
      ],
    },
  ],
};

// ───────────────────────────── core-verification ─────────────────────────────

const VERIFICATION: ModuleContent = {
  moduleId: 'core-verification',
  domainExamples: {
    finance: {
      scenario:
        'An AI-drafted tax schedule for Rukanda Hardware quoted a VAT rate and a late-payment penalty with great confidence. The accountant checked both against current official tax guidance and found the penalty figure was out of date. She corrected it and recorded the source in her working papers.',
      takeaway: 'Tax rates, penalties and deadlines must always be checked against current official sources.',
    },
    hr: {
      scenario:
        "An AI summary prepared for a new leave policy at Savanna Crest Bank cited a specific section of labour legislation for maternity leave. Rutendo checked with the bank's legal adviser and found the section reference was wrong, even though the general principle was right.",
      takeaway: 'Section numbers and legal citations are classic hallucination points.',
    },
    marketing: {
      scenario:
        "An AI-written brochure for Kopje Foods Ltd claimed the maize meal was 'fortified with 12 essential vitamins' and 'Zimbabwe's most trusted brand'. Neither claim was supported by product data or research, so the marketing officer removed both before printing.",
      takeaway: 'Every product claim needs evidence before it is published.',
    },
    software: {
      scenario:
        'An AI assistant suggested a Python package for validating Zimbabwean phone numbers. The developer at Mukuvisi Digital checked the package registry and found it did not exist, a hallucinated dependency that an attacker could later register with malicious code.',
      takeaway: 'Confirm every suggested library exists and is trustworthy before installing it.',
    },
    'customer-service': {
      scenario:
        "An AI-drafted reply at Kariba Connect told a customer that 'all fibre outages are credited automatically within 24 hours'. The agent checked the service policy, which requires customers to lodge a claim, and corrected the reply before sending it.",
      takeaway: 'Check every promise or policy statement against the official knowledge base.',
    },
    operations: {
      scenario:
        "An AI maintenance summary at Vumba Timber Works described a conveyor bearing as 'within tolerance'. The supervisor checked the raw sensor readings, which showed vibration rising for three weeks, and scheduled an inspection before a breakdown.",
      takeaway: 'When safety or uptime is at stake, check summaries against the raw data.',
    },
    management: {
      scenario:
        "An AI briefing for a Shangani Engineering board meeting stated that a key competitor had 'exited the regional market last year'. The director could find no source for the claim and removed it rather than base a strategy discussion on it.",
      takeaway: 'If you cannot find the source, the claim does not go in.',
    },
    agriculture: {
      scenario:
        'An AI tool gave a tobacco grower a fertiliser rate that seemed high. An agronomist at Mhofu Agro-Dealers checked it against the product label and local recommendations and found the AI had mixed up kilograms per hectare with kilograms per acre.',
      takeaway: 'Sense-check quantities and units against labels and local guidance.',
    },
    healthcare: {
      scenario:
        "An AI-drafted discharge note at a Harare clinic listed an adult dose for a child's medication. The pharmacist caught it during the final check against the formulary, and the clinic now requires a clinician to verify every medication detail in AI-assisted documents.",
      takeaway: 'In healthcare, verification is a patient-safety step, not a formality.',
    },
    education: {
      scenario:
        'A teacher asked AI for five references for an A-Level history project on Great Zimbabwe. Two of the books did not exist. She now asks students to find every source in the library catalogue, and uses the incident to teach why verification matters.',
      takeaway: 'Fabricated references look real until you try to find them.',
    },
    'data-analytics': {
      scenario:
        "An AI analysis reported that customer churn at Chiedza Microfinance 'dropped 30% after the SMS campaign'. The analyst found the later period was missing two branches. Once corrected, the drop was 4% and could not clearly be linked to the campaign.",
      takeaway: 'Check data completeness and question causal claims.',
    },
  },
  lessons: [
    {
      id: 'core-verification-l1',
      title: 'Hallucinations: confident and wrong',
      minutes: 7,
      blocks: [
        {
          type: 'explain',
          title: 'What is a hallucination?',
          body: 'A hallucination is AI output that sounds right but is false: an invented statistic, a policy clause that does not exist, a misquoted regulation or a made-up reference. It happens because LLMs generate likely-sounding text. The tone is equally confident whether the content is true or not.',
        },
        {
          type: 'explain',
          title: 'Where they hide',
          body: 'Hallucinations cluster where precision matters most. Slow down whenever an output contains:',
          bullets: ['Sources, links and citations', 'Specific figures, rates and percentages', 'Real names attached to claims', 'Outdated facts presented as current'],
        },
        {
          type: 'example',
          title: 'The survey that never happened',
          scenario:
            "A research officer at Msasa Mutual asked AI for statistics on mobile money use among Zimbabwean SMEs. It returned neat percentages credited to a '2024 national survey'. When she searched for the survey, it did not exist. The figures had been generated to fit her question.",
          takeaway: 'A specific-looking source is not proof the source exists.',
        },
        {
          type: 'interactive',
          title: 'Which line needs checking first?',
          prompt: 'An AI-drafted briefing contains these statements. Tap the one most likely to be a hallucination.',
          mode: 'spot-the-risk',
          options: [
            { id: 'a', label: 'Clear communication improves team performance.', correct: false, feedback: 'A general, low-risk statement. It is not a precise factual claim.' },
            {
              id: 'b',
              label: 'A 2023 study by the Zimbabwe Institute of Workplace Productivity found 67% of firms raised output by 23% after adopting AI.',
              correct: true,
              feedback: 'Correct. A named institution plus precise percentages is a classic hallucination pattern. Find the original study before using it.',
            },
            { id: 'c', label: 'Staff should be trained before new tools are introduced.', correct: false, feedback: 'A reasonable recommendation, not a checkable fact.' },
            { id: 'd', label: 'Load-shedding can disrupt evening work schedules.', correct: false, feedback: 'Common knowledge in Zimbabwe and low risk.' },
          ],
        },
        {
          type: 'ai-example',
          title: 'A hallucination in your field',
          instruction:
            "Show a realistic example of an AI hallucination in this learner's profession and industry in Zimbabwe, such as an invented figure, source, regulation or policy. Explain how it could be spotted and the consequence if it went uncorrected. Use fictional organisations only.",
          fallback: lines(
            'Example: an AI-drafted client note at an accounting firm',
            "AI wrote: 'Under Section 14(3) of the tax act, SMEs with turnover below USD 240,000 are exempt from quarterly payment dates.'",
            'Why it is suspicious: a precise section number and threshold with no source, exactly the detail LLMs generate to sound authoritative.',
            'How to spot it: look up the section in the official legislation or current revenue authority guidance, or ask a tax colleague.',
            "Consequence if missed: the client skips quarterly payments, incurs penalties and interest, and the firm's credibility is damaged.",
          ),
        },
        {
          type: 'quiz',
          question: 'Why are hallucinations hard to spot?',
          options: [
            'They are always written in capital letters',
            'They are presented with the same confidence and fluency as correct information',
            'They only appear in very long outputs',
            'AI tools label them with a warning',
          ],
          correctIndex: 1,
          explanation: 'Nothing in the tone or style signals a hallucination. Only checking against sources reveals it.',
          skillId: 'ai-verification',
        },
      ],
    },
    {
      id: 'core-verification-l2',
      title: 'Checking against sources and common sense',
      minutes: 7,
      blocks: [
        {
          type: 'explain',
          title: 'Three quick checks',
          body: "You do not need to redo the AI's work; you need to test it. Match key facts to a trusted source, sense-check numbers against what you know, and confirm that the conclusion actually follows from the evidence.",
          bullets: ['Source: can I find it in an original document?', 'Reasonableness: is the size and direction plausible?', 'Logic: does the conclusion follow from the facts?'],
        },
        {
          type: 'example',
          title: 'The number that was too good',
          scenario:
            "An AI summary of Kopje Foods Ltd's quarterly results said sales grew 140% while staff and outlets stayed flat. The sales manager knew that was implausible, checked the source file and found the AI had added the USD and ZiG columns together as if they were one currency.",
          takeaway: 'If a figure surprises you, check it before you share it.',
        },
        {
          type: 'interactive',
          title: 'Reliable ways to verify',
          prompt: 'Select every reliable way to verify an AI output.',
          mode: 'sort',
          options: [
            { id: 'a', label: 'Compare key figures with the source spreadsheet', correct: true, feedback: 'Yes. Tying figures to the source is the strongest check.' },
            {
              id: 'b',
              label: "Ask the same AI 'are you sure?' and accept its reply",
              correct: false,
              feedback: 'Not reliable. The AI may simply repeat itself or change its answer to please you. It is not an independent check.',
            },
            { id: 'c', label: 'Open and read any cited source yourself', correct: true, feedback: 'Yes. This confirms the source exists and says what is claimed.' },
            { id: 'd', label: 'Ask a knowledgeable colleague to review high-stakes content', correct: true, feedback: 'Yes. A second expert pair of eyes is a strong safeguard.' },
          ],
        },
        {
          type: 'explain',
          title: 'Match the effort to the stakes',
          body: 'Not everything needs the same scrutiny. A brainstormed list needs a glance. A client letter, board paper, payslip, dosage or regulatory figure needs line-by-line checking against sources. The higher the impact of an error, the deeper the check and the clearer your record of what you verified.',
        },
        {
          type: 'task',
          title: 'Verify one output',
          instructions:
            'Take an AI output you received recently, or ask AI for five facts about your industry in Zimbabwe. Highlight every figure, name and source. Check at least three against original sources and note what you found.',
          hint: 'Mark each item confirmed, corrected or could not verify, and remove anything you could not verify.',
        },
        {
          type: 'quiz',
          question: "An AI states that your department's costs rose 8% last month. What is the best verification step?",
          options: [
            'Accept it because the figure looks precise',
            'Ask the AI to rephrase the sentence',
            "Recalculate the change from the department's actual cost report",
            'Round it to 10% to be safe',
          ],
          correctIndex: 2,
          explanation: 'Precision is not evidence. Recalculating from the source record is the only way to confirm the figure.',
          skillId: 'ai-verification',
        },
      ],
    },
    {
      id: 'core-verification-l3',
      title: 'Verify before it leaves your desk',
      minutes: 6,
      blocks: [
        {
          type: 'explain',
          title: 'The desk habit',
          body: 'Make one simple rule: nothing AI-assisted leaves your desk until you have read it fully, checked the facts that matter and are willing to put your name to it. Your signature, email or report carries your accountability, not the tool.',
          bullets: ['Read every line', 'Check figures, names, dates and sources', 'Ask: would I defend this if challenged?'],
        },
        {
          type: 'explain',
          title: 'When not to use AI',
          body: "Some tasks should not be handed to AI, or only under strict controls: final decisions about people's jobs, pay, credit or health; anything needing confidential data outside approved tools; legal or regulatory submissions without expert review; and moments that need empathy, such as delivering bad news.",
        },
        {
          type: 'example',
          title: 'Caught at the last step',
          scenario:
            "A payroll officer at Chimanimani Lodges used AI to draft a staff notice on new overtime rates. On her final read she noticed it said 'time and a half on Sundays' when the agreed rate was double time. That one sentence would have triggered dozens of disputes.",
          takeaway: 'The final read is where AI errors are cheapest to fix.',
        },
        {
          type: 'interactive',
          title: 'Under time pressure',
          prompt: 'Your manager needs a board summary within the hour, and you use AI to draft it. Which approach is best?',
          mode: 'choose-better',
          options: [
            { id: 'a', label: 'Send the AI draft as it is. Time is short.', correct: false, feedback: 'Time pressure is exactly when errors slip through, and the board will rely on this summary.' },
            {
              id: 'b',
              label: 'Check every figure against the source report, fix errors, note that AI assisted, then send.',
              correct: true,
              feedback: 'Correct. AI saves drafting time and you spend part of it on verification.',
            },
            { id: 'c', label: 'Avoid AI entirely because it cannot be trusted.', correct: false, feedback: 'Over-cautious. Used with verification, AI can save you valuable time.' },
          ],
        },
        {
          type: 'ai-example',
          title: 'Your verification checklist',
          instruction:
            "Create a short 'before it leaves my desk' checklist (5–6 items) tailored to the outputs this learner typically produces in their role and industry in Zimbabwe, plus one example of a task in their role where AI should not make the decision.",
          fallback: lines(
            'Before it leaves my desk:',
            '1. I have read every line, not just skimmed.',
            '2. Every figure ties to a source I can point to.',
            '3. Names, dates, currencies (USD/ZiG) and units are correct.',
            '4. Every cited source, policy or regulation exists and says what the text claims.',
            '5. Conclusions follow from the evidence, with no invented reasons.',
            '6. I would defend this if my manager, client or auditor challenged it.',
            '',
            'Where AI should not decide: a disciplinary outcome or a credit decline. AI may help organise the facts, but an accountable person makes and documents the decision.',
          ),
        },
        {
          type: 'quiz',
          question: 'Which situation is least appropriate for relying on AI?',
          options: [
            'Drafting an agenda for a team meeting',
            'Suggesting headings for a report',
            'Rewording a notice in plain English',
            'Deciding on its own whether to decline a loan applicant',
          ],
          correctIndex: 3,
          explanation: "Decisions that significantly affect people's lives need human judgement, fairness checks and accountability. AI may inform them but should not make them.",
          skillId: 'critical-thinking',
        },
      ],
    },
  ],
};

// ───────────────────────────── core-responsible ─────────────────────────────

const RESPONSIBLE: ModuleContent = {
  moduleId: 'core-responsible',
  domainExamples: {
    finance: {
      scenario:
        'A credit analyst at Chiedza Microfinance used an approved AI tool to summarise loan files, with borrower names replaced by codes. When it recommended declining a group of informal traders, she reviewed each case herself and approved several with strong mobile money repayment histories.',
      takeaway: 'Protect client data, and keep credit decisions human and fair.',
    },
    hr: {
      scenario:
        "Rutendo was asked to use AI to screen 400 applications at Savanna Crest Bank. She used only the bank's approved tool to summarise CVs against the published criteria, removed names and photos first, and a panel made every shortlisting decision. Candidates were told that AI supported the process.",
      takeaway: 'In HR, privacy, fairness and transparency are built into the process, not added later.',
    },
    marketing: {
      scenario:
        "An agency proposed using AI to generate 'real customer testimonials' for Kopje Foods Ltd. The marketing manager refused because fabricated testimonials would mislead consumers. Instead, the team used AI to help edit genuine customer quotes collected with consent.",
      takeaway: "Never pass off AI-generated content as real people's words.",
    },
    software: {
      scenario:
        "A developer at Mukuvisi Digital nearly pasted a production database connection string and customer records into a public AI tool to debug an error. He stopped, switched to the company's approved assistant and reproduced the problem with synthetic test data.",
      takeaway: 'Secrets and customer data never go into unapproved AI tools.',
    },
    'customer-service': {
      scenario:
        "Kariba Connect's chatbot handles routine bundle queries. Customers are told they are chatting with a bot and can reach a person at any time, and complaints about disconnections go straight to a human agent.",
      takeaway: "Customers deserve to know when they are talking to AI, and a way to reach a person.",
    },
    operations: {
      scenario:
        'Vumba Timber Works introduced AI cameras to detect missing safety gear. After consulting staff, management agreed the footage would be used only for real-time safety alerts, not to discipline individuals, and told workers what is recorded and how long it is kept.',
      takeaway: 'Clear purpose limits and openness build trust in workplace AI.',
    },
    management: {
      scenario:
        'The chief executive of Shangani Engineering issued a one-page AI policy: approved tools only, no confidential data in public tools, AI use disclosed in board papers, and a named manager accountable for every AI-assisted decision. Adoption grew because staff finally knew the rules.',
      takeaway: 'A simple, clear policy enables confident AI use rather than blocking it.',
    },
    agriculture: {
      scenario:
        "A start-up offered a free app that collects farmers' plot locations, yields and phone numbers. Before recommending it, an extension supervisor checked who would own the data, how it would be used, and whether farmers could give informed consent in their own language.",
      takeaway: "Farmers' data deserves the same protection as any customer's.",
    },
    healthcare: {
      scenario:
        'A district hospital trialling an AI triage tool noticed it under-prioritised patients who described symptoms in Shona or Ndebele. Nurses kept the final triage decision, the issue was reported to the supplier, and no patient was ever triaged by the tool alone.',
      takeaway: 'Human oversight catches the bias that testing missed.',
    },
    education: {
      scenario:
        "A college lecturer wanted to upload students' essays, with names and marks, to a free AI tool for feedback. Instead she used the college's approved platform, removed names, and made sure every final mark was her own professional judgement.",
      takeaway: "Learners' work and data need the same care as any personal information.",
    },
    'data-analytics': {
      scenario:
        'An analyst building a customer segmentation model for Msasa Mutual removed names and ID numbers and kept only the fields the analysis needed. Before sharing the results, she checked whether any segment disadvantaged older or rural policyholders.',
      takeaway: 'Data minimisation and fairness checks belong in every analysis.',
    },
  },
  lessons: [
    {
      id: 'core-responsible-l1',
      title: 'Privacy and confidential information',
      minutes: 8,
      blocks: [
        {
          type: 'explain',
          title: 'Why privacy comes first',
          body: 'When you type into an AI tool, that information leaves your hands. Depending on the tool, it may be stored, reviewed by the provider or used to improve the model. Personal and confidential information about clients, patients, learners, staff or your organisation must be protected whichever tool you use.',
        },
        {
          type: 'explain',
          title: "Zimbabwe's data protection context",
          body: "Zimbabwe's Cyber and Data Protection Act sets expectations for how organisations collect, use, store and share personal information. In practice: use personal data only for a clear purpose, share it only with those authorised, and keep it secure. Your organisation's data and AI policies turn this into daily rules. Follow them, and ask when unsure.",
        },
        {
          type: 'interactive',
          title: 'What counts as sensitive?',
          prompt: 'Select every item you should not paste into a public AI tool.',
          mode: 'sort',
          options: [
            { id: 'a', label: "A customer's full name and phone number", correct: true, feedback: 'Yes. This is personal information that identifies an individual.' },
            { id: 'b', label: 'The staff salary schedule', correct: true, feedback: 'Yes. Pay data is confidential and personal.' },
            { id: 'c', label: 'A general question about how to structure a report', correct: false, feedback: 'This is safe. It contains no confidential information.' },
            { id: 'd', label: 'Unreleased quarterly results', correct: true, feedback: 'Yes. Commercially sensitive information must stay in approved systems.' },
          ],
        },
        {
          type: 'example',
          title: 'Convenience over control',
          scenario:
            "An intern at Chiedza Microfinance pasted a spreadsheet of 300 borrowers, with names, national ID numbers and arrears, into a free AI tool to 'tidy the formatting'. No harm was visible, but the data had left the organisation's control, and the incident had to be reported and reviewed.",
          takeaway: 'Convenience is never a reason to move personal data outside approved systems.',
        },
        {
          type: 'ai-example',
          title: 'Privacy risks in your role',
          instruction:
            'List the three most common types of confidential or personal information this learner handles in their role and industry in Zimbabwe. For each, give a practical, safe way to still get AI help, such as anonymising, using placeholders, working from a template or using an approved enterprise tool.',
          fallback: lines(
            'Example: administrator in a professional services firm',
            "1. Client details (names, contacts, ID numbers). Safe approach: replace with 'Client A' and remove identifiers before asking AI to draft a letter.",
            '2. Staff information (salaries, performance notes, medical certificates). Safe approach: ask AI for a template or structure, then complete it yourself in approved systems.',
            "3. Unreleased financial or commercial information. Safe approach: use only your organisation's approved enterprise AI tool, or describe the issue in general terms without figures.",
          ),
        },
        {
          type: 'quiz',
          question: 'What is the safest default when you are unsure whether data can go into an AI tool?',
          options: [
            'Paste it. Most tools are secure',
            "Don't paste it: anonymise it or check your organisation's policy first",
            'Paste only half of it',
            'Use a personal email account to access the tool',
          ],
          correctIndex: 1,
          explanation: 'When in doubt, leave it out. Anonymising or checking policy costs minutes; a data leak can cost trust, money and legal trouble.',
          skillId: 'data-privacy',
        },
      ],
    },
    {
      id: 'core-responsible-l2',
      title: 'Bias, fairness and transparency',
      minutes: 8,
      blocks: [
        {
          type: 'explain',
          title: 'Where bias comes from',
          body: 'AI learns from historical data, and history contains unfairness. If past hiring favoured certain schools, or past lending overlooked rural women, a model trained on that data can repeat the pattern at speed and scale. Bias can also enter through your prompt, the data you supply or how outputs are used.',
        },
        {
          type: 'example',
          title: 'A biased shortlist',
          scenario:
            'A recruitment tool trialled by a Harare firm ranked applicants for an engineering post. Reviewers noticed it consistently scored candidates from two rural provinces lower, because it had learned from ten years of hires dominated by city applicants. The firm paused the tool and returned to structured human review.',
          takeaway: 'An AI that learns from past decisions can inherit past unfairness.',
        },
        {
          type: 'interactive',
          title: 'Highest fairness risk',
          prompt: 'Which use of AI carries the highest fairness risk?',
          mode: 'spot-the-risk',
          options: [
            { id: 'a', label: 'Drafting a friendly welcome email for new staff', correct: false, feedback: 'Low risk. Nobody is being judged or excluded.' },
            {
              id: 'b',
              label: 'Automatically rejecting loan applicants the model scores below 40, with no human review',
              correct: true,
              feedback: "Correct. Automated decisions about people's access to money, without review or appeal, can entrench bias at scale.",
            },
            { id: 'c', label: 'Summarising a public policy document', correct: false, feedback: 'Low fairness risk, though you should still check accuracy.' },
            { id: 'd', label: 'Generating quiz questions for a training session', correct: false, feedback: 'Low risk. A trainer reviews the questions before use.' },
          ],
        },
        {
          type: 'explain',
          title: 'Be transparent',
          body: 'Be open about when AI has helped. Tell your manager or client when work was AI-assisted, label AI-generated content where your policy requires it, and be ready to explain how a recommendation was reached. People affected by AI-supported decisions deserve to know, and to be able to challenge them.',
        },
        {
          type: 'ai-example',
          title: 'A bias check for your work',
          instruction:
            "Give a realistic example of how bias could appear in an AI output in this learner's role and industry in Zimbabwe (for example gender, age, location, language or income), and three practical checks the learner can apply to catch it. Use fictional details only.",
          fallback: lines(
            'Example: AI-drafted shortlist summary for a sales role',
            "How bias appears: the AI rates candidates with 'polished English' higher and marks down simply written CVs, disadvantaging capable applicants from rural schools or those more fluent in Shona or Ndebele.",
            'Checks:',
            '1. Compare outcomes by group (location, gender, age). Is any group consistently ranked lower?',
            '2. Ask whether each criterion is truly needed for the job or is a proxy.',
            '3. Swap one detail (name, school or town) and see whether the output changes.',
          ),
        },
        {
          type: 'quiz',
          question: 'A model trained on ten years of past lending decisions will most likely…',
          options: [
            'Be automatically fair because it relies on data',
            'Ignore any patterns older than a year',
            'Be biased only if someone programmed it deliberately',
            'Reproduce patterns in those decisions, including unfair ones',
          ],
          correctIndex: 3,
          explanation: 'Models learn whatever patterns exist in their training data. If past decisions were unfair, the model can repeat that unfairness unless it is tested and corrected.',
          skillId: 'bias-awareness',
        },
      ],
    },
    {
      id: 'core-responsible-l3',
      title: 'Human oversight, accountability and AI policy',
      minutes: 9,
      blocks: [
        {
          type: 'explain',
          title: 'Humans stay accountable',
          body: "AI can recommend, draft and flag, but a named person remains responsible for decisions and outputs. Human oversight means someone with the right knowledge reviews AI outputs, can override them and understands their limits. 'The system said so' is never an acceptable explanation to a client, regulator or colleague.",
        },
        {
          type: 'explain',
          title: 'Levels of oversight',
          body: 'Match the level of human involvement to the stakes of the decision.',
          bullets: ['Human-in-the-loop: a person approves every output', 'Human-on-the-loop: a person monitors and can step in', 'Human-only: high-stakes judgement calls'],
        },
        {
          type: 'explain',
          title: "Your organisation's AI policy",
          body: 'Most organisations now set rules for AI: which tools are approved, what data may be used, when AI use must be disclosed and who signs off. If your organisation has no policy yet, act as though it does: use approved tools, protect data, disclose AI help and ask your manager when unsure.',
        },
        {
          type: 'example',
          title: 'Accountability in practice',
          scenario:
            "Savanna Crest Bank uses an AI tool to flag transactions for anti-money-laundering review. When an analyst cleared a flagged payment without investigating because 'the model is usually over-cautious', the auditors held her, not the tool, accountable. The bank now requires a written rationale for every cleared alert.",
          takeaway: 'Using AI never transfers your responsibility to the tool.',
        },
        {
          type: 'interactive',
          title: 'A new tool arrives',
          prompt: 'Your team wants to start using a new free AI tool to summarise client meetings. What should you do?',
          mode: 'choose-better',
          options: [
            { id: 'a', label: "Start using it. It's free and saves time.", correct: false, feedback: 'Free tools may store or reuse client conversations. Approval and data handling must come first.' },
            {
              id: 'b',
              label: "Check it is approved under your AI policy, find out what happens to the data, and agree how summaries will be reviewed.",
              correct: true,
              feedback: 'Correct. This enables the benefit while protecting clients and keeping humans accountable.',
            },
            { id: 'c', label: 'Ban all AI use in the team to be safe.', correct: false, feedback: 'Blanket bans push AI use underground. Well-governed use is safer and more productive.' },
          ],
        },
        {
          type: 'ai-example',
          title: 'Oversight in your workflow',
          instruction:
            "Pick one realistic AI-assisted workflow for this learner's role and industry in Zimbabwe and describe, step by step, where human review, sign-off and record-keeping should sit. End with one sentence on what 'human-in-the-loop' means for this learner in practice.",
          fallback: lines(
            'Workflow: an AI-assisted monthly report',
            '1. Prepare anonymised data and use the approved AI tool.',
            '2. AI drafts the narrative and suggests charts.',
            '3. Human review: you check every figure against the source and rewrite any unsupported claim.',
            '4. Sign-off: your manager reviews and approves, and the approver is named on the report.',
            "5. Record: save the prompt, the AI draft and the final version in the working file, and note 'AI-assisted' where policy requires.",
            'For you, human-in-the-loop means no AI output reaches a reader until a named person has reviewed it and accepted responsibility for it.',
          ),
        },
        {
          type: 'quiz',
          question: 'An AI-assisted report you submitted contains an error. Who is accountable?',
          options: ['The AI vendor', 'Nobody, because it was an AI error', 'You, as the person who submitted it', 'The IT department'],
          correctIndex: 2,
          explanation: 'The person who submits or approves AI-assisted work is accountable for it. That is why verification and sign-off matter.',
          skillId: 'responsible-ai',
        },
      ],
    },
  ],
};

export const CORE_CONTENT: ModuleContent[] = [FUNDAMENTALS, PROMPTING, VERIFICATION, RESPONSIBLE];
