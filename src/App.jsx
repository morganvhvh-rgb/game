import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ShoppingCart, Zap, Star, LayoutGrid, Info, HelpCircle, Lock, Unlock, Hammer, ArrowLeft, Store, Sparkles, Tag } from 'lucide-react';

// Configuration
const SYMBOLS = {
    FRUIT: ['🍇', '🍌', '🍒', '🍑'],
    CANDY: '🍬',
    DIAMOND: '💎',
    MONEY: '💰',
    BOMB: '💣'
};

const LOCK_COST = 50;
const LOCK_DURATION = 9;

// Buff Master List
const BUFF_DEFINITIONS = [
    { id: 'juiceBox', icon: '🧃', title: 'Juice Box', desc: 'Fruit win → Next fruit 5x payout' },
    { id: 'grapeLove', icon: '💜', title: 'Grape Love', desc: 'Grapes are worth 2x' },
    { id: 'orangutan', icon: '🦧', title: 'Orangutan', desc: 'Allows vertical matches for Bananas' },
    { id: 'mining', icon: '⛏', title: 'Mining', desc: 'Bomb match triggers 3 diamond spins' },
    { id: 'halloween', icon: '🎃', title: 'Halloween', desc: 'Adds extra Candy Wilds / Anti-Bomb' },
    { id: 'investor', icon: '🏦', title: 'Investor', desc: 'Money Bags pay 0, 0, then 5x' }
];

