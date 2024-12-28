export const getImageUrl = (imageUrl) => {
    console.log(imageUrl)
    const fileName = imageUrl.split('/').pop();
    const number = fileName.split('-')[0];
    console.log(number)
    return new URL(`../assets/cakes/${number}.png`, import.meta.url).href;
} 