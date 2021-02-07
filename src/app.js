// Require the necessary packages
const express = require("express");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const publicPath = path.resolve(__dirname, "public");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo")(session);
const auth = require("./lib/auth");
const makeSlug = require("slug");

const { Db } = require("mongodb");
const { default: addPod } = require("./addPodcast");
const LocalStrategy = require("passport-local").Strategy;

const app = express();

function redirectIfNotSignedIn(req, res, next) {
  if (!req.user) res.redirect("/signin");
  return next();
}

app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: "very secret 12348",
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);
app.use(auth.initialize);
app.use(auth.session);
app.use(auth.setUser);

app.use(async (req, res, next) => {
  try {
    req.session.visits = req.session.visits ? req.session.visits + 1 : 1;
    return next();
  } catch (error) {
    return next(error);
  }
});
app.use(express.static(path.join(__dirname, "/build")));
require("./lib/db");

const dbFuncs = require("./addPodcast");
const { throws } = require("assert");
const { promises } = require("fs");
const Podcast = mongoose.model("Podcast");
const User = mongoose.model("User");
const Episode = mongoose.model("Episode");
const Comment = mongoose.model("Comment");
const Theme = mongoose.model("Theme");
const Location = mongoose.model("Location");
const Person = mongoose.model("Person");

app.get("/api/loginstatus", (req, res) => {
  if (req.user) {
    res.json({ status: true });
  } else {
    res.json({ status: false });
  }
});

app.post("/api/signup", async (req, res, next) => {
  try {
    const user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });
    const savedUser = await user.save();
    if (savedUser) return res.redirect("/");
    return next(new Error("Failed to save User for unknown reasons"));
  } catch (error) {
    return next(error);
  }
});

app.get("/api/signin", (req, res) => {
  res.json({ ready: true });
});
app.get("/api/signup", (req, res) => {
  res.json({ ready: true });
});
// app.get("/api/oaccount", (req, res, next) => {
//   if (req.user) {
//     console.log(req.user);
//     return next();
//   }
//   return res.redirect("/api/signin");
// });

app.post(
  "/api/signin",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/signin?error=true",
  })
);

app.post("/api/signout", (req, res) => {
  req.logOut();
  return res.redirect("/");
});

/**
 * Get all the podcasts in the database
 */
app.get("/api/allpodcasts", async function (req, res) {
  const podcasts = await Podcast.find({});
  res.json(podcasts);
});

/**
 * Get one podcast with a list of episodes
 */
