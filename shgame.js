let io;
let gameSocket;


const Executive_Action =
    {
        NoAction: 0,
        InvestigateLoyalty: 1,
        SpecialElection: 2,
        PolicyPeek: 3,
        Execution: 4
    };
const Setups = {
    3: {Liberals: 1, Fascists: 1, hitlerKnowsFascists: true, board:[Executive_Action.NoAction, Executive_Action.NoAction, Executive_Action.PolicyPeek, Executive_Action.Execution, Executive_Action.Execution] },
    5: {Liberals: 3, Fascists: 1, hitlerKnowsFascists: true, board:[Executive_Action.NoAction, Executive_Action.NoAction, Executive_Action.PolicyPeek, Executive_Action.Execution, Executive_Action.Execution]},
    6: {Liberals: 4, Fascists: 1, hitlerKnowsFascists: true, board:[Executive_Action.NoAction, Executive_Action.NoAction, Executive_Action.PolicyPeek, Executive_Action.Execution, Executive_Action.Execution]},
    7: {Liberals: 4, Fascists: 2, hitlerKnowsFascists: false, board:[Executive_Action.NoAction, Executive_Action.InvestigateLoyalty, Executive_Action.SpecialElection, Executive_Action.Execution, Executive_Action.Execution]},
    8: {Liberals: 5, Fascists: 2, hitlerKnowsFascists: false, board:[Executive_Action.NoAction, Executive_Action.InvestigateLoyalty, Executive_Action.SpecialElection, Executive_Action.Execution, Executive_Action.Execution]},
    9: {Liberals: 5, Fascists: 3, hitlerKnowsFascists: false, board:[Executive_Action.InvestigateLoyalty, Executive_Action.InvestigateLoyalty, Executive_Action.SpecialElection, Executive_Action.Execution, Executive_Action.Execution]},
    10: {Liberals: 6, Fascists: 3, hitlerKnowsFascists: false, board:[Executive_Action.InvestigateLoyalty, Executive_Action.InvestigateLoyalty, Executive_Action.SpecialElection, Executive_Action.Execution, Executive_Action.Execution]}
};

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
class Election {
    constructor(president, chancellor) {
        this.president = president;
        this.chancellor = chancellor;
        this.jas = [];
        this.neins = [];
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
        return (this.jas.length + this.neins.length === gameData.players.length)
    }

}

/**
 * This function is called by index.js to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.initGame = function(sio, socket){
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', { message: "You are connected!" });

    // Host Events
    gameSocket.on('hostCreateNewGame', hostCreateNewGame);
    gameSocket.on('hostRoomFull', hostPrepareGame);
    gameSocket.on('hostCountdownFinished', hostStartGame);

    // Player Events
    gameSocket.on('playerJoinGame', playerJoinGame);
    gameSocket.on('VIPStart', onVIPStart);
    gameSocket.on('presidentNominate', onPresidentNominate);
    gameSocket.on('voteForChancellor', onVoteForChancellor);
    gameSocket.on('choosePresidentPolicies', onChoosePresidentPolicies);
    gameSocket.on('chooseChancellorPolicy', onChooseChancellorPolicy);
    gameSocket.on('chooseEATarget', onChooseEATarget);

};


function onVIPStart() {
    let tempPlayerArray = shuffle(gameData.players.slice());
    gameData.gameRules = Setups[gameData.players.length];
    let j = 0;
    let i;
    for (i = 0; i < gameData.gameRules.Fascists; i++) {
        tempPlayerArray[j].role = Role.Fascist;
        gameData.fascists.push(tempPlayerArray[j]);
        j++;
    }
    for (i = 0; i < gameData.gameRules.Liberals; i++) {
        tempPlayerArray[j].role = Role.Liberal;
        gameData.liberals.push(tempPlayerArray[j]);
        j++;
    }
    tempPlayerArray[j].role = Role.Hitler;
    gameData.hitler = tempPlayerArray[j];
    gameData.policyDeck = new PolicyDeck();

    emit('beginNewGame',gameData);


    gameData.presidentIndex = -1;
    electNextPresident();
}

function electNextPresident() {
    console.trace();
    gameData.presidentIndex = (gameData.presidentIndex + 1) % gameData.players.length;
    gameData.president = gameData.players[gameData.presidentIndex];
    gameData.lastChancellor = gameData.chancellor;
    emit('presidentElected',gameData);
}
function specialElection(newPresident) {
    gameData.president = newPresident;
    gameData.lastChancellor = gameData.chancellor;
    emit('presidentElected',gameData);
}
function sendPoliciesToPresident() {
    gameData.presidentPolicies = gameData.policyDeck.draw(3);
    emit('chancellorElected',gameData);
}
function onPresidentNominate(data) {
    gameData.chancellorNominee = data.nominee;
    if (gameData.currentElection) {
        gameData.electionArchive = gameData.electionArchive || [];
        gameData.electionArchive.push(gameData.currentElection)
    }
    gameData.currentElection = new Election(gameData.president,gameData.chancellor);
    emit('chancellorNominated',gameData);
}
function onVoteForChancellor(data) {

    gameData.currentElection.vote(data);
    emit('playerVoted',data);
    if (gameData.currentElection.isFinished()) {
        if (gameData.currentElection.didPass()) {
            gameData.chancellor = gameData.chancellorNominee;
            emit('voteFinished',gameData);
            if (gameData.enactedPolicies.fascists >= 3 && gameData.chancellor.role === Role.Hitler) {
                emit('gameOver',gameData);
            } else {
                sendPoliciesToPresident();
            }
        } else {
            gameData.chaosLevel += 1;
            //TODO if chaosLevel == 3
            emit('voteFinished',gameData);

            electNextPresident();
        }
    }
}
function onChoosePresidentPolicies(data) {
    gameData.chancellorPolicies = data.policies;
    emit('presidentPolicyChosen',gameData);
}

function executiveActionTriggered() {
    if (gameData.lastPolicy.isLiberal) {
        return Executive_Action.NoAction;
    }
    let action = gameData.gameRules.board[gameData.enactedPolicies.fascists - 1];
    if (action === Executive_Action.PolicyPeek && gameData.policyDeck.deck.length < 3) {
        gameData.policyDeck.shuffleDeck();
    }
    return action;
}
function onChooseChancellorPolicy(data) {
    gameData.lastPolicy = data.policies[0];
    if (gameData.lastPolicy.isLiberal) {
        if (!gameData.enactedPolicies.liberals) {
            gameData.enactedPolicies.liberals = 0;
        }
        gameData.enactedPolicies.liberals += 1;
    } else {
        if (!gameData.enactedPolicies.fascists) {
            gameData.enactedPolicies.fascists = 0;
        }
        gameData.enactedPolicies.fascists += 1;
    }
    emit('policyPlayed',gameData);
    if (gameData.enactedPolicies.fascists > 5 || gameData.enactedPolicies.liberals > 5) {
        emit('gameOver',gameData);
    } else {
        performEA();
    }
}

function performEA() {
    gameData.lastExecutiveAction = executiveActionTriggered();

        if (gameData.lastExecutiveAction === Executive_Action.NoAction) {
            electNextPresident();
        } else {
            emit('executiveActionTriggered',gameData);
        }


}
function onChooseEATarget(data) {
    switch (gameData.lastExecutiveAction) {
        case Executive_Action.InvestigateLoyalty:
        case Executive_Action.PolicyPeek:
            electNextPresident();
            break;
        case Executive_Action.Execution:
            let target = getPlayerById(data.target.id);
            target.dead = true;
            if (target.role === Role.Hitler) {
                emit('gameOver',gameData)
            } else {
                electNextPresident();
            }
            break;
        case Executive_Action.SpecialElection:
            specialElection(getPlayerById(data.target.id));
            break;
    }
}

/**
 * The 'START' button was clicked and 'hostCreateNewGame' event occurred.
 */
