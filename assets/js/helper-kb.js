/*
 * helper-kb.js — Knowledge base for the Standards Helper (#/helper)
 *
 * SAFETY BY DESIGN: the helper does NOT freestyle answers. It only looks up
 * answers from this curated list and always shows the source underneath.
 *
 * Two tiers:
 *   - no `tier`: written from Jump$tart materials (Teen Teach-In slide decks,
 *     Clearinghouse topics). Shown first when both tiers could answer.
 *   - tier "trusted": a question Jump$tart materials don't cover, answered
 *     from a public U.S. government (or state regulator) consumer-education
 *     source named in `source` and `url`. Shown with a "not from Jump$tart"
 *     note.
 *
 * `tags` are the topic phrases a question must contain to match (whole
 * words; plurals are handled, so write them singular). When two tags overlap
 * in a question, the longer phrase wins: "deposit insurance" beats
 * "insurance", "credit card" beats "credit". Keep tags specific: a bare
 * common word ("card", "account", "plan") pulls in unrelated questions.
 *
 * Everything here is illustrative and pending review by Virginia Jump$tart.
 * Keep answers general and short, never ask about family finances, and avoid
 * figures that change every year.
 */
var KB_TTI = "Jump$tart Teen Teach-In · ";
var KB_SRC = {
  cfpb: ["Consumer Financial Protection Bureau (CFPB)", "consumerfinance.gov"],
  cfpbKids: ["Consumer Financial Protection Bureau (CFPB), Money as You Grow", "consumerfinance.gov"],
  fdic: ["Federal Deposit Insurance Corporation (FDIC), Money Smart", "fdic.gov"],
  ftc: ["Federal Trade Commission (FTC)", "consumer.ftc.gov"],
  sec: ["U.S. Securities and Exchange Commission (SEC), Investor.gov", "investor.gov"],
  irs: ["Internal Revenue Service (IRS)", "irs.gov"],
  fsa: ["Federal Student Aid, U.S. Department of Education", "studentaid.gov"],
  fed: ["Federal Reserve Education", "federalreserveeducation.org"],
  dol: ["U.S. Department of Labor, YouthRules", "dol.gov"],
  ncua: ["National Credit Union Administration (NCUA)", "mycreditunion.gov"],
  naic: ["National Association of Insurance Commissioners (NAIC), the U.S. state insurance regulators", "content.naic.org"],
  treasury: ["U.S. Department of the Treasury, TreasuryDirect", "treasurydirect.gov"],
  mint: ["United States Mint", "usmint.gov"],
  ssa: ["Social Security Administration (SSA)", "ssa.gov"],
  sba: ["U.S. Small Business Administration (SBA)", "sba.gov"],
  bls: ["U.S. Bureau of Labor Statistics (BLS)", "bls.gov"],
  courts: ["United States Courts", "uscourts.gov"],
  va529: ["Virginia529, Commonwealth of Virginia", "virginia529.com"],
  hud: ["U.S. Department of Housing and Urban Development (HUD)", "hud.gov"],
};
function kbTrusted(src) { return { tier: "trusted", source: KB_SRC[src][0], url: KB_SRC[src][1] }; }
function kbEntry(entry, extra) { for (var k in extra) entry[k] = extra[k]; return entry; }

