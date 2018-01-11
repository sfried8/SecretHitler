declare const io: any;
const DEBUG = false;
const autoJoin = false;
import { WinCondition, Executive_Action, Role, GameState } from "./Enums";
import * as Rand from "./Rand";

import { Policy, PolicyDeck } from "./Policy";

import { Election } from "./models";

import Vue from "vue";
import { BoardSpaceComponent, ElectionTracker } from "./BoardSpaceComponent";
import { MessageBox, Button, Toast, Popup } from "mint-ui";
import { PolicyBtn, PolicyChoiceGroup } from "./PolicyBtnComponent";
import { PlayerBtn, PlayerBtnGroup } from "./PlayerBtnComponent";
import "mint-ui/lib/style.css";
Vue.component("board-space", BoardSpaceComponent);
Vue.component("policy-btngroup", PolicyChoiceGroup);
Vue.component("policy-btn", PolicyBtn);
Vue.component("player-btn", PlayerBtn);
Vue.component("player-btngroup", PlayerBtnGroup);

Vue.component(Button.name, Button);
Vue.component(Popup.name, Popup);
Vue.component("election-tracker", ElectionTracker);
import { Player } from "./Player";
import * as Cookies from "js-cookie";
import { GameData } from "./gameData";

function convertGameDataToClass(gameData: GameData) {
    if (gameData.electionArchive) {
        gameData.electionArchive = gameData.electionArchive.map(e =>
            new Election().cloneOf(e)
        );
    }
    if (gameData.currentElection) {
        gameData.currentElection = new Election().cloneOf(
            gameData.currentElection
        );
    }
    if (gameData.policyDeck) {
        gameData.policyDeck = new PolicyDeck(gameData.policyDeck);
    }
    if (gameData.presidentPolicies) {
        gameData.presidentPolicies = gameData.presidentPolicies.map(
            x => new Policy(x.isLiberal)
        );
    }
    if (gameData.chancellorPolicies) {
        gameData.chancellorPolicies = gameData.chancellorPolicies.map(
            x => new Policy(x.isLiberal)
        );
    }
    if (gameData.lastPolicy) {
        gameData.lastPolicy = new Policy(gameData.lastPolicy.isLiberal);
    }
    vm.president = gameData.president;
    vm.chancellor = gameData.chancellor;
    vm.lastChancellor = gameData.lastChancellor;
    vm.players = gameData.players;
    vm.chaosLevel = gameData.chaosLevel;
    vm.enactedPolicies = gameData.enactedPolicies;
    vm.gameState = gameData.gameState;
    vm.lastExecutiveAction = gameData.lastExecutiveAction;
    vm.electionArchive = gameData.electionArchive;
}
const getName = (x: Player) => x.name;
/**
 * All the code relevant to Socket.IO is collected in the IO namespace.
 *
 * @type {{init: init, bindEvents: bindEvents, onPresidentElected: onPresidentElected, onChancellorNominated: onChancellorNominated, onChancellorElected: onChancellorElected, onPresidentPolicyChosen: onPresidentPolicyChosen, onExecutiveActionTriggered: onExecutiveActionTriggered, onPlayerVoted: onPlayerVoted, onVoteFinished: onVoteFinished, onPolicyPlayed: onPolicyPlayed, onConnected: onConnected, onNewGameCreated: onNewGameCreated, playerJoinedRoom: playerJoinedRoom, beginNewGame: beginNewGame, gameOver: gameOver, error: error}}
 */
