import PostView from "./PostView"
import { api } from "~/utils/api"
import { LoadingPage } from "./Spinner"
import { useState } from "react"


const Feed = () => {
    const { data, isLoading: postsLoading } = api.posts.getAll.useQuery()
    if (postsLoading) return <LoadingPage />

    if (!data) return <div>Something went wrong!</div>
    return (
        <div className="flex flex-col">
            {data.map((fullPost) => <PostView {...fullPost} key={fullPost.post.id} />)}
        </div>
    )
}

export default Feed