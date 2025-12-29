const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = "01";
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function draw() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#00ff9c"; // ❌ NO emoji here
  ctx.font = fontSize + "px monospace";

  for (let i = 0; i < drops.length; i++) {
    const text = letters[Math.floor(Math.random() * letters.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

setInterval(draw, 33);

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// ---------------------------
// Mini Games
// ---------------------------

// 1) Reaction Test
const reactionPanel = document.getElementById("reactionPanel");
const reactionStartBtn = document.getElementById("reactionStart");
const reactionResetBtn = document.getElementById("reactionReset");
const reactionResult = document.getElementById("reactionResult");

let reactionTimeout = null;
let reactionStartTime = null;
let reactionState = "idle"; // idle | waiting | go

function reactionSet(text, cls) {
  reactionPanel.textContent = text;
  reactionPanel.classList.remove("waiting", "go");
  if (cls) reactionPanel.classList.add(cls);
}

reactionSet("READY", "waiting");

reactionStartBtn.addEventListener("click", () => {
  if (reactionState === "waiting" || reactionState === "go") return;

  reactionState = "waiting";
  reactionResult.textContent = "Wait for green...";
  reactionSet("WAIT...", "waiting");

  const delay = 900 + Math.random() * 2400; // 0.9s - 3.3s
  reactionTimeout = setTimeout(() => {
    reactionState = "go";
    reactionStartTime = performance.now();
    reactionSet("CLICK!", "go");
  }, delay);
});

reactionPanel.addEventListener("click", () => {
  if (reactionState === "waiting") {
    // clicked too early
    clearTimeout(reactionTimeout);
    reactionTimeout = null;
    reactionState = "idle";
    reactionSet("TOO EARLY", "waiting");
    reactionResult.textContent = "Too early. Start again.";
    return;
  }

  if (reactionState === "go") {
    const ms = Math.round(performance.now() - reactionStartTime);
    reactionState = "idle";
    reactionSet("READY", "waiting");
    reactionResult.textContent = `Reaction: ${ms} ms`;
  }
});

reactionResetBtn.addEventListener("click", () => {
  clearTimeout(reactionTimeout);
  reactionTimeout = null;
  reactionStartTime = null;
  reactionState = "idle";
  reactionSet("READY", "waiting");
  reactionResult.textContent = "—";
});

// 2) Typing Challenge
const typingTarget = document.getElementById("typingTarget");
const typingInput = document.getElementById("typingInput");
const typingStartBtn = document.getElementById("typingStart");
const typingResetBtn = document.getElementById("typingReset");
const typingResult = document.getElementById("typingResult");

let typingScore = 0;
let typingBest = 0;
let currentString = "";

function genString() {
  // “encrypted” vibe: binary + hex-ish
  const chars = "01ABCDEF";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function typingUpdateUI(msg = "") {
  typingResult.textContent = `Score: ${typingScore} • Best: ${typingBest}${msg ? " • " + msg : ""}`;
}

function typingNewRound() {
  currentString = genString();
  typingTarget.textContent = currentString;
  typingInput.value = "";
  typingInput.focus();
}

typingStartBtn.addEventListener("click", () => {
  if (!currentString) {
    typingScore = 0;
    typingUpdateUI("Go.");
  }
  typingNewRound();
});

typingInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const typed = typingInput.value.trim().toUpperCase();
  if (!currentString) return;

  if (typed === currentString) {
    typingScore++;
    if (typingScore > typingBest) typingBest = typingScore;
    typingUpdateUI("Clean.");
    typingNewRound();
  } else {
    typingBest = Math.max(typingBest, typingScore);
    typingScore = 0;
    typingUpdateUI("Miss.");
    typingNewRound();
  }
});

typingResetBtn.addEventListener("click", () => {
  typingScore = 0;
  currentString = "";
  typingTarget.textContent = "press start";
  typingInput.value = "";
  typingUpdateUI("");
});
