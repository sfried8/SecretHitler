"use strict";
let io;
let gameSocket;
const models_1 = require("./models");
const Enums_1 = require("./Enums");
const Rand = require("./Rand");
const Policy_1 = require("./Policy");
const Player_1 = require("./Player");
/**
 * This function is called by index.js to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
function initGame(sio, socket) {
    io = sio;
    gameSocket = socket;
    gameSocket.emit("connected", { message: "You are connected!" });
    // Host Events
    gameSocket.on("hostCreateNewGame", hostCreateNewGame);
    gameSocket.on("hostRoomFull", hostPrepareGame);
    gameSocket.on("hostCountdownFinished", hostStartGame);
    // Player Events
    gameSocket.on("rejoinGame", playerRejoinGame);
    gameSocket.on("playerJoinGame", playerJoinGame);
    gameSocket.on("VIPStart", onVIPStart);
    gameSocket.on("presidentNominate", onPresidentNominate);
    gameSocket.on("voteForChancellor", onVoteForChancellor);
    gameSocket.on("choosePresidentPolicies", onChoosePresidentPolicies);
    gameSocket.on("chooseChancellorPolicy", onChooseChancellorPolicy);
    gameSocket.on("chooseEATarget", onChooseEATarget);
    gameSocket.on("chancellorRequestedVeto", onChancellorRequestedVeto);
    gameSocket.on("vetoApproved", onVetoApproved);
    gameSocket.on("isGameStillGoing", isGameStillGoing);
}
function onVIPStart() {
    let tempPlayerArray = Rand.Shuffle(gameData.players.slice());
    gameData.gameRules = Enums_1.Setups[gameData.players.length];
    tempPlayerArray.splice(0, gameData.gameRules.Fascists).map(p => {
        p.role = Enums_1.Role.Fascist;
        gameData.fascists.push(p);
    });
    tempPlayerArray.splice(0, gameData.gameRules.Liberals).map(p => {
        p.role = Enums_1.Role.Liberal;
        gameData.liberals.push(p);
    });
    tempPlayerArray[0].role = Enums_1.Role.Hitler;
    gameData.hitler = tempPlayerArray[0];
    gameData.policyDeck = new Policy_1.PolicyDeck();
    emit("beginNewGame", gameData);
    gameData.presidentIndex = -1;
    electNextPresident();
}
function electNextPresident() {
    gameData.gameState = Enums_1.GameState.PresidentNominateChancellor;
    do {
        gameData.presidentIndex =
            (gameData.presidentIndex + 1) % gameData.players.length;
        gameData.president = gameData.players[gameData.presidentIndex];
    } while (gameData.president.dead);
    gameData.lastChancellor = gameData.chancellor;
    gameData.chancellor = null;
    emit("presidentElected", gameData);
}
function specialElection(newPresident) {
    gameData.president = newPresident;
    gameData.lastChancellor = gameData.chancellor;
    gameData.chancellor = null;
    emit("presidentElected", gameData);
}
function sendPoliciesToPresident() {
    gameData.gameState = Enums_1.GameState.PresidentChoosePolicies;
    gameData.presidentPolicies = gameData.policyDeck.draw(3);
    emit("chancellorElected", gameData);
}
function onPresidentNominate(data) {
    gameData.gameState = Enums_1.GameState.VoteForChancellor;
    gameData.chancellorNominee = data.nominee;
    if (gameData.currentElection) {
        gameData.electionArchive = gameData.electionArchive || [];
        gameData.electionArchive.push(gameData.currentElection);
    }
    const numPlayersLiving = gameData.players.filter(p => !p.dead).length;
    gameData.currentElection = new models_1.Election(gameData.president, gameData.chancellor, numPlayersLiving);
    emit("chancellorNominated", gameData);
}
/**
 * Returns whether game should continue
 * i.e. "false" indicates game over
 */
