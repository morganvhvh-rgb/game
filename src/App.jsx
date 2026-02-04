import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Unlock } from 'lucide-react';
import { BUFF_DEFINITIONS } from './data/gameConfig';
import GameView from './components/GameView';
import ExtrasView from './components/ExtrasView';
import InfoView from './components/InfoView';
import Header from './components/Header';
import { useGameLogic } from './hooks/useGameLogic';

const App = () => {
    const {
        balance,
        displayBalance,
        spinCost,
        showSpinflation,
        setShowSpinflation,
        view,
        setView,
        gameOver,
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

        handleDeal,
        handleLottery,
        purchaseCard,
        purchaseGridBuff,
        toggleLock,
        handleSpin,
        activeBuffList,
    } = useGameLogic();

    const [isBuffMenuOpen, setIsBuffMenuOpen] = React.useState(false);

    // Enter shop function now toggles the overlay and resets phase
    const enterShop = () => {
        if (view === 'extras') {
            setView('game');
        }
        setShopPhase('menu'); // Always reset to menu when toggling
        setIsBuffMenuOpen(!isBuffMenuOpen);
    };

    // Format unlock names for display
    const formatUnlockName = (id) => {
        if (id === 'lastPeach') return 'Last Peach';
        if (id === 'slant') return 'Slant';
        return id;
    };

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col items-center p-4 md:p-8 select-none">
            {/* Header / Stats */}
            <Header
                displayBalance={displayBalance}
                buffs={buffs}
                miningTurns={miningTurns}
                lockedSymbol={lockedSymbol}
                lockSpinsRemaining={lockSpinsRemaining}
                lastWin={lastWin}
                isSpinning={isSpinning}
            />

            <AnimatePresence mode="wait">
                {view === 'game' ? (
                    <GameView
                        grid={grid}
                        winningCells={winningCells}
                        activeMiningTurns={activeMiningTurns}
                        activeBuffsInPlay={activeBuffsInPlay}
                        activeInvestorCount={activeInvestorCount}
                        juiceBoxInPlay={juiceBoxInPlay}
                        revealingColumn={revealingColumn}
                        isSpinning={isSpinning}
                        lockedSymbol={lockedSymbol}
                        toggleLock={toggleLock}
                        floatingWins={floatingWins}
                        activeBuffList={activeBuffList}
                        handleSpin={handleSpin}
                        balance={balance}
                        spinCost={spinCost}
                        enterShop={enterShop}
                        setView={setView}
                        gridBuffs={gridBuffs}
                        buffs={buffs}
                        // Shop / Overlay Props
                        isBuffMenuOpen={isBuffMenuOpen}
                        setIsBuffMenuOpen={setIsBuffMenuOpen}
                        shopPhase={shopPhase}
                        setShopPhase={setShopPhase}
                        handleDeal={handleDeal}
                        dealtCards={dealtCards}
                        purchaseCard={purchaseCard}
                    />
                ) : view === 'extras' ? (
                    <ExtrasView
                        setView={setView}
                        handleLottery={handleLottery}
                        lotteryFail={lotteryFail}
                        balance={balance}
                        gridBuffs={gridBuffs}
                        purchaseGridBuff={purchaseGridBuff}
                        unlockedItems={unlockedItems}
                    />
                ) : (
                    <InfoView setView={setView} />
                )}
            </AnimatePresence>

            {/* Spinflation Modal */}
            <AnimatePresence>
                {showSpinflation && (
                    <div className="fixed top-0 left-0 w-full h-full z-[100] flex items-center justify-center p-4 bg-black/60">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
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

            {/* Game Over Modal */}
            <AnimatePresence>
                {gameOver && (
                    <div className="fixed top-0 left-0 w-full h-full z-[110] flex items-center justify-center p-4 bg-black/80">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-stone-900 rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl border-2 border-stone-800 relative overflow-hidden"
                        >
                            <div className="mb-6 relative">
                                <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-1">Game Over</h2>
                            </div>

                            <div className="mb-6">
                                <div className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Highest Spinflation</div>
                                <div className="text-3xl font-black text-red-500">{spinCost}</div>
                            </div>

                            {newUnlocks.length > 0 && (
                                <div className="mb-8">
                                    <div className="text-amber-400 font-bold uppercase tracking-wider text-xs mb-3 flex items-center justify-center gap-2">
                                        <Unlock size={14} /> New Unlocks!
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {newUnlocks.map(u => (
                                            <div key={u} className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg text-amber-200 font-black uppercase text-sm animate-pulse">
                                                {formatUnlockName(u)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={resetGame}
                                className="w-full py-4 bg-white hover:bg-stone-200 text-stone-900 font-black rounded-xl uppercase tracking-widest transition-colors shadow-lg ring-offset-2 focus:ring-2 ring-white ring-offset-stone-900"
                            >
                                Play Again
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default App;