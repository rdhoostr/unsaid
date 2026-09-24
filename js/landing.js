//Unsaid Landing Page Logic

document.addEventListener('DOMContentLoaded', () => {
    // Activity Tracker
    const updateActivity = () => {
        localStorage.setItem('unsaid_last_activity', Date.now().toString());
    };
    ['click', 'keypress', 'mousemove', 'scroll'].forEach(evt => {
        window.addEventListener(evt, updateActivity, { passive: true });
    });

    //Page exit transition
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pageExit {
            from { opacity: 1; transform: translateY(0) scale(1); }
            to   { opacity: 0; transform: translateY(-20px) scale(0.98); }
        }
        body.page-exit {
            animation: pageExit 0.38s cubic-bezier(0.4, 0, 1, 1) forwards;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);

    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.add('page-exit');
            setTimeout(() => { window.location.href = href; }, 300);
        });
    });

    //Scroll Reveal Observer
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        revealEls.forEach(el => observer.observe(el));
    }

    //Smooth scroll for nav links
    document.querySelectorAll('nav .links a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                const navOffset = 90;
                const elementPosition = targetEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    //Hero parallax
    const heroSection = document.getElementById('heroSection');
    const heroGlyph = document.getElementById('heroGlyph');
    if (heroSection && heroGlyph) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            const dx = (px - 0.5) * 24;
            const dy = (py - 0.5) * 24;
            heroGlyph.style.transform = `translate(${dx}px, ${dy}px)`;
        });
    }

    //Magnetic buttons
    document.querySelectorAll('.btn-primary').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
            const r = btn.getBoundingClientRect();
            const dx = (e.clientX - r.left - r.width / 2) * 0.25;
            const dy = (e.clientY - r.top - r.height / 2) * 0.25;
            btn.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0,0)';
        });
    });

    //Step accordion
    document.querySelectorAll('.step').forEach((step) => {
        step.addEventListener('click', () => {
            const isActive = step.classList.contains('active');
            document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
            if (!isActive) step.classList.add('active');
        });
    });

    //Try-it live preview
    const tryInput = document.getElementById('tryInput');
    const tryCount = document.getElementById('tryCount');
    const previewCard = document.getElementById('previewCard');
    const previewText = document.getElementById('previewText');
    const previewReact = document.getElementById('previewReact');
    const sampleLabels = ['\u2764\ufe0f', '\ud83e\udec2', '\ud83d\udc4f', '\ud83d\udd25', '\ud83d\ude33', '\ud83d\ude30', '\ud83d\ude23'];

    function randomAddr() {
        const hex = '0123456789abcdef';
        let a = '0x';
        for (let i = 0; i < 4; i++) a += hex[Math.floor(Math.random() * 16)];
        let b = '';
        for (let i = 0; i < 4; i++) b += hex[Math.floor(Math.random() * 16)];
        return `${a}…${b}`;
    }

    if (tryInput) {
        tryInput.addEventListener('input', () => {
            const remaining = 280 - tryInput.value.length;
            tryCount.textContent = `${remaining} characters left`;
            if (tryInput.value.trim().length > 0) {
                const addr = randomAddr();
                previewText.textContent = tryInput.value.trim();
                document.getElementById('previewAddr').textContent = addr;
                previewReact.textContent = `${sampleLabels[Math.floor(Math.random() * sampleLabels.length)]} ${Math.floor(Math.random() * 30)}`;
                previewCard.classList.add('show');
            } else {
                previewCard.classList.remove('show');
            }
        });
    }

    //Fetch On-Chain Count from BOTH networks for Landing
    (async () => {
        const liveCount = document.getElementById('liveCount');
        if (!liveCount) return;
        try {
            const fetchCount = async (networkKey) => {
                const net = NETWORKS[networkKey];
                const provider = new ethers.JsonRpcProvider(net.rpcUrls[0]);
                const contract = new ethers.Contract(net.contractAddress, CONTRACT_ABI, provider);
                const total = await contract.getTotalConfessions();
                return Number(total);
            };
            const [testnetCount, mainnetCount] = await Promise.all([
                fetchCount('testnet').catch(() => 0),
                fetchCount('mainnet').catch(() => 0)
            ]);
            liveCount.textContent = (testnetCount + mainnetCount).toString();
        } catch (e) {
            liveCount.textContent = "several";
        }
    })();
});
