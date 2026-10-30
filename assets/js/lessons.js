/*
 * lessons.js — Extra lessons, game formats, and the lesson generator
 * -----------------------------------------------------------------
 * Kept separate from data.js so a student or educator can edit lessons
 * and games without touching module definitions or app logic.
 *
 * EDUCATIONAL ONLY. Built around existing financial-literacy topics.
 * Designed to support Teen Teach-In–style workshops.
 *
 * Three things live here:
 *   ACCOUNT_TYPES  — who is viewing, and which impact metrics they see
 *   GAME_FORMATS   — reusable games; many need NO devices at all
 *   LESSON_PACKS   — per-module teaching content the generator assembles
 */

/* ===================================================================
   ACCOUNT TYPES
   Everything in the app is the same for each type EXCEPT which impact
   metrics they see. Metric keys match the ids in IMPACT_METRICS below.
   =================================================================== */
const ACCOUNT_TYPES = [
  {
    id: "volunteer",
    label: "Teen volunteer",
    emoji: "🙋",
    blurb: "I teach workshops as a student volunteer.",
    // Volunteers see how their own teaching landed.
    metrics: [
      "workshopsDelivered",
      "studentsReached",
      "participationRate",
      "confidenceImprovement",
      "facilitatorFeedback",
      "repeatabilityScore",
      "knowledgeGain",
    ],
  },
  {
    id: "school",
    label: "School or teacher",
    emoji: "🍎",
    blurb: "We host workshops for our students.",
    // Schools see what their own students got out of it.
    metrics: [
      "workshopsReceived",
      "studentsReached",
      "participationRate",
      "confidenceImprovement",
      "knowledgeGain",
    ],
  },
  {
    id: "organization",
    label: "Nonprofit organization",
    emoji: "🏛️",
    blurb: "We run or sponsor the program.",
    // Organizations see the whole program. `programWide` marks the two
    // measures reported as overall figures across every teen lesson
    // delivered, rather than for a single volunteer or school.
    //
    // NOTE: if organizations should NOT see confidence improvement,
    // simply delete "confidenceImprovement" from this list.
    metrics: [
      "workshopsDelivered",
      "studentsReached",
      "participationRate",
      "confidenceImprovement",
      "facilitatorFeedback",
      "repeatabilityScore",
      "knowledgeGain",
    ],
    programWide: [
      "confidenceImprovement",
      "facilitatorFeedback",
      "repeatabilityScore",
      "knowledgeGain",
    ],
    showMeasurementLayer: true,
  },
];

/* Metric definitions. `value` reads from IMPACT_EXAMPLE in data.js. */
const IMPACT_METRICS = {
  workshopsDelivered: { label: "Workshops delivered", key: "workshopsDelivered" },
  workshopsReceived: { label: "Lessons completed", key: "workshopsDelivered" },
  studentsReached: { label: "Students reached", key: "studentsReached" },
  participationRate: { label: "Student participation rate", key: "participationRate", suffix: "%" },
  confidenceImprovement: { label: "Avg. confidence improvement", key: "confidenceImprovement", prefix: "+", suffix: " pts" },
  facilitatorFeedback: { label: "Teacher / facilitator feedback", key: "facilitatorFeedback", suffix: "/5" },
  repeatabilityScore: { label: "Repeatability score", key: "repeatabilityScore", suffix: "%" },
  knowledgeGain: { label: "Pre/post knowledge gain", key: "knowledgeCheckGain", prefix: "+", suffix: " pts" },
};

/* ===================================================================
   GAME FORMATS
   `devices` tells you what technology a game needs:
     "none"     — fully unplugged, works with zero screens
     "shared"   — one screen at the front of the room
     "personal" — students use their own device
   Every format works with any module: the volunteer plugs in that
   module's items, scenario, or vocabulary.
   =================================================================== */
