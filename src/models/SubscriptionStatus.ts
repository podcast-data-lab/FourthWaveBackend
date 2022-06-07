import { Field, ID, ObjectType } from 'type-graphql'
import { Podcast } from './Podcast'

@ObjectType()
export class SubscriptionStatus {
    constructor(podcast: Podcast) {
        this.podcast = podcast
    }

    @Field({ nullable: true })
    callbackUrl: string = ''

    @Field({ nullable: true })
    state: string = ''

    @Field({ nullable: true })
    lastSuccessfulVerification: string = ''

    @Field({ nullable: true })
    expirationTime: string = ''

    @Field({ nullable: true })
    lastSubscribeRequest: string = ''

    @Field({ nullable: true })
    lastUnsubscribeRequest: string

    @Field({ nullable: true })
    lastVerificationError: string = ''

    @Field({ nullable: true })
    lastDeliveryError: string = ''

    @Field({ nullable: true })
    aggregateStatistics: string = ''

    @Field()
    podcast: Podcast = new Podcast()
}
