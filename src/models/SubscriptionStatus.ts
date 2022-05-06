import { Field, ID, ObjectType } from 'type-graphql'

@ObjectType()
export class SubscriptionStatus {
    @Field((type) => ID)
    _id: string

    constructor(rssFeed: string) {
        this.rssFeed = rssFeed
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
    rssFeed: string = ''
}
