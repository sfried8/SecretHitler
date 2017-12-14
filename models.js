


class Election {
    constructor(president, chancellor) {
        this.president = president;
        this.chancellor = chancellor;
        this.jas = [];
        this.neins = [];
    }
    vote(data) {
        if (data.vote === true) {
            this.jas.push(data.id);
        } else if (data.vote === false) {
            this.neins.push(data.id);
        }
    }
    didPass() {
        return (this.jas.length > this.neins.length)
    }
    isFinished() {
        return (this.jas.length + this.neins.length === gameData.players.length)
    }


}

module.exports = {
    Executive_Action: Executive_Action,
    Setups: Setups,
    Election: Election
}