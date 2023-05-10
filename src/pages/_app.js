import { useEffect } from "react";
import { yellowInit } from "src/helpers/yellow";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    yellowInit();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
