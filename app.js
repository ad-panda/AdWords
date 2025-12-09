// --- Initialisation Utilisateur ---
let user = JSON.parse(localStorage.getItem("adwords_user")) || { 
  name: "", 
  xp: 0, 
  stats: { total: 0, success: 0 } 
};

// Compatibilité anciens utilisateurs
if (!user.stats) {
  user.stats = { total: 0, success: 0 };
}

let currentQuiz = [];
let currentIndex = 0;
let score = 0;
let customWords = [];

// Constantes de jeu
const XP_PER_LEVEL = 500;
const MAX_LEVEL = 100;

// --- Gestion Connexion & Sauvegarde ---

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
  // Calcul du niveau actuel : (XP total / 500) + 1
  let level = Math.floor(user.xp / XP_PER_LEVEL) + 1;
  
  // Plafonner au niveau 100
  if (level > MAX_LEVEL) level = MAX_LEVEL;

  // Calcul de l'XP dans le niveau courant (ex: j'ai 1200XP -> Niveau 3, il reste 200XP dans la barre)
  let xpInCurrentLevel = user.xp % XP_PER_LEVEL;
  
  // Si on est niveau max, la barre est pleine
  if (level === MAX_LEVEL) xpInCurrentLevel = XP_PER_LEVEL;

  // Pourcentage pour la barre CSS
  const percent = (xpInCurrentLevel / XP_PER_LEVEL) * 100;

  // Mise à jour du DOM
  document.getElementById("level-display").innerText = `Niveau ${level}`;
  document.getElementById("xp-text").innerText = `${Math.floor(xpInCurrentLevel)} / ${XP_PER_LEVEL} XP`;
  document.getElementById("xp-fill").style.width = `${percent}%`;
}

// --- Gestion du Profil ---

function openProfile() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("profile").style.display = "block";

  document.getElementById("edit-username").value = user.name;

  const total = user.stats.total;
  const success = user.stats.success;
  const percent = total === 0 ? 0 : Math.round((success / total) * 100);

  document.getElementById("stat-text").innerHTML = 
    `Questions répondues : <strong>${total}</strong><br>
     Bonnes réponses : <strong>${success}</strong><br>
     Taux de réussite : <strong style="color:${percent >= 50 ? 'green' : 'red'}">${percent}%</strong><br>
     XP Total : <strong>${Math.floor(user.xp)}</strong>`;
}

function saveProfileName() {
  const newName = document.getElementById("edit-username").value;
  if (newName) {
    user.name = newName;
    saveUser();
    alert("Nom modifié avec succès !");
  }
}

function closeProfile() {
  document.getElementById("profile").style.display = "none";
  document.getElementById("menu").style.display = "block";
  updateXPDisplay();
}

// --- Gestion du Quiz ---

async function startQuiz(theme) {
  try {
    const res = await fetch(`themes/${theme}.json`);
    currentQuiz = await res.json();
  } catch (e) {
    console.error("Erreur chargement thème", e);
    alert("Impossible de charger ce thème.");
    return;
  }
  setupQuizUI(theme);
}

function startCustomQuiz() {
  if (customWords.length === 0) {
    alert("Ajoute au moins un mot !");
    return;
  }
  currentQuiz = customWords;
  customWords = []; 
  document.getElementById("create-quiz").style.display = "none";
  setupQuizUI("Custom");
}

function setupQuizUI(title) {
  document.getElementById("menu").style.display = "none";
  document.getElementById("quiz").style.display = "block";

  currentIndex = 0;
  score = 0;
  document.getElementById("theme-title").innerText = title.toUpperCase();
  showQuestion();
}

function showQuestion() {
  document.getElementById("question-area").style.display = "block";
  document.getElementById("feedback-area").style.display = "none";
  
  const answerInput = document.getElementById("answer");
  answerInput.value = "";
  answerInput.focus();

  document.getElementById("question").innerText =
    `Traduis le mot ${currentIndex + 1} / ${currentQuiz.length} : 
    "${currentQuiz[currentIndex].fr}"`;

  document.getElementById("score").innerText =
    `Score session : ${score} / ${currentQuiz.length}`;
}

function submitAnswer() {
  const answerInput = document.getElementById("answer");
  const answer = answerInput.value.toLowerCase().trim();
  const correct = currentQuiz[currentIndex].en.toLowerCase().trim();

  document.getElementById("question-area").style.display = "none";
  document.getElementById("feedback-area").style.display = "block";

  const feedbackMsg = document.getElementById("feedback-msg");
  const correctionText = document.getElementById("correction-text");

  user.stats.total++; 

  if (answer === correct) {
    score++;
    user.stats.success++; 
    
    feedbackMsg.innerText = "BRAVO ! 🎉";
    feedbackMsg.className = "correct";
    correctionText.innerText = ""; 
  } else {
    feedbackMsg.innerText = "DOMMAGE...";
    feedbackMsg.className = "wrong";
    correctionText.innerHTML = `La bonne réponse était : <br><strong>${currentQuiz[currentIndex].en}</strong>`;
  }

  saveUser();
  document.getElementById("score").innerText = 
    `Score session : ${score} / ${currentQuiz.length}`;
  
  document.getElementById("btn-next").focus();
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex >= currentQuiz.length) {
    finishQuiz();
  } else {
    showQuestion();
  }
}

function finishQuiz() {
  const percent = (score / currentQuiz.length) * 100;
  let xpGain = 0;

  // NOUVEAU SYSTÈME DE GAIN D'XP (Plus gratifiant pour atteindre 500)
  if (percent >= 100) xpGain = 50;       // Parfait
  else if (percent >= 75) xpGain = 30;   // Bien
  else if (percent >= 50) xpGain = 15;   // Moyen
  else if (percent >= 25) xpGain = 5;    // Début

  user.xp += xpGain;
  saveUser();

  document.getElementById("quiz").innerHTML =
    `<h2>Quiz terminé !</h2>
     <p>Score final : ${score}/${currentQuiz.length}</p>
     <p class="correct">+ ${xpGain} XP</p>
     <button onclick="location.reload()">Retour menu</button>`;
}

// --- Création Quiz Personnalisé ---

function openCustom() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("create-quiz").style.display = "block";
}

function addCustomWord() {
  const fr = document.getElementById("fr-word").value.trim();
  const en = document.getElementById("en-word").value.trim();

  if (fr && en) {
    customWords.push({ fr, en });
    document.getElementById("custom-quiz-msg").innerText = `Mot ajouté ! (${customWords.length})`;
    document.getElementById("fr-word").value = "";
    document.getElementById("en-word").value = "";
    document.getElementById("fr-word").focus();
  }
}

// --- Écouteurs Clavier ---

document.getElementById("answer").addEventListener("keypress", function(event) {
  if (event.key === "Enter") submitAnswer();
});

document.getElementById("en-word").addEventListener("keypress", function(event) {
  if (event.key === "Enter") addCustomWord();
});

document.addEventListener("keypress", function(event) {
    const feedbackArea = document.getElementById("feedback-area");
    if(event.key === "Enter" && feedbackArea && feedbackArea.style.display === "block"){
        nextQuestion();
    }
});