function incrementChaosLevel() {
    gameData.chaosLevel += 1;
    if (gameData.chaosLevel === 3) {
        gameData.chaosLevel = 0;
        gameData.lastPolicy = gameData.policyDeck.draw(1)[0];
        if (gameData.lastPolicy.isLiberal) {
            if (!gameData.enactedPolicies.liberals) {
                gameData.enactedPolicies.liberals = 0;
            }
            gameData.enactedPolicies.liberals += 1;
        }
        else {
            if (!gameData.enactedPolicies.fascists) {
                gameData.enactedPolicies.fascists = 0;
            }
            gameData.enactedPolicies.fascists += 1;
        }
        emit("policyPlayedByCountry", gameData);
        if (gameData.enactedPolicies.fascists > 5) {
            gameData.gameOverReason = Enums_1.WinCondition.SixFascistPolicies;
            emit("gameOver", gameData);
            return false;
        }
        else if (gameData.enactedPolicies.liberals > 5) {
            gameData.gameOverReason = Enums_1.WinCondition.SixLiberalPolicies;
            emit("gameOver", gameData);
            return false;
        }
    }
    return true;
}
function onVoteForChancellor(data) {
    gameData.currentElection.vote(data);
    emit("playerVoted", data);
    if (gameData.currentElection.isFinished()) {
        if (gameData.currentElection.didPass()) {
            gameData.chancellor = gameData.chancellorNominee;
            emit("voteFinished", gameData);
            if (gameData.enactedPolicies.fascists >= 3 &&
                gameData.chancellor.role === Enums_1.Role.Hitler) {
                gameData.gameOverReason = Enums_1.WinCondition.HitlerIsChancellor;
                emit("gameOver", gameData);
            }
            else {
                sendPoliciesToPresident();
            }
        }
        else {
            emit("voteFinished", gameData);
            if (incrementChaosLevel()) {
                electNextPresident();
            }
        }
    }
}
function onChoosePresidentPolicies(data) {
    gameData.gameState = Enums_1.GameState.ChancellorChoosePolicy;
    gameData.chancellorPolicies = data.policies;
    emit("presidentPolicyChosen", gameData);
}
function executiveActionTriggered() {
    if (gameData.lastPolicy.isLiberal) {
        return Enums_1.Executive_Action.NoAction;
    }
    let action = gameData.gameRules.board[gameData.enactedPolicies.fascists - 1];
    if (action === Enums_1.Executive_Action.PolicyPeek &&
        gameData.policyDeck.deck.length < 3) {
        gameData.policyDeck.shuffleDeck();
    }
    return action;
}
function onChancellorRequestedVeto() {
    gameData.gameState = Enums_1.GameState.ChancellorRequestVeto;
    emit("vetoRequested", gameData);
}
function onVetoApproved(data) {
    if (data.approved) {
        emit("vetoWasApproved", gameData);
        if (incrementChaosLevel()) {
            electNextPresident();
        }
    }
    else {
        gameData.gameState = Enums_1.GameState.ChancellorChoosePolicy;
        emit("vetoWasRejected", gameData);
    }
}
function onChooseChancellorPolicy(data) {
    gameData.lastPolicy = data.policies[0];
    if (gameData.lastPolicy.isLiberal) {
        if (!gameData.enactedPolicies.liberals) {
            gameData.enactedPolicies.liberals = 0;
        }
        gameData.enactedPolicies.liberals += 1;
    }
    else {
        if (!gameData.enactedPolicies.fascists) {
            gameData.enactedPolicies.fascists = 0;
        }
        gameData.enactedPolicies.fascists += 1;
    }
    gameData.chaosLevel = 0;
    emit("policyPlayed", gameData);
    if (gameData.enactedPolicies.fascists > 5) {
        gameData.gameOverReason = Enums_1.WinCondition.SixFascistPolicies;
        emit("gameOver", gameData);
    }
    else if (gameData.enactedPolicies.liberals > 5) {
        gameData.gameOverReason = Enums_1.WinCondition.SixLiberalPolicies;
        emit("gameOver", gameData);
    }
    else {
        performEA();
    }
}
function performEA() {
    gameData.lastExecutiveAction = executiveActionTriggered();
    if (gameData.lastExecutiveAction === Enums_1.Executive_Action.NoAction) {
        electNextPresident();
    }
    else {
        gameData.gameState = Enums_1.GameState.PresidentChooseExecutiveActionTarget;
        emit("executiveActionTriggered", gameData);
    }
}
function onChooseEATarget(data) {
    if (data) {
        gameData.lastExecutiveActionTarget = data.target;
    }
    else {
        gameData.lastExecutiveActionTarget = null;
    }
    emit("EATargetChosen", gameData);
    switch (gameData.lastExecutiveAction) {
        case Enums_1.Executive_Action.InvestigateLoyalty:
        case Enums_1.Executive_Action.PolicyPeek:
            electNextPresident();
            break;
        case Enums_1.Executive_Action.Execution:
            let target = getPlayerById(data.target.id);
            target.dead = true;
            if (target.role === Enums_1.Role.Hitler) {
                gameData.gameOverReason = Enums_1.WinCondition.HitlerWasAssassinated;
                emit("gameOver", gameData);
            }
            else {
                electNextPresident();
            }
            break;
        case Enums_1.Executive_Action.SpecialElection:
            specialElection(getPlayerById(data.target.id));
            break;
    }
}
/**
 * The 'START' button was clicked and 'hostCreateNewGame' event occurred.
 */
