import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Lock, Unlock, Dumbbell, Info, Handshake, Zap, Sparkles, Star, ShoppingCart, ArrowLeft, Coins } from 'lucide-react';
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
            <div className={`relative w-full max-w-md aspect-square bg-stone-100 rounded-xl p-3 mb-4 shadow-hard border-2 transition-colors duration-500 overflow-hidden ${activeMiningTurns > 0 && !isBuffMenuOpen ? 'border-cyan-500 bg-cyan-50/50' : 'border-stone-900'}`}>
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
                                            borderColor: isSelected ? '#fbbf24' : (isOwned ? '#e7e5e4' : '#1c1917')
                                        }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleBuffClick(buff)}
                                        className={`
                                            aspect-[2/3.2] rounded-lg shadow-sm border-2 border-stone-900 flex flex-col relative overflow-hidden cursor-pointer transition-colors bg-white w-full
                                            ${isSelected ? 'ring-4 ring-amber-400 ring-offset-2 z-10' : ''}
                                            ${isOwned ? 'bg-stone-100 opacity-60' : 'hover:border-amber-400'}
                                        `}
                                    >
                                        {/* Dumbbell Icon Top-Left */}
                                        <div className="absolute top-1.5 left-1.5 z-10">
                                            <Dumbbell size={12} className="fill-black text-black" />
                                        </div>

                                        {/* Status Indicators Top-Right */}
                                        <div className="absolute top-1 right-1 flex flex-col gap-1 items-end">
                                            {/* Removed Green Dot */}
                                        </div>

                                        <div className="flex-1 flex flex-col items-center justify-start pt-2">
                                            <div className="text-3xl filter drop-shadow-sm mb-1">{buff.icon}</div>

                                            {/* Description */}
                                            <div className="px-1 w-full text-center flex flex-col h-full">
                                                <div className="text-xs leading-tight font-black uppercase text-stone-900 mb-1 break-words line-clamp-2">
                                                    {buff.title}
                                                </div>
                                                <div className="text-[0.6rem] leading-tight font-medium text-stone-500 line-clamp-3">
                                                    {buff.desc}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price / Buy Overlay */}
                                        {!isOwned ? (
                                            <div className="absolute bottom-1 w-full py-1 flex items-center justify-center gap-1">
                                                <span className="text-[0.65rem] font-black uppercase text-black">
                                                    50
                                                </span>
                                                <Coins size={10} className="text-amber-400" />
                                            </div>
                                        ) : (
                                            <div className="absolute bottom-1 w-full py-1 flex items-center justify-center gap-1">
                                                <span className="text-[0.65rem] font-black uppercase text-stone-400">
                                                    PURCHASED
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
                                            relative bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm border-2
                                            ${idx === 8 && gridBuffs?.lastPeach ? 'border-orange-500 border-4' : 'border-stone-900'}
                                            ${isTopLeft ? 'cursor-pointer hover:bg-stone-50 transition-colors' : ''}
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
                                                <motion.div key="spinning" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} className="text-stone-900">

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
                                                className="absolute inset-0 z-0"
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
                            <div className="text-stone-400 relative flex items-center justify-center">
                                <Dumbbell size={48} className="fill-current" />
                                <span className="absolute top-full mt-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-stone-500">no buff cards</span>
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
                                    className="w-16 h-24 bg-white rounded-lg shadow-xl border-2 border-stone-900 flex flex-col items-center justify-between p-1 cursor-help relative origin-bottom transition-shadow hover:shadow-2xl pointer-events-auto"
                                    style={{ zIndex: i }}
                                >
                                    <div className="absolute top-1 left-1"><Dumbbell size={8} className="fill-black text-black" /></div>
                                    <div className="flex-1 flex items-center justify-center">
                                        <span className="text-3xl filter drop-shadow-sm">{buff.icon}</span>
                                    </div>
                                    <div className="w-full border-t-2 border-stone-900 pt-1">
                                        <div className="text-[0.6rem] leading-none font-black uppercase text-stone-900 text-center w-full truncate">
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
                    disabled={isSpinning || balance < 1 || isBuffMenuOpen}
                    className={`
                        w-full py-4 rounded-lg text-xl font-black uppercase tracking-tight transition-all shadow-hard active:translate-y-1 active:shadow-none border-2 border-stone-900
                        ${isSpinning || balance < 1 || isBuffMenuOpen
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none border-stone-200'
                            : 'bg-stone-900 text-stone-50 hover:bg-black'}
                    `}
                >
                    {isBuffMenuOpen ? (
                        <span className="flex flex-col items-center leading-none gap-1">
                            <span className="flex items-center gap-2">
                                <Dumbbell size={20} className="fill-current text-current" />
                                BUFF CARDS
                            </span>
                            {/* Invisible spacer to match height */}
                            <span className="text-xs font-bold tracking-wide opacity-0">SPACER</span>
                        </span>
                    ) : (
                        <span className="flex flex-col items-center leading-none gap-1">
                            <span>{isSpinning ? 'SPINNING...' : 'Pull Lever'}</span>
                            <span className={`text-xs font-bold tracking-wide ${isSpinning ? 'opacity-0' : 'opacity-50'}`}>{spinCost} Coin{spinCost > 1 ? 's' : ''}</span>
                        </span>
                    )}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsBuffMenuOpen(!isBuffMenuOpen)}
                    disabled={isSpinning}
                    className={`
                        w-full py-3 rounded-lg text-xl font-black uppercase tracking-tight border-2 transition-all flex items-center justify-center gap-2 shadow-hard active:translate-y-1 active:shadow-none
                        ${isBuffMenuOpen
                            ? 'bg-red-500 text-white border-stone-900 hover:bg-red-600'
                            : 'bg-amber-400 text-stone-900 border-stone-900 hover:bg-amber-500'}
                    `}
                >
                    {isBuffMenuOpen ? <ArrowLeft size={24} className="text-white" /> : <Dumbbell size={20} className="fill-stone-900 text-stone-900" />}
                    {isBuffMenuOpen ? 'Back to Reel' : 'Buff Cards'}
                </motion.button>
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setView('extras')}
                        className="flex-1 py-3 rounded-lg bg-stone-900 text-stone-50 font-bold border-2 border-stone-900 hover:bg-black transition-all flex items-center justify-center gap-2 shadow-hard-sm active:translate-y-0.5 active:shadow-none"
                    >
                        <Star size={20} className="text-stone-50" />
                        EXTRAS
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setView('info')}
                        className="flex-1 py-3 rounded-lg bg-white text-stone-600 font-bold border-2 border-stone-900 hover:text-stone-900 hover:bg-stone-50 transition-all flex items-center justify-center gap-2 shadow-hard-sm active:translate-y-0.5 active:shadow-none"
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
