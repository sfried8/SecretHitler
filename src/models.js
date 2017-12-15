


class Election {
    constructor(president, chancellor, numVotes) {
        if (typeof chancellor === "undefined" && typeof numVotes === "undefined") {
            this.president = president.president;
            this.chancellor = president.chancellor;
            this.jas = president.jas;
            this.neins = president.neins;
            this.numVotes = president.numVotes;
        } else {

            this.president = president;
            this.chancellor = chancellor;
            this.numVotes = numVotes;
            this.jas = [];
            this.neins = [];
        }
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
        return (this.jas.length + this.neins.length === this.numVotes)
    }


}

module.exports = {
    Election: Election
}