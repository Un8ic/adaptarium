// Утилитарные функции
const utils = {
    // Показать уведомление
    showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = isError ? 'notification error' : 'notification';
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    },
    
    // Сохранить данные в localStorage
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Ошибка сохранения в localStorage:', e);
            return false;
        }
    },
    
    // Загрузить данные из localStorage
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Ошибка загрузки из localStorage:', e);
            return null;
        }
    },
    
    // Генерация случайного числа в диапазоне
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Форматирование даты
    formatDate(date) {
        return new Date(date).toLocaleString('ru-RU');
    },
    
    // Проверка на мобильное устройство
    isMobile() {
        return window.innerWidth <= 768;
    }
};