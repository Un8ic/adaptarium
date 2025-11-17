// Firebase configuration
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Firebase service
const firebaseService = {
    // Сохранить сообщение чата
    async saveChatMessage(message) {
        try {
            await db.collection('chatMessages').add({
                ...message,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error saving message:', error);
            return false;
        }
    },

    // Получить сообщения чата
    async getChatMessages(callback) {
        return db.collection('chatMessages')
            .orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                const messages = [];
                snapshot.forEach(doc => {
                    messages.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(messages);
            });
    },

    // Сохранить отзыв
    async saveFeedback(feedback) {
        try {
            await db.collection('feedbacks').add({
                ...feedback,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error saving feedback:', error);
            return false;
        }
    },

    // Получить отзывы
    async getFeedbacks(callback) {
        return db.collection('feedbacks')
            .orderBy('timestamp', 'desc')
            .onSnapshot(snapshot => {
                const feedbacks = [];
                snapshot.forEach(doc => {
                    feedbacks.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(feedbacks);
            });
    },

    // Сохранить комментарий к тесту
    async saveTestComment(testId, comment) {
        try {
            await db.collection('testComments').doc(testId).collection('comments').add({
                ...comment,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error saving test comment:', error);
            return false;
        }
    },

    // Получить комментарии к тесту
    async getTestComments(testId, callback) {
        return db.collection('testComments').doc(testId).collection('comments')
            .orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                const comments = [];
                snapshot.forEach(doc => {
                    comments.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                callback(comments);
            });
    },

    // Получить все комментарии (для админа)
    async getAllTestComments(callback) {
        // Этот метод более сложный, требует получения всех тестов и их комментариев
        // Пока оставлю как есть, можно реализовать позже
    }
};