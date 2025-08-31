const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying GreenHydrogenCredits contract to Sepolia testnet...");

  // Get the contract factory
  const GreenHydrogenCredits = await ethers.getContractFactory("GreenHydrogenCredits");

  // Deploy the contract
  console.log("📝 Deploying contract...");
  const greenHydrogenCredits = await GreenHydrogenCredits.deploy();

  // Wait for deployment to finish
  await greenHydrogenCredits.waitForDeployment();

  const contractAddress = await greenHydrogenCredits.getAddress();

  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔗 Sepolia Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);

  console.log("");
  console.log("📋 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Update src/config/blockchain.ts with the new address");
  console.log("3. Update your .env file with the contract address");
  console.log("4. Test the contract on Sepolia testnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
