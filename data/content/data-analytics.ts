import type { ModuleContent } from '../../types';

/**
 * Data & Analytics domain content.
 * Written for career switchers (e.g. accounts clerks, admin staff) moving from spreadsheets into analytics,
 * with AI as an assistant — never an unchecked oracle.
 */
export const DATA_ANALYTICS_CONTENT: ModuleContent[] = [
  // ───────────────────────── da-foundations ─────────────────────────
  {
    moduleId: 'da-foundations',
    lessons: [
      {
        id: 'da-foundations-l1',
        title: 'From Spreadsheets to SQL: You Already Think Like an Analyst',
        minutes: 12,
        blocks: [
          {
            type: 'explain',
            title: 'SQL is a pivot table you write in words',
            body: "If you can filter a sheet, use SUMIFS and build a pivot table, you already understand most of what SQL does. SQL simply asks a database a question in plain, structured words. Instead of clicking filters, you write them. The big advantage: the question is saved, repeatable and works on millions of rows that would freeze Excel.",
            bullets: [
              'SELECT = which columns you want to see',
              'FROM = which table (sheet) the data lives in',
              'WHERE = your filter, like an Excel filter',
              'GROUP BY = your pivot table rows',
            ],
          },
          {
            type: 'example',
            title: 'The same question, two ways',
            scenario: `Tariro, an accounts clerk at Savanna Crest Retail, builds a pivot table every Monday: total sales per branch for last week, excluding voided receipts. In SQL the same question is:

SELECT branch, SUM(amount_usd) AS total_sales
FROM sales
WHERE status <> 'VOID'
  AND sale_date BETWEEN '2026-08-03' AND '2026-08-09'
GROUP BY branch;

The pivot "Rows" become GROUP BY, the filter becomes WHERE, and "Sum of Amount" becomes SUM(amount_usd).`,
            takeaway: 'Every pivot table you have built is a SQL query waiting to be written. Translate what you already do rather than starting from zero.',
          },
          {
            type: 'interactive',
            title: 'Match the spreadsheet habit to SQL',
            prompt: 'You filter a sales sheet to show only the Bulawayo branch. Which SQL clause does that job?',
            mode: 'choose-better',
            options: [
              { id: 'a', label: "WHERE branch = 'Bulawayo'", correct: true, feedback: 'Correct. WHERE keeps only the rows that meet your condition — exactly like an Excel filter.' },
              { id: 'b', label: 'GROUP BY branch', correct: false, feedback: 'GROUP BY summarises rows into one line per branch (like pivot rows). It does not remove the other branches.' },
              { id: 'c', label: 'SELECT branch', correct: false, feedback: 'SELECT only chooses which columns appear. All branches would still be shown.' },
              { id: 'd', label: 'ORDER BY branch', correct: false, feedback: 'ORDER BY sorts rows. Nothing is filtered out.' },
            ],
          },
          {
            type: 'ai-example',
            title: 'Your pivot table, translated',
            instruction: "Take a pivot table the learner would realistically build in their current role and industry (use their job title). Describe the pivot in one sentence (rows, values, filters), then show the equivalent SQL query with SELECT, FROM, WHERE and GROUP BY, and add a one-line plain-English explanation under each clause. Use fictional table and column names, USD amounts and a Zimbabwean business context.",
            fallback: `Pivot you build today: Rows = product_category, Values = Sum of quantity, Filter = month is July 2026, branch is Harare CBD.

SELECT product_category, SUM(quantity) AS units_sold
FROM sales
WHERE branch = 'Harare CBD'
  AND sale_date >= '2026-07-01' AND sale_date < '2026-08-01'
GROUP BY product_category
ORDER BY units_sold DESC;

- SELECT: show each category and its total units.
- FROM: read the sales table.
- WHERE: keep only Harare CBD sales in July.
- GROUP BY: one line per category, like pivot rows.
- ORDER BY: biggest sellers first.`,
          },
          {
            type: 'quiz',
            question: 'In a pivot table you drag "branch" into Rows and "amount" into Values (Sum). Which SQL produces the same result?',
            options: [
              'SELECT branch, amount FROM sales;',
              'SELECT branch, SUM(amount) FROM sales GROUP BY branch;',
              "SELECT SUM(amount) FROM sales WHERE branch = 'all';",
              'SELECT * FROM sales ORDER BY branch;',
            ],
            correctIndex: 1,
            explanation: 'Pivot Rows map to GROUP BY and "Sum of" maps to SUM(). The other options either list every row, filter wrongly or only sort.',
            skillId: 'sql-data',
          },
          {
            type: 'task',
            title: 'Write your first query in plain English first',
            instructions: 'Pick one report you produce every week or month. Write it as a sentence: "Show me [columns] from [table] where [filter], grouped by [category]." Then turn each part into SELECT, FROM, WHERE and GROUP BY.',
            hint: 'Start with the filter you always apply first — that is your WHERE clause.',
          },
        ],
      },
      {
        id: 'da-foundations-l2',
        title: 'AI as Your SQL Assistant — and How to Check It',
        minutes: 13,
        blocks: [
          {
            type: 'explain',
            title: 'Let AI draft, explain and debug — you verify',
            body: 'AI assistants are excellent SQL tutors: they draft queries, explain them line by line and fix error messages. But they guess your table structure, date fields and business rules. A query that runs is not the same as a query that is right. Your spreadsheet skills become your quality control.',
            bullets: [
              'Give AI the table and column names, not the data',
              'Ask it to explain every line in plain English',
              'Test on a small sample you can check by hand',
              'Reconcile totals against a trusted pivot or report',
            ],
          },
          {
            type: 'ai-example',
            title: 'A strong SQL prompt for your work',
            instruction: "Write a strong prompt the learner could give an AI assistant to generate a SQL query for a realistic question in their role or target analyst role. The prompt must include: the table schema (fictional column names and types), the exact business question, business rules (e.g. exclude voids/returns, which date field to use), the database type, and a request to explain each line and list assumptions. Then show the query the AI might return. Do not include any real customer data.",
            fallback: `Prompt:
"I use PostgreSQL. Table sales(receipt_id, branch, sale_date DATE, payment_date DATE, product_category, amount_usd NUMERIC, status TEXT). Status can be 'PAID', 'VOID' or 'RETURN'.
Question: total paid sales per branch per month for Jan–Jun 2026, using sale_date (not payment_date). Exclude VOID and RETURN rows.
Write the query, explain each line in plain English, and list any assumptions you made."

AI response (excerpt):
SELECT branch,
       DATE_TRUNC('month', sale_date) AS month,
       SUM(amount_usd) AS paid_sales
FROM sales
WHERE status = 'PAID'
  AND sale_date >= '2026-01-01' AND sale_date < '2026-07-01'
GROUP BY branch, DATE_TRUNC('month', sale_date)
ORDER BY branch, month;
Assumption: amounts are already in USD; ZiG sales would need converting first.`,
          },
          {
            type: 'interactive',
            title: 'Spot the risky query',
            prompt: 'The AI returned four versions of "monthly sales per branch". Which one quietly gives the wrong totals?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: "WHERE status = 'PAID' ... GROUP BY branch, month", correct: false, feedback: 'This one is sound: it keeps paid sales only and groups by both branch and month.' },
              { id: 'b', label: 'No WHERE on status ... GROUP BY branch, month', correct: true, feedback: 'Risky. Without a status filter, voids and returns are added into sales, inflating totals. It runs without errors, which is exactly why it is dangerous.' },
              { id: 'c', label: "WHERE status = 'PAID' ... GROUP BY branch, month ORDER BY month", correct: false, feedback: 'Sorting by month changes the display order only; the totals are still correct.' },
              { id: 'd', label: "WHERE status IN ('PAID') ... GROUP BY month, branch", correct: false, feedback: 'IN with one value equals "=" and the grouping order does not change totals. This is fine.' },
            ],
          },
          {
            type: 'example',
            title: 'Checking AI against the pivot table',
            scenario: 'Nyasha at Savanna Crest Retail asked AI for monthly branch sales. The query ran, but the Gweru March total was $3,410 higher than her trusted pivot. Asking the AI to "explain the WHERE clause line by line" revealed it had used payment_date, so February sales paid in March were counted in March. She switched to sale_date and the totals matched to the cent.',
            takeaway: 'Always reconcile at least one group (one branch, one month) against a source you trust. Differences point you straight to the wrong assumption.',
          },
          {
            type: 'quiz',
            question: 'Before pasting data into a public AI tool to get help with a query, what is the best practice?',
            options: [
              'Paste the full customer table so the AI understands the context',
              'Share only the table structure (column names and types) or a small anonymised sample',
              'Remove the column headers but keep customer names and phone numbers',
              'Only paste data on weekends when fewer people use the tool',
            ],
            correctIndex: 1,
            explanation: 'AI needs the structure, not the people. Customer names, phone numbers and mobile-money details should never go into a public AI tool; use column names or a small anonymised sample.',
            skillId: 'data-privacy',
          },
          {
            type: 'quiz',
            question: 'The AI query total for all branches is $182,400 but your pivot shows $179,950. What should you do first?',
            options: [
              'Trust the AI — databases are more accurate than spreadsheets',
              'Average the two numbers and report $181,175',
              'Compare one branch and one month at a time to find where they differ, then check filters and date fields',
              'Rewrite the pivot so it matches the AI result',
            ],
            correctIndex: 2,
            explanation: 'Narrow the gap group by group. Differences usually come from a missing filter (voids/returns), the wrong date field or duplicated rows — never paper over them.',
            skillId: 'ai-verification',
          },
        ],
      },
    ],
    activity: {
      id: 'da-foundations-activity',
      domainId: 'data-analytics',
      title: 'SQL with AI: Monthly Branch Sales Check',
      scenario: 'You are a junior analyst at Savanna Crest Retail, a fictional chain with three branches (Harare CBD, Mutare, Gweru). The finance manager wants monthly sales per branch for Q2 2026 to discuss at the regional meeting. A colleague asked an AI assistant to write the SQL, and it produced the query and summary below. You have also built a pivot table from the same export.',
      data: `Table: sales(receipt_id, branch, customer_name, customer_phone, sale_date, payment_date, amount_usd, status)
status values: PAID, VOID, RETURN

AI-generated query:
SELECT branch, EXTRACT(MONTH FROM payment_date) AS month, SUM(amount_usd) AS total
FROM sales
WHERE payment_date BETWEEN '2026-04-01' AND '2026-06-30'
GROUP BY branch, EXTRACT(MONTH FROM payment_date);

AI summary: "Mutare had its best month in June ($48,900), up 22% on May. Gweru is declining."

Your pivot (rows = branch, columns = month of sale_date, filter status = PAID):
Branch      | Apr     | May     | Jun
Harare CBD  | 61,200  | 63,050  | 64,400
Mutare      | 39,800  | 40,100  | 47,660
Gweru       | 28,300  | 27,900  | 28,450

Note: Mutare had a $1,240 bulk RETURN in June.`,
      task: 'Explain how you would use AI to produce a correct monthly branch sales summary. Include: (1) the prompt you would give the AI (with schema and business rules), (2) what is wrong with the AI query and summary and how you verified it, (3) how you protect customer data, (4) a corrected query, and (5) a two-sentence insight for the finance manager.',
      rubric: [
        { criterion: 'Correct use of AI', description: 'Clear prompt with schema, business rules and a request for explanation and assumptions; a working corrected query.', weight: 25 },
        { criterion: 'Verification', description: 'Identifies the payment_date vs sale_date error and missing status filter, and reconciles against the pivot table.', weight: 25 },
        { criterion: 'Data handling & privacy', description: 'Shares only the schema or anonymised data with AI; avoids exposing customer names and phone numbers.', weight: 20 },
        { criterion: 'Insight quality', description: 'Accurate, balanced insight that avoids overclaiming (e.g. "Gweru is declining") and suggests a next step.', weight: 30 },
      ],
      skillIds: ['sql-data', 'ai-verification', 'data-privacy', 'data-interpretation'],
      sampleStrongAnswer: `Prompt: "PostgreSQL table sales(receipt_id, branch, sale_date, payment_date, amount_usd, status). Status is PAID, VOID or RETURN. Write a query for total PAID sales per branch per month for April–June 2026 using sale_date. Explain each line and list your assumptions." I would only share column names — never customer_name or customer_phone.

Problems found: the AI query groups by payment_date, so sales are counted in the month they were paid rather than sold, and it has no status filter, so voids and returns are included. I checked by comparing Mutare June: the AI said $48,900 while my pivot shows $47,660 — the gap of $1,240 matches the bulk return. The "22% up" claim is also wrong: $47,660 vs $40,100 is about 19%. "Gweru is declining" is overclaimed — Gweru dipped in May and recovered in June; it is broadly flat.

Corrected query:
SELECT branch, DATE_TRUNC('month', sale_date) AS month, SUM(amount_usd) AS paid_sales
FROM sales
WHERE status = 'PAID' AND sale_date >= '2026-04-01' AND sale_date < '2026-07-01'
GROUP BY branch, DATE_TRUNC('month', sale_date)
ORDER BY branch, month;

I re-ran it and every branch-month matched the pivot.

Insight: "All three branches grew or held steady in Q2; Mutare grew fastest, up about 19% from May to June. Gweru is flat at around $28,000 a month — worth reviewing its product mix before the regional meeting."`,
    },
  },

  // ───────────────────────── da-visualisation ─────────────────────────
  {
    moduleId: 'da-visualisation',
    lessons: [
      {
        id: 'da-visualisation-l1',
        title: 'Choosing the Right Chart (and Letting AI Suggest One)',
        minutes: 12,
        blocks: [
          {
            type: 'explain',
            title: 'Start with the question, not the chart',
            body: 'A chart should answer one question a manager actually has. Decide the question first, then the chart type follows. AI tools can suggest charts and even build them, but they often pick something flashy rather than clear. Your job is to choose the simplest chart that answers the question honestly.',
            bullets: [
              'Change over time: line chart',
              'Compare categories: bar chart (sorted)',
              'Part of a whole, few parts: stacked bar',
              'Relationship between two measures: scatter plot',
            ],
          },
          {
            type: 'interactive',
            title: 'Pick the clearest chart',
            prompt: 'The operations manager asks: "How have weekly sales at our five branches changed over the last 12 weeks?" Which chart works best?',
            mode: 'choose-better',
            options: [
              { id: 'a', label: 'Five pie charts, one per branch', correct: false, feedback: 'Pie charts show share of a whole at one moment, not change over time. Comparing five of them is very hard.' },
              { id: 'b', label: 'A line chart with weeks on the x-axis and one line per branch', correct: true, feedback: 'Correct. Lines show trends over time, and five lines is still readable — especially if you highlight the branch that matters.' },
              { id: 'c', label: 'A 3D column chart with all 60 values', correct: false, feedback: '3D effects distort bar heights and 60 columns overwhelm the reader.' },
              { id: 'd', label: 'A table of 60 numbers', correct: false, feedback: 'Tables are great for looking up exact values but make trends hard to see.' },
            ],
          },
          {
            type: 'ai-example',
            title: 'Asking AI for a chart recommendation',
            instruction: "Show a prompt the learner could use to ask AI for a chart recommendation for a realistic dataset in their role or target analyst role (fictional columns, Zimbabwean business context). Then show a good AI response recommending one chart type, explaining why, suggesting a clear title that states the insight, and noting one way the chart could mislead. Keep it under 180 words.",
            fallback: `Prompt: "I have monthly mobile-money and cash sales (USD) for Jan–Aug 2026 at a retail chain. The audience is the finance director, who wants to know whether mobile money is overtaking cash. Recommend one chart, a title that states the insight, and one way the chart could mislead."

AI response: "Use a line chart with two lines (mobile money, cash), months on the x-axis and USD on the y-axis starting at zero. Title: 'Mobile money overtook cash in June 2026'. Label both lines directly instead of using a legend. Risk: if ZiG sales are converted at different exchange rates each month, the trend may reflect currency movement rather than customer behaviour — state the conversion method in a footnote."`,
          },
          {
            type: 'example',
            title: 'The title that tells the story',
            scenario: 'Rufaro, a new analyst at Mhondoro Hardware (fictional), sent a bar chart titled "Sales by Category Q2". Her manager asked, "So what?" She changed the title to "Cement and roofing drove 64% of Q2 sales growth", sorted the bars from largest to smallest and coloured the two key categories. The same chart went straight into the board pack.',
            takeaway: 'An insight title plus sorting and one highlight colour turns a chart from decoration into a message.',
          },
          {
            type: 'quiz',
            question: 'Which chart is usually best for comparing total sales across eight product categories?',
            options: ['A pie chart with eight slices', 'A sorted horizontal bar chart', 'A line chart', 'A 3D doughnut chart'],
            correctIndex: 1,
            explanation: 'Sorted bars make comparisons across many categories easy; long category names fit on a horizontal axis. Pies with many slices and 3D effects are hard to read accurately.',
            skillId: 'data-visualisation',
          },
          {
            type: 'task',
            title: 'Rewrite a chart title',
            instructions: 'Find a chart or report you have seen at work. Rewrite its title so it states the main finding in under 12 words (e.g. "Mutare sales grew 19% in June after the promotion").',
            hint: 'Include a direction (grew, fell, overtook) and a number if you can.',
          },
        ],
      },
      {
        id: 'da-visualisation-l2',
        title: 'Honest Dashboards and Data Stories',
        minutes: 13,
        blocks: [
          {
            type: 'explain',
            title: 'Misleading charts are a responsible-AI issue',
            body: 'AI tools can generate dashboards in seconds, but they can also produce charts that mislead: truncated axes, cherry-picked date ranges, or averages that hide problem branches. When people make budget and staffing decisions from your charts, honesty matters as much as accuracy. Check every AI-built chart before it is shared.',
            bullets: [
              'Bar charts start at zero',
              'Show the full, relevant time period',
              'Say where the data came from and when',
              'Never show personal customer details',
            ],
          },
          {
            type: 'interactive',
            title: 'Spot the misleading chart',
            prompt: 'An AI tool built four charts for a branch performance dashboard. Which one is misleading?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: 'Bar chart of branch sales with the y-axis starting at $58,000 so Harare looks three times bigger than Mutare', correct: true, feedback: 'Misleading. A truncated axis on a bar chart exaggerates small differences. Bars must start at zero.' },
              { id: 'b', label: 'Line chart of weekly sales for 12 weeks, y-axis from $0', correct: false, feedback: 'This is fine — a full period and an honest axis.' },
              { id: 'c', label: 'Sorted bar chart of returns by category with a "Source: POS export, 1 Sep 2026" note', correct: false, feedback: 'Good practice — sorted, and the source and date are shown.' },
              { id: 'd', label: 'Table of the top 5 products by units, with product codes only', correct: false, feedback: 'Fine. Tables work for exact values and there is no personal data.' },
            ],
          },
          {
            type: 'example',
            title: 'A one-page data story',
            scenario: 'Tapiwa, a junior analyst at Savanna Crest Retail, was asked why stock losses rose. Her one-page story used three parts: (1) What happened — "Shrinkage rose from 1.1% to 2.4% of sales in Q2", with a line chart. (2) Why — a bar chart showing 70% of losses in two categories at one branch. (3) So what — "Recommend a stock count and CCTV review at Gweru; review again in 6 weeks".',
            takeaway: 'What happened, why, and what to do next. Three charts at most, each with an insight title and one clear recommendation.',
          },
          {
            type: 'ai-example',
            title: 'Using AI to draft the narrative — then checking it',
            instruction: "Show a short example where the learner gives AI a small summary table from their role or target analyst role (fictional, anonymised, USD) and asks for a three-sentence executive summary. Show the AI draft, then show one sentence that overclaims or states something the data does not support, and the corrected version. Keep a Zimbabwean business context.",
            fallback: `Table given to AI: Q2 sales — Harare CBD $188,650 (+4%), Mutare $127,560 (+11%), Gweru $84,650 (0%).

AI draft: "Q2 sales reached $400,860. Mutare grew fastest at 11%, driven by the new school-uniform range. Gweru stagnated because of weak management."

Check: the total and growth rates match the table. But the table says nothing about school uniforms or management — the AI invented causes.

Corrected: "Q2 sales reached $400,860. Mutare grew fastest at 11%, while Gweru was flat. We recommend reviewing Gweru's product mix and footfall before drawing conclusions about the cause."`,
          },
          {
            type: 'quiz',
            question: 'An AI dashboard shows "Average basket size: $24" across all branches. Why might this be misleading?',
            options: [
              'Averages are always wrong and should never be used',
              'It may hide big differences between branches, and a few very large purchases can pull the average up',
              'Basket size should only be shown in ZiG',
              'Dashboards should never contain numbers',
            ],
            correctIndex: 1,
            explanation: 'Averages can hide variation and are sensitive to outliers. Show the median or a breakdown by branch alongside the overall figure.',
            skillId: 'data-interpretation',
          },
        ],
      },
    ],
  },

  // ───────────────────────── da-ml (advanced) ─────────────────────────
  {
    moduleId: 'da-ml',
    lessons: [
      {
        id: 'da-ml-l1',
        title: 'Predictive Models in Plain English',
        minutes: 15,
        blocks: [
          {
            type: 'explain',
            title: 'A model is a pattern learned from past data',
            body: 'Predictive analytics uses past data to estimate what is likely next. A forecasting model predicts a number (next month’s sales); a classification model predicts a category (will this customer leave?). Machine learning finds the patterns automatically, but it assumes the future will behave like the past. When conditions change — a currency shift, a drought, a new competitor — predictions weaken.',
            bullets: [
              'Forecasting: how much, how many, when',
              'Classification: yes/no or which group',
              'Training data teaches; test data checks',
              'Every prediction has uncertainty',
            ],
          },
          {
            type: 'example',
            title: 'Forecasting festive-season stock',
            scenario: 'Savanna Crest Retail used a model trained on three years of daily sales to forecast December demand for rice, cooking oil and school shoes. It predicted a 35% rise in rice sales in the week before Christmas. The analyst compared it with a simple benchmark — last December’s sales plus 5% — and found the model was only slightly better. Both were shown to the buyer with a range, not a single number.',
            takeaway: 'Always compare a model with a simple benchmark. If a fancy model barely beats "last year plus a bit", keep it simple and explainable.',
          },
          {
            type: 'interactive',
            title: 'Forecasting or classification?',
            prompt: 'Which of these are classification problems? Select all that apply.',
            mode: 'sort',
            options: [
              { id: 'a', label: 'Will this loan applicant repay on time? (yes/no)', correct: true, feedback: 'Yes — the output is a category, so this is classification.' },
              { id: 'b', label: 'How many bags of maize meal will each branch sell next week?', correct: false, feedback: 'No — this predicts a number, so it is forecasting (regression).' },
              { id: 'c', label: 'Is this mobile-money transaction likely to be fraudulent?', correct: true, feedback: 'Yes — fraud or not fraud is a classification.' },
              { id: 'd', label: 'Which of three customer segments does this shopper belong to?', correct: true, feedback: 'Yes — assigning a group is classification.' },
            ],
          },
          {
            type: 'ai-example',
            title: 'Using AI to explain a model to a manager',
            instruction: "Show a short prompt the learner could use to ask AI to explain a predictive model's output in plain language for a non-technical manager in their industry (Zimbabwe context, fictional organisation). Then show the AI's plain-English explanation, including what the prediction means, how confident it is, the main drivers, and one limitation. Keep it under 170 words.",
            fallback: `Prompt: "Explain this churn model result to our branch manager in plain English, in under 120 words: 'Customer churn probability next 90 days: 0.72 for segment B. Top drivers: no purchase in 45 days, loyalty points unused, lives more than 10 km from branch. Test accuracy: 81%.' Include one limitation."

AI explanation: "Customers in segment B have roughly a 7 in 10 chance of not shopping with us in the next three months. The strongest warning signs are no purchase in 45 days, unused loyalty points and living far from a branch. The model was right about 8 times out of 10 when tested on past customers. Limitation: it learned from last year, before the new competitor opened, so treat it as a guide for who to contact first, not a certainty."`,
          },
          {
            type: 'quiz',
            question: 'Why do analysts split data into a training set and a test set?',
            options: [
              'To make the model run faster',
              'To check how well the model performs on data it has not seen before',
              'To remove customer names from the data',
              'Because databases cannot store more than half the data',
            ],
            correctIndex: 1,
            explanation: 'Testing on unseen data shows whether the model has learned real patterns or just memorised the training data.',
            skillId: 'predictive-analytics',
          },
        ],
      },
      {
        id: 'da-ml-l2',
        title: 'Overfitting, Bias and Using Models Wisely',
        minutes: 15,
        blocks: [
          {
            type: 'explain',
            title: 'When a model looks too good to be true',
            body: 'Overfitting happens when a model memorises the training data, including its noise, and then fails on new data. Warning signs: near-perfect training accuracy, a big drop on test data, or a model that relies on a strange variable. Data leakage — accidentally feeding the answer into the model — produces the same illusion of brilliance.',
            bullets: [
              'Compare training vs test performance',
              'Question any accuracy above 95%',
              'Check which variables drive predictions',
              'Re-test when conditions change',
            ],
          },
          {
            type: 'interactive',
            title: 'Spot the warning sign',
            prompt: 'A vendor presents four facts about its customer-default model for a microfinance lender. Which one should worry you most?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: 'Training accuracy 99.6%, test accuracy 64%', correct: true, feedback: 'Major warning. The model memorised its training data and performs poorly on new customers — classic overfitting.' },
              { id: 'b', label: 'Tested on 2,000 loans from a different year than it was trained on', correct: false, feedback: 'That is good practice — testing on a different period is a realistic check.' },
              { id: 'c', label: 'The vendor lists the top five drivers of each prediction', correct: false, feedback: 'Good — explainability helps you challenge and trust the model.' },
              { id: 'd', label: 'Performance is reported separately for urban and rural borrowers', correct: false, feedback: 'Good — breaking results down reveals whether the model is fair across groups.' },
            ],
          },
          {
            type: 'example',
            title: 'The postcode problem',
            scenario: 'Tsoro Microfinance (fictional) found its AI credit model approved urban applicants far more often than rural ones with similar repayment histories. The model had learned that "distance from a branch" predicted default, because rural borrowers historically faced higher travel costs to repay. Once mobile-money repayments were introduced, that pattern no longer held — but the model still penalised rural applicants.',
            takeaway: 'Models can bake in yesterday’s disadvantages. Check results by group (urban/rural, gender, age) and remove or rethink variables that act as proxies for unfair treatment.',
          },
          {
            type: 'quiz',
            question: 'A churn model uses the column "account_closed_date" as an input and reaches 99% accuracy. What is most likely going on?',
            options: [
              'The model is excellent and ready to deploy',
              'Data leakage: the column reveals the answer, so the model will fail on current customers',
              'The model needs more customer names to improve',
              'Churn is easy to predict, so 99% is normal',
            ],
            correctIndex: 1,
            explanation: 'If a customer has an account_closed_date, they have already churned. Using it leaks the answer into the model, so accuracy looks brilliant but is useless for prediction.',
            skillId: 'predictive-analytics',
          },
          {
            type: 'task',
            title: 'Write three questions for any model',
            instructions: 'Imagine a vendor offers your organisation a sales forecasting or customer-scoring model. Write three questions you would ask before trusting it — one about test performance, one about fairness across groups, and one about how customer data is anonymised and stored.',
            hint: 'Ask to see accuracy on recent data the model has not seen, broken down by branch or customer group.',
          },
          {
            type: 'quiz',
            question: 'Before sharing a customer dataset with an external AI tool to build a model, what should you do?',
            options: [
              'Send it as-is; the vendor will handle privacy',
              'Remove or pseudonymise direct identifiers (names, phone and ID numbers) and share only the fields the model needs, under an agreement',
              'Delete half the rows so less data is exposed',
              'Rename the file so nobody knows it contains customer data',
            ],
            correctIndex: 1,
            explanation: 'Data minimisation and pseudonymisation reduce harm if data leaks. Your organisation remains responsible for customer data even when a vendor processes it.',
            skillId: 'data-privacy',
          },
        ],
      },
    ],
  },

  // ───────────────────────── da-challenge ─────────────────────────
  {
    moduleId: 'da-challenge',
    lessons: [
      {
        id: 'da-challenge-l1',
        title: 'Challenge Briefing: Analyse, Verify, Present',
        minutes: 8,
        blocks: [
          {
            type: 'explain',
            title: 'What this challenge tests',
            body: 'You will review a fictional sales dataset and an AI-generated analysis that contains errors. You are assessed on how you use AI, how you verify its numbers and claims, how you protect customer data and how clearly you present a sound insight. This is a portfolio-style task: show your reasoning, not just your answer.',
            bullets: [
              'Recalculate key figures yourself',
              'Check how totals and averages were aggregated',
              'Challenge claims the data does not support',
              'End with a clear, honest recommendation',
            ],
          },
          {
            type: 'ai-example',
            title: 'How to use AI in this challenge',
            instruction: "Show how a data analyst in the learner's context should use AI during an analysis challenge: one prompt that asks AI to recalculate a metric and show its working, and one prompt that asks AI to critique an existing analysis for aggregation errors and unsupported claims. Use a fictional, anonymised retail sales table. Keep it under 160 words.",
            fallback: `Prompt 1 (recalculate): "Here is a table of transactions and revenue by region and month (no customer data). Calculate the overall average basket per month as total revenue ÷ total transactions. Show your working step by step."

Prompt 2 (critique): "Here is an analysis a colleague wrote from the same table. List any figure that is calculated incorrectly (for example, averaging averages or summing percentages), any claim not supported by the data, and any missing context a manager would need."

Then: check AI's arithmetic yourself in a spreadsheet — AI can make calculation mistakes too.`,
          },
          {
            type: 'interactive',
            title: 'Responsible-AI reminders',
            prompt: 'Which of these actions are appropriate during the challenge? Select all that apply.',
            mode: 'sort',
            options: [
              { id: 'a', label: 'Removing customer names and phone numbers before using AI', correct: true, feedback: 'Yes — anonymise personal data before it goes anywhere near an AI tool.' },
              { id: 'b', label: 'Recomputing totals in a spreadsheet to check the AI', correct: true, feedback: 'Yes — independent recalculation is the core verification step.' },
              { id: 'c', label: 'Copying the AI summary into your answer unchanged', correct: false, feedback: 'No — the AI analysis contains errors; your job is to find and correct them.' },
              { id: 'd', label: 'Stating the limitations of a small, two-month dataset', correct: true, feedback: 'Yes — honest limitations are part of a trustworthy analysis.' },
            ],
          },
          {
            type: 'quiz',
            question: 'Three branches have average baskets of $24, $30 and $38. Why is the overall average not simply $30.67?',
            options: [
              'Because averages must be rounded to whole dollars',
              'Because each branch has a different number of transactions, so the overall average must be weighted (total revenue ÷ total transactions)',
              'Because the median should always be used instead',
              'It is $30.67 — averaging averages is always correct',
            ],
            correctIndex: 1,
            explanation: 'Averaging averages gives a small branch the same weight as a large one. The correct overall figure is total revenue divided by total transactions.',
            skillId: 'data-interpretation',
          },
        ],
      },
    ],
    activity: {
      id: 'da-challenge-activity',
      domainId: 'data-analytics',
      title: 'Regional Sales Review: Fix the AI Analysis',
      scenario: 'You are a data analyst at Savanna Crest Retail (fictional). A colleague used an AI tool to analyse July–August sales for three regions and drafted a summary for the commercial director. Before the Monday meeting, you must review it, correct it and present a trustworthy insight.',
      data: `Region    | Month | Transactions | Revenue (USD) | Avg basket (USD)
Harare    | Jul   | 4,000        | 96,000        | 24.00
Harare    | Aug   | 4,200        | 105,000       | 25.00
Bulawayo  | Jul   | 1,500        | 45,000        | 30.00
Bulawayo  | Aug   | 1,000        | 32,000        | 32.00
Masvingo  | Jul   | 500          | 19,000        | 38.00
Masvingo  | Aug   | 600          | 24,000        | 40.00

AI-generated analysis (pasted by colleague):
1. "Overall average basket rose from $30.67 in July to $32.33 in August (+5.4%)."
2. "Revenue grew strongly across the business, led by Masvingo (+26%)."
3. "Bulawayo customers are our most valuable, with baskets up to $32."
4. "Recommendation: move 30% of Harare’s marketing budget to Masvingo."

Note: to get this analysis, the colleague also pasted a list of the top 20 loyalty customers (names, phone numbers, mobile-money numbers, spend) into a public AI tool.`,
      task: 'Submit your review for the commercial director. Include: (1) your approach, (2) how you used or would use AI, with at least one prompt, (3) each error you found and how you verified it (show corrected figures), (4) the responsible-AI and data-protection risks and what should happen next, and (5) a corrected three-sentence insight with a recommendation.',
      rubric: [
        { criterion: 'Verification & critical thinking', description: 'Finds the average-of-averages error, the misleading "strong growth" claim and the overclaimed recommendation; recalculates correctly.', weight: 30 },
        { criterion: 'Effective AI use', description: 'Uses AI to recalculate and critique with clear prompts, and checks AI arithmetic independently.', weight: 20 },
        { criterion: 'Responsible AI & data protection', description: 'Flags the customer data pasted into a public tool, recommends reporting it and anonymising in future; avoids misleading presentation.', weight: 20 },
        { criterion: 'Insight & communication', description: 'Clear, accurate, balanced insight with an appropriate, evidence-based recommendation and stated limitations.', weight: 30 },
      ],
      skillIds: ['domain-data-analytics', 'ai-verification', 'data-interpretation', 'data-privacy'],
      sampleStrongAnswer: `Approach: I recalculated every figure in a spreadsheet, then used AI only to critique the draft, sharing the regional table but no customer data.

Prompt: "Using this table, calculate overall average basket per month as total revenue ÷ total transactions, show your working, and list any claims in this analysis that the data does not support."

Errors found:
1. The AI averaged the three regional averages. Weighted correctly, the average basket was $26.67 in July (160,000 ÷ 6,000) and $27.76 in August (161,000 ÷ 5,800) — up 4.1%, not 5.4%, and a much lower level.
2. "Strong growth" is wrong: total revenue rose only 0.6% ($160,000 to $161,000) and transactions fell 3.3%. Bulawayo revenue fell 29%.
3. Bulawayo's higher basket hides a one-third drop in transactions — not "most valuable".
4. Masvingo's +26% is from a small base ($5,000 extra). Moving 30% of Harare's budget, our largest region, on two months of data is not justified.

Responsible AI: pasting names, phone and mobile-money numbers into a public tool is a data breach risk. I would report it to the data-protection lead today and agree to use anonymised extracts only.

Insight: "Revenue was flat in August (+0.6%) while average basket rose 4%. Bulawayo transactions fell by a third and need urgent investigation. We recommend a small Masvingo pilot rather than moving Harare's budget, and reviewing three months of data before reallocating."`,
    },
  },
];
