const streakTitles = { 3: "WARMING UP", 5: "ON FIRE 🔥", 7: "UNSTOPPABLE", 10: "GIGABRAIN 🧠", 15: "LEGENDARY", 20: "GODLIKE 👑", 25: "ILLEGAL GENIUS", 30: "FBI WATCHLIST 🚨", 40: "SIMULATION BREAKER 💊", 50: "THE CHOSEN ONE 👼", 60: "MATRIX NEO 🕶️", 75: "ASCENDED 🌟" };
const shamePhrases = [
    "Your professor would CRY 😭", "Even a goldfish knows this 🐟", "My grandma got this right 👵", "Blockchain just disowned you ⛓️", 
    "Satoshi is disappointed 😔", "The answer was RIGHT THERE 👀", "Your neurons took the day off 🧠💤", "Access Denied 🚫",
    "Have you tried turning your brain off and on? 🔌", "Rug pulled by your own brain 📉", "Ngmi (Not Gonna Make It) 💀", "You clicked that with confidence? 🤡"
];
const praisePhrases = [
    "MASSIVE BRAIN ENERGY 🧠⚡", "+500 IQ POINTS", "BLOCKCHAIN GENIUS 🔥", "ABSOLUTELY CRACKED", "NEURON ACTIVATION 🚀", 
    "TOO EASY FOR YOU", "BUILT DIFFERENT 💎", "HACKERMAN 💻", "WAGMI 🚀", "Big Whale Energy 🐋", "Vitalik is proud 🦄", "Diamond Hands 🙌💎"
];

// BRAINROT CONTENT
const randomJokes = [
    "Why did the Bitcoin developer break up? She needed more space in her block.",
    "I tried to explain blockchain to my dog, now he refuses to fetch centralized sticks.",
    "Knock knock. Who's there? Satoshi. Satoshi who? Exactly.",
    "A crypto trader walks into a bar... and the bar chart crashes.",
    "Buying high and selling low is a lifestyle choice.",
    "My portfolio is 99% vibes, 1% actual math.",
    "Why use a bank when you can lose money yourself?",
    "Smart contracts are just legal documents with anxiety.",
    "I don't need therapy, I have volatile assets.",
    "If you can't handle me at my -80%, you don't deserve me at my +5%."
];

const fakeRewards = [
    "1 BITCOIN (FAKE) 🪙", "GOLDEN BRAIN CELL 🧠✨", "SATOSHI'S PHONE NUMBER 📱", "NFT OF A ROCK 🪨",
    "INFINITE RIZZ 🧢", "ADMIN PRIVILEGES 🛡️", "SEC APPROVAL ✅", "ELON'S TWEET 🐦", "LAMBO KEYS 🔑", "MOON TICKET 🚀"
];

// ITEMS DATABASE
const gameItems = [
    { id: 'rock', name: 'Pet Rock', icon: '🪨', rarity: 'common' },
    { id: 'wrapper', name: 'Candy Wrapper', icon: '🍬', rarity: 'common' },
    { id: 'disk', name: 'Floppy Disk', icon: '💾', rarity: 'common' },
    { id: 'cable', name: 'Broken Cable', icon: '🔌', rarity: 'common' },
    { id: 'coffee', name: 'Cold Coffee', icon: '☕', rarity: 'common' },
    
    { id: 'usb', name: 'Mysterious USB', icon: '📼', rarity: 'rare' },
    { id: 'potion', name: 'Energy Pot', icon: '🧪', rarity: 'rare' },
    { id: 'cool_glasses', name: 'Cool Glasses', icon: '🕶️', rarity: 'rare' },
    { id: 'gameboy', name: 'Retro Console', icon: '🕹️', rarity: 'rare' },
    
    { id: 'gpu', name: 'RTX 9090', icon: '📟', rarity: 'epic' },
    { id: 'bitcoin', name: 'Physical BTC', icon: '🪙', rarity: 'epic' },
    { id: 'diamond', name: 'Diamond Hands', icon: '💎', rarity: 'epic' },
    
    { id: 'satoshi', name: 'Satoshi Mask', icon: '🎭', rarity: 'legendary' },
    { id: 'rocket', name: 'Moon Rocket', icon: '🚀', rarity: 'legendary' },
    { id: 'brain', name: 'Galaxy Brain', icon: '🧠', rarity: 'legendary' },
    
    { id: 'mastery', name: 'Certificate', icon: '📜', rarity: 'legendary' },
    { id: 'glitch', name: 'THE GLITCH', icon: '👾', rarity: 'mythic' }
];

// AUDIO SYSTEM
const bgMusic = new Audio('Background-music.ogg');
bgMusic.loop = true;
bgMusic.volume = 0.5;

