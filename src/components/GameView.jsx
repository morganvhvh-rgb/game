import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Lock, Unlock, Dumbbell, Info, Handshake, Zap, Sparkles, Star, ShoppingCart } from 'lucide-react';
import { SYMBOLS, BUFF_DEFINITIONS } from '../data/gameConfig';
import PlayingCard from './PlayingCard';


const GameView = ({
    grid,
    winningCells,
    activeMiningTurns,
    activeBuffsInPlay,
    activeInvestorCount,
    juiceBoxInPlay,
    revealingColumn,
    isSpinning,
    lockedSymbol,
    toggleLock,
    floatingWins,
    activeBuffList,
    handleSpin,
    balance,
    spinCost,
    enterShop,
    setView,
    gridBuffs,
    buffs,
    // Shop / Overlay Props
    isBuffMenuOpen,
    setIsBuffMenuOpen,
    shopPhase,
    setShopPhase,

    dealtCards,
    purchaseCard
}) => {
    const [selectedBuff, setSelectedBuff] = React.useState(null);

    // Reset selected buff when menu closes to prevent "stuck" state
    React.useEffect(() => {
        if (!isBuffMenuOpen) {
            setSelectedBuff(null);
        }
    }, [isBuffMenuOpen]);

    const handleBuffClick = (buff) => {
        if (buffs[buff.id]) return; // Already owned

        if (selectedBuff?.id === buff.id) {
            // Second tap - Buy
            if (balance >= 50) {
                purchaseCard({ ...buff, price: 50 });
                setSelectedBuff(null);
            }
        } else {
            // First tap - Select
            setSelectedBuff({ ...buff, price: 50 });
        }
    };

    return (
        <motion.div
            key="game"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full flex flex-col items-center"
        >
            {/* Grid Area - Toggles between Grid and Buff Shop */}
            {/* Grid Area - Toggles between Grid and Buff Shop */}
            <div className={`relative w-full max-w-md aspect-square bg-stone-100 rounded-[3rem] p-4 mb-4 shadow-inner border transition-colors duration-500 overflow-hidden ${activeMiningTurns > 0 && !isBuffMenuOpen ? 'border-cyan-300 bg-cyan-50/30' : 'border-stone-200'}`}>
                {isBuffMenuOpen ? (
                    <motion.div
                        key="buff-shop-overlay"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full h-full flex flex-col items-center justify-center"
                    >
                        <div className="grid grid-cols-3 gap-2 w-full max-w-[320px] h-full content-center p-2">
                            {BUFF_DEFINITIONS.map((buff, i) => {
                                const isSelected = selectedBuff?.id === buff.id;
                                const isOwned = buffs[buff.id];

                                return (
                                    <motion.div
                                        key={buff.id}
                                        layout
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{
                                            scale: isSelected ? 1.05 : 1,
                                            opacity: 1,
                                            borderColor: isSelected ? '#fbbf24' : (isOwned ? '#e7e5e4' : '#e7e5e4')
                                        }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleBuffClick(buff)}
                                        className={`
                                            aspect-[2/3.2] rounded-xl shadow-sm border-2 flex flex-col relative overflow-hidden cursor-pointer transition-colors bg-white w-full
                                            ${isSelected ? 'ring-2 ring-amber-400 ring-offset-2 z-10' : ''}
                                            ${isOwned ? 'bg-stone-100 opacity-60' : 'hover:border-amber-200'}
                                        `}
                                    >
                                        {/* Dumbbell Icon Top-Left */}
                                        <div className="absolute top-1.5 left-1.5 z-10">
                                            <Dumbbell size={12} className="fill-black text-black" />
                                        </div>

                                        {/* Status Indicators Top-Right */}
                                        <div className="absolute top-1 right-1 flex flex-col gap-1 items-end">
                                            {isOwned && <div className="w-2 h-2 rounded-full bg-green-400" />}
                                        </div>

                                        <div className="flex-1 flex flex-col items-center justify-start pt-5">
                                            <div className="text-3xl filter drop-shadow-sm mb-1">{buff.icon}</div>

                                            {/* Description */}
                                            <div className="px-1 w-full text-center flex flex-col h-full">
                                                <div className="text-[0.65rem] leading-tight font-black uppercase text-stone-800 mb-1 break-words line-clamp-2">
                                                    {buff.title}
                                                </div>
                                                <div className="text-[0.55rem] leading-tight font-medium text-stone-500 line-clamp-3">
                                                    {buff.desc}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Buy Overlay for Selected */}
                                        {isSelected && !isOwned && (
                                            <div className="absolute bottom-0 w-full bg-amber-400 py-1 flex items-center justify-center">
                                                <span className="text-[0.65rem] font-black uppercase text-stone-900">
                                                    50 Coins
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <div
                        key="grid-content"
                        className="w-full h-full"
                    >
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
                                            relative bg-white rounded-[1.5rem] flex items-center justify-center overflow-hidden shadow-sm border
                                            ${idx === 8 && gridBuffs?.lastPeach ? 'border-orange-400 border-2' : 'border-stone-50'}
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
                                                        {activeBuffsInPlay.devil && symbol === '🍇' && <span className="absolute -top-3 -right-3 text-2xl">😈</span>}
                                                        {activeBuffsInPlay.angel && symbol === '🍒' && <span className="absolute -top-3 -right-3 text-2xl">👼</span>}
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
                                                    <Lock size={22} className="text-amber-500" />
                                                ) : (
                                                    <Unlock size={18} className="text-stone-200" />
                                                )}
                                            </div>
                                        )}

                                        {isWinning && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: [0, 0.8, 0.8, 0] }}
                                                transition={{
                                                    duration: 1.2,
                                                    times: [0, 0.1, 0.8, 1],
                                                    ease: "easeInOut"
                                                }}
                                                style={{ backgroundColor: '#ff69b4' }}
                                                className="absolute inset-0 rounded-[1.5rem] z-0"
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
                                    className="absolute z-50 pointer-events-none font-black text-2xl text-black"
                                    style={{
                                        left: `${(win.cellIndex % 3) * 33 + 16}%`,
                                        top: `${Math.floor(win.cellIndex / 3) * 33 + 16}%`,
                                        textShadow: '3px 3px 0 #fff'
                                    }}
                                >
                                    {win.val > 0 ? `+${win.val}` : win.val}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Buff Deck Display */}
            <div className="w-full relative h-28 -mt-8 z-20 mb-2 flex items-center justify-center pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {activeBuffList.length === 0 ? (
                        <motion.div
                            key="buff-empty"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <div className="text-stone-300 relative flex items-center justify-center">
                                <Dumbbell size={48} className="fill-current" />
                                <span className="absolute top-full mt-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">no buff cards</span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="buff-list"
                            className="relative flex items-center justify-center -space-x-6"
                        >
                            {activeBuffList.map((buff, i) => (
                                <motion.div
                                    key={buff.id}
                                    layout
                                    initial={{ scale: 0, y: 50, rotate: 0 }}
                                    animate={{
                                        scale: 1,
                                        y: 0,
                                        rotate: (i - (activeBuffList.length - 1) / 2) * 10
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    whileHover={{ scale: 1.15, y: -20, rotate: 0, zIndex: 50 }}
                                    className="w-16 h-24 bg-white rounded-xl shadow-xl border border-stone-100 flex flex-col items-center justify-between p-1 cursor-help relative origin-bottom transition-shadow hover:shadow-2xl pointer-events-auto"
                                    style={{ zIndex: i }}
                                >
                                    <div className="absolute top-1 left-1"><Dumbbell size={8} className="fill-black text-black" /></div>
                                    <div className="flex-1 flex items-center justify-center">
                                        <span className="text-3xl filter drop-shadow-sm">{buff.icon}</span>
                                    </div>
                                    <div className="w-full border-t border-stone-100 pt-1">
                                        <div className="text-[0.6rem] leading-none font-black uppercase text-stone-500 text-center w-full truncate">
                                            {buff.title}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
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
                    onClick={() => setIsBuffMenuOpen(!isBuffMenuOpen)}
                    disabled={isSpinning}
                    className={`
                        w-full py-4 rounded-[1.5rem] text-2xl font-black uppercase tracking-tight border-2 transition-colors flex items-center justify-center gap-2
                        ${isBuffMenuOpen ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-900 border-stone-100 hover:border-amber-200'}
                    `}
                >
                    <Dumbbell size={20} className={isBuffMenuOpen ? "fill-white text-white" : "fill-black text-black"} />
                    {isBuffMenuOpen ? 'Back to Reel' : 'Buff Cards'}
                </motion.button>
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setView('extras')}
                        className="flex-1 py-4 rounded-[1.5rem] bg-white text-stone-900 font-bold border-2 border-stone-100 hover:text-stone-900 transition-colors flex items-center justify-center gap-2"
                    >
                        <Star size={20} className="text-amber-500" />
                        EXTRAS
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setView('info')}
                        className="flex-1 py-4 rounded-[1.5rem] bg-white text-stone-500 font-bold border-2 border-stone-100 hover:text-stone-900 transition-colors flex items-center justify-center gap-2"
                    >
                        <Info size={20} />
                        INFO
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default React.memo(GameView);
