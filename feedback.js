// Отзывы и чат
const feedback = {
    // Добавление отзыва
    addFeedback() {
        if (!auth.currentUser) {
            utils.showNotification('Для добавления отзыва необходимо авторизоваться', true);
            return;
        }
        
        const feedbackText = document.getElementById('new-feedback').value;
        if (!feedbackText.trim()) {
            utils.showNotification('Отзыв не может быть пустым', true);
            return;
        }
        
        // Получаем существующие отзывы из localStorage
        const feedbacks = utils.loadFromStorage('feedbacks') || [];
        
        // Добавляем новый отзыв
        const newFeedback = {
            id: Date.now(),
            user: auth.currentUser.name,
            text: feedbackText,
            timestamp: new Date().toLocaleString('ru-RU')
        };
        
        feedbacks.push(newFeedback);
        utils.saveToStorage('feedbacks', feedbacks);
        
        // Обновляем отображение отзывов
        this.displayFeedbacks();
        
        // Очищаем поле ввода
        document.getElementById('new-feedback').value = '';
        
        utils.showNotification('Отзыв добавлен');
    },
    
    // Отображение отзывов
    displayFeedbacks() {
        const feedbacksContainer = document.getElementById('feedbacks-list');
        if (!feedbacksContainer) return;
        
        feedbacksContainer.innerHTML = '';
        
        const feedbacks = utils.loadFromStorage('feedbacks') || [];
        
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
    sendMessage() {
        if (!auth.currentUser) {
            utils.showNotification('Для отправки сообщения необходимо авторизоваться', true);
            return;
        }
        
        const messageText = document.getElementById('chat-input').value;
        if (!messageText.trim()) {
            utils.showNotification('Сообщение не может быть пустым', true);
            return;
        }
        
        // Получаем существующие сообщения из localStorage
        const messages = utils.loadFromStorage('chatMessages') || [];
        
        // Добавляем новое сообщение
        const newMessage = {
            id: Date.now(),
            user: auth.currentUser.name,
            text: messageText,
            timestamp: new Date().toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
        
        messages.push(newMessage);
        utils.saveToStorage('chatMessages', messages);
        
        // Обновляем отображение чата
        this.displayChatMessages();
        
        // Очищаем поле ввода
        document.getElementById('chat-input').value = '';
        
        // Показываем уведомление о успешной отправке
        utils.showNotification('Сообщение отправлено');
    },
    
    // Отображение сообщений чата
    displayChatMessages() {
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;
        
        chatContainer.innerHTML = '';
        
        const messages = utils.loadFromStorage('chatMessages') || [];
        
        if (messages.length === 0) {
            chatContainer.innerHTML = '<p>Чат пуст. Начните общение!</p>';
            return;
        }
        
        messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.user === auth.currentUser.name ? 'self' : 'other'}`;
            messageDiv.innerHTML = `
                <div><strong>${message.user}</strong> (${message.timestamp})</div>
                <div>${message.text}</div>
            `;
            chatContainer.appendChild(messageDiv);
        });
        
        // Прокручиваем вниз
        chatContainer.scrollTop = chatContainer.scrollHeight;
    },
    
    // Автоматическое обновление чата и комментариев
    startAutoRefresh() {
        // Обновляем чат каждые 2 секунды
        setInterval(() => {
            if (document.getElementById('feedback-page').classList.contains('active')) {
                this.displayChatMessages();
                this.displayFeedbacks();
            }
        }, 2000);
        
        // Обновляем комментарии к тестам каждые 2 секунды (только отображение, без перезагрузки полей ввода)
        setInterval(() => {
            if (document.getElementById('tests-page').classList.contains('active')) {
                this.updateTestCommentsOnly();
            }
            if (document.getElementById('analytics-page').classList.contains('active')) {
                tests.loadAllComments();
            }
        }, 2000);
    },
    
    // Обновление только комментариев к тестам (без перезагрузки полей ввода)
    updateTestCommentsOnly() {
        const testIds = ['products-test', 'sales-test', 'objections-test'];
        
        testIds.forEach(testId => {
            const commentsContainer = document.getElementById(`${testId}-comments`);
            if (commentsContainer) {
                // Сохраняем текущее значение поля ввода
                const commentInput = document.getElementById(`${testId}-comment`);
                const currentInputValue = commentInput ? commentInput.value : '';
                
                // Обновляем только комментарии
                tests.displayComments(testId);
                
                // Восстанавливаем значение поля ввода
                if (commentInput && currentInputValue) {
                    commentInput.value = currentInputValue;
                }
            }
        });
    }
};
