const albumPictures = Object.values(import.meta.glob('../tmpPictures/*.{png,jpg,jpeg,svg}', { eager: true }))
  .map((module) => module.default);

export default albumPictures;