import React from 'react';
import { Coins } from 'lucide-react';

const DealOption = ({ title, desc, cost, count, onClick, disabled, icon }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
            w-full bg-white p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group
            ${disabled ? 'border-stone-100 opacity-50 cursor-not-allowed' : 'border-stone-100 hover:border-stone-900 hover:shadow-lg'}
        `}
    >
        <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-stone-50 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
                <div>
                    <h3 className="font-black text-lg text-stone-900 uppercase tracking-tight leading-none">{title}</h3>
                    <span className="text-xs font-bold text-stone-400">Deals {count} Cards</span>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Cost</span>
                <div className="flex items-center gap-1 text-stone-900 font-black text-xl">
                    {cost}<Coins size={14} className="text-amber-500 fill-amber-500" />
                </div>
            </div>
        </div>
        <p className="text-sm text-stone-500 relative z-10">{desc}</p>
    </button>
);

export default DealOption;
