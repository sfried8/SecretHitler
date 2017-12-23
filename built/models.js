"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Election {
    constructor(president, chancellor, numVotes) {
        this.president = president;
        this.chancellor = chancellor;
        this.numVotes = numVotes;
        this.jas = [];
        this.neins = [];
    }
    cloneOf(otherElection) {
        this.president = otherElection.president;
        this.chancellor = otherElection.chancellor;
        this.jas = otherElection.jas.slice();
        this.neins = otherElection.neins.slice();
        this.numVotes = otherElection.numVotes;
        return this;
    }
    vote(data) {
        if (data.vote === true) {
            this.jas.push(data.id);
        }
        else if (data.vote === false) {
            this.neins.push(data.id);
        }
    }
    didPass() {
        return this.jas.length > this.neins.length;
    }
    isFinished() {
        return this.jas.length + this.neins.length === this.numVotes;
    }
}
exports.Election = Election;
