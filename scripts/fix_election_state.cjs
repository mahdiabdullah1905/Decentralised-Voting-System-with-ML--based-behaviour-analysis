const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(0);
    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    // ABI
    const abis = [
        "function startElection() public",
        "function getElectionStatus() view returns (bool, bool)",
        "function owner() view returns (address)"
    ];

    const contract = new ethers.Contract(CONTRACT_ADDRESS, abis, signer);

    console.log(`Connecting to ${CONTRACT_ADDRESS}...`);

    try {
        const [started, ended] = await contract.getElectionStatus();
        console.log(`Current Blockchain Status: Started=${started}, Ended=${ended}`);

        if (!started && !ended) {
            console.log("State Mismatch Detected: Frontend says 'Active', Blockchain says 'Not Started'.");
            console.log("Fixing: Force Starting election on blockchain...");

            const tx = await contract.startElection();
            await tx.wait();

            console.log("SUCCESS: Election Started on Blockchain.");
            console.log("You can now click 'End Election' in the Admin Panel.");
        } else {
            console.log("Blockchain status seems consistent with 'Active' or 'Ended'. No fix needed?");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
main();