let thisGameId;
function hostCreateNewGame() {
    // Create a unique Socket.IO Room
    thisGameId = ( Math.random() * 100000 ) | 0;

    // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
    console.log(thisGameId);
    // Join the Room and wait for the players
    this.join(thisGameId.toString());
}

/*
 * Two players have joined. Alert the host!
 * @param gameId The game ID / room ID
 */
function hostPrepareGame(gameId) {
    let sock = this;
    let data = {
        mySocketId : sock.id,
        gameId : gameId
    };
    //console.log("All Players Present. Preparing game...");
    io.sockets.in(data.gameId).emit('beginNewGame', data);
}

/*
 * The Countdown has finished, and the game begins!
 * @param gameId The game ID / room ID
 */
function hostStartGame() {
    log('Game Started.');
}

class Player {
    constructor(index, name, id) {
        this.index = index;
        this.name = name;
        this.id = id;
    }
}

const Role = {
    Liberal: "Liberal",
    Fascist: "Fascist",
    Hitler: "Hitler"
};
let gameData = {
    players: [],
    liberals: [],
    fascists: [],
    hitler: null,
    president: null,
    chancellorNominee: null,
    chancellor: null,
    lastChancellor: null,
    gameRules: {},
    enactedPolicies: {},
    chaosLevel: 0
};
function getPlayerById(id) {
    for (let i = 0; i < gameData.players.length; i++) {
        if (gameData.players[i].id === id) {
            return gameData.players[i];
        }
    }
    return null;
}
/* *****************************
   *                           *
   *     PLAYER FUNCTIONS      *
   *                           *
   ***************************** */

/**
 * A player clicked the 'START GAME' button.
 * Attempt to connect them to the room that matches
 * the gameId entered by the player.
 * @param data Contains data entered via player's input - playerName and gameId.
 */
function playerJoinGame(data) {
    let sock = this;

    // Look up the room ID in the Socket.IO manager object.
    let room = gameSocket.manager.rooms["/" + thisGameId];

    // If the room exists...
    if( room !== undefined ){
        // attach the socket id to the data object.
        data.mySocketId = sock.id;

        // Join the room
        sock.join(thisGameId);

        gameData.players.push(new Player(gameData.players.length, data.playerName, data.playerId));
        if (gameData.players.length === 1) {
            gameData.hostId = data.playerId;
        }
        // Emit an event notifying the clients that the player has joined the room.
        emit('playerJoinedRoom', gameData);

    } else {
        // Otherwise, send an error message back to the player.
        this.emit('error',{message: "This room does not exist."} );
    }
}
/*
 * Javascript implementation of Fisher-Yates shuffle algorithm
 * http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
 */
function shuffle(array) {
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
function randomBoolean(chanceForTrue) {
    if (chanceForTrue === null || typeof chanceForTrue === "undefined") {
        chanceForTrue = 50;
    }
    chanceForTrue = Math.min(chanceForTrue, 100);
    chanceForTrue = Math.max(chanceForTrue, 0);
    let rand = (Math.random() * 100)|0;
    return (rand < chanceForTrue);
}
function randomNumber(min, max) {
    return ((Math.random() * (max - min))+min)|0;
}
function emit(message, data) {
    io.sockets.in(thisGameId).emit(message, data);
}