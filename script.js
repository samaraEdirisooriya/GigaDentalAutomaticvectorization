
// LMS State Management
let currentTense = 'present-continuous';
let currentSection = 'introduction';
let currentQuizQuestion = 1;
let quizAnswers = {};
let quizScore = 0;
let lessonProgress = 0;
let gameScores = {
    matching: 0,
    verbBuilding: 0,
    dragDrop: 0
};

// Tense configurations
const tenseConfigs = {
    'present-continuous': {
        title: '🐾 Present Continuous Tense Adventure 🐾',
        badge: 'Present Continuous',
        color: '#fd79a8'
    },
    'present-simple': {
        title: '⭐ Present Simple Tense Adventure ⭐',
        badge: 'Present Simple',
        color: '#74b9ff'
    },
    'past-simple': {
        title: '📅 Past Simple Tense Adventure 📅',
        badge: 'Past Simple',
        color: '#e17055'
    },
    'future-simple': {
        title: '🚀 Future Simple Tense Adventure 🚀',
        badge: 'Future Simple',
        color: '#00b894'
    },
    'present-perfect': {
        title: '💎 Present Perfect Tense Adventure 💎',
        badge: 'Present Perfect',
        color: '#a29bfe'
    }
};

// Verb building game data
const verbs = [
    { base: 'play', ing: 'playing' },
    { base: 'run', ing: 'running' },
    { base: 'swim', ing: 'swimming' },
    { base: 'jump', ing: 'jumping' },
    { base: 'dance', ing: 'dancing' },
    { base: 'sing', ing: 'singing' },
    { base: 'eat', ing: 'eating' },
    { base: 'sleep', ing: 'sleeping' },
    { base: 'walk', ing: 'walking' },
    { base: 'hop', ing: 'hopping' }
];

let currentVerbIndex = 0;
let selectedMatchItems = [];

// Initialize LMS
document.addEventListener('DOMContentLoaded', function() {
    initializeLMS();
    setupEventListeners();
    setupSentenceBuilder();
    setupMatchingGame();
    setupDragDrop();
    startAnimations();
});

function initializeLMS() {
    updateProgress();
    showSection('introduction');
    setupNavigation();
    loadProgress();
}

function setupEventListeners() {
    // Tense navigation
    const tenseButtons = document.querySelectorAll('.tense-btn');
    tenseButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tense = this.dataset.tense;
            switchTense(tense);
        });
    });

    // Section navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.dataset.section;
            showSection(section);
            updateNavigation(section);
        });
    });
}

function switchTense(tenseId) {
    // Hide current tense content
    const currentTenseContent = document.getElementById(`${currentTense}-content`);
    if (currentTenseContent) {
        currentTenseContent.classList.remove('active');
    }

    // Show new tense content
    const newTenseContent = document.getElementById(`${tenseId}-content`);
    if (newTenseContent) {
        newTenseContent.classList.add('active');
    }

    // Update tense navigation
    const tenseButtons = document.querySelectorAll('.tense-btn');
    tenseButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tense === tenseId) {
            btn.classList.add('active');
        }
    });

    // Update UI elements
    updateTenseUI(tenseId);
    
    // Reset to introduction section
    currentSection = 'introduction';
    showSection('introduction');
    updateNavigation('introduction');
    
    currentTense = tenseId;
    saveProgress();
}

function updateTenseUI(tenseId) {
    const config = tenseConfigs[tenseId];
    if (!config) return;

    // Update main title
    const mainTitle = document.getElementById('mainTitle');
    if (mainTitle) {
        mainTitle.textContent = config.title;
    }

    // Update tense badge
    const tenseBadge = document.getElementById('currentTenseBadge');
    if (tenseBadge) {
        tenseBadge.textContent = config.badge;
        tenseBadge.style.background = `linear-gradient(135deg, ${config.color}, ${adjustColor(config.color, -20)})`;
    }
}