app.get("/api/podcast/:slug/", async function (req, res) {
  try {
    const slug = req.params.slug;
    const pod = await Podcast.findOne({ slug: encodeURIComponent(slug) });

    /**
     * If the podcast exits
     * TODO: Otherwise, if it does not, return podcasts with similar slugs
     */
    if (pod !== null) {
      /**
       * The parser checks the rss feed of the podcast,
       * gets back the last build date and compares it with the current build date
       * in the database
       */
      console.log(pod);

      let Parser = require("rss-parser");
      let parser = new Parser();
      let updatedPod = await parser.parseURL(pod.rssFeed);

      // The last build date of the podcast
      let rssBuildDate = new Date(updatedPod["lastBuildDate"]);
      // If the rssFeed does not contain a build date, check the latest episode
      if (isNaN(rssBuildDate)) {
        rssBuildDate = new Date(updatedPod.items[0].isoDate);
      }

      /**
       * If the rssBuild date is more recent than the date the podcast was updated
       * Update with the most recent episodes
       */
      if (rssBuildDate > pod.lastRssBuildDate) {
        console.log("need updating");
        /**
         * Filter only the episodes that are more recent than when the podcast was updated
         */
        const newEps = updatedPod.items.filter(
          (epi) => new Date(epi.isoDate) > pod.lastRssBuildDate
        );
        // const newEps = updatedPod.items;

        /**
         * Loop through all the "new" episodes and create new podcasts
         */
        const addEpisodes = Promise.all(
          newEps.map(async (ep) => {
            let newEp = new Episode({
              title: ep["title"],
              datePublished: ep["pubDate"],
              description: ep["content"],
              duration: ep["itunes"]["duration"],
              sourceUrl: ep["enclosure"]["url"],
              slug: `${pod.slug}?episode=${new Date(ep["pubDate"])
                .toISOString()
                .substring(0, 10)}-${makeSlug(ep["title"])}`,
              image: pod.image,
              podcast: pod._id,
              likes: [],
              comments: [],
              people: [],
              locations: [],
            });
            /**
             * For each episode, save it to the database
             */
            newEp.save((err) => {
              if (err) console.log("error saving new ep");
            });
            return newEp;
          })
        );
        /**
         * After saving, the episodes,
         * save the episode Id to the array of podcast ids of the podcat
         */
        addEpisodes.then(async (resultz) => {
          const filling = Promise.all(
            resultz.map(async (i) => {
              pod.episodes.push(mongoose.Types.ObjectId(i._id));
            })
          );
          filling
            .then(() => {
              /**
               * Update when the podcast was updated with the most recent build date of the rss feed
               */
              pod.lastRssBuildDate = rssBuildDate;
            })
            .then(pod.save())
            .then(async () => {
              /**
               * Get the podcast episodes and return to user
               */
              let episodes = await Episode.find({
                _id: {
                  $in: pod.episodes,
                },
              });
              // Sort by date
              episodes = episodes.sort(function (a, b) {
                return new Date(b.datePublished) > new Date(a.datePublished)
                  ? 1
                  : -1;
              });
              res.json({ podcast: pod, episodes: episodes });
            });
        });
      } else {
        /**
         * // TODO: If the podcast doesn't exist, return a similar
         *
         * Since the else statement is only activated when the podcast actually doesn't exits,
         * or the slug is wrong
         */
        let episodes = await Episode.find({
          _id: {
            $in: pod.episodes,
          },
        });
        // Sort by date
        episodes = episodes.sort(function (a, b) {
          return new Date(b.datePublished) > new Date(a.datePublished) ? 1 : -1;
        });
        res.json({ podcast: pod, episodes: episodes });
      }
    }
  } catch (error) {
    console.log(error);
    res.send("error");
  }
});

/**
 * Adding a podcast will be using the podcasts's rss feed
 */
app.post("/api/podcast", function (req, res) {
  let Parser = require("rss-parser");
  let parser = new Parser();

  parser.parseURL(req.body.rss_feed, function (err, feed) {
    if (err || feed === undefined) {
      // Means that the rss feed id prolly wrong - return something here
      res.json({
        saved: false,
        error: true,
        message: "could not parse rss feed",
      });
    } else {
      Podcast.findOne(
        { title: feed.title, rssFeed: feed.feedUrl },
        function (err, result) {
          if (err) {
            console.log(err);
            res.json({ error: true });
          }
          /**
           * If the podcast doesn't exist, crete a new one
           */
          if (result == null) {
            console.log("pod doesn' exists. Creating new one");
            // Add the podcast to the database
            const added = dbFuncs.addPod(feed, req.body.rss_feed);
            res.json({ saved: true, new: true, podUrl: added.slug });
          } else {
            /**
             * If the podcast exists, don't create a new one
             * rather, redirect the user to the podcast
             * figure out a way to redirect the user to the particular podcast --
             */
            res.send({
              saved: true,
              new: false,
              podUrl: result.slug,
              message: "podcast already exists",
            });
          }
        }
      );
    }
  });
});

app.get("/api/podcast/episode/:podcast", async function (req, res) {
  // console.log(req.params.podcast);
  // console.log(req.query.episode);
  const slug = `${req.params.podcast}?episode=${req.query.episode}`;
  try {
    const pod = await Episode.findOne({ slug: slug });
    res.json(pod);
  } catch (error) {
    console.log(error);
    res.send("error");
  }
});

app.post("/api/like/episode", async (req, res) => {
  let pod = req.body.podcastId;
  let liked = false;
  if (!req.user) {
    res.json({ saved: false });
  }
  try {
    const thisUser = await User.findById(req.user._id);
    const episode = await Episode.findById(pod);

    if (thisUser.podcastLikes.includes(pod)) {
      let pods = thisUser.podcastLikes;
      for (var j = 0; j < pods.length; j++) {
        if (String(pods[j]) === pod) {
          pods.splice(j, 1);
        }
      }
      liked = false;
      thisUser.podcastLikes = pods;
      // Update number of likes for episode
      let epLikes = episode.likes;
      epLikes.splice(thisUser._id);
      episode.likes = epLikes;
    } else {
      liked = true;

      await thisUser.podcastLikes.push(pod);
      // Update number of likes for episode
      let epLikes = episode.likes;
      epLikes.push(thisUser._id);
      episode.likes = epLikes;
    }

    // User.update({ _id: req.user._id }, { $push: { podcastLikes: { pod } } });
    await thisUser.save();
    await episode.save();
  } catch (error) {
    console.log(error);
  }

  res.json({ liked: liked, saved: true });
});

