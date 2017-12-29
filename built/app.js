"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DEBUG = false;
const autoJoin = false;
let CPU = false;
const Enums_1 = require("./Enums");
const Rand = require("./Rand");
const Policy_1 = require("./Policy");
const models_1 = require("./models");
const vue_toasted_1 = require("vue-toasted");
const Cookies = require("js-cookie");
function updateEnactedPolicies() {
    let ls = App.gameData.enactedPolicies.liberals;
    let fs = App.gameData.enactedPolicies.fascists;
    let h = "Liberal:";
    for (let i = 0; i < 5; i++) {
        if (i < ls) {
            h += " [X]";
        }
        else {
            h += " [ ]";
        }
    }
    h += "<br/>Fascist:";
    for (let i = 0; i < 5; i++) {
        if (i < fs) {
            h += " [X]";
        }
        else {
            h += " [ ]";
        }
    }
    document.getElementById("enactedPolicies").innerHTML = h;
}
function convertGameDataToClass(gameData) {
    if (gameData.electionArchive) {
        for (let i = 0; i < gameData.electionArchive.length; i++) {
            gameData.electionArchive[i] = new models_1.Election().cloneOf(gameData.electionArchive[i]);
        }
    }
    if (gameData.currentElection) {
        gameData.currentElection = new models_1.Election().cloneOf(gameData.currentElection);
    }
    if (gameData.policyDeck) {
        gameData.policyDeck = new Policy_1.PolicyDeck(gameData.policyDeck);
    }
    if (gameData.presidentPolicies) {
        gameData.presidentPolicies = gameData.presidentPolicies.map(x => new Policy_1.Policy(x.isLiberal));
    }
    if (gameData.chancellorPolicies) {
        gameData.chancellorPolicies = gameData.chancellorPolicies.map(x => new Policy_1.Policy(x.isLiberal));
    }
    if (gameData.lastPolicy) {
        gameData.lastPolicy = new Policy_1.Policy(gameData.lastPolicy.isLiberal);
    }
    App.gameData = gameData;
    vm.president = App.gameData.president;
    vm.chancellor = App.gameData.chancellor;
    vm.players = App.gameData.players;
    vm.chaosLevel = App.gameData.chaosLevel;
    updateEnactedPolicies();
}
const getName = (x) => x.name;
/**
 * All the code relevant to Socket.IO is collected in the IO namespace.
 *
 * @type {{init: init, bindEvents: bindEvents, onPresidentElected: onPresidentElected, onChancellorNominated: onChancellorNominated, onChancellorElected: onChancellorElected, onPresidentPolicyChosen: onPresidentPolicyChosen, onExecutiveActionTriggered: onExecutiveActionTriggered, onPlayerVoted: onPlayerVoted, onVoteFinished: onVoteFinished, onPolicyPlayed: onPolicyPlayed, onConnected: onConnected, onNewGameCreated: onNewGameCreated, playerJoinedRoom: playerJoinedRoom, beginNewGame: beginNewGame, gameOver: gameOver, error: error}}
 */