const GAME_FORMATS = [
  {
    id: "four-corners",
    name: "Four Corners",
    emoji: "🧭",
    devices: "none",
    minutes: 10,
    group: "Whole class",
    energy: "High",
    materials: ["4 signs for the corners", "Tape"],
    summary: "Students physically move to the corner matching their answer, then defend it.",
    howToPlay: [
      "Label the four corners of the room with the answer choices A, B, C, D.",
      "Read the module's scenario out loud.",
      "Say 'go' — students walk to the corner matching their choice.",
      "Ask one student per corner to explain why they picked it.",
      "Reveal the strongest answer and talk about the common trap.",
    ],
    teenTip: "Movement wakes a sleepy room up fast. Let students change corners after hearing an argument — that's a great sign they're thinking.",
    reinforces: "Every answer is a choice with reasons, and hearing classmates defend other options shows there is more than one way to think about money.",
    levels: {
      k2: "Use two corners, not four, with a big picture in each. Read the question twice and act it out. Students can point to a corner from their seat if moving is too much.",
      "35": "Four corners, each with a letter and a picture. Ask one student per corner to finish the sentence 'I picked this because…'.",
      "68": "After the first move, give each corner 60 seconds to convince another corner to switch. Count who moved.",
      "912": "Use scenarios with no single right answer (buy or lease, a gap year or college). Each corner must name the downside of its own choice, not just the benefits.",
    },
    debrief: [
      "Which corner was hardest to choose? Why?",
      "Did anyone change corners? What changed your mind?",
      "What would you need to know to be sure?",
    ],
    access: "Students who can't move hold up an A–D card at their seat, and their vote counts in that corner. Put a picture as well as a letter in each corner, and read every option aloud.",
    cards: {
      title: "Sample scenarios — pick ones that match your module",
      items: [
        "You get $10 for your birthday. A: buy a toy today. B: save it all. C: save half, spend half. D: give some to a class fundraiser.",
        "Your favorite shoes have a hole. A: buy new ones now. B: get them fixed. C: wait for a sale. D: borrow a pair for now.",
        "A game asks you to pay $5 for extra lives. A: pay it. B: keep playing for free. C: ask a grown-up first. D: play something else.",
        "You have $20 to get a friend a gift. A: spend all $20. B: spend $10 and make a card. C: make the gift yourself. D: chip in on a group gift.",
      ],
    },
  },
  {
    id: "human-bar-graph",
    name: "Human Bar Graph",
    emoji: "📊",
    devices: "none",
    minutes: 8,
    group: "Whole class",
    energy: "Medium",
    materials: ["Open floor space"],
    summary: "Students line up by their answer to build a living bar chart of the room.",
    howToPlay: [
      "Mark a starting line for each answer choice.",
      "Students line up single file behind the choice they picked.",
      "Everyone looks around — the longest line is the class's most popular answer.",
      "Count each line out loud and write the numbers on the board.",
      "Ask: 'Why do you think this line is longest?'",
    ],
    teenTip: "This is the no-device version of the live class results screen. Kids love seeing the graph made of themselves.",
    reinforces: "Reading what a group chose, and noticing that the most popular answer isn't always the best one.",
    levels: {
      k2: "Two lines only, each marked with a picture on the floor. Count each line out loud together, clapping once per person.",
      "35": "Students predict which line will be longest before they move, then compare with the real graph.",
      "68": "Draw the graph on the board afterwards and turn the counts into percentages. Ask: does the most popular answer have to be the best one?",
      "912": "Run it twice, before and after the mini-lesson, and compare the two graphs. What changed, and why?",
    },
    debrief: [
      "Which line was longest? Were you surprised?",
      "Is the most popular answer always the right one?",
      "If we did this again after today's lesson, would the graph change?",
    ],
    access: "Students who can't stand in line place a marker or sticky note on their line instead. Count out loud so nobody has to see the whole room to follow along.",
    cards: {
      title: "Sample questions that make good graphs",
      items: [
        "What would you do with $5: save it, spend it, or share it?",
        "Which is a need: water, a video game, or a new hat?",
        "How long would you wait for something you really want: a day, a week, or a month?",
        "Where is the safest place to keep money: a jar, a bank, or your pocket?",
      ],
    },
  },
  {
    id: "card-sort",
    name: "Sort It Out",
    emoji: "🗂️",
    devices: "none",
    minutes: 12,
    group: "Small groups of 3–4",
    energy: "Calm",
    materials: ["Printed item cards", "2–3 labeled bins or paper mats"],
    summary: "Teams sort cards into categories, then defend any card they argued about.",
    howToPlay: [
      "Give each group a stack of item cards and the category mats.",
      "Groups sort every card as fast as they can.",
      "Set aside any card the group disagreed on — those go in a 'tricky pile'.",
      "Bring the class back together and discuss only the tricky pile.",
      "Point out that the disagreements are where the real learning is.",
    ],
    teenTip: "Don't rush to say which answer is right. The argument about the tricky pile IS the lesson.",
    reinforces: "Sorting things into categories (needs and wants, save and spend, safe and risky), and noticing that some items depend on the situation.",
    levels: {
      k2: "Picture cards only and two mats: a house for 'must have' and a balloon for 'nice to have'. Sort as a whole class while you hold up each card.",
      "35": "Three categories with words and pictures. Each group explains one card from its tricky pile.",
      "68": "Add 'it depends' cards like a phone or a car. Groups must write what would move the card to the other pile.",
      "912": "Sort a monthly budget into fixed, variable and optional costs, then decide what to cut first if income dropped by 20%.",
    },
    debrief: [
      "Which card did your group argue about most?",
      "Can a want ever become a need? When?",
      "What rule did your group use to decide?",
    ],
    access: "Every card has a picture and a word, and big cards are easier to handle. One student can read while another sorts, so readers and non-readers both have a job.",
    cards: {
      title: "Sample cards for needs and wants",
      items: [
        "Water",
        "Winter coat",
        "Video game",
        "Lunch",
        "Toothbrush",
        "Candy",
        "Phone",
        "Bus pass",
        "Birthday party",
        "School shoes",
        "Movie ticket",
        "Glasses",
      ],
    },
  },
  {
    id: "tradeoff-auction",
    name: "Trade-Off Auction",
    emoji: "🔨",
    devices: "none",
    minutes: 15,
    group: "Teams of 4",
    energy: "High",
    materials: ["Play money or paper chips", "List of items with starting prices"],
    summary: "Teams get a fixed budget and bid on items — they cannot afford everything.",
    howToPlay: [
      "Give every team the same amount of play money.",
      "Announce the full list of items up for auction before bidding starts.",
      "Auction items one at a time to the highest bidder.",
      "Halfway through, announce a surprise required expense every team must pay.",
      "At the end, each team explains what they gave up and whether they'd do it differently.",
    ],
    teenTip: "The surprise expense is the whole point — it teaches why you don't spend everything early.",
    reinforces: "A budget forces trade-offs, spending early limits later choices, and it pays to plan for surprise costs.",
    levels: {
      k2: "Use 5 tokens and four picture items. Hold up each item; students raise a hand to buy it for 1–3 tokens, first hand wins, no bidding wars. The surprise: 'everyone pays 1 for lunch'.",
      "35": "Teams get 20 tokens. Write each team's balance on the board after every item.",
      "68": "Before the auction, teams write a plan: what they want most and the most they'll bid. Compare plans with results at the end.",
      "912": "Add a loan: borrow 5 tokens now, pay back 7 at the end. Debrief on interest and whether borrowing actually helped.",
    },
    debrief: [
      "What did your team give up?",
      "Did you stick to your plan? Why or why not?",
      "How did the surprise expense change your choices?",
    ],
    access: "Bidding by holding up a number card lets quieter students take part without shouting. Show each item as a picture with its starting price.",
    cards: {
      title: "Sample auction items",
      items: [
        "A bike (starts at 4)",
        "A concert ticket (starts at 3)",
        "New shoes (starts at 2)",
        "A video game (starts at 3)",
        "A month of lunches (starts at 4) — this one is a need",
        "Art supplies (starts at 2)",
        "Surprise: every team pays 3 to fix a broken window.",
      ],
    },
  },
  {
    id: "budget-relay",
    name: "Budget Relay",
    emoji: "🏃",
    devices: "none",
    minutes: 12,
    group: "Teams of 4–5",
    energy: "High",
    materials: ["Paper budget sheet per team", "Markers"],
    summary: "A relay race where each teammate adds one decision to the team's money plan.",
    howToPlay: [
      "Each team gets one budget sheet at the far end of the room.",
      "One runner at a time goes and fills in a single line of the budget.",
      "Runner returns and tags the next teammate.",
      "First team with a complete, balanced plan wins — but it must actually add up.",
      "Read two teams' plans aloud and compare their priorities.",
    ],
    teenTip: "Award the win for a plan that balances, not for speed alone. Otherwise they'll scribble anything.",
    reinforces: "A budget has to balance: money in covers needs first, then savings, then wants.",
    levels: {
      k2: "No writing. Each runner carries one picture card (food, home, toy, piggy bank) to the team mat, needs first. The team is done when all the 'must have' pictures are down.",
      "35": "A $20 budget with four lines: food, savings, fun, giving.",
      "68": "A $200-a-month budget from a pretend teen job, with six lines including a phone bill.",
      "912": "A take-home pay of $1,600 with rent, transport, food, savings and fun. The plan must land within $50 of a 50/30/20 split.",
    },
    debrief: [
      "Which line did your team argue about?",
      "What did you cut so it would balance?",
      "Why does a budget have to add up exactly?",
    ],
    access: "Teams can relay by passing the sheet around a table instead of running. Calculators are fine. Read every budget line aloud at the start.",
    cards: {
      title: "Sample budget sheets",
      items: [
        "Grades 3–5: You have $20. Food ___ Savings ___ Fun ___ Giving ___ (must add up to $20)",
        "Grades 6–8: You earn $200 a month. Phone ___ Food ___ Transport ___ Savings ___ Fun ___ Gifts ___",
        "Grades 9–12: Take-home pay $1,600. Rent ___ Transport ___ Food ___ Phone ___ Savings ___ Fun ___",
      ],
    },
  },
  {
    id: "red-flag-green-flag",
    name: "Red Flag / Green Flag",
    emoji: "🚩",
    devices: "none",
    minutes: 10,
    group: "Whole class",
    energy: "Medium",
    materials: ["A red card and a green card per student"],
    summary: "Read a situation aloud; students hold up red for warning sign, green for safe.",
    howToPlay: [
      "Give every student one red card and one green card.",
      "Read a short scenario out loud.",
      "On the count of three, everyone holds up a card at once.",
      "Scan the room — call on one red and one green to explain.",
      "Name the specific red flag before moving to the next scenario.",
    ],
    teenTip: "Simultaneous reveal on 'three' stops students copying whoever answers first.",
    reinforces: "Spotting warning signs quickly, and naming exactly what made something risky.",
    levels: {
      k2: "Use simple stories ('Someone online asks for your password'). Everyone shows a card on 'three'. If the answer is a red flag, the class says together: 'Stop and tell a grown-up!'",
      "35": "Use game, app and shopping stories. Ask for the exact words in the story that were the red flag.",
      "68": "Add a yellow card for 'not sure — check first', and talk about how you would check.",
      "912": "Use realistic phishing texts, job offers and loan ads. Students name the red flag and the safe next step.",
    },
    debrief: [
      "Which story was hardest to judge?",
      "Which red flag showed up most?",
      "What should you do when you see a red flag?",
    ],
    access: "Draw a ✖ on the red card and a ✔ on the green one so students who can't tell red from green can play. Read every scenario twice.",
    cards: {
      title: "Sample scenarios (answers in brackets)",
      items: [
        "A website says 'Only 2 minutes left to claim your prize!' [red]",
        "Your bank's real app reminds you to set up a PIN. [green]",
        "Someone in a game offers free coins for your password. [red]",
        "A store gives you a receipt after you pay. [green]",
        "A message says 'Don't tell your parents about this deal.' [red]",
        "Your teacher sends home a note about the school book fair. [green]",
      ],
    },
  },
  {
    id: "two-truths-myth",
    name: "Two Truths and a Myth",
    emoji: "🕵️",
    devices: "none",
    minutes: 10,
    group: "Pairs",
    energy: "Calm",
    materials: ["Prepared statement sets"],
    summary: "Three money statements — students find the one that isn't true.",
    howToPlay: [
      "Read three statements about the topic: two true, one a myth.",
      "Pairs get 30 seconds to decide which is the myth.",
      "Take a quick show of hands for each statement.",
      "Reveal the myth and explain exactly why people believe it.",
      "Challenge: pairs write their own set for the next round.",
    ],
    teenTip: "Letting students write their own set at the end is the best check of whether they actually understood.",
    reinforces: "Questioning money 'facts' you hear, and explaining why a myth sounds believable.",
    levels: {
      k2: "Two statements, one true and one silly, each with a picture ('Money grows on trees' and 'People earn money by working'). Thumbs up for the true one.",
      "35": "Three statements. Pairs must say why the myth sounds true before you reveal it.",
      "68": "After two rounds, pairs write their own set for another pair to solve.",
      "912": "Use investing and credit myths. Pairs must say how they would check the claim.",
    },
    debrief: [
      "Why do people believe the myth?",
      "How could you check a money 'fact' you hear?",
      "Which myth surprised you most?",
    ],
    access: "Read each statement aloud and number them. Students can answer by holding up one, two or three fingers instead of speaking.",
    cards: {
      title: "Sample sets (myth in brackets)",
      items: [
        "1. Banks keep your money safe. 2. Saving a little each week adds up. 3. Money in a piggy bank grows by itself. [Myth: 3]",
        "1. A want is something you could live without. 2. Needs always cost more than wants. 3. Food is a need. [Myth: 2]",
        "1. Paying bills on time helps your credit. 2. Checking your own credit score lowers it. 3. Credit cards charge interest if you don't pay in full. [Myth: 2]",
        "1. Investing can lose money. 2. You have to be rich to start investing. 3. Starting early gives money more time to grow. [Myth: 2]",
      ],
    },
  },
  {
    id: "silent-lineup",
    name: "Silent Line-Up",
    emoji: "🤫",
    devices: "none",
    minutes: 8,
    group: "Groups of 6–8",
    energy: "Medium",
    materials: ["One item card per student"],
    summary: "Without talking, students order themselves by price, priority, or need.",
    howToPlay: [
      "Give each student a card with one item on it.",
      "The group must line up in order — cheapest to most expensive, or least to most necessary.",
      "No talking allowed. Gestures and showing cards only.",
      "When the line is set, let them talk and fix any mistakes.",
      "Ask what was hardest to place and why.",
    ],
    teenTip: "The silence makes them focus. The fix-it conversation afterwards is where the reasoning comes out.",
    reinforces: "Comparing prices, priorities or risk — and explaining the order out loud afterwards.",
    levels: {
      k2: "Groups of four with picture cards, ordered from cheapest to most expensive. Talking is allowed — silence is too hard at this age. Use things they know: gum, a ball, a bike, a car.",
      "35": "Silent, but pointing and showing cards are allowed. Then fix the line together.",
      "68": "Order from most to least necessary. There's no single right answer, so the fix-it talk is the lesson.",
      "912": "Order savings and investments by risk, or loans by total cost.",
    },
    debrief: [
      "Which card was hardest to place?",
      "Did anyone get moved? Why?",
      "Would the order change for a different person?",
    ],
    access: "Students who use a wheelchair or prefer to sit can order cards on a table instead of lining up. Every card has a picture, so non-readers can play.",
    cards: {
      title: "Sample sets",
      items: [
        "By price: pack of gum, sandwich, sneakers, bike, laptop, car",
        "Most to least necessary: water, coat, phone, video game, concert ticket",
        "By risk (older students): savings account, bond, index fund, one company's stock",
      ],
    },
  },
  {
    id: "would-you-rather",
    name: "Money Would-You-Rather",
    emoji: "🤔",
    devices: "none",
    minutes: 8,
    group: "Whole class",
    energy: "Calm",
    materials: ["None"],
    summary: "Two tempting options, no obviously right answer — students pick a side and argue it.",
    howToPlay: [
      "Read two options: 'Would you rather ___ or ___?'",
      "Students move to one side of the room for each option.",
      "Give each side 60 seconds to come up with their best reason.",
      "One speaker per side presents.",
      "Anyone convinced may switch sides — point out that changing your mind with new information is smart.",
    ],
    teenTip: "Pick options that are genuinely close. If one is obviously right there's nothing to discuss.",
    reinforces: "Weighing two good options and naming what you give up — opportunity cost in everyday choices.",
    levels: {
      k2: "Hold up two pictures. Students point or walk to one. Ask for just one 'why' from each side.",
      "35": "Each side gets 60 seconds to agree on its best reason; anyone may switch after hearing both.",
      "68": "Add a twist after the first vote ('the cheaper one breaks in a month') and see who switches.",
      "912": "Use bigger choices, like a higher-paying job with a long commute or a lower-paying one nearby. Each side must name the downside of its own choice.",
    },
    debrief: [
      "What did your side give up?",
      "What made someone switch?",
      "Is there a right answer? Why or why not?",
    ],
    access: "Students who can't move hold up an A or B card. Say both options twice and show each one as a picture.",
    cards: {
      title: "Sample prompts",
      items: [
        "Would you rather get $5 today or $8 next week?",
        "Would you rather have one expensive toy or three cheaper ones?",
        "Would you rather save for a big trip or spend a little every weekend?",
        "Would you rather buy new shoes, or fix your old ones and buy a book?",
        "Would you rather earn money walking dogs or washing cars?",
      ],
    },
  },
  {
    id: "story-circle",
    name: "Real-Life Story Circle",
    emoji: "💬",
    devices: "none",
    minutes: 10,
    group: "Circle of 8–12",
    energy: "Calm",
    materials: ["None"],
    summary: "Students share a real (small) money decision they made and what they'd change.",
    howToPlay: [
      "Sit in a circle. You go first with your own short story.",
      "Going around, anyone may share a small money decision they made recently.",
      "Passing is always allowed — nobody is required to share.",
      "After each story, the group names which concept it connects to.",
      "Close by asking what everyone will try differently this week.",
    ],
    teenTip: "Never ask about family income or how much money anyone has. Keep it about decisions, not amounts. Model a small, ordinary story so nobody feels they must impress.",
    reinforces: "Connecting money ideas to real, everyday decisions — and learning from small mistakes.",
    levels: {
      k2: "Use a puppet or a storybook character instead of students' own stories ('Bear spent all his coins on candy — what should he do next time?'). Students answer with thumbs or one word.",
      "35": "Use the prompt cards so students talk about a choice, not about money they have.",
      "68": "Partners share with each other first, then volunteers share with the circle.",
      "912": "Invite stories about a purchase they regret or one they're proud of, and connect each to a concept such as impulse buying or opportunity cost.",
    },
    debrief: [
      "Which story reminded you of something you've done?",
      "Which idea from today did the stories show?",
      "What will you try differently this week?",
    ],
    access: "Passing is always allowed, and students can draw their story instead of telling it. Keep it about decisions, not amounts.",
    cards: {
      title: "Story prompts (never about family money)",
      items: [
        "Tell about a time you had to choose between two things you wanted.",
        "Tell about something you saved up for, or would like to.",
        "Tell about a time you bought something and then changed your mind.",
        "Tell about a time you shared or gave something away.",
        "Tell about a time you waited for something and were glad you did.",
      ],
    },
  },
  {
    id: "live-vote",
    name: "Live Vote Challenge",
    emoji: "⚡",
    devices: "shared",
    minutes: 12,
    group: "Whole class",
    energy: "High",
    materials: ["Projector or large screen"],
    summary: "The built-in scenario challenge with a timer, class vote, and reveal.",
    howToPlay: [
      "Open the module's student challenge on the shared screen.",
      "Read the scenario aloud while the timer runs.",
      "Take the class vote by show of hands or on their own devices.",
      "Tap the answer and let the reveal screen do the teaching.",
      "Use the discussion prompt on the reveal to keep the conversation going.",
    ],
    teenTip: "The reveal screen has your script built in — best answer, why, the trap, and a discussion question. You can lean on it.",
    reinforces: "Committing to an answer before the reveal, then learning from the explanation — including the common trap.",
    levels: {
      k2: "Read the scenario and the options aloud. Students vote with thumbs or by pointing at the screen, and you tap the class's choice.",
      "35": "Take a show of hands for each option; a student counts and taps the winner.",
      "68": "Partners talk for 30 seconds before anyone votes.",
      "912": "Before the reveal, ask students to guess what the common trap will be.",
    },
    debrief: [
      "Why did the best answer work?",
      "What was the trap, and why do people fall for it?",
      "How would you explain this to a younger student?",
    ],
    access: "Read everything on the screen aloud. Students vote with hands or cards, so nobody needs their own device, and you can ignore the timer if your class needs more time.",
  },
  {
    id: "speed-round",
    name: "Speed Round",
    emoji: "⏱️",
    devices: "shared",
    minutes: 8,
    group: "Teams",
    energy: "High",
    materials: ["Screen or whiteboard", "Timer"],
    summary: "Rapid-fire questions; teams score points for fast correct answers.",
    howToPlay: [
      "Split the class into teams and give each a name.",
      "Ask quick questions from the module vocabulary and quiz.",
      "First team to raise a hand answers; correct answers score a point.",
      "Wrong answers pass the question to the next team.",
      "Keep score on the board and end on a high note.",
    ],
    teenTip: "Keep it fast and light. If one team runs away with it, give the trailing team a double-point round.",
    reinforces: "Quick recall of the key words and facts so they stick.",
    levels: {
      k2: "Use pictures: hold up two and teams point to the answer. No racing — every team answers at the same time.",
      "35": "Read vocabulary questions aloud; teams write answers on a mini whiteboard and show them together.",
      "68": "Mix vocabulary with quick math, like 'What is 10% of $50?'",
      "912": "Use real-world quick calls: fixed or variable expense? Gross or net pay?",
    },
    debrief: [
      "Which word was hardest?",
      "Which answer would you explain to a friend?",
      "Which word will you use this week?",
    ],
    access: "Answering on whiteboards at the same time means the fastest talker doesn't win every point. Read each question twice.",
    cards: {
      title: "Sample questions (answers in brackets)",
      items: [
        "What do we call money you keep for later? [savings]",
        "Is food a need or a want? [a need]",
        "What is a budget? [a plan for your money]",
        "What is interest? [money paid for using money — a bank pays you, a lender charges you]",
        "Name one thing a bank does. [keeps money safe, pays interest on savings]",
        "Name one sign of a scam. [hurry, secret, strange payment, too good to be true]",
      ],
    },
  },
  /* ---------------------------------------------------------------
     Deeper games (spec 06). These run over several rounds with a
     twist, so students live with the result of their choices.
     Extra fields. The original twelve have reinforces, levels, debrief,
     access and cards too; the rest are only on the games below.
       multiRound marks these deeper games (badge, and the builder
                  uses their own rules instead of the module's swap)
       topics     module ids the game suits (shown on the card, and
                  the Workshop Builder favors it for those modules)
       reinforces what it teaches, in one sentence
       levels     how to run it for each age group, keyed by the
                  GRADE_PROFILES id: k2, 35, 68, 912
       debrief    questions to close with
       access     how every student can take part
       cards      { title, items } ready-to-print game cards
       play       on-screen version, run by assets/js/play.js
     --------------------------------------------------------------- */
  {
    id: "market-day",
    multiRound: true,
    name: "Market Day",
    emoji: "🏪",
    devices: "none",
    minutes: 20,
    group: "Teams of 4 (shops and shoppers)",
    energy: "High",
    materials: ["10 tokens per shopper (paper squares, buttons, or play coins)", "4 shop signs with pictures: Food, Clothes, Fun, Bank", "Item cards with price tags", "Town news cards (below)"],
    summary: "The room becomes a tiny town. Shoppers must cover their needs before their wants, prices change mid-game, and anyone who saved at the Bank earns a bonus.",
    howToPlay: [
      "Set up four shops around the room: Food, Clothes, Fun, and the Bank. Two students run each shop; everyone else is a shopper.",
      "Each shopper gets 10 tokens and a must-have list: one Food item and one Clothes item. Everything else is a want. Prices: Food 2–3, Clothes 2–4, Fun 1–4.",
      "Round 1 (3 minutes): shoppers buy. Shopkeepers take tokens and hand over item cards. Shoppers may deposit leftover tokens at the Bank, which writes it on a sticky note.",
      "Round 2: read a Town news card. Shoppers adjust and buy again with whatever they have left.",
      "Round 3: the Bank pays 1 bonus token for every 3 deposited. Read one more Town news card, then a last buying round.",
      "Swap shopkeepers and shoppers and play one quick round so everyone gets to shop.",
      "Debrief: who got both needs? What did you give up? Who spent everything in round 1 and wished they hadn't?",
    ],
    teenTip: "The 'aha' moment is when savers get the Bank bonus and the surprise in round 2 doesn't wipe them out. Don't warn anyone — let them find out.",
    topics: ["needs-vs-wants", "opportunity-costs", "smart-shopping", "budget-battle", "save-or-spend"],
    reinforces: "Needs come before wants, every purchase with a fixed budget is a trade-off, and keeping some money back pays off when prices change.",
    levels: {
      k2: "Use 5 tokens and picture price tags with dots (1–3 dots, no numbers). The must-have list is two pictures: a lunch and a coat. Skip the bonus math — just say 'savers get one extra'. You run the Bank yourself.",
      "35": "10 tokens, prices from 1 to 5. Each shopper keeps a mini receipt: spent, left, saved.",
      "68": "Add a sale that isn't really a deal (3-for-2 on something nobody needs) and two sizes of the same food at different prices, so shoppers compare value, not just price.",
      "912": "Add 10% sales tax (round up), rent of 2 tokens due in round 2, and a 'buy now, pay later' offer that costs 2 extra next round. Debrief on how fixed costs squeeze every other choice.",
    },
    debrief: [
      "What was on your must-have list, and did you get both?",
      "What did you give up to buy something you wanted? That is the opportunity cost.",
      "When the Town news hit, who was glad they still had tokens? Why?",
    ],
    access: "Price tags show dots and numbers, so non-readers can play. Read every Town news card aloud. A shopper who can't move easily stays seated and sends a partner as their runner, or the shopkeepers come to them.",
    cards: {
      title: "Town news cards — read one each round",
      items: [
        "Big sale at Clothes! Everything there costs 1 less this round.",
        "Food prices went up. Every Food item costs 1 more.",
        "Your shoe broke. Pay 2 tokens to fix it before you buy anything else.",
        "You found a lost wallet and returned it. The owner thanks you with 1 token.",
        "The Fun shop has a new toy everyone wants. It costs 4.",
        "Rainy day — the park is closed, so Fun items are half price (round up).",
      ],
    },
  },
  {
    id: "savings-jars",
    multiRound: true,
    name: "Life Happens Savings Jars",
    emoji: "🫙",
    devices: "none",
    minutes: 15,
    group: "Small groups of 3–4",
    energy: "Medium",
    materials: ["3 cups per group labeled Spend, Save, Share (with a picture on each)", "20 counters per group (cubes or paper coins)", "A goal card per group", "Life Happens cards (below)", "One die per group (optional)"],
    summary: "Groups split their pay into Spend, Save, and Share jars over five 'weeks' while Life Happens cards throw surprises at them. Who reaches their savings goal — and who had to raid it?",
    howToPlay: [
      "Each group picks a goal: a bike (12 counters), a video game (8), or a gift for a friend (6). Put the goal card in front of the Save jar.",
      "Each week the group earns 4 counters (or roll the die: 1–2 earns 3, 3–4 earns 4, 5–6 earns 5).",
      "The group agrees how to split the counters between the three jars. Spend counters are used up at the end of each week.",
      "Draw a Life Happens card and do what it says. If a cost is bigger than the Spend jar, the rest comes out of Save.",
      "Every second week, a Save jar holding 4 or more earns 1 bonus counter. That is interest.",
      "After five weeks, each group counts its Save jar against its goal and tells the class its best and worst decision.",
    ],
    teenTip: "Groups that put everything in Spend early will get hit by a card and have to raid Save. Let it happen, then ask what they'd do differently next time.",
    topics: ["save-or-spend", "budget-battle", "banking-basics", "investing-tomorrow", "paycheck-puzzle", "money-tales"],
    reinforces: "Pay yourself first, save toward a goal, keep a cushion for surprises, and (for older students) see how interest rewards money you leave alone.",
    levels: {
      k2: "Two jars only, Spend and Save, with big pictures. The goal is a picture of a ball that costs 5. You read each card and act it out; the class shows thumbs up or down to decide which jar to use. Three weeks is plenty.",
      "35": "All three jars. Groups keep a tally each week: earned, spent, saved, shared.",
      "68": "Add a fourth jar, 'Under the mattress' (no bonus, and one card makes it vanish). Ask which they trust more and why banks pay interest.",
      "912": "Track it as a table: income, a fixed cost of 1 counter per week for 'phone', savings rate as a percentage. Discuss emergency funds of 3–6 months of expenses.",
    },
    debrief: [
      "Did you reach your goal? What helped the most?",
      "Which Life Happens card hurt the most? What would have made it hurt less?",
      "Why do people say 'save first, then spend'?",
    ],
    access: "Jars carry a picture as well as a word. Use counters that are easy to pick up (cubes beat beans for small hands). One student can be the group's banker and move counters for anyone who prefers not to.",
    cards: {
      title: "Life Happens cards",
      items: [
        "A neighbor pays you 3 for helping walk their dog. Put them in any jar.",
        "Your headphones broke. Pay 3.",
        "You lent a friend 2 last week and they paid you back. Get 2.",
        "The school trip costs 2. Pay it.",
        "You did extra chores. Earn 2 more this week.",
        "A hole in your pocket! Lose 1 from Spend.",
        "Ice cream truck! Spend 1 if you want to — or skip it.",
        "Your goal item went on sale. It now costs 2 less.",
      ],
    },
  },
  {
    id: "scam-detective",
    multiRound: true,
    name: "Scam Detective Agency",
    emoji: "🔍",
    devices: "none",
    minutes: 15,
    group: "Teams of 3–4",
    energy: "Medium",
    materials: ["One case file per team: the messages below, printed and cut apart", "Verdict cards: ✔ Safe and ✖ Scam (a shape and a word, not just a color)", "Pencils for circling clues"],
    summary: "Each team is a detective agency with a case file of messages. They decide which are scams, circle the clues, and defend their verdict — other agencies can object.",
    howToPlay: [
      "Teach the four clues first, each with a hand signal: Hurry (tap your wrist), Secret (finger to lips), Strange payment like gift cards or passwords (pinch your fingers), Too good to be true (arms wide).",
      "Give every agency the same case file of six messages.",
      "Agencies have 6 minutes. For each message they place a Safe or Scam card and circle every clue they find.",
      "Go through the messages one at a time. One agency gives its verdict and clues; any agency that disagrees says 'Objection!' and explains.",
      "Score 1 point for the right verdict and 1 for each clue named, up to 3 per message.",
      "Bonus round: each agency rewrites one scam so it would be safe. What had to change?",
    ],
    teenTip: "Include real, safe messages. Once students get suspicious they call everything a scam — the goal is good judgment, not panic.",
    topics: ["fraud-red-flags", "banking-basics", "smart-shopping", "credit-climb"],
    reinforces: "The common signs of a scam — pressure, secrecy, strange payment, too good to be true — and the one move that always helps: stop and ask a trusted adult.",
    levels: {
      k2: "No reading. Act out each message as a tiny play ('Psst! Tell me your secret password and I'll give you a puppy!'). Students give a thumbs up for safe, or cover their mouth for 'that's a trick — tell a grown-up'. Use three messages.",
      "35": "Use the game and prize messages (1, 2 and 3). Teams name one clue per message.",
      "68": "Use all six, and add your own social-media examples: fake giveaways and a friend's hacked account asking for money.",
      "912": "Add a fake check that 'overpays' you and a bank text with a lookalike link. Close with what to do: don't click, contact the company yourself, report it, turn on two-step login.",
    },
    debrief: [
      "Which clue showed up most often?",
      "Which message was hardest to judge? What made it tricky?",
      "If you're ever not sure, what is the one thing you should always do?",
    ],
    access: "Verdict cards use a shape and a word, never color alone. One team member can read each message aloud, and the hand signals let everyone take part without reading.",
    cards: {
      title: "Case file messages (answers in brackets — cut them off before handing out)",
      items: [
        "\"CONGRATS!! You won 10,000 free game coins! Enter your password in the next 5 minutes to claim them!\" [Scam: hurry, asks for a password, too good to be true]",
        "\"Reminder from City Library: your book is due Friday. You can renew it at the front desk.\" [Safe: no hurry, no payment, nothing secret]",
        "\"Hi it's Sam, I'm stuck!! Can you buy a $50 gift card and text me the code? Don't tell anyone.\" [Scam: gift card, secret, hurry]",
        "\"Your account will be DELETED today unless you click here and confirm your bank details.\" [Scam: hurry, asks for bank details, unknown link]",
        "\"Thanks for your order! It ships Tuesday. You can track it in the store's app.\" [Safe if you really ordered something — check in the real app, not a link]",
        "\"Work from home and earn $500 a day! Just pay a $40 starter fee.\" [Scam: you never pay to get a job; too good to be true]",
      ],
    },
  },
  {
    id: "deal-showdown",
    multiRound: true,
    name: "Best Deal Showdown",
    emoji: "🏷️",
    devices: "none",
    minutes: 15,
    group: "Teams of 3–4",
    energy: "Medium",
    materials: ["Showdown cards (below)", "Scrap paper or mini whiteboards per team", "A and B cards for each team"],
    summary: "Two products, one question: which is the better deal? Teams guess, do the math — and then a hidden twist may flip the answer.",
    howToPlay: [
      "Read a showdown card aloud and draw both options on the board. Teams get 60 seconds to pick the better deal.",
      "On 'show me', every team holds up A or B at the same time.",
      "Teams now work it out properly: price per item, per ounce, or the total over time. They may switch.",
      "Before you reveal the twist, any team may ask you one question about the products. A question that uncovers the twist earns a bonus point.",
      "Reveal the twist (in brackets on the card). Score 1 point for the right answer after the twist.",
      "After four or five cards, ask: what questions should you always ask before deciding something is a deal?",
    ],
    teenTip: "Reward good questions — 'How long does it last?' 'Do I even need two?' That habit matters more than the arithmetic.",
    topics: ["smart-shopping", "needs-vs-wants", "opportunity-costs", "budget-battle", "paycheck-puzzle"],
    reinforces: "Compare value, not just price: price per item, how long something lasts, hidden extra costs, and whether a 'deal' helps if you didn't need it.",
    levels: {
      k2: "Use real objects or pictures and play coins. Ask 'Which costs more?' and let students line up coins beside each picture to see. One twist only: 'This one breaks the first day — is it still a good deal?'",
      "35": "Whole-dollar prices and price per item (6 pencils for $3, or 1 for $1). Allow counting on fingers or with coins.",
      "68": "Unit price per ounce, store brand vs name brand, and 'buy one, get one 50% off'.",
      "912": "Total cost over time: a $200 phone on a $60/month plan vs a $600 phone on $30/month over two years, and a free trial that turns into a paid plan.",
    },
    debrief: [
      "Which twist surprised you the most?",
      "Is the cheapest thing always the best deal? Give an example.",
      "What's one question you'll ask the next time something is 'on sale'?",
    ],
    access: "Read every card aloud and draw both options. Calculators are fine for anyone who wants one — the lesson is the comparison, not the long division.",
    cards: {
      title: "Showdown cards (twist in brackets)",
      items: [
        "A: a box of 6 granola bars for $3. B: a box of 12 for $5. [B is cheaper per bar — but they go stale in two weeks and you eat one a week.]",
        "A: sneakers for $25. B: sneakers for $45. [A wears out in 3 months; B lasts a year.]",
        "A: a toy car for $8. B: a toy car for $6. [B needs batteries that cost $4.]",
        "A: name-brand cereal, $4. B: store-brand cereal, same size, $2.50. [Same ingredients list.]",
        "A: one T-shirt for $10. B: 'Buy 2, get 1 free' at $10 each. [You only needed one shirt.]",
        "A: a streaming app at $8 a month. B: $80 for a whole year. [You only watch it in summer.]",
      ],
    },
  },
  {
    id: "money-path",
    multiRound: true,
    name: "Choose Your Money Path",
    emoji: "🛤️",
    devices: "none",
    minutes: 12,
    group: "Whole class",
    energy: "Medium",
    materials: ["The story (below)", "Two signs, A and B, on opposite walls (add a picture to each)"],
    summary: "A choose-your-own-adventure story told out loud. At each fork the class moves to A or B, the story follows the majority — then you reveal where the other path would have led.",
    howToPlay: [
      "Introduce the main character: Jordan, who just earned $20 helping a neighbor.",
      "Read the story to the first fork. Students walk to the A wall or the B wall.",
      "Ask one student on each side why they chose it, then follow the side with more students.",
      "Keep going through all four forks. Keep a tally on the board: what Jordan has, and what Jordan gave up.",
      "At the end, tell the other ending — what would have happened on the path the class didn't take.",
      "Vote: which ending would you rather have, and why?",
    ],
    teenTip: "Tell it with energy — voices and sound effects help. The real lesson is the other ending, so save time for it.",
    topics: ["opportunity-costs", "money-tales", "save-or-spend", "needs-vs-wants", "credit-climb", "college-cost-choices"],
    reinforces: "Every choice has an opportunity cost, small choices add up over time, and waiting can change what you can afford later.",
    levels: {
      k2: "Use three forks and pictures on the walls instead of letters (a toy, a piggy bank). Students can point instead of walking. Act Jordan out with a puppet or stuffed animal.",
      "35": "Use the full story with a picture tally on the board: what Jordan has, what Jordan gave up.",
      "68": "After the story, pairs write a fifth fork: a new choice and what happens on each side.",
      "912": "Retell it with older stakes: a first paycheck, a credit card sign-up gift, a car loan offer, and community college vs a four-year school. Track savings and debt on the board.",
    },
    debrief: [
      "What did Jordan give up at each fork?",
      "Which choice made the biggest difference by the end?",
      "Was there a fork where waiting was the smart move?",
    ],
    access: "Students who can't move hold up an A or B card at their seat. Pictures on the signs mean non-readers can play fully.",
    cards: {
      title: "The story: Jordan's $20",
      items: [
        "Fork 1 — Jordan earns $20 helping a neighbor. A: spend it all on a new game today. B: spend $5 on a snack and save $15.",
        "Fork 2 — Friends invite Jordan to the movies ($8). If Jordan spent it all, A: borrow $8 from a cousin, B: stay home. If Jordan saved, A: go and pay, B: skip it and keep saving.",
        "Fork 3 — Jordan's bike tire goes flat; fixing it costs $10. Who can pay without borrowing? If Jordan can't, A: borrow again, B: walk for two weeks.",
        "Fork 4 — The game Jordan really wants comes out for $25. A: buy it now with whatever it takes (borrow if needed). B: wait and save for two more weeks.",
        "Other ending — Tell the class where the path they didn't choose ends up: money left, money owed, and what Jordan has to show for it.",
      ],
    },
  },
  {
    id: "credit-ladder",
    multiRound: true,
    name: "Credit Ladder",
    emoji: "🪜",
    devices: "none",
    minutes: 15,
    group: "Teams of 4–5",
    energy: "Medium",
    materials: ["A 7-step ladder taped on the floor or drawn on the board", "One marker per team", "Choice cards (below)", "A and B cards for each team"],
    summary: "Teams climb a trust ladder with their borrowing choices. Paying on time moves you up; missed payments slide you down — and the higher you are, the cheaper borrowing gets.",
    howToPlay: [
      "Draw a 7-step ladder. Every team starts on step 4. Explain: the higher you are, the more lenders trust you.",
      "Read a choice card. Each team secretly picks A or B, then all reveal at once.",
      "Move every team up or down as the card says.",
      "After every second card, each team must borrow 5 coins. What it costs depends on their step: steps 6–7 pay 1 extra, steps 3–5 pay 2 extra, steps 1–2 pay 4 extra. Keep a running total on the board.",
      "After six cards, compare: where did each team end, and how much extra did borrowing cost them?",
      "Discuss what moved teams up fastest and what made them slide.",
    ],
    teenTip: "The extra-cost total is what makes it click: the same loan costs one team 3 coins and another 12. Point straight at the numbers.",
    topics: ["credit-climb", "college-cost-choices", "paycheck-puzzle", "banking-basics"],
    reinforces: "Credit is trust: on-time payments build it, late payments and maxed-out cards hurt it, and a good history makes borrowing cheaper.",
    levels: {
      k2: "Make it about borrowing toys and library books. Giving things back on time moves you up the trust ladder; losing them moves you down. No money math — the top step is trusted with the class's special pencil.",
      "35": "Use borrowing from a friend and library late fees. Keep the step-and-cost idea with small numbers.",
      "68": "Use the full cards and the extra-cost tally.",
      "912": "Call the ladder a credit score (300–850). Add cards on credit utilization, checking your own credit report, and co-signing for a friend.",
    },
    debrief: [
      "What moved your team up the fastest?",
      "How much more did borrowing cost the bottom team than the top team?",
      "Why would a lender charge more to someone lower on the ladder?",
    ],
    access: "The ladder shows every move, so nobody has to follow by listening alone. Teams decide together, so one confident reader can read the card for the group.",
    cards: {
      title: "Choice cards",
      items: [
        "Your phone bill is due. A: pay it on time (up 1). B: pay it two weeks late (down 2).",
        "A store offers a free T-shirt if you open their card. A: sign up for the shirt (down 1 — another new account). B: no thanks (stay).",
        "You have a $500 limit. A: use $450 of it (down 1). B: keep it under $150 (up 1).",
        "You can't pay the whole bill this month. A: pay the minimum, on time (stay). B: skip it (down 2).",
        "A: check your credit report and fix a mistake you find (up 1). B: never look at it (stay).",
        "A friend asks you to co-sign their loan. A: say yes — they miss payments (down 2). B: say no (stay).",
      ],
    },
  },
  {
    id: "grow-garden",
    multiRound: true,
    name: "Grow Your Money Garden",
    emoji: "🌱",
    devices: "none",
    minutes: 15,
    group: "Small groups of 3–4",
    energy: "Medium",
    materials: ["12 seed tokens per group, plus a pile of extras", "A garden mat per group with three beds: Piggy Bank, Savings Account, Mixed Garden", "Weather cards (below)"],
    summary: "Groups plant money 'seeds' in three beds that grow differently over ten years of weather — including a scary storm. It shows growth, risk, and why patience pays.",
    howToPlay: [
      "Each group spreads its 12 seeds across three beds. Piggy Bank never grows or shrinks. Savings Account grows slowly. Mixed Garden (lots of different plants) grows faster but has bad years.",
      "Each year, read a weather card for the Mixed Garden. Every second year, the Savings Account gets 1 new seed for every 6 in it.",
      "In year 5 the scary storm hits. Ask: does anyone want to dig up their garden and move it to the Piggy Bank? Let them decide.",
      "Groups that dug up miss the comeback in year 6.",
      "After year 10, groups count each bed and compare.",
      "Discuss: which bed grew most? Which felt safest? Who panicked at the storm, and what happened?",
    ],
    teenTip: "The storm-then-comeback moment is the lesson about patience. Don't hint that the comeback is coming.",
    topics: ["investing-tomorrow", "investing-mythbusters", "save-or-spend", "banking-basics"],
    reinforces: "Money can grow over time, more growth usually means more risk, spreading money out lowers risk, and pulling out during a drop locks in the loss.",
    levels: {
      k2: "Use one paper plant and a piggy bank. Each year, add a paper leaf to the plant and nothing to the piggy bank. A storm takes one leaf away; the next sunny year brings two back. Ask 'Should we dig it up?' with thumbs.",
      "35": "Two beds only, Piggy Bank and Mixed Garden. Make a simple bar chart of seeds after each year.",
      "68": "All three beds. Graph each bed year by year and compare the shapes of the lines.",
      "912": "Add a fourth bed, One Giant Plant (a single company): roll a die each year — 1–2 halves it, 5–6 doubles it. Charge a 1-seed fee every third year to show what high fees do. Talk about compounding and diversification.",
    },
    debrief: [
      "Which bed grew the most? Which felt the safest?",
      "What happened to the groups that dug up their garden after the storm?",
      "Why might someone put money in more than one bed?",
    ],
    access: "Seeds are counted by moving them on the mat — no writing needed. Read each weather card aloud and show a picture: sun, cloud, rain, or storm.",
    cards: {
      title: "Weather cards for the Mixed Garden",
      items: [
        "Year 1 — Sunny ☀: add 1 seed for every 4 in the bed.",
        "Year 2 — Cloudy ☁: no change.",
        "Year 3 — Sunny ☀: add 1 seed for every 4.",
        "Year 4 — Gentle rain 🌧: add 1 seed.",
        "Year 5 — Scary storm ⛈: lose a third of your seeds (round down).",
        "Year 6 — Sunny comeback ☀: add 1 seed for every 3.",
        "Year 7 — Sunny ☀: add 1 seed for every 4.",
        "Year 8 — Cloudy ☁: no change.",
        "Year 9 — Sunny ☀: add 1 seed for every 4.",
        "Year 10 — Harvest 🧺: count everything.",
      ],
    },
  },
  {
    id: "savings-quest",
    multiRound: true,
    name: "Savings Quest (on screen)",
    emoji: "🎯",
    devices: "shared",
    minutes: 15,
    group: "Whole class or teams",
    energy: "Medium",
    materials: ["Projector or large screen", "This page open: Games → Savings Quest → Play on screen"],
    summary: "An on-screen game for the whole room. Each week the class votes on how much of their pay to save, then the screen draws a Life Happens card. Can they reach the goal — and how does it compare with a steady saver?",
    howToPlay: [
      "Open Savings Quest on the shared screen and let the class vote on a goal.",
      "Each week the class earns 5 coins. Take a quick vote: how many go into the Save jar? Tap + and − to set it.",
      "Tap 'Lock it in'. The screen draws a Life Happens card. Costs come out of the wallet first, then out of Save.",
      "Every second week the Save jar earns a bank bonus. Read it out — that is interest.",
      "After six weeks the screen shows whether the class reached its goal, and how a steady 'save 3 a week' plan would have done with the same cards.",
      "Play again with a different strategy and compare.",
    ],
    teenTip: "Let a different student tap the buttons each week, and read each card out in a dramatic voice. Scores are never saved or sent — it all runs in the browser.",
    topics: ["save-or-spend", "budget-battle", "banking-basics", "investing-tomorrow", "paycheck-puzzle"],
    reinforces: "Saving a little every time adds up, surprises are easier to handle with a cushion, and interest rewards money left in the bank.",
    levels: {
      k2: "You tap the buttons and read every card. The class votes with thumbs: 'Save more, or spend more?' Talk about the jar filling up rather than the numbers.",
      "35": "Let students tap the buttons and keep a tally on paper of what the class saved each week.",
      "68": "Before each week, ask a student to predict the jar total. At the end, compare with the steady-saver line and explain the gap.",
      "912": "Ask what percentage of pay the class saved overall, and how the bank bonus compares with real savings account rates.",
    },
    debrief: [
      "Did we reach the goal? Which week made the biggest difference?",
      "How did our plan compare with saving 3 every week?",
      "Which Life Happens card would have hurt less with more in the Save jar?",
    ],
    access: "Big buttons that work with a keyboard, and every card is read aloud. Nothing moves on a timer, so the class can take as long as it needs.",
    play: {
      engine: "savings-quest",
      weeks: 6,
      pay: 5,
      goals: [
        { emoji: "🚲", name: "A bike", cost: 24 },
        { emoji: "🎮", name: "A video game", cost: 16 },
        { emoji: "🎁", name: "A gift for a friend", cost: 10 },
      ],
      events: [
        { emoji: "🐕", text: "A neighbor pays you 3 coins for walking their dog.", amount: 3 },
        { emoji: "🎧", text: "Your headphones broke. Replacing them costs 3 coins.", amount: -3 },
        { emoji: "🚌", text: "The class trip costs 2 coins.", amount: -2 },
        { emoji: "🧹", text: "You did extra chores and earned 2 coins.", amount: 2 },
        { emoji: "🍦", text: "Ice cream truck! It costs 1 coin — the class already said yes.", amount: -1 },
        { emoji: "☀️", text: "A quiet week. Nothing surprising happened.", amount: 0 },
        { emoji: "🩹", text: "Your bike tire went flat. The fix costs 4 coins.", amount: -4 },
        { emoji: "🎂", text: "Birthday card from a friend with 2 coins inside!", amount: 2 },
      ],
    },
  },
  {
    id: "scam-or-safe",
    multiRound: true,
    name: "Scam or Safe? Inbox (on screen)",
    emoji: "📱",
    devices: "shared",
    minutes: 10,
    group: "Whole class, pairs, or solo",
    energy: "Medium",
    materials: ["Projector or large screen — or students' own devices", "This page open: Games → Scam or Safe? → Play on screen"],
    summary: "A pretend phone inbox. Students read each message, decide Scam or Safe, then see the clues highlighted and why. Works on one shared screen or on each student's own device.",
    howToPlay: [
      "Open Scam or Safe? on the shared screen (or have students open it on their own devices). Pick Younger or Older messages.",
      "Read the first message aloud. Students vote Scam or Safe with a thumb, a card, or by tapping.",
      "Tap the class's answer. The screen shows whether it was right, the clues to look for, and why.",
      "Before moving on, ask: which clue did you spot first?",
      "At the end the screen shows the score and the four clues to remember. Play again for a new order.",
    ],
    teenTip: "If students use their own devices, nothing is recorded or sent — the score lives only on that screen. Ask them to compare scores with a partner, not the whole class.",
    topics: ["fraud-red-flags", "banking-basics", "smart-shopping"],
    reinforces: "Spot the four scam clues — hurry, secret, strange payment, too good to be true — and know that real companies never ask for your password.",
    levels: {
      k2: "Pick Younger. You read every message in a silly voice; the class answers with thumbs up (safe) or crossed arms (scam). Focus on one rule: never tell anyone your password, and tell a grown-up.",
      "35": "Pick Younger. Pairs decide together before you tap.",
      "68": "Pick Older. Students say which clue they spotted before you reveal.",
      "912": "Pick Older on their own devices, then discuss the trickiest ones: the delivery text and the fake bank link.",
    },
    debrief: [
      "Which message fooled the most people? Why did it work?",
      "What do real companies never ask you for?",
      "Who is a trusted adult you could show a strange message to?",
    ],
    access: "Large text, big buttons that work with a keyboard, and results announced for screen readers. No timer, so slower readers aren't rushed.",
    play: {
      engine: "inbox",
      clues: [
        { id: "hurry", label: "Hurry", tip: "They rush you so you don't stop to think." },
        { id: "secret", label: "Secret", tip: "They tell you not to tell anyone." },
        { id: "payment", label: "Strange payment", tip: "Gift cards, passwords, or bank details." },
        { id: "toogood", label: "Too good to be true", tip: "Huge prizes for doing almost nothing." },
      ],
      messages: [
        { level: "younger", from: "GameWorld Prizes", text: "YOU WON 10,000 free coins!!! Type your password in 5 minutes to get them!", scam: true, clues: ["hurry", "payment", "toogood"], why: "Real games never ask for your password, and a giant prize for nothing is a trick." },
        { level: "younger", from: "City Library", text: "Your book is due on Friday. You can renew it at the front desk.", scam: false, clues: [], why: "No rush, no money, no secrets — just a normal reminder." },
        { level: "younger", from: "Unknown number", text: "Hi! I'm a new friend from the game. Don't tell your parents, but send me a picture of your mom's card.", scam: true, clues: ["secret", "payment"], why: "Anyone who asks you to keep a secret from grown-ups, or wants card details, is not a friend." },
        { level: "younger", from: "Coach Lee", text: "Practice moved to 4pm tomorrow because of rain. See you there!", scam: false, clues: [], why: "Someone you know, sharing information, asking for nothing." },
        { level: "younger", from: "Free Puppy Club", text: "Click here to get a FREE puppy today! Only the first 3 people win!", scam: true, clues: ["hurry", "toogood"], why: "A free puppy for a click, and a rush to be first — two clues at once." },
        { level: "older", from: "Sam (friend)", text: "I'm stuck!! Can you buy a $50 gift card and text me the code? Don't tell anyone pls", scam: true, clues: ["hurry", "secret", "payment"], why: "A friend's account can be hacked. Gift card codes plus secrecy is a classic scam — call Sam another way to check." },
        { level: "older", from: "Securty Team", text: "Your account will be DELETED today. Confirm your bank login here: bank-verify-now.co", scam: true, clues: ["hurry", "payment"], why: "Misspelled sender, a lookalike link, and a deadline. Real banks never ask for your login by message." },
        { level: "older", from: "Shoe Store", text: "Thanks for your order! It ships Tuesday. Track it any time in our app.", scam: false, clues: [], why: "Safe if you really ordered. Check in the store's real app — don't tap links in texts you weren't expecting." },
        { level: "older", from: "Hiring Now", text: "Work from home, earn $500/day! Just pay a $40 starter fee to begin.", scam: true, clues: ["payment", "toogood"], why: "You never pay to get a job, and $500 a day for no experience is too good to be true." },
        { level: "older", from: "School Office", text: "Picture day is next Thursday. Order forms come home in backpacks this week.", scam: false, clues: [], why: "Normal school news. Nothing to click, nothing to pay right now." },
        { level: "older", from: "Prize Center", text: "You've been selected for a $1,000 gift card! Just pay $4.99 shipping to claim.", scam: true, clues: ["payment", "toogood"], why: "You didn't enter anything, and a 'small fee' to get a big prize is how they get your card number." },
      ],
    },
  },
];

