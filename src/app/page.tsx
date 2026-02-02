import { Header } from "@/components/Header";
import { ChatContainer } from "@/components/chat";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />
      <main className="flex-1 overflow-hidden">
        <ChatContainer />
      </main>
    </div>
  );
}
