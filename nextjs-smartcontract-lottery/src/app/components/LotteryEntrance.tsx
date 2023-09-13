import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../../../constants/index";
import { useEffect, useState } from "react";
import { ethers, BigNumber } from "ethers";

interface contractAddressesInterface {
    [key: string]: string[];
}

const LotteryEntrance = () => {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
    const [entranceFee, setEntranceFee] = useState<string>("");

    const addresses: contractAddressesInterface = contractAddresses;
    const chainId: number = parseInt(chainIdHex!);
    const raffleAddress: string | undefined = chainId in addresses ? addresses[chainId][0] : undefined;
    // console.log("=====> [debug] raffle address: " + raffleAddress)

    const { runContractFunction: enterRaffle } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress!,
        functionName: "enterRaffle",
        params: {},
        msgValue: "",
    });

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress!,
        functionName: "getEntranceFee"!,
        params: {},
    });

    useEffect(() => {
        if (isWeb3Enabled) {
            (async () => {
                const entranceFeeFromCall = ((await getEntranceFee()) as BigNumber).toString();
                setEntranceFee(ethers.utils.formatUnits(entranceFeeFromCall));
            })();
        }
    }, [isWeb3Enabled]);
    
    return (
        <div className="text-xs">
            {/* LotteryEntrance: <span className="text-xs text-neutral-400">{entranceFee} ETH</span> */}
            Entrance Fee: <span className="text-xs text-neutral-400">{entranceFee} ETH</span>
        </div>
    );
};
export default LotteryEntrance;