const IO = {
    socket: <any>null,
    /**
     * This is called when the page is displayed. It connects the Socket.IO client
     * to the Socket.IO server
     */
    init: function() {
        IO.socket = io.connect();
        IO.bindEvents();
    },

    /**
     * While connected, Socket.IO will listen to the following events emitted
     * by the Socket.IO server, then run the appropriate function.
     */
    bindEvents: function() {
        IO.socket.on("playerJoinedRoom", IO.playerJoinedRoom);
        IO.socket.on("playerRejoinedRoom", IO.playerRejoinedRoom);
        IO.socket.on("beginNewGame", IO.beginNewGame);
        IO.socket.on("gameOver", IO.gameOver);
        IO.socket.on("error", IO.error);

        IO.socket.on("presidentElected", IO.onPresidentElected);
        IO.socket.on("chancellorNominated", IO.onChancellorNominated);
        IO.socket.on("chancellorElected", IO.onChancellorElected);
        IO.socket.on("presidentPolicyChosen", IO.onPresidentPolicyChosen);
        IO.socket.on("executiveActionTriggered", IO.onExecutiveActionTriggered);
        IO.socket.on("EATargetChosen", IO.onExecutiveActionTargetChosen);
        IO.socket.on("playerVoted", IO.onPlayerVoted);
        IO.socket.on("voteFinished", IO.onVoteFinished);
        IO.socket.on("policyPlayed", IO.onPolicyPlayed);
        IO.socket.on("policyPlayedByCountry", IO.onPolicyPlayedByCountry);
        IO.socket.on("vetoRequested", IO.onVetoRequested);

        IO.socket.on("vetoWasApproved", IO.onVetoWasApproved);
        IO.socket.on("vetoWasRejected", IO.onVetoWasRejected);
    },

    onPresidentElected: function(data: GameData) {
        convertGameDataToClass(data);
        if (App.amIThePresident()) {
            App.President.onPresidentElected();
        } else {
            App.Player.onPresidentElected();
        }
    },
    onChancellorNominated: function(data: GameData) {
        convertGameDataToClass(data);
        App.Player.onChancellorNominated();
    },
    onChancellorElected: function(data: GameData) {
        convertGameDataToClass(data);
        if (App.amIThePresident()) {
            App.President.onChancellorElected();
        } else {
            App.Player.onChancellorElected();
        }
    },
    onPresidentPolicyChosen: function(data: GameData) {
        convertGameDataToClass(data);
        if (App.amITheChancellor()) {
            App.Chancellor.onPresidentPolicyChosen();
        } else {
            App.Player.onPresidentPolicyChosen();
        }
    },
    onVetoRequested: function() {
        if (App.amIThePresident()) {
            App.President.onVetoRequested();
        } else {
            App.Player.onVetoRequested();
        }
    },
    onVetoWasApproved: function(data: GameData) {
        convertGameDataToClass(data);
        App.Player.onVetoWasApproved();
    },
    onVetoWasRejected: function(data: GameData) {
        convertGameDataToClass(data);
        App.Player.onVetoWasRejected();
    },
    onExecutiveActionTriggered: function(data: GameData) {
        convertGameDataToClass(data);
        if (App.amIThePresident()) {
            App.President.onExecutiveActionTriggered();
        } else {
            App.Player.onExecutiveActionTriggered();
        }
    },
    onPlayerVoted: function(data: GameData) {
        App.Player.onPlayerVoted(data);
    },
    onExecutiveActionTargetChosen: function(data: GameData) {
        convertGameDataToClass(data);
        App.Player.onExecutiveActionTargetChosen();
    },
    onVoteFinished: function(data: GameData) {
        convertGameDataToClass(data);
        App.Player.onVoteFinished();
    },
    onPolicyPlayed: function(data: GameData) {
        convertGameDataToClass(data);
        App.Player.onPolicyPlayed();
    },
    onPolicyPlayedByCountry: function(data: GameData) {
        convertGameDataToClass(data);
        App.Player.onPolicyPlayedByCountry();
    },

    /**
     * A player has successfully joined the game.
     * @param data {{playerName: string, gameId: int, mySocketId: int}}
     */
    playerJoinedRoom: function(data: GameData) {
        convertGameDataToClass(data);
        App.Player.playerJoinedRoom();
    },
    playerRejoinedRoom: function(data: GameData) {
        convertGameDataToClass(data);
        document.getElementById("startGameBtn").style.display = "none";
        vm.showBoard = true;
        vm.players.map(
            (p: Player) => (vm.roles = `${vm.roles}<br>${p.name} is ${p.role}`)
        );
        vm.whoAmI();
        if (App.amIThePresident()) {
            App.President.rejoinGame();
        } else if (App.amITheChancellor()) {
            App.Chancellor.rejoinGame();
        } else {
            App.Player.rejoinGame();
        }
    },

    beginNewGame: function(data: GameData) {
        convertGameDataToClass(data);
        App.Player.beginNewGame();
    },

    /**
     * Let everyone know the game has ended.
     * @param data
     */
    gameOver: function(data: any) {
        App.Player.gameOver(data);
    },

    /**
     * An error has occurred.
     * @param data
     */
    error: function(data: any) {
        alert("Error: " + data.message);
    }
};

