// Навигация по приложению
const navigation = {
    // История навигации для кнопки "Назад"
    history: [],
    
    // Навигационные ссылки для разных ролей
    navLinks: {
        manager: [
            { id: 'home-page', text: 'Главная' },
            { id: 'materials-page', text: 'Материалы' },
            { id: 'training-page', text: 'Обучение' },
            { id: 'tests-page', text: 'Тесты' },
            { id: 'feedback-page', text: 'Отзывы и чат' },
            { id: 'employees-page', text: 'Сотрудники' },
            { id: 'profile-page', text: 'Личный кабинет' }
        ],
        admin: [
            { id: 'home-page', text: 'Главная' },
            { id: 'subordinates-page', text: 'Подчиненные' },
            { id: 'analytics-page', text: 'Аналитика' },
            { id: 'profile-page', text: 'Личный кабинет' }
        ]
    },
    
    // Создание навигационных ссылок
    createNavLinks(role) {
        const navLinksContainer = document.getElementById('nav-links');
        navLinksContainer.innerHTML = '';
        
        this.navLinks[role].forEach(link => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = link.text;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage(link.id);
            });
            li.appendChild(a);
            navLinksContainer.appendChild(li);
        });
    },
    
    // Показать страницу
    showPage(pageId) {
        // Сохраняем текущую страницу в истории
        const currentPage = document.querySelector('.page.active');
        if (currentPage && currentPage.id !== pageId) {
            this.history.push(currentPage.id);
        }
        
        // Скрываем все страницы
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Показываем выбранную страницу
        document.getElementById(pageId).classList.add('active');
        
        // Загружаем данные для конкретных страниц
        this.loadPageData(pageId);
    },
    
    // Загрузка данных для страницы
    loadPageData(pageId) {
        switch(pageId) {
            case 'subordinates-page':
                this.loadSubordinates();
                break;
            case 'analytics-page':
                this.loadAnalytics();
                break;
            case 'feedback-page':
                feedback.displayFeedbacks();
                feedback.displayChatMessages();
                break;
            case 'tests-page':
                tests.loadTests();
                tests.displayComments('test1');
                tests.displayComments('test2');
                tests.displayComments('test3');
                break;
            case 'profile-page':
                profile.loadProfileData();
                break;
            case 'employees-page':
                this.loadEmployees();
                break;
            case 'materials-page':
                materials.loadMaterials();
                break;
            case 'training-page':
                games.loadGames();
                break;
        }
    },
    
    // Назад по истории
    goBack() {
        if (this.history.length > 0) {
            const previousPage = this.history.pop();
            this.showPage(previousPage);
        } else {
            this.showPage('home-page');
        }
    },
    
    // Загрузка сотрудников
    loadEmployees() {
        const employeesContainer = document.getElementById('employees-container');
        if (!employeesContainer) return;
        
        const employees = [
            { name: 'Иванов Иван', position: 'Менеджер по продажам', gender: 'men', id: 32 },
            { name: 'Петрова Мария', position: 'Старший менеджер', gender: 'women', id: 44 },
            { name: 'Сидоров Алексей', position: 'Менеджер по ключевым клиентам', gender: 'men', id: 67 },
            { name: 'Козлова Анна', position: 'Менеджер по продажам', gender: 'women', id: 68 },
            { name: 'Федоров Дмитрий', position: 'Руководитель отдела продаж', gender: 'men', id: 75 }
        ];
        
        employeesContainer.innerHTML = employees.map(employee => `
            <div class="employee-card">
                <img src="https://randomuser.me/api/portraits/${employee.gender}/${employee.id}.jpg" alt="${employee.name}" class="employee-photo">
                <h3>${employee.name}</h3>
                <p>${employee.position}</p>
            </div>
        `).join('');
    },
    
    // Загрузка подчиненных
    loadSubordinates() {
        const subordinatesList = document.getElementById('subordinates-list');
        if (!subordinatesList) return;
        
        subordinatesList.innerHTML = '';
        
        // Создаем карточки для всех менеджеров (кроме администратора)
        Object.keys(auth.users).forEach(username => {
            if (auth.users[username].role === 'manager') {
                const user = auth.users[username];
                const card = document.createElement('div');
                card.className = 'employee-card';
                card.innerHTML = `
                    <img src="https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${utils.randomInt(1, 99)}.jpg" alt="${user.name}" class="employee-photo">
                    <h3>${user.name}</h3>
                    <p>Логин: ${username}</p>
                    <p>Статус: ${Math.random() > 0.5 ? 'Активен' : 'В отпуске'}</p>
                    <p>Прогресс обучения: ${utils.randomInt(0, 100)}%</p>
                    <button onclick="navigation.editSubordinate('${username}')">Редактировать</button>
                `;
                subordinatesList.appendChild(card);
            }
        });
    },
    
    // Редактирование подчиненного
    editSubordinate(username) {
        utils.showNotification(`Редактирование данных сотрудника ${username}`);
    },
    
    // Загрузка аналитики
    loadAnalytics() {
        const analyticsList = document.getElementById('analytics-list');
        if (!analyticsList) return;
        
        analyticsList.innerHTML = '';
        
        // Создаем карточки аналитики для всех менеджеров
        Object.keys(auth.users).forEach(username => {
            if (auth.users[username].role === 'manager') {
                const user = auth.users[username];
                const progress = utils.randomInt(0, 100);
                const testsCompleted = utils.randomInt(0, 10);
                const avgScore = (Math.random() * 4 + 1).toFixed(1);
                
                const card = document.createElement('div');
                card.className = 'analytics-card';
                card.innerHTML = `
                    <h3>${user.name}</h3>
                    <p>Прогресс обучения: ${progress}%</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progress}%"></div>
                    </div>
                    <p>Пройдено тестов: ${testsCompleted}</p>
                    <p>Средний балл: ${avgScore}</p>
                    <p>Последняя активность: ${new Date(Date.now() - Math.random() * 86400000).toLocaleDateString()}</p>
                `;
                analyticsList.appendChild(card);
            }
        });
        
        // Загружаем все комментарии
        tests.loadAllComments();
    }
};
