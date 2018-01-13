<template>
    <div id="playerButtons">
        <player-btn @log="log" @player-button-click="playerButtonClick" :dead="p.dead" 
        :president="president" :chancellor="chancellor" :last-chancellor="lastChancellor" 
        :game-state="gameState" :my-player-id="myPlayerId" :pid="p.id" :key="p.id" :name="p.name" 
        v-for="p in players"></player-btn>
    </div>
</template>

<script lang="ts">
export default {
    props: [
        "players",
        "president",
        "chancellor",
        "lastChancellor",
        "gameState",
        "myPlayerId"
    ],
    methods: {
        playerButtonClick: function(pid: number) {
            this.$emit("player-button-click", pid);
        },
        log: function(value: string) {
            this.$emit("log", value);
        }
    }
};
</script>

<style>
#playerButtons {
    width: 90%;
    max-height: 25%;
    grid-gap: 10px;
    margin: auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 2fr));
    /* grid-template-rows: repeat(3, 55px); */
}
</style>
