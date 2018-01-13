<template>
    <button class="voteButton noBorder" @click="voteButtonClick" :class="animatedClass">
        <img :src="imgSrc" />
    </button>
</template>

<script lang="ts">
export default {
    props: ["ja", "show"],
    methods: {
        voteButtonClick: function() {
            this.$emit("vote", this.ja);
        }
    },
    computed: {
        imgSrc: function() {
            return this.ja ? "../img/ja.png" : "../img/nein.png";
        },
        animatedClass: function() {
            return this.show ? "animated pulse" : "";
        }
    }
};
</script>

<style>
.voteButton {
    display: flex;
    align-content: center;
    justify-content: center;
    margin: 15px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5);
    border-radius: 5px;
}
.voteButton img {
    width: 100%;
}
</style>