let state = { questions: [], current: 0, score: 0, streak: 0, maxStreak: 0, multiplier: 1, lives: 3, timer: 0, timerInterval: null, answered: false, ghostAnswers: [], playerSize: 70, currentOptions: [], correctIndices: [], paused: false };
let audioCtx;

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a }
function loadData() { 
    try { 
        // Default data includes balance, inventory, and equipped item
        return JSON.parse(localStorage.getItem('brainrotBlockchain')) || { runs: [], best: 0, bestStreak: 0, balance: 0, inventory: {}, equipped: null, ascended: false } 
    } catch (e) { 
        return { runs: [], best: 0, bestStreak: 0, balance: 0, inventory: {}, equipped: null, ascended: false } 
    } 
}
function saveData(d) { localStorage.setItem('brainrotBlockchain', JSON.stringify(d)) }
function formatTime(s) { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` }

function updateHomeStats() {
    const d = loadData(), g = document.getElementById('homeStats');
    g.innerHTML = `<div class="stat-box"><div class="stat-value">${d.runs.length}</div><div class="stat-label">RUNS</div></div>
<div class="stat-box"><div class="stat-value">${d.best}%</div><div class="stat-label">BEST</div></div>
<div class="stat-box"><div class="stat-value">${d.bestStreak}</div><div class="stat-label">MAX STREAK</div></div>
<div class="stat-box"><div class="stat-value">${d.balance}</div><div class="stat-label">POINTS</div></div>`;
    const taunts = ["🚨 97% FAIL THIS QUIZ 🚨", "Think you're smart? PROVE IT 🧠", "Your last run was EMBARRASSING 😬", "Even ChatGPT struggles here 🤖", "Blockchain experts ONLY 💎", "One run. One chance. No excuses. ⚡", "I bet you can't even get 5 in a row 🤣"];
    
    // ASCENDED TEASER
    let easterEggHTML = '<br><span style="font-size:16px;color:#888;margin-top:10px;display:block">🔒 SECRET: Reach Streak 75</span>';
    if (d.ascended) easterEggHTML = '<br><span style="font-size:16px;color:#00ff00;margin-top:10px;display:block;text-shadow:0 0 10px #00ff00">🔓 ASCENDED GOD MODE UNLOCKED</span>';
    
    document.getElementById('taunt').innerHTML = taunts[Math.floor(Math.random() * taunts.length)] + easterEggHTML;
}

function startGame() {
    state = { questions: shuffle([...Q]), current: 0, score: 0, streak: 0, maxStreak: 0, multiplier: 1, lives: 3, timer: 0, timerInterval: null, answered: false, ghostAnswers: loadData().lastRun || [], playerSize: 70, currentOptions: [], correctIndices: [], paused: false };
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('hud').style.display = 'block';
    
    // Reset any panic mode styles
    document.body.style.background = '';
    document.body.style.animation = 'bgScroll 20s linear infinite';
    document.getElementById('hud').style.borderBottom = '';
    document.body.className = ''; // Reset all intensity classes
    
    document.getElementById('levelBadge').style.display = 'block';
    document.getElementById('totalQ').textContent = state.questions.length;
    updateLives(); updateHUD();
    updatePlayerAppearance(); // Equip custom item
    
    state.timerInterval = setInterval(() => { if (!state.paused) { state.timer++; document.getElementById('timer').textContent = formatTime(state.timer) } }, 1000);
    showQuestion();
    
    // Init Audio Context on first interaction
    if (!audioCtx) try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    
    // Play Background Music
    bgMusic.play().catch(e => console.log("Audio play failed:", e));
}

function updateGameIntensity() {
    // EXPANDED INTENSITY SCALING
    // Level 0: 0-4
    // Level 1: 5-9
    // Level 2: 10-14
    // Level 3: 15-24
    // Level 4: 25-39 (VOID)
    // Level 5: 40-59 (GLITCH)
    // Level 6: 60+ (MATRIX)
    
    let intensity = 0;
    if (state.streak >= 60) intensity = 6;
    else if (state.streak >= 40) intensity = 5;
    else if (state.streak >= 25) intensity = 4;
    else if (state.streak >= 15) intensity = 3;
    else if (state.streak >= 10) intensity = 2;
    else if (state.streak >= 5) intensity = 1;
    
    document.body.className = ''; // Clear prev
    if (intensity > 0) document.body.classList.add(`intensity-${intensity}`);
    
    const track = document.querySelector('.track');
    if (track) {
        // Speed up track based on streak
        const speed = Math.max(0.05, 0.5 - (state.streak * 0.01)); 
        track.style.animationDuration = `${speed}s`;
    }
}

function playAscensionCutscene() {
    state.paused = true;
    
    // Create Cutscene Overlay
    const ol = document.createElement('div');
    ol.id = 'ascension-overlay';
    ol.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:9999;opacity:0;transition:opacity 2s ease-in;display:flex;align-items:center;justify-content:center;flex-direction:column;pointer-events:none;';
    ol.innerHTML = `<h1 style="color:#000;font-size:40px;text-align:center;font-weight:900;letter-spacing:5px">REALITY BREACH DETECTED</h1><p style="color:#000;margin-top:20px">SIMULATION INTEGRITY: 0%</p>`;
    document.body.appendChild(ol);
    
    // Play sequence
    setTimeout(() => ol.style.opacity = '1', 100); // Fade to white
    
    // Audio FX
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.connect(g); g.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(8000, audioCtx.currentTime + 4);
    g.gain.setValueAtTime(0.5, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 4);
    osc.start(); osc.stop(audioCtx.currentTime + 4);
    
    // Unlock
    const d = loadData();
    if (!d.ascended) {
        d.ascended = true;
        saveData(d);
        // Maybe give a Mythic item?
        if (!d.inventory) d.inventory = {};
        d.inventory['glitch'] = (d.inventory['glitch'] || 0) + 1;
        saveData(d);
    }
    
    // Resume
    setTimeout(() => {
        ol.style.transition = 'opacity 1s ease-out';
        ol.style.opacity = '0';
        ol.innerHTML = `<h1 style="color:#000;font-size:60px">WELCOME TO GOD MODE</h1>`;
        setTimeout(() => ol.remove(), 1000);
        state.paused = false;
        // Keep playing but in god mode (maybe infinite lives or score multiplier boost?)
        state.multiplier += 50;
        updateHUD();
    }, 5000);
}

function updatePlayerAppearance() {
    const d = loadData();
    const player = document.getElementById('playerBody');
    // Clear old additions
    const existingIcon = player.querySelector('.equipped-icon');
    if (existingIcon) existingIcon.remove();
    
    if (d.equipped) {
        const item = gameItems.find(i => i.id === d.equipped);
        if (item) {
            const el = document.createElement('div');
            el.className = 'equipped-icon';
            el.textContent = item.icon;
            el.style.cssText = 'position:absolute;top:-25px;left:50%;transform:translateX(-50%);font-size:30px;pointer-events:none;z-index:20;';
            if (item.id === 'cool_glasses') el.style.top = '10px'; // Adjust for glasses
            if (item.id === 'satoshi') { el.style.top = '0'; el.style.fontSize = '60px'; } // Mask
            player.appendChild(el);
        }
    }
}

// REMOVED: Player Tap Interaction (Performance optimization requested by user)

function updateLives() { 
    const l = document.getElementById('lives'); 
    l.innerHTML = ''; 
    for (let i = 0; i < 3; i++) { 
        const s = document.createElement('span'); 
        s.className = 'life' + (i >= state.lives ? ' lost' : ''); 
        s.textContent = '❤️'; 
        l.appendChild(s);
    }
    
    // Panic Mode Logic
    if (state.lives === 1) { 
        document.body.style.animation = 'none'; 
        document.body.style.background = 'radial-gradient(circle, #330000 0%, #000 100%)'; 
        document.getElementById('hud').style.borderBottom = '3px solid #ff0000';
    }
}

function updateHUD() {
    document.getElementById('score').textContent = state.score;
    document.getElementById('multiplier').textContent = state.multiplier;
    document.getElementById('currentQ').textContent = state.current + 1;
    document.getElementById('progressBar').style.width = ((state.current) / state.questions.length * 100) + '%';
    document.getElementById('levelNum').textContent = Math.floor(state.current / 10) + 1;
    
    if (state.streak >= 3) {
        document.getElementById('streakDisplay').style.display = 'block'; 
        document.getElementById('streakCount').textContent = state.streak;
        let title = ''; 
        for (let k in streakTitles) if (state.streak >= k) title = streakTitles[k]; 
        document.getElementById('streakTitle').textContent = title;
        updateGameIntensity(); // Sync VFX with streak
    } else {
        document.getElementById('streakDisplay').style.display = 'none';
        updateGameIntensity();
    }
}

function showQuestion() {
    if (state.current >= state.questions.length) { endGame(); return; }
    state.answered = false;
    const q = state.questions[state.current];
    
    // RANDOMIZE ANSWERS
    state.currentOptions = [];
    state.correctIndices = [];
    
    if (q.type === 'tf') {
        state.currentOptions = ['TRUE', 'FALSE'];
    } else {
        let mappedOptions = q.o.map((opt, i) => ({ 
            text: opt, 
            originalIndex: i, 
            isCorrect: Array.isArray(q.c) ? q.c.includes(i) : q.c === i 
        }));
        mappedOptions = shuffle(mappedOptions);
        state.currentOptions = mappedOptions;
    }

    const box = document.getElementById('questionBox');
    const gc = document.getElementById('gatesContainer');
    
    // Difficulty Label
    const labels = ['EASY 😴', 'MEDIUM 🤔', 'HARD 😰', 'INSANE 🤯', 'IMPOSSIBLE 💀', 'NIGHTMARE 👹']; 
    const idx = Math.min(5, Math.floor(state.current / 20)); 
    document.querySelector('.fake-level').textContent = labels[idx];

    document.getElementById('categoryBadge').style.display = 'block';
    document.getElementById('categoryBadge').textContent = q.cat.toUpperCase();
    
    const typeLabels = { mcq: '⚡ SINGLE CHOICE', multi: '☑️ SELECT ALL CORRECT', tf: '✓✗ TRUE OR FALSE' };
    document.getElementById('questionType').textContent = typeLabels[q.type];
    document.getElementById('questionText').textContent = q.q;
    
    const hints = ["Only LEGENDS get this 👑", "Your professor wrote this one 📚", "Speed is key here ⚡", "Think before you tap 🧠", "Don't choke now 🥶"];
    document.getElementById('questionHint').textContent = hints[Math.floor(Math.random() * hints.length)];
    
    box.style.display = 'block';
    gc.innerHTML = '';
    
    if (q.type === 'tf') {
        gc.innerHTML = `
            <div class="gate tf-true" onclick="selectAnswer(true)">
                <div class="gate-label">TRUE</div>
                <div class="gate-text">✓ YES</div>
            </div>
            <div class="gate tf-false" onclick="selectAnswer(false)">
                <div class="gate-label">FALSE</div>
                <div class="gate-text">✗ NO</div>
            </div>`;
    } else if (q.type === 'mcq') {
        const labels = ['A', 'B', 'C', 'D'];
        const classes = ['a', 'b', 'c', 'd'];
        state.currentOptions.forEach((opt, i) => { 
            gc.innerHTML += `
                <div class="gate ${classes[i]}" onclick="selectAnswer(${i})">
                    <div class="gate-label">${labels[i]}</div>
                    <div class="gate-text">${opt.text}</div>
                </div>`; 
        });
    } else if (q.type === 'multi') {
        const labels = ['A', 'B', 'C', 'D'];
        const classes = ['a', 'b', 'c', 'd'];
        state.currentOptions.forEach((opt, i) => { 
            gc.innerHTML += `
                <div class="gate ${classes[i]}" data-idx="${i}" onclick="toggleMulti(${i})">
                    <div class="gate-label">${labels[i]}</div>
                    <div class="gate-text">${opt.text}</div>
                </div>`; 
        });

        // Footer injection with DRAMATIC POP-UP class
        gc.innerHTML += `<div class="submit-container-anim"><button class="btn" style="padding:15px 50px;font-size:20px;background:linear-gradient(180deg,#00ff00,#008800);box-shadow:0 0 20px #00ff00" onclick="submitMulti()">SUBMIT ✓</button></div>`;
    }
    
    showGhost();
}

let multiSelected = [];
function toggleMulti(i) { 
    if (state.answered) return; 
    const g = document.querySelector(`.gate[data-idx="${i}"]`); 
    if (multiSelected.includes(i)) { 
        multiSelected = multiSelected.filter(x => x !== i); 
        g.style.boxShadow = '';
        g.style.transform = '';
        g.style.background = ''; // reset
    } else { 
        multiSelected.push(i); 
        g.style.boxShadow = '0 0 30px #fff';
        g.style.transform = 'scale(1.05)';
        g.style.background = 'rgba(255,255,255,0.2)';
    } 
    vibrate(30);
    playSound('tick');
}

function submitMulti() { 
    if (state.answered || multiSelected.length === 0) return; 
    
    // Check against randomized options
    let allCorrect = true;
    let anyWrong = false;
    let correctCount = 0;
    
    // Count total true correct answers
    const totalCorrect = state.currentOptions.filter(o => o.isCorrect).length;
    
    // Check user selection
    if (multiSelected.length !== totalCorrect) {
        allCorrect = false;
    } else {
        multiSelected.forEach(idx => {
            if (!state.currentOptions[idx].isCorrect) allCorrect = false;
        });
    }
    
    checkAnswer(allCorrect, multiSelected);
}

function selectAnswer(ans) {
    if (state.answered) return; 
    vibrate(50);
    const q = state.questions[state.current];
    
    let isCorrect = false;
    if (q.type === 'tf') {
        isCorrect = (ans === q.c);
    } else {
        // Use randomized option state
        isCorrect = state.currentOptions[ans].isCorrect;
    }
    
    checkAnswer(isCorrect, ans);
}

function checkAnswer(correct, userAns) {
    state.answered = true; 
    multiSelected = [];
    const q = state.questions[state.current];
    const player = document.getElementById('playerBody');

    // Reveal Logic & Visuals
    let gates = document.querySelectorAll('.gate');
    if (q.type === 'multi') gates = document.querySelectorAll('.gate[data-idx]');

    gates.forEach((g, i) => {
        let isCorrectGate = false;
        if (q.type === 'tf') isCorrectGate = (g.classList.contains('tf-true') === q.c);
        else if (q.type === 'mcq') isCorrectGate = state.currentOptions[i].isCorrect;
        else if (q.type === 'multi') isCorrectGate = state.currentOptions[parseInt(g.dataset.idx)].isCorrect;

        if (isCorrectGate) {
            g.classList.add('correct-reveal');
        } else {
            g.classList.add('wrong-reveal');
        }
    });

    if (correct) {
        // SCORING
        state.score += 10 * state.multiplier; 
        state.streak++; 
        if (state.streak > state.maxStreak) state.maxStreak = state.streak;
        state.multiplier = Math.min(10, 1 + Math.floor(state.streak / 3));
        
        // CHECK EASTER EGG
        if (state.streak === 75) {
            playAscensionCutscene();
        }

        // PLAYER VISUALS
        state.playerSize = Math.min(100, state.playerSize + 5);
        player.style.width = player.style.height = state.playerSize + 'px';
        player.classList.remove('wrong'); 
        player.classList.add('correct');
        
        // EFFECTS
        playSound('correct');
        const praise = praisePhrases[Math.floor(Math.random() * praisePhrases.length)];
        showIQ(praise, false);
        spawnCoins(12); 
        spawnEmojis(['🧠', '⚡', '🔥', '💎', '✓', '🚀', '💰', '🦄']);
        checkAchievements();
        checkCombo();
        triggerRandomEffect();
        
        if (typeof confetti !== 'undefined') confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#00ff00', '#00ffff', '#ffff00'] });

        setTimeout(() => { player.classList.remove('correct'); nextQuestion() }, 1500); // Increased delay to see effects
    } else {
        // PENALTY
        state.streak = 0; 
        state.multiplier = 1; 
        state.lives--;
        
        // PLAYER VISUALS
        state.playerSize = Math.max(30, state.playerSize - 10);
        player.style.width = player.style.height = state.playerSize + 'px';
        player.classList.remove('correct'); 
        player.classList.add('wrong');
        
        updateLives();
        
        // EFFECTS
        playSound('wrong');
        showIQ(shamePhrases[Math.floor(Math.random() * shamePhrases.length)], true);
        spawnEmojis(['💀', '😭', '❌', '🤡', '📉']);
        shakeScreen();
        vibrate([200, 100, 200]);
        document.body.classList.remove('chaos-mode', 'rainbow-mode'); // Reset modes on damage

        if (state.lives <= 0) { 
            setTimeout(() => { player.classList.remove('wrong'); endGame() }, 1500);
        } else { 
            setTimeout(() => { player.classList.remove('wrong'); nextQuestion() }, 2000);
        }
    }
    
    state.ghostAnswers.push({ q: state.current, a: userAns, c: correct });
    updateHUD();
}

// RANDOM EFFECT SYSTEM
function triggerRandomEffect() {
    const chance = Math.random();
    
    // 30% chance for a random joke
    if (chance < 0.3) {
        showJokePopup();
    }
    
    // 20% chance for a fake reward
    if (chance > 0.3 && chance < 0.5) {
        showRewardPopup();
    }
    
    // 10% chance for CHAOS MODE (if streak > 5)
    if (chance > 0.9 && state.streak > 5) {
        activateChaosMode();
    }
}

function showJokePopup() {
    const joke = randomJokes[Math.floor(Math.random() * randomJokes.length)];
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;bottom:20%;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.9);color:#fecc00;border:1px solid #fecc00;padding:15px;border-radius:10px;font-size:14px;max-width:80%;text-align:center;z-index:900;animation:slideIn 0.3s ease;box-shadow:0 0 20px rgba(254,204,0,0.3)';
    el.innerHTML = `<strong>😂 BRAINROT BREAK:</strong><br>${joke}`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 500); }, 3000);
}

function showRewardPopup() {
    const reward = fakeRewards[Math.floor(Math.random() * fakeRewards.length)];
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:30%;left:50%;transform:translateX(-50%);background:linear-gradient(45deg, #FFD700, #DAA520);color:#000;padding:10px 20px;border-radius:20px;font-weight:bold;font-size:16px;z-index:950;animation:popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);box-shadow:0 0 30px #FFD700';
    el.textContent = `🎁 DROPPED: ${reward}`;
    document.body.appendChild(el);
    playSound('combo');
    setTimeout(() => { el.style.top = '25%'; el.style.opacity = '0'; setTimeout(() => el.remove(), 500); }, 2000);
}

function activateChaosMode() {
    document.body.classList.add('chaos-mode');
    setTimeout(() => document.body.classList.remove('chaos-mode'), 4000);
    spawnEmojis(['🌀', '😵', '🌈', '🔥'], 20);
}

// SHOP & INVENTORY SYSTEM
function showShop() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('shopScreen').classList.add('active');
    updateShopUI();
}

function updateShopUI() {
    const d = loadData();
    document.getElementById('shopBalance').textContent = d.balance || 0;
    
    // Render Inventory
    const grid = document.getElementById('inventoryGrid');
    grid.innerHTML = '';
    
    if (d.inventory) {
        Object.keys(d.inventory).forEach(itemId => {
            const item = gameItems.find(i => i.id === itemId);
            if (item) {
                const count = d.inventory[itemId];
                const isEquipped = d.equipped === itemId;
                grid.innerHTML += `
                    <div class="inventory-item rarity-${item.rarity} ${isEquipped ? 'equipped' : ''}" onclick="openItemOptions('${itemId}')">
                        <div class="item-icon">${item.icon}</div>
                        <div class="item-count">x${count}</div>
                        ${isEquipped ? '<div style="position:absolute;top:0;right:0;font-size:10px;background:lime;color:black;padding:2px">EQP</div>' : ''}
                    </div>`;
            }
        });
    }
}

function openItemOptions(id) {
    // Simple equip/sell check
    const d = loadData();
    const item = gameItems.find(i => i.id === id);
    if (!item) return;

    // Toggle Equip logic
    if (confirm(`Equip ${item.name}? (Cancel to Sell)`)) {
        d.equipped = id;
        saveData(d);
        updateShopUI();
        playSound('correct');
        updatePlayerAppearance(); // Immediate update behind modal
    } else {
        // Sell logic
        sellItem(id);
    }
}

function rollGacha() {
    const d = loadData();
    const cost = 100;
    
    if (d.balance < cost) {
        showIQ("BROKE! NEED MORE BRAIN 🧠", true);
        playSound('wrong');
        return;
    }
    
    // Deduct
    d.balance -= cost;
    
    // Roll Rarity
    const r = Math.random();
    let rarity = 'common';
    if (r > 0.999) rarity = 'mythic';
    else if (r > 0.95) rarity = 'legendary';
    else if (r > 0.80) rarity = 'epic';
    else if (r > 0.50) rarity = 'rare';
    
    // Pick Item
    const pool = gameItems.filter(i => i.rarity === rarity);
    const item = pool[Math.floor(Math.random() * pool.length)];
    
    // Add to Inventory
    if (!d.inventory) d.inventory = {};
    d.inventory[item.id] = (d.inventory[item.id] || 0) + 1;
    
    saveData(d);
    updateShopUI();
    
    // Effect
    playSound('combo');
    if (typeof confetti !== 'undefined') confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 } });
    
    const res = document.getElementById('gachaResult');
    res.innerHTML = `<div style="margin-top:20px;font-weight:900;font-size:24px;color:#fff;text-shadow:0 0 10px white" class="rarity-${rarity}">
        UNLOCKED:<br><span style="font-size:40px">${item.icon}</span><br>${item.name}<br>
        <span style="font-size:12px;opacity:0.8">${rarity.toUpperCase()}</span>
    </div>`;
}

function sellItem(id) {
    if (!confirm('Sell this item for points?')) return;
    const d = loadData();
    if (d.inventory[id] > 0) {
        d.inventory[id]--;
        // If unequip sold item
        if (d.equipped === id && d.inventory[id] <= 0) d.equipped = null;
        
        if (d.inventory[id] <= 0) delete d.inventory[id];
        
        const item = gameItems.find(i => i.id === id);
        const prices = { common: 10, rare: 50, epic: 150, legendary: 500, mythic: 2000 };
        const price = prices[item.rarity] || 10;
        
        d.balance += price;
        saveData(d);
        updateShopUI();
        playSound('tick');
    }
}

function nextQuestion() { state.current++; showQuestion() }

function showIQ(text, neg) { 
    const p = document.getElementById('iqPopup'), t = document.getElementById('iqText'); 
    t.textContent = text; 
    t.className = 'iq-text' + (neg ? ' negative' : ''); 
    p.style.display = 'block'; 
    setTimeout(() => p.style.display = 'none', 1500);
}

function checkCombo() {
    const combos = { 5: ['🔥 ON FIRE!', 'Keep going!'], 10: ['⚡ UNSTOPPABLE!', 'Nobody can stop you!'], 15: ['💎 LEGENDARY!', 'Blockchain bows to you!'], 20: ['👑 GODLIKE!', 'You are the chain!'], 25: ['🚨 FBI WATCHLIST!', 'Too smart for this world!'], 50: ['👽 ALIEN INTELLIGENCE', 'We are coming for you...'] };
    
    // Check for combos
    if (Object.keys(combos).includes(String(state.streak))) {
        const p = document.getElementById('comboPopup'); 
        document.getElementById('comboText').textContent = combos[state.streak][0]; 
        document.getElementById('comboSub').textContent = combos[state.streak][1]; 
        p.classList.add('active'); 
        playSound('combo');
        vibrate([100, 50, 100, 50, 100]);
        
        // Visual boom
        document.body.classList.add('rainbow-mode');
        setTimeout(() => document.body.classList.remove('rainbow-mode'), 3000);
        
        setTimeout(() => p.classList.remove('active'), 2000);
    }
}

function spawnCoins(count = 8) { 
    const gc = document.getElementById('gameContainer'); 
    for (let i = 0; i < count; i++) { 
        const c = document.createElement('div'); 
        c.className = 'coin'; 
        c.style.left = (20 + Math.random() * 60) + '%'; 
        c.style.top = (40 + Math.random() * 20) + '%'; 
        c.textContent = '🪙'; 
        gc.appendChild(c); 
        setTimeout(() => c.remove(), 1000);
    } 
}

function spawnEmojis(arr, count = 1) { 
    const gc = document.getElementById('gameContainer'); 
    arr.forEach((e) => { 
        for(let j=0; j<count; j++) {
            const el = document.createElement('div'); 
            el.className = 'emoji-burst'; 
            el.textContent = e; 
            el.style.left = (10 + Math.random() * 80) + '%'; 
            el.style.top = (30 + Math.random() * 40) + '%'; 
            el.style.animationDelay = (Math.random() * 0.3) + 's'; 
            el.style.transform = `rotate(${Math.random() * 40 - 20}deg)`;
            gc.appendChild(el); 
            setTimeout(() => el.remove(), 1500);
        }
    });
}

function shakeScreen() { 
    const gc = document.getElementById('gameContainer'); 
    gc.style.animation = 'none';
    gc.offsetHeight; /* trigger reflow */
    gc.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both'; 
}

function showGhost() { 
    const g = document.getElementById('ghost'), ga = state.ghostAnswers.find(x => x.q === state.current); 
    if (ga && !ga.c) { 
        g.style.display = 'block'; 
        setTimeout(() => { 
            g.style.opacity = '0.6'; 
            setTimeout(() => { 
                g.querySelector('.player-body').classList.add('wrong'); 
                setTimeout(() => g.style.display = 'none', 800);
            }, 500);
        }, 300);
    } else {
        g.style.display = 'none';
    }
}

function endGame() {
    clearInterval(state.timerInterval);
    document.getElementById('hud').style.display = 'none';
    document.getElementById('levelBadge').style.display = 'none';
    document.getElementById('questionBox').style.display = 'none';
    document.getElementById('gatesContainer').innerHTML = '';
    document.getElementById('streakDisplay').style.display = 'none';
    document.getElementById('categoryBadge').style.display = 'none';
    
    const pct = Math.round((state.score / (state.questions.length * 10)) * 100);
    let grade = 'F', gc = 'grade-f';
    if (pct >= 97) { grade = 'A+'; gc = 'grade-a' } else if (pct >= 93) { grade = 'A'; gc = 'grade-a' } else if (pct >= 90) { grade = 'A-'; gc = 'grade-a' }
    else if (pct >= 87) { grade = 'B+'; gc = 'grade-b' } else if (pct >= 83) { grade = 'B'; gc = 'grade-b' } else if (pct >= 80) { grade = 'B-'; gc = 'grade-b' }
    else if (pct >= 77) { grade = 'C+'; gc = 'grade-c' } else if (pct >= 73) { grade = 'C'; gc = 'grade-c' } else if (pct >= 70) { grade = 'C-'; gc = 'grade-c' }
    else if (pct >= 60) { grade = 'D'; gc = 'grade-d' }
    
    document.getElementById('finalScore').textContent = pct + '%';
    document.getElementById('finalScore').className = 'results-score ' + gc;
    document.getElementById('gradeBadge').textContent = grade;
    
    // Gradient Background for Score
    const gradients = {
        'grade-a': 'linear-gradient(135deg,#00ff00,#009900)',
        'grade-b': 'linear-gradient(135deg,#88ff00,#449900)',
        'grade-c': 'linear-gradient(135deg,#ffff00,#999900)',
        'grade-d': 'linear-gradient(135deg,#ff8800,#994400)',
        'grade-f': 'linear-gradient(135deg,#ff0000,#990000)'
    };
    document.getElementById('gradeBadge').style.background = gradients[gc] || gradients['grade-f'];

    const d = loadData();
    const fakePct = Math.min(99, 50 + Math.floor(pct / 2));
    document.getElementById('percentile').textContent = `You beat ${fakePct}% of players`;
    
    // Add Score to Balance
    d.balance = (d.balance || 0) + state.score;

    document.getElementById('resultsStats').innerHTML = `
        <div class="stat-box"><div class="stat-value">${state.score}</div><div class="stat-label">SCORE</div></div>
        <div class="stat-box"><div class="stat-value">+${state.score}</div><div class="stat-label">EARNED</div></div>
        <div class="stat-box"><div class="stat-value">${state.maxStreak}</div><div class="stat-label">MAX STREAK</div></div>
        <div class="stat-box"><div class="stat-value">x${state.multiplier}</div><div class="stat-label">FINAL MULTI</div></div>`;
        
    const msgs = pct >= 87 ? '🎉 B+ OR HIGHER! You are READY for the exam!' : '📚 Keep grinding! You need more practice.';
    document.getElementById('shareText').textContent = msgs;
    
    d.runs.push({ score: pct, time: state.timer, streak: state.maxStreak, date: Date.now() });
    if (pct > d.best) d.best = pct; 
    if (state.maxStreak > d.bestStreak) d.bestStreak = state.maxStreak;
    d.lastRun = state.ghostAnswers;
    saveData(d);
    
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('resultsScreen').classList.add('active');
    
    if (pct >= 80) launchConfetti();
}

function showHistory() {
    const d = loadData(), h = document.getElementById('historyBox');
    if (!d.runs.length) { h.innerHTML = '<div style="text-align:center;color:#888;padding:20px">No runs yet!</div>' }
    else { 
        h.innerHTML = '<div class="history-title">RECENT RUNS</div>' + d.runs.slice(-10).reverse().map(r => `
            <div class="history-item">
                <span>${new Date(r.date).toLocaleDateString()}</span>
                <span class="history-score">${r.score}%</span>
                <span class="history-time">${formatTime(r.time)}</span>
            </div>`).join('');
    }
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('historyScreen').classList.add('active');
}

function goHome() { 
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); 
    document.getElementById('startScreen').classList.add('active'); 
    updateHomeStats(); 
}

function clearHistory() { 
    if (confirm('Clear all progress?')) { 
        localStorage.removeItem('brainrotBlockchain'); 
        updateHomeStats(); 
        goHome(); 
    } 
}

document.addEventListener('DOMContentLoaded', () => { updateHomeStats() });

// Keyboard Controls
document.addEventListener('keydown', e => {
    if (!state.answered && document.getElementById('hud').style.display === 'block') {
        const q = state.questions[state.current];
        if (q.type === 'tf') { 
            if (e.key === '1' || e.key.toLowerCase() === 't') selectAnswer(true); 
            if (e.key === '2' || e.key.toLowerCase() === 'f') selectAnswer(false);
        } else if (q.type === 'mcq') { 
            if (e.key >= '1' && e.key <= '4') selectAnswer(parseInt(e.key) - 1); 
            if (e.key.toLowerCase() >= 'a' && e.key.toLowerCase() <= 'd') selectAnswer(e.key.toLowerCase().charCodeAt(0) - 97);
        } else if (q.type === 'multi') { 
            if (e.key >= '1' && e.key <= '4') toggleMulti(parseInt(e.key) - 1); 
            if (e.key.toLowerCase() >= 'a' && e.key.toLowerCase() <= 'd') toggleMulti(e.key.toLowerCase().charCodeAt(0) - 97); 
            if (e.key === 'Enter') submitMulti();
        }
    }
});

// Touch feedback handled by CSS :active now to prevent conflicts

// Prevent zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', e => { 
    const now = Date.now(); 
    if (now - lastTouchEnd <= 300) e.preventDefault(); 
    lastTouchEnd = now; 
}, false);

// Eye tracking
document.addEventListener('mousemove', e => { 
    const pupils = document.querySelectorAll('.pupil'); 
    const rect = document.getElementById('player').getBoundingClientRect(); 
    const centerX = rect.left + rect.width / 2; 
    const centerY = rect.top + rect.height / 2; 
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX); 
    const distance = Math.min(4, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 40); 
    pupils.forEach(p => { 
        p.style.transform = `translateX(-50%) translate(${Math.cos(angle) * distance}px,${Math.sin(angle) * distance}px)`;
    }); 
});

// Background particles
function createBgParticle() { 
    const p = document.createElement('div'); 
    // Mix of neon colors
    const colors = ['#ff00ff', '#00ffff', '#00ff00', '#ffff00'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `position:fixed;width:${2 + Math.random() * 5}px;height:${2 + Math.random() * 5}px;background:${color};opacity:${0.2 + Math.random() * 0.4};border-radius:50%;left:${Math.random() * 100}vw;top:100vh;pointer-events:none;z-index:1;box-shadow:0 0 5px ${color};animation:floatUp ${4 + Math.random() * 8}s linear forwards`; 
    document.body.appendChild(p); 
    setTimeout(() => p.remove(), 12000); 
}
setInterval(createBgParticle, 300); // Increased frequency

// Fake loading messages
const loadingMsgs = ['Downloading more RAM...', 'Asking ChatGPT for answers...', 'Consulting blockchain oracles...', 'Mining brain cells...', 'Encrypting your neurons...', 'Hashing your doubts...', 'Synthesizing dopamine...', 'Connecting to satellite 📡', 'Running anxiety.exe...', 'Loading excuses...'];
function flashLoadingMsg() { 
    const m = document.createElement('div'); 
    m.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#00ff00;padding:8px 16px;border-radius:20px;font-size:11px;z-index:999;pointer-events:none;font-family:monospace;border:1px solid #00ff00;box-shadow:0 0 10px rgba(0,255,0,0.2)'; 
    m.textContent = loadingMsgs[Math.floor(Math.random() * loadingMsgs.length)]; 
    document.body.appendChild(m); 
    setTimeout(() => m.remove(), 2500); 
}
setInterval(flashLoadingMsg, 8000);

// Rage bait
function showRageBait() { 
    if (document.getElementById('hud').style.display !== 'block') return; 
    const msgs = ['👻 Ghost player just failed here AGAIN', '🤡 Someone picked the WRONG answer', '📊 Only 12% got this right', '🧠 Your brain is loading...', '⚡ SPEED UP! Time is ticking', '💀 3 players just rage-quit here', '📉 IQ dropping...', '👀 Satoshi is watching you']; 
    const n = document.createElement('div'); 
    n.style.cssText = 'position:fixed;top:70px;right:10px;background:linear-gradient(90deg, rgba(255,0,128,0.9), rgba(128,0,255,0.9));color:#fff;padding:10px 15px;border-radius:10px;font-size:12px;font-weight:700;z-index:999;animation:slideIn 0.3s ease;max-width:200px;box-shadow:0 5px 15px rgba(0,0,0,0.5)'; 
    n.textContent = msgs[Math.floor(Math.random() * msgs.length)]; 
    document.body.appendChild(n); 
    setTimeout(() => { 
        n.style.opacity = '0'; 
        n.style.transition = 'opacity 0.5s'; 
        setTimeout(() => n.remove(), 500); 
    }, 3000); 
}
setInterval(showRageBait, 10000);

// Player Count
function updateFakePlayers() { 
    const el = document.querySelector('.subtitle'); 
    if (el && document.getElementById('startScreen').classList.contains('active')) { 
        const count = 1247 + Math.floor(Math.random() * 500); 
        el.textContent = `🔴 ${count} PLAYERS ONLINE NOW`;
        el.style.textShadow = '0 0 10px #ff0000';
    } 
}
setInterval(updateFakePlayers, 3000);
updateFakePlayers();

// Achievements
const achievements = { firstCorrect: { name: 'FIRST BLOOD', icon: '🩸', shown: false }, streak5: { name: 'COMBO STARTER', icon: '🔥', shown: false }, streak10: { name: 'UNSTOPPABLE', icon: '⚡', shown: false }, perfect10: { name: 'PERFECT 10', icon: '💯', shown: false }, speedDemon: { name: 'SPEED DEMON', icon: '🏎️', shown: false } };
function checkAchievements() { 
    if (state.streak === 1 && !achievements.firstCorrect.shown) { showAchievement(achievements.firstCorrect); achievements.firstCorrect.shown = true; } 
    if (state.streak === 5 && !achievements.streak5.shown) { showAchievement(achievements.streak5); achievements.streak5.shown = true; } 
    if (state.streak === 10 && !achievements.streak10.shown) { showAchievement(achievements.streak10); achievements.streak10.shown = true; } 
}
function showAchievement(a) { 
    const el = document.createElement('div'); 
    el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#ffd700,#ff8c00);color:#000;padding:20px 40px;border-radius:20px;font-size:18px;font-weight:900;z-index:800;text-align:center;animation:iqPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);box-shadow:0 0 50px rgba(255,215,0,0.8);border:4px solid #fff'; 
    el.innerHTML = `<div style="font-size:50px;margin-bottom:10px;animation:pulse 0.5s infinite">${a.icon}</div>ACHIEVEMENT UNLOCKED<br><span style="font-size:26px;text-transform:uppercase">${a.name}</span>`; 
    document.body.appendChild(el); 
    playSound('correct'); 
    vibrate([100, 50, 100]); 
    setTimeout(() => el.remove(), 3000); 
}

// Audio
function playSound(type) { 
    try { 
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
        const osc = audioCtx.createOscillator(); 
        const gain = audioCtx.createGain(); 
        osc.connect(gain); 
        gain.connect(audioCtx.destination); 
        
        if (type === 'correct') { 
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); 
            osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); 
            osc.type = 'triangle';
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime); 
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3); 
            osc.start(audioCtx.currentTime); 
            osc.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'wrong') { 
            osc.frequency.setValueAtTime(150, audioCtx.currentTime); 
            osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.4); 
            osc.type = 'sawtooth';
            gain.gain.setValueAtTime(0.4, audioCtx.currentTime); 
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4); 
            osc.start(audioCtx.currentTime); 
            osc.stop(audioCtx.currentTime + 0.4);
        } else if (type === 'tick') {
             osc.frequency.setValueAtTime(800, audioCtx.currentTime);
             gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
             gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
             osc.start(audioCtx.currentTime); 
             osc.stop(audioCtx.currentTime + 0.05);
        } else if (type === 'combo') {
             osc.frequency.setValueAtTime(440, audioCtx.currentTime);
             osc.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.3);
             gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
             gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
             osc.start(audioCtx.currentTime); 
             osc.stop(audioCtx.currentTime + 0.5);
        }
    } catch (e) { } 
}

// Mobile orientation lock attempt
if (screen.orientation && screen.orientation.lock) { try { screen.orientation.lock('portrait').catch(() => { }) } catch (e) { } }
// Vibration
function vibrate(pattern) { if (navigator.vibrate) navigator.vibrate(pattern) }
// Confetti
function launchConfetti() { if (typeof confetti === 'undefined') return; confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }) }

// Initial console log
console.log('%c🧠 BLOCKCHAIN BRAIN BLASTER v3.0 - ADDICTION UPDATE 🔥', 'font-size:24px;font-weight:bold;color:#ff00ff;text-shadow:2px 2px #00ffff');