function adjustColor(color, amount) {
    // Simple color adjustment function
    return color.replace(/[0-9a-f]{6}/gi, function(match) {
        const num = parseInt(match, 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
    });
}

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            navButtons.forEach(button => button.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    // Get sections within the current tense content
    const currentTenseContent = document.getElementById(`${currentTense}-content`);
    if (!currentTenseContent) return;
    
    const sections = currentTenseContent.querySelectorAll('.lesson-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = currentTenseContent.querySelector(`#${sectionId}`);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionId;
        updateProgress();
        saveProgress();
    }
}

function updateNavigation(activeSection) {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === activeSection) {
            btn.classList.add('active');
        }
    });
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const sections = ['introduction', 'lessons', 'games', 'videos', 'quiz'];
    const currentIndex = sections.indexOf(currentSection);
    const progress = ((currentIndex + 1) / sections.length) * 100;
    
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    if (progressText) {
        progressText.textContent = Math.round(progress) + '% Complete';
    }
    
    lessonProgress = progress;
}

// Sentence Builder Functions
function setupSentenceBuilder() {
    const subjectSelect = document.getElementById('subjectSelect');
    const auxiliarySelect = document.getElementById('auxiliarySelect');
    const verbSelect = document.getElementById('verbSelect');
    
    if (subjectSelect && auxiliarySelect && verbSelect) {
        [subjectSelect, auxiliarySelect, verbSelect].forEach(select => {
            select.addEventListener('change', updateSentence);
        });
        updateSentence();
    }
}

function updateSentence() {
    const subject = document.getElementById('subjectSelect').value;
    const auxiliary = document.getElementById('auxiliarySelect').value;
    const verb = document.getElementById('verbSelect').value;
    const result = document.getElementById('sentenceResult');
    const demo = document.getElementById('animationDemo');
    
    if (result) {
        result.textContent = `${subject} ${auxiliary} ${verb}`;
    }
    
    // Update animation demo based on selection
    if (demo) {
        const animal = subject.includes('cat') ? '🐱' : subject.includes('dog') ? '🐶' : '🐦';
        const action = getActionEmoji(verb);
        demo.innerHTML = `<span class="demo-animal">${animal}</span><span class="demo-action">${action}</span>`;
    }
}

function getActionEmoji(verb) {
    const actionMap = {
        'playing': '⚽',
        'running': '💨',
        'sleeping': '😴',
        'eating': '🍎'
    };
    return actionMap[verb] || '✨';
}

// Matching Game Functions
function setupMatchingGame() {
    const matchItems = document.querySelectorAll('.match-item');
    matchItems.forEach(item => {
        item.addEventListener('click', function() {
            selectMatchItem(this);
        });
    });
}

function selectMatchItem(item) {
    if (item.classList.contains('matched')) return;
    
    if (selectedMatchItems.length === 0) {
        item.classList.add('selected');
        selectedMatchItems.push(item);
    } else if (selectedMatchItems.length === 1) {
        if (selectedMatchItems[0] === item) {
            // Deselect if clicking the same item
            item.classList.remove('selected');
            selectedMatchItems = [];
            return;
        }
        
        const firstItem = selectedMatchItems[0];
        const secondItem = item;
        
        // Check if they match
        if (firstItem.dataset.match === secondItem.dataset.match) {
            // Match found!
            firstItem.classList.add('matched');
            secondItem.classList.add('matched');
            firstItem.classList.remove('selected');
            
            gameScores.matching++;
            updateMatchingScore();
            
            // Check if all matches are found
            if (gameScores.matching === 3) {
                setTimeout(() => {
                    showCelebration('🎉 Perfect matching! All animals found their actions!');
                }, 500);
            }
        } else {
            // No match, remove selection after a brief delay
            secondItem.classList.add('selected');
            setTimeout(() => {
                firstItem.classList.remove('selected');
                secondItem.classList.remove('selected');
            }, 1000);
        }
        
        selectedMatchItems = [];
    }
}

function updateMatchingScore() {
    const scoreElement = document.getElementById('matchingScore');
    if (scoreElement) {
        scoreElement.textContent = gameScores.matching;
    }
}

