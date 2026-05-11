
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner();

    const artifactPath = path.resolve(__dirname, "../artifacts/contracts/Voting.sol/Voting.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    const contract = await factory.deploy();

    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("Deployed to:", address);
}

main().catch(console.error);
