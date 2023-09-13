// @ts-ignore
import { ConnectButton } from "@web3uikit/web3";

const Header = () => {
    return (
        <div className="p-4 border-b-2 border-neutral-600 flex flex-row justify-between align-center">
            <h1 className="p-4 font-extralight text-2xl tracking-wider"> Decentralized Raffle </h1>
            <div className="py-2 px-4">
                <ConnectButton moralisAuth={false} />
            </div>
        </div>
    );
};
export default Header;
