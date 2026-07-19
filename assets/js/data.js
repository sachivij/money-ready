/*
 * data.js — Content for the Money Ready Virginia Interactive Toolkit
 * -----------------------------------------------------------------
 * ALL teaching content lives here so a student or educator can review
 * and edit it WITHOUT touching app logic.
 *
 * EDUCATIONAL ONLY. Built around existing financial-literacy topics.
 * Nothing here collects or requires personal data.
 *
 * Each module has:
 *   card fields  -> shown on the Module Library cards
 *   objective    -> the learning objective
 *   interactive  -> the interactive elements a static lesson becomes
 *   challenge    -> a Student Challenge scenario (4 options, best answer)
 *   reveal       -> the satisfying Reveal after students answer
 *   takeHome     -> a fridge-friendly, printable take-home card
 *   prep         -> everything a teen volunteer needs to prep & practice
 */

const MODULES = [
  {
    id: "needs-vs-wants",
    title: "Needs vs. Wants",
    emoji: "🧺",
    gradeBand: "Grades 2–5",
    minutes: 30,
    keyConcept: "Needs, wants & tradeoffs",
    activityType: "Scenario + group vote",
    color: "green",
    materials: ["Slides", "Group-vote screen", "Exit ticket", "Take-home card"],
    summary:
      "The building block of every money decision — telling needs from wants, and noticing the tradeoffs in between.",
    objective:
      "Students can distinguish needs, wants, and tradeoffs.",
    interactive: [
      "Scenario challenge",
      "Group vote",
      "Reveal screen",
      "Discussion prompt",
      "Take-home reflection",
      "Exit ticket",
    ],
    challenge: {
      scenario:
        "You have $25. You need lunch tomorrow, want a new game skin, and promised to save $5. What do you do?",
      options: [
        "Buy the game skin now",
        "Save $5 first, then plan lunch",
        "Spend all $25 and figure it out later",
        "Ask a friend to pay for lunch",
      ],
      best: 1,
      timerSeconds: 30,
      round: 1,
    },
    reveal: {
      bestAnswer: "B. Save $5 first, then plan lunch",
      why:
        "Paying yourself first protects your promise to save, and lunch is a real need that comes before a want like a game skin. Whatever's left can still go toward fun.",
      keyConcept: "Tradeoff — every yes is a no to something else",
      commonTrap: "Spending before planning",
      discussionPrompt: "What made this decision hard?",
      applyIt: "Name one thing you bought recently that was a want, not a need.",
    },
    takeHome: {
      title: "Money Talk at Home",
      prompt: "Pick one family purchase this week. Was it a need, a want, or both?",
      boxes: ["Need", "Want", "Tradeoff"],
      familyQuestion: "What is one thing we want to save for?",
    },
    prep: {
      openingScript:
        "Hi everyone! I'm a teen volunteer and today we're money detectives. Our big question: what's the difference between something you NEED to live and something you just WANT? Let's find out together — there are no wrong answers here.",
      vocab: [
        { term: "Need", def: "Something you must have to live and be safe (food, water, a home)." },
        { term: "Want", def: "Something nice to have, but you'd be okay without it (games, candy)." },
        { term: "Tradeoff", def: "What you give up when you choose one thing over another." },
      ],
      steps: [
        "Welcome & the big question (4 min)",
        "Turn & talk: name one need, one want (4 min)",
        "Scenario challenge + group vote (12 min)",
        "Reveal & discussion: the tricky ones (4 min)",
        "Exit ticket + confidence check (6 min)",
      ],
      discussionPrompts: [
        "Can the same thing be a need for one person and a want for another?",
        "What made the $25 choice hard?",
      ],
      printables: ["Needs vs. Wants sorting cards", "Take-home card", "Exit ticket"],
    },
  },

  {
    id: "budget-battle",
    title: "Budget Battle",
    emoji: "⚔️",
    gradeBand: "Grades 5–8",
    minutes: 40,
    keyConcept: "Budgeting & prioritizing",
    activityType: "Team challenge + vote",
    color: "blue",
    materials: ["Slides", "Team budget board", "Reveal screen", "Take-home card"],
    summary:
      "Teams get a set amount and a list of costs — they must build a plan that survives a surprise expense.",
    objective: "Students can build a simple budget and adjust it when priorities compete.",
    interactive: [
      "Team challenge",
      "Live budget board",
      "Surprise-expense twist",
      "Group vote",
      "Reveal screen",
      "Exit ticket",
    ],
    challenge: {
      scenario:
        "Your team has $40 for the week: bus fare ($15), lunch ($15), a movie ($12), and you want to save $5. You can't afford everything. What gets cut first?",
      options: [
        "Cut the bus fare",
        "Cut lunch",
        "Cut the movie",
        "Cut savings this week",
      ],
      best: 2,
      timerSeconds: 40,
      round: 1,
    },
    reveal: {
      bestAnswer: "C. Cut the movie",
      why:
        "Bus fare and lunch are needs, and skipping savings should be a last resort. The movie is the want — cutting it keeps the plan working. Budgets are about ranking, not having it all.",
      keyConcept: "Prioritizing — needs and goals before extras",
      commonTrap: "Protecting fun spending and raiding savings instead",
      discussionPrompt: "How did your team decide what mattered most?",
      applyIt: "List your top 3 money priorities for this month, in order.",
    },
    takeHome: {
      title: "Our Family Plan",
      prompt: "With a grown-up, name one thing your family spends on every week.",
      boxes: ["Need", "Want", "Could cut"],
      familyQuestion: "If money got tight, what would we cut first?",
    },
    prep: {
      openingScript:
        "Welcome to the Budget Battle! A budget is just a plan for your money. Today your team gets a set amount and some tough choices. Spoiler: you can't buy everything — and that's exactly the point.",
      vocab: [
        { term: "Budget", def: "A plan for money coming in and going out." },
        { term: "Priority", def: "What matters most, decided on purpose." },
        { term: "Fixed cost", def: "A cost that stays the same, like bus fare." },
      ],
      steps: [
        "What is a budget? (6 min)",
        "Team gets $40 and a cost list (8 min)",
        "Build the plan on the budget board (12 min)",
        "Surprise expense twist + revote (8 min)",
        "Reveal, discussion & exit ticket (6 min)",
      ],
      discussionPrompts: [
        "What surprised you when the extra cost appeared?",
        "Did every team make the same cuts? Why not?",
      ],
      printables: ["Team budget board", "Cost cards", "Exit ticket"],
    },
  },

  {
    id: "save-or-spend",
    title: "Save or Spend?",
    emoji: "🐷",
    gradeBand: "Grades 3–6",
    minutes: 30,
    keyConcept: "Saving & delayed gratification",
    activityType: "This-or-that vote",
    color: "amber",
    materials: ["Slides", "Vote screen", "Savings calculator", "Take-home card"],
    summary:
      "Why saving even a little is a superpower — plus a live look at how weekly saving adds up to a goal.",
    objective: "Students can explain why saving matters and estimate time to reach a goal.",
    interactive: [
      "This-or-that vote",
      "Live savings calculator",
      "Pay-yourself-first demo",
      "Reveal screen",
      "Take-home reflection",
    ],
    challenge: {
      scenario:
        "You want a $60 skateboard. You get $10 a week. A store has a $20 gadget on sale today. What's the smart move?",
      options: [
        "Buy the gadget — deals don't wait",
        "Save the full $10 toward the skateboard",
        "Save $5, keep $5 for now",
        "Give up on the skateboard",
      ],
      best: 2,
      timerSeconds: 30,
      round: 1,
    },
    reveal: {
      bestAnswer: "C. Save $5, keep $5 for now",
      why:
        "Saving something every week keeps your goal moving without feeling miserable. Blowing it all on the gadget resets your progress; saving a little consistently wins.",
      keyConcept: "Delayed gratification — small saving now, bigger reward later",
      commonTrap: "Letting a 'today only' deal derail a bigger goal",
      discussionPrompt: "What's a goal worth waiting for?",
      applyIt: "Pick one goal and figure out how many weeks it would take you to save for it.",
    },
    takeHome: {
      title: "Our Savings Goal",
      prompt: "Draw or name one thing your family would like to save for.",
      boxes: ["Save", "Spend", "Wait for it"],
      familyQuestion: "How much could we set aside each week?",
    },
    prep: {
      openingScript:
        "Saving money means keeping some instead of spending it all right now. Sounds hard — but it's a superpower. Today we'll see how a little bit, over and over, adds up faster than you'd think.",
      vocab: [
        { term: "Save", def: "Keep money now to use for a bigger goal later." },
        { term: "Pay yourself first", def: "Put money into savings BEFORE you spend any." },
        { term: "Goal", def: "Something you're saving toward on purpose." },
      ],
      steps: [
        "The superpower of saving (5 min)",
        "Live 'how long to save?' calculator (10 min)",
        "Pay-yourself-first demo (5 min)",
        "This-or-that vote (6 min)",
        "Confidence check + take-home (4 min)",
      ],
      discussionPrompts: [
        "What happens to your goal if you save more each week?",
        "Why is 'whatever's left' usually nothing?",
      ],
      printables: ["Savings goal card", "Weekly tracker", "Take-home card"],
    },
  },

  {
    id: "credit-climb",
    title: "Credit Climb",
    emoji: "🧗",
    gradeBand: "Grades 7–10",
    minutes: 40,
    keyConcept: "Borrowing & credit responsibly",
    activityType: "Level-up scenario",
    color: "teal",
    materials: ["Slides", "Level board", "Reveal screen", "Take-home card"],
    summary:
      "Credit is borrowed money you pay back — usually with interest. Students climb levels by making responsible choices.",
    objective: "Students can explain what credit is and why paying it back on time matters.",
    interactive: [
      "Level-up scenario",
      "Group vote",
      "Interest reveal",
      "Discussion prompt",
      "Exit ticket",
    ],
    challenge: {
      scenario:
        "A store offers a phone for '$0 down, pay later.' You don't have the money yet. What's the responsible move?",
      options: [
        "Take it — it's free right now",
        "Check what you'd owe later and if you can pay it",
        "Borrow from two places to be safe",
        "Ignore the total cost, focus on monthly",
      ],
      best: 1,
      timerSeconds: 40,
      round: 1,
    },
    reveal: {
      bestAnswer: "B. Check what you'd owe later and if you can pay it",
      why:
        "'Pay later' is still borrowing. Credit isn't free — you usually pay interest, and only paying it back on time keeps it from snowballing. Always know the real total before you say yes.",
      keyConcept: "Interest — the cost of borrowing money over time",
      commonTrap: "Looking only at the monthly payment, not the full cost",
      discussionPrompt: "When is borrowing a smart tool, and when is it a trap?",
      applyIt: "Find one ad that says 'pay later' and figure out what it really costs.",
    },
    takeHome: {
      title: "Borrowing Talk",
      prompt: "Ask a grown-up: what's one thing people commonly buy with credit?",
      boxes: ["Smart use", "Risky use", "Not sure"],
      familyQuestion: "Why does paying bills on time matter?",
    },
    prep: {
      openingScript:
        "Today we climb the Credit Climb. Credit means borrowing money and paying it back later — often with a little extra called interest. Used well, it's a tool. Used carelessly, it's a trap. Let's learn the difference.",
      vocab: [
        { term: "Credit", def: "Borrowed money you agree to pay back later." },
        { term: "Interest", def: "The extra you pay for borrowing, on top of what you owe." },
        { term: "Credit score", def: "A number that shows how reliably someone repays." },
      ],
      steps: [
        "What is credit, really? (7 min)",
        "Level 1–3 borrowing scenarios (14 min)",
        "Interest reveal: the true cost (6 min)",
        "Discussion: tool vs. trap (7 min)",
        "Exit ticket + take-home (6 min)",
      ],
      discussionPrompts: [
        "Why do lenders charge interest?",
        "How could a small late payment grow into a big problem?",
      ],
      printables: ["Credit level board", "'True cost' worksheet", "Exit ticket"],
    },
  },

  {
    id: "paycheck-puzzle",
    title: "Paycheck Puzzle",
    emoji: "🧩",
    gradeBand: "Grades 8–12",
    minutes: 45,
    keyConcept: "Gross vs. net pay",
    activityType: "Build-the-paycheck",
    color: "purple",
    materials: ["Slides", "Paycheck builder", "Reveal screen", "Take-home card"],
    summary:
      "Your first paycheck is smaller than you think. Students piece together where the money goes before it reaches you.",
    objective: "Students can explain the difference between gross and net pay and name common deductions.",
    interactive: [
      "Build-the-paycheck activity",
      "Group vote",
      "Deduction reveal",
      "Discussion prompt",
      "Exit ticket",
    ],
    challenge: {
      scenario:
        "You earn $200 this week (that's your gross pay). Your paycheck says $170. Where did the other $30 most likely go?",
      options: [
        "The company kept it for no reason",
        "Taxes and required deductions",
        "It's a mistake — you should get it all",
        "A tip to your manager",
      ],
      best: 1,
      timerSeconds: 40,
      round: 1,
    },
    reveal: {
      bestAnswer: "B. Taxes and required deductions",
      why:
        "Gross pay is what you earn; net pay ('take-home') is what lands in your pocket after taxes and deductions. Knowing the gap helps you budget with the real number, not the big one.",
      keyConcept: "Net pay — your real take-home amount",
      commonTrap: "Budgeting off gross pay and coming up short",
      discussionPrompt: "Why might your take-home be different from a friend's for the same job?",
      applyIt: "If a job pays $15/hour for 10 hours, estimate your take-home after ~15% is withheld.",
    },
    takeHome: {
      title: "Paycheck Detective",
      prompt: "If someone in your home is willing, look at a pay stub together (no numbers needed to share).",
      boxes: ["Gross pay", "Deductions", "Net pay"],
      familyQuestion: "What is one thing taxes help pay for in our community?",
    },
    prep: {
      openingScript:
        "Here's a puzzle: you earn $200 but your check says less. Where did it go? Today we solve the Paycheck Puzzle — the difference between what you earn and what you actually take home.",
      vocab: [
        { term: "Gross pay", def: "The total you earn before anything is taken out." },
        { term: "Net pay", def: "Your take-home amount after deductions." },
        { term: "Deduction", def: "Money taken from pay, like taxes or benefits." },
      ],
      steps: [
        "Gross vs. net: the big reveal (7 min)",
        "Build a paycheck piece by piece (14 min)",
        "Group vote: where did it go? (8 min)",
        "Discussion: budgeting off the real number (8 min)",
        "Exit ticket + take-home (8 min)",
      ],
      discussionPrompts: [
        "Why do taxes come out automatically?",
        "How would using gross pay to plan get someone in trouble?",
      ],
      printables: ["Paycheck builder sheet", "Deductions glossary", "Exit ticket"],
    },
  },

  {
    id: "smart-shopping",
    title: "Smart Shopping Challenge",
    emoji: "🛒",
    gradeBand: "Grades 4–8",
    minutes: 35,
    keyConcept: "Value vs. price",
    activityType: "Compare & vote",
    color: "coral",
    materials: ["Slides", "Compare screen", "Reveal screen", "Take-home card"],
    summary:
      "Cheaper isn't always better and fancier isn't always worth it. Students learn to compare value, not just price.",
    objective: "Students can compare options by value and use unit price to make smarter choices.",
    interactive: [
      "Compare-two-options vote",
      "Unit-price reveal",
      "Ad-trick spotting",
      "Discussion prompt",
      "Exit ticket",
    ],
    challenge: {
      scenario:
        "Two snack packs: a 4-pack for $2 or a 12-pack for $5. You'll definitely eat them all. Which is the better value?",
      options: [
        "The 4-pack — smaller price",
        "The 12-pack — lower cost per snack",
        "They're exactly the same",
        "Whichever has cooler packaging",
      ],
      best: 1,
      timerSeconds: 30,
      round: 1,
    },
    reveal: {
      bestAnswer: "B. The 12-pack — lower cost per snack",
      why:
        "4-pack = 50¢ each; 12-pack ≈ 42¢ each. Unit price (cost per item) shows the real deal. But value also means you'll actually use them — buying more only wins if you'd finish it.",
      keyConcept: "Value — what you get for the money, not just the price",
      commonTrap: "Grabbing the lowest sticker price without checking unit price",
      discussionPrompt: "When is buying more NOT the better deal?",
      applyIt: "Next store trip, compare unit prices on two sizes of the same item.",
    },
    takeHome: {
      title: "Deal Detective",
      prompt: "Find two sizes of the same product at home or a store. Which is the better value?",
      boxes: ["Cheaper total", "Better per-unit", "Best for us"],
      familyQuestion: "What's one thing worth spending a little more on because it lasts?",
    },
    prep: {
      openingScript:
        "Welcome, Deal Detectives! Stores are great at making things look like a bargain. Today we learn the difference between a low price and real value — and how one number, the unit price, cuts through the tricks.",
      vocab: [
        { term: "Price", def: "How much a thing costs to buy." },
        { term: "Value", def: "What you actually get for the money." },
        { term: "Unit price", def: "The cost per one item, ounce, or serving." },
      ],
      steps: [
        "Price vs. value warm-up (6 min)",
        "Compare-two-options votes (12 min)",
        "Unit-price reveal (7 min)",
        "Spot the ad trick (6 min)",
        "Exit ticket + take-home (4 min)",
      ],
      discussionPrompts: [
        "Has a 'deal' ever cost you more in the end?",
        "How can packaging fool us?",
      ],
      printables: ["Compare cards", "Unit-price worksheet", "Take-home card"],
    },
  },

  {
    id: "fraud-red-flags",
    title: "Fraud & Red Flags",
    emoji: "🚩",
    gradeBand: "Grades 5–9",
    minutes: 35,
    keyConcept: "Scams & staying safe",
    activityType: "Spot-the-scam quiz",
    color: "coral",
    materials: ["Slides", "Spot-the-scam screen", "Reveal screen", "Take-home card"],
    summary:
      "Scammers use urgency and secrets to trick people. Students learn the red flags and a simple 'stop and check' rule.",
    objective: "Students can identify common scam red flags and describe a safe response.",
    interactive: [
      "Spot-the-scam quiz",
      "Group vote",
      "Red-flag reveal",
      "Discussion prompt",
      "Exit ticket",
    ],
    challenge: {
      scenario:
        "A text says: 'You won a $500 gift card! Click now and enter your bank info in the next 10 minutes or lose it.' What do you do?",
      options: [
        "Click fast before it expires",
        "Enter your info — it's just a card",
        "Don't click; it's a scam (urgency + info request)",
        "Forward it to friends so they can win too",
      ],
      best: 2,
      timerSeconds: 30,
      round: 1,
    },
    reveal: {
      bestAnswer: "C. Don't click; it's a scam",
      why:
        "Two huge red flags: a rush ('10 minutes!') and a request for private info. Real prizes don't need your bank details in a hurry. When in doubt: stop, don't click, and ask a trusted adult.",
      keyConcept: "Red flag — a warning sign that something is a scam",
      commonTrap: "Acting fast because a message creates panic or excitement",
      discussionPrompt: "Why do scammers try to make you rush?",
      applyIt: "Name the 3 red flags to watch for: urgency, secrecy, and asking for private info.",
    },
    takeHome: {
      title: "Scam Spotters",
      prompt: "With a grown-up, talk about a scam text or call your family has seen.",
      boxes: ["Red flag", "Safe move", "Who to tell"],
      familyQuestion: "Who is our trusted person to ask if a message seems fishy?",
    },
    prep: {
      openingScript:
        "Today we become Scam Spotters. Scammers are sneaky, but they almost always use the same tricks: they rush you, they want secrets, and they ask for private info. Learn the red flags and you can't be fooled.",
      vocab: [
        { term: "Fraud", def: "Tricking someone to take their money or information." },
        { term: "Red flag", def: "A warning sign that something isn't right." },
        { term: "Phishing", def: "Fake messages that try to steal your info." },
      ],
      steps: [
        "How scams work (6 min)",
        "Spot-the-scam quiz rounds (14 min)",
        "Red-flag reveal & the 'stop and check' rule (7 min)",
        "Discussion: staying safe (4 min)",
        "Exit ticket + take-home (4 min)",
      ],
      discussionPrompts: [
        "Why is 'act now!' such a common trick?",
        "What should you do before clicking any link?",
      ],
      printables: ["Red-flag checklist", "Spot-the-scam cards", "Take-home card"],
    },
  },

  {
    id: "banking-basics",
    title: "Banking Basics",
    emoji: "🏦",
    gradeBand: "Grades 4–8",
    minutes: 35,
    keyConcept: "How banks & accounts work",
    activityType: "Sort & quiz",
    color: "blue",
    materials: ["Slides", "Sort screen", "Reveal screen", "Take-home card"],
    summary:
      "What actually happens when money goes 'in the bank'? Students learn accounts, deposits, and why banks are safer than a piggy bank.",
    objective: "Students can describe the difference between checking and savings and why banks keep money safe.",
    interactive: [
      "Sort: checking vs. savings",
      "Group vote",
      "Deposit/withdraw reveal",
      "Discussion prompt",
      "Exit ticket",
    ],
    challenge: {
      scenario:
        "You get $50 for your birthday. You'll spend some soon but want to keep most safe and growing. Where should most of it go?",
      options: [
        "Under your mattress",
        "A checking account you swipe daily",
        "A savings account",
        "Spend it so it can't be lost",
      ],
      best: 2,
      timerSeconds: 30,
      round: 1,
    },
    reveal: {
      bestAnswer: "C. A savings account",
      why:
        "Savings keeps money safe, out of easy-spend reach, and can even earn a little interest. Checking is for everyday spending; a mattress can be lost or stolen and grows nothing.",
      keyConcept: "Savings vs. checking — one grows and protects, one spends",
      commonTrap: "Keeping everything where it's easiest to spend",
      discussionPrompt: "Why might a bank be safer than keeping cash at home?",
      applyIt: "Name one thing you'd keep in savings and one thing you'd keep in checking.",
    },
    takeHome: {
      title: "Bank Explorer",
      prompt: "Ask a grown-up what a checking and a savings account are used for.",
      boxes: ["Checking", "Savings", "Both"],
      familyQuestion: "What's one goal a savings account could help our family reach?",
    },
    prep: {
      openingScript:
        "Ever wonder what really happens when money goes 'in the bank'? Today we open up Banking Basics — accounts, deposits, and why a bank keeps your money safer (and growing) compared to a piggy bank.",
      vocab: [
        { term: "Checking account", def: "For everyday spending — money you use often." },
        { term: "Savings account", def: "For keeping money safe and growing toward goals." },
        { term: "Deposit", def: "Putting money into an account." },
      ],
      steps: [
        "What a bank actually does (6 min)",
        "Sort: checking vs. savings (12 min)",
        "Deposit & withdraw reveal (7 min)",
        "Discussion: safe & growing (6 min)",
        "Exit ticket + take-home (4 min)",
      ],
      discussionPrompts: [
        "Why do banks pay a little interest on savings?",
        "When would you use checking instead of savings?",
      ],
      printables: ["Account sort cards", "Deposit slip demo", "Take-home card"],
    },
  },

  {
    id: "college-cost-choices",
    title: "College Cost Choices",
    emoji: "🎓",
    gradeBand: "Grades 9–12",
    minutes: 45,
    keyConcept: "Paying for education & debt tradeoffs",
    activityType: "Choice scenario",
    color: "teal",
    materials: ["Slides", "Choice board", "Reveal screen", "Take-home card"],
    summary:
      "Big-ticket decisions with lifelong impact. Students weigh cost, aid, and debt across realistic education paths.",
    objective: "Students can compare education paths by cost and explain how debt affects future choices.",
    interactive: [
      "Choice scenario",
      "Cost comparison",
      "Debt reveal",
      "Discussion prompt",
      "Exit ticket",
    ],
    challenge: {
      scenario:
        "Two paths to the same career: School A costs $10k/year with a scholarship; School B costs $40k/year with a loan. Both get you there. What's the wise first question?",
      options: [
        "Which has the nicer campus?",
        "Which will I owe the least on after graduation?",
        "Which do my friends pick?",
        "Which has the cooler mascot?",
      ],
      best: 1,
      timerSeconds: 45,
      round: 1,
    },
    reveal: {
      bestAnswer: "B. Which will I owe the least on after graduation?",
      why:
        "When two paths lead to the same goal, cost and debt matter a lot. Big loans shape your choices for years. Scholarships, community college, and aid can reach the same destination for far less.",
      keyConcept: "Return on investment — weighing cost against what you gain",
      commonTrap: "Choosing on prestige or vibes and ignoring the debt",
      discussionPrompt: "How could a big loan limit choices after graduation?",
      applyIt: "Name one free or low-cost way to reduce college costs (scholarships, aid, community college).",
    },
    takeHome: {
      title: "Future Plans Chat",
      prompt: "Talk with family about one goal after high school and what it might cost.",
      boxes: ["Cost", "Aid ideas", "Questions"],
      familyQuestion: "What's one way we could lower the cost of that goal?",
    },
    prep: {
      openingScript:
        "Some money choices are small; this one's huge. Today we look at College Cost Choices — how the same goal can cost wildly different amounts, and why smart planning now saves years of debt later.",
      vocab: [
        { term: "Tuition", def: "The price of attending a school." },
        { term: "Financial aid", def: "Grants, scholarships, or loans that help pay for school." },
        { term: "Student loan", def: "Borrowed money for school you repay later, with interest." },
      ],
      steps: [
        "The big-ticket decision (7 min)",
        "Compare two realistic paths (14 min)",
        "Debt reveal: what you'd owe (8 min)",
        "Discussion: cost vs. prestige (8 min)",
        "Exit ticket + take-home (8 min)",
      ],
      discussionPrompts: [
        "Does more expensive always mean better?",
        "How do scholarships change the math?",
      ],
      printables: ["Path comparison sheet", "Aid vocabulary card", "Take-home card"],
    },
  },

  {
    id: "investing-mythbusters",
    title: "Investing Mythbusters",
    emoji: "📈",
    gradeBand: "Grades 8–12",
    minutes: 40,
    keyConcept: "Risk, return & compound growth",
    activityType: "Myth vs. fact vote",
    color: "purple",
    materials: ["Slides", "Myth-vs-fact screen", "Compound-growth demo", "Take-home card"],
    summary:
      "Investing isn't gambling and it isn't only for the rich. Students bust common myths and meet the magic of compound growth.",
    objective: "Students can explain risk vs. return and why starting early helps money grow.",
    interactive: [
      "Myth vs. fact vote",
      "Compound-growth demo",
      "Reveal screen",
      "Discussion prompt",
      "Exit ticket",
    ],
    challenge: {
      scenario:
        "Two people invest the same total. Ana starts at 16 and stops at 26. Ben starts at 26 and invests twice as long. Who usually ends up with more?",
      options: [
        "Ben — he invested longer",
        "Ana — she started earlier (compound growth)",
        "Exactly the same",
        "Neither — investing is just luck",
      ],
      best: 1,
      timerSeconds: 40,
      round: 1,
    },
    reveal: {
      bestAnswer: "B. Ana — she started earlier",
      why:
        "Because of compound growth, money earns returns, and those returns earn more returns. Starting early often beats investing more later. Time is an investor's biggest advantage.",
      keyConcept: "Compound growth — earnings that earn their own earnings",
      commonTrap: "Believing it's too early to start or that it's all luck",
      discussionPrompt: "Why is time such a powerful ingredient in investing?",
      applyIt: "Explain compound growth to someone at home in one sentence.",
    },
    takeHome: {
      title: "Myth or Fact?",
      prompt: "Share one investing 'fact' you heard. Is it a myth or true?",
      boxes: ["Myth", "Fact", "Not sure"],
      familyQuestion: "What's one long-term goal our family could invest toward?",
    },
    prep: {
      openingScript:
        "Time to be Investing Mythbusters! You've probably heard investing is gambling, or only for rich adults. Today we bust those myths and meet the coolest idea in money: compound growth, where your money makes money.",
      vocab: [
        { term: "Invest", def: "Put money to work so it can grow over time." },
        { term: "Risk & return", def: "Higher possible reward usually means higher possible loss." },
        { term: "Compound growth", def: "Earnings that themselves earn more earnings." },
      ],
      steps: [
        "Bust 3 investing myths (8 min)",
        "Myth-vs-fact voting rounds (12 min)",
        "Compound-growth demo (8 min)",
        "Discussion: why start early? (6 min)",
        "Exit ticket + take-home (6 min)",
      ],
      discussionPrompts: [
        "What's the difference between investing and gambling?",
        "Why does starting early matter so much?",
      ],
      printables: ["Myth-vs-fact cards", "Compound-growth chart", "Take-home card"],
    },
  },
];

