# 🤫 Unsaid — The Things Left Unsaid

> An anonymous, on-chain confession wall built for the **Build Week Hackathon Vol.2** on BOT Chain Layer 1.

🌐 **Live Site:** [thingsleftunsaid.site](https://thingsleftunsaid.site)  
🤖 **BOT Chain Official:** [botchain.ai](https://www.botchain.ai/en/)  
🔍 **BOT Chain Explorer:** [scan.botchain.ai](https://scan.botchain.ai/)  
📜 **Mainnet Contract Explorer:** [View Contract on BOT Scan](https://scan.botchain.ai/address/0x2294Ec87eC1e7DD00b58824933fAB8BbB5Dc3F9F)

---

## 📖 What This Is

**Unsaid** is a decentralized application (DApp) built on **BOT Chain Layer 1**. It allows anyone to connect a wallet and post a short, anonymous confession, thought, or truth they've never said out loud.

Every confession is **permanently and unchangeably recorded on the blockchain** — nobody, including the developer, can edit or delete it after it's posted.

The wall stays fully anonymous because no names or personal accounts are used. Each post is tied strictly to a wallet address, which proves the poster is a real, unique person without revealing their identity.

---

## 🚀 How It Works

1. **Browse the wall** — Anyone can read all confessions without connecting a wallet. Disconnected users get a 3-click random confession preview before being prompted to connect.
2. **Connect Wallet** — Link your MetaMask wallet to unlock the full feed, posting, and reactions.
3. **Post a Confession** — Type a confession (up to 280 characters) and post it. This sends a small blockchain transaction with sub-second finality, paying micro-gas in BOT.
4. **Instant Visibility** — Your confession appears immediately on the wall, alongside your (shortened) wallet address and the time it was posted.
5. **React** — Anyone (connected) can react to a confession with a variety of emojis to show quiet solidarity, without commenting.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Connect & Persist Wallet** | Links a MetaMask wallet. Connection persists across page navigations and survives refreshes. Auto-disconnects after 30 minutes of inactivity. |
| 📝 **Post a Confession** | Write and submit up to 280 characters, permanently stored on-chain. |
| 🧱 **Full Confession Wall** | Scrollable feed of every confession ever posted, with animated card entries. |
| 🔎 **Filter & Sort** | Sort the wall by Newest or Most Hugged. |
| 🤝 **Ecosystem & Partnerships** | Dedicated landing page section highlighting BOT Chain Protocol and BOT Scan Explorer with direct links. |
| 📊 **Live Dual-Network Counter** | The landing page shows the combined total of confessions from both Testnet and Mainnet. |
| 🫂 **7 Emoji Reactions** | React with ❤️ 🫂 👏 🔥 😳 😰 😣 — each recorded on-chain. Optimistic UI updates for instant feedback without page reload. |
| 🎲 **Random Confession** | Surface a random confession from the wall. Disconnected users get a 3-click preview before being prompted to connect. |
| 📖 **Read More Modal** | Long confessions are truncated on the card. A "Read more" button opens a clean modal for the full text. |
| 🌐 **Network Switcher** | Seamlessly switch between BOT Chain Testnet and Mainnet from the navbar pill. |
| 🔔 **Toast Notifications** | Non-blocking, auto-dismissing toast alerts for every action outcome. |
| 🚪 **Disconnect Confirmation** | A dropdown confirmation prevents accidental disconnections. |
| ✨ **Smooth Page Transitions** | Cinematic enter/exit animations between the landing page and confession wall. |
| 📱 **Responsive Design** | Liquid-glass navbar, adaptive card grid, works on mobile and desktop. |

## 📜 Smart Contract

The smart contract is written in Solidity (`^0.8.20`) and located at:
`contracts/Unsaid.sol` ([View Unsaid.sol](contracts/Unsaid.sol))

Key contract functions:
- `postConfession(string memory _text)`: Submits a new confession (max 280 characters). Emits `ConfessionPosted`.
- `react(uint256 _id, uint8 _reactionType)`: Records an on-chain reaction (Love, Relate, Respect, Brave, Shook, Anxious, Painful). Emits `ReactionGiven`.
- `confessions(uint256 index)` & `reactions(uint256 id, uint8 type)`: Public getter mappings for on-chain state inspection.

---

## 🚀 How to Use

1. **Visit the Web Application**: Open [thingsleftunsaid.site](https://thingsleftunsaid.site) in your browser.
2. **Browse Without Wallet**: Anyone can read confessions on the wall immediately without connecting a wallet.
3. **Connect Your Wallet**: Click "Connect Wallet" (MetaMask) in the navbar to unlock posting and reactions.
4. **Select Network**: Use the liquid-glass network switcher in the navbar to choose between **BOT Chain Mainnet** or **BOT Chain Testnet**.
5. **Publish a Confession**: Enter up to 280 characters in the text area and click "Post Confession". Confirm the transaction in MetaMask (sub-second finality on BOT Chain).
6. **React On-Chain**: Tap any of the 7 reaction pills under a confession card to record your reaction on-chain.

---

## 🌍 Deployment

| Network | Chain ID | RPC Endpoint | Contract Address | Explorer Link |
|---|---|---|---|---|
| **BOT Chain Testnet** | `968` | `https://rpc.bohr.life` | `0x2294Ec87eC1e7DD00b58824933fAB8BbB5Dc3F9F` | [View on Testnet Explorer](https://scan.bohr.life/address/0x2294Ec87eC1e7DD00b58824933fAB8BbB5Dc3F9F) |
| **BOT Chain Mainnet** | `677` | `https://rpc.botchain.ai` | `0x2294Ec87eC1e7DD00b58824933fAB8BbB5Dc3F9F` | [View on BOT Scan](https://scan.botchain.ai/address/0x2294Ec87eC1e7DD00b58824933fAB8BbB5Dc3F9F) |

**Application URLs:**
- **Landing Page (Root):** `https://thingsleftunsaid.site/`
- **Confession Wall DApp:** `https://thingsleftunsaid.site/confession/`
- **BOT Chain Website:** `https://www.botchain.ai/en/`
- **BOT Chain Explorer:** `https://scan.botchain.ai/`

---

## 📁 Project Structure

```
unsaid/
├── index.html              # Landing page (Root - thingsleftunsaid.site/)
├── confession/
│   └── index.html          # Confession wall DApp (thingsleftunsaid.site/confession/)
├── css/
│   ├── style.css           # Landing page styles & design tokens
│   └── app.css             # Confession wall DApp styles & glass UI
├── js/
│   ├── contract.js         # Smart contract configuration & ethers.js helpers
│   ├── landing.js          # Landing page logic & dual-network counter
│   └── app.js              # DApp logic (wallet, feed, reactions, modals, 3-click limit)
├── contracts/
│   └── Unsaid.sol          # Smart contract source code
└── img/
    ├── logo.png            # Unsaid logo (amber circle)
    ├── BotChainlogo.png    # Official BOT Chain hero badge logo
    ├── bot-logo-dark.png   # BOT Chain mark logo
    ├── bot-full-logo-dark.png # BOT Chain full horizontal logo
    └── favicon.ico         # Browser tab favicon
```

---

## 🚫 What's Not Included (By Design)

- ❌ **Editing or Deleting Confessions** — Blockchain data is permanent by design.
- ❌ **Usernames or Logins** — Posts are tied only to a wallet address to preserve anonymity.
- ❌ **Comment Threads** — Kept out of scope to keep the core action simple and reliable.
- ❌ **Backend/Database** — 100% on-chain and frontend-only. No server, no database.
