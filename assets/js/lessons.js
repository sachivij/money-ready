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
  },
];

/* ===================================================================
   LESSON PACKS
   Extra teaching content for each module, beyond the core workshop.
   The generator assembles these into a lesson plan of any length.
   =================================================================== */
const LESSON_PACKS = {
  "opportunity-costs": {
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
  var devices = opts.devices || "none"; // "none" | "shared" | "personal"
  var grade = opts.grade || "Grades 3–5";
  var groupSize = opts.groupSize || "Whole class";

  var mod = null;
  for (var i = 0; i < MODULES.length; i++) {
    if (MODULES[i].id === moduleId) { mod = MODULES[i]; break; }
  }
  if (!mod) return null;
  var pack = LESSON_PACKS[moduleId] || {};

  // How this age group learns, and what the room's technology changes.
  var profile = GRADE_PROFILES[grade] || GRADE_PROFILES["Grades 3–5"];
  var deviceGuide = DEVICE_GUIDES[devices] || DEVICE_GUIDES.none;
  var picture = !!profile.pictureBased;

  // Which games are usable in this room?
  var allowed = devices === "none" ? ["none"]
    : devices === "shared" ? ["none", "shared"]
    : ["none", "shared", "personal"];
  var usableGames = GAME_FORMATS.filter(function (g) {
    return allowed.indexOf(g.devices) >= 0;
  });

  // Pick a main activity, preferring one that fits the time available.
  var mainGame = usableGames.filter(function (g) { return g.minutes <= Math.max(minutes - 12, 8); })[0] || usableGames[0];
  // A second, calmer option if there's room in the schedule.
  var extraGame = usableGames.filter(function (g) {
    return g.id !== (mainGame && mainGame.id) && g.minutes <= 10;
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

  if (mainGame) {
    add("Main activity — " + mainGame.name, mainGame.minutes,
      mainGame.summary + (devices === "none" && pack.unpluggedSwap ? " " + pack.unpluggedSwap : ""),
      "",
      (picture ? "Picture version: " + PICTURE_ACTIVITIES[0].how + " " : "") + deviceGuide.voting);
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

  // Group-size guidance.
  var groupTips = {
    "Whole class": "Keep every activity as one group. Use call-and-response and whole-room movement so nobody hides at the back.",
    "Small groups": "Groups of three or four. Give each person a job — reader, recorder, reporter, timekeeper — or one student does everything.",
    "Pairs": "Pairs mean nobody sits out. Have partners agree on an answer before sharing, so the quiet one has already spoken once.",
    "One-on-one": "Go at their pace and let them lead. Ask more questions than you answer.",
  };

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
    materials: (mainGame ? mainGame.materials : []).concat(
      devices === "none" ? ["Printed take-home cards"] : ["Screen or projector", "Printed take-home cards"]
    ).concat(picture ? ["Picture cards or printed images", "Paper and crayons for drawing"] : []),
  };
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
        "\nPrivacy: educational only; no student data collected.",
    },
    {
      ico: "✅", title: "Event checklist", sub: "Day-of run of show",
      body: "BEFORE:\n" + plan.deviceGuide.setup.map(function (x) { return "[ ] " + x; }).join("\n") +
        "\n[ ] Rehearse the opening script out loud\n[ ] Load module: " + m.title +
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
