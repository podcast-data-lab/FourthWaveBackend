import { prop, getModelForClass, Ref, DocumentType } from '@typegoose/typegoose'
import { Field, ID, ObjectType } from 'type-graphql'
import { Category } from './Category'
import { Episode } from './Episode'
import { Entity } from './Entity'
import { ObjectId } from 'mongoose'
import { Author } from './Author'
@ObjectType()
export class Podcast {
    @Field()
    @prop()
    public title: string

    @Field({ nullable: true })
    @prop()
    rssFeed: string

    @Field({ nullable: true })
    hmac: string

    @Field({ nullable: true })
    @prop()
    base64image?: string

    @Field((type) => Author, { nullable: true })
    @prop({ ref: 'Author'})
    author?: Ref<Author>

    @Field({ nullable: true })
    @prop()
    link: string

    @Field({ nullable: true })
    @prop()
    image: string

    @Field({ nullable: true })
    @prop()
    description: string

    @Field({ nullable: true })
    @prop()
    publisher?: string

    @Field((type) => [String])
    @prop({ type: () => [String] })
    palette: [string]

    @Field((type) => Number, { nullable: true })
    @prop({ type: () => Number })
    frequency?: number

    @Field((type) => Number, { nullable: true })
    @prop({ type: () => Number })
    releaseDay?: number

    @Field((type) => Date, { nullable: true })
    @prop({ type: () => Date })
    lastEpisodeDate?: Date

    @Field((type) => Date, { nullable: true })
    @prop({ type: () => Date })
    lastUpdated?: Date

    @Field()
    @prop({
        type: String,
        required: true,
        unique: true,
    })
    slug: string

    @Field((type) => [Category], { nullable: true })
    @prop({ ref: 'Category' })
    categories?: Ref<Category>[]

    @Field((type) => [Entity], {
        nullable: true,
    })
    @prop({ ref: 'Entity', nullable: true })
    public entities?: Ref<Entity>[]

    @Field((type) => [Episode], { nullable: true })
    @prop({ ref: 'Episode', default: [] })
    episodes: Ref<Episode>[]
}

export const PodcastModel = getModelForClass(Podcast)
