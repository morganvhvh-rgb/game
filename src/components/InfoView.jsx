import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, TrendingUp, Star, Square, Axis3d, Info, Dumbbell } from 'lucide-react';
import { SYMBOLS, LOCK_DURATION } from '../data/gameConfig';

const InfoRow = ({ icon, label, description, meta, color }) => (
    <div className="flex items-center gap-3 py-2.5 border-b border-stone-100 last:border-0 min-h-[40px]">
        <div className={`w-6 flex justify-center text-lg shrink-0 ${color ? color : 'text-stone-700'}`}>
            {icon}
        </div>
        <div className="flex-1 flex items-center justify-between min-w-0 gap-2">
            <div className="flex items-baseline gap-2 overflow-hidden">
                <h4 className="font-bold text-stone-900 text-sm shrink-0">{label}</h4>
                <p className="text-xs text-stone-500 truncate">{description}</p>
            </div>
            {meta && <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide shrink-0">{meta}</span>}
        </div>
    </div>
);

const SectionTitle = ({ children }) => (
    <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-6 mb-2">
        {children}
    </h3>
);

const InfoView = ({ setView }) => {
    return (
        <motion.div
            key="info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col items-center max-w-md h-[calc(100vh-100px)]"
        >
            <div className="w-full mb-2 flex justify-between items-center py-2 px-1">
                <button
                    onClick={() => setView('game')}
                    className="flex items-center gap-2 text-stone-400 hover:text-stone-900 font-black transition-colors text-xs uppercase tracking-wide group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    Back
                </button>
            </div>

            <div className="w-full flex-1 overflow-y-auto min-h-0 pb-8 scrollbar-hide">

                <h1 className="text-2xl font-black text-stone-900 mb-1">Game Guide</h1>
                <p className="text-sm text-stone-500 font-medium mb-6">Quick reference.</p>

                <SectionTitle>Paytable</SectionTitle>
                <div className="flex flex-col">
                    <InfoRow icon="💎" label="Jackpot" description="Match 3 diamonds." meta="+100" color="text-cyan-500" />
                    <InfoRow icon="🍒" label="Fruits" description="Match 3 fruits." meta="+10" />
                    <InfoRow icon="💣" label="Penalty" description="Avoid 3 bombs." meta="-50" color="text-red-500" />
                    <InfoRow icon="🍬" label="Wild" description="Max 1 per spin." meta="Wild" />
                    <InfoRow icon="💰" label="Scatter" description="Instant win." meta="+10" />
                </div>

                <SectionTitle>Mechanics</SectionTitle>
                <div className="flex flex-col">
                    <InfoRow
                        icon={<Lock size={16} />}
                        label="Lock"
                        description={`Holds top-left (${LOCK_DURATION} spins).`}
                        meta="1/Game"
                    />
                    <InfoRow
                        icon={<TrendingUp size={16} />}
                        label="Inflation"
                        description="Cost doubles every 20 spins."
                        meta="Passive"
                        color="text-red-500"
                    />
                    <InfoRow
                        icon={<Dumbbell size={16} />}
                        label="Buffs"
                        description="Power-ups from shop."
                        meta="Shop"
                        color="text-amber-500"
                    />
                </div>

                <SectionTitle>Unlocks</SectionTitle>
                <div className="flex flex-col">
                    <InfoRow
                        icon={<Square size={16} />}
                        label="Last Peach"
                        description="2x win if peach is last symbol."
                        meta="64"
                        color="text-amber-500"
                    />
                    <InfoRow
                        icon={<Axis3d size={16} />}
                        label="Slant"
                        description="Enables diagonal wins."
                        meta="128"
                        color="text-purple-500"
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default InfoView;