// Verb Building Game Functions
function checkVerbAnswer() {
    const currentVerb = verbs[currentVerbIndex];
    const userAnswer = document.getElementById('verbAnswer').value.trim().toLowerCase();
    const feedback = document.getElementById('verbFeedback');
    
    if (userAnswer === currentVerb.ing) {
        feedback.textContent = `🎉 Correct! "${currentVerb.base}" becomes "${currentVerb.ing}"`;
        feedback.className = 'verb-feedback correct';
        gameScores.verbBuilding++;
    } else {
        feedback.textContent = `❌ Not quite! "${currentVerb.base}" becomes "${currentVerb.ing}"`;
        feedback.className = 'verb-feedback incorrect';
    }
    
    setTimeout(() => {
        nextVerb();
    }, 2000);
}

function nextVerb() {
    currentVerbIndex = (currentVerbIndex + 1) % verbs.length;
    const currentWord = document.getElementById('currentWord');
    const verbAnswer = document.getElementById('verbAnswer');
    const feedback = document.getElementById('verbFeedback');
    
    if (currentWord) {
        currentWord.textContent = verbs[currentVerbIndex].base;
    }
    if (verbAnswer) {
        verbAnswer.value = '';
    }
    if (feedback) {
        feedback.textContent = '';
        feedback.className = 'verb-feedback';
    }
}

// Drag and Drop Functions
function setupDragDrop() {
    const draggables = document.querySelectorAll('.draggable');
    const dropZones = document.querySelectorAll('.drop-zone');
    
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', handleDragStart);
        draggable.addEventListener('dragend', handleDragEnd);
    });
    
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.textContent);
    e.dataTransfer.setData('application/x-type', e.target.dataset.type);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    e.target.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    
    const draggedText = e.dataTransfer.getData('text/plain');
    const draggedType = e.dataTransfer.getData('application/x-type');
    const dropZoneType = e.target.dataset.type;
    
    if (draggedType === dropZoneType) {
        e.target.textContent = draggedText;
        e.target.classList.add('filled');
        
        // Hide the dragged element
        const draggables = document.querySelectorAll('.draggable');
        draggables.forEach(draggable => {
            if (draggable.textContent === draggedText && draggable.dataset.type === draggedType) {
                draggable.style.opacity = '0.3';
                draggable.style.pointerEvents = 'none';
            }
        });
    }
}

function checkSentence() {
    const dropZones = document.querySelectorAll('.drop-zone');
    const feedback = document.getElementById('sentenceFeedback');
    let sentence = '';
    let isComplete = true;
    
    dropZones.forEach(zone => {
        if (zone.classList.contains('filled')) {
            sentence += zone.textContent + ' ';
        } else {
            isComplete = false;
        }
    });
    
    if (!isComplete) {
        feedback.textContent = '⚠️ Please fill all the blanks to complete the sentence!';
        feedback.className = 'sentence-feedback incomplete';
        return;
    }
    
    // Check if the sentence makes sense
    sentence = sentence.trim();
    if (sentence.includes('🐰 The rabbit is hopping') || sentence.includes('🦋 The butterflies are dancing')) {
        feedback.textContent = `🎉 Perfect! "${sentence}" is a correct Present Continuous sentence!`;
        feedback.className = 'sentence-feedback correct';
        gameScores.dragDrop++;
    } else {
        feedback.textContent = `❌ Almost there! Check if the subject and auxiliary verb match correctly.`;
        feedback.className = 'sentence-feedback incorrect';
    }
}

// Video Functions
function playVideo(videoType) {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('videoPlayer');
    const subtitles = document.getElementById('videoSubtitles');
    
    modal.style.display = 'block';
    
    // Create animated content based on video type
    let content = '';
    let subtitle = '';
    
    switch(videoType) {
        case 'squirrel':
            content = createSquirrelAnimation();
            subtitle = 'The squirrel is climbing up the tree trunk to find nuts!';
            break;
        case 'turtle':
            content = createTurtleAnimation();
            subtitle = 'The turtle is swimming gracefully through the blue ocean!';
            break;
        case 'eagle':
            content = createEagleAnimation();
            subtitle = 'The eagle is soaring high above the mountain peaks!';
            break;
    }
    
    player.innerHTML = content;
    subtitles.textContent = subtitle;
}

