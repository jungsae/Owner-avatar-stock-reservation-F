import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref([]);
    const unreadCount = ref(0);

    const addNotification = (notification) => {
        notifications.value.unshift({
            ...notification,
            id: Date.now(),
            read: false,
            timestamp: new Date().toISOString()
        });
        unreadCount.value++;
    };

    const markAsRead = (notificationId) => {
        const notification = notifications.value.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            unreadCount.value--;
        }
    };

    const markAllAsRead = () => {
        notifications.value.forEach(notification => {
            if (!notification.read) {
                notification.read = true;
            }
        });
        unreadCount.value = 0;
    };

    const clearNotifications = () => {
        notifications.value = [];
        unreadCount.value = 0;
    };

    return {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
    };
});