/**
 * The like button is active if the user is logged in and has liked the episode
 */
app.get("/api/like/episode/:ep_id", async (req, res) => {
  const ep_id = req.params.ep_id;
  let liked = false;
  try {
    if (req.user !== undefined) {
      const usr = await User.findById(req.user._id);
      let arr = usr.podcastLikes;

      if (arr.includes(mongoose.Types.ObjectId(ep_id))) {
        liked = true;
      }
    }
    res.json({ liked: liked });
  } catch (error) {
    res.json({ liked: false });
  }
});

app.post("/api/addtopic", async (req, res) => {
  const user = req.user._id;
  const topic = req.body.topic;
  const type = req.body.topicType;
  const episodeId = req.body.episodeId;

  let thisEp = await Episode.findById(mongoose.Types.ObjectId(episodeId));

  /*
  // Consider this when there are many of the same requests
  if (
    topic === undefined ||
    user === undefined ||
    type === undefined ||
    episodeId === undefined
  ) {
    console.log("what you trynna do?");
    res.json({ saved: false });
  } else {

    */
  switch (type) {
    case "Theme":
      try {
        let oldTheme = await Theme.findOne({ slug: slug(topic) });
        /**
         * If the Theme does NOT exist, create the new theme and add the theme to the podcast */
        if (oldTheme === null) {
          console.log("creating new theme");
          // Create new theme
          let newTheme = new Theme({
            title: topic,
            contributor: user,
            podcastEpisodes: [episodeId],
            slug: slug(topic),
          });
          // Asyncronously save the new theme and save the episode
          thisEp.themes.push(newTheme._id);
          console.log(thisEp.themes);
          await newTheme.save();
          await thisEp.save();
          res.json({ saved: true, theme: newTheme, episode: thisEp });
        } else {
          /**
           * If the Theme exists already, add the theme to the podcast */
          console.log("updating episode with theme");

          thisEp.themes.push(oldTheme._id);
          await thisEp.save();
          res.json({ saved: true, episode: thisEp, theme: oldTheme });
        }
      } catch (error) {
        console.log(error);
      }
      break;

    case "Person":
      try {
        let oldPerson = Person.findOne({ slug: slug(topic) });
        oldPerson.then((result) => {
          if (result === null) {
            let newPerson = new Person({
              title: topic,
              contributor: user,
              podcastEpisodes: [episodeId],
              slug: slug(topic),
            });
            thisEp.people.push(newPerson._id);
            thisEp.save();
            newPerson.save();
            res.send({ saved: true });
          } else {
            /**
             * If the Person exists already, add the location to the podcast
             */
            thisEp.people.push(oldPerson._id);
            thisEp.save();
            res.json({ saved: true });
          }
        });
      } catch (error) {
        console.log(error);
      }
      break;
    case "Location":
      try {
        let oldLocation = await Location.findOne({ slug: slug(topic) });
        oldLocation.then((result) => {
          if (result === null) {
            let newLocation = new Location({
              title: topic,
              contributor: user,
              podcastEpisodes: [episodeId],
              slug: slug(topic),
            });

            thisEp.locations.push(newLocation._id);
            thisEp.save();
            newLocation.save();
            res.json({ saved: true });
          } else {
            /**
             * If the location exists already, add the location to the podcast
             */
            thisEp.locations.push(oldLocation._id);
            thisEp.save();
            res.json({ saved: true });
          }
        });
      } catch (error) {
        console.log(error);
      }
      break;
    default:
      break;
  }
  // res.json({ saved: false });
});
/**
 * Get an episode's topics
 */
