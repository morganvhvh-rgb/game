import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Star, Coins, Axis3d, Square, Lock } from 'lucide-react';
import PlayingCard from './PlayingCard';

const ExtrasView = ({
    onBack,
    handleLottery,
    lotteryFail,
    balance,
    gridBuffs,
    purchaseGridBuff,
    unlockedItems = [],
    // Shop Props
    shopPhase,
    dealtCards = [],
    purchaseCard,
    buffs = {}
}) => {
    return (
        <motion.div
            key="extras"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full flex flex-col items-center max-w-md"
        >
            {/* Header */}
            <div className="w-full mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors mb-4"
                >
                    <ArrowLeft size={18} />
                    Back to Game
                </button>
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                        <Star size={24} className="text-amber-500" />
                        Extras & Lottery
                    </h2>
                </div>
            </div>

            <div className="w-full flex flex-col items-center gap-4">

                {/* Lottery Option */}
                <button
                    onClick={handleLottery}
                    disabled={balance < 50}
                    className={`
                        w-full bg-slate-800 p-4 rounded-lg shadow-hard border-2 border-slate-700
                        flex items-center justify-between text-white transition-all
                        ${balance < 50 ? 'opacity-50 cursor-not-allowed shadow-none' : 'hover:bg-slate-700 active:translate-y-1 active:shadow-none'}
                    `}
                >
                    <div className="flex items-center gap-4">
                        <Star size={32} className="text-yellow-400 animate-pulse" />
                        <div className="text-left">
                            <h3 className="font-black text-lg uppercase tracking-tight text-white flex items-center gap-2">
                                {lotteryFail ? 'Try Again' : 'Lottery Chance'}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium">20% Chance to buy an S-Tier Buff</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ticket Price</span>
                        <div className="flex items-center gap-1 font-black text-xl text-white">
                            50 <Coins size={16} className="text-amber-400 fill-amber-400" />
                        </div>
                    </div>
                </button>

                {/* Lottery Fail Message */}
                <AnimatePresence>
                    {lotteryFail && (
                        <motion.div
                            key="lottery-fail-message"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="w-full bg-red-900/50 border-2 border-red-500 text-red-200 rounded-lg p-3 text-center text-sm font-bold shadow-hard-sm"
                        >
                            Bad luck! The lottery ticket was a dud.
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Won Cards Display */}
                <AnimatePresence>
                    {dealtCards.length > 0 && (
                        <div className="w-full flex justify-center gap-4 py-2">
                            {dealtCards.map((card, i) => (
                                <div key={card.id} className="w-48">
                                    <PlayingCard
                                        card={card}
                                        index={i}
                                        owned={buffs[card.id]}
                                        balance={balance}
                                        onPurchase={() => purchaseCard(card)}
                                        isGolden={true}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {/* Grid Buff Placeholders */}
                <div className="w-full flex flex-row items-stretch justify-center gap-2">
                    {/* Last Peach Buff */}
                    {unlockedItems.includes('lastPeach') ? (
                        <button
                            onClick={() => purchaseGridBuff('lastPeach')}
                            disabled={gridBuffs.lastPeach || balance < 50}
                            className={`
                                flex-1 px-2 py-3 rounded-lg border-2 flex flex-col items-center justify-start text-center transition-all relative overflow-hidden group
                                ${gridBuffs.lastPeach
                                    ? 'bg-slate-800 border-slate-700 opacity-60'
                                    : `bg-orange-600 border-slate-900 ${balance < 50 ? 'opacity-50 cursor-not-allowed' : 'shadow-hard hover:bg-orange-500 active:translate-y-1 active:shadow-none cursor-pointer'}`
                                }
                            `}
                        >
                            <div className={`mb-2 ${gridBuffs.lastPeach ? 'text-slate-500' : 'text-white'}`}>
                                <Square size={28} />
                            </div>
                            <span className={`font-black text-xs uppercase mb-1 leading-tight ${gridBuffs.lastPeach ? 'text-slate-500' : 'text-white'}`}>Last Peach</span>
                            <div className={`text-[10px] font-bold leading-tight mb-2 h-8 flex items-center justify-center ${gridBuffs.lastPeach ? 'text-slate-600' : 'text-white/90'}`}>
                                Peach in last square = 2x win.
                            </div>
                            {gridBuffs.lastPeach ? (
                                <div className="mt-auto text-[10px] font-black bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">OWNED</div>
                            ) : (
                                <div className={`mt-auto flex items-center gap-1 font-black text-xs px-3 py-1 rounded-full ${balance >= 50 ? 'bg-white text-orange-600' : 'bg-black/20 text-white'}`}>
                                    50 <Coins size={10} className={balance >= 50 ? "text-orange-500 fill-orange-500 ml-0.5" : "text-white fill-white ml-0.5"} />
                                </div>
                            )}
                        </button>
                    ) : (
                        <div className="flex-1 px-2 py-3 rounded-2xl border-2 border-slate-700 bg-slate-800 flex flex-col items-center justify-center text-center opacity-50 relative overflow-hidden">
                            <div className="text-slate-600 mb-2">
                                <Lock size={28} />
                            </div>
                            <span className="font-black text-xs uppercase text-slate-500 mb-1">Locked</span>
                            <div className="text-[10px] items-center justify-center text-slate-500 font-bold leading-tight">
                                Reach Spinflation 64
                            </div>
                        </div>
                    )}

                    {/* Slant Buff */}
                    {unlockedItems.includes('slant') ? (
                        <button
                            onClick={() => purchaseGridBuff('slant')}
                            disabled={gridBuffs.slant || balance < 50}
                            className={`
                                flex-1 px-2 py-3 rounded-lg border-2 flex flex-col items-center justify-start text-center transition-all relative overflow-hidden group
                                ${gridBuffs.slant
                                    ? 'bg-slate-800 border-slate-700 opacity-60'
                                    : `bg-red-600 border-slate-900 ${balance < 50 ? 'opacity-50 cursor-not-allowed' : 'shadow-hard hover:bg-red-500 active:translate-y-1 active:shadow-none cursor-pointer'}`
                                }
                            `}
                        >
                            <div className={`mb-2 ${gridBuffs.slant ? 'text-slate-500' : 'text-white'}`}>
                                <Axis3d size={28} />
                            </div>
                            <span className={`font-black text-xs uppercase mb-1 leading-tight ${gridBuffs.slant ? 'text-slate-500' : 'text-white'}`}>Slant</span>
                            <div className={`text-[10px] font-bold leading-tight mb-2 h-8 flex items-center justify-center ${gridBuffs.slant ? 'text-slate-600' : 'text-white/90'}`}>
                                Symbols match diagonally.
                            </div>
                            {gridBuffs.slant ? (
                                <div className="mt-auto text-[10px] font-black bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">OWNED</div>
                            ) : (
                                <div className={`mt-auto flex items-center gap-1 font-black text-xs px-3 py-1 rounded-full ${balance >= 50 ? 'bg-white text-red-600' : 'bg-black/20 text-white'}`}>
                                    50 <Coins size={10} className={balance >= 50 ? "text-red-500 fill-red-500 ml-0.5" : "text-white fill-white ml-0.5"} />
                                </div>
                            )}
                        </button>
                    ) : (
                        <div className="flex-1 px-2 py-3 rounded-lg border-2 border-slate-700 bg-slate-800 flex flex-col items-center justify-center text-center opacity-50 relative overflow-hidden">
                            <div className="text-slate-600 mb-2">
                                <Lock size={28} />
                            </div>
                            <span className="font-black text-xs uppercase text-slate-500 mb-1">Locked</span>
                            <div className="text-[10px] items-center justify-center text-slate-500 font-bold leading-tight">
                                Reach Spinflation 128
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ExtrasView;