/* ===================================================================
   LESSON PACKS
   Extra teaching content for each module, beyond the core workshop.
   The generator assembles these into a lesson plan of any length.
   =================================================================== */
/* Each pack's `bestGames` lists the GAME_FORMATS ids that suit the topic
   best, strongest first. The generator gives these a big bonus when it
   picks the main activity. */
const LESSON_PACKS = {
  "opportunity-costs": {
    bestGames: ["would-you-rather", "tradeoff-auction"],
    hook: "Hold up two treats and tell the class only one can be chosen. Let them feel the tension before naming what's happening.",
    miniLesson: "When you choose one thing, you give up another. The thing you gave up is called the opportunity cost. It isn't the money — it's the option you didn't pick.",
    guidedPractice: "Walk through three choices as a class. For each, students name what was chosen AND what was given up.",
    checkUnderstanding: "Students name one choice from their own day and the opportunity cost of it.",
    extension: "Students draw a fork in the road with their choice on one path and what they gave up on the other.",
    unpluggedSwap: "Use Would-You-Rather and paper choice cards instead of the on-screen scenario.",
    commonQuestions: [
      { q: "Is the opportunity cost the money?", a: "No — the money is the price. The opportunity cost is the next-best thing you gave up. This is the key distinction for the whole lesson." },
      { q: "What if I didn't want the other thing anyway?", a: "Then the opportunity cost is low, and that's a great sign it was an easy choice." },
    ],
  },
  "investing-tomorrow": {
    bestGames: ["silent-lineup", "two-truths-myth"],
    hook: "Ask who has ever planted a seed. Then ask what would happen if you dug it up the next morning to check on it.",
    miniLesson: "Investing means putting money somewhere it can grow over time. Like a plant, it needs time and patience. Digging it up early stops the growing.",
    guidedPractice: "Draw a simple growth chart on the board and add a little each 'year' so students can watch it climb.",
    checkUnderstanding: "Students explain why waiting helps invested money grow.",
    extension: "Students draw what their money seed could grow into over five years.",
    unpluggedSwap: "Do the growth chart on paper or the whiteboard and use Four Corners for the vote.",
    commonQuestions: [
      { q: "Where does the extra money come from?", a: "Keep it simple at this age: money that's invested gets put to work, and a little of what it earns comes back to you." },
      { q: "Can it ever shrink?", a: "Yes, sometimes — which is why we wait and don't panic. Honest but reassuring is the right tone here." },
    ],
  },
  "money-tales": {
    bestGames: ["story-circle", "would-you-rather"],
    hook: "Show the cover and ask what students think the story will be about. Take a few guesses before opening it.",
    miniLesson: "Stories let us watch someone else make a money choice and see what happens — so we can learn without having to make the mistake ourselves.",
    guidedPractice: "Pause at the moment of the character's choice. Take a class vote on what they should do before reading on.",
    checkUnderstanding: "Students retell the character's choice and say what they would have done.",
    extension: "Students draw an alternate ending where the character chooses differently.",
    unpluggedSwap: "This lesson is already unplugged — a read-aloud plus Four Corners for the prediction vote works perfectly.",
    commonQuestions: [
      { q: "Is this a real story?", a: "It's made up, but the money choices in it are very real. That's what makes stories useful." },
      { q: "Why did the character do that?", a: "Wonderful question to turn back to the class — let them argue the character's reasoning." },
    ],
  },
  "needs-vs-wants": {
    bestGames: ["card-sort", "four-corners"],
    hook: "Hold up two things from your bag — say a water bottle and headphones. Ask the room: if you could only keep one forever, which one, and why?",
    miniLesson: "Needs keep you alive, safe, and healthy: food, water, a place to live, clothes for the weather. Wants make life more fun. The tricky part is that the same object can be either one depending on who you are and what your life looks like.",
    guidedPractice: "As a class, sort ten everyday items into needs and wants. Every time someone disagrees, stop and ask what situation would make it a need.",
    checkUnderstanding: "Each student names one need and one want out loud, and explains one item that could be both.",
    extension: "Students draw a picture of a want they'd give up for a week and what they'd do with the money saved.",
    unpluggedSwap: "Instead of the on-screen sorting game, use paper item cards and two hoops or bins on the floor.",
    commonQuestions: [
      { q: "Is my phone a need?", a: "It depends. For an adult whose job requires it, closer to a need. For most students, it's a want that feels like a need — and noticing that difference is the skill." },
      { q: "Is dessert a need? I need food!", a: "Food is a need; dessert specifically is a want. Great chance to show that a category can split." },
    ],
  },
  "budget-battle": {
    bestGames: ["tradeoff-auction", "budget-relay"],
    hook: "Announce that the class has exactly $40 to get through a whole week, and start listing costs on the board until it obviously doesn't fit.",
    miniLesson: "A budget is a plan you make on purpose, before the money is gone. Money comes in, money goes out. When the list is longer than the money, you rank what matters most instead of hoping it works out.",
    guidedPractice: "In teams, build a weekly plan on paper. Halfway through, announce a surprise cost everyone must cover, and let them revise.",
    checkUnderstanding: "Each team reads its final plan and names the one thing they cut first, and why.",
    extension: "Students rewrite their plan as if their income dropped by half.",
    unpluggedSwap: "Use paper budget sheets and the Budget Relay game instead of the on-screen budget board.",
    commonQuestions: [
      { q: "What if I don't have any income?", a: "A budget works with any amount — allowance, gifts, birthday money. The skill is planning, not the size of the number." },
      { q: "Why not just spend and see what happens?", a: "That's exactly the common trap. Ask who has ever gotten to the end of their money and wondered where it went." },
    ],
  },
  "save-or-spend": {
    bestGames: ["would-you-rather", "four-corners"],
    hook: "Offer the class a deal: one small treat now, or double the treat if everyone waits until the end of the workshop. Take a vote and revisit at the end.",
    miniLesson: "Saving means keeping some money now so a bigger goal is possible later. 'Pay yourself first' means you set money aside the moment it arrives, before you spend any of it — because 'whatever is left over' is usually nothing.",
    guidedPractice: "Pick a class goal and a weekly amount, then work out together how many weeks it takes. Change the weekly amount and watch the number of weeks move.",
    checkUnderstanding: "Students state one goal and how many weeks of saving it would take at an amount they choose.",
    extension: "Students make a simple paper savings tracker with a box to color in for each week.",
    unpluggedSwap: "Do the math on the whiteboard together instead of using the on-screen calculator, and use Would-You-Rather for the voting round.",
    commonQuestions: [
      { q: "Why save if I can just ask my parents?", a: "Reframe gently toward independence and choice: saving is what lets you decide without asking anyone." },
      { q: "What if the thing I want goes on sale?", a: "Great real-world wrinkle — a sale can be smart if the goal is unchanged, and a trap if it's a brand new want." },
    ],
  },
  "credit-climb": {
    bestGames: ["human-bar-graph", "speed-round"],
    hook: "Ask who would like to borrow $10 from you right now. Then ask how they'd feel if you said they must pay back $12 next week.",
    miniLesson: "Credit is borrowed money you promise to pay back. Interest is the extra you pay for borrowing. Used carefully it's a tool — a car, a house, an education. Used carelessly, the extra piles up faster than people expect.",
    guidedPractice: "Walk through a 'buy now, pay later' offer as a class and work out the true total cost, not just the monthly amount.",
    checkUnderstanding: "Students explain in their own words the difference between the price of something and the true cost when borrowing.",
    extension: "Students find one real advertisement using 'pay later' language and identify what it doesn't say clearly.",
    unpluggedSwap: "Use Red Flag / Green Flag on lending offers instead of the on-screen level board.",
    commonQuestions: [
      { q: "Is credit bad?", a: "No — being careless with it is. Emphasize that it's a tool with a cost you should know before you agree." },
      { q: "What's a credit score?", a: "A number showing how reliably someone repays what they borrow. Keep it simple at this level." },
    ],
  },
  "paycheck-puzzle": {
    bestGames: ["budget-relay", "live-vote"],
    hook: "Write $200 on the board and ask what students would do with a first paycheck that size. Then cross it out and write $170.",
    miniLesson: "Gross pay is what you earn. Net pay — your take-home — is what's left after taxes and deductions. Budget from your net pay, because that's the money that actually arrives.",
    guidedPractice: "Build a paycheck together on the board, removing one deduction at a time and naming what each one funds.",
    checkUnderstanding: "Given an hourly wage and hours worked, students estimate gross pay and a rough take-home figure.",
    extension: "Students list three things in their community that taxes help pay for.",
    unpluggedSwap: "Use paper paycheck-builder sheets and Two Truths and a Myth about taxes.",
    commonQuestions: [
      { q: "Can I get that money back?", a: "Some may come back as a tax refund, but plan around net pay rather than counting on it." },
      { q: "Why is my friend's take-home different?", a: "Deductions vary by benefits and situation. Keep it general and never ask students about family finances." },
    ],
  },
  "smart-shopping": {
    bestGames: ["silent-lineup", "tradeoff-auction"],
    hook: "Hold up two sizes of the same snack and ask which is the better deal — then ask how they'd actually prove it.",
    miniLesson: "Price is what it costs. Value is what you get for that cost. Unit price — the cost per item, ounce, or serving — cuts straight through packaging and marketing.",
    guidedPractice: "Compare three pairs of products as a class, computing unit price for each pair before voting.",
    checkUnderstanding: "Students compute the unit price for one pair on their own and say which they'd buy and why.",
    extension: "Students find the unit price label on a real shelf tag at a store and bring back what they noticed.",
    unpluggedSwap: "Bring empty packages or printed shelf tags and run Silent Line-Up by value.",
    commonQuestions: [
      { q: "Is the bigger size always better?", a: "Only if you'll use it all. Waste turns a 'deal' into a loss — that's the nuance worth landing." },
      { q: "What if the cheap one breaks?", a: "Perfect example of value over price: durability is part of what you're buying." },
    ],
  },
  "fraud-red-flags": {
    bestGames: ["red-flag-green-flag", "two-truths-myth"],
    hook: "Read a real-sounding scam text out loud with total confidence and see how many students believe it before you reveal it's fake.",
    miniLesson: "Scams almost always use the same three moves: they rush you, they ask for private information, and they want it kept secret. Spotting any one of those is your signal to stop.",
    guidedPractice: "Read scenarios aloud; students identify which of the three red flags appears in each one.",
    checkUnderstanding: "Students name all three red flags from memory and say what to do instead of clicking.",
    extension: "Students write their own fake scam message, then trade and spot each other's red flags.",
    unpluggedSwap: "Red Flag / Green Flag cards work perfectly here with no screen at all.",
    commonQuestions: [
      { q: "What if it's really from my bank?", a: "Real institutions don't mind if you hang up and call back on the official number. That's always the safe move." },
      { q: "What if I already clicked?", a: "Tell a trusted adult right away — fast is better than perfect, and nobody should feel embarrassed." },
    ],
  },
  "banking-basics": {
    bestGames: ["speed-round", "card-sort"],
    hook: "Ask where money goes when it's 'in the bank' — take the wildest answers seriously before explaining.",
    miniLesson: "A bank keeps your money safe and tracks it for you. Checking is for everyday spending. Savings is for money you're growing toward a goal, kept a little out of reach on purpose.",
    guidedPractice: "Sort a list of transactions into 'checking' or 'savings' as a class and discuss the close calls.",
    checkUnderstanding: "Students name one thing they'd keep in checking and one in savings, with a reason for each.",
    extension: "Students write three questions they'd ask before opening their first account.",
    unpluggedSwap: "Use the Sort It Out card game with checking and savings mats.",
    commonQuestions: [
      { q: "Is my money safe if the bank closes?", a: "Insured accounts protect deposits up to a limit — keep it reassuring and simple." },
      { q: "Why does the bank pay me interest?", a: "Because they put deposits to work, and they share a little of that with you." },
    ],
  },
  "college-cost-choices": {
    bestGames: ["tradeoff-auction", "live-vote"],
    hook: "Put two schools on the board with wildly different price tags and the same career at the end, and ask which they'd choose before knowing anything else.",
    miniLesson: "The same goal can cost very different amounts. Scholarships, grants, community college, and in-state options all change the math. Loans are real money you repay later with interest, and they shape choices for years.",
    guidedPractice: "Compare two realistic paths side by side, adding up four years of cost and what would be owed at the end.",
    checkUnderstanding: "Students name two ways to lower the cost of education after high school.",
    extension: "Students look up one scholarship they'd actually be eligible for.",
    unpluggedSwap: "Use printed path-comparison sheets and Would-You-Rather between two funding choices.",
    commonQuestions: [
      { q: "Is an expensive school always better?", a: "No. Fit, program, and cost matter more than price. Push back gently on prestige as the deciding factor." },
      { q: "Is college the only option?", a: "Absolutely not — trades, certifications, apprenticeships, and military paths are all legitimate. Say so plainly." },
    ],
  },
  "investing-mythbusters": {
    bestGames: ["two-truths-myth", "speed-round"],
    hook: "Ask who thinks investing is basically gambling. Take the temperature of the room honestly before correcting anything.",
    miniLesson: "Investing puts money to work over time. Risk and return travel together. Compound growth means your earnings start earning too — which is why starting early often beats investing more later.",
    guidedPractice: "Compare two savers on the board: one who starts early and stops, one who starts later and continues. Work out who ends up ahead.",
    checkUnderstanding: "Students explain compound growth in one sentence, in their own words.",
    extension: "Students explain compound growth to someone at home and report back what that person said.",
    unpluggedSwap: "Run Two Truths and a Myth with investing myths, and do the compounding math on the board.",
    commonQuestions: [
      { q: "Can I lose everything?", a: "Any single investment can lose value, which is why spreading money out matters. Keep it honest without being scary." },
      { q: "Do I need a lot of money to start?", a: "No — the myth that it's only for rich adults is exactly what this module busts." },
    ],
  },
};

