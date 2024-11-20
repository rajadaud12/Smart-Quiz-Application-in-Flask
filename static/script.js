let currentScore = 0;
let totalQuestions = 0;
let answeredQuestions = new Set();
let currentDifficulty = 'easy';
let currentAlgorithm = 'bfs';
let correctStreak = 0;
let wrongStreak = 0;
let shownQuestionIds = [];
let currentMode = 'standard';
let targetQuestionCount = 20; 
let questionsAnswered = 0;
let quizInProgress = false;

document.addEventListener('DOMContentLoaded', function() {
    initializeQuiz();
});

function initializeQuiz() {
    setDifficulty('easy');
    setAlgorithm('bfs');
    setMode('standard');
    questionsAnswered = 0;
    updateUIState();
}


function updateUIState() {
    const updateSelectedState = (button, isSelected) => {
        if (isSelected) {
            button.classList.add('selected');
            const existingTick = button.querySelector('.tick-icon');
            if (existingTick) existingTick.remove();
            const tickIcon = document.createElement('span');
            tickIcon.className = 'tick-icon';
            tickIcon.innerHTML = '✓';
            button.appendChild(tickIcon);
        } else {
            button.classList.remove('selected');
            const tickIcon = button.querySelector('.tick-icon');
            if (tickIcon) tickIcon.remove();
        }
    };

    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        const isSelected = btn.classList.contains(`btn-${currentDifficulty}`);
        updateSelectedState(btn, isSelected);
    });

    const algorithmMapping = {
        'bfs': 'BFS',
        'dfs': 'DFS',
        'iterative': 'Iterative Deepening'
    };

    document.querySelectorAll('.algorithm-btn').forEach(btn => {
        const btnText = btn.textContent.trim();
        const currentAlgorithmDisplay = algorithmMapping[currentAlgorithm];
        const isSelected = btnText === currentAlgorithmDisplay;
        updateSelectedState(btn, isSelected);
    });

    // Update mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        const isSelected = btn.classList.contains(`mode-btn-${currentMode}`);
        updateSelectedState(btn, isSelected);
    });

    const difficultyElement = document.getElementById('currentDifficulty');
    if (difficultyElement) {
        difficultyElement.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
    }

    // Show/hide algorithm buttons based on mode
    const algorithmContainer = document.querySelector('.algorithm-container');
    if (algorithmContainer) {
        algorithmContainer.style.display = currentMode === 'standard' ? 'block' : 'none';
    }

    // Show/hide score based on mode
    const scoreText = document.querySelector('.stats-text');
    if (scoreText) {
        scoreText.style.display = currentMode === 'standard' ? 'block' : 'none';
    }
}

function setDifficulty(difficulty) {
    const oldDifficulty = currentDifficulty;
    currentDifficulty = difficulty;
    updateUIState();
    
    // Only show notification in interactive mode when difficulty changes automatically
    if (currentMode === 'interactive' && oldDifficulty !== difficulty) {
        showDifficultyChangeNotification(oldDifficulty, difficulty);
    }
    
    if (currentMode === 'standard') {
        resetQuizState();
    }
}

function setAlgorithm(algorithm) {
    // Map display names to internal values
    const algorithmMap = {
        'BFS': 'bfs',
        'DFS': 'dfs',
        'Iterative Deepening': 'iterative'
    };
    
    currentAlgorithm = algorithmMap[algorithm] || algorithm;
    updateUIState();
    if (currentMode === 'standard') {
        resetQuizState();
    }
}

function setMode(mode) {
    currentMode = mode;
    updateUIState();
    
    // Update stats container HTML based on mode
    const statsContainer = document.getElementById('statsContainer');
    if (statsContainer) {
        if (mode === 'interactive') {
            statsContainer.innerHTML = `
                <p class="algorithm-info">
                    Algorithm: <span id="currentAlgorithm">Auto</span>
                </p>
                <p class="difficulty-info">
                    Current Difficulty: <span id="currentDifficulty">${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}</span>
                </p>
                <p class="execution-info">
                    Execution Time: <span id="executionTime">-</span>
                </p>
            `;
        } else {
            statsContainer.innerHTML = `
                <p class="stats-text">
                    Score: <span id="score" class="score">0</span> / 
                    <span id="total">0</span>
                </p>
                <p class="algorithm-info">
                    Algorithm: <span id="currentAlgorithm">BFS</span>
                </p>
                <p class="difficulty-info">
                    Current Difficulty: <span id="currentDifficulty">${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}</span>
                </p>
                <p class="execution-info">
                    Execution Time: <span id="executionTime">-</span>
                </p>
            `;
        }
    }
    
    resetQuizState();
}

