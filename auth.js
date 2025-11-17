// Аутентификация пользователей
const auth = {
    // Данные пользователей
    users: {
        'adminFish': {
            password: 'adminFish',
            name: 'Администратор',
            role: 'admin'
        },
        'Ivanova': {
            password: 'Ivanova',
            name: 'Иванова Мария',
            role: 'manager'
        },
        'TopProdaj': {
            password: 'TopProdaj',
            name: 'Петров Алексей',
            role: 'manager'
        },
        '1234': {
            password: '1234',
            name: 'Сидорова Ольга',
            role: 'manager'
        },
        'OtdelProdaj': {
            password: 'OtdelProdaj',
            name: 'Козлов Дмитрий',
            role: 'manager'
        },
        'Leto': {
            password: 'Leto',
            name: 'Николаева Анна',
            role: 'manager'
        },
        'Petrov': {
            password: 'Petrov',
            name: 'Петров Иван',
            role: 'manager'
        },
        'RAB': {
            password: 'RAB',
            name: 'Смирнова Елена',
            role: 'manager'
        },
        'PIRS': {
            password: 'PIRS',
            name: 'Васильев Максим',
            role: 'manager'
        },
        'NSUEM': {
            password: 'NSUEM',
            name: 'Фролов Сергей',
            role: 'manager'
        },
        'BusinessTUT': {
            password: 'BusinessTUT',
            name: 'Морозова Татьяна',
            role: 'manager'
        }
    },
    
    // Текущий пользователь
    currentUser: null,
    
    // Вход в систему
    login(username, password) {
        if (this.users[username] && this.users[username].password === password) {
            this.currentUser = {
                username: username,
                name: this.users[username].name,
                role: this.users[username].role
            };
            
            // Сохраняем данные пользователя в localStorage
            utils.saveToStorage('currentUser', this.currentUser);
            
            // Инициализируем хранилище прогресса для пользователя
            this.initializeUserProgress();
            
            // Показываем навигацию и информацию о пользователе
            document.getElementById('main-nav').style.display = 'block';
            document.getElementById('user-info').style.display = 'block';
            document.getElementById('user-name').textContent = this.currentUser.name;
            
            // Создаем навигационные ссылки
            navigation.createNavLinks(this.currentUser.role);
            
            // Переходим на главную страницу
            navigation.showPage('home-page');
            
            // Скрываем страницу входа
            document.getElementById('login-page').classList.remove('active');
            
            utils.showNotification('Добро пожаловать, ' + this.currentUser.name + '!');
            
            return true;
        } else {
            utils.showNotification('Неверный логин или пароль', true);
            return false;
        }
    },
    
    // Инициализация прогресса пользователя
    initializeUserProgress() {
        if (!this.currentUser) return;
        
        const userProgressKey = `userProgress_${this.currentUser.username}`;
        let userProgress = utils.loadFromStorage(userProgressKey);
        
        if (!userProgress) {
            // Создаем новую структуру прогресса для пользователя
            userProgress = {
                materials: {},
                games: {},
                tests: {},
                profile: {},
                lastUpdated: new Date().toISOString()
            };
            
            // Для adminFish специально устанавливаем пустой прогресс
            if (this.currentUser.username === 'adminFish') {
                userProgress.materials = {};
                userProgress.games = {};
                userProgress.tests = {};
            }
            
            utils.saveToStorage(userProgressKey, userProgress);
        }
    },
    
    // Получение прогресса текущего пользователя
    getUserProgress() {
        if (!this.currentUser) return null;
        const userProgressKey = `userProgress_${this.currentUser.username}`;
        return utils.loadFromStorage(userProgressKey) || {
            materials: {},
            games: {},
            tests: {},
            profile: {},
            lastUpdated: new Date().toISOString()
        };
    },
    
    // Сохранение прогресса текущего пользователя
    saveUserProgress(progress) {
        if (!this.currentUser) return false;
        
        // Для adminFish не сохраняем прогресс обучения
        if (this.currentUser.username === 'adminFish') {
            progress.materials = {};
            progress.games = {};
            progress.tests = {};
        }
        
        progress.lastUpdated = new Date().toISOString();
        const userProgressKey = `userProgress_${this.currentUser.username}`;
        return utils.saveToStorage(userProgressKey, progress);
    },
    
    // Выход из системы
    logout() {
        // Очищаем поля логина и пароля
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        
        // Скрываем навигацию и информацию о пользователе
        document.getElementById('main-nav').style.display = 'none';
        document.getElementById('user-info').style.display = 'none';
        
        // Показываем страницу входа
        document.getElementById('login-page').classList.add('active');
        
        // Скрываем все другие страницы
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            if (page.id !== 'login-page') {
                page.classList.remove('active');
            }
        });
        
        utils.showNotification('Вы вышли из системы');
    },
    
    // Проверка авторизации при загрузке
    checkAuth() {
        const savedUser = utils.loadFromStorage('currentUser');
        if (savedUser) {
            this.currentUser = savedUser;
            
            // Инициализируем хранилище прогресса для пользователя
            this.initializeUserProgress();
            
            // Показываем навигацию и информацию о пользователе
            document.getElementById('main-nav').style.display = 'block';
            document.getElementById('user-info').style.display = 'block';
            document.getElementById('user-name').textContent = this.currentUser.name;
            
            // Создаем навигационные ссылки
            navigation.createNavLinks(this.currentUser.role);
            
            // Переходим на главную страницу
            navigation.showPage('home-page');
            
            // Скрываем страницу входа
            document.getElementById('login-page').classList.remove('active');
            
            return true;
        }
        return false;
    }
};
