// Профиль пользователя
const profile = {
    // Загрузка данных профиля
    loadProfileData() {
        const profileData = utils.loadFromStorage('userProfile') || {};
        const savedPhoto = utils.loadFromStorage('userPhoto');
        
        // Устанавливаем имя пользователя из текущей сессии
        if (auth.currentUser) {
            document.getElementById('profile-name').value = auth.currentUser.name;
        }
        
        if (profileData.position) {
            document.getElementById('profile-position').value = profileData.position;
        } else {
            document.getElementById('profile-position').value = auth.currentUser.role === 'admin' ? 'Руководитель отдела продаж' : 'Менеджер по продажам';
        }
        
        if (savedPhoto) {
            document.getElementById('profile-photo').src = savedPhoto;
        }
    },
    
    // Обновление фото
    updatePhoto() {
        const fileInput = document.getElementById('photo-upload');
        const file = fileInput.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profile-photo').src = e.target.result;
                // Сохраняем фото в localStorage
                utils.saveToStorage('userPhoto', e.target.result);
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
        
        // Сохраняем данные профиля
        const profileData = {
            name: document.getElementById('profile-name').value,
            position: document.getElementById('profile-position').value
        };
        
        utils.saveToStorage('userProfile', profileData);
        
        if (newPassword) {
            // В реальном приложении здесь был бы запрос к серверу для изменения пароля
            utils.showNotification('Профиль и пароль обновлены');
        } else {
            utils.showNotification('Профиль обновлен');
        }
        
        // Очищаем поля паролей
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    }
};