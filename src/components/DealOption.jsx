import React from 'react';
import { Coins } from 'lucide-react';

const DealOption = ({ title, desc, cost, count, onClick, disabled, icon }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
            relative bg-white rounded-[1.5rem] p-3 shadow-xl border-2 flex flex-col items-center text-center
            w-1/3 flex-grow-0 min-w-0 aspect-[2/3] sm:aspect-[9/16]
            ${disabled ? 'border-stone-100 opacity-50 cursor-not-allowed' : 'border-stone-900 hover:scale-105 hover:shadow-2xl transition-all'}
        `}
    >
        {/* Icon */}
        <div className="mb-2 sm:mb-4 p-2 sm:p-3 bg-stone-50 rounded-full shadow-inner mt-2 transform scale-125">
            {icon}
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-lg font-black uppercase tracking-tight mb-1 leading-tight">{title}</h3>

        {/* Count */}


        {/* Description */}
        <p className="text-[10px] sm:text-xs text-stone-500 font-medium mb-2 leading-tight px-1 flex-1 flex items-center justify-center">
            {desc}
        </p>

        {/* Cost Section */}
        <div className="w-full mt-auto">
            <div className={`
                 w-full py-2 sm:py-3 rounded-xl font-black uppercase tracking-tight text-sm sm:text-lg flex items-center justify-center gap-1 sm:gap-2
                 ${!disabled ? 'bg-amber-400 text-white shadow-md' : 'bg-stone-200 text-stone-400'}
             `}>
                {cost} <Coins size={14} className={!disabled ? "fill-white" : "fill-stone-400"} />
            </div>
        </div>
    </button>
);

export default DealOption;
