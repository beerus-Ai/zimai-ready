import type { ModuleContent } from '../../types';

/**
 * Customer Service learning content.
 * All organisations and people are fictional (e.g. Zambezi Connect Telecom, Musasa Trust Bank,
 * Kopje Foods, Mbirimi Town Council).
 */
export const CUSTOMER_SERVICE_CONTENT: ModuleContent[] = [
  // ───────────────────────────── cs-assist ─────────────────────────────
  {
    moduleId: 'cs-assist',
    lessons: [
      {
        id: 'cs-assist-l1',
        title: 'Drafting accurate, empathetic replies with AI',
        minutes: 10,
        blocks: [
          {
            type: 'explain',
            title: 'AI as your drafting partner',
            body: "AI assistants can draft WhatsApp replies, emails and ticket responses in seconds, and suggest a warmer or clearer tone. But they do not know your customer's account, today's tariffs or your refund policy unless you tell them — and they will confidently fill the gaps with guesses. You remain responsible for every word that reaches the customer.",
            bullets: ['Give context: channel, tone, policy, length', 'Remove names, numbers and account details', 'Check every fact against the knowledge base', 'Personalise before you press send'],
          },
          {
            type: 'example',
            title: 'The one-hour refund that was never promised',
            scenario: "Tariro works on the WhatsApp support desk at Zambezi Connect Telecom. A customer writes that US$5 left his mobile money wallet but the data bundle never arrived. Tariro pastes the message into the company's approved AI assistant — name and number removed — together with the policy: failed purchases are reversed within 24 hours once a transaction reference is supplied. The first draft promises a ‘full refund within one hour’. She corrects it to the 24-hour policy, asks for the reference and adds an apology in her own words.",
            takeaway: 'AI speeds up the draft; your policy knowledge keeps it accurate. Never send a promise the business has not made.',
          },
          {
            type: 'interactive',
            title: 'Which prompt gets a reply you can actually send?',
            prompt: 'A Musasa Trust Bank customer is angry that a ZiG transfer failed but her account was still debited. Choose the best prompt for your approved AI assistant.',
            mode: 'choose-better',
            options: [
              { id: 'a', label: '‘Reply to this angry customer.’', correct: false, feedback: 'Too vague. The AI does not know the channel, the policy or the tone you need, so it will invent details — often a refund promise you cannot keep.' },
              { id: 'b', label: '‘Draft a WhatsApp reply (max 80 words, warm, plain English) to a customer whose ZiG transfer failed but was debited. Apologise, explain that failed transfers are reversed within 48 hours, ask for the transaction reference and make no other promises. Message (name removed): …’', correct: true, feedback: 'Strong: channel, length, tone, the actual policy, a clear request and a guardrail against over-promising — with personal details removed.' },
              { id: 'c', label: "‘Here is the customer's full name, ID number, account number and last five transactions. Write something to calm her down.’", correct: false, feedback: 'Pasting ID and account details into an AI tool risks a privacy breach, and the prompt still gives no policy. Share only what the reply needs.' },
            ],
          },
          {
            type: 'ai-example',
            title: 'Before and after: a prompt for your service desk',
            instruction: "Create a short before/after example for the learner's role and industry in Zimbabwe. Show (1) a vague prompt for replying to a common customer query in their sector, (2) the weak AI reply it produces, (3) an improved prompt that adds channel, tone, word limit, the relevant policy and anonymised details, and (4) the improved reply. Use fictional organisations, USD/ZiG or mobile money where natural, and end with one line on what the agent must still verify before sending.",
            fallback: "BEFORE\nPrompt: ‘Answer this customer about their late delivery.’\nAI reply: ‘Sorry for the delay! Your order will arrive tomorrow and we will refund your delivery fee.’ (Invented date, invented refund.)\n\nAFTER\nPrompt: ‘You are a customer care agent at Kopje Foods. Draft a WhatsApp reply, max 70 words, friendly plain English. The customer's order to Chitungwiza is two days late because heavy rain has closed the depot access road. Policy: new delivery times come only from the dispatch system; delivery fees are refunded only for orders over five days late. Apologise, explain the cause briefly, say we will confirm a new time by 4 pm today, and invite them to reply if the order is urgent.’\nAI reply: ‘Hi, we are really sorry your order is late. Heavy rain has closed the access road to our depot. We will confirm your new delivery time by 4 pm today. If your order is urgent — for example for a family event — just reply here and we will do our best to help.’\n\nStill verify: that dispatch can realistically confirm a time by 4 pm before you send.",
          },
          {
            type: 'quiz',
            question: 'An AI draft to a customer says: ‘We will refund your US$20 today.’ Your policy says refunds are processed within 3–5 working days. What should you do?',
            options: [
              'Send it — the customer will be happier with a faster promise',
              'Edit the draft to reflect the 3–5 working day policy before sending',
              'Delete the refund line and say nothing about timing',
              'Ask the AI to rewrite it until it sounds more confident',
            ],
            correctIndex: 1,
            explanation: 'AI drafts often over-promise. Customers hold the organisation to what you send, so correct the draft to match the actual policy — clearly and kindly.',
            skillId: 'customer-ai',
          },
          {
            type: 'task',
            title: 'Try it: rebuild one reply',
            instructions: 'Pick a common query your team received this week (for example a failed mobile money payment or a delivery delay). Remove all personal details. Write a prompt that states the channel, tone, word limit and the exact policy, then compare the AI draft with what you would normally send. Note one thing you had to correct.',
            hint: 'If the AI invents a timeframe or a refund, your prompt probably did not include the policy. Add it and try again.',
          },
        ],
      },
      {
        id: 'cs-assist-l2',
        title: 'Keeping knowledge bases accurate and useful',
        minutes: 10,
        blocks: [
          {
            type: 'explain',
            title: "Your knowledge base is AI's memory",
            body: 'Many chatbots and AI assistants answer from your knowledge base. If an article still shows old tariffs, pre-ZiG pricing or a closed branch, AI will repeat the error confidently to hundreds of customers. AI can also help maintain the knowledge base: summarising long policies, rewriting in plain language, drafting Shona or Ndebele versions and finding questions no article answers.',
            bullets: ['Every article needs an owner', "Show a ‘last reviewed’ date", 'Check prices and fees against the source', 'Have fluent speakers review translations'],
          },
          {
            type: 'example',
            title: 'Finding the gaps',
            scenario: "At Kopje Foods, the customer care lead exported 600 anonymised WhatsApp tickets from January and asked the company's approved AI tool to group them by topic and list questions the knowledge base did not answer. Almost a third were about deliveries to areas cut off by rainy-season roads — and no article covered them. The team drafted one with AI, logistics checked the routes and cut-off times, and repeat queries on the topic fell within a month.",
            takeaway: 'AI is excellent at finding patterns in volume; subject experts make sure the new answer is true.',
          },
          {
            type: 'interactive',
            title: 'Spot the risky knowledge-base practice',
            prompt: 'Your team is using AI to refresh the Musasa Trust Bank help articles. Which practice is the risk?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: "An AI-drafted Shona version of the ‘Reset your PIN’ article is checked by a fluent colleague before publishing.", correct: false, feedback: 'Good practice — AI translation of banking terms can be wrong or stilted, and a fluent reviewer catches it.' },
              { id: 'b', label: "An AI rewrite of the ‘Bank charges’ article is published straight away because it reads much better than the old one.", correct: true, feedback: 'This is the risk. Fluent writing is not the same as accurate figures. Every fee must be checked against the current tariff schedule before publishing.' },
              { id: 'c', label: "Every article now shows an owner and a ‘last reviewed’ date.", correct: false, feedback: 'Good governance — it makes stale content visible and someone accountable for it.' },
              { id: 'd', label: "AI is asked to list customer questions that the ‘Opening an account’ article does not answer.", correct: false, feedback: 'A smart use of AI — it finds gaps without publishing anything unchecked.' },
            ],
          },
          {
            type: 'explain',
            title: 'Plain language and vulnerable customers',
            body: 'Good service content works for everyone, including elderly customers, people with low literacy and those writing in Shona, Ndebele or a mix of languages. Ask AI to simplify, shorten sentences and remove jargon, then test with real users. Where a customer may be in distress — bereavement, fraud, illness or financial hardship — articles should point clearly to a human, not a chatbot loop.',
          },
          {
            type: 'quiz',
            question: 'What is the most important step before publishing an AI-rewritten help article about account fees?',
            options: [
              'Check that it reads in a friendly tone',
              'Verify every fee and condition against the current official tariff schedule',
              'Make sure it is shorter than the old version',
              'Run it through a second AI tool for a second opinion',
            ],
            correctIndex: 1,
            explanation: 'Tone and length matter, but a wrong fee misleads customers and creates complaints and regulatory risk. A second AI is not a source of truth — the official schedule is.',
            skillId: 'customer-ai',
          },
          {
            type: 'ai-example',
            title: 'From policy note to help article',
            instruction: "For the learner's industry and role, show how an AI assistant could turn a short, jargon-heavy internal policy note (invent one relevant to their sector in Zimbabwe, with a fictional organisation) into a customer-friendly help article of under 120 words, with an owner and ‘last reviewed’ line. Then list two facts a human must verify before publishing and one situation in which the article should direct customers to a human agent.",
            fallback: "Internal note: ‘Wef 1 March, reversals on failed MM-to-bank credits processed T+2 subject to ref provision; exceptions escalate to Recon.’\n\nAI help article — ‘My mobile money transfer to my account failed. What now?’\nIf money left your wallet but did not arrive in your Musasa Trust Bank account, it will be returned within 2 working days. To speed this up, send us your transaction reference on WhatsApp. If the money has not arrived after 2 working days, reply AGENT and a team member will investigate.\nOwner: Digital Channels Team · Last reviewed: 1 March\n\nVerify before publishing: (1) that ‘T+2’ means 2 working days, not calendar days; (2) that the WhatsApp reference process is actually live.\nSend to a human when: the customer says the money was for urgent needs such as school fees or medicine, or suspects fraud.",
          },
        ],
      },
    ],
    activity: {
      id: 'cs-assist-activity',
      domainId: 'customer-service',
      title: 'Fix an AI-drafted reply before it reaches the customer',
      scenario: "You are a senior agent on the WhatsApp support desk at Zambezi Connect Telecom (fictional). A new colleague used the company's AI assistant to draft a reply to three messages from one customer and asks you to review it before it is sent. The customer, Mr Chikomo, is a pensioner in Gweru whose monthly bundle, bought with mobile money, was charged twice.",
      data: `CUSTOMER MESSAGES (WhatsApp, 14:02–14:20)
1. "Good afternoon. I bought my ZiG 150 monthly bundle this morning using mobile money and the money has come off twice. I am a pensioner, this is my money for the month. — Mr Chikomo"
2. "Transaction refs MM24-88315 and MM24-88316. Please help."
3. "Hello?? Is anyone there. My grandson says I should go to the police."

AI-DRAFTED REPLY (to review)
"Dear Mr Moyo, thank you for contacting Zambezi Connect! We have checked your account and can confirm your US$150 bundle was charged twice. A full refund will be in your wallet within 1 hour, plus a free bonus bundle as compensation. As you can see from ticket #5521 (Mrs R. Ndlovu, same issue), this is a known problem. Have a blessed day!"

RELEVANT POLICY (knowledge base, last reviewed 2 weeks ago)
- Duplicate charges are reversed within 24 hours after the billing team confirms both references.
- Goodwill compensation needs supervisor approval.
- Never share details of other customers.
- Customers who mention hardship should be offered a call-back from a human agent.`,
      task: 'Submit: (1) every error or risk you find in the AI draft and why it matters; (2) your corrected reply (max 100 words); (3) the improved prompt you would give the AI assistant next time, including what you would leave out for privacy; (4) how you would verify the facts before sending; (5) one safeguard your team should adopt so this does not happen again.',
      rubric: [
        { criterion: 'Error detection & verification', description: 'Finds the name, currency, timeframe, compensation and invented-action errors and explains how each is checked against policy or systems.', weight: 30 },
        { criterion: 'Quality of the final reply', description: 'Accurate, warm, plain-language reply that acknowledges the hardship and the wait, uses the right name and currency, and sets a realistic next step.', weight: 25 },
        { criterion: 'Prompting approach', description: 'The improved prompt gives channel, tone, length, policy and constraints, and only the minimum customer information.', weight: 20 },
        { criterion: 'Responsible AI & customer protection', description: 'Recognises the privacy breach, the vulnerable customer and the need for a human call-back; proposes a sensible safeguard.', weight: 25 },
      ],
      skillIds: ['customer-ai', 'ai-writing', 'ai-verification', 'data-privacy'],
      sampleStrongAnswer: "Errors: (1) wrong name — the customer is Mr Chikomo, not Mr Moyo; (2) wrong currency — the bundle was ZiG 150, not US$150; (3) the ‘1 hour’ refund contradicts the 24-hour policy; (4) the bonus bundle needs supervisor approval; (5) it names another customer and ticket — a privacy breach; (6) ‘we have checked your account’ claims an action nobody took; (7) the cheerful tone ignores that a pensioner's monthly money is at stake and that he waited 18 minutes.\n\nCorrected reply: ‘Good afternoon Mr Chikomo, I am sorry you were charged twice and that you had to wait. I have your references MM24-88315 and MM24-88316 and have passed them to our billing team. Once confirmed, the duplicate ZiG 150 will be returned to your wallet within 24 hours. Because this is your monthly money, a colleague will call you today with an update — is this the best number?’\n\nBetter prompt: WhatsApp, max 100 words, warm; include the duplicate-charge and hardship policies and the references only — no phone number, no other tickets — and ‘do not promise compensation or timings beyond policy’.\n\nVerification: check both references in the billing system, confirm the currency and confirm the policy is current.\n\nSafeguard: AI drafts for customers who mention hardship get a second-agent check, and the assistant is configured never to quote other tickets.",
    },
  },

  // ───────────────────────────── cs-chatbots ─────────────────────────────
  {
    moduleId: 'cs-chatbots',
    lessons: [
      {
        id: 'cs-chatbots-l1',
        title: 'What chatbots should — and should not — handle',
        minutes: 12,
        blocks: [
          {
            type: 'explain',
            title: 'How service chatbots work',
            body: 'Rules-based bots follow menus and keywords; generative AI bots understand free text and compose answers, usually from your knowledge base. Both work well for high-volume, low-risk questions. Generative bots can also misunderstand, invent policies or miss distress. The goal is not to deflect customers — it is to resolve simple needs quickly and route everything else to the right person.',
            bullets: ['Bot: balances, bundle prices, opening hours, tracking', 'Bot: logging faults and collecting details', 'Human: fraud, complaints, hardship, bereavement', 'Human: anything the bot fails twice'],
          },
          {
            type: 'interactive',
            title: 'What can the bot handle end to end?',
            prompt: 'Zambezi Connect Telecom is expanding its WhatsApp bot. Select every request the bot can safely resolve without a human.',
            mode: 'sort',
            options: [
              { id: 'a', label: "‘Which shops are open during today's load-shedding?’", correct: true, feedback: 'Simple, factual and low risk — ideal for a bot, as long as the shop list is kept current.' },
              { id: 'b', label: '‘What bundles can I get for US$2?’', correct: true, feedback: 'A high-volume price question the bot can answer from the tariff table — provided the table is up to date.' },
              { id: 'c', label: "‘Someone has taken money from my mobile wallet, I didn't do this.’", correct: false, feedback: 'Suspected fraud needs immediate human handling and account protection. The bot should collect minimal details and escalate at once.' },
              { id: 'd', label: '‘My husband passed away. How do I close his line?’', correct: false, feedback: 'Bereavement needs empathy and judgement. The bot should respond kindly and hand over to a trained agent.' },
            ],
          },
          {
            type: 'example',
            title: 'When the menu is the wrong answer',
            scenario: "A Musasa Trust Bank customer typed into the WhatsApp bot: ‘money gone from my account i am scared please’. The bot replied with its standard menu: ‘1. Balance 2. Statement 3. Branch locator’. The customer tried twice, then posted about it on social media. The review team added detection for fraud and distress phrases — in English, Shona and Ndebele — that triggers an immediate handover to an agent and an option to block the card.",
            takeaway: "Design for the worst moment in a customer's day, not the average query. Distress and fraud must skip the menu.",
          },
          {
            type: 'explain',
            title: 'Transparency builds trust',
            body: 'Customers have a right to know when they are talking to a bot. Give it a clear bot identity, never pretend it is a person, and offer ‘talk to a person’ at any point. Tell customers briefly how their information is used, and never ask for PINs or passwords in chat. If the bot is unsure, it should say so rather than guess.',
          },
          {
            type: 'quiz',
            question: 'Which chatbot greeting is the most responsible?',
            options: [
              "‘Hi, I'm Rudo from customer care! How can I help?’",
              "‘Hi, I'm ZC Assist, Zambezi Connect's virtual assistant. I can help with bundles, balances and faults. Type AGENT any time to reach a person.’",
              '‘Welcome. Please enter your PIN to continue.’',
              '‘Hello! Our agents are busy, so please use this bot only.’',
            ],
            correctIndex: 1,
            explanation: 'It is honest about being a bot, sets expectations about what it can do and offers an easy route to a human. Pretending to be a person, requesting PINs or blocking human help all damage trust.',
            skillId: 'domain-customer-service',
          },
          {
            type: 'ai-example',
            title: 'A bot conversation that knows its limits',
            instruction: "For the learner's industry in Zimbabwe, write a short chatbot conversation (6–8 turns) for a fictional organisation. The bot introduces itself honestly as a virtual assistant, resolves a simple query, then recognises a sensitive or complex issue (e.g. fraud, hardship, a safety or health concern) and hands over to a human agent with a one-line summary so the customer does not have to repeat themselves. Label each turn.",
            fallback: "Bot: Hi, I'm KF Helper, Kopje Foods' virtual assistant. I can track orders and answer product questions. Type AGENT any time to reach a person.\nCustomer: Where is my order 4471?\nBot: Order 4471 left our depot at 10:15 and is due in Mabvuku between 2 and 4 pm today.\nCustomer: ok. also the bread from my last order made my child sick, she vomited all night\nBot: I'm very sorry — I hope she is feeling better. If she is still unwell, please seek medical care. This needs a person from our quality team, so I'm connecting you now. You won't need to repeat yourself.\n[Handover note: Customer reports child ill after eating bread from a previous order. Possible food-safety complaint — PRIORITY. Batch code not yet known. Tracking for order 4471 already given.]\nAgent: Hello, this is Nyasha from Kopje Foods quality. I'm so sorry about your daughter. Could you share the batch code printed on the packet so we can check it straight away?",
          },
        ],
      },
      {
        id: 'cs-chatbots-l2',
        title: 'Designing escalation and great handovers',
        minutes: 13,
        blocks: [
          {
            type: 'explain',
            title: 'Escalation triggers',
            body: 'Escalation rules decide when a bot — or an AI-assisted agent — must pass a conversation to a person or a more senior colleague. Write them down, test them in every language customers use, and review them monthly against real conversations. When in doubt, escalate: a slightly longer wait for the right person beats a fast wrong answer.',
            bullets: ['Customer asks for a person', 'Bot fails to understand twice', 'Fraud, safety, legal or large-value issues', 'Signs of distress or vulnerability'],
          },
          {
            type: 'example',
            title: 'A handover that saves everyone time',
            scenario: "Farai, a fibre support agent at Zambezi Connect Telecom, receives a bot handover: ‘Home fibre down 3 days in Westgate. Bot checked: account paid (USD), no area outage logged, router restarted twice. Customer works from home and is losing income. Sentiment: frustrated. Wants: a technician date.’ Farai skips the basic questions, books the first technician slot and sends the customer a reference — all in one message.",
            takeaway: 'A good handover summary means the customer never repeats their story. That is where bots and people together beat either alone.',
          },
          {
            type: 'interactive',
            title: 'Which handover note is most useful?',
            prompt: 'The bot is passing a Musasa Trust Bank customer to an agent. Which handover note should it generate?',
            mode: 'choose-better',
            options: [
              { id: 'a', label: '‘Customer needs help. Transferring.’', correct: false, feedback: 'The agent must start from scratch and the customer repeats everything — frustrating for both.' },
              { id: 'b', label: "‘ZiG 2,000 school-fees transfer debited but not received (ref TR-5510, 09:14 today). Bot confirmed the transaction is pending, no reversal yet. Customer anxious — fees due Friday. Wants: confirmation the money is safe and when it will arrive.’", correct: true, feedback: "Clear issue, reference, what has been checked, emotional context and the customer's goal — the agent can act immediately." },
              { id: 'c', label: "Full chat transcript plus the customer's ID number, date of birth and complete account history.", correct: false, feedback: 'Too much and too sensitive. Share what the agent needs to resolve the issue; authorised systems hold the rest.' },
            ],
          },
          {
            type: 'interactive',
            title: 'Spot the risky bot design',
            prompt: 'Mbirimi Town Council (fictional) is launching a WhatsApp bot for rates and water queries. Which design choice is the risk?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: 'The bot says it is a virtual assistant and offers ‘reply PERSON’ in every message.', correct: false, feedback: 'Transparent, with an easy route to a human.' },
              { id: 'b', label: "To cut call volumes, the ‘speak to a person’ option only appears after five failed attempts.", correct: true, feedback: 'This is the risk. Hiding human help traps frustrated or vulnerable residents — such as an elderly ratepayer facing a water disconnection — in a loop and erodes trust in public services.' },
              { id: 'c', label: 'Messages mentioning burst pipes or sewage overflows go straight to the emergency team.', correct: false, feedback: 'Good — safety and public-health issues skip the queue.' },
              { id: 'd', label: 'A monthly review of anonymised bot conversations checks for misunderstandings in Shona and Ndebele.', correct: false, feedback: 'Good practice — it catches language gaps before they become complaints.' },
            ],
          },
          {
            type: 'quiz',
            question: "A chatbot has misunderstood a customer twice and the customer's messages are getting shorter and angrier. What should happen next?",
            options: [
              'The bot repeats the main menu so the customer can try again',
              'The bot hands over to a human with a summary of the conversation so far',
              'The bot ends the chat to protect agents from abuse',
              'The bot offers a discount code to calm the customer',
            ],
            correctIndex: 1,
            explanation: 'Two failed attempts plus rising frustration is a classic escalation trigger. A warm handover with a summary resolves the issue faster and protects the relationship.',
            skillId: 'ai-automation',
          },
          {
            type: 'task',
            title: 'Try it: write three escalation rules',
            instructions: "For a chatbot or AI assistant in your organisation (real or planned), write three escalation rules in the form ‘If … then hand over to … with …’. Include one rule for a vulnerable customer and one for a safety, fraud or legal issue.",
            hint: "Example: ‘If a customer mentions a medical emergency or hardship, then hand over to a senior agent immediately with a summary, and flag the case as priority.’",
          },
        ],
      },
    ],
  },

  // ───────────────────────────── cs-insights (advanced) ─────────────────────────────
  {
    moduleId: 'cs-insights',
    lessons: [
      {
        id: 'cs-insights-l1',
        title: 'Reading customer sentiment with AI',
        minutes: 10,
        blocks: [
          {
            type: 'explain',
            title: 'What sentiment analysis actually does',
            body: 'Sentiment tools label messages as positive, negative or neutral; topic models group them into themes such as billing, network or delivery. This turns thousands of WhatsApp messages and call notes into a picture you can act on. But models trained mostly on formal English struggle with sarcasm, local slang and messages that mix English, Shona and Ndebele.',
            bullets: ['Great for spotting spikes and themes', 'Weak on sarcasm and mixed languages', 'Always hand-check a random sample', 'Report reliability with the numbers'],
          },
          {
            type: 'example',
            title: 'The dashboard that was too happy',
            scenario: "Kopje Foods' new AI dashboard showed 78% positive sentiment in February. The insights officer, Rumbidzai, hand-checked 50 random messages. Sarcastic ones such as ‘Great service, three hours waiting for the truck’ were labelled positive, and Shona complaints such as ‘ndaneta nekunonoka kwenyu’ (I'm tired of your delays) were labelled neutral. The true positive share was closer to 55%. She reported both figures and asked the vendor to retrain the model on local data.",
            takeaway: 'Validate AI sentiment on a local sample before you trust the headline number.',
          },
          {
            type: 'interactive',
            title: 'Spot the risky conclusion',
            prompt: "Zambezi Connect Telecom's monthly AI service report is on your desk. Which conclusion is the risk?",
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: '‘Billing complaints tripled in the week after the ZiG tariff change — investigate how the new prices were communicated.’', correct: false, feedback: 'A reasonable, specific lead — it links a spike to an event and asks for follow-up.' },
              { id: 'b', label: '‘Complaint volume fell 30% this month, so service quality has improved.’ (The WhatsApp channel was offline for five days during extended load-shedding.)', correct: true, feedback: 'This is the risk. Fewer complaints may simply mean customers could not reach you. Check channel availability and other channels before claiming improvement.' },
              { id: 'c', label: '‘AI sentiment labels were checked against a hand-coded sample of 100 messages; agreement was 81%.’', correct: false, feedback: 'Good practice — it tells readers how reliable the labels are.' },
              { id: 'd', label: '‘Network-quality complaints are concentrated in three rural districts; confirm with the network team.’', correct: false, feedback: 'A sensible hypothesis with a verification step built in.' },
            ],
          },
          {
            type: 'explain',
            title: 'Protect customers when you analyse their words',
            body: "Customer messages contain names, phone numbers, account details and sometimes health or family information. Before any analysis, remove or mask personal identifiers, use only AI tools your organisation has approved, and report in aggregate. Never use insight work to single out or penalise an individual customer. Zimbabwe's Cyber and Data Protection Act makes this a legal duty, not just good manners.",
          },
          {
            type: 'quiz',
            question: 'An AI tool labels 90% of your Shona and Ndebele messages as ‘neutral’ but only 40% of English ones. What is the most likely explanation?',
            options: [
              'Customers who write in Shona or Ndebele are genuinely more satisfied',
              "The model understands these languages poorly, so it defaults to ‘neutral’",
              'Neutral is the most accurate label for short messages',
              'The tool is working correctly and needs no review',
            ],
            correctIndex: 1,
            explanation: 'A big gap between languages usually signals a model weakness, not a real difference. Hand-check a sample in each language — otherwise you may be overlooking the concerns of whole groups of customers.',
            skillId: 'data-interpretation',
          },
          {
            type: 'ai-example',
            title: 'Where AI sentiment slips in your sector',
            instruction: "For the learner's industry in Zimbabwe, invent 6 short, anonymised customer messages that mix English with Shona or Ndebele phrases, local slang or sarcasm (include English translations). Show the label an AI sentiment tool might give each, highlight the two most likely mislabels and explain why, then suggest how the learner should verify labels before reporting results. Use a fictional organisation.",
            fallback: "Musasa Trust Bank (fictional) — sample messages and AI labels\n1. ‘Thank you, my card was replaced in one day!’ — AI: positive (correct)\n2. ‘Wonderful, third time this month the ATM swallowed my card.’ — AI: positive (MISLABEL: sarcasm, actually negative)\n3. ‘Ndinotenda nerubatsiro’ (Thank you for the help) — AI: neutral (MISLABEL: actually positive)\n4. ‘Branch closed again during load-shedding, nothing works’ — AI: negative (correct)\n5. ‘Sharp, it's sorted’ (local slang for ‘fine, all good’) — AI: neutral (arguably mildly positive)\n6. ‘Ngiyabonga kakhulu’ (Thank you very much) — AI: neutral (mislabel: actually positive)\n\nVerify: hand-label a random sample of at least 50 messages per language, compare with the AI labels and report the agreement rate alongside the headline figure.",
          },
        ],
      },
      {
        id: 'cs-insights-l2',
        title: 'From complaint trends to service improvements',
        minutes: 10,
        blocks: [
          {
            type: 'explain',
            title: 'Measures that matter',
            body: 'AI can combine ticket data, call logs and survey scores to show where service is breaking down. Focus on a few measures you can act on, and remember that correlation is not cause: AI can show that complaints rose after an event, but only investigation with the teams involved shows why.',
            bullets: ['First-contact resolution', 'Repeat contacts within 7 days', 'Customer satisfaction (CSAT)', 'Complaints per 1,000 customers'],
          },
          {
            type: 'example',
            title: 'From spike to root cause',
            scenario: "Mbirimi Town Council (fictional) received 900 water-billing complaints in March — triple the usual. An analyst loaded the anonymised ticket export into the council's approved AI tool, which showed 70% came from Ward 7 and suggested ‘faulty meters’. The billing team checked and found the real cause: meter readers could not reach Ward 7 during the rains, so bills were estimated from a wrong baseline. Corrected bills and an SMS apology followed.",
            takeaway: "AI pointed to where; people found why. Test AI's suggested causes before acting on them.",
          },
          {
            type: 'interactive',
            title: 'Choose the best analysis prompt',
            prompt: 'You have an anonymised export of 2,000 Zambezi Connect tickets for Q1 (date, channel, category, region, resolution time, CSAT). Which prompt should you use?',
            mode: 'choose-better',
            options: [
              { id: 'a', label: "‘Analyse these tickets and tell me what's wrong with our service.’", correct: false, feedback: 'Open-ended prompts invite generic, unsupported conclusions. Say what you want measured and how.' },
              { id: 'b', label: '‘Using only this data: show monthly ticket volume by category and region, the top 3 rising categories and average resolution time by channel. Flag data gaps such as missing regions or days. List possible causes as hypotheses to test, not conclusions, and show how you calculated each figure.’', correct: true, feedback: 'Specific, limited to your data, separates facts from hypotheses and asks for workings you can check.' },
              { id: 'c', label: '‘Prove that the new WhatsApp channel has reduced complaints.’', correct: false, feedback: 'A leading prompt invites confirmation bias — the AI will look for support rather than test the claim.' },
            ],
          },
          {
            type: 'explain',
            title: 'Fair insights for every customer',
            body: 'Analysis can quietly favour customers who complain loudly, in formal English or through digital channels. Rural customers, older people and those with poor connectivity may be under-represented in your data. Before prioritising improvements, ask who is missing, include call-centre and walk-in feedback, and check that fixes help vulnerable customers too — not just the most profitable segments.',
          },
          {
            type: 'quiz',
            question: 'AI reports that customers who use the new self-service app make 40% fewer complaints. What is the best interpretation?',
            options: [
              'The app causes fewer complaints, so push every customer onto it',
              'App users may differ from other customers — investigate before concluding the app is the cause',
              'The data must be wrong and should be discarded',
              'Complaints are no longer a useful measure',
            ],
            correctIndex: 1,
            explanation: 'App users may be younger, urban and better connected, with simpler needs. The link is worth exploring, but it is not proof of cause — and forcing everyone onto the app could harm customers who cannot use it.',
            skillId: 'ai-analytics',
          },
          {
            type: 'task',
            title: 'Try it: turn one trend into an action',
            instructions: 'Choose one customer-service measure from your workplace (or invent a realistic one). Write an analysis prompt that limits the AI to your data, asks for workings and separates facts from hypotheses. Then note one way you would verify its top finding with the team involved.',
            hint: "Useful checks: compare with the same month last year, check whether any channel was offline, and ask frontline agents whether the pattern matches what they hear.",
          },
        ],
      },
    ],
  },

  // ───────────────────────────── cs-challenge ─────────────────────────────
  {
    moduleId: 'cs-challenge',
    lessons: [
      {
        id: 'cs-challenge-l1',
        title: 'Challenge briefing: the complaint surge',
        minutes: 6,
        blocks: [
          {
            type: 'explain',
            title: 'What this challenge tests',
            body: 'You will manage a fictional complaint surge at Zambezi Connect Telecom after a billing fault. You are assessed on how you triage, how you use AI to work faster, how you check its output and how you protect customers — especially vulnerable ones. There is no single right answer; clear reasoning and safe, practical choices score highest.',
            bullets: ['Triage and a realistic plan', 'Specific, useful AI prompts', 'Verification of AI output', 'Privacy, transparency and escalation'],
          },
          {
            type: 'ai-example',
            title: 'How AI should support you in a surge',
            instruction: "For the learner's industry in Zimbabwe, show a short, practical workflow (4 steps) for using AI during a sudden surge of customer complaints: clustering anonymised messages, drafting an honest holding message, flagging vulnerable or urgent cases, and reporting to management. For each step give an example prompt and the human check that must follow. Use a fictional organisation.",
            fallback: "1. Cluster — Prompt: ‘Group these 300 anonymised messages by issue and urgency; show counts that add up to the total and 2 example messages per group.’ Human check: hand-read 20 messages to confirm the groups.\n2. Holding message — Prompt: ‘Draft a 60-word WhatsApp update: we know about the double charges, we are fixing it, reversals will follow once confirmed. Do not promise a timeframe.’ Human check: the billing lead approves the wording and any timeframe.\n3. Flag urgent cases — Prompt: ‘List messages mentioning hardship, medical needs, threats or large amounts.’ Human check: a supervisor reviews every flag and scans unflagged messages for misses.\n4. Report — Prompt: ‘Summarise volumes, themes and open risks for management in 5 bullets.’ Human check: every figure is traced back to the ticketing system.",
          },
          {
            type: 'interactive',
            title: 'Responsible-AI reminder: spot the shortcut',
            prompt: 'Under pressure in a surge, which shortcut crosses the line?',
            mode: 'spot-the-risk',
            options: [
              { id: 'a', label: 'Pasting the full complaint export — names, numbers, ID copies — into a free public AI website to save time.', correct: true, feedback: "This is the risk. It exposes customers' personal data to an unapproved tool. Anonymise first and use approved tools, even under pressure." },
              { id: 'b', label: 'Sending an honest holding message that says the issue is known and a person will follow up.', correct: false, feedback: 'Good — transparency calms a surge and avoids over-promising.' },
              { id: 'c', label: 'Asking AI to flag messages that mention hardship or threats, then having a supervisor review them.', correct: false, feedback: 'Good — AI speeds up triage while a person makes the call.' },
              { id: 'd', label: 'Checking AI-reported counts against the ticketing system before briefing management.', correct: false, feedback: 'Good verification — management decisions will rest on these numbers.' },
            ],
          },
          {
            type: 'quiz',
            question: 'In the challenge, the AI suggests an auto-reply promising refunds ‘within 2 hours’. The billing team has not confirmed any timeframe. What is the best response?',
            options: [
              'Use it — speed will calm customers down',
              'Replace the promise with an honest update and confirm any timeframe with billing first',
              'Send no message until everything is fixed',
              'Let the chatbot decide the wording automatically',
            ],
            correctIndex: 1,
            explanation: 'A promise you cannot keep turns one complaint into two. Communicate honestly now and commit to timeframes only once the responsible team confirms them.',
            skillId: 'domain-customer-service',
          },
        ],
      },
    ],
    activity: {
      id: 'cs-challenge-activity',
      domainId: 'customer-service',
      title: 'Complaint surge: double charges after a system upgrade',
      scenario: "A weekend system upgrade at Zambezi Connect Telecom (fictional) double-charged customers who bought bundles with mobile money. In 48 hours the WhatsApp desk has received about 1,200 messages and the call-centre queue is 40 minutes long. You are the shift team leader with six agents. Your manager used an AI tool to analyse the messages and draft a response plan, and wants your recommended approach within the hour.",
      data: `SAMPLE OF ANONYMISED MESSAGES (8 of ~1,200)
M1  "Charged twice for my ZiG 60 bundle. Fix it."
M2  "I am a nurse on night duty, now I have no data to contact my kids. 2x US$3 gone."
M3  "This is theft. I'll see you in court."
M4  "Mbuya wangu (my grandmother) is 81, her pension top-up went twice. She is crying."
M5  "Double deduction, refs MM-33812 and MM-33813."
M6  "If you don't refund by tonight I will come to your shop and deal with your staff."
M7  "Ndabhadhariswa kaviri (I have been charged twice). Ndapota batsirai (please help)."
M8  "Is my data safe? Were you hacked?"

AI ANALYSIS & PLAN (drafted by the manager's AI tool)
- Categories (total 1,200): Double charge 780 (65%), Angry/abusive 300 (25%), Other 150 (13%), Hack concerns 50 (4%).
- Priority LOW for "Other" — includes non-English messages the tool could not classify.
- M6 classified "Angry — low priority".
- Recommended auto-reply: "Hi, I'm Chipo from Customer Care. Your refund will be in your wallet within 2 hours. Sorry for the inconvenience!"
- Recommendation: pause the call centre and route all customers to the chatbot to save cost.
- "For deeper analysis, upload the full export (names, numbers, ID copies) to a free public AI website."

FACTS FROM BILLING (09:00 today)
- Fault fixed; about 9,400 duplicate transactions identified.
- Reversals will run in batches; first batch expected within 24 hours; final timeframe not yet confirmed.
- No evidence of a data breach so far; IT security is still investigating.`,
      task: 'Submit your plan covering: (1) your triage approach and priorities for the next 24 hours; (2) how you will use AI, with at least two example prompts; (3) the errors, risks and flawed assumptions in the AI analysis and plan, and how you would verify them; (4) safeguards for privacy, vulnerable customers, threats and chatbot transparency; (5) your final holding message to customers (max 80 words).',
      rubric: [
        { criterion: 'Triage & practical plan', description: 'Realistic priorities for the team, channels and next 24 hours; threats, urgent and vulnerable cases handled first.', weight: 20 },
        { criterion: 'Effective AI use', description: 'Specific prompts for clustering, drafting and summarising, with AI supporting agents rather than replacing them.', weight: 20 },
        { criterion: 'Verification & critical thinking', description: 'Spots the counts that do not add up, the misclassified threat, the unclassified Shona/Ndebele messages and the unconfirmed 2-hour promise; explains how to check each.', weight: 30 },
        { criterion: 'Responsible AI & customer protection', description: 'Refuses the public-tool upload, keeps human channels open, keeps the bot honest about being a bot, protects vulnerable customers and avoids over-claiming on data security.', weight: 30 },
      ],
      skillIds: ['domain-customer-service', 'data-privacy', 'critical-thinking', 'customer-ai', 'ai-verification'],
      sampleStrongAnswer: "Triage: in the first hour a supervisor reviews threats — M6 goes to security and the shop manager, not ‘low priority’. One named agent handles vulnerable cases such as M2 and M4 with call-backs. Everyone else gets an honest holding message, and references like M5 are logged for billing.\n\nAI use (approved tool, names and numbers masked): ‘Group these anonymised messages by issue and urgency; list any mentioning hardship, threats or data security; make sure the counts add up to the total.’ And: ‘Draft a 70-word WhatsApp update in English, Shona and Ndebele; no timeframe beyond billing's confirmed first batch within 24 hours.’\n\nVerification: the AI's counts total 1,280 and 107% for 1,200 messages, so I would re-run them from the ticketing export. ‘Other’ hides Shona and Ndebele complaints like M7 — fluent agents will review them. The 2-hour refund contradicts billing's facts.\n\nSafeguards: no upload of ID copies to a public website; the bot introduces itself as a virtual assistant, not ‘Chipo’; the call centre stays open for customers without data; and we do not tell M8 ‘you were not hacked’ — only that IT is investigating and has found no evidence of a breach so far.\n\nHolding message: ‘We are sorry — a system fault charged some bundle purchases twice. It is now fixed and duplicate charges will be returned, with the first refunds within 24 hours. You do not need to do anything. Reply PERSON to reach an agent.’",
    },
  },
];
