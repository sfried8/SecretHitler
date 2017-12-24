let io: any;
let gameSocket: any;

// const models = require("./built/models.js");
import { Election } from "./models";
import { Executive_Action, WinCondition, Role, Setups } from "./Enums";
import * as Rand from "./Rand";
import { Policy, PolicyDeck } from "./Policy";

// const Election = models.Election;
import { Player } from "./Player";
import { GameData } from "./gameData";
/**
 * This function is called by index.js to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
function initGame(sio: any, socket: any) {
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
export = { initGame: initGame };
function onVIPStart() {
    let tempPlayerArray = Rand.Shuffle(gameData.players.slice());
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

    emit("beginNewGame", gameData);

    gameData.presidentIndex = -1;
    electNextPresident();
}

function electNextPresident() {
    do {
        gameData.presidentIndex =
            (gameData.presidentIndex + 1) % gameData.players.length;
        gameData.president = gameData.players[gameData.presidentIndex];
    } while (gameData.president.dead);
    gameData.lastChancellor = gameData.chancellor;
    emit("presidentElected", gameData);
}
function specialElection(newPresident: Player) {
    gameData.president = newPresident;
    gameData.lastChancellor = gameData.chancellor;
    emit("presidentElected", gameData);
}
function sendPoliciesToPresident() {
    gameData.presidentPolicies = gameData.policyDeck.draw(3);
    emit("chancellorElected", gameData);
}
function onPresidentNominate(data: any) {
    gameData.chancellorNominee = data.nominee;
    if (gameData.currentElection) {
        gameData.electionArchive = gameData.electionArchive || [];
        gameData.electionArchive.push(gameData.currentElection);
    }
    let numPlayersLiving = 0;
    for (let i = 0; i < gameData.players.length; i++) {
        if (!gameData.players[i].dead) {
            numPlayersLiving++;
        }
    }
    gameData.currentElection = new Election(
        gameData.president,
        gameData.chancellor,
        numPlayersLiving
    );
    emit("chancellorNominated", gameData);
}
function onVoteForChancellor(data: any) {
    gameData.currentElection.vote(data);
    emit("playerVoted", data);
    if (gameData.currentElection.isFinished()) {
        if (gameData.currentElection.didPass()) {
            gameData.chancellor = gameData.chancellorNominee;
            emit("voteFinished", gameData);
            if (
                gameData.enactedPolicies.fascists >= 3 &&
                gameData.chancellor.role === Role.Hitler
            ) {
                gameData.gameOverReason = WinCondition.HitlerIsChancellor;
                emit("gameOver", gameData);
            } else {
                sendPoliciesToPresident();
            }
        } else {
            gameData.chaosLevel += 1;
            emit("voteFinished", gameData);
            if (gameData.chaosLevel === 3) {
                gameData.chaosLevel = 0;
                gameData.lastPolicy = gameData.policyDeck.draw(1)[0];
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
                emit("policyPlayedByCountry", gameData);
                if (gameData.enactedPolicies.fascists > 5) {
                    gameData.gameOverReason = WinCondition.SixFascistPolicies;
                    emit("gameOver", gameData);
                } else if (gameData.enactedPolicies.liberals > 5) {
                    gameData.gameOverReason = WinCondition.SixLiberalPolicies;
                    emit("gameOver", gameData);
                }
            }
            electNextPresident();
        }
    }
}
function onChoosePresidentPolicies(data: any) {
    gameData.chancellorPolicies = data.policies;
    emit("presidentPolicyChosen", gameData);
}

function executiveActionTriggered() {
    if (gameData.lastPolicy.isLiberal) {
        return Executive_Action.NoAction;
    }
    let action =
        gameData.gameRules.board[gameData.enactedPolicies.fascists - 1];
    if (
        action === Executive_Action.PolicyPeek &&
        gameData.policyDeck.deck.length < 3
    ) {
        gameData.policyDeck.shuffleDeck();
    }
    return action;
}
function onChancellorRequestedVeto() {
    emit("vetoRequested", gameData);
}
function onVetoApproved(data: any) {
    if (data.approved) {
        gameData.chaosLevel += 1;
        emit("vetoWasApproved", gameData);
        if (gameData.chaosLevel === 3) {
            gameData.chaosLevel = 0;
            gameData.lastPolicy = gameData.policyDeck.draw(1)[0];
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
            emit("policyPlayedByCountry", gameData);
            if (gameData.enactedPolicies.fascists > 5) {
                gameData.gameOverReason = WinCondition.SixFascistPolicies;
                emit("gameOver", gameData);
            } else if (gameData.enactedPolicies.liberals > 5) {
                gameData.gameOverReason = WinCondition.SixLiberalPolicies;
                emit("gameOver", gameData);
            }
        }
        electNextPresident();
    } else {
        emit("vetoWasRejected", gameData);
    }
}
function onChooseChancellorPolicy(data: any) {
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
    gameData.chaosLevel = 0;
    emit("policyPlayed", gameData);
    if (gameData.enactedPolicies.fascists > 5) {
        gameData.gameOverReason = WinCondition.SixFascistPolicies;
        emit("gameOver", gameData);
    } else if (gameData.enactedPolicies.liberals > 5) {
        gameData.gameOverReason = WinCondition.SixLiberalPolicies;
        emit("gameOver", gameData);
    } else {
        performEA();
    }
}

function performEA() {
    gameData.lastExecutiveAction = executiveActionTriggered();

    if (gameData.lastExecutiveAction === Executive_Action.NoAction) {
        electNextPresident();
    } else {
        emit("executiveActionTriggered", gameData);
    }
}

function onChooseEATarget(data: any) {
    if (data) {
        gameData.lastExecutiveActionTarget = data.target;
    } else {
        gameData.lastExecutiveActionTarget = null;
    }
    emit("EATargetChosen", gameData);
    switch (gameData.lastExecutiveAction) {
        case Executive_Action.InvestigateLoyalty:
        case Executive_Action.PolicyPeek:
            electNextPresident();
            break;
        case Executive_Action.Execution:
            let target = getPlayerById(data.target.id);
            target.dead = true;
            if (target.role === Role.Hitler) {
                gameData.gameOverReason = WinCondition.HitlerWasAssassinated;
                emit("gameOver", gameData);
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
function hostCreateNewGame() {
    // Create a unique Socket.IO Room
}

/*
 * Two players have joined. Alert the host!
 * @param gameId The game ID / room ID
 */
