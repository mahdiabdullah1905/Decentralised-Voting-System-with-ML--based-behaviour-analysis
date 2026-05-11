
const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const balance = await provider.getBalance(address);
    console.log(`Balance of ${address}: ${ethers.formatEther(balance)} ETH`);

    const network = await provider.getNetwork();
    console.log(`Chain ID: ${network.chainId}`);
}

main().catch(console.error);
