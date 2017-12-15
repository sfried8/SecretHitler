module.exports = {
    Boolean : function (chanceForTrue) {
    if (chanceForTrue === null || typeof chanceForTrue === "undefined") {
        chanceForTrue = 50;
    }

      if (chanceForTrue < 0) {
                chanceForTrue = 0;
      }
            if (chanceForTrue > 100) {
                chanceForTrue = 100;
            }
    let rand = (Math.random() * 100)|0;
    return (rand < chanceForTrue);
},
Range: function (min, max) {
    return ((Math.random() * (max - min))+min)|0;
},
    Shuffle: function (array) {
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
}