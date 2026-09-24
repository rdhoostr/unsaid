//Unsaid Smart Contract Configuration

const NETWORKS = {
    testnet: {
        chainId: "0x3C8", //968 in hex
        chainName: "BOT Chain Testnet",
        nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
        rpcUrls: ["https://rpc.bohr.life"],
        blockExplorerUrls: ["https://scan.bohr.life/"],
        contractAddress: "0x2294Ec87eC1e7DD00b58824933fAB8BbB5Dc3F9F"
    },
    mainnet: {
        chainId: "0x2A5", //677 in hex
        chainName: "BOT Chain Mainnet",
        nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
        rpcUrls: ["https://rpc.botchain.ai"],
        blockExplorerUrls: ["https://scan.botchain.ai/"],
        contractAddress: "0x2294Ec87eC1e7DD00b58824933fAB8BbB5Dc3F9F"
    }
};

let currentNetworkKey = localStorage.getItem('unsaid_network') || 'testnet';

function getCurrentNetworkParams() {
    return NETWORKS[currentNetworkKey] || NETWORKS.testnet;
}

function setNetworkKey(key) {
    if (NETWORKS[key]) {
        currentNetworkKey = key;
        localStorage.setItem('unsaid_network', key);
    }
}

function getActiveContractAddress() {
    return getCurrentNetworkParams().contractAddress;
}

//Global getters for backward compatibility
Object.defineProperty(window, 'BOT_CHAIN_PARAMS', {
    get: function() { return getCurrentNetworkParams(); },
    configurable: true
});

Object.defineProperty(window, 'CONTRACT_ADDRESS', {
    get: function() { return getActiveContractAddress(); },
    configurable: true
});

const CONTRACT_ABI = [
    "function getTotalConfessions() public view returns (uint256)",
    "function getConfession(uint256 _id) public view returns (address author, string memory text, uint256 timestamp)",
    "function postConfession(string memory _text) public",
    "function react(uint256 _id, uint8 _reactionType) public",
    "function getReactionCounts(uint256 _id) public view returns (uint256 love, uint256 relate, uint256 respect, uint256 brave, uint256 shook, uint256 anxious, uint256 painful)"
];

//Helper to get JsonRpcProvider
function getReadOnlyProvider() {
    const net = getCurrentNetworkParams();
    return new ethers.JsonRpcProvider(net.rpcUrls[0]);
}

//Helper to get ReadOnly Contract Instance
function getReadOnlyContract() {
    const provider = getReadOnlyProvider();
    const address = getActiveContractAddress();
    return new ethers.Contract(address, CONTRACT_ABI, provider);
}

//Helper to get Signer Contract Instance via MetaMask
async function getSignerContract() {
    if (!window.ethereum) throw new Error("MetaMask is not installed");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = getActiveContractAddress();
    return new ethers.Contract(address, CONTRACT_ABI, signer);
}
