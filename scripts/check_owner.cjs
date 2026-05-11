
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    const artifactPath = path.resolve(__dirname, "../Frontend/src/abi/Voting.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    // The ABI in Frontend might be an array, or an object with abi field depending on how it was saved.
    // In Step 277 it was saved as the array directly.

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const contract = new ethers.Contract(contractAddress, artifact, provider);

    const owner = await contract.owner();
    console.log("Contract Owner Address:", owner);

    const signer = await provider.getSigner();
    console.log("Default Signer Address:", await signer.getAddress());
}

main().catch(console.error);
