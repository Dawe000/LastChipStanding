class PlayerStats {
    constructor() {
        this.players = {};
    }

    addPlayer(name) {
        if (!this.players[name]) {
            this.players[name] = { totalBets: 0, chips: 0 };
        }
    }

    updatePlayerStats(name, betAmount, chipCount) {
        if (this.players[name]) {
            this.players[name].totalBets += betAmount;
            this.players[name].chips += chipCount;
        }
    }

    getPlayerStats(name) {
        return this.players[name] || null;
    }
}

export default PlayerStats;