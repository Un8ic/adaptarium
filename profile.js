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
        
        // Показываем кнопки управления
        this.showAdminControls();
    },
    
    // Показ контролов управления
    showAdminControls() {
        const aquariumSection = document.querySelector('.aquarium-section');
        if (!aquariumSection) return;
        
        // Удаляем старые админские кнопки если есть
        const oldAdminPanel = document.getElementById('admin-controls-panel');
        if (oldAdminPanel) {
            oldAdminPanel.remove();
        }
        
        // Если пользователь - администратор, показываем только кнопку сброса всех пользователей
        if (auth.currentUser && auth.currentUser.role === 'admin') {
            const adminPanel = document.createElement('div');
            adminPanel.id = 'admin-controls-panel';
            adminPanel.className = 'admin-controls';
            
            // Для adminFish показываем только кнопку сброса всех пользователей
            let adminButtonsHTML = '';
            if (auth.currentUser.username === 'adminFish') {
                adminButtonsHTML = `
                    <button onclick="profile.resetAllUsersProgress()" class="btn-danger">Сбросить прогресс всех пользователей</button>
                `;
            } else {
                // Для других админов показываем все кнопки
                adminButtonsHTML = `
                    <button onclick="profile.resetOwnProgress()" class="btn-secondary">Сбросить мой прогресс</button>
                    <button onclick="profile.resetAllUsersProgress()" class="btn-danger">Сбросить прогресс всех пользователей</button>
                `;
            }
            
            adminPanel.innerHTML = `
                <h3>Панель администратора</h3>
                <div class="admin-buttons">
                    ${adminButtonsHTML}
                </div>
                <div id="admin-message" class="admin-message"></div>
            `;
            aquariumSection.appendChild(adminPanel);
        } else if (auth.currentUser && auth.currentUser.role === 'manager') {
            // Для менеджеров показываем только кнопку сброса своего прогресса
            const managerPanel = document.createElement('div');
            managerPanel.id = 'admin-controls-panel';
            managerPanel.className = 'admin-controls';
            managerPanel.innerHTML = `
                <h3>Управление прогрессом</h3>
                <div class="admin-buttons">
                    <button onclick="profile.resetOwnProgress()" class="btn-secondary">Сбросить мой прогресс</button>
                </div>
                <div id="admin-message" class="admin-message"></div>
            `;
            aquariumSection.appendChild(managerPanel);
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
    
    // Получение прогресса всех пользователей (для страницы аналитики)
    getAllUsersProgress() {
        let progressInfo = '<div class="users-progress-list">';
        
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
        return progressInfo;
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
        
        // Добавляем дно аквариума
        const bottom = document.createElement('div');
        bottom.className = 'aquarium-bottom';
        aquarium.appendChild(bottom);
        
        // Добавляем элементы в зависимости от прогресса
        this.addFishBasedOnProgress();
        this.addBottomCreatures();
        this.addHousesBasedOnTests();
        this.addAccessoriesBasedOnTraining();
        this.addCoralsAndStonesBasedOnMaterials();
        
        // Добавляем пузырьки
        this.addBubbles();
    },
    
    // Добавление рыбок и русалок на основе общего прогресса
    addFishBasedOnProgress() {
        const aquarium = document.getElementById('aquarium');
        if (!aquarium) return;
        
        const totalProgress = this.progress ? this.progress.total : 0;
        
        // Рыбки в зависимости от общего прогресса
        const fishEmojis = ['🐟', '🐠', '🐡', '🪼'];
        
        // Количество рыбок зависит от общего прогресса
        let fishCount = 0;
        if (totalProgress >= 15) fishCount = 1;
        if (totalProgress >= 30) fishCount = 2;
        if (totalProgress >= 50) fishCount = 3;
        if (totalProgress >= 75) fishCount = 4;
        
        for (let i = 0; i < fishCount; i++) {
            const fish = document.createElement('div');
            fish.className = `aquarium-sticker fish-sticker fish-${i + 1}`;
            fish.textContent = fishEmojis[i] || fishEmojis[fishEmojis.length - 1];
            fish.style.transform = 'rotateY(0deg)'; // Все рыбки смотрят вперед
            aquarium.appendChild(fish);
        }
        
        // Русалки при наивысшем уровне
        if (totalProgress >= 90) {
            const mermaid1 = document.createElement('div');
            mermaid1.className = 'aquarium-sticker mermaid mermaid-1';
            mermaid1.textContent = '🧜‍♀️';
            aquarium.appendChild(mermaid1);
            
            const mermaid2 = document.createElement('div');
            mermaid2.className = 'aquarium-sticker mermaid mermaid-2';
            mermaid2.textContent = '🧜‍♂️';
            aquarium.appendChild(mermaid2);
        }
    },
    
    // Добавление обитателей дна
    addBottomCreatures() {
        const aquarium = document.getElementById('aquarium');
        if (!aquarium) return;
        
        const totalProgress = this.progress ? this.progress.total : 0;
        
        // Краб и осьминог появляются при среднем прогрессе
        if (totalProgress >= 40) {
            const crab = document.createElement('div');
            crab.className = 'aquarium-sticker bottom-creature crab';
            crab.textContent = '🦀';
            aquarium.appendChild(crab);
        }
        
        if (totalProgress >= 60) {
            const octopus = document.createElement('div');
            octopus.className = 'aquarium-sticker bottom-creature octopus';
            octopus.textContent = '🐙';
            aquarium.appendChild(octopus);
        }
    },
    
    // Добавление домиков на основе тестов
    addHousesBasedOnTests() {
        const aquarium = document.getElementById('aquarium');
        if (!aquarium || !this.progress) return;
        
        const testsProgress = this.progress.tests;
        
        if (testsProgress >= 20) {
            const tent = document.createElement('div');
            tent.className = 'aquarium-sticker house-sticker house-tent';
            tent.textContent = '⛺';
            aquarium.appendChild(tent);
        }
        
        if (testsProgress >= 50) {
            const home = document.createElement('div');
            home.className = 'aquarium-sticker house-sticker house-home';
            home.textContent = '🏠';
            aquarium.appendChild(home);
        }
        
        if (testsProgress >= 80) {
            const palace = document.createElement('div');
            palace.className = 'aquarium-sticker house-sticker house-palace';
            palace.textContent = '🏛️';
            aquarium.appendChild(palace);
        }
    },
    
    // Добавление аксессуаров на основе обучения
    addAccessoriesBasedOnTraining() {
        const aquarium = document.getElementById('aquarium');
        if (!aquarium || !this.progress) return;
        
        const trainingProgress = this.progress.training;
        
        // Большой аксессуар
        if (trainingProgress >= 80) {
            const ferrisWheel = document.createElement('div');
            ferrisWheel.className = 'aquarium-sticker accessory-sticker accessory-large ferris-wheel';
            ferrisWheel.textContent = '🎡';
            aquarium.appendChild(ferrisWheel);
        }
        
        // Средние аксессуары
        if (trainingProgress >= 50) {
            const vase1 = document.createElement('div');
            vase1.className = 'aquarium-sticker accessory-sticker accessory-medium vase-1';
            vase1.textContent = '🏺';
            aquarium.appendChild(vase1);
            
            const anchor = document.createElement('div');
            anchor.className = 'aquarium-sticker accessory-sticker accessory-medium anchor';
            anchor.textContent = '⚓';
            aquarium.appendChild(anchor);
        }
        
        // Маленькие аксессуары
        if (trainingProgress >= 20) {
            const moai = document.createElement('div');
            moai.className = 'aquarium-sticker accessory-sticker accessory-small moai';
            moai.textContent = '🗿';
            aquarium.appendChild(moai);
        }
    },
    
    // Добавление кораллов и камней на основе материалов
    addCoralsAndStonesBasedOnMaterials() {
        const aquarium = document.getElementById('aquarium');
        if (!aquarium || !this.progress) return;
        
        const materialsProgress = this.progress.materials;
        
        // Приоритет кораллам
        if (materialsProgress >= 15) {
            const coral1 = document.createElement('div');
            coral1.className = 'aquarium-sticker coral-sticker coral-1';
            coral1.textContent = '🪸';
            aquarium.appendChild(coral1);
        }
        
        if (materialsProgress >= 30) {
            const coral2 = document.createElement('div');
            coral2.className = 'aquarium-sticker coral-sticker coral-2';
            coral2.textContent = '🪸';
            aquarium.appendChild(coral2);
        }
        
        if (materialsProgress >= 45) {
            const coral3 = document.createElement('div');
            coral3.className = 'aquarium-sticker coral-sticker coral-3';
            coral3.textContent = '🪸';
            aquarium.appendChild(coral3);
        }
        
        if (materialsProgress >= 60) {
            const coral4 = document.createElement('div');
            coral4.className = 'aquarium-sticker coral-sticker coral-4';
            coral4.textContent = '🪸';
            aquarium.appendChild(coral4);
        }
        
        // Камни добавляются после кораллов
        if (materialsProgress >= 25) {
            const stone1 = document.createElement('div');
            stone1.className = 'aquarium-sticker stone-sticker stone-1';
            stone1.textContent = '🪨';
            aquarium.appendChild(stone1);
        }
        
        if (materialsProgress >= 40) {
            const stone2 = document.createElement('div');
            stone2.className = 'aquarium-sticker stone-sticker stone-2';
            stone2.textContent = '🪨';
            aquarium.appendChild(stone2);
        }
        
        if (materialsProgress >= 55) {
            const stone3 = document.createElement('div');
            stone3.className = 'aquarium-sticker stone-sticker stone-3';
            stone3.textContent = '🪨';
            aquarium.appendChild(stone3);
        }
        
        if (materialsProgress >= 70) {
            const stone4 = document.createElement('div');
            stone4.className = 'aquarium-sticker stone-sticker stone-4';
            stone4.textContent = '🪨';
            aquarium.appendChild(stone4);
        }
    },
    
    // Добавление пузырьков
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
