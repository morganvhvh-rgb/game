import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Coins, ShoppingCart, Zap, LayoutGrid, Info, HelpCircle, Lock, Unlock, Hammer, ArrowLeft, Store, Sparkles, Star, Handshake, TrendingUp, Dumbbell } from 'lucide-react';
import { SYMBOLS, LOCK_COST, LOCK_DURATION, BUFF_DEFINITIONS, S_TIER_BUFFS } from './data/gameConfig';
import PlayingCard from './components/PlayingCard';
import DealOption from './components/DealOption';


// Configuration
// Configuration loaded from gameConfig.js

const App = () => {
    const [balance, setBalance] = useState(150);
    const [spinCost, setSpinCost] = useState(1);
    const [totalSpins, setTotalSpins] = useState(0);
    const [nextSpinflationThreshold, setNextSpinflationThreshold] = useState(20);
    const [showSpinflation, setShowSpinflation] = useState(false);
    const [view, setView] = useState('game'); // 'game' | 'shop' | 'info'
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

    // Animated Balance
    const balanceMotion = useMotionValue(balance);
    const displayBalance = useTransform(balanceMotion, (value) => Math.round(value));

    useEffect(() => {
        const controls = animate(balanceMotion, balance, { duration: 1, ease: "circOut" });
        return controls.stop;
    }, [balance]);

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
    const [lotteryFail, setLotteryFail] = useState(false);

    const enterShop = () => {
        setShopPhase('menu');
        setLotteryFail(false);
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
        setDealtCards(cards);
        setLotteryFail(false);
        setShopPhase('reveal');
    };

    const handleLottery = () => {
        const cost = 100;
        if (balance < cost) return;

        setBalance(prev => prev - cost);

        const isWin = Math.random() < 0.1;

        if (isWin) {
            const randomSTier = S_TIER_BUFFS[Math.floor(Math.random() * S_TIER_BUFFS.length)];
            // Price is 200 for S-Tier Buffs
            setDealtCards([{ ...randomSTier, price: 200 }]);
            setLotteryFail(false);
        } else {
            setDealtCards([]);
            setLotteryFail(true);
        }
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
        }, 800);
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
                        if (currentJuiceInPlay) multiplier *= 4;
                        if (currentBuffs.grapeLove && nonCandy === '🍇') multiplier *= 2;
                        if (currentBuffs.orangutan && nonCandy === '🍌') multiplier *= 2;
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
                        if (currentJuiceInPlay) colWin *= 4;
                        colWin *= 2; // Orangutan 2x Multiplier
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
        if (balance < spinCost || isSpinning) return;

        // Spinflation Trigger Check
        if (totalSpins > 0 && totalSpins >= nextSpinflationThreshold) {
            setNextSpinflationThreshold(prev => prev + 20);
            setSpinCost(prev => prev * 2);
            setShowSpinflation(true);
            return;
        }

        const snapshotBuffs = { ...buffs };
        const snapshotJuice = juiceBoxActiveNext;
        const snapshotInvCount = investorCount;
        const snapshotMiningTurns = miningTurns;

        setActiveBuffsInPlay(snapshotBuffs);
        setJuiceBoxInPlay(snapshotJuice);
        setActiveInvestorCount(snapshotInvCount);
        setActiveMiningTurns(snapshotMiningTurns);

        setBalance(prev => prev - spinCost);
        setTotalSpins(prev => prev + 1);
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
                    }, 250);
                }
            }, i * 150);
        });
    };

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col items-center p-4 md:p-8 select-none">

            {/* Header / Stats */}
            <div className="w-full max-w-md flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-[2rem] shadow-sm border border-stone-200 sticky top-4 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="text-amber-400 shrink-0">
                            <Coins size={32} />
                        </div>
                        <motion.span className="text-3xl font-black tabular-nums tracking-tighter leading-none">{displayBalance}</motion.span>
                    </div>
                    {/* Active Buffs Indicators */}
                    <div className="flex gap-2">
                        {buffs.mining && miningTurns > 0 && <div className="text-cyan-500 font-black flex items-center gap-1"><span className="text-sm">💥</span> {miningTurns}</div>}
                        {lockedSymbol && <div className="text-amber-500 font-black flex items-center gap-1"><Lock size={12} /> {lockSpinsRemaining}</div>}
                    </div>
                </div>
                <AnimatePresence mode="wait">
                    {lastWin !== 0 && !isSpinning && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={`font-black text-xl uppercase tracking-widest whitespace-nowrap ${lastWin < 0 ? 'text-red-500' : 'text-green-500'}`}
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
                                                        initial={isTopLeft && lockedSymbol ? { x: 0, opacity: 1, scale: 1 } : { x: -50, opacity: 0, scale: 0.5 }}
                                                        animate={{
                                                            x: 0,
                                                            opacity: 1,
                                                            scale: isWinning ? [1, 1.5, 1] : 1,
                                                            rotate: isWinning ? [0, -5, 5, 0] : 0
                                                        }}
                                                        transition={{
                                                            default: { type: "spring", stiffness: 400, damping: 25 },
                                                            scale: { duration: 0.4, times: [0, 0.5, 1], repeat: 0 },
                                                            delay: isWinning ? 0 : (Math.floor(idx / 3) * 0.05)
                                                        }}
                                                        className={`text-5xl sm:text-6xl z-10 ${isWinning ? 'drop-shadow-lg' : ''} relative`}
                                                    >
                                                        {displaySymbol}
                                                        {/* Visual Indicators for Buff Activity */}
                                                        <div className="absolute inset-0 pointer-events-none">
                                                            {juiceBoxInPlay && SYMBOLS.FRUIT.includes(symbol) && <span className="absolute -top-3 -left-3 text-2xl">🧃</span>}
                                                            {activeBuffsInPlay.grapeLove && symbol === '🍇' && <span className="absolute -bottom-3 -right-3 text-2xl">💜</span>}
                                                            {activeBuffsInPlay.halloween && symbol === SYMBOLS.CANDY && <span className="absolute -bottom-3 -right-3 text-2xl">🎃</span>}
                                                            {activeBuffsInPlay.orangutan && symbol === '🍌' && <span className="absolute -top-3 -right-3 text-2xl">🦧</span>}
                                                            {activeMiningTurns > 0 && symbol === SYMBOLS.DIAMOND && <span className="absolute -bottom-3 -right-3 text-2xl">💥</span>}
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
                                                    animate={{ opacity: [0, 0.8, 0] }}
                                                    transition={{ duration: 2, times: [0, 0.1, 1], ease: "easeOut" }}
                                                    className={`absolute inset-0 rounded-[1.5rem] z-0 ${grid.flat()[winningCells.find(i => winningCells.includes(i))] === SYMBOLS.BOMB
                                                        ? 'bg-red-500'
                                                        : 'bg-pink-500'
                                                        }`}
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
                                        animate={{ opacity: 1, y: -40, scale: 1.0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.6, ease: "backOut" }}
                                        className="absolute z-50 pointer-events-none font-black text-2xl text-white"
                                        style={{
                                            left: `${(win.cellIndex % 3) * 33 + 16}%`,
                                            top: `${Math.floor(win.cellIndex / 3) * 33 + 16}%`,
                                            textShadow: '3px 3px 0 #000'
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
                                    w-full py-5 rounded-[2rem] text-2xl font-black uppercase tracking-tight transition-all shadow-xl
                                    ${isSpinning || balance < 1
                                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                                        : 'bg-stone-900 text-stone-50 hover:bg-black'}
                                `}
                            >
                                <span className="flex flex-col items-center leading-none gap-1">
                                    <span>{isSpinning ? 'SPINNING...' : 'Pull Lever'}</span>
                                    <span className={`text-xs font-bold tracking-wide ${isSpinning ? 'opacity-0' : 'opacity-50'}`}>{spinCost} Coin{spinCost > 1 ? 's' : ''}</span>
                                </span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={enterShop}
                                disabled={isSpinning}
                                className="w-full py-4 rounded-[1.5rem] bg-white text-stone-900 font-bold border-2 border-stone-100 hover:border-amber-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <Dumbbell size={20} />
                                Buff Cards
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setView('info')}
                                className="w-full py-4 mt-3 rounded-[1.5rem] bg-white text-stone-500 font-bold border-2 border-stone-100 hover:text-stone-900 transition-colors flex items-center justify-center gap-2"
                            >
                                <Info size={20} />
                                Game Information
                            </motion.button>
                        </div>
                    </motion.div>
                ) : view === 'shop' ? (
                    <motion.div
                        key="shop"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="w-full flex flex-col items-center max-w-md"
                    >
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
                                    className="w-full flex flex-col items-center gap-4"
                                >
                                    <div className="w-full flex flex-row items-stretch justify-center gap-2 sm:gap-4">
                                        <DealOption
                                            title="Fair Deal"
                                            desc="2 Buff choices. Standard pricing."
                                            cost={10}
                                            count={2}
                                            onClick={() => handleDeal('fair')}
                                            disabled={balance < 10}
                                            icon={<Handshake className="text-blue-500" />}
                                        />
                                        <DealOption
                                            title="Volatile Deal"
                                            desc="3 Buff choices. Random prices."
                                            cost={20}
                                            count={3}
                                            onClick={() => handleDeal('volatile')}
                                            disabled={balance < 20}
                                            icon={<Zap className="text-amber-500" />}
                                        />
                                        <DealOption
                                            title="Great Deal"
                                            desc="1 Buff choice. Amazing price."
                                            cost={30}
                                            count={1}
                                            onClick={() => handleDeal('great')}
                                            disabled={balance < 30}
                                            icon={<Sparkles className="text-purple-500" />}
                                        />
                                    </div>

                                    {/* Lottery Option */}
                                    <button
                                        onClick={handleLottery}
                                        disabled={balance < 100}
                                        className={`
                                            w-full bg-stone-900 p-4 rounded-[1.5rem] shadow-xl border-2 border-stone-800
                                            flex items-center justify-between text-white transition-all
                                            ${balance < 100 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-2xl hover:bg-black'}
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-stone-800 rounded-xl border border-stone-700">
                                                <Star size={24} className="text-yellow-400 animate-pulse" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-black text-lg uppercase tracking-tight text-white flex items-center gap-2">
                                                    Lottery Chance
                                                </h3>
                                                <p className="text-xs text-stone-400 font-medium">10% Chance to buy an S-Tier Buff</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Ticket Price</span>
                                            <div className="flex items-center gap-1 font-black text-xl text-white">
                                                100 <Coins size={16} className="text-amber-400 fill-amber-400" />
                                            </div>
                                        </div>
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="reveal"
                                    className="w-full flex flex-col items-center"
                                >
                                    {/* Card Container - Side by Side Flex */}
                                    {lotteryFail ? (
                                        <div className="w-full h-64 flex flex-col items-center justify-center bg-stone-100 rounded-[2rem] border-2 border-stone-200 mb-6 p-6 text-center animate-in fade-in zoom-in duration-300">
                                            <div className="text-6xl mb-4 grayscale opacity-50">💔</div>
                                            <h3 className="text-xl font-black text-stone-400 uppercase tracking-tight mb-2">Lady Luck Frowns</h3>
                                            <p className="text-stone-500 font-medium max-w-[200px]">The stars did not align this time. Try again?</p>
                                        </div>
                                    ) : (
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
                                    )}

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
                    </motion.div>
                ) : (
                    <motion.div
                        key="info"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="w-full flex flex-col items-center max-w-md h-[calc(100vh-100px)]"
                    >
                        {/* Compact Header */}
                        <div className="w-full mb-3 flex justify-between items-center sticky top-2 z-50">
                            <button
                                onClick={() => setView('game')}
                                className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-stone-900 hover:bg-white font-black transition-all border border-stone-200 text-sm"
                            >
                                <ArrowLeft size={16} />
                                Back
                            </button>
                            <span className="text-xs font-black uppercase tracking-widest text-stone-400 bg-white/90 px-3 py-1.5 rounded-full border border-stone-200">
                                Guide
                            </span>
                        </div>

                        <div className="w-full flex-1 overflow-y-auto min-h-0 space-y-3 pb-4">

                            {/* Combined Grid for Paytable */}
                            <div className="grid grid-cols-2 gap-2">
                                {/* Diamond - Jackpot - Full Width */}
                                <div className="col-span-2 flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-cyan-50/50 z-0"></div>
                                    <div className="text-4xl shadow-sm bg-white w-12 h-12 rounded-xl flex items-center justify-center relative z-10">💎</div>
                                    <div className="flex-1 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-stone-900 uppercase text-sm">Jackpot</h4>
                                            <span className="text-[10px] font-bold bg-cyan-100 text-cyan-600 px-1.5 py-0.5 rounded-full">RARE</span>
                                        </div>
                                        <p className="text-[10px] text-stone-500 font-medium leading-tight">Match 3 Diamonds.</p>
                                    </div>
                                    <div className="flex flex-col items-end relative z-10">
                                        <span className="font-black text-lg text-cyan-600">+100</span>
                                    </div>
                                </div>

                                {/* Fruits */}
                                <div className="col-span-2 flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-stone-200 shadow-sm">
                                    <div className="flex -space-x-2 shrink-0 pl-1">
                                        {SYMBOLS.FRUIT.map((f, i) => (
                                            <div key={i} className="w-8 h-8 bg-stone-50 rounded-full flex items-center justify-center text-lg shadow-sm border border-stone-100 relative z-[10] first:z-[40] second:z-[30]">{f}</div>
                                        ))}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-stone-900 text-xs">Fruit Match</h4>
                                        <p className="text-[10px] text-stone-400">Match 3</p>
                                    </div>
                                    <div className="font-black text-stone-900 text-base pr-2">+10</div>
                                </div>

                                {/* Bomb */}
                                <div className="col-span-2 flex items-center gap-3 bg-red-50/50 p-2.5 rounded-2xl border border-red-100 shadow-sm">
                                    <div className="text-2xl w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm">💣</div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-red-900 uppercase text-xs">Penalty</h4>
                                        <p className="text-[10px] text-red-700/70 font-medium">Minus points</p>
                                    </div>
                                    <div className="font-black text-red-500 text-base pr-2">-50</div>
                                </div>

                                {/* Wild */}
                                <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center text-center">
                                    <div className="text-2xl mb-1">🍬</div>
                                    <div className="font-bold text-[10px] uppercase text-stone-900">Wild</div>
                                    <p className="text-[9px] text-stone-400 leading-tight">Max 1/spin</p>
                                </div>

                                {/* Scatter */}
                                <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center text-center">
                                    <div className="text-2xl mb-1">💰</div>
                                    <div className="font-bold text-[10px] uppercase text-stone-900">Scatter</div>
                                    <p className="text-[9px] text-stone-400 leading-tight">Instant +10</p>
                                </div>
                            </div>

                            {/* Mechanics - Compact Dark Mode */}
                            <div className="bg-stone-900 text-stone-300 rounded-2xl p-4 shadow-lg relative overflow-hidden">
                                <div className="grid grid-cols-1 gap-4 relative z-10">
                                    {/* Locking */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                                            <Lock size={14} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-white text-xs mb-1">Symbol Locking</h4>
                                                <span className="text-[10px] font-black text-amber-400 bg-amber-900/30 px-1.5 rounded">{LOCK_COST}C</span>
                                            </div>
                                            <p className="text-[10px] text-stone-400 leading-relaxed">
                                                Top-Left symbol stays for {LOCK_DURATION} spins.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-stone-800 w-full"></div>

                                    {/* Spinflation */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                                            <TrendingUp size={14} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-xs mb-1">Spinflation</h4>
                                            <p className="text-[10px] text-stone-400 leading-relaxed">
                                                Spin cost doubles every 20 spins.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Mechanics (Old) - To Delete */}
                            <div className="hidden">
                                <div className="absolute -right-4 -top-4 text-stone-800 opacity-20 rotate-12">
                                    <Zap size={150} />
                                </div>

                                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2 relative z-10">
                                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                    Mechanics
                                </h3>

                                <div className="space-y-6 relative z-10">

                                    {/* Locking */}
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                                            <Lock size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white mb-1">Symbol Locking</h4>
                                            <p className="text-xs text-stone-400 leading-relaxed mb-2">
                                                Click the <strong className="text-white">Top-Left</strong> symbol to lock it for {LOCK_DURATION} spins.
                                            </p>
                                            <div className="inline-flex items-center gap-2 bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700">
                                                <span className="text-[10px] font-bold text-stone-500 uppercase">Cost</span>
                                                <span className="font-black text-amber-400 text-sm">{LOCK_COST}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Spinflation */}
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                                            <TrendingUp size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white mb-1">Spinflation</h4>
                                            <p className="text-xs text-stone-400 leading-relaxed">
                                                Spin costs double every 20 spins. Manage your balance wisely!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spinflation Modal */}
            <AnimatePresence>
                {showSpinflation && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-black rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl border-4 border-red-600 relative overflow-hidden"
                        >
                            <div className="mb-4 bg-stone-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-red-600 shadow-inner border border-red-900/50">
                                <TrendingUp size={40} />
                            </div>

                            <h2 className="text-3xl font-black text-red-600 uppercase tracking-tighter mb-2">Spinflation</h2>
                            <p className="text-white font-bold text-lg mb-8 leading-tight">
                                Spins are now <span className="text-red-600 text-2xl inline-block mt-1">{spinCost} coins</span>.
                            </p>

                            <button
                                onClick={() => setShowSpinflation(false)}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl uppercase tracking-widest transition-colors shadow-lg hover:shadow-red-500/30 ring-offset-2 focus:ring-2 ring-red-500 ring-offset-black"
                            >
                                PROCEED
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};



export default App;