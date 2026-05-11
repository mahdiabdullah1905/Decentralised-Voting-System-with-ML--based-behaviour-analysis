
const hre = require("hardhat");

async function main() {
    console.log("Deploying Voting contract...");

    const voting = await hre.ethers.deployContract("Voting");

    await voting.waitForDeployment();

    console.log(
        `Voting contract deployed to ${voting.target}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
