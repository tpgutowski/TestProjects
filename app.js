
const memes = [
  {
    id: "m1",
    title: "Standup Surprise",
    image:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" style="background:%23ffc5d9"><text x="50" y="300" font-size="48" font-family="Arial" fill="black">\"We'll be done by EOD\"</text></svg>',
    author: "bug_hunter",
    winrate: 62,
    tier: "Gold",
  },
  {
    id: "m2",
    title: "Ship it",
    image:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" style="background:%23a5f0ff"><text x="80" y="300" font-size="48" font-family="Arial" fill="black">QA vs Friday deploys</text></svg>',
    author: "deploy_destroyer",
    winrate: 71,
    tier: "Platinum",
  },
  {
    id: "m3",
    title: "Scope Creep",
    image:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" style="background:%23c8ffd4"><text x="40" y="300" font-size="48" font-family="Arial" fill="black">Let\\'s add one more thing</text></svg>',
    author: "pm_wrangler",
    winrate: 55,
    tier: "Silver",
  },
  {
    id: "m4",
    title: "Dark Mode",
    image:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" style="background:%23e7ddff"><text x="80" y="300" font-size="48" font-family="Arial" fill="black">Everything is dark mode</text></svg>',
    author: "ui_bandit",
    winrate: 68,
    tier: "Gold",
  },
];

const leaderboard = [
  { rank: 1, title: "Standup Surprise", author: "bug_hunter", score: 1890, badge: "🔥 Top 1" },
  { rank: 2, title: "Ship it", author: "deploy_destroyer", score: 1705, badge: "⚡ Turbo" },
  { rank: 3, title: "Scope Creep", author: "pm_wrangler", score: 1588, badge: "🎯 Streak" },
  { rank: 4, title: "Dark Mode", author: "ui_bandit", score: 1540, badge: "🌈 Creator" },
  { rank: 5, title: "Merge Conflict", author: "git_gremlin", score: 1499, badge: "⚔️ Duelist" },
];

const badges = [
  "Streak Keeper",
  "Turbo Booster",
  "Top 10 Flex",
  "Perfect Swipe",
  "Season Winner",
  "Referral Hero",
];

let currentPair = [0, 1];
let streak = 3;
let xp = 40;
let wins = 24;
let upvotes = 140;

const leftCard = document.getElementById("leftCard");
const rightCard = document.getElementById("rightCard");

function renderMeme(side, meme) {
  document.getElementById(`${side}Image`).style.backgroundImage = `url(${meme.image})`;
  document.getElementById(`${side}Author`).textContent = meme.author;
  document.getElementById(`${side}Winrate`).textContent = `${meme.winrate}% win`;
  document.getElementById(`${side}Tier`).textContent = meme.tier;
}

function pickNewPair() {
  const [i1, i2] = [Math.floor(Math.random() * memes.length), Math.floor(Math.random() * memes.length)];
  currentPair = i1 === i2 ? [i1, (i2 + 1) % memes.length] : [i1, i2];
  renderMeme("left", memes[currentPair[0]]);
  renderMeme("right", memes[currentPair[1]]);
}

function animateShake(target) {
  target.classList.add("shake");
  setTimeout(() => target.classList.remove("shake"), 300);
}

function handleVote(isRight) {
  const winner = isRight ? memes[currentPair[1]] : memes[currentPair[0]];
  const loserCard = isRight ? leftCard : rightCard;
  animateShake(loserCard);
  flashFeedback(`${winner.title} gains +15 ELO`);
  wins += 1;
  xp = Math.min(100, xp + 6);
  streak = Math.min(7, streak + 1);
  updateStats();
  pickNewPair();
}

function flashFeedback(text) {
  const node = document.getElementById("feedback");
  node.textContent = text;
  node.classList.add("shake");
  setTimeout(() => node.classList.remove("shake"), 350);
}

function updateStreakBar() {
  const fill = document.getElementById("streakProgress");
  fill.style.width = `${(streak / 7) * 100}%`;
}

function updateTimer() {
  const timer = document.getElementById("streakTimer");
  const now = Date.now();
  const nextMidnight = new Date();
  nextMidnight.setHours(24, 0, 0, 0);
  const diff = nextMidnight - now;
  const hours = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
  const mins = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
  const secs = String(Math.floor((diff % 60_000) / 1000)).padStart(2, "0");
  timer.textContent = `${hours}:${mins}:${secs}`;
}

function updateStats() {
  document.getElementById("statWins").textContent = wins;
  document.getElementById("statUpvotes").textContent = upvotes;
  document.getElementById("statStreak").textContent = streak;
  const xpBar = document.getElementById("xpBar");
  xpBar.style.width = `${xp}%`;
  updateStreakBar();
}

function renderLeaderboard() {
  const list = document.getElementById("leaderboardList");
  list.innerHTML = "";
  leaderboard.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "leaderboard-row";
    row.innerHTML = `
      <div class="badge">#${entry.rank}</div>
      <div>
        <div class="label">${entry.title}</div>
        <div class="tiny">by ${entry.author}</div>
      </div>
      <div class="pill">${entry.score} • ${entry.badge}</div>
    `;
    list.appendChild(row);
  });
}

function renderBadges() {
  const grid = document.getElementById("badgeGrid");
  badges.forEach((label) => {
    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = label;
    grid.appendChild(badge);
  });
}

function handleUpload() {
  const overlay = document.getElementById("overlayText").value || "Fresh meme";
  const status = document.getElementById("uploadStatus");
  status.textContent = `Published: ${overlay}. Visibility boosted for 24h.`;
  upvotes += 10;
  updateStats();
}

function handleOnboarding() {
  const name = document.getElementById("username").value || "meme_rookie";
  flashFeedback(`Welcome ${name}! Swipe to earn streaks.`);
}

function attachNav() {
  document.querySelectorAll("[data-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function attachEvents() {
  document.getElementById("voteLeft").addEventListener("click", () => handleVote(false));
  document.getElementById("voteRight").addEventListener("click", () => handleVote(true));
  document.getElementById("submitMeme").addEventListener("click", handleUpload);
  document.getElementById("startOnboarding").addEventListener("click", handleOnboarding);
  attachNav();
}

function init() {
  renderLeaderboard();
  renderBadges();
  updateStats();
  pickNewPair();
  attachEvents();
  setInterval(updateTimer, 1000);
  updateTimer();
}

init();
