import type { ModuleContent } from '../../types';

/**
 * Education domain content — lesson planning, assessment, personalised learning and learner analytics.
 * Responsible-AI thread: learner privacy, academic integrity, and bias against rural and low-connectivity learners.
 */
export const EDUCATION_CONTENT: ModuleContent[] = [
  // ───────────────────────── edu-planning ─────────────────────────
  {
    moduleId: 'edu-planning',
    lessons: [
      {
        id: 'edu-planning-l1',
        title: 'Planning Lessons with AI as Your Teaching Assistant',
        minutes: 10,
        blocks: [
          {
            type: 'explain',
            title: 'You bring the syllabus and the class; AI brings speed',
            body: 'AI can draft a lesson plan, starter activity, worksheet or marking guide in minutes. The quality depends on what you tell it: the syllabus objective, learners’ level, class size, time and resources. Without that, AI produces generic plans built for classrooms with projectors and reliable internet. You remain the subject expert who checks every fact.',
            bullets: [
              'State the syllabus objective and form or level',
              'Describe class size, time and available resources',
              'Ask for local, familiar examples',
              'Check facts before the lesson, not during it',
            ],
          },
          {
            type: 'interactive',
            title: 'Which prompt will give a better plan?',
            prompt: 'A Form 2 science teacher at a rural day school wants a lesson on photosynthesis. Which prompt is better?',
            mode: 'choose-better',
            options: [
              { id: 'a', label: '"Write a lesson plan on photosynthesis."', correct: false, feedback: 'Too vague. Expect a generic plan that may assume a laboratory, projector or internet access.' },
              { id: 'b', label: '"Write a 40-minute Form 2 lesson plan on photosynthesis for 48 learners. No electricity or lab; we have a school garden, chalkboard and textbooks shared 1:3. Use examples from local crops. Include a starter, a practical activity, 5 check questions with answers, and a homework task that needs no internet."', correct: true, feedback: 'Much better. Level, time, class size, resources and local context produce a plan the teacher can actually use.' },
              { id: 'c', label: '"Write the best photosynthesis lesson in the world with lots of videos."', correct: false, feedback: 'Videos may be impossible without power or data, and "best" gives AI nothing to work with.' },
            ],
          },
          {
            type: 'ai-example',
            title: 'A lesson starter for your subject',
            instruction: "Generate a short lesson starter (5–10 minutes) for a subject and level the learner teaches (infer from their role; default to secondary level). It must use a familiar Zimbabwean context, need no electricity or internet, and include two check questions. Then add one line stating a fact in the starter the teacher should verify before using it.",
            fallback: `Form 3 Geography starter — "Where does our rain come from?" (8 minutes)
1. Ask learners: "Which months do your families plant maize, and why then?" Collect answers on the board (most will say November–December).
2. Explain that Zimbabwe's main rainy season runs roughly November to March, when moist air moves in from the Indian Ocean.
3. Pairs sketch a simple map arrow showing where the moist air comes from.
Check questions: (1) Name the months of the main rainy season. (2) Why do farmers wait for the first good rains before planting?

Teacher check: confirm the explanation of rain-bearing winds matches the textbook and syllabus wording before teaching it.`,
          },
          {
            type: 'example',
            title: 'The confident mistake',
            scenario: 'Mrs Sibanda at Kopje High School (fictional) asked AI for a Form 1 history worksheet. It looked excellent, but one question stated a date for Great Zimbabwe’s construction that was several centuries wrong, and the answer key matched the error. She checked it against the textbook, fixed both, and now spends five minutes checking facts and answer keys in every AI resource.',
            takeaway: 'AI can be fluent and wrong. Check every fact, date and answer key against trusted sources before learners see it.',
          },
          {
            type: 'quiz',
            question: 'What is the most important information to include when asking AI for a lesson plan?',
            options: [
              'Your full name and school address',
              'The syllabus objective, learners’ level, time, class size and available resources',
              'Learners’ names and marks',
              'A request for the longest possible plan',
            ],
            correctIndex: 1,
            explanation: 'Context makes plans usable. Personal details about you or learners are not needed and should not be shared.',
            skillId: 'domain-education',
          },
        ],
      },
      {
        id: 'edu-planning-l2',
        title: 'Differentiated, Inclusive Materials with AI',
        minutes: 10,
        blocks: [
          {
            type: 'explain',
            title: 'One topic, many learners',
            body: 'Most classes mix confident readers, struggling readers and learners with additional needs. AI can quickly rewrite a text at different reading levels, create large-print or audio-friendly versions, draft explanations in Shona or Ndebele and generate extension tasks. Check that simplified versions stay accurate and that examples reflect all your learners’ lives.',
            bullets: [
              'Create two or three reading levels of the same text',
              'Draft local-language support notes for review',
              'Make low-tech versions for learners without devices',
              'Watch for stereotypes and urban-only examples',
            ],
          },
          {
            type: 'interactive',
            title: 'Spot the bias',
            prompt: 'AI generated four word problems for a Grade 6 maths class in a rural school. Which one shows bias that would exclude or stereotype learners?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: '"Tariro sells 24 eggs at the market for $0.20 each. How much does she earn?"', correct: false, feedback: 'Fine — familiar context and a clear problem.' },
              { id: 'b', label: '"The boys calculate the cost of cement while the girls count the dishes for the feast."', correct: true, feedback: 'This reinforces gender stereotypes about who does maths-heavy or technical work. Rewrite with mixed roles.' },
              { id: 'c', label: '"A borehole pumps 1,200 litres a day. How much in a week?"', correct: false, feedback: 'Fine — relevant to many rural communities.' },
              { id: 'd', label: '"A bus leaves Masvingo at 07:45 and arrives 3 hours 20 minutes later. What time does it arrive?"', correct: false, feedback: 'Fine — realistic and neutral.' },
            ],
          },
          {
            type: 'ai-example',
            title: 'Three levels of the same text',
            instruction: "Take a short factual paragraph on a topic the learner might teach (infer from their role; default to a secondary science or geography topic with a Zimbabwean context). Show a prompt asking AI to rewrite it at three reading levels (support, core, extension) without changing the facts. Show the three versions briefly, and one line on what the teacher should check.",
            fallback: `Prompt: "Rewrite this paragraph at three levels — support (short sentences, key words in bold), core, and extension (add one 'why' question). Keep every fact the same."

Original: "Drought occurs when rainfall is much lower than normal for a long period. In Zimbabwe, El Niño years often bring drier rainy seasons, reducing crop yields and water supplies."

Support: "A **drought** is a long time with very little rain. Some years, called **El Niño** years, bring less rain to Zimbabwe. Crops grow badly and water runs short."
Core: the original paragraph.
Extension: the original plus "Why might small grains such as sorghum be a better choice than maize in an El Niño year?"

Teacher check: make sure the support version has not lost or changed any facts.`,
          },
          {
            type: 'example',
            title: 'Planning for load-shedding and no data',
            scenario: 'Mr Ncube at Gwanda Rural Secondary (fictional) used AI to create a revision pack. The first draft relied on online videos. He re-prompted: "Learners have no internet at home and power is unreliable. Make a printable pack with one page per topic and questions answerable from the textbook." Every learner could use the new pack, not just the few with smartphones.',
            takeaway: 'Tell AI about connectivity and resources explicitly — otherwise it designs for the best-resourced learner.',
          },
          {
            type: 'quiz',
            question: 'A teacher uses AI to translate a science explanation into Ndebele for a support group. What should happen before it is used?',
            options: [
              'Nothing — AI translations are always accurate',
              'A fluent speaker checks it, especially the scientific terms, and the teacher confirms the science is unchanged',
              'Translate it back into English using the same AI and assume it is correct',
              'Only use it with learners who are good at English',
            ],
            correctIndex: 1,
            explanation: 'AI translation in local languages can be weak, especially for technical terms. A fluent speaker and the subject teacher should both check it.',
            skillId: 'bias-awareness',
          },
          {
            type: 'task',
            title: 'Adapt one resource',
            instructions: 'Choose one worksheet or text you will use this week. Write a prompt asking AI to produce a support version and an extension version, stating your learners’ level, resources and connectivity. Note two things you will check in the output.',
            hint: 'Include "keep every fact the same" and "use familiar local examples" in your prompt.',
          },
        ],
      },
    ],
    activity: {
      id: 'edu-planning-activity',
      domainId: 'education',
      title: 'Review an AI-Generated Lesson Plan and Quiz',
      scenario: 'You teach Form 2 Geography at Kopje High School (fictional), a mixed urban-and-peri-urban school. A colleague shared an AI-generated lesson plan and quiz on "Zimbabwe’s climate and farming seasons" and suggests the whole department uses it next week. You must review it first.',
      data: `AI-generated lesson plan (excerpt):
- Objective: Learners describe Zimbabwe's climate and its effect on farming.
- Starter: "Zimbabwe's main rainy season is June to August, which is why farmers plant in June."
- Main activity: Learners watch three online videos at home the night before and discuss in class.
- Group task: "Boys will research tractors and irrigation; girls will research cooking with seasonal crops."
- Homework: "Use an AI chatbot to write a 300-word essay about climate change and submit it."

AI-generated quiz and answer key:
1. Which months are the main rainy season? Answer: June–August
2. What type of climate does Zimbabwe mostly have? Answer: Tropical rainforest
3. Name one drought-tolerant crop. Answer: Sorghum
4. What weather pattern often brings drought to southern Africa? Answer: El Niño`,
      task: 'Write your review for the department. Include: (1) your approach, (2) how AI should be used to fix it, with an improved prompt, (3) each factual error and how you verified it, (4) the bias, equity and academic-integrity problems and your safeguards, and (5) your corrected starter, group task, homework and quiz answers.',
      rubric: [
        { criterion: 'Verification & subject accuracy', description: 'Identifies the wrong rainy season (Nov–Mar) and wrong climate type, checks answers against the syllabus or textbook.', weight: 30 },
        { criterion: 'Bias, equity & responsible AI', description: 'Addresses the gender-stereotyped groups, the assumption of home internet, and the homework that encourages undisclosed AI writing.', weight: 30 },
        { criterion: 'Effective AI use', description: 'Gives a clear, context-rich prompt stating level, resources, connectivity and inclusion requirements.', weight: 15 },
        { criterion: 'Quality of revised materials', description: 'Revised starter, tasks and quiz are accurate, inclusive, practical and suited to Form 2.', weight: 25 },
      ],
      skillIds: ['domain-education', 'ai-verification', 'bias-awareness', 'ai-writing'],
      sampleStrongAnswer: `Approach: I checked every fact against our Form 2 textbook and syllabus, then reviewed bias, access and integrity.

Factual errors: the main rainy season is roughly November to March, not June to August — June to August is the cool, dry season. Zimbabwe mostly has a subtropical/tropical savanna climate, not tropical rainforest. Quiz answers 1 and 2 are therefore wrong; 3 and 4 are correct.

Bias and equity: the group task assigns tractors to boys and cooking to girls, reinforcing stereotypes; groups should be mixed with the same task. The main activity assumes home internet and data for online videos, which many learners do not have. The homework asks learners to use an AI chatbot to write their essay — this encourages submitting AI work as their own, and excludes learners without access.

Improved prompt: "Create a 40-minute Form 2 Geography lesson on Zimbabwe's climate and farming seasons for 45 learners. No projector or home internet. Use mixed-gender groups and homework needing no internet. Include a 4-question quiz with answers. List any facts I should verify."

Corrected materials:
Starter: "Which months does your family plant? Why then?" — link to the November–March rains.
Group task: mixed groups compare how farmers in two natural regions plan for the rains.
Homework: interview a family member about how the rains affect their work; write 200 words in your own words.
Quiz answers: 1 November–March; 2 subtropical/tropical savanna; 3 sorghum; 4 El Niño.`,
    },
  },

  // ───────────────────────── edu-assessment ─────────────────────────
  {
    moduleId: 'edu-assessment',
    lessons: [
      {
        id: 'edu-assessment-l1',
        title: 'Faster, Fairer Feedback with AI',
        minutes: 12,
        blocks: [
          {
            type: 'explain',
            title: 'AI drafts feedback; the teacher owns the mark',
            body: 'Marking 50 essays can take a whole weekend. AI can suggest rubric-based feedback, draft comments, spot common misconceptions across a class and generate practice questions. It can also be inconsistent, harsh on non-standard English, or plain wrong on subject content. Teachers should moderate AI suggestions and remain responsible for every mark and comment.',
            bullets: [
              'Give AI your rubric and a model answer',
              'Remove learner names before pasting work',
              'Sample-check AI feedback against your own marking',
              'Final marks come from the teacher',
            ],
          },
          {
            type: 'ai-example',
            title: 'Rubric-based feedback in your subject',
            instruction: "Show how a teacher in the learner's subject or level (infer from their role; default to secondary English or history) could prompt AI to draft feedback on an anonymised learner answer, using a short rubric. Show the anonymised answer, the prompt, the AI feedback (strengths, one improvement, one next step), and a note on what the teacher changed after reviewing it.",
            fallback: `Rubric (Form 4 History, 6 marks): 2 marks for identifying causes, 2 for explanation, 2 for using evidence.

Anonymised answer (Learner 14): "The war started because people lost land and they were angry. Also taxes. Many people joined."

Prompt: "Using this rubric, suggest a mark and write feedback for a 15-year-old in encouraging language: one strength, one improvement and one next step. Explain your suggested mark."

AI feedback: "Suggested mark: 2/6. Strength: you identified two causes — land loss and taxes. Improvement: explain how each cause led to anger and action. Next step: add one specific example from your notes."

Teacher review: agreed with 2/6, but added a note praising the learner's clear opening and removed AI jargon ("causal mechanism") that the learner would not understand.`,
          },
          {
            type: 'interactive',
            title: 'Which approach is fairer?',
            prompt: 'A lecturer wants to use AI to help mark 120 first-year reports. Which approach is most responsible?',
            mode: 'choose-better',
            options: [
              { id: 'a', label: 'Let AI mark all reports and release marks automatically', correct: false, feedback: 'No human oversight — errors and bias would reach students directly, and students cannot see how marks were reached.' },
              { id: 'b', label: 'Use AI to draft rubric-based comments on anonymised reports, then moderate a sample and review all borderline and failing grades personally', correct: true, feedback: 'Best. AI saves time on drafting while the lecturer controls quality, fairness and final marks.' },
              { id: 'c', label: 'Paste reports with student names and ID numbers into a free chatbot for speed', correct: false, feedback: 'This exposes personal data and student work to a public tool.' },
            ],
          },
          {
            type: 'example',
            title: 'When AI marked down good ideas',
            scenario: 'At Msasa Park Teachers’ College (fictional), a lecturer noticed AI-suggested marks were consistently lower for students who wrote in less formal English, even when their ideas were strong. She told the AI to "assess content against the rubric; do not penalise grammar unless the rubric includes it" and moderated a sample. The gap narrowed, but she kept checking.',
            takeaway: 'AI can carry language bias. Tell it exactly what to assess and check results across different groups of learners.',
          },
          {
            type: 'quiz',
            question: 'Before pasting learners’ written work into an AI tool for feedback, what should a teacher do?',
            options: [
              'Nothing — learners’ work is not personal data',
              'Remove names and identifying details and use a school-approved tool where available',
              'Ask learners to write their ID numbers at the top',
              'Only use AI for learners who are struggling',
            ],
            correctIndex: 1,
            explanation: 'Learners, often minors, have a right to privacy. Anonymise work and use approved tools that do not reuse data.',
            skillId: 'data-privacy',
          },
        ],
      },
      {
        id: 'edu-assessment-l2',
        title: 'Academic Integrity in the Age of AI',
        minutes: 13,
        blocks: [
          {
            type: 'explain',
            title: 'Design for learning, not just detection',
            body: 'Learners can now generate essays in seconds. AI "detectors" are unreliable: they often flag honest work, especially by second-language English writers, and miss edited AI text. A fairer approach combines clear rules on acceptable AI use, assessments that show thinking (drafts, oral questions, in-class work) and conversations rather than accusations.',
            bullets: [
              'Publish allowed AI use and how to declare it',
              'Assess the process: plans, drafts and reflections',
              'Use short oral follow-ups to check understanding',
              'Never penalise on a detector score alone',
            ],
          },
          {
            type: 'interactive',
            title: 'Spot the unfair response',
            prompt: 'A teacher suspects a learner used AI to write an essay. Which response is unfair?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: 'Giving zero because an online AI detector said "87% AI-generated"', correct: true, feedback: 'Unfair. Detectors produce false positives and cannot prove misconduct. A detector score alone is not evidence.' },
              { id: 'b', label: 'Asking the learner to explain their argument and how they wrote it', correct: false, feedback: 'Fair — a conversation reveals understanding and gives the learner a voice.' },
              { id: 'c', label: 'Comparing the essay with the learner’s earlier in-class writing', correct: false, feedback: 'Reasonable, as one piece of evidence among several.' },
              { id: 'd', label: 'Checking whether the class AI-use rules were clear before the task', correct: false, feedback: 'Fair — learners cannot break rules that were never explained.' },
            ],
          },
          {
            type: 'example',
            title: 'A simple AI-use declaration',
            scenario: 'Kopje High School (fictional) introduced a traffic-light system for assignments. Red: no AI. Amber: AI for brainstorming or checking grammar, declared in one line (e.g. "I used AI to suggest three possible essay titles"). Green: AI encouraged, with prompts attached. Disputes fell, and teachers found learners were more honest when the rules were clear.',
            takeaway: 'Clear, task-by-task rules and honest declaration work better than trying to catch learners out.',
          },
          {
            type: 'ai-example',
            title: 'Redesigning a task to show thinking',
            instruction: "Take a typical take-home assignment for the learner's subject or level (infer from their role; default to a secondary essay). Show how AI can help the teacher redesign it so learners must show their own thinking: add stages (plan, draft, reflection), a local or personal element that AI cannot easily fake, and a short oral check. Show the original and redesigned task briefly.",
            fallback: `Original: "Write a 500-word essay on the causes of drought in southern Africa."

Redesigned (with AI help):
1. Plan (in class): mind-map causes from the textbook.
2. Local evidence: interview an older family member or neighbour about a drought they remember — what happened to crops, water and prices?
3. Draft (in class, 30 minutes): link the interview to at least two causes.
4. Reflection (5 lines): "What surprised me, and what I would investigate next."
5. Oral check: two-minute conversation with the teacher about one point in the essay.
AI use (amber): you may use AI to check spelling and grammar — declare it in one line.`,
          },
          {
            type: 'quiz',
            question: 'Why should AI-detector scores not be used as the sole evidence of cheating?',
            options: [
              'Detectors are too expensive',
              'They are unreliable, produce false positives (often for second-language writers) and can be fooled by editing',
              'Detectors only work in the evenings',
              'Learners never use AI',
            ],
            correctIndex: 1,
            explanation: 'Detector errors can unfairly damage learners’ records and trust. Use them, if at all, as a prompt for conversation, alongside other evidence.',
            skillId: 'bias-awareness',
          },
        ],
      },
    ],
  },

  // ───────────────────────── edu-personalised (advanced) ─────────────────────────
  {
    moduleId: 'edu-personalised',
    lessons: [
      {
        id: 'edu-personalised-l1',
        title: 'Learner Analytics and Early Warnings',
        minutes: 10,
        blocks: [
          {
            type: 'explain',
            title: 'Data can help you notice learners sooner',
            body: 'Attendance, marks, homework completion and learning-platform activity can reveal learners who are falling behind before the end-of-term exam. AI can combine these signals into early-warning flags. But data about learners — often minors — is sensitive, and signals can mislead: low online activity may mean no data bundle, not low effort.',
            bullets: [
              'Use data to start a conversation, not to label',
              'Check what each signal really measures',
              'Limit who can see individual learner data',
              'Watch for bias against rural or low-connectivity learners',
            ],
          },
          {
            type: 'example',
            title: 'The learners who were "disengaged"',
            scenario: 'Northfield College (fictional) introduced an AI dashboard that flagged 38 students as "at risk of dropping out", mostly based on low logins to the online learning platform. A tutor phoned several and found most lived in areas with poor network coverage and downloaded materials at a relative’s house once a week. Their assignment marks were fine. The college removed login counts from the risk score.',
            takeaway: 'Ask what a signal actually measures before acting on it. Activity data often measures access, not effort.',
          },
          {
            type: 'interactive',
            title: 'Spot the harmful use of learner data',
            prompt: 'A school plans four uses of an AI early-warning system. Which one is harmful?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: 'Form teachers receive a weekly list of learners to check in with personally', correct: false, feedback: 'Reasonable — the data prompts a supportive human conversation.' },
              { id: 'b', label: 'Posting a ranked "at-risk" list of named learners on the staffroom noticeboard', correct: true, feedback: 'Harmful. It exposes sensitive information to people who do not need it and risks labelling learners.' },
              { id: 'c', label: 'Reviewing whether flags fall disproportionately on learners from certain areas', correct: false, feedback: 'Good practice — this checks the system for bias.' },
              { id: 'd', label: 'Telling parents what data is collected and why', correct: false, feedback: 'Good — transparency builds trust.' },
            ],
          },
          {
            type: 'ai-example',
            title: 'Asking AI to interpret class data responsibly',
            instruction: "Show a small anonymised class dataset (learner codes, attendance %, two test scores, homework completion) relevant to the learner's teaching level (infer from their role; default to secondary). Show a prompt asking AI to identify learners who may need support and suggest supportive actions, explicitly asking it to note alternative explanations. Show the AI answer.",
            fallback: `Anonymised data (Form 3, fictional):
Code | Attendance | Test 1 | Test 2 | Homework done
L07  | 92%        | 64     | 41     | 9/10
L12  | 68%        | 55     | 52     | 4/10
L19  | 95%        | 72     | 75     | 10/10

Prompt: "Identify learners who may need support and suggest supportive actions. For each, list possible explanations other than lack of effort."

AI answer: "L07: attendance and homework are strong, but the score dropped 23 points — the Test 2 topic may not have been understood, or something may have happened on the day. Suggest a short check-in and a quick re-teach of the topic. L12: low attendance and homework — possible reasons include illness, household duties, transport costs or distance. Suggest a private conversation before any intervention."`,
          },
          {
            type: 'quiz',
            question: 'An AI dashboard flags a rural learner as "low engagement" because they rarely log in to the learning platform. What should the teacher do first?',
            options: [
              'Record the learner as disengaged in their report',
              'Find out whether connectivity or device access explains the low logins, and look at other evidence such as their written work',
              'Reduce the learner’s coursework mark',
              'Ignore the dashboard entirely',
            ],
            correctIndex: 1,
            explanation: 'Low logins often reflect access, not effort. Check context and other evidence before drawing conclusions.',
            skillId: 'bias-awareness',
          },
        ],
      },
      {
        id: 'edu-personalised-l2',
        title: 'AI Tutors and Personalised Practice',
        minutes: 10,
        blocks: [
          {
            type: 'explain',
            title: 'A patient tutor with limits',
            body: 'AI tutors can explain a concept five different ways, generate practice questions at the right level and give instant feedback — at any hour. They can also give wrong answers confidently, do the thinking for the learner, or collect personal data. Good use means teacher-chosen tools, clear rules and activities that make learners think rather than copy.',
            bullets: [
              'Choose tools with clear privacy terms for minors',
              'Set tutors to hint and question, not give answers',
              'Provide offline or printed alternatives',
              'Check the tutor’s content in your subject',
            ],
          },
          {
            type: 'interactive',
            title: 'Which AI tutor set-up is better?',
            prompt: 'A maths department wants to use an AI tutor for Form 4 revision. Which set-up is best?',
            mode: 'choose-better',
            options: [
              { id: 'a', label: 'Learners use any free chatbot at home and paste in homework to get answers', correct: false, feedback: 'Learners get answers without learning, the content is unchecked, and those without devices are left behind.' },
              { id: 'b', label: 'A school-approved tutor set to give hints and ask questions, used in class and in a library slot, with printed practice packs for learners without devices', correct: true, feedback: 'Best. It supports thinking, protects data and ensures every learner has access.' },
              { id: 'c', label: 'Replace the revision lessons with the AI tutor so teachers can focus on admin', correct: false, feedback: 'AI should augment teaching, not replace the teacher’s role in explaining and motivating.' },
            ],
          },
          {
            type: 'ai-example',
            title: 'A tutor that hints instead of answering',
            instruction: "Show a short set of instructions (a 'system prompt') a teacher at the learner's level could give an AI tutor so that it guides learners with hints and questions rather than giving final answers, uses simple English with occasional Shona or Ndebele support words, and never asks for personal information. Then show a short sample exchange with a learner on a topic from their subject.",
            fallback: `Tutor instructions:
"You are a Form 4 maths tutor. Never give the final answer first. Ask one question at a time and give a hint when the learner is stuck. Use simple English. Never ask for the learner's name, school, phone number or address. If a learner seems upset or unsafe, tell them to speak to their teacher."

Sample exchange:
Learner: "Solve 3x + 7 = 22."
Tutor: "Good one! What could you do to both sides to get 3x on its own?"
Learner: "Take away 7?"
Tutor: "Yes! What do you get on the right-hand side?"
Learner: "15. So x is 5!"
Tutor: "Excellent. Can you check it by putting 5 back into the equation?"`,
          },
          {
            type: 'example',
            title: 'Equity by design',
            scenario: 'Mutare Road Primary (fictional) piloted an AI reading app on a few donated tablets. Teachers noticed children with tablets at home were racing ahead. They created a daily 20-minute class rota so every child had tablet time, charged devices during school hours to cope with load-shedding, and kept printed readers for home.',
            takeaway: 'Personalised learning can widen gaps unless access is designed in from the start.',
          },
          {
            type: 'quiz',
            question: 'What is the main risk of an AI tutor that always gives learners the full worked answer immediately?',
            options: [
              'It uses too much electricity',
              'Learners may copy answers without developing their own understanding',
              'Learners will learn too quickly',
              'Teachers will have too much to mark',
            ],
            correctIndex: 1,
            explanation: 'Learning happens through effortful thinking. Tutors that hint and question build understanding; answer machines encourage copying.',
            skillId: 'domain-education',
          },
          {
            type: 'task',
            title: 'Write your AI tutor rules',
            instructions: 'Write four rules you would give learners for using an AI tutor in your subject: one on when to use it, one on what not to share, one on checking its answers, and one on declaring its use.',
            hint: 'Keep the rules short enough to fit on a poster in your classroom.',
          },
        ],
      },
    ],
  },

  // ───────────────────────── edu-challenge ─────────────────────────
  {
    moduleId: 'edu-challenge',
    lessons: [
      {
        id: 'edu-challenge-l1',
        title: 'Challenge Briefing: An Accurate, Inclusive, Honest Unit',
        minutes: 8,
        blocks: [
          {
            type: 'explain',
            title: 'What this challenge tests',
            body: 'You will redesign an AI-generated unit of learning that contains factual errors, stereotypes, access assumptions and a risky data plan. You are assessed on accuracy, inclusion, responsible use of learner data, clear academic-integrity rules and the quality of your redesigned unit — and on how you use AI to help rather than replace your professional judgement.',
            bullets: [
              'Check every fact against the syllabus or textbook',
              'Make sure all learners can take part',
              'Protect learner data',
              'Set clear AI-use rules for learners',
            ],
          },
          {
            type: 'ai-example',
            title: 'Using AI to audit a unit',
            instruction: "Show a prompt an educator in the learner's context could use to ask AI to audit a unit plan for factual accuracy, bias and stereotypes, accessibility for learners without devices or data, and learner-privacy risks. Then show a short AI response with one item the teacher must check themselves because AI cannot be relied upon for it.",
            fallback: `Prompt: "Audit this two-week unit plan for Form 3. List: (1) statements that may be factually wrong, (2) stereotypes or examples that could exclude learners, (3) activities that assume home internet or devices, (4) any risks to learner privacy. Be specific and quote the text."

AI response (excerpt): "(1) 'Vitamin C deficiency causes rickets' — rickets is linked to vitamin D; vitamin C deficiency causes scurvy. (2) The reading describes 'a typical African village' as poor and uneducated — a stereotype. (3) Daily homework requires an app at home. (4) Uploading names and home addresses to a free app."

Teacher check: confirm each flagged fact in the approved textbook — the AI's own corrections could also be wrong.`,
          },
          {
            type: 'interactive',
            title: 'Responsible-AI reminders',
            prompt: 'Which of these belong in your redesigned unit? Select all that apply.',
            mode: 'sort',
            options: [
              { id: 'a', label: 'A clear statement of which tasks allow AI and how to declare it', correct: true, feedback: 'Yes — clear rules support honesty and fairness.' },
              { id: 'b', label: 'Printed or offline alternatives for every digital activity', correct: true, feedback: 'Yes — no learner should be excluded by connectivity or device access.' },
              { id: 'c', label: 'Uploading learners’ names, marks and home addresses to a free app for personalisation', correct: false, feedback: 'No — share minimal data only with approved tools and appropriate consent.' },
              { id: 'd', label: 'Examples from urban and rural Zimbabwean contexts', correct: true, feedback: 'Yes — learners should see their own lives reflected in the materials.' },
            ],
          },
          {
            type: 'quiz',
            question: 'An AI-generated reading passage describes "a typical African village where people are poor and uneducated". What is the best response?',
            options: [
              'Keep it — AI is neutral',
              'Replace it with an accurate, respectful text reflecting real diversity, and check other AI materials for similar bias',
              'Add a note saying "written by AI"',
              'Use it only with urban learners',
            ],
            correctIndex: 1,
            explanation: 'AI can reproduce stereotypes from its training data. Teachers must remove biased content and provide accurate, respectful materials.',
            skillId: 'bias-awareness',
          },
        ],
      },
    ],
    activity: {
      id: 'edu-challenge-activity',
      domainId: 'education',
      title: 'Redesign an AI-Generated Unit: Nutrition and Food Security',
      scenario: 'You are Head of Science at Kopje High School (fictional). A teacher generated a two-week Form 3 unit, "Nutrition and Food Security", using AI. The school wants to adopt it across four classes, including learners from surrounding farming communities with limited connectivity. You must review and redesign it.',
      data: `AI-generated unit outline:
Week 1
- Lesson 1: "Maize is a complete protein and meets all dietary needs on its own."
- Lesson 2: "Vitamin C deficiency causes rickets; vitamin D deficiency causes scurvy."
- Reading: "In a typical African village, people are poor and uneducated, so they do not understand nutrition."
Week 2
- Daily homework: learners use the StudyBuddy AI app (fictional) at home for 30 minutes.
- Final assessment: take-home essay "Solving food insecurity" (no guidance on AI use).

Data plan: "Upload each learner's full name, marks, home address and parents' phone numbers to StudyBuddy (free version) so it can personalise learning."

Class facts: 4 classes, 180 learners; roughly 40% have no smartphone access at home; load-shedding is frequent; the school has one computer lab with 25 machines.`,
      task: 'Submit your redesign. Include: (1) your approach, (2) how you would use AI to help (with at least one prompt), (3) every factual error and bias you found and how you verified them, (4) your learner-privacy and academic-integrity safeguards, and (5) an outline of the redesigned unit, including the final assessment and its AI-use rules.',
      rubric: [
        { criterion: 'Verification & accuracy', description: 'Corrects the maize protein and vitamin errors with reference to trusted sources and explains how facts were checked.', weight: 25 },
        { criterion: 'Inclusion & bias', description: 'Removes the stereotyped reading and designs for learners without devices or connectivity.', weight: 25 },
        { criterion: 'Responsible AI: privacy & integrity', description: 'Rejects the data plan, minimises learner data with consent and approved tools, and sets clear AI-use and declaration rules.', weight: 25 },
        { criterion: 'Quality of redesigned unit', description: 'Coherent, engaging, locally relevant unit with an assessment that shows learners’ own thinking.', weight: 25 },
      ],
      skillIds: ['domain-education', 'ai-verification', 'responsible-ai', 'bias-awareness'],
      sampleStrongAnswer: `Approach: I audited the unit for accuracy, bias, access and privacy, then redesigned it with AI as a drafting assistant, checking facts in our Form 3 textbook.

Errors: maize is not a complete protein — it is low in lysine and tryptophan, so diets need legumes such as beans or groundnuts. The vitamins are swapped: vitamin C deficiency causes scurvy and vitamin D deficiency causes rickets. Both verified in the textbook.

Bias: the "typical African village" reading is a stereotype and would alienate learners from farming communities. I replaced it with a case study of a fictional Chivi family adapting to drought using small grains and a nutrition garden.

Access: 40% of learners have no smartphone at home, so daily app homework is unfair. Digital practice happens in the lab on a class rota, with printed packs for home.

Privacy: I rejected the data plan. Names, addresses and parents' numbers must not go to a free app. If we use a tool, it must be school-approved, with learner codes only and parental consent.

Improved prompt: "Create a 2-week Form 3 nutrition and food-security unit for learners with limited home connectivity. Include local foods, printable activities and a final task showing learners' own thinking. List facts to verify."

Assessment: an in-class project — learners plan a balanced, affordable weekly menu using local foods, with a short oral explanation. AI rule: amber — AI may be used to brainstorm ideas, declared in one line; all writing must be the learner's own.`,
    },
  },
];
