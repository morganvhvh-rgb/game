import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, TrendingUp, Star } from 'lucide-react';
import { SYMBOLS, LOCK_DURATION } from '../data/gameConfig';

const InfoView = ({ setView }) => {
    return (
        <motion.div
            key="info"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full flex flex-col items-center max-w-md h-[calc(100vh-100px)]"
        >
            {/* Compact Header */}
            <div className="w-full mb-3 flex justify-between items-center sticky top-2 z-50">
                <button
                    onClick={() => setView('game')}
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-stone-900 hover:bg-white font-black transition-all border border-stone-200 text-sm"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
                <span className="text-xs font-black uppercase tracking-widest text-stone-400 bg-white/90 px-3 py-1.5 rounded-full border border-stone-200">
                    Guide
                </span>
            </div>

            <div className="w-full flex-1 overflow-y-auto min-h-0 space-y-3 pb-4 scrollbar-hide">

                {/* Combined Grid for Paytable */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Diamond - Jackpot - Full Width */}
                    <div className="col-span-2 flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute inset-0 bg-cyan-50/50 z-0"></div>
                        <div className="text-5xl relative z-10">💎</div>
                        <div className="flex-1 relative z-10">
                            <div className="flex items-center gap-2">
                                <h4 className="font-black text-stone-900 uppercase text-sm">Jackpot</h4>
                                <span className="text-[10px] font-bold bg-cyan-100 text-cyan-600 px-1.5 py-0.5 rounded-full">3%</span>
                            </div>
                            <p className="text-[10px] text-stone-500 font-medium leading-tight">Match 3 Diamonds.</p>
                        </div>
                        <div className="flex flex-col items-end relative z-10">
                            <span className="font-black text-lg text-cyan-600">+100</span>
                        </div>
                    </div>

                    {/* Fruits */}
                    <div className="col-span-2 flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-stone-200 shadow-sm">
                        <div className="flex -space-x-2 shrink-0 pl-1">
                            {SYMBOLS.FRUIT.map((f, i) => (
                                <div key={i} className="text-3xl relative z-[10] first:z-[40] second:z-[30] -ml-2 first:ml-0">{f}</div>
                            ))}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-stone-900 text-xs">Fruit Match</h4>
                                <span className="text-[10px] font-bold bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">72%</span>
                            </div>
                            <p className="text-[10px] text-stone-400">Match 3</p>
                        </div>
                        <div className="font-black text-stone-900 text-base pr-2">+10</div>
                    </div>

                    {/* Bomb */}
                    <div className="col-span-2 flex items-center gap-3 bg-red-50/50 p-2.5 rounded-2xl border border-red-100 shadow-sm">
                        <div className="text-4xl shrink-0">💣</div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h4 className="font-black text-red-900 uppercase text-xs">Penalty</h4>
                                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">15%</span>
                            </div>
                            <p className="text-[10px] text-red-700/70 font-medium">Match 3. Minus points.</p>
                        </div>
                        <div className="font-black text-red-500 text-base pr-2">-50</div>
                    </div>

                    {/* Wild */}
                    <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center text-center">
                        <div className="text-4xl mb-1">🍬</div>
                        <div className="flex items-center gap-1 mb-0.5">
                            <span className="font-bold text-[10px] uppercase text-stone-900">Wild</span>
                            <span className="text-[9px] font-bold bg-stone-100 text-stone-500 px-1 rounded-full">4.5%</span>
                        </div>
                        <p className="text-[9px] text-stone-400 leading-tight">Max 1/spin</p>
                    </div>

                    {/* Scatter */}
                    <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center text-center">
                        <div className="text-4xl mb-1">💰</div>
                        <div className="flex items-center gap-1 mb-0.5">
                            <span className="font-bold text-[10px] uppercase text-stone-900">Scatter</span>
                            <span className="text-[9px] font-bold bg-stone-100 text-stone-500 px-1 rounded-full">6%</span>
                        </div>
                        <p className="text-[9px] text-stone-400 leading-tight">Instant +10</p>
                    </div>
                </div>

                {/* Mechanics - Compact Dark Mode */}
                <div className="bg-stone-900 text-stone-300 rounded-2xl p-4 shadow-lg relative overflow-hidden">
                    <div className="grid grid-cols-1 gap-4 relative z-10">
                        {/* Locking */}
                        <div className="flex items-start gap-3">
                            <div className="text-amber-400 shrink-0">
                                <Lock size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-white text-xs mb-1">Symbol Locking</h4>
                                    <span className="text-[10px] font-black text-amber-400 bg-amber-900/30 px-1.5 rounded">1/GAME</span>
                                </div>
                                <p className="text-[10px] text-stone-400 leading-relaxed">
                                    Top-Left symbol stays for {LOCK_DURATION} spins.
                                </p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-stone-800 w-full"></div>

                        {/* Spinflation */}
                        <div className="flex items-start gap-3">
                            <div className="text-red-400 shrink-0">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-xs mb-1">Spinflation</h4>
                                <p className="text-[10px] text-stone-400 leading-relaxed">
                                    Spin cost doubles every 20 spins.
                                </p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-stone-800 w-full"></div>

                        {/* S-Tier Buffs */}
                        <div className="flex items-start gap-3">
                            <div className="text-yellow-400 shrink-0">
                                <Star size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-xs mb-1">S-Tier Buffs</h4>
                                <p className="text-[10px] text-stone-400 leading-relaxed">
                                    Only one can be held at a time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default InfoView;