function createSquirrelAnimation() {
    return `
        <div class="video-scene">
            <div class="tree-trunk">🌳</div>
            <div class="climbing-squirrel">🐿️</div>
            <div class="nuts">🌰</div>
            <style>
                .video-scene { position: relative; width: 100%; height: 100%; }
                .tree-trunk { position: absolute; left: 50%; top: 20%; font-size: 4rem; transform: translateX(-50%); }
                .climbing-squirrel { position: absolute; left: 50%; font-size: 2rem; animation: climb 3s ease-in-out infinite; }
                .nuts { position: absolute; left: 60%; top: 10%; font-size: 1.5rem; }
                @keyframes climb { 0% { top: 80%; } 50% { top: 30%; } 100% { top: 80%; } }
            </style>
        </div>
    `;
}

function createTurtleAnimation() {
    return `
        <div class="video-scene">
            <div class="ocean-waves">🌊🌊🌊</div>
            <div class="swimming-turtle">🐢</div>
            <div class="fish">🐠</div>
            <style>
                .video-scene { position: relative; width: 100%; height: 100%; background: linear-gradient(to bottom, #87CEEB, #4682B4); }
                .ocean-waves { position: absolute; top: 10%; width: 100%; font-size: 2rem; animation: wave 2s ease-in-out infinite; }
                .swimming-turtle { position: absolute; top: 50%; font-size: 3rem; animation: swim 4s linear infinite; }
                .fish { position: absolute; top: 60%; right: 20%; font-size: 1.5rem; animation: fish-swim 3s ease-in-out infinite; }
                @keyframes wave { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(10px); } }
                @keyframes swim { 0% { left: -10%; } 100% { left: 110%; } }
                @keyframes fish-swim { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-20px); } }
            </style>
        </div>
    `;
}

function createEagleAnimation() {
    return `
        <div class="video-scene">
            <div class="clouds">☁️ ☁️ ☁️</div>
            <div class="soaring-eagle">🦅</div>
            <div class="mountains">⛰️ ⛰️</div>
            <style>
                .video-scene { position: relative; width: 100%; height: 100%; background: linear-gradient(to bottom, #87CEEB, #F0F8FF); }
                .clouds { position: absolute; top: 20%; width: 100%; font-size: 2rem; animation: drift 6s linear infinite; }
                .soaring-eagle { position: absolute; top: 30%; font-size: 3rem; animation: soar 5s ease-in-out infinite; }
                .mountains { position: absolute; bottom: 10%; width: 100%; font-size: 2rem; text-align: center; }
                @keyframes drift { 0% { transform: translateX(-10%); } 100% { transform: translateX(110%); } }
                @keyframes soar { 0%, 100% { left: 10%; top: 30%; } 25% { left: 70%; top: 20%; } 50% { left: 80%; top: 40%; } 75% { left: 30%; top: 25%; } }
            </style>
        </div>
    `;
}

function closeVideo() {
    const modal = document.getElementById('videoModal');
    modal.style.display = 'none';
}

// Quiz Functions
function nextQuestion() {
    // Save current answer
    const currentAnswer = document.querySelector(`input[name="q${currentQuizQuestion}"]:checked`);
    if (currentAnswer) {
        quizAnswers[`q${currentQuizQuestion}`] = currentAnswer.value;
    }
    
    // Hide current question
    document.getElementById(`question${currentQuizQuestion}`).classList.remove('active');
    
    // Move to next question
    currentQuizQuestion++;
    
    if (currentQuizQuestion <= 5) {
        document.getElementById(`question${currentQuizQuestion}`).classList.add('active');
        updateQuizProgress();
        
        // Update navigation buttons
        document.getElementById('prevBtn').disabled = false;
        
        if (currentQuizQuestion === 5) {
            document.getElementById('nextBtn').style.display = 'none';
            document.getElementById('submitBtn').style.display = 'inline-block';
        }
    }
}

