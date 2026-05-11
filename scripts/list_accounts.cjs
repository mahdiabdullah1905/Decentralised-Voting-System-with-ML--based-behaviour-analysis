const { ethers } = require("ethers");

async function main() {
    try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        console.log("Connecting to Hardhat node...");

        const accounts = await provider.listAccounts();

        if (accounts.length === 0) {
            console.log("No accounts found. Is the Hardhat node running?");
            return;
        }

        console.log("Available Accounts (Top 5):");
        for (let i = 0; i < Math.min(accounts.length, 5); i++) {
            const account = accounts[i];
            const balance = await provider.getBalance(account.address);
            console.log(`#${i} ${account.address} : ${ethers.formatEther(balance)} ETH`);
        }
    } catch (error) {
        console.error("Error connecting to node:", error);
    }
}

main();
