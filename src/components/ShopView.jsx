import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Handshake, Zap, Sparkles, Star, Coins, Axis3d, Square, Lock } from 'lucide-react';
import DealOption from './DealOption';
import PlayingCard from './PlayingCard';

const ShopView = ({
    setView,
    shopPhase,
    setShopPhase,
    buffs,
    BUFF_DEFINITIONS,
    handleDeal,
    handleLottery,
    dealtCards,
    lotteryFail,
    purchaseCard,
    balance,
    gridBuffs,
    purchaseGridBuff,
    unlockedItems = [] // Default to empty array if not passed
}) => {
    return (
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
                        {BUFF_DEFINITIONS.filter(b => buffs[b.id]).length}/{BUFF_DEFINITIONS.length} Owned
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
                                icon={<Zap className="text-red-500" />}
                            />
                            <DealOption
                                title="Great Deal"
                                desc="1 Buff choice. Amazing price."
                                cost={30}
                                count={1}
                                onClick={() => handleDeal('great')}
                                disabled={balance < 30}
                                icon={<Sparkles className="text-green-500" />}
                            />
                        </div>

                        {/* Lottery Option */}
                        <button
                            onClick={handleLottery}
                            disabled={balance < 50}
                            className={`
                                w-full bg-stone-900 p-4 rounded-[1.5rem] shadow-xl border-2 border-stone-800
                                flex items-center justify-between text-white transition-all
                                ${balance < 50 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-2xl hover:bg-black'}
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <Star size={32} className="text-yellow-400 animate-pulse" />
                                <div className="text-left">
                                    <h3 className="font-black text-lg uppercase tracking-tight text-white flex items-center gap-2">
                                        Lottery Chance
                                    </h3>
                                    <p className="text-xs text-stone-400 font-medium">20% Chance to buy an S-Tier Buff</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Ticket Price</span>
                                <div className="flex items-center gap-1 font-black text-xl text-white">
                                    50 <Coins size={16} className="text-amber-400 fill-amber-400" />
                                </div>
                            </div>
                        </button>

                        {/* Grid Buff Placeholders */}
                        <div className="w-full flex flex-row items-stretch justify-center gap-2">
                            {/* Last Peach Buff */}
                            {unlockedItems.includes('lastPeach') ? (
                                <button
                                    onClick={() => purchaseGridBuff('lastPeach')}
                                    disabled={gridBuffs.lastPeach || balance < 50}
                                    className={`
                                        flex-1 px-2 py-3 rounded-2xl border-b-4 flex flex-col items-center justify-start text-center transition-all relative overflow-hidden group
                                        ${gridBuffs.lastPeach
                                            ? 'bg-stone-100 border-stone-200 opacity-60'
                                            : `bg-orange-400 border-orange-600 ${balance < 50 ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:brightness-110 cursor-pointer'}`
                                        }
                                    `}
                                >
                                    <div className={`mb-2 ${gridBuffs.lastPeach ? 'text-stone-400' : 'text-white'}`}>
                                        <Square size={28} />
                                    </div>
                                    <span className={`font-black text-xs uppercase mb-1 leading-tight ${gridBuffs.lastPeach ? 'text-stone-500' : 'text-white'}`}>Last Peach</span>
                                    <div className={`text-[10px] font-bold leading-tight mb-2 h-8 flex items-center justify-center ${gridBuffs.lastPeach ? 'text-stone-400' : 'text-white/90'}`}>
                                        Peach in last square = 2x win.
                                    </div>
                                    {gridBuffs.lastPeach ? (
                                        <div className="mt-auto text-[10px] font-black bg-stone-200 text-stone-500 px-2 py-0.5 rounded-full">OWNED</div>
                                    ) : (
                                        <div className={`mt-auto flex items-center gap-1 font-black text-xs px-3 py-1 rounded-full ${balance >= 50 ? 'bg-white text-orange-600' : 'bg-black/20 text-white'}`}>
                                            50 <Coins size={10} className={balance >= 50 ? "text-orange-500 fill-orange-500 ml-0.5" : "text-white fill-white ml-0.5"} />
                                        </div>
                                    )}
                                </button>
                            ) : (
                                <div className="flex-1 px-2 py-3 rounded-2xl border-2 border-stone-200 bg-stone-100 flex flex-col items-center justify-center text-center opacity-50 relative overflow-hidden">
                                    <div className="text-stone-300 mb-2">
                                        <Lock size={28} />
                                    </div>
                                    <span className="font-black text-xs uppercase text-stone-400 mb-1">Locked</span>
                                    <div className="text-[10px] items-center justify-center text-stone-400 font-bold leading-tight">
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
                                        flex-1 px-2 py-3 rounded-2xl border-b-4 flex flex-col items-center justify-start text-center transition-all relative overflow-hidden group
                                        ${gridBuffs.slant
                                            ? 'bg-stone-100 border-stone-200 opacity-60'
                                            : `bg-red-500 border-red-700 ${balance < 50 ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:brightness-110 cursor-pointer'}`
                                        }
                                    `}
                                >
                                    <div className={`mb-2 ${gridBuffs.slant ? 'text-stone-400' : 'text-white'}`}>
                                        <Axis3d size={28} />
                                    </div>
                                    <span className={`font-black text-xs uppercase mb-1 leading-tight ${gridBuffs.slant ? 'text-stone-500' : 'text-white'}`}>Slant</span>
                                    <div className={`text-[10px] font-bold leading-tight mb-2 h-8 flex items-center justify-center ${gridBuffs.slant ? 'text-stone-400' : 'text-white/90'}`}>
                                        Symbols match diagonally.
                                    </div>
                                    {gridBuffs.slant ? (
                                        <div className="mt-auto text-[10px] font-black bg-stone-200 text-stone-500 px-2 py-0.5 rounded-full">OWNED</div>
                                    ) : (
                                        <div className={`mt-auto flex items-center gap-1 font-black text-xs px-3 py-1 rounded-full ${balance >= 50 ? 'bg-white text-red-600' : 'bg-black/20 text-white'}`}>
                                            50 <Coins size={10} className={balance >= 50 ? "text-red-500 fill-red-500 ml-0.5" : "text-white fill-white ml-0.5"} />
                                        </div>
                                    )}
                                </button>
                            ) : (
                                <div className="flex-1 px-2 py-3 rounded-2xl border-2 border-stone-200 bg-stone-100 flex flex-col items-center justify-center text-center opacity-50 relative overflow-hidden">
                                    <div className="text-stone-300 mb-2">
                                        <Lock size={28} />
                                    </div>
                                    <span className="font-black text-xs uppercase text-stone-400 mb-1">Locked</span>
                                    <div className="text-[10px] items-center justify-center text-stone-400 font-bold leading-tight">
                                        Reach Spinflation 128
                                    </div>
                                </div>
                            )}
                        </div>
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
    );
};

export default React.memo(ShopView);
