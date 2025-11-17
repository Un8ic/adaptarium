// Игры и обучение
const games = {
    // Загрузка игр
    loadGames() {
        const gamesContainer = document.getElementById('games-container');
        if (!gamesContainer) return;
        
        const gamesData = [
            { id: 'quest', icon: '🧩', title: 'Квест "Продавец-легенда"', description: 'Пройдите квест, выполняя задания по продажам и обслуживанию клиентов.' },
            { id: 'simulator', icon: '🎮', title: 'Симулятор переговоров', description: 'Потренируйтесь в ведении переговоров с виртуальными клиентами.' },
            { id: 'quiz', icon: '❓', title: 'Викторина "Эксперт продаж"', description: 'Проверьте свои знания в области продаж в формате увлекательной викторины.' }
        ];
        
        gamesContainer.innerHTML = gamesData.map(game => {
            const progress = utils.loadFromStorage(`game-${game.id}-progress`) || 'Уровень 1';
            
            return `
                <div class="game-card">
                    <div class="game-icon">${game.icon}</div>
                    <h3>${game.title}</h3>
                    <p>${game.description}</p>
                    <button onclick="games.openGamePage('${game.id}')">Начать игру</button>
                    <div id="${game.id}-progress" class="level-badge">${progress}</div>
                </div>
            `;
        }).join('');
    },
    
    // Открытие страницы игры
    openGamePage(gameType) {
        navigation.history.push('training-page');
        navigation.showPage(gameType + '-game-page');
        
        // Инициализация игры
        if (gameType === 'quest') {
            this.initQuestGame();
        } else if (gameType === 'quiz') {
            this.initQuizGame();
        } else if (gameType === 'simulator') {
            utils.showNotification('Симулятор переговоров находится в разработке');
        }
    },
    
    // Инициализация квеста
    initQuestGame() {
        document.getElementById('quest-score').textContent = '0';
        document.getElementById('quest-level').textContent = '1';
        document.getElementById('quest-clients').textContent = '0';
        document.getElementById('quest-result').textContent = '';
    },
    
    // Ответ в квесте
    questAnswer(answer) {
        const results = [
            "Клиент согласился на скидку, но ваша прибыль уменьшилась.",
            "Клиент оценил преимущества и совершил покупку!",
            "Вы выявили реальные потребности клиента и предложили идеальное решение!"
        ];
        
        const scores = [10, 25, 40];
        
        document.getElementById('quest-result').textContent = results[answer-1];
        
        const currentScore = parseInt(document.getElementById('quest-score').textContent);
        document.getElementById('quest-score').textContent = currentScore + scores[answer-1];
        
        const currentClients = parseInt(document.getElementById('quest-clients').textContent);
        document.getElementById('quest-clients').textContent = currentClients + 1;
        
        if (currentClients + 1 >= 3) {
            document.getElementById('quest-level').textContent = '2';
            utils.showNotification('Поздравляем! Вы достигли нового уровня!');
        }
    },
    
    // Следующий сценарий квеста
    nextQuestScenario() {
        const scenarios = [
            "К вам обращается постоянный клиент с жалобой на работу продукта.",
            "Новый клиент интересуется вашими услугами, но сомневается в их необходимости.",
            "Клиент хочет приобрести продукт, но у него ограниченный бюджет."
        ];
        
        const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        document.getElementById('quest-scenario').textContent = randomScenario;
        document.getElementById('quest-result').textContent = '';
    },
    
    // Сохранение прогресса квеста
    saveQuestProgress() {
        utils.showNotification('Прогресс игры сохранен!');
    },
    
    // Переменные для викторины
    currentQuizQuestion: 1,
    quizScore: 0,
    correctAnswers: 0,
    quizQuestions: [],
    
    // Инициализация викторины
    initQuizGame() {
        this.currentQuizQuestion = 1;
        this.quizScore = 0;
        this.correctAnswers = 0;
        document.getElementById('quiz-score').textContent = '0';
        document.getElementById('quiz-progress').textContent = '1/5';
        document.getElementById('quiz-correct').textContent = '0';
        
        // Инициализация вопросов викторины
        this.quizQuestions = [
            {
                question: "Что является самым важным на первом этапе продажи?",
                options: [
                    "Представление продукта",
                    "Установление контакта и выявление потребностей",
                    "Закрытие сделки",
                    "Обсуждение цены"
                ],
                correct: 1
            },
            {
                question: "Какой метод продаж основан на вопросах о ситуации, проблеме, последствиях и выгодах?",
                options: [
                    "Метод SPIN",
                    "Метод AIDA",
                    "Метод LAER",
                    "Метод BATNA"
                ],
                correct: 0
            },
            {
                question: "Что означает аббревиатура CRM?",
                options: [
                    "Customer Relationship Management",
                    "Client Revenue Maximization",
                    "Corporate Resource Management",
                    "Customer Retention Method"
                ],
                correct: 0
            },
            {
                question: "Какой показатель измеряет лояльность клиентов?",
                options: [
                    "NPS (Net Promoter Score)",
                    "KPI (Key Performance Indicator)",
                    "ROI (Return on Investment)",
                    "CPA (Cost Per Acquisition)"
                ],
                correct: 0
            },
            {
                question: "Что такое BATNA в переговорах?",
                options: [
                    "Best Alternative to a Negotiated Agreement",
                    "Business And Transaction Negotiation Approach",
                    "Basic Agreement Terms and Negotiation Assets",
                    "Best Available Terms for Negotiation Agreement"
                ],
                correct: 0
            }
        ];
        
        // Загрузка первого вопроса
        this.loadQuizQuestion(1);
    },
    
    // Загрузка вопроса викторины
    loadQuizQuestion(questionNumber) {
        const gameArea = document.getElementById('quiz-game-area');
        
        if (questionNumber <= this.quizQuestions.length) {
            const question = this.quizQuestions[questionNumber - 1];
            
            gameArea.innerHTML = `
                <div class="question">
                    <h3 id="quiz-question-text">${question.question}</h3>
                    <div class="options">
                        ${question.options.map((option, index) => 
                            `<div class="option" onclick="games.selectQuizOption(this, ${index})">${option}</div>`
                        ).join('')}
                    </div>
                </div>
                <div style="text-align: center; margin-top: 15px;">
                    <button onclick="games.checkQuizAnswer()">Проверить ответ</button>
                    <button onclick="games.nextQuizQuestion()" style="display: none;" id="next-quiz-btn">Следующий вопрос</button>
                </div>
                <div id="quiz-result" style="min-height: 40px; padding: 8px; background: white; border-radius: 8px; margin-top: 10px;"></div>
            `;
            
            document.getElementById('quiz-progress').textContent = questionNumber + '/5';
        } else {
            // Викторина завершена
            this.showQuizResults();
        }
    },
    
    // Выбор варианта в викторине
    selectQuizOption(element, index) {
        // Снимаем выделение со всех вариантов в этом вопросе
        const question = element.closest('.question');
        question.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Выделяем выбранный вариант
        element.classList.add('selected');
        element.dataset.index = index;
    },
    
    // Проверка ответа в викторине
    checkQuizAnswer() {
        const selectedOption = document.querySelector('.option.selected');
        if (!selectedOption) {
            utils.showNotification('Пожалуйста, выберите вариант ответа', true);
            return;
        }
        
        const selectedIndex = parseInt(selectedOption.dataset.index);
        const currentQuestion = this.quizQuestions[this.currentQuizQuestion - 1];
        const isCorrect = selectedIndex === currentQuestion.correct;
        
        // Подсветка правильного и неправильного ответов
        const options = document.querySelectorAll('.options .option');
        options.forEach((option, index) => {
            if (index === currentQuestion.correct) {
                option.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                option.classList.add('incorrect');
            }
        });
        
        if (isCorrect) {
            this.quizScore += 20;
            this.correctAnswers++;
            document.getElementById('quiz-score').textContent = this.quizScore;
            document.getElementById('quiz-correct').textContent = this.correctAnswers;
            document.getElementById('quiz-result').textContent = 'Правильно! +20 очков';
            document.getElementById('quiz-result').style.color = '#2ecc71';
        } else {
            document.getElementById('quiz-result').textContent = 'Неправильно!';
            document.getElementById('quiz-result').style.color = '#e74c3c';
        }
        
        document.getElementById('next-quiz-btn').style.display = 'inline-block';
    },
    
    // Следующий вопрос викторины
    nextQuizQuestion() {
        this.currentQuizQuestion++;
        this.loadQuizQuestion(this.currentQuizQuestion);
    },
    
    // Показать результаты викторины
    showQuizResults() {
        const gameArea = document.getElementById('quiz-game-area');
        const percentage = (this.correctAnswers / this.quizQuestions.length) * 100;
        
        let resultClass, resultText;
        if (percentage >= 80) {
            resultClass = 'result-excellent';
            resultText = 'Отличный результат! Вы настоящий эксперт продаж!';
        } else if (percentage >= 60) {
            resultClass = 'result-good';
            resultText = 'Хороший результат! Продолжайте совершенствовать свои навыки!';
        } else {
            resultClass = 'result-poor';
            resultText = 'Есть над чем поработать! Изучите материалы и попробуйте снова!';
        }
        
        gameArea.innerHTML = `
            <div class="quiz-complete">
                <h3>Викторина завершена!</h3>
                <div class="quiz-result ${resultClass}">
                    Ваш результат: ${this.quizScore} очков (${this.correctAnswers}/${this.quizQuestions.length} правильных ответов)
                </div>
                <p>${resultText}</p>
                <div class="game-controls">
                    <button onclick="games.initQuizGame()">Попробовать снова</button>
                    <button onclick="navigation.goBack()" class="btn-secondary">Вернуться к играм</button>
                </div>
            </div>
        `;
        
        // Обновляем бейдж прогресса
        document.getElementById('quiz-progress-badge').textContent = `Прогресс: ${percentage}%`;
    },
    
    // Сохранение прогресса викторины
    saveQuizProgress() {
        utils.showNotification('Прогресс викторины сохранен!');
    }
};