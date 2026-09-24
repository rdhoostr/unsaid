//Unsaid DApp Application Logic

const REACTION_TYPES = [
    { type: 0, emoji: '❤️',  label: 'Love' },
    { type: 1, emoji: '🫂',  label: 'Hug' },
    { type: 2, emoji: '👏',  label: 'Clap' },
    { type: 3, emoji: '🔥',  label: 'Fire' },
    { type: 4, emoji: '😳',  label: 'Shook' },
    { type: 5, emoji: '😰',  label: 'Anxious' },
    { type: 6, emoji: '😣',  label: 'Painful' }
];

const DEFAULT_CONFESSIONS = [
    {
        id: 'default-1',
        author: '0x71b289ac23d510e4782049182390a19e28399e4f',
        content: "I still check their instagram every single day and I hate that I do it.",
        timestamp: Date.now() - 3600000 * 5,
        reactions: { '❤️': 12, '🫂': 8, '👏': 3, '🔥': 2, '😳': 1, '😰': 0, '😣': 4 },
        userReactions: {}
    },
    {
        id: 'default-2',
        author: '0x4c1f92a1048b29f9e8a01124578192304918a73b',
        content: "I told my team I finished the report. I haven't started it.",
        timestamp: Date.now() - 3600000 * 12,
        reactions: { '❤️': 2, '🫂': 14, '👏': 5, '🔥': 1, '😳': 18, '😰': 9, '😣': 2 },
        userReactions: {}
    },
    {
        id: 'default-3',
        author: '0xde0912f982390ab128c7349102930192849112bc',
        content: "I'm genuinely proud of the thing I'm building right now.",
        timestamp: Date.now() - 3600000 * 24,
        reactions: { '❤️': 21, '🫂': 9, '👏': 16, '🔥': 15, '😳': 3, '😰': 0, '😣': 0 },
        userReactions: {}
    },
    {
        id: 'default-4',
        author: '0x94821a083b4712d930198402910492819042918a',
        content: "I pretended to forget my birthday so no one would feel obligated to care.",
        timestamp: Date.now() - 3600000 * 36,
        reactions: { '❤️': 7, '🫂': 29, '👏': 4, '🔥': 2, '😳': 6, '😰': 5, '😣': 11 },
        userReactions: {}
    },
    {
        id: 'default-5',
        author: '0x3194819a8471209384918230948129038149019b',
        content: "I moved across the country just to escape being the person everyone expected me to be.",
        timestamp: Date.now() - 3600000 * 48,
        reactions: { '❤️': 15, '🫂': 11, '👏': 22, '🔥': 8, '😳': 4, '😰': 2, '😣': 3 },
        userReactions: {}
    }
];

let confessions = [...DEFAULT_CONFESSIONS];
let userAddress = null;
let currentFilter = 'newest';
let currentModalId = null;
let isLoading = false;
const READ_MORE_LIMIT = 120; // chars before truncation

