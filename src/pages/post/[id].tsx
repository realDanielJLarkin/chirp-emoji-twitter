import { PageLayout } from "~/components/Layout"
import { api } from "~/utils/api"
import type { NextPage, GetStaticProps } from "next"
import { generateSSGHelper } from "~/server/helpers/ssgHelper"
// import PostView from "~/components/PostView"
import Link from "next/link"
// import { Fragment } from 'react'
// import { ChatBubbleLeftEllipsisIcon, TagIcon, UserCircleIcon } from '@heroicons/react/20/solid'
import SinglePost from "~/components/SinglePost"


const SinglePostView: NextPage<{ id: string }> = ({ id }) => {

    const { data, isLoading } = api.posts.getPostByPostId.useQuery({ id })
    if (isLoading) return <div>Loading...</div>
    if (!data) return <div>404</div>

    return (
        <>
            <PageLayout>
                <div className="bg-white h-22 w-full sticky top-0 left-0 opacity-90 border-b border-slate-200 mb-4 p-4">
                    <div className="flex items-center pl-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <Link href='/'><span className="text-3xl font-bold">Back</span></Link>
                    </div>
                </div>

                <SinglePost {...data} />
            </PageLayout>
        </>
    )

}

export const getStaticProps: GetStaticProps = async (context) => {
    const ssg = generateSSGHelper()
    const id = context.params?.id
    if (typeof id !== 'string') throw new Error("No id :(")
    await ssg.posts.getPostByPostId.prefetch({ id })

    return {
        props: {
            trpcState: ssg.dehydrate(),
            id
        }
    }
}

export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export default SinglePostView