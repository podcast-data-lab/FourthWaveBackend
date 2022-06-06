import { Field, ID, ObjectType } from 'type-graphql'
import { Podcast } from './Podcast'

@ObjectType()
export class SubscriptionStatus {
    @Field((type) => ID)
    _id: string

    constructor(podcast: Podcast) {
        this.podcast = podcast
    }

    @Field()
    callbackUrl: string = ''

    @Field()
    state: string = ''

    @Field()
    lastSuccessfulVerification: string = ''

    @Field()
    expirationTime: string = ''

    @Field()
    lastSubscribeRequest: string = ''

    @Field()
    lastUnsubscribeRequest: string

    @Field()
    lastVerificationError: string = ''

    @Field()
    lastDeliveryError: string = ''

    @Field()
    aggregateStatistics: string = ''

    @Field()
    podcast: Podcast = new Podcast()
}
