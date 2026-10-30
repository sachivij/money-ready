/*
 * game-bank.js — Rounds for the games the Workshop Builder makes
 * --------------------------------------------------------------
 * Every topic has two sets of rounds:
 *   picture -> Grades K–2. Two answers, each a big picture and one or two
 *              words. The question is one short sentence a volunteer (or
 *              the "Hear it" button) reads aloud. `why` is one sentence.
 *   rounds  -> Grades 3–12. Three or four answers with a picture each.
 *
 * Round shape: { q, opts: [[emoji, label], ...], best, why, src }
 *   best -> index of the right answer in opts (the game shuffles them)
 *   src  -> optional KB_SRC key (helper-kb.js) naming where the fact comes
 *           from. Rounds on EXTRA_TOPICS always show a source.
 *
 * EXTRA_TOPICS are topics that aren't modules. Each one is written from a
 * named U.S. government consumer-education source (the same list the
 * Standards Helper uses), so a volunteer can teach it without guessing.
 * To add a topic: copy one below, keep every fact general and stable (no
 * figures that change every year), and cite a KB_SRC key on every round.
 * Nothing here is fetched; it is all written in advance.
 *
 * Educational only. Never ask students about family money.
 */
var GAME_BANK = {
  // ================================================================
  // MODULES
  // ================================================================
  "needs-vs-wants": {
    picture: [
      { q: "Which one do we need?", opts: [["💧", "Water"], ["🍭", "Candy"]], best: 0, why: "We need water to live. Candy is a want." },
      { q: "Which one is a want?", opts: [["🎮", "Video game"], ["🧥", "Warm coat"]], best: 0, why: "A game is fun, but we can live without it." },
      { q: "Which one do we need?", opts: [["🏠", "A home"], ["🎈", "Balloons"]], best: 0, why: "A home keeps us safe and warm." },
      { q: "Which one is a want?", opts: [["🥦", "Healthy food"], ["🧸", "New toy"]], best: 1, why: "A toy is nice to have. Food is a need." },
      { q: "We only have a little money. What first?", opts: [["🍎", "Food"], ["🪀", "Toy"]], best: 0, why: "Needs come first. Wants come after." },
    ],
    rounds: [
      { q: "Which of these is a need?", opts: [["🥪", "Lunch"], ["🎧", "New headphones"], ["🍿", "Movie snacks"], ["🧢", "A fifth hat"]], best: 0, why: "Food is a need. The others are nice to have but you can live without them." },
      { q: "Tyya's dad buys healthy food, not just treats. Why?", opts: [["🥕", "Healthy food is a need"], ["😠", "He doesn't like treats"], ["💸", "Treats are free"]], best: 0, why: "Grown-ups spend on needs first. Treats are wants that come after." },
      { q: "You need new shoes. Which is the need, and which part is a want?", opts: [["👟", "Shoes are the need; the fancy brand is the want"], ["✨", "The fancy brand is the need"], ["🤷", "Shoes are always a want"]], best: 0, why: "The same thing can have a need part (shoes that fit) and a want part (the brand)." },
      { q: "Why can't we have everything we want?", opts: [["💵", "Our resources, like money, run out"], ["🚫", "Wants are bad"], ["🏪", "Stores don't sell wants"]], best: 0, why: "Money is a resource, and there is never enough of it for everything, so we choose." },
      { q: "Can something be a need for one person and a want for another?", opts: [["👓", "Yes, like glasses"], ["❌", "No, never"], ["🎲", "Only toys"]], best: 0, why: "Glasses are a need for someone who can't see well and a want for someone who wears them for style." },
    ],
  },

  "opportunity-costs": {
    picture: [
      { q: "You pick the book. What did you give up?", opts: [["🍦", "Ice cream"], ["📚", "Book"]], best: 0, why: "You gave up the ice cream. That is the opportunity cost." },
      { q: "You can play one game. Pick one!", opts: [["⚽", "Soccer"], ["🧩", "Puzzle"]], best: -1, why: "Any choice is OK! What you did NOT pick is what you gave up." },
      { q: "You pick the park. What did you give up?", opts: [["🛝", "Park"], ["📺", "TV show"]], best: 1, why: "You gave up the TV show to go to the park." },
      { q: "Can we pick everything?", opts: [["🙅", "No"], ["🙆", "Yes"]], best: 0, why: "We have to choose. Picking one means giving up another." },
    ],
    rounds: [
      { q: "You spend $5 on a book instead of ice cream with a friend. What is the opportunity cost?", opts: [["🍦", "The ice cream with your friend"], ["💵", "The $5"], ["📚", "The book"], ["0️⃣", "Nothing"]], best: 0, why: "Opportunity cost is the next-best thing you gave up, not the money you spent." },
      { q: "Saturday: soccer game or a birthday party, both at noon. You pick soccer. What is the opportunity cost?", opts: [["🎂", "The birthday party"], ["⚽", "The soccer game"], ["⏰", "Noon"]], best: 0, why: "The party is what you gave up by choosing soccer." },
      { q: "Is opportunity cost always about money?", opts: [["⏳", "No, it can be time or fun"], ["💲", "Yes, always money"], ["🤔", "Only for grown-ups"]], best: 0, why: "Giving up an hour of play or time with a friend is an opportunity cost too." },
      { q: "Two friends make the same choice. Do they give up the same thing?", opts: [["👯", "Not always, it depends what each wanted next"], ["✅", "Yes, always"], ["❌", "Nobody gives anything up"]], best: 0, why: "Opportunity cost depends on each person's next-best choice." },
      { q: "What is a trade-off?", opts: [["⚖️", "Giving up some of one thing to get more of another"], ["🛒", "A kind of store"], ["🎁", "Getting something free"]], best: 0, why: "Every choice is a trade-off: more of one thing, less of another." },
    ],
  },

  "save-or-spend": {
    picture: [
      { q: "Where does saved money go?", opts: [["🐷", "Piggy bank"], ["🗑️", "Trash"]], best: 0, why: "We keep saved money safe in a piggy bank or a bank." },
      { q: "Want a big toy later? Now we…", opts: [["🫙", "Save"], ["🍬", "Spend"]], best: 0, why: "Saving now helps you get the big thing later." },
      { q: "Which one is spending?", opts: [["🛒", "Buying a snack"], ["🐷", "Coins in a piggy bank"]], best: 0, why: "Spending means using money to buy something." },
      { q: "Your jar fills up slowly. What helps?", opts: [["⏳", "Wait and keep saving"], ["😩", "Give up"]], best: 0, why: "Saving takes time. Keep going!" },
    ],
    rounds: [
      { q: "You get $10. You want a $30 game. What is the best plan?", opts: [["🫙", "Save some each week until you have $30"], ["🛍️", "Spend the $10 on something else now"], ["🤝", "Borrow $20 from a friend"]], best: 0, why: "A savings goal and a little each week gets you there without owing anyone." },
      { q: "What is a savings goal?", opts: [["🎯", "Something you are saving up for"], ["🥅", "A sports net"], ["💳", "A way to spend faster"]], best: 0, why: "A goal gives your saving a reason, so it is easier to keep going." },
      { q: "Why keep savings in a bank instead of under your bed?", opts: [["🏦", "It's safer and can earn interest"], ["🛏️", "Beds are for sleeping"], ["🎲", "No reason"]], best: 0, why: "Banks keep money safe and many pay a little interest to savers." },
      { q: "Which is an example of saving?", opts: [["🐷", "Putting part of your birthday money away"], ["🍕", "Buying pizza with all of it"], ["🎟️", "Buying a movie ticket"]], best: 0, why: "Saving means keeping some money to use later." },
      { q: "What is 'pay yourself first'?", opts: [["🫙", "Save a part as soon as you get money"], ["🧾", "Pay your bills last"], ["🛒", "Buy what you want first"]], best: 0, why: "Saving first means it actually happens, before the money gets spent." },
    ],
  },

  "investing-tomorrow": {
    picture: [
      { q: "A seed needs time. What happens if we wait?", opts: [["🌳", "It grows"], ["🪨", "Nothing"]], best: 0, why: "With time and care, a seed grows. Money can grow too." },
      { q: "Should we dig up the seed every day?", opts: [["🙅", "No, wait"], ["⛏️", "Yes, dig"]], best: 0, why: "Digging it up stops the growing. Be patient." },
      { q: "Which one grows bigger?", opts: [["🌳", "Planted long ago"], ["🌱", "Planted today"]], best: 0, why: "More time means more growing." },
      { q: "What helps money grow?", opts: [["⏳", "Time"], ["🎈", "Balloons"]], best: 0, why: "Saving or investing for a long time helps money grow." },
    ],
    rounds: [
      { q: "What does investing mean?", opts: [["🌱", "Putting money somewhere it can grow over time"], ["🛍️", "Spending money fast"], ["🗄️", "Hiding money in a drawer"]], best: 0, why: "Investing puts money to work so it can grow, like planting a seed." },
      { q: "Who will have more: someone who starts saving at 15 or at 35 (same amount each year)?", opts: [["🧒", "The one who starts at 15"], ["🧑", "The one who starts at 35"], ["🟰", "They end up the same"]], best: 0, why: "Starting early gives the money more years to grow." },
      { q: "What is interest?", opts: [["➕", "Extra money paid for letting someone use your money"], ["😴", "Being bored"], ["🧾", "A kind of bill"]], best: 0, why: "Banks pay savers interest, and money that earns interest grows." },
      { q: "Can an investment lose value?", opts: [["📉", "Yes, sometimes, which is why we're patient"], ["🚫", "No, never"], ["💥", "Only if you look at it"]], best: 0, why: "Investments can go down as well as up. Waiting through the dips is part of investing." },
      { q: "What does 'compound' growth mean?", opts: [["🔁", "Your earnings start earning too"], ["🧱", "A building"], ["➖", "Money shrinking"]], best: 0, why: "When interest earns interest, money grows faster and faster over time." },
    ],
  },

  "money-tales": {
    picture: [
      { q: "Where does money come from?", opts: [["👷", "Work"], ["🌳", "A tree"]], best: 0, why: "People earn money by working." },
      { q: "The tree grows money slowly. What do we do?", opts: [["🫶", "Take care of it"], ["🪓", "Chop it"]], best: 0, why: "Caring and waiting keeps good things growing." },
      { q: "Which is a way to give back?", opts: [["🎁", "Share with others"], ["🔒", "Keep it all"]], best: 0, why: "Sharing helps other people." },
      { q: "Emma wants a phone now. What is smart?", opts: [["🫙", "Save for it"], ["😤", "Grab it"]], best: 0, why: "Saving lets you buy it the right way." },
    ],
    rounds: [
      { q: "In Planet Zeee, the visitors don't understand money. Where does money really come from?", opts: [["👷", "People earn it by working"], ["🌳", "It grows on trees"], ["🖨️", "Anyone can print it"]], best: 0, why: "Money is earned by working or making something people want." },
      { q: "What are the three big ideas from Planet Zeee?", opts: [["💡", "Where money comes from, spend wisely, save"], ["🚀", "Rockets, planets, stars"], ["🎲", "Win, lose, tie"]], best: 0, why: "Earn, spend wisely, and save (and give back) are the story's lessons." },
      { q: "A character wants to take all the money off the tree today. What's the problem?", opts: [["🍂", "Nothing will be left to grow later"], ["🙂", "No problem at all"], ["🌧️", "It might rain"]], best: 0, why: "Taking everything now leaves nothing for later. Patience keeps it going." },
      { q: "Why do we read money stories?", opts: [["📖", "To learn from a character's choices"], ["😴", "To fall asleep"], ["🎨", "Only for the pictures"]], best: 0, why: "Stories let us see what happens without making the mistake ourselves." },
    ],
  },

  "budget-battle": {
    picture: [
      { q: "What do we pay for first?", opts: [["🥪", "Lunch"], ["🎮", "Game"]], best: 0, why: "Needs first, wants later." },
      { q: "A plan for money is called…", opts: [["📝", "A budget"], ["🎈", "A party"]], best: 0, why: "A budget is a plan for your money." },
      { q: "3 coins. The toy costs 5. Enough?", opts: [["🙅", "No"], ["🙆", "Yes"]], best: 0, why: "3 is less than 5. You need to save more." },
      { q: "Where should some money go?", opts: [["🐷", "Savings"], ["🕳️", "Lost"]], best: 0, why: "Put some money away to save." },
    ],
    rounds: [
      { q: "What is a budget?", opts: [["📝", "A plan for how you will use your money"], ["🧾", "A bill"], ["🚫", "A rule against spending"]], best: 0, why: "A budget is a plan that lets you choose before the money is gone." },
      { q: "You have $25: lunch tomorrow, a game skin, and $5 you promised to save. What first?", opts: [["🫙", "Save $5 and set aside lunch, then decide on the skin"], ["🎮", "Buy the skin first"], ["🎲", "Spend it all and see"]], best: 0, why: "Cover needs and savings first. Wants get what's left." },
      { q: "What is a fixed expense?", opts: [["📌", "A cost that's the same every time, like a phone plan"], ["🔧", "Something you repair"], ["🍕", "A snack you buy sometimes"]], best: 0, why: "Fixed costs stay the same; variable costs like snacks change." },
      { q: "Your spending is more than your income. What happens?", opts: [["⚠️", "You run short or go into debt"], ["😎", "Nothing"], ["🎉", "You save more"]], best: 0, why: "Spending more than you earn means borrowing or running out." },
      { q: "A popular budget idea splits money into needs, wants and…", opts: [["🫙", "Savings"], ["🍬", "Candy"], ["🎮", "Games"]], best: 0, why: "Needs, wants and savings is a simple way to plan." },
    ],
  },

  "credit-climb": {
    picture: [
      { q: "You borrow a pencil. What do you do?", opts: [["↩️", "Give it back"], ["🎒", "Keep it"]], best: 0, why: "When we borrow, we give it back." },
      { q: "Will a friend lend again if you pay back?", opts: [["😊", "Yes"], ["😠", "No"]], best: 0, why: "Paying back builds trust." },
      { q: "Which one is borrowing?", opts: [["📚", "Library book"], ["🎁", "A gift"]], best: 0, why: "You borrow a library book and bring it back." },
      { q: "Pay back on time or late?", opts: [["⏰", "On time"], ["🐢", "Late"]], best: 0, why: "On time is best. It shows you can be trusted." },
    ],
    rounds: [
      { q: "What is credit?", opts: [["🤝", "Borrowing now and promising to pay later"], ["🎁", "Free money"], ["🫙", "Savings"]], best: 0, why: "Credit lets you buy now, but you must pay it back, often with interest.", src: "cfpb" },
      { q: "What helps a credit score the most?", opts: [["⏰", "Paying bills on time"], ["🛍️", "Opening lots of cards"], ["🙈", "Ignoring bills"]], best: 0, why: "Paying on time is the biggest part of a good credit history.", src: "cfpb" },
      { q: "You only pay the minimum on a credit card. What happens?", opts: [["📈", "You pay much more interest and it takes longer"], ["🎉", "The rest is forgiven"], ["0️⃣", "No extra cost"]], best: 0, why: "The unpaid balance keeps charging interest month after month.", src: "cfpb" },
      { q: "What is interest on a loan?", opts: [["💲", "The extra cost of borrowing"], ["😀", "How much you like the loan"], ["🎁", "A reward"]], best: 0, why: "Interest is what lenders charge you for using their money." },
      { q: "Who might look at your credit report?", opts: [["🏠", "Landlords and lenders"], ["🍦", "The ice cream truck"], ["🏫", "Your classmates"]], best: 0, why: "Lenders, landlords and some employers check credit to see if you pay what you owe.", src: "cfpb" },
    ],
  },

  "paycheck-puzzle": {
    picture: [
      { q: "How do grown-ups get paid?", opts: [["👷", "Work"], ["🎈", "Magic"]], best: 0, why: "People get paid for working." },
      { q: "Do you keep all your pay?", opts: [["🧾", "Some goes to taxes"], ["💯", "Keep all"]], best: 0, why: "Some pay goes to taxes that help everyone." },
      { q: "Taxes help pay for…", opts: [["🏫", "Schools"], ["🍭", "Your candy"]], best: 0, why: "Taxes pay for schools, roads and parks." },
      { q: "More hours of work means…", opts: [["➕", "More pay"], ["➖", "Less pay"]], best: 0, why: "For hourly jobs, more hours means more pay." },
    ],
    rounds: [
      { q: "What is gross pay?", opts: [["💵", "Pay before anything is taken out"], ["🧾", "Pay after taxes"], ["🤢", "Pay that's gross"]], best: 0, why: "Gross pay is the full amount you earned before deductions." },
      { q: "What is net pay?", opts: [["🧾", "What you actually take home"], ["🥅", "Money for sports"], ["➕", "Pay plus a bonus"]], best: 0, why: "Net pay is what's left after taxes and other deductions." },
      { q: "Why is your first paycheck smaller than hours × rate?", opts: [["🏛️", "Taxes and deductions are taken out"], ["😈", "Your boss kept some"], ["🐛", "It's a mistake"]], best: 0, why: "Taxes like income tax, Social Security and Medicare come out first.", src: "irs" },
      { q: "Which form tells your employer how much tax to hold back?", opts: [["📄", "Form W-4"], ["🎫", "A movie ticket"], ["📓", "Your report card"]], best: 0, why: "You fill out a W-4 when you start a job.", src: "irs" },
      { q: "What do Social Security taxes help pay for?", opts: [["👵", "Benefits for retirees and people with disabilities"], ["🎮", "Video games"], ["🏖️", "Your vacation"]], best: 0, why: "Workers pay in now and get benefits later.", src: "ssa" },
    ],
  },

  "smart-shopping": {
    picture: [
      { q: "Same toy. Which is the better deal?", opts: [["🏷️", "$3"], ["💰", "$5"]], best: 0, why: "Same toy, lower price. That's the deal!" },
      { q: "Before buying, what should we do?", opts: [["🤔", "Stop and think"], ["🏃", "Grab it fast"]], best: 0, why: "Stop and think: do I need it?" },
      { q: "An ad says WOW! Do you need it?", opts: [["🤔", "Maybe not"], ["🤩", "Yes, buy!"]], best: 0, why: "Ads want you to buy. Think first." },
      { q: "Which is more?", opts: [["🍪🍪🍪", "3 cookies"], ["🍪", "1 cookie"]], best: 0, why: "Three is more than one." },
    ],
    rounds: [
      { q: "A 12-pack of juice is $6. A 6-pack is $4. Which is the better price per can?", opts: [["📦", "The 12-pack ($0.50 each)"], ["🧃", "The 6-pack (about $0.67 each)"], ["🟰", "They're the same"]], best: 0, why: "Divide the price by how many you get to compare unit price." },
      { q: "What is comparison shopping?", opts: [["🔍", "Checking prices in different places before buying"], ["🏃", "Buying the first one you see"], ["🧮", "Counting your coins"]], best: 0, why: "Comparing helps you find the best value." },
      { q: "An ad says 'Only 2 left! Buy now!' Why?", opts: [["⏳", "To rush you into buying"], ["🎁", "To be nice"], ["📦", "It's always true"]], best: 0, why: "Pressure to hurry is a sales trick. Slow down and think.", src: "ftc" },
      { q: "A cheaper shirt falls apart in a month. A pricier one lasts years. Which is better value?", opts: [["⏳", "The one that lasts"], ["🏷️", "Always the cheapest"], ["🤷", "Doesn't matter"]], best: 0, why: "Value means what you get for your money, not just the price tag." },
      { q: "What should you check before buying something online?", opts: [["⭐", "Reviews, the return policy and the total with shipping"], ["🎨", "Just the color"], ["🙈", "Nothing"]], best: 0, why: "Shipping, returns and reviews change whether it is a good deal.", src: "ftc" },
    ],
  },

  "fraud-red-flags": {
    picture: [
      { q: "A stranger online asks your name. Tell?", opts: [["🙅", "No"], ["🙆", "Yes"]], best: 0, why: "Keep your private things private. Tell a grown-up." },
      { q: "Something online feels weird. Who do you tell?", opts: [["🧑‍🏫", "A grown-up"], ["🤫", "Nobody"]], best: 0, why: "Always tell a trusted grown-up." },
      { q: "'You won a prize! Send money!' Real?", opts: [["🚩", "Trick"], ["🎁", "Real"]], best: 0, why: "Real prizes don't ask you to pay." },
      { q: "Your password is…", opts: [["🔒", "A secret"], ["📢", "For everyone"]], best: 0, why: "Passwords are secret. Only share with your grown-up." },
    ],
    rounds: [
      { q: "A text says you won a phone but must pay a $5 fee with a gift card. What is it?", opts: [["🚩", "A scam"], ["🎁", "A real prize"], ["🤷", "Can't tell"]], best: 0, why: "Real prizes never ask you to pay, and gift-card payment is a big red flag.", src: "ftc" },
      { q: "Which is a red flag in a message?", opts: [["⏰", "'Act now or lose it!'"], ["👋", "'Hi, see you at practice'"], ["📅", "'School starts at 8'"]], best: 0, why: "Scammers rush you so you don't stop and think.", src: "ftc" },
      { q: "Someone asks for your password to 'fix your account'. What do you do?", opts: [["🛑", "Never share it; tell a trusted adult"], ["🔑", "Send it quickly"], ["🤝", "Share half of it"]], best: 0, why: "Real companies don't ask for your password.", src: "ftc" },
      { q: "What is phishing?", opts: [["🎣", "Fake messages trying to steal your information"], ["🐟", "A weekend hobby"], ["📧", "Any email"]], best: 0, why: "Phishing messages pretend to be someone you trust.", src: "ftc" },
      { q: "If you think you've been scammed, what should you do?", opts: [["📣", "Tell a trusted adult and report it"], ["🤫", "Keep it secret"], ["🔁", "Send more money to fix it"]], best: 0, why: "Telling someone fast limits the damage. Scams can be reported to the FTC.", src: "ftc" },
    ],
  },

  "banking-basics": {
    picture: [
      { q: "Where is money safe?", opts: [["🏦", "Bank"], ["🌳", "Under a tree"]], best: 0, why: "A bank keeps money safe." },
      { q: "Put money in the bank. That's called…", opts: [["⬇️", "Deposit"], ["🎉", "Party"]], best: 0, why: "Putting money in is a deposit." },
      { q: "The bank pays you a little for saving. Yes?", opts: [["🙆", "Yes"], ["🙅", "No"]], best: 0, why: "Banks pay interest to savers." },
      { q: "Which one is a bank card?", opts: [["💳", "Card"], ["🃏", "Game card"]], best: 0, why: "A bank card lets you use money from your account." },
    ],
    rounds: [
      { q: "What is a deposit?", opts: [["⬇️", "Putting money into your account"], ["⬆️", "Taking money out"], ["🧾", "A fee"]], best: 0, why: "Deposit in, withdrawal out." },
      { q: "What does FDIC insurance do?", opts: [["🛡️", "Protects your money if an insured bank fails"], ["🚗", "Covers your car"], ["📈", "Makes stocks go up"]], best: 0, why: "Deposits at FDIC-insured banks are protected up to the legal limit.", src: "fdic" },
      { q: "Debit card or credit card: which uses money already in your account?", opts: [["💳", "Debit card"], ["🪪", "Credit card"], ["🟰", "Both"]], best: 0, why: "Debit takes money from your account; credit is borrowed.", src: "cfpb" },
      { q: "What is a checking account mostly for?", opts: [["🔁", "Everyday spending and paying bills"], ["🔒", "Long-term saving only"], ["🎟️", "Buying lottery tickets"]], best: 0, why: "Checking is for money in and out; savings is for keeping money." },
      { q: "A credit union is…", opts: [["🤝", "A member-owned place to bank"], ["🎓", "A school club"], ["🏪", "A store"]], best: 0, why: "Credit unions offer accounts like banks, and members own them.", src: "ncua" },
    ],
  },

  "college-cost-choices": {
    picture: [
      { q: "What do you want to be?", opts: [["🧑‍🚒", "Firefighter"], ["🧑‍⚕️", "Doctor"]], best: -1, why: "Any dream is great! Learning helps you get there." },
      { q: "Learning more can help you…", opts: [["🚀", "Do more jobs"], ["😴", "Sleep"]], best: 0, why: "School opens doors to more jobs." },
      { q: "Saving for school starts…", opts: [["🌱", "Early"], ["⏰", "Never"]], best: 0, why: "Saving early helps a lot." },
      { q: "Free money for school is called…", opts: [["🏆", "Scholarship"], ["🍕", "Pizza"]], best: 0, why: "Scholarships are money you don't pay back." },
    ],
    rounds: [
      { q: "What is the FAFSA?", opts: [["📄", "The form to apply for federal student aid"], ["🎓", "A college"], ["💳", "A credit card"]], best: 0, why: "Filling out the FAFSA is how students apply for federal grants, work-study and loans.", src: "fsa" },
      { q: "Which kind of aid usually does NOT have to be paid back?", opts: [["🎁", "Grants and scholarships"], ["🏦", "Loans"], ["💳", "Credit cards"]], best: 0, why: "Grants and scholarships are gift aid; loans are borrowed.", src: "fsa" },
      { q: "Community college first, then transfer. Why might someone do that?", opts: [["💵", "Lower cost for the first years"], ["🚫", "You can't transfer"], ["🎲", "No reason"]], best: 0, why: "Starting at a community college can lower the total cost of a degree." },
      { q: "What is a 529 plan?", opts: [["🎓", "A savings account for education"], ["📱", "A phone plan"], ["🏠", "A mortgage"]], best: 0, why: "529 plans help families save for education costs.", src: "va529" },
      { q: "When comparing colleges, which number matters most?", opts: [["🧮", "Net price after aid"], ["🏷️", "Sticker price only"], ["🏈", "Stadium size"]], best: 0, why: "Net price is what you'd actually pay after grants and scholarships.", src: "fsa" },
    ],
  },

  "investing-mythbusters": {
    picture: [
      { q: "Put all eggs in one basket?", opts: [["🧺🧺", "Use many baskets"], ["🧺", "One basket"]], best: 0, why: "If one basket drops, the rest are safe." },
      { q: "Money grows best with…", opts: [["⏳", "Lots of time"], ["⚡", "One day"]], best: 0, why: "Growing takes time." },
      { q: "'Get rich fast!' True?", opts: [["🚩", "Probably a trick"], ["🤑", "True"]], best: 0, why: "Fast and easy money is usually a trick." },
      { q: "Over many years, invested money usually…", opts: [["🌳", "Grows"], ["🥀", "Disappears"]], best: 0, why: "Over a long time, it usually grows." },
    ],
    rounds: [
      { q: "Myth or fact: 'You need to be rich to start investing.'", opts: [["❌", "Myth"], ["✅", "Fact"]], best: 0, why: "Many accounts let you start with small amounts.", src: "sec" },
      { q: "What does diversification mean?", opts: [["🧺", "Spreading money across many investments"], ["🎯", "Putting it all in one stock"], ["🗄️", "Keeping cash in a drawer"]], best: 0, why: "Spreading out lowers the risk that one bad pick hurts you a lot.", src: "sec" },
      { q: "Someone promises 'guaranteed high returns, no risk'. What is it?", opts: [["🚩", "A big red flag for fraud"], ["💎", "A great deal"], ["🏦", "A savings account"]], best: 0, why: "Higher returns come with higher risk. 'Guaranteed' big returns is a classic fraud sign.", src: "sec" },
      { q: "What is a stock?", opts: [["🧩", "A small piece of ownership in a company"], ["🍲", "Soup"], ["📃", "A loan to the government"]], best: 0, why: "Owning stock means owning part of a company.", src: "sec" },
      { q: "Myth or fact: 'Time in the market usually beats timing the market.'", opts: [["✅", "Fact"], ["❌", "Myth"]], best: 0, why: "Trying to guess the perfect day to buy or sell is very hard. Staying invested longer usually works better.", src: "sec" },
    ],
  },

  // ================================================================
  // EXTRA TOPICS (not modules). Every round cites a source.
  // ================================================================
  "coins-counting": {
    picture: [
      { q: "Which coin is worth the most?", opts: [["🪙", "Quarter, 25 cents"], ["🟤", "Penny, 1 cent"]], best: 0, why: "A quarter is 25 cents. A penny is 1 cent.", src: "mint" },
      { q: "Which is worth more?", opts: [["🪙", "Dime, 10 cents"], ["🟤", "Penny, 1 cent"]], best: 0, why: "A dime is 10 cents. Small coin, more money!", src: "mint" },
      { q: "How many pennies make a nickel?", opts: [["🖐️", "Five"], ["✌️", "Two"]], best: 0, why: "Five pennies make one nickel.", src: "mint" },
      { q: "How many quarters make a dollar?", opts: [["🍀", "Four"], ["🔟", "Ten"]], best: 0, why: "Four quarters make one dollar.", src: "mint" },
    ],
    rounds: [
      { q: "Which coin is worth 10 cents?", opts: [["🪙", "Dime"], ["🟤", "Penny"], ["⚪", "Nickel"], ["🔵", "Quarter"]], best: 0, why: "The dime is the smallest coin but worth 10 cents.", src: "mint" },
      { q: "You have 2 quarters and 1 dime. How much is that?", opts: [["6️⃣", "60 cents"], ["3️⃣", "30 cents"], ["5️⃣", "35 cents"]], best: 0, why: "25 + 25 + 10 = 60 cents.", src: "mint" },
      { q: "Whose face is on the penny?", opts: [["🎩", "Abraham Lincoln"], ["🗽", "Lady Liberty"], ["🦅", "An eagle"]], best: 0, why: "Abraham Lincoln is on the penny.", src: "mint" },
      { q: "Which group makes exactly one dollar?", opts: [["🔟", "10 dimes"], ["5️⃣", "5 nickels"], ["5️⃣", "5 dimes"]], best: 0, why: "10 dimes × 10 cents = 100 cents = $1.", src: "mint" },
      { q: "Which U.S. agency makes coins?", opts: [["🏭", "The U.S. Mint"], ["🏦", "Your local bank"], ["🏫", "Schools"]], best: 0, why: "The United States Mint makes the country's coins.", src: "mint" },
    ],
  },

  "giving-sharing": {
    picture: [
      { q: "Which one is sharing?", opts: [["🤲", "Give a friend half"], ["🙈", "Hide it all"]], best: 0, why: "Sharing means giving some to others.", src: "cfpbKids" },
      { q: "We can give money, or we can give…", opts: [["⏰", "Our time and help"], ["🗑️", "Trash"]], best: 0, why: "Helping is a way to give too.", src: "cfpbKids" },
      { q: "Three jars: spend, save, and…", opts: [["💝", "Share"], ["🍬", "Candy"]], best: 0, why: "Spend, save, share!", src: "cfpbKids" },
      { q: "Giving makes others feel…", opts: [["😊", "Happy"], ["😢", "Sad"]], best: 0, why: "Giving helps others and feels good too.", src: "cfpbKids" },
    ],
    rounds: [
      { q: "What is a charity?", opts: [["🤝", "A group that helps people or causes"], ["🏪", "A store"], ["🏦", "A bank"]], best: 0, why: "Charities use donations to help people, animals or places.", src: "ftc" },
      { q: "A caller pressures you to donate right now with a gift card. What should you do?", opts: [["🛑", "Say no; real charities don't ask for gift cards"], ["🎁", "Buy the card"], ["🔁", "Call back later with the card number"]], best: 0, why: "Rushing and gift-card payment are signs of a charity scam.", src: "ftc" },
      { q: "Before giving to a charity, it's smart to…", opts: [["🔍", "Look up its exact name and what it does"], ["🎲", "Pick any name that sounds nice"], ["🙈", "Never check"]], best: 0, why: "Scammers use names that sound like real charities.", src: "ftc" },
      { q: "Which is a way to give without money?", opts: [["🧹", "Volunteering your time"], ["💳", "Using a credit card"], ["🛍️", "Shopping"]], best: 0, why: "Time and skills are valuable gifts too.", src: "cfpbKids" },
      { q: "Why plan how much to give?", opts: [["📝", "So giving fits your budget with needs and saving"], ["😬", "You shouldn't give"], ["💯", "Give everything always"]], best: 0, why: "A plan helps you give regularly without missing needs.", src: "cfpbKids" },
    ],
  },

  "taxes-community": {
    picture: [
      { q: "Taxes help pay for…", opts: [["🚒", "Fire trucks"], ["🧸", "Your toys"]], best: 0, why: "Taxes pay for things we all share.", src: "irs" },
      { q: "Which is paid for by taxes?", opts: [["🛝", "Public park"], ["🍦", "Your ice cream"]], best: 0, why: "Public parks are paid for with taxes.", src: "irs" },
      { q: "Who uses roads?", opts: [["👨‍👩‍👧‍👦", "Everyone"], ["🙋", "Only me"]], best: 0, why: "We all use roads, so we all help pay.", src: "irs" },
      { q: "The library is for…", opts: [["👫", "Everyone"], ["🔐", "Nobody"]], best: 0, why: "Libraries are shared and paid for by taxes.", src: "irs" },
    ],
    rounds: [
      { q: "What are taxes?", opts: [["🏛️", "Money people pay to fund government services"], ["🎁", "Gifts to friends"], ["🧾", "Store coupons"]], best: 0, why: "Taxes pay for things like schools, roads and public safety.", src: "irs" },
      { q: "A toy costs $10, but you pay a bit more at the register. Why?", opts: [["🧾", "Sales tax"], ["🎲", "Random price"], ["🤑", "A tip"]], best: 0, why: "Many states and cities add sales tax at checkout.", src: "irs" },
      { q: "How is income tax usually paid by workers?", opts: [["💼", "Taken out of each paycheck"], ["🪙", "Paid in coins at the bank"], ["🙅", "Workers never pay it"]], best: 0, why: "Employers withhold income tax from each paycheck.", src: "irs" },
      { q: "Which is NOT usually paid for with taxes?", opts: [["🎮", "Your personal video games"], ["🏫", "Public schools"], ["🛣️", "Highways"]], best: 0, why: "Taxes fund shared public services, not personal purchases.", src: "irs" },
      { q: "What is a tax return?", opts: [["📄", "A yearly form that reports income and taxes"], ["↩️", "Returning something to a store"], ["🎾", "A tennis shot"]], best: 0, why: "Filing a return figures out if you paid the right amount; you may get a refund.", src: "irs" },
    ],
  },

  "insurance-basics": {
    picture: [
      { q: "It might rain. What do you bring?", opts: [["☂️", "Umbrella"], ["🕶️", "Sunglasses"]], best: 0, why: "We plan for surprises. Insurance is like an umbrella for money.", src: "naic" },
      { q: "Riding a bike, you wear…", opts: [["⛑️", "Helmet"], ["🎩", "Top hat"]], best: 0, why: "A helmet protects you. Insurance protects money.", src: "naic" },
      { q: "Something breaks. Who helps pay?", opts: [["🛡️", "Insurance"], ["🧚", "A fairy"]], best: 0, why: "Insurance helps pay when bad things happen.", src: "naic" },
      { q: "Are surprises always fun?", opts: [["🙅", "No"], ["🙆", "Yes"]], best: 0, why: "Some surprises cost money. Planning helps.", src: "naic" },
    ],
    rounds: [
      { q: "What does insurance do?", opts: [["🛡️", "Helps pay for big, unexpected losses"], ["📈", "Makes money grow"], ["🎟️", "Gives you discounts"]], best: 0, why: "You pay a small amount regularly so a big loss doesn't fall on you alone.", src: "naic" },
      { q: "What is a premium?", opts: [["💵", "What you pay to keep your insurance"], ["⭐", "The best gas"], ["🎁", "A prize"]], best: 0, why: "The premium is your regular payment for coverage.", src: "naic" },
      { q: "What is a deductible?", opts: [["🧾", "The amount you pay before insurance pays"], ["➖", "A discount"], ["📄", "A kind of policy"]], best: 0, why: "A higher deductible usually means a lower premium, and more cost to you when something happens.", src: "naic" },
      { q: "Which insurance covers a renter's belongings?", opts: [["🏢", "Renters insurance"], ["🚗", "Car insurance"], ["🩺", "Health insurance"]], best: 0, why: "Renters insurance covers your stuff; the landlord's policy covers the building.", src: "naic" },
      { q: "Why do drivers need car insurance?", opts: [["⚖️", "States require it to cover damage or injuries"], ["🎨", "To change the car's color"], ["⛽", "For free gas"]], best: 0, why: "States set rules so drivers can pay for harm they cause.", src: "naic" },
    ],
  },

  "identity-safety": {
    picture: [
      { q: "Who can know your password?", opts: [["👨‍👩‍👧", "My grown-up"], ["👾", "Online stranger"]], best: 0, why: "Only share passwords with your grown-up.", src: "ftc" },
      { q: "A pop-up says click here! What do you do?", opts: [["🙋", "Ask a grown-up"], ["👆", "Click it"]], best: 0, why: "Ask first. Pop-ups can be tricks.", src: "ftc" },
      { q: "Your home address is…", opts: [["🔒", "Private"], ["📢", "For everyone"]], best: 0, why: "Keep where you live private online.", src: "ftc" },
      { q: "Which password is stronger?", opts: [["🦒🌮🚲", "Giraffe-Taco-Bike"], ["1️⃣2️⃣3️⃣", "123"]], best: 0, why: "Long, silly passwords are hard to guess.", src: "ftc" },
    ],
    rounds: [
      { q: "What is identity theft?", opts: [["🕵️", "Someone using your personal info to pretend to be you"], ["🎭", "Wearing a costume"], ["🔑", "Losing your keys"]], best: 0, why: "Thieves use names, birthdays and numbers to open accounts or take money.", src: "ftc" },
      { q: "Which should you keep private?", opts: [["🔢", "Your Social Security number"], ["⚽", "Your favorite sport"], ["🎨", "Your favorite color"]], best: 0, why: "Your SSN is a key to your identity. Share it only when truly required.", src: "ftc" },
      { q: "What makes a strong password?", opts: [["🔐", "Long and different for each account"], ["🎂", "Your birthday"], ["🔁", "The same one everywhere"]], best: 0, why: "Long, unique passwords (or passphrases) are hardest to crack.", src: "ftc" },
      { q: "A website offers a free game if you enter your parent's card number. What do you do?", opts: [["🛑", "Stop and ask a trusted adult"], ["⌨️", "Type it in"], ["📸", "Send a photo of the card"]], best: 0, why: "'Free' offers that ask for payment info are a common trick.", src: "ftc" },
      { q: "Where can someone report identity theft and get a recovery plan?", opts: [["🏛️", "IdentityTheft.gov (FTC)"], ["📱", "A social media post"], ["🛒", "A store"]], best: 0, why: "The FTC's IdentityTheft.gov gives step-by-step recovery plans.", src: "ftc" },
    ],
  },

  "earning-money": {
    picture: [
      { q: "How do grown-ups earn money?", opts: [["🧑‍🍳", "A job"], ["🌳", "Money tree"]], best: 0, why: "People earn money by working.", src: "dol" },
      { q: "Which one is a job?", opts: [["🧑‍🏫", "Teacher"], ["😴", "Napping"]], best: 0, why: "Teachers work and get paid.", src: "bls" },
      { q: "Helping at home is called…", opts: [["🧹", "Chores"], ["🎠", "Rides"]], best: 0, why: "Chores help the family.", src: "cfpbKids" },
      { q: "Can kids sell lemonade to earn?", opts: [["🍋", "Yes"], ["🙅", "No"]], best: 0, why: "Selling something is one way to earn.", src: "sba" },
    ],
    rounds: [
      { q: "Under federal rules, what is the usual youngest age for most non-farm jobs?", opts: [["1️⃣4️⃣", "14"], ["1️⃣0️⃣", "10"], ["1️⃣8️⃣", "18"]], best: 0, why: "Federal law generally sets 14 as the minimum age, with limits on hours for 14- and 15-year-olds.", src: "dol" },
      { q: "Why do 14- and 15-year-olds have limits on work hours on school days?", opts: [["🏫", "So work doesn't get in the way of school"], ["😴", "Because they nap"], ["🎲", "No reason"]], best: 0, why: "Federal rules limit hours so school comes first.", src: "dol" },
      { q: "What is a wage?", opts: [["⏱️", "Money paid for each hour you work"], ["🎁", "A gift"], ["🧾", "A bill"]], best: 0, why: "Hourly jobs pay a wage for each hour worked.", src: "dol" },
      { q: "On average, how does more education relate to earnings?", opts: [["📈", "More education tends to mean higher earnings"], ["📉", "Lower earnings"], ["🟰", "No difference"]], best: 0, why: "Government data show earnings tend to rise with more education, on average.", src: "bls" },
      { q: "Which is a way teens earn money besides a job?", opts: [["🐕", "Pet sitting or yard work for neighbors"], ["🎰", "Gambling"], ["💳", "Using a credit card"]], best: 0, why: "Small services for people you know are a common first business.", src: "sba" },
    ],
  },

  "rising-prices": {
    picture: [
      { q: "Long ago, ice cream cost…", opts: [["⬇️", "Less"], ["⬆️", "More"]], best: 0, why: "Prices usually go up over time.", src: "fed" },
      { q: "Prices go up. Your coins buy…", opts: [["🍪", "Fewer things"], ["🍪🍪🍪", "More things"]], best: 0, why: "When prices go up, money buys less.", src: "fed" },
      { q: "It cost 4. Now it costs 5. It went…", opts: [["⬆️", "Up"], ["⬇️", "Down"]], best: 0, why: "5 is more than 4. The price went up.", src: "fed" },
      { q: "Saving in a bank can earn…", opts: [["➕", "A little extra"], ["➖", "Nothing ever"]], best: 0, why: "Interest helps savings keep up.", src: "fdic" },
    ],
    rounds: [
      { q: "What is inflation?", opts: [["📈", "Prices in general rising over time"], ["🎈", "Blowing up a balloon"], ["📉", "Prices falling"]], best: 0, why: "With inflation, the same money buys less than before.", src: "fed" },
      { q: "If prices rise 3% and your savings earn 1%, what happens to what your savings can buy?", opts: [["📉", "It goes down"], ["📈", "It goes up"], ["🟰", "It stays the same"]], best: 0, why: "Your money grows more slowly than prices, so it buys a bit less.", src: "fed" },
      { q: "Who in the U.S. works to keep prices stable?", opts: [["🏛️", "The Federal Reserve"], ["🛒", "Grocery stores"], ["🏫", "Schools"]], best: 0, why: "Keeping prices stable is one of the Federal Reserve's main jobs.", src: "fed" },
      { q: "About what inflation rate does the Federal Reserve aim for over the long run?", opts: [["2️⃣", "About 2% a year"], ["0️⃣", "0%"], ["🔟", "10% a year"]], best: 0, why: "The Fed's longer-run goal is 2% inflation.", src: "fed" },
      { q: "Prices go up but your pay doesn't. What could you do?", opts: [["📝", "Update your budget and compare prices"], ["🙈", "Ignore it"], ["💳", "Put everything on credit"]], best: 0, why: "Rechecking your budget helps you adjust when costs rise.", src: "cfpb" },
    ],
  },

  "start-business": {
    picture: [
      { q: "Lemonade stand! What do you need?", opts: [["🍋", "Lemons"], ["🧦", "Socks"]], best: 0, why: "You need lemons to make lemonade.", src: "sba" },
      { q: "People who buy from you are…", opts: [["🧍", "Customers"], ["🦖", "Dinosaurs"]], best: 0, why: "Customers buy what you sell.", src: "sba" },
      { q: "Lemons cost 2. We sold for 5. We…", opts: [["😀", "Made money"], ["😟", "Lost money"]], best: 0, why: "5 is more than 2. That extra is profit!", src: "sba" },
      { q: "A business needs a good…", opts: [["💡", "Idea"], ["😴", "Nap"]], best: 0, why: "Every business starts with an idea.", src: "sba" },
    ],
    rounds: [
      { q: "What is profit?", opts: [["➕", "Money left after paying costs"], ["💵", "All the money customers pay"], ["🧾", "What you spend on supplies"]], best: 0, why: "Profit = money coming in minus costs.", src: "sba" },
      { q: "You sell 10 cups at $1. Lemons and cups cost $4. What's your profit?", opts: [["6️⃣", "$6"], ["🔟", "$10"], ["4️⃣", "$4"]], best: 0, why: "$10 in − $4 costs = $6 profit.", src: "sba" },
      { q: "What is a business plan?", opts: [["🗺️", "A written plan for what you'll sell, to whom, and how you'll make money"], ["✈️", "A plane ticket"], ["🎉", "A party invite"]], best: 0, why: "Planning helps you spot problems before spending money.", src: "sba" },
      { q: "Who is your target market?", opts: [["🎯", "The people most likely to buy"], ["🏪", "The store next door"], ["🌍", "Literally everyone"]], best: 0, why: "Knowing your customers helps you set prices and spread the word.", src: "sba" },
      { q: "Why do businesses research competitors?", opts: [["🔍", "To see prices and find what makes them different"], ["🕵️", "To copy them exactly"], ["🙈", "They shouldn't"]], best: 0, why: "Knowing the competition helps you stand out.", src: "sba" },
    ],
  },
};

