;
const DEBUG = true;
let CPU = false;
jQuery.fn.extend({
    disable: function(state) {
        return this.each(function() {
            this.disabled = state;
        });
    }
});
const Enums = require('./Enums.js');
const WinCondition = Enums.WinCondition;
const Executive_Action = Enums.Executive_Action;
const Rand = require('./Rand.js');

const Policy = require('./Policy.js').Policy;
const PolicyDeck = require('./Policy.js').PolicyDeck;


const Election = require('./models.js').Election;



jQuery(function($){
    'use strict';
    
    const Player = require('./Player.js');
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

        $("#enactedPolicies").html(h);
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
            App.Player.beginNewGame(data);
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

        _gameData: {

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
        get gameData() {
            $("#gameData").val(JSON.stringify(this._gameData,null,3));
            return this._gameData;
        },
        set gameData(g) {
            $("#gameData").val(JSON.stringify(this._gameData,null,3));

            this._gameData = g;
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
            App.$doc = $(document);

            // Templates
            App.$gameArea = $('#gameArea');
            App.$templateIntroScreen = $('#intro-screen-template').html();
            App.$templateNewGame = $('#create-game-template').html();
            App.$templateJoinGame = $('#join-game-template').html();
            App.$hostGame = $('#host-game-template').html();
            App.$neinBtn = $("#nein-btn");
            App.$jaBtn = $("#ja-btn");
            App.$policyChoiceArea = $("#policyChoices");
            App.$policyChoiceBtns = [$("#policyChoice1"), $("#policyChoice2"), $("#policyChoice3")];
        },

        /**
         * Create some click handlers for the various buttons that appear on-screen.
         */
        bindEvents: function () {
            // Host
            App.$doc.on('click', '#btnCreateGame', App.Host.onCreateClick);
            App.$doc.on('click', '#inputSubmit', function() {
                const $message = $("#inputMessage");
                const messageContent = $message.val();
                $message.val("");
                const $data = $("#inputData");
                const dataContent = $data.val();
                $data.val("");

                IO.socket.emit(messageContent,JSON.parse(dataContent));
            });
            App.$doc.on('click', '#startGameBtn', App.Player.onVIPStart);

            // Player
            App.$doc.on('click', '#btnJoinGame', App.Player.onJoinClick);
            App.$doc.on('click', '#btnStart',App.Player.onPlayerStartClick);
            App.$doc.on('click', '#btnPlayerRestart', App.Player.onPlayerRestart);
        },

        /* *************************************
         *             Game Logic              *
         * *********************************** */

        /**
         * Show the initial Anagrammatix Title Screen
         * (with Start and Join buttons)
         */
        showInitScreen: function() {
            App.$gameArea.html(App.$templateIntroScreen);

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
                App.$gameArea.html(App.$templateJoinGame);
                setTimeout(()=>$("#btnStart").click(),100);
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
                    playerName : $('#inputPlayerName').val() || names[App.myPlayerId % 22]  + Rand.Range(1,100),
                    playerId : App.myPlayerId
                };

                // Send the gameId and playerName to the server
                IO.socket.emit('playerJoinGame', data);

                // Set the appropriate properties for the current player.
                App.myRole = 'Player';
                App.Player.myName = data.playerName;
                document.title = data.playerName;
                App.$gameArea.hide();
            },

            onVIPStart: function() {
                $("#startGameBtn").hide();
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
                $('#gameArea').html("<h3>Waiting on host to start new game.</h3>");
            },


            /////////////////////////////////////////////////
            ///////////////////////////////////////////////////
            onPresidentElected: function() {
                App.playerBtns.forEach(function (b) {
                    b.disable(true);
                    b.removeClass("isPresident isChancellor");
                    if (+b.val() === App.gameData.president.id) {
                        b.addClass("isPresident");
                    }
                    if (App.getPlayerById(+b.val()).dead) {
                        b.addClass("isDead");
                    }
                });
                log(`Waiting for President ${App.gameData.president.name} to nominate Chancellor`)

            },

            onChancellorNominated: function() {
                log("time to vote on "+App.gameData.chancellorNominee.name);
                if (App.dead) {
                    return;
                }
                if (CPU) {
                    setRandomTimeout(function () {
                        if (Rand.Boolean(80)) {
                            App.$jaBtn.disable(false);
                            App.$jaBtn.click();
                        } else {
                            App.$neinBtn.disable(false);
                            App.$neinBtn.click();
                        }
                    }, 500, 5000)
                } else {

                }
                App.$jaBtn.disable(false).off().click(function () {
                    App.$jaBtn.disable(true);
                    App.$neinBtn.disable(true);
                    IO.socket.emit('voteForChancellor',{id: App.myPlayerId, vote:true});
                });
                App.$neinBtn.disable(false).off().click(function () {
                    App.$jaBtn.disable(true);
                    App.$neinBtn.disable(true);
                    IO.socket.emit('voteForChancellor',{id: App.myPlayerId, vote:false});
                });
            },
            onChancellorElected: function() {
                App.playerBtns[App.gameData.chancellor.id].addClass("isChancellor");
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
                let buttons = $("#playerButtons");
                for (let i = 0; i < App.gameData.players.length; i++) {
                    let p = App.gameData.players[i];
                    if (!App.playerBtns[p.id]) {
                        buttons.append(`<button class="playerButton" value="${p.id}" id="${p.id}-btn">${p.name}</button>`);
                        App.playerBtns[p.id] = $(`#${p.id}-btn`);
                        App.playerBtns[p.id].off().click(function() {
                            let $btn = $(this);
                            let selectedPlayer = App.getPlayerById(+$btn.val());
                            if (selectedPlayer.dead) {
                                alert(`${selectedPlayer.name} is dead!`);
                            }
                            if (App.state === "nominateChancellor") {
                                if (App.gameData.lastChancellor && selectedPlayer.id === App.gameData.lastChancellor.id) {
                                    alert("can't be chancellor twice in a row")
                                } else {
                                    IO.socket.emit("presidentNominate", {nominee: selectedPlayer});
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
                            }

                        })

                    }
                }
            },

            beginNewGame : function(data) {
                $("#startGameBtn").hide();
                let x = $("#roles");
                $.each(data.players,function(i,p) {
                    x.html(`${x.html()}<br>${p.name} is ${p.role}`);
                });
            },

            gameOver : function(data) {
                App.$gameArea.show();
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
                App.playerBtns.forEach(function (b) {
                    b.disable(true);
                    b.removeClass("isPresident isChancellor");
                    if (+b.val() === App.gameData.president.id) {
                        b.addClass("isPresident");
                    }
                    if (App.getPlayerById(+b.val()).dead) {
                        b.addClass("isDead");
                    } else if (+b.val() !== +App.myPlayerId && (!App.gameData.lastChancellor || App.gameData.lastChancellor.id !== App.getPlayerById(+b.val()).id)) {
                            b.disable(false);

                    }
                });
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
                App.playerBtns[App.gameData.chancellor.id].addClass("isChancellor");
                    for (let i = 0; i < 3; i++) {
                        App.$policyChoiceBtns[i].disable(false).off().click(function () {
                            let choices = [];
                            let notChosen = +$(this).val();

                            switch (notChosen) {
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
                            for (let j = 0; j < 3; j++) {
                                App.$policyChoiceBtns[j].disable(true);
                                App.$policyChoiceBtns[j].removeClass("fascistPolicy liberalPolicy");

                            }
                            IO.socket.emit('choosePresidentPolicies', {id: App.myPlayerId, policies: choices});
                        });
                        App.$policyChoiceBtns[i].removeClass("fascistPolicy liberalPolicy");
                        if (App.gameData.presidentPolicies[i].isLiberal) {
                            App.$policyChoiceBtns[i].addClass("liberalPolicy")
                        } else {
                            App.$policyChoiceBtns[i].addClass("fascistPolicy")

                        }
                    }
                    if (CPU) {
                        setRandomTimeout(function () {
                            let choice = Rand.Range(0,3);
                            App.$policyChoiceBtns[choice].click();
                        },500,2000)
                    }

            },
            onVetoRequested: function () {
                IO.socket.emit("vetoApproved",{id: App.myPlayerId, approved:confirm("Approve the veto?")});
            },
            onExecutiveActionTriggered: function() {
                if (App.gameData.lastExecutiveAction === Executive_Action.PolicyPeek) {
                    log("Next 3 Policies are " + App.gameData.policyDeck.peek(3).map(x => x.toString()).join(", "));
                    IO.socket.emit('chooseEATarget');
                } else {
                    App.playerBtns.forEach(function (b) {
                        b.disable(false);
                    });
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
                for (let i = 0; i < 2; i++) {
                    App.$policyChoiceBtns[i].disable(false).off().click(function () {
                        let notChosen = +$(this).val();


                        for (let j = 0; j < 3; j++) {
                            App.$policyChoiceBtns[j].disable(true);
                            App.$policyChoiceBtns[j].removeClass("fascistPolicy liberalPolicy");
                        }
                        IO.socket.emit('chooseChancellorPolicy', {id: App.myPlayerId, policies: [App.gameData.chancellorPolicies[notChosen === 1 ? 0 : 1]]});
                    });
                    App.$policyChoiceBtns[i].removeClass("fascistPolicy liberalPolicy");
                    if (App.gameData.chancellorPolicies[i].isLiberal) {
                        App.$policyChoiceBtns[i].addClass("liberalPolicy")
                    } else {
                        App.$policyChoiceBtns[i].addClass("fascistPolicy")

                    }
                }
                if (App.gameData.enactedPolicies.fascists === 5) {
                    App.$policyChoiceBtns[2].disable(false).off().click(function() {
                        App.$policyChoiceBtns[2].disable(true);
                        IO.socket.emit('chancellorRequestedVeto');
                    })
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
        },
        /* **************************
                  UTILITY CODE
           ************************** */


        /**
         * Make the text inside the given element as big as possible
         * See: https://github.com/STRML/textFit
         *
         * @param el The parent element of some text
         */
        doTextFit : function(el) {
            textFit(
                $(el)[0],
                {
                    alignHoriz:true,
                    alignVert:false,
                    widthOnly:true,
                    reProcess:true,
                    maxFontSize:300
                }
            );
        },
    };

    IO.init();
    App.init();

}($));
function setRandomTimeout(func, min, max) {
    setTimeout(func,Rand.Range(min,max));
}
let $messageBox = undefined;
function log(message) {
    if (DEBUG) {
        if (!$messageBox) {
            $messageBox = $("#messageBox");
        }
        let existingHtml = $messageBox.html();
        existingHtml = existingHtml.split("<br>");
        if (existingHtml.length > 8) {
            console.log(existingHtml[0]);
            existingHtml = existingHtml.slice(existingHtml.length-8);
        }
        existingHtml.push(message);
        $messageBox.html(existingHtml.join("<br>"));
    }
}
