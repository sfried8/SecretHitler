import { Player } from "./Player";

export class Election {
    jas: string[];
    neins: string[];
    constructor();
    constructor(president: Player, chancellor: Player, numVotes: number);
    constructor(
        public president?: Player,
        public chancellor?: Player,
        public numVotes?: number
    ) {
        this.jas = [];
        this.neins = [];
    }
    cloneOf(otherElection: Election) {
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
        } else if (data.vote === false) {
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
