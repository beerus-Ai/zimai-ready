import type { ModuleContent } from '../../types';

/**
 * Marketing & Sales — domain lesson content.
 * All organisations, brands and people are fictional.
 */
export const MARKETING_CONTENT: ModuleContent[] = [
  // ───────────────────────────── mkt-content ─────────────────────────────
  {
    moduleId: "mkt-content",
    lessons: [
      {
        id: "mkt-content-l1",
        title: "From Brief to Campaign Plan with AI",
        minutes: 12,
        blocks: [
          {
            type: "explain",
            title: "Where AI fits in campaign work",
            body: "AI is a fast brainstorming and drafting partner for audience ideas, campaign concepts, content calendars, headline variations and first drafts. It does not know your customers, your current prices or what your brand has promised before. Give it a real brief, then judge the output against your strategy, your facts and your brand voice. You remain the editor-in-chief.",
            bullets: [
              "Concepts and creative angles",
              "Content calendars",
              "Copy variations for testing",
              "Repurposing across channels",
            ],
          },
          {
            type: "ai-example",
            title: "From vague request to real brief",
            instruction: "Show a weak prompt and a strong campaign-brief prompt for a marketing professional in the learner's industry in Zimbabwe (fictional brand). The strong prompt should include product, audience, channels (e.g. WhatsApp, Facebook, community radio), objective, budget, tone, languages, mandatory facts with prices in USD and ZiG, and claims to avoid. Then show a short excerpt of the plan it might produce.",
            fallback: "Weak: 'Give me a marketing campaign for our new product.'\n\nStrong: 'You are a marketing assistant for Kopje Foods, a fictional Bulawayo maize-meal brand. Plan a 4-week launch for a new 5 kg fortified maize-meal pack. Audience: household shoppers in Bulawayo and Gweru, WhatsApp-first. Channels: WhatsApp Business broadcasts (opted-in customers only), Facebook, community radio in Ndebele and English. Objective: 20% trial among existing customers. Budget: USD 3,000. Tone: warm, family-focused. Mandatory facts: USD 4.50 or ZiG equivalent at the till; fortified with vitamin A and iron. No health claims beyond the label. Output: a weekly plan table and 3 headline options per channel.'\n\nExcerpt: 'Week 1, teaser: WhatsApp status \"Something new for the family pot...\"; 20-second Ndebele radio jingle; Facebook poll on favourite sadza dishes.'",
          },
          {
            type: "example",
            title: "The campaign that promised too much",
            scenario: "Zambezi Digital Studio, a fictional Harare agency, used AI to draft ads for a client's solar-backup kit. The copy read 'Never suffer load-shedding again: guaranteed 24-hour power'. In reality the kit ran lights and a TV for about 6 hours. Customers complained publicly on Facebook, and the client had to offer refunds and publish a correction.",
            takeaway: "AI optimises for persuasive language, not truth. Every claim must match the product's real, provable performance.",
          },
          {
            type: "interactive",
            title: "Pick the headline to publish",
            prompt: "AI generated four headlines for a savings-account promotion by Savanna Crest Bank (fictional). Which one should you use?",
            mode: "choose-better",
            options: [
              { id: "a", label: "'Guaranteed to double your money in a year!'", correct: false, feedback: "Misleading and unrealistic: a regulatory and reputational risk." },
              { id: "b", label: "'Save from USD 5 a month on mobile banking. 4% interest a year. Terms apply.'", correct: true, feedback: "Correct. Specific, verifiable and clear about terms. Confirm the rate with Product before publishing." },
              { id: "c", label: "'The best bank in Zimbabwe, rated number one by everyone.'", correct: false, feedback: "An unprovable superlative, and possibly a hallucinated award." },
              { id: "d", label: "'Other banks are scamming you. Switch now!'", correct: false, feedback: "Inflammatory, unproven and unsafe for the brand." },
            ],
          },
          {
            type: "quiz",
            question: "What is the most useful thing to add to a campaign prompt to reduce misleading output?",
            options: [
              "More emojis and hashtags",
              "Mandatory facts, verified prices and a list of claims to avoid",
              "An instruction to be 'as persuasive as possible'",
              "Competitor brand names to attack",
            ],
            correctIndex: 1,
            explanation: "Grounding the AI in verified facts and explicit no-go claims makes accurate copy far more likely. You still check every claim afterwards.",
            skillId: "domain-marketing",
          },
          {
            type: "task",
            title: "Try it: write a campaign-brief prompt",
            instructions: "Pick a product or service you market. Write a campaign-brief prompt that includes audience, channel, objective, tone, languages, mandatory facts and claims to avoid. Run it in your approved AI tool, then highlight every factual claim in the output and check each against a source.",
            hint: "USD and ZiG prices change. Confirm them on the day you publish, not the day you draft.",
          },
        ],
      },
      {
        id: "mkt-content-l2",
        title: "On-Brand, Truthful Content for Every Audience",
        minutes: 13,
        blocks: [
          {
            type: "explain",
            title: "The four-point content check",
            body: "Before AI-assisted content goes out, ask four questions. Is it true? Is it on-brand? Is it right for this audience? Is it safe for the brand? AI can invent statistics, awards, testimonials and even customer quotes. Treat every number, name and claim as unverified until you have a source you can open.",
            bullets: [
              "Facts: prices, rates, dates, stats",
              "Voice: tone and vocabulary",
              "Audience: language and culture",
              "Safety: nothing offensive or risky",
            ],
          },
          {
            type: "example",
            title: "A translation that missed the mark",
            scenario: "Mosi Connect, a fictional mobile network, asked AI to translate a playful English data-bundle ad into Shona and Ndebele. The Shona version used a slang word that older customers found rude, and the Ndebele version translated an English idiom word-for-word, so it made no sense. A fluent reviewer caught both before launch and rewrote the lines naturally.",
            takeaway: "AI translation is a first draft. Fluent, culturally aware reviewers must approve every Shona and Ndebele version.",
          },
          {
            type: "interactive",
            title: "Spot the post that must not go out",
            prompt: "AI drafted four social posts for Kopje Foods (fictional). Which one should NOT be published?",
            mode: "spot-the-risk",
            options: [
              { id: "a", label: "'Our new pack is fortified with iron and vitamin A. Check the label for details.'", correct: false, feedback: "Matches the label, so it is safe once verified." },
              { id: "b", label: "'\"This porridge cured my child's malnutrition\" (Mai Tendai, Gweru)'", correct: true, feedback: "This is the risk: a probably invented testimonial making a medical claim. Never publish AI-generated quotes or health claims you cannot prove." },
              { id: "c", label: "'In stores from 1 June. USD 4.50 or ZiG equivalent at the till.'", correct: false, feedback: "Clear and factual. Confirm the price on the day." },
              { id: "d", label: "'Share your favourite sadza recipe in the comments!'", correct: false, feedback: "Engaging and harmless." },
            ],
          },
          {
            type: "ai-example",
            title: "One message, three channels",
            instruction: "Take one short product message relevant to the learner's industry in Zimbabwe (fictional brand) and show three AI-adapted versions: a WhatsApp broadcast (short, friendly, with opt-out), a formal email opening, and a radio line. Finish with a reviewer's checklist of what a human must verify before each version is published.",
            fallback: "Message: Savanna Crest Bank (fictional) makes transfers between its mobile wallet and bank accounts free.\n\nWhatsApp: 'Good news! Move money between your Savanna Crest wallet and account for free, 24/7. Reply STOP to opt out.'\nEmail: 'Dear Customer, from 1 July, transfers between your Savanna Crest mobile wallet and your bank account are free of charge...'\nRadio: 'Free transfers, any time. Savanna Crest Bank. Terms apply.'\n\nReviewer checklist: confirm the launch date and fee terms with Product; send WhatsApp only to opted-in customers; legal check of 'free' and 'terms apply'; fluent review of any Shona or Ndebele versions.",
          },
          {
            type: "quiz",
            question: "AI-drafted copy says 'Trusted by over 500,000 Zimbabweans'. What should you do?",
            options: [
              "Publish it, because it sounds credible",
              "Verify the figure from an internal source, and remove it if it cannot be proven",
              "Round it up to a million for impact",
              "Attribute it to 'industry reports'",
            ],
            correctIndex: 1,
            explanation: "AI often invents plausible statistics. Only publish numbers you can trace to a real, current source.",
            skillId: "ai-verification",
          },
          {
            type: "task",
            title: "Try it: a brand-voice card",
            instructions: "Write a five-line brand-voice card: tone, words we use, words we avoid, languages, and claims we never make. Paste it at the top of your next content prompt and compare the output with and without it.",
          },
        ],
      },
    ],
    activity: {
      id: "mkt-content-activity",
      title: "Review and Rewrite an AI-Drafted Product Launch",
      domainId: "marketing",
      scenario: "Kopje Foods (fictional) is launching 'Kopje Crunch', a peanut-butter snack bar sold in Bulawayo and Harare supermarkets and through WhatsApp orders. A junior marketer used AI to produce the launch content below. You are the reviewer before it goes to the brand manager.",
      data: "AI-DRAFTED LAUNCH CONTENT\n1. Facebook: 'Kopje Crunch: the healthiest snack in Africa! Doctors recommend it for diabetics. 100% natural, zero sugar.'\n2. WhatsApp broadcast (to every number collected from our 2023 competition entries): 'Hey! Kopje Crunch is HERE. Only $1! Order now before stock runs out forever!'\n3. Radio script: Ndebele version machine-translated from English, not yet reviewed.\n4. Influencer caption (AI-suggested): 'I lost 5 kg in a week with Kopje Crunch!'\n\nPRODUCT FACT SHEET\nIngredients: peanuts, oats, honey. Sugar: 8 g per bar. Price: USD 1.20 (ZiG equivalent at the till). No clinical or nutrition studies. Allergen: contains peanuts. Stock: continuous production.",
      task: "Submit: (1) the problems you find, covering claims, consumer data and consent, brand safety, and cultural or language issues; (2) the prompt(s) you would use to regenerate better copy; (3) how you would verify the new copy before publishing; (4) your revised Facebook post and WhatsApp message.",
      rubric: [
        { criterion: "Claim accuracy & verification", description: "Identifies false or unprovable claims (healthiest, doctors recommend, zero sugar, weight loss, wrong price, false scarcity) by checking against the fact sheet, and describes a clear verification step.", weight: 30 },
        { criterion: "Responsible marketing", description: "Flags messaging people who never opted in, the invented testimonial, the missing allergen warning and the unreviewed Ndebele script; proposes consent-based, culturally appropriate alternatives.", weight: 25 },
        { criterion: "AI use & prompting", description: "Writes a grounded prompt that supplies the fact sheet, audience, tone, channel and explicit no-go claims.", weight: 20 },
        { criterion: "Quality of revised copy", description: "Revised posts are accurate, engaging, on-brand, include price and allergen information, and suit each channel.", weight: 25 },
      ],
      skillIds: ["ai-writing", "domain-marketing", "ai-verification"],
      sampleStrongAnswer: "Problems: 'healthiest snack in Africa' is unprovable. 'Doctors recommend it for diabetics', 'zero sugar' and the weight-loss caption are false or unsupported health claims: the bar has 8 g of sugar and there are no studies. The influencer caption is AI-invented and implies an endorsement that does not exist. The WhatsApp message targets 2023 competition entrants who never agreed to marketing, shows the wrong price ($1, not USD 1.20) and uses false scarcity. The Ndebele script is unreviewed, and no copy mentions the peanut allergen.\n\nPrompt: 'Using only the facts below [fact sheet], write a Facebook post and a WhatsApp broadcast for Kopje Crunch aimed at busy families in Bulawayo and Harare. Warm, playful tone. No health, medical or weight-loss claims, no superlatives, no urgency tactics. Include the price (USD 1.20, ZiG equivalent at the till), a peanut allergen note and an opt-out line for WhatsApp.'\n\nVerification: check every claim against the fact sheet, confirm the price with Sales on publishing day, ask a fluent Ndebele speaker to adapt the radio script rather than translate it, and get brand-manager sign-off. WhatsApp goes only to customers who opted in.\n\nRevised Facebook: 'Crunchy peanuts, oats and a touch of honey. Meet Kopje Crunch, the lunchbox snack made in Bulawayo. USD 1.20 (ZiG equivalent at the till). Contains peanuts.'\n\nRevised WhatsApp: 'Hi! Kopje Crunch is now in stores and on WhatsApp order: USD 1.20 a bar. Reply ORDER to buy or STOP to opt out.'",
    },
  },

  // ───────────────────────────── mkt-insights ─────────────────────────────
  {
    moduleId: "mkt-insights",
    lessons: [
      {
        id: "mkt-insights-l1",
        title: "Segmenting Customers with AI",
        minutes: 12,
        blocks: [
          {
            type: "explain",
            title: "What AI segmentation does",
            body: "AI can group customers by behaviour (how often they buy, what, when and through which channel) and suggest names and messages for each group. Its value depends on clean data and a clear business question. Treat segments as hypotheses: test them with small, low-cost campaigns before you commit the budget.",
            bullets: [
              "Behaviour: frequency, spend, recency",
              "Channel: WhatsApp, in-store, app",
              "Needs: price, convenience, family",
              "Test before you scale",
            ],
          },
          {
            type: "example",
            title: "Three kinds of shopper",
            scenario: "Musasa Mart, a fictional Harare retail chain, gave AI 12 months of anonymised loyalty data. It proposed three segments: 'month-end bulk buyers' paying mainly in USD cash, 'weekly top-up shoppers' paying by mobile money, and 'weekend family shoppers'. The team tested a WhatsApp offer with each; top-up shoppers responded best to small-basket bundles, so the budget went there.",
            takeaway: "AI found the patterns quickly; testing with real customers showed which ones mattered.",
          },
          {
            type: "ai-example",
            title: "A segmentation prompt that protects customers",
            instruction: "Show a strong prompt to segment an anonymised customer dataset relevant to the learner's industry in Zimbabwe (list the columns, including payment method such as USD cash, card, mobile money or ZiG). Ask for 3–5 segments with size, defining behaviours, a suggested offer and warnings about small or unclear segments, and forbid inferring protected characteristics. Then show a short example output table.",
            fallback: "Prompt: 'Using this anonymised dataset (customer_code, branch, visits_per_month, avg_basket_usd, payment_method [USD cash / card / mobile money / ZiG], preferred_channel, last_purchase_date), propose 4 customer segments. For each, give size (%), defining behaviours, one suggested offer and the evidence. Flag segments under 5% of customers. Do not infer age, gender or ethnicity.'\n\nExample output:\nSegment | Size | Behaviour | Offer\nMobile-money top-up | 38% | 6+ visits a month, small baskets | Bundle deals via WhatsApp\nMonth-end bulk | 27% | 1–2 visits, USD cash | Payday multi-buy\nLapsed | 9% | No visit in 90 days | Win-back voucher",
          },
          {
            type: "interactive",
            title: "Which data belongs in the segmentation?",
            prompt: "Select ALL the items that are appropriate to use.",
            mode: "sort",
            options: [
              { id: "a", label: "Purchase frequency and average basket value", correct: true, feedback: "Core behavioural data for segmentation." },
              { id: "b", label: "Payment method (USD cash, card, mobile money, ZiG)", correct: true, feedback: "Useful and expected by customers in a loyalty programme." },
              { id: "c", label: "Customers' full names and phone numbers", correct: false, feedback: "Not needed to find segments. Use anonymised codes, and re-link only for opted-in messaging." },
              { id: "d", label: "Tribe inferred from surname", correct: false, feedback: "Inferring ethnicity is invasive and discriminatory. Never do this." },
            ],
          },
          {
            type: "quiz",
            question: "AI proposes a 'high-value' segment containing only 11 customers. What is the sensible response?",
            options: [
              "Launch a large campaign aimed at them",
              "Treat it as too small to generalise from: merge or monitor it before investing",
              "Ask the AI to generate more customers like them",
              "Delete them from the dataset",
            ],
            correctIndex: 1,
            explanation: "Tiny segments give unreliable patterns. Check that a segment is large and stable enough before spending budget on it.",
            skillId: "data-interpretation",
          },
          {
            type: "task",
            title: "Try it: one testable segment",
            instructions: "Using anonymised data you already have (or the Musasa Mart example), ask AI for three segments. Choose one, write a small test campaign for it (message, channel, success measure) and decide what result would prove the segment is real.",
            hint: "A good success measure is specific, e.g. 'redemption rate above 8% within two weeks'.",
          },
        ],
      },
      {
        id: "mkt-insights-l2",
        title: "Reading Customer Sentiment with AI",
        minutes: 13,
        blocks: [
          {
            type: "explain",
            title: "Sentiment analysis in practice",
            body: "AI can read thousands of reviews, WhatsApp messages and social comments to find themes and sentiment. It struggles with sarcasm, local slang and code-switching between English, Shona and Ndebele. Use it to find themes quickly, then read a random sample yourself. Sentiment scores are signals to investigate, not facts to report.",
            bullets: [
              "Theme counts beat single scores",
              "Read a random sample",
              "Watch mixed-language comments",
              "Remove personal details first",
            ],
          },
          {
            type: "example",
            title: "Sarcasm the AI missed",
            scenario: "Mosi Connect (fictional) ran AI sentiment analysis on 3,000 social comments about a new data bundle. The tool scored them 70% positive. A marketer reading a sample noticed many 'positive' comments were sarcastic, code-switched jokes about the bundle expiring too quickly. The real theme was frustration with expiry, and the product team extended the bundle's validity.",
            takeaway: "Always sample-check AI sentiment, especially for sarcastic and mixed-language comments.",
          },
          {
            type: "interactive",
            title: "Spot the misleading conclusion",
            prompt: "AI analysed 180 reviews of a fictional Bulawayo restaurant chain. Which conclusion is the risk?",
            mode: "spot-the-risk",
            options: [
              { id: "a", label: "'Delivery delays are mentioned in 42 reviews, mostly on Friday nights.'", correct: false, feedback: "Specific, countable and easy to verify." },
              { id: "b", label: "'Customers love the new menu, so prices can safely rise by 30%.'", correct: true, feedback: "This is the risk. It leaps from sentiment to a pricing decision the data cannot support; there is no evidence about price sensitivity." },
              { id: "c", label: "'Complaints about load-shedding disrupting service fell after generators were installed.'", correct: false, feedback: "A reasonable, checkable trend." },
              { id: "d", label: "'12% of reviews are in Ndebele or mixed language; these need human review.'", correct: false, feedback: "Good practice: it flags where the AI may be unreliable." },
            ],
          },
          {
            type: "ai-example",
            title: "From comments to action",
            instruction: "Show a short fictional set of 6 customer comments relevant to the learner's industry in Zimbabwe (mix of English with some Shona or Ndebele phrases, with translations), then an AI-style theme summary with counts, two actions a marketer might take, and one check to do before acting.",
            fallback: "Comments (Savanna Crest Bank app, fictional):\n1. 'App yakanaka (the app is good) but OTP takes forever'\n2. 'Transfer failed during load-shedding'\n3. 'Love the ZiG/USD balance view'\n4. 'Kuvhura account kwakaoma (opening an account is hard)'\n5. 'Sibonga (thank you), fast help on WhatsApp'\n6. 'OTP never arrives'\n\nThemes: OTP and transfer reliability (3), account-opening friction (1), positive feedback on balance view and WhatsApp support (2).\nActions: brief IT on OTP delays; simplify the account-opening screens.\nCheck first: confirm OTP complaint volumes in support logs. Six comments are not a trend.",
          },
          {
            type: "quiz",
            question: "Why remove names and phone numbers from WhatsApp messages before running AI sentiment analysis?",
            options: [
              "It makes the analysis faster",
              "Identifiers are not needed to find themes, and customers did not agree to their details being processed by an external AI tool",
              "AI tools cannot read phone numbers",
              "It improves sarcasm detection",
            ],
            correctIndex: 1,
            explanation: "Data minimisation protects customers and your brand. Themes and sentiment can be found without knowing who wrote each message.",
            skillId: "data-privacy",
          },
          {
            type: "quiz",
            question: "Positive sentiment rose from 55% to 68% after a campaign. What is the best interpretation?",
            options: [
              "The campaign caused the rise",
              "It is a promising signal: check sample size, seasonality and other changes before crediting the campaign",
              "Sentiment data is useless",
              "Double the campaign budget immediately",
            ],
            correctIndex: 1,
            explanation: "Other factors (a price change, a competitor's outage, a public holiday) could explain the shift. Look for supporting evidence before claiming cause and effect.",
            skillId: "data-interpretation",
          },
        ],
      },
    ],
  },

  // ───────────────────────────── mkt-sales (advanced) ─────────────────────────────
  {
    moduleId: "mkt-sales",
    lessons: [
      {
        id: "mkt-sales-l1",
        title: "AI Lead Scoring & Sales Forecasting",
        minutes: 10,
        blocks: [
          {
            type: "explain",
            title: "How lead scoring and forecasts work",
            body: "Lead-scoring models rank prospects by how likely they are to buy, using signals such as enquiries, website visits, WhatsApp replies and past purchases. Forecasts project sales from the pipeline and history. Both are only as good as their data and assumptions, and both can quietly exclude customers the model rarely saw.",
            bullets: [
              "Scores are signals, not certainty",
              "Know what drives each score",
              "Recalibrate after market shifts",
              "Salespeople keep their judgement",
            ],
          },
          {
            type: "example",
            title: "The forecast that missed the price shock",
            scenario: "Harvest Sun Solar, a fictional Bulawayo start-up, used an AI forecast built on two years of sales. It predicted 25% growth for the next quarter. The model knew nothing about a new import duty and a currency shift that had just pushed prices up. The sales manager adjusted it with local knowledge and presented a range with stated assumptions instead of one number.",
            takeaway: "AI forecasts extrapolate the past. People add market context and communicate the uncertainty.",
          },
          {
            type: "interactive",
            title: "Spot the biased signal",
            prompt: "A lead-scoring model for Mhondoro Capital, a fictional microfinance lender, uses these signals. Which one is the risk?",
            mode: "spot-the-risk",
            options: [
              { id: "a", label: "Replied to a WhatsApp enquiry within 48 hours", correct: false, feedback: "A reasonable engagement signal." },
              { id: "b", label: "Requested a repayment quote on the loan calculator", correct: false, feedback: "Clear intent to buy: a fair signal." },
              { id: "c", label: "Lives in a high-density suburb (scored lower)", correct: true, feedback: "This is the risk. Location can act as a proxy for income or ethnicity and may unfairly exclude creditworthy customers. Review it with Compliance." },
              { id: "d", label: "Already holds a savings account with the lender", correct: false, feedback: "An existing relationship is a legitimate signal." },
            ],
          },
          {
            type: "ai-example",
            title: "Ask the AI to explain the score",
            instruction: "Show how a salesperson in the learner's industry in Zimbabwe could prompt an AI tool to explain in plain language why a lead has a high or low score, then show a sample explanation listing the top 3 contributing factors and one reason for caution. Use fictional data.",
            fallback: "Prompt: 'Explain in plain language why lead A-2291 scored 82/100. List the top 3 factors, roughly how much each contributed, and anything that might make this score unreliable.'\n\nSample answer: 'Top factors: (1) requested a solar quote twice this month (+30); (2) opened 3 of the last 4 WhatsApp broadcasts (+20); (3) bought a 1 kVA system last year (+15). Caution: the model was trained before the recent price increase, so actual conversion may be lower than it expects.'",
          },
          {
            type: "quiz",
            question: "Your AI forecast predicts exactly USD 412,000 in sales next quarter. How should you present it?",
            options: [
              "As a guaranteed target",
              "As a range, with assumptions and risks stated (currency, load-shedding, supply delays)",
              "Rounded up to USD 500,000 to motivate the team",
              "Not at all, because forecasts are useless",
            ],
            correctIndex: 1,
            explanation: "A single precise number hides uncertainty. A range with explicit assumptions helps leaders plan and shows where human judgement was applied.",
            skillId: "customer-ai",
          },
        ],
      },
      {
        id: "mkt-sales-l2",
        title: "Personalised Outreach at Scale, with Consent",
        minutes: 10,
        blocks: [
          {
            type: "explain",
            title: "Personalisation customers welcome",
            body: "AI can tailor messages by segment, product interest, language and timing at a scale no team could write by hand. Customers welcome relevance but resent intrusion. Message only people who opted in, use data they would expect you to use, make opting out easy, and never let automation send sensitive or high-pressure messages unchecked.",
            bullets: [
              "Opted-in contacts only",
              "Relevant, not creepy",
              "Easy STOP / opt-out",
              "Human approval of templates",
            ],
          },
          {
            type: "example",
            title: "Far too personal",
            scenario: "An AI-generated WhatsApp campaign for Mopane Health Stores, a fictional pharmacy chain, used purchase history to write: 'Time to restock your diabetes test strips, Tendai?' Several customers were upset that anyone glancing at their phone could see their health condition. The chain withdrew the campaign, apologised and banned health purchase data from marketing personalisation.",
            takeaway: "Sensitive data (health, debts, religion) must never drive automated personalisation without explicit consent and careful review.",
          },
          {
            type: "ai-example",
            title: "Personalised templates done responsibly",
            instruction: "Show 3 AI-generated WhatsApp message templates for different customer segments of a fictional business in the learner's industry in Zimbabwe. Each should use personalisation fields in {curly braces}, include an opt-out line, and note which data field is used and why it is appropriate.",
            fallback: "1. Month-end bulk buyers: 'Hi {first_name}, payday specials at Musasa Mart {branch} this weekend: 10% off 10 kg rice and cooking oil. Reply STOP to opt out.' (Uses branch and segment, which loyalty members expect.)\n\n2. Lapsed shoppers: 'We miss you, {first_name}! Here is a USD 2 voucher for your next visit to {branch}, valid until {expiry_date}. Reply STOP to opt out.' (Uses last-visit date: fair for a win-back offer.)\n\n3. Mobile-money shoppers: 'Pay with mobile money at {branch} this week and earn double loyalty points. Reply STOP to opt out.' (Uses payment preference; no amounts or balances shown.)",
          },
          {
            type: "interactive",
            title: "Rules for an AI outreach workflow",
            prompt: "Select ALL the rules you would build into an automated AI outreach workflow.",
            mode: "sort",
            options: [
              { id: "a", label: "Send only to customers who opted in, and honour STOP immediately", correct: true, feedback: "Consent is the foundation of responsible outreach." },
              { id: "b", label: "Require human approval of every new message template before it goes live", correct: true, feedback: "Stops errors and off-brand or insensitive messages reaching thousands of people." },
              { id: "c", label: "Cap messages at two per customer per week", correct: true, feedback: "Frequency caps protect goodwill and reduce spam complaints." },
              { id: "d", label: "Buy a list of phone numbers to reach new prospects", correct: false, feedback: "Bought lists rarely carry valid consent: a legal and brand risk." },
            ],
          },
          {
            type: "quiz",
            question: "An AI tool suggests messaging every lead nightly: 'FINAL WARNING! Your offer expires in 1 hour!' What is the problem?",
            options: [
              "Nothing, because urgency works",
              "It uses false urgency and pressure, invites spam complaints and damages trust",
              "It should be sent every hour instead",
              "It needs more emojis",
            ],
            correctIndex: 1,
            explanation: "Fake deadlines are misleading. Repeated pressure erodes trust in the brand, whatever the short-term response rate.",
            skillId: "responsible-ai",
          },
          {
            type: "quiz",
            question: "When should an automated WhatsApp sales flow hand over to a person?",
            options: [
              "Never, because full automation is cheaper",
              "For complaints, complex questions, vulnerable customers or whenever someone asks for a person",
              "Only once the customer has paid",
              "When the AI runs out of templates",
            ],
            correctIndex: 1,
            explanation: "Automation handles routine steps; people handle judgement, empathy and exceptions. A clear hand-over protects customers and sales.",
            skillId: "ai-automation",
          },
        ],
      },
    ],
  },

  // ───────────────────────────── mkt-challenge ─────────────────────────────
  {
    moduleId: "mkt-challenge",
    lessons: [
      {
        id: "mkt-challenge-l1",
        title: "Challenge Briefing: Build and Judge an AI-Assisted Campaign",
        minutes: 6,
        blocks: [
          {
            type: "explain",
            title: "What this challenge tests",
            body: "You will take an AI-generated campaign plan for a fictional financial product, evaluate its quality, and use AI to develop something better. Assessors look for sharp critical evaluation, careful verification of every claim and statistic, responsible use of customer data, and a final campaign that is persuasive and honest.",
            bullets: [
              "Critical evaluation of AI output",
              "Fact and claim verification",
              "Consent, brand safety, culture",
              "A better, realistic plan",
            ],
          },
          {
            type: "interactive",
            title: "How should you use AI in this challenge?",
            prompt: "Choose the approach that reflects good professional practice.",
            mode: "choose-better",
            options: [
              { id: "a", label: "Ask AI to 'make the plan better' and submit whatever it returns", correct: false, feedback: "You would inherit new errors without noticing. The challenge rewards your judgement, not the AI's." },
              { id: "b", label: "Ground the AI in the real product facts, ask for options and a critique, then verify every claim and explain your choices", correct: true, feedback: "Correct. Show your prompts, what you checked and why you changed things." },
              { id: "c", label: "Keep the AI's statistics because they make the plan sound authoritative", correct: false, feedback: "Unverified statistics may be hallucinated. Cite only sources you can open and check." },
              { id: "d", label: "Skip AI and write the plan from scratch", correct: false, feedback: "The challenge assesses responsible AI use. Show how you use it well." },
            ],
          },
          {
            type: "explain",
            title: "Responsible-AI reminders",
            body: "Never promise returns, speed or approvals the product cannot deliver. Message only people who gave consent. Do not use a person's image, voice or name without an agreement. Speak to audiences with respect, and have Shona and Ndebele versions written or reviewed by fluent speakers. A person approves everything before it goes live.",
            bullets: [
              "No misleading claims",
              "Consent for every contact",
              "Respectful, local-language content",
              "Human sign-off",
            ],
          },
          {
            type: "quiz",
            question: "The AI plan cites '87% of traders use digital savings groups (Global Fintech Report 2024)'. You cannot find the report. What should you do?",
            options: [
              "Keep it, since AI is usually right about statistics",
              "Remove it or replace it with a figure from a source you can verify",
              "Change it to 'about 90%' to be safe",
              "Keep it but move it to a footnote",
            ],
            correctIndex: 1,
            explanation: "An untraceable statistic may be hallucinated. Publishing it risks misleading customers and damaging credibility.",
            skillId: "ai-verification",
          },
        ],
      },
    ],
    activity: {
      id: "mkt-challenge-activity",
      title: "Build and Critically Evaluate an AI-Assisted Campaign",
      domainId: "marketing",
      scenario: "Zambezi Digital Studio, a fictional Harare agency, is pitching a launch campaign to Mhondoro Capital, a fictional licensed microfinance institution. The product is 'Mukando Plus', a WhatsApp-based group savings and small-loan service for informal traders in Harare, Bulawayo and Mutare. The account director asked an AI tool for a campaign plan and received the draft below. You must evaluate the AI's output and use AI responsibly to develop a campaign fit to present to the client.",
      data: "AI-GENERATED CAMPAIGN PLAN\nCampaign name: 'Mukando Plus: Get Rich Together!'\nObjective: 'Sign up 1 million traders in the first month.'\nKey messages:\n- 'Zero fees forever and guaranteed returns of 20% a month.'\n- 'Approved by the central bank as Zimbabwe's safest savings product.'\n- 'Loans in 5 minutes, no questions asked.'\nAudience insight: 'Informal traders are mostly uneducated and easily persuaded by urgency.'\nChannels:\n- WhatsApp blasts to 200,000 numbers bought from a data broker\n- Facebook ads using a popular musician's viral video (no agreement in place)\n- Radio ads in English only\nSupporting statistic: '87% of Zimbabwean traders already use digital savings groups (Global Fintech Report 2024).'\nBudget: USD 15,000. KPI: impressions.\n\nPRODUCT FACTS (from Mhondoro Capital)\nSavings earn 6% a year. First 3 months free, then USD 1 a month. Loan decisions in 24–48 hours after KYC checks. Licensed microfinance institution. Launch target: 5,000 active sign-ups in 3 months. Customers prefer WhatsApp and radio; many trade in markets and speak Shona or Ndebele as a first language.",
      task: "Submit a campaign proposal that: (1) evaluates the AI-generated plan, listing weak, misleading or risky elements and why; (2) shows how you would use AI to develop a better plan, including at least two prompts; (3) explains how you verified facts, statistics and claims; (4) sets out responsible-AI safeguards (consent, brand safety, cultural sensitivity, human approval); (5) presents your improved key messages, channel plan and KPIs.",
      rubric: [
        { criterion: "Critical evaluation of AI output", description: "Systematically identifies misleading claims, the unrealistic objective, the wrong KPI, the disrespectful audience insight and the channel problems, comparing each against the product facts.", weight: 25 },
        { criterion: "Verification of facts & claims", description: "Checks every claim and statistic against the product facts and verifiable sources; removes or replaces anything untraceable, such as the '87%' figure.", weight: 20 },
        { criterion: "Responsible marketing", description: "Addresses consent (bought lists), unlicensed use of a person's likeness, respectful audience framing, Shona/Ndebele inclusion and human sign-off by the client and Compliance.", weight: 25 },
        { criterion: "AI use & prompting", description: "Uses grounded prompts that supply product facts and constraints, and uses AI to critique its own drafts, not just generate them.", weight: 15 },
        { criterion: "Quality of improved campaign", description: "Messages, channels and KPIs are honest, persuasive, realistic for the budget and aligned with the 5,000 sign-up target.", weight: 15 },
      ],
      skillIds: ["domain-marketing", "ai-verification", "critical-thinking", "responsible-ai"],
      sampleStrongAnswer: "Evaluation: the AI plan cannot be used as written. 'Guaranteed 20% a month', 'zero fees forever' and 'loans in 5 minutes, no questions asked' contradict the product facts (6% a year, USD 1 a month after 3 free months, 24–48 hours after KYC) and would mislead customers. 'Approved by the central bank as the safest product' is an unverifiable regulatory claim. I could not find the 'Global Fintech Report 2024', so the 87% statistic is treated as hallucinated and removed. The audience insight is disrespectful; the bought numbers have no consent; the musician's video has no agreement; and English-only radio excludes many traders. The 1-million objective and impressions KPI ignore the real target of 5,000 active sign-ups.\n\nAI use: 'Using only these product facts, write three message options for informal traders in Harare, Bulawayo and Mutare. Respectful, plain language; no guaranteed returns; no regulatory claims beyond \"licensed microfinance institution\"; mention fees and KYC.' Then: 'Critique these messages for misleading claims, pressure tactics and tone.'\n\nVerification: every claim is checked against Mhondoro's product sheet and with its Compliance team; statistics come only from sources I can open; Shona and Ndebele versions are written or reviewed by fluent speakers; the client signs off before launch.\n\nImproved plan: message 'Save together, grow together: 6% a year, first 3 months free.' Channels: opt-in WhatsApp through market-association partners, Facebook, radio in Shona, Ndebele and English, and market-day sign-up stands. KPIs: 5,000 active sign-ups, cost per sign-up, 90-day active savers and complaint rate.",
    },
  },
];
