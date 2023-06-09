import { api } from "~/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps } from "next/app";

import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";

function MyApp({ Component, pageProps }: AppProps) {


  return (
    <ClerkProvider {...pageProps}>
      <Toaster position="bottom-center" />
      <Component {...pageProps} />
    </ClerkProvider>
  );
}


export default api.withTRPC(MyApp);
