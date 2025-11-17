// Работа с материалами для обучения
const materials = {
    // Загрузка материалов
    loadMaterials() {
        const materialsContainer = document.getElementById('materials-container');
        if (!materialsContainer) return;
        
        const materialsData = [
            { id: 'company-intro', title: 'Введение в компанию', description: 'Основные сведения о компании, её миссии и ценностях.' },
            { id: 'products-services', title: 'Продукты и услуги', description: 'Подробное описание продуктов и услуг компании.' },
            { id: 'sales-techniques', title: 'Техники продаж', description: 'Эффективные методики и подходы к продажам.' },
            { id: 'objection-handling', title: 'Работа с возражениями', description: 'Как правильно реагировать на возражения клиентов.' },
            { id: 'negotiation', title: 'Ведение переговоров', description: 'Стратегии успешного ведения переговоров.' },
            { id: 'customer-centric', title: 'Клиентоориентированность', description: 'Принципы качественного обслуживания клиентов.' }
        ];
        
        materialsContainer.innerHTML = materialsData.map(material => {
            const status = this.getMaterialStatus(material.id);
            const statusText = status === 'completed' ? 'Завершено' : 'Не начато';
            const statusClass = status === 'completed' ? 'completed' : 'not-started';
            
            return `
                <div class="material-card">
                    <h3>${material.title}</h3>
                    <p>${material.description}</p>
                    <button onclick="materials.openMaterialPage('${material.id}')">Изучить</button>
                    <span class="${statusClass}" id="${material.id}-status">${statusText}</span>
                </div>
            `;
        }).join('');
    },
    
    // Получение статуса материала для текущего пользователя
    getMaterialStatus(materialId) {
        if (!auth.currentUser) return 'not-started';
        
        const userProgress = auth.getUserProgress();
        return userProgress.materials[materialId] || 'not-started';
    },
    
    // Сохранение статуса материала для текущего пользователя
    setMaterialStatus(materialId, status) {
        if (!auth.currentUser) return false;
        
        const userProgress = auth.getUserProgress();
        userProgress.materials[materialId] = status;
        return auth.saveUserProgress(userProgress);
    },
    
    // Открытие страницы материала
    openMaterialPage(materialId) {
        navigation.history.push('materials-page');
        navigation.showPage(materialId + '-page');
    },
    
    // Завершение изучения материала
    completeMaterial(materialId) {
        // Сохраняем статус для текущего пользователя
        this.setMaterialStatus(materialId, 'completed');
        
        // Обновляем отображение
        document.getElementById(materialId + '-status').textContent = 'Завершено';
        document.getElementById(materialId + '-status').className = 'completed';
        
        utils.showNotification('Материал успешно изучен!');
        navigation.goBack();
    }
};
