import Link from "next/link";
import { useYellowAI } from "src/helpers/useYellowAi";
import { useEffect } from "react";

export default function Chat() {
  const { openChatBot } = useYellowAI();

  useEffect(() => {
    openChatBot();
  }, []);

  return (
    <div>
      <h1>Chat</h1>
      <p>In this page chat is opened automatically</p>
      <div>
        <Link href="/">go to Home page</Link>
      </div>
    </div>
  );
}
