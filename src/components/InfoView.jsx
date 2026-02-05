import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, TrendingUp, Square, Axis3d } from 'lucide-react';
import { LOCK_DURATION } from '../data/gameConfig';

const CompactInfoCard = ({ icon, label, sub, val, color }) => (
    <div className="bg-white p-2.5 rounded-lg border-2 border-stone-200 flex items-center justify-between shadow-hard-sm">
        <div className="flex items-center gap-3">
            <div className={`text-xl w-6 text-center flex justify-center ${color}`}>{icon}</div>
            <div className="flex flex-col">
                <span className="font-bold text-stone-900 text-xs leading-none mb-0.5">{label}</span>
                <span className="text-[10px] text-stone-500 font-medium leading-none">{sub}</span>
            </div>
        </div>
        <div className={`text-xs font-black ${color ? color : 'text-stone-400'}`}>{val}</div>
    </div>
);

const SectionHeader = ({ title }) => (
    <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-5 mb-2 pl-1">
        {title}
    </h3>
);

const InfoView = ({ setView }) => {
    return (
        <motion.div
            key="info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col max-w-md h-[calc(100vh-100px)] px-1"
        >
            <div className="w-full mb-2 flex justify-between items-center py-2 px-1">
                <button
                    onClick={() => setView('game')}
                    className="flex items-center gap-2 text-stone-500 hover:text-stone-900 font-black transition-colors text-xs uppercase tracking-wide group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    Back
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
                <div className="flex items-baseline justify-between px-1 mb-2">
                    <h1 className="text-2xl font-black text-stone-900">Game Guide</h1>
                </div>

                <SectionHeader title="Paytable" />
                <div className="grid grid-cols-2 gap-2">
                    <CompactInfoCard icon="💎" label="Jackpot" sub="Match 3" val="+100" color="text-cyan-500" />
                    <CompactInfoCard icon="🍒" label="Fruits" sub="Match 3" val="+10" color="text-stone-900" />
                    <CompactInfoCard icon="💰" label="Scatter" sub="Instant Win" val="+10" color="text-amber-500" />
                    <CompactInfoCard icon="💣" label="Hazard" sub="Avoid 3" val="-50" color="text-red-500" />
                </div>

                {/* Wilds are special */}
                <div className="mt-2 bg-stone-100 p-2.5 rounded-lg flex items-center justify-between border-2 border-stone-200 shadow-hard-sm">
                    <div className="flex items-center gap-3">
                        <div className="text-xl w-6 text-center flex justify-center">🍬</div>
                        <div className="flex flex-col">
                            <span className="font-bold text-stone-900 text-xs">Wild Symbol</span>
                            <span className="text-[10px] text-stone-500 leading-tight">Substitutes any symbol. Max 1 per spin.</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="col-span-2">
                        <SectionHeader title="Mechanics" />
                    </div>
                    <div className="bg-white p-3 rounded-lg border-2 border-stone-200 shadow-hard-sm flex flex-col justify-between gap-2">
                        <div className="flex items-start justify-between text-stone-900">
                            <Lock size={18} className="text-stone-400" />
                            <span className="text-[9px] font-black bg-stone-100 px-1.5 py-0.5 rounded text-stone-500 tracking-wide">1/GAME</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-xs uppercase leading-none mb-1">Lock</h4>
                            <p className="text-[10px] text-stone-500 leading-tight">Freezes top-left symbol for {LOCK_DURATION} spins.</p>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border-2 border-stone-200 shadow-hard-sm flex flex-col justify-between gap-2">
                        <div className="flex items-start justify-between text-red-500">
                            <TrendingUp size={18} />
                            <span className="text-[9px] font-black bg-red-50 text-red-600 px-1.5 py-0.5 rounded tracking-wide">PASSIVE</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-xs uppercase text-red-600 leading-none mb-1">Inflation</h4>
                            <p className="text-[10px] text-stone-500 leading-tight">Spin cost doubles every 20 spins.</p>
                        </div>
                    </div>
                </div>

                <SectionHeader title="Unlockables" />
                <div className="flex flex-col gap-2">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-2.5 rounded-lg border-2 border-orange-100 flex items-center gap-3 shadow-hard-sm">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-orange-500 border border-orange-100">
                            <Square size={16} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-0.5">
                                <h4 className="font-bold text-xs uppercase text-orange-900">Last Peach</h4>
                                <span className="text-[9px] font-black bg-white/60 px-1.5 py-0.5 rounded text-orange-600 border border-orange-100">64 COST</span>
                            </div>
                            <p className="text-[10px] text-orange-800/70 font-medium leading-tight">2x Multiplier if 'Peach' lands in the very last square.</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-2.5 rounded-lg border-2 border-purple-100 flex items-center gap-3 shadow-hard-sm">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-purple-500 border border-purple-100">
                            <Axis3d size={16} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-0.5">
                                <h4 className="font-bold text-xs uppercase text-purple-900">Slant</h4>
                                <span className="text-[9px] font-black bg-white/60 px-1.5 py-0.5 rounded text-purple-600 border border-purple-100">128 COST</span>
                            </div>
                            <p className="text-[10px] text-purple-800/70 font-medium leading-tight">Enables diagonal matches for all symbols.</p>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default InfoView;
