export function decodeToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // JWT 페이로드 파싱
        return payload;
    } catch (error) {
        console.error('Invalid token', error);
        return null;
    }
}