/* ===================================================================
   GRADE PROFILES
   How delivery actually changes by age. The youngest band is
   picture-first: little reading, lots of showing, drawing, and moving.
   =================================================================== */
const GRADE_PROFILES = {
  "Grades K–2": {
    id: "k2",
    pictureBased: true,
    chunk: 5,
    vocabCount: 2,
    readingLevel: "Pre-reading to early reading — assume students cannot read your slides.",
    attention: "About 5 minutes per activity before they need to move.",
    delivery: [
      "Show pictures instead of words. If a slide has a sentence, read it out loud for them.",
      "Use your whole body — point, act it out, make faces. They copy what they see.",
      "Ask for answers with hands, thumbs, or by moving, not by writing.",
      "Repeat the key idea at least three times in three different ways.",
      "Name one idea for the whole session. Two is too many at this age.",
    ],
    language: [
      "Say 'things we must have' instead of 'necessities'.",
      "Say 'money you keep' instead of 'savings'.",
      "Use one short sentence at a time, then pause.",
    ],
    watchFor: "If they start wiggling, you have about 30 seconds before you lose the room — switch to a moving activity.",
  },
  "Grades 3–5": {
    id: "35",
    pictureBased: false,
    chunk: 8,
    vocabCount: 3,
    readingLevel: "Reading independently — short written prompts are fine.",
    attention: "About 8–10 minutes per activity.",
    delivery: [
      "They can read short prompts, but still read important text aloud.",
      "They love being right — build in a chance for everyone to succeed.",
      "Small groups work well now; give each person a job.",
      "Ask 'why do you think that?' after answers, not just 'is it right?'",
    ],
    language: [
      "You can use real terms — 'savings', 'budget', 'goal' — if you define them once.",
      "Use money amounts they recognize: allowance, birthday money, snack prices.",
    ],
    watchFor: "Watch for the confident kid answering everything. Call on quieter students by name.",
  },
  "Grades 6–8": {
    id: "68",
    pictureBased: false,
    chunk: 12,
    vocabCount: 3,
    readingLevel: "Full reading — written scenarios and worksheets work well.",
    attention: "About 12–15 minutes per activity.",
    delivery: [
      "They care what their friends think — let them discuss in pairs before sharing.",
      "Real numbers and real trade-offs land better than made-up ones.",
      "Do not talk down to them. Treat the content as genuinely useful.",
      "Debate works: give them a side to argue.",
    ],
    language: [
      "Use the real vocabulary throughout — interest, trade-off, net pay.",
      "Connect to things they actually spend on: games, food, clothes, phones.",
    ],
    watchFor: "Never ask what anyone's family earns or spends. Keep every example hypothetical.",
  },
  "Grades 9–12": {
    id: "912",
    pictureBased: false,
    chunk: 15,
    vocabCount: 4,
    readingLevel: "Full reading — realistic documents and figures are appropriate.",
    attention: "About 15–20 minutes per activity.",
    delivery: [
      "Lead with why it matters to them right now — jobs, cars, college, phones.",
      "Let them challenge you. Being questioned is a good sign.",
      "Use real-world documents: a pay stub layout, a loan offer, a price tag.",
      "Give them the actual math, not a simplified version.",
    ],
    language: [
      "Use the vocabulary an adult would use, and define it once.",
      "Be honest about the hard parts — debt, taxes, scams that work.",
    ],
    watchFor: "Some students already work or help with family bills. Never assume, never single anyone out.",
  },
};

