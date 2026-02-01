import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ShoppingCart, Zap, Star, LayoutGrid, Info, HelpCircle } from 'lucide-react';

// Configuration
const SYMBOLS = {
    FRUIT: ['🍇', '🍌', '🍒', '🍑'],
    CANDY: '🍬',
    DIAMOND: '💎',
    MONEY: '💰'
};

const BUFF_COST = 15;

const App = () => {
    const [balance, setBalance] = useState(100);
    const [grid, setGrid] = useState([
        ['🍒', '🍇', '🍌'],
        ['💎', '🍬', '💰'],
        ['🍑', '🍒', '🍇']
    ]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [lastWin, setLastWin] = useState(0);
    const [revealingColumn, setRevealingColumn] = useState(-1); // -1 = none, 0, 1, 2 = columns
    const [winningCells, setWinningCells] = useState([]);
    const [floatingWins, setFloatingWins] = useState([]);

    // Buff State
    const [buffs, setBuffs] = useState({
        juiceBox: false,
        grapeLove: false,
        halloween: false,
        investor: false
    });

    const [juiceBoxActiveNext, setJuiceBoxActiveNext] = useState(false);
    const [investorCount, setInvestorCount] = useState(0);

    const buyBuff = (type) => {
        if (balance >= BUFF_COST && !buffs[type]) {
            setBalance(prev => prev - BUFF_COST);
            setBuffs(prev => ({ ...prev, [type]: true }));
        }
    };

    const getRandomSymbol = (existingInSpin) => {
        const pool = [];
        SYMBOLS.FRUIT.forEach(f => { for (let i = 0; i < 15; i++) pool.push(f); });
        for (let i = 0; i < 2; i++) pool.push(SYMBOLS.DIAMOND);
        for (let i = 0; i < 4; i++) pool.push(SYMBOLS.MONEY);

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

    const calculateResults = (newGrid) => {
        let totalWin = 0;
        let fruitWinOccurred = false;
        let winningIndices = [];

        // Rows
        newGrid.forEach((row, rowIndex) => {
            const nonCandy = row.find(s => s !== SYMBOLS.CANDY);
            if (!nonCandy) {
                totalWin += 50;
                winningIndices.push(rowIndex * 3, rowIndex * 3 + 1, rowIndex * 3 + 2);
                addFloatingWin(50, rowIndex * 3 + 1);
            } else {
                const isMatch = row.every(s => s === nonCandy || s === SYMBOLS.CANDY);
                if (isMatch) {
                    let rowWin = 0;
                    if (SYMBOLS.FRUIT.includes(nonCandy)) {
                        let multiplier = 1;
                        if (juiceBoxActiveNext) multiplier *= 5;
                        if (buffs.grapeLove && nonCandy === '🍇') multiplier *= 2;
                        rowWin = 10 * multiplier;
                        fruitWinOccurred = true;
                    } else if (nonCandy === SYMBOLS.DIAMOND) {
                        rowWin = 50;
                    }

                    if (rowWin > 0) {
                        totalWin += rowWin;
                        winningIndices.push(rowIndex * 3, rowIndex * 3 + 1, rowIndex * 3 + 2);
                        addFloatingWin(rowWin, rowIndex * 3 + 1);
                    }
                }
            }
        });

        // Money Bags
        newGrid.flat().forEach((s, idx) => {
            if (s === SYMBOLS.MONEY) {
                let bagWin = 10;
                if (buffs.investor) {
                    if (investorCount % 3 === 2) bagWin = 50;
                    else bagWin = 0;
                }

                if (bagWin > 0 || (buffs.investor && investorCount % 3 !== 2)) {
                    winningIndices.push(idx);
                    if (bagWin > 0) {
                        totalWin += bagWin;
                        addFloatingWin(bagWin, idx);
                    }
                }
            }
        });

        if (newGrid.flat().includes(SYMBOLS.MONEY)) {
            setInvestorCount(prev => prev + 1);
        }

        setJuiceBoxActiveNext(buffs.juiceBox && fruitWinOccurred);
        setWinningCells(winningIndices);
        return totalWin;
    };

    const handleSpin = () => {
        if (balance < 1 || isSpinning) return;

        setBalance(prev => prev - 1);
        setIsSpinning(true);
        setLastWin(0);
        setWinningCells([]);
        setRevealingColumn(-1);

        const flatResults = [];
        for (let i = 0; i < 9; i++) {
            flatResults.push(getRandomSymbol(flatResults));
        }

        const nextGrid = [
            [flatResults[0], flatResults[1], flatResults[2]],
            [flatResults[3], flatResults[4], flatResults[5]],
            [flatResults[6], flatResults[7], flatResults[8]]
        ];

        // Reveal Column 0, then 1, then 2
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
                        const win = calculateResults(nextGrid);
                        setLastWin(win);
                        setBalance(prev => prev + win);
                        setIsSpinning(false);
                    }, 400);
                }
            }, i * 450); // Significant pause between columns for anticipation
        });
    };

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col items-center p-4 md:p-8 select-none">

            {/* Balance Bar */}
            <div className="w-full max-w-md flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-[2rem] shadow-sm border border-stone-200">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-400 p-2 rounded-xl text-white shadow-sm">
                        <Coins size={20} />
                    </div>
                    <span className="text-3xl font-black tabular-nums tracking-tighter">{balance}</span>
                </div>
                <AnimatePresence mode="wait">
                    {lastWin > 0 && !isSpinning && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-green-500 font-black text-sm uppercase tracking-widest"
                        >
                            Payout +{lastWin}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Grid Container */}
            <div className="relative w-full max-w-md aspect-square bg-stone-100 rounded-[3rem] p-4 mb-8 shadow-inner border border-stone-200">
                <div className="grid grid-cols-3 grid-rows-3 gap-3 h-full">
                    {grid.flat().map((symbol, idx) => {
                        const col = idx % 3;
                        const isRevealed = revealingColumn >= col || !isSpinning;
                        const isWinning = winningCells.includes(idx) && !isSpinning;

                        return (
                            <div key={idx} className="relative bg-white rounded-[1.5rem] flex items-center justify-center overflow-hidden shadow-sm border border-stone-50">
                                <AnimatePresence mode="wait">
                                    {isRevealed ? (
                                        <motion.div
                                            key={`${idx}-${symbol}`}
                                            initial={{ y: -100, opacity: 0, scale: 0.8 }}
                                            animate={{
                                                y: 0,
                                                opacity: 1,
                                                scale: isWinning ? [1, 1.15, 1] : 1,
                                                rotate: isWinning ? [0, -3, 3, 0] : 0
                                            }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 260,
                                                damping: 20,
                                                scale: { repeat: isWinning ? Infinity : 0, duration: 1, ease: "easeInOut" },
                                                rotate: { repeat: isWinning ? Infinity : 0, duration: 0.5 }
                                            }}
                                            className={`text-5xl sm:text-6xl z-10 ${isWinning ? 'drop-shadow-lg' : ''}`}
                                        >
                                            {symbol}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="spinning"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.05 }}
                                            className="text-stone-300"
                                        >
                                            <LayoutGrid size={48} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Win Glow */}
                                {isWinning && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 bg-amber-400/5 border-2 border-amber-400/20 rounded-[1.5rem] z-0"
                                    />
                                )}

                                {/* Juice Box Next Indicator */}
                                {juiceBoxActiveNext && SYMBOLS.FRUIT.includes(symbol) && !isSpinning && (
                                    <Zap size={14} className="absolute top-2 right-2 text-blue-500 fill-blue-500 animate-pulse z-20" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Floating Win Values */}
                <AnimatePresence>
                    {floatingWins.map((win) => (
                        <motion.div
                            key={win.id}
                            initial={{ opacity: 0, y: 0, scale: 0.5 }}
                            animate={{ opacity: 1, y: -100, scale: 1.4 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1, ease: "backOut" }}
                            className="absolute z-50 pointer-events-none font-black text-green-600 drop-shadow-sm text-3xl"
                            style={{
                                left: `${(win.cellIndex % 3) * 33 + 16}%`,
                                top: `${Math.floor(win.cellIndex / 3) * 33 + 16}%`
                            }}
                        >
                            +{win.val}
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
                        <ShoppingCart size={12} /> Buff Marketplace
                    </h2>
                    <span className="text-[10px] font-bold text-stone-300">Tokens: 15</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <BuffCard
                        icon="🧃"
                        title="Juice Box"
                        active={buffs.juiceBox}
                        desc="Fruit win → Next fruit 5x"
                        onClick={() => buyBuff('juiceBox')}
                        highlight={juiceBoxActiveNext}
                    />
                    <BuffCard
                        icon="💜"
                        title="Grape Love"
                        active={buffs.grapeLove}
                        desc="Grapes are 2x"
                        onClick={() => buyBuff('grapeLove')}
                    />
                    <BuffCard
                        icon="🎃"
                        title="Halloween"
                        active={buffs.halloween}
                        desc="Unlimited Candy"
                        onClick={() => buyBuff('halloween')}
                    />
                    <BuffCard
                        icon="🏦"
                        title="Investor"
                        active={buffs.investor}
                        desc="Bags: 0, 0, 5x"
                        onClick={() => buyBuff('investor')}
                        progress={buffs.investor ? investorCount % 3 : null}
                    />
                </div>
            </div>

            {/* Legend / Payout Section */}
            <div className="w-full max-w-md mt-12 bg-white rounded-[2.5rem] border border-stone-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
                    <HelpCircle size={18} className="text-stone-400" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Payout & Probability Legend</h2>
                </div>

                <div className="space-y-6">
                    {/* Symbols Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <LegendItem
                            symbol="🍇🍌🍒🍑"
                            label="Fruit Mix"
                            payout="10"
                            prob="Common (~85%)"
                            desc="Align 3 of a kind in any horizontal row to win."
                        />
                        <LegendItem
                            symbol="💎"
                            label="Diamond"
                            payout="50"
                            prob="Rare (~3%)"
                            desc="The ultimate jackpot. High value, low frequency."
                        />
                        <LegendItem
                            symbol="🍬"
                            label="Candy (Wild)"
                            payout="Match"
                            prob="Rare (~4%)"
                            desc="Acts as any symbol to complete a row. Limited to 1 per spin."
                        />
                        <LegendItem
                            symbol="💰"
                            label="Money Bag"
                            payout="10 per bag"
                            prob="Uncommon (~6%)"
                            desc="Doesn't need to align. Pays instantly for every appearance."
                        />
                    </div>

                    {/* Quick Rules */}
                    <div className="bg-stone-50 rounded-2xl p-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2">
                            <Info size={12} /> Standard Rules
                        </h3>
                        <ul className="text-[11px] text-stone-600 space-y-2 leading-relaxed">
                            <li>• Each spin costs <span className="font-bold text-stone-900">1 Token</span>.</li>
                            <li>• Wins are calculated <span className="font-bold text-stone-900">Left-to-Right</span> for row matches.</li>
                            <li>• Buffs are <span className="font-bold text-stone-900">permanent</span> for the duration of the session.</li>
                            <li>• Symbols are generated using a weighted pool for varying rarity.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 mb-12 text-[10px] font-bold text-stone-300 uppercase tracking-widest">
                Good luck, player
            </div>
        </div>
    );
};

const LegendItem = ({ symbol, label, payout, prob, desc }) => (
    <div className="flex items-start gap-4 group">
        <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform shadow-inner">
            {symbol.length > 2 ? <span className="text-lg">{symbol.substring(0, 2)}</span> : symbol}
        </div>
        <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-black uppercase tracking-tight text-stone-900">{label}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${prob.includes('Common') ? 'bg-stone-100 text-stone-500' : 'bg-amber-100 text-amber-600'}`}>
                    {prob}
                </span>
            </div>
            <div className="text-[10px] font-bold text-green-600 uppercase tracking-tighter mb-1">
                Payout: {payout}
            </div>
            <p className="text-[11px] text-stone-500 leading-snug">{desc}</p>
        </div>
    </div>
);

const BuffCard = ({ icon, title, active, desc, onClick, highlight, progress }) => (
    <button
        onClick={onClick}
        disabled={active}
        className={`
      flex items-center gap-3 p-4 rounded-3xl border transition-all text-left relative group
      ${active
                ? 'bg-white border-stone-200 shadow-sm'
                : 'bg-stone-100 border-transparent hover:bg-stone-200'}
    `}
    >
        <span className="text-3xl">{icon}</span>
        <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black uppercase tracking-tight text-stone-900 truncate">{title}</span>
            <span className="text-[9px] text-stone-500 leading-none mt-0.5">{desc}</span>

            {progress !== null && (
                <div className="flex gap-1 mt-1.5">
                    {[0, 1, 2].map(i => (
                        <div key={i} className={`h-1 w-2.5 rounded-full ${i < progress ? 'bg-amber-400' : 'bg-stone-200'}`} />
                    ))}
                </div>
            )}
        </div>

        {active && (
            <Star size={10} className={`absolute top-3 right-3 ${highlight ? 'text-blue-500 fill-blue-500 animate-pulse' : 'text-green-500 fill-green-500'}`} />
        )}
    </button>
);

export default App;