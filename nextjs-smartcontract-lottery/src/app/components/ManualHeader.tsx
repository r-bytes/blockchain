import Moralis from "moralis-v1";
import { useEffect } from "react";
import { useMoralis } from "react-moralis";

const ManualHeader = () => {
    const { enableWeb3, account, isWeb3Enabled, deactivateWeb3, isWeb3EnableLoading } = useMoralis();

    useEffect(() => {
        if (isWeb3Enabled) return;

        // get status from localStorage
        if (typeof window !== "undefined" && window.localStorage.getItem("connected")) {
            enableWeb3();
        }

    }, [isWeb3Enabled]);

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`account has changed to ${account}`);
            if (typeof window !== "undefined" && account == null) {
                window.localStorage.removeItem("connected");
                deactivateWeb3();
                console.log("no account found")
            }
        });

        return () => {};
    }, []);

    const handleClick = async () => {
        await enableWeb3();

        // save connection status to localStorage
        if (typeof window !== "undefined") {
            window.localStorage.setItem("connected", "injected");
        }
    };

    return (
        <div className="p-6 border-b border-neutral-800">
            {account ? (
                <div>
                    Connected to{" "}
                    <span className="text-xs text-neutral-400">
                        {account.slice(0, 6)}...{account.slice(account.length - 4)}
                    </span>
                    {account.slice(-1, -4)}{" "}
                </div>
            ) : (
                <button
                    className="border py-1 px-3 rounded-full border-neutral-800 shadow-md animate-pulse hover:bg-neutral-800 hover:animate-none"
                    onClick={handleClick}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}
        </div>
    );
};
export default ManualHeader;
