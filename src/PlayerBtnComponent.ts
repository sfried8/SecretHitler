import { GameState } from "./Enums";

export const PlayerBtnGroup = {
    template: `<div id="playerButtons"><player-btn @log="log" @player-button-click="playerButtonClick" :dead="p.dead" :president="president" :chancellor="chancellor" :last-chancellor="lastChancellor" :game-state="gameState" :my-player-id="myPlayerId" :pid="p.id" :key="p.id" :name="p.name" v-for="p in players"></player-btn></div>`,
    props: ["players", "president", "chancellor", "lastChancellor", "gameState", "myPlayerId"],
    methods: {
        playerButtonClick: function(pid: number) {
            this.$emit("player-button-click", pid);
        },
        log: function(value:string) {
            this.$emit("log",value);
        }
    }
};
export const PlayerBtn = {
    template: `<mt-button class="playerButton" :class="[dead ? 'isDead' : '', president!=null && pid == president.id ? 'isPresident' : '', chancellor!=null && pid == chancellor.id ? 'isChancellor' : '', invalidTarget ? 'animated shake':'']"
                @click="playerButtonClick">{{name}}</mt-button>`,
    props: [
        "dead",
        "pid",
        "name",
        "president",
        "chancellor",
        "lastChancellor",
        "gameState",
        "myPlayerId"
    ],
    data: function() {
        return { invalidTarget: false };
    },
    methods: {
        playerButtonClick: function() {
            let invalidTargetReason = "";
            if (this.dead) {
                invalidTargetReason = this.name + " is dead!";
            } else if (this.pid == this.myPlayerId) {
                invalidTargetReason = "That's you, dummy.";
            } else if (
                this.gameState === GameState.PresidentNominateChancellor
            ) {
                if (
                    this.lastChancellor != null &&
                    this.pid === this.lastChancellor.id
                ) {
                    invalidTargetReason =
                        this.name + " was Chancellor last turn.";
                }
            }
            if (invalidTargetReason != "") {
                this.invalidTarget = true;
                setTimeout(() => {
                    this.invalidTarget = false;
                }, 400);
                this.$emit("log", invalidTargetReason);
            } else {
                this.$emit("player-button-click", this.pid);
            }
        }
    }
};
