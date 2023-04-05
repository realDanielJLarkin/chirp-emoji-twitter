import { api } from "~/utils/api"
import Image from "next/image"
import Link from "next/link"
import dayjs from "dayjs"
import relativeTime from "dayjs"
import { Spinner } from "./Spinner"

dayjs.extend(relativeTime)


const CommentsFeed = ({ id }: { id: string }) => {

    const { data, isLoading } = api.posts.getCommentsByPostId.useQuery({ postId: id })



    if (isLoading) return <Spinner />
    if (!data) return <div>Something went wrong!</div>
    console.log(data)
    return (
        <div className="flex flex-col">
            {data.map((comment) => (
                <div className="border-b border-slate-200 " key={comment.comment.id}>
                    <div className='p-4 gap-3  flex ' >
                        <Image src={comment.author.profileImageUrl} alt="profile image" className="h-14 w-14 rounded-full" height={56} width={56} />
                        <div className="flex flex-col">
                            <div className="flex gap-1">
                                <Link href={`/${comment.author.id}`}> <p>{comment.author.username ? comment.author.username : `${comment.author.firstName} ${comment.author.lastName}`}</p> </Link><span>·</span> <span className="font-thin">{dayjs(comment.comment.createdAt).fromNow()}</span>
                            </div>
                            <span className="text-2xl">{comment.comment.content}</span>
                        </div>
                    </div>
                    <div className="p-2" />
                    <div className="flex justify-between  text-gray-400 w-3/4 pl-20 pb-3">
                        <div className="cursor-pointer flex gap-2 hover:text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                            </svg>
                            <p className="text-gray-400">0</p>
                        </div>
                        <div className="cursor-pointer flex gap-2 hover:text-green-500">

                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                            </svg>
                            <p className="text-gray-400">0</p>
                        </div>
                        <div className="cursor-pointer flex gap-2 hover:text-red-500">

                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                            <p className="text-gray-400">0</p>
                        </div>
                    </div>
                    <div className="p-1" />
                </div>
            ))}
        </div>
    )
}

export default CommentsFeed