/* ===================================================================
   DEVICE GUIDES
   What to actually do differently based on what's in the room.
   =================================================================== */
const DEVICE_GUIDES = {
  none: {
    label: "No devices at all",
    icon: "🙌",
    setup: [
      "Print the take-home cards and any item or scenario cards before you arrive.",
      "Clear enough floor space for students to move between four spots.",
      "Bring tape and a marker for labeling corners or areas.",
      "Write the key idea on the board where everyone can see it all session.",
    ],
    voting: "Students vote by moving — walking to a labeled corner, standing on one side of the room, or raising a hand on the count of three.",
    showing: "Read every scenario out loud, twice. Hold up printed cards so everyone can see.",
    results: "Count the students in each group out loud and write the numbers on the board. That is your class results chart.",
    backup: "This setup has no backup needed — nothing can fail on you.",
  },
  shared: {
    label: "One shared screen",
    icon: "📺",
    setup: [
      "Open the module on the shared screen before students arrive and test that it displays.",
      "Stand where you can see both the screen and the students' faces.",
      "Still print the take-home cards — those go home with students.",
      "Have a marker ready in case the screen fails.",
    ],
    voting: "Read the scenario off the screen, take a show of hands for each option, then tap the answer so the reveal does the teaching.",
    showing: "The screen shows the scenario and the reveal. Read it aloud anyway — do not assume everyone can see or read it.",
    results: "The class results bar chart appears on screen. Ask a student from each option to explain their thinking.",
    backup: "If the screen fails, switch to Four Corners — you have the scenario in your notes and it works with nothing.",
  },
  // The Workshop Builder offers two choices: no devices, or devices (a
  // screen in the room and/or students' own devices). Older links that
  // say "shared" or "personal" open as "devices".
  devices: {
    label: "Devices in the room",
    icon: "📺",
    setup: [
      "Open the plan's game on the room's screen (or your laptop) before students arrive and check it displays.",
      "If students have their own devices, write the play-along link on the board.",
      "Stand where you can see both the screen and the students' faces.",
      "Print the take-home cards, and the answer cards as a backup.",
    ],
    voting: "Read each round aloud. Students vote with hands, or on their own device with the play-along link. Tap one answer on the screen for every vote you count, then tap Reveal.",
    showing: "The screen shows the question and answer pictures. Read it aloud anyway — do not assume everyone can see or read it.",
    results: "The bars on the screen show how the class voted. Ask a student from each answer to explain their thinking.",
    backup: "If the screen fails, switch to the printed answer cards — the script has every question.",
  },
  personal: {
    label: "Students have devices",
    icon: "📱",
    setup: [
      "Confirm the room's wifi actually works before the session starts.",
      "Write the link and room code on the board where everyone can see it.",
      "Have a plan for students without a working device — pair them up.",
      "Print the take-home cards regardless.",
    ],
    voting: "Students open the link and vote on their own device. Give a 30-second warning before the timer ends.",
    showing: "Everyone sees the scenario on their own screen, but read it aloud too so nobody falls behind.",
    results: "Results update live. Point out that nobody can see who voted for what — it is anonymous.",
    backup: "Devices fail more often than anything else. Know which unplugged game you would switch to.",
  },
};

