export const SYMBOLS = {
    FRUIT: ['🍇', '🍌', '🍒', '🍑'],
    CANDY: '🍬',
    DIAMOND: '💎',
    MONEY: '💰',
    BOMB: '💣'
};

export const LOCK_COST = 50;
export const LOCK_DURATION = 9;

export const BUFF_DEFINITIONS = [
    { id: 'juiceBox', icon: '🧃', title: 'Juice Box', desc: 'Fruit win → Next fruit 4x payout' },
    { id: 'grapeLove', icon: '💜', title: 'Grape Love', desc: 'Grapes are worth 2x' },
    { id: 'orangutan', icon: '🦧', title: 'Orangutan', desc: 'Vertical Banana matches + 2x multiplier' },
    { id: 'mining', icon: '💥', title: 'Bomb Blast', desc: 'Bomb match triggers 3 diamond spins' },
    { id: 'halloween', icon: '🎃', title: 'Halloween', desc: 'Adds extra Candy Wilds / Anti-Bomb' },
    { id: 'investor', icon: '🏦', title: 'Investor', desc: 'Money Bags pay 0, 0, then 5x' }
];

export const S_TIER_BUFFS = [
    { id: 'angel', icon: '👼', title: 'Guardian Angel', desc: 'No Bombs. Cherries pay 5x.' },
    { id: 'devil', icon: '😈', title: 'Daredevil', desc: '2x Bombs. Grapes pay 2x.' }
];
