// Отзывы и чат с Firebase
const feedback = {
    // Подписки на реальные обновления
    chatUnsubscribe: null,
    feedbacksUnsubscribe: null,
    commentsUnsubscribes: {},

    // Инициализация реального времени
    initRealTimeUpdates() {
        this.subscribeToChat();
        this.subscribeToFeedbacks();
        
        // Подписываемся на комментарии тестов при загрузке страницы тестов
        if (document.getElementById('tests-page')) {
            this.subscribeToTestComments();
        }
    },

    // Подписка на чат
    subscribeToChat() {
        if (this.chatUnsubscribe) {
            this.chatUnsubscribe();
        }
        
        this.chatUnsubscribe = firebaseService.getChatMessages((messages) => {
            this.displayChatMessages(messages);
        });
    },

    // Подписка на отзывы
    subscribeToFeedbacks() {
        if (this.feedbacksUnsubscribe) {
            this.feedbacksUnsubscribe();
        }
        
        this.feedbacksUnsubscribe = firebaseService.getFeedbacks((feedbacks) => {
            this.displayFeedbacks(feedbacks);
        });
    },

    // Подписка на комментарии тестов
    subscribeToTestComments() {
        const testIds = ['products-test', 'sales-test', 'objections-test'];
        
        testIds.forEach(testId => {
            if (this.commentsUnsubscribes[testId]) {
                this.commentsUnsubscribes[testId]();
            }
            
            this.commentsUnsubscribes[testId] = firebaseService.getTestComments(testId, (comments) => {
                this.displayTestComments(testId, comments);
            });
        });
    },

    // Добавление отзыва
    async addFeedback() {
        if (!auth.currentUser) {
            utils.showNotification('Для добавления отзыва необходимо авторизоваться', true);
            return;
        }
        
        const feedbackText = document.getElementById('new-feedback').value;
        if (!feedbackText.trim()) {
            utils.showNotification('Отзыв не может быть пустым', true);
            return;
        }
        
        const newFeedback = {
            user: auth.currentUser.name,
            text: feedbackText,
            timestamp: new Date().toLocaleString('ru-RU')
        };
        
        const success = await firebaseService.saveFeedback(newFeedback);
        
        if (success) {
            document.getElementById('new-feedback').value = '';
            utils.showNotification('Отзыв добавлен');
        } else {
            utils.showNotification('Ошибка при добавлении отзыва', true);
        }
    },
    
    // Отображение отзывов
    displayFeedbacks(feedbacks = null) {
        const feedbacksContainer = document.getElementById('feedbacks-list');
        if (!feedbacksContainer) return;
        
        // Если данные не переданы, используем локальные (для обратной совместимости)
        if (!feedbacks) {
            feedbacks = utils.loadFromStorage('feedbacks') || [];
        }
        
        feedbacksContainer.innerHTML = '';
        
        if (feedbacks.length === 0) {
            feedbacksContainer.innerHTML = '<p>Пока нет отзывов. Будьте первым!</p>';
            return;
        }
        
        feedbacks.forEach(feedback => {
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'comment';
            feedbackDiv.innerHTML = `
                <strong>${feedback.user}</strong> (${feedback.timestamp}): ${feedback.text}
            `;
            feedbacksContainer.appendChild(feedbackDiv);
        });
    },
    
    // Отправка сообщения в чат
    async sendMessage() {
        if (!auth.currentUser) {
            utils.showNotification('Для отправки сообщения необходимо авторизоваться', true);
            return;
        }
        
        const messageText = document.getElementById('chat-input').value;
        if (!messageText.trim()) {
            utils.showNotification('Сообщение не может быть пустым', true);
            return;
        }
        
        const newMessage = {
            user: auth.currentUser.name,
            text: messageText,
            timestamp: new Date().toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
        
        const success = await firebaseService.saveChatMessage(newMessage);
        
        if (success) {
            document.getElementById('chat-input').value = '';
            utils.showNotification('Сообщение отправлено');
        } else {
            utils.showNotification('Ошибка при отправке сообщения', true);
        }
    },
    
    // Отображение сообщений чата
    displayChatMessages(messages = null) {
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;
        
        // Если данные не переданы, используем локальные (для обратной совместимости)
        if (!messages) {
            messages = utils.loadFromStorage('chatMessages') || [];
        }
        
        chatContainer.innerHTML = '';
        
        if (messages.length === 0) {
            chatContainer.innerHTML = '<p>Чат пуст. Начните общение!</p>';
            return;
        }
        
        messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.user === auth.currentUser?.name ? 'self' : 'other'}`;
            
            // Форматируем timestamp для Firebase
            let timestamp = message.timestamp;
            if (message.timestamp?.toDate) {
                timestamp = message.timestamp.toDate().toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            
            messageDiv.innerHTML = `
                <div><strong>${message.user}</strong> (${timestamp})</div>
                <div>${message.text}</div>
            `;
            chatContainer.appendChild(messageDiv);
        });
        
        // Прокручиваем вниз
        chatContainer.scrollTop = chatContainer.scrollHeight;
    },

    // Отображение комментариев теста
    displayTestComments(testId, comments = null) {
        const commentsContainer = document.getElementById(`${testId}-comments`);
        if (!commentsContainer) return;
        
        // Сохраняем текущее состояние поля ввода
        const commentInput = document.getElementById(`${testId}-comment`);
        const currentInputValue = commentInput ? commentInput.value : '';
        const isFocused = commentInput && document.activeElement === commentInput;
        
        commentsContainer.innerHTML = '';
        
        // Если данные не переданы, используем локальные (для обратной совместимости)
        if (!comments) {
            const allComments = utils.loadFromStorage('testComments') || {};
            comments = allComments[testId] || [];
        }
        
        if (comments.length === 0) {
            commentsContainer.innerHTML = '<p>Пока нет комментариев. Будьте первым!</p>';
            return;
        }
        
        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            
            // Форматируем timestamp для Firebase
            let timestamp = comment.timestamp;
            if (comment.timestamp?.toDate) {
                timestamp = comment.timestamp.toDate().toLocaleString('ru-RU');
            }
            
            commentDiv.innerHTML = `
                <strong>${comment.user}</strong> (${timestamp}): ${comment.text}
                ${auth.currentUser && auth.currentUser.role === 'admin' ? 
                    `<button class="delete-comment" onclick="feedback.deleteTestComment('${testId}', '${comment.id}')">Удалить</button>` : 
                    ''}
            `;
            commentsContainer.appendChild(commentDiv);
        });
        
        // Восстанавливаем состояние поля ввода
        if (commentInput && currentInputValue) {
            commentInput.value = currentInputValue;
            if (isFocused) {
                commentInput.focus();
            }
        }
    },

    // Добавление комментария к тесту
    async addTestComment(testId) {
        if (!auth.currentUser) {
            utils.showNotification('Для добавления комментария необходимо авторизоваться', true);
            return;
        }
        
        const commentText = document.getElementById(`${testId}-comment`).value;
        if (!commentText.trim()) {
            utils.showNotification('Комментарий не может быть пустым', true);
            return;
        }
        
        const newComment = {
            user: auth.currentUser.name,
            text: commentText,
            timestamp: new Date().toLocaleString('ru-RU')
        };
        
        const success = await firebaseService.saveTestComment(testId, newComment);
        
        if (success) {
            document.getElementById(`${testId}-comment`).value = '';
            utils.showNotification('Комментарий добавлен');
        } else {
            utils.showNotification('Ошибка при добавлении комментария', true);
        }
    },

    // Удаление комментария теста
    async deleteTestComment(testId, commentId) {
        if (!auth.currentUser || auth.currentUser.role !== 'admin') {
            utils.showNotification('Недостаточно прав для удаления комментария', true);
            return;
        }
        
        // Здесь нужно добавить метод удаления в Firebase
        utils.showNotification('Функция удаления комментариев в Firebase будет реализована позже');
    },

    // Очистка подписок при выходе
    cleanupSubscriptions() {
        if (this.chatUnsubscribe) {
            this.chatUnsubscribe();
        }
        if (this.feedbacksUnsubscribe) {
            this.feedbacksUnsubscribe();
        }
        Object.values(this.commentsUnsubscribes).forEach(unsubscribe => {
            if (unsubscribe) unsubscribe();
        });
    }
};
