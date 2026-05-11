

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { ethers } = require("hardhat");


async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;

  console.log("Deploying Voting contract...");



  const voting = await ethers.deployContract("Voting");



  await voting.waitForDeployment();

  console.log(
    `Voting contract deployed to ${voting.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
