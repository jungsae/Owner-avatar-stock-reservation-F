export const getImageUrl = (imageUrl) => {
    console.log("imageUrl", imageUrl)
    const fileName = imageUrl.split('/').pop();
    console.log("fileName", fileName)
    const number = fileName.split('-')[0];
    console.log("number", number)
    return `/assets/cakes/${number}.png`;
} 