function hostCreateNewGame() {
    // Create a unique Socket.IO Room
}
/*
 * Two players have joined. Alert the host!
 * @param gameId The game ID / room ID
 */
function hostPrepareGame(gameId) {
    let sock = this;
    let data = {
        mySocketId: sock.id,
        gameId: gameId
    };
    //console.log("All Players Present. Preparing game...");
    io.sockets.in(data.gameId).emit("beginNewGame", data);
}
/*
 * The Countdown has finished, and the game begins!
 * @param gameId The game ID / room ID
 */
function hostStartGame() { }
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
    chaosLevel: 0,
    gameState: Enums_1.GameState.Idle
};
function getPlayerById(id) {
    return gameData.players.filter(p => p.id === id)[0];
}
/******************************
 *                           *
 *     PLAYER FUNCTIONS      *
 *                           *
 ***************************** */
function isGameStillGoing(data, callback) {
    let room = gameSocket.manager.rooms["/" + thisGameId];
    if (data && !data) {
        return;
    }
    // If the room exists...
    if (room !== undefined && gameData.gameState !== Enums_1.GameState.Idle) {
        callback(true);
        return;
    }
    callback(false);
}
let thisGameId = 0;
/**
 * A player clicked the 'START GAME' button.
 * Attempt to connect them to the room that matches
 * the gameId entered by the player.
 * @param data Contains data entered via player's input - playerName and gameId.
 */
function playerJoinGame(data) {
    let sock = this;
    if (!thisGameId) {
        thisGameId = (Math.random() * 100000) | 0;
        // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
        console.log(thisGameId);
        // Join the Room and wait for the players
        this.join(thisGameId.toString());
    }
    // Look up the room ID in the Socket.IO manager object.
    let room = gameSocket.manager.rooms["/" + thisGameId];
    // If the room exists...
    if (room !== undefined) {
        // attach the socket id to the data object.
        data.mySocketId = sock.id;
        // Join the room
        sock.join(thisGameId);
        gameData.players.push(new Player_1.Player(gameData.players.length, data.playerName, data.playerId));
        // Emit an event notifying the clients that the player has joined the room.
        emit("playerJoinedRoom", gameData);
    }
    else {
        // Otherwise, send an error message back to the player.
        this.emit("error", { message: "This room does not exist." });
    }
}
function playerRejoinGame(data) {
    let sock = this;
    // Look up the room ID in the Socket.IO manager object.
    let room = gameSocket.manager.rooms["/" + thisGameId];
    // If the room exists...
    if (room !== undefined) {
        // attach the socket id to the data object.
        data.mySocketId = sock.id;
        // Join the room
        sock.join(thisGameId);
        // Emit an event notifying the clients that the player has joined the room.
        emit("playerRejoinedRoom", gameData);
    }
    else {
        // Otherwise, send an error message back to the player.
        this.emit("error", {
            message: "This room does not exist."
        });
    }
}
function emit(message, data) {
    io.sockets.in(thisGameId).emit(message, data);
}
module.exports = { initGame: initGame };
