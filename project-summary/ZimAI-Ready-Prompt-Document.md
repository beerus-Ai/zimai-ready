# ZimAI Ready — Prompt Document

**Group 4** · 25DM304 · 25DM329 · 25DM331 · 25SM332 · 25DM336

**Live app:** [https://zimai-ready.ai.studio/](https://zimai-ready.ai.studio/)  
**Code:** [https://github.com/beerus-Ai/zimai-ready](https://github.com/beerus-Ai/zimai-ready)

ZimAI Ready was built by giving an AI coding agent (Claude Code) a detailed product specification, then steering it with short follow-up prompts. Google AI Studio was used to connect Gemini, Firebase sign-in and the database, and to host the app. This document collects those prompts in the order they were given.

_Prompts are copied exactly as typed, including spelling. Messages that contained only a greeting, a screenshot, "try again" or an account email address are left out._

## Contents

1. The master build prompt (Stages 1–4)
2. Follow-up prompts
3. The Google AI Studio hand-off prompt

---

## Part 1 — The master build prompt

_Sent as one message on 10 September 2026. It describes the whole product in four stages and ends with instructions on how to build it._

### 1.1 STAGE 1 OF 4 — Platform Foundation, User Experience & AI Readiness Assessment

```text
STAGE 1 OF 4 — Platform Foundation, User Experience & AI Readiness Assessment

You are building a production-quality prototype called "ZimAI Ready", an AI Workforce Readiness, Reskilling and Certification Platform initially designed for Zimbabwean employees and employers.

CORE PROBLEM

AI adoption is changing jobs, workflows and required skills. Many employees know that AI may affect their careers but do not know:

- How exposed their current role is to AI-driven change.
- Whether they are personally prepared to work with AI.
- Which AI skills are relevant to their specific profession.
- Which skills they should learn first.
- Whether they should upskill in their current role or reskill toward another career.
- How to demonstrate to employers that they are genuinely AI-ready.

ZimAI Ready should solve this through:

ASSESS → ANALYSE → RECOMMEND → LEARN → PRACTISE → ASSESS → CERTIFY → CONTINUOUSLY UPSKILL

IMPORTANT PRODUCT PRINCIPLE

This must NOT feel like a generic online course website with an AI chatbot added to it.

AI personalisation must be fundamental to the entire user journey.

==================================================
STAGE 1 OBJECTIVE
==================================================

Build the platform foundation and employee onboarding/readiness assessment.

Do NOT attempt to implement every future feature in this stage.

Create a clean architecture that can be extended in later stages without rebuilding the application.

==================================================
1. BRAND AND DESIGN
==================================================

Product name: ZimAI Ready

Tagline:
"Prepare for the Future of Work."

Supporting statement:
"Discover where you stand, learn what matters, and become AI Ready in your profession."

Create a modern, premium professional interface suitable for employees, employers, universities and corporate training.

The design should feel like a modern AI/SaaS product rather than a traditional school LMS.

Use:
- Clean typography
- Cards
- Progress indicators
- Subtle animations
- Professional icons
- Responsive layouts
- Excellent mobile experience

Use a modern professional colour system with subtle inspiration from Zimbabwe without making the application look governmental.

==================================================
2. LANDING PAGE
==================================================

Create a polished landing page explaining:

- What ZimAI Ready does
- Why AI readiness matters
- Personalised AI learning
- Career transition support
- Domain-specific training
- Employer workforce readiness
- Verifiable AI Ready certification

Primary CTA:
"Check My AI Readiness"

Secondary CTA:
"For Employers"

Include a simple process:

1. Assess
2. Discover your gaps
3. Follow your pathway
4. Practise
5. Get certified

==================================================
3. AUTHENTICATION / DEMO ACCESS
==================================================

Create employee and employer user types.

For prototype/demo purposes, provide simple demo access.

Do not make authentication unnecessarily complicated.

==================================================
4. EMPLOYEE ONBOARDING
==================================================

After employee signup, do NOT immediately show a generic dashboard.

Display:

"Let's understand where you are with AI."

Explain that the assessment takes approximately 2 minutes.

The assessment must be short, visual and engaging.

Use cards, buttons, sliders and multi-select options rather than long text forms.

Use approximately 7–9 questions.

Collect:

1. Industry

Include Zimbabwe-relevant sectors such as:
- Banking & Finance
- Mining
- Agriculture
- Healthcare
- Retail
- Telecommunications
- Government/Public Sector
- Education
- Manufacturing
- Tourism & Hospitality
- ICT/Technology
- Professional Services
- Other

2. Current job role / functional area

Examples:
- Finance & Accounting
- Human Resources
- Software/IT
- Operations
- Marketing
- Sales
- Customer Service
- Administration
- Management
- Engineering
- Procurement
- Data/Analytics
- Other

Allow a specific job title.

3. Years of professional experience.

4. Has your organisation adopted AI?

Options:
- Yes, extensively
- Partially
- Currently experimenting
- Not yet
- I don't know

5. How much is AI currently used in your department?

- Regularly
- Occasionally
- Experimenting
- Never
- Unsure

6. How often do YOU currently use AI at work?

- Daily
- Weekly
- Occasionally
- Never

7. What do you currently use AI for?

Multi-select:
- Writing
- Research
- Data analysis
- Automation
- Coding
- Customer support
- Reporting
- Brainstorming
- Decision support
- I don't currently use AI

8. AI confidence level.

Use a simple visual scale from Beginner to Advanced.

9. Career objective.

Options:
- Become better at my current job
- Become AI-ready in my current profession
- Prepare for future changes to my role
- Transition into another field
- Move into leadership/management
- Build advanced AI skills

If "Transition into another field" is selected, ask which field or role they are interested in.

Keep this conditional question short.

==================================================
5. GEMINI AI READINESS ANALYSIS
==================================================

Use Gemini to analyse the onboarding profile.

Do NOT generate a random readiness score.

The AI should reason using:

- Current profession
- Industry
- AI usage
- AI confidence
- Organisation AI adoption
- Department AI adoption
- Career objectives
- Existing skills
- Target career where applicable

Generate TWO major indicators:

PERSONAL AI READINESS
0–100%

and

WORKPLACE AI EXPOSURE
0–100%

Provide labels such as:

0–25: AI Beginner
26–50: Developing
51–75: AI Capable
76–100: AI Ready

Also determine a priority state.

For example:

High Workplace AI Exposure + Low Personal AI Readiness
= "Priority Upskilling Recommended"

High Personal Readiness + High Exposure
= "Well Positioned"

High Personal Readiness + Low Exposure
= "Future Ready"

==================================================
6. READINESS RESULTS
==================================================

After assessment, create an impressive personalised results screen.

Show:

"Your AI Readiness Profile"

Display:

- Personal AI Readiness Score
- Workplace AI Exposure Score
- Current role
- Industry
- AI readiness level
- Career objective

Gemini should generate a short personalised explanation.

Example:

"You are an HR Officer working in an organisation beginning to adopt AI. Your personal AI usage remains limited while recruitment, reporting and employee analytics are increasingly being augmented by AI."

Then show:

YOUR STRENGTHS

YOUR AI SKILLS GAPS

HOW AI IS CHANGING YOUR ROLE

WHAT YOU SHOULD LEARN NEXT

CAREER OPPORTUNITIES

Keep explanations concise and actionable.

==================================================
7. AI SKILLS PRESCRIPTION
==================================================

Generate a personalised "AI Skills Prescription."

Do not dump a huge course catalogue onto the user.

Recommend approximately 4–7 skills/modules in priority order.

Example for HR:

1. AI Fundamentals for HR
2. Prompt Engineering for HR Professionals
3. AI-Assisted Recruitment
4. HR Analytics with AI
5. AI for Employee Experience
6. Responsible AI & Employee Privacy
7. HR AI Workplace Challenge

Explain WHY each recommendation matters.

==================================================
8. CAREER TRANSITION ANALYSIS
==================================================

If the employee selected a target career, compare:

CURRENT STATE → TARGET STATE

Example:

Accounts Clerk → Data Analyst

Show:

- Transferable existing skills
- Missing skills
- AI-related competencies required
- Career transition readiness percentage
- Recommended learning pathway

Do not imply that AI will definitely eliminate someone's job.

Use responsible wording such as:
"AI exposure", "role transformation", "augmentation", and "skills transition."

==================================================
9. EMPLOYEE DASHBOARD FOUNDATION
==================================================

Create the employee dashboard shell.

Include:

- AI Readiness
- My Learning Path
- Skills
- Assessments
- Career Path
- Certificates

Only fully implement readiness functionality during Stage 1.

Use realistic demo data where necessary.

==================================================
10. DATA ARCHITECTURE
==================================================

Create reusable data models for:

- Users
- Employee profiles
- Employer profiles
- AI readiness assessments
- Industries
- Roles
- Skills
- Learning pathways
- Modules
- Assessments
- Certificates
- Employee progress

Prepare these structures for future stages.

==================================================
STAGE 1 COMPLETION RULE
==================================================

Prioritise:

1. Excellent UX
2. Working onboarding flow
3. Gemini-powered readiness analysis
4. Personalised results
5. AI Skills Prescription
6. Responsive design

Do not build fake buttons.

Buttons that represent future stages may show a tasteful:
"Coming in the next stage"
state.

At the end, ensure Stage 1 works end-to-end:

Landing Page
→ Employee Entry
→ Short Assessment
→ Gemini Analysis
→ AI Readiness Results
→ Skills Prescription
→ Dashboard

Do not remove or redesign working functionality when future stages are added.
```

### 1.2 STAGE 2 OF 4 — Personalised Learning Engine & AI Tutor

```text
STAGE 2 OF 4 — Personalised Learning Engine & AI Tutor

Continue developing the EXISTING ZimAI Ready application.

IMPORTANT:
Do not recreate the application.
Do not remove Stage 1 functionality.
Preserve the current design system, navigation, responsiveness, user profiles, readiness assessment and Gemini integration.

Now implement the learning and upskilling layer.

==================================================
1. PERSONALISED LEARNING PATH
==================================================

Take the AI Skills Prescription generated during Stage 1 and transform it into an interactive learning pathway.

Every employee should receive different recommendations based on:

- Profession
- Industry
- AI readiness
- Skills gaps
- Workplace AI exposure
- Career objective
- Target career
- Previous learning progress

Create:

"My AI Learning Path"

Show:
- Overall progress
- Current module
- Completed modules
- Recommended next module
- Estimated learning time
- Skills being developed

==================================================
2. DOMAIN-SPECIFIC LEARNING
==================================================

Courses must NOT be generic.

Create sample learning pathways for:

- Finance & Accounting
- Human Resources
- Marketing
- Software/IT
- Customer Service
- Operations
- Management
- Agriculture
- Healthcare
- Education

Each should combine:

AI fundamentals
+
profession-specific AI application
+
responsible AI
+
practical workplace usage.

==================================================
3. MICRO-LEARNING
==================================================

Lessons should be short and engaging.

A lesson can contain:

- Short explanation
- Workplace example
- AI-generated example
- Interactive activity
- Quick knowledge check
- Practical task

Avoid pages containing huge amounts of text.

Show progress throughout.

==================================================
4. AI TUTOR
==================================================

Create an integrated Gemini-powered AI Tutor.

The tutor must understand:

- Employee's profession
- Current module
- AI readiness
- Skills gaps
- Career objective
- Learning progress

The tutor should answer questions in context.

Example:

Employee:
"How can I actually use this in accounting?"

Tutor:
Give an accounting-specific explanation rather than a generic AI explanation.

Provide suggested questions such as:

"Explain this more simply"
"Give me an example from my job"
"Test my understanding"
"Show me how I would use this at work"

==================================================
5. ADAPTIVE LEARNING
==================================================

The platform should adapt based on performance.

If a learner struggles with a concept:
- Explain it differently.
- Recommend additional practice.
- Generate another example.
- Delay progression where appropriate.

If the learner demonstrates strong competency:
- Allow faster progression.
- Recommend advanced material.

==================================================
6. PRACTICAL WORKPLACE ACTIVITIES
==================================================

Create profession-specific activities.

Examples:

Finance:
Analyse financial information using AI and verify the AI's conclusions.

HR:
Use AI to develop a recruitment workflow while identifying bias/privacy risks.

Marketing:
Use AI to develop a campaign and evaluate the quality of its output.

Software:
Use AI to assist with debugging while identifying security or correctness problems.

Management:
Use AI to analyse business information without blindly accepting its recommendation.

The learner should submit an answer.

Gemini should evaluate it and provide constructive feedback.

==================================================
7. RESPONSIBLE AI
==================================================

Responsible AI must be included across every pathway.

Teach:

- Privacy
- Confidential information
- Hallucinations
- Verification
- Bias
- Human oversight
- Ethical AI usage
- Appropriate workplace usage

==================================================
8. PROGRESS DASHBOARD
==================================================

Upgrade the employee dashboard.

Show:

AI Readiness
Learning Progress
Skills Acquired
Current Learning Streak
Practical Challenges
Assessment Performance
Next Recommended Action

Create a visual skills map showing:

NEEDS DEVELOPMENT
DEVELOPING
COMPETENT
AI READY

==================================================
9. REASSESSMENT
==================================================

Learning should influence readiness.

After meaningful progress, allow:
"Reassess My AI Readiness"

Gemini should compare the original assessment with demonstrated learning and practical performance.

Show:

Initial AI Readiness: 42%
Current AI Readiness: 67%

Explain what caused the improvement.

==================================================
STAGE 2 COMPLETION
==================================================

The complete employee journey should now be:

Assess
→ Receive Skills Prescription
→ Start Personalised Path
→ Learn
→ Ask AI Tutor
→ Complete Practical Activities
→ Receive AI Feedback
→ Track Skills
→ Reassess Readiness

Do NOT implement final certification yet.
That belongs to Stage 3.
```

### 1.3 STAGE 3 OF 4 — Competency Assessment & AI-Ready Certification

```text
STAGE 3 OF 4 — Competency Assessment & AI-Ready Certification

Continue from the existing application.

DO NOT rebuild Stage 1 or Stage 2.
Preserve all existing functionality and design.

The objective of Stage 3 is to prove whether an employee can APPLY AI effectively in their profession.

IMPORTANT PRINCIPLE:

Watching tutorials must NEVER automatically make someone AI Ready.

Certification requires demonstrated competency.

==================================================
1. AI READINESS ASSESSMENT
==================================================

Create a final assessment combining:

Knowledge
+
AI tool usage
+
Domain application
+
Critical thinking
+
Responsible AI
+
Verification of AI outputs.

Use Gemini to dynamically create domain-specific questions and workplace scenarios.

==================================================
2. PRACTICAL CAPSTONE
==================================================

Every learner must complete a practical workplace challenge.

The challenge should depend on their profession.

Example:

An HR employee receives a fictional recruitment problem and must demonstrate how AI could assist while addressing privacy, fairness, verification and human oversight.

A Finance employee receives fictional financial information and must use AI-assisted reasoning while checking for incorrect conclusions.

Gemini should evaluate:

- Approach
- AI usage
- Domain understanding
- Verification
- Critical thinking
- Responsible AI
- Quality of final result

Provide transparent scoring criteria.

==================================================
3. CERTIFICATION LEVELS
==================================================

Implement:

AI AWARE
Understands AI concepts and risks.

AI CAPABLE
Can effectively use AI for selected professional activities.

AI READY
Can responsibly integrate AI into their professional workflows and demonstrate practical competency.

==================================================
4. CERTIFICATION RULES
==================================================

AI READY should require:

- Required learning pathway completed
- Minimum knowledge assessment score
- Practical assessments completed
- Responsible AI competency passed
- Capstone assessment passed

Do not award certification based purely on course completion.

==================================================
5. CERTIFICATE
==================================================

Generate a professional certificate.

Example:

ZimAI Ready

AI-READY PROFESSIONAL CERTIFICATION

Employee Name

Domain: Finance & Accounting
Competency: AI-Augmented Financial Operations
Readiness Score: 87%
Level: AI READY
Issue Date
Certificate ID

Include a QR code or verification mechanism in the prototype.

Create a public certificate verification page.

Entering the certificate ID should display:

- Certificate holder
- Domain
- Competencies
- AI readiness level
- Issue date
- Verification status

==================================================
6. SKILLS PROFILE
==================================================

Create a shareable AI Skills Profile.

Show verified competencies such as:

AI Fundamentals — Verified
Prompt Engineering — Verified
AI-Assisted Analytics — Verified
Responsible AI — Verified
Domain AI Application — Verified

==================================================
7. CONTINUOUS READINESS
==================================================

AI readiness should not appear permanent.

Add:

"Maintain My AI Readiness"

The system can recommend new learning when:
- Employee goals change
- Their role changes
- They transition careers
- New competencies are required

==================================================
STAGE 3 COMPLETION
==================================================

The employee experience should now support:

Assessment
→ Personalised Learning
→ AI Tutor
→ Practical Work
→ Competency Assessment
→ Capstone
→ AI Ready Decision
→ Verifiable Certificate
→ Continuous Upskilling
```

### 1.4 STAGE 4 OF 4 — Employer Workforce Intelligence, Organisational AI Readiness & Final Product Polish

```text
STAGE 4 OF 4 — Employer Workforce Intelligence, Organisational AI Readiness & Final Product Polish

Continue developing the EXISTING application.

Do not rebuild or remove functionality from Stages 1–3.

==================================================
1. EMPLOYER ONBOARDING
==================================================

Create a short employer onboarding assessment.

Collect:

- Organisation name
- Industry
- Approximate workforce size
- Departments
- Current level of AI adoption
- Departments currently using AI
- AI tools/technologies being introduced
- Departments expected to experience significant AI transformation
- Skills management wants employees to develop

Generate:

ORGANISATION AI MATURITY SCORE

Classify organisations appropriately from early-stage AI adoption through advanced adoption.

==================================================
2. EMPLOYER DASHBOARD
==================================================

Create an executive workforce dashboard.

Example:

148 Employees

31% AI Ready
46% Currently Upskilling
23% Priority Reskilling

Show readiness by department:

Finance — 72%
HR — 61%
Marketing — 84%
Operations — 39%

Use professional charts and visualisations.

==================================================
3. WORKFORCE SKILLS GAP
==================================================

Allow management to identify:

- Most vulnerable skills
- Emerging skills
- Departments requiring attention
- Employees requiring reskilling
- Employees ready for advanced AI responsibilities
- Organisation-wide competency gaps

Generate AI-powered management insights.

Example:

"Operations currently has the largest AI readiness gap. 64% of employees demonstrate low AI competency while the department has high expected AI exposure."

==================================================
4. EMPLOYER-SPECIFIC AI READINESS
==================================================

Allow employers to define AI competencies required by their organisation.

For example:

A bank may prioritise:
- AI governance
- Financial analysis
- Fraud detection awareness
- Data privacy
- Responsible AI

A mining organisation may prioritise:
- Predictive analytics
- Operational optimisation
- AI-assisted maintenance
- Safety
- Data interpretation

Compare employees against these requirements.

==================================================
5. TWO CERTIFICATION TYPES
==================================================

Support:

DOMAIN AI READY

Independently demonstrates readiness within a profession.

and

EMPLOYER AI READY

Demonstrates competency against AI requirements defined by a particular employer.

Clearly distinguish between them.

==================================================
6. EMPLOYEE MANAGEMENT
==================================================

Employer should be able to view employees by:

- Department
- Role
- Readiness
- Learning progress
- Skills gaps
- Certification
- Priority reskilling status

Use realistic fictional Zimbabwean demo employees.

Do not expose unnecessary personal information.

==================================================
7. AI WORKFORCE ADVISOR
==================================================

Create a Gemini-powered Workforce AI Advisor.

Management can ask questions such as:

"Which department should we prioritise?"

"Which skills are we currently missing?"

"Where is our greatest AI readiness risk?"

"What training should Finance receive?"

"How ready are we to introduce AI into customer service?"

The AI must use dashboard/workforce data when responding.

==================================================
8. ZIMBABWE CONTEXT
==================================================

Make the prototype relevant to Zimbabwe.

Use fictional organisations and employees.

Represent industries important to Zimbabwe including:

- Financial services
- Mining
- Agriculture
- Telecommunications
- Retail
- Tourism
- Manufacturing
- Education
- Healthcare
- Government/Public Sector
- Technology

Do not make unsupported claims about specific real Zimbabwean companies.

==================================================
9. FINAL PRODUCT POLISH
==================================================

Now review the ENTIRE application.

Ensure:

- All navigation works.
- No broken buttons.
- No dead pages.
- Loading states exist.
- Empty states exist.
- Error states are handled.
- Mobile layout works.
- Tablet layout works.
- Desktop layout works.
- Gemini failures are handled gracefully.
- AI-generated content has appropriate disclaimers.
- Forms have validation.
- Dashboard data looks realistic.
- Demo data is internally consistent.

Maintain visual consistency across all four stages.

==================================================
10. DEMONSTRATION MODE
==================================================

Make the application excellent for a university demonstration.

Provide fictional demo profiles for:

EMPLOYEE DEMO:
An employee with moderate workplace AI exposure but low personal AI readiness.

CAREER TRANSITION DEMO:
An Accounts Clerk attempting to transition toward Data Analytics.

EMPLOYER DEMO:
A fictional Zimbabwean organisation with several departments at different AI readiness levels.

Ensure these scenarios demonstrate the platform's major features without requiring extensive setup.

==================================================
FINAL PRODUCT JOURNEY
==================================================

The finished ZimAI Ready ecosystem should demonstrate:

EMPLOYEE:

Sign Up
↓
2-Minute AI Assessment
↓
Personal AI Readiness
+
Workplace AI Exposure
↓
Skills Gap Analysis
↓
AI Skills Prescription
↓
Personalised Learning
↓
AI Tutor
↓
Workplace Challenges
↓
Readiness Reassessment
↓
Final Practical Assessment
↓
AI Ready Certification
↓
Continuous Upskilling


EMPLOYER:

Organisation Assessment
↓
AI Maturity Profile
↓
Workforce Dashboard
↓
Department Readiness
↓
Skills Gap Analysis
↓
Targeted Reskilling
↓
Employee Progress
↓
Domain / Employer Certification
↓
Workforce AI Intelligence

FINAL PRODUCT PRINCIPLE:

ZimAI Ready should answer three questions exceptionally well:

FOR THE EMPLOYEE:
"How is AI affecting my career, and what should I learn next?"

FOR THE CAREER TRANSITIONER:
"What skills do I already have, what am I missing, and how do I become ready for my next role?"

FOR THE EMPLOYER:
"Is our workforce actually ready for AI transformation, and where should we invest in reskilling?"

The final application should feel like an AI workforce intelligence and transformation platform — NOT simply an online course platform.
```

### 1.5 Closing instruction

```text
run multiple agents at the same time to complete it fast After you complete, I'm going to import this project into Google AI Studio, and it's going to connect Google Firebase, the Google login, and all the necessary items in the database. After you have designed everything, that's what we are going to be doing. You complete what you think you can, and leave the rest to Google AI Studio. Give me a prompt, and make sure that I don't have prompts for Google AI Studio. Make sure that whatever Google AI Studio is going to do is not a lot of work. It's very simple.
```

## Part 2 — Follow-up prompts

### Publishing the code to GitHub
_11–12 September 2026_

**1.**

> push it to GitHub so I can import it

_What it did:_ Pushed the finished four-stage build to GitHub so it could be imported elsewhere.

**2.**

> run the projectand let me

_What it did:_ Started the app locally so the team could test it.

**3.**

> create a github repo and upload  at beerus-Ai

_What it did:_ Created the zimai-ready repository under the beerus-Ai account and uploaded the code.

**4.**

> make it public

_What it did:_ Made the repository public so Google AI Studio could import it.

**5.**

> how do i run the app

_What it did:_ Gave instructions for running the app locally.

### Handing over to Google AI Studio
_13 September 2026_

**6.**

> are we ready for aistudio

_What it did:_ Checked the build was ready for Google AI Studio.

**7.**

> Okay, did you connect to GitHub? What I want you to do is to give me the GitHub link that you have created, so that I then go to AI Studio and give it the GitHub link to the code that you have done. The prompt should tell it what to do with that code in GitHub to implement it further.

_What it did:_ Produced the AI Studio hand-off prompt (reproduced in Part 3 below).

**8.**

> yes and open browswe to googleai studio and i login then you proceed with the rest

_What it did:_ Opened Google AI Studio in the browser for the team to sign in.

**9.**

> logged in proceed

_What it did:_ Continued the import in AI Studio.

**10.**

> lets upload

_What it did:_ Switched to uploading the project files.

**11.**

> the handshake is failing I IT NOW Wise to updload to google drive and give it access

_What it did:_ Explored Google Drive as a route because the GitHub connection kept failing.

**12.**

> isnt it wwise for google ai studion to first create something very small ,connect to github ,then i pull that repo replace it with my code because the handshake there is an error

_What it did:_ Considered starting a small AI Studio app first and replacing its code.

**13.**

> the reason why inned google ai studio is the free deployement  since i dont have enough prompts to develop using it soo the idea was teh connection and database and histosting is fir google ai studio then the design is for us

_What it did:_ Set the division of labour: AI Studio handles connections, database and hosting; the team owns the design and features.

**14.**

> wait how about you updload the files in google drive then let it aceess the files from there

_What it did:_ Tried giving AI Studio the files through Google Drive.

**15.**

> ipotted the filesin google ai studio

_What it did:_ The team imported the files into AI Studio.

**16.**

> do it for me and make the system work

_What it did:_ Connected the Firebase project (Google sign-in and Firestore) and added hosting config.

**17.**

> yes and run the prompt now that and let me test the app when it working then deploy

_What it did:_ Ran the hand-off prompt in AI Studio, tested the app, then deployed.

### Redesign: look, animation and calmer dashboards
_13 September 2026_

**18.**

> working perfectly nicely done now i want use to redsign to a more https://wisprflow.ai/notetaker kind like design very animated tutorials can have animations like  the ghosted animation on claude for ignito mode and some crazy designs and fonts  like https://wisprflow.ai/notetaker and also i need images of illustration  to show work etc  then once done update repo then update the import on aigoogle studio

_What it did:_ Started the redesign: warm editorial style, ghost mascot animations, new fonts, illustrations and photos.

**19.**

> also try to have less text minimalistics like how apple do it

_What it did:_ Cut copy down to a minimal, Apple-like style.

**20.**

> show me when done dont hesitate to use 3d animations like 3js or paralax effects or gifs etc

_What it did:_ Added parallax, tilt and looping animated demos.

**21.**

> the card of ai at work everywhere should should be moveing like a caurasel , remove  teh 3D jelly ghost part and put the part 'Your workforce, at a glance.' going foward  up to find out where you stand  then after that  you put We needed to know who was ready — and what to teach next. forward

_What it did:_ Made the 'AI at work' photos a moving carousel, removed the 3D ghost and reordered the landing page.

**22.**

> replace  tendai accountant image and dreplace with how it works part and on how it works on every stage demonstrate by a small git and text should be animated that explain how it works increase the amount of dscription there eg for assess  it will explaining that  how the asessment works

_What it did:_ Replaced the hero image with an interactive 'How it works' showcase: a looping demo and animated explanation for each stage.

**23.**

> now go to the dashboard dont bombard the user with  everything minimize something and and one is accesssing the dashboard and the user can enlarge if hewants  make it clean and not over welming

_What it did:_ Reduced the employee dashboard to one next step and four key numbers, with details in collapsible sections.

**24.**

> do the same for the employer dashboard

_What it did:_ Applied the same calmer layout to the employer dashboard.

**25.**

> push to github and update ai studio

_What it did:_ Pushed the redesign to GitHub and updated the AI Studio app.

**26.**

> both working now publish it

_What it did:_ Published the live app.

### Project summary and this document
_13–15 September 2026_

**27.**

> perfect now create a folder and  1 page pdf with explanation of what the project is all about and it for group 4 with roll number 25DM329,25DM331,25SM332,25DM336

_What it did:_ Created the one-page project summary PDF for Group 4.

**28.**

> in the project summary put 25DM304 AS WELL  AND ALSO CREATE A PROMPT DOCUMENT WITH THE PROMPTS THAT CAME UP WITH THIS SYSTEM

_What it did:_ Added 25DM304 to the summary and created this prompt document.

**29.**

> INCLUDE the clickable link https://zimai-ready.ai.studio/ in the documents

_What it did:_ Added the clickable live-app link to the project summary and this document.

## Part 3 — The Google AI Studio hand-off prompt

_Pasted once into Google AI Studio (Build mode) so it would connect services without redesigning the app._

```text
Import the code from this public GitHub repository and use it as the complete
source for this app:

https://github.com/beerus-Ai/zimai-ready   (branch: main)

This is a FINISHED React 19 + TypeScript + Vite app called "ZimAI Ready" — an AI
workforce readiness, reskilling and certification platform for Zimbabwean
employees and employers. Every screen and all four stages (Readiness Assessment,
Learning Path, Certification, Employer Workforce Analytics) are already built and
the project typechecks and builds cleanly.

DO NOT redesign, restructure, rename, rewrite or remove anything. Do not
regenerate components or "improve" the UI. Your only job is to connect services,
in 4 small steps:

1. GEMINI — Gemini is already wired up in services/gemini.ts, which reads the key
   from process.env.GEMINI_API_KEY / process.env.API_KEY (injected via the
   `define` block in vite.config.ts). Just ensure the AI Studio Gemini key is
   injected. The model list is GEMINI_MODELS in config.ts
   ('gemini-2.5-flash' -> 'gemini-flash-latest' -> 'gemini-2.0-flash') and it falls
   back automatically. If the first model is unavailable, change ONLY that first
   array entry to the current recommended Gemini Flash model. Change nothing else.

2. FIREBASE — Enable the Firebase integration: create/connect a Firebase project
   with Cloud Firestore and Firebase Authentication with the Google sign-in
   provider enabled. Then paste the Firebase web config into
   services/backend/firebaseConfig.ts (fill the `firebaseConfig` object; set
   `firestoreDatabaseId` only if you created a named database). Write NO other
   Firebase code — Google login, Firestore reads/writes and public certificate
   verification are already implemented in services/backend/firebaseBackend.ts
   and switch on automatically via isFirebaseConfigured() once the config is
   filled in.

3. SECURITY RULES — Deploy the Firestore rules exactly as provided in
   firestore.rules, unmodified. Then add the app's preview/deployed domain under
   Firebase Authentication -> Settings -> Authorised domains.

4. VERIFY — Confirm that:
   • "Continue with Google" appears on /#/login
   • a new Google user can complete the employee readiness assessment and see results
   • an employer can complete organisation onboarding
   • demo profiles on /#/demo still work (they intentionally use browser storage)
   • AI responses are labelled "Gemini AI", not "ZimAI engine"

Keep every offline fallback intact — the app must continue to work end-to-end
even when Gemini or Firebase is unavailable. Report back what you changed,
file by file.
```
