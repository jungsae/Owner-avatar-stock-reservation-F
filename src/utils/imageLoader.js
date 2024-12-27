export const getImageUrl = (imageNumber) => {
    return new URL(`../assets/cakes/${imageNumber}.png`, import.meta.url).href
} 