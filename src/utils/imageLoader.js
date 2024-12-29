export const getImageUrl = (imageUrl) => {
    const fileName = imageUrl.split('/').pop();
    const number = fileName.split('-')[0];
    return `/assets/cakes/${number}.png`;
} 