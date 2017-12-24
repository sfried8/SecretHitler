"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Rand = require("./Rand");
class PolicyDeck {
    constructor(obj) {
        if (obj) {
            this.deckSource = obj.deckSource.map(x => new Policy(x.isLiberal));
            this.deck = obj.deck.map(x => new Policy(x.isLiberal));
        }
        else {
            this.deckSource = [];
            this.deck = [];
            for (let i = 0; i < 6; i++) {
                this.deckSource.push(new Policy(true));
            }
            for (let i = 0; i < 11; i++) {
                this.deckSource.push(new Policy(false));
            }
            this.shuffleDeck();
        }
    }
    shuffleDeck() {
        this.deck = Rand.Shuffle(this.deckSource.slice());
    }
    draw(numberOfCards) {
        if (this.deck.length < numberOfCards) {
            this.shuffleDeck();
        }
        return this.deck.splice(0, numberOfCards);
    }
    peek(numberOfCards) {
        if (this.deck.length < numberOfCards) {
            this.shuffleDeck();
        }
        return this.deck.slice(0, numberOfCards);
    }
}
exports.PolicyDeck = PolicyDeck;
class Policy {
    constructor(isLiberal) {
        this.isLiberal = isLiberal;
    }
    toString() {
        if (this.isLiberal) {
            return "Liberal";
        }
        else {
            return "Fascist";
        }
    }
}
exports.Policy = Policy;
