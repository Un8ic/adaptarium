// Основной файл приложения
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию
    auth.checkAuth();
    
    // Инициализируем реальные обновления (если Firebase доступен)
    setTimeout(() => {
        if (typeof firebaseService !== 'undefined' && typeof feedback !== 'undefined') {
            feedback.initRealTimeUpdates();
        }
    }, 1000);
    
    // Обработчик для входа
    document.getElementById('login-btn').addEventListener('click', function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        auth.login(username, password);
    });
    
    // Обработчик для выхода
    document.getElementById('logout-btn').addEventListener('click', function() {
        // Очищаем подписки Firebase при выходе
        if (typeof feedback !== 'undefined' && feedback.cleanupSubscriptions) {
            feedback.cleanupSubscriptions();
        }
        auth.logout();
    });
    
    // Обработчик для VR-обучения
    const vrTrainingBtn = document.getElementById('vr-training-btn');
    if (vrTrainingBtn) {
        vrTrainingBtn.addEventListener('click', function() {
            utils.showNotification('VR-обучение находится в разработке');
        });
    }
    
    // Обработчик для отправки сообщения по Enter
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                feedback.sendMessage();
            }
        });
    }
    
    // Запускаем автоматическое обновление чата и комментариев (для localStorage)
    if (typeof feedback !== 'undefined' && feedback.startAutoRefresh) {
        feedback.startAutoRefresh();
    }
    
    // Обработчик для выхода при закрытии страницы
    window.addEventListener('beforeunload', function() {
        if (auth.currentUser) {
            // Сохраняем время последней активности
            utils.saveToStorage('lastActivity', Date.now());
        }
        
        // Очищаем подписки Firebase при закрытии страницы
        if (typeof feedback !== 'undefined' && feedback.cleanupSubscriptions) {
            feedback.cleanupSubscriptions();
        }
    });
    
    // Проверяем время последней активности при загрузке
    const lastActivity = utils.loadFromStorage('lastActivity');
    if (lastActivity && (Date.now() - parseInt(lastActivity)) > 300000) { // 5 минут
        // Автоматический выход, если прошло больше 5 минут
        auth.logout();
        utils.showNotification('Автоматический выход из системы по истечении времени');
    }
    
    // Глобальные обработчики для навигации
    window.addEventListener('popstate', function() {
        // Обработка кнопки "Назад" в браузере
        navigation.goBack();
    });
    
    // Инициализация приложения
    console.log('АДАПТАРИУМ инициализирован успешно');
    
    // Периодическая синхронизация данных (если Firebase не используется)
    if (typeof firebaseService === 'undefined') {
        setInterval(() => {
            // Резервное копирование важных данных
            if (auth.currentUser) {
                const userData = {
                    lastSync: new Date().toISOString(),
                    user: auth.currentUser.username
                };
                utils.saveToStorage('lastSync', userData);
            }
        }, 60000); // Каждую минуту
    }
});
