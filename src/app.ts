declare const io: any;
const DEBUG = false;
const autoJoin = false;

import {
    WinCondition,
    Executive_Action,
    Role,
    GameState,
    Setup,
    Position
} from "./Enums";
import * as Rand from "./Rand";
import { Policy, PolicyDeck } from "./Policy";
import { Election } from "./models";
import Vue from "vue";
import { MessageBox, Button, Toast, Popup } from "mint-ui";
import "mint-ui/lib/style.css";
import { Player } from "./Player";
import * as Cookies from "js-cookie";
import { GameData } from "./gameData";
import VoteButton from "./components/VoteButton.vue";
import PlayerBtn from "./components/PlayerBtn.vue";
import BoardSpace from "./components/BoardSpace.vue";
import ElectionTracker from "./components/ElectionTracker.vue";
import PolicyBtn from "./components/PolicyBtn.vue";
import PolicyChoiceGroup from "./components/PolicyChoiceGroup.vue";
import PlayerBtnGroup from "./components/PlayerBtnGroup.vue";

Vue.component("board-space", BoardSpace);
Vue.component("policy-btngroup", PolicyChoiceGroup);
Vue.component("policy-btn", PolicyBtn);
Vue.component("player-btn", PlayerBtn);
Vue.component("player-btngroup", PlayerBtnGroup);
Vue.component(Button.name, Button);
Vue.component(Popup.name, Popup);
Vue.component("election-tracker", ElectionTracker);
Vue.component("vote-btn", VoteButton);

