import type { ModuleContent } from '../../types';

/**
 * Software & IT — domain lesson content.
 * All organisations, products, packages and people are fictional.
 */
export const SOFTWARE_CONTENT: ModuleContent[] = [
  // ───────────────────────────── sw-coding ─────────────────────────────
  {
    moduleId: "sw-coding",
    lessons: [
      {
        id: "sw-coding-l1",
        title: "Pair Programming with AI: Context, Small Steps, Your Judgement",
        minutes: 12,
        blocks: [
          {
            type: "explain",
            title: "What AI assistants are good at",
            body: "AI coding assistants excel at boilerplate, translating between languages, explaining unfamiliar code, drafting tests and suggesting refactors. They are weaker on your system's business rules, security and anything outside their training data. Work in small steps: state the goal, give the relevant context, review every diff and run the tests. You own the code you merge.",
            bullets: [
              "Boilerplate and scaffolding",
              "Explaining legacy code",
              "Drafting unit tests",
              "Refactoring suggestions",
            ],
          },
          {
            type: "ai-example",
            title: "A context-rich coding prompt",
            instruction: "Show a vague coding prompt and an improved one for a developer in the learner's industry in Zimbabwe. The improved prompt should state language and framework versions, the function's purpose, business rules (e.g. USD and ZiG amounts in integer minor units), constraints, edge cases, and ask for tests. Then show a short code snippet of the likely output (under 12 lines).",
            fallback: `Vague: "Write a function to calculate transaction fees."

Improved: "TypeScript 5, Node 20. Write a pure function calculateFee(amountCents: number, currency: 'USD' | 'ZIG'): number for a fictional wallet app. Rules: USD fee 1% (min 10, max 500 cents); ZiG fee 1.5% (min 50, max 20,000 minor units). Amounts are integers in minor units, so no floating-point money. Throw on negative or non-integer amounts. Include Jest tests for min, max, boundaries and invalid input."

Likely output (excerpt):
export function calculateFee(amountCents: number, currency: 'USD' | 'ZIG'): number {
  if (!Number.isInteger(amountCents) || amountCents < 0) throw new Error('Invalid amount');
  const [rate, min, max] = currency === 'USD' ? [0.01, 10, 500] : [0.015, 50, 20000];
  return Math.min(max, Math.max(min, Math.round(amountCents * rate)));
}

Still check: is a fee on a zero amount really intended? Ask the product owner, not the AI.`,
          },
          {
            type: "example",
            title: "The confident refactor",
            scenario: "At Zambezi Digital Studio (fictional), Tino asked an AI assistant to 'clean up' a 300-line loan-repayment module in Python. The refactor looked elegant and passed the linter. But the AI had replaced a custom round-half-up helper, required by the lender's contract, with Python's built-in round(), which uses banker's rounding. Unit tests caught a one-cent difference on 3% of repayment schedules.",
            takeaway: "Refactors can silently change business rules. Put strong tests around critical logic before letting AI touch it.",
          },
          {
            type: "interactive",
            title: "Which way of working is best?",
            prompt: "You need to add ZiG support to a payments module. Choose the best way to work with an AI assistant.",
            mode: "choose-better",
            options: [
              { id: "a", label: "Paste the whole repository and ask it to 'add ZiG support everywhere'", correct: false, feedback: "Too broad. Huge diffs are hard to review, and you may leak code or secrets that are not needed." },
              { id: "b", label: "Describe the change, share the relevant module and tests, ask for a plan first, then implement in small reviewed commits", correct: true, feedback: "Correct. Small, well-scoped steps keep you in control and make every change reviewable." },
              { id: "c", label: "Accept the first suggestion that compiles", correct: false, feedback: "Compiling is not correctness. Money logic needs tests and review." },
              { id: "d", label: "Let the assistant edit production configuration directly to save time", correct: false, feedback: "Production changes need human-controlled, audited deployment." },
            ],
          },
          {
            type: "quiz",
            question: "Which task is an AI coding assistant usually most reliable at?",
            options: [
              "Knowing your company's undocumented business rules",
              "Explaining what an unfamiliar regular expression or SQL query does",
              "Guaranteeing that code is free of vulnerabilities",
              "Choosing your system's architecture without context",
            ],
            correctIndex: 1,
            explanation: "Explaining well-known syntax plays to its strengths. Business rules, security guarantees and architecture need your context and judgement.",
            skillId: "ai-coding",
          },
          {
            type: "task",
            title: "Try it: explain, then test",
            instructions: "Pick a small function in your codebase that contains no secrets or customer data. Ask your AI assistant to explain it and propose five edge-case tests. Run the tests and note anything the AI explained wrongly.",
            hint: "Use your organisation's approved AI coding tool rather than a personal account.",
          },
        ],
      },
      {
        id: "sw-coding-l2",
        title: "Reviewing AI Code: You Own the Merge",
        minutes: 13,
        blocks: [
          {
            type: "explain",
            title: "A review checklist for AI-written code",
            body: "Review AI code as you would a new colleague's pull request, with extra scepticism because it is fluent and fast. Check it does what the ticket asks, handles edge cases, fails safely, follows your conventions and uses real, maintained libraries. The name on the commit is yours, not the AI's.",
            bullets: [
              "Correct for the requirement?",
              "Edge cases and errors handled?",
              "Secure, with safe dependencies?",
              "Readable and tested?",
            ],
          },
          {
            type: "interactive",
            title: "Spot the bug",
            prompt: `An AI assistant wrote this Python helper to split a bill for a fictional Bulawayo restaurant POS. Which issue is the real problem?

def split_bill(total_cents, people):
    share = total_cents // people
    return [share] * people`,
            mode: "spot-the-risk",
            options: [
              { id: "a", label: "Using integer cents instead of floats", correct: false, feedback: "Good practice: integers avoid floating-point errors with money." },
              { id: "b", label: "The remainder is lost: 1,000 cents split 3 ways returns only 999 in total", correct: true, feedback: "Correct. The leftover cents vanish. Give one extra cent to the first (total_cents % people) diners, and guard against people <= 0." },
              { id: "c", label: "Using // for integer division", correct: false, feedback: "Integer division is fine; the bug is ignoring the remainder." },
              { id: "d", label: "Returning a list rather than a tuple", correct: false, feedback: "A style choice, not a defect." },
            ],
          },
          {
            type: "example",
            title: "Tests that test nothing",
            scenario: "A developer at Baobab Cover, a fictional Harare insurtech, asked AI to 'write tests to reach 90% coverage'. Coverage jumped to 92%, but many tests only checked that functions ran without throwing; none asserted the premium amounts. A pricing bug that overcharged some motor policies shipped three weeks later.",
            takeaway: "Coverage is not correctness. Review AI-generated tests for meaningful assertions on business outcomes.",
          },
          {
            type: "ai-example",
            title: "AI as reviewer, not approver",
            instruction: "Show a short code snippet (under 8 lines, in a language common in the learner's work) containing a subtle bug relevant to the learner's industry, then a prompt asking AI to review it for correctness, security and edge cases against a stated rule, a sample AI review that finds the bug, and a note on what the human must still check.",
            fallback: `Snippet (JavaScript):
function isEligible(user) {
  return user.age > 18 && user.kycVerified == "true";
}

Prompt: "Review this function for correctness, edge cases and security. Rule: customers must be 18 or older and KYC-verified (kycVerified is a boolean)."

Sample AI review: "1) age > 18 excludes 18-year-olds; use >= 18. 2) kycVerified == "true" compares a boolean with a string, so verified users fail; use === true. 3) A missing user or age silently returns false; validate explicitly."

The human still checks: the real business rule, how age is derived (date of birth, time zone), and that tests cover ages 17, 18 and 19.`,
          },
          {
            type: "quiz",
            question: "An AI-generated pull request passes CI and is merged. It later causes an outage. Who is accountable?",
            options: [
              "The AI tool's vendor",
              "The developer and reviewer who approved and merged it",
              "Nobody, because the tests passed",
              "Only the product owner",
            ],
            correctIndex: 1,
            explanation: "AI is a tool. The people who review and merge code own its consequences, which is why careful review matters.",
            skillId: "ai-coding",
          },
          {
            type: "quiz",
            question: "What is the best way to review a 600-line AI-generated change?",
            options: [
              "Skim it and approve, because AI is usually right",
              "Ask for it to be split into small, focused commits with explanations, then review each with tests",
              "Reject all AI-written code on principle",
              "Merge it and fix problems in production",
            ],
            correctIndex: 1,
            explanation: "Small, explained changes are reviewable. Blanket rejection wastes a useful tool; skimming wastes your role as reviewer.",
            skillId: "critical-thinking",
          },
        ],
      },
    ],
    activity: {
      id: "sw-coding-activity",
      title: "Review an AI-Written Cashback Function Before Merge",
      domainId: "software",
      scenario: "Msasa Pay, a fictional Harare fintech start-up, runs a WhatsApp-first service for buying airtime and prepaid electricity tokens in USD and ZiG. A developer used an AI assistant to write the monthly cashback function below and opened a pull request. You are the reviewer. Business rule from the product owner: 2% cashback on successful purchases in a given calendar month, calculated per currency, capped at USD 10 or ZiG 250 per month.",
      data: `// AI-generated: calculate monthly cashback for a customer
// transactions: [{ date: Date, amount: number, currency: 'USD' | 'ZIG', status: 'success' | 'failed' | 'pending' | 'reversed' }]
function monthlyCashback(transactions, month) {
  let total = 0;
  for (let i = 1; i < transactions.length; i++) {
    const t = transactions[i];
    if (t.date.getMonth() == month && t.status != 'reversed') {
      total += t.amount * 0.02;
    }
  }
  return Math.min(total, 10); // cap: USD 10
}

// Example call in the PR: monthlyCashback(txns, 6) // intended: June 2026`,
      task: "Submit your code review: (1) the bugs and risks you found, with evidence; (2) how you would use AI to help, including your prompts and what you would NOT paste into the tool; (3) how you would verify the fix, including the tests you would write; (4) a corrected function or a precise description of the changes.",
      rubric: [
        { criterion: "Bug identification", description: "Finds the skipped first element, the zero-based month and missing year check, mixed currencies under a single USD cap, floating-point money and failed/pending transactions earning cashback.", weight: 30 },
        { criterion: "Verification & testing", description: "Writes tests before accepting a fix (first element, December/January boundary, same month in another year, mixed currencies, statuses, cap boundaries) and re-checks rules with the product owner rather than the AI.", weight: 25 },
        { criterion: "AI use & prompting", description: "Uses the AI with a clear rule statement and fictional sample data; asks for issues and tests, not just a rewrite.", weight: 20 },
        { criterion: "Responsible AI practice", description: "Keeps customer data and secrets out of prompts, uses approved tools, and takes ownership of the review instead of rubber-stamping an AI fix.", weight: 15 },
        { criterion: "Quality of the fix", description: "Corrected code or description is accurate, readable and handles each currency and edge case.", weight: 10 },
      ],
      skillIds: ["ai-coding", "ai-verification", "critical-thinking"],
      sampleStrongAnswer: "Bugs: (1) the loop starts at i = 1, so the first transaction is always skipped; (2) getMonth() is zero-based, so passing 6 for June actually selects July, and the year is never checked, so June 2025 and June 2026 are mixed together; (3) USD and ZiG amounts are summed and capped at 10 as if everything were USD; (4) money is calculated in floating point; (5) only 'reversed' is excluded, so failed and pending purchases earn cashback.\n\nAI use: in our approved assistant, with fictional sample data only (no customer phone numbers or real transactions), I prompted: 'Review this function against these rules: 2% cashback on successful purchases in a given calendar month and year, per currency, capped at USD 10 or ZiG 250; amounts are integers in minor units. List every bug with the line, then propose Jest test cases.' Then: 'Write the failing tests before changing the code.'\n\nVerification: I confirmed each test failed on the original for the right reason, then passed after the fix. I also asked the product owner what 'month' means, rather than accepting the AI's assumption.\n\nFix: take a year and a 1–12 month; filter status === 'success' and matching getFullYear()/getMonth() + 1; group by currency; compute cashback in integer minor units with Math.floor(amount * 2 / 100); apply per-currency caps of 1,000 US cents and 25,000 ZiG minor units; return { USD, ZIG }. I reviewed the final diff line by line myself before approving.",
    },
  },

  // ───────────────────────────── sw-security ─────────────────────────────
  {
    moduleId: "sw-security",
    lessons: [
      {
        id: "sw-security-l1",
        title: "Insecure Patterns in AI-Suggested Code",
        minutes: 12,
        blocks: [
          {
            type: "explain",
            title: "Why AI suggests insecure code",
            body: "Assistants learnt from vast amounts of public code, including outdated and insecure examples. They often produce code that works in a demo but skips input validation, builds SQL from strings, disables certificate checks or hard-codes credentials. Research has repeatedly found security weaknesses in a notable share of AI suggestions. Security remains your responsibility, not the model's.",
            bullets: [
              "SQL built from strings",
              "Missing input validation",
              "Hard-coded secrets",
              "Disabled TLS checks",
            ],
          },
          {
            type: "interactive",
            title: "Spot the vulnerability",
            prompt: `An AI assistant generated this Python lookup for a fictional bank's customer portal. Which issue is the security risk?

def find_customer(conn, phone):
    sql = f"SELECT * FROM customers WHERE phone = '{phone}'"
    return conn.execute(sql).fetchall()`,
            mode: "spot-the-risk",
            options: [
              { id: "a", label: "Calling fetchall()", correct: false, feedback: "Not a vulnerability in itself, although SELECT * may return more personal data than the page needs." },
              { id: "b", label: "Building the SQL with an f-string from user input", correct: true, feedback: "Correct: SQL injection. Use a parameterised query, e.g. conn.execute('SELECT id, name FROM customers WHERE phone = ?', (phone,))." },
              { id: "c", label: "Naming the function find_customer", correct: false, feedback: "Naming is fine." },
              { id: "d", label: "Passing the connection in as a parameter", correct: false, feedback: "That is good design and makes the function easier to test." },
            ],
          },
          {
            type: "example",
            title: "The 'fix' that switched off security",
            scenario: "During a rushed server move, a developer at Msasa Pay (fictional) hit an SSL error when calling a partner's payment API and asked AI to 'fix the SSL error'. The suggestion was verify=False. The call worked, the change shipped, and it stayed in production for months, leaving payment traffic open to interception.",
            takeaway: "When AI 'fixes' an error by switching off a security control, the real problem is still there. Fix the certificate chain, not the check.",
          },
          {
            type: "ai-example",
            title: "A secure rewrite, explained",
            instruction: "Show an insecure code snippet relevant to the learner's work in Zimbabwe (e.g. a login, KYC document upload or payment callback), a prompt asking AI to rewrite it securely and explain each change, and the secure version. Keep each snippet under 15 lines, and end with one thing the developer must still verify themselves.",
            fallback: `Insecure (Node/Express):
app.post("/upload", (req, res) => {
  const file = req.files.doc;
  file.mv("/var/app/public/uploads/" + file.name);
  res.send("Uploaded");
});

Prompt: "Rewrite this KYC document upload handler securely and explain each change. Only PDF or JPEG under 5 MB."

Secure version (excerpt):
const ALLOWED = { "application/pdf": ".pdf", "image/jpeg": ".jpg" };
app.post("/upload", requireAuth, (req, res) => {
  const file = req.files && req.files.doc;
  if (!file || !ALLOWED[file.mimetype] || file.size > 5 * 1024 * 1024)
    return res.status(400).send("Invalid file");
  const safeName = crypto.randomUUID() + ALLOWED[file.mimetype];
  file.mv(path.join(PRIVATE_UPLOAD_DIR, safeName));
  res.status(201).send("Uploaded");
});

Changes: authentication; type and size limits; random file names (blocks ../ path traversal); storage outside the public web root.
Still verify yourself: the file type is checked from its content, not just the client-supplied header.`,
          },
          {
            type: "quiz",
            question: "An AI assistant suggests disabling CSRF protection to fix a failing form submission. What should you do?",
            options: [
              "Accept it, because the form works now",
              "Find out why the CSRF token is missing and fix the form so it sends one",
              "Disable CSRF protection only for logged-in users",
              "Ask the AI to hide the warning",
            ],
            correctIndex: 1,
            explanation: "The failure is a symptom. Removing the control opens the door to cross-site request forgery; fix the root cause instead.",
            skillId: "domain-software",
          },
          {
            type: "quiz",
            question: "Which prompt is most likely to produce secure code?",
            options: [
              "'Write a login endpoint quickly.'",
              "'Write a login endpoint using argon2 or bcrypt hashing, parameterised queries, rate limiting and generic error messages; explain each security choice.'",
              "'Write the shortest possible login code.'",
              "'Copy a popular login example from the internet.'",
            ],
            correctIndex: 1,
            explanation: "Stating security requirements up front steers the output, and asking for explanations makes it easier to review. You still verify the result.",
            skillId: "ai-verification",
          },
        ],
      },
      {
        id: "sw-security-l2",
        title: "Secrets, Hallucinated Packages & Licences",
        minutes: 13,
        blocks: [
          {
            type: "explain",
            title: "Secrets never go in prompts",
            body: "API keys, database passwords, private keys and customer records must never be pasted into AI tools, not even 'just to debug'. Depending on the tool and settings, prompts may be logged, retained or used for training. Redact secrets, use placeholders and use only approved assistants. If a secret is exposed, rotate it immediately.",
            bullets: [
              "Use placeholders like <API_KEY>",
              "Load secrets from a vault or env",
              "Scan commits for secrets",
              "Rotate anything exposed",
            ],
          },
          {
            type: "interactive",
            title: "Spot the leak",
            prompt: "A developer is asking an AI assistant for help. Which prompt is the risk?",
            mode: "spot-the-risk",
            options: [
              { id: "a", label: "'Why does my regex reject Zimbabwean mobile numbers that start with +263?'", correct: false, feedback: "Safe: no secrets or personal data." },
              { id: "b", label: "'Here is our .env file with the production DB password and payment API key. Why won't it connect?'", correct: true, feedback: "This is the risk. Production credentials are now outside your control. Rotate them and share only redacted config." },
              { id: "c", label: "'Explain this stack trace' (customer names replaced with XXX)", correct: false, feedback: "Good practice: redacted before sharing." },
              { id: "d", label: "'Suggest indexes for this table schema' (no data rows included)", correct: false, feedback: "Safe: a schema without data is usually fine in an approved tool." },
            ],
          },
          {
            type: "example",
            title: "The package that should not exist",
            scenario: "An AI assistant told a developer at Kalahari Freight, a fictional Bulawayo logistics start-up, to install 'zim-wallet-payments-sdk' for mobile-wallet integration. No official package by that name existed, but an attacker had published one under that exact name containing malware, betting that developers would follow AI suggestions. The team's dependency review caught it before install.",
            takeaway: "Verify every package: official documentation, publisher, repository, download history and licence. Hallucinated package names are a real supply-chain attack route.",
          },
          {
            type: "ai-example",
            title: "Choosing a dependency safely",
            instruction: "Show a developer in the learner's context how to use AI safely when choosing a library: a prompt asking for options with licences and maintenance status (and to say when unsure), followed by a verification checklist the developer must complete outside the AI (official registry, publisher, repository activity, licence file, vulnerability scan, version pinning).",
            fallback: "Prompt: 'Suggest 3 well-maintained Python libraries for generating PDF bank statements. For each, give the licence and the official repository. Say clearly if you are unsure whether a package exists.'\n\nVerify outside the AI:\n1. The package exists on the official registry under the expected publisher.\n2. The repository shows recent commits and releases.\n3. The LICENSE file fits your policy (MIT or Apache-2.0 are usually fine; GPL or AGPL may need legal review for a commercial product).\n4. Run your dependency scanner (e.g. pip-audit) for known vulnerabilities.\n5. Pin the exact version in your requirements file.",
          },
          {
            type: "quiz",
            question: "An AI assistant produces a 40-line function that looks identical to code from a GPL-licensed project. What should you do?",
            options: [
              "Ship it, because AI output is always free to use",
              "Flag it for licence review, then rewrite or attribute it according to your organisation's policy",
              "Remove the comments so it looks original",
              "Ask the AI whether it is licensed",
            ],
            correctIndex: 1,
            explanation: "AI tools can reproduce licensed code. Copyleft licences may impose obligations on your product, so follow your policy and involve legal if needed.",
            skillId: "domain-software",
          },
          {
            type: "quiz",
            question: "You accidentally pasted a live payment API key into a public AI chatbot. What should you do first?",
            options: [
              "Delete the chat and forget about it",
              "Revoke and rotate the key immediately, then report it through your security process",
              "Ask the chatbot to forget the key",
              "Wait to see whether it is misused",
            ],
            correctIndex: 1,
            explanation: "Deleting a chat does not guarantee the data is gone. Rotating the key removes the risk; reporting helps your team check for misuse.",
            skillId: "responsible-ai",
          },
        ],
      },
    ],
  },

  // ───────────────────────────── sw-automation (advanced) ─────────────────────────────
  {
    moduleId: "sw-automation",
    lessons: [
      {
        id: "sw-automation-l1",
        title: "AI for Test Generation & CI",
        minutes: 12,
        blocks: [
          {
            type: "explain",
            title: "Where AI speeds up testing",
            body: "AI can draft unit tests, generate edge-case data, turn requirements into test cases and summarise failing CI runs, which removes much of the tedium from testing. But AI-generated tests can encode the same bugs as the code, assert nothing meaningful or use unrealistic data. People define what 'correct' means; AI helps express it.",
            bullets: [
              "Edge cases from requirements",
              "Synthetic test data",
              "CI failure summaries",
              "People define expected results",
            ],
          },
          {
            type: "ai-example",
            title: "Tests from a requirement",
            instruction: "Show how a developer in the learner's industry in Zimbabwe could turn a short business requirement into AI-generated test cases: the requirement, the prompt, and a list of 5–6 test cases covering boundaries, invalid inputs and limits. Use fictional data only.",
            fallback: "Requirement: 'Mobile top-ups: USD minimum 0.50, maximum 50 per transaction; ZiG minimum 10, maximum 2,000; at most 5 top-ups per user per day.'\n\nPrompt: 'Generate test cases for this rule as a list: input, expected result, reason. Include boundaries, invalid inputs and the daily limit. Use fictional phone numbers only.'\n\nTest cases:\n1. USD 0.50: accepted (lower boundary)\n2. USD 0.49: rejected (below minimum)\n3. USD 50.00 accepted; USD 50.01 rejected\n4. ZiG 2,000 accepted; ZiG 2,001 rejected\n5. 6th top-up in one day: rejected with a clear message\n6. Unsupported currency code: rejected",
          },
          {
            type: "example",
            title: "Test data that was far too real",
            scenario: "Testers at Savanna Crest Bank (fictional) needed data for a new loans system. One copied a production extract with real customer names and ID numbers into the test environment and asked AI to 'add more rows like these'. The data spread to vendor laptops. The fix: synthetic data generated from the schema and business rules alone, with fake names and deliberately invalid ID formats.",
            takeaway: "Generate test data from schemas and rules, never from real customer records.",
          },
          {
            type: "interactive",
            title: "Good uses of AI in a CI pipeline",
            prompt: "Select ALL the uses you would allow.",
            mode: "sort",
            options: [
              { id: "a", label: "Summarising why a build failed, with links to the failing tests", correct: true, feedback: "Saves time and the evidence is linked, so it is easy to verify." },
              { id: "b", label: "Suggesting missing test cases on each pull request for a developer to accept or reject", correct: true, feedback: "Useful, and a human stays in control." },
              { id: "c", label: "Auto-merging pull requests whenever an AI reviewer approves them", correct: false, feedback: "This removes human ownership. AI review supplements human approval; it does not replace it." },
              { id: "d", label: "Sending the production database to an external AI service to generate test data", correct: false, feedback: "A serious privacy breach. Use synthetic data built from the schema." },
            ],
          },
          {
            type: "quiz",
            question: "An AI tool generated a test suite by reading the implementation code, and every test passes. What is the main risk?",
            options: [
              "The tests will be too slow",
              "The tests may encode the code's existing bugs as 'expected' behaviour",
              "The tests will fail in CI",
              "The tests will use too much memory",
            ],
            correctIndex: 1,
            explanation: "Tests derived from the code check that the code does what it does, not what it should do. Derive expected results from requirements.",
            skillId: "ai-coding",
          },
          {
            type: "task",
            title: "Try it: requirement-first tests",
            instructions: "Pick one requirement from your backlog. Before looking at the code, ask AI to list test cases for it. Compare the list with your existing tests and add at least one missing boundary case.",
            hint: "Generating tests from the requirement, not the code, is what catches code that is wrong.",
          },
        ],
      },
      {
        id: "sw-automation-l2",
        title: "AI for Incident Triage & IT Service Desk",
        minutes: 13,
        blocks: [
          {
            type: "explain",
            title: "AI in operations and support",
            body: "AI can group alerts, summarise incident timelines, suggest likely causes from logs, draft runbooks and help service-desk agents answer common tickets. It cuts noise and speeds up response. But suggested causes are hypotheses, automated actions can make outages worse, and logs often contain personal data. People approve any change to production.",
            bullets: [
              "Alert grouping and summaries",
              "Log analysis as hypotheses",
              "Draft runbooks and post-mortems",
              "Ticket triage and draft replies",
            ],
          },
          {
            type: "example",
            title: "The auto-restart loop",
            scenario: "Kalahari Freight (fictional) let an AI operations bot restart services automatically whenever error rates rose. During load-shedding, a database failover briefly slowed responses; the bot kept restarting the API and turned a 5-minute slowdown into a 90-minute outage. The team changed the bot to recommend actions and require on-call approval for restarts.",
            takeaway: "Let AI recommend and summarise; require human approval for actions with a large blast radius.",
          },
          {
            type: "ai-example",
            title: "An incident summary from logs",
            instruction: "Show a short fictional, anonymised log excerpt (6–8 lines) from a system relevant to the learner's industry in Zimbabwe, a prompt asking AI for a timeline, ranked likely causes with evidence, and checks to confirm them, followed by a sample AI summary. Make clear the causes are hypotheses.",
            fallback: `Logs (anonymised):
02:13:58 INFO  infra        Mains power lost at site B; generator starting
02:14:03 WARN  payments-api DB pool exhausted (50/50)
02:14:05 ERROR payments-api Timeout calling wallet-gateway (5000 ms)
02:14:40 INFO  infra        Generator switchover complete, site B
02:16:22 WARN  wallet-gw    Retry storm: 1,240 retries/min
02:21:00 INFO  payments-api Pool recovered (12/50)

Prompt: "Build a timeline, rank likely causes with the log evidence for each, and list what we must check to confirm. Label every cause as a hypothesis."

Sample summary: "Timeline: 02:13 power loss → 02:14 pool exhaustion and gateway timeouts → 02:14:40 switchover → 02:16 retry storm → 02:21 recovery. Hypothesis 1: the network dropped during switchover, slowing wallet-gateway, and aggressive retries amplified the load (evidence: retry storm). Hypothesis 2: the pool is too small for peak traffic. To confirm: site B network logs, retry-policy settings, pool metrics from earlier power cuts."`,
          },
          {
            type: "interactive",
            title: "Spot the risky service-desk automation",
            prompt: "Your IT service desk is adding AI. Which step is the risk?",
            mode: "spot-the-risk",
            options: [
              { id: "a", label: "AI suggests a category and priority for each ticket; agents confirm", correct: false, feedback: "A sensible use: a person confirms." },
              { id: "b", label: "AI drafts replies from the approved knowledge base; agents edit and send", correct: false, feedback: "Good: grounded in approved content, with human review." },
              { id: "c", label: "AI resets passwords and disables MFA whenever a caller says they are the account owner", correct: true, feedback: "This is the risk: an open door for social engineering. Identity checks and security changes need strict, human-controlled verification." },
              { id: "d", label: "AI summarises long ticket threads before escalation", correct: false, feedback: "Helpful and low-risk; the engineer can read the full thread." },
            ],
          },
          {
            type: "quiz",
            question: "Logs you want to send to an external AI tool for incident analysis contain customer phone numbers and account IDs. What should you do?",
            options: [
              "Send them anyway, because speed matters in an incident",
              "Mask or tokenise the personal data first, or use an approved internal tool",
              "Delete the logs",
              "Send them to a free chatbot instead",
            ],
            correctIndex: 1,
            explanation: "Incidents create pressure to cut corners. Masking keeps the analysis useful while protecting customers and meeting data-protection duties.",
            skillId: "data-privacy",
          },
          {
            type: "quiz",
            question: "What is the right role for AI in a post-incident review?",
            options: [
              "Assigning blame to the engineer on call",
              "Drafting the timeline and highlighting contributing factors for the team to verify and discuss",
              "Replacing the review meeting",
              "Deciding the root cause definitively",
            ],
            correctIndex: 1,
            explanation: "AI speeds up the paperwork. The team verifies the facts, discusses causes and agrees on improvements in a blameless way.",
            skillId: "ai-automation",
          },
        ],
      },
    ],
  },

  // ───────────────────────────── sw-challenge ─────────────────────────────
  {
    moduleId: "sw-challenge",
    lessons: [
      {
        id: "sw-challenge-l1",
        title: "Challenge Briefing: Debug with AI, Find What It Misses",
        minutes: 6,
        blocks: [
          {
            type: "explain",
            title: "What this challenge tests",
            body: "You will debug a fictional payment webhook that was largely written with an AI assistant, together with an AI-suggested 'fix'. Assessors look for the security and correctness problems you find, how you use AI as a debugging partner, how you verify its claims, and whether your fix and safeguards would hold up in production.",
            bullets: [
              "Security issues in AI-written code",
              "Correctness bugs, with evidence",
              "Critical evaluation of AI advice",
              "A tested, safe fix",
            ],
          },
          {
            type: "interactive",
            title: "How should you use AI in this challenge?",
            prompt: "Choose the approach that reflects good engineering practice.",
            mode: "choose-better",
            options: [
              { id: "a", label: "Paste the code, including the live key, and apply whatever fix the AI returns", correct: false, feedback: "This leaks a secret and skips verification: two things the challenge specifically assesses." },
              { id: "b", label: "Share redacted code and anonymised logs, ask for hypotheses and tests, then reproduce and verify each finding yourself", correct: true, feedback: "Correct. AI speeds up the search, and you confirm every finding with evidence and tests." },
              { id: "c", label: "Install the package the AI recommends, since it names the exact problem", correct: false, feedback: "Unverified packages may be hallucinated or malicious. Check that one exists and is trustworthy first." },
              { id: "d", label: "Avoid AI and only read the code by hand", correct: false, feedback: "The challenge assesses responsible AI-assisted debugging. Show how you use it well." },
            ],
          },
          {
            type: "explain",
            title: "Responsible-AI reminders",
            body: "Replace secrets with placeholders and mask personal data before sharing anything with an AI tool. Verify every package, API and claim the AI makes, since some will be invented. Watch for licence issues in any code you copy. You own the final fix and the review, and payment code deserves a second human reviewer.",
            bullets: [
              "No secrets in prompts",
              "Verify packages and APIs exist",
              "Reproduce before you fix",
              "Human review of the final change",
            ],
          },
          {
            type: "quiz",
            question: "The AI says duplicate payments are 'definitely caused by provider retries'. What is the best next step?",
            options: [
              "Accept it and move on",
              "Treat it as a hypothesis: confirm it from the logs and a failing test before changing code",
              "Ask the AI again until it gives a different answer",
              "Disable retries at the provider",
            ],
            correctIndex: 1,
            explanation: "AI diagnoses are hypotheses. Evidence (logs, a reproducing test) confirms the cause and shows your fix actually works.",
            skillId: "ai-verification",
          },
        ],
      },
    ],
    activity: {
      id: "sw-challenge-activity",
      title: "Debug an AI-Assisted Payment Webhook: Find the Security and Correctness Problems",
      domainId: "software",
      scenario: "Msasa Pay, a fictional Harare fintech start-up, lets parents pay school fees through its WhatsApp bot and mobile wallets. Since last week's release, some parents have been credited twice, balances in ZiG look wrong, and support has seen at least one fake 'payment confirmed' message. The webhook below was written largely with an AI assistant; a junior developer then asked another AI chat to debug it and pasted its suggestion into the file. You are the engineer on call.",
      data: `// webhook.js (AI-assisted, merged last week)
const express = require("express");
const db = require("./db"); // db.query(sql) resolves to an array of rows
const app = express();
app.use(express.json());

const WALLET_SECRET = "sk_live_9f8a7c2e1b44"; // TODO move to env

app.post("/webhooks/wallet", async (req, res) => {
  const { txnId, studentId, amount, currency, status } = req.body;
  // signature check skipped for now: it was failing in staging
  if (status === "SUCCESS") {
    const [student] = await db.query(
      "SELECT * FROM students WHERE id = '" + studentId + "'");
    const newBalance = student.fees_owed_usd - parseFloat(amount);
    await db.query("UPDATE students SET fees_owed_usd = " + newBalance +
      " WHERE id = '" + studentId + "'");
    await db.query("INSERT INTO payments (txn_id, student_id, amount) VALUES ('" +
      txnId + "', '" + studentId + "', " + amount + ")");
  }
  res.sendStatus(200);
});

// AI debugging suggestion pasted by junior developer:
// "Duplicate credits are caused by the wallet provider's retries.
//  Fix: npm install wallet-dedupe-guard, then wrap the app with dedupe(app)."

LOG EXCERPT (anonymised)
10:02:11 POST /webhooks/wallet txnId=T-7781 studentId=S-1042 amount=150.00 currency=USD status=SUCCESS
10:02:41 POST /webhooks/wallet txnId=T-7781 studentId=S-1042 amount=150.00 currency=USD status=SUCCESS (provider retry)
10:05:09 POST /webhooks/wallet txnId=T-7790 studentId=S-2210 amount=4200 currency=ZIG status=SUCCESS
10:07:55 POST /webhooks/wallet txnId=FAKE-1 studentId=S-3301 amount=900 currency=USD status=SUCCESS (source IP not in provider's range)`,
      task: "Submit a debugging report covering: (1) your approach and how you used AI, including at least two prompts and what you did and did not share with the tool; (2) the security problems and correctness bugs you found, with evidence from the code and logs; (3) your evaluation of the AI's suggested fix; (4) your corrected handler, or a precise description of the changes, plus the tests you would add; (5) immediate safeguards and follow-up actions.",
      rubric: [
        { criterion: "Security issues", description: "Identifies the disabled signature check (proven by FAKE-1), SQL injection through string concatenation, the hard-coded live secret, and the unverified package as a possible hallucination or supply-chain risk.", weight: 25 },
        { criterion: "Correctness bugs", description: "Identifies the missing idempotency (T-7781 credited twice), ZiG amounts deducted from a USD balance, floating-point money, non-atomic updates, unknown students and an unconditional 200 response.", weight: 25 },
        { criterion: "Verification & critical evaluation", description: "Treats AI output as hypotheses, reproduces each issue with logs or failing tests, and explains why the suggested package is not an acceptable fix.", weight: 25 },
        { criterion: "Responsible AI & secure practice", description: "Redacts the secret and personal data before prompting, rotates the exposed key, uses approved tools, and requires human security review of payment code.", weight: 15 },
        { criterion: "Fix quality & tests", description: "Proposes a correct, secure handler (signature verification, parameterised queries, idempotency, currency handling, a transaction) with meaningful tests.", weight: 10 },
      ],
      skillIds: ["domain-software", "ai-verification", "critical-thinking", "ai-coding"],
      sampleStrongAnswer: "Security: (1) signature verification is disabled, so anyone can POST a fake SUCCESS; FAKE-1, from an IP outside the provider's range, proves it. (2) SQL is built by string concatenation, so studentId or txnId can inject SQL. (3) A live secret is hard-coded and must be rotated today. (4) I could not verify that 'wallet-dedupe-guard' or its publisher exists; it may be hallucinated or a malicious look-alike, so it must not be installed.\n\nCorrectness: (5) no idempotency, so T-7781 was credited twice after the provider's retry; (6) currency is ignored, so ZiG 4,200 was deducted from a USD balance; (7) parseFloat money maths causes rounding errors; (8) the update and insert are not in one transaction; (9) an unknown studentId crashes the handler; (10) it returns 200 even when nothing was processed.\n\nAI use: I shared the code with the key replaced by <REDACTED> plus anonymised logs, asking: 'Identify security and correctness issues; cite the line and log evidence.' Then: 'Write Jest tests for a duplicate txnId, invalid signature, ZiG payment and unknown student.' I reproduced each finding locally before accepting it.\n\nFix: HMAC signature check (constant-time compare, secret from the vault); parameterised queries; UNIQUE txn_id with INSERT ... ON CONFLICT DO NOTHING inside a transaction; integer minor units per currency; input validation; 401 or 400 responses where appropriate.\n\nSafeguards: rotate the key, reconcile affected accounts with Finance, contact affected parents, add secret scanning and require a second reviewer for payment code.",
    },
  },
];