app.get("/api/podcast/episode/topics/:podcast", async (req, res) => {
  const thisSlug = `${req.params.podcast}?episode=${req.query.episode}`;
  let thisEp = await Episode.findOne({ slug: thisSlug });
  // thisEp.then((re) => {
  //   console.log(re.people);
  // });
  let themes = thisEp.themes;
  let people = thisEp.people;
  let locations = thisEp.locations;
  console.log(thisEp.people);
  try {
    let getThemes = [];
    if (themes !== undefined) {
      getThemes = await Promise.all(
        themes.map(async (themeId) => {
          return await Theme.findById(themeId);
        })
      );
    }
    let getPeople = [];
    if (people !== undefined) {
      getPeople = await Promise.all(
        people.map(async (personId) => {
          return await Person.findById(personId);
        })
      );
    }
    let getLocations = [];
    if (locations !== undefined) {
      getLocations = await Promise.all(
        locations.map(async (locationId) => {
          return await Location.findById(locationId);
        })
      );
    }
    // console.log(getPeople);
    res.json({ themes: getThemes, people: getPeople, locations: getLocations });
  } catch (error) {
    console.log(error);
    console.log("error finding your topics");
    res.json({ themes: [], people: [], locations: [] });
  }
});
/**
 * Post a comment for a particular podcast episode
 * The request body has the podcast episode object id and the comment
 */