const App = {
    /**
     * Keep track of the gameId, which is identical to the ID
     * of the Socket.IO Room used for the players and host to communicate
     *
     */
    gameId: 0,

    // gameData: {
    //     players: [],
    //     liberals: [],
    //     fascists: [],
    //     hitler: null,
    //     president: null,
    //     chancellor: null,
    //     lastChancellor: null,
    //     chancellorNominee: null,
    //     gameRules: {},
    //     enactedPolicies: {},
    //     chaosLevel: 0
    // } as GameData,

    amIThePresident: function() {
        return vm.president && vm.president.id === vm.myPlayerId;
    },
    amITheChancellor: function() {
        return vm.chancellor && vm.chancellor.id === vm.myPlayerId;
    },
    /**
     * This runs when the page initially loads.
     */
    init: function() {
        App.showInitScreen();
        App.bindEvents();
    },

    /**
     * Create some click handlers for the various buttons that appear on-screen.
     */

    bindEvents: function() {
        // Host
        document.getElementById("startGameBtn").onclick = App.Player.onVIPStart;

        // Player
        document.getElementById("btnJoinGame").onclick = App.Player.onJoinClick;
        document.getElementById("btnStart").onclick =
            App.Player.onPlayerStartClick;
    },

    /**************************************
     *             Game Logic              *
     * *********************************** */

    /**
     * Show the initial Secret Hitler Title Screen
     * (with Start and Join buttons)
     */
    showInitScreen: function() {
        App.$templateIntroScreen.style.display = "";
    },

    /******************************
     *        PLAYER CODE        *
     ***************************** */

    Player: {
        /**
         * The player's name entered on the 'Join' screen.
         */
        myName: "",

        /**
         * Click handler for the 'JOIN' button
         */
        onJoinClick: function() {
            // console.log('Clicked "Join A Game"');

            // Display the Join Game HTML on the player's screen.
            App.$templateIntroScreen.style.display = "none";
            App.$templateJoinGame.style.display = "";
        },

        /**
         * The player entered their name and gameId (hopefully)
         * and clicked Start.
         */
        onPlayerStartClick: function() {
            // console.log('Player clicked "Start"');
            vm.myPlayerId = (Math.random() * 100000) | 0;
            vm.myPlayerId = vm.myPlayerId;

            // collect data to send to the server
            const data = {
                playerName: vm.yourName || Rand.randomName(),
                playerId: vm.myPlayerId
            };

            // Send the gameId and playerName to the server
            IO.socket.emit("playerJoinGame", data);
            App.Player.joinGame(data);
            if (vm.CPU2) {
                for (let index = 0; index < 4; index++) {
                    IO.socket.emit("playerJoinGame", {
                        playerName: Rand.randomName(),
                        playerId: Rand.Range(0, 100000)
                    });
                }
            }
        },
        joinGame: function(data: any) {
            Cookies.set("existingGameInfo", {
                gameId: App.gameId,
                playerId: vm.myPlayerId,
                playerName: data.playerName
            });
            // Set the appropriate properties for the current player.
            App.Player.myName = data.playerName;
            document.title = data.playerName;
            App.$templateJoinGame.style.display = "none";
        },
        rejoinGame: function() {
            if (vm.gameState === GameState.PresidentNominateChancellor) {
                App.Player.onPresidentElected();
            } else if (vm.gameState === GameState.PresidentChoosePolicies) {
                App.Player.onChancellorElected();
            } else if (vm.gameState === GameState.ChancellorRequestVeto) {
                App.Player.onVetoRequested();
            } else if (
                vm.gameState === GameState.PresidentChooseExecutiveActionTarget
            ) {
                App.Player.onExecutiveActionTriggered();
            } else if (vm.gameState === GameState.ChancellorChoosePolicy) {
                App.Player.onPresidentPolicyChosen();
            } else if (vm.gameState === GameState.VoteForChancellor) {
                if (!vm.currentElection.didPlayerVote(vm.myPlayerId)) {
                    App.Player.onChancellorNominated();
                }
            }
        },
        onVIPStart: function() {
            IO.socket.emit("VIPStart");
        },

        /**
         *  Click handler for the "Start Again" button that appears
         *  when a game is over.
         */
        onPlayerRestart: function() {
            const data = {
                gameId: App.gameId,
                playerName: App.Player.myName
            };
            IO.socket.emit("playerRestart", data);
        },

        /////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        onPresidentElected: function() {},

        onChancellorNominated: function() {
            if (App.dead) {
                return;
            }
            vm.waitingForVotes = [];
            vm.players.forEach(p => {
                if (!p.dead) {
                    vm.waitingForVotes.push(p);
                }
            });
        },
        onChancellorElected: function() {},

        onPresidentPolicyChosen: function() {},

        onVetoRequested: function() {},

        onVetoWasApproved: function() {
            log(`President ${vm.president.name} approved the veto.`);
        },
        onVetoWasRejected: function() {
            log(
                `President ${vm.president.name} rejected the veto. Chancellor ${
                    vm.chancellor.name
                } must enact a policy.`
            );
        },
        onExecutiveActionTriggered: function() {},

        onPlayerVoted: function(data: any) {
            if (DEBUG) {
                log(
                    `${App.getPlayerById(data.id).name} voted ${
                        data.vote ? "ja" : "nein"
                    }`
                );
            }
            vm.waitingForVotes = vm.waitingForVotes.filter(
                (x: Player) => x !== App.getPlayerById(data.id)
            );
        },
        onExecutiveActionTargetChosen: function() {
            switch (vm.lastExecutiveAction) {
                case Executive_Action.PolicyPeek:
                    log(
                        `President ${
                            vm.president.name
                        } peeked the next 3 policies.`
                    );
                    break;
                case Executive_Action.SpecialElection:
                    log(
                        `Special Election! ${
                            vm.lastExecutiveActionTarget.name
                        } will now be president.`
                    );
                    break;
                case Executive_Action.Execution:
                    log(
                        `President ${vm.president.name} has executed ${
                            vm.lastExecutiveActionTarget.name
                        }!`
                    );
                    break;
                case Executive_Action.InvestigateLoyalty:
                    log(
                        `President ${vm.president.name} has investigated ${
                            vm.lastExecutiveActionTarget.name
                        }'s loyalty.`
                    );
                    break;
            }
        },
        onVoteFinished: function() {
            if (vm.currentElection.didPass()) {
                log(`Vote passed! ${vm.chancellor.name} is now Chancellor.`);
            } else {
                log(`Vote failed!`);
            }
        },
        onPolicyPlayed: function() {
            log(
                `President ${vm.president.name} and Chancellor ${
                    vm.chancellor.name
                } have enacted a ${vm.lastPolicy.toString()} policy!`
            );
        },
        onPolicyPlayedByCountry: function() {
            log(
                `The country is in chaos! The people have enacted a ${vm.lastPolicy.toString()} policy!`
            );
        },
        /**
         * A player has successfully joined the game.
         * @param data {{playerName: string, gameId: int, mySocketId: int}}
         */
        playerJoinedRoom: function() {
            log(`${vm.players[vm.players.length - 1].name} joined the room!`);
        },

        beginNewGame: function() {
            vm.showBoard = true;

            vm.players.map(
                (p: Player) =>
                    (vm.roles = `${vm.roles}<br>${p.name} is ${p.role}`)
            );
        },
        whoAmI: function() {
            if (!vm.myRole) {
                const myPlayer = App.getPlayerById(vm.myPlayerId);
                if (myPlayer.role === Role.Liberal) {
                    vm.myRole =
                        "You are Liberal! Find and stop the Secret Hitler!";
                } else if (myPlayer.role === Role.Fascist) {
                    let s = "You are Fascist!";
                    const otherFascistNames = vm.fascists
                        .filter((x: Player) => x.id !== myPlayer.id)
                        .map(getName);
                    const len = otherFascistNames.length;
                    if (len === 1) {
                        s +=
                            " The other Fascist is " +
                            otherFascistNames[0] +
                            ". ";
                    } else if (len > 1) {
                        s +=
                            " The other Fascists are " +
                            prettyPrintList(otherFascistNames) +
                            ". ";
                    }
                    s += " " + vm.hitler.name + " is Secret Hitler!";
                    vm.myRole = s;
                    if (!vm.gameRules.hitlerKnowsFascists) {
                        vm.myRole +=
                            " You know who Hitler is, but Hitler does NOT know who the fascists are!";
                    }
                } else {
                    let s = "You are Secret Hitler!";
                    if (vm.gameRules.hitlerKnowsFascists) {
                        const fascistNames = vm.fascists.map(getName);
                        const len = fascistNames.length;
                        if (len === 1) {
                            s += " The Fascist is " + fascistNames[0] + ". ";
                        } else if (len > 1) {
                            s +=
                                " The Fascists are " +
                                prettyPrintList(fascistNames) +
                                ". ";
                        }
                    }
                    vm.myRole = s;
                }
            }
            vm.whoAmIVisible = true;
        },
        gameOver: function(data: GameData) {
            switch (data.gameOverReason) {
                case WinCondition.SixLiberalPolicies:
                    vm.gameOver =
                        "Liberals Win! Five Liberal Policies have been played.";

                    break;
                case WinCondition.SixFascistPolicies:
                    vm.gameOver =
                        "Fascists Win! Six Fascist Policies have been played.";

                    break;
                case WinCondition.HitlerIsChancellor:
                    vm.gameOver = `Fascists Win! Hitler (${
                        vm.hitler.name
                    }) has been elected Chancellor!`;

                    break;
                case WinCondition.HitlerWasAssassinated:
                    vm.gameOver = `Liberals Win! Hitler (${
                        vm.hitler.name
                    }) has been assassinated!`;

                    break;
            }
            alert(vm.gameOver);
        }
    },
    President: {
        onPresidentElected: function() {},
        onChancellorElected: function() {
            // vm.currentAction = "Choose a policy to discard.";
            vm.policyChoices = [];
            for (let i = 0; i < 3; i++) {
                const x = i;
                setTimeout(() => {
                    vm.policyChoices.push(vm.presidentPolicies[x]);
                }, x * 100);
            }
        },
        onVetoRequested: function() {
            IO.socket.emit("vetoApproved", {
                id: vm.myPlayerId,
                approved: confirm("Approve the veto?")
            });
        },
        onExecutiveActionTriggered: function() {
            if (vm.lastExecutiveAction === Executive_Action.PolicyPeek) {
                MessageBox({
                    title: "",
                    message:
                        "Next 3 Policies are " +
                        prettyPrintList(
                            vm.policyDeck.peek(3).map(x => x.toString())
                        ),
                    showCancelButton: false,
                    confirmButtonText: "OK"
                }).then(() => {
                    IO.socket.emit("chooseEATarget");
                });
            } else {
                vm.disablePlayerButtons = false;
            }
        },
        rejoinGame: function() {
            if (vm.gameState === GameState.PresidentNominateChancellor) {
                App.President.onPresidentElected();
            } else if (vm.gameState === GameState.PresidentChoosePolicies) {
                App.President.onChancellorElected();
            } else if (vm.gameState === GameState.ChancellorRequestVeto) {
                App.President.onVetoRequested();
            } else if (
                vm.gameState === GameState.PresidentChooseExecutiveActionTarget
            ) {
                App.President.onExecutiveActionTriggered();
            } else if (vm.gameState === GameState.ChancellorChoosePolicy) {
                App.Player.onPresidentPolicyChosen();
            } else if (vm.gameState === GameState.VoteForChancellor) {
                if (!vm.currentElection.didPlayerVote(vm.myPlayerId)) {
                    App.Player.onChancellorNominated();
                }
            }
        }
    },
    Chancellor: {
        onPresidentPolicyChosen: function() {
            // vm.currentAction = "Choose a policy to discard";
            vm.policyChoices = vm.chancellorPolicies;
        },
        rejoinGame: function() {
            if (vm.gameState === GameState.PresidentNominateChancellor) {
                App.Player.onPresidentElected();
            } else if (vm.gameState === GameState.PresidentChoosePolicies) {
                App.Player.onChancellorElected();
            } else if (vm.gameState === GameState.ChancellorRequestVeto) {
                App.Player.onVetoRequested();
            } else if (
                vm.gameState === GameState.PresidentChooseExecutiveActionTarget
            ) {
                App.Player.onExecutiveActionTriggered();
            } else if (vm.gameState === GameState.ChancellorChoosePolicy) {
                App.Chancellor.onPresidentPolicyChosen();
            } else if (vm.gameState === GameState.VoteForChancellor) {
                if (!vm.currentElection.didPlayerVote(vm.myPlayerId)) {
                    App.Player.onChancellorNominated();
                }
            }
        }
    },
    getPlayerById: function(id: number): Player {
        let ret = null;
        vm.players.forEach(function(p) {
            if (p.id === id) {
                ret = p;
            }
        });
        return ret;
    }
    /* **************************
                  UTILITY CODE
           ************************** */
};
function clickJoinButton() {
    if (autoJoin) {
        setTimeout(() => {
            document.getElementById("btnJoinGame").click();
        }, 100);
        setTimeout(() => {
            document.getElementById("btnStart").click();
        }, 200);
    }
}
window.onload = function() {
    IO.init();
    App.init();
    document.getElementById("gameBody").style.display = "";
    if (!DEBUG) {
        document.getElementById("DEBUG").style.display = "none";
    }
    if (Cookies.get("existingGameInfo")) {
        const gameInfo: any = Cookies.getJSON("existingGameInfo");
        IO.socket.emit(
            "isGameStillGoing",
            { gameId: gameInfo.gameId },
            function(response: boolean) {
                if (response) {
                    if (
                        autoJoin ||
                        confirm(
                            "Looks like you were disconnected, but the game is still going. Rejoin?"
                        )
                    ) {
                        vm.myPlayerId = gameInfo.playerId;
                        vm.myPlayerId = gameInfo.playerId;
                        App.gameId = gameInfo.gameId;
                        IO.socket.emit("rejoinGame", gameInfo);
                        App.$templateIntroScreen.style.display = "none";
                        App.Player.joinGame(gameInfo);
                    } else {
                        clickJoinButton();
                    }
                } else {
                    clickJoinButton();
                }
                // } else {
                //     Cookies.remove("existingGameInfo");
                // }
            }
        );
    } else {
        clickJoinButton();
    }
};