/* ===================================================================
   PICTURE-BASED ACTIVITIES (K–2)
   Swaps that need no reading at all.
   =================================================================== */
const PICTURE_ACTIVITIES = [
  {
    name: "Point to the picture",
    how: "Hold up two pictures. Ask the question out loud. Students point at their answer instead of saying or writing it.",
  },
  {
    name: "Thumbs up / thumbs down",
    how: "Say a statement out loud. Thumbs up means yes or need, thumbs down means no or want. Everyone answers at once, so nobody copies.",
  },
  {
    name: "Draw your answer",
    how: "Give each student paper. Instead of writing, they draw the thing they would choose. Then a few share their drawing.",
  },
  {
    name: "Act it out",
    how: "Two volunteers act out the choice while the class watches, then the class votes on what the characters should do.",
  },
  {
    name: "Sorting mat with pictures",
    how: "Two hoops or paper mats on the floor with a picture label on each. Students place picture cards into the right one.",
  },
  {
    name: "Move to the picture",
    how: "Tape a large picture in each corner. Students walk to the picture that matches their answer.",
  },
];

/* ===================================================================
   LESSON GENERATOR
   Assembles a complete, timed lesson plan from a module's core data,
   its lesson pack, and games that fit the room's device situation.
   =================================================================== */
function buildLessonPlan(moduleId, opts) {
  opts = opts || {};
  var minutes = Number(opts.minutes) || 30;
  var devices = opts.devices === "shared" || opts.devices === "personal" ? "devices" : opts.devices || "none"; // "none" | "devices"
  var grade = opts.grade || "Grades 3–5";
  var groupSize = opts.groupSize || "Whole class";

  // A module, or one of the extra topics written from trusted sources.
  var mod = findTopic(moduleId);
  if (!mod) return null;
  var pack = LESSON_PACKS[moduleId] || mod.pack || {};

  // How this age group learns, and what the room's technology changes.
  var profile = GRADE_PROFILES[grade] || GRADE_PROFILES["Grades 3–5"];
  var deviceGuide = DEVICE_GUIDES[devices] || DEVICE_GUIDES.none;
  var picture = !!profile.pictureBased;

  // Which games are usable in this room?
  var allowed = devices === "none" ? ["none"]
    : ["none", "shared", "personal"];
  var usableGames = GAME_FORMATS.filter(function (g) {
    return allowed.indexOf(g.devices) >= 0;
  });

  // Rank every usable game by how well it fits this topic, age group,
  // group size, room and time, then take the best. A volunteer can swap
  // to another game (opts.game), and the plan rebuilds around it.
  var ranked = rankGames(usableGames, {
    bestGames: pack.bestGames || [],
    moduleId: moduleId,
    gradeId: profile.id,
    groupSize: groupSize,
    devices: devices,
    gameBudget: Math.max(minutes - 12, 8),
  });
  var mainGame = null;
  for (var gi = 0; gi < ranked.length; gi++) {
    if (ranked[gi].id === opts.game) { mainGame = ranked[gi]; break; }
  }
  mainGame = mainGame || ranked[0];
  var alternatives = ranked.filter(function (g) { return g !== mainGame; }).slice(0, 2);
  // A second, shorter option if there's room in the schedule.
  var extraGame = ranked.filter(function (g) {
    return g !== mainGame && g.minutes <= 10;
  })[0];

  // Build the timed sequence, scaled to the requested length.
  // `how` is the concrete do-this-now instruction, tailored to the grade
  // and to what technology is actually in the room.
  var steps = [];
  function add(name, mins, what, script, how) {
    steps.push({ name: name, minutes: mins, what: what, script: script || "", how: how || "" });
  }

  var short = minutes <= 20;
  var long = minutes >= 45;
  var vocabList = ((mod.prep && mod.prep.vocab) || []).slice(0, profile.vocabCount);

  add("Welcome & hook", short ? 3 : 5,
    pack.hook || "Open with a question that connects the topic to the students' own lives.",
    mod.prep && mod.prep.openingScript,
    picture
      ? "Hold up an object or a picture rather than explaining. Ask the question out loud and let them answer by pointing or with thumbs up and down. Do not put any text on screen."
      : "Ask the question and wait a full five seconds before taking answers. The silence is uncomfortable but it gets more hands up.");

  add("Mini-lesson", short ? 4 : 7,
    pack.miniLesson || mod.summary,
    "",
    picture
      ? "Say the one big idea in a single short sentence, then say it again two more ways. Draw it on the board as a simple picture. No slides full of words — they cannot read them yet."
      : deviceGuide.showing);

  if (!short) {
    add("Key vocabulary", 4,
      "Teach the words students need: " + vocabList.map(function (v) { return v.term; }).join(", ") + ".",
      "",
      picture
        ? "Teach only " + profile.vocabCount + " words. For each one: say it, draw it, have the class say it back and make a hand motion for it. The motion is what they will remember."
        : "Say each word, give the plain-English meaning, then ask for an example from their own life before moving on.");
  }

  // The ready-to-play game for this topic and age group (game-bank.js).
  var topicGame = buildTopicGame(moduleId, profile.id);

  if (mainGame) {
    // The game's own version for this age group, when it has one.
    var fit = mainGame.levels && mainGame.levels[profile.id];
    var forGrade = fit ? "For " + grade + ": " + fit + " " : "";
    // Multi-round games bring their own rounds and cards, so the module's
    // unplugged swap and the room's voting method would contradict them.
    var swap = !mainGame.multiRound && devices === "none" && pack.unpluggedSwap;
    // Single-question formats get their questions from the topic game.
    var useRounds = !mainGame.multiRound && topicGame && topicGame.rounds.length;
    add("Main activity — " + mainGame.name, mainGame.minutes,
      mainGame.summary + (swap ? " " + pack.unpluggedSwap : "") +
        (useRounds ? " Questions: use the " + topicGame.rounds.length + " rounds of \"" + topicGame.title.replace(/^\S+ /, "") +
          "\" below" + (devices === "none" ? " (print the game cards)." : " (play them on screen).") : ""),
      "",
      mainGame.multiRound
        ? forGrade + "Full rules and printable cards: Games → " + mainGame.name + "."
        : (forGrade || (picture ? "Picture version: " + PICTURE_ACTIVITIES[0].how + " " : "")) + deviceGuide.voting);
  }

  add("Guided practice", short ? 4 : 6,
    pack.guidedPractice || "Work through an example together as a class.",
    "",
    picture
      ? "Do it together on the board with drawings, not words. Ask the class to tell you where each picture goes — you hold the marker, they make the decisions."
      : "Do the first one together, the second one in pairs, the third one on their own. Release it gradually.");

  if (long && extraGame) {
    add("Second activity — " + extraGame.name, extraGame.minutes, extraGame.summary, "",
      picture ? "Keep this one physical — moving, sorting, or acting. By now they need to be out of their seats." : deviceGuide.voting);
  }
  if (long) {
    add("Extension", 6,
      pack.extension || "Give students a challenge that stretches the idea further.", "",
      picture ? "Give them paper and let them draw it. Drawing is how this age shows you what they understood." : "For students who finish early, ask them to explain it to someone who was not paying attention.");
  }

  add("Check for understanding", short ? 3 : 5,
    pack.checkUnderstanding || "Confirm every student can state the key idea.",
    "",
    picture
      ? "Ask the one big idea as a thumbs up or thumbs down question, or have them point to the right picture. Do not ask them to write anything."
      : "Ask every student to answer, not just volunteers — a quick go-round, a written exit ticket, or the anonymous confidence tap.");

  add("Wrap-up & take-home", short ? 3 : 5,
    "Hand out the take-home card: \"" + (mod.takeHome && mod.takeHome.title) + "\". Family question: " +
    (mod.takeHome && mod.takeHome.familyQuestion),
    "",
    picture
      ? "Show the card and point to each box so they know what goes where. Tell them the drawing part is the homework — a grown-up can do the writing."
      : "Read the family question aloud and tell them who to ask at home. Say the one big idea one last time as they leave.");

  // Fit the plan to the time actually available. A volunteer with a hard
  // 15-minute slot has 15 minutes, so scale the steps to match rather than
  // handing them a plan that overruns. Every step keeps at least 2 minutes.
  var total = steps.reduce(function (sum, s) { return sum + s.minutes; }, 0);
  if (total > minutes) {
    var floorTotal = steps.length * 2;
    if (minutes > floorTotal) {
      // Shrink everything above the 2-minute floor proportionally.
      var slack = total - floorTotal;
      var keep = minutes - floorTotal;
      steps.forEach(function (s) {
        s.minutes = 2 + Math.round((s.minutes - 2) * (keep / slack));
      });
    } else {
      // Asked for less time than the plan's minimum — give every step the floor.
      steps.forEach(function (s) { s.minutes = 2; });
    }
    // Rounding can leave the total a minute or two off; settle it on the
    // longest step so the numbers add up to what the plan claims.
    total = steps.reduce(function (sum, s) { return sum + s.minutes; }, 0);
    var drift = total - minutes;
    if (drift !== 0) {
      var longest = steps.slice().sort(function (a, b) { return b.minutes - a.minutes; })[0];
      if (longest && longest.minutes - drift >= 2) longest.minutes -= drift;
    }
    total = steps.reduce(function (sum, s) { return sum + s.minutes; }, 0);
  }
  // A plan that comes in short gives the spare minutes to the main
  // activity (more rounds, more discussion), so it fills the slot exactly.
  if (total < minutes) {
    var roomy = steps.filter(function (s) { return s.name.indexOf("Main activity") === 0; })[0] ||
      steps.filter(function (s) { return s.name === "Guided practice"; })[0];
    if (roomy) {
      roomy.minutes += minutes - total;
      total = minutes;
    }
  }

  // Group-size guidance.
  var groupTips = {
    "Whole class": "Keep every activity as one group. Use call-and-response and whole-room movement so nobody hides at the back.",
    "Small groups": "Groups of three or four. Give each person a job — reader, recorder, reporter, timekeeper — or one student does everything.",
    "Pairs": "Pairs mean nobody sits out. Have partners agree on an answer before sharing, so the quiet one has already spoken once.",
    "One-on-one": "Go at their pace and let them lead. Ask more questions than you answer.",
  };

  // Word-for-word lines and step-by-step actions for every step.
  writeScripts(steps, {
    mod: mod, pack: pack, picture: picture, devices: devices, gradeId: profile.id,
    vocab: vocabList, mainGame: mainGame, extraGame: extraGame, topicGame: topicGame,
  });

  return {
    module: mod,
    pack: pack,
    grade: grade,
    groupSize: groupSize,
    groupTip: groupTips[groupSize] || "",
    devices: devices,
    deviceGuide: deviceGuide,
    profile: profile,
    pictureBased: picture,
    pictureActivities: picture ? PICTURE_ACTIVITIES : [],
    requestedMinutes: minutes,
    totalMinutes: total,
    steps: steps,
    games: usableGames,
    mainGame: mainGame,
    alternatives: alternatives,
    topicGame: topicGame,
    materials: (mainGame ? mainGame.materials : []).concat(
      devices === "none" ? ["Printed take-home cards"] : ["Screen or projector", "Printed take-home cards"]
    ).concat(picture ? ["Picture cards or printed images", "Paper and crayons for drawing"] : []),
  };
}

