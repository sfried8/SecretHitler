import * as Rand from "./Rand";
export class PolicyDeck {
    deckSource: Policy[];
    deck: Policy[];
    constructor();
    constructor(obj: PolicyDeck);
    constructor(obj?: PolicyDeck) {
        if (obj) {
            this.deckSource = obj.deckSource.map(x => new Policy(x.isLiberal));
            this.deck = obj.deck.map(x => new Policy(x.isLiberal));
        } else {
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
    draw(numberOfCards: number) {
        if (this.deck.length < numberOfCards) {
            this.shuffleDeck();
        }
        return this.deck.splice(0, numberOfCards);
    }
    peek(numberOfCards: number) {
        if (this.deck.length < numberOfCards) {
            this.shuffleDeck();
        }
        return this.deck.slice(0, numberOfCards);
    }
}
export class Policy {
    id: number;
    isLiberal: boolean;
    constructor(isLiberal: boolean) {
        this.isLiberal = isLiberal;
        this.id = Rand.Range(0, 999999);
    }
    toString() {
        if (this.isLiberal) {
            return "Liberal";
        } else {
            return "Fascist";
        }
    }
}