// Short status / disclaimer badges shown across the site.
const STATUS_BADGES = [
  "Proposed pilot",
  "Concept for discussion",
  "Student-led prototype",
  "Designed to support Teen Teach-In–style workshops",
  "Pending review and approval by Virginia Jump$tart",
  "Built around existing financial literacy topics",
  "Educational only",
  "Privacy-safe by design",
];

// Impact snapshot & measurement layer — EXAMPLE / PLACEHOLDER numbers only,
// clearly labeled everywhere in the UI. These illustrate what a pilot COULD
// measure; they are NOT real results. All measures are aggregate and
// privacy-safe by design (no names, no logins, no personal data).
const IMPACT_EXAMPLE = {
  // Core impact snapshot
  studentsReached: 240,
  workshopsDelivered: 12,
  volunteersTrained: 18,
  participationRate: 92, // %
  confidenceImprovement: 34, // percentage-point gain, self-rated pre/post
  topConcepts: ["Needs vs. Wants", "Saving early", "Spotting scams"],
  facilitatorFeedback: 4.6, // out of 5
  repeatabilityScore: 88, // %

  // Measurement layer (volunteer hours, reach, participation, sponsor-visible)
  volunteerHours: 96,
  schoolsReached: 7,
  teenTeachInParticipation: 34, // teen volunteers who took part
  workshopAttendance: 92, // % of registered who attended
  knowledgeCheckGain: 41, // pre/post knowledge check, percentage-point gain
  sponsorOutcomes: [
    "Every dollar of sponsorship reached ~13 students (example ratio)",
    "7 partner schools engaged across the region",
    "96 documented teen-volunteer service hours",
  ],
};

