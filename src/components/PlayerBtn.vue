<template>
    <mt-button class="playerButton" :class="classNames" @click="playerButtonClick">
        {{name}}
    </mt-button>
</template>

<script lang="ts">
import { GameState } from "../Enums";
export default {
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
    },
    computed: {
        classNames: function() {
            const classArray = [];
            if (this.dead) {
                classArray.push("isDead");
            }
            if (this.president != null && this.pid == this.president.id) {
                classArray.push("isPresident");
            }
            if (this.chancellor != null && this.pid == this.chancellor.id) {
                classArray.push("isChancellor");
            }
            if (this.invalidTarget) {
                classArray.push("animated shake");
            }
            return classArray;
        }
    }
};
</script>
<style>
.isPresident::before {
    content: "President ";
}
.isChancellor::before {
    content: "Chancellor ";
}
.isDead::after {
    content: " (DEAD)";
}
.playerButton {
    background-color: #333;
    border-radius: 20px;
    font-family: "courier-prime", Courier, sans-serif;
    font-size: 9pt !important;
    line-height: 20px;
    color: #fbb969;
}
</style>