/* ===================================================================
   EXTRA TOPICS
   Shaped like a module so the Workshop Builder can plan a whole
   workshop around one. `sources` lists the KB_SRC keys the rounds use.
   `tags` are words a volunteer might type to find the topic.
   =================================================================== */
var EXTRA_TOPICS = [
  {
    id: "coins-counting", title: "Coins and Counting Money", emoji: "🪙", extraTopic: true,
    sources: ["mint"], tags: ["coin", "penny", "nickel", "dime", "quarter", "counting money", "count money", "dollar", "cash"],
    summary: "What each coin is worth and how coins add up to a dollar.",
    objective: "Students can name each coin, say what it is worth, and count small amounts.",
    reveal: { keyConcept: "Each coin has a value; bigger isn't always worth more", discussionPrompt: "Why do you think the dime is smaller than the nickel but worth more?" },
    takeHome: { title: "Coin Hunt", familyQuestion: "Can we find a penny, nickel, dime and quarter at home and line them up by value?" },
    prep: { openingScript: "Who has ever held a coin? Today we're going to become coin detectives and find out which tiny coin is secretly worth the most.",
      vocab: [{ term: "Penny", def: "1 cent" }, { term: "Dime", def: "10 cents" }, { term: "Quarter", def: "25 cents" }, { term: "Dollar", def: "100 cents" }] },
    pack: { bestGames: ["market-day", "card-sort"], hook: "Hold up a dime and a nickel. Ask which is worth more. Most will pick the bigger one.",
      miniLesson: "Coins have values: penny 1¢, nickel 5¢, dime 10¢, quarter 25¢. Size doesn't tell you value.", guidedPractice: "Count a small pile of coins together, biggest value first." },
  },
  {
    id: "giving-sharing", title: "Giving and Sharing", emoji: "💝", extraTopic: true,
    sources: ["cfpbKids", "ftc"], tags: ["giving", "give", "sharing", "share", "charity", "donate", "donation", "volunteer"],
    summary: "Spend, save and share: how giving fits a money plan, and how to give safely.",
    objective: "Students can name ways to give (money, time, help) and one way to check a charity is real.",
    reveal: { keyConcept: "Giving is part of a money plan, and it's smart to check before you give", discussionPrompt: "What is one way you could help someone without spending money?" },
    takeHome: { title: "Our Share Jar", familyQuestion: "What is one cause or group we'd like to help, with money or time?" },
    prep: { openingScript: "Have you ever shared something and felt good afterward? Today we'll talk about giving: what we can give and how to give smart.",
      vocab: [{ term: "Share", def: "Giving some of what you have to others." }, { term: "Charity", def: "A group that helps people, animals or places." }, { term: "Volunteer", def: "Helping without being paid." }, { term: "Donation", def: "A gift of money or things." }] },
    pack: { bestGames: ["savings-jars", "four-corners"], hook: "Show three jars labeled Spend, Save and Share. Ask what the third one could be for.",
      miniLesson: "Money can be spent, saved, or shared. We can also give time and help. Before giving money, check the group is real." },
  },
  {
    id: "taxes-community", title: "Taxes and Our Community", emoji: "🏛️", extraTopic: true,
    sources: ["irs"], tags: ["tax", "taxes", "sales tax", "income tax", "tax return", "government", "public service"],
    summary: "What taxes are and the shared things they pay for, like schools, roads and parks.",
    objective: "Students can explain what taxes pay for and name two kinds of tax.",
    reveal: { keyConcept: "Taxes pay for things we all share", discussionPrompt: "What is one thing in our town that taxes help pay for?" },
    takeHome: { title: "Tax Detectives", familyQuestion: "What is one public place we use that taxes help pay for?" },
    prep: { openingScript: "Who rode on a road today? Who has been to a park or library? Guess what: you helped pay for those. Let's find out how.",
      vocab: [{ term: "Tax", def: "Money people pay to fund government services." }, { term: "Sales tax", def: "Tax added when you buy something." }, { term: "Income tax", def: "Tax on money people earn." }, { term: "Public service", def: "Something the government provides for everyone." }] },
    pack: { bestGames: ["four-corners", "card-sort"], hook: "Ask who used a road, school or park today. Every hand goes up. Tell them they all share the cost.",
      miniLesson: "Taxes are money people and businesses pay so the government can provide shared services like schools, roads and fire departments." },
  },
  {
    id: "insurance-basics", title: "Insurance Basics", emoji: "☂️", extraTopic: true,
    sources: ["naic"], tags: ["insurance", "premium", "deductible", "renters insurance", "car insurance", "health insurance", "risk"],
    summary: "How insurance protects people from big, unexpected costs.",
    objective: "Students can explain what insurance does and define premium and deductible.",
    reveal: { keyConcept: "Insurance shares the cost of big surprises", discussionPrompt: "What is something people protect with insurance, and why?" },
    takeHome: { title: "Plan for Surprises", familyQuestion: "What is one way our family gets ready for surprises?" },
    prep: { openingScript: "Raise your hand if you've ever brought an umbrella just in case. Insurance is a money umbrella. Let's see how it works.",
      vocab: [{ term: "Insurance", def: "A plan that helps pay for big, unexpected losses." }, { term: "Premium", def: "What you pay regularly for insurance." }, { term: "Deductible", def: "What you pay before insurance pays." }, { term: "Risk", def: "The chance something bad happens." }] },
    pack: { bestGames: ["four-corners", "would-you-rather"], hook: "Hold up an umbrella. Ask why you'd carry it on a sunny morning.",
      miniLesson: "Insurance means many people pay a little so nobody has to pay a huge cost alone when something bad happens." },
  },
  {
    id: "identity-safety", title: "Identity and Online Safety", emoji: "🔐", extraTopic: true,
    sources: ["ftc"], tags: ["identity", "identity theft", "password", "online safety", "privacy", "personal information", "social security number", "hacker"],
    summary: "Keeping personal information private and spotting tricks online.",
    objective: "Students can name information to keep private and what to do if something online feels wrong.",
    reveal: { keyConcept: "Private information stays private; when unsure, ask a trusted adult", discussionPrompt: "What is one thing you would never share with a stranger online?" },
    takeHome: { title: "Our Safety Rules", familyQuestion: "What are our family's rules for passwords and sharing online?" },
    prep: { openingScript: "What do you think a password is for? Today we'll learn how to keep the keys to our stuff safe.",
      vocab: [{ term: "Password", def: "A secret code that protects an account." }, { term: "Private", def: "Only for you and your trusted grown-ups." }, { term: "Identity theft", def: "Someone pretending to be you using your information." }, { term: "Phishing", def: "Fake messages that try to steal information." }] },
    pack: { bestGames: ["red-flag-green-flag", "scam-or-safe", "scam-detective"], hook: "Ask: would you hand your house key to a stranger? A password is a key.",
      miniLesson: "Your name, address, passwords and numbers are keys to your identity. Keep them private and ask a trusted adult when something feels off." },
  },
  {
    id: "earning-money", title: "Earning Money and First Jobs", emoji: "🧑‍🍳", extraTopic: true,
    sources: ["dol", "bls", "sba"], tags: ["earn", "earning", "job", "jobs", "first job", "wage", "career", "allowance", "chore"],
    summary: "Where money comes from: jobs, wages, small businesses, and the rules for teen workers.",
    objective: "Students can name ways people earn money and explain why there are rules for young workers.",
    reveal: { keyConcept: "People earn money by working or by selling something people want", discussionPrompt: "What job would you like to try one day, and why?" },
    takeHome: { title: "Jobs Around Us", familyQuestion: "What is one job someone we know does, and what do they like about it?" },
    prep: { openingScript: "If money doesn't grow on trees, where does it come from? Let's find out how people earn it.",
      vocab: [{ term: "Earn", def: "To get money for working." }, { term: "Job", def: "Work someone is paid to do." }, { term: "Wage", def: "Money paid for each hour of work." }, { term: "Career", def: "The kind of work someone does over many years." }] },
    pack: { bestGames: ["market-day", "four-corners"], hook: "Ask students to act out a job without words; the class guesses it.",
      miniLesson: "People earn money by working at a job or by selling things or services. There are rules to keep young workers safe and in school." },
  },
  {
    id: "rising-prices", title: "Why Prices Go Up (Inflation)", emoji: "📈", extraTopic: true,
    sources: ["fed"], tags: ["inflation", "price", "prices", "price going up", "cost of living", "federal reserve"],
    summary: "Why things cost more over time, and what that means for saving and budgets.",
    objective: "Students can explain that rising prices mean money buys less, and one way people adjust.",
    reveal: { keyConcept: "When prices rise, the same money buys less", discussionPrompt: "Why might saving in a bank account help when prices go up?" },
    takeHome: { title: "Then and Now Prices", familyQuestion: "What is something that cost less when a grown-up at home was a kid?" },
    prep: { openingScript: "Does anyone know what a candy bar cost when your grown-ups were kids? Let's find out why prices change.",
      vocab: [{ term: "Price", def: "How much something costs." }, { term: "Inflation", def: "Prices in general going up over time." }, { term: "Interest", def: "Extra money a bank pays savers." }, { term: "Federal Reserve", def: "The U.S. central bank, which works to keep prices stable." }] },
    pack: { bestGames: ["silent-lineup", "four-corners"], hook: "Show two price tags for the same snack, 'long ago' and 'today'. Ask what changed.",
      miniLesson: "Over time most prices go up a little. That is inflation. It means the same money buys a little less each year." },
  },
  {
    id: "start-business", title: "Starting a Small Business", emoji: "🍋", extraTopic: true,
    sources: ["sba"], tags: ["business", "entrepreneur", "lemonade stand", "profit", "customer", "sell", "selling", "startup"],
    summary: "Ideas, customers, costs and profit, using a lemonade stand as the example.",
    objective: "Students can explain profit as money in minus costs and name parts of a business plan.",
    reveal: { keyConcept: "Profit is what's left after paying your costs", discussionPrompt: "What business would you start, and who would your customers be?" },
    takeHome: { title: "My Business Idea", familyQuestion: "If our family ran a small business, what would we sell?" },
    prep: { openingScript: "Who has ever sold something, like lemonade or cookies? Today you're all business owners.",
      vocab: [{ term: "Business", def: "Selling things or services to make money." }, { term: "Customer", def: "Someone who buys from you." }, { term: "Cost", def: "Money you spend to make what you sell." }, { term: "Profit", def: "Money left after paying costs." }] },
    pack: { bestGames: ["market-day", "budget-relay"], hook: "Set up a pretend lemonade stand. Ask what you need to buy before you can sell anything.",
      miniLesson: "A business sells something people want. Money in minus costs is profit. Planning helps you know if your idea will work." },
  },
];

