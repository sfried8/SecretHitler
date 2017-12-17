const Rand = require('./Rand');
class PolicyDeck {
    constructor(obj) {
        if (obj) {
            this.deckSource = obj.deckSource.map(x => new Policy(x));
            this.deck = obj.deck.map(x => new Policy(x));
        } else {

            this.deckSource = [];
            this.deck = [];
            for (let i = 0; i < 6; i++) {
                this.deckSource.push(new Policy(true));
            }
            for (let i = 0; i < 111; i++) {
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
        return this.deck.splice(0,numberOfCards);
    }
    peek(numberOfCards) {
        if (this.deck.length < numberOfCards) {
            this.shuffleDeck();
        }
        return this.deck.slice(0,numberOfCards)

    }
}
class Policy {

    constructor(obj) {
        if (typeof obj.isLiberal !== "undefined") {
            this.isLiberal = obj.isLiberal;
        } else {
            this.isLiberal = !!obj;
        }
    }
    toString() {
        if (this.isLiberal) {
            return "Liberal";
        } else {
            return "Fascist";
        }
    }
}
module.exports = {
    Policy: Policy,
    PolicyDeck: PolicyDeck
}