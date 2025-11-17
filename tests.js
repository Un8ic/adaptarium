// Тесты и комментарии
const tests = {
    // Текущий активный тест
    currentTestId: null,
    
    // Загрузка тестов
    loadTests() {
        const testsContainer = document.getElementById('tests-container');
        if (!testsContainer) return;
        
        const testsData = [
            { 
                id: 'products-test', 
                title: 'Тест по продуктам компании', 
                description: 'Проверьте свои знания о продуктах и услугах компании.'
            },
            { 
                id: 'sales-test', 
                title: 'Тест по техникам продаж', 
                description: 'Оцените свое понимание эффективных методик продаж.'
            },
            { 
                id: 'objections-test', 
                title: 'Тест по работе с возражениями', 
                description: 'Проверьте, насколько хорошо вы умеете работать с возражениями клиентов.'
            }
        ];
        
        testsContainer.innerHTML = testsData.map(test => {
            const status = utils.loadFromStorage(`test-${test.id}-status`) || 'not-started';
            const statusText = status === 'completed' ? 'Пройден' : 'Не пройден';
            const statusClass = status === 'completed' ? 'completed' : 'not-started';
            
            return `
                <div class="test-card">
                    <h3>${test.title}</h3>
                    <p>${test.description}</p>
                    <button onclick="tests.startTest('${test.id}')">Пройти тест</button>
                    <span class="${statusClass}" id="${test.id}-status">${statusText}</span>
                    
                    <div class="comment-section">
                        <h4>Комментарии:</h4>
                        <div id="${test.id}-comments">
                            <!-- Комментарии будут добавляться динамически -->
                        </div>
                        <div class="form-group">
                            <textarea id="${test.id}-comment" placeholder="Добавить комментарий"></textarea>
                            <button onclick="tests.addComment('${test.id}')">Добавить комментарий</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Загружаем комментарии для всех тестов
        testsData.forEach(test => {
            this.displayComments(test.id);
        });
    },
    
    // Начать тест
    startTest(testId) {
        this.currentTestId = testId;
        navigation.history.push('tests-page');
        
        // Создаем содержимое теста
        this.createTestPage(testId);
        navigation.showPage(testId + '-page');
        this.initTest(testId);
    },
    
    // Получение данных теста
    getTestData(testId) {
        const testsData = {
            'products-test': {
                title: 'Тест по продуктам компании',
                questions: [
                    {
                        question: "Какой наш основной продукт для управления взаимоотношениями с клиентами?",
                        options: [
                            "CRM-система 'Продавец Про'",
                            "Мобильное приложение 'Продажи OnTheGo'",
                            "Аналитика продаж 'Инсайт'",
                            "Платформа для email-рассылок"
                        ],
                        correct: 0
                    },
                    {
                        question: "Какая услуга НЕ входит в наш пакет дополнительных услуг?",
                        options: [
                            "Консультации по внедрению CRM-систем",
                            "Обучение сотрудников",
                            "Техническая поддержка 24/7",
                            "Бухгалтерское сопровождение"
                        ],
                        correct: 3
                    },
                    {
                        question: "Какое решение мы предлагаем для мобильных менеджеров по продажам?",
                        options: [
                            "Мобильное приложение 'Продажи OnTheGo'",
                            "Веб-платформа 'Удаленный офис'",
                            "Телеграм-бот для продаж",
                            "Видеоконференции 'Виртуальные встречи'"
                        ],
                        correct: 0
                    }
                ]
            },
            'sales-test': {
                title: 'Тест по техникам продаж',
                questions: [
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
                        question: "Что такое 'активное слушание' в продажах?",
                        options: [
                            "Говорить больше, чем клиент",
                            "Внимательно слушать и задавать уточняющие вопросы",
                            "Записывать все, что говорит клиент",
                            "Соглашаться со всем, что говорит клиент"
                        ],
                        correct: 1
                    }
                ]
            },
            'objections-test': {
                title: 'Тест по работе с возражениями',
                questions: [
                    {
                        question: "Как правильно реагировать на возражение 'Это слишком дорого'?",
                        options: [
                            "Сразу предложить скидку",
                            "Объяснить ценность и выгоды продукта",
                            "Сравнить с более дорогими аналогами",
                            "Согласиться и перейти к другому клиенту"
                        ],
                        correct: 1
                    },
                    {
                        question: "Что НЕ следует делать при работе с возражениями?",
                        options: [
                            "Внимательно выслушать клиента",
                            "Прерывать клиента",
                            "Задавать уточняющие вопросы",
                            "Предлагать альтернативные решения"
                        ],
                        correct: 1
                    },
                    {
                        question: "Какой подход наиболее эффективен при работе с возражениями?",
                        options: [
                            "Игнорировать возражения",
                            "Соглашаться с клиентом",
                            "Превращать возражения в вопросы",
                            "Спорить с клиентом"
                        ],
                        correct: 2
                    }
                ]
            }
        };
        
        return testsData[testId];
    },
    
    // Создание страницы теста
    createTestPage(testId) {
        const main = document.querySelector('main');
        
        // Удаляем старую страницу теста, если она существует
        const existingPage = document.getElementById(testId + '-page');
        if (existingPage) {
            existingPage.remove();
        }
        
        const testData = this.getTestData(testId);
        if (!testData) return;
        
        const testPage = document.createElement('div');
        testPage.id = testId + '-page';
        testPage.className = 'page';
        
        testPage.innerHTML = `
            <button class="back-button" onclick="navigation.goBack()">← Назад к тестам</button>
            <h2>${testData.title}</h2>
            <p>Ответьте на все вопросы теста.</p>
            
            <div class="test-progress">
                <div class="progress-bar">
                    <div class="progress" id="${testId}-progress" style="width: 0%"></div>
                </div>
                <div class="progress-text" id="${testId}-progress-text">Прогресс: 0%</div>
            </div>
            
            <div id="${testId}-questions">
                ${testData.questions.map((q, index) => `
                    <div class="question" data-question="${index}">
                        <h3>${index + 1}. ${q.question}</h3>
                        <div class="options">
                            ${q.options.map((option, optIndex) => `
                                <div class="option" onclick="tests.selectTestOption(this, '${testId}', ${index}, ${optIndex})">
                                    ${option}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="test-submit">
                <button id="${testId}-submit-btn" onclick="tests.submitTest('${testId}')">Завершить тест</button>
            </div>
        `;
        
        main.appendChild(testPage);
    },
    
    // Инициализация теста
    initTest(testId) {
        // Сбрасываем выбранные ответы
        const options = document.querySelectorAll(`#${testId}-questions .option`);
        options.forEach(option => {
            option.classList.remove('selected');
        });
        
        // Сбрасываем сохраненные ответы
        utils.saveToStorage(`test-${testId}-answers`, {});
        
        // Обновляем прогресс
        this.updateProgress(testId);
    },
    
    // Выбор варианта в тесте
    selectTestOption(element, testId, questionIndex, optionIndex) {
        // Снимаем выделение со всех вариантов в этом вопросе
        const question = element.closest('.question');
        question.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Выделяем выбранный вариант
        element.classList.add('selected');
        
        // Сохраняем ответ
        this.saveAnswer(testId, questionIndex, optionIndex);
        
        // Обновляем прогресс
        this.updateProgress(testId);
    },
    
    // Сохранение ответа
    saveAnswer(testId, questionIndex, answerIndex) {
        let testAnswers = utils.loadFromStorage(`test-${testId}-answers`) || {};
        testAnswers[questionIndex] = answerIndex;
        utils.saveToStorage(`test-${testId}-answers`, testAnswers);
    },
    
    // Обновление прогресса
    updateProgress(testId) {
        const testData = this.getTestData(testId);
        const testAnswers = utils.loadFromStorage(`test-${testId}-answers`) || {};
        
        const answeredQuestions = Object.keys(testAnswers).length;
        const totalQuestions = testData.questions.length;
        const progress = Math.round((answeredQuestions / totalQuestions) * 100);
        
        const progressBar = document.getElementById(`${testId}-progress`);
        const progressText = document.getElementById(`${testId}-progress-text`);
        
        if (progressBar && progressText) {
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `Прогресс: ${progress}%`;
        }
    },
    
    // Отправка теста
    submitTest(testId) {
        const testData = this.getTestData(testId);
        const testAnswers = utils.loadFromStorage(`test-${testId}-answers`) || {};
        
        // Проверяем, все ли вопросы отвечены
        const totalQuestions = testData.questions.length;
        const answeredQuestions = Object.keys(testAnswers).length;
        
        if (answeredQuestions < totalQuestions) {
            utils.showNotification('Ответьте на все вопросы перед завершением теста', true);
            return;
        }
        
        let correctAnswers = 0;
        
        // Проверяем ответы
        testData.questions.forEach((question, index) => {
            const userAnswer = testAnswers[index];
            if (userAnswer !== undefined && userAnswer === question.correct) {
                correctAnswers++;
            }
        });
        
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        
        // Показываем результаты
        this.showTestResults(testId, score, correctAnswers, totalQuestions);
        
        // Сохраняем статус теста
        utils.saveToStorage(`test-${testId}-status`, 'completed');
        utils.saveToStorage(`test-${testId}-score`, score);
        utils.saveToStorage(`test-${testId}-last-completion`, new Date().toISOString());
        
        // Обновляем статус на странице тестов
        const statusElement = document.getElementById(`${testId}-status`);
        if (statusElement) {
            statusElement.textContent = 'Пройден';
            statusElement.className = 'completed';
        }
        
        utils.showNotification(`Тест завершен! Ваш результат: ${score}%`);
    },
    
    // Показать результаты теста
    showTestResults(testId, score, correctAnswers, totalQuestions) {
        const questionsContainer = document.getElementById(`${testId}-questions`);
        const submitButton = document.getElementById(`${testId}-submit-btn`);
        
        if (!questionsContainer) return;
        
        let resultText, resultClass;
        if (score >= 80) {
            resultText = 'Отличный результат! Вы отлично разбираетесь в теме.';
            resultClass = 'result-excellent';
        } else if (score >= 60) {
            resultText = 'Хороший результат! Есть куда расти, но основы вы знаете хорошо.';
            resultClass = 'result-good';
        } else {
            resultText = 'Попробуйте еще раз! Рекомендуем изучить материалы еще раз.';
            resultClass = 'result-poor';
        }
        
        questionsContainer.innerHTML = `
            <div class="quiz-complete">
                <h3>Тест завершен!</h3>
                <div class="quiz-result ${resultClass}">
                    Ваш результат: ${score}% (${correctAnswers} из ${totalQuestions} правильных ответов)
                </div>
                <p>${resultText}</p>
                <div class="game-controls">
                    <button onclick="tests.restartTest('${testId}')">Пройти еще раз</button>
                    <button onclick="tests.returnToTests()" class="btn-secondary">Вернуться к тестам</button>
                </div>
            </div>
        `;
        
        // Скрываем кнопку завершения теста
        if (submitButton) {
            submitButton.style.display = 'none';
        }
    },
    
    // Перезапуск теста
    restartTest(testId) {
        // Создаем новую страницу теста
        this.createTestPage(testId);
        navigation.showPage(testId + '-page');
        this.initTest(testId);
    },
    
    // Вернуться к списку тестов
    returnToTests() {
        navigation.showPage('tests-page');
    },
    
    // Добавление комментария
    addComment(testId) {
        if (!auth.currentUser) {
            utils.showNotification('Для добавления комментария необходимо авторизоваться', true);
            return;
        }
        
        const commentText = document.getElementById(`${testId}-comment`).value;
        if (!commentText.trim()) {
            utils.showNotification('Комментарий не может быть пустым', true);
            return;
        }
        
        // Получаем существующие комментарии из localStorage
        const comments = utils.loadFromStorage('testComments') || {};
        if (!comments[testId]) {
            comments[testId] = [];
        }
        
        // Добавляем новый комментарий
        const newComment = {
            id: Date.now(),
            user: auth.currentUser.name,
            text: commentText,
            timestamp: new Date().toLocaleString('ru-RU')
        };
        
        comments[testId].push(newComment);
        utils.saveToStorage('testComments', comments);
        
        // Обновляем отображение комментариев
        this.displayComments(testId);
        
        // Очищаем поле ввода
        document.getElementById(`${testId}-comment`).value = '';
        
        utils.showNotification('Комментарий добавлен');
    },
    
    // Отображение комментариев
    displayComments(testId) {
        const commentsContainer = document.getElementById(`${testId}-comments`);
        if (!commentsContainer) return;
        
        commentsContainer.innerHTML = '';
        
        const comments = utils.loadFromStorage('testComments') || {};
        const testComments = comments[testId] || [];
        
        if (testComments.length === 0) {
            commentsContainer.innerHTML = '<p>Пока нет комментариев. Будьте первым!</p>';
            return;
        }
        
        testComments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.innerHTML = `
                <strong>${comment.user}</strong> (${comment.timestamp}): ${comment.text}
                ${auth.currentUser && auth.currentUser.role === 'admin' ? 
                    `<button class="delete-comment" onclick="tests.deleteComment('${testId}', ${comment.id})">Удалить</button>` : 
                    ''}
            `;
            commentsContainer.appendChild(commentDiv);
        });
    },
    
    // Удаление комментария
    deleteComment(testId, commentId) {
        if (!auth.currentUser || auth.currentUser.role !== 'admin') {
            utils.showNotification('Недостаточно прав для удаления комментария', true);
            return;
        }
        
        const comments = utils.loadFromStorage('testComments') || {};
        if (comments[testId]) {
            comments[testId] = comments[testId].filter(comment => comment.id !== commentId);
            utils.saveToStorage('testComments', comments);
            
            // Обновляем отображение
            if (document.getElementById('analytics-page').classList.contains('active')) {
                this.loadAllComments();
            } else {
                this.displayComments(testId);
            }
            
            utils.showNotification('Комментарий удален');
        }
    },
    
    // Загрузка всех комментариев
    loadAllComments() {
        const allCommentsContainer = document.getElementById('all-comments');
        if (!allCommentsContainer) return;
        
        allCommentsContainer.innerHTML = '';
        
        // Получаем все комментарии из localStorage
        const comments = utils.loadFromStorage('testComments') || {};
        
        Object.keys(comments).forEach(testId => {
            const testComments = comments[testId];
            if (testComments && testComments.length > 0) {
                const testTitle = this.getTestTitle(testId);
                
                const testSection = document.createElement('div');
                testSection.className = 'test-card';
                testSection.innerHTML = `<h3>${testTitle}</h3>`;
                
                testComments.forEach(comment => {
                    const commentDiv = document.createElement('div');
                    commentDiv.className = 'comment';
                    commentDiv.innerHTML = `
                        <strong>${comment.user}</strong> (${comment.timestamp}): ${comment.text}
                        <button class="delete-comment" onclick="tests.deleteComment('${testId}', ${comment.id})">Удалить</button>
                    `;
                    testSection.appendChild(commentDiv);
                });
                
                allCommentsContainer.appendChild(testSection);
            }
        });
        
        if (allCommentsContainer.children.length === 0) {
            allCommentsContainer.innerHTML = '<p>Пока нет комментариев.</p>';
        }
    },
    
    // Получение названия теста
    getTestTitle(testId) {
        const titles = {
            'products-test': 'Тест по продуктам компании',
            'sales-test': 'Тест по техникам продаж',
            'objections-test': 'Тест по работе с возражениями'
        };
        return titles[testId] || 'Тест';
    }
};
