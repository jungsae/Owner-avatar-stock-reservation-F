export const getImageUrl = (imageUrl) => {
    console.log("imageUrl", imageUrl)
    const fileName = imageUrl.split('/').pop();
    const number = fileName.split('-')[0];
    console.log("number", number)
    return `/assets/cakes/${number}.png`;
} 