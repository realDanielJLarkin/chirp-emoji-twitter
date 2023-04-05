import type { User } from '@clerk/nextjs/dist/api'

export const filterUserData = (user: User) => {
    // const fullName = user.firstName! + ' ' + user.lastName
    const firstName = user.firstName
    const lastName = user.lastName
    const username = user.username
    return {
        id: user.id,
        username: username,
        fullName: `${firstName} ${lastName}`,
        profileImageUrl: user.profileImageUrl
    }
}