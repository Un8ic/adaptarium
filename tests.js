// Тесты и комментарии
const tests = {
    // Загрузка тестов
    loadTests() {
        const testsContainer = document.getElementById('tests-container');
        if (!testsContainer) return;
        
        const testsData = [
            { 
                id: 'products-test', 
                title: 'Тест по продуктам компании', 
                description: 'Проверьте свои знания о продуктах и услугах компании.',
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
                    }
                ]
            },
            { 
                id: 'sales-test', 
                title: 'Тест по техникам продаж', 
                description: 'Оцените свое понимание эффективных методик продаж.',
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
                    }
                ]
            },
            { 
                id: 'objections-test', 
                title: 'Тест по работе с возражениями', 
                description: 'Проверьте, насколько хорошо вы умеете работать с возражениями клиентов.',
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
                    }
                ]
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
                    <button onclick="tests.openTestPage('${test.id}')">Пройти тест</button>
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
    
    // Открытие страницы теста
    openTestPage(testId) {
        navigation.history.push('tests-page');
        
        // Создаем содержимое теста
        const testData = this.getTestData(testId);
        if (!testData) return;
        
        const testPage = document.getElementById(testId + '-page');
        if (!testPage) {
            this.createTestPage(testId, testData);
        }
        
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
                    }
                ]
            }
        };
        
        return testsData[testId];
    },
    
    // Создание страницы теста
    createTestPage(testId, testData) {
        const main = document.querySelector('main');
        
        const testPage = document.createElement('div');
        testPage.id = testId + '-page';
        testPage.className = 'page';
        
        testPage.innerHTML = `
            <button class="back-button" onclick="navigation.goBack()">← Назад к тестам</button>
            <h2>${testData.title}</h2>
            <p>Ответьте на вопросы о наших продуктах и услугах.</p>
            
            <div id="${testId}-questions">
                ${testData.questions.map((q, index) => `
                    <div class="question" data-question="${index}">
                        <h3>${index + 1}. ${q.question}</h3>
                        <div class="options">
                            ${q.options.map((option, optIndex) => `
                                <div class="option" onclick="tests.selectTestOption(this, '${testId}', ${index}, ${optIndex})">${option}</div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="test-submit">
                <button onclick="tests.submitTest('${testId}')">Завершить тест</button>
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
        element.dataset.selected = 'true';
        
        // Сохраняем ответ
        this.saveAnswer(testId, questionIndex, optionIndex);
    },
    
    // Сохранение ответа
    saveAnswer(testId, questionIndex, answerIndex) {
        let testAnswers = utils.loadFromStorage(`test-${testId}-answers`) || {};
        testAnswers[questionIndex] = answerIndex;
        utils.saveToStorage(`test-${testId}-answers`, testAnswers);
    },
    
    // Отправка теста
    submitTest(testId) {
        const testData = this.getTestData(testId);
        const testAnswers = utils.loadFromStorage(`test-${testId}-answers`) || {};
        
        let correctAnswers = 0;
        let totalQuestions = testData.questions.length;
        
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
        
        // Обновляем статус на странице тестов
        const statusElement = document.getElementById(`${testId}-status`);
        if (statusElement) {
            statusElement.textContent = 'Пройден';
            statusElement.className = 'completed';
        }
    },
    
    // Показать результаты теста
    showTestResults(testId, score, correctAnswers, totalQuestions) {
        const testPage = document.getElementById(testId + '-page');
        const questionsContainer = document.getElementById(testId + '-questions');
        
        let resultText, resultClass;
        if (score >= 80) {
            resultText = 'Отличный результат!';
            resultClass = 'result-excellent';
        } else if (score >= 60) {
            resultText = 'Хороший результат!';
            resultClass = 'result-good';
        } else {
            resultText = 'Попробуйте еще раз!';
            resultClass = 'result-poor';
        }
        
        questionsContainer.innerHTML = `
            <div class="quiz-complete">
                <h3>Тест завершен!</h3>
                <div class="quiz-result ${resultClass}">
                    Ваш результат: ${score}% (${correctAnswers}/${totalQuestions} правильных ответов)
                </div>
                <p>${resultText}</p>
                <div class="game-controls">
                    <button onclick="tests.openTestPage('${testId}')">Пройти еще раз</button>
                    <button onclick="navigation.showPage('tests-page')" class="btn-secondary">Вернуться к тестам</button>
                </div>
            </div>
        `;
        
        utils.showNotification('Тест успешно пройден!');
    },
    
    // Добавление комментария
    addComment(testId) {
        if (!auth.currentUser) return;
        
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
            timestamp: utils.formatDate(new Date())
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
                ${auth.currentUser.role === 'admin' ? `<button class="delete-comment" onclick="tests.deleteComment('${testId}', ${comment.id})">Удалить</button>` : ''}
            `;
            commentsContainer.appendChild(commentDiv);
        });
    },
    
    // Удаление комментария
    deleteComment(testId, commentId) {
        if (auth.currentUser.role !== 'admin') return;
        
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
                        <strong>${comment.user}</strong>: ${comment.text}
                        <button class="delete-comment" onclick="tests.deleteComment('${testId}', ${comment.id})">Удалить</button>
                    `;
                    testSection.appendChild(commentDiv);
                });
                
                allCommentsContainer.appendChild(testSection);
            }
        });
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