function resetQuizState() {
    // Reset quiz state variables
    currentScore = 0;
    totalQuestions = 0;
    answeredQuestions.clear();
    shownQuestionIds = [];
    correctStreak = 0;
    wrongStreak = 0;

    // Update UI elements
    const scoreElement = document.getElementById('score');
    const totalElement = document.getElementById('total');
    const statsContainer = document.getElementById('statsContainer');
    const questionContainer = document.getElementById('questionContainer');
    const startBtn = document.querySelector('.start-btn');
    const currentAlgorithm = document.getElementById('currentAlgorithm');
    const currentDifficulty = document.getElementById('currentDifficulty');
    const executionTime = document.getElementById('executionTime');

    // Reset UI values safely
    if (scoreElement) scoreElement.textContent = '0';
    if (totalElement) totalElement.textContent = '0';
    if (currentAlgorithm) currentAlgorithm.textContent = 'BFS';
    if (currentDifficulty) currentDifficulty.textContent = 'Easy';
    if (executionTime) executionTime.textContent = '-';
    if (statsContainer) statsContainer.classList.remove('visible');
    if (questionContainer) questionContainer.innerHTML = '';
    if (startBtn) {
        startBtn.textContent = 'Start Quiz';
        startBtn.disabled = false;
    }

    // Reset any additional visual or state-specific indicators
    const modeButtons = document.querySelectorAll('.mode-btn');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const algorithmButtons = document.querySelectorAll('.algorithm-btn');

    modeButtons.forEach(btn => btn.classList.remove('active'));
    difficultyButtons.forEach(btn => btn.classList.remove('active'));
    algorithmButtons.forEach(btn => btn.classList.remove('active'));
}


function updateDifficulty() {
    if (correctStreak >= 5) {
        correctStreak = 0;
        if (currentDifficulty === 'easy') {
            setDifficulty('medium');
        } else if (currentDifficulty === 'medium') {
            setDifficulty('hard');
        }
    }
    if (wrongStreak >= 5) {
        wrongStreak = 0;
        if (currentDifficulty === 'hard') {
            setDifficulty('medium');
        } else if (currentDifficulty === 'medium') {
            setDifficulty('easy');
        }
    }
}


function startQuiz() {
    // Store the original controls HTML
    const controlsContainer = document.querySelector('.controls-container');
    if (controlsContainer) {
        originalControlsHtml = controlsContainer.innerHTML;
        // Replace all controls with just the stop button
        controlsContainer.innerHTML = `
            <button class="stop-btn" onclick="stopQuiz()">Stop Quiz</button>
        `;
    } else {
        // If controls container doesn't exist, create it
        const newControlsContainer = document.createElement('div');
        newControlsContainer.className = 'controls-container';
        newControlsContainer.innerHTML = `
            <button class="stop-btn" onclick="stopQuiz()">Stop Quiz</button>
        `;
        document.body.insertBefore(newControlsContainer, document.body.firstChild);
    }
    
    // Reset quiz state and continue with quiz
    resetQuizState();
    
    
    // Show stats container
    const statsContainer = document.getElementById('statsContainer');
    if (statsContainer) {
        statsContainer.classList.add('visible');
    }
    
    if (currentMode === 'interactive') {
        showQuestionCountModal();
    }else {
        // Show question count selection modal in standard mode
        showQuestionCountModal();
    }
}

