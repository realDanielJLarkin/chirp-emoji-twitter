import type { User } from '@clerk/nextjs/dist/api'

export const filterUserData = (user: User) => {
    // const fullName = user.firstName! + ' ' + user.lastName
    const fullName = `${user.firstName} ${user.lastName}`
    const username = user.username
    return {
        id: user.id,
        username: username,
        fullName: fullName,
        profileImageUrl: user.profileImageUrl
    }
}