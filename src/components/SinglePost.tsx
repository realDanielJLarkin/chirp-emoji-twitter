import Image from "next/image"
import Link from "next/link"
import { api } from "~/utils/api"
import { RouterOutputs } from "~/utils/api"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import CommentsFeed from "./CommentsFeed"
import CreateCommentWizard from "./CreateCommentWizard"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import type { Like, Post } from "@prisma/client"
import { toast } from "react-hot-toast"


dayjs.extend(relativeTime)


type PostWithUser = RouterOutputs["posts"]["getAll"][number]
const SinglePost = (props: PostWithUser) => {


    const checkForLikes = () => {
        if (post.likes) {
            return post.likes
        } else {
            const noLikes: any = []
            return noLikes
        }
    }

    const { post, author } = props
    const user = useUser()
    const likes = checkForLikes()
    const ctx = api.useContext()
    const [likedPost, setLikedPost] = useState(likes)
    const [likeId, setLikeId] = useState(likes.map((like: Like) => like.id))
    const [numberOfLikes, setNumberOfLikes] = useState(likes.length)
    const [postLiked, setPostLiked] = useState(false)


    const checkIfUserLikedPost = () => {
        if (user.isSignedIn && likedPost.find((like: Like) => like.postId === post.id && like.userId === user.user.id)) {
            return true
        } else {
            return false
        }
    }

    useEffect(() => {
        if (user.isSignedIn) {
            const postLiked = checkIfUserLikedPost()
            setPostLiked(postLiked)
        }
    }, [likes])

    const { mutate, isLoading } = api.likes.performLikeAction.useMutation({
        onSuccess: () => {
            console.log('success')
            void ctx.posts.getAll.invalidate()
        },
        onError: (error) => {
            const errorMessage = error.data?.zodError?.fieldErrors.content;
            console.log('Error adding like', errorMessage)

        }
    })

    const handleLikeClicked = (postId: string) => {
        if (!user.isSignedIn) {
            toast.error("Please login to use Chirp")
            return
        } else {
            if (!isLoading) {
                if (postLiked) {
                    console.log(likeId)
                    mutate({ postId, likeId })
                    setLikeId([''])
                    setNumberOfLikes(likes.length - 1)
                    setPostLiked(false)

                } else {
                    setLikedPost({ userId: user.user.id, postId: post.id })
                    setNumberOfLikes(likes.length + 1)
                    setPostLiked(true)
                    mutate({ postId, likeId: '', })
                }
            }
        }
    }


    return (
        <>
            <div className="border-b border-slate-200 ">
                <div key={post.id} className='p-4 gap-3  flex ' >
                    <Image src={author.profileImageUrl} alt="profile image" className="h-14 w-14 rounded-full" height={56} width={56} />
                    <div className="flex flex-col">
                        <div className="flex gap-1">
                            <Link href={`/${author.id}`}> <p>{author.username ? author.username : author.firstName + ' ' + author.lastName}</p></Link>
                        </div>
                        <span className="text-2xl">{post.content}</span>
                    </div>
                </div>
                <div className="pb-2 pl-4 mt-3 border-b border-slate-200 mb-3 text-slate-500">
                    <span className="">{dayjs(post.createdAt).format('h:mm a')} · {dayjs(post.createdAt).format('MMM DD, YYYY')}</span>
                </div>
                <div className="flex justify-between  text-gray-400 w-3/4 pl-20 pb-2">
                    <div className="cursor-pointer flex gap-2 hover:text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                        <p className="text-gray-400">{post.comments.length}</p>
                    </div>
                    <div className="cursor-pointer flex gap-2 hover:text-green-500">

                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                        </svg>
                        <p className="text-gray-400">0</p>
                    </div>
                    <button onClick={(e) => handleLikeClicked(post.id)} className="cursor-pointer flex gap-2 hover:text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg"
                            fill={!user.isSignedIn ? 'none' : postLiked ? `#ef4444` : 'none'}
                            stroke={!user.isSignedIn ? 'currentColor' : postLiked ? `` : `currentColor`}
                            strokeWidth={1.5}
                            className="w-6 h-6">
                            <path fill={``} strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        <p className="text-gray-400">{numberOfLikes}</p>
                    </button>
                </div>
                <div className="p-1" />
            </div>
            <div className="p-4 border-b border-slate-200">
                <CreateCommentWizard placeholder="Chirp a reply..." postId={post.id} />
            </div>
            {post.comments.length > 0 && (
                <div className="p-4 border-b border-slate-200">
                    <CommentsFeed id={post.id} />
                </div>
            )}

        </>
    )

}

export default SinglePost


// const { post, author } = props
//     const user = useUser()
//     const likes = post.likes
//     const [numberOfLikes, setNumberOfLikes] = useState(likes.length)
//     const [postLiked, setPostLiked] = useState(false)
//     const [liked, setLiked] = useState([])