import { Episode } from './../../models/Episode'
import { authenticateUser } from './../../db/authentication'
import { UserModel, EpisodeModel, PlayModel } from './../../models'
import {
  Arg,
  Args,
  ArgsType,
  Ctx,
  Field,
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
    const user = await authenticateUser(username, password)
    return user
  }

  @Mutation(returns => Boolean)
  async signout () {
    return true
  }

  @Mutation(returns => User)
  async signInWithToken (@Ctx() context): Promise<User> {
    const userContext = context
    const user = await UserModel.findOne({ username: userContext.username })
    return user
  }

  @Mutation(returns => Number, { description: 'Sets a user Volume' })
  async setUserVolume (
    @Arg('volume') volume: number,
    @Ctx() context
  ): Promise<number> {
    const user = await UserModel.findOne({ username: context.username })
    user.volume = volume
    await user.save()

    return volume
  }

  @Mutation(returns => Play)
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

  @Mutation(returns => Play)
  async updatePlayPosition (
    @Arg('position') position: number,
    @Arg('playId') playId: number,
    @Ctx() context
  ) {
    const play = await PlayModel.findById(playId)
    play.position = position

    play.save()

    return play
  }

  @Query(returns => [Play], { description: "Returns a user's player queue" })
  async getUserQueue (@Ctx() context): Promise<Play[]> {
    const user = await UserModel.findOne({ username: context.username })
    const queue = user.queue

    return queue
  }

  @Mutation(returns => [Play], {
    description: "Adds an episode to a player's queue"
  })
  async addToPlayerQueue (
    @Arg('slug') slug: string,
    @Ctx() context
  ): Promise<Play[]> {
    const user = await UserModel.findOne({ username: context.username })

    const episode = await EpisodeModel.findOne({ slug: slug })
    const play = new PlayModel({
      episode: episode,
      position: 0,
      started: false,
      completed: false
    })

    episode.plays.push(play._id)
    user.plays.push(play)
    user.queue.push(play)
    await user.save()
    await episode.save()
    await play.save()

    console.log(slug)
    return user.queue
  }
}
