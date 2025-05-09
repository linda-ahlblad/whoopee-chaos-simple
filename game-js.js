// Game constants
const CUSHION_VARIANTS = [
  { id: 0, name: "The Thundercloud", color: "#4a6da7", scoreValue: 1 },
  { id: 1, name: "The Royal Roar", color: "#8e2de2", scoreValue: 2 },
  { id: 2, name: "The Crimson Calamity", color: "#e94822", scoreValue: 3 },
  { id: 3, name: "The Emerald Eruption", color: "#1eb980", scoreValue: 2 },
  { id: 4, name: "The Golden Gale", color: "#ffcb47", scoreValue: 4 },
  { id: 5, name: "The Obsidian Outburst", color: "#212121", scoreValue: 5 }
];

const DIVINE_QUOTES = [
  { deity: "Zeus", quote: "My thunderous expulsions shake the heavens themselves!" },
  { deity: "Odin", quote: "By my throne in Asgard, what a magnificent release!" },
  { deity: "Pele", quote: "My volcanic emissions flow like lava through the divine realm!" },
  { deity: "Pan", quote: "The forest spirits dance when I release my sylvan zephyrs!" },
  { deity: "Midas", quote: "Even my gaseous emissions turn to gold in their opulence!" },
  { deity: "Hades", quote: "From the depths of the underworld comes this miasmic greeting!" },
  { deity: "Eris", quote: "Chaos is my domain, and chaos I shall release!" },
  { deity: "Athena", quote: "Even wisdom acknowledges the necessity of release!" }
];

// Game variables
let score = 0;
let rounds = 0;
let roundTime = 0;
let maxRoundTime = 30;
let gameTimer = null;
let cushions = [];
let highScore = localStorage.getItem('whoopeeChaosHighScore') || 0;
highScore = parseInt(highScore, 10);

// DOM Elements
const introScreen = document.getElementById('intro-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const scoreDisplay = document.getElementById('score');
const roundDisplay = document.getElementById('round');
const finalScoreDisplay = document.getElementById('final-score');
const finalRoundsDisplay = document.getElementById('final-rounds');
const highScoreMessage = document.getElementById('high-score-message');
const timerFill = document.getElementById('timer-fill');
const timeLeftDisplay = document.getElementById('time-left');
const cushionsContainer = document.getElementById('cushions-container');
const divineMessage = document.getElementById('divine-message');

// Check if device is mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);

// Initialize
function init() {
  startButton.addEventListener('click', startGame);
  restartButton.addEventListener('click', startGame);
}

// Show screen
function showScreen(screen) {
  introScreen.classList.remove('active');
  gameScreen.classList.remove('active');
  gameOverScreen.classList.remove('active');
  
  screen.classList.add('active');
}

// Start game
function startGame() {
  score = 0;
  rounds = 0;
  roundTime = 0;
  
  updateScoreDisplay();
  generateCushions(3);
  
  showScreen(gameScreen);
  startRoundTimer();
}

// Generate cushions
function generateCushions(count) {
  // Clear existing cushions
  cushionsContainer.innerHTML = '';
  cushions = [];
  
  // Create new cushions
  for (let i = 0; i < count; i++) {
    const variantIndex = Math.floor(Math.random() * CUSHION_VARIANTS.length);
    const variant = CUSHION_VARIANTS[variantIndex];
    
    const cushion = {
      id: i,
      variant,
      activated: false
    };
    
    cushions.push(cushion);
    
    // Create DOM element
    const cushionElement = document.createElement('div');
    cushionElement.className = 'cushion';
    cushionElement.style.backgroundColor = variant.color;
    cushionElement.setAttribute('data-id', i);
    
    const nameElement = document.createElement('span');
    nameElement.textContent = variant.name;
    cushionElement.appendChild(nameElement);
    
    // Add click handler
    cushionElement.addEventListener('click', () => handleCushionClick(i));
    
    // Add to container
    cushionsContainer.appendChild(cushionElement);
  }
}

// Handle cushion click
function handleCushionClick(id) {
  const cushion = cushions[id];
  if (cushion.activated) return;
  
  cushion.activated = true;
  
  // Update visual
  const cushionElement = document.querySelector(`.cushion[data-id="${id}"]`);
  cushionElement.classList.add('activated');
  
  // Update score
  score += cushion.variant.scoreValue;
  updateScoreDisplay();
  
  // Play sound
  playSound();
  
  // Vibrate on mobile
  if (isMobile && 'vibrate' in navigator) {
    navigator.vibrate(50);
  }
  
  // Show divine message
  showDivineMessage();
}

// Play sound
function playSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 100 + Math.random() * 200;
    
    gainNode.gain.value = 0.1;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.log('Audio error:', error);
  }
}

// Show divine message
function showDivineMessage(messageText) {
  // Get random quote if no message provided
  if (!messageText) {
    const quoteIndex = Math.floor(Math.random() * DIVINE_QUOTES.length);
    const quote = DIVINE_QUOTES[quoteIndex];
    messageText = `${quote.deity}: "${quote.quote}"`;
  }
  
  // Update and show message
  divineMessage.innerHTML = `<p>${messageText}</p>`;
  divineMessage.classList.add('active');
  
  // Hide after 5 seconds
  setTimeout(() => {
    divineMessage.classList.remove('active');
  }, 5000);
}

// Start round timer
function startRoundTimer() {
  // Reset
  roundTime = 0;
  timerFill.style.width = '100%';
  
  // Clear existing timer
  if (gameTimer) {
    clearInterval(gameTimer);
  }
  
  // Start new timer
  gameTimer = setInterval(() => {
    roundTime++;
    
    // Update timer display
    const timeLeft = maxRoundTime - roundTime;
    timeLeftDisplay.textContent = `${timeLeft}s`;
    timerFill.style.width = `${((maxRoundTime - roundTime) / maxRoundTime) * 100}%`;
    
    // End round if time's up
    if (roundTime >= maxRoundTime) {
      endRound();
    }
  }, 1000);
}

// End round
function endRound() {
  // Clear timer
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
  
  // Check if any cushions were activated
  const anyActivated = cushions.some(cushion => cushion.activated);
  
  if (!anyActivated) {
    // Game over if no cushions activated
    gameOver();
  } else {
    // Start new round
    rounds++;
    updateScoreDisplay();
    
    // More cushions in higher rounds
    const maxCushions = isMobile ? 6 : 8;
    const cushionCount = Math.min(3 + Math.floor(rounds / 2), maxCushions);
    
    // Generate new cushions
    generateCushions(cushionCount);
    
    // Show round message
    showDivineMessage("Round complete! Divine chaos increases...");
    
    // Start new round timer
    startRoundTimer();
  }
}

// Game over
function gameOver() {
  // Clear timer
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
  
  // Update displays
  finalScoreDisplay.textContent = score;
  finalRoundsDisplay.textContent = rounds;
  
  // Check for high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('whoopeeChaosHighScore', highScore);
    highScoreMessage.classList.remove('hidden');
  } else {
    highScoreMessage.classList.add('hidden');
  }
  
  // Show game over screen
  showScreen(gameOverScreen);
}

// Update score display
function updateScoreDisplay() {
  scoreDisplay.textContent = score;
  roundDisplay.textContent = rounds;
}

// Initialize the game
document.addEventListener('DOMContentLoaded', init);
