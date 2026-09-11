import type { ModuleContent } from '../../types';

/**
 * Agriculture domain content — crops, extension advisory, climate risk and markets in a Zimbabwean context.
 * Responsible-AI thread: farmer data, advice accuracy (a wrong recommendation can cost a season), local languages and connectivity.
 */
export const AGRICULTURE_CONTENT: ModuleContent[] = [
  // ───────────────────────── agri-crops ─────────────────────────
  {
    moduleId: 'agri-crops',
    lessons: [
      {
        id: 'agri-crops-l1',
        title: 'How AI Reads Fields: Satellites, Weather and Sensors',
        minutes: 12,
        blocks: [
          {
            type: 'explain',
            title: 'AI turns field signals into early warnings',
            body: 'Crop-monitoring AI combines satellite images, rainfall records, soil readings and past yields to spot patterns people cannot see across thousands of plots. It can flag moisture stress weeks early or estimate yields before harvest. But it only knows what its data shows: cloud cover in the rainy season, missing rain gauges and small plots all reduce accuracy.',
            bullets: [
              'Satellite greenness (NDVI) shows crop vigour',
              'Rainfall and temperature data drive risk models',
              'Soil and moisture sensors add plot-level detail',
              'Local observation confirms what the model suggests',
            ],
          },
          {
            type: 'example',
            title: 'A stress alert in Masvingo',
            scenario: 'In January, the Dry Ridge Farmers Association (fictional) received an AI alert: maize greenness on 40 plots had dropped 18% below the five-year average. The extension officer, Mr Moyo, visited six plots before advising anyone. Four showed moisture stress after a three-week dry spell; two were simply planted late and still developing.',
            takeaway: 'Treat an AI alert as a reason to look, not a diagnosis. Ground-truthing a sample of plots prevents advice that fits the model but not the field.',
          },
          {
            type: 'interactive',
            title: 'Which data would improve the forecast most?',
            prompt: 'An AI yield model for a smallholder maize scheme in Mashonaland Central is performing poorly. Which additions would genuinely help? Select all that apply.',
            mode: 'sort',
            options: [
              { id: 'a', label: 'Planting dates recorded by extension officers', correct: true, feedback: 'Yes. Late planting explains much of the variation that satellites misread as stress.' },
              { id: 'b', label: 'Rain-gauge readings from local schools and clinics', correct: true, feedback: 'Yes. Local rainfall data fills gaps where satellite rainfall estimates are coarse.' },
              { id: 'c', label: 'Farmers’ national ID numbers', correct: false, feedback: 'No. Identity numbers add nothing to yield prediction and create privacy risk.' },
              { id: 'd', label: 'Whether plots used conservation farming (planting basins, mulch)', correct: true, feedback: 'Yes. Conservation practices change moisture retention and yields in dry spells.' },
            ],
          },
          {
            type: 'ai-example',
            title: 'Reading an AI crop report in your context',
            instruction: "Generate a short, fictional AI crop-monitoring summary relevant to the learner's role in Zimbabwean agriculture (e.g. extension officer, agronomist, co-op manager). Include a stress alert, a confidence level, and the data it is based on. Then list three questions the learner should ask before acting on it. Use a fictional organisation name and a realistic crop (maize, tobacco, soya beans or horticulture).",
            fallback: `AI summary — Chimanimani Growers Co-op, week 6 of season:
"Soya bean vigour on 32 of 120 plots is 15% below normal. Likely cause: moisture stress. Confidence: medium. Based on satellite imagery (3 cloud-free images in 21 days) and regional rainfall estimates."

Questions to ask before acting:
1. With only three clear images, how old is the latest picture — has it rained since?
2. Are the 32 plots in one area (suggesting weather) or scattered (suggesting pests, planting dates or soil)?
3. What do farmers and the local extension officer see on the ground this week?`,
          },
          {
            type: 'quiz',
            question: 'An AI model shows low crop greenness on several plots during the rainy season. What is the most responsible first step?',
            options: [
              'Tell all affected farmers to replant immediately',
              'Visit or phone a sample of the flagged plots to confirm the cause before advising',
              'Ignore it — satellites are unreliable',
              'Post the list of affected farmers’ names on a public WhatsApp group',
            ],
            correctIndex: 1,
            explanation: 'Alerts can reflect cloud cover, late planting or pests rather than drought. Confirm on the ground, and keep farmer-level data private.',
            skillId: 'domain-agriculture',
          },
        ],
      },
      {
        id: 'agri-crops-l2',
        title: 'Yield Forecasts and Planting Decisions You Can Defend',
        minutes: 13,
        blocks: [
          {
            type: 'explain',
            title: 'A forecast is a range, not a promise',
            body: 'Yield forecasting models estimate harvests from rainfall, soil, inputs and history. Good forecasts give a range and a confidence level. In El Niño years, when rainfall drops well below normal, models trained on wetter years can be badly wrong. Always ask what years the model learned from and whether they resemble this season.',
            bullets: [
              'Ask for a low, likely and high estimate',
              'Check which seasons the model was trained on',
              'Compare with seasonal forecasts from the met services',
              'Plan for the low case when losses are unaffordable',
            ],
          },
          {
            type: 'interactive',
            title: 'Spot the flawed recommendation',
            prompt: 'An AI planting assistant gives four recommendations for a drought-prone ward in an El Niño season. Which is the risky one?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: 'Plant a long-season maize variety because last season’s high rainfall gave record yields', correct: true, feedback: 'Risky. It assumes this season will be like last season. In an El Niño year, short-season or drought-tolerant varieties and small grains are safer.' },
              { id: 'b', label: 'Stagger planting across two dates to spread rainfall risk', correct: false, feedback: 'Sensible. Staggering reduces the chance of losing everything to one dry spell.' },
              { id: 'c', label: 'Use planting basins and mulch to conserve moisture', correct: false, feedback: 'Sound conservation-farming advice for dry seasons.' },
              { id: 'd', label: 'Include a portion of sorghum or pearl millet', correct: false, feedback: 'Good diversification — small grains tolerate drought better than maize.' },
            ],
          },
          {
            type: 'ai-example',
            title: 'Prompting for a planting plan that shows its assumptions',
            instruction: "Write a strong prompt a Zimbabwean agriculture professional in the learner's role could use to get AI help with a planting plan for a fictional ward or farm. The prompt must include the region, soil type, the seasonal forecast (e.g. below-normal rainfall), farmer resources, and must ask the AI to state its assumptions and give low/likely/high yield ranges. Then show a short AI response that meets these requirements.",
            fallback: `Prompt: "I am an extension officer in a fictional ward in Natural Region IV, sandy loam soils. The seasonal forecast is below-normal rainfall with a late start (El Niño). Most farmers have 1–2 hectares, limited fertiliser and no irrigation. Suggest a planting plan for maize and small grains. State every assumption, give low/likely/high yield ranges per hectare, and list what I should verify locally."

AI response (excerpt): "Assumptions: first effective rains after 20 November; farmers can access short-season seed. Plan: 60% short-season maize in planting basins, 40% sorghum. Maize yield per hectare — low 0.6 t, likely 1.2 t, high 1.8 t. Verify locally: seed availability at agro-dealers, actual rain onset, and farmers' labour for basin preparation."`,
          },
          {
            type: 'example',
            title: 'When the forecast met the field',
            scenario: 'Green Valley Agro Services (fictional) used an AI forecast predicting 2.1 t/ha maize across its contract farmers. The agronomist, Mrs Dube, noticed the model had been trained only on three good seasons. She presented the forecast as a range (1.0–2.1 t/ha), advised farmers to plan input credit on the low case, and set a mid-season review. When a February dry spell hit, repayments stayed manageable.',
            takeaway: 'Planning on the low end of a range protects farmers who cannot absorb a bad season.',
          },
          {
            type: 'quiz',
            question: 'An AI yield model was trained on five seasons, all with normal or above-normal rainfall. This season is forecast as an El Niño drought. What is the key risk?',
            options: [
              'The model will be too pessimistic',
              'The model has never seen drought conditions, so its forecast may be far too optimistic',
              'There is no risk — five seasons is plenty of data',
              'The model will refuse to produce a forecast',
            ],
            correctIndex: 1,
            explanation: 'Models learn from past patterns. If none of those seasons were dry, the model cannot reliably predict drought outcomes and will likely overestimate yields.',
            skillId: 'predictive-analytics',
          },
          {
            type: 'task',
            title: 'Write your three verification questions',
            instructions: 'Think of a forecast or recommendation you or your team use (rainfall, yield, pest outbreak). Write three questions you would ask before trusting it — about data sources, training seasons and local ground-truth.',
            hint: 'Ask: what data, which years, and who on the ground has confirmed it?',
          },
        ],
      },
    ],
    activity: {
      id: 'agri-crops-activity',
      domainId: 'agriculture',
      title: 'Review an AI Planting Recommendation',
      scenario: 'You are an agronomist for the fictional Chimanimani Growers Co-op, which supports 180 smallholder farmers. The co-op manager has received an AI-generated planting recommendation for the coming season and wants your review before it is sent to farmers by SMS.',
      data: `Rainfall (mm, Nov–Mar) and average maize yield (t/ha) for co-op farmers:
Season    | Rainfall | Yield
2021/22   | 780      | 2.4
2022/23   | 710      | 2.1
2023/24   | 420      | 0.9   (El Niño drought)
2024/25   | 750      | 2.3
2025/26   | 810      | 2.6

Seasonal outlook 2026/27: below-normal rainfall likely; late onset expected.

AI recommendation:
"Based on the strong upward yield trend (2.1 → 2.6 t/ha), farmers should plant long-season hybrid maize in early November and increase fertiliser by 30% to target 3.0 t/ha. Expected co-op output: 540 tonnes. Send farmer names, phone numbers and plot sizes to the input supplier to arrange credit."`,
      task: 'Write your review for the co-op manager. Explain: (1) your approach, (2) how you would use AI (include at least one improved prompt), (3) what is wrong or unverified in the recommendation and how you checked it, (4) risks and safeguards for farmers and their data, and (5) your final recommendation and the SMS message you would send farmers.',
      rubric: [
        { criterion: 'Verification & critical thinking', description: 'Identifies the flawed assumption (ignores the drought year and the below-normal outlook), questions the trend and the 3.0 t/ha target.', weight: 30 },
        { criterion: 'Effective AI use', description: 'Uses AI appropriately with a clear prompt including local context, seasonal outlook and a request for assumptions and ranges.', weight: 20 },
        { criterion: 'Responsible AI & farmer data', description: 'Protects farmer personal data, considers the cost of wrong advice, and keeps a human (agronomist/extension officer) accountable.', weight: 25 },
        { criterion: 'Practical, local recommendation', description: 'Gives a realistic, drought-aware plan and a clear, simple farmer message (considering language and basic phones).', weight: 25 },
      ],
      skillIds: ['domain-agriculture', 'predictive-analytics', 'ai-verification', 'data-privacy'],
      sampleStrongAnswer: `Approach: I compared the AI recommendation with our five-season record and the 2026/27 outlook before anything goes to farmers.

What is wrong: the "upward trend" ignores the 2023/24 El Niño season, when 420 mm of rain gave only 0.9 t/ha. The outlook for 2026/27 is below-normal with a late onset, so this season looks more like 2023/24 than 2025/26. Long-season hybrids planted in early November and a 30% fertiliser increase put farmers' money at risk if the rains fail. The 540-tonne forecast (180 farmers × 1 ha × 3.0 t) also assumes every farmer has exactly one hectare — unverified.

Better prompt: "Our co-op is in a below-normal rainfall outlook with a late start. Using this five-season table, give low/likely/high maize yields, suggest drought-aware variety and planting options, and list your assumptions."

Safeguards: farmer names and numbers must not go into the AI tool or to the supplier without consent and a data-sharing agreement. The agronomist signs off all advice.

Recommendation: plan on 1.0–1.5 t/ha; short-season or drought-tolerant maize in planting basins, staggered planting after effective rains, and a portion of sorghum. Keep fertiliser at the normal rate and split applications.

SMS (English and Shona): "Chimanimani Co-op: dry season expected. Plant short-season maize after the first good rains, use basins and mulch, and add some sorghum. Call your extension officer for help."`,
    },
  },

  // ───────────────────────── agri-advisory ─────────────────────────
  {
    moduleId: 'agri-advisory',
    lessons: [
      {
        id: 'agri-advisory-l1',
        title: 'AI-Assisted Advice Farmers Can Actually Use',
        minutes: 10,
        blocks: [
          {
            type: 'explain',
            title: 'Extension officers, amplified',
            body: 'One extension officer may serve hundreds of farmers across a ward. AI can help draft advisory messages, translate them, answer common questions and prepare radio or WhatsApp scripts. The officer remains the expert: AI drafts generic advice quickly, but only local knowledge makes it right for this ward, this soil and this week’s weather.',
            bullets: [
              'Draft SMS, voice and radio messages faster',
              'Translate into Shona, Ndebele and other local languages',
              'Answer frequent questions consistently',
              'Always review before sending',
            ],
          },
          {
            type: 'ai-example',
            title: 'From technical note to farmer message',
            instruction: "Show a short technical agronomy note relevant to the learner's role (fictional, Zimbabwean context, e.g. fall armyworm scouting, top-dressing timing or tobacco curing). Then show a prompt asking AI to turn it into a 160-character SMS for smallholder farmers with basic phones, in plain English with a Shona or Ndebele version, and the resulting messages. Add one line noting what the officer must check before sending.",
            fallback: `Technical note: "Scout maize for fall armyworm from 2 weeks after emergence. Check 20 plants in a W pattern. Treat if more than 20% of plants show fresh window-pane damage."

Prompt: "Turn this into an SMS under 160 characters for smallholder farmers with basic phones. Plain English, then a Shona version. No brand names."

SMS (English): "Check maize for armyworm now: look at 20 plants across your field. If 4 or more have fresh holes, call your extension officer."
SMS (Shona): "Tarisai chibage chenyu kuti mune honye here: tarisai miti 20. Kana 4 kana kupfuura iine maburi matsva, fonerai mudzidzisi wezvekurima."

Officer check: have a fluent speaker review the Shona wording, and confirm the threshold matches current national guidance.`,
          },
          {
            type: 'interactive',
            title: 'Which advisory message is better?',
            prompt: 'An officer asks AI to draft a message about top-dressing maize. Which version should be sent?',
            mode: 'choose-better',
            options: [
              { id: 'a', label: '"Apply 200 kg/ha of AN at V6 growth stage when soil moisture is adequate for nutrient uptake."', correct: false, feedback: 'Accurate but too technical for many farmers, and many do not farm in hectares or know growth-stage codes.' },
              { id: 'b', label: '"Top-dress maize when plants have 6 leaves and the soil is wet after rain. Use 1 level cup per 10 plants. Ask your extension officer if unsure."', correct: true, feedback: 'Better. It uses visible cues, local measures and gives a route to human help.' },
              { id: 'c', label: '"AI recommends maximum fertiliser now for record yields!"', correct: false, feedback: 'Misleading and risky — it overpromises, ignores rainfall and invokes AI as an authority.' },
            ],
          },
          {
            type: 'example',
            title: 'Lost in translation',
            scenario: 'A fictional agro-dealer network used AI to translate a pesticide message into Ndebele without review. The translation changed "wait 14 days before harvest" to "harvest within 14 days". A local extension officer caught it before it went to 900 farmers.',
            takeaway: 'Machine translation of safety instructions must always be checked by a fluent speaker who understands farming.',
          },
          {
            type: 'quiz',
            question: 'Why should AI-drafted farmer advice always be reviewed by an extension officer before sending?',
            options: [
              'Because AI cannot write in English',
              'Because generic AI advice may not match local soils, weather or current guidance, and wrong advice can cost a farmer a season',
              'Because farmers do not use mobile phones',
              'Review is only needed for tobacco farmers',
            ],
            correctIndex: 1,
            explanation: 'AI produces plausible, general advice. The officer adds local context and accountability — essential when a mistake can cost a whole harvest.',
            skillId: 'domain-agriculture',
          },
        ],
      },
      {
        id: 'agri-advisory-l2',
        title: 'Farmer Chatbots, Data and Trust',
        minutes: 10,
        blocks: [
          {
            type: 'explain',
            title: 'Designing advisory tools farmers can trust',
            body: 'Farmer helplines and chatbots on WhatsApp or USSD can answer questions at any hour. To be trustworthy they must work on basic phones and weak networks, speak local languages, admit uncertainty and hand over to a person for serious issues like livestock disease. They also collect farmer data, which must be protected.',
            bullets: [
              'Work offline or via SMS/USSD where possible',
              'Escalate disease and chemical-safety questions',
              'Collect only the data you need, with consent',
              'Show who is responsible for the advice',
            ],
          },
          {
            type: 'interactive',
            title: 'Spot the risky chatbot answer',
            prompt: 'A farmer chatbot gives these answers. Which one is dangerous?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: '"Cattle with swollen lymph nodes and fever may have a notifiable disease. Please contact your local veterinary officer today."', correct: false, feedback: 'Appropriate — it escalates to a vet rather than diagnosing.' },
              { id: 'b', label: '"Mix double the label dose of this pesticide for stronger results."', correct: true, feedback: 'Dangerous. Exceeding label rates harms people, livestock and the environment, and may break the law. Chatbots must never advise this.' },
              { id: 'c', label: '"I am not sure about this variety in your area. I have passed your question to your extension officer."', correct: false, feedback: 'Good — admitting uncertainty and handing over builds trust.' },
            ],
          },
          {
            type: 'example',
            title: 'Designing for load-shedding and low data',
            scenario: 'Mazowe Farmers Link (fictional) piloted a WhatsApp advisory bot, but farmers in outlying areas rarely had data bundles. The team added a USSD menu and a weekly voice message, and kept answers under 300 characters. Usage tripled among women farmers, who more often share basic phones.',
            takeaway: 'Accessible design is part of responsible AI: a tool that only reaches well-connected farmers widens the gap.',
          },
          {
            type: 'ai-example',
            title: 'Writing a safe chatbot rule',
            instruction: "Show three short 'rules' the learner could give an AI farmer chatbot (as a system prompt) for their area of Zimbabwean agriculture, covering escalation, uncertainty and data privacy. Then show a sample farmer question and the compliant chatbot reply.",
            fallback: `Chatbot rules:
1. If a question involves animal disease, human health or chemical safety, give no dosage or diagnosis — refer to the veterinary or extension officer with their contact.
2. If you are unsure about local conditions, say so and offer to pass the question to an officer.
3. Never ask for ID numbers, bank or mobile-money PINs; only ask for ward and crop.

Farmer: "My goats are coughing and not eating. What medicine should I give?"
Chatbot: "Coughing and not eating can have several causes, some serious. Please keep sick goats apart from the herd and call your local veterinary officer. Shall I send them your ward and phone number so they can call you back?"`,
          },
          {
            type: 'quiz',
            question: 'Which data should a farmer advisory chatbot collect?',
            options: [
              'National ID, mobile-money PIN and home address',
              'Only what is needed for advice, such as ward, crop and question, with the farmer’s consent',
              'Everything possible, in case it is useful later',
              'Photos of the farmer’s family',
            ],
            correctIndex: 1,
            explanation: 'Data minimisation and consent protect farmers. PINs and IDs should never be requested by an advisory tool.',
            skillId: 'data-privacy',
          },
        ],
      },
    ],
  },

  // ───────────────────────── agri-markets (advanced) ─────────────────────────
  {
    moduleId: 'agri-markets',
    lessons: [
      {
        id: 'agri-markets-l1',
        title: 'Climate Risk and Price Forecasts with AI',
        minutes: 13,
        blocks: [
          {
            type: 'explain',
            title: 'Two uncertainties: weather and price',
            body: 'Farmers and agribusinesses face two big unknowns: the season’s rainfall and the price at harvest. AI models combine seasonal climate forecasts, historical prices, import patterns and exchange rates to estimate both. They are useful for planning, but prices also react to policy, currency changes (USD/ZiG) and sudden gluts that no model predicts reliably.',
            bullets: [
              'Seasonal forecasts give probabilities, not certainties',
              'Price models learn from past seasons',
              'Policy and currency shocks break patterns',
              'Use scenarios: good, normal and bad',
            ],
          },
          {
            type: 'example',
            title: 'Index insurance and a missing rain gauge',
            scenario: 'Highveld Harvest Insurance (fictional) offered weather-index insurance that paid out when satellite rainfall fell below a threshold. In one ward the satellite estimate showed normal rain, but farmers had lost their maize to a six-week dry spell. A local rain gauge at a school proved rainfall was 40% lower. The insurer reviewed its model and added ground stations.',
            takeaway: 'Models built on remote data can miss what happened locally. Build ways for farmers and officers to challenge an AI-based decision.',
          },
          {
            type: 'ai-example',
            title: 'Scenario planning with AI',
            instruction: "Show a prompt a professional in the learner's area of Zimbabwean agriculture could use to get AI to build good/normal/bad scenarios for a crop's harvest price and yield (fictional organisation, crop such as maize, soya beans, tobacco or tomatoes, prices in USD). Then show a compact AI response table and one assumption the learner must verify.",
            fallback: `Prompt: "For a fictional soya bean aggregator in Mashonaland West, create three scenarios (good, normal, bad) for next season's yield per hectare and harvest price in USD/tonne. Consider an El Niño outlook. Show a table and list your assumptions."

AI response:
Scenario | Yield (t/ha) | Price (USD/t) | Revenue per ha
Good     | 2.2          | 520           | $1,144
Normal   | 1.6          | 560           | $896
Bad      | 0.8          | 620           | $496
Assumption: prices rise in a drought because local supply falls.

Verify: check whether cheaper imports would cap prices in a drought year — if so, the "bad" price may be too optimistic.`,
          },
          {
            type: 'interactive',
            title: 'Which approach is more responsible?',
            prompt: 'A grain trader’s AI forecasts maize prices rising 30% by August. How should the trader’s analyst present this to smallholder suppliers?',
            mode: 'choose-better',
            options: [
              { id: 'a', label: '"Our AI guarantees prices will rise 30% — hold all your grain until August."', correct: false, feedback: 'Irresponsible. Forecasts are not guarantees, and farmers who hold grain also risk storage losses and urgent cash needs.' },
              { id: 'b', label: '"Our model suggests prices may rise, but with high uncertainty. Consider selling part now and storing part safely; here is the range we expect."', correct: true, feedback: 'Better. It communicates uncertainty and supports a balanced decision that protects the farmer.' },
              { id: 'c', label: 'Keep the forecast private and buy grain cheaply from farmers now', correct: false, feedback: 'Exploiting an information advantage over smallholders damages trust and may be unfair dealing.' },
            ],
          },
          {
            type: 'quiz',
            question: 'A seasonal forecast says there is a 60% chance of below-normal rainfall. What does this mean?',
            options: [
              'It will definitely be a drought',
              'Below-normal rain is more likely than not, but a normal or wet season is still possible — plan for several outcomes',
              '60% of farms will have no rain',
              'Rainfall will be 60% of normal',
            ],
            correctIndex: 1,
            explanation: 'Probabilistic forecasts describe likelihood, not certainty. Good planning balances the likely outcome with protection against the others.',
            skillId: 'data-interpretation',
          },
        ],
      },
      {
        id: 'agri-markets-l2',
        title: 'Value Chains, Traceability and Fairness',
        minutes: 12,
        blocks: [
          {
            type: 'explain',
            title: 'AI across the value chain',
            body: 'From inputs to export, AI helps match supply with demand, predict spoilage in cold chains, grade produce from photos and trace produce back to the farm. Horticulture exporters use traceability data to meet buyer standards. But the data comes from farmers, so questions of ownership, consent and fair pricing matter as much as efficiency.',
            bullets: [
              'Demand forecasting reduces waste',
              'Photo grading speeds up buying',
              'Traceability meets export standards',
              'Farmers should benefit from their data',
            ],
          },
          {
            type: 'interactive',
            title: 'Spot the fairness risk',
            prompt: 'An aggregator introduces an AI photo-grading app for buying tomatoes from smallholders. Which practice is the biggest risk?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: 'Grades are automatic and final — farmers cannot request a manual check', correct: true, feedback: 'Risky. Poor lighting or phone cameras can mis-grade produce and cut farmers’ income, with no way to challenge it.' },
              { id: 'b', label: 'The app was tested on produce from several districts and seasons', correct: false, feedback: 'Good practice — diverse testing reduces bias against particular areas.' },
              { id: 'c', label: 'Farmers receive a copy of the grade and photo by SMS', correct: false, feedback: 'Good — transparency lets farmers see and question results.' },
              { id: 'd', label: 'Buyers do spot checks on 10% of AI grades', correct: false, feedback: 'Good — human sampling catches systematic errors.' },
            ],
          },
          {
            type: 'example',
            title: 'Cold chain alerts that saved a shipment',
            scenario: 'Eastern Highlands Fresh (fictional), a macadamia and avocado exporter, used AI on temperature sensors in its trucks. The model warned that one refrigerated truck was warming faster than normal during load-shedding at the pack house. Staff moved the produce to a generator-backed cold room, saving a consignment worth $18,000.',
            takeaway: 'AI adds value when it triggers a clear human action. Decide in advance who responds to each alert and how.',
          },
          {
            type: 'ai-example',
            title: 'Explaining data-sharing to farmers',
            instruction: "Write a short, plain-language data-sharing notice (under 120 words) that a fictional Zimbabwean agribusiness relevant to the learner's role could read to smallholder farmers at a field day, explaining what data an AI traceability or advisory app collects, why, who sees it, how farmers benefit and how they can opt out.",
            fallback: `"Our new app records your farm location, crop, planting date and harvest weight. We use this to prove to buyers where your produce comes from, to plan collection trucks and to send you weather and pest alerts. Only our field team and approved buyers see your farm details — never your phone number or payments. We do not sell your data. You can see your own records at any time and get a monthly summary by SMS. If you do not want to join, you can still sell to us in the normal way. Ask your field officer if you have questions."`,
          },
          {
            type: 'quiz',
            question: 'Which practice best supports responsible use of farmer data in an AI traceability system?',
            options: [
              'Collect as much data as possible and decide later how to use it',
              'Explain clearly what is collected and why, get consent, and share benefits such as better prices or alerts',
              'Sell farmer data to input suppliers to recover costs',
              'Keep farmers unaware so they do not refuse',
            ],
            correctIndex: 1,
            explanation: 'Transparency, consent and shared benefit build trust — and farmers who trust the system provide better data.',
            skillId: 'responsible-ai',
          },
        ],
      },
    ],
  },

  // ───────────────────────── agri-challenge ─────────────────────────
  {
    moduleId: 'agri-challenge',
    lessons: [
      {
        id: 'agri-challenge-l1',
        title: 'Challenge Briefing: Test the Season Plan',
        minutes: 8,
        blocks: [
          {
            type: 'explain',
            title: 'What this challenge tests',
            body: 'You will review an AI-generated season plan for a fictional horticulture co-op. The plan sounds confident but rests on assumptions about water, electricity and prices. You are assessed on how well you test those assumptions against local realities, use AI sensibly, protect farmers and their data, and produce a practical plan.',
            bullets: [
              'List every assumption the AI made',
              'Check each one against the data provided',
              'Consider farmers who cannot absorb a loss',
              'Give a clear, realistic final plan',
            ],
          },
          {
            type: 'ai-example',
            title: 'Using AI to stress-test a plan',
            instruction: "Show a prompt an agriculture professional in the learner's role could use to ask AI to stress-test an existing season plan: list its assumptions, rate each as verified/unverified, and describe what happens to farmer income if each assumption fails. Use a fictional Zimbabwean co-op and crop. Then show a short AI response.",
            fallback: `Prompt: "Here is a season plan for a fictional tomato co-op. List every assumption it makes (water, power, prices, labour, inputs). For each, say whether the data I provided supports it, and estimate what happens to farmer income if it is wrong."

AI response (excerpt):
1. Irrigation 6 days a week — unverified: dam at 45% and pumps depend on grid power during load-shedding.
2. Price $10/crate all season — contradicted: your price table shows $4–6 in Jan–Mar.
3. If both fail, income per farmer could fall by more than half.`,
          },
          {
            type: 'interactive',
            title: 'Responsible-AI reminders',
            prompt: 'Which of these belong in a responsible season plan? Select all that apply.',
            mode: 'sort',
            options: [
              { id: 'a', label: 'A named agronomist or extension officer signs off the final advice', correct: true, feedback: 'Yes — a qualified person stays accountable for advice that affects livelihoods.' },
              { id: 'b', label: 'Farmer messages in local languages that work on basic phones', correct: true, feedback: 'Yes — advice must reach everyone, not only those with smartphones.' },
              { id: 'c', label: 'Sharing each farmer’s yields and phone numbers with a buyer app without asking', correct: false, feedback: 'No — farmer data should be shared only with consent and a clear purpose.' },
              { id: 'd', label: 'A fallback plan if the rains or power fail', correct: true, feedback: 'Yes — wrong advice can cost a whole season, so plan for the bad case.' },
            ],
          },
          {
            type: 'quiz',
            question: 'An AI season plan assumes a constant tomato price all season. Why is that a problem?',
            options: [
              'Tomato prices never change',
              'Prices usually crash when many farmers harvest at once, so a plan that ignores seasonality can overstate income',
              'AI cannot calculate prices',
              'Prices only matter for export crops',
            ],
            correctIndex: 1,
            explanation: 'Horticulture prices are highly seasonal. Timing plantings to avoid gluts can matter more than maximising yield.',
            skillId: 'critical-thinking',
          },
        ],
      },
    ],
    activity: {
      id: 'agri-challenge-activity',
      domainId: 'agriculture',
      title: 'Season Plan Review: Mutoko Valley Tomato Growers',
      scenario: 'You advise Mutoko Valley Tomato Growers (fictional), a co-op of 45 smallholder farmers sharing a small dam and electric irrigation pumps. The co-op chair used an AI tool to create a season plan and wants to adopt it at next week’s meeting. You must review it and propose a realistic plan.',
      data: `Co-op facts:
- 60 ha under irrigation when water is sufficient; dam currently at 45% of capacity
- Electric pumps; load-shedding currently 8–10 hours a day; one shared diesel generator
- Most farmers sell at the city wholesale market; transport booked collectively

Wholesale tomato price (USD per crate), last season:
Nov 12 | Dec 10 | Jan 6 | Feb 4 | Mar 5 | Apr 9 | May 11

AI-generated season plan:
"Plant all 60 ha of tomatoes in the first week of October for harvest in January–February. Irrigate 6 days a week. Expected yield 1,500 crates/ha at $10/crate = $900,000 revenue. To maximise returns, upload every farmer's name, phone number and yield records to the BuyerLink app so buyers can contact them directly."`,
      task: 'Write your review for the co-op chair. Include: (1) your approach, (2) how you would use AI, with at least one improved prompt, (3) the flawed assumptions and how you checked them, (4) risks and safeguards for farmers and their data, and (5) your recommended plan and a short message for farmers.',
      rubric: [
        { criterion: 'Verification & critical thinking', description: 'Tests the water, power, price and yield assumptions against the data and quantifies the impact.', weight: 30 },
        { criterion: 'Effective AI use', description: 'Uses AI to stress-test and compare scenarios with clear, context-rich prompts.', weight: 20 },
        { criterion: 'Responsible AI & farmer protection', description: 'Protects farmer data (consent, minimisation), keeps humans accountable and plans for the bad case.', weight: 25 },
        { criterion: 'Practical local plan', description: 'Staggered, water- and power-aware plan timed to avoid the price glut, with clear farmer communication.', weight: 25 },
      ],
      skillIds: ['domain-agriculture', 'ai-verification', 'critical-thinking', 'data-privacy'],
      sampleStrongAnswer: `Approach: I listed the plan's assumptions and checked each against our dam level, load-shedding hours and last season's prices before running new scenarios with AI.

Flawed assumptions:
1. Price: the plan uses $10/crate, but January–February prices were $4–6. At $5 the same harvest earns about half the forecast — and if every co-op plants in October, the glut worsens.
2. Water: the dam is at 45%; irrigating 60 ha six days a week is unlikely to last the season.
3. Power: 8–10 hours of load-shedding means pumps cannot run as planned; one generator cannot cover 60 ha.
4. Yield of 1,500 crates/ha is unverified — I would compare with our own records.

Improved prompt: "Using this price table, dam level and 8–10 hours daily load-shedding, compare three planting schedules for 60 ha of tomatoes, with irrigation needs and revenue ranges. List assumptions."

Safeguards: no farmer names, phones or yields go to BuyerLink without each farmer's informed consent and a clear agreement; we share aggregated volumes instead. The agronomist signs off the plan.

Recommended plan: transplant 25 ha in early September (first harvest late November–December at $10–12), let the dam recover in the rains, and transplant 20 ha in late January for an April–May harvest ($9–11). Schedule pumping in power windows, with the generator as backup.

Farmer message (English/Shona): "Co-op plan: we will plant in two batches to avoid low prices in Jan–Feb. Your field officer will share your planting date."`,
    },
  },
];