/* ===================================================================
   SCRIPTS
   Gives every step `say` (lines to say out loud, word for word) and
   `do` (what to do, in order). Main activities using the topic game also
   get `rounds`: a say/do script for each round. Everything comes from the
   module or topic content, so editing data.js / game-bank.js updates it.
   =================================================================== */
function writeScripts(steps, c) {
  var mod = c.mod, pack = c.pack, pic = c.picture;
  var reveal = mod.reveal || {};
  var big = reveal.keyConcept || mod.title;
  // Pre-readers get the plain half of "Term — plain words" key concepts.
  if (pic && big.indexOf(" — ") > 0) big = big.split(" — ")[1];
  big = big.charAt(0).toUpperCase() + big.slice(1);
  var letters = "ABCD";
  function first(text) {
    var m = String(text || "").match(/^.*?[.!?](\s|$)/);
    return m ? m[0].trim() : String(text || "");
  }
  // How students answer in this room, as an instruction.
  var voteDo = pic
    ? "Students point to the picture they pick (or walk to it). Count the hands for each picture out loud."
    : c.devices === "none"
      ? "Students vote with their bodies: walk to a corner, or hold up 1–4 fingers on the count of three. Count each answer out loud."
      : "Students vote with hands (or on their own devices with the play-along link). Tap the answer on the screen once for every vote you count, then tap Reveal.";

  function roundScript(r, i) {
    var opts = r.opts.map(function (o, k) { return (pic ? "" : letters[k] + ": ") + o[1]; });
    var ans = r.best < 0 ? null : r.opts[r.best][1];
    return {
      say: [
        "Round " + (i + 1) + ". " + r.q,
        pic ? "Is it… " + opts.join("… or… ") + "?" : opts.join(". ") + ".",
        pic ? "Point to your answer in three, two, one… go!" : "Think for five seconds. Ready? Vote in three, two, one… go!",
      ],
      do: [voteDo, "Ask one student who picked each answer: \"Why did you pick that?\""],
      answer: (ans ? "The answer is " + ans + "! " : "Any answer is OK! ") + r.why,
    };
  }

  steps.forEach(function (s) {
    var n = s.name;
    if (n === "Welcome & hook") {
      s.say = [s.script || "Hi everyone! Today we're going to talk about " + mod.title.toLowerCase() + "."];
      s.script = "";
      s.do = [
        "Stand at the front where everyone can see you. Smile and wait for quiet before you start.",
        pack.hook || "Ask a question that connects the topic to their own lives.",
        pic ? "Take answers with thumbs up or down, or by pointing. No writing." : "Wait five full seconds, then take 2–3 answers.",
        "Say: \"Great thinking! That's exactly what we're talking about today.\"",
      ];
    } else if (n === "Mini-lesson") {
      var idea = pack.miniLesson || mod.summary;
      s.say = pic
        ? [first(idea), "Let's say it together: " + big + "!", "One more time, nice and loud: " + big + "!"]
        : [idea, "So here's the big idea for today: " + big + "."];
      s.do = [
        pic ? "Draw the idea as a simple picture on the board while you talk." : "Write the big idea on the board: \"" + big + "\".",
        "Ask: \"Who can say that back to me in their own words?\" Take 2 answers.",
        pic ? "Point to your drawing every time you say the big idea." : "Leave it on the board for the rest of the session.",
      ];
    } else if (n === "Key vocabulary") {
      s.say = c.vocab.map(function (v) {
        return pic
          ? "Our word is " + v.term + ". Say it with me: " + v.term + "! It means " + v.def.charAt(0).toLowerCase() + v.def.slice(1)
          : v.term + ": " + v.def + " Who can give me an example?";
      });
      s.do = pic
        ? ["For each word: say it, draw it on the board, and have the class say it back.", "Make up a hand motion for each word and have everyone copy it."]
        : ["Write each word on the board as you say it.", "Take one example from a student for each word before moving on."];
    } else if (n.indexOf("Main activity") === 0 && c.mainGame) {
      var g = c.mainGame;
      var rounds = c.topicGame && !g.multiRound ? c.topicGame.rounds : [];
      s.say = [
        "Now it's game time! We're going to play " + g.name + ".",
        rounds.length
          ? "I'll ask a question, you pick an answer, and then we'll find out the answer together. Ready?"
          : "Here's how it works. Listen carefully!",
      ];
      var level = g.levels && g.levels[c.gradeId];
      s.do = (level ? ["Make it fit this age group: " + level] : []).concat((g.howToPlay || []).map(function (h) {
        // The rounds below replace the module's single scenario.
        return rounds.length && /scenario/i.test(h) ? "Read the round's question and answers out loud (word for word below)." : h;
      }));
      if (rounds.length) {
        s.do.push("Use the " + rounds.length + " rounds below as the questions. After each vote, read the answer line out loud.");
        s.rounds = rounds.map(roundScript);
      }
      s.do.push("At the end, ask: \"" + ((g.debrief || [])[0] || "What did you learn from this game?") + "\"");
    } else if (n === "Guided practice") {
      var ch = mod.challenge;
      if (ch && !pic) {
        s.say = [
          "Let's try one together. " + ch.scenario,
          ch.options.map(function (o, k) { return letters[k] + ": " + o; }).join(". ") + ".",
          "Turn to a partner and pick one. You have 30 seconds.",
          "The best answer is " + (reveal.bestAnswer || letters[ch.best]) + ". " + (reveal.why || ""),
        ];
      } else {
        s.say = [
          "Let's do one together. I'll draw, and you tell me what to do.",
          "Remember our big idea: " + big + ".",
          reveal.discussionPrompt ? (pic ? first(reveal.discussionPrompt) : reveal.discussionPrompt) : "Who can give me an example?",
        ];
      }
      s.do = [
        pack.guidedPractice || "Work through an example together on the board.",
        pic ? "You hold the marker. Students give the answers by pointing or with thumbs." : "Do the first example together, the next one in pairs.",
        reveal.commonTrap ? "Watch for this mistake: " + reveal.commonTrap + "." : "Praise good reasons, not just right answers.",
      ];
    } else if (n.indexOf("Second activity") === 0 && c.extraGame) {
      s.say = ["Let's get moving with one more game: " + c.extraGame.name + "!"];
      s.do = (c.extraGame.howToPlay || []).slice();
    } else if (n === "Extension") {
      var ext = pack.extension || "Students explain today's idea to someone who missed it.";
      s.say = ["Here's a challenge for you: " + ext.replace(/^Students /, "").replace(/\.$/, "") + "."];
      s.do = [
        pic ? "Hand out paper and crayons. Walk around and ask each student to tell you about their drawing." : "Give them 4 minutes, then ask 2–3 students to share.",
        "Don't collect anything with names on it. Students keep their work.",
      ];
    } else if (n === "Check for understanding") {
      s.say = pic
        ? ["Thumbs up if this is true: " + big + "!", "Show me again: thumbs up if you will use this at home!"]
        : [
          "Quick check. Finish this sentence for your partner: \"Today I learned that…\"",
          reveal.applyIt || "Tell me one way you'll use this idea this week.",
          "Hold up one to five fingers: how sure do you feel about today's idea?",
        ];
      s.do = [
        pack.checkUnderstanding || "Make sure every student can say the big idea.",
        "Look around the whole room, not just the front. If lots of thumbs or fingers are low, say the big idea again with a new example.",
      ];
    } else if (n === "Wrap-up & take-home") {
      var th = mod.takeHome || {};
      s.say = [
        "You all did amazing today! Remember: " + big + ".",
        "This card is called \"" + (th.title || "Take-home") + "\". Take it home and ask a grown-up: \"" + (th.familyQuestion || "") + "\"",
        "Thank you for being such great money thinkers!",
      ];
      s.do = [
        "Hand out the take-home cards.",
        pic ? "Hold up a card and point to each box so they know what goes where. The drawing is their part; a grown-up can do the writing." : "Read the family question out loud once more.",
        "Thank the teacher. Leave the room as tidy as you found it.",
      ];
    }
  });
}

