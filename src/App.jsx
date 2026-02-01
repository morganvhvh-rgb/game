import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ShoppingCart, Zap, Star, LayoutGrid, Info, HelpCircle, Lock, Unlock, Pickaxe } from 'lucide-react';

// Configuration
const SYMBOLS = {
    FRUIT: ['🍇', '🍌', '🍒', '🍑'],
    CANDY: '🍬',
    DIAMOND: '💎',
    MONEY: '💰',
    BOMB: '💣'
};

const STANDARD_BUFF_COST = 15;
const HALLOWEEN_BUFF_COST = 50;
const LOCK_COST = 50;
const LOCK_DURATION = 9;

const App = () => {
    const [balance, setBalance] = useState(150);
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

    const [buffs, setBuffs] = useState({
        juiceBox: false,
        grapeLove: false,
        halloween: false,
        investor: false,
        mining: false
    });

    const [activeBuffsInPlay, setActiveBuffsInPlay] = useState({
        juiceBox: false,
        grapeLove: false,
        halloween: false,
        investor: false,
        mining: false
    });

    const [juiceBoxActiveNext, setJuiceBoxActiveNext] = useState(false);
    const [juiceBoxInPlay, setJuiceBoxInPlay] = useState(false);
    const [investorCount, setInvestorCount] = useState(0);
    const [activeInvestorCount, setActiveInvestorCount] = useState(0);
    const [activeMiningTurns, setActiveMiningTurns] = useState(0);

    const buyBuff = (type) => {
        const cost = type === 'halloween' ? HALLOWEEN_BUFF_COST : STANDARD_BUFF_COST;
        if (balance >= cost && !buffs[type]) {
            setBalance(prev => prev - cost);
            setBuffs(prev => ({ ...prev, [type]: true }));

            if (type === 'investor') {
                setInvestorCount(0);
            }
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

        newGrid.forEach((row, rowIndex) => {
            const nonCandy = row.find(s => s !== SYMBOLS.CANDY);
            if (!nonCandy) {
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
                        rowWin = 100; // Updated Payout
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

        // Mining Buff Logic
        if (currentBuffs.mining && bombMatchOccurred) {
            setMiningTurns(3);
        }

        setJuiceBoxActiveNext(currentBuffs.juiceBox && fruitWinOccurred);
        setWinningCells(winningIndices);
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

            {/* Integrated Balance & Lock & Mining Bar */}
            <div className="w-full max-w-md flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-[2rem] shadow-sm border border-stone-200">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-400 p-2 rounded-xl text-white shadow-sm shrink-0">
                            <Coins size={20} />
                        </div>
                        <span className="text-3xl font-black tabular-nums tracking-tighter leading-none">{balance}</span>
                    </div>

                    <div className="flex gap-4">
                        <AnimatePresence>
                            {lockedSymbol && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex items-center gap-2 border-l border-stone-100 pl-4"
                                >
                                    <div className="bg-amber-500 p-1.5 rounded-lg text-white shadow-sm shrink-0">
                                        <Lock size={14} className="fill-current" />
                                    </div>
                                    <span className="text-xl font-black tabular-nums tracking-tighter text-amber-600 leading-none">
                                        {lockSpinsRemaining}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {miningTurns > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex items-center gap-2 border-l border-stone-100 pl-4"
                                >
                                    <div className="bg-cyan-500 p-1.5 rounded-lg text-white shadow-sm shrink-0 animate-pulse">
                                        <Pickaxe size={14} className="fill-current" />
                                    </div>
                                    <span className="text-xl font-black tabular-nums tracking-tighter text-cyan-600 leading-none">
                                        {miningTurns}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex items-center">
                    <AnimatePresence mode="wait">
                        {lastWin !== 0 && !isSpinning && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={`font-black text-sm uppercase tracking-widest whitespace-nowrap ${lastWin < 0 ? 'text-red-500' : 'text-green-500'}`}
                            >
                                {lastWin < 0 ? `Penalty ${lastWin}` : `Payout +${lastWin}`}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Grid Container */}
            <div className={`relative w-full max-w-md aspect-square bg-stone-100 rounded-[3rem] p-4 mb-8 shadow-inner border transition-colors duration-500 ${activeMiningTurns > 0 ? 'border-cyan-300 bg-cyan-50/30' : 'border-stone-200'}`}>
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

                        const isCurrentlyLocked = isTopLeft && lockedSymbol;

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
                                    {isRevealed || (isCurrentlyLocked && isSpinning) ? (
                                        <motion.div
                                            key={isCurrentlyLocked ? 'locked-cell' : `${idx}-${displaySymbol}`}
                                            initial={isCurrentlyLocked ? { y: 0, opacity: 1, scale: 1 } : { y: -100, opacity: 0, scale: 0.8 }}
                                            animate={{
                                                y: 0,
                                                opacity: 1,
                                                scale: isWinning ? [1, 1.15, 1] : 1,
                                                rotate: isWinning ? [0, -3, 3, 0] : 0
                                            }}
                                            transition={{
                                                type: "spring", stiffness: 260, damping: 20,
                                                scale: { repeat: isWinning ? Infinity : 0, duration: 1, ease: "easeInOut" },
                                                rotate: { repeat: isWinning ? Infinity : 0, duration: 0.5 }
                                            }}
                                            className={`text-5xl sm:text-6xl z-10 ${isWinning ? 'drop-shadow-lg' : ''} relative`}
                                        >
                                            {displaySymbol}
                                            <div className="absolute inset-0 pointer-events-none">
                                                {juiceBoxInPlay && SYMBOLS.FRUIT.includes(symbol) && (
                                                    <span className="absolute -top-3 -left-3 text-2xl drop-shadow-sm">🧃</span>
                                                )}
                                                {activeBuffsInPlay.grapeLove && symbol === '🍇' && (
                                                    <span className="absolute -bottom-3 -right-3 text-2xl drop-shadow-sm">💜</span>
                                                )}
                                                {activeBuffsInPlay.halloween && symbol === SYMBOLS.CANDY && (
                                                    <span className="absolute -bottom-3 -right-3 text-2xl drop-shadow-sm">🎃</span>
                                                )}
                                                {activeMiningTurns > 0 && symbol === SYMBOLS.DIAMOND && (
                                                    <span className="absolute -bottom-3 -right-3 text-2xl drop-shadow-sm">⛏</span>
                                                )}
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
                                            <Lock size={22} className="text-amber-500 fill-amber-500 drop-shadow-sm" />
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

            {/* Action Button */}
            <div className="w-full max-w-md">
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
            </div>

            {/* Buff Shop */}
            <div className="w-full max-w-md mt-10">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 flex items-center gap-2">
                        <ShoppingCart size={12} /> Marketplace
                    </h2>
                    {juiceBoxActiveNext && <Zap size={14} className="text-blue-500 fill-blue-500 animate-pulse" />}
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <BuffCard
                        icon="🧃"
                        title="Juice Box"
                        active={buffs.juiceBox}
                        desc="Fruit win → Next fruit 5x"
                        cost={STANDARD_BUFF_COST}
                        onClick={() => buyBuff('juiceBox')}
                        highlight={juiceBoxActiveNext}
                    />
                    <BuffCard
                        icon="💜"
                        title="Grape Love"
                        active={buffs.grapeLove}
                        desc="Grapes are 2x"
                        cost={STANDARD_BUFF_COST}
                        onClick={() => buyBuff('grapeLove')}
                    />
                    <BuffCard
                        icon="🎃"
                        title="Halloween"
                        active={buffs.halloween}
                        desc="Multi-Candy / Anti-Bomb"
                        cost={HALLOWEEN_BUFF_COST}
                        onClick={() => buyBuff('halloween')}
                    />
                    <BuffCard
                        icon="⛏"
                        title="Mining"
                        active={buffs.mining}
                        desc="Bomb match = 3 diamond spins"
                        cost={STANDARD_BUFF_COST}
                        onClick={() => buyBuff('mining')}
                        progress={buffs.mining && miningTurns > 0 ? miningTurns : null}
                    />
                    <BuffCard
                        icon="🏦"
                        title="Investor"
                        active={buffs.investor}
                        desc="Bags: 0, 0, 5x"
                        cost={STANDARD_BUFF_COST}
                        onClick={() => buyBuff('investor')}
                        progress={buffs.investor ? investorCount % 3 : null}
                    // removed fullWidth prop
                    />
                </div>
            </div>

            {/* Legend / Payout Section */}
            <div className="w-full max-w-md mt-10 bg-white rounded-[2.5rem] border border-stone-200 p-6 shadow-sm mb-12">
                <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
                    <HelpCircle size={18} className="text-stone-400" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Payout Legend</h2>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                        <LegendItem
                            symbol="🍇"
                            label="Fruits"
                            payout="10"
                            prob="70%"
                            desc="Standard 3-in-a-row fruit match."
                        />
                        <LegendItem
                            symbol="💣"
                            label="Bomb"
                            payout="-50"
                            prob="20%"
                            desc="Avoid aligning 3 bombs!"
                            isPenalty={true}
                        />
                        <LegendItem
                            symbol="💎"
                            label="Diamond"
                            payout="100"
                            prob="3%"
                            desc="The rare jackpot symbol."
                        />
                        <LegendItem
                            symbol="🍬"
                            label="Candy"
                            payout="Match"
                            prob="4%"
                            desc="Wild symbol. 1 per spin."
                        />
                        <LegendItem
                            symbol="💰"
                            label="Money"
                            payout="10/bag"
                            prob="6%"
                            desc="Pays instantly on appearance."
                        />
                        <div className="bg-stone-50 rounded-2xl p-3 flex flex-col justify-center">
                            <h3 className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-1">
                                <Info size={10} /> Rules
                            </h3>
                            <ul className="text-[10px] text-stone-500 space-y-1">
                                <li>• Each spin costs 1.</li>
                                <li>• Buffs are permanent.</li>
                                <li>• Locks last 9 spins.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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

const BuffCard = ({ icon, title, active, desc, onClick, highlight, progress, cost, fullWidth }) => (
    <button
        onClick={onClick}
        disabled={active}
        className={`
            flex items-center gap-2 p-3 rounded-2xl border transition-all text-left relative group
            ${active
                ? 'bg-white border-stone-200 shadow-sm opacity-60'
                : 'bg-white border-stone-100 shadow-sm hover:border-amber-200 hover:bg-amber-50/30'}
            ${fullWidth ? 'col-span-2' : ''}
        `}
    >
        <span className="text-2xl shrink-0">{icon}</span>
        <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-black uppercase tracking-tight text-stone-900 truncate">{title}</span>
            <span className="text-[8px] text-stone-400 leading-none mt-0.5 truncate">{desc}</span>
            {!active && (
                <div className="flex items-center gap-1 mt-1">
                    <Coins size={8} className="text-amber-500" />
                    <span className="text-[9px] font-bold text-amber-600 tabular-nums">{cost}</span>
                </div>
            )}
            {progress !== null && (
                <div className="flex gap-0.5 mt-1.5">
                    {[1, 2, 3].map(i => {
                        // For mining, we count down from 3, so active turns fill bars
                        // For investor, we count up 0,1,2
                        const isActive = title === 'Mining'
                            ? i <= progress // 3 turns left = 3 bars
                            : i - 1 < progress; // 0 index based for investor

                        return <div key={i} className={`h-1 w-2 rounded-full ${isActive ? (title === 'Mining' ? 'bg-cyan-400' : 'bg-amber-400') : 'bg-stone-200'}`} />
                    })}
                </div>
            )}
        </div>
        {active && (
            <div className="absolute top-2 right-2">
                <Star size={10} className={` ${highlight ? 'text-blue-500 fill-blue-500 animate-pulse' : 'text-green-500 fill-green-500'}`} />
            </div>
        )}
    </button>
);

export default App;