function stopQuiz() {
    const controlsContainer = document.querySelector('.controls-container');
    if (controlsContainer && currentMode=='standard') {
        controlsContainer.innerHTML = `
            <div class="filter-section">
                <h3 class="filter-label">Mode</h3>
                <div class="mode-container">
                    <button class="mode-btn mode-btn-standard" onclick="setMode('standard')">Standard</button>
                    <button class="mode-btn mode-btn-interactive" onclick="setMode('interactive')">Interactive</button>
                </div>
            </div>

            <div class="filter-section">
                <h3 class="filter-label">Difficulty</h3>
                <div class="difficulty-container">
                    <button class="difficulty-btn btn-easy" onclick="setDifficulty('easy')">Easy</button>
                    <button class="difficulty-btn btn-medium" onclick="setDifficulty('medium')">Medium</button>
                    <button class="difficulty-btn btn-hard" onclick="setDifficulty('hard')">Hard</button>
                </div>
            </div>

            <div class="filter-section">
                <h3 class="filter-label">Algorithm</h3>
                <div class="algorithm-container">
                    <button class="algorithm-btn" onclick="setAlgorithm('BFS')">BFS</button>
                    <button class="algorithm-btn" onclick="setAlgorithm('DFS')">DFS</button>
                    <button class="algorithm-btn" onclick="setAlgorithm('Iterative Deepening')">Iterative Deepening</button>
                </div>
            </div>

            <div class="filter-section">
                <button class="start-btn" onclick="startQuiz()">Start Quiz</button>
            </div>
        `;
    }
    else  if (controlsContainer && currentMode=='interactive') {
        controlsContainer.innerHTML = `
            <div class="filter-section">
                <h3 class="filter-label">Mode</h3>
                <div class="mode-container">
                    <button class="mode-btn mode-btn-standard" onclick="setMode('standard')">Standard</button>
                    <button class="mode-btn mode-btn-interactive" onclick="setMode('interactive')">Interactive</button>
                </div>
            </div>

            <div class="filter-section">
                <h3 class="filter-label">Difficulty</h3>
                <div class="difficulty-container">
                    <button class="difficulty-btn btn-easy" onclick="setDifficulty('easy')">Easy</button>
                    <button class="difficulty-btn btn-medium" onclick="setDifficulty('medium')">Medium</button>
                    <button class="difficulty-btn btn-hard" onclick="setDifficulty('hard')">Hard</button>
                </div>
            </div>

            <div class="filter-section">
                <h3 class="filter-label">Algorithm</h3>
                <div class="algorithm-container">
                    <button class="algorithm-btn" onclick="setAlgorithm('BFS')">BFS</button>
                    <button class="algorithm-btn" onclick="setAlgorithm('DFS')">DFS</button>
                    <button class="algorithm-btn" onclick="setAlgorithm('Iterative Deepening')">Iterative Deepening</button>
                </div>
            </div>

            <div class="filter-section">
                <button class="start-btn" onclick="startQuiz()">Start Quiz</button>
            </div>
        `;
    }


    const questionContainer = document.getElementById('questionContainer');
    if (questionContainer) {
        questionContainer.innerHTML = '';
    }

    const statsContainer = document.getElementById('statsContainer');
    if (statsContainer) {
        statsContainer.classList.remove('visible');
    }

    resetQuizState();
    updateUIState();
}
function fetchQuestions() {
    const startBtn = document.querySelector('.start-btn');
    if (startBtn) {
        startBtn.textContent = 'Loading...';
        startBtn.disabled = true;
    }

    
    const url = new URL('/questions', window.location.origin);
    url.searchParams.append('mode', 'standard');
    url.searchParams.append('difficulty', currentDifficulty);
    url.searchParams.append('algorithm', currentAlgorithm);
    url.searchParams.append('max_questions', targetQuestionCount); // Include max_questions

    fetch(url)
        .then(response => response.json())
        .then(data => {
            totalQuestions = data.questions.length;
            
            // Update all stats including execution time
            const totalElement = document.getElementById('total');
            const algorithmElement = document.getElementById('currentAlgorithm');
            const executionTimeElement = document.getElementById('executionTime');
            const questionContainer = document.getElementById('questionContainer');
            
            if (totalElement) totalElement.textContent = totalQuestions;
            if (algorithmElement) algorithmElement.textContent = getAlgorithmDisplayName(data.algorithm);
            if (executionTimeElement) executionTimeElement.textContent = formatExecutionTime(data.execution_time);
            
            if (questionContainer) {
                questionContainer.innerHTML = data.questions.map((q, index) => 
                    createQuestionCard(q, index)).join('');
            }
            
            if (startBtn) {
                startBtn.textContent = 'Start Quiz';
                startBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const executionTimeElement = document.getElementById('executionTime');
            if (executionTimeElement) executionTimeElement.textContent = '-';
            
            if (startBtn) {
                startBtn.textContent = 'Start Quiz';
                startBtn.disabled = false;
            }
            const questionContainer = document.getElementById('questionContainer');
            if (questionContainer) {
                questionContainer.innerHTML = 
                    '<div class="error-message">Error loading questions. Please try again.</div>';
            }
        });
}


function fetchNextQuestion() {
    const url = new URL('/questions', window.location.origin);
    url.searchParams.append('mode', 'interactive');
    url.searchParams.append('difficulty', currentDifficulty);
    url.searchParams.append('algorithm', 'auto');
    const recentShownQuestions = shownQuestionIds.slice(-20);
    recentShownQuestions.forEach(id => url.searchParams.append('exclude_ids[]', id));

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                shownQuestionIds = [];
                const questionContainer = document.getElementById('questionContainer');
                const executionTimeElement = document.getElementById('executionTime');
                if (executionTimeElement) executionTimeElement.textContent = '-';
                if (questionContainer) {
                    questionContainer.innerHTML = '<div class="error-message">Resetting questions pool...</div>';
                }
                setTimeout(fetchNextQuestion, 1000);
                return;
            }

            const question = data.questions[0];
            shownQuestionIds.push(question.question);
            totalQuestions++;
            
            // Update all stats including execution time
            const totalElement = document.getElementById('total');
            const algorithmElement = document.getElementById('currentAlgorithm');
            const executionTimeElement = document.getElementById('executionTime');
            const questionContainer = document.getElementById('questionContainer');
            
            if (totalElement) totalElement.textContent = totalQuestions;
            if (algorithmElement) algorithmElement.textContent = getAlgorithmDisplayName(data.algorithm);
            if (executionTimeElement) executionTimeElement.textContent = formatExecutionTime(data.execution_time);
            
            if (questionContainer) {
                questionContainer.innerHTML = createQuestionCard(question, totalQuestions - 1);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const executionTimeElement = document.getElementById('executionTime');
            if (executionTimeElement) executionTimeElement.textContent = '-';
            
            const questionContainer = document.getElementById('questionContainer');
            if (questionContainer) {
                questionContainer.innerHTML = 
                    '<div class="error-message">Error loading question. Please try again.</div>';
            }
        });
}
function createQuestionCard(questionData, index) {
    return `
        <div class="question-card">
            <span class="question-number">Question ${index + 1}</span>
            <h2 class="question-text">${questionData.question}</h2>
            <div class="options-container">
                ${questionData.options.map((option, optIndex) => `
                    <button 
                        onclick="checkAnswer(${index}, '${option}', '${questionData.correct_answer}', this)"
                        class="option-btn"
                    >
                        ${String.fromCharCode(65 + optIndex)}. ${option}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function showQuestionCountModal() {
    const modal = document.createElement('div');
    modal.className = 'question-count-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Select Number of Questions</h2>
            <div class="question-count-buttons">
                <button onclick="selectQuestionCount(20)">20 Questions</button>
                <button onclick="selectQuestionCount(50)">50 Questions</button>
                <button onclick="selectQuestionCount(100)">100 Questions</button>
                <button onclick="selectQuestionCount(1000)">1000 Questions</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function selectQuestionCount(count) {
    targetQuestionCount = count;
    questionsAnswered = 0;
    document.querySelector('.question-count-modal').remove();
    
    const totalElement = document.getElementById('total');
    if (totalElement) {
        totalElement.textContent = targetQuestionCount;
    }
    
    const statsContainer = document.getElementById('statsContainer');
    if (statsContainer) {
        statsContainer.classList.add('visible');
    }
    
    if (currentMode === 'interactive') {
        fetchNextQuestion();
    } else {
        fetchQuestions(count);
    }
}


function checkAnswer(questionIndex, selected, correct, buttonElement) {
    if (answeredQuestions.has(questionIndex)) return;
    
    answeredQuestions.add(questionIndex);
    const allOptions = buttonElement.parentElement.getElementsByTagName('button');
    
    for (let option of allOptions) {
        option.disabled = true;
    }

    const isCorrect = selected === correct;
    if (isCorrect) {
        buttonElement.classList.add('correct');
        currentScore++;
        correctStreak++;
        wrongStreak = 0;
        
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = currentScore;
        }
    } else {
        buttonElement.classList.add('wrong');
        wrongStreak++;
        correctStreak = 0;
        for (let option of allOptions) {
            if (option.textContent.includes(correct)) {
                option.classList.add('correct');
            }
        }
    }
    
    questionsAnswered++;
    
    if (currentMode === 'interactive') {
        updateDifficulty();
        
        if (questionsAnswered < targetQuestionCount) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next Question';
            nextButton.className = 'next-btn';
            nextButton.onclick = fetchNextQuestion;
            buttonElement.parentElement.parentElement.appendChild(nextButton);
        } else {
            if (isCorrect) {
                buttonElement.classList.add('correct');
                currentScore++;
                correctStreak++;
                wrongStreak = 0;
                
                const scoreElement = document.getElementById('score');
                if (scoreElement) {
                    scoreElement.textContent = currentScore;
                }
            } else {
                buttonElement.classList.add('wrong');
                wrongStreak++;
                correctStreak = 0;
                for (let option of allOptions) {
                    if (option.textContent.includes(correct)) {
                        option.classList.add('correct');
                    }
                }
            }
            
            questionsAnswered++;
            
            if (questionsAnswered >= targetQuestionCount) {
                const completionMessage = document.createElement('div');
                completionMessage.className = 'completion-message';
                completionMessage.innerHTML = `
                    <h2>Quiz Completed!</h2>
                    <p>Final Score: ${currentScore-1}/${targetQuestionCount}</p>
                    <button onclick="startQuiz()" class="restart-btn">Start New Quiz</button>
                `;
                buttonElement.parentElement.parentElement.appendChild(completionMessage);
            }
        }
    }
}


