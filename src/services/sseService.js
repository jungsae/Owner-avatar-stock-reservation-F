import { useNotificationStore } from '../stores/notification';

export const initSSEConnection = () => {
    const notificationStore = useNotificationStore();
    const token = localStorage.getItem('token');

    if (!token) return;

    const eventSource = new EventSource(
        `${import.meta.env.VITE_API_BASE_URL}/notifications/sse?token=${token}`,
        { withCredentials: true }
    );

    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            // 연결 성공 메시지는 무시
            if (data.connection == 'success') {
                return;
            }

            // 실제 알림 처리
            if (data.type === 'STOCK_EMPTY') {
                notificationStore.addNotification({
                    message: `${data.message}`,
                    type: 'stock',
                    cakeId: data.cake_id
                });
            }
        } catch (error) {
            console.error('SSE 메시지 처리 오류:', error);
        }
    };

    eventSource.onerror = (error) => {
        console.error('SSE 연결 에러:', error);

        // 재연결 로직 추가
        setTimeout(() => {
            console.log('SSE 재연결 시도...');
            eventSource.close();
            initSSEConnection();
        }, 5000); // 5초 후 재시도
    };

    // 페이지 언로드 시 연결 정리
    window.addEventListener('beforeunload', () => {
        eventSource.close();
    });

    return eventSource;
};