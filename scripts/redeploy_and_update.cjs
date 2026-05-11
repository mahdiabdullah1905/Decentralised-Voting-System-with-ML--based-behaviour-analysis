const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Deploying Smart Contract...");

    // Connect to hardhat node
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = await provider.getSigner(0); // Account #0

    // Read compiled artifact
    const artifactPath = path.join(__dirname, "../artifacts/contracts/Voting.sol/Voting.json");
    if (!fs.existsSync(artifactPath)) {
        console.error("❌ Artifact not found! Please run 'npx hardhat compile' first.");
        return;
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Deploy
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log(`✅ Contract Deployed at: ${address}`);

    // Update Frontend Context
    const contextPath = path.join(__dirname, "../Frontend/src/contexts/VoteContext.tsx");
    let content = fs.readFileSync(contextPath, "utf8");

    // Regex replace the address
    const newContent = content.replace(
        /const CONTRACT_ADDRESS = "0x[a-fA-F0-9]{40}";/,
        `const CONTRACT_ADDRESS = "${address}";`
    );

    if (content !== newContent) {
        fs.writeFileSync(contextPath, newContent);
        console.log(`✅ Updated VoteContext.tsx with new address.`);
    } else {
        console.log("⚠️ Address was already up to date or pattern not found.");
    }

    console.log("🎉 System Ready! Frontend should auto-reload.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