function previousQuestion() {
    if (currentQuizQuestion > 1) {
        document.getElementById(`question${currentQuizQuestion}`).classList.remove('active');
        currentQuizQuestion--;
        document.getElementById(`question${currentQuizQuestion}`).classList.add('active');
        updateQuizProgress();
        
        // Update navigation buttons
        if (currentQuizQuestion === 1) {
            document.getElementById('prevBtn').disabled = true;
        }
        
        document.getElementById('nextBtn').style.display = 'inline-block';
        document.getElementById('submitBtn').style.display = 'none';
    }
}

function updateQuizProgress() {
    const progressFill = document.getElementById('quizProgressFill');
    const progressText = document.getElementById('currentQuestion');
    const progress = (currentQuizQuestion / 5) * 100;
    
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    if (progressText) {
        progressText.textContent = currentQuizQuestion;
    }
}

function submitQuiz() {
    // Save last answer
    const lastAnswer = document.querySelector(`input[name="q${currentQuizQuestion}"]:checked`);
    if (lastAnswer) {
        quizAnswers[`q${currentQuizQuestion}`] = lastAnswer.value;
    }
    
    // Calculate score
    const correctAnswers = ['b', 'b', 'b', 'b', 'a']; // Correct answers for each question
    quizScore = 0;
    
    for (let i = 1; i <= 5; i++) {
        if (quizAnswers[`q${i}`] === correctAnswers[i-1]) {
            quizScore++;
        }
    }
    
    // Hide current question and show results
    document.getElementById(`question${currentQuizQuestion}`).classList.remove('active');
    document.getElementById('quizResults').style.display = 'block';
    document.querySelector('.quiz-navigation').style.display = 'none';
    
    // Display results
    displayQuizResults();
}

function displayQuizResults() {
    const scoreElement = document.getElementById('finalScore');
    const messageElement = document.getElementById('scoreMessage');
    const celebrationElement = document.getElementById('celebrationAnimals');
    
    scoreElement.textContent = quizScore;
    
    let message = '';
    let celebration = '';
    let messageClass = '';
    
    if (quizScore === 5) {
        message = '🌟 Outstanding! You are a Present Continuous master! All animals are proud of you!';
        celebration = '🎉 🐱 🐶 🐰 🐼 🦋 🎉';
        messageClass = 'excellent';
    } else if (quizScore >= 3) {
        message = '👍 Great job! You understand Present Continuous well. Keep practicing with our animal friends!';
        celebration = '🎈 🐨 🦘 🐧 🎈';
        messageClass = 'good';
    } else {
        message = '📚 Keep learning! Review the lessons and play more games. Our animal friends believe in you!';
        celebration = '🌟 🐢 🐿️ 🌟';
        messageClass = 'needs-improvement';
    }
    
    messageElement.textContent = message;
    messageElement.className = `score-message ${messageClass}`;
    celebrationElement.textContent = celebration;
    
    // Update overall progress to 100% if quiz is completed
    lessonProgress = 100;
    updateProgressDisplay();
    saveProgress();
}

function restartQuiz() {
    // Reset quiz state
    currentQuizQuestion = 1;
    quizScore = 0;
    quizAnswers = {};
    
    // Hide results and show first question
    document.getElementById('quizResults').style.display = 'none';
    document.querySelector('.quiz-navigation').style.display = 'flex';
    document.getElementById('question1').classList.add('active');
    
    // Reset navigation buttons
    document.getElementById('prevBtn').disabled = true;
    document.getElementById('nextBtn').style.display = 'inline-block';
    document.getElementById('submitBtn').style.display = 'none';
    
    // Clear all radio button selections
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.checked = false;
    });
    
    // Reset quiz progress
    updateQuizProgress();
    
    // Hide other questions
    for (let i = 2; i <= 5; i++) {
        document.getElementById(`question${i}`).classList.remove('active');
    }
}

