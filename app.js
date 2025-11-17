// Основной файл приложения
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию
    auth.checkAuth();
    
    // Обработчик для входа
    document.getElementById('login-btn').addEventListener('click', function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        auth.login(username, password);
    });
    
    // Обработчик для выхода
    document.getElementById('logout-btn').addEventListener('click', function() {
        auth.logout();
    });
    
    // Обработчик для VR-обучения
    document.getElementById('vr-training-btn').addEventListener('click', function() {
        utils.showNotification('VR-обучение находится в разработке');
    });
    
    // Обработчик для отправки сообщения по Enter
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            feedback.sendMessage();
        }
    });
    
    // Запускаем автоматическое обновление чата и комментариев
    feedback.startAutoRefresh();
    
    // Обработчик для выхода при закрытии страницы
    window.addEventListener('beforeunload', function() {
        if (auth.currentUser) {
            // Сохраняем время последней активности
            utils.saveToStorage('lastActivity', Date.now());
        }
    });
    
    // Проверяем время последней активности при загрузке
    const lastActivity = utils.loadFromStorage('lastActivity');
    if (lastActivity && (Date.now() - parseInt(lastActivity)) > 300000) { // 5 минут
        // Автоматический выход, если прошло больше 5 минут
        auth.logout();
        utils.showNotification('Автоматический выход из системы по истечении времени');
    }
});
