import React from 'react';
import { motion } from 'framer-motion';
import { Star, Tag } from 'lucide-react';

const PlayingCard = ({ card, index, owned, balance, onPurchase }) => {
    const isAffordable = balance >= card.price;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: index * 0.15, type: "spring", damping: 20 }}
            className={`
                relative bg-white rounded-[1.5rem] p-3 shadow-xl border-2 flex flex-col items-center text-center
                w-1/3 flex-grow-0 min-w-0 aspect-[2/3] sm:aspect-[9/16]
                ${owned ? 'border-stone-100 bg-stone-50' : 'border-stone-900'}
            `}
        >
            <div className="text-4xl sm:text-5xl mb-2 sm:mb-4 p-2 sm:p-3 bg-stone-50 rounded-full shadow-inner mt-2">{card.icon}</div>

            <h3 className="text-sm sm:text-lg font-black uppercase tracking-tight mb-1 leading-tight">{card.title}</h3>
            <p className="text-[10px] sm:text-xs text-stone-500 font-medium mb-2 leading-tight px-1 flex-1 flex items-center justify-center">
                {card.desc}
            </p>

            <div className="w-full mt-auto">
                {owned ? (
                    <div className="w-full py-2 rounded-xl bg-stone-200 text-stone-400 font-bold text-[10px] sm:text-xs uppercase flex items-center justify-center gap-1">
                        <Star size={12} className="fill-stone-400" /> Owned
                    </div>
                ) : (
                    <button
                        onClick={onPurchase}
                        disabled={!isAffordable}
                        className={`
                            w-full py-2 sm:py-3 rounded-xl font-black uppercase tracking-tight text-sm sm:text-lg flex items-center justify-center gap-1 sm:gap-2 transition-transform active:scale-95
                            ${isAffordable ? 'bg-amber-400 text-white shadow-md hover:bg-amber-500' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}
                        `}
                    >
                        <Tag size={14} />
                        {card.price}
                    </button>
                )}
            </div>

            {/* Rarity/Price Indicator */}
            {!owned && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    {card.price < 40 && <div className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-black uppercase">Sale</div>}
                    {card.price > 40 && <div className="bg-red-100 text-red-500 px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] font-black uppercase">High</div>}
                </div>
            )}
        </motion.div>
    );
};

export default PlayingCard;
