import { Field, InputType, ObjectType } from 'type-graphql'

@ObjectType()
export class Links {
    @Field({ nullable: true })
    self: string
    @Field({ nullable: true })
    html: string
    @Field({ nullable: true })
    download: string
    @Field({ nullable: true })
    download_location: string
}

@ObjectType()
export class URLS {
    @Field({ nullable: true })
    raq: string
    @Field({ nullable: true })
    full: string
    @Field({ nullable: true })
    small: string
    @Field({ nullable: true })
    regular: string
    @Field({ nullable: true })
    thumb: string
}

@ObjectType()
export class UnsplashUser {
    @Field({ nullable: true })
    id: string
    @Field({ nullable: true })
    updated_at: string
    @Field({ nullable: true })
    username: string
    @Field({ nullable: true })
    name: string
    @Field({ nullable: true })
    first_name: string
    @Field({ nullable: true })
    last_name: string
    @Field({ nullable: true })
    twitter_username: string
    @Field({ nullable: true })
    portfolio_url: string
    @Field({ nullable: true })
    bio: string
    @Field({ nullable: true })
    location: string
    @Field({ nullable: true })
    instagram_username: string
}

@ObjectType()
export class UnsplashPhoto {
    @Field({ nullable: true })
    alt_description: string
    @Field({ nullable: true })
    blur_hash: string
    @Field({ nullable: true })
    color: string
    @Field({ nullable: true })
    description: string
    @Field({ nullable: true })
    height: number
    @Field({ nullable: true })
    likes: number
    @Field((type) => Links, { nullable: true })
    links: Links
    @Field((type) => URLS, { nullable: true })
    urls: URLS
    @Field({ nullable: true })
    promoted_at: string
    @Field({ nullable: true })
    width: number
    @Field((type) => [String], { nullable: true })
    categories: string
    @Field((type) => UnsplashUser, { nullable: true })
    user: UnsplashUser
}
