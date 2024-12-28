export const getImageUrl = (imageUrl) => {
    const fileName = imageUrl.split('/').pop();
    const number = fileName.split('-')[0];

    return new URL(`../assets/cakes/${number}.png`, import.meta.url).href;
} 