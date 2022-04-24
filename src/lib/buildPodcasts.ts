import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { parseFeedAndRegister } from './registerModels'

const mongoose = require('mongoose')
const { MONGO_DB } = require('dotenv').config('../../').parsed

mongoose.connect(MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

export async function registerPodcast(podcastFeedData, totalNo, currentNo) {
    let podcast = await parseFeedAndRegister(podcastFeedData)
    console.log(
        `${chalk.yellow.bold(podcast.title)} registered ${chalk.green('✔')}\n${chalk.hex('#DCC9B6')(
            ((currentNo / totalNo) * 100).toFixed(2) + `%`,
        )}\n`,
    )
}

;(async () => {
    const podcastFolderPath = path.join(process.cwd(), `temp/entity-extraction-${process.argv[2]}/podcasts-with-entities`)
    const podcasts: string[] = fs.readdirSync(podcastFolderPath)

    const totalNo = podcasts.length
    let currentNo = 0
    try {
        for (const filename of podcasts) {
            currentNo++
            const podcastPath = path.join(podcastFolderPath, filename)
            const data = JSON.parse(fs.readFileSync(podcastPath, 'utf8'))
            await registerPodcast(data, totalNo, currentNo)
        }
    } catch (error) {
        console.log(`${chalk.red('An error occured')}: `, error.message)
    }
    mongoose.disconnect()
})()
