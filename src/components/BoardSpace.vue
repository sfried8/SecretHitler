<template>
  <div style="border-radius:3px;"  :style="{backgroundColor:backgroundColor}"><div @click="displayTooltip()">
    <img v-if="imgsrc!=null" :src="imgsrc" :class="policyPlayed?'animated zoomIn':''" style="width:90%;margin:auto;"/></div>    
    <mt-popup v-model="tooltipVisible" class="tooltipPopup" popup-transition="popup-fade">
      <p>{{tooltip}}</p>
</mt-popup></div>
</template>
<script lang="ts">
import { Executive_Action } from "../Enums";

export default {
    template: ``,
    props: ["executiveAction", "policyPlayed", "isLiberal"],
    data: function() {
        return { tooltipVisible: false, tooltip: "" };
    },
    computed: {
        imgsrc: function() {
            if (this.policyPlayed) {
                return this.isLiberal
                    ? "../img/liberalpolicy.png"
                    : "../img/fascistpolicy.png";
            }
            switch (this.executiveAction) {
                case Executive_Action.Execution:
                    return "../img/execution.png";
                case Executive_Action.InvestigateLoyalty:
                    return "../img/investigateloyalty.png";
                case Executive_Action.PolicyPeek:
                    return "../img/policypeek.png";
                case Executive_Action.SpecialElection:
                    return "../img/specialelection.png";
                default:
                    return null;
            }
        },
        backgroundColor: function() {
            if (this.isLiberal) {
                return "#0099cc";
            }
            return "#884444";
        }
    },
    methods: {
        displayTooltip: function() {
            if (!this.policyPlayed && !this.isLiberal && this.executiveAction) {
                let str = "";
                switch (this.executiveAction) {
                    case Executive_Action.Execution:
                        str = "The president must execute another player";
                        break;
                    case Executive_Action.InvestigateLoyalty:
                        str =
                            "The president checks the party membership of a player. *If investigating Hitler, the president will only see that (s)he is Fascist.";
                        break;
                    case Executive_Action.PolicyPeek:
                        str =
                            "The president sees the next 3 policies in the deck";
                        break;
                    case Executive_Action.SpecialElection:
                        str =
                            "The president chooses the president for next turn";
                }
                if (str) {
                    this.tooltip = str;
                    this.tooltipVisible = true;
                }
            }
        }
    }
};
</script>
