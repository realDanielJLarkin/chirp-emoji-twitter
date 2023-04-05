import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Spinner } from "./Spinner";
import type { KeyboardEvent } from "react";

const CreatePostWizard = ({ placeholder }: { placeholder: string }) => {

    const ctx = api.useContext()
    const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
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

    const handleEnterKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            if (input !== '') {

                mutate({ content: input })
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
                <button onClick={() => mutate({ content: input })} disabled={isPosting}>Post</button>
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

export default CreatePostWizard