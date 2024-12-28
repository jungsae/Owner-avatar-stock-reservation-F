export const getImageUrl = (imageUrl) => {
    console.log(imageUrl)
    return new URL(`../assets/cakes/${imageUrl}.png`, import.meta.url).href;
} 