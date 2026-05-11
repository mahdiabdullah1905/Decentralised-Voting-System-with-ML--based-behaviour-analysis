const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    // 1. Setup Provider
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // 2. Get Contract Details
    // Using the address from VoteContext.tsx
    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    // Simple ABI for the functions we need
    const ABI = [
        "function owner() view returns (address)",
        "function getElectionStatus() view returns (bool, bool)",
        "function electionStarted() view returns (bool)",
        "function electionEnded() view returns (bool)"
    ];

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    console.log(`Checking status for contract at: ${CONTRACT_ADDRESS}`);

    try {
        // 3. Check Owner
        const owner = await contract.owner();
        console.log(`Contract Owner: ${owner}`);

        // 4. Check Status
        // Note: The frontend uses getElectionStatus which returns [started, ended]
        // But let's check individual vars if getElectionStatus isn't available or just to be sure
        try {
            const status = await contract.getElectionStatus();
            console.log(`getElectionStatus(): Started=${status[0]}, Ended=${status[1]}`);

            // Re-verify specific vars if they are public
            // const started = await contract.electionStarted();
            // const ended = await contract.electionEnded();
            // console.log(`Public Vars: Started=${started}, Ended=${ended}`);

        } catch (e) {
            console.log("getElectionStatus failed or not in ABI?");
            console.error(e);
        }

    } catch (error) {
        console.error("Error accessing contract:", error);
    }
}

main();