//Toast Notification System
function showToast(message, type = "info") {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<span class="toast-dot"></span><span class="toast-msg">${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

//Format Utilities
function formatAddress(addr) {
    if (!addr) return "0x••••…••••";
    return `${addr.substring(0, 6)}…${addr.substring(addr.length - 4)}`;
}

function formatTimeAgo(ts) {
    const seconds = Math.floor((Date.now() - ts) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function getTotalReactions(item) {
    if (!item.reactions) return 0;
    return Object.values(item.reactions).reduce((sum, val) => sum + val, 0);
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

//Render Feed
function renderWall() {
    const grid = document.getElementById('wallGrid');
    if (!grid) return;
    
    if (isLoading) {
        grid.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--muted)">Loading confessions from BOT Chain...</div>';
        return;
    }

    if (confessions.length === 0) {
        const netName = currentNetworkKey === 'mainnet' ? 'BOT Chain Mainnet' : 'BOT Chain Testnet';
        grid.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--muted)">No confessions on ${netName} yet. Be the first to speak.</div>`;
        return;
    }

    grid.innerHTML = '';

    let sorted = [...confessions];
    if (currentFilter === 'newest') {
        sorted.sort((a, b) => b.timestamp - a.timestamp);
    } else if (currentFilter === 'hugs') {
        sorted.sort((a, b) => getTotalReactions(b) - getTotalReactions(a));
    }

    // If not connected, show only 2 items then a connect banner
    const displayList = userAddress ? sorted : sorted.slice(0, 2);

    displayList.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = `confession-card ${item.isNew ? 'newly-added' : ''}`;
        card.style.animationDelay = `${idx * 55}ms`;

        const isLong = item.content.length > READ_MORE_LIMIT;
        const displayContent = isLong
            ? escapeHtml(item.content.substring(0, READ_MORE_LIMIT)).trimEnd() + '&hellip;'
            : escapeHtml(item.content);
        const readMoreBtn = isLong
            ? `<button class="read-more-btn" onclick="openReadMoreModal(${JSON.stringify(item.id)})">Read more</button>`
            : '';

        card.innerHTML = `
            <div class="confession-body-wrapper">
                <div class="quote-mark left">“</div>
                <div class="confession-body">${displayContent}</div>
                <div class="quote-mark right">”</div>
            </div>
            ${readMoreBtn}
            <div class="confession-footer">
                <div class="poster-meta">
                    <span class="poster-addr">${formatAddress(item.author)}</span>
                    <span class="poster-separator">·</span>
                    <span class="poster-time">${formatTimeAgo(item.timestamp)}</span>
                </div>
                <div class="confession-reactions-wrapper">
                    <div class="reaction-bar">
                        ${renderReactionPills(item)}
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    // Show connect-to-see-more banner if disconnected
    if (!userAddress && sorted.length > 0) {
        const banner = document.createElement('div');
        banner.className = 'connect-more-banner';
        banner.innerHTML = `
            <div class="connect-more-inner">
                <div class="connect-more-glow"></div>
                <div class="connect-more-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="3"/>
                        <path d="M1 10h22"/>
                        <rect x="16" y="14" width="4" height="3" rx="1" fill="currentColor" stroke="none"/>
                    </svg>
                </div>
                <p class="connect-more-title">Connect your wallet to see more confessions</p>
                <p class="connect-more-sub">All confessions are anonymous &amp; permanent on-chain. Connect once to unlock the full wall.</p>
                <button class="connect-more-btn" onclick="toggleWallet()">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.4"/>
                        <path d="M1 7h14" stroke="currentColor" stroke-width="1.4"/>
                        <rect x="11" y="9" width="2.5" height="2" rx="0.5" fill="currentColor"/>
                    </svg>
                    Connect Wallet
                </button>
            </div>
        `;
        grid.appendChild(banner);
    }

    const headerCount = document.getElementById('headerCount');
    if (headerCount) headerCount.textContent = confessions.length;
}

function renderReactionPills(item) {
    return REACTION_TYPES.map(rt => {
        const count = (item.reactions && item.reactions[rt.emoji]) || 0;
        const isActive = item.userReactions && item.userReactions[rt.emoji];
        return `
            <button class="reaction-pill ${isActive ? 'active' : ''}" onclick="toggleReaction(${item.id}, ${rt.type}, '${rt.emoji}')" title="${rt.label}">
                <span class="emoji">${rt.emoji}</span>
                <span class="reaction-count">${count}</span>
            </button>
        `;
    }).join('');
}

//Filter Controls
function setFilter(filter, btn) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderWall();
}

//Wallet Connection
function toggleDisconnectDropdown(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('disconnectDropdownMenu');
    if (menu) menu.classList.toggle('open');
}

function disconnectWallet() {
    // Close disconnect dropdown
    const menu = document.getElementById('disconnectDropdownMenu');
    if (menu) menu.classList.remove('open');
    // Clear persisted session
    localStorage.removeItem('unsaid_wallet_connected');
    userAddress = null;
    randomClicks = 0;
    updateWalletUI();
    renderWall();
    showToast("Wallet disconnected", "info");
}

async function toggleWallet() {
    if (userAddress) return; // Non-clickable when connected; use disconnect button instead

    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = accounts[0];
            // Persist connection intent
            localStorage.setItem('unsaid_wallet_connected', '1');
            updateWalletUI();
            renderWall();
            showToast(`Connected: ${formatAddress(userAddress)}`, "success");
            // Fetch full feed now that wallet is connected
            await fetchConfessionsFromChain();
            // Check and switch chain if needed
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== BOT_CHAIN_PARAMS.chainId) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: BOT_CHAIN_PARAMS.chainId }],
                    });
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [BOT_CHAIN_PARAMS],
                        });
                    }
                }
            }
        } catch (err) {
            showToast("Failed to connect wallet", "error");
        }
    } else {
        showToast("Please install MetaMask to connect", "warning");
    }
}

function updateWalletUI() {
    const btnText = document.getElementById('walletBtnText');
    const btnIcon = document.getElementById('walletBtnIcon');
    const posterBadge = document.getElementById('posterBadge');
    const btnConnect = document.getElementById('btnConnect');
    const btnDisconnect = document.getElementById('btnDisconnect');
    const navActions = document.querySelector('.nav-actions');

    if (userAddress) {
        if (btnText) btnText.textContent = formatAddress(userAddress);
        if (btnIcon) btnIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M4 7l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        if (posterBadge) posterBadge.textContent = formatAddress(userAddress);
        if (btnConnect) {
            btnConnect.classList.add('connected');
            btnConnect.disabled = true;
        }
        if (btnDisconnect) btnDisconnect.style.display = 'inline-flex';
        if (navActions) navActions.classList.remove('wallet-disconnected');
    } else {
        if (btnText) btnText.textContent = "Connect Wallet";
        if (btnIcon) btnIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M1 7h14" stroke="currentColor" stroke-width="1.4"/><rect x="11" y="9" width="2.5" height="2" rx="0.5" fill="currentColor"/></svg>`;
        if (posterBadge) posterBadge.textContent = "Disconnected";
        if (btnConnect) {
            btnConnect.classList.remove('connected');
            btnConnect.disabled = false;
        }
        if (btnDisconnect) btnDisconnect.style.display = 'none';
        if (navActions) navActions.classList.add('wallet-disconnected');
    }

    updateNetworkUI();
}

//Post Confession
async function postConfession() {
    const confessionInput = document.getElementById('confessionInput');
    const text = confessionInput ? confessionInput.value.trim() : '';
    if (!text) {
        showToast("Please write a confession first", "warning");
        return;
    }

    if (!userAddress) {
        showToast("Please connect your wallet first", "warning");
        return;
    }

    const btnPost = document.getElementById('btnPost');
    if (btnPost) {
        btnPost.disabled = true;
        btnPost.innerHTML = `<span>Posting...</span>`;
    }

    try {
        const contract = await getSignerContract();
        const tx = await contract.postConfession(text);
        showToast("Transaction submitted — waiting for confirmation...", "info");
        await tx.wait();
        showToast("Confession recorded permanently on BOT Chain.", "success");
        
        if (confessionInput) confessionInput.value = '';
        const charCounter = document.getElementById('charCounter');
        if (charCounter) charCounter.textContent = '280 characters left';
        
        // Reload all
        await fetchConfessionsFromChain();
    } catch (err) {
        console.error(err);
        showToast("Could not submit post", "error");
    } finally {
        if (btnPost) {
            btnPost.disabled = false;
            btnPost.innerHTML = `<span>Post Anonymously</span><span>→</span>`;
        }
    }
}

//Toggle Reaction
async function toggleReaction(id, typeId, emoji) {
    if (!userAddress) {
        showToast("Please connect your wallet to react", "warning");
        return;
    }

    const item = confessions.find(c => c.id === id);
    if (!item) return;

    if (!item.reactions) item.reactions = {};
    if (!item.userReactions) item.userReactions = {};

    const wasActive = !!item.userReactions[emoji];
    if (wasActive) {
        showToast("You have already reacted to this.", "info");
        return; 
    }

    try {
        const contract = await getSignerContract();
        const tx = await contract.react(id, typeId);
        showToast(`Sending reaction...`, "info");
        
        // Optimistic UI update
        item.userReactions[emoji] = true;
        item.reactions[emoji] = (item.reactions[emoji] || 0) + 1;
        renderWall();
        if (currentModalId === id) {
            const modalReactions = document.getElementById('modalReactions');
            if (modalReactions) modalReactions.innerHTML = renderReactionPills(item);
        }
        
        await tx.wait();
        showToast(`Reaction recorded.`, "success");
        // Keep optimistic update — no full reload needed
    } catch (e) {
        console.error(e);
        showToast("Failed to react", "error");
        // Revert optimistic update
        item.userReactions[emoji] = false;
        item.reactions[emoji] = (item.reactions[emoji] || 0) - 1;
        renderWall();
    }
}

//Random Confession Modal
let seenConfessionIds = new Set();
let randomClicks = 0;

function drawRandomConfession() {
    if (!userAddress) {
        if (randomClicks >= 3) {
            closeModal();
            showToast("Connect your wallet to see more random confessions", "warning");
            toggleWallet();
            return;
        }
        randomClicks++;
    }

    const list = confessions;
    if (list.length === 0) {
        showToast("No confessions to show yet.", "info");
        return;
    }

    // Filter to posts not yet seen in this cycle
    let unseen = list.filter(c => !seenConfessionIds.has(c.id));

    // If all posts in the list have been seen, reset the set (keep currentModalId to prevent immediate repeat)
    if (unseen.length === 0) {
        seenConfessionIds.clear();
        if (currentModalId !== null) {
            seenConfessionIds.add(currentModalId);
        }
        unseen = list.filter(c => !seenConfessionIds.has(c.id));
        if (unseen.length === 0) unseen = list; // Safety fallback
    }

    // Pick a random confession from unseen pool
    const item = unseen[Math.floor(Math.random() * unseen.length)];
    seenConfessionIds.add(item.id);
    currentModalId = item.id;

    setModalMode('random');

    const modalText = document.getElementById('modalText');
    const modalAddr = document.getElementById('modalAddr');
    const modalTime = document.getElementById('modalTime');
    const modalReactions = document.getElementById('modalReactions');

    // Smooth transition if text is already visible
    if (modalText && modalText.classList) {
        modalText.classList.add('animating');
        setTimeout(() => {
            modalText.textContent = item.content;
            modalText.classList.remove('animating');
        }, 150);
    } else if (modalText) {
        modalText.textContent = item.content;
    }

    if (modalAddr) modalAddr.textContent = formatAddress(item.author);
    if (modalTime) modalTime.textContent = formatTimeAgo(item.timestamp);
    if (modalReactions) modalReactions.innerHTML = renderReactionPills(item);

    const randomModal = document.getElementById('randomModal');
    if (randomModal) randomModal.classList.add('active');
}

function closeModal() {
    const randomModal = document.getElementById('randomModal');
    if (randomModal) randomModal.classList.remove('active');
    currentModalId = null;
    // Reset mode to random for next open
    setModalMode('random');
}

function setModalMode(mode) {
    const btnShuffle = document.getElementById('btnShuffle');
    const modalTitle = document.getElementById('modalTitle');
    const modalBadgeSparkle = document.getElementById('modalBadgeSparkle');

    if (mode === 'readmore') {
        if (btnShuffle) btnShuffle.style.display = 'none';
        if (modalTitle) modalTitle.textContent = 'Read Confession';
        if (modalBadgeSparkle) modalBadgeSparkle.textContent = '❡';
    } else {
        if (btnShuffle) btnShuffle.style.display = '';
        if (modalTitle) modalTitle.textContent = 'Random Confession';
        if (modalBadgeSparkle) modalBadgeSparkle.textContent = '✦';
    }
}

function openReadMoreModal(itemId) {
    const item = confessions.find(c => c.id === itemId || c.id === Number(itemId));
    if (!item) return;

    currentModalId = item.id;
    setModalMode('readmore');

    const modalText = document.getElementById('modalText');
    const modalAddr = document.getElementById('modalAddr');
    const modalTime = document.getElementById('modalTime');
    const modalReactions = document.getElementById('modalReactions');

    if (modalText) modalText.textContent = item.content;
    if (modalAddr) modalAddr.textContent = formatAddress(item.author);
    if (modalTime) modalTime.textContent = formatTimeAgo(item.timestamp);
    if (modalReactions) modalReactions.innerHTML = renderReactionPills(item);

    const randomModal = document.getElementById('randomModal');
    if (randomModal) randomModal.classList.add('active');
}

async function fetchConfessionsFromChain() {
    isLoading = true;
    renderWall();
    try {
        const contract = getReadOnlyContract();
        const total = await contract.getTotalConfessions();
        const count = Number(total);
        
        const headerCount = document.getElementById('headerCount');
        if (headerCount) headerCount.textContent = count.toString();

        const fetched = [];
        // Fetch up to 50 latest
        const limit = 50;
        const start = count > limit ? count - limit : 0;
        
        for (let i = start; i < count; i++) {
            try {
                const conf = await contract.getConfession(i);
                const reactionsData = await contract.getReactionCounts(i);
                
                const reactCounts = {
                    '❤️': Number(reactionsData[0]),
                    '🫂': Number(reactionsData[1]),
                    '👏': Number(reactionsData[2]),
                    '🔥': Number(reactionsData[3]),
                    '😳': Number(reactionsData[4]),
                    '😰': Number(reactionsData[5]),
                    '😣': Number(reactionsData[6])
                };

                fetched.push({
                    id: i,
                    author: conf.author,
                    content: conf.text,
                    timestamp: Number(conf.timestamp) * 1000,
                    reactions: reactCounts,
                    userReactions: {}
                });
            } catch(e) {
                console.error("Failed to fetch confession", i, e);
            }
        }
        
        if (fetched.length > 0) {
            confessions = fetched.reverse();
        } else {
            if (currentNetworkKey === 'mainnet') {
                confessions = [];
            } else {
                confessions = [...DEFAULT_CONFESSIONS];
            }
        }
    } catch (e) {
        console.error("Failed to load confessions from chain", e);
        if (currentNetworkKey === 'mainnet') {
            confessions = [];
        } else {
            confessions = [...DEFAULT_CONFESSIONS];
        }
    } finally {
        isLoading = false;
        renderWall();
    }
}

//Network Switcher Functions
let hasChosenNetwork = localStorage.getItem('unsaid_has_chosen_net') === 'true';

function toggleNetworkDropdown(e) {
    if (e) e.stopPropagation();
    if (!userAddress) return; // Unclickable when wallet not connected
    const container = document.getElementById('networkMenuContainer');
    if (container) container.classList.toggle('open');
}

async function selectNetwork(networkKey) {
    if (!userAddress) return;
    hasChosenNetwork = true;
    localStorage.setItem('unsaid_has_chosen_net', 'true');
    const container = document.getElementById('networkMenuContainer');
    if (container) container.classList.remove('open');
    await switchNetwork(networkKey);
}

async function switchNetwork(networkKey) {
    setNetworkKey(networkKey);
    updateNetworkUI();

    const net = getCurrentNetworkParams();
    showToast(`Switched to ${net.chainName}`, "info");

    if (window.ethereum && userAddress) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: net.chainId }]
            });
        } catch (switchError) {
            // Error code 4902 indicates chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [net]
                    });
                } catch (addError) {
                    console.error("Failed to add chain to MetaMask", addError);
                    showToast("Could not add network to MetaMask", "error");
                }
            }
        }
    }

    await fetchConfessionsFromChain();
}

