const imageToBase64 = require("image-to-base64");
const image2colors = require("image2colors");
const rgbHex = require("rgb-hex");

const getImagePalettes = async (imageUrl) => {
  const imageBase64 = await imageToBase64(imageUrl);
  // console.log(imageBase64)
  const stuff = image2colors(
    {
      image: `data:image/jpg;base64, ${imageBase64}`,
      colors: 5,
      sample: 1024,
      scaleSvg: false,
    },
    (err, colors) => {
      if (err) {
        console.log(err.message);
      }
      const palettes = colors.map((color) => {
        return rgbHex(...color.color._rgb);
      });
      console.log(palettes);
      return palettes;
    }
  );
  console.log(typeof stuff);
  return stuff;
};
//  const palettes = await getImagePalettes("https://cdn-images-1.listennotes.com/podcasts/deeper-sounds-of-nairobi-jack-rooster-PepXcbdoW5B-dBPJogxAuL9.1400x1400.jpg")
//  console.log('palettes', palettes)

const getFrequency = (episodes) => {
  // daily, weekly, biweekly, monthly
  let frequency = [];
  episodes.forEach((ep, i) => {
    if (i > 0) {
      let day = new Date(ep.datePublished).setHours(0, 0, 0, 0);
      let prevDay = new Date(episodes[i - 1].datePublished).setHours(
        0,
        0,
        0,
        0
      );

      let difference = (prevDay - day) / (1000 * 3600 * 24);
      let indx = frequency.findIndex((entry) => entry.frequency == difference);
      if (indx < 0) frequency.push({ frequency: difference, count: 1 });
      else
        frequency[indx] = {
          ...frequency[indx],
          count: frequency[indx].count + 1,
        };
    }
  });
  frequency = frequency.sort((a, b) => b.count - a.count);

  const pick = frequency[0].frequency;

  return pick;
};

const getReleaseDay = (episodes) => {
  let days = [];
  episodes.forEach((episode) => {
    const date = new Date(episode.datePublished);
    const indx = days.findIndex((entry) => entry.day == date.getDay());
    if (indx < 0) days.push({ day: date.getDay(), count: 1 });
    else days[indx] = { ...days[indx], count: days[indx].count + 1 };
  });

  days = days.sort((a, b) => b.count - a.count);
  let freq = getFrequency(episodes);
  // if (freq % 7 == 0) {
  //   console.log(days[0]);
  //   return days[0].day;
  // } else {
  //   console.log(days);
  //   const ave = days.reduce((acc, prev) => {
  //     return acc + prev.day * prev.count;
  //   }, 0);
  //   console.log(ave / episodes.length);
  //   console.log(
  //     `released every ${freq} day${freq > 1 ? "s" : ""} after ${
  //       days[0].day
  //     } day${days[0].day > 1 ? "s" : ""}`
  //   );
  //   return days[0].day;
  // }
  return days[0].day;
};

module.exports = {
  getImagePalettes,
  getFrequency,
  getReleaseDay,
};
