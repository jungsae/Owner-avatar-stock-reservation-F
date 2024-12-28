export const getImageUrl = (imageUrl) => {
    // 이미 전체 URL인 경우 (Vercel)
    if (imageUrl?.startsWith('http')) {
        return imageUrl;
    }

    // 이미지 번호 추출
    const imageNumber = imageUrl?.split('/').pop().split('-')[0] || imageUrl;

    // 로컬 환경용 URL 생성
    return new URL(`../assets/cakes/${imageNumber}.png`, import.meta.url).href;
} 