function updateNetworkUI() {
    const netPillLabel = document.getElementById('networkPillLabel');
    const networkPillBtn = document.getElementById('networkPillBtn');
    const netDot = document.getElementById('netDot');
    const networkChevron = document.getElementById('networkChevron');
    const container = document.getElementById('networkMenuContainer');

    const netOptTestnet = document.getElementById('netOpt-testnet');
    const netOptMainnet = document.getElementById('netOpt-mainnet');

    if (!userAddress) {
        // Wallet NOT connected: show "Network Selector" in dark text, unclickable, with hover tooltip
        if (netPillLabel) netPillLabel.textContent = "Network Selector";
        if (netDot) netDot.style.display = "none";
        if (networkChevron) networkChevron.style.display = "none";
        if (networkPillBtn) {
            networkPillBtn.classList.add('disabled-unconnected');
            networkPillBtn.classList.remove('mainnet');
            networkPillBtn.disabled = true;
            networkPillBtn.title = "Please connect your wallet first";
        }
        if (container) {
            container.classList.remove('connected', 'open');
            container.setAttribute('data-tooltip', 'Please connect your wallet first');
        }
    } else {
        // Wallet IS connected: active, clickable, show dot & chevron, disable tooltip
        if (netDot) netDot.style.display = "inline-block";
        if (networkChevron) networkChevron.style.display = "inline-block";
        if (networkPillBtn) {
            networkPillBtn.classList.remove('disabled-unconnected');
            networkPillBtn.disabled = false;
            networkPillBtn.removeAttribute('title');
        }
        if (container) {
            container.classList.add('connected');
            container.removeAttribute('data-tooltip');
        }

        // Show "Choose your network" if not chosen yet for the first time
        if (!hasChosenNetwork) {
            if (netPillLabel) netPillLabel.textContent = 'Choose your network';
        } else {
            if (currentNetworkKey === 'mainnet') {
                if (netPillLabel) netPillLabel.textContent = 'BOT Mainnet (677)';
            } else {
                if (netPillLabel) netPillLabel.textContent = 'BOT Testnet (968)';
            }
        }

        if (currentNetworkKey === 'mainnet') {
            if (networkPillBtn) networkPillBtn.classList.add('mainnet');
            if (netOptMainnet) netOptMainnet.classList.add('active');
            if (netOptTestnet) netOptTestnet.classList.remove('active');
        } else {
            if (networkPillBtn) networkPillBtn.classList.remove('mainnet');
            if (netOptTestnet) netOptTestnet.classList.add('active');
            if (netOptMainnet) netOptMainnet.classList.remove('active');
        }
    }
}

