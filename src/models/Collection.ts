import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { Field, ID, InputType, ObjectType } from 'type-graphql'
import { Podcast } from './Podcast'

@ObjectType({
    description: 'A collection contains a list of podcasts grouped by a user',
})
export class Collection {
    @Field((type) => ID)
    _id: string

    @Field()
    @prop({
        type: String,
        required: true,
    })
    public name: string

    @Field({ nullable: true })
    @prop({
        type: String,
    })
    public description: string

    @Field({ nullable: true })
    @prop({
        type: String,
    })
    public coverImageUrl: string

    @Field({ nullable: true })
    @prop({
        type: String,
    })
    public themeColor: string

    @Field({ nullable: true })
    @prop({
        type: Boolean,
        default: false,
    })
    public public: boolean

    @Field((type) => [Podcast])
    @prop({ ref: 'Podcast', default: [] })
    public podcasts: Ref<Podcast>[]
}
export const CollectionModel = getModelForClass(Collection)

@InputType()
export class CollectionInput {
    @Field()
    public name: string

    @Field({ nullable: true })
    public description?: string

    @Field({ nullable: true })
    public coverImageUrl?: string

    @Field({ nullable: true })
    public themeColor?: string
}
