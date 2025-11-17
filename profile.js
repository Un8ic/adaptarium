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
        
        // Прогресс материалов
        const materials = ['company-intro', 'products-services', 'sales-techniques', 
                          'objection-handling', 'negotiation', 'customer-centric'];
        let completedMaterials = 0;
        
        materials.forEach(material => {
            if (materials.getMaterialStatus(material) === 'completed') {
                completedMaterials++;
            }
        });
        
        const materialsProgress = Math.round((completedMaterials / materials.length) * 100);
        document.getElementById('materials-progress').textContent = materialsProgress + '%';
        
        // Прогресс обучения (игр)
        const gamesList = ['quest', 'quiz'];
        let completedGames = 0;
        
        gamesList.forEach(game => {
            if (games.getGameProgress(game)) {
                completedGames++;
            }
        });
        
        const trainingProgress = Math.round((completedGames / gamesList.length) * 100);
        document.getElementById('training-progress').textContent = trainingProgress + '%';
        
        // Прогресс тестов
        const testsList = ['products-test', 'sales-test', 'objections-test'];
        let completedTests = 0;
        
        testsList.forEach(test => {
            if (tests.getTestStatus(test) === 'completed') {
                completedTests++;
            }
        });
        
        const testsProgress = Math.round((completedTests / testsList.length) * 100);
        document.getElementById('tests-progress').textContent = testsProgress + '%';
        
        // Общий прогресс
        const totalProgress = Math.round((materialsProgress + trainingProgress + testsProgress) / 3);
        document.getElementById('total-progress').textContent = totalProgress + '%';
        
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
    
    // Добавление рыбок на основе прогресса
    addFishBasedOnProgress() {
        const aquarium = document.getElementById('aquarium');
        const totalProgress = this.progress.total;
        
        // Количество рыбок зависит от общего прогресса
        let fishCount = 0;
        
        if (totalProgress >= 20) fishCount = 1;  // 1 рыбка при 20%
        if (totalProgress >= 40) fishCount = 2;  // 2 рыбки при 40%
        if (totalProgress >= 60) fishCount = 3;  // 3 рыбки при 60%
        if (totalProgress >= 80) fishCount = 4;  // 4 рыбки при 80%
        if (totalProgress >= 95) fishCount = 5;  // 5 рыбок при 95%+
        
        const fishTypes = ['🐠', '🐟', '🐡', '🦈', '🐠'];
        
        for (let i = 0; i < fishCount; i++) {
            const fish = document.createElement('div');
            fish.className = `fish fish-${i + 1}`;
            fish.textContent = fishTypes[i];
            fish.style.animationDelay = `${i * 2}s`;
            aquarium.appendChild(fish);
        }
    },
    
    // Добавление аксессуаров на основе прогресса
    addAccessoriesBasedOnProgress() {
        const aquarium = document.getElementById('aquarium');
        const materialsProgress = this.progress.materials;
        const trainingProgress = this.progress.training;
        const testsProgress = this.progress.tests;
        
        // Растения появляются при прогрессе материалов
        if (materialsProgress >= 30) {
            const plant1 = document.createElement('div');
            plant1.className = 'aquarium-accessory plant-1';
            plant1.textContent = '🌿';
            aquarium.appendChild(plant1);
        }
        
        if (materialsProgress >= 60) {
            const plant2 = document.createElement('div');
            plant2.className = 'aquarium-accessory plant-2';
            plant2.textContent = '🌱';
            aquarium.appendChild(plant2);
        }
        
        // Камни появляются при прогрессе обучения
        if (trainingProgress >= 30) {
            const stone1 = document.createElement('div');
            stone1.className = 'aquarium-accessory stone-1';
            stone1.textContent = '🪨';
            aquarium.appendChild(stone1);
        }
        
        if (trainingProgress >= 60) {
            const stone2 = document.createElement('div');
            stone2.className = 'aquarium-accessory stone-2';
            stone2.textContent = '⛰️';
            aquarium.appendChild(stone2);
        }
        
        // Сокровище появляется при прогрессе тестов
        if (testsProgress >= 50) {
            const treasure = document.createElement('div');
            treasure.className = 'aquarium-accessory treasure';
            treasure.textContent = '💎';
            aquarium.appendChild(treasure);
        }
    },
    
    // Добавление пузырьков
    addBubbles() {
        const bubblesContainer = document.querySelector('.bubbles');
        if (!bubblesContainer) return;
        
        bubblesContainer.innerHTML = '';
        
        // Создаем несколько пузырьков
        for (let i = 0; i < 15; i++) {
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
