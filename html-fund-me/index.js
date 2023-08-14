import { ethers } from "./ethers-6.7.0.esm.min.js";
const addText = (element, text) =>
    (document.getElementById(element).textContent = text);
const getEl = (el) => document.getElementById(el);

const connect = async () => {
    if (typeof window.ethereum != "undefined") {
        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            console.log("=====> account", accounts);
            addText("btnConnect", "Connected");
        } catch (error) {
            console.error(error);
        }
    } else {
        addText("btnConnect", "Please install metamask");
    }
};

const fund = async (ethAmount) => {
    const { deployer } = ethers;
    console.log(deployer);
};

const connectButton = getEl("btnConnect");
const fundButton = getEl("btnFund");

connectButton.onclick = connect
fundButton.onclick = fund