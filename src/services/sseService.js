import { useNotificationStore } from '../stores/notification';

export const initSSEConnection = () => {
    const notificationStore = useNotificationStore();
    const token = localStorage.getItem('token');

    if (!token) return;

    const eventSource = new EventSource(`${import.meta.env.VITE_API_BASE_URL}/notifications/sse?token=${token}`);

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // 연결 성공 메시지는 무시
        if (data.connection === 'success') {
            return;
        }

        // 실제 알림만 처리
        notificationStore.addNotification({
            message: `${data.cakeName}의 재고가 없습니다.`,
            type: 'stock',
            cakeId: data.cakeId
        });
    };

    eventSource.onerror = (error) => {
        console.error('SSE 연결 에러:', error);
        eventSource.close();
    };

    return eventSource;
}; 