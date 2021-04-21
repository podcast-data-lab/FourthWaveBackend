const mongoose = require("mongoose");

require("./lib/db");
const Podcast = mongoose.model("Podcast");
const Episode = mongoose.model("Episode");

// Loop through the podcast file and register the podcasts to the database

let podData = require("./podcasts.json");


podData.map((pod) => {
  /**
   * Check when the podcast rss feed was last updated
   * If the field is not provided, use the latest episode
   */
  try {
    let lastRssbuild;
    if (!pod.lastUpdate) {
      lastRssbuild = new Date(pod.episodes[0]["datePublished"]);
    } else {
      lastRssbuild = new Date(pod.lastUpdate);
    }
    Podcast.insertMany(
      new Podcast({
        title: pod.title,
        publisher: pod.publisher,
        rssFeed: pod.rssFeed,
        link: pod.link,
        image: pod.image,
        palette: pod.palette || [],
        description: pod.description,
        categories: pod.categories,
        lastRssBuildDate: lastRssbuild,
        slug: pod.slug,
      })
    )
      .then(console.log("saved podcast"))
      .catch((error) => console.log(error.message));
    pod["episodes"].map((ep) => {
      const thisEp = ep;
      let newEp = new Episode({
        title: thisEp.title,
        datePublished: thisEp.datePublished,
        description: thisEp.description,
        duration: thisEp.duration || 0,
        sourceUrl: thisEp.sourceUrl,
        slug: thisEp.slug,
        image: thisEp.image,
        podcast: pod.slug,
        likes: [],
        comments: [],
        people: [],
        locations: [],
      });
      newEp.save((err) => {
        if (err) console.log(err);
        else {
          Podcast.updateOne(
            { title: pod.title },
            {
              $push: {
                episodes: newEp._id,
              },
            }
          ).then(console.log(`episode ${newEp.title} saved.`)).catch((error)=>console.log(error.message))
        }
      });
    });
  } catch (error) {(pod) => {
    console.log(pod);
    console.log("pod updated");
  };
    console.log(error.message);;
  }
  
});
