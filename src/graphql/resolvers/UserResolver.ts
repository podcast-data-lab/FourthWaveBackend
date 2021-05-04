import { Episode, EpisodeInput } from './../../models/Episode'
import { authenticateUser } from './../../db/authentication'
import { UserModel, EpisodeModel, PlayModel } from './../../models'
import {
  Arg,
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver
} from 'type-graphql'
import { User } from '../../models/User'
import { GraphQLError } from 'graphql'
import { Play } from '../../models/Play'

@ArgsType()
class UserSignUpArgs {
  @Field(type => String, { nullable: false })
  username: string

  @Field(type => String, { nullable: false })
  email: string

  @Field(type => String, { nullable: false })
  firstname: string

  @Field(type => String, { nullable: true })
  lastname: string

  @Field(type => String, { nullable: true })
  password: string
}

@Resolver(of => User)
export default class UserResolver {
  @Mutation(returns => String)
  async signup (
    @Args() { username, email, firstname, lastname, password }: UserSignUpArgs
  ): Promise<string | GraphQLError> {
    const user = new UserModel({
      username: username,
      email: email,
      firstname: firstname,
      lastname: lastname,
      password: password
    })
    try {
      await user.save()
    } catch (error) {
      console.log(error)
      return new GraphQLError(error.message)
    }
    return JSON.stringify(user)
  }

  @Mutation(returns => User)
  async signin (
    @Arg('username') username: string,
    @Arg('password') password: string
  ) {
    const user: User | Error = await authenticateUser(username, password)

    return user
  }

  @Mutation(returns => Boolean)
  async signout () {
    return true
  }

  @Mutation(returns => User)
  async signInWithToken (@Ctx() context): Promise<User> {
    const user = await UserModel.aggregate([
      { $match: { username: context.username } },
      {
        $lookup: {
          from: 'plays',
          foreignField: '_id',
          localField: 'queue',
          as: 'queue'
        }
      }
    ])

    TODO: 'Move this sorting work to the database'

    const userQueue = await (
      await UserModel.findOne({ username: context.username })
    ).queue

    user[0].queue = user[0].queue.sort(
      (a, b) => userQueue.indexOf(a._id) - userQueue.indexOf(b._id)
    )

    return user[0]
  }

  @Mutation(returns => Number, { description: 'Sets a user Volume' })
  async setUserVolume (
    @Arg('volume') volume: number,
    @Ctx() context
  ): Promise<number> {
    console.log(context)
    const user = await UserModel.findOne({ username: context.username })
    user.volume = volume
    await user.save()

    return volume
  }

  @Mutation(returns => Play, {
    description: 'Starts the playing of a Play object'
  })
  async startPlay (@Arg('slug') slug: string, @Ctx() context): Promise<Play> {
    const user = await UserModel.findOne({ username: context.username })

    const episode = await EpisodeModel.findOne({ slug: slug })
    const play = new PlayModel({
      episode: Episode,
      position: 0,
      started: true,
      completed: false
    })

    if (!episode.plays) episode.plays = []
    if (!user.plays) user.plays = []
    episode.plays.push(play)
    user.plays.push(play)

    await episode.save()
    await play.save()
    await user.save()

    return play
  }

  @Mutation(returns => Play, {
    description: 'Updates the play position of a Play object'
  })
  async updatePlayPosition (
    @Arg('position') position: number,
    @Arg('playId') playId: number
  ) {
    const play = await PlayModel.findById(playId)
    if (play.position > 0 && play.started == false) play.started = true

    play.position = position

    await play.save()

    return play
  }

  @Query(returns => [Play], { description: "Returns a user's player queue" })
  async getUserQueue (@Ctx() context): Promise<Play[]> {
    const userQueue = await (
      await UserModel.findOne({ username: context.username })
    ).queue
    const user = await UserModel.aggregate([
      { $match: { username: context.username } },
      {
        $lookup: {
          from: 'plays',
          foreignField: '_id',
          localField: 'queue',
          as: 'queue'
        }
      }
    ])
    user[0].queue = user[0].queue.sort(
      (a, b) => userQueue.indexOf(a._id) - userQueue.indexOf(b._id)
    )
    return user[0].queue
  }

  @Mutation(returns => [Play], {
    description: "Adds an episode to a player's queue"
  })
  async addToPlayerQueue (
    @Arg('slug') slug: string,
    @Ctx() context
  ): Promise<Play[]> {
    const user = await UserModel.findOne({ username: context.username })
    console.log(user.queue)
    const episode = await EpisodeModel.findOne({ slug: slug })
    const play = new PlayModel({
      episode: episode,
      position: 0,
      started: false,
      completed: false
    })

    episode.plays.push(play._id)
    user.plays.push(play._id)
    user.queue.push(play)
    await user.save()
    await episode.save()
    await play.save()

    const userDetails = await UserModel.aggregate([
      { $match: { username: context.username } },
      {
        $lookup: {
          from: 'plays',
          foreignField: '_id',
          localField: 'queue',
          as: 'queue'
        }
      }
    ])

    return userDetails[0].queue
  }

  @Mutation(returns => Play, {
    description: "Adds an episode to a player's queue"
  })
  async addToBeginningOfQueue (
    @Arg('slug') slug: string,
    @Ctx() context
  ): Promise<Play> {
    const user = await UserModel.findOne({ username: context.username })

    TODO: 'Check if the episode is already in the users queue!!!'
    const episode = await EpisodeModel.findOne({ slug: slug })
    const play = new PlayModel({
      episode: episode,
      position: 0,
      started: false,
      completed: false
    })

    episode.plays.push(play._id)
    user.plays.push(play._id)
    user.queue.unshift(play._id)
    await user.save()
    await episode.save()
    await play.save()

    return play
  }

  @Mutation(returns => Play, { description: "Updates a user's player queue" })
  async updatePlayerQueue (
    @Arg('queue') queue: string,
    @Ctx() context
  ): Promise<Play[]> {
    const user = await UserModel.findOne({ username: context.username })
    console.log(queue)

    const userDeets = await UserModel.aggregate([
      { $match: { username: context.username } },
      {
        $lookup: {
          from: 'plays',
          foreignField: '_id',
          localField: 'queue',
          as: 'queue'
        }
      }
    ])

    return userDeets[0].queue
  }

  @Mutation(returns => Number, {
    description: "Changes a user's playing speed"
  })
  async changePlayingSpeed (
    @Arg('speed') speed: number,
    @Ctx() context
  ): Promise<Number> {
    const user = await UserModel.findOne({ username: context.username })
    console.log(user.queue)

    user.playingSpeed = speed
    await user.save()
    return user.playingSpeed
  }

  @Mutation(returns => Play, {
    description: "Updates the position of a user's Play object"
  })
  async updatePosition (
    @Arg('playId') playId: string,
    @Arg('position') position: number,
    @Ctx() context
  ): Promise<Play> {
    const play = await PlayModel.findById(playId)
    play.position = position

    await play.save()

    const userDeets = await UserModel.aggregate([
      { $match: { username: context.username } },
      {
        $lookup: {
          from: 'plays',
          foreignField: '_id',
          localField: 'queue',
          as: 'queue'
        }
      }
    ])

    return userDeets[0].queue[0]
  }

  @Mutation(returns => [Play], {
    description: "Deletes/Clears a user's playing queue"
  })
  async clearQueue (@Ctx() context): Promise<Play[]> {
    const user = await UserModel.findOne({ username: context.username })
    user.queue = []
    await user.save()

    return []
  }
}
