# Spec 10: Students join the game live on their own devices

**Status:** Needs decisions (Owner: Sumeet)

## What to build
A volunteer opens the Facilitator dashboard and gets a short room code. Students open the site on their own phones or Chromebooks, type the code, and vote. Votes appear live on the dashboard bars, which today only show counts the volunteer taps in (spec 08).

## Why this needs decisions first
It breaks the "no backend, no external requests" constraint: every student tap has to travel through a hosted live service so the dashboard can see it. Spec 09 already relaxed the constraint for anonymous counts, but this would send taps from children's devices, so it needs a separate yes.

## Decisions needed
1. **Approval.** OK from the owner, plus Virginia Jump$tart and the host school, to send anonymous votes from students' devices.
2. **Service.** Which hosted real-time service, on whose account, and the free-tier limits. It has to work on school wifi, which often blocks unknown sites.
3. **Privacy rules.** Proposed: no names or logins; a random room code that expires after the session; only "room code + round + answer" is sent; nothing is stored after the session ends. Grades K–2 stay on volunteer tallies.

## Done when
A volunteer starts a room, at least 25 student devices join with the code, votes show live on the dashboard, the room data is deleted when the session ends, and the tally-only mode still works with no internet.
