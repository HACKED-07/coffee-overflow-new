#!/bin/bash

echo "🚀 Deploying Green Hydrogen Credits to Sepolia Testnet..."

# Check if environment variables are set
if [ -z "$SEPOLIA_URL" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Environment variables not set!"
    echo "Please set:"
    echo "export SEPOLIA_URL='https://sepolia.infura.io/v3/YOUR_PROJECT_ID'"
    echo "export PRIVATE_KEY='your_private_key'"
    echo ""
    echo "To get these values:"
    echo "1. Visit https://infura.io/ and create a project"
    echo "2. Get your Sepolia endpoint URL"
    echo "3. Export your private key from MetaMask"
    echo "4. Get Sepolia ETH from https://sepoliafaucet.com/"
    exit 1
fi

echo "✅ Environment variables configured"
echo "🔗 Sepolia URL: $SEPOLIA_URL"
echo "💼 Wallet: $(echo $PRIVATE_KEY | cut -c1-6)...$(echo $PRIVATE_KEY | cut -c-4)"

# Compile the contract
echo "🔨 Compiling contract..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed"
    exit 1
fi

echo "✅ Contract compiled successfully"

# Deploy to Sepolia
echo "🚀 Deploying to Sepolia testnet..."
npm run deploy:ethereum

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Contract deployed to Sepolia!"
    echo "📋 Next steps:"
    echo "   1. Update frontend with the contract address"
    echo "   2. Test real blockchain transactions"
    echo "   3. Verify contract on Etherscan"
else
    echo "❌ Deployment failed"
    exit 1
fi