function hostPrepareGame(gameId: number) {
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
function hostStartGame() {}

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
} as GameData;
function getPlayerById(id: number): Player {
    for (let i = 0; i < gameData.players.length; i++) {
        if (gameData.players[i].id === id) {
            return gameData.players[i];
        }
    }
    return null;
}
/******************************
 *                           *
 *     PLAYER FUNCTIONS      *
 *                           *
 ***************************** */

function isGameStillGoing(data: any, callback: any) {
    let room = gameSocket.manager.rooms["/" + thisGameId];

    // If the room exists...
    if (room !== undefined) {
        callback(true);
        return;
    }
    callback(false);
}
let thisGameId: number = 0;
/**
 * A player clicked the 'START GAME' button.
 * Attempt to connect them to the room that matches
 * the gameId entered by the player.
 * @param data Contains data entered via player's input - playerName and gameId.
 */
function playerJoinGame(data: any) {
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

        gameData.players.push(
            new Player(gameData.players.length, data.playerName, data.playerId)
        );
        // Emit an event notifying the clients that the player has joined the room.
        emit("playerJoinedRoom", gameData);
    } else {
        // Otherwise, send an error message back to the player.
        this.emit("error", { message: "This room does not exist." });
    }
}
function playerRejoinGame(data: any) {
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
    } else {
        // Otherwise, send an error message back to the player.
        this.emit("error", {
            message: "This room does not exist."
        });
    }
}
/*
 * Javascript implementation of Fisher-Yates shuffle algorithm
 * http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
 */

function emit(message: string, data: any) {
    io.sockets.in(thisGameId).emit(message, data);
}