// Animation Functions
function startAnimations() {
    // Add random movement to floating animals
    const floatingAnimals = document.querySelectorAll('.float');
    floatingAnimals.forEach((animal, index) => {
        animal.style.animationDelay = `${index * 0.5}s`;
    });
    
    // Add interactive hover effects
    addHoverEffects();
}

function addHoverEffects() {
    const cards = document.querySelectorAll('.lesson-card, .game-card, .video-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Celebration Function
function showCelebration(message) {
    const celebration = document.createElement('div');
    celebration.className = 'celebration-popup';
    celebration.innerHTML = `
        <div class="celebration-content">
            <div class="celebration-animals">🎉 🐱 🐶 🐰 🎉</div>
            <div class="celebration-message">${message}</div>
        </div>
    `;
    celebration.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.5s ease;
    `;
    
    const content = celebration.querySelector('.celebration-content');
    content.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        font-size: 1.2rem;
        font-weight: bold;
        color: #2d3436;
        animation: bounceIn 0.8s ease;
    `;
    
    const animals = celebration.querySelector('.celebration-animals');
    animals.style.cssText = `
        font-size: 2rem;
        margin-bottom: 20px;
        animation: celebration 1s ease-in-out infinite;
    `;
    
    document.body.appendChild(celebration);
    
    setTimeout(() => {
        celebration.remove();
    }, 3000);
}

// Progress Management
function saveProgress() {
    const progress = {
        currentTense: currentTense,
        currentSection: currentSection,
        lessonProgress: lessonProgress,
        gameScores: gameScores,
        quizAnswers: quizAnswers,
        quizScore: quizScore,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('grammarLMSProgress', JSON.stringify(progress));
}

function loadProgress() {
    const saved = localStorage.getItem('grammarLMSProgress');
    if (saved) {
        try {
            const progress = JSON.parse(saved);
            currentTense = progress.currentTense || 'present-continuous';
            currentSection = progress.currentSection || 'introduction';
            lessonProgress = progress.lessonProgress || 0;
            gameScores = progress.gameScores || { matching: 0, verbBuilding: 0, dragDrop: 0 };
            
            // Switch to saved tense
            switchTense(currentTense);
            showSection(currentSection);
            
            updateProgressDisplay();
            updateMatchingScore();
        } catch (e) {
            console.log('Could not load saved progress');
        }
    }
}

function updateProgressDisplay() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) {
        progressFill.style.width = lessonProgress + '%';
    }
    if (progressText) {
        progressText.textContent = Math.round(lessonProgress) + '% Complete';
    }
}

// Keyboard Navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight') {
        const sections = ['introduction', 'lessons', 'games', 'videos', 'quiz'];
        const currentIndex = sections.indexOf(currentSection);
        if (currentIndex < sections.length - 1) {
            const nextSection = sections[currentIndex + 1];
            showSection(nextSection);
            updateNavigation(nextSection);
        }
    } else if (e.key === 'ArrowLeft') {
        const sections = ['introduction', 'lessons', 'games', 'videos', 'quiz'];
        const currentIndex = sections.indexOf(currentSection);
        if (currentIndex > 0) {
            const prevSection = sections[currentIndex - 1];
            showSection(prevSection);
            updateNavigation(prevSection);
        }
    }
});

// Auto-save functionality
setInterval(saveProgress, 30000); // Save every 30 seconds

// Add some fun interactions
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('animal-icon') || e.target.tagName === 'SPAN' && /[🐱🐶🐰🐼🐨🦘🐧🐸🦆🐢🐿️🦅🐠🐋]/.test(e.target.textContent)) {
        e.target.style.animation = 'bounce 0.6s ease';
        setTimeout(() => {
            e.target.style.animation = '';
        }, 600);
    }
});

// Welcome message
setTimeout(() => {
    showCelebration('🌟 Welcome to Present Continuous Adventure! 🌟<br>Let\'s learn with our cute animal friends!');
}, 1000);