function convertGameDataToClass(gameData: GameData) {
    if (gameData.electionArchive) {
        vm.electionArchive = gameData.electionArchive.map(e =>
            new Election().cloneOf(e)
        );
    }
    if (gameData.currentElection) {
        vm.currentElection = new Election().cloneOf(gameData.currentElection);
    }
    if (gameData.policyDeck) {
        vm.policyDeck = new PolicyDeck(gameData.policyDeck);
    }
    if (gameData.presidentPolicies) {
        vm.presidentPolicies = gameData.presidentPolicies.map(
            x => new Policy(x.isLiberal)
        );
    }
    if (gameData.chancellorPolicies) {
        vm.chancellorPolicies = gameData.chancellorPolicies.map(
            x => new Policy(x.isLiberal)
        );
    }
    if (gameData.lastPolicy) {
        vm.lastPolicy = new Policy(gameData.lastPolicy.isLiberal);
    }
    vm.gameRules = gameData.gameRules;
    vm.president = gameData.president;
    vm.chancellor = gameData.chancellor;
    vm.chancellorNominee = gameData.chancellorNominee;
    vm.lastChancellor = gameData.lastChancellor;
    vm.players = gameData.players;
    vm.chaosLevel = gameData.chaosLevel;
    vm.enactedPolicies = gameData.enactedPolicies;
    vm.gameState = gameData.gameState;
    vm.lastExecutiveAction = gameData.lastExecutiveAction;
    vm.lastExecutiveActionTarget = gameData.lastExecutiveActionTarget;
}
const getName = (x: Player) => x.name;

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
        //IO events
        IO.socket.on("playerJoinedRoom", IO.playerJoinedRoom);
        IO.socket.on("playerRejoinedRoom", IO.playerRejoinedRoom);
        IO.socket.on("beginNewGame", IO.beginNewGame);
        IO.socket.on("gameOver", IO.gameOver);
        IO.socket.on("error", IO.error);

        //In-Game events
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
        GameEvents.getGameFunction("onPresidentElected");
    },
    onChancellorNominated: function(data: GameData) {
        convertGameDataToClass(data);
        GameEvents.getGameFunction("onChancellorNominated");
    },
    onChancellorElected: function(data: GameData) {
        convertGameDataToClass(data);
        GameEvents.getGameFunction("onChancellorElected");
    },
    onPresidentPolicyChosen: function(data: GameData) {
        convertGameDataToClass(data);
        GameEvents.getGameFunction("onPresidentPolicyChosen");
    },
    onVetoRequested: function() {
        GameEvents.getGameFunction("onVetoRequested");
    },
    onVetoWasApproved: function(data: GameData) {
        convertGameDataToClass(data);
        GameEvents.getGameFunction("onVetoWasApproved");
    },
    onVetoWasRejected: function(data: GameData) {
        convertGameDataToClass(data);
        GameEvents.getGameFunction("onVetoWasRejected");
    },
    onExecutiveActionTriggered: function(data: GameData) {
        convertGameDataToClass(data);
        GameEvents.getGameFunction("onExecutiveActionTriggered");
    },
    onPlayerVoted: function(data: GameData) {
        GameEvents.Player.onPlayerVoted(data);
    },
    onExecutiveActionTargetChosen: function(data: GameData) {
        convertGameDataToClass(data);
        GameEvents.getGameFunction("onExecutiveActionTargetChosen");
    },
    onVoteFinished: function(data: GameData) {
        convertGameDataToClass(data);
        GameEvents.getGameFunction("onVoteFinished");
    },
    onPolicyPlayed: function(data: GameData) {
        convertGameDataToClass(data);
        GameEvents.getGameFunction("onPolicyPlayed");
    },
    onPolicyPlayedByCountry: function(data: GameData) {
        convertGameDataToClass(data);
        GameEvents.getGameFunction("onPolicyPlayedByCountry");
    },

    playerJoinedRoom: function(data: GameData) {
        convertGameDataToClass(data);
        GameEvents.getGameFunction("playerJoinedRoom");
    },
    playerRejoinedRoom: function(data: GameData) {
        convertGameDataToClass(data);
        vm.showBoard = true;

        GameEvents.getGameFunction("rejoinGame");
    },

    beginNewGame: function(data: GameData) {
        convertGameDataToClass(data);
        GameEvents.getGameFunction("beginNewGame");
    },

    /**
     * Let everyone know the game has ended.
     * @param data
     */
    gameOver: function() {
        GameEvents.getGameFunction("gameOver");
    },

    /**
     * An error has occurred.
     * @param data
     */
    error: function(data: any) {
        alert("Error: " + data.message);
    },

    joinGame: function(data: any) {
        Cookies.set("existingGameInfo", {
            gameId: GameEvents.gameId,
            playerId: vm.myPlayerId,
            playerName: data.playerName
        });
        // Set the appropriate properties for the current player.
        document.title = DEBUG ? data.playerName : "Secret Hitler";
    },

    /**
     *  Click handler for the "Start Again" button that appears
     *  when a game is over.
     */
    onPlayerRestart: function() {
        const data = {
            gameId: GameEvents.gameId,
            playerName: vm.getPlayerById(vm.myPlayerId).name
        };
        IO.socket.emit("playerRestart", data);
    }
};

