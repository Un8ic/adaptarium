// Тесты и комментарии
const tests = {
    // Загрузка тестов
    loadTests() {
        const testsContainer = document.getElementById('tests-container');
        if (!testsContainer) return;
        
        const testsData = [
            { id: 'products-test', title: 'Тест по продуктам компании', description: 'Проверьте свои знания о продуктах и услугах компании.' },
            { id: 'sales-test', title: 'Тест по техникам продаж', description: 'Оцените свое понимание эффективных методик продаж.' },
            { id: 'objections-test', title: 'Тест по работе с возражениями', description: 'Проверьте, насколько хорошо вы умеете работать с возражениями клиентов.' }
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
    },
    
    // Открытие страницы теста
    openTestPage(testId) {
        navigation.history.push('tests-page');
        navigation.showPage(testId + '-page');
    },
    
    // Выбор варианта в тесте
    selectTestOption(element, testId) {
        // Снимаем выделение со всех вариантов в этом вопросе
        const question = element.closest('.question');
        question.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Выделяем выбранный вариант
        element.classList.add('selected');
    },
    
    // Отправка теста
    submitTest(testId) {
        document.getElementById(testId + '-status').textContent = 'Пройден';
        document.getElementById(testId + '-status').className = 'completed';
        utils.saveToStorage(`test-${testId}-status`, 'completed');
        utils.showNotification('Тест успешно пройден!');
        navigation.goBack();
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
            'test1': 'Тест по продуктам компании',
            'test2': 'Тест по техникам продаж',
            'test3': 'Тест по работе с возражениями'
        };
        return titles[testId] || 'Тест';
    }
};