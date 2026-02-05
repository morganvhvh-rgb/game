import { useState, useEffect } from 'react';
import { useMotionValue, useTransform, animate } from 'framer-motion';
import { SYMBOLS, LOCK_DURATION, BUFF_DEFINITIONS, S_TIER_BUFFS } from '../data/gameConfig';

export const useGameLogic = () => {
    const [balance, setBalance] = useState(150);
    const [spinCost, setSpinCost] = useState(1);
    const [totalSpins, setTotalSpins] = useState(0);
    const [nextSpinflationThreshold, setNextSpinflationThreshold] = useState(20);
    const [showSpinflation, setShowSpinflation] = useState(false);
    const [view, setView] = useState('game'); // 'game' | 'shop' | 'info'
    const [gameOver, setGameOver] = useState(false);
    const [unlockedItems, setUnlockedItems] = useState(() => {
        const saved = localStorage.getItem('unlockedItems');
        return saved ? JSON.parse(saved) : [];
    });
    const [newUnlocks, setNewUnlocks] = useState([]);

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
    }, [balance, balanceMotion]);

    // Check for Game Over
    useEffect(() => {
        if (!isSpinning && balance < spinCost && !gameOver) {
            // Check if we achieved any unlocks
            const earnedUnlocks = [];
            if (spinCost >= 64 && !unlockedItems.includes('lastPeach')) {
                earnedUnlocks.push('lastPeach');
            }
            if (spinCost >= 128 && !unlockedItems.includes('slant')) {
                earnedUnlocks.push('slant');
            }

            if (earnedUnlocks.length > 0) {
                const updatedunlocked = [...unlockedItems, ...earnedUnlocks];
                setUnlockedItems(updatedunlocked);
                localStorage.setItem('unlockedItems', JSON.stringify(updatedunlocked));
                setNewUnlocks(earnedUnlocks);
            } else {
                setNewUnlocks([]);
            }
            setGameOver(true);
        }
    }, [balance, spinCost, isSpinning, gameOver, unlockedItems]);

    // Save unlocks effect (redundant but safe)
    useEffect(() => {
        localStorage.setItem('unlockedItems', JSON.stringify(unlockedItems));
    }, [unlockedItems]);

    const [lockedSymbol, setLockedSymbol] = useState(null);
    const [lockSpinsRemaining, setLockSpinsRemaining] = useState(0);
    const [miningTurns, setMiningTurns] = useState(0);
    const [hasUsedLock, setHasUsedLock] = useState(false);

    // Buff State
    const [buffs, setBuffs] = useState({
        juiceBox: false,
        grapeLove: false,
        halloween: false,
        investor: false,
        mining: false,
        orangutan: false,
        angel: false,
        devil: false
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

    // Grid Buff Logic
    const [gridBuffs, setGridBuffs] = useState({
        slant: false,
        lastPeach: false
    });

    const resetGame = () => {
        setBalance(150);
        setSpinCost(1);
        setTotalSpins(0);
        setNextSpinflationThreshold(20);
        setShowSpinflation(false);
        setGameOver(false);
        setGrid([
            ['🍒', '🍇', '🍌'],
            ['💎', '🍬', '💰'],
            ['🍑', '🍒', '🍇']
        ]);
        setLockedSymbol(null);
        setLockSpinsRemaining(0);
        setMiningTurns(0);
        setHasUsedLock(false);
        setBuffs({
            juiceBox: false,
            grapeLove: false,
            halloween: false,
            investor: false,
            mining: false,
            orangutan: false,
            angel: false,
            devil: false
        });
        setActiveBuffsInPlay({
            juiceBox: false,
            grapeLove: false,
            halloween: false,
            investor: false,
            mining: false,
            orangutan: false,
            angel: false,
            devil: false
        });
        setJuiceBoxActiveNext(false);
        setJuiceBoxInPlay(false);
        setInvestorCount(0);
        setActiveInvestorCount(0);
        setActiveMiningTurns(0);
        setGridBuffs({
            slant: false,
            lastPeach: false
        });
        setNewUnlocks([]);
        setLotteryFail(false);
        setView('game');
    };

    const returnToGame = () => {
        setLotteryFail(false);
        setView('game');
    };

    const enterShop = () => {
        setShopPhase('menu');
        setLotteryFail(false);
        setWinningCells([]); // Clear win animations
        setView('shop');
    };



    const handleLottery = () => {
        const cost = 50;
        if (balance < cost) return;

        setBalance(prev => prev - cost);

        const isWin = Math.random() < 0.2;

        if (isWin) {
            const randomSTier = S_TIER_BUFFS[Math.floor(Math.random() * S_TIER_BUFFS.length)];
            setDealtCards([{ ...randomSTier, price: 100 }]);
            setLotteryFail(false);
        } else {
            setDealtCards([]);
            setLotteryFail(true);
        }
        setShopPhase('reveal');
    };

    const purchaseCard = (card) => {
        if (balance >= card.price) {
            // Check if already owned (skip if so, but allow swapping S-tiers)
            if (buffs[card.id]) return;

            setBalance(prev => prev - card.price);

            setBuffs(prev => {
                const newBuffs = { ...prev, [card.id]: true };
                // Enforce Exclusivity
                if (card.id === 'angel') newBuffs.devil = false;
                if (card.id === 'devil') newBuffs.angel = false;
                return newBuffs;
            });

            if (card.id === 'investor') {
                setInvestorCount(0);
            }
        }
    };

    const purchaseGridBuff = (type) => {
        let cost = 0;
        if (type === 'slant') cost = 50;
        if (type === 'lastPeach') cost = 50;

        if (balance >= cost && !gridBuffs[type] && unlockedItems.includes(type)) {
            setBalance(prev => prev - cost);
            setGridBuffs(prev => ({ ...prev, [type]: true }));
        }
    };

    const toggleLock = () => {
        if (isSpinning) return;

        if (lockedSymbol) {
            setLockedSymbol(null);
            setLockSpinsRemaining(0);
        } else {
            // Free, Single Use
            if (!hasUsedLock) {
                const currentTopLeft = grid[0][0];
                setLockedSymbol(currentTopLeft);
                setLockSpinsRemaining(LOCK_DURATION);
                setHasUsedLock(true);
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

            let bombCount = 10;
            if (buffs.devil) bombCount *= 2;
            if (buffs.angel) bombCount = 0;

            for (let i = 0; i < bombCount; i++) pool.push(SYMBOLS.BOMB);
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
                        if (currentBuffs.devil && nonCandy === '🍇') multiplier *= 2;
                        if (currentBuffs.angel && nonCandy === '🍒') multiplier *= 5;
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

        // 1.5 Diagonal Checks (Slant Buff)
        if (gridBuffs.slant) {
            const diagonals = [
                [0, 4, 8], // Top-Left to Bottom-Right
                [2, 4, 6]  // Top-Right to Bottom-Left
            ];

            diagonals.forEach(indices => {
                const diagSymbols = indices.map(i => newGrid[Math.floor(i / 3)][i % 3]);
                const nonCandy = diagSymbols.find(s => s !== SYMBOLS.CANDY);

                if (!nonCandy) {
                    totalWin += 100;
                    winningIndices.push(...indices);
                    addFloatingWin(100, indices[1]);
                } else {
                    const isMatch = diagSymbols.every(s => {
                        if (s === nonCandy) return true;
                        if (s === SYMBOLS.CANDY) {
                            return true;
                        }
                        return false;
                    });

                    if (isMatch) {
                        let diagWin = 0;
                        if (SYMBOLS.FRUIT.includes(nonCandy)) {
                            let multiplier = 1;
                            if (currentJuiceInPlay) multiplier *= 4;
                            if (currentBuffs.grapeLove && nonCandy === '🍇') multiplier *= 2;
                            // Other fruit multipliers apply too
                            if (currentBuffs.devil && nonCandy === '🍇') multiplier *= 2;
                            if (currentBuffs.angel && nonCandy === '🍒') multiplier *= 5;
                            if (currentBuffs.orangutan && nonCandy === '🍌') multiplier *= 2;

                            diagWin = 10 * multiplier;
                            fruitWinOccurred = true;
                        } else if (nonCandy === SYMBOLS.DIAMOND) {
                            diagWin = 100;
                        } else if (nonCandy === SYMBOLS.BOMB) {
                            diagWin = -50;
                            bombMatchOccurred = true;
                        }

                        if (diagWin !== 0) {
                            totalWin += diagWin;
                            winningIndices.push(...indices);
                            addFloatingWin(diagWin, indices[1]);
                        }
                    }
                }
            });
        }

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

        // Last Peach Buff
        if (gridBuffs.lastPeach && newGrid[2][2] === '🍑') {
            totalWin *= 2;
            addFloatingWin("x2", 8); // 8 is index of bottom right
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
                    }, 275);
                }
            }, i * 165);
        });
    };

    const activeBuffList = [...BUFF_DEFINITIONS, ...S_TIER_BUFFS].filter(b => buffs[b.id]);

    return {
        balance,
        // Since we are moving balanceMotion inside, we export displayBalance
        displayBalance,
        spinCost,
        totalSpins,
        nextSpinflationThreshold,
        showSpinflation,
        setShowSpinflation, // Needed for closing the modal
        view,
        setView,
        gameOver,
        setGameOver, // Needed? Probably only resetGame needed, but let's keep it just in case
        unlockedItems,
        newUnlocks,
        grid,
        isSpinning,
        lastWin,
        revealingColumn,
        winningCells,
        floatingWins,
        lockedSymbol,
        lockSpinsRemaining,
        miningTurns,
        hasUsedLock,
        buffs,
        activeBuffsInPlay,
        juiceBoxInPlay,
        activeInvestorCount,
        activeMiningTurns,
        shopPhase,
        setShopPhase,
        dealtCards,
        lotteryFail,
        gridBuffs,
        resetGame,
        enterShop,
        handleLottery,
        purchaseCard,
        purchaseGridBuff,
        toggleLock,
        handleSpin,
        activeBuffList,
        returnToGame
        // Exposing setBalance if needed for debug etc, but logic should handle it
    };
};
