import { ethers } from "./ethers-6.7.0.esm.min.js";
const getEl = (el) => document.getElementById(el);
const addText = (element, text) => (element.textContent = text);

const connectButton = getEl("btnConnect");
const fundButton = getEl("btnFund");

const connect = async () => {
    if (typeof window.ethereum != "undefined") {
        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            console.log("=====> account", accounts);
            addText(connectButton, "Connected");
        } catch (error) {
            console.error(error);
        }
    } else {
        addText(connectButton, "Please install metamask");
    }
};

const fund = async (ethAmount) => {
    const { deployer } = ethers;
    console.log(deployer);
};

connectButton.onclick = connect;
fundButton.onclick = fund;