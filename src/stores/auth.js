import { defineStore } from 'pinia';
import axios from 'axios';
import router from '@/router';
import { decodeToken } from '@/plugins/jwt';

const BASEURL = import.meta.env.VITE_API_BASE_URL;

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
    }),
    actions: {
        async login(credentials) {
            const response = await axios.post(`${BASEURL}/stores/login`, credentials);
            this.token = response.data.token;
            localStorage.setItem('token', this.token);

            this.setUserFromToken();

            router.push('/');

            return this.user;
        },
        logout() {
            this.user = null;
            this.token = null;

            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        },
        restoreSession() {
            const token = localStorage.getItem('token');
            if (token) {
                this.token = token;
                if (this.isTokenValid()) {
                    this.setUserFromToken();
                    this.setLogoutTimer(); // 타이머 설정
                } else {
                    this.logout();
                }
            } else {
                this.logout();
            }
        },
        setLogoutTimer() {
            const decoded = decodeToken(this.token);
            const now = Math.floor(Date.now() / 1000);
            const expiresIn = decoded.exp - now;

            if (expiresIn > 0) {
                setTimeout(() => {
                    this.logout();
                    localStorage.setItem('logoutMessage', '로그인 시간이 만료되었습니다.');
                    router.push('/');
                }, expiresIn * 1000);
            }
        },
        setUserFromToken() {
            const decoded = decodeToken(this.token);
            if (decoded) {
                this.user = {
                    username: decoded.username,
                    role: decoded.role,
                    store_id: decoded.store_id,
                };
            } else {
                this.logout();
            }
        },
        isTokenValid() {
            if (!this.token) return false;
            try {
                const decoded = decodeToken(this.token);
                const now = Math.floor(Date.now() / 1000);
                return decoded?.exp > now;
            } catch (error) {
                console.error('토큰 검증 중 오류 발생:', error);
                return false;
            }
        },
    },
});
