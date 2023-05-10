import Link from "next/link";
import { useYellowAI } from "src/helpers/useYellowAi";

export default function Home() {
  const { openChatBot } = useYellowAI();

  return (
    <div>
      <h1>Home</h1>
      <p>Below is same implementation with &quot;Chat tim flip&quot; button</p>
      <button onClick={() => openChatBot()}>Chat tim flip</button>
      <div>
        <Link href="/chat">go to Chat page</Link>
      </div>
    </div>
  );
}
