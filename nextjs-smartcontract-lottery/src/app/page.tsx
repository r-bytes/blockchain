"use client"
import { MoralisProvider } from "react-moralis";
import { Header, LotteryEntrance, ManualHeader } from "./components";

export default function Home() {
    return (
        <>
            <MoralisProvider initializeOnMount={false}>
                {/* <ManualHeader /> */}
                <Header />
                <div className="p-6 my-4">
                    <LotteryEntrance />
                    <main className="flex min-h-screen flex-col items-center justify-between p-24">
                        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                            This home
                        </div>
                    </main>
                </div>
            </MoralisProvider>
        </>
    );
}
