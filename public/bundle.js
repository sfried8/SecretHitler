/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

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
    },
    Choice: function (array) {
        let index = Math.random() * array.length;
        return array[Math.floor(index)];
    }
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const Rand = __webpack_require__(0);
class PolicyDeck {
    constructor(obj) {
        if (obj) {
            this.deckSource = obj.deckSource.map(x => new Policy(x));
            this.deck = obj.deck.map(x => new Policy(x));
        } else {

            this.deckSource = [];
            this.deck = [];
            for (let i = 0; i < 6; i++) {
                this.deckSource.push(new Policy(true));
            }
            for (let i = 0; i < 11; i++) {
                this.deckSource.push(new Policy(false));
            }
            this.shuffleDeck();
        }
    }
    shuffleDeck() {
        this.deck = Rand.Shuffle(this.deckSource.slice());
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
        return this.deck.slice(0,numberOfCards)

    }
}
class Policy {

    constructor(obj) {
        if (typeof obj.isLiberal !== "undefined") {
            this.isLiberal = obj.isLiberal;
        } else {
            this.isLiberal = !!obj;
        }
    }
    toString() {
        if (this.isLiberal) {
            return "Liberal";
        } else {
            return "Fascist";
        }
    }
}
module.exports = {
    Policy: Policy,
    PolicyDeck: PolicyDeck
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

;
const DEBUG = true;
let CPU = false;
const Enums = __webpack_require__(3);
const WinCondition = Enums.WinCondition;
const Executive_Action = Enums.Executive_Action;
const Rand = __webpack_require__(0);

const Policy = __webpack_require__(1).Policy;
const PolicyDeck = __webpack_require__(1).PolicyDeck;


const Election = __webpack_require__(4).Election;




    
    const Player = __webpack_require__(5);
    function updateEnactedPolicies() {
        let ls = App.gameData.enactedPolicies.liberals;
        let fs = App.gameData.enactedPolicies.fascists;
        let h = "Liberal:";

        for (let i = 0; i < 5; i ++) {
            if (i < ls) {
                h += " [X]";
            } else {
                h += " [ ]";
            }
        }
        h+="<br/>Fascist:";
        for (let i = 0; i < 5; i ++) {
            if (i < fs) {
                h += " [X]";
            } else {
                h += " [ ]";
            }
        }

        document.getElementById("enactedPolicies").innerHTML = h;
    }
    function convertGameDataToClass(gameData) {
        if (gameData.electionArchive) {
            for (let i = 0; i < gameData.electionArchive.length; i++) {
                gameData.electionArchive[i] = new Election(gameData.electionArchive[i]);
            }
        }
        if (gameData.currentElection) {
            gameData.currentElection = new Election(gameData.currentElection);
        }
        if (gameData.policyDeck) {
            gameData.policyDeck = new PolicyDeck(gameData.policyDeck);
        }
        if (gameData.presidentPolicies) {
            gameData.presidentPolicies = gameData.presidentPolicies.map(x => new Policy(x));
        }
        if (gameData.chancellorPolicies) {
            gameData.chancellorPolicies = gameData.chancellorPolicies.map(x => new Policy(x));
        }
        if (gameData.lastPolicy) {
            gameData.lastPolicy = new Policy(gameData.lastPolicy);
        }
        App.gameData = gameData;
        updateEnactedPolicies();
    }

    /**
     * All the code relevant to Socket.IO is collected in the IO namespace.
     *
     * @type {{init: init, bindEvents: bindEvents, onPresidentElected: onPresidentElected, onChancellorNominated: onChancellorNominated, onChancellorElected: onChancellorElected, onPresidentPolicyChosen: onPresidentPolicyChosen, onExecutiveActionTriggered: onExecutiveActionTriggered, onPlayerVoted: onPlayerVoted, onVoteFinished: onVoteFinished, onPolicyPlayed: onPolicyPlayed, onConnected: onConnected, onNewGameCreated: onNewGameCreated, playerJoinedRoom: playerJoinedRoom, beginNewGame: beginNewGame, gameOver: gameOver, error: error}}
     */
    const IO = {

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
        bindEvents : function() {
            IO.socket.on('connected', IO.onConnected );
            IO.socket.on('newGameCreated', IO.onNewGameCreated );
            IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom );
            IO.socket.on('beginNewGame', IO.beginNewGame );
            IO.socket.on('gameOver', IO.gameOver);
            IO.socket.on('error', IO.error );

            IO.socket.on('presidentElected', IO.onPresidentElected);
            IO.socket.on('chancellorNominated', IO.onChancellorNominated);
            IO.socket.on('chancellorElected', IO.onChancellorElected);
            IO.socket.on('presidentPolicyChosen', IO.onPresidentPolicyChosen);
            IO.socket.on('executiveActionTriggered', IO.onExecutiveActionTriggered);
            IO.socket.on('EATargetChosen', IO.onExecutiveActionTargetChosen);
            IO.socket.on('playerVoted', IO.onPlayerVoted);
            IO.socket.on('voteFinished', IO.onVoteFinished);
            IO.socket.on('policyPlayed', IO.onPolicyPlayed);
            IO.socket.on('policyPlayedByCountry', IO.onPolicyPlayedByCountry);
            IO.socket.on('vetoRequested', IO.onVetoRequested);

            IO.socket.on('vetoWasApproved', IO.onVetoWasApproved);
            IO.socket.on('vetoWasRejected', IO.onVetoWasRejected);

        },

        onPresidentElected: function(data) {
            convertGameDataToClass(data);
            if (App.amIThePresident()) {
                App.President.onPresidentElected()
            } else {
                App.Player.onPresidentElected();
            }
        },
        onChancellorNominated: function(data) {
            convertGameDataToClass(data);
            App.Player.onChancellorNominated();
        },
        onChancellorElected: function(data) {
            convertGameDataToClass(data);
            if (App.amIThePresident()) {
                App.President.onChancellorElected();
            } else {
                App.Player.onChancellorElected();
            }
        },
        onPresidentPolicyChosen: function(data) {
            convertGameDataToClass(data);
            if (App.amITheChancellor()) {
                App.Chancellor.onPresidentPolicyChosen();
            } else {
                App.Player.onPresidentPolicyChosen();
            }
        },
        onVetoRequested: function (data) {
            if (App.amIThePresident()) {
                App.President.onVetoRequested();
            } else {
                App.Player.onVetoRequested();
            }

        },
        onVetoWasApproved: function(data) {
            convertGameDataToClass(data);
            App.Player.onVetoWasApproved();
        },
        onVetoWasRejected: function (data) {
            convertGameDataToClass(data);
            App.Player.onVetoWasRejected();
        },
        onExecutiveActionTriggered: function(data) {
            convertGameDataToClass(data);
            if (App.amIThePresident()) {
                App.President.onExecutiveActionTriggered();
            } else {
                App.Player.onExecutiveActionTriggered();
            }
        },
        onPlayerVoted: function(data) {
            App.Player.onPlayerVoted(data);
        },
        onExecutiveActionTargetChosen: function(data) {
            convertGameDataToClass(data);
            App.Player.onExecutiveActionTargetChosen();
        },
        onVoteFinished: function(data) {
            convertGameDataToClass(data);
            App.Player.onVoteFinished();
        },
        onPolicyPlayed: function(data) {
            convertGameDataToClass(data);
            App.Player.onPolicyPlayed();
        },
        onPolicyPlayedByCountry: function(data) {
            convertGameDataToClass(data);
            App.Player.onPolicyPlayedByCountry();
        },
        /**
         * The client is successfully connected!
         */
        onConnected : function() {
            // Cache a copy of the client's socket.IO session ID on the App
            App.mySocketId = IO.socket.socket.sessionid;
            // console.log(data.message);
        },

        /**
         * A new game has been created and a random game ID has been generated.
         * @param data {{ gameId: int, mySocketId: * }}
         */
        onNewGameCreated : function(data) {
            App.Host.gameInit(data);
        },

        /**
         * A player has successfully joined the game.
         * @param data {{playerName: string, gameId: int, mySocketId: int}}
         */
        playerJoinedRoom : function(data) {
            convertGameDataToClass(data);
            App.Player.playerJoinedRoom();
        },

        /**
         * Both players have joined the game.
         * @param data
         */
        beginNewGame : function(data) {
            convertGameDataToClass(data);
            App.Player.beginNewGame(App.gameData);
        },

        /**
         * Let everyone know the game has ended.
         * @param data
         */
        gameOver : function(data) {
            App.Player.gameOver(data);

        },

        /**
         * An error has occurred.
         * @param data
         */
        error : function(data) {
            alert(data.message);
        }

    };

    const App = {

        /**
         * Keep track of the gameId, which is identical to the ID
         * of the Socket.IO Room used for the players and host to communicate
         *
         */
        gameId: 0,

        playerBtns: [],
        /**
         * The Socket.IO socket object identifier. This is unique for
         * each player and host. It is generated when the browser initially
         * connects to the server when the page loads for the first time.
         */
        mySocketId: '',
        currentRound: 0,

        gameData: {

            players: [],
            liberals: [],
            fascists: [],
            hitler: null,
            president: null,
            chancellor: null,
            lastChancellor: null,
            gameRules: {},
            enactedPolicies: {},
            chaosLevel: 0
        },
        /* *************************************
         *                Setup                *
         * *********************************** */
        amIThePresident: function() {
            return App.gameData.president.id === App.myPlayerId;
        },
        amITheChancellor: function() {
            return App.gameData.chancellor.id === App.myPlayerId;
        },
        /**
         * This runs when the page initially loads.
         */
        init: function () {
            App.cacheElements();
            App.showInitScreen();
            App.bindEvents();

            // Initialize the fastclick library
            FastClick.attach(document.body);
        },

        /**
         * Create references to on-screen elements used throughout the game.
         */
        cacheElements: function () {
            // Templates
            App.$gameArea = document.getElementById("gameArea");
            App.$templateIntroScreen = document.getElementById('intro-screen-template');
            App.$templateNewGame = document.getElementById('create-game-template');
            App.$templateJoinGame = document.getElementById('join-game-template');
            App.$hostGame = document.getElementById('host-game-template');
            App.$neinBtn = document.getElementById("nein-btn");
            App.$jaBtn = document.getElementById("ja-btn");
            App.$policyChoiceArea = document.getElementById("policyChoices");
            App.$policyChoiceBtns = [document.getElementById("policyChoice1"), document.getElementById("policyChoice2"), document.getElementById("policyChoice3")];
        },

        /**
         * Create some click handlers for the various buttons that appear on-screen.
         */
        bindEvents: function () {
            // Host
            document.getElementById('btnCreateGame').onclick = App.Host.onCreateClick;
            document.getElementById('startGameBtn').onclick = App.Player.onVIPStart;


            // Player
            document.getElementById('btnJoinGame').onclick = App.Player.onJoinClick;
            document.getElementById('btnStart').onclick = App.Player.onPlayerStartClick;
        },

        /* *************************************
         *             Game Logic              *
         * *********************************** */

        /**
         * Show the initial Anagrammatix Title Screen
         * (with Start and Join buttons)
         */
        showInitScreen: function() {
            App.$gameArea.style.display = "none";
            App.$templateIntroScreen.style.display = "";

        },


        /* *******************************
           *         HOST CODE           *
           ******************************* */
        Host : {
            /**
             * Handler for the "Start" button on the Title Screen.
             */
            onCreateClick: function () {
                // console.log('Clicked "Create A Game"');
                IO.socket.emit('hostCreateNewGame');
            },

            /**
             * The Host screen is displayed for the first time.
             * @param data{{ gameId: int, mySocketId: * }}
             */
            gameInit: function (data) {
                App.gameId = data.gameId;
                App.mySocketId = data.mySocketId;
                App.myRole = 'Host';
                App.Host.numPlayersInRoom = 0;

                App.Host.displayNewGameScreen();
                // console.log("Game started with ID: " + App.gameId + ' by host: ' + App.mySocketId);
            }


        },


        /* *****************************
           *        PLAYER CODE        *
           ***************************** */

        Player : {

            /**
             * A reference to the socket ID of the Host
             */
            hostSocketId: '',

            /**
             * The player's name entered on the 'Join' screen.
             */
            myName: '',

            /**
             * Click handler for the 'JOIN' button
             */
            onJoinClick: function () {
                // console.log('Clicked "Join A Game"');

                // Display the Join Game HTML on the player's screen.
                App.$gameArea.style.display = "none";
                App.$templateIntroScreen.style.display = "none";
                App.$templateJoinGame.style.display = "";
                setTimeout(()=>document.getElementById("btnStart").click(),100);
            },

            /**
             * The player entered their name and gameId (hopefully)
             * and clicked Start.
             */
            onPlayerStartClick: function() {
                // console.log('Player clicked "Start"');
                const names = ["Sam","Mike","George","Andrew","Max","Kutik","Hussein","Aaron","Derrick","Eden","Poop","Butt","John","Charlie","Frank","Randy","Jimbo","Stan","Kyle","Eric","Butters","Kenny"];
                App.myPlayerId = ( Math.random() * 100000 ) | 0;
                // collect data to send to the server
                const data = {
                    playerName : names[App.myPlayerId % 22]  + Rand.Range(1,100),
                    playerId : App.myPlayerId
                };

                // Send the gameId and playerName to the server
                IO.socket.emit('playerJoinGame', data);

                // Set the appropriate properties for the current player.
                App.myRole = 'Player';
                App.Player.myName = data.playerName;
                document.title = data.playerName;
                App.$templateJoinGame.style.display = "none";
                App.$gameArea.style.display = "none";
            },

            onVIPStart: function() {
                document.getElementById('startGameBtn').style.display = "none";
                CPU = false;
                IO.socket.emit('VIPStart');
            },


            /**
             *  Click handler for the "Start Again" button that appears
             *  when a game is over.
             */
            onPlayerRestart : function() {
                const data = {
                    gameId : App.gameId,
                    playerName : App.Player.myName
                };
                IO.socket.emit('playerRestart',data);
                App.currentRound = 0;
            },


            /////////////////////////////////////////////////
            ///////////////////////////////////////////////////
            onPresidentElected: function() {
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
                log(`Waiting for President ${App.gameData.president.name} to nominate Chancellor`)

            },

            onChancellorNominated: function() {
                log("time to vote on "+App.gameData.chancellorNominee.name);
                if (App.dead) {
                    return;
                }
                vm.showVoteButtons = true;
                if (CPU) {
                    setRandomTimeout(function () {
                        if (Rand.Boolean(80)) {
                            App.$jaBtn.disabled = false;
                            App.$jaBtn.click();
                        } else {
                            App.$neinBtn.disabled = false;
                            App.$neinBtn.click();
                        }
                    }, 500, 5000)
                } else {

                }
                App.$jaBtn.disabled = false;
                App.$jaBtn.onclick = function () {
                    App.$jaBtn.disabled = true;
                    App.$neinBtn.disabled = true;
                    IO.socket.emit('voteForChancellor',{id: App.myPlayerId, vote:true});
                    vm.showVoteButtons = false;
                };
                App.$neinBtn.disabled = false;
                App.$neinBtn.onclick = function () {
                    App.$jaBtn.disabled = true;
                    App.$neinBtn.disabled = true;
                    IO.socket.emit('voteForChancellor',{id: App.myPlayerId, vote:false});
                    vm.showVoteButtons = false;
                };
            },
            onChancellorElected: function() {
                App.playerBtns[App.gameData.chancellor.id].classList.add("isChancellor");
                log(`Waiting for President ${App.gameData.president.name} to pick policies`);
            },

            onPresidentPolicyChosen: function() {
                log(`President ${App.gameData.president.name} has chosen 2 policies. Waiting for Chancellor ${App.gameData.chancellor.name} to enact one of them.`);
            },

            onVetoRequested: function () {

            },

            onVetoWasApproved: function() {
                log(`President ${App.gameData.president.name} approved the veto.`)
            },
            onVetoWasRejected: function () {
                log(`President ${App.gameData.president.name} rejected the veto. Chancellor ${App.gameData.chancellor.name} must enact a policy.`);

            },
            onExecutiveActionTriggered: function() {
                switch (App.gameData.lastExecutiveAction) {
                    case Executive_Action.InvestigateLoyalty:
                        log(`Waiting for President ${App.gameData.president.name} to investigate someone's loyalty.`);
                        break;
                    case Executive_Action.Execution:
                        log(`Waiting for President ${App.gameData.president.name} to execute someone.`);
                        break;
                    case Executive_Action.SpecialElection:
                        log(`Waiting for President ${App.gameData.president.name} to invoke a special election.`);
                        break;
                }
            },

            onPlayerVoted: function(data) {
                log(`${App.getPlayerById(data.id).name} voted ${data.vote ? "ja" : "nein"}`);
            },
            onExecutiveActionTargetChosen: function() {
                switch (App.gameData.lastExecutiveAction) {
                    case Executive_Action.PolicyPeek:
                        log(`President ${App.gameData.president.name} peeked the next 3 policies.`);
                        break;
                    case Executive_Action.SpecialElection:
                        log(`Special Election! ${App.gameData.lastExecutiveActionTarget.name} will now be president.`);
                        break;
                    case Executive_Action.Execution:
                        log(`President ${App.gameData.president.name} has executed ${App.gameData.lastExecutiveActionTarget.name}!`);
                        if (App.gameData.lastExecutiveActionTarget.id === App.myPlayerId) {
                            App.dead = true;
                        }
                        break;
                    case Executive_Action.InvestigateLoyalty:
                        log(`President ${App.gameData.president.name} has investigated ${App.gameData.lastExecutiveActionTarget.name}'s loyalty.`);
                        break;
                }
            },
            onVoteFinished: function() {
                if (App.gameData.currentElection.didPass()) {
                    log(`Vote passed! ${App.gameData.chancellor.name} is now Chancellor.`)
                } else {
                    log(`Vote failed!`);
                }
            },
            onPolicyPlayed: function() {
                log(`President ${App.gameData.president.name} and Chancellor ${App.gameData.chancellor.name} have enacted a ${App.gameData.lastPolicy.toString()} policy!`);
            },
            onPolicyPlayedByCountry: function() {
                log(`The country is in chaos! The people have enacted a ${App.gameData.lastPolicy.toString()} policy!`);

            },
            /**
             * A player has successfully joined the game.
             * @param data {{playerName: string, gameId: int, mySocketId: int}}
             */
            playerJoinedRoom : function() {
                log(`${App.gameData.players[App.gameData.players.length - 1].name} joined the room!`);
                vm.players = App.gameData.players;
            },

            beginNewGame : function(data) {
                document.getElementById("startGameBtn").style.display = "none";
                for (let i = 0; i < App.gameData.players.length; i++) {
                    let p = App.gameData.players[i];
                    vm.roles = `${vm.roles}<br>${p.name} is ${p.role}`;
                    App.playerBtns[p.id] = document.getElementById(`${p.id}-btn`);
                }
            },

            gameOver : function(data) {
                switch (data.gameOverReason) {
                    case WinCondition.SixLiberalPolicies:
                        alert("Liberals Win! Six Liberal Policies have been played.");
                        break;
                    case WinCondition.SixFascistPolicies:
                        alert("Fascists Win! Six Fascist Policies have been played.");
                        break;
                    case WinCondition.HitlerIsChancellor:
                        alert(`Fascists Win! Hitler (${App.gameData.hitler.name}) has been elected Chancellor!`);
                        break;
                    case WinCondition.HitlerWasAssassinated:
                        alert(`Liberals Win! Hitler (${App.gameData.hitler.name}) has been assassinated!`);
                        break;
                }
            }

        },
        President: {
            onPresidentElected: function() {
                vm.disablePlayerButtons = false;
                log("Nominate chancellor");
                App.state = "nominateChancellor";
                if (CPU) {
                    setRandomTimeout(()=> {
                            let selectedPlayer;
                            do {
                                selectedPlayer = Rand.Choice(App.gameData.players);
                            } while (selectedPlayer.id === App.myPlayerId || selectedPlayer.dead || (App.gameData.lastChancellor && App.gameData.lastChancellor.id === selectedPlayer.id));
                            App.playerBtns[selectedPlayer.id].click();
                        },500,3000);
                }

            },
            onChancellorElected: function() {
                App.playerBtns[App.gameData.chancellor.id].classList.add("isChancellor");
                vm.policyChoices = App.gameData.presidentPolicies;

                    if (CPU) {
                        setRandomTimeout(function () {
                            let choice = Rand.Range(0,3);
                            App.$policyChoiceBtns[choice].click();
                        },500,2000)
                    }
                    vm.showPolicyChoices = true;

            },
            onVetoRequested: function () {
                IO.socket.emit("vetoApproved",{id: App.myPlayerId, approved:confirm("Approve the veto?")});
            },
            onExecutiveActionTriggered: function() {
                if (App.gameData.lastExecutiveAction === Executive_Action.PolicyPeek) {
                    log("Next 3 Policies are " + App.gameData.policyDeck.peek(3).map(x => x.toString()).join(", "));
                    IO.socket.emit('chooseEATarget');
                } else {
                    vm.disablePlayerButtons = false;
                    App.state = "executiveAction";
                    switch (App.gameData.lastExecutiveAction) {
                        case Executive_Action.InvestigateLoyalty:
                            log("Choose someone to investigate their loyalty.");
                            break;
                        case Executive_Action.Execution:
                            log("Choose someone to execute.");
                            break;
                        case Executive_Action.SpecialElection:
                            log("Choose the president for next turn.");
                            break;
                    }
                    if (CPU) {
                        setRandomTimeout(()=> {
                            let selectedPlayer;
                            do {
                                selectedPlayer = Rand.Choice(App.gameData.players);
                            } while (selectedPlayer.id === App.myPlayerId || selectedPlayer.dead || (App.gameData.lastChancellor && App.gameData.lastChancellor.id === selectedPlayer.id));
                            App.playerBtns[selectedPlayer.id].click();
                        },500,3000);
                    }
                }
            }
        },
        Chancellor: {
            onPresidentPolicyChosen: function() {
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
                        let choice = Rand.Range(0,2);
                        App.$policyChoiceBtns[choice].click();
                    },500,2000)
                }
            },
        },
        getPlayerById: function(id) {
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
window.onload = function() {

    IO.init();
    App.init();
};

function setRandomTimeout(func, min, max) {
    setTimeout(func,Rand.Range(min,max));
}
let $messageBox = undefined;
function log(message) {
    if (DEBUG) {
        if (!$messageBox) {
            $messageBox = document.getElementById("messageBox");
        }
        let existingHtml = $messageBox.innerHTML;
        existingHtml = existingHtml.split("<br>");
        if (existingHtml.length > 8) {
            console.log(existingHtml[0]);
            existingHtml = existingHtml.slice(existingHtml.length-8);
        }
        existingHtml.push(message);
        $messageBox.innerHTML = existingHtml.join("<br>");
    }
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
    },
    methods: {
        playerButtonClick: function(id) {
            let selectedPlayer = App.getPlayerById(+id);
            if (selectedPlayer.dead) {
                alert(`${selectedPlayer.name} is dead!`);
            }
            if (App.state === "nominateChancellor") {
                if (App.gameData.lastChancellor && selectedPlayer.id === App.gameData.lastChancellor.id) {
                    alert("can't be chancellor twice in a row")
                } else {
                    IO.socket.emit("presidentNominate", {nominee: selectedPlayer});
                    this.disablePlayerButtons = true;
                }
            } else if (App.state === "executiveAction") {
                if (App.gameData.lastExecutiveAction === Executive_Action.InvestigateLoyalty) {
                    let loyalty = selectedPlayer.role;
                    if (loyalty === Enums.Role.Hitler) {
                        loyalty = Enums.Role.Fascist;
                    }
                    log(`${selectedPlayer.name} is ${loyalty}!`);
                }
                IO.socket.emit("chooseEATarget",{target:selectedPlayer});
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
            if (App.state === "nominateChancellor") {
                return App.gameData.lastChancellor && App.gameData.lastChancellor.id == id;
            }
            return false;
        },
        getPolicyClass: function(index) {
            if (App.gameData && App.gameData.presidentPolicies && App.gameData.presidentPolicies[+index]) {
                if (App.gameData.presidentPolicies[+index].isLiberal) {
                    return "liberalPolicy";
                } else {
                    return "fascistPolicy"
                }
            }
            return "";
        },
        policyChoiceClick: function(index) {
            if (App.amIThePresident()) {

            let choices = [];


            switch (index) {
                case 0:
                    choices = [App.gameData.presidentPolicies[1],App.gameData.presidentPolicies[2]];
                    break;
                case 1:
                    choices = [App.gameData.presidentPolicies[0],App.gameData.presidentPolicies[2]];
                    break;
                case 2:
                    choices = [App.gameData.presidentPolicies[0],App.gameData.presidentPolicies[1]];
                    break;
            }

            IO.socket.emit('choosePresidentPolicies', {id: App.myPlayerId, policies: choices});
            } else {

            IO.socket.emit('chooseChancellorPolicy', {id: App.myPlayerId, policies: [App.gameData.chancellorPolicies[index === 1 ? 0 : 1]]});
            }
            this.policyChoices = [];
            this.showVetoButton = false;
        },
        vetoButtonClick: function() {
            this.showVetoButton = false;
            IO.socket.emit('chancellorRequestedVeto');
        }
    }
});


