# Kaun Banega Detective

A live, host-controlled forensic science quiz for up to 40 players. Everyone sees the
same case on their own screen at the same moment, a 2-minute timer runs, and the answer
plus its reasoning appears on every screen only when the host presses **Reveal Answer**.

Fifteen cases are loaded from `questions.js`, including three crime-scene photographs.

---

## 1. The live site

**https://kaun-banega-detective.onrender.com** — players
**https://kaun-banega-detective.onrender.com/host** — host console

Deployed from the private GitHub repo `vaibhavs4n6-glitch/kaun-banega-detective`.
Committing a change to that repo redeploys the site automatically.

**The free plan sleeps after 15 minutes of no traffic.** Waking takes up to a
minute, and while it wakes Render answers with its own "Not Found" page. The
site now retries through that automatically, so a visitor sees "Waking the
server…" instead of an error. Two things still follow from it:

- Open the link about ten minutes before the quiz so it is awake when people arrive.
- **A restart wipes all scores and players**, because the game is held in memory.
  That will not happen while forty people are actively playing, but it is the one
  failure that would cost you the leaderboard mid-event. Render's $7/month plan
  removes sleeping entirely if you want that guarantee.

---

## 2. Run it on your own machine

Node.js 16 or newer is the only requirement. There are no packages to install.

```bash
cd kaun-banega-detective
node server.js
```

The terminal prints three addresses:

```
Players   http://localhost:3000
          http://192.168.1.7:3000   <- share this on Wi-Fi
Host      http://localhost:3000/host
```

**Option A — everyone in one room (no internet needed).**
Keep the laptop running the server on the same Wi-Fi as the participants and share the
`192.168.x.x` address. Phones and laptops on that network open it directly. Turn the
address into a QR code and project it; joining takes one tap.

**Option B — participants joining from anywhere.**
Push this folder to GitHub, open [render.com](https://render.com), create a **New Web
Service** from the repository and accept the defaults. `render.yaml` already sets the
start command and the host credentials. Render gives a public `https://` link within a
few minutes. The free plan sleeps after inactivity, so open the link once about ten
minutes before the event.

---

## 3. Host console

Open `/host` (for example `http://192.168.1.7:3000/host`) on your own laptop.

| Field | Value |
| --- | --- |
| Host ID | `Vaibhav4n6` |
| Password | `Vaibhav@9461` |

Nobody else can reach the console. Players only get a name field, and `Vaibhav4n6` is
blocked as a player name.

The bottom control deck runs the game:

| Control | Effect |
| --- | --- |
| **Start Game** | Opens Case 1 on every screen and starts the 2-minute timer |
| **Reveal Answer** | Pushes the correct option and the forensic reasoning to everyone |
| **Next / Prev** | Moves to the next or previous case and restarts the timer |
| **Hold / Resume** | Freezes and restarts the countdown on every screen |
| **+30s** | Adds thirty seconds to the running timer |
| **Leaderboard** | Puts the standings on every screen |
| **End Game** | Shows the final verdict table |
| **Reset** | Clears all scores and returns everyone to the lobby |

The right-hand panel shows live response counts per option, a jump list for any of the
fifteen cases, and the roster with each player's running score. The `×` beside a name
removes that player.

The console shows you the correct option marked **KEY** before you reveal it. Players
never receive it: the answer and the reasoning are held on the server until you press
**Reveal Answer**, so they cannot be read from the page source.

The player view and the host console keep separate sessions, so you can run the console
in one tab and watch a player's screen in a second tab of the same browser. **Sign out**
in the top right leaves either one.

### If the host login will not open

Every failed sign-in is printed in the server window, showing the ID that was received.
Check there first — it distinguishes a wrong ID from a wrong password immediately.

Confirm the address ends in `/host` exactly, for example `http://192.168.1.7:3000/host`.
Opening `index.html` by double-clicking it will not work; the game only runs through
`node server.js`.

---

## 4. Scoring

A correct answer scores **1000 points plus a speed bonus of up to 1000**, calculated from
the time left on the clock. A wrong answer or no answer scores zero. Answers lock on the
first tap and cannot be changed.

A player who loses connection and rejoins with the same name keeps their score.

---

## 5. Settings

Environment variables, all optional:

```bash
PORT=8080 HOST_ID=Vaibhav4n6 HOST_PASS='Vaibhav@9461' MAX_PLAYERS=40 TIMER_SECONDS=120 node server.js
```

| Variable | Default |
| --- | --- |
| `PORT` | `3000` |
| `HOST_ID` | `Vaibhav4n6` |
| `HOST_PASS` | `Vaibhav@9461` |
| `MAX_PLAYERS` | `40` |
| `TIMER_SECONDS` | `120` |

---

## 6. Editing the questions

`questions.js` holds all fifteen cases in order. Each entry takes this shape:

```js
{
  id: 1,
  title: 'The Kitchen Mystery',
  tag: 'Presumptive Blood Testing',   // small label above the title
  brief: ['first paragraph', 'second paragraph'],
  image: 'img/q11.jpg',               // optional
  prompt: 'What is the most scientifically sound deduction?',
  options: ['A text', 'B text', 'C text', 'D text'],
  answer: 1,                          // 0 = A, 1 = B, 2 = C, 3 = D
  reasoning: 'Shown to everyone at reveal.'
}
```

Restart the server after editing. A `brief` line containing a speaker and a quotation
renders as an indented witness statement.

To add a new photograph, drop the file into `public/img/` and set `image: 'img/yourfile.jpg'`.

---

## 7. Files

```
server.js            game logic, live state stream, host authentication
questions.js         the fifteen cases
public/index.html    player and host interface (single file)
public/img/          three crime-scene photographs
public/fonts/        typefaces, served locally so the game works offline
render.yaml          one-click cloud deployment settings
```