const GameEvents = {
    /**
     * Keep track of the gameId, which is identical to the ID
     * of the Socket.IO Room used for the players and host to communicate
     *
     */
    gameId: 0,

    getGameFunction: function(functionName: string) {
        const func = (GameEvents as any)[vm.myPosition()][functionName];
        if (func) {
            func();
        } else {
            (GameEvents as any).Player[functionName]();
        }
    },

    Player: {
        onPresidentElected: function() {},

        onChancellorNominated: function() {
            if (vm.dead) {
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
                    `${vm.getPlayerById(data.id).name} voted ${
                        data.vote ? "ja" : "nein"
                    }`
                );
            }
            vm.waitingForVotes = vm.waitingForVotes.filter(
                (x: Player) => x.id != data.id
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
        },
        rejoinGame: function() {
            if (vm.gameState === GameState.PresidentNominateChancellor) {
                GameEvents.Player.onPresidentElected();
            } else if (vm.gameState === GameState.PresidentChoosePolicies) {
                GameEvents.Player.onChancellorElected();
            } else if (vm.gameState === GameState.ChancellorRequestVeto) {
                GameEvents.Player.onVetoRequested();
            } else if (
                vm.gameState === GameState.PresidentChooseExecutiveActionTarget
            ) {
                GameEvents.Player.onExecutiveActionTriggered();
            } else if (vm.gameState === GameState.ChancellorChoosePolicy) {
                GameEvents.Player.onPresidentPolicyChosen();
            } else if (vm.gameState === GameState.VoteForChancellor) {
                if (!vm.currentElection.didPlayerVote(vm.myPlayerId)) {
                    GameEvents.Player.onChancellorNominated();
                }
            }
        }
    },
    President: {
        onPresidentElected: function() {},
        onChancellorElected: function() {
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
                            vm.policyDeck
                                .peek(3)
                                .map((x: Policy) => x.toString())
                        ),
                    showCancelButton: false,
                    confirmButtonText: "OK"
                }).then(() => {
                    IO.socket.emit("chooseEATarget");
                });
            }
        },
        rejoinGame: function() {
            if (vm.gameState === GameState.PresidentNominateChancellor) {
                GameEvents.President.onPresidentElected();
            } else if (vm.gameState === GameState.PresidentChoosePolicies) {
                GameEvents.President.onChancellorElected();
            } else if (vm.gameState === GameState.ChancellorRequestVeto) {
                GameEvents.President.onVetoRequested();
            } else if (
                vm.gameState === GameState.PresidentChooseExecutiveActionTarget
            ) {
                GameEvents.President.onExecutiveActionTriggered();
            } else if (vm.gameState === GameState.ChancellorChoosePolicy) {
                GameEvents.Player.onPresidentPolicyChosen();
            } else if (vm.gameState === GameState.VoteForChancellor) {
                if (!vm.currentElection.didPlayerVote(vm.myPlayerId)) {
                    GameEvents.Player.onChancellorNominated();
                }
            }
        }
    },
    Chancellor: {
        onPresidentPolicyChosen: function() {
            vm.policyChoices = vm.chancellorPolicies;
        },
        rejoinGame: function() {
            if (vm.gameState === GameState.PresidentNominateChancellor) {
                GameEvents.Player.onPresidentElected();
            } else if (vm.gameState === GameState.PresidentChoosePolicies) {
                GameEvents.Player.onChancellorElected();
            } else if (vm.gameState === GameState.ChancellorRequestVeto) {
                GameEvents.Player.onVetoRequested();
            } else if (
                vm.gameState === GameState.PresidentChooseExecutiveActionTarget
            ) {
                GameEvents.Player.onExecutiveActionTriggered();
            } else if (vm.gameState === GameState.ChancellorChoosePolicy) {
                GameEvents.Chancellor.onPresidentPolicyChosen();
            } else if (vm.gameState === GameState.VoteForChancellor) {
                if (!vm.currentElection.didPlayerVote(vm.myPlayerId)) {
                    GameEvents.Player.onChancellorNominated();
                }
            }
        }
    }
};
function clickJoinButton() {
    if (autoJoin) {
        setTimeout(() => {
            vm.joinClicked = true;
        }, 100);
        setTimeout(() => {
            vm.onPlayerStartClick();
        }, 200);
    }
}
window.onload = function() {
    IO.init();
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
                        GameEvents.gameId = gameInfo.gameId;
                        IO.socket.emit("rejoinGame", gameInfo);
                        IO.joinGame(gameInfo);
                    } else {
                        clickJoinButton();
                    }
                } else {
                    clickJoinButton();
                }
            }
        );
    } else {
        clickJoinButton();
    }
};

