
const imageToBase64 = require('image-to-base64');
const image2colors = require("image2colors")
const rgbHex = require('rgb-hex');

 const getImagePalettes = async (imageUrl) =>{
        const imageBase64 = await imageToBase64(imageUrl) 
      // console.log(imageBase64)
      const stuff =  image2colors({
        image: `data:image/jpg;base64, ${imageBase64}`,
        colors: 5,
        sample: 1024,
        scaleSvg: false
      }, (err, colors) => {
        if(err){
          console.log(err.message)
        }
        const palettes =  colors.map((color)=>{
            return rgbHex(...color.color._rgb);
        })
        console.log(palettes)
        return palettes
      })
      console.log( typeof stuff)
      return stuff
    }
(async()=>{
 const palettes = await getImagePalettes("https://cdn-images-1.listennotes.com/podcasts/deeper-sounds-of-nairobi-jack-rooster-PepXcbdoW5B-dBPJogxAuL9.1400x1400.jpg")
 console.log('palettes', palettes)

})()

module.exports = {
    getImagePalettes
}