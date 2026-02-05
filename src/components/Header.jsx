import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Lock } from 'lucide-react';

const Header = ({
    displayBalance,
    buffs,
    miningTurns,
    lockedSymbol,
    lockSpinsRemaining,
    lastWin,
    isSpinning
}) => {
    return (
        <div className="w-full max-w-md flex justify-between items-center mb-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-xl shadow-hard border-2 border-stone-900 sticky top-4 z-50">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="text-amber-400 shrink-0">
                        <Coins size={32} />
                    </div>
                    <motion.span className="text-3xl font-black tabular-nums tracking-tighter leading-none">{displayBalance}</motion.span>
                </div>
                {/* Active Buffs Indicators */}
                <div className="flex gap-2">
                    {buffs.mining && miningTurns > 0 && <div className="text-cyan-500 font-black flex items-center gap-1"><span className="text-sm">💥</span> {miningTurns}</div>}
                    {lockedSymbol && (
                        <div className="text-amber-500 font-black flex items-center gap-1">
                            <Lock size={12} /> {lockSpinsRemaining}
                        </div>
                    )}
                </div>
            </div>
            <AnimatePresence mode="wait">
                {lastWin !== 0 && !isSpinning && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`font-black text-xl uppercase tracking-widest whitespace-nowrap ${lastWin < 0 ? 'text-red-500' : 'text-green-500'}`}
                    >
                        {lastWin < 0 ? `Penalty ${lastWin}` : `+${lastWin}`}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Header;
