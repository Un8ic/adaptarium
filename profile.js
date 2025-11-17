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
        if (!aquarium) return;
        
        const totalProgress = this.progress ? this.progress.total : 0;
        
        // URL рыбок
        const fishUrls = [
            'https://i.pinimg.com/736x/cc/53/9f/cc539f142390baa3b7ab5c53eb646ae1.jpg', // Яркая тропическая рыбка
            'https://png.pngtree.com/png-vector/20190120/ourlarge/pngtree-goldfish-fish-fish-aquatic-creature-png-image_484747.jpg', // Золотая рыбка
            'https://i.pinimg.com/736x/29/c8/4a/29c84a44678bba9105245b4709811f18.jpg', // Синяя рыбка
            'https://i.pinimg.com/736x/cc/53/9f/cc539f142390baa3b7ab5c53eb646ae1.jpg', // Дублируем для 4-й рыбки
            'https://png.pngtree.com/png-vector/20190120/ourlarge/pngtree-goldfish-fish-fish-aquatic-creature-png-image_484747.jpg'  // Дублируем для 5-й рыбки
        ];
        
        // Количество рыбок зависит от общего прогресса
        let fishCount = 0;
        if (totalProgress >= 15) fishCount = 1;
        if (totalProgress >= 30) fishCount = 2;
        if (totalProgress >= 50) fishCount = 3;
        if (totalProgress >= 75) fishCount = 4;
        if (totalProgress >= 90) fishCount = 5;
        
        for (let i = 0; i < fishCount; i++) {
            const fish = document.createElement('img');
            fish.className = `fish-aquarium fish-${i + 1} aquarium-image`;
            fish.src = fishUrls[i];
            fish.alt = `Рыбка ${i + 1}`;
            fish.style.filter = 'drop-shadow(2px 2px 4px rgba(0,0,0,0.4))'; // Убираем белый фон
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
        
        // Кораллы появляются с прогрессом материалов
        if (materialsProgress >= 20) {
            const coral1 = document.createElement('img');
            coral1.className = 'aquarium-image coral-small';
            coral1.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4MCH0nV6TQM66xqeTGjKBwoIHzI9nOKlJeg12dhDvyo4EEY-s9XJiJWyXmynyfr6Fjhg&usqp=CAU';
            coral1.alt = 'Маленький коралл';
            coral1.style.filter = 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))';
            aquarium.appendChild(coral1);
        }
        
        if (materialsProgress >= 50) {
            const coral2 = document.createElement('img');
            coral2.className = 'aquarium-image coral-medium';
            coral2.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_fqbuzRSolCfZWShog2IbbC9_QOGxtxjelw&s';
            coral2.alt = 'Средний коралл';
            coral2.style.filter = 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))';
            aquarium.appendChild(coral2);
        }
        
        if (materialsProgress >= 80) {
            const coral3 = document.createElement('img');
            coral3.className = 'aquarium-image coral-large';
            coral3.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRat7legecn2cX_dTLmr5vzGhIV6Tud-9HHZA&s';
            coral3.alt = 'Большой коралл';
            coral3.style.filter = 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))';
            aquarium.appendChild(coral3);
        }
        
        // Камни появляются с прогрессом тестов
        if (testsProgress >= 20) {
            const stone1 = document.createElement('img');
            stone1.className = 'aquarium-image stone-small';
            stone1.src = 'https://img.freepik.com/premium-vector/seaweed-with-stone-vector_74440-1451.jpg';
            stone1.alt = 'Маленький камень';
            stone1.style.filter = 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))';
            aquarium.appendChild(stone1);
        }
        
        if (testsProgress >= 50) {
            const stone2 = document.createElement('img');
            stone2.className = 'aquarium-image stone-medium';
            stone2.src = 'https://thumbs.dreamstime.com/b/%D0%BA%D0%B0%D0%BC%D0%BD%D0%B8-%D1%81-%D0%B3%D1%83%D0%B1%D0%BA%D0%B0%D0%BC%D0%B8-%D0%B8-%D1%87%D0%B0%D1%81%D1%82%D1%8C%D1%8E-%D0%B2%D0%B5%D1%82%D1%80%D0%B5%D0%BD%D0%B8%D1%86-%D0%BC%D0%BE%D1%80%D1%81%D0%BA%D0%BE%D0%B3%D0%BE-%D0%B4%D0%BD%D0%B0-%D0%B4%D0%BB%D1%8F-%D1%83%D0%BA%D1%80%D0%B0%D1%88%D0%B5%D0%BD%D0%B8%D1%8F-%D0%B0%D0%BA%D0%B2%D0%B0%D1%80%D0%B8%D1%83%D0%BC%D0%B0-190805691.jpg';
            stone2.alt = 'Средний камень';
            stone2.style.filter = 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))';
            aquarium.appendChild(stone2);
        }
        
        if (testsProgress >= 80) {
            const stone3 = document.createElement('img');
            stone3.className = 'aquarium-image stone-large';
            stone3.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIJb7YLJtDJq8pL0Cl-_cmOTv-mOmIsKXvkNUXd-NNOs3oxD8zRAuJdALLjSM2lJmYe2Y&usqp=CAU';
            stone3.alt = 'Большой камень';
            stone3.style.filter = 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))';
            aquarium.appendChild(stone3);
        }
        
        // Сундуки с сокровищами появляются с прогрессом обучения
        if (trainingProgress >= 25) {
            const treasure1 = document.createElement('img');
            treasure1.className = 'aquarium-image treasure-small';
            treasure1.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2vH0phw7FoMOr0N6kK9SZO8gUVBUBb8LxtIy-H7bzUxAnG8AKfgw37e3xH4Q0T_YrkmA&usqp=CAU';
            treasure1.alt = 'Маленький сундук';
            treasure1.style.filter = 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))';
            aquarium.appendChild(treasure1);
        }
        
        if (trainingProgress >= 50) {
            const treasure2 = document.createElement('img');
            treasure2.className = 'aquarium-image treasure-medium';
            treasure2.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSSTcRQ_mWnINvwXHYwXBaOp2snYXQ24IIeQ&s';
            treasure2.alt = 'Средний сундук';
            treasure2.style.filter = 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))';
            aquarium.appendChild(treasure2);
        }
        
        if (trainingProgress >= 75) {
            const treasure3 = document.createElement('img');
            treasure3.className = 'aquarium-image treasure-large';
            treasure3.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfj9dldCipuAPoSBFsGOSf-VpTH5SCS8Sh6Q&s';
            treasure3.alt = 'Большой сундук';
            treasure3.style.filter = 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3)) brightness(1.1)';
            aquarium.appendChild(treasure3);
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
