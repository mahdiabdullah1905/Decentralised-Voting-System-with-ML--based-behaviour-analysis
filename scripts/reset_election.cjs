const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(0);
    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    // ABI
    const abis = [
        "function resetElection() public",
        "function getElectionStatus() view returns (bool, bool)"
    ];

    const contract = new ethers.Contract(CONTRACT_ADDRESS, abis, signer);

    console.log(`Connecting to ${CONTRACT_ADDRESS}...`);

    try {
        const [started, ended] = await contract.getElectionStatus();
        console.log(`Status BEFORE: Started=${started}, Ended=${ended}`);

        console.log("Resetting Election...");
        const tx = await contract.resetElection();
        await tx.wait();
        console.log("Election Reset Successfully!");

        const [s2, e2] = await contract.getElectionStatus();
        console.log(`Status AFTER: Started=${s2}, Ended=${e2}`);

    } catch (e) {
        console.error("Error:", e);
    }
}
main();
