import { ethers } from "./ethers-6.7.0.esm.min.js";
import { abi } from "./constants.js";
import { contractAddress } from "./constants.js";

const getEl = (el) => document.getElementById(el);
const addText = (element, text) => (element.textContent = text);

const connectButton = getEl("btnConnect");
const fundButton = getEl("btnFund");
const balanceButton = getEl("btnBalance");
const withdrawButton = getEl("btnWithdraw");

const connect = async () => {
    if (typeof window.ethereum != "undefined") {
        try {
            const account = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            console.log("=====> account", account);
            addText(connectButton, "Connected");
        } catch (error) {
            console.error(error);
        }
    } else {
        addText(connectButton, "Please install metamask");
    }
};

const getBalance = async () => {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        
        console.log('=====> balance: ' , ethers.formatEther(balance));
    }
}
const fund = async () => {
    // provider / connection to the blockchain
    // signer / wallet / someone with gas
    // contract that we are interacting with
    // ABI & address
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    console.log("=====> signer: ", signer);
    const contract = new ethers.Contract(contractAddress, abi, signer);

    const ethAmount = getEl("ethAmount").value
    console.log(`=====> funding with: ${ethAmount} ETH`);

    try {
        const txResponse = await contract.fund({
            value: ethers.parseEther(ethAmount),
        });
        // listen for this tx to finish
        await listenForTransactionMine(txResponse, provider);
        console.log('=====> done!');
        // listen for an event
    } catch (error) {
        console.error(error);
    }
};

const withdraw = async () => {
    if (typeof window.ethereum !== "undefined") {
        console.log('=====> withdrawing...');
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        
        
        try {
            const txResponse = await contract.connect(signer).withdraw()
            await listenForTransactionMine(txResponse, provider);
        } catch (error) {
            console.log(error);
        }
    }
}

const listenForTransactionMine = (transactionResponse, provider) => {
    console.log(`=====> mining: ${transactionResponse.hash}... `);
    
    return new Promise((resolve, reject) => {
        try {            
            // listen for this transaction to finish
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(`=====> completed with: ${transactionResponse.confirmations} confirmations`);
                resolve()
            })
        } catch (error) {
            reject(error);
        }
    })
};

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
