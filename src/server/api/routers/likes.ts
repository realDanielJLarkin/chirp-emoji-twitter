import { z } from "zod";
// import { clerkClient } from "@clerk/nextjs/server";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
// import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
// import { Redis } from "@upstash/redis";
// import { filterUserData } from "~/server/helpers/filterUser";
// import type { Post, Comment } from "@prisma/client";
// import { executionAsyncResource } from "async_hooks";


export const likesRouter = createTRPCRouter({
    performLikeAction: privateProcedure.input(z.object({ postId: z.string(), likeId: z.any(), })).mutation(async ({ ctx, input }) => {
        const userId = ctx.userId
        const postId = input.postId
        const likeId: string = input.likeId[0]

        if (!userId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error adding like: User Error" })
        if (!postId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error adding like: PostID Error" })

        const post = await ctx.prisma.post.findUnique(({
            where: {
                id: postId
            },
            include: { likes: true }
        }))

        const likes = post?.likes
        if (likes?.find((like) => like.userId === userId)) {
            if (!likeId) {
                return
            }
            return await ctx.prisma.like.delete({
                where: {
                    id: likeId
                }
            })
        } else {
            const like = await ctx.prisma.like.create({
                data: {
                    userId,
                    postId,
                }
            })
            return like
        }

        // return await ctx.prisma.like.delete({
        //     where: {
        //         id: likeId
        //     }
        // })

    }),

    removeLike: privateProcedure.input(z.object({ likeId: z.string() })).mutation(async ({ ctx, input }) => {
        const likeId = input.likeId
        return await ctx.prisma.like.delete({
            where: {
                id: likeId
            }
        })
    })

});