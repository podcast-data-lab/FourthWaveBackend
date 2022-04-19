import { prop, getModelForClass, Ref, DocumentType, mongoose } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { Category } from './Category'
import { Episode } from './Episode'
import { Entity } from './Entity'

@ObjectType()
export class Podcast {
    @Field()
    @prop()
    public title: string

    @Field({ nullable: true })
    @prop()
    publisher: string

    @Field({ nullable: true })
    @prop()
    rssFeed: string

    @Field({ nullable: true })
    @prop()
    base64image: string

    @Field({ nullable: true })
    @prop()
    link: string

    @Field()
    @prop()
    image: string

    @Field()
    @prop()
    description: string

    @Field((type) => [String])
    @prop({ type: () => [String] })
    palette: [string]

    public async setPalette(this: DocumentType<Podcast>, palette: [string]) {
        this.palette = palette
        await this.save()
    }
    @Field((type) => Date, { nullable: true })
    @prop({ type: () => Date })
    lastRssBuildDate: Date

    @Field((type) => Number, { nullable: true })
    @prop({ type: () => Number })
    frequency: number

    @Field((type) => Number, { nullable: true })
    @prop({ type: () => Number })
    releaseDay: number

    @Field((type) => Date, { nullable: true })
    @prop({ type: () => Date })
    lastEpisodeDate: Date
    @Field()
    @prop({
        type: String,
        required: true,
        unique: true,
    })
    slug: string

    @Field((type) => [Category], { nullable: true })
    @prop({ ref: 'Category' })
    categories: Ref<Category>[]

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
