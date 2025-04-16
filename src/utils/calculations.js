export const calculateTotalChips = (chipCounts) => {
    return chipCounts.reduce((total, count) => total + count, 0);
};

export const calculateAverageBet = (totalBets, numberOfBets) => {
    return numberOfBets > 0 ? totalBets / numberOfBets : 0;
};