/* Modules a game suits: its own `topics`, plus any lesson pack that lists
   it in `bestGames`. Only modules that exist in this edition count. */
function gameTopics(g) {
  var ids = (g.topics || []).slice();
  Object.keys(LESSON_PACKS).forEach(function (mid) {
    if ((LESSON_PACKS[mid].bestGames || []).indexOf(g.id) >= 0 && ids.indexOf(mid) < 0) ids.push(mid);
  });
  return MODULES.filter(function (m) { return ids.indexOf(m.id) >= 0; });
}

/* Score games for a plan, best first. Ties keep the GAME_FORMATS order.
   ctx: { bestGames, moduleId, gradeId, groupSize, devices, gameBudget } */
function rankGames(games, ctx) {
  // Discussion-heavy games ask too much of pre-readers; teens like them.
  var talky = ["story-circle", "two-truths-myth", "would-you-rather"];
  function score(g) {
    var s = 0;
    s += g.minutes <= ctx.gameBudget ? 3 : -5;
    var best = ctx.bestGames.indexOf(g.id);
    if (best >= 0) s += 6 - best;
    else if (g.topics && g.topics.indexOf(ctx.moduleId) >= 0) s += 4;
    // If the room has a screen, use it.
    if (ctx.devices !== "none" && g.devices !== "none") s += 2;
    if (ctx.gradeId === "k2") {
      if (g.energy === "High") s += 2;
      else if (g.energy === "Medium") s += 1;
      if (g.id === "story-circle" || g.id === "two-truths-myth") s -= 4;
    } else if (ctx.gradeId === "912") {
      if (talky.indexOf(g.id) >= 0) s += 1;
    }
    var grp = g.group || "";
    if (ctx.groupSize === "Whole class" && /whole class/i.test(grp)) s += 2;
    if (ctx.groupSize === "Small groups" && /groups|teams/i.test(grp)) s += 2;
    if (ctx.groupSize === "Pairs" && /pairs/i.test(grp)) s += 2;
    if (ctx.groupSize === "One-on-one") {
      if (/pairs/i.test(grp)) s += 1;
      if (/teams|groups of|circle/i.test(grp)) s -= 2;
    }
    return s;
  }
  return games
    .map(function (g, i) { return { g: g, s: score(g), i: i }; })
    .sort(function (a, b) { return b.s - a.s || a.i - b.i; })
    .map(function (x) { return x.g; });
}

/* Plain-text game sheet for printing: rules, age versions, cards. */
function gameToText(g) {
  var names = [["k2", "Grades K–2"], ["35", "Grades 3–5"], ["68", "Grades 6–8"], ["912", "Grades 9–12"]];
  var lines = [
    "MONEY READY GAME SHEET",
    g.emoji + " " + g.name + " | " + g.minutes + " min | " + g.group + " | " +
      (g.devices === "none" ? "No devices needed" : "Uses a screen"),
    "",
    g.summary,
  ];
  if (g.reinforces) lines.push("", "REINFORCES: " + g.reinforces);
  var topics = gameTopics(g);
  if (topics.length) lines.push("FITS THESE TOPICS: " + topics.map(function (m) { return m.title; }).join(", "));
  lines.push("", "MATERIALS");
  g.materials.forEach(function (x) { lines.push("[ ] " + x); });
  lines.push("", "HOW TO PLAY");
  g.howToPlay.forEach(function (x, i) { lines.push((i + 1) + ". " + x); });
  lines.push("", "TEEN TIP: " + g.teenTip);
  if (g.levels) {
    lines.push("", "MAKE IT FIT YOUR AGE GROUP");
    names.forEach(function (n) { if (g.levels[n[0]]) lines.push("- " + n[1] + ": " + g.levels[n[0]]); });
  }
  if (g.debrief) {
    lines.push("", "QUESTIONS TO CLOSE WITH");
    g.debrief.forEach(function (q) { lines.push("- " + q); });
  }
  if (g.access) lines.push("", "EVERYONE CAN PLAY: " + g.access);
  if (g.cards) {
    lines.push("", "=".repeat(48), g.cards.title.toUpperCase(), "=".repeat(48), "Cut along the lines.");
    g.cards.items.forEach(function (c) { lines.push("", "- - - - - - - - - - - - - - - - - - - - - - - -", c); });
  }
  lines.push("", "Educational only. Not financial advice. No personal data collected.");
  return lines.join("\n");
}

/* Plain-text game cards for a topic game: one card per round, with the
   answer and source on the back, for rooms with no screen. */
function topicGameToText(game) {
  var lines = [
    "GAME CARDS: " + game.title.toUpperCase(),
    game.rounds.length + " rounds. Read the question aloud, students vote, then read the answer.",
  ];
  game.rounds.forEach(function (r, i) {
    var src = roundSource(r, game.topic);
    lines.push("", "- - - - - - - - - - - - - - - - - - - - - - - -", "ROUND " + (i + 1) + ": " + r.q);
    r.opts.forEach(function (o, k) { lines.push("  " + String.fromCharCode(65 + k) + ". " + o[0] + " " + o[1]); });
    lines.push("  ANSWER: " + (r.best < 0 ? "Any answer is OK." : String.fromCharCode(65 + r.best) + ". " + r.opts[r.best][1]) + " " + r.why);
    if (src) lines.push("  Source: " + src.name + (src.url ? " (" + src.url + ")" : ""));
  });
  return lines.join("\n");
}

/* Plain-text version of a whole plan and packet, for downloading. */
function planToText(plan, packet) {
  var m = plan.module;
  var lines = [
    "MONEY READY WORKSHOP PLAN",
    m.title + " | " + plan.grade + " | " + plan.totalMinutes + " min | " + plan.deviceGuide.label + " | " + plan.groupSize,
    "",
    "LEARNING OBJECTIVE: " + m.objective,
    "",
    "RUN OF SHOW",
  ];
  plan.steps.forEach(function (s) {
    lines.push("", s.minutes + " min  " + s.name, "  " + s.what);
    if (s.script) lines.push("  Say this: " + s.script);
    (s.say || []).forEach(function (l, i) { lines.push((i ? "           " : "  SAY:     ") + "\"" + l + "\""); });
    (s.do || []).forEach(function (l, i) { lines.push("  DO " + (i + 1) + ".    " + l); });
    (s.rounds || []).forEach(function (r, i) {
      lines.push("  ROUND " + (i + 1) + ":");
      r.say.forEach(function (l) { lines.push("    Say: \"" + l + "\""); });
      r.do.forEach(function (l) { lines.push("    Do:  " + l); });
      lines.push("    Then say: \"" + r.answer + "\"");
    });
    if (s.how) lines.push("  Tip: " + s.how);
  });
  lines.push("", "MATERIALS");
  plan.materials.forEach(function (x) { lines.push("[ ] " + x); });
  if (plan.topicGame) lines.push("", "=".repeat(48), topicGameToText(plan.topicGame));
  packet.forEach(function (it) {
    lines.push("", "=".repeat(48), it.title.toUpperCase(), "=".repeat(48), it.body);
  });
  lines.push("", "Educational only. Not financial advice. No personal data collected.");
  return lines.join("\n");
}

/* Build the full workshop packet — the pieces a volunteer needs around the
   lesson itself. Combined into the same builder as the lesson plan. */
function buildPacket(plan) {
  var m = plan.module;
  var grade = plan.grade;
  var picture = plan.pictureBased;
  return [
    {
      ico: "🖼", title: "Lesson deck outline", sub: "Slides for " + m.title + " (" + grade + ")",
      body: "Slide 1 — Title: " + m.title +
        "\nSlide 2 — " + (picture ? "Big picture, no words. Ask the hook question out loud." : "Big question / hook") +
        "\nSlide 3 — Key vocabulary: " + ((m.prep && m.prep.vocab) || []).slice(0, plan.profile.vocabCount).map(function (v) { return v.term; }).join(", ") +
        (picture ? " (one picture per word, no definitions on screen)" : "") +
        "\nSlide 4 — Scenario challenge" + (picture ? " as a picture with the question read aloud" : "") +
        "\nSlide 5 — " + (plan.devices === "none" ? "Vote by moving to a corner (no slide needed)" : "Group vote") +
        "\nSlide 6 — Reveal: " + m.reveal.keyConcept +
        "\nSlide 7 — Discussion: " + m.reveal.discussionPrompt +
        "\nSlide 8 — Take-home + thank you",
    },
    {
      ico: "📝", title: "Practice notes", sub: "Opening script, timing, and delivery tips",
      body: "OPENING SCRIPT:\n" + (m.prep && m.prep.openingScript) +
        "\n\nRUN OF SHOW:\n" + plan.steps.map(function (s) { return "  " + s.minutes + " min — " + s.name; }).join("\n") +
        "\n\nDELIVERY FOR " + grade.toUpperCase() + ":\n" + plan.profile.delivery.map(function (d) { return "  • " + d; }).join("\n") +
        "\n\nWATCH FOR:\n  " + plan.profile.watchFor,
    },
    {
      ico: "✉️", title: "Parent letter", sub: "Friendly heads-up for families",
      body: "Dear Families,\n\nThis week your student took part in a short, fun financial-literacy workshop on \"" +
        m.title + "\" led by trained teen volunteers. The goal: " + m.objective.toLowerCase() +
        "\n\nAsk them about it! A take-home card came home with a simple family question. Everything is educational only and privacy-safe — no personal data is collected.\n\nWith appreciation,\nThe Money Ready volunteer team",
    },
    {
      ico: "🏫", title: "Administrator packet", sub: "One-page overview for school leaders",
      body: "MONEY READY — WORKSHOP OVERVIEW (proposed pilot, pending approval)\nTopic: " + m.title +
        "\nGrade band: " + grade + "\nLength: " + plan.totalMinutes + " min\nObjective: " + m.objective +
        "\nFormat: teen-led, interactive (challenge → vote → reveal → discuss → take-home)" +
        "\nTechnology required: " + plan.deviceGuide.label +
        (m.extraTopic && plan.topicGame ? "\nContent sources: " + plan.topicGame.sources.map(function (x) { return x.name; }).join("; ") : "") +
        "\nPrivacy: educational only; no student data collected.",
    },
    {
      ico: "✅", title: "Event checklist", sub: "Day-of run of show",
      body: "BEFORE:\n" + plan.deviceGuide.setup.map(function (x) { return "[ ] " + x; }).join("\n") +
        "\n[ ] Rehearse the opening script out loud\n[ ] " + (m.extraTopic ? "Open the topic game: " : "Load module: ") + m.title +
        "\nDURING:\n" + plan.steps.map(function (s) { return "[ ] " + s.name + " (" + s.minutes + " min)"; }).join("\n") +
        "\nAFTER:\n[ ] Thank the class and the teacher\n[ ] Note what went well on the reflection page",
    },
    {
      ico: "🗒", title: "Sign-up form", sub: "Volunteer roles (no personal data stored here)",
      body: "WORKSHOP SIGN-UP — " + m.title + " (" + grade + ")\nRole 1: Lead facilitator\nRole 2: Co-facilitator / vote counter\nRole 3: Materials + take-home cards\nRole 4: Timekeeper\n(Names collected offline by the coordinator, not stored in this app.)",
    },
    {
      ico: "🔄", title: "Post-event reflection", sub: "Quick, privacy-safe wrap-up",
      body: "REFLECTION (aggregate only — no names):\n- Students reached (count): ____\n- What worked well: ____\n- What to change next time: ____\n- Confidence check average (1–5): ____\n- One story worth sharing: ____",
    },
  ];
}
