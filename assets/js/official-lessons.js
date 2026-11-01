/*
 * official-lessons.js — The official Teen Teach-In lessons, step by step
 * ---------------------------------------------------------------------
 * Taken from Jump$tart's October Teen Teach-In slide decks for Grades 1–4
 * (jumpstart.org → Teen Teach-In → Resources). Each entry follows its
 * deck's own order, so a volunteer who builds a plan here can teach
 * straight from the official slides.
 *
 * Keyed by module id in data.js. The Workshop Builder only uses an entry
 * when that module also carries an `officialLesson` tag, so editions
 * without the tags (the 4-H build) never see these lessons.
 *
 * Wording is summarized from the decks' slides and speaker notes. The
 * picture books are named, not reproduced: bring the book or a read-aloud
 * video the teacher approves.
 *
 * Step fields:
 *   name     shown in the run of show
 *   minutes  starting length; the builder scales these to the time slot
 *   slides   which slides in the official deck this step uses
 *   what     what happens
 *   script   what to say (short — the deck's notes have the full version)
 *   how      practical tips for running it
 *   activity true for the hands-on step a volunteer may swap for a game
 */

const OFFICIAL_LESSONS = {
  "needs-vs-wants": {
    deck: "Grade 1: Needs and Wants",
    book: { title: "Something Good", author: "Robert Munsch (pictures by Michael Martchenko)" },
    bigIdea: "Families pay for needs first. Wants come after, if money is left over, because money is a limited resource.",
    vocab: [
      { term: "Needs", def: "Things we must have to live, like food, water, and a home." },
      { term: "Wants", def: "Things that would be nice to have but we can live without." },
      { term: "Choices", def: "Deciding what to spend your resources on." },
      { term: "Resources (money)", def: "Things that help you get what you want. Money is the best example." },
    ],
    materials: ["The book Something Good (or an approved read-aloud video)", "Need/want picture cards for the game"],
    steps: [
      {
        name: "Welcome & introductions", minutes: 3, slides: "Slides 2 and 4",
        what: "Introduce each presenter with your grade and something about you. Explain you take a financial literacy class that teaches life lessons, and today's lesson is about needs and wants. It begins with a story.",
        script: "Hi! We're high school students, and in our class we learn how to be smart with money. Today we brought a lesson about needs and wants, and it starts with a story.",
        how: "Add a slide with a photo of each presenter. First graders warm up fast when they see your face on the screen.",
      },
      {
        name: "Today's words", minutes: 3, slides: "Slides 3 and 5",
        what: "Introduce needs, wants, choices, and resources. Ask the class for examples of needs and of wants.",
        script: "A need is something we must have to live. A want is something nice to have. Who can tell me a need? Who can tell me a want?",
        how: "Write two columns on the board, NEEDS and WANTS, and sort their examples as they call them out.",
      },
      {
        name: "Story: Something Good", minutes: 8, slides: "Slides 6–7",
        what: "Ask who has gone grocery shopping and what they like at the store. Then read Something Good: Tyya is unhappy because her dad never buys anything \"good\" at the grocery store.",
        script: "Have you ever gone grocery shopping with someone? What do they sell that you like? Let's see what happens when Tyya goes shopping with her dad.",
        how: "Show the pictures while you read. Pause at the funny parts and let them laugh.",
      },
      {
        name: "Talk about the story", minutes: 5, slides: "Slide 8",
        what: "Ask the story questions: What did Tyya's dad buy? What did Tyya think was \"good\" food? What did her dad call the food she picked? Why did people think Tyya was a doll? Why do you think her dad paid $29.95 to buy Tyya back?",
        script: "Tyya said her dad doesn't buy \"good\" food. What did he buy? What did Tyya want him to buy?",
        how: "Take an answer from a different student each time. The last question is a favorite: Tyya is worth more than anything in the store.",
      },
      {
        name: "Resources and choices", minutes: 5, slides: "Slides 9–12",
        what: "Teach that people can't have everything they want because resources are limited: not enough money, not enough hours to work, a limited number of products. Making a choice means deciding what to use your resources on. Spend on needs first, then wants if anything is left.",
        script: "Money runs out, so we call it a limited resource. Did Tyya's dad have enough money for all the ice cream and chocolate AND the groceries the family needed? So he had to choose.",
        how: "Ask: Did the family need 100 boxes of ice cream? Did they need bread, eggs, and milk? Let them answer out loud together.",
      },
      {
        name: "Needs or Wants game", minutes: 6, slides: "Slides 13–18", activity: true,
        what: "Show two items at a time. For each one, the class decides: need or want?",
        script: "Let's play a game! I'll show you something, and you tell me: is it a need or a want?",
        how: "Have students answer with thumbs up for a need and thumbs down for a want, so everyone answers at once. Ask one student to explain why after each pair.",
      },
      {
        name: "Thank you & wrap-up", minutes: 2, slides: "Slide 19",
        what: "Thank the class. Remind them that grown-ups have to take care of the family's needs before spending extra on wants.",
        script: "Thank you for being great students! Next time you want something extra at the store, remember: families take care of needs first.",
        how: "Hand out the parent toolkit or take-home card on the way out.",
      },
    ],
  },

  "opportunity-costs": {
    deck: "Grade 2: Making Financial Choices and Opportunity Costs",
    book: { title: "Alexander, Who Used to Be Rich Last Sunday", author: "Judith Viorst" },
    bigIdea: "Nobody can buy everything they want. What you give up when you choose is the opportunity cost, so decide what you want most before you spend.",
    vocab: [
      { term: "Wants", def: "Things you want that you have to give something up for." },
      { term: "Opportunity cost", def: "The thing you give up when you make a choice." },
      { term: "Financial decision", def: "Choosing what to do with your money after thinking about what you want most." },
    ],
    materials: ["The book Alexander, Who Used to Be Rich Last Sunday", "Chart paper or a board for the subtraction", "Grade 2 worksheet (one per student)"],
    steps: [
      {
        name: "Welcome & introductions", minutes: 3, slides: "Slides 2–5",
        what: "Introduce each presenter. Explain you take a financial literacy class, and that some money lessons are worth learning early to get a head start.",
        script: "We're high school students who study money in class. Some of these lessons are really useful to learn when you're your age too.",
        how: "Keep each introduction to two or three sentences.",
      },
      {
        name: "Story: Alexander, Who Used to Be Rich Last Sunday", minutes: 8, slides: "Slide 6",
        what: "Ask who has had their own money to spend and whether it was an allowance or a gift. Then read the book about a boy who had money but didn't spend it wisely.",
        script: "How many of you have had your own money? Was it an allowance, or a birthday gift? Let's see what Alexander does with his.",
        how: "Write $1.00 at the top of the chart paper before you start reading. You'll need the space next.",
      },
      {
        name: "Track Alexander's dollar", minutes: 8, slides: "Slides 7–8",
        what: "Walk back through the story and subtract each thing Alexander spent or lost from his $1.00: bubble gum 15¢, bets 15¢, renting the snake 12¢, bad words 10¢, the toilet and the crack 8¢, Anthony's chocolate bar 11¢, the magic trick 4¢, kicking 5¢, the yard sale 20¢. He ends with zero.",
        script: "How rich was Alexander last Sunday? One dollar! What did he buy first? How much does he have left now?",
        how: "Let the class do the subtraction with you at each step. Then ask: did Alexander use his money wisely? What should he have done? If they don't say it, don't push. The activity will make the point.",
      },
      {
        name: "Wants & opportunity cost", minutes: 5, slides: "Slide 9",
        what: "Teach wants, opportunity cost, and financial decision making. Use the example of a birthday party and a baseball game at the same time: the one you don't go to is your opportunity cost. Alexander's opportunity cost was the walkie-talkie he really wanted.",
        script: "If you're invited to a birthday party and a baseball game at the same time, which would you choose? The one you didn't pick is your opportunity cost.",
        how: "Let students vote with their hands for party or game before you explain. Nobody, not even the President, has enough money for everything.",
      },
      {
        name: "Choices and opportunity cost activity", minutes: 7, slides: "Slide 10", activity: true,
        what: "Students complete the Grade 2 worksheet: for each choice, they circle what they would pick and name what they would give up.",
        script: "Now it's your turn to choose. For each one, pick what you want most, then tell us what you gave up.",
        how: "Do the first one together on the board. Walk around and ask students to say their opportunity cost out loud.",
      },
      {
        name: "Thank you & wrap-up", minutes: 2, slides: "Slide 11",
        what: "Thank the class. Remind them every want has an opportunity cost, and to think before spending and save for the big things.",
        script: "It's great to buy things we want, but remember there's always something we give up. Think before you spend!",
        how: "Hand out the parent toolkit or take-home card.",
      },
    ],
  },

  "save-or-spend": {
    deck: "Grade 3: Saving, Spending, Borrowing and Lending",
    book: { title: "If You Made a Million", author: "David M. Schwartz (illustrated by Steven Kellogg)" },
    bigIdea: "You can spend money or save it. Banks pay interest to savers and charge more interest to borrowers. That difference is how banks make money.",
    vocab: [
      { term: "Spend", def: "Use money to buy goods or services." },
      { term: "Save", def: "Keep money for the future instead of spending it now." },
      { term: "Interest", def: "Money a bank pays you for saving, or charges you for borrowing." },
      { term: "Loan", def: "Money you borrow and promise to pay back, plus interest." },
    ],
    materials: ["The book If You Made a Million", "Grade 3 worksheet (one per student)", "Role-play script cards for saver, borrower, and banker", "Play money ($500 and $525 and $510 in bills)"],
    steps: [
      {
        name: "Welcome & introductions", minutes: 3, slides: "Slides 2–5",
        what: "Introduce each presenter. Explain you take a financial literacy class, and that learning about money early gives students a head start.",
        script: "We're high school students who study money. Today's lesson is about saving, spending, borrowing, and lending.",
        how: "Keep introductions short. Third graders want to get to the story.",
      },
      {
        name: "Story: If You Made a Million", minutes: 9, slides: "Slides 6–8",
        what: "Ask what they would do with a million dollars. Hand out the worksheet. While you read, students write next to each dollar amount the things the story says you could do with it.",
        script: "What would you do if you made a million dollars? Listen carefully: next to each amount on your worksheet, write what the story says you could do with it.",
        how: "Read slowly and pause at each dollar amount so they can write.",
      },
      {
        name: "Saving and spending", minutes: 5, slides: "Slide 9",
        what: "Spending means using money to buy goods. Saving means keeping money for the future. Ask how they'd spend a dollar and how they save. Explain that a bank pays interest to savers, for example five cents a year for every dollar.",
        script: "How would you spend a dollar? Where do you save your money? Why might someone use a bank instead of a piggy bank?",
        how: "Write their answers in two columns: SPEND and SAVE.",
      },
      {
        name: "Borrowing and lending", minutes: 4, slides: "Slides 10–11",
        what: "If you want a bike but don't have enough money, you can save, earn, or borrow. A loan means borrowing and promising to repay more than you borrowed, because the bank charges interest. Banks lend out the money savers put in.",
        script: "Imagine you want a new bike but don't have enough money. What could you do?",
        how: "Let students list ideas before you mention borrowing.",
      },
      {
        name: "Savers and borrowers role-play", minutes: 7, slides: "Slides 12–13", activity: true,
        what: "Three people act out the script. A saver deposits $500 at 2% interest. A borrower borrows $500 for college at 5% interest. A year later the borrower repays $525 and the saver withdraws $510.",
        script: "We're going to show you a little play about saving and borrowing at a bank. Watch where the money goes!",
        how: "Print the script on separate cards. You can play the banker and pick two students to be the saver and the borrower.",
      },
      {
        name: "Why banks charge more", minutes: 3, slides: "Slide 14",
        what: "Ask why the bank charges borrowers more interest than it pays savers. Banks are businesses: the difference is their profit. When you save in a bank, you make money too.",
        script: "The borrower paid $25 in interest, but the saver only got $10. Where did the other $15 go?",
        how: "Let students guess before you explain. Suggest they ask a grown-up for a tour of a local bank.",
      },
      {
        name: "Thank you & wrap-up", minutes: 2, slides: "Slide 15",
        what: "Thank the class. Saving is a great habit: think before you spend, and save some for the big things.",
        script: "It's easy to spend money right away. Saving is a great habit to start now!",
        how: "Hand out the parent toolkit or take-home card.",
      },
    ],
  },

  "investing-tomorrow": {
    deck: "Grade 4: Investing in Tomorrow",
    book: { title: "\"The Ant and the Grasshopper\" (a modern money version of Aesop's fable, in the slides)", author: "" },
    bigIdea: "Every choice has an opportunity cost. Saving now, in a bank that pays interest, and investing over time with compound interest can build what you need for the future.",
    vocab: [
      { term: "Opportunity cost", def: "What you give up when you make a choice." },
      { term: "Saving", def: "Keeping money for later instead of spending it now." },
      { term: "ATM", def: "Automated teller machine: a machine for depositing or taking out money from your bank account." },
      { term: "Investing", def: "Leaving money alone in a plan so it can grow over a long time." },
      { term: "Compound interest", def: "Earning interest on your interest, so money grows faster and faster, like a rolling snowball." },
    ],
    materials: ["Grade 4 worksheet (one per student)", "Grade 4 vocabulary check", "List of local banks and credit unions near your school"],
    steps: [
      {
        name: "Question of the Day", minutes: 4, slides: "Slides 2–3",
        what: "Would you rather have $1 million, or a penny that doubles every day for 30 days? Take a vote, then reveal: the doubling penny grows to over $5 million.",
        script: "Would you rather we give you a million dollars, or a penny that doubles every day for 30 days?",
        how: "Have students stand on one side of the room for each choice. Come back to this when you teach compound interest.",
      },
      {
        name: "Welcome & introductions", minutes: 3, slides: "Slide 4",
        what: "Introduce each presenter. Today's lesson uses a modern version of an old Aesop's fable to show why saving matters, plus where to save locally and how to build wealth over time.",
        script: "We're high school students taking a class about money. Today we'll use a story to show why saving matters.",
        how: "Replace the deck's local bank names with banks and credit unions near your school.",
      },
      {
        name: "Vocabulary", minutes: 3, slides: "Slide 5",
        what: "Introduce opportunity cost, saving, ATM, investing, and compound interest.",
        script: "Here are five words you'll hear in today's story. Listen for them!",
        how: "Hand out the vocabulary check now and have students fill it in at the end.",
      },
      {
        name: "Opportunity cost: every choice has consequences", minutes: 5, slides: "Slides 6–7", activity: true,
        what: "Go through the examples: soccer at recess means no basketball; watching TV means no studying; buying a video game means no snack with that money; spending everything now means less for college or a house later. Then students do the worksheet activity.",
        script: "Every choice you make has a consequence. If you play soccer at recess, what do you give up?",
        how: "Ask students for one choice of their own and its opportunity cost before they start the worksheet.",
      },
      {
        name: "Fable: The Ant and the Grasshopper", minutes: 9, slides: "Slides 8–19",
        what: "Explain what a fable is and read the classic moral. Then read the modern money version: Sam the grasshopper spends every quarter on the claw machine, while Sandra the ant saves at the bank and earns interest. Months later, Sam can't afford anything and asks Sandra to teach him.",
        script: "A fable is a short story, often with animals, that teaches a lesson. Listen for the moral at the end!",
        how: "Two presenters can read it as Sam and Sandra. The moral: if you do nothing but play today, you may have nothing left for tomorrow.",
      },
      {
        name: "Plan your future: save in a bank", minutes: 4, slides: "Slides 20–22",
        what: "Three steps to plan your financial future. #1 Make smart decisions, because every choice has an opportunity cost. #2 Open a savings account: it's safe and earns interest. You need a parent or guardian with you, and birthday money, allowance, or job money can all go in.",
        script: "How can you plan for your future? First, make smart choices. Second, open a savings account at a local bank with a grown-up.",
        how: "Show the list of local banks and credit unions you prepared.",
      },
      {
        name: "Compound interest", minutes: 5, slides: "Slides 23–25",
        what: "#3 Invest to build wealth over time. There's no getting rich quick. The key is compound interest, which works like rolling a snowball. Show the chart: saving $5 a month from birth grows to about $2,158 by age 18 and $4,333 by 25 (hypothetical, at 8% a year). Long-term options are shared with parents.",
        script: "Remember the doubling penny? Compound interest works like rolling a snowball: the bigger it gets, the faster it grows.",
        how: "Point out that the numbers are examples, not promises. The deck lists Wisconsin options. In Virginia, the state's college savings plan is Virginia529.",
      },
      {
        name: "Thank you & wrap-up", minutes: 2, slides: "Slide 26",
        what: "Thank the class. Choices come with opportunity costs, so plan to save for the short term and invest for the long term. Talk with your parents about which plan works for you.",
        script: "Thanks for having us! Remember: save for the short term, invest for the long term, and every choice has an opportunity cost.",
        how: "Collect the vocabulary check and hand out the take-home card.",
      },
    ],
  },

  "money-tales": {
    deck: "Planet Zeee and the Money Tree (Ally's partner lesson, Grades 1–4)",
    book: { title: "Planet Zeee and the Money Tree", author: "Ally Adventures with Money (allyadventureswithmoney.com)" },
    bigIdea: "Money is earned, not grown on trees. Spend it wisely, and save some for later.",
    vocab: [
      { term: "Earn", def: "Get money by doing work." },
      { term: "Spend wisely", def: "Think before you buy, and choose what matters most." },
      { term: "Save", def: "Keep some money for later." },
      { term: "Give back", def: "Use some money or time to help others." },
    ],
    materials: ["The book Planet Zeee and the Money Tree", "Materials for the Planet Zeee game"],
    steps: [
      {
        name: "Welcome & introductions", minutes: 3, slides: "Slides 2–5",
        what: "Introduce each presenter. Explain you're high school students taking a financial literacy course, with an important lesson for younger students too.",
        script: "We're high school students, and we brought a story about kids from another planet who've never seen money!",
        how: "Keep it short and excited. The story is the hook.",
      },
      {
        name: "Story: Planet Zeee and the Money Tree", minutes: 10, slides: "Slides 6–7",
        what: "Three children from another planet come to Earth confused about money. Earth kids explain how money is earned, why it's important to save, and why to give back. Listen for three ideas: where money comes from, how to spend wisely, and why to save.",
        script: "Listen for three big ideas in this story: where money comes from, how to spend it wisely, and why saving matters.",
        how: "Hold up three fingers and count off the ideas when they appear in the story.",
      },
      {
        name: "Planet Zeee game", minutes: 8, slides: "Slide 8", activity: true,
        what: "Play the Planet Zeee game from the deck to practice the story's ideas.",
        script: "Now let's see if you could teach the kids from Planet Zeee about money!",
        how: "Follow the game slide in the deck. Keep everyone answering at once, with thumbs or by moving, so nobody waits.",
      },
      {
        name: "What did we learn?", minutes: 5, slides: "Slide 9",
        what: "Discuss the three ideas: Where does money come from? How can we spend our money wisely? Why is it important to save?",
        script: "So, where does money come from? Does it grow on trees?",
        how: "Take an answer for each question from a different student.",
      },
      {
        name: "Thank you & wrap-up", minutes: 2, slides: "Slide 10",
        what: "Thank the class. Every want has a cost, so make good choices and save some for the big things.",
        script: "It's easy to spend money right away, but making good choices and saving is a great habit to learn!",
        how: "Hand out the parent toolkit or take-home card.",
      },
    ],
  },
};