// Standards-grounded helper knowledge base.
// SAFETY BY DESIGN: this helper does NOT freestyle answers. It only looks up
// answers from this small, curated, EXAMPLE set of approved-style resources
// and always shows a source label. Real deployment would replace these
// entries with chapter-approved Virginia Jump$tart / National Standards
// content. Everything here is illustrative and pending review.
const FAQ_KNOWLEDGE = [
  {
    q: "What is the difference between a need and a want?",
    a: "A need is something you must have to live and be safe, like food, water, or shelter. A want is something nice to have but not essential, like games or candy. The same item can be a need or a want depending on the situation.",
    tags: ["needs", "wants", "tradeoff", "basics"],
    source: "Example resource · National Standards for Personal Financial Education — Spending & Saving",
  },
  {
    q: "Why should I save money?",
    a: "Saving lets you reach bigger goals later and be ready for surprises. A helpful habit is 'pay yourself first' — set aside a little the moment you get money, before you spend any.",
    tags: ["save", "saving", "goal", "pay yourself first"],
    source: "Example resource · National Standards — Spending & Saving",
  },
  {
    q: "What is a budget?",
    a: "A budget is a plan for money coming in and going out. A simple version splits money into three parts: save, spend, and share. There is no single right split — a budget helps you decide on purpose.",
    tags: ["budget", "plan", "save spend share"],
    source: "Example resource · National Standards — Spending & Saving",
  },
  {
    q: "What is credit and interest?",
    a: "Credit is borrowed money you agree to pay back later. Interest is the extra cost of borrowing, on top of what you owe. Paying credit back on time keeps costs from growing.",
    tags: ["credit", "interest", "borrow", "loan"],
    source: "Example resource · National Standards — Credit & Debt",
  },
  {
    q: "What is the difference between gross pay and net pay?",
    a: "Gross pay is the total you earn before anything is taken out. Net pay (take-home pay) is what's left after taxes and other deductions. Budget using your net pay, not your gross pay.",
    tags: ["paycheck", "gross", "net", "taxes", "deduction"],
    source: "Example resource · National Standards — Earning Income",
  },
  {
    q: "How can I spot a scam?",
    a: "Watch for three red flags: urgency ('act now!'), secrecy, and requests for private information. When a message rushes you or asks for personal or bank details, stop, don't click, and ask a trusted adult.",
    tags: ["fraud", "scam", "red flag", "phishing", "safety"],
    source: "Example resource · National Standards — Managing Risk",
  },
  {
    q: "What is the difference between a checking and a savings account?",
    a: "A checking account is for everyday spending. A savings account keeps money safer, out of easy-spend reach, and can earn a little interest toward your goals.",
    tags: ["banking", "checking", "savings", "account", "deposit"],
    source: "Example resource · National Standards — Financial Services",
  },
  {
    q: "How does compound growth work in investing?",
    a: "Investing puts money to work so it can grow. With compound growth, your earnings themselves earn more earnings over time. Because of this, starting early can matter more than investing larger amounts later.",
    tags: ["investing", "compound", "risk", "return", "growth"],
    source: "Example resource · National Standards — Saving & Investing",
  },
  {
    q: "Is this app a good source of official financial advice?",
    a: "No. This toolkit is an educational prototype for discussion, pending review by Virginia Jump$tart. It is not financial advice. For decisions, families should talk with trusted adults and qualified professionals.",
    tags: ["disclaimer", "advice", "safety", "about"],
    source: "Money Ready toolkit · Educational-only notice",
  },
];