function log(message: string) {
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
        players: [],
        policyChoices: [],
        presidentPolicies: [],
        chancellorPolicies: [],
        currentElection: null,
        showBoard: false,
        president: null,
        chancellor: null,
        chancellorNominee: null,
        waitingForVotes: [],
        chaosLevel: 0,
        yourName: "",
        whoAmIVisible: false,
        policyDeck: null,
        lastPolicy: null,
        lastExecutiveActionTarget: null,
        myRole: "",
        discardingPolicy: false,
        adminOverride: false,
        gameRules: {} as Setup,
        lastExecutiveAction: Executive_Action.NoAction,
        gameState: GameState.Idle,
        enactedPolicies: {},
        electionArchive: [],
        historyVisible: false,
        playersPopupVisible: false,
        myPlayerId: -1,
        lastChancellor: null,
        gameOver: "",
        joinClicked: false,
        CPU2: true
    },
    computed: {
        dead: function() {
            const me = this.getPlayerById(this.myPlayerId);
            return me && me.dead;
        },
        roles: function() {
            return this.players
                .map((p: Player) => `${p.name} is ${p.role}`)
                .join("<br>");
        },
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
        getPlayerById: function(id: number) {
            return this.players.filter((p: Player) => p.id === id)[0];
        },
        playerButtonClick: function(id: string | number) {
            let selectedPlayer = this.getPlayerById(+id);

            if (this.gameState === GameState.PresidentNominateChancellor) {
                IO.socket.emit("presidentNominate", {
                    nominee: selectedPlayer
                });
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
                        }
                    });
                } else {
                    IO.socket.emit("chooseEATarget", {
                        target: selectedPlayer
                    });
                }
            }
        },
        log: function(value: string) {
            log(value);
        },
        getPolicyClass: function(index: number) {
            if (this.presidentPolicies && this.presidentPolicies[+index]) {
                if (this.presidentPolicies[+index].isLiberal) {
                    return "liberalPolicy";
                } else {
                    return "fascistPolicy";
                }
            }
            return "";
        },
        policyChoiceClick: function(selected: Policy[]) {
            if (vm.myPosition() === Position.President) {
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
            if (!this.myRole) {
                const myPlayer = this.getPlayerById(this.myPlayerId);
                if (myPlayer.role === Role.Liberal) {
                    this.myRole =
                        "You are Liberal! Find and stop the Secret Hitler!";
                } else if (myPlayer.role === Role.Fascist) {
                    let s = "You are Fascist!";
                    const otherFascistNames = this.fascists
                        .filter((x: Player) => x.id !== myPlayer.id)
                        .map(getName);
                    const len = otherFascistNames.length;
                    if (len === 1) {
                        s += ` The other Fascist is ${otherFascistNames[0]}. `;
                    } else if (len > 1) {
                        s +=
                            " The other Fascists are " +
                            prettyPrintList(otherFascistNames) +
                            ". ";
                    }
                    s += " " + this.hitler.name + " is Secret Hitler!";
                    this.myRole = s;
                    if (!this.gameRules.hitlerKnowsFascists) {
                        this.myRole +=
                            " You know who Hitler is, but Hitler does NOT know who the fascists are!";
                    }
                } else {
                    let s = "You are Secret Hitler!";
                    if (this.gameRules.hitlerKnowsFascists) {
                        const fascistNames = this.fascists.map(getName);
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
                    this.myRole = s;
                }
            }
            this.whoAmIVisible = true;
        },
        CPUAction: function(action: number, value: any) {
            this.adminOverride = false;
            switch (action) {
                case 0:
                    this.players.forEach((p: Player) => {
                        if (p.id != this.myPlayerId && !p.dead) {
                            IO.socket.emit("voteForChancellor", {
                                id: p.id,
                                vote: [true, false, Rand.Boolean(50)][value]
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
        myPosition: function() {
            return this.president && this.president.id === this.myPlayerId
                ? Position.President
                : this.chancellor && this.chancellor.id === this.myPlayerId
                  ? Position.Chancellor
                  : Position.Player;
        },
        onPlayerStartClick: function() {
            this.myPlayerId = (Math.random() * 100000) | 0;

            // collect data to send to the server
            const data = {
                playerName: this.yourName || Rand.randomName(),
                playerId: this.myPlayerId
            };

            // Send the gameId and playerName to the server
            IO.socket.emit("playerJoinGame", data);
            IO.joinGame(data);
            if (this.CPU2) {
                for (let index = 0; index < 4; index++) {
                    IO.socket.emit("playerJoinGame", {
                        playerName: Rand.randomName(),
                        playerId: Rand.Range(0, 100000)
                    });
                }
            }
        },
        onVIPStart: function() {
            IO.socket.emit("VIPStart");
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
