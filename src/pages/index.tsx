import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, useUser, SignOutButton } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import { PageLayout } from "~/components/Layout";
import CreatePostWizard from "~/components/CreatePostWizard";
import Feed from "~/components/HomeFeed";


dayjs.extend(relativeTime)


const Home: NextPage = () => {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser()
  if (!userLoaded) return <div />

  console.log(user)

  return (
    <>
      <Head>
        <title>Chirp</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="bg-white h-22 w-full sticky top-0 left-0 opacity-90 border-b border-slate-200 flex justify-between pr-4">
          <h1 className="text-3xl font-bold p-4">Home</h1>
          {isSignedIn && <SignOutButton />}
        </div>
        <div className="border-b border-slate-200 p-4 flex">
          {isSignedIn ? <CreatePostWizard placeholder={"Type some emojis!"} /> : <div className="flex justify-center"><SignInButton /></div>}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;