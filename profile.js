// Профиль пользователя
const profile = {
    // Загрузка данных профиля
    loadProfileData() {
        const profileData = this.getUserProfileData();
        const savedPhoto = utils.getUserData('userPhoto');
        
        // Устанавливаем имя пользователя из текущей сессии
        if (auth.currentUser) {
            document.getElementById('profile-display-name').textContent = auth.currentUser.name;
            document.getElementById('profile-name').value = auth.currentUser.name;
        }
        
        if (profileData.position) {
            document.getElementById('profile-display-position').textContent = profileData.position;
            document.getElementById('profile-position').value = profileData.position;
        } else {
            const position = auth.currentUser.role === 'admin' ? 'Руководитель отдела продаж' : 'Менеджер по продажам';
            document.getElementById('profile-display-position').textContent = position;
            document.getElementById('profile-position').value = position;
        }
        
        if (savedPhoto) {
            document.getElementById('profile-photo').src = savedPhoto;
        }
        
        // Загружаем прогресс и обновляем аквариум
        this.loadProgress();
        this.updateAquarium();
        
        // Показываем кнопку сброса прогресса для администратора
        this.showAdminControls();
    },
    
    // Показ админских контролов
    showAdminControls() {
        const aquariumSection = document.querySelector('.aquarium-section');
        if (!aquariumSection) return;
        
        // Удаляем старые админские кнопки если есть
        const oldAdminPanel = document.getElementById('admin-controls-panel');
        if (oldAdminPanel) {
            oldAdminPanel.remove();
        }
        
        // Если пользователь - администратор, показываем панель управления
        if (auth.currentUser && auth.currentUser.role === 'admin') {
            const adminPanel = document.createElement('div');
            adminPanel.id = 'admin-controls-panel';
            adminPanel.className = 'admin-controls';
            adminPanel.innerHTML = `
                <h3>Панель администратора</h3>
                <div class="admin-buttons">
                    <button onclick="profile.resetOwnProgress()" class="btn-secondary">Сбросить мой прогресс</button>
                    <button onclick="profile.resetAllUsersProgress()" class="btn-danger">Сбросить прогресс всех пользователей</button>
                    <button onclick="profile.viewAllProgress()" class="btn-secondary">Просмотр прогресса всех</button>
                </div>
                <div id="admin-message" class="admin-message"></div>
            `;
            aquariumSection.appendChild(adminPanel);
        }
    },
    
    // Сброс собственного прогресса
    resetOwnProgress() {
        if (confirm('Вы уверены, что хотите сбросить свой прогресс обучения? Все изученные материалы, пройденные тесты и игры будут сброшены.')) {
            if (auth.currentUser) {
                // Удаляем прогресс текущего пользователя
                const userProgressKey = `userProgress_${auth.currentUser.username}`;
                localStorage.removeItem(userProgressKey);
                
                // Удаляем фото профиля
                const userPhotoKey = `userPhoto_${auth.currentUser.username}`;
                localStorage.removeItem(userPhotoKey);
                
                // Пересоздаем структуру прогресса
                auth.initializeUserProgress();
                
                // Обновляем отображение
                this.loadProfileData();
                
                this.showAdminMessage('Ваш прогресс успешно сброшен!', 'success');
                utils.showNotification('Ваш прогресс сброшен');
            }
        }
    },
    
    // Сброс прогресса всех пользователей
    resetAllUsersProgress() {
        if (confirm('ВНИМАНИЕ! Вы собираетесь сбросить прогресс ВСЕХ пользователей. Это действие нельзя отменить. Продолжить?')) {
            if (!auth.currentUser || auth.currentUser.role !== 'admin') {
                this.showAdminMessage('Недостаточно прав для выполнения этой операции', 'error');
                return;
            }
            
            // Сохраняем текущего пользователя
            const currentUser = utils.loadFromStorage('currentUser');
            const currentUsername = currentUser ? currentUser.username : null;
            
            // Удаляем все данные прогресса всех пользователей
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('userProgress_') || key.startsWith('userPhoto_')) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Пересоздаем структуру прогресса для текущего пользователя
            if (currentUsername) {
                auth.currentUser = currentUser;
                auth.initializeUserProgress();
            }
            
            // Обновляем отображение
            this.loadProfileData();
            
            this.showAdminMessage('Прогресс всех пользователей успешно сброшен!', 'success');
            utils.showNotification('Прогресс всех пользователей сброшен');
        }
    },
    
    // Просмотр прогресса всех пользователей
    viewAllProgress() {
        if (!auth.currentUser || auth.currentUser.role !== 'admin') {
            this.showAdminMessage('Недостаточно прав для выполнения этой операции', 'error');
            return;
        }
        
        let progressInfo = '<h4>Прогресс всех пользователей:</h4><div class="users-progress-list">';
        
        Object.keys(auth.users).forEach(username => {
            const userProgressKey = `userProgress_${username}`;
            const userProgress = utils.loadFromStorage(userProgressKey);
            
            if (userProgress) {
                const materials = userProgress.materials || {};
                const games = userProgress.games || {};
                const tests = userProgress.tests || {};
                
                const materialsCount = Object.keys(materials).filter(key => materials[key] === 'completed').length;
                const gamesCount = Object.keys(games).length;
                const testsCount = Object.keys(tests).filter(key => tests[key] && tests[key].status === 'completed').length;
                
                const totalProgress = Math.round((materialsCount / 6 + gamesCount / 2 + testsCount / 3) / 3 * 100);
                
                progressInfo += `
                    <div class="user-progress-item">
                        <strong>${auth.users[username].name}</strong> (${username})
                        <div class="progress-details">
                            📚 Материалы: ${materialsCount}/6<br>
                            🎮 Игры: ${gamesCount}/2<br>
                            📝 Тесты: ${testsCount}/3<br>
                            📊 Общий прогресс: ${totalProgress}%
                        </div>
                    </div>
                `;
            } else {
                progressInfo += `
                    <div class="user-progress-item">
                        <strong>${auth.users[username].name}</strong> (${username})
                        <div class="progress-details">Нет данных о прогрессе</div>
                    </div>
                `;
            }
        });
        
        progressInfo += '</div>';
        
        this.showAdminMessage(progressInfo, 'info');
    },
    
    // Показать сообщение в админской панели
    showAdminMessage(message, type = 'info') {
        const messageElement = document.getElementById('admin-message');
        if (messageElement) {
            messageElement.innerHTML = message;
            messageElement.className = `admin-message admin-message-${type}`;
            messageElement.style.display = 'block';
            
            // Автоскрытие для успешных сообщений
            if (type === 'success') {
                setTimeout(() => {
                    messageElement.style.display = 'none';
                }, 5000);
            }
        }
    },
    
    // Получение данных профиля пользователя
    getUserProfileData() {
        if (!auth.currentUser) return {};
        
        const userProgress = auth.getUserProgress();
        return userProgress.profile || {};
    },
    
    // Сохранение данных профиля пользователя
    saveUserProfileData(profileData) {
        if (!auth.currentUser) return false;
        
        const userProgress = auth.getUserProgress();
        userProgress.profile = profileData;
        return auth.saveUserProgress(userProgress);
    },
    
    // Загрузка прогресса обучения
    loadProgress() {
        if (!auth.currentUser) return;
        
        // Для администратора adminFish показываем 100% прогресс
        if (auth.currentUser.username === 'adminFish') {
            if (document.getElementById('materials-progress')) {
                document.getElementById('materials-progress').textContent = '100%';
            }
            if (document.getElementById('training-progress')) {
                document.getElementById('training-progress').textContent = '100%';
            }
            if (document.getElementById('tests-progress')) {
                document.getElementById('tests-progress').textContent = '100%';
            }
            if (document.getElementById('total-progress')) {
                document.getElementById('total-progress').textContent = '100%';
            }
            
            this.progress = {
                materials: 100,
                training: 100,
                tests: 100,
                total: 100
            };
            return;
        }
        
        // Прогресс материалов
        const materialsList = ['company-intro', 'products-services', 'sales-techniques', 
                          'objection-handling', 'negotiation', 'customer-centric'];
        let completedMaterials = 0;
        
        materialsList.forEach(material => {
            if (materials && materials.getMaterialStatus && materials.getMaterialStatus(material) === 'completed') {
                completedMaterials++;
            }
        });
        
        const materialsProgress = Math.round((completedMaterials / materialsList.length) * 100);
        if (document.getElementById('materials-progress')) {
            document.getElementById('materials-progress').textContent = materialsProgress + '%';
        }
        
        // Прогресс обучения (игр)
        const gamesList = ['quest', 'quiz'];
        let completedGames = 0;
        
        gamesList.forEach(game => {
            if (games && games.getGameProgress && games.getGameProgress(game)) {
                completedGames++;
            }
        });
        
        const trainingProgress = Math.round((completedGames / gamesList.length) * 100);
        if (document.getElementById('training-progress')) {
            document.getElementById('training-progress').textContent = trainingProgress + '%';
        }
        
        // Прогресс тестов
        const testsList = ['products-test', 'sales-test', 'objections-test'];
        let completedTests = 0;
        
        testsList.forEach(test => {
            if (tests && tests.getTestStatus && tests.getTestStatus(test) === 'completed') {
                completedTests++;
            }
        });
        
        const testsProgress = Math.round((completedTests / testsList.length) * 100);
        if (document.getElementById('tests-progress')) {
            document.getElementById('tests-progress').textContent = testsProgress + '%';
        }
        
        // Общий прогресс
        const totalProgress = Math.round((materialsProgress + trainingProgress + testsProgress) / 3);
        if (document.getElementById('total-progress')) {
            document.getElementById('total-progress').textContent = totalProgress + '%';
        }
        
        // Сохраняем прогресс для использования в аквариуме
        this.progress = {
            materials: materialsProgress,
            training: trainingProgress,
            tests: testsProgress,
            total: totalProgress
        };
    },
    
    // Обновление аквариума на основе прогресса
    updateAquarium() {
        const aquarium = document.getElementById('aquarium');
        if (!aquarium) return;
        
        // Очищаем аквариум (кроме пузырьков)
        const bubbles = aquarium.querySelector('.bubbles');
        aquarium.innerHTML = '';
        if (bubbles) {
            aquarium.appendChild(bubbles);
        } else {
            const newBubbles = document.createElement('div');
            newBubbles.className = 'bubbles';
            aquarium.appendChild(newBubbles);
        }
        
        // Добавляем рыбок в зависимости от прогресса
        this.addFishBasedOnProgress();
        
        // Добавляем аксессуары в зависимости от прогресса
        this.addAccessoriesBasedOnProgress();
        
        // Добавляем пузырьки
        this.addBubbles();
    },
    
    // Создание SVG рыбки
    createFishSVG(color1, color2, finColor) {
        return `
            <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
                <!-- Тело рыбки -->
                <ellipse cx="30" cy="15" rx="25" ry="12" fill="${color1}" stroke="${color2}" stroke-width="1"/>
                
                <!-- Хвост -->
                <path d="M5,15 Q0,5 10,10 Q5,15 5,15 Z" fill="${color2}"/>
                <path d="M5,15 Q0,25 10,20 Q5,15 5,15 Z" fill="${color2}"/>
                
                <!-- Плавники -->
                <ellipse cx="40" cy="8" rx="8" ry="4" fill="${finColor}" opacity="0.8"/>
                <ellipse cx="40" cy="22" rx="8" ry="4" fill="${finColor}" opacity="0.8"/>
                
                <!-- Глаз -->
                <circle cx="45" cy="14" r="2" fill="white"/>
                <circle cx="45" cy="14" r="1" fill="black"/>
                
                <!-- Полоски на теле -->
                <path d="M20,8 L35,8" stroke="${color2}" stroke-width="1" opacity="0.6"/>
                <path d="M20,22 L35,22" stroke="${color2}" stroke-width="1" opacity="0.6"/>
            </svg>
        `;
    },
    
    // Добавление рыбок на основе прогресса
    addFishBasedOnProgress() {
        const aquarium = document.getElementById('aquarium');
        if (!aquarium) return;
        
        const totalProgress = this.progress ? this.progress.total : 0;
        
        // Количество рыбок зависит от общего прогресса
        let fishCount = 0;
        
        if (totalProgress >= 20) fishCount = 1;  // 1 рыбка при 20%
        if (totalProgress >= 40) fishCount = 2;  // 2 рыбки при 40%
        if (totalProgress >= 60) fishCount = 3;  // 3 рыбки при 60%
        if (totalProgress >= 80) fishCount = 4;  // 4 рыбки при 80%
        if (totalProgress >= 95) fishCount = 5;  // 5 рыбок при 95%+
        
        const fishColors = [
            { body: '#FF6B6B', accent: '#FF5252', fin: '#FF8A80' }, // Красная
            { body: '#4ECDC4', accent: '#26A69A', fin: '#80CBC4' }, // Бирюзовая
            { body: '#FFD93D', accent: '#FFC107', fin: '#FFE082' }, // Желтая
            { body: '#6B5B95', accent: '#5D4A8A', fin: '#8E7CC3' }, // Фиолетовая
            { body: '#88D498', accent: '#6BCF7F', fin: '#A8E6CF' }  // Зеленая
        ];
        
        for (let i = 0; i < fishCount; i++) {
            const fish = document.createElement('div');
            fish.className = `fish-aquarium fish-${i + 1}`;
            fish.innerHTML = this.createFishSVG(
                fishColors[i].body,
                fishColors[i].accent,
                fishColors[i].fin
            );
            aquarium.appendChild(fish);
        }
    },
    
    // Добавление аксессуаров на основе прогресса
    addAccessoriesBasedOnProgress() {
        const aquarium = document.getElementById('aquarium');
        if (!aquarium || !this.progress) return;
        
        const materialsProgress = this.progress.materials;
        const trainingProgress = this.progress.training;
        const testsProgress = this.progress.tests;
        
        // Домик появляется и растет с прогрессом материалов
        if (materialsProgress >= 20) {
            const house = document.createElement('div');
            house.className = 'aquarium-accessory fish-house';
            if (materialsProgress >= 60) {
                house.classList.add('fish-house-large');
            }
            aquarium.appendChild(house);
        }
        
        // Водоросли появляются с прогрессом обучения
        if (trainingProgress >= 25) {
            const seaweed1 = document.createElement('div');
            seaweed1.className = 'aquarium-accessory seaweed seaweed-small';
            aquarium.appendChild(seaweed1);
        }
        
        if (trainingProgress >= 50) {
            const seaweed2 = document.createElement('div');
            seaweed2.className = 'aquarium-accessory seaweed seaweed-medium';
            aquarium.appendChild(seaweed2);
        }
        
        if (trainingProgress >= 75) {
            const seaweed3 = document.createElement('div');
            seaweed3.className = 'aquarium-accessory seaweed seaweed-large';
            aquarium.appendChild(seaweed3);
        }
        
        // Камни появляются с прогрессом тестов
        if (testsProgress >= 20) {
            const stone1 = document.createElement('div');
            stone1.className = 'aquarium-accessory stone stone-small';
            aquarium.appendChild(stone1);
        }
        
        if (testsProgress >= 50) {
            const stone2 = document.createElement('div');
            stone2.className = 'aquarium-accessory stone stone-medium';
            aquarium.appendChild(stone2);
        }
        
        if (testsProgress >= 80) {
            const stone3 = document.createElement('div');
            stone3.className = 'aquarium-accessory stone stone-large';
            aquarium.appendChild(stone3);
        }
        
        // Сундук с сокровищами появляется при высоком прогрессе
        if (testsProgress >= 90) {
            const treasure = document.createElement('div');
            treasure.className = 'aquarium-accessory treasure-chest';
            if (testsProgress >= 95) {
                treasure.classList.add('treasure-chest-open');
            }
            aquarium.appendChild(treasure);
        }
    },
    
    // Добавление пузырьков
    addBubbles() {
        const bubblesContainer = document.querySelector('.bubbles');
        if (!bubblesContainer) return;
        
        bubblesContainer.innerHTML = '';
        
        // Создаем несколько пузырьков
        const bubbleCount = this.progress && this.progress.total > 0 ? 20 : 10;
        
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            
            // Случайные параметры для пузырьков
            const size = Math.random() * 15 + 5;
            const left = Math.random() * 100;
            const delay = Math.random() * 8;
            const duration = Math.random() * 4 + 6;
            
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${left}%`;
            bubble.style.animationDelay = `${delay}s`;
            bubble.style.animationDuration = `${duration}s`;
            
            bubblesContainer.appendChild(bubble);
        }
    },
    
    // Включение режима редактирования
    enableEditMode() {
        document.getElementById('edit-profile-section').style.display = 'block';
        document.getElementById('edit-profile-btn').style.display = 'none';
    },
    
    // Отключение режима редактирования
    disableEditMode() {
        document.getElementById('edit-profile-section').style.display = 'none';
        document.getElementById('edit-profile-btn').style.display = 'block';
    },
    
    // Отмена редактирования
    cancelEdit() {
        this.disableEditMode();
        // Восстанавливаем исходные значения
        this.loadProfileData();
    },
    
    // Обновление фото
    updatePhoto() {
        const fileInput = document.getElementById('photo-upload');
        const file = fileInput.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profile-photo').src = e.target.result;
                // Сохраняем фото для текущего пользователя
                utils.saveUserData('userPhoto', e.target.result);
                utils.showNotification('Фото обновлено');
            };
            reader.readAsDataURL(file);
        } else {
            utils.showNotification('Выберите файл для загрузки', true);
        }
    },
    
    // Обновление профиля
    updateProfile() {
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (newPassword && newPassword !== confirmPassword) {
            utils.showNotification('Пароли не совпадают', true);
            return;
        }
        
        // Сохраняем данные профиля для текущего пользователя
        const profileData = {
            name: document.getElementById('profile-name').value,
            position: document.getElementById('profile-position').value
        };
        
        this.saveUserProfileData(profileData);
        
        // Обновляем отображаемые данные
        document.getElementById('profile-display-name').textContent = profileData.name;
        document.getElementById('profile-display-position').textContent = profileData.position;
        
        if (newPassword) {
            // В реальном приложении здесь был бы запрос к серверу для изменения пароля
            utils.showNotification('Профиль и пароль обновлены');
        } else {
            utils.showNotification('Профиль обновлен');
        }
        
        // Очищаем поля паролей и выходим из режима редактирования
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        this.disableEditMode();
    }
};
