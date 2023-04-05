import type { User } from '@clerk/nextjs/dist/api'

export const filterUserData = (user: User) => {
    const firstName = user.firstName
    const lastName = user.lastName
    const username = user.username
    return {
        id: user.id,
        username: username,
        firstName: firstName,
        lastName: lastName,
        profileImageUrl: user.profileImageUrl
    }
}