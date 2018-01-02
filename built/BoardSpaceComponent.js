"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Enums_1 = require("./Enums");
exports.BoardSpaceComponent = {
    template: `<div style="border-radius:3px;"  :style="{backgroundColor:backgroundColor}"><div @click="displayTooltip()">
    <img v-if="imgsrc!=null" :src="imgsrc" style="width:90%;margin:auto;"/></div>    
    <mt-popup v-model="tooltipVisible" class="tooltipPopup" popup-transition="popup-fade">
      <p>{{tooltip}}</p>
</mt-popup></div>`,
    props: ["executiveAction", "policyPlayed", "isLiberal"],
    data: function () {
        return { tooltipVisible: false, tooltip: "" };
    },
    computed: {
        imgsrc: function () {
            if (this.policyPlayed) {
                return this.isLiberal
                    ? "../img/liberalpolicy.png"
                    : "../img/fascistpolicy.png";
            }
            switch (this.executiveAction) {
                case Enums_1.Executive_Action.Execution:
                    return "../img/execution.png";
                case Enums_1.Executive_Action.InvestigateLoyalty:
                    return "../img/investigateloyalty.png";
                case Enums_1.Executive_Action.PolicyPeek:
                    return "../img/policypeek.png";
                case Enums_1.Executive_Action.SpecialElection:
                    return "../img/specialelection.png";
                default:
                    return null;
            }
        },
        backgroundColor: function () {
            if (this.isLiberal) {
                return "#0099cc";
            }
            return "#884444";
        }
    },
    methods: {
        displayTooltip: function () {
            if (!this.policyPlayed && !this.isLiberal && this.executiveAction) {
                let str = "";
                switch (this.executiveAction) {
                    case Enums_1.Executive_Action.Execution:
                        str = "The president must execute another player";
                        break;
                    case Enums_1.Executive_Action.InvestigateLoyalty:
                        str =
                            "The president checks the party membership of a player. *If investigating Hitler, the president will only see that (s)he is Fascist.";
                        break;
                    case Enums_1.Executive_Action.PolicyPeek:
                        str =
                            "The president sees the next 3 policies in the deck";
                        break;
                    case Enums_1.Executive_Action.SpecialElection:
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
exports.ElectionTracker = {
    props: ["chaosLevel"],
    template: `<div style="display:flex;justify-content:space-around;grid-column:1 / 6;">
    <div class="electionTrackerSpot" :class="chaosLevel===0 ? 'filled' : ''"></div>
    <div class="electionTrackerSpot" :class="chaosLevel===1 ? 'filled' : ''"></div>
    <div class="electionTrackerSpot" :class="chaosLevel===2 ? 'filled' : ''"></div>
    </div>`
};