const FAQ_KNOWLEDGE = [
  // ================================================================
  // From Jump$tart materials
  // ================================================================
  {
    q: "What is the difference between a need and a want?",
    a: "A need is something you must have to live and be safe, like food, water, or shelter. A want is something nice to have but not essential, like games or candy. The same item can be a need or a want depending on the situation. Take care of needs first, then wants if there is money left.",
    tags: ["need", "want", "needs and wants", "need or want"],
    source: KB_TTI + "Grade 1 Needs and Wants; Grade 3 Saving and Spending",
  },
  {
    q: "What is opportunity cost?",
    a: "Opportunity cost is the next-best thing you gave up when you made a choice. If you spend $5 on a book instead of ice cream, the opportunity cost is the ice cream — not the $5. Every choice has one, even choices about time, like picking a birthday party over a baseball game.",
    tags: ["opportunity cost", "trade-off", "tradeoff", "give up", "giving up"],
    source: KB_TTI + "Grade 2 Making Financial Choices and Opportunity Costs; Grade 4 Investing in Tomorrow",
  },
  {
    q: "Why should I save money?",
    a: "Saving lets you reach bigger goals later and be ready for surprises. A helpful habit is 'pay yourself first' — set aside a little the moment you get money, before you spend any. Like the ant in the fable, saving a little today means having something tomorrow.",
    tags: ["save", "saving", "pay yourself first", "save money"],
    source: KB_TTI + "Grade 3 Saving and Spending; Grade 4 Investing in Tomorrow",
  },
  {
    q: "What is a budget?",
    a: "A budget is a plan for money coming in and going out. A simple version splits money into three parts: save, spend, and share. There is no single right split — a budget helps you decide on purpose. Writing down what you spend for a week is an easy way to start.",
    tags: ["budget", "budgeting", "save spend share", "track spending", "tracking spending", "50 30 20"],
    source: KB_TTI + "Grade 3 Saving and Spending",
  },
  {
    q: "What is credit and interest?",
    a: "Credit is borrowed money you agree to pay back later. Interest is the extra cost of borrowing, on top of what you owe. Paying credit back on time keeps costs from growing.",
    tags: ["credit", "interest", "borrowing"],
    source: "Jump$tart Clearinghouse · credit and debt resources",
  },
  {
    q: "What is a loan?",
    a: "A loan is money you borrow and promise to pay back. Banks charge interest on loans, so you pay back more than you borrowed. For example, borrowing $500 at 5% for one year means paying back $525. People use loans for big things like a house, a car, college, or starting a business.",
    tags: ["loan", "borrow", "borrow money", "pay back", "paying back"],
    source: KB_TTI + "Grade 3 Saving, Spending, Borrowing and Lending",
  },
  {
    q: "How does a bank pay me for saving?",
    a: "When you keep money in a savings account, the bank pays you interest — a little extra money for every dollar you keep there. At 2% interest, $500 saved for a year grows to $510. That is one big reason to save in a bank instead of a piggy bank.",
    tags: ["earn interest", "savings interest", "interest on saving", "bank pay me", "pay me interest", "apy", "piggy bank", "mattress", "keep cash at home", "keep money at home"],
    source: KB_TTI + "Grade 3 Saving, Spending, Borrowing and Lending",
  },
  {
    q: "How do banks make money?",
    a: "Banks lend out the money people deposit to customers who need loans for homes, cars, school, or businesses. They charge borrowers more interest than they pay savers. The difference is how the bank makes a profit.",
    tags: ["bank make money", "banks make money", "bank profit", "what do banks do", "bank do with my money", "how do banks work", "how does a bank work"],
    source: KB_TTI + "Grade 3 Saving, Spending, Borrowing and Lending",
  },
  {
    q: "How do I open a savings account?",
    a: "Kids need a parent or guardian to open an account with them. Together you visit a bank or credit union, pick an account, and make a first deposit. After that, try to add money regularly — birthday money, allowance, or money from small jobs all count.",
    tags: ["open a savings account", "open a bank account", "open an account", "open account", "opening an account", "first bank account"],
    source: KB_TTI + "Grade 4 Investing in Tomorrow",
  },
  {
    q: "What is an ATM?",
    a: "An ATM (automated teller machine) lets you deposit or take out cash from your bank account using a card and a secret PIN number. Using an ATM that belongs to a different bank can cost a fee, and you should never share your PIN with anyone.",
    tags: ["atm", "automated teller", "cash machine", "pin number"],
    source: KB_TTI + "Grade 4 Investing in Tomorrow",
  },
  {
    q: "How does compound growth work in investing?",
    a: "Investing puts money to work so it can grow. With compound growth, your earnings themselves earn more earnings over time — like a snowball that gets bigger as it rolls. Because of this, starting early can matter more than investing larger amounts later.",
    tags: ["invest", "investing", "investment", "compound", "compound interest", "grow my money"],
    source: KB_TTI + "Grade 4 Investing in Tomorrow",
  },
  {
    q: "Would you rather have $1 million or a penny doubled every day for 30 days?",
    a: "Take the penny! A penny doubled every day for 30 days grows to more than $5.3 million on day 30. It starts slowly — only about $5 after 10 days — and then grows fast. That is the power of compounding and time.",
    tags: ["penny doubled", "double a penny", "doubling a penny", "penny double", "million or a penny", "penny a day"],
    source: KB_TTI + "Grade 4 Investing in Tomorrow (Question of the Day)",
  },
  {
    q: "Why can't I have everything I want?",
    a: "Because resources are limited. A resource is something that helps you get what you want, and the best example is money. Nobody — not your parents, your teacher, or even the President — has enough money to buy everything. That's why we make choices, starting with needs.",
    tags: ["everything i want", "have everything", "limited resource", "resource", "scarcity", "why can't i have"],
    source: KB_TTI + "Grade 1 Needs and Wants",
  },
  {
    q: "How do I make a good choice with my money?",
    a: "Stop and think before you spend. Ask: Is this a need or a want? What do I want the most? What will I give up? In the story, Alexander spent his dollar on whatever he saw first and lost the walkie-talkie he really wanted.",
    tags: ["good choice", "smart choice", "money choice", "money decision", "make a choice", "decide what to buy", "choice", "decision"],
    source: KB_TTI + "Grade 2 Making Financial Choices and Opportunity Costs",
  },
  {
    q: "Where does money come from?",
    a: "Most people get money by working: they earn it at a job or by selling goods and services. Kids may also get money as gifts or an allowance. Money doesn't grow on trees — someone earned it, which is why it's worth spending wisely and saving some.",
    tags: ["money come from", "where money come from", "get money", "money grow on tree", "money tree"],
    source: KB_TTI + "Planet Zeee and the Money Tree",
  },
  {
    q: "How can a kid earn money?",
    a: "Kids can earn money with an allowance for chores, or small jobs like pet sitting, yard work, or a lemonade stand — always with a parent's OK. Earning money takes work and time, so it's worth thinking about before you spend it.",
    tags: ["kid earn", "earn money", "make money", "allowance", "chore", "lemonade stand", "pet sitting", "mow lawn"],
    source: KB_TTI + "Grade 2 Making Financial Choices; Planet Zeee and the Money Tree",
  },
  {
    q: "How can I spend money wisely?",
    a: "Make a plan before you shop, wait a day before buying something you didn't plan for, and compare prices. Ask if it's a need or a want, and remember what you give up. Spending wisely leaves money for the things you really care about.",
    tags: ["spend wisely", "spending wisely", "spend money", "spending money", "smart shopper", "impulse", "impulse buy", "waste money", "wasting money", "stop spending", "spend less", "spending so much", "overspend", "overspending"],
    source: KB_TTI + "Planet Zeee and the Money Tree; Grade 2 Making Financial Choices",
  },
  {
    q: "Why should I share or give money?",
    a: "Sharing — giving to a cause, a friend, or your community — is one of the three jobs for money, along with saving and spending. Giving back helps others and feels good, and you choose how much fits your plan. You can also give time instead of money.",
    tags: ["give back", "giving", "donate", "donation", "charity", "share money", "sharing money"],
    source: KB_TTI + "Planet Zeee and the Money Tree; Grade 3 Saving and Spending",
  },
  {
    q: "What are goods and services?",
    a: "Goods are things you can touch, like food, toys, or clothes. Services are things people do for you, like a haircut, a doctor visit, or a bus ride. When you spend money, you are buying goods or services.",
    tags: ["goods", "service", "goods and services"],
    source: KB_TTI + "Grade 3 Saving and Spending",
  },
  {
    q: "What is a savings goal?",
    a: "A savings goal is something specific you save up for, like a bike or a game. Write down what it costs and how much you can save each week, then divide to see how many weeks it will take. Seeing progress makes it easier to stick with it.",
    tags: ["saving goal", "savings goal", "save up for", "saving up", "goal"],
    source: KB_TTI + "Grade 4 Investing in Tomorrow",
  },
  {
    q: "Should I lend money to a friend?",
    a: "Lending to friends can be risky. In the Grade 4 fable, Sandra the ant asks why she should lend to someone who never saves. Only lend what you could afford to lose, agree on when it will be paid back, and it's OK to say no.",
    tags: ["lend money", "lend a friend", "lending", "borrow from a friend", "friend borrow", "friend owes me"],
    source: KB_TTI + "Grade 3 Borrowing and Lending; Grade 4 Investing in Tomorrow",
  },
  {
    q: "What is the difference between gross pay and net pay?",
    a: "Gross pay is the total you earn before anything is taken out. Net pay (take-home pay) is what's left after taxes and other deductions. Budget using your net pay, not your gross pay.",
    tags: ["paycheck", "gross pay", "net pay", "take-home", "take home pay", "deduction", "pay stub"],
    source: "Jump$tart Clearinghouse · earning income resources",
  },
  {
    q: "How can I spot a scam?",
    a: "Watch for three red flags: urgency ('act now!'), secrecy, and requests for private information. When a message rushes you or asks for personal or bank details, stop, don't click, and ask a trusted adult.",
    tags: ["fraud", "scam", "scammer", "red flag", "phishing", "fake text", "fake email", "suspicious text", "suspicious email", "you won a prize", "won a prize", "you won", "you have won"],
    source: "Jump$tart Clearinghouse · fraud and risk resources",
  },
  {
    q: "What is the difference between a checking and a savings account?",
    a: "A checking account is for everyday spending. A savings account keeps money safer, out of easy-spend reach, and can earn a little interest toward your goals.",
    tags: ["banking", "checking", "checking account", "savings account", "bank account"],
    source: "Jump$tart Clearinghouse · banking resources",
  },
  {
    q: "What is a bank and why do people use one?",
    a: "A bank is a business that keeps people's money safe, pays interest to savers, and lends money to borrowers. People use banks to protect their money, earn interest, and pay for things with checks, cards, or apps instead of carrying cash.",
    tags: ["what is a bank", "what does a bank do", "why use a bank", "why put money in a bank", "why do people use bank"],
    source: KB_TTI + "Grade 3 Saving, Spending, Borrowing and Lending",
  },
  {
    q: "What should I do with birthday or gift money?",
    a: "Try splitting it three ways: save some for a bigger goal, spend some on something you'll enjoy, and share some if you'd like. Putting the savings part in a savings account right away helps it grow with interest.",
    tags: ["birthday money", "gift money", "money i got", "holiday money", "money from grandma", "money from grandpa"],
    source: KB_TTI + "Grade 4 Investing in Tomorrow; Grade 3 Saving and Spending",
  },
  {
    q: "How do I teach kids about money?",
    a: "Start with a story or a game, then connect it to one big idea, like needs vs. wants or saving for a goal. Keep it about choices, not amounts, and never ask students about family income. The Teen Teach-In lessons in this toolkit's Modules and Workshop Builder give a ready-made plan for Grades 1–4.",
    tags: ["teach kid", "teaching kid", "teach money", "teach about money", "teach financial literacy", "teen teach-in", "teach-in", "lesson plan", "volunteer"],
    source: KB_TTI + "Grades 1–4 lesson guides",
  },
  {
    q: "Is this app a good source of official financial advice?",
    a: "No. This toolkit is an educational prototype for discussion, pending review by Virginia Jump$tart. It is not financial advice. For decisions, families should talk with trusted adults and qualified professionals.",
    tags: ["disclaimer", "financial advice", "this app", "this website", "who made this"],
    source: "Money Ready toolkit · Educational-only notice",
  },

  // ================================================================
  // Trusted sources, for questions Jump$tart materials don't cover
  // ================================================================

  // ---------- money basics ----------
  kbEntry({
    q: "What is money and why do we use it?",
    a: "Money is anything people agree to accept in exchange for goods and services. Before money, people bartered — traded things directly — which was hard when the other person didn't want what you had. Money makes trading easy, lets you save value for later, and lets you compare prices.",
    tags: ["what is money", "why do we use money", "why do we have money", "barter", "bartering", "history of money", "before money"],
  }, kbTrusted("fed")),
  kbEntry({
    q: "How much are U.S. coins worth?",
    a: "A penny is worth 1 cent, a nickel 5 cents, a dime 10 cents, a quarter 25 cents, a half dollar 50 cents, and a dollar coin 100 cents. 100 cents make one dollar, so four quarters equal $1.",
    tags: ["coin", "penny", "nickel", "dime", "quarter", "half dollar", "dollar coin", "cents in a dollar", "cents are in a dollar", "how many cents"],
  }, kbTrusted("mint")),
  kbEntry({
    q: "Who makes money, and why can't the government just print more?",
    a: "Paper bills are printed by the U.S. Bureau of Engraving and Printing and coins are made by the U.S. Mint. The Federal Reserve decides how much money goes into the economy. Printing lots of extra money doesn't make people richer — it makes prices go up, because more money is chasing the same amount of goods.",
    tags: ["print more money", "print money", "printing money", "who makes money", "who prints money", "bureau of engraving", "us mint", "make more money"],
  }, kbTrusted("fed")),
  kbEntry({
    q: "What is inflation?",
    a: "Inflation is when prices go up over time, so the same amount of money buys less than it used to. It's one reason saving money in an account that earns interest can help it keep up.",
    tags: ["inflation", "prices go up", "prices rise", "price going up", "cost of living", "everything so expensive"],
  }, kbTrusted("fed")),
  kbEntry({
    q: "What does the Federal Reserve do?",
    a: "The Federal Reserve ('the Fed') is the central bank of the United States. It works to keep prices stable and jobs plentiful, mostly by raising or lowering interest rates, and it helps keep the banking system safe.",
    tags: ["federal reserve", "the fed", "central bank", "interest rates go up", "raise interest rates"],
  }, kbTrusted("fed")),
  kbEntry({
    q: "What is supply and demand?",
    a: "Supply is how much of something is available; demand is how much people want it. When lots of people want something and there isn't much of it, the price tends to go up. When there is plenty and fewer people want it, the price tends to go down.",
    tags: ["supply and demand", "supply", "demand", "why do prices change", "how are prices set", "why do things cost"],
  }, kbTrusted("fed")),
  kbEntry({
    q: "What is the economy and what is a recession?",
    a: "The economy is all the making, buying, and selling of goods and services in a place. A recession is when the economy shrinks for a while — businesses sell less and some people lose jobs. Recessions eventually end, which is one reason an emergency fund matters.",
    tags: ["economy", "recession", "depression", "gdp", "economic"],
  }, kbTrusted("fed")),
  kbEntry({
    q: "How does money from other countries work?",
    a: "Most countries have their own currency, like the euro or the Mexican peso. An exchange rate tells you how much of one currency you get for another, and it changes every day. Travelers exchange money or use cards that convert it, sometimes for a fee.",
    tags: ["exchange rate", "foreign currency", "currency exchange", "other countries", "other country", "euro", "peso", "currency"],
  }, kbTrusted("fed")),

  // ---------- banking ----------
  kbEntry({
    q: "Is my money safe in a bank?",
    a: "Money in an FDIC-insured bank is protected by the U.S. government up to $250,000 per depositor, per bank, for each account ownership type. If the bank fails, insured deposits are paid back. Look for the 'Member FDIC' sign.",
    tags: ["fdic", "deposit insurance", "money safe", "safe in a bank", "safe in the bank", "bank fail", "bank failure", "bank go out of business", "bank goes out of business", "bank closes"],
  }, kbTrusted("fdic")),
  kbEntry({
    q: "What is the difference between a bank and a credit union?",
    a: "Both keep your money and make loans. A bank is a business owned by investors; a credit union is a not-for-profit owned by its members, so it may offer lower fees or better rates. Credit union deposits are insured by the NCUA, just like the FDIC insures banks.",
    tags: ["credit union", "ncua", "bank vs credit union", "bank or credit union"],
  }, kbTrusted("ncua")),
  kbEntry({
    q: "What is the difference between a debit card and a credit card?",
    a: "A debit card spends money that is already in your bank account. A credit card borrows money you have to pay back later, and if you don't pay the full bill each month you are charged interest.",
    tags: ["debit", "debit card", "credit card", "debit or credit", "debit vs credit"],
  }, kbTrusted("cfpb")),
  kbEntry({
    q: "What is an overdraft?",
    a: "An overdraft happens when you spend more than you have in your account. The bank may cover it but charge a fee, or decline the purchase. Checking your balance before you spend and turning on low-balance alerts help you avoid overdraft fees.",
    tags: ["overdraft", "overdraw", "overdrawn", "bounced check", "insufficient fund", "negative balance"],
  }, kbTrusted("cfpb")),
  kbEntry({
    q: "What is a check and how do I write one?",
    a: "A check is a written note telling your bank to pay someone from your checking account. You fill in the date, who it's to, the amount in numbers and in words, and sign it. Before cashing or depositing a check from someone you don't know, ask a trusted adult — fake checks are a common scam.",
    tags: ["write a check", "writing a check", "cash a check", "deposit a check", "checkbook", "personal check", "what is a check"],
  }, kbTrusted("fdic")),
  kbEntry({
    q: "What is direct deposit?",
    a: "Direct deposit means your employer sends your pay straight into your bank account instead of handing you a paper check. It's usually faster and safer, and you never have to carry a big check around.",
    tags: ["direct deposit"],
  }, kbTrusted("cfpb")),
  kbEntry({
    q: "What fees do banks charge?",
    a: "Common bank fees include monthly maintenance fees, overdraft fees, and fees for using another bank's ATM. Many accounts for students have no monthly fee. Ask for the fee list before opening an account and compare a few banks or credit unions.",
    tags: ["bank fee", "atm fee", "monthly fee", "maintenance fee", "account fee"],
  }, kbTrusted("cfpb")),
  kbEntry({
    q: "How do I keep track of my bank account?",
    a: "Check your balance often in the bank's app or website, and read your monthly statement to make sure every charge is yours. Keeping a simple record of what you spend helps you spot mistakes or fraud early.",
    tags: ["account balance", "check my balance", "bank balance", "my balance", "bank statement", "balance my account", "balancing", "keep track of my account"],
  }, kbTrusted("fdic")),
  kbEntry({
    q: "What are CDs and money market accounts?",
    a: "A certificate of deposit (CD) pays a set interest rate if you leave money in it for a set time, like a year; taking it out early usually costs a penalty. Money market and high-yield savings accounts often pay more interest than regular savings. At an FDIC-insured bank, all of these are insured.",
    tags: ["cd", "certificate of deposit", "money market", "high yield saving", "high-yield saving", "high yield"],
  }, kbTrusted("fdic")),
  kbEntry({
    q: "What should I do if my card is lost or stolen?",
    a: "Tell a parent and call the bank or card company right away — most apps also let you lock the card. Fast reporting limits what you can lose: for credit cards it's capped at $50, but for debit cards the limit grows the longer you wait. Check your statement for charges you didn't make, and report fraud at ReportFraud.ftc.gov.",
    tags: ["lost my card", "stolen card", "card stolen", "card was stolen", "stole my card", "stole my credit card", "stole my debit card", "unauthorized charge", "charge i didnt make", "report fraud", "lost card", "lost my debit card", "lost my credit card", "lost debit card", "lost credit card"],
  }, kbTrusted("cfpb")),
  kbEntry({
    q: "Is it better to pay with cash or a card?",
    a: "Both have pros and cons. Cash makes it easy to see how much you have left and stick to a limit. Cards are safer to carry and leave a record, but it's easier to overspend because you don't see the money leave. Many people use cash for small budgets and a debit card for the rest.",
    tags: ["cash or card", "pay with cash", "cash vs card", "cash versus card", "use cash"],
  }, kbTrusted("cfpbKids")),

  // ---------- borrowing and credit ----------
  kbEntry({
    q: "What is a credit score?",
    a: "A credit score is a three-digit number, usually between 300 and 850, that shows lenders how likely you are to pay back borrowed money on time. Paying bills on time and not borrowing close to your limit help build a good score.",
    tags: ["credit score", "fico", "good credit", "bad credit", "build credit", "building credit"],
  }, kbTrusted("cfpb")),
  kbEntry({
    q: "What is a credit report?",
    a: "A credit report is a record of how you have borrowed and paid back money. Three companies — Equifax, Experian, and TransUnion — keep these reports. You can get your reports for free at AnnualCreditReport.com, the only official site for free reports.",
    tags: ["credit report", "credit bureau", "annual credit report", "check my credit", "equifax", "experian", "transunion"],
  }, kbTrusted("ftc")),
  kbEntry({
    q: "What is APR?",
    a: "APR (annual percentage rate) is the yearly cost of borrowing, including interest and some fees, shown as a percent. A lower APR means borrowing costs less. Comparing APRs is the easiest way to compare loans or credit cards.",
    tags: ["apr", "annual percentage rate", "interest rate"],
  }, kbTrusted("cfpb")),
  kbEntry({
    q: "What happens if I only pay the minimum on a credit card?",
    a: "Paying only the minimum keeps your account in good standing, but the rest of the balance keeps growing with interest. It can take years and cost much more to pay off. Paying the full balance each month means paying no interest at all.",
    tags: ["minimum payment", "pay the minimum", "credit card debt", "credit card bill", "late payment", "late fee", "dont pay", "not pay", "miss a payment", "missed payment", "pay my credit card"],
  }, kbTrusted("cfpb")),
  kbEntry({
    q: "What is debt?",
    a: "Debt is money you owe. Some debt, like a student loan or a mortgage, can help you reach big goals if you can afford the payments. Debt becomes a problem when payments are more than you can handle. Paying more than the minimum and borrowing only what you need keep it under control.",
    tags: ["debt", "owe money", "in debt", "pay off debt", "debt collector"],
  }, kbTrusted("cfpb")),
  kbEntry({
    q: "How do people buy a car?",
    a: "People pay for a car with savings, a car loan, or both. Before buying, compare the total price (not just the monthly payment), get loan offers from a bank or credit union, and remember insurance, gas, and repairs. Have a used car checked by a mechanic first.",
    tags: ["buy a car", "buying a car", "car loan", "auto loan", "car payment", "used car", "new car", "first car"],
  }, kbTrusted("cfpb")),
  kbEntry({
    q: "What is a mortgage?",
    a: "A mortgage is a loan to buy a home, usually paid back over 15 or 30 years. Buyers usually pay part of the price up front, called a down payment. If the payments aren't made, the lender can take the home, so lenders check income and credit first.",
    tags: ["mortgage", "buy a house", "buying a house", "buy a home", "buying a home", "home loan", "down payment"],
  }, kbTrusted("cfpb")),
  kbEntry({
    q: "What is a payday loan?",
    a: "A payday loan is a small, short-term loan meant to be repaid on your next payday. They often have very high costs — fees that can equal an APR of 300% or more — and can trap borrowers in a cycle of re-borrowing. An emergency fund is a safer backup.",
    tags: ["payday loan", "cash advance", "title loan"],
  }, kbTrusted("cfpb")),
  kbEntry({
    q: "What does it mean to cosign a loan?",
    a: "A cosigner promises to pay a loan if the borrower doesn't. It's a big responsibility: missed payments hurt the cosigner's credit too, and the lender can ask the cosigner for the full amount.",
    tags: ["cosign", "co-sign", "cosigner", "co-signer"],
  }, kbTrusted("ftc")),
  kbEntry({
    q: "What is buy now, pay later?",
    a: "Buy now, pay later lets you split a purchase into a few payments, often with no interest if every payment is on time. It's still borrowing: late payments can bring fees, and juggling several plans makes it easy to overspend.",
    tags: ["buy now pay later", "bnpl", "afterpay", "klarna", "affirm", "pay in 4", "pay in four"],
  }, kbTrusted("cfpb")),
  kbEntry({
    q: "What is bankruptcy?",
    a: "Bankruptcy is a legal process, handled by federal courts, for people or businesses that can't pay their debts. It can wipe out or reorganize some debts, but it stays on a credit report for years and makes borrowing harder. Student loans usually can't be erased this way.",
    tags: ["bankruptcy", "bankrupt"],
  }, kbTrusted("courts")),

  // ---------- earning and work ----------
  kbEntry({
    q: "What is minimum wage?",
    a: "Minimum wage is the lowest hourly pay most workers can legally be paid. The federal minimum is $7.25 an hour, but many states, including Virginia, set a higher minimum that changes over time. Virginia's current rate is posted by the Virginia Department of Labor and Industry.",
    tags: ["minimum wage", "lowest pay", "how much per hour"],
  }, kbTrusted("dol")),
  kbEntry({
    q: "How old do I have to be to get a job?",
    a: "Under federal law, most jobs require you to be at least 14, and 14- and 15-year-olds have limits on hours and on the kinds of work they can do. Younger kids can do some jobs, like babysitting, delivering newspapers, or working in a family business. Virginia requires a work permit for 14- and 15-year-olds.",
    tags: ["how old", "age to work", "work permit", "old enough to work", "teen work", "child labor", "too young to work"],
  }, kbTrusted("dol")),
  kbEntry({
    q: "How do I get my first job?",
    a: "Make a list of your skills and interests, ask family, teachers, and neighbors about openings, and look at local stores, camps, and libraries. A short resume and practicing interview answers help. Be on time, be polite, and follow up with a thank-you.",
    tags: ["get a job", "first job", "find a job", "job application", "resume", "job interview", "interview", "part-time job", "summer job"],
  }, kbTrusted("dol")),
  kbEntry({
    q: "What is the difference between salary and hourly pay?",
    a: "Hourly workers are paid for each hour they work, and most get overtime — 1.5 times their rate — for hours over 40 in a week. Salaried workers earn a set amount per year no matter the exact hours, and many don't get overtime.",
    tags: ["salary", "hourly", "hourly wage", "overtime", "paid per hour"],
  }, kbTrusted("dol")),
  kbEntry({
    q: "What are the forms you fill out for a job, like a W-4 or W-2?",
    a: "A W-4 is the form you fill out when you start a job so your employer knows how much tax to hold back from each paycheck. A W-2 is the form your employer sends after the year ends showing what you earned and the taxes withheld — you use it to file your tax return.",
    tags: ["w-4", "w4", "w-2", "w2", "1099", "tax form", "job form"],
  }, kbTrusted("irs")),
  kbEntry({
    q: "What are Social Security and Medicare taxes on my paycheck?",
    a: "Social Security and Medicare taxes (shown as FICA on a pay stub) come out of almost every paycheck. Social Security pays benefits to retired and disabled workers and their families; Medicare helps pay health costs for people 65 and older. Your employer pays a matching amount.",
    tags: ["fica", "social security tax", "medicare", "withholding", "oasdi", "social security benefit", "social security", "how does social security work"],
  }, kbTrusted("ssa")),
  kbEntry({
    q: "Does more education lead to higher pay?",
    a: "On average, yes. Government data show that people with more education — a certificate, an apprenticeship, or a college degree — tend to earn more and have lower unemployment. Many well-paid careers also come through trade school and apprenticeships, not just four-year college.",
    tags: ["education pay", "degree pay", "college worth it", "is college worth", "earn more with", "career pay", "highest paying job"],
  }, kbTrusted("bls")),
  kbEntry({
    q: "How do I start my own small business?",
    a: "Start with a simple plan: what you'll sell, who will buy it, what it costs to make, and what you'll charge. Keep business money separate and track every dollar. Teens usually need a parent's help, and some businesses need a license or permit.",
    tags: ["start a business", "own business", "small business", "side hustle", "entrepreneur", "self-employed", "freelance", "sell stuff"],
  }, kbTrusted("sba")),

  // ---------- taxes ----------
  kbEntry({
    q: "What are taxes and what do they pay for?",
    a: "Taxes are money people and businesses pay to the government. They pay for shared things like schools, roads, parks, firefighters, and the military. Income tax is taken from a paycheck, and sales tax is added when you buy things.",
    tags: ["tax", "taxes", "irs", "sales tax", "income tax", "property tax"],
  }, kbTrusted("irs")),
  kbEntry({
    q: "What is a tax return and a tax refund?",
    a: "Once a year, people file a tax return to report what they earned and check whether the right amount of tax was taken from their pay. If too much was withheld, they get the difference back as a refund; if too little, they owe more. Teens with a job may get a refund by filing even when they don't have to.",
    tags: ["tax return", "tax refund", "file taxes", "filing taxes", "file my taxes", "do my taxes"],
  }, kbTrusted("irs")),

  // ---------- saving and spending ----------
  kbEntry({
    q: "What is an emergency fund?",
    a: "An emergency fund is money set aside for surprises, like a car repair or a broken phone. Even a small amount saved a little at a time can keep a surprise from turning into debt.",
    tags: ["emergency fund", "emergency savings", "rainy day", "unexpected expense", "emergency"],
  }, kbTrusted("cfpb")),
  kbEntry({
    q: "How much of my money should I save?",
    a: "There is no single right amount. A common starting point is to save a set share — like 10% or 20% — of any money you get, before spending. Even saving a little every time builds the habit, and that matters more than the amount.",
    tags: ["how much should i save", "how much of my money should i save", "how much money should i save", "how much to save", "how much do i save", "percent to save", "save each month"],
  }, kbTrusted("cfpbKids")),
  kbEntry({
    q: "How do I know if something is a good deal?",
    a: "Compare the same item at a few stores or sites, and check the unit price (cost per ounce or per item) to compare different sizes. A sale is only a deal if you needed it anyway. Look at reviews and the return policy before buying.",
    tags: ["good deal", "better deal", "unit price", "compare price", "comparing price", "comparison shop", "coupon", "discount", "on sale"],
  }, kbTrusted("cfpbKids")),
  kbEntry({
    q: "Why do ads make me want to buy things?",
    a: "Ads are designed to make products look exciting, popular, or necessary. Influencers are often paid to promote products — they're supposed to say so with labels like #ad or 'sponsored'. Ask: who made this message, what are they selling, and what are they leaving out?",
    tags: ["ad", "advertising", "advertisement", "commercial", "influencer", "sponsored", "marketing"],
  }, kbTrusted("ftc")),
  kbEntry({
    q: "What should I know about subscriptions and free trials?",
    a: "Many free trials turn into paid subscriptions automatically unless you cancel in time. Before signing up, check the price after the trial and how to cancel, and set a reminder. Small monthly charges add up over a year.",
    tags: ["subscription", "free trial", "auto-renew", "automatic renewal", "cancel a subscription", "monthly charge"],
  }, kbTrusted("ftc")),
  kbEntry({
    q: "Can I return something I bought?",
    a: "It depends on the store's return policy, which can differ for sales, opened items, and online orders. Keep your receipt and check the policy before you buy. If you paid by credit card and there's a problem, you may be able to dispute the charge.",
    tags: ["return policy", "receipt", "return something", "return an item", "return it", "get my money back", "refund policy"],
  }, kbTrusted("ftc")),
  kbEntry({
    q: "How can I shop online safely?",
    a: "Buy from sellers you know, check that the web address starts with https, and read reviews from other sites. Pay with a credit card or trusted payment service rather than a gift card or wire transfer, and never share passwords. Always get a parent's OK first.",
    tags: ["online shopping", "shop online", "shopping online", "buy online", "buying online", "online store", "fake website"],
  }, kbTrusted("ftc")),
  kbEntry({
    q: "What should I know about in-app purchases in games?",
    a: "Games often sell coins, skins, or loot boxes for real money, and small purchases add up fast. Some are designed to make you keep buying. Ask a parent before any purchase, set a budget, and turn on purchase passwords on devices.",
    tags: ["in-app purchase", "in app purchase", "loot box", "robux", "v-buck", "vbuck", "game currency", "gaming purchase", "skin"],
  }, kbTrusted("ftc")),
  kbEntry({
    q: "What should I know about gift cards?",
    a: "Gift cards are like cash — if lost, the money is usually gone. Under federal law, most store gift cards can't expire for at least five years. Anyone who asks you to pay them with gift cards is a scammer: real businesses and government agencies never do that.",
    tags: ["gift card", "gift certificate"],
  }, kbTrusted("ftc")),
  kbEntry({
    q: "What should I know about renting an apartment?",
    a: "Renting means paying a landlord to live in a home you don't own. You sign a lease that sets the rent and rules, and usually pay a security deposit up front that can be returned when you move out. A common guideline is to keep rent to about a third of your income.",
    tags: ["rent", "renting", "apartment", "lease", "landlord", "security deposit", "move out"],
  }, kbTrusted("hud")),

  // ---------- investing ----------
  kbEntry({
    q: "What is the difference between stocks and bonds?",
    a: "A stock is a small piece of ownership in a company, so its value goes up and down with the company. A bond is a loan you make to a company or government, which pays you interest. Stocks usually carry more risk and more chance of growth than bonds. Stocks are bought and sold on the stock market.",
    tags: ["stock", "bond", "share of stock", "stock market", "stock exchange", "wall street", "dow jones", "s p 500"],
  }, kbTrusted("sec")),
  {
    q: "Is cryptocurrency a safe investment?",
    a: "Cryptocurrency like Bitcoin is very risky. Prices can swing wildly in a single day, it is not insured like money in a bank, and scammers often ask to be paid in crypto. Anyone thinking about it should talk with a trusted adult first.",
    tags: ["crypto", "bitcoin", "cryptocurrency", "nft", "dogecoin", "ethereum"],
    tier: "trusted",
    source: "U.S. Securities and Exchange Commission (Investor.gov) and Federal Trade Commission (FTC)",
    url: "investor.gov · consumer.ftc.gov",
  },
  kbEntry({
    q: "What are mutual funds and index funds?",
    a: "A mutual fund pools money from many investors to buy lots of stocks or bonds at once. An index fund is a kind of fund that simply follows a market index, like the S&P 500, usually with low fees. Owning many investments at once — diversification — lowers the risk of one bad pick.",
    tags: ["mutual fund", "index fund", "etf", "exchange traded fund", "diversify", "diversification", "diversified"],
  }, kbTrusted("sec")),
  kbEntry({
    q: "What is the connection between risk and return?",
    a: "In investing, a chance at higher returns usually comes with higher risk of losing money. Savings accounts are very safe but grow slowly; stocks can grow more but can also fall. Anything promising high returns with no risk is a red flag.",
    tags: ["risk", "risky", "risk and return", "investment risk", "lose money", "losing money"],
  }, kbTrusted("sec")),
  kbEntry({
    q: "How can I invest for retirement?",
    a: "Retirement accounts like a 401(k) at work or an IRA give tax benefits for saving for later in life. Many employers add matching money to a 401(k). A teen with a job can open a custodial Roth IRA with a parent's help, and starting early gives compounding decades to work.",
    tags: ["retirement", "retire", "401k", "403b", "ira", "roth", "roth ira", "pension", "employer match"],
  }, kbTrusted("sec")),
  kbEntry({
    q: "Can kids or teens invest?",
    a: "In most states you must be 18 to open an investment account yourself. Before then, a parent or guardian can open a custodial account and manage it for you until you're an adult. A teen with earned income can also have a custodial Roth IRA.",
    tags: ["kid invest", "teen invest", "custodial", "custodial account", "age to invest", "how old to invest", "invest as a kid", "invest as a teen", "utma", "ugma"],
  }, kbTrusted("sec")),
  kbEntry({
    q: "How long does it take to double my money?",
    a: "The Rule of 72 gives a quick estimate: divide 72 by the yearly interest rate. At 6%, money doubles in about 12 years (72 ÷ 6); at 2%, it takes about 36 years. It shows why higher returns and an early start make a big difference.",
    tags: ["rule of 72", "double my money", "doubling money", "money to double", "how long to double"],
  }, kbTrusted("sec")),
  kbEntry({
    q: "What is a dividend?",
    a: "A dividend is a share of a company's profits paid to people who own its stock, often every three months. Not all companies pay dividends — some reinvest profits to grow instead.",
    tags: ["dividend"],
  }, kbTrusted("sec")),
  kbEntry({
    q: "How do I recognize an investment scam?",
    a: "Watch for promises of guaranteed high returns, pressure to act fast, and pitches to recruit friends. Ponzi and pyramid schemes pay early investors with money from newer ones until they collapse. If it sounds too good to be true, it probably is.",
    tags: ["get rich quick", "guaranteed return", "ponzi", "pyramid scheme", "mlm", "too good to be true", "investment scam"],
  }, kbTrusted("sec")),
  kbEntry({
    q: "What are U.S. savings bonds?",
    a: "Savings bonds are loans you make to the U.S. government, which pays them back with interest. They are very safe and can be bought online at TreasuryDirect.gov, sometimes as gifts for kids.",
    tags: ["savings bond", "treasury bond", "i bond", "ee bond", "treasurydirect"],
  }, kbTrusted("treasury")),
  kbEntry({
    q: "What is a financial advisor?",
    a: "A financial advisor helps people plan and invest. Advisors can be paid in different ways, and some must act in your best interest (a fiduciary) while others don't. Before working with one, look them up for free at Investor.gov.",
    tags: ["financial advisor", "financial planner", "broker", "fiduciary", "stockbroker"],
  }, kbTrusted("sec")),
  kbEntry({
    q: "What is net worth?",
    a: "Net worth is what you own (assets, like savings or a car) minus what you owe (liabilities, like loans). It's a snapshot of financial health. Growing it usually means saving more, paying down debt, or both.",
    tags: ["net worth", "asset", "liability", "wealth", "wealthy", "rich"],
  }, kbTrusted("cfpb")),

  // ---------- protecting yourself ----------
  {
    q: "What is identity theft?",
    a: "Identity theft is when someone uses your personal information, like your Social Security number or passwords, to pretend to be you. Keep that information private, use strong passwords, and tell a trusted adult right away if something looks wrong. Victims can report it at IdentityTheft.gov.",
    tags: ["identity theft", "identity", "stolen identity", "personal information", "someone pretending to be me"],
    tier: "trusted",
    source: "Federal Trade Commission (FTC), IdentityTheft.gov",
    url: "identitytheft.gov",
  },
  kbEntry({
    q: "How do I keep my accounts and passwords safe?",
    a: "Use a long, different password for each account, turn on two-step verification, and never share codes sent to your phone. Don't click links in unexpected messages. If an account is hacked, change the password right away and tell a trusted adult.",
    tags: ["password", "strong password", "two-factor", "2fa", "two step", "hacked", "online safety", "internet safety", "account security", "verification code"],
  }, kbTrusted("ftc")),
  kbEntry({
    q: "Why should I keep my Social Security number private?",
    a: "Your Social Security number is a key that unlocks credit and other accounts in your name. Don't carry your card, and only give the number when it's truly required, like for a job or a bank. Ask a parent before sharing it anywhere.",
    tags: ["social security number", "ssn", "social security card"],
  }, kbTrusted("ssa")),
  kbEntry({
    q: "Are payment apps like Venmo or Cash App safe?",
    a: "Payment apps work like handing someone cash: once you send money it is often hard or impossible to get back. Only send money to people you know and trust, double-check the name before you send, and never pay a stranger who rushes you.",
    tags: ["venmo", "cash app", "zelle", "paypal", "payment app", "send money"],
  }, kbTrusted("ftc")),
  kbEntry({
    q: "What are the different types of insurance?",
    a: "Insurance is a plan where you pay a small, regular amount (a premium) so that a big, unexpected cost gets covered. Common types are health insurance (doctor and hospital bills), car insurance (accidents, and required by law to drive), homeowners or renters insurance (your home and belongings), and life insurance (helps a family if someone dies). A deductible is the amount you pay yourself before the insurance starts paying.",
    tags: ["insurance", "insured", "premium", "deductible", "health insurance", "car insurance", "auto insurance", "renters insurance", "life insurance", "copay"],
  }, kbTrusted("naic")),
  kbEntry({
    q: "Is an extended warranty worth it?",
    a: "A warranty is a promise to repair or replace a product if it breaks. Most products come with one from the maker. Extended warranties cost extra and often overlap with that coverage, so read what's covered and for how long before paying.",
    tags: ["warranty", "extended warranty", "protection plan"],
  }, kbTrusted("ftc")),
  kbEntry({
    q: "How do I make sure a charity is real?",
    a: "Research a charity before you give: search its name with words like 'scam' or 'review', and be careful with anyone who pressures you or wants gift cards, cash, or wire transfers. Giving through a charity's own website is safest.",
    tags: ["charity real", "charity is real", "charity is legit", "charity legit", "fake charity", "charity scam", "donate safely", "real charity"],
  }, kbTrusted("ftc")),

  // ---------- college ----------
  kbEntry({
    q: "How do people pay for college?",
    a: "Most students combine several ways: savings, scholarships and grants (which don't have to be paid back), work-study jobs, and student loans (which do). Filling out the free FAFSA form is the first step to getting federal aid.",
    tags: ["college", "fafsa", "tuition", "financial aid", "pay for college", "university"],
  }, kbTrusted("fsa")),
  kbEntry({
    q: "How do scholarships and grants work?",
    a: "Scholarships and grants are money for school that doesn't have to be paid back. Grants, like the federal Pell Grant, are usually based on need; scholarships can be for grades, talents, community service, and more. Never pay to apply for a scholarship.",
    tags: ["scholarship", "grant", "pell grant", "pell"],
  }, kbTrusted("fsa")),
  kbEntry({
    q: "How do student loans work?",
    a: "Student loans are money borrowed for school that must be repaid with interest, usually starting after you leave school. Federal loans usually have lower rates and more flexible repayment than private loans. Borrow only what you need.",
    tags: ["student loan", "college loan", "subsidized", "unsubsidized", "loan forgiveness"],
  }, kbTrusted("fsa")),
  kbEntry({
    q: "How can a family save for college?",
    a: "A 529 plan is a savings account built for education costs, and the growth isn't taxed when used for school. Virginia's plan is Virginia529. Even small, regular deposits started early can add up thanks to compounding.",
    tags: ["529", "save for college", "college saving", "college fund", "virginia529", "invest529"],
  }, kbTrusted("va529")),
  kbEntry({
    q: "What about trade school, community college, or apprenticeships?",
    a: "Community college and trade schools often cost less than four-year colleges and lead to good jobs in health care, building trades, technology, and more. Apprenticeships let you earn a paycheck while you learn. Federal aid can help with many of these programs too.",
    tags: ["trade school", "community college", "apprenticeship", "vocational", "technical school", "skilled trade"],
  }, kbTrusted("fsa")),
];
