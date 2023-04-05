import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { filterUserData } from "~/server/helpers/filterUser";
import type { Like, Comment } from "@prisma/client";

interface Post {
    id: string
    createdAt: Date
    authorId: string
    content: string
    comments: Comment[]
    likes: Like[]
}

const addUserDataToPosts = async (posts: Post[],) => {
    const users = (await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
    })).map(filterUserData)

    console.log(posts)

    return posts.map((post) => {
        const author = users.find((user) => user.id === post.authorId)
        if (!author) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Author not found' })
        }
        return {
            post,
            author,
        }
    })
}

const addUserDataToComments = async (comments: Comment[]) => {
    const users = (await clerkClient.users.getUserList({
        userId: comments.map((comment) => comment.userId),
        limit: 100,
    })).map(filterUserData)


    return comments.map((comment) => {
        const author = users.find((user) => user.id === comment.userId)
        if (!author) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Author of comment not found' })
        }

        return {
            comment,
            author,
        }
    })
}


const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, "1 m"),
    analytics: true
});

export const postsRouter = createTRPCRouter({

    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            take: 100,
            orderBy: [{ createdAt: 'desc' }],
            include: {
                comments: true,
                likes: true
            },
        });
        return addUserDataToPosts(posts)
    }),

    getPostsByUserId: publicProcedure.input(z.object({
        userId: z.string(),
    })).query(({ ctx, input }) => ctx.prisma.post.findMany({
        where: {
            authorId: input.userId
        },
        include: { comments: true, likes: true },
        take: 100,
        orderBy: [{ createdAt: 'desc' }]
    }).then(addUserDataToPosts)),

    getPostByPostId: publicProcedure.input(z.object({
        id: z.string()
    })).query(async ({ ctx, input }) => {
        const post = await ctx.prisma.post.findUnique({
            where: {
                id: input.id
            },
            include: { comments: true, likes: true }
        })
        if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post by Id not found" })
        return (await addUserDataToPosts([post]))[0]
    }),

    getCommentsByPostId: publicProcedure.input(z.object({
        postId: z.string(),
    })).query(({ ctx, input }) => ctx.prisma.comment.findMany({
        where: {
            postId: input.postId
        },
        take: 100,
        orderBy: [{ createdAt: 'desc' }]
    }).then(addUserDataToComments)),

    getCommentByCommentId: publicProcedure.input(z.object({
        postId: z.string(),
    })).query(async ({ ctx, input }) => {
        const post = await ctx.prisma.comment.findUnique({
            where: {
                id: input.postId
            }
        })
        if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post by Id not found" })
        return (await addUserDataToComments([post]))[0]
    }),

    create: privateProcedure.input(z.object({ content: z.string().emoji().min(1).max(280) })).mutation(async ({ ctx, input }) => {
        const authorId = ctx.userId;
        if (!authorId) throw new Error('no user id')
        const { success } = await ratelimit.limit(authorId)
        if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Slow down, partner" })
        const post = await ctx.prisma.post.create({
            data: {
                authorId,
                content: input.content
            }
        })
        return post
    }),

    createComment: privateProcedure.input(z.object({ content: z.string().emoji().min(1).max(280), postId: z.string() })).mutation(async ({ ctx, input }) => {
        const authorId = ctx.userId
        const postId = input.postId

        if (!authorId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error creating comment: User Error" })
        if (!postId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error creating comment: PostID Error" })

        const { success } = await ratelimit.limit(authorId)

        if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Slow down, partner" })

        const comment = await ctx.prisma.comment.create({
            data: {
                userId: authorId,
                postId: input.postId,
                content: input.content
            }
        })

        return comment
    })
});