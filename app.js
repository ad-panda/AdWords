// Simplified app.js from previous message
let user = JSON.parse(localStorage.getItem("adwords_user")) || { name: "", xp: 0 };

let currentQuiz = [];
let currentIndex = 0;
let score = 0;
let customWords = [];

function login() {
  const username = document.getElementById("username").value;
  if (!username) return;

  user.name = username;
  saveUser();

  document.getElementById("login").style.display = "none";
  document.getElementById("menu").style.display = "block";
  updateXPDisplay();
}

function saveUser() {
  localStorage.setItem("adwords_user", JSON.stringify(user));
}

function updateXPDisplay() {
  document.getElementById("xp-display").innerText =
    `XP actuel : ${user.xp}`;
}

async function startQuiz(theme) {
  const res = await fetch(`themes/${theme}.json`);
  currentQuiz = await res.json();

  document.getElementById("menu").style.display = "none";
  document.getElementById("quiz").style.display = "block";

  currentIndex = 0;
  score = 0;

  document.getElementById("theme-title").innerText = theme.toUpperCase();
  showQuestion();
}

function showQuestion() {
  if (currentIndex >= currentQuiz.length) {
    finishQuiz();
    return;
  }

  document.getElementById("question").innerText =
    `Traduis : "${currentQuiz[currentIndex].fr}"`;

  document.getElementById("answer").value = "";
}

function submitAnswer() {
  const answer = document.getElementById("answer").value.toLowerCase();
  const correct = currentQuiz[currentIndex].en.toLowerCase();

  if (answer === correct) score++;

  currentIndex++;
  showQuestion();
}

function finishQuiz() {
  const percent = (score / currentQuiz.length) * 100;
  let xp = 0;

  if (percent >= 100) xp = 1;
  else if (percent >= 75) xp = 0.75;
  else if (percent >= 50) xp = 0.5;
  else if (percent >= 25) xp = 0.25;

  user.xp += xp;
  saveUser();

  document.getElementById("quiz").innerHTML =
    `<h2>Quiz terminé !</h2>
     <p>Score : ${score}/${currentQuiz.length}</p>
     <p>XP gagné : ${xp}</p>
     <p>Total XP : ${user.xp}</p>
     <button onclick="location.reload()">Retour menu</button>`;
}

function openCustom() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("create-quiz").style.display = "block";
}

function addCustomWord() {
  const fr = document.getElementById("fr-word").value;
  const en = document.getElementById("en-word").value;

  if (fr && en) {
    customWords.push({ fr, en });
    document.getElementById("custom-quiz-msg").innerText = "Mot ajouté !";
    document.getElementById("fr-word").value = "";
    document.getElementById("en-word").value = "";
  }
}

function startCustomQuiz() {
  if (customWords.length === 0) {
    alert("Ajoute au moins un mot !");
    return;
  }

  currentQuiz = customWords;
  customWords = [];

  document.getElementById("create-quiz").style.display = "none";
  document.getElementById("quiz").style.display = "block";

  currentIndex = 0;
  score = 0;
  showQuestion();
}
