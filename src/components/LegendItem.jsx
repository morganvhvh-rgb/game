import React from 'react';

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

export default LegendItem;