app.post("/api/episode/addcomment", async function (req, res) {
  const episodeId = req.body.episodeId;
  const comment = req.body.comment;

  // const episode = await Episode.findById(episodeId);
  /**
   * Add the new comment to the podcast
   */
  let newComment = new Comment({
    content: comment,
    episode: episodeId,
    // userId: mongoose.Types.ObjectId(req.user._id),
  });
  await newComment.save();

  /**
   * Add comment to episode
   */
  const currentEp = await Episode.findById(mongoose.Types.ObjectId(episodeId));
  currentEp.comments.push(newComment._id);
  // console.log(currentEp);
  // console.log(newComment);
  await currentEp.save();
  // Parse comment for themes, people or locations

  /**
        #word# for a theme
        *word* for a person 
        ^word^ for location.
        @ to mention someone"
   */
  var pplRegex = /(?<=\*)(.*)(?=\*)/g;
  var themeRegex = /(?<=\#)(.*)(?=\#)/g;
  var locationRegex = /(?<=\^).*(?=\^)/g;
  let themes;
  let people;
  let locations;

  // Check for themes
  if (comment.match(themeRegex) !== null) {
    themes = [...comment.match(themeRegex)];
    await Promise.all(
      themes.map((theme) => {
        let thisTheme = Theme.findOne({ title: theme });
        return thisTheme.then(async (oldTheme) => {
          /**
           * If theme doesn't exist, create a new theme
           */
          if (oldTheme === null) {
            console.log("adding sth new");
            let newTheme = new Theme({
              title: theme,
              podcastEpisodes: [episodeId],
              userId: req.user._id,
              comments: [newComment],
              slug: slug(theme),
            });
            await newTheme.save();
            currentEp.themes.push(newTheme._id);

            // res.json({ currentEp });
          } else {
            /**
             * If Theme exists, just add the comment id to the theme
             */
            oldTheme.podcastEpisodes.push(mongoose.Types.ObjectId(episodeId));
            currentEp.themes.push(oldTheme._id);
            oldTheme.comments.push(newComment._id);
            // perhaps add each user who contributes to a podcast and not just the one who first contributed
            try {
              await oldTheme.save();
            } catch (error) {
              console.log("error saving");
            }
          }
        });
      })
    );
  }
  // Check for people and update if so
  if (comment.match(pplRegex) !== null) {
    people = [...comment.match(pplRegex)];
    people.map(async (person) => {
      let thisPerson = Person.findOne({ title: person });
      thisPerson.then(async (oldPerson) => {
        /**
         * If Person doesn't exist, create a new theme
         */
        if (oldPerson === null) {
          let newPerson = new Person({
            title: person,
            podcastEpisodes: [episodeId],
            userId: req.user._id,
            comments: [newComment],
            slug: slug(person),
          });
          await newPerson.save();
          currentEp.people.push(newPerson._id);
          await currentEp.save();

          console.log("--->" + currentEp.people);
        } else {
          /**
           * If Person exists, just add the comment id to the theme
           */
          console.log("some ole ppl");

          oldPerson.podcastEpisodes.push(mongoose.Types.ObjectId(episodeId));
          currentEp.people.push(oldPerson._id);
          oldPerson.comments.push(newComment._id);
          try {
            await oldPerson.save();
            await currentEp.save();
          } catch (error) {
            console.log("error saving");
          }
          // console.log(currentEp);
        }
      });
    });
  }
  //Check for locations and update if so
  if (comment.match(locationRegex) !== null) {
    locations = [...comment.match(locationRegex)];
    await Promise.all(
      locations.map(async (location) => {
        let thisLocation = Location.findOne({ title: location });
        thisLocation.then(async (oldLocation) => {
          /**
           * If Location doesn't exist, create a new theme
           */
          if (oldLocation === null) {
            let newLocation = new Location({
              title: location,
              podcastEpisodes: [episodeId],
              userId: req.user._id,
              comments: [newComment],
              slug: slug(location),
            });
            try {
              await newLocation.save();
              currentEp.locations.push(newLocation._id);
              await currentEp.save();
            } catch (error) {
              console.log(error);
            }
          } else {
            /**
             * If Location exists, just add the comment id to the theme
             */
            oldLocation.podcastEpisodes.push(
              mongoose.Types.ObjectId(episodeId)
            );
            currentEp.locations.push(oldLocation._id);
            // perhaps add each user who contributes to a podcast and not just the one who first contributed
            oldLocation.comments.push(newComment._id);
            try {
              await oldLocation.save();
              await currentEp.save();
            } catch (error) {
              console.log("error saving");
            }
          }
        });
      })
    );
  }
  console.log("almost done");
  // Save the updated episode
  try {
    console.log("saving the episode");
    await newComment.save();
    currentEp.save().then((result) => {
      res.json(result);
    });
    console.log("currentEp: " + currentEp);
    // res.send({ saved: true });
  } catch (error) {
    console.log(error);
    res.send({ saved: false });
  }
});

/**
 * Get the comments for a podcast episode
 */
app.get("/api/podcast/episode/comments/:podcast", async function (req, res) {
  const slug = `${req.params.podcast}?episode=${req.query.episode}`;

  try {
    let thisEpisode = await Episode.findOne({ slug: slug });
    let getcomments = await Promise.all(
      thisEpisode.comments.map(async (commentId) => {
        return await Comment.findById(commentId);
      })
    );

    res.json({ comments: getcomments });
  } catch (error) {
    console.log("error finding your comments");
    console.log(error);
    res.json({ comments: [] });
  }
});

/**
 * Post a theme to a particular podcast episode
 */
app.post("/api/theme", function (req, res) {});

/**
 * Get the comments for a podcast episode
 */
app.get("/api/podcast_episode/themes", function (req, res) {});
/**
 * Get one specific theme
 */
app.get("themes", function (req, res) {});
/**
 * Post a comment for a particular podcast episode
 */
app.post("/api/podcast_episode/theme", function (req, res) {});

/**
 * Get the reviews for a podcast episode
 */
app.get("/api/podcast_episode/reviews", function (req, res) {});

/**
 * Post a review for a particular podcast episode
 */
app.post("/api/podcast_episode/review", function (req, res) {});

/**
 * Get a particular user's playlist
 */
app.get("/api/user/playlist", function (req, res) {});

/**
 * Get a particular user's list pf playlists
 */
app.get("/api/user/allplaylists", function (req, res) {});

/**
 * Create a new playlist
 */
app.post("/api/user/playlist", function (req, res) {});

/**
 * Get the location for a podcast episode
 */
app.get("/api/location", function (req, res) {});

/**
 * Get all the locations
 */
app.get("/api/locations", function (req, res) {});

/**
 * Post a new location for a particular podcast episode
 */
app.post("/api/location", function (req, res) {});

/**
 * Get podcasts surrounding a particular person
 */
app.get("/api/person", function (req, res) {});

/**
 * Get all people
 */
app.get("/api/people", function (req, res) {});

/**
 * Post a new person for a particular podcast episode
 */
app.post("/api/person", function (req, res) {});

/**
 * Get the likes for a podcast episode
 */
app.get("/api/likes", function (req, res) {});

/**
 * Post a like for a particular podcast episode
 */
app.post("/api/like", function (req, res) {});

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname + "/api/build/index.html"));
// });

app.listen(5000);
