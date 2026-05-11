const { ethers } = require("ethers");

async function main() {
    // Connect to local node
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Rich account (Hardhat Account #0)
    // Make sure to use the private key corresponding to 0xf39...
    // Hardhat default mnemonic: "test test test test test test test test test test test junk"
    // Or just use the signer from provider if unlocked (Hardhat node unlocks accounts by default)
    const signer = await provider.getSigner(0); // Account #0

    // Get target address from command line
    const targetAddress = process.argv[2];
    if (!targetAddress) {
        console.error("Please provide a target address as an argument.");
        console.error("Usage: node scripts/fund_wallet.cjs <ADDRESS>");
        process.exit(1);
    }

    console.log(`Funding ${targetAddress} with 100 ETH from ${await signer.getAddress()}...`);

    const tx = await signer.sendTransaction({
        to: targetAddress,
        value: ethers.parseEther("100.0")
    });

    console.log(`Transaction sent: ${tx.hash}`);
    await tx.wait();
    console.log("Funded successfully!");

    const newBalance = await provider.getBalance(targetAddress);
    console.log(`New Balance: ${ethers.formatEther(newBalance)} ETH`);
}

main().catch(console.error);
