const imageToBase64 = require('image-to-base64');
const image2colors = require("image2colors")
const rgbHex = require('rgb-hex');

const mongoose = require("mongoose");

require("./db");
const Podcast = mongoose.model("Podcast");

Podcast.find().then((podcasts)=>{

    podcasts.slice(29, 50).map(async (podcast, i) => {
      console.log(`${podcast.title} ...`);
      const deets = podcast.image.split(".");
      let mime = deets[deets.length - 1].split("?")[0];
      console.log(mime);
      let imageBase64 = null;
      try {
        imageBase64 = await imageToBase64(podcast.image);
        if (mime === "jpeg") mime = "jpg";
      } catch (error) {
        console.log(error.message);
      }
      if (!!imageToBase64) {
        image2colors(
          {
            image: `data:image/${mime};base64, ${imageBase64}`,
            colors: 5,
            sample: 1024,
            scaleSvg: false,
          },
          async (err, colors) => {
            if (err) {
              console.log(err.message);
            }
            const palettes = colors.map((color) => {
              return rgbHex(...color.color._rgb);
            });
            console.log(`${i + 1}. ${podcast.title} done.`);
            podcast.palettes = palettes;
            await podcast.save();
            console.log(`saved colors for ${podcast.title}`);
            return palettes;
          }
        );
      }
    });
})