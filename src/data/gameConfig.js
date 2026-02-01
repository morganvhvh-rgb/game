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
    { id: 'orangutan', icon: '🦧', title: 'Orangutan', desc: 'Allows vertical matches for Bananas' },
    { id: 'mining', icon: '⛏', title: 'Mining', desc: 'Bomb match triggers 3 diamond spins' },
    { id: 'halloween', icon: '🎃', title: 'Halloween', desc: 'Adds extra Candy Wilds / Anti-Bomb' },
    { id: 'investor', icon: '🏦', title: 'Investor', desc: 'Money Bags pay 0, 0, then 5x' }
];
