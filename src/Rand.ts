export function Boolean(chanceForTrue: number): boolean {
    if (chanceForTrue === null || typeof chanceForTrue === "undefined") {
        chanceForTrue = 50;
    }

    if (chanceForTrue < 0) {
        chanceForTrue = 0;
    }
    if (chanceForTrue > 100) {
        chanceForTrue = 100;
    }
    let rand = (Math.random() * 100) | 0;
    return rand < chanceForTrue;
}
export function Range(min: number, max: number): number {
    return (Math.random() * (max - min) + min) | 0;
}
export function Shuffle(array: Array<any>): Array<any> {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
export function Choice(array: Array<any>): any {
    let index = Math.random() * array.length;
    return array[Math.floor(index)];
}
export function randomName(): string {
    const names = [
        "Sam",
        "Mike",
        "George",
        "Andrew",
        "Max",
        "Kutik",
        "Hussein",
        "Aaron",
        "Derrick",
        "Eden",
        "Poop",
        "Butt",
        "John",
        "Charlie",
        "Frank",
        "Randy",
        "Jimbo",
        "Stan",
        "Kyle",
        "Eric",
        "Butters",
        "Kenny"
    ];
    return Choice(names) + Range(1, 100);
}