function log(message: string, duration?: number) {
    Toast(message);
}

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
///////////////////////Vue.js CODE///////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
const vm = new Vue({
    el: "#gameBody",
    data: {
        roles: "",
        players: [],
        policyChoices: [],
        showBoard: false,
        president: null,
        chancellor: null,
        waitingForVotes: [],
        chaosLevel: 0,
        yourName: "",
        whoAmIVisible: false,
        myRole: "",
        discardingPolicy: false,
        adminOverride: false,
        gameRules: {},
        lastExecutiveAction: Executive_Action.NoAction,
        gameState: GameState.Idle,
        enactedPolicies: {},
        electionArchive: [],
        historyVisible: false,
        playersPopupVisible: false,
        myPlayerId: -1,
        lastChancellor: null,
        gameOver: "",
        CPU2: false
    },
    computed: {
        fascists: function() {
            return this.players.filter((p: Player) => p.role === Role.Fascist);
        },
        liberals: function() {
            return this.players.filter((p: Player) => p.role === Role.Liberal);
        },
        hitler: function() {
            return this.players.filter(
                (p: Player) => p.role === Role.Hitler
            )[0];
        },
        waitingForOthers: function() {
            switch (this.gameState) {
                case GameState.PresidentNominateChancellor:
                    return this.president.id != this.myPlayerId;
                case GameState.VoteForChancellor:
                    return true;
                case GameState.ChancellorChoosePolicy:
                    return this.chancellor.id != this.myPlayerId;
                case GameState.Idle:
                    return false;
                case GameState.PresidentChooseExecutiveActionTarget:
                    return this.president.id != this.myPlayerId;
                case GameState.PresidentChoosePolicies:
                    return this.president.id != this.myPlayerId;

                default:
                    return false;
            }
        },
        showVoteButtons: function() {
            return (
                this.waitingForVotes.filter(
                    (p: Player) => p.id == this.myPlayerId
                ).length > 0
            );
        },
        gameHasStarted: function() {
            return this.gameState !== GameState.Idle;
        },
        showVetoButton: function() {
            return (
                this.chancellor &&
                this.myPlayerId == this.chancellorId &&
                this.enactedPolicies.fascists > 5
            );
        },
        showPolicyChoices: function() {
            return (
                ((this.president && this.myPlayerId == this.president.id) ||
                    (this.chancellor &&
                        this.myPlayerId == this.chancellorId)) &&
                this.policyChoices.length > 0
            );
        },
        showStartBtn: function() {
            return (
                !this.gameHasStarted &&
                (this.players &&
                    this.players.length >= 5 &&
                    this.players.length <= 10)
            );
        },
        waitingForVotesString: function() {
            const len = this.waitingForVotes.length;

            if (
                len === 0 ||
                this.waitingForVotes.filter(
                    (p: Player) => p.id === this.myPlayerId
                ).length === 1
            ) {
                return "";
            } else {
                return `Waiting for vote${
                    len > 1 ? "s" : ""
                } from ${prettyPrintList(this.waitingForVotes.map(getName))}`;
            }
        },
        electionHistory: function() {
            if (!this.electionArchive) {
                return "";
            }
            return this.electionArchive
                .map((e: Election) => {
                    return `P: ${e.president.name}, C: ${
                        e.chancellor.name
                    }, Vote ${e.didPass() ? "passed" : "failed"} ${
                        e.jas.length
                    } to ${e.neins.length}`;
                })
                .join("\n");
        },
        currentAction: function() {
            if (this.gameOver != "") {
                return this.gameOver;
            }
            switch (this.gameState) {
                case GameState.PresidentNominateChancellor:
                    if (this.president.id != this.myPlayerId) {
                        return `Waiting for President ${
                            this.president.name
                        } to nominate Chancellor`;
                    } else {
                        return "You're the president! Choose someone to nominate for chancellor.";
                    }
                case GameState.VoteForChancellor:
                    return `Vote now whether to elect ${
                        this.chancellorNominee.name
                    } as Chancellor`;
                case GameState.ChancellorChoosePolicy:
                    if (this.chancellor.id != this.myPlayerId) {
                        return `President ${
                            this.president.name
                        } has chosen 2 policies. Waiting for Chancellor ${
                            this.chancellor.name
                        } to enact one of them.`;
                    } else {
                        return `Choose a policy to enact`;
                    }
                case GameState.Idle:
                    return "";
                case GameState.PresidentChooseExecutiveActionTarget:
                    if (this.president.id != this.myPlayerId) {
                        return this.lastExecutiveAction ==
                            Executive_Action.InvestigateLoyalty
                            ? `Waiting for President ${
                                  this.president.name
                              } to investigate someone's loyalty.`
                            : this.lastExecutiveAction ==
                              Executive_Action.Execution
                              ? `Waiting for President ${
                                    this.president.name
                                } to execute someone.`
                              : this.lastExecutiveAction ==
                                Executive_Action.SpecialElection
                                ? `Waiting for President ${
                                      this.president.name
                                  } to invoke a special election.`
                                : "";
                    } else {
                        return this.lastExecutiveAction ==
                            Executive_Action.InvestigateLoyalty
                            ? "Choose someone to investigate their loyalty."
                            : this.lastExecutiveAction ==
                              Executive_Action.Execution
                              ? "Choose someone to execute."
                              : this.lastExecutiveAction ==
                                Executive_Action.SpecialElection
                                ? "Choose the president for next turn."
                                : "";
                    }
                case GameState.PresidentChoosePolicies:
                    if (this.president.id != this.myPlayerId) {
                        return `Waiting for President ${
                            this.president.name
                        } to pick policies`;
                    } else {
                        return `Choose 2 policies to pass to Chancellor ${
                            this.chancellor.name
                        }.`;
                    }

                default:
                    return "";
            }
        }
    },
    methods: {
        voteButtonClick: function(vote: boolean) {
            IO.socket.emit("voteForChancellor", {
                id: this.myPlayerId,
                vote: vote
            });
        },
        playerButtonClick: function(id: string | number) {
            let selectedPlayer = App.getPlayerById(+id);
            if (selectedPlayer.dead) {
                log(`${selectedPlayer.name} is dead!`);
            }
            if (this.gameState === GameState.PresidentNominateChancellor) {
                if (
                    this.lastChancellor &&
                    selectedPlayer.id === this.lastChancellor.id
                ) {
                    alert("can't be chancellor twice in a row");
                } else {
                    IO.socket.emit("presidentNominate", {
                        nominee: selectedPlayer
                    });
                    this.disablePlayerButtons = true;
                }
            } else if (
                this.gameState ===
                GameState.PresidentChooseExecutiveActionTarget
            ) {
                if (
                    this.lastExecutiveAction ===
                    Executive_Action.InvestigateLoyalty
                ) {
                    let loyalty = selectedPlayer.role;
                    if (loyalty === Role.Hitler) {
                        loyalty = Role.Fascist;
                    }
                    MessageBox({
                        title: "",
                        message: `${selectedPlayer.name} is ${loyalty}!`,
                        showCancelButton: false,
                        confirmButtonText: "OK"
                    }).then(() => {
                        IO.socket.emit("chooseEATarget", {
                            target: selectedPlayer
                        });
                        this.disablePlayerButtons = true;
                    });
                } else if (
                    this.lastExecutiveAction === Executive_Action.Execution
                ) {
                    MessageBox({
                        title: "",
                        message: `Are you sure you want to execute ${
                            selectedPlayer.name
                        }?`,
                        showCancelButton: true,
                        confirmButtonText: "Yes",
                        cancelButtonText: "No"
                    }).then((action: any) => {
                        if (action != "cancel") {
                            IO.socket.emit("chooseEATarget", {
                                target: selectedPlayer
                            });
                            this.disablePlayerButtons = true;
                        }
                    });
                } else {
                    IO.socket.emit("chooseEATarget", {
                        target: selectedPlayer
                    });
                    this.disablePlayerButtons = true;
                }
            }
        },
        log: function(value: string) {
            log(value);
        },
        getPolicyClass: function(index: number) {
            if (
                vm &&
                this.presidentPolicies &&
                this.presidentPolicies[+index]
            ) {
                if (this.presidentPolicies[+index].isLiberal) {
                    return "liberalPolicy";
                } else {
                    return "fascistPolicy";
                }
            }
            return "";
        },
        policyChoiceClick: function(selected: Policy[]) {
            if (App.amIThePresident()) {
                MessageBox({
                    title: "",
                    message: `Give Chancellor ${
                        this.chancellor ? this.chancellor.name : "?"
                    } ${prettyPrintPolicies(selected)}?`,
                    showCancelButton: true,
                    confirmButtonText: "Yes",
                    cancelButtonText: "No"
                }).then((action: any) => {
                    if (action != "cancel") {
                        this.discardingPolicy = true;
                        IO.socket.emit("choosePresidentPolicies", {
                            id: this.myPlayerId,
                            policies: selected
                        });

                        this.policyChoices = selected;
                        setTimeout(() => {
                            this.discardingPolicy = false;
                            this.policyChoices = [];
                        }, 750);
                    }
                });
            } else {
                const toEnact = selected[0];
                MessageBox({
                    title: "",
                    message: `Enact a ${toEnact.toString()} Policy?`,
                    showCancelButton: true,
                    confirmButtonText: "Yes",
                    cancelButtonText: "No"
                }).then((action: any) => {
                    if (action != "cancel") {
                        this.discardingPolicy = true;
                        IO.socket.emit("chooseChancellorPolicy", {
                            id: this.myPlayerId,
                            policies: [toEnact]
                        });

                        this.policyChoices = selected;
                        setTimeout(() => {
                            this.discardingPolicy = false;
                            this.policyChoices = [];
                        }, 750);
                    }
                });
            }
        },
        vetoButtonClick: function() {
            IO.socket.emit("chancellorRequestedVeto");
        },
        whoAmI: function() {
            App.Player.whoAmI();
        },
        CPUAction: function(action: number, value: any) {
            this.adminOverride = false;
            switch (action) {
                case 0:
                    this.players.forEach((p: Player) => {
                        if (p.id != this.myPlayerId && !p.dead) {
                            let vote;
                            if (value === 0) {
                                vote = true;
                            } else if (value === 1) {
                                vote = false;
                            } else {
                                vote = Rand.Boolean(50);
                            }
                            IO.socket.emit("voteForChancellor", {
                                id: p.id,
                                vote: vote
                            });
                        }
                    });
                    break;
                case 1:
                    let toEnact = new Policy(value == 0);
                    IO.socket.emit("chooseChancellorPolicy", {
                        id: this.chancellor.id,
                        policies: [toEnact]
                    });
                    break;
                case 2:
                    let choices = [
                        new Policy(value < 2),
                        new Policy(value < 1)
                    ];
                    IO.socket.emit("choosePresidentPolicies", {
                        id: this.president.id,
                        policies: choices
                    });
                    break;
            }
        },
        admin: function(index: number) {
            switch (index) {
                case 0:
                    this.policyChoices = [];
                    staggerFunctions(
                        [false, true, false].map(p => () =>
                            this.policyChoices.push(new Policy(p))
                        ),
                        300
                    );
                    break;
            }
        }
    }
});

