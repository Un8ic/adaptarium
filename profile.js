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
        let progressHTML = '<div class="users-progress-list" style="max-height: none; overflow-y: visible;">';
        
        Object.keys(auth.users).forEach(username => {
            // Пропускаем администратора adminFish
            if (username === 'adminFish') {
                return;
            }
            
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
            
            // Для adminFish показываем только кнопку сброса прогресса всех пользователей
            if (auth.currentUser.username === 'adminFish') {
                adminPanel.innerHTML = `
                    <h3>Панель администратора</h3>
                    <div class="admin-buttons">
                        <button onclick="profile.resetAllUsersProgress()" class="btn-danger">Сбросить прогресс всех пользователей</button>
                    </div>
                    <div id="admin-message" class="admin-message"></div>
                `;
            } else {
                // Для других пользователей показываем кнопку сброса собственного прогресса
                adminPanel.innerHTML = `
                    <h3>Панель управления</h3>
                    <div class="admin-buttons">
                        <button onclick="profile.resetOwnProgress()" class="btn-secondary">Сбросить мой прогресс</button>
                    </div>
                    <div id="admin-message" class="admin-message"></div>
                `;
            }
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
            // Пропускаем администратора adminFish
            if (username === 'adminFish') {
                return;
            }
            
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
        
        // Создаем дно аквариума
        const bottom = document.createElement('div');
        bottom.className = 'aquarium-bottom';
        aquarium.appendChild(bottom);
        
        // Добавляем обитателей в зависимости от общего прогресса
        this.addCreaturesBasedOnProgress();
        
        // Добавляем домики в зависимости от прогресса тестов
        this.addHousesBasedOnTests();
        
        // Добавляем аксессуары в зависимости от прогресса обучения
        this.addAccessoriesBasedOnTraining();
        
        // Добавляем кораллы и камни в зависимости от прогресса материалов
        this.addCoralsAndStonesBasedOnMaterials();
        
        // Добавляем пузырьки
        this.addBubbles();
    },

    // Добавление обитателей на основе общего прогресса
    addCreaturesBasedOnProgress() {
        const aquarium = document.getElementById('aquarium');
        if (!aquarium) return;
        
        const totalProgress = this.progress ? this.progress.total : 0;
        
        // Рыбки появляются с прогрессом от 15%
        if (totalProgress >= 15) {
            const fish1 = document.createElement('div');
            fish1.className = 'aquarium-creature fish-1';
            fish1.innerHTML = '🐠';
            fish1.style.fontSize = '24px';
            aquarium.appendChild(fish1);
        }
        
        if (totalProgress >= 30) {
            const fish2 = document.createElement('div');
            fish2.className = 'aquarium-creature fish-2';
            fish2.innerHTML = '🐟';
            fish2.style.fontSize = '24px';
            aquarium.appendChild(fish2);
        }
        
        if (totalProgress >= 50) {
            const fish3 = document.createElement('div');
            fish3.className = 'aquarium-creature fish-3';
            fish3.innerHTML = '🐡';
            fish3.style.fontSize = '24px';
            aquarium.appendChild(fish3);
        }
        
        // Медузы появляются с прогрессом от 40%
        if (totalProgress >= 40) {
            const jellyfish1 = document.createElement('div');
            jellyfish1.className = 'aquarium-creature jellyfish-1';
            jellyfish1.innerHTML = '🎐';
            jellyfish1.style.fontSize = '28px';
            aquarium.appendChild(jellyfish1);
        }
        
        if (totalProgress >= 60) {
            const jellyfish2 = document.createElement('div');
            jellyfish2.className = 'aquarium-creature jellyfish-2';
            jellyfish2.innerHTML = '🌊';
            jellyfish2.style.fontSize = '28px';
            aquarium.appendChild(jellyfish2);
        }
        
        // Крабы и осьминоги появляются с прогрессом от 70%
        if (totalProgress >= 70) {
            const crab = document.createElement('div');
            crab.className = 'aquarium-creature crab';
            crab.innerHTML = '🦀';
            crab.style.fontSize = '20px';
            crab.style.display = 'block';
            aquarium.appendChild(crab);
        }
        
        if (totalProgress >= 80) {
            const octopus = document.createElement('div');
            octopus.className = 'aquarium-creature octopus';
            octopus.innerHTML = '🐙';
            octopus.style.fontSize = '22px';
            octopus.style.display = 'block';
            aquarium.appendChild(octopus);
        }
        
        // Русалка появляется только при максимальном прогрессе (90%+)
        if (totalProgress >= 90) {
            const mermaid = document.createElement('div');
            mermaid.className = 'aquarium-creature mermaid';
            mermaid.innerHTML = '🧜‍♀️';
            mermaid.style.fontSize = '32px';
            mermaid.style.display = 'block';
            aquarium.appendChild(mermaid);
        }
    },

    // Добавление домиков на основе прогресса тестов
    addHousesBasedOnTests() {
        const aquarium = document.getElementById('aquarium');
        if (!aquarium || !this.progress) return;
        
        const testsProgress = this.progress.tests;
        
        // Убираем все существующие домики
        const existingHouses = aquarium.querySelectorAll('.fish-house');
        existingHouses.forEach(house => house.remove());
        
        // Добавляем соответствующий домик в зависимости от прогресса тестов
        const house = document.createElement('div');
        house.className = 'fish-house';
        
        if (testsProgress >= 80) {
            house.className += ' fish-house-large';
            house.style.display = 'block';
        } else if (testsProgress >= 50) {
            house.className += ' fish-house-medium';
            house.style.display = 'block';
        } else if (testsProgress >= 20) {
            house.className += ' fish-house-small';
            house.style.display = 'block';
        }
        
        aquarium.appendChild(house);
    },

    // Добавление аксессуаров на основе прогресса обучения
    addAccessoriesBasedOnTraining() {
        const aquarium = document.getElementById('aquarium');
        if (!aquarium || !this.progress) return;
        
        const trainingProgress = this.progress.training;
        
        // Большое колесо обозрения появляется при высоком прогрессе
        if (trainingProgress >= 80) {
            const ferrisWheel = document.createElement('div');
            ferrisWheel.className = 'aquarium-accessory ferris-wheel';
            ferrisWheel.style.display = 'block';
            aquarium.appendChild(ferrisWheel);
        }
        
        // Средние аксессуары (вазы и якорь) появляются при среднем прогрессе
        if (trainingProgress >= 50) {
            const vase1 = document.createElement('div');
            vase1.className = 'aquarium-accessory vase-medium vase-1';
            vase1.style.display = 'block';
            aquarium.appendChild(vase1);
            
            const vase2 = document.createElement('div');
            vase2.className = 'aquarium-accessory vase-medium vase-2';
            vase2.style.display = 'block';
            aquarium.appendChild(vase2);
            
            const anchor = document.createElement('div');
            anchor.className = 'aquarium-accessory anchor-medium';
            anchor.style.display = 'block';
            aquarium.appendChild(anchor);
        }
        
        // Маленькие аксессуары (ракушки и жемчуг) появляются при низком прогрессе
        if (trainingProgress >= 25) {
            const shell1 = document.createElement('div');
            shell1.className = 'aquarium-accessory shell-small shell-1';
            shell1.style.display = 'block';
            aquarium.appendChild(shell1);
            
            const shell2 = document.createElement('div');
            shell2.className = 'aquarium-accessory shell-small shell-2';
            shell2.style.display = 'block';
            aquarium.appendChild(shell2);
            
            const pearl1 = document.createElement('div');
            pearl1.className = 'aquarium-accessory pearl-small pearl-1';
            pearl1.style.display = 'block';
            aquarium.appendChild(pearl1);
            
            const pearl2 = document.createElement('div');
            pearl2.className = 'aquarium-accessory pearl-small pearl-2';
            pearl2.style.display = 'block';
            aquarium.appendChild(pearl2);
        }
    },

    // Добавление кораллов и камней на основе прогресса материалов
    addCoralsAndStonesBasedOnMaterials() {
        const aquarium = document.getElementById('aquarium');
        if (!aquarium || !this.progress) return;
        
        const materialsProgress = this.progress.materials;
        
        // Убираем все существующие кораллы и камни
        const existingCorals = aquarium.querySelectorAll('.coral, .stone');
        existingCorals.forEach(item => item.remove());
        
        // Добавляем кораллы и камни в зависимости от прогресса материалов
        if (materialsProgress >= 80) {
            // Высокий уровень: большие кораллы и три камня
            const coral1 = document.createElement('div');
            coral1.className = 'aquarium-accessory coral coral-1 coral-large';
            coral1.style.display = 'block';
            aquarium.appendChild(coral1);
            
            const coral2 = document.createElement('div');
            coral2.className = 'aquarium-accessory coral coral-2 coral-large';
            coral2.style.display = 'block';
            aquarium.appendChild(coral2);
            
            const coral3 = document.createElement('div');
            coral3.className = 'aquarium-accessory coral coral-3 coral-large';
            coral3.style.display = 'block';
            aquarium.appendChild(coral3);
            
            const stone1 = document.createElement('div');
            stone1.className = 'aquarium-accessory stone stone-small';
            stone1.style.display = 'block';
            aquarium.appendChild(stone1);
            
            const stone2 = document.createElement('div');
            stone2.className = 'aquarium-accessory stone stone-medium';
            stone2.style.display = 'block';
            aquarium.appendChild(stone2);
            
            const stone3 = document.createElement('div');
            stone3.className = 'aquarium-accessory stone stone-large';
            stone3.style.display = 'block';
            aquarium.appendChild(stone3);
            
        } else if (materialsProgress >= 50) {
            // Средний уровень: средние кораллы и два камня
            const coral1 = document.createElement('div');
            coral1.className = 'aquarium-accessory coral coral-1 coral-medium';
            coral1.style.display = 'block';
            aquarium.appendChild(coral1);
            
            const coral2 = document.createElement('div');
            coral2.className = 'aquarium-accessory coral coral-2 coral-medium';
            coral2.style.display = 'block';
            aquarium.appendChild(coral2);
            
            const coral3 = document.createElement('div');
            coral3.className = 'aquarium-accessory coral coral-3 coral-medium';
            coral3.style.display = 'block';
            aquarium.appendChild(coral3);
            
            const stone1 = document.createElement('div');
            stone1.className = 'aquarium-accessory stone stone-small';
            stone1.style.display = 'block';
            aquarium.appendChild(stone1);
            
            const stone2 = document.createElement('div');
            stone2.className = 'aquarium-accessory stone stone-medium';
            stone2.style.display = 'block';
            aquarium.appendChild(stone2);
            
        } else if (materialsProgress >= 20) {
            // Низкий уровень: маленькие кораллы и один камень
            const coral1 = document.createElement('div');
            coral1.className = 'aquarium-accessory coral coral-1 coral-small';
            coral1.style.display = 'block';
            aquarium.appendChild(coral1);
            
            const coral2 = document.createElement('div');
            coral2.className = 'aquarium-accessory coral coral-2 coral-small';
            coral2.style.display = 'block';
            aquarium.appendChild(coral2);
            
            const coral3 = document.createElement('div');
            coral3.className = 'aquarium-accessory coral coral-3 coral-small';
            coral3.style.display = 'block';
            aquarium.appendChild(coral3);
            
            const stone1 = document.createElement('div');
            stone1.className = 'aquarium-accessory stone stone-small';
            stone1.style.display = 'block';
            aquarium.appendChild(stone1);
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
