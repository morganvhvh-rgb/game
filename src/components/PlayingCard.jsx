import React from 'react';
import { motion } from 'framer-motion';
import { Star, Tag } from 'lucide-react';

const PlayingCard = ({ card, index, owned, balance, onPurchase, isGolden }) => {
    const isAffordable = balance >= card.price;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: index * 0.15, type: "spring", damping: 20 }}
            className={`
                relative rounded-[1.5rem] p-4 shadow-xl border-2 flex flex-col items-center text-center
                w-full aspect-[2/3] sm:aspect-[9/16] transition-all duration-300
                ${isGolden
                    ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border-slate-900 shadow-amber-300/50 scale-105'
                    : (owned ? 'border-slate-100 bg-slate-50' : 'bg-white border-slate-900')
                }
            `}
        >
            {isGolden && (
                <div className="absolute inset-0 bg-white/20 rounded-[1.5rem] pointer-events-none" />
            )}

            <div className={`mt-4 mb-4 filter drop-shadow-sm ${isGolden ? 'text-6xl sm:text-7xl scale-110' : 'text-4xl sm:text-5xl'}`}>
                {card.icon}
            </div>

            <h3 className={`font-black uppercase tracking-tight mb-2 leading-tight ${isGolden ? 'text-xl sm:text-2xl text-slate-900' : 'text-sm sm:text-lg'}`}>
                {card.title}
            </h3>

            <p className={`font-bold leading-snug px-2 flex-1 flex items-center justify-center ${isGolden ? 'text-sm sm:text-base text-slate-800' : 'text-[10px] sm:text-xs text-slate-500 font-medium'}`}>
                {card.desc}
            </p>

            <div className="w-full mt-auto pt-4 relative z-10">
                {owned ? (
                    <div className={`w-full py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1 ${isGolden ? 'bg-slate-900/10 text-slate-900' : 'bg-slate-200 text-slate-400'}`}>
                        <Star size={14} className={isGolden ? "fill-slate-900" : "fill-slate-400"} /> Owned
                    </div>
                ) : (
                    <button
                        onClick={onPurchase}
                        disabled={!isAffordable}
                        className={`
                            w-full py-3 rounded-xl font-black uppercase tracking-tight text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-hard-sm border-2
                            ${isGolden
                                ? (isAffordable ? 'bg-slate-900 text-white border-slate-900 hover:bg-black' : 'bg-slate-400 text-slate-200 border-slate-500 cursor-not-allowed')
                                : (isAffordable ? 'bg-amber-400 text-white border-transparent hover:bg-amber-500' : 'bg-slate-200 text-slate-400 border-transparent cursor-not-allowed')
                            }
                        `}
                    >
                        <Tag size={16} />
                        {card.price}
                    </button>
                )}
            </div>

            {/* Rarity/Price Indicator */}
            {!owned && !isGolden && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    {card.price < 40 && <div className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-black uppercase">Sale</div>}
                    {card.price > 40 && <div className="bg-red-100 text-red-500 px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-black uppercase">High</div>}
                </div>
            )}
            {isGolden && (
                <div className="absolute top-3 right-3 animate-pulse">
                    <Star size={24} className="text-white fill-white drop-shadow-md" />
                </div>
            )}
        </motion.div>
    );
};

export default PlayingCard;