const App = () => {
    const [balance, setBalance] = useState(150);
    const [view, setView] = useState('game'); // 'game' | 'shop'
    const [grid, setGrid] = useState([
        ['🍒', '🍇', '🍌'],
        ['💎', '🍬', '💰'],
        ['🍑', '🍒', '🍇']
    ]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [lastWin, setLastWin] = useState(0);
    const [revealingColumn, setRevealingColumn] = useState(-1);
    const [winningCells, setWinningCells] = useState([]);
    const [floatingWins, setFloatingWins] = useState([]);

    const [lockedSymbol, setLockedSymbol] = useState(null);
    const [lockSpinsRemaining, setLockSpinsRemaining] = useState(0);
    const [miningTurns, setMiningTurns] = useState(0);

    // Buff State
    const [buffs, setBuffs] = useState({
        juiceBox: false,
        grapeLove: false,
        halloween: false,
        investor: false,
        mining: false,
        orangutan: false
    });

    const [activeBuffsInPlay, setActiveBuffsInPlay] = useState({ ...buffs });
    const [juiceBoxActiveNext, setJuiceBoxActiveNext] = useState(false);
    const [juiceBoxInPlay, setJuiceBoxInPlay] = useState(false);
    const [investorCount, setInvestorCount] = useState(0);
    const [activeInvestorCount, setActiveInvestorCount] = useState(0);
    const [activeMiningTurns, setActiveMiningTurns] = useState(0);

    // Shop State
    const [shopPhase, setShopPhase] = useState('menu'); // 'menu' | 'reveal'
    const [dealtCards, setDealtCards] = useState([]);

    const enterShop = () => {
        setShopPhase('menu');
        setView('shop');
    };

    const handleDeal = (dealType) => {
        let cost = 0;
        let count = 0;
        let pricingStrategy = '';

        if (dealType === 'fair') { cost = 10; count = 2; pricingStrategy = 'fair'; }
        if (dealType === 'volatile') { cost = 20; count = 3; pricingStrategy = 'volatile'; }
        if (dealType === 'great') { cost = 30; count = 1; pricingStrategy = 'great'; }

        if (balance < cost) return;

        setBalance(prev => prev - cost);

        // Logic to pick 'count' unique buffs
        const shuffledBuffs = [...BUFF_DEFINITIONS].sort(() => 0.5 - Math.random());
        const selected = shuffledBuffs.slice(0, count);

        // Volatile Prices Pool
        const volatilePrices = [25, 40, 55].sort(() => 0.5 - Math.random());

        const cards = selected.map((buff, index) => {
            let price = 40; // Default Base
            if (pricingStrategy === 'fair') price = 40;
            if (pricingStrategy === 'great') price = 10;
            if (pricingStrategy === 'volatile') price = volatilePrices[index];

            return { ...buff, price };
        });

        setDealtCards(cards);
        setShopPhase('reveal');
    };

    const purchaseCard = (card) => {
        if (balance >= card.price && !buffs[card.id]) {
            setBalance(prev => prev - card.price);
            setBuffs(prev => ({ ...prev, [card.id]: true }));

            if (card.id === 'investor') {
                setInvestorCount(0);
            }
            // Return to game after purchase
            setView('game');
        }
    };

    const toggleLock = () => {
        if (isSpinning) return;

        if (lockedSymbol) {
            setLockedSymbol(null);
            setLockSpinsRemaining(0);
        } else {
            if (balance >= LOCK_COST) {
                const currentTopLeft = grid[0][0];
                setBalance(prev => prev - LOCK_COST);
                setLockedSymbol(currentTopLeft);
                setLockSpinsRemaining(LOCK_DURATION);
            }
        }
    };

    const getRandomSymbol = (existingInSpin, isMiningActive) => {
        const pool = [];

        if (isMiningActive) {
            // Mining Active: Massive influx of diamonds
            SYMBOLS.FRUIT.forEach(f => { for (let i = 0; i < 5; i++) pool.push(f); }); // Reduced fruit
            for (let i = 0; i < 5; i++) pool.push(SYMBOLS.BOMB); // Reduced bombs
            for (let i = 0; i < 60; i++) pool.push(SYMBOLS.DIAMOND); // Massive diamonds
            for (let i = 0; i < 4; i++) pool.push(SYMBOLS.MONEY);
        } else {
            // Standard Pool
            SYMBOLS.FRUIT.forEach(f => { for (let i = 0; i < 12; i++) pool.push(f); });
            for (let i = 0; i < 10; i++) pool.push(SYMBOLS.BOMB);
            for (let i = 0; i < 2; i++) pool.push(SYMBOLS.DIAMOND);
            for (let i = 0; i < 4; i++) pool.push(SYMBOLS.MONEY);
        }

        const candyCount = existingInSpin.filter(s => s === SYMBOLS.CANDY).length;
        if (buffs.halloween || candyCount === 0) {
            for (let i = 0; i < 3; i++) pool.push(SYMBOLS.CANDY);
        }
        return pool[Math.floor(Math.random() * pool.length)];
    };

    const addFloatingWin = (val, cellIndex) => {
        const id = Math.random();
        setFloatingWins(prev => [...prev, { id, val, cellIndex }]);
        setTimeout(() => {
            setFloatingWins(prev => prev.filter(w => w.id !== id));
        }, 1500);
    };

    const calculateResults = (newGrid, currentJuiceInPlay, currentBuffs, currentInvCount) => {
        let totalWin = 0;
        let fruitWinOccurred = false;
        let bombMatchOccurred = false;
        let winningIndices = [];

        // 1. Horizontal Checks
        newGrid.forEach((row, rowIndex) => {
            const nonCandy = row.find(s => s !== SYMBOLS.CANDY);
            if (!nonCandy) {
                // All Candies - Jackpot
                totalWin += 100;
                winningIndices.push(rowIndex * 3, rowIndex * 3 + 1, rowIndex * 3 + 2);
                addFloatingWin(100, rowIndex * 3 + 1);
            } else {
                const isMatch = row.every(s => {
                    if (s === nonCandy) return true;
                    if (s === SYMBOLS.CANDY) {
                        if (currentBuffs.halloween && nonCandy === SYMBOLS.BOMB) return false;
                        return true;
                    }
                    return false;
                });

                if (isMatch) {
                    let rowWin = 0;
                    if (SYMBOLS.FRUIT.includes(nonCandy)) {
                        let multiplier = 1;
                        if (currentJuiceInPlay) multiplier *= 5;
                        if (currentBuffs.grapeLove && nonCandy === '🍇') multiplier *= 2;
                        rowWin = 10 * multiplier;
                        fruitWinOccurred = true;
                    } else if (nonCandy === SYMBOLS.DIAMOND) {
                        rowWin = 100;
                    } else if (nonCandy === SYMBOLS.BOMB) {
                        rowWin = -50;
                        bombMatchOccurred = true;
                    }

                    if (rowWin !== 0) {
                        totalWin += rowWin;
                        winningIndices.push(rowIndex * 3, rowIndex * 3 + 1, rowIndex * 3 + 2);
                        addFloatingWin(rowWin, rowIndex * 3 + 1);
                    }
                }
            }
        });

        // 2. Vertical Checks (Orangutan Buff)
        if (currentBuffs.orangutan) {
            for (let col = 0; col < 3; col++) {
                const colSymbols = [newGrid[0][col], newGrid[1][col], newGrid[2][col]];
                const nonCandy = colSymbols.find(s => s !== SYMBOLS.CANDY);
                const isBananaMatchTarget = !nonCandy || nonCandy === '🍌';

                if (isBananaMatchTarget) {
                    const isMatch = colSymbols.every(s => s === '🍌' || s === SYMBOLS.CANDY);
                    if (isMatch) {
                        let colWin = 10;
                        if (currentJuiceInPlay) colWin *= 5;
                        totalWin += colWin;
                        fruitWinOccurred = true;
                        winningIndices.push(col, col + 3, col + 6);
                        addFloatingWin(colWin, col + 3);
                    }
                }
            }
        }

        // 3. Scatter Checks (Money Bags)
        let bagsFound = false;
        newGrid.flat().forEach((s, idx) => {
            if (s === SYMBOLS.MONEY) {
                bagsFound = true;
                let bagWin = 10;
                if (currentBuffs.investor) {
                    if (currentInvCount % 3 === 2) bagWin = 50;
                    else bagWin = 0;
                }

                if (bagWin > 0 || (currentBuffs.investor && currentInvCount % 3 !== 2)) {
                    winningIndices.push(idx);
                    if (bagWin > 0) {
                        totalWin += bagWin;
                        addFloatingWin(bagWin, idx);
                    }
                }
            }
        });

        if (bagsFound) {
            setInvestorCount(prev => prev + 1);
        }

        if (currentBuffs.mining && bombMatchOccurred) {
            setMiningTurns(3);
        }

        setJuiceBoxActiveNext(currentBuffs.juiceBox && fruitWinOccurred);
        setWinningCells([...new Set(winningIndices)]);
        return totalWin;
    };

    const handleSpin = () => {
        if (balance < 1 || isSpinning) return;

        const snapshotBuffs = { ...buffs };
        const snapshotJuice = juiceBoxActiveNext;
        const snapshotInvCount = investorCount;
        const snapshotMiningTurns = miningTurns;

        setActiveBuffsInPlay(snapshotBuffs);
        setJuiceBoxInPlay(snapshotJuice);
        setActiveInvestorCount(snapshotInvCount);
        setActiveMiningTurns(snapshotMiningTurns);

        setBalance(prev => prev - 1);
        setIsSpinning(true);
        setLastWin(0);
        setWinningCells([]);
        setRevealingColumn(-1);

        if (lockedSymbol) {
            setLockSpinsRemaining(prev => {
                const nextValue = prev - 1;
                return nextValue < 0 ? 0 : nextValue;
            });
        }

        if (miningTurns > 0) {
            setMiningTurns(prev => prev - 1);
        }

        const flatResults = [];
        for (let i = 0; i < 9; i++) {
            if (i === 0 && lockedSymbol) {
                flatResults.push(lockedSymbol);
            } else {
                flatResults.push(getRandomSymbol(flatResults, snapshotMiningTurns > 0));
            }
        }

        const nextGrid = [
            [flatResults[0], flatResults[1], flatResults[2]],
            [flatResults[3], flatResults[4], flatResults[5]],
            [flatResults[6], flatResults[7], flatResults[8]]
        ];

        [0, 1, 2].forEach((col, i) => {
            setTimeout(() => {
                setGrid(prev => {
                    const newGrid = [...prev.map(row => [...row])];
                    newGrid[0][col] = nextGrid[0][col];
                    newGrid[1][col] = nextGrid[1][col];
                    newGrid[2][col] = nextGrid[2][col];
                    return newGrid;
                });
                setRevealingColumn(col);

                if (col === 2) {
                    setTimeout(() => {
                        const win = calculateResults(nextGrid, snapshotJuice, snapshotBuffs, snapshotInvCount);
                        setLastWin(win);
                        setBalance(prev => prev + win);
                        setIsSpinning(false);

                        setLockSpinsRemaining(prev => {
                            if (prev === 0) setLockedSymbol(null);
                            return prev;
                        });
                    }, 400);
                }
            }, i * 450);
        });
    };

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col items-center p-4 md:p-8 select-none">

            {/* Header / Stats */}
            <div className="w-full max-w-md flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-[2rem] shadow-sm border border-stone-200 sticky top-4 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-400 p-2 rounded-xl text-white shadow-sm shrink-0">
                            <Coins size={20} />
                        </div>
                        <span className="text-3xl font-black tabular-nums tracking-tighter leading-none">{balance}</span>
                    </div>
                    {/* Active Buffs Indicators */}
                    <div className="flex gap-2">
                        {buffs.mining && miningTurns > 0 && <div className="text-cyan-500 font-black flex items-center gap-1"><Hammer size={12} /> {miningTurns}</div>}
                        {lockedSymbol && <div className="text-amber-500 font-black flex items-center gap-1"><Lock size={12} /> {lockSpinsRemaining}</div>}
                    </div>
                </div>
                <AnimatePresence mode="wait">
                    {lastWin !== 0 && !isSpinning && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={`font-black text-sm uppercase tracking-widest whitespace-nowrap ${lastWin < 0 ? 'text-red-500' : 'text-green-500'}`}
                        >
                            {lastWin < 0 ? `Penalty ${lastWin}` : `+${lastWin}`}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
                {view === 'game' ? (
                    <motion.div
                        key="game"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full flex flex-col items-center"
                    >
                        {/* Grid */}
                        <div className={`relative w-full max-w-md aspect-square bg-stone-100 rounded-[3rem] p-4 mb-4 shadow-inner border transition-colors duration-500 ${activeMiningTurns > 0 ? 'border-cyan-300 bg-cyan-50/30' : 'border-stone-200'}`}>
                            <div className="grid grid-cols-3 grid-rows-3 gap-3 h-full">
                                {grid.flat().map((symbol, idx) => {
                                    const col = idx % 3;
                                    const isRevealed = revealingColumn >= col || !isSpinning;
                                    const isWinning = winningCells.includes(idx) && !isSpinning;
                                    const isTopLeft = idx === 0;

                                    let displaySymbol = symbol;
                                    if (symbol === SYMBOLS.MONEY && activeBuffsInPlay.investor && (activeInvestorCount % 3 !== 2)) {
                                        displaySymbol = '🏦';
                                    }

                                    return (
                                        <div
                                            key={idx}
                                            onClick={isTopLeft ? toggleLock : undefined}
                                            className={`
                                                relative bg-white rounded-[1.5rem] flex items-center justify-center overflow-hidden shadow-sm border border-stone-50
                                                ${isTopLeft ? 'cursor-pointer hover:brightness-95 transition-all' : ''}
                                            `}
                                        >
                                            <AnimatePresence mode="wait">
                                                {isRevealed || (isTopLeft && lockedSymbol && isSpinning) ? (
                                                    <motion.div
                                                        key={`${idx}-${displaySymbol}`}
                                                        initial={isTopLeft && lockedSymbol ? { y: 0, opacity: 1, scale: 1 } : { y: -100, opacity: 0, scale: 0.8 }}
                                                        animate={{ y: 0, opacity: 1, scale: isWinning ? [1, 1.15, 1] : 1, rotate: isWinning ? [0, -3, 3, 0] : 0 }}
                                                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                                        className={`text-5xl sm:text-6xl z-10 ${isWinning ? 'drop-shadow-lg' : ''} relative`}
                                                    >
                                                        {displaySymbol}
                                                        {/* Visual Indicators for Buff Activity */}
                                                        <div className="absolute inset-0 pointer-events-none">
                                                            {juiceBoxInPlay && SYMBOLS.FRUIT.includes(symbol) && <span className="absolute -top-3 -left-3 text-2xl">🧃</span>}
                                                            {activeBuffsInPlay.grapeLove && symbol === '🍇' && <span className="absolute -bottom-3 -right-3 text-2xl">💜</span>}
                                                            {activeBuffsInPlay.halloween && symbol === SYMBOLS.CANDY && <span className="absolute -bottom-3 -right-3 text-2xl">🎃</span>}
                                                            {activeBuffsInPlay.orangutan && symbol === '🍌' && <span className="absolute -top-3 -right-3 text-2xl">🦧</span>}
                                                            {activeMiningTurns > 0 && symbol === SYMBOLS.DIAMOND && <span className="absolute -bottom-3 -right-3 text-2xl">⛏</span>}
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div key="spinning" initial={{ opacity: 0 }} animate={{ opacity: 0.05 }} className="text-stone-300">
                                                        <LayoutGrid size={48} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {isTopLeft && (
                                                <div className="absolute top-3 right-3 z-20">
                                                    {lockedSymbol ? (
                                                        <Lock size={22} className="text-amber-500 fill-amber-500" />
                                                    ) : (
                                                        <Unlock size={18} className="text-stone-200" />
                                                    )}
                                                </div>
                                            )}

                                            {isWinning && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className={`absolute inset-0 border-2 rounded-[1.5rem] z-0 ${grid.flat()[winningCells.find(i => winningCells.includes(i))] === SYMBOLS.BOMB ? 'bg-red-400/5 border-red-400/20' : 'bg-amber-400/5 border-amber-400/20'}`}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Floating Wins */}
                            <AnimatePresence>
                                {floatingWins.map((win) => (
                                    <motion.div
                                        key={win.id}
                                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, y: -100, scale: 1.4 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 1, ease: "backOut" }}
                                        className={`absolute z-50 pointer-events-none font-black drop-shadow-sm text-3xl ${win.val < 0 ? 'text-red-500' : 'text-green-600'}`}
                                        style={{
                                            left: `${(win.cellIndex % 3) * 33 + 16}%`,
                                            top: `${Math.floor(win.cellIndex / 3) * 33 + 16}%`
                                        }}
                                    >
                                        {win.val > 0 ? `+${win.val}` : win.val}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Controls */}
                        <div className="w-full max-w-md space-y-3">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSpin}
                                disabled={isSpinning || balance < 1}
                                className={`
                                    w-full py-7 rounded-[2rem] text-2xl font-black uppercase tracking-tight transition-all shadow-xl
                                    ${isSpinning || balance < 1
                                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                                        : 'bg-stone-900 text-stone-50 hover:bg-black'}
                                `}
                            >
                                {isSpinning ? 'Good Luck...' : 'Pull Lever'}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={enterShop}
                                disabled={isSpinning}
                                className="w-full py-4 rounded-[1.5rem] bg-white text-stone-900 font-bold border-2 border-stone-100 hover:border-amber-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <Store size={20} />
                                Buff Marketplace
                            </motion.button>
                        </div>

                        {/* Legend / Payout Section */}
                        <div className="w-full max-w-md mt-10 bg-white rounded-[2.5rem] border border-stone-200 p-6 shadow-sm mb-12">
                            <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
                                <HelpCircle size={18} className="text-stone-400" />
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Payout Legend</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                                <LegendItem symbol="🍇" label="Fruits" payout="10" prob="70%" desc="Standard 3-in-a-row fruit match." />
                                <LegendItem symbol="💣" label="Bomb" payout="-50" prob="20%" desc="Avoid aligning 3 bombs!" isPenalty={true} />
                                <LegendItem symbol="💎" label="Diamond" payout="100" prob="3%" desc="The rare jackpot symbol." />
                                <LegendItem symbol="🍬" label="Candy" payout="Match" prob="4%" desc="Wild symbol. 1 per spin." />
                                <LegendItem symbol="💰" label="Money" payout="10/bag" prob="6%" desc="Pays instantly on appearance." />
                            </div>
                        </div>

                    </motion.div>
                ) : (
                    <div className="w-full flex flex-col items-center max-w-md">
                        {/* Shop Header */}
                        <div className="w-full mb-6">
                            <button
                                onClick={() => setView('game')}
                                className="flex items-center gap-2 text-stone-500 hover:text-stone-900 font-bold transition-colors mb-4"
                            >
                                <ArrowLeft size={18} />
                                Back to Game
                            </button>
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-black uppercase tracking-tight text-stone-900 flex items-center gap-2">
                                    <ShoppingCart size={24} />
                                    {shopPhase === 'menu' ? 'Dealer Selection' : 'Choose Wisely'}
                                </h2>
                                <div className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-black">
                                    {Object.values(buffs).filter(Boolean).length}/{BUFF_DEFINITIONS.length} Owned
                                </div>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {shopPhase === 'menu' ? (
                                <motion.div
                                    key="menu"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="w-full space-y-4"
                                >
                                    <DealOption
                                        title="Fair Deal"
                                        desc="2 cards. Standard pricing."
                                        cost={10}
                                        count={2}
                                        onClick={() => handleDeal('fair')}
                                        disabled={balance < 10}
                                        icon={<LayoutGrid className="text-blue-500" />}
                                    />
                                    <DealOption
                                        title="Volatile Deal"
                                        desc="3 cards. Random prices (25, 40, 55)."
                                        cost={20}
                                        count={3}
                                        onClick={() => handleDeal('volatile')}
                                        disabled={balance < 20}
                                        icon={<Zap className="text-amber-500" />}
                                    />
                                    <DealOption
                                        title="Great Deal"
                                        desc="1 card. Amazing price (10)."
                                        cost={30}
                                        count={1}
                                        onClick={() => handleDeal('great')}
                                        disabled={balance < 30}
                                        icon={<Sparkles className="text-purple-500" />}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="reveal"
                                    className="w-full flex flex-col items-center"
                                >
                                    {/* Card Container - Side by Side Flex */}
                                    <div className="w-full flex flex-row items-stretch justify-center gap-2 sm:gap-4 mb-6">
                                        {dealtCards.map((card, idx) => (
                                            <PlayingCard
                                                key={`${card.id}-${idx}`}
                                                card={card}
                                                index={idx}
                                                owned={buffs[card.id]}
                                                balance={balance}
                                                onPurchase={() => purchaseCard(card)}
                                            />
                                        ))}
                                    </div>

                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1 }}
                                        onClick={() => setShopPhase('menu')}
                                        className="w-full py-4 text-stone-400 hover:text-stone-600 font-bold text-sm transition-colors"
                                    >
                                        Decline & Return to Menu
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DealOption = ({ title, desc, cost, count, onClick, disabled, icon }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
            w-full bg-white p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group
            ${disabled ? 'border-stone-100 opacity-50 cursor-not-allowed' : 'border-stone-100 hover:border-stone-900 hover:shadow-lg'}
        `}
    >
        <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-stone-50 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
                <div>
                    <h3 className="font-black text-lg text-stone-900 uppercase tracking-tight leading-none">{title}</h3>
                    <span className="text-xs font-bold text-stone-400">Deals {count} Cards</span>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Cost</span>
                <div className="flex items-center gap-1 text-stone-900 font-black text-xl">
                    {cost}<Coins size={14} className="text-amber-500 fill-amber-500" />
                </div>
            </div>
        </div>
        <p className="text-sm text-stone-500 relative z-10">{desc}</p>
    </button>
);

const PlayingCard = ({ card, index, owned, balance, onPurchase }) => {
    const isAffordable = balance >= card.price;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: index * 0.15, type: "spring", damping: 20 }}
            className={`
                relative bg-white rounded-[1.5rem] p-3 shadow-xl border-2 flex flex-col items-center text-center
                w-1/3 flex-grow-0 min-w-0 aspect-[2/3] sm:aspect-[9/16]
                ${owned ? 'border-stone-100 bg-stone-50' : 'border-stone-900'}
            `}
        >
            <div className="text-4xl sm:text-5xl mb-2 sm:mb-4 p-2 sm:p-3 bg-stone-50 rounded-full shadow-inner mt-2">{card.icon}</div>

            <h3 className="text-sm sm:text-lg font-black uppercase tracking-tight mb-1 leading-tight">{card.title}</h3>
            <p className="text-[10px] sm:text-xs text-stone-500 font-medium mb-2 leading-tight px-1 flex-1 flex items-center justify-center">
                {card.desc}
            </p>

            <div className="w-full mt-auto">
                {owned ? (
                    <div className="w-full py-2 rounded-xl bg-stone-200 text-stone-400 font-bold text-[10px] sm:text-xs uppercase flex items-center justify-center gap-1">
                        <Star size={12} className="fill-stone-400" /> Owned
                    </div>
                ) : (
                    <button
                        onClick={onPurchase}
                        disabled={!isAffordable}
                        className={`
                            w-full py-2 sm:py-3 rounded-xl font-black uppercase tracking-tight text-sm sm:text-lg flex items-center justify-center gap-1 sm:gap-2 transition-transform active:scale-95
                            ${isAffordable ? 'bg-amber-400 text-white shadow-md hover:bg-amber-500' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}
                        `}
                    >
                        <Tag size={14} />
                        {card.price}
                    </button>
                )}
            </div>

            {/* Rarity/Price Indicator */}
            {!owned && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    {card.price < 40 && <div className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-black uppercase">Sale</div>}
                    {card.price > 40 && <div className="bg-red-100 text-red-500 px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-black uppercase">High</div>}
                </div>
            )}
        </motion.div>
    );
};

const LegendItem = ({ symbol, label, payout, prob, desc, isPenalty }) => (
    <div className="flex items-start gap-3 group">
        <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform shadow-inner">
            {symbol}
        </div>
        <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-tight text-stone-900 truncate">{label}</span>
                <span className={`text-[8px] px-1 py-0.5 rounded-full font-bold ${parseInt(prob) <= 10 ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-400'}`}>
                    {prob}
                </span>
            </div>
            <div className={`text-[9px] font-bold uppercase tracking-tighter ${isPenalty ? 'text-red-500' : 'text-green-600'}`}>
                {payout} Payout
            </div>
            <p className="text-[10px] text-stone-400 leading-tight mt-1 line-clamp-2">{desc}</p>
        </div>
    </div>
);

export default App;