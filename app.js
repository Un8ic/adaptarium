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
    
    // Обработчик для кнопки редактирования профиля
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            profile.enableEditMode();
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
    
    // Переопределяем функцию showPage для автоматического обновления прогресса
    const originalShowPage = navigation.showPage;
    navigation.showPage = function(pageId) {
        originalShowPage.call(this, pageId);
        
        if (pageId === 'profile-page') {
            // Обновляем прогресс и аквариум при каждом входе в личный кабинет
            setTimeout(() => {
                if (typeof profile !== 'undefined') {
                    profile.loadProgress();
                    profile.updateAquarium();
                }
            }, 100);
        }
    };
    
    // Переопределяем функцию completeMaterial для обновления прогресса
    if (typeof materials !== 'undefined') {
        const originalCompleteMaterial = materials.completeMaterial;
        materials.completeMaterial = function(materialId) {
            const result = originalCompleteMaterial.call(this, materialId);
            setTimeout(() => {
                if (typeof profile !== 'undefined') {
                    profile.loadProgress();
                    profile.updateAquarium();
                }
            }, 500);
            return result;
        };
    }
    
    // Переопределяем функцию завершения тестов для обновления прогресса
    if (typeof tests !== 'undefined') {
        const originalSubmitTest = tests.submitTest;
        tests.submitTest = function(testId) {
            originalSubmitTest.call(this, testId);
            setTimeout(() => {
                if (typeof profile !== 'undefined') {
                    profile.loadProgress();
                    profile.updateAquarium();
                }
            }, 500);
        };
    }
    
    // Переопределяем функции игр для обновления прогресса
    if (typeof games !== 'undefined') {
        // Для квест-игры
        const originalSaveQuestProgress = games.saveQuestProgress;
        if (originalSaveQuestProgress) {
            games.saveQuestProgress = function() {
                originalSaveQuestProgress.call(this);
                setTimeout(() => {
                    if (typeof profile !== 'undefined') {
                        profile.loadProgress();
                        profile.updateAquarium();
                    }
                }, 500);
            };
        }
        
        // Для викторины
        const originalSaveQuizProgress = games.saveQuizProgress;
        if (originalSaveQuizProgress) {
            games.saveQuizProgress = function() {
                originalSaveQuizProgress.call(this);
                setTimeout(() => {
                    if (typeof profile !== 'undefined') {
                        profile.loadProgress();
                        profile.updateAquarium();
                    }
                }, 500);
            };
        }
        
        // При завершении викторины
        const originalShowQuizResults = games.showQuizResults;
        if (originalShowQuizResults) {
            games.showQuizResults = function() {
                originalShowQuizResults.call(this);
                setTimeout(() => {
                    if (typeof profile !== 'undefined') {
                        profile.loadProgress();
                        profile.updateAquarium();
                    }
                }, 500);
            };
        }
    }
    
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
    
    // Дополнительные инициализации для улучшения пользовательского опыта
    initializeEnhancedFeatures();
});

// Дополнительные функции для улучшения пользовательского опыта
function initializeEnhancedFeatures() {
    // Автоматическое обновление прогресса при изменении данных в localStorage
    if (window.Storage && window.localStorage) {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            originalSetItem.apply(this, arguments);
            
            // Если изменились данные, связанные с прогрессом, обновляем аквариум
            if (key.includes('material-') || key.includes('test-') || key.includes('game-')) {
                setTimeout(() => {
                    if (typeof profile !== 'undefined' && 
                        document.getElementById('profile-page') && 
                        document.getElementById('profile-page').classList.contains('active')) {
                        profile.loadProgress();
                        profile.updateAquarium();
                    }
                }, 300);
            }
        };
    }
    
    // Обработка смены ориентации устройства для пересчета анимаций
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            if (typeof profile !== 'undefined' && 
                document.getElementById('profile-page') && 
                document.getElementById('profile-page').classList.contains('active')) {
                profile.updateAquarium();
            }
        }, 500);
    });
    
    // Обработка изменения размера окна
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (typeof profile !== 'undefined' && 
                document.getElementById('profile-page') && 
                document.getElementById('profile-page').classList.contains('active')) {
                profile.updateAquarium();
            }
        }, 250);
    });
}

// Глобальные вспомогательные функции
window.refreshAquarium = function() {
    if (typeof profile !== 'undefined') {
        profile.loadProgress();
        profile.updateAquarium();
        utils.showNotification('Аквариум обновлен!');
    }
};

// Функция для принудительного обновления всех прогрессов
window.forceRefreshProgress = function() {
    if (typeof profile !== 'undefined') {
        profile.loadProgress();
        if (typeof profile.updateAquarium !== 'undefined') {
            profile.updateAquarium();
        }
        utils.showNotification('Все прогрессы обновлены!');
    }
    
    // Также обновляем другие компоненты, если они активны
    if (document.getElementById('materials-page') && document.getElementById('materials-page').classList.contains('active')) {
        setTimeout(() => {
            if (typeof materials !== 'undefined' && typeof materials.loadMaterials === 'function') {
                materials.loadMaterials();
            }
        }, 100);
    }
    
    if (document.getElementById('tests-page') && document.getElementById('tests-page').classList.contains('active')) {
        setTimeout(() => {
            if (typeof tests !== 'undefined' && typeof tests.loadTests === 'function') {
                tests.loadTests();
            }
        }, 100);
    }
    
    if (document.getElementById('training-page') && document.getElementById('training-page').classList.contains('active')) {
        setTimeout(() => {
            if (typeof games !== 'undefined' && typeof games.loadGames === 'function') {
                games.loadGames();
            }
        }, 100);
    }
};

// Функция для сброса прогресса (для тестирования)
window.resetProgress = function() {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.')) {
        // Удаляем все данные прогресса
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.includes('material-') || key.includes('test-') || key.includes('game-') || 
                key.includes('progress') || key === 'userProfile' || key === 'userPhoto') {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Сохраняем только текущего пользователя
        const currentUser = utils.loadFromStorage('currentUser');
        localStorage.clear();
        if (currentUser) {
            utils.saveToStorage('currentUser', currentUser);
        }
        
        utils.showNotification('Весь прогресс сброшен!');
        
        // Перезагружаем страницу
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
};

// Функция для быстрой проверки состояния прогресса
window.checkProgressState = function() {
    if (typeof profile !== 'undefined' && typeof profile.progress !== 'undefined') {
        const progress = profile.progress;
        alert(`Текущий прогресс:\n\n` +
              `Материалы: ${progress.materials}%\n` +
              `Обучение: ${progress.training}%\n` +
              `Тесты: ${progress.tests}%\n` +
              `Общий: ${progress.total}%\n\n` +
              `Количество рыбок: ${Math.floor(progress.total / 20)}`);
    } else {
        alert('Прогресс не загружен. Перейдите в личный кабинет.');
    }
};

// Обработка ошибок для улучшения отказоустойчивости
window.addEventListener('error', function(e) {
    console.error('Произошла ошибка:', e.error);
    
    // Показываем пользователю дружелюбное сообщение об ошибке
    if (document.getElementById('notification')) {
        utils.showNotification('Произошла непредвиденная ошибка. Пожалуйста, обновите страницу.', true);
    }
});

// Улучшенная обработка Promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Необработанный Promise rejection:', e.reason);
    
    // Предотвращаем падение приложения из-за необработанных Promise
    e.preventDefault();
});
