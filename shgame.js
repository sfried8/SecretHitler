let io;
let gameSocket;


const Setups = {
    3: {Liberals: 1, Fascists: 1, hitlerKnowsFascists: true},
    5: {Liberals: 3, Fascists: 1, hitlerKnowsFascists: true},
    6: {Liberals: 4, Fascists: 1, hitlerKnowsFascists: true},
    7: {Liberals: 4, Fascists: 2, hitlerKnowsFascists: false},
    8: {Liberals: 5, Fascists: 2, hitlerKnowsFascists: false},
    9: {Liberals: 5, Fascists: 3, hitlerKnowsFascists: false},
    10: {Liberals: 6, Fascists: 3, hitlerKnowsFascists: false}
};

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
const Executive_Action =
    {
        NoAction: 0,
        InvestigateLoyalty: 1,
        SpecialElection: 2,
        PolicyPeek: 3,
        Execution: 4
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
    gameData.players = shuffle(gameData.players);
    gameData.gameRules = Setups[gameData.players.length];
    let j = 0;
    let i;
    for (i = 0; i < gameData.gameRules.Fascists; i++) {
        gameData.players[j].role = Role.Fascist;
        gameData.fascists.push(gameData.players[j]);
        j++;
    }
    for (i = 0; i < gameData.gameRules.Liberals; i++) {
        gameData.players[j].role = Role.Liberal;
        gameData.liberals.push(gameData.players[j]);
        j++;
    }
    gameData.players[j].role = Role.Hitler;
    gameData.hitler = gameData.players[j];

    gameData.players = shuffle(gameData.players);

    emit('beginNewGame',gameData);


    gameData.presidentIndex = 0;
}

function sendPoliciesToPresident() {
    gameData.president = gameData.players[gameData.presidentIndex];
    let policies = [];
    for (i = 0; i < 3; i++) {
        policies.push((Math.random()*2)|0)
    }
    gameData.presidentPolicies = policies;
    emit('chancellorElected',gameData);
}
function onPresidentNominate(data) {
    gameData.chancellorNominee = data.nominee;
    if (gameData.currentElection) {
        gameData.electionArchive = gameData.electionArchive || [];
        gameData.electionArchive.push(gameData.currentElection)
    }
    gameData.currentElection = new Election(gameData.president,gameData.chancellor)
    emit('chancellorNominated',gameData);
}
function onVoteForChancellor(data) {

    gameData.currentElection.vote(data);
    emit('playerVoted',data);
    if (gameData.currentElection.isFinished()) {
        emit('voteFinished',gameData);
        if (gameData.currentElection.didPass()) {
            gameData.lastChancellor = gameData.chancellor;
            gameData.chancellor = gameData.chancellorNominee;
            if (gameData.enactedPolicies.fascists >= 3 && gameData.chancellor.role === Role.Hitler) {
                emit('gameOver',gameData);
            } else {
                sendPoliciesToPresident();
            }
        } else {
            gameData.chaosLevel += 1;
            //TODO if chaosLevel == 3
            gameData.presidentIndex = (gameData.presidentIndex + 1) % gameData.players.length;
            sendPoliciesToPresident();
        }
    }
}
function onChoosePresidentPolicies(data) {
    gameData.chancellorPolicies = data.policies;
    emit('presidentPolicyChosen',gameData);
}

function executiveActionTriggered() {
    return Executive_Action.NoAction;
}
function onChooseChancellorPolicy(data) {
    gameData.lastPolicy = data.policies[0];
    emit('policyPlayed',gameData);
    if (gameData.enactedPolicies.fascists > 5 || gameData.enactedPolicies.liberals > 5) {
        emit('gameOver',gameData);
    } else if (executiveActionTriggered() !== Executive_Action.NoAction){
        //TODO
    } else {
        gameData.presidentIndex = (gameData.presidentIndex + 1) % gameData.players.length;
        sendPoliciesToPresident();
    }
}
function onChooseEATarget(data) {

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