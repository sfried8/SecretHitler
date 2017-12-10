;
const DEBUG = true;
const CPU = true;
jQuery.fn.extend({
    disable: function(state) {
        return this.each(function() {
            this.disabled = state;
        });
    }
});

class Policy {
    constructor(obj) {
        this.isLiberal = obj.isLiberal;
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
    constructor(obj) {
        this.deckSource = obj.deckSource.map(x => new Policy(x));
        this.deck = obj.deck.map(x => new Policy(x));
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
    constructor(obj) {
        this.president = obj.president;
        this.chancellor = obj.chancellor;
        this.jas = obj.jas;
        this.neins = obj.neins;
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




jQuery(function($){
    'use strict';


    class Player {
        constructor(index, name, id) {
            this.index = index;
            this.name = name;
            this.id = id;
        }
    }
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
    const Role = {
        Liberal: "Liberal",
        Fascist: "Fascist",
        Hitler: "Hitler"
    };
    /**
     * All the code relevant to Socket.IO is collected in the IO namespace.
     *
     * @type {{init: Function, bindEvents: Function, onConnected: Function, onNewGameCreated: Function, playerJoinedRoom: Function, beginNewGame: Function, onNewWordData: Function, hostCheckAnswer: Function, gameOver: Function, error: Function}}
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
            IO.socket.on('playerVoted', IO.onPlayerVoted);
            IO.socket.on('voteFinished', IO.onVoteFinished);
            IO.socket.on('policyPlayed', IO.onPolicyPlayed);

        },

        onPresidentElected: function(data) {
            convertGameDataToClass(data);
            App.playerBtns.forEach(function (b) {
                b.disable(true);
                b.removeClass("isPresident isChancellor");
                if (+b.val() === App.gameData.president.id) {
                    b.addClass("isPresident");
                }
                if (App.gameData.president.id === App.myPlayerId) {
                    if (+b.val() !== +App.myPlayerId && (!App.gameData.lastChancellor || App.gameData.lastChancellor.id !== App.getPlayerById(+b.val()).id)) {
                        b.disable(false);
                    }
                }
            });
            if (App.gameData.president.id === App.myPlayerId) {
                log("Nominate chancellor");
                App.state = "nominateChancellor"
            } else {
                log(`Waiting for President ${data.president.name} to nominate Chancellor`)
            }
        },
        onChancellorNominated: function(data) {
            log("time to vote on "+data.chancellorNominee.name);
            if (CPU) {
                setRandomTimeout(function () {
                    if (randomBoolean(80)) {
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
        onChancellorElected: function(data) {
            convertGameDataToClass(data);
            App.playerBtns[App.gameData.chancellor.id].addClass("isChancellor");
            if (App.gameData.president.id === App.myPlayerId) {
                log(data.presidentPolicies.map(x => x.toString()));
                if (CPU) {
                    setRandomTimeout(function () {
                        let choices = [];
                        let notChosen = randomNumber(0,3);
                        switch (notChosen) {
                            case 0:
                                choices = [data.presidentPolicies[1],data.presidentPolicies[2]];
                                break;
                            case 1:
                                choices = [data.presidentPolicies[0],data.presidentPolicies[2]];
                                break;
                            case 2:
                                choices = [data.presidentPolicies[0],data.presidentPolicies[1]];
                                break;
                        }
                        IO.socket.emit('choosePresidentPolicies', {id: App.myPlayerId, policies: choices});

                    },500,5000)
                }
            } else {
                //TODO
                log(`Waiting for President ${App.gameData.president.name} to pick policies`);
            }
        },
        onPresidentPolicyChosen: function(data) {
            convertGameDataToClass(data);
            if (App.gameData.chancellor.id === App.myPlayerId) {
                log(data.chancellorPolicies.map(x => x.toString()));
                if (CPU) {
                    setRandomTimeout(function () {

                        IO.socket.emit('chooseChancellorPolicy', {id: App.myPlayerId, policies: [data.chancellorPolicies[randomBoolean() ? 0 : 1]]});

                    },500,5000)
                }
            } else {
                log(`President ${App.gameData.president.name} has chosen 2 policies. Waiting for Chancellor ${App.gameData.chancellor.name} to enact one of them.`)
            }
        },
        onExecutiveActionTriggered: function(data) {

        },
        onPlayerVoted: function(data) {
            log(`${App.getPlayerById(data.id).name} voted ${data.vote ? "ja" : "nein"}`);
        },
        onVoteFinished: function(data) {
            convertGameDataToClass(data);
            if (App.gameData.currentElection.didPass()) {
                log(`Vote passed! ${App.gameData.chancellor.name} is now Chancellor.`)
            } else {
                log(`Vote failed!`);
            }
        },
        onPolicyPlayed: function(data) {
            convertGameDataToClass(data);
            log(`President ${App.gameData.president.name} and Chancellor ${App.gameData.chancellor.name} have enacted a ${App.gameData.lastPolicy.toString()} policy!`);
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
            log(data.players[data.players.length-1].name + " joined the room!");
            let buttons = $("#playerButtons");
            for (let i = 0; i < App.gameData.players.length; i++) {
                let p = App.gameData.players[i];
                if (!App.playerBtns[p.id]) {
                    buttons.append(`<button class="playerButton" value="${p.id}" id="${p.id}-btn">${p.name}</button>`);
                    App.playerBtns[p.id] = $(`#${p.id}-btn`);
                    App.playerBtns[p.id].off().click(function(m) {
                        if (App.state === "nominateChancellor") {
                            let $btn = $(this);
                            let selectedPlayer = App.getPlayerById(+$btn.val());
                            if (App.gameData.lastChancellor && selectedPlayer.id === App.gameData.lastChancellor.id) {
                                alert("can't be chancellor twice in a row")
                            } else {
                                IO.socket.emit("presidentNominate", {nominee: selectedPlayer});
                            }
                        }

                    })

                }
            }
            if (data.hostId === App.myPlayerId) {
                $("#startGameBtn").show();
            }
        },

        /**
         * Both players have joined the game.
         * @param data
         */
        beginNewGame : function(data) {
            $.each(data.players,function(i,p) {
                log(p.name + " is "+p.role);
            });
        },



        /**
         * Let everyone know the game has ended.
         * @param data
         */
        gameOver : function(data) {
            App[App.myRole].endGame(data);
            App.$gameArea.show()
        },

        /**
         * An error has occurred.
         * @param data
         */
        error : function(data) {
            alert(data.message);
        }

    };

    var App = {

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

        /**
         * Identifies the current round. Starts at 0 because it corresponds
         * to the array of word data stored on the server.
         */
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
        },

        /**
         * Create some click handlers for the various buttons that appear on-screen.
         */
        bindEvents: function () {
            // Host
            App.$doc.on('click', '#btnCreateGame', App.Host.onCreateClick);
            App.$doc.on('click', '#inputSubmit', function() {
                var $message = $("#inputMessage");
                var messageContent = $message.val();
                $message.val("");
                var $data = $("#inputData");
                var dataContent = $data.val();
                $data.val("");

                IO.socket.emit(messageContent,JSON.parse(dataContent));
            });
            App.$doc.on('click', '#startGameBtn', App.Player.onVIPStart);

            // Player
            App.$doc.on('click', '#btnJoinGame', App.Player.onJoinClick);
            App.$doc.on('click', '#btnStart',App.Player.onPlayerStartClick);
            App.$doc.on('click', '.btnAnswer',App.Player.onPlayerAnswerClick);
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
            App.doTextFit('.title');
        },


        /* *******************************
           *         HOST CODE           *
           ******************************* */
        Host : {

            /**
             * Contains references to player data
             */
            players : [],

            /**
             * Flag to indicate if a new game is starting.
             * This is used after the first game ends, and players initiate a new game
             * without refreshing the browser windows.
             */
            isNewGame : false,

            /**
             * Keep track of the number of players that have joined the game.
             */
            numPlayersInRoom: 0,

            /**
             * A reference to the correct answer for the current round.
             */
            currentCorrectAnswer: '',

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
            },

            /**
             * Show the Host screen containing the game URL and unique game ID
             */
            displayNewGameScreen : function() {
                // Fill the game screen with the appropriate HTML
                App.$gameArea.html(App.$templateNewGame);

                // Display the URL on screen
                $('#gameURL').text(window.location.href);
                App.doTextFit('#gameURL');

                // Show the gameId / room id on screen
                $('#spanNewGameCode').text(App.gameId);
            },

            /**
             * Update the Host screen when the first player joins
             * @param data{{playerName: string}}
             */
            updateWaitingScreen: function(data) {
                // If this is a restarted game, show the screen.
                if ( App.Host.isNewGame ) {
                    App.Host.displayNewGameScreen();
                }
                // Update host screen
                $('#playersWaiting')
                    .append('<p/>')
                    .text('Player ' + data.playerName + ' joined the game.');

                // Store the new player's data on the Host.
                App.Host.players.push(data);

                // Increment the number of players in the room
                App.Host.numPlayersInRoom += 1;

                // If two players have joined, start the game!
                if (App.Host.numPlayersInRoom === 2) {
                    // console.log('Room is full. Almost ready!');

                    // Let the server know that two players are present.
                    IO.socket.emit('hostRoomFull',App.gameId);
                }
            },

            /**
             * Show the countdown screen
             */
            gameCountdown : function() {

                // Prepare the game screen with new HTML
                App.$gameArea.html(App.$hostGame);
                App.doTextFit('#hostWord');

                // Begin the on-screen countdown timer
                var $secondsLeft = $('#hostWord');
                App.countDown( $secondsLeft, 5, function(){
                    IO.socket.emit('hostCountdownFinished', App.gameId);
                });

                // Display the players' names on screen
                $('#player1Score')
                    .find('.playerName')
                    .html(App.Host.players[0].playerName);

                $('#player2Score')
                    .find('.playerName')
                    .html(App.Host.players[1].playerName);

                // Set the Score section on screen to 0 for each player.
                $('#player1Score').find('.score').attr('id',App.Host.players[0].mySocketId);
                $('#player2Score').find('.score').attr('id',App.Host.players[1].mySocketId);
            },

            /**
             * Show the word for the current round on screen.
             * @param data{{round: *, word: *, answer: *, list: Array}}
             */
            newWord : function(data) {
                // Insert the new word into the DOM
                $('#hostWord').text(data.word);
                App.doTextFit('#hostWord');

                // Update the data for the current round
                App.Host.currentCorrectAnswer = data.answer;
                App.Host.currentRound = data.round;
            },

            /**
             * Check the answer clicked by a player.
             * @param data{{round: *, playerId: *, answer: *, gameId: *}}
             */
            checkAnswer : function(data) {
                // Verify that the answer clicked is from the current round.
                // This prevents a 'late entry' from a player whos screen has not
                // yet updated to the current round.
                if (data.round === App.currentRound){

                    // Get the player's score
                    var $pScore = $('#' + data.playerId);

                    // Advance player's score if it is correct
                    if( App.Host.currentCorrectAnswer === data.answer ) {
                        // Add 5 to the player's score
                        $pScore.text( +$pScore.text() + 5 );

                        // Advance the round
                        App.currentRound += 1;

                        // Prepare data to send to the server
                        var data = {
                            gameId : App.gameId,
                            round : App.currentRound
                        }

                        // Notify the server to start the next round.
                        IO.socket.emit('hostNextRound',data);

                    } else {
                        // A wrong answer was submitted, so decrement the player's score.
                        $pScore.text( +$pScore.text() - 3 );
                    }
                }
            },


            /**
             * All 10 rounds have played out. End the game.
             * @param data
             */
            endGame : function(data) {
                // Get the data for player 1 from the host screen
                var $p1 = $('#player1Score');
                var p1Score = +$p1.find('.score').text();
                var p1Name = $p1.find('.playerName').text();

                // Get the data for player 2 from the host screen
                var $p2 = $('#player2Score');
                var p2Score = +$p2.find('.score').text();
                var p2Name = $p2.find('.playerName').text();

                // Find the winner based on the scores
                var winner = (p1Score < p2Score) ? p2Name : p1Name;
                var tie = (p1Score === p2Score);

                // Display the winner (or tie game message)
                if(tie){
                    $('#hostWord').text("It's a Tie!");
                } else {
                    $('#hostWord').text( winner + ' Wins!!' );
                }
                App.doTextFit('#hostWord');

                // Reset game data
                App.Host.numPlayersInRoom = 0;
                App.Host.isNewGame = true;
            },

            /**
             * A player hit the 'Start Again' button after the end of a game.
             */
            restartGame : function() {
                App.$gameArea.html(App.$templateNewGame);
                $('#spanNewGameCode').text(App.gameId);
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
                const names = ["Sam","Mike","George","Andrew","Max","Kutik","Hussein","Aaron","Derrick","Eden","Poop","Butt","John","Charlie","Frank","Randy","Jimbo","Stan","Kyle","Eric","Butters","Kenny"]
                App.myPlayerId = ( Math.random() * 100000 ) | 0;
                // collect data to send to the server
                var data = {
                    playerName : $('#inputPlayerName').val() || names[App.myPlayerId % 22],
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
                IO.socket.emit('VIPStart');
            },
            /**
             *  Click handler for the Player hitting a word in the word list.
             */
            onPlayerAnswerClick: function() {
                // console.log('Clicked Answer Button');
                var $btn = $(this);      // the tapped button
                var answer = $btn.val(); // The tapped word

                // Send the player info and tapped word to the server so
                // the host can check the answer.
                var data = {
                    gameId: App.gameId,
                    playerId: App.mySocketId,
                    answer: answer,
                    round: App.currentRound
                }
                IO.socket.emit('playerAnswer',data);
            },

            /**
             *  Click handler for the "Start Again" button that appears
             *  when a game is over.
             */
            onPlayerRestart : function() {
                var data = {
                    gameId : App.gameId,
                    playerName : App.Player.myName
                }
                IO.socket.emit('playerRestart',data);
                App.currentRound = 0;
                $('#gameArea').html("<h3>Waiting on host to start new game.</h3>");
            },

            /**
             * Display the waiting screen for player 1
             * @param data
             */
            updateWaitingScreen : function(data) {
                if(IO.socket.socket.sessionid === data.mySocketId){
                    App.myRole = 'Player';
                    App.gameId = data.gameId;

                    $('#playerWaitingMessage')
                        .append('<p/>')
                        .text('Joined Game ' + data.gameId + '. Please wait for game to begin.');
                }
            },

            /**
             * Display 'Get Ready' while the countdown timer ticks down.
             * @param hostData
             */
            gameCountdown : function(hostData) {
                App.Player.hostSocketId = hostData.mySocketId;
                $('#gameArea')
                    .html('<div class="gameOver">Get Ready!</div>');
            },

            /**
             * Show the list of words for the current round.
             * @param data{{round: *, word: *, answer: *, list: Array}}
             */
            newWord : function(data) {
                // Create an unordered list element
                var $list = $('<ul/>').attr('id','ulAnswers');

                // Insert a list item for each word in the word list
                // received from the server.
                $.each(data.list, function(){
                    $list                                //  <ul> </ul>
                        .append( $('<li/>')              //  <ul> <li> </li> </ul>
                            .append( $('<button/>')      //  <ul> <li> <button> </button> </li> </ul>
                                .addClass('btnAnswer')   //  <ul> <li> <button class='btnAnswer'> </button> </li> </ul>
                                .addClass('btn')         //  <ul> <li> <button class='btnAnswer'> </button> </li> </ul>
                                .val(this)               //  <ul> <li> <button class='btnAnswer' value='word'> </button> </li> </ul>
                                .html(this)              //  <ul> <li> <button class='btnAnswer' value='word'>word</button> </li> </ul>
                            )
                        )
                });

                // Insert the list onto the screen.
                $('#gameArea').html($list);
            },

            /**
             * Show the "Game Over" screen.
             */
            endGame : function() {
                $('#gameArea')
                    .html('<div class="gameOver">Game Over!</div>')
                    .append(
                        // Create a button to start a new game.
                        $('<button>Start Again</button>')
                            .attr('id','btnPlayerRestart')
                            .addClass('btn')
                            .addClass('btnGameOver')
                    );
            }
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
    setTimeout(func,randomNumber(min,max));
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
function randomBoolean(chanceForTrue) {
    if (chanceForTrue === null || typeof chanceForTrue === "undefined") {
        chanceForTrue = 50;
    }
    chanceForTrue = clamp(chanceForTrue,0,100);
    let rand = (Math.random() * 100)|0;
    return (rand < chanceForTrue);
}
function randomNumber(min, max) {
    return ((Math.random() * (max - min))+min)|0;
}
function clamp(num,min,max) {
    if (num < min) {
        num = min;
    }
    if (num > max) {
        num = max;
    }
    return num;
}