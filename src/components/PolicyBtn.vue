<template>
  <button @click="policyChoiceClick" class="noBorder policyBtn" :class="isSelected?'selected':''">
    <img :src="isLiberal ? '../img/liberalpolicy.png' : '../img/fascistpolicy.png'">
    </button>
</template>
<script lang="ts">
export default {
    props: ["pcIndex", "isLiberal"],
    data: function() {
        return { isSelected: false };
    },
    methods: {
        policyChoiceClick: function() {
            this.isSelected = !this.isSelected;
            this.$emit("policy-choice-click", this.pcIndex);
        }
    }
};
</script>
<style>
.policyBtn {
    width: 30%;
    background-color: transparent;
    display: inline-block;
    margin: 1.5%;
}
.policyBtn > img {
    width: 100%;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5);
    border-radius: 12px;
}
.policyBtn.selected {
    border: 5px solid limegreen;
}
</style>