/* Every topic the builder can plan: modules first, then extra topics. */
function findTopic(id) {
  for (var i = 0; i < MODULES.length; i++) if (MODULES[i].id === id) return MODULES[i];
  for (var j = 0; j < EXTRA_TOPICS.length; j++) if (EXTRA_TOPICS[j].id === id) return EXTRA_TOPICS[j];
  return null;
}

/* Where a round's fact comes from, as { name, url } or null. */
function roundSource(round, topic) {
  var key = round.src || (topic && topic.extraTopic && topic.sources[0]);
  if (key && KB_SRC[key]) return { name: KB_SRC[key][0], url: KB_SRC[key][1] };
  if (topic && topic.officialLesson) return { name: "Jump$tart Teen Teach-In · " + topic.officialLesson, url: "" };
  return null;
}

/* Build a game for a topic and age group. K–2 gets the picture rounds.
   `count` caps the rounds (the game repeats nothing). Returns null when
   the topic has no rounds. */
function buildTopicGame(topicId, gradeId, count) {
  var topic = findTopic(topicId);
  var bank = GAME_BANK[topicId];
  if (!topic || !bank) return null;
  var picture = gradeId === "k2";
  var rounds = (picture ? bank.picture : bank.rounds) || [];
  if (count) rounds = rounds.slice(0, count);
  return {
    topic: topic,
    picture: picture,
    title: topic.emoji + " " + topic.title + (picture ? " Picture Game" : " Showdown"),
    rounds: rounds,
    sources: rounds.map(function (r) { return roundSource(r, topic); })
      .filter(function (s, i, all) {
        return s && all.map(function (x) { return x && x.name; }).indexOf(s.name) === i;
      }),
  };
}

/* Find topics matching words a volunteer typed ("taxes", "lemonade"). */
function searchTopics(text) {
  var q = " " + String(text || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ") + " ";
  if (!q.trim()) return [];
  function has(phrase) {
    var p = phrase.toLowerCase();
    return q.indexOf(" " + p + " ") >= 0 || q.indexOf(" " + p + "s ") >= 0 || q.indexOf(" " + p.replace(/s$/, "") + " ") >= 0;
  }
  var all = MODULES.concat(EXTRA_TOPICS);
  return all.filter(function (t) {
    var words = (t.tags || []).concat(t.title.toLowerCase().split(/[^a-z]+/).filter(function (w) { return w.length > 4; }));
    return words.some(has);
  });
}