function prettyPrintList(listToPrint: any[]): string {
    const len = listToPrint.length;
    if (len === 0) {
        return "";
    } else if (len === 1) {
        return listToPrint[0];
    } else if (len === 2) {
        return listToPrint[0] + " and " + listToPrint[1];
    } else {
        let s = "";
        for (let i = 0; i < len - 1; i++) {
            s += listToPrint[i] + ", ";
        }
        s += "and " + listToPrint[len - 1];
        return s;
    }
}

function prettyPrintPolicies(listToPrint: Policy[]): string {
    if (listToPrint.length === 1) {
        return (
            "1 " +
            (listToPrint[0].isLiberal ? "Liberal" : "Fascist") +
            " Policy"
        );
    } else {
        const numLibs = listToPrint.filter(p => p.isLiberal).length;
        if (numLibs === listToPrint.length) {
            return numLibs + " Liberal Policies";
        } else if (numLibs === 0) {
            return listToPrint.length + " Fascist Policies";
        }
        const numFas = listToPrint.length - numLibs;
        return `${numLibs} Liberal Polic${
            numLibs === 1 ? "y" : "ies"
        } and ${numFas} Fascist Polic${numFas === 1 ? "y" : "ies"}`;
    }
}

function staggerFunctions(funcs: any[], interval?: number, done?: any) {
    interval = interval || 200;
    for (let i = 0; i < funcs.length; i++) {
        const x = i;
        setTimeout(() => {
            funcs[x]();
            if (x === funcs.length - 1 && done) {
                done();
            }
        }, x * interval);
    }
}