/***/ }),
/* 3 */
/***/ (function(module, exports) {

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
    5: {Liberals: 3, Fascists: 1, hitlerKnowsFascists: true, board:[Executive_Action.Execution, Executive_Action.NoAction, Executive_Action.PolicyPeek, Executive_Action.SpecialElection, Executive_Action.Execution]},
    6: {Liberals: 4, Fascists: 1, hitlerKnowsFascists: true, board:[Executive_Action.NoAction, Executive_Action.NoAction, Executive_Action.PolicyPeek, Executive_Action.Execution, Executive_Action.Execution]},
    7: {Liberals: 4, Fascists: 2, hitlerKnowsFascists: false, board:[Executive_Action.NoAction, Executive_Action.InvestigateLoyalty, Executive_Action.SpecialElection, Executive_Action.Execution, Executive_Action.Execution]},
    8: {Liberals: 5, Fascists: 2, hitlerKnowsFascists: false, board:[Executive_Action.NoAction, Executive_Action.InvestigateLoyalty, Executive_Action.SpecialElection, Executive_Action.Execution, Executive_Action.Execution]},
    9: {Liberals: 5, Fascists: 3, hitlerKnowsFascists: false, board:[Executive_Action.InvestigateLoyalty, Executive_Action.InvestigateLoyalty, Executive_Action.SpecialElection, Executive_Action.Execution, Executive_Action.Execution]},
    10: {Liberals: 6, Fascists: 3, hitlerKnowsFascists: false, board:[Executive_Action.InvestigateLoyalty, Executive_Action.InvestigateLoyalty, Executive_Action.SpecialElection, Executive_Action.Execution, Executive_Action.Execution]}
};
const WinCondition = {
    HitlerIsChancellor: 0,
    HitlerWasAssassinated: 1,
    SixFascistPolicies: 2,
    SixLiberalPolicies: 3
};
const Role = {
    Liberal: "Liberal",
    Fascist: "Fascist",
    Hitler: "Hitler"
};
module.exports = {
    Executive_Action: Executive_Action,
    Setups: Setups,
    WinCondition: WinCondition,
    Role: Role
}

/***/ }),
/* 4 */
/***/ (function(module, exports) {




class Election {
    constructor(president, chancellor, numVotes) {
        if (typeof chancellor === "undefined" && typeof numVotes === "undefined") {
            this.president = president.president;
            this.chancellor = president.chancellor;
            this.jas = president.jas;
            this.neins = president.neins;
            this.numVotes = president.numVotes;
        } else {

            this.president = president;
            this.chancellor = chancellor;
            this.numVotes = numVotes;
            this.jas = [];
            this.neins = [];
        }
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
        return (this.jas.length + this.neins.length === this.numVotes)
    }


}

module.exports = {
    Election: Election
}

/***/ }),
/* 5 */
/***/ (function(module, exports) {

class Player {
    constructor(index, name, id) {
        this.index = index;
        this.name = name;
        this.id = id;
        this.dead = false;
    }
}
module.exports = Player;

/***/ })
/******/ ]);