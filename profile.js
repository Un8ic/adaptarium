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
    
    // Получение прогресса всех пользователей (для страницы аналитики)
    getAllUsersProgress() {
        let progressHTML = '<div class="users-progress-list">';
        
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
                
                progressHTML += `
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
                progressHTML += `
                    <div class="user-progress-item">
                        <strong>${auth.users[username].name}</strong> (${username})
                        <div class="progress-details">Нет данных о прогрессе</div>
                    </div>
                `;
            }
        });
        
        progressHTML += '</div>';
        return progressHTML;
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

    // Создание SVG рыбки - полностью переработанная версия
    createFishSVG(type, colors) {
        const fishTemplates = {
            'clownfish': `
                <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
                    <!-- Тело -->
                    <ellipse cx="30" cy="15" rx="25" ry="12" fill="${colors.body}" stroke="${colors.accent}" stroke-width="1"/>
                    <!-- Полосы -->
                    <path d="M20,8 L25,8 L25,22 L20,22 Z" fill="${colors.accent}"/>
                    <path d="M35,8 L40,8 L40,22 L35,22 Z" fill="${colors.accent}"/>
                    <!-- Хвост -->
                    <path d="M5,15 Q0,5 10,10 Q5,15 5,15 Z" fill="${colors.accent}"/>
                    <path d="M5,15 Q0,25 10,20 Q5,15 5,15 Z" fill="${colors.accent}"/>
                    <!-- Плавники -->
                    <ellipse cx="40" cy="8" rx="8" ry="4" fill="${colors.fin}" opacity="0.8"/>
                    <ellipse cx="40" cy="22" rx="8" ry="4" fill="${colors.fin}" opacity="0.8"/>
                    <!-- Глаз -->
                    <circle cx="45" cy="14" r="2" fill="white"/>
                    <circle cx="45" cy="14" r="1" fill="black"/>
                </svg>
            `,
            'angel': `
                <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
                    <!-- Тело -->
                    <path d="M30,15 a25,12 0 1,0 -50,0 a25,12 0 1,0 50,0" fill="${colors.body}" stroke="${colors.accent}" stroke-width="1"/>
                    <!-- Полосы -->
                    <path d="M20,5 L20,25" stroke="${colors.accent}" stroke-width="2"/>
                    <path d="M35,5 L35,25" stroke="${colors.accent}" stroke-width="2"/>
                    <!-- Хвост -->
                    <path d="M5,15 Q-5,5 15,8 Q5,15 5,15 Z" fill="${colors.fin}"/>
                    <path d="M5,15 Q-5,25 15,22 Q5,15 5,15 Z" fill="${colors.fin}"/>
                    <!-- Плавники -->
                    <path d="M40,5 Q50,0 55,8 Q45,10 40,5 Z" fill="${colors.fin}"/>
                    <path d="M40,25 Q50,30 55,22 Q45,20 40,25 Z" fill="${colors.fin}"/>
                    <!-- Глаз -->
                    <circle cx="45" cy="14" r="2" fill="white"/>
                    <circle cx="45" cy="14" r="1" fill="black"/>
                </svg>
            `,
            'tropical': `
                <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
                    <!-- Тело -->
                    <ellipse cx="30" cy="15" rx="25" ry="12" fill="${colors.body}" stroke="${colors.accent}" stroke-width="1"/>
                    <!-- Узор -->
                    <circle cx="35" cy="12" r="3" fill="${colors.pattern}" opacity="0.7"/>
                    <circle cx="25" cy="18" r="2" fill="${colors.pattern}" opacity="0.7"/>
                    <!-- Хвост -->
                    <path d="M5,15 Q0,8 12,10 Q5,15 5,15 Z" fill="${colors.accent}"/>
                    <path d="M5,15 Q0,22 12,20 Q5,15 5,15 Z" fill="${colors.accent}"/>
                    <!-- Плавники -->
                    <path d="M35,5 Q45,2 50,8 Q40,12 35,5 Z" fill="${colors.fin}" opacity="0.8"/>
                    <path d="M35,25 Q45,28 50,22 Q40,18 35,25 Z" fill="${colors.fin}" opacity="0.8"/>
                    <!-- Глаз -->
                    <circle cx="45" cy="14" r="2" fill="white"/>
                    <circle cx="45" cy="14" r="1" fill="black"/>
                </svg>
            `,
            'goldfish': `
                <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
                    <!-- Тело -->
                    <ellipse cx="35" cy="15" rx="20" ry="10" fill="${colors.body}" stroke="${colors.accent}" stroke-width="1"/>
                    <!-- Хвост -->
                    <path d="M15,15 Q0,5 10,8 Q15,15 15,15 Z" fill="${colors.fin}" opacity="0.9"/>
                    <path d="M15,15 Q0,25 10,22 Q15,15 15,15 Z" fill="${colors.fin}" opacity="0.9"/>
                    <!-- Плавники -->
                    <ellipse cx="40" cy="8" rx="6" ry="3" fill="${colors.fin}" opacity="0.8"/>
                    <ellipse cx="40" cy="22" rx="6" ry="3" fill="${colors.fin}" opacity="0.8"/>
                    <!-- Глаз -->
                    <circle cx="45" cy="14" r="2" fill="white"/>
                    <circle cx="45" cy="14" r="1" fill="black"/>
                </svg>
            `,
            'blue_tang': `
                <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
                    <!-- Тело -->
                    <path d="M40,15 a20,10 0 1,0 -35,0 a15,8 0 1,0 35,0" fill="${colors.body}" stroke="${colors.accent}" stroke-width="1"/>
                    <!-- Черная полоса -->
                    <path d="M30,5 L30,25" stroke="${colors.pattern}" stroke-width="3"/>
                    <!-- Хвост -->
                    <path d="M5,15 Q-5,8 8,12 Q5,15 5,15 Z" fill="${colors.fin}"/>
                    <path d="M5,15 Q-5,22 8,18 Q5,15 5,15 Z" fill="${colors.fin}"/>
                    <!-- Плавники -->
                    <path d="M35,5 Q42,2 48,7 Q40,10 35,5 Z" fill="${colors.fin}"/>
                    <path d="M35,25 Q42,28 48,23 Q40,20 35,25 Z" fill="${colors.fin}"/>
                    <!-- Глаз -->
                    <circle cx="45" cy="14" r="2" fill="white"/>
                    <circle cx="45" cy="14" r="1" fill="black"/>
                </svg>
            `
        };
        
        return fishTemplates[type] || fishTemplates['tropical'];
    },

    // Добавление рыбок на основе прогресса - улучшенная версия
    addFishBasedOnProgress() {
        const aquarium = document.getElementById('aquarium');
        if (!aquarium) return;
        
        const totalProgress = this.progress ? this.progress.total : 0;
        
        // Конфигурация рыбок с разными типами и цветами
        const fishConfigs = [
            {
                type: 'clownfish',
                colors: { body: '#FF6B6B', accent: '#FF5252', fin: '#FF8A80', pattern: '#FFFFFF' }
            },
            {
                type: 'angel',
                colors: { body: '#4ECDC4', accent: '#26A69A', fin: '#80CBC4', pattern: '#FFFFFF' }
            },
            {
                type: 'tropical',
                colors: { body: '#FFD93D', accent: '#FFC107', fin: '#FFE082', pattern: '#FF6B6B' }
            },
            {
                type: 'goldfish',
                colors: { body: '#FFA726', accent: '#FF9800', fin: '#FFB74D', pattern: '#FFFFFF' }
            },
            {
                type: 'blue_tang',
                colors: { body: '#42A5F5', accent: '#2196F3', fin: '#64B5F6', pattern: '#000000' }
            }
        ];
        
        // Количество рыбок зависит от общего прогресса
        let fishCount = 0;
        if (totalProgress >= 15) fishCount = 1;
        if (totalProgress >= 30) fishCount = 2;
        if (totalProgress >= 50) fishCount = 3;
        if (totalProgress >= 75) fishCount = 4;
        if (totalProgress >= 90) fishCount = 5;
        
        for (let i = 0; i < fishCount; i++) {
            const fishConfig = fishConfigs[i];
            const fish = document.createElement('div');
            fish.className = `fish-aquarium fish-${i + 1}`;
            fish.innerHTML = this.createFishSVG(fishConfig.type, fishConfig.colors);
            fish.style.width = '60px';
            fish.style.height = '30px';
            aquarium.appendChild(fish);
        }
    },

    // Добавление аксессуаров на основе прогресса - улучшенная версия
    addAccessoriesBasedOnProgress() {
        const aquarium = document.getElementById('aquarium');
        if (!aquarium || !this.progress) return;
        
        const materialsProgress = this.progress.materials;
        const trainingProgress = this.progress.training;
        const testsProgress = this.progress.tests;
        
        // Создаем дно аквариума
        const bottom = document.createElement('div');
        bottom.className = 'aquarium-bottom';
        aquarium.appendChild(bottom);
        
        // Кораллы появляются с прогрессом материалов
        if (materialsProgress >= 20) {
            const coral1 = document.createElement('div');
            coral1.className = 'aquarium-accessory coral coral-1';
            aquarium.appendChild(coral1);
        }
        
        if (materialsProgress >= 50) {
            const coral2 = document.createElement('div');
            coral2.className = 'aquarium-accessory coral coral-2';
            aquarium.appendChild(coral2);
        }
        
        if (materialsProgress >= 80) {
            const coral3 = document.createElement('div');
            coral3.className = 'aquarium-accessory coral coral-3';
            aquarium.appendChild(coral3);
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
        
        // Камни и ракушки появляются с прогрессом тестов
        if (testsProgress >= 20) {
            const stone1 = document.createElement('div');
            stone1.className = 'aquarium-accessory stone stone-small';
            aquarium.appendChild(stone1);
        }
        
        if (testsProgress >= 40) {
            const shell = document.createElement('div');
            shell.className = 'aquarium-accessory shell';
            aquarium.appendChild(shell);
        }
        
        if (testsProgress >= 60) {
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
            aquarium.appendChild(treasure);
        }
    },

    // Добавление пузырьков - улучшенная версия
    addBubbles() {
        const bubblesContainer = document.querySelector('.bubbles');
        if (!bubblesContainer) return;
        
        bubblesContainer.innerHTML = '';
        
        // Количество пузырьков зависит от прогресса
        const bubbleCount = this.progress && this.progress.total > 0 ? 25 : 15;
        
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            
            // Случайные параметры для пузырьков
            const size = Math.random() * 20 + 5;
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
