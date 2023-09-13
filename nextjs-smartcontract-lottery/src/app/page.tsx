"use client";
import { MoralisProvider } from "react-moralis";
import { Header, LotteryEntrance } from "./components";
import { NotificationProvider } from "web3uikit";

export default function Home() {
    return (
        <>
            <MoralisProvider initializeOnMount={false}>
                <NotificationProvider>
                    <Header />
                    <div className="p-6 my-4">
                        <LotteryEntrance />
                        <main className="flex min-h-screen flex-col items-center justify-between p-24">
                        </main>
                    </div>
                </NotificationProvider>
            </MoralisProvider>
        </>
    );
}