const IO = {
    socket: null,
    /**
     * This is called when the page is displayed. It connects the Socket.IO client
     * to the Socket.IO server
     */
    init: function () {
        IO.socket = io.connect();
        IO.bindEvents();
    },
    /**
     * While connected, Socket.IO will listen to the following events emitted
     * by the Socket.IO server, then run the appropriate function.
     */
    bindEvents: function () {
        IO.socket.on("connected", IO.onConnected);
        IO.socket.on("newGameCreated", IO.onNewGameCreated);
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
    onPresidentElected: function (data) {
        convertGameDataToClass(data);
        if (App.amIThePresident()) {
            App.President.onPresidentElected();
        }
        else {
            App.Player.onPresidentElected();
        }
    },
    onChancellorNominated: function (data) {
        convertGameDataToClass(data);
        App.Player.onChancellorNominated();
    },
    onChancellorElected: function (data) {
        convertGameDataToClass(data);
        if (App.amIThePresident()) {
            App.President.onChancellorElected();
        }
        else {
            App.Player.onChancellorElected();
        }
    },
    onPresidentPolicyChosen: function (data) {
        convertGameDataToClass(data);
        if (App.amITheChancellor()) {
            App.Chancellor.onPresidentPolicyChosen();
        }
        else {
            App.Player.onPresidentPolicyChosen();
        }
    },
    onVetoRequested: function () {
        if (App.amIThePresident()) {
            App.President.onVetoRequested();
        }
        else {
            App.Player.onVetoRequested();
        }
    },
    onVetoWasApproved: function (data) {
        convertGameDataToClass(data);
        App.Player.onVetoWasApproved();
    },
    onVetoWasRejected: function (data) {
        convertGameDataToClass(data);
        App.Player.onVetoWasRejected();
    },
    onExecutiveActionTriggered: function (data) {
        convertGameDataToClass(data);
        if (App.amIThePresident()) {
            App.President.onExecutiveActionTriggered();
        }
        else {
            App.Player.onExecutiveActionTriggered();
        }
    },
    onPlayerVoted: function (data) {
        App.Player.onPlayerVoted(data);
    },
    onExecutiveActionTargetChosen: function (data) {
        convertGameDataToClass(data);
        App.Player.onExecutiveActionTargetChosen();
    },
    onVoteFinished: function (data) {
        convertGameDataToClass(data);
        App.Player.onVoteFinished();
    },
    onPolicyPlayed: function (data) {
        convertGameDataToClass(data);
        App.Player.onPolicyPlayed();
    },
    onPolicyPlayedByCountry: function (data) {
        convertGameDataToClass(data);
        App.Player.onPolicyPlayedByCountry();
    },
    /**
     * The client is successfully connected!
     */
    onConnected: function () {
        // Cache a copy of the client's socket.IO session ID on the App
        App.mySocketId = IO.socket.socket.sessionid;
        // console.log(data.message);
    },
    /**
     * A new game has been created and a random game ID has been generated.
     * @param data {{ gameId: int, mySocketId: * }}
     */
    onNewGameCreated: function (data) {
        App.Host.gameInit(data);
    },
    /**
     * A player has successfully joined the game.
     * @param data {{playerName: string, gameId: int, mySocketId: int}}
     */
    playerJoinedRoom: function (data) {
        convertGameDataToClass(data);
        App.Player.playerJoinedRoom();
    },
    playerRejoinedRoom: function (data) {
        convertGameDataToClass(data);
        document.getElementById("startGameBtn").style.display = "none";
        vm.showBoard = true;
        for (let i = 0; i < App.gameData.players.length; i++) {
            let p = App.gameData.players[i];
            vm.roles = `${vm.roles}<br>${p.name} is ${p.role}`;
            // App.playerBtns[p.id] = document.getElementById(`${p.id}-btn`);
        }
        if (App.amIThePresident()) {
            App.President.rejoinGame();
        }
        else if (App.amITheChancellor()) {
            App.Chancellor.rejoinGame();
        }
        else {
            App.Player.rejoinGame();
        }
    },
    /**
     * Both players have joined the game.
     * @param data
     */
    beginNewGame: function (data) {
        convertGameDataToClass(data);
        App.Player.beginNewGame();
    },
    /**
     * Let everyone know the game has ended.
     * @param data
     */
    gameOver: function (data) {
        App.Player.gameOver(data);
    },
    /**
     * An error has occurred.
     * @param data
     */
    error: function (data) {
        alert("message: " + data.message);
    }
};
const App = {
    /**
     * Keep track of the gameId, which is identical to the ID
     * of the Socket.IO Room used for the players and host to communicate
     *
     */
    gameId: 0,
    myPlayerId: 0,
    playerBtns: [],
    dead: false,
    /**
     * The Socket.IO socket object identifier. This is unique for
     * each player and host. It is generated when the browser initially
     * connects to the server when the page loads for the first time.
     */
    mySocketId: "",
    myRole: "",
    currentRound: 0,
    gameData: {
        players: [],
        liberals: [],
        fascists: [],
        hitler: null,
        president: null,
        chancellor: null,
        lastChancellor: null,
        chancellorNominee: null,
        gameRules: {},
        enactedPolicies: {},
        chaosLevel: 0
    },
    /**************************************
     *                Setup                *
     * *********************************** */
    amIThePresident: function () {
        return (App.gameData.president &&
            App.gameData.president.id === App.myPlayerId);
    },
    amITheChancellor: function () {
        return (App.gameData.chancellor &&
            App.gameData.chancellor.id === App.myPlayerId);
    },
    /**
     * This runs when the page initially loads.
     */
    init: function () {
        App.cacheElements();
        App.showInitScreen();
        App.bindEvents();
    },
    $gameArea: null,
    $templateIntroScreen: null,
    $templateNewGame: null,
    $templateJoinGame: null,
    $hostGame: null,
    $neinBtn: null,
    $jaBtn: null,
    $policyChoiceArea: null,
    $policyChoiceBtns: [],
    /**
     * Create references to on-screen elements used throughout the game.
     */
    cacheElements: function () {
        // Templates
        App.$gameArea = document.getElementById("gameArea");
        App.$templateIntroScreen = document.getElementById("intro-screen-template");
        App.$templateNewGame = document.getElementById("create-game-template");
        App.$templateJoinGame = document.getElementById("join-game-template");
        App.$hostGame = document.getElementById("host-game-template");
        App.$neinBtn = document.getElementById("nein-btn");
        App.$jaBtn = document.getElementById("ja-btn");
        App.$policyChoiceArea = document.getElementById("policyChoices");
        App.$policyChoiceBtns = [
            document.getElementById("policyChoice1"),
            document.getElementById("policyChoice2"),
            document.getElementById("policyChoice3")
        ];
    },
    /**
     * Create some click handlers for the various buttons that appear on-screen.
     */
    bindEvents: function () {
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
     * Show the initial Anagrammatix Title Screen
     * (with Start and Join buttons)
     */
    showInitScreen: function () {
        App.$gameArea.style.display = "none";
        App.$templateIntroScreen.style.display = "";
    },
    /********************************
     *         HOST CODE           *
     ******************************* */
    Host: {
        /**
         * Handler for the "Start" button on the Title Screen.
         */
        onCreateClick: function () {
            // console.log('Clicked "Create A Game"');
            IO.socket.emit("hostCreateNewGame");
        },
        /**
         * The Host screen is displayed for the first time.
         * @param data{{ gameId: int, mySocketId: * }}
         */
        gameInit: function (data) {
            App.gameId = data.gameId;
            App.mySocketId = data.mySocketId;
            App.myRole = "Host";
            // console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
        }
    },
    /******************************
     *        PLAYER CODE        *
     ***************************** */
    Player: {
        /**
         * A reference to the socket ID of the Host
         */
        hostSocketId: "",
        /**
         * The player's name entered on the 'Join' screen.
         */
        myName: "",
        /**
         * Click handler for the 'JOIN' button
         */
        onJoinClick: function () {
            // console.log('Clicked "Join A Game"');
            // Display the Join Game HTML on the player's screen.
            App.$gameArea.style.display = "none";
            App.$templateIntroScreen.style.display = "none";
            App.$templateJoinGame.style.display = "";
            // setTimeout(() => document.getElementById("btnStart").click(), 100);
        },
        /**
         * The player entered their name and gameId (hopefully)
         * and clicked Start.
         */
        onPlayerStartClick: function () {
            // console.log('Player clicked "Start"');
            App.myPlayerId = (Math.random() * 100000) | 0;
            let name;
            if (vm.yourName) {
                name = vm.yourName;
            }
            else {
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
                name = names[App.myPlayerId % 22] + Rand.Range(1, 100);
            }
            // collect data to send to the server
            const data = {
                playerName: name,
                playerId: App.myPlayerId
            };
            // Send the gameId and playerName to the server
            IO.socket.emit("playerJoinGame", data);
            App.Player.joinGame(data);
        },
        joinGame: function (data) {
            Cookies.set("existingGameInfo", {
                gameId: App.gameId,
                playerId: App.myPlayerId,
                playerName: data.playerName
            });
            // Set the appropriate properties for the current player.
            App.myRole = "Player";
            App.Player.myName = data.playerName;
            document.title = data.playerName;
            App.$templateJoinGame.style.display = "none";
            App.$gameArea.style.display = "none";
        },
        rejoinGame: function () {
            if (App.gameData.gameState === Enums_1.GameState.PresidentNominateChancellor) {
                App.Player.onPresidentElected();
            }
            else if (App.gameData.gameState === Enums_1.GameState.PresidentChoosePolicies) {
                App.Player.onChancellorElected();
            }
            else if (App.gameData.gameState === Enums_1.GameState.ChancellorRequestVeto) {
                App.Player.onVetoRequested();
            }
            else if (App.gameData.gameState ===
                Enums_1.GameState.PresidentChooseExecutiveActionTarget) {
                App.Player.onExecutiveActionTriggered();
            }
            else if (App.gameData.gameState === Enums_1.GameState.ChancellorChoosePolicy) {
                App.Player.onPresidentPolicyChosen();
            }
            else if (App.gameData.gameState === Enums_1.GameState.VoteForChancellor) {
                if (!App.gameData.currentElection.didPlayerVote(App.myPlayerId)) {
                    App.Player.onChancellorNominated();
                }
            }
            vm.gameHasStarted = true;
        },
        onVIPStart: function () {
            vm.gameHasStarted = true;
            CPU = false;
            IO.socket.emit("VIPStart");
        },
        /**
         *  Click handler for the "Start Again" button that appears
         *  when a game is over.
         */
        onPlayerRestart: function () {
            const data = {
                gameId: App.gameId,
                playerName: App.Player.myName
            };
            IO.socket.emit("playerRestart", data);
            App.currentRound = 0;
        },
        /////////////////////////////////////////////////
        ///////////////////////////////////////////////////
        onPresidentElected: function () {
            // App.playerBtns.forEach(function (b) {
            //     // b.disabled = true;
            //     b.classList.remove("isPresident");
            //     b.classList.remove("isChancellor");
            //     if (+b.value=== App.gameData.president.id) {
            //         b.classList.add("isPresident");
            //     }
            //     if (App.getPlayerById(+b.value).dead) {
            //         b.classList.add("isDead");
            //     }
            // });
            vm.disablePlayerButtons = true;
            vm.currentAction = `Waiting for President ${App.gameData.president.name} to nominate Chancellor`;
        },
        onChancellorNominated: function () {
            if (App.dead) {
                return;
            }
            vm.waitingForVotes = [];
            App.gameData.players.forEach(p => {
                if (!p.dead) {
                    vm.waitingForVotes.push(p);
                }
            });
            vm.currentAction = `Vote now whether to elect ${App.gameData.chancellorNominee.name} as Chancellor`;
            vm.showVoteButtons = true;
            if (CPU) {
                setRandomTimeout(function () {
                    if (Rand.Boolean(80)) {
                        App.$jaBtn.click();
                    }
                    else {
                        App.$neinBtn.click();
                    }
                }, 500, 5000);
            }
            else {
            }
            App.$jaBtn.onclick = function () {
                IO.socket.emit("voteForChancellor", {
                    id: App.myPlayerId,
                    vote: true
                });
                vm.showVoteButtons = false;
            };
            App.$neinBtn.onclick = function () {
                IO.socket.emit("voteForChancellor", {
                    id: App.myPlayerId,
                    vote: false
                });
                vm.showVoteButtons = false;
            };
        },
        onChancellorElected: function () {
            // App.playerBtns[App.gameData.chancellor.id].classList.add(
            // "isChancellor"
            // );
            vm.currentAction = `Waiting for President ${App.gameData.president.name} to pick policies`;
        },
        onPresidentPolicyChosen: function () {
            vm.currentAction = `President ${App.gameData.president.name} has chosen 2 policies. Waiting for Chancellor ${App.gameData.chancellor.name} to enact one of them.`;
        },
        onVetoRequested: function () { },
        onVetoWasApproved: function () {
            log(`President ${App.gameData.president.name} approved the veto.`);
        },
        onVetoWasRejected: function () {
            log(`President ${App.gameData.president.name} rejected the veto. Chancellor ${App.gameData.chancellor.name} must enact a policy.`);
        },
        onExecutiveActionTriggered: function () {
            switch (App.gameData.lastExecutiveAction) {
                case Enums_1.Executive_Action.InvestigateLoyalty:
                    vm.currentAction = `Waiting for President ${App.gameData.president.name} to investigate someone's loyalty.`;
                    break;
                case Enums_1.Executive_Action.Execution:
                    vm.currentAction = `Waiting for President ${App.gameData.president.name} to execute someone.`;
                    break;
                case Enums_1.Executive_Action.SpecialElection:
                    vm.currentAction = `Waiting for President ${App.gameData.president.name} to invoke a special election.`;
                    break;
            }
        },
        onPlayerVoted: function (data) {
            if (DEBUG) {
                log(`${App.getPlayerById(data.id).name} voted ${data.vote ? "ja" : "nein"}`);
            }
            vm.waitingForVotes = vm.waitingForVotes.filter((x) => x !== App.getPlayerById(data.id));
        },
        onExecutiveActionTargetChosen: function () {
            switch (App.gameData.lastExecutiveAction) {
                case Enums_1.Executive_Action.PolicyPeek:
                    log(`President ${App.gameData.president.name} peeked the next 3 policies.`);
                    break;
                case Enums_1.Executive_Action.SpecialElection:
                    log(`Special Election! ${App.gameData.lastExecutiveActionTarget.name} will now be president.`);
                    break;
                case Enums_1.Executive_Action.Execution:
                    log(`President ${App.gameData.president.name} has executed ${App.gameData.lastExecutiveActionTarget.name}!`);
                    if (App.gameData.lastExecutiveActionTarget.id ===
                        App.myPlayerId) {
                        App.dead = true;
                    }
                    break;
                case Enums_1.Executive_Action.InvestigateLoyalty:
                    log(`President ${App.gameData.president.name} has investigated ${App.gameData.lastExecutiveActionTarget.name}'s loyalty.`);
                    break;
            }
        },
        onVoteFinished: function () {
            if (App.gameData.currentElection.didPass()) {
                log(`Vote passed! ${App.gameData.chancellor.name} is now Chancellor.`);
            }
            else {
                log(`Vote failed!`);
            }
        },
        onPolicyPlayed: function () {
            log(`President ${App.gameData.president.name} and Chancellor ${App.gameData.chancellor.name} have enacted a ${App.gameData.lastPolicy.toString()} policy!`);
        },
        onPolicyPlayedByCountry: function () {
            log(`The country is in chaos! The people have enacted a ${App.gameData.lastPolicy.toString()} policy!`);
        },
        /**
         * A player has successfully joined the game.
         * @param data {{playerName: string, gameId: int, mySocketId: int}}
         */
        playerJoinedRoom: function () {
            log(`${App.gameData.players[App.gameData.players.length - 1].name} joined the room!`);
            vm.players = App.gameData.players;
        },
        beginNewGame: function () {
            vm.gameHasStarted = true;
            vm.showBoard = true;
            for (let i = 0; i < App.gameData.players.length; i++) {
                let p = App.gameData.players[i];
                vm.roles = `${vm.roles}<br>${p.name} is ${p.role}`;
                // App.playerBtns[p.id] = document.getElementById(`${p.id}-btn`);
            }
            App.Player.whoAmI();
        },
        whoAmI: function () {
            const myPlayer = App.getPlayerById(App.myPlayerId);
            if (myPlayer.role === Enums_1.Role.Liberal) {
                log("You are Liberal! Find and stop the Secret Hitler!");
            }
            else if (myPlayer.role === Enums_1.Role.Fascist) {
                let s = "You are Fascist!";
                const otherFascistNames = App.gameData.fascists
                    .filter((x) => x.id !== myPlayer.id)
                    .map(getName);
                const len = otherFascistNames.length;
                if (len === 1) {
                    s += " The other Fascist is " + otherFascistNames[0] + ". ";
                }
                else if (len > 1) {
                    s +=
                        " The other Fascists are " +
                            prettyPrintList(otherFascistNames) +
                            ". ";
                }
                s += App.gameData.hitler.name + " is Secret Hitler!";
                log(s);
                if (!App.gameData.gameRules.hitlerKnowsFascists) {
                    log("You know who Hitler is, but Hitler does NOT know who the fascists are!");
                }
            }
            else {
                let s = "You are Secret Hitler!";
                if (App.gameData.gameRules.hitlerKnowsFascists) {
                    const fascistNames = App.gameData.fascists.map(getName);
                    const len = fascistNames.length;
                    if (len === 1) {
                        s += " The Fascist is " + fascistNames[0] + ". ";
                    }
                    else if (len > 1) {
                        s +=
                            " The Fascists are " +
                                prettyPrintList(fascistNames) +
                                ". ";
                    }
                }
                log(s);
            }
        },
        gameOver: function (data) {
            switch (data.gameOverReason) {
                case Enums_1.WinCondition.SixLiberalPolicies:
                    alert("Liberals Win! Six Liberal Policies have been played.");
                    break;
                case Enums_1.WinCondition.SixFascistPolicies:
                    alert("Fascists Win! Six Fascist Policies have been played.");
                    break;
                case Enums_1.WinCondition.HitlerIsChancellor:
                    alert(`Fascists Win! Hitler (${App.gameData.hitler.name}) has been elected Chancellor!`);
                    break;
                case Enums_1.WinCondition.HitlerWasAssassinated:
                    alert(`Liberals Win! Hitler (${App.gameData.hitler.name}) has been assassinated!`);
                    break;
            }
        }
    },
    President: {
        onPresidentElected: function () {
            vm.disablePlayerButtons = false;
            vm.currentAction =
                "You're the president! Choose someone to nominate for chancellor.";
            if (CPU) {
                setRandomTimeout(() => {
                    let selectedPlayer;
                    do {
                        selectedPlayer = Rand.Choice(App.gameData.players);
                    } while (selectedPlayer.id === App.myPlayerId ||
                        selectedPlayer.dead ||
                        (App.gameData.lastChancellor &&
                            App.gameData.lastChancellor.id ===
                                selectedPlayer.id));
                    // App.playerBtns[selectedPlayer.id].click();
                }, 500, 3000);
            }
        },
        onChancellorElected: function () {
            // App.playerBtns[App.gameData.chancellor.id].classList.add(
            //     "isChancellor"
            // );
            vm.currentAction = "Choose a policy to discard.";
            vm.policyChoices = App.gameData.presidentPolicies;
            if (CPU) {
                setRandomTimeout(function () {
                    let choice = Rand.Range(0, 3);
                    App.$policyChoiceBtns[choice].click();
                }, 500, 2000);
            }
            vm.showPolicyChoices = true;
        },
        onVetoRequested: function () {
            IO.socket.emit("vetoApproved", {
                id: App.myPlayerId,
                approved: confirm("Approve the veto?")
            });
        },
        onExecutiveActionTriggered: function () {
            if (App.gameData.lastExecutiveAction === Enums_1.Executive_Action.PolicyPeek) {
                log("Next 3 Policies are " +
                    App.gameData.policyDeck
                        .peek(3)
                        .map(x => x.toString())
                        .join(", "));
                IO.socket.emit("chooseEATarget");
            }
            else {
                vm.disablePlayerButtons = false;
                switch (App.gameData.lastExecutiveAction) {
                    case Enums_1.Executive_Action.InvestigateLoyalty:
                        vm.currentAction =
                            "Choose someone to investigate their loyalty.";
                        break;
                    case Enums_1.Executive_Action.Execution:
                        vm.currentAction = "Choose someone to execute.";
                        break;
                    case Enums_1.Executive_Action.SpecialElection:
                        vm.currentAction =
                            "Choose the president for next turn.";
                        break;
                }
                if (CPU) {
                    setRandomTimeout(() => {
                        let selectedPlayer;
                        do {
                            selectedPlayer = Rand.Choice(App.gameData.players);
                        } while (selectedPlayer.id === App.myPlayerId ||
                            selectedPlayer.dead ||
                            (App.gameData.lastChancellor &&
                                App.gameData.lastChancellor.id ===
                                    selectedPlayer.id));
                        // App.playerBtns[selectedPlayer.id].click();
                    }, 500, 3000);
                }
            }
        },
        rejoinGame: function () {
            if (App.gameData.gameState === Enums_1.GameState.PresidentNominateChancellor) {
                App.President.onPresidentElected();
            }
            else if (App.gameData.gameState === Enums_1.GameState.PresidentChoosePolicies) {
                App.President.onChancellorElected();
            }
            else if (App.gameData.gameState === Enums_1.GameState.ChancellorRequestVeto) {
                App.President.onVetoRequested();
            }
            else if (App.gameData.gameState ===
                Enums_1.GameState.PresidentChooseExecutiveActionTarget) {
                App.President.onExecutiveActionTriggered();
            }
            else if (App.gameData.gameState === Enums_1.GameState.ChancellorChoosePolicy) {
                App.Player.onPresidentPolicyChosen();
            }
            else if (App.gameData.gameState === Enums_1.GameState.VoteForChancellor) {
                if (!App.gameData.currentElection.didPlayerVote(App.myPlayerId)) {
                    App.Player.onChancellorNominated();
                }
            }
        }
    },
    Chancellor: {
        onPresidentPolicyChosen: function () {
            vm.currentAction = "Choose a policy to discard";
            vm.policyChoices = App.gameData.chancellorPolicies;
            if (App.gameData.enactedPolicies.fascists === 5) {
                // App.$policyChoiceBtns[2].disabled = false;
                // App.$policyChoiceBtns[2].onclick = function() {
                //     App.$policyChoiceBtns[2].disabled = true;
                //     vm.showPolicyChoices = false;
                //
                // }
                vm.showVetoButton = true;
            }
            if (CPU) {
                setRandomTimeout(function () {
                    let choice = Rand.Range(0, 2);
                    App.$policyChoiceBtns[choice].click();
                }, 500, 2000);
            }
        },
        rejoinGame: function () {
            if (App.gameData.gameState === Enums_1.GameState.PresidentNominateChancellor) {
                App.Player.onPresidentElected();
            }
            else if (App.gameData.gameState === Enums_1.GameState.PresidentChoosePolicies) {
                App.Player.onChancellorElected();
            }
            else if (App.gameData.gameState === Enums_1.GameState.ChancellorRequestVeto) {
                App.Player.onVetoRequested();
            }
            else if (App.gameData.gameState ===
                Enums_1.GameState.PresidentChooseExecutiveActionTarget) {
                App.Player.onExecutiveActionTriggered();
            }
            else if (App.gameData.gameState === Enums_1.GameState.ChancellorChoosePolicy) {
                App.Chancellor.onPresidentPolicyChosen();
            }
            else if (App.gameData.gameState === Enums_1.GameState.VoteForChancellor) {
                if (!App.gameData.currentElection.didPlayerVote(App.myPlayerId)) {
                    App.Player.onChancellorNominated();
                }
            }
        }
    },
    getPlayerById: function (id) {
        let ret = null;
        App.gameData.players.forEach(function (p) {
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
    }
}
window.onload = function () {
    IO.init();
    App.init();
    if (!DEBUG) {
        document.getElementById("DEBUG").style.display = "none";
    }
    if (Cookies.get("existingGameInfo")) {
        const gameInfo = Cookies.getJSON("existingGameInfo");
        IO.socket.emit("isGameStillGoing", { gameId: gameInfo.gameId }, function (response) {
            if (response) {
                if (autoJoin ||
                    confirm("Looks like you were disconnected, but the game is still going. Rejoin?")) {
                    App.myPlayerId = gameInfo.playerId;
                    App.gameId = gameInfo.gameId;
                    IO.socket.emit("rejoinGame", gameInfo);
                    App.$gameArea.style.display = "none";
                    App.$templateIntroScreen.style.display = "none";
                    App.Player.joinGame(gameInfo);
                }
                else {
                    clickJoinButton();
                }
            }
            else {
                clickJoinButton();
            }
            // } else {
            //     Cookies.remove("existingGameInfo");
            // }
        });
    }
    else {
        clickJoinButton();
    }
};
function setRandomTimeout(func, min, max) {
    setTimeout(func, Rand.Range(min, max));
}
Vue.use(vue_toasted_1.default);
function log(message, duration) {
    Vue.toasted.show(message, { duration: duration || 4000 });
    // if (DEBUG) {
    //     if (!$messageBox) {
    //         $messageBox = document.getElementById("messageBox");
    //     }
    //     let existingHtml = $messageBox.innerHTML;
    //     existingHtml = existingHtml.split("<br>");
    //     if (existingHtml.length > 8) {
    //         console.log(existingHtml[0]);
    //         existingHtml = existingHtml.slice(existingHtml.length - 8);
    //     }
    //     existingHtml.push(message);
    //     $messageBox.innerHTML = existingHtml.join("<br>");
    // }
}
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
///////////////////////Vue.js CODE///////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
const vm = new Vue({
    el: "#gameBody",
    data: {
        showPolicyChoices: false,
        showVetoButton: false,
        showVoteButtons: false,
        disablePlayerButtons: true,
        roles: "",
        players: [],
        policyChoices: [],
        currentAction: "",
        showBoard: false,
        president: null,
        chancellor: null,
        waitingForVotes: [],
        chaosLevel: 0,
        gameHasStarted: false,
        yourName: ""
    },
    computed: {
        showStartBtn: function () {
            return (!this.gameHasStarted &&
                (this.players &&
                    this.players.length >= 5 &&
                    this.players.length <= 10));
        },
        waitingForVotesString: function () {
            const len = this.waitingForVotes.length;
            if (len === 0) {
                return "";
            }
            else {
                return `Waiting for vote${len > 1 ? "s" : ""} from ${prettyPrintList(this.waitingForVotes.map(getName))}`;
            }
        }
    },
    methods: {
        playerButtonClick: function (id) {
            let selectedPlayer = App.getPlayerById(+id);
            if (selectedPlayer.dead) {
                alert(`${selectedPlayer.name} is dead!`);
            }
            if (App.gameData.gameState === Enums_1.GameState.PresidentNominateChancellor) {
                if (App.gameData.lastChancellor &&
                    selectedPlayer.id === App.gameData.lastChancellor.id) {
                    alert("can't be chancellor twice in a row");
                }
                else {
                    IO.socket.emit("presidentNominate", {
                        nominee: selectedPlayer
                    });
                    this.disablePlayerButtons = true;
                }
            }
            else if (App.gameData.gameState ===
                Enums_1.GameState.PresidentChooseExecutiveActionTarget) {
                if (App.gameData.lastExecutiveAction ===
                    Enums_1.Executive_Action.InvestigateLoyalty) {
                    let loyalty = selectedPlayer.role;
                    if (loyalty === Enums_1.Role.Hitler) {
                        loyalty = Enums_1.Role.Fascist;
                    }
                    log(`${selectedPlayer.name} is ${loyalty}!`);
                }
                IO.socket.emit("chooseEATarget", { target: selectedPlayer });
                this.disablePlayerButtons = true;
            }
        },
        disablePlayerButton(id) {
            if (this.disablePlayerButtons) {
                return true;
            }
            if (id == App.myPlayerId) {
                return true;
            }
            let selectedPlayer = App.getPlayerById(+id);
            if (selectedPlayer.dead) {
                return true;
            }
            if (App.gameData.gameState === Enums_1.GameState.PresidentNominateChancellor) {
                return (App.gameData.lastChancellor &&
                    App.gameData.lastChancellor.id == id);
            }
            return false;
        },
        getPolicyClass: function (index) {
            if (App.gameData &&
                App.gameData.presidentPolicies &&
                App.gameData.presidentPolicies[+index]) {
                if (App.gameData.presidentPolicies[+index].isLiberal) {
                    return "liberalPolicy";
                }
                else {
                    return "fascistPolicy";
                }
            }
            return "";
        },
        policyChoiceClick: function (index) {
            if (!DEBUG && !confirm("Are you sure?")) {
                return;
            }
            if (App.amIThePresident()) {
                let choices = [];
                switch (index) {
                    case 0:
                        choices = [
                            App.gameData.presidentPolicies[1],
                            App.gameData.presidentPolicies[2]
                        ];
                        break;
                    case 1:
                        choices = [
                            App.gameData.presidentPolicies[0],
                            App.gameData.presidentPolicies[2]
                        ];
                        break;
                    case 2:
                        choices = [
                            App.gameData.presidentPolicies[0],
                            App.gameData.presidentPolicies[1]
                        ];
                        break;
                }
                IO.socket.emit("choosePresidentPolicies", {
                    id: App.myPlayerId,
                    policies: choices
                });
            }
            else {
                IO.socket.emit("chooseChancellorPolicy", {
                    id: App.myPlayerId,
                    policies: [
                        App.gameData.chancellorPolicies[index === 1 ? 0 : 1]
                    ]
                });
            }
            this.policyChoices = [];
            this.showVetoButton = false;
        },
        vetoButtonClick: function () {
            this.showVetoButton = false;
            IO.socket.emit("chancellorRequestedVeto");
        },
        whoAmI: function () {
            App.Player.whoAmI();
        }
    }
});
function prettyPrintList(listToPrint) {
    const len = listToPrint.length;
    if (len === 0) {
        return "";
    }
    else if (len === 1) {
        return listToPrint[0];
    }
    else if (len === 2) {
        return listToPrint[0] + " and " + listToPrint[1];
    }
    else {
        let s = "";
        for (let i = 0; i < len - 1; i++) {
            s += listToPrint[i] + ", ";
        }
        s += "and " + listToPrint[len - 1];
        return s;
    }
}
