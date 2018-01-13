let io: any;
let gameSocket: any;

import { Election } from "./models";
import {
    Executive_Action,
    WinCondition,
    Role,
    Setups,
    GameState
} from "./Enums";
import * as Rand from "./Rand";
import { PolicyDeck } from "./Policy";
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
    const tempPlayerArray = Rand.Shuffle(gameData.players.slice());
    gameData.gameRules = Setups[gameData.players.length];

    tempPlayerArray.splice(0, gameData.gameRules.Fascists).map(p => {
        p.role = Role.Fascist;
        gameData.fascists.push(p);
    });
    tempPlayerArray.splice(0, gameData.gameRules.Liberals).map(p => {
        p.role = Role.Liberal;
        gameData.liberals.push(p);
    });

    tempPlayerArray[0].role = Role.Hitler;
    gameData.hitler = tempPlayerArray[0];

    gameData.policyDeck = new PolicyDeck();
    emit("beginNewGame", gameData);

    gameData.presidentIndex = -1;
    electNextPresident();
}

function electNextPresident() {
    gameData.gameState = GameState.PresidentNominateChancellor;
    do {
        gameData.presidentIndex =
            (gameData.presidentIndex + 1) % gameData.players.length;
        gameData.president = gameData.players[gameData.presidentIndex];
    } while (gameData.president.dead);
    gameData.lastChancellor = gameData.chancellor;
    gameData.chancellor = null;
    emit("presidentElected", gameData);
}
function specialElection(newPresident: Player) {
    gameData.president = newPresident;
    gameData.lastChancellor = gameData.chancellor;
    gameData.chancellor = null;
    emit("presidentElected", gameData);
}
function sendPoliciesToPresident() {
    gameData.gameState = GameState.PresidentChoosePolicies;
    gameData.presidentPolicies = gameData.policyDeck.draw(3);
    emit("chancellorElected", gameData);
}
function onPresidentNominate(data: any) {
    gameData.gameState = GameState.VoteForChancellor;
    gameData.chancellorNominee = data.nominee;
    if (gameData.currentElection) {
        gameData.electionArchive = gameData.electionArchive || [];
        gameData.electionArchive.push(gameData.currentElection);
    }
    const numPlayersLiving = gameData.players.filter(p => !p.dead).length;

    gameData.currentElection = new Election(
        gameData.president,
        gameData.chancellorNominee,
        numPlayersLiving
    );
    emit("chancellorNominated", gameData);
}
/**
 * Returns whether game should continue
 * i.e. "false" indicates game over
 */
function incrementChaosLevel(): boolean {
    gameData.chaosLevel += 1;

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
            return false;
        } else if (gameData.enactedPolicies.liberals > 4) {
            gameData.gameOverReason = WinCondition.SixLiberalPolicies;
            emit("gameOver", gameData);
            return false;
        }
    }
    return true;
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
            emit("voteFinished", gameData);
            if (incrementChaosLevel()) {
                electNextPresident();
            }
        }
    }
}
function onChoosePresidentPolicies(data: any) {
    gameData.gameState = GameState.ChancellorChoosePolicy;
    gameData.chancellorPolicies = data.policies;
    emit("presidentPolicyChosen", gameData);
}

function executiveActionTriggered() {
    if (gameData.lastPolicy.isLiberal) {
        return Executive_Action.NoAction;
    }
    const action =
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
    gameData.gameState = GameState.ChancellorRequestVeto;
    emit("vetoRequested", gameData);
}
function onVetoApproved(data: any) {
    if (data.approved) {
        emit("vetoWasApproved", gameData);
        if (incrementChaosLevel()) {
            electNextPresident();
        }
    } else {
        gameData.gameState = GameState.ChancellorChoosePolicy;
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
    } else if (gameData.enactedPolicies.liberals > 4) {
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
        gameData.gameState = GameState.PresidentChooseExecutiveActionTarget;
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
            const target = getPlayerById(data.target.id);
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

const gameData = {
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
    gameState: GameState.Idle
} as GameData;

function getPlayerById(id: number): Player {
    return gameData.players.filter(p => p.id === id)[0];
}
/******************************
 *                           *
 *     PLAYER FUNCTIONS      *
 *                           *
 ***************************** */

function isGameStillGoing(data: any, callback: any) {
    const room = gameSocket.manager.rooms["/" + thisGameId];
    if (data && !data) {
        return;
    }
    // If the room exists...
    if (room !== undefined && gameData.gameState !== GameState.Idle) {
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
    const sock = this;
    if (!thisGameId) {
        thisGameId = (Math.random() * 100000) | 0;

        // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
        console.log(thisGameId);
        // Join the Room and wait for the players
        this.join(thisGameId.toString());
    }
    // Look up the room ID in the Socket.IO manager object.
    const room = gameSocket.manager.rooms["/" + thisGameId];

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
    const sock = this;

    // Look up the room ID in the Socket.IO manager object.
    const room = gameSocket.manager.rooms["/" + thisGameId];

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

function emit(message: string, data: any) {
    io.sockets.in(thisGameId).emit(message, data);
}
