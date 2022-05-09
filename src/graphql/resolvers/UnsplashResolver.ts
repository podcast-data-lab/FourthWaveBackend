import { Arg, Authorized, Ctx, Query, Resolver } from 'type-graphql'
import { UserContext } from '../../models/Context'
import { UnsplashPhoto } from '../../models/UnsplashPhoto'
import { searchForPhoto } from '../../lib/unsplash'
import { UserPermission } from '../../models/enums/Permissions'

@Resolver((of) => UnsplashPhoto)
export class PhotosResolver {
    @Authorized([UserPermission.Registered_User])
    @Query((returns) => [UnsplashPhoto], { description: 'Search a photo on unsplash' })
    async searchForCoverPhoto(@Arg('searchTerm') searchTerm: string, @Ctx() { user }: UserContext): Promise<UnsplashPhoto[]> {
        return searchForPhoto(searchTerm)
    }
}
