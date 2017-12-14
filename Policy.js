class PolicyDeck {
    constructor() {
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
    shuffleDeck() {
        this.deck = shuffle(this.deckSource.slice());
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
        return this.deck.slice(0,numberOfCards+1)

    }
}
class Policy {
    constructor(isLiberal) {
        this.isLiberal = isLiberal;
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