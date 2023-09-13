import { BigNumber, ContractTransaction, ethers } from "ethers";
import Moralis from "moralis-v1";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../../../constants/index";
// @ts-ignore
import { useNotification } from "web3uikit";
import { PayloadType } from "web3uikit/dist/components/Notification/types";

interface contractAddressesInterface {
    [key: string]: string[];
}

const LotteryEntrance = (): JSX.Element => {
    // hooks
    const { chainId: chainIdHex, isWeb3Enabled, web3 } = useMoralis();
    const dispatch: (props: PayloadType) => void = useNotification();

    const [entranceFee, setEntranceFee] = useState<string>("");
    const [numPlayers, setNumPlayers] = useState<number>(0);
    const [recentWinner, setRecentWinner] = useState<string>("");

    // variables
    const addresses: contractAddressesInterface = contractAddresses;
    const chainId: number = parseInt(chainIdHex!);
    const raffleAddress: string | undefined =
        chainId in addresses ? addresses[chainId][0] : undefined;
    // console.log("=====> [debug] raffle address: " + raffleAddress)

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
            listenForRecentWinnerPicked();
        }
    }, [isWeb3Enabled]);

    // contract functions
    const { runContractFunction: enterRaffle } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress!,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    });

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress!,
        functionName: "getEntranceFee",
        params: {},
    });

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress!,
        functionName: "getNumberOfPlayers",
        params: {},
    });

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress!,
        functionName: "getRecentWinner",
        params: {},
    });

    const updateUI = async () => {
        const entranceFeeFromCall = ((await getEntranceFee()) as BigNumber).toString();
        setEntranceFee(entranceFeeFromCall);

        const numPlayersFromCall = await getNumberOfPlayers();
        setNumPlayers(Number(numPlayersFromCall));

        const recentWinnerFromCall = ((await getRecentWinner()) as BigNumber).toString();
        setRecentWinner(recentWinnerFromCall);
    };

    const handleSuccess = async (tx: ContractTransaction) => {
        await tx.wait(1);
        handleNotification(tx);
        updateUI();
    };

    const handleNotification = (tx: ContractTransaction) => {
        console.log("dispatching notification...");
        dispatch({
            type: "info",
            message: "transaction completed successfully",
            title: "Transaction notification",
            position: "topR",
            icon: "bell",
        });
    };

    const listenForRecentWinnerPicked = async () => {
        const provider = await Moralis.enableWeb3();
        const raffle = new ethers.Contract(raffleAddress!, abi, provider);
        console.log("=====> [debug] waiting for winner...");

        await new Promise<void>((resolve, reject) => {
            raffle.once("WinnerPicked", async () => {
                console.log("detected WinnerPicked event!");

                try {
                    await updateUI();
                    resolve();
                } catch (error) {
                    console.log(error);
                    reject(error);
                }
            });
        });
    };

    return (
        <div className="text-xs">
            Welcome to the raffle!
            {raffleAddress ? (
                <div>
                    <button
                        className="border border-neutral-600 rounded-full py-2 px-3 hover:bg-neutral-800 animate-pulse"
                        onClick={async () =>
                            await enterRaffle({
                                onSuccess: (tx) => handleSuccess(tx as ContractTransaction),
                                onError: (error) => console.log("error", error),
                            })
                        }
                    >
                        Enter Raffle{" "}
                    </button>{" "}
                    <div>
                        Entrance Fee:{" "}
                        <span className="text-xs text-neutral-400">
                            {entranceFee ? ethers.utils.formatUnits(entranceFee) : ""} ETH
                        </span>
                    </div>
                    <div>
                        Number of Players:{" "}
                        <span className="text-xs text-neutral-400">{numPlayers} players</span>
                    </div>
                    <div>
                        Recent Winner:{" "}
                        <span className="text-xs text-neutral-400">{recentWinner}</span>
                    </div>
                </div>
            ) : (
                <div> No Raffle address detected!</div>
            )}
        </div>
    );
};
export default LotteryEntrance;
