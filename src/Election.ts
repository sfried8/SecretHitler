import { Player } from "./Player";

export class Election {
    jas: number[];
    neins: number[];
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
    vote(data: any) {
        if (data.vote === true) {
            this.jas.push(data.id);
        } else if (data.vote === false) {
            this.neins.push(data.id);
        }
    }
    didPlayerVote(id: number): boolean {
        for (let i = 0; i < this.jas.length; i++) {
            if (this.jas[i] === id) {
                return true;
            }
        }
        for (let i = 0; i < this.neins.length; i++) {
            if (this.neins[i] === id) {
                return true;
            }
        }
        return false;
    }
    didPass() {
        return this.jas.length > this.neins.length;
    }
    isFinished() {
        return this.jas.length + this.neins.length === this.numVotes;
    }
}
