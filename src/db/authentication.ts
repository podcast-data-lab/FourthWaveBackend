import { GraphQLError } from 'graphql'
import jwt from 'jsonwebtoken'
import { UserModel } from '../models'
import { User } from '../models/User'

// let conf = require("dotenv").config("../../").parsed;

/**
 * A function to authenticate a user
 * @param email
 * @param password
 * @returns null if a user can't be authenticated, the email and token if otherwise
 */

export const authenticateUser = async (
  username,
  password
): Promise<User | Error> => {
  try {
    // Verify the Use
    let user = await UserModel.findOne({
      username: username
    }).exec()

    if (!user) {
      await UserModel.findOne({
        email: username
      }).exec()
    }

    if (!user) {
      return new GraphQLError('user does not exist')
    }

    const passwordOK = await user.comparePassword(password)
    if (!passwordOK) {
      console.log('wrong pass')
      return new GraphQLError('wrong password')
    }

    const token = generateToken(user.username, user.admin)
    user.authtoken = token
    await user.save()

    const userQueue = user.queue
    let userData = await UserModel.aggregate([
      { $match: { username: user.username } },
      {
        $lookup: {
          from: 'plays',
          foreignField: '_id',
          localField: 'queue',
          as: 'queue'
        }
      }
    ])

    userData[0].queue = userData[0].queue.sort(
      (a, b) => userQueue.indexOf(a._id) - userQueue.indexOf(b._id)
    )

    return userData[0]
  } catch (error) {
    console.log(error.message)
    return Error['INCORRECT_PASSWORD']
  }
}

/**
 * Generates a JWT Token
 * @param email
 * @param password
 */
export const generateToken = (username, admin): string => {
  const token = jwt.sign(
    {
      username: username,
      admin: admin,
      iat: Math.floor(Date.now())
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )
  return token
}

/**
 * Verifies if a token is valid, otherwise throws an error
 * @param token
 */
export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
  } catch (e) {
    return null
  }
}

/**
 * Retrieves an authenticated user if a token is valid
 * @param token
 */
export const getAuthenticatedUser = async (token: String) => {
  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET)
    let user = await UserModel.find({ email: decoded.email })
    return user
  } catch (error) {
    console.log(error.message)
    return null
  }
}
export const resetPassword = async (email: String) => {
  // try {
  //   let user = await UserModel.findOne({ email: email })
  //   let random = Math.floor(Math.random() * passes.length)
  //   let randomPass = passes[random]
  //   user.password = randomPass
  //   await user.save()
  //   return [user.email, randomPass]
  // } catch (error) {
  //   console.log(error)
  //   return [null, null]
  // }
}

export const genPassword = async (email: String) => {
  // let random = Math.floor(Math.random() * passes.length)
  // let randomPass = passes[random]
  // return randomPass
}