const INACTIVITY_TIMEOUT = 1000 * 60 * 30; // 30 minutes

//Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Activity Tracker
    const updateActivity = () => {
        localStorage.setItem('unsaid_last_activity', Date.now().toString());
    };
    ['click', 'keypress', 'mousemove', 'scroll'].forEach(evt => {
        window.addEventListener(evt, updateActivity, { passive: true });
    });
    //Page exit transition
    const exitStyle = document.createElement('style');
    exitStyle.textContent = `
        @keyframes pageExit {
            from { opacity: 1; transform: translateY(0) scale(1); }
            to   { opacity: 0; transform: translateY(-20px) scale(0.98); }
        }
        body.page-exit {
            animation: pageExit 0.38s cubic-bezier(0.4, 0, 1, 1) forwards;
            pointer-events: none;
        }
    `;
    document.head.appendChild(exitStyle);

    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.add('page-exit');
            setTimeout(() => { window.location.href = href; }, 380);
        });
    });

    // Check inactivity timeout
    const lastActivity = localStorage.getItem('unsaid_last_activity');
    if (lastActivity && (Date.now() - parseInt(lastActivity, 10)) > INACTIVITY_TIMEOUT) {
        localStorage.removeItem('unsaid_wallet_connected');
        localStorage.removeItem('unsaid_last_activity');
    }

    // Auto-reconnect wallet if user had previously connected
    if (localStorage.getItem('unsaid_wallet_connected') === '1' && typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                userAddress = accounts[0];
            } else {
                // MetaMask locked — clear flag
                localStorage.removeItem('unsaid_wallet_connected');
            }
        } catch (e) {
            localStorage.removeItem('unsaid_wallet_connected');
        }
    }

    updateWalletUI();

    // Close dropdowns when clicking outside
    window.addEventListener('click', (e) => {
        const container = document.getElementById('networkMenuContainer');
        if (container && !container.contains(e.target)) {
            container.classList.remove('open');
        }
        const disconnectWrap = document.getElementById('btnDisconnect')?.parentElement;
        if (disconnectWrap && !disconnectWrap.contains(e.target)) {
            const menu = document.getElementById('disconnectDropdownMenu');
            if (menu) menu.classList.remove('open');
        }
    });

    // Character counter listener
    const confessionInput = document.getElementById('confessionInput');
    const charCounter = document.getElementById('charCounter');
    if (confessionInput && charCounter) {
        confessionInput.addEventListener('input', () => {
            const remaining = 280 - confessionInput.value.length;
            charCounter.textContent = `${remaining} characters left`;
            if (remaining < 30) {
                charCounter.classList.add('warning');
            } else {
                charCounter.classList.remove('warning');
            }
        });
    }

    // MetaMask account/chain change listeners
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                userAddress = null;
                showToast('Wallet disconnected', 'info');
            } else {
                userAddress = accounts[0];
                showToast(`Account switched to ${formatAddress(userAddress)}`, 'info');
            }
            updateWalletUI();
        });

        window.ethereum.on('chainChanged', (chainId) => {
            const hexId = String(chainId).toLowerCase();
            if (hexId === '0x2a5') {
                setNetworkKey('mainnet');
            } else if (hexId === '0x3c8') {
                setNetworkKey('testnet');
            }
            updateNetworkUI();
            showToast('Network changed — refreshing wall...', 'info');
            fetchConfessionsFromChain();
        });
    }

    // Modal backdrop click listener
    const randomModal = document.getElementById('randomModal');
    if (randomModal) {
        randomModal.addEventListener('click', (e) => {
            if (e.target === randomModal) {
                closeModal();
            }
        });
    }

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    fetchConfessionsFromChain();
});
