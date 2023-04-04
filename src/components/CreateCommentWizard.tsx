import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Spinner } from "./Spinner";
import { StringArraySupportOption } from "prettier";

const CreateCommentWizard = ({ placeholder, postId }: { placeholder: string, postId: string }) => {

    const ctx = api.useContext()
    const { mutate, isLoading: isPosting } = api.posts.createComment.useMutation({
        onSuccess: () => {
            setInput('')
            void ctx.posts.getAll.invalidate()
        },
        onError: (error) => {
            const errorMessage = error.data?.zodError?.fieldErrors.content;
            if (errorMessage && errorMessage[0]) {
                toast.error(errorMessage[0])
            } else {
                toast.error("Failed to post, try again later... Or don't I don't give a fuck.")
            }

        }
    });

    const { user } = useUser()
    const [input, setInput] = useState('')

    const handleEnterKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            if (input !== '') {
                mutate({ content: input, postId: postId })
            }
        }
    }


    if (!user) {
        return null
    }

    return (
        <div className="flex w-full gap-4 ">
            <Image src={user.profileImageUrl} alt="profile image" className="w-14 h-14 rounded-full" height={56} width={56} />
            <input placeholder={placeholder} className="bg-transparent grow outline-none" value={input} onChange={(e) => setInput(e.target.value)} disabled={isPosting} onKeyDown={handleEnterKeyPress} />
            {input !== '' && !isPosting && (
                <button onClick={() => mutate({ content: input, postId: postId })} disabled={isPosting}>Post</button>
            )
            }
            {isPosting && (
                <div className="flex items-center justify-center">
                    <Spinner size={20} />
                </div>
            )}

        </div>
    )

}

export default CreateCommentWizard