function getAlgorithmDisplayName(algorithm) {
    const displayMap = {
        'bfs': 'BFS',
        'dfs': 'DFS',
        'iterative': 'Iterative Deepening'
    };
    return displayMap[algorithm] || algorithm.toUpperCase();
}




function formatExecutionTime(nanoseconds) {
    const ns = Number(nanoseconds);
    
    if (isNaN(ns) || ns === 0) {
        return '0 ns';
    }
    
    if (ns < 1000) {
        return `${ns.toFixed(6)} ns`;
    } else if (ns < 1000000) {
        return `${(ns / 1000).toFixed(2)} μs`;
    } else if (ns < 1000000000) {
        return `${(ns / 1000000).toFixed(2)} ms`;
    } else {
        return `${(ns / 1000000000).toFixed(2)} s`;
    }
}


function showDifficultyChangeNotification(oldDifficulty, newDifficulty) {
    const existingNotification = document.querySelector('.difficulty-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `difficulty-notification ${getDifficultyClass(newDifficulty)}`;
    
    const content = document.createElement('div');
    content.className = 'notification-content';
    content.innerHTML = `
        <div class="notification-message">${getDifficultyMessage(oldDifficulty, newDifficulty)}</div>
        <div class="notification-icon">${getDifficultyIcon(newDifficulty)}</div>
    `;
    
    notification.appendChild(content);
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

function getDifficultyClass(difficulty) {
    switch(difficulty) {
        case 'easy': return 'difficulty-easy';
        case 'medium': return 'difficulty-medium';
        case 'hard': return 'difficulty-hard';
        default: return '';
    }
}

function getDifficultyMessage(oldDifficulty, newDifficulty) {
    if (oldDifficulty === 'easy' && newDifficulty === 'medium') {
        return "Moving up to Medium difficulty! 🎯";
    } else if (oldDifficulty === 'medium' && newDifficulty === 'hard') {
        return "Excellent work! You've reached Hard difficulty! 🌟";
    } else if (oldDifficulty === 'hard' && newDifficulty === 'medium') {
        return "Adjusting to Medium difficulty. Keep going! 💪";
    } else if (oldDifficulty === 'medium' && newDifficulty === 'easy') {
        return "Switching to Easy difficulty. You've got this! 👍";
    }
    return `Difficulty changed to ${newDifficulty}`;
}

function getDifficultyIcon(difficulty) {
    switch(difficulty) {
        case 'easy': return '🌱';
        case 'medium': return '🌟';
        case 'hard': return '🔥';
        default: return '✨';
    }
}



