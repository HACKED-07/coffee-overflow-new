# 🚀 Solana Program Deployment Guide

## 📋 Prerequisites

1. **Install Solana CLI**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

2. **Install Anchor CLI**
   ```bash
   npm install -g @coral-xyz/anchor-cli
   ```

3. **Verify installations**
   ```bash
   solana --version
   anchor --version
   ```

## 🔑 Wallet Setup

1. **Create a new wallet** (or use existing)
   ```bash
   solana-keygen new
   ```

2. **Set to devnet**
   ```bash
   solana config set --url devnet
   ```

3. **Get devnet SOL**
   ```bash
   solana airdrop 2
   ```

## 🏗️ Build & Deploy

1. **Build the program**
   ```bash
   npm run build:program
   ```

2. **Deploy to devnet**
   ```bash
   npm run deploy:program
   ```

3. **Update program ID** (if different)
   - Copy the new program ID from deployment output
   - Update `declare_id!()` in `lib.rs`
   - Update `Anchor.toml`
   - Rebuild and redeploy

## 🔍 Verify Deployment

1. **Check program on Solana Explorer**
   ```
   https://explorer.solana.com/address/[PROGRAM_ID]?cluster=devnet
   ```

2. **Check program status**
   ```bash
   solana program show [PROGRAM_ID]
   ```

## 🧪 Testing

1. **Start the frontend**
   ```bash
   npm run dev
   ```

2. **Connect wallet** in the UI
3. **Test each function**:
   - Create facility
   - Issue credits
   - Validate credits
   - Transfer credits

## 🚨 Troubleshooting

### **Build Errors**
- Ensure Rust and Cargo are up to date
- Check Anchor version compatibility
- Verify all dependencies in `Cargo.toml`

### **Deployment Errors**
- Ensure sufficient SOL balance
- Check network connectivity
- Verify program ID uniqueness

### **Runtime Errors**
- Check program logs: `solana logs [PROGRAM_ID]`
- Verify account creation and permissions
- Check transaction signatures

## 📚 Resources

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Book](https://book.anchor-lang.com/)
- [Solana Devnet Faucet](https://faucet.solana.com/)
- [Solana Explorer](https://explorer.solana.com/)

---

**🌍 Your Green Hydrogen Credit System is now running on Solana blockchain!**
