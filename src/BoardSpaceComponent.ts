import { Executive_Action } from "./Enums";
import { tween, styler } from "popmotion";
import { easeIn } from "popmotion/easing";
export const BoardSpaceComponent = {
    template: `<div style="border-radius:3px;"  :style="{backgroundColor:backgroundColor}"><div @click="displayTooltip()">
    <img v-if="imgsrc!=null" :src="imgsrc" :class="policyPlayed?'animated zoomIn':''" style="width:90%;margin:auto;"/></div>    
    <mt-popup v-model="tooltipVisible" class="tooltipPopup" popup-transition="popup-fade">
      <p>{{tooltip}}</p>
</mt-popup></div>`,
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
export const ElectionTracker = {
    props: ["chaosLevel"],
    template: `<div style="display:flex;justify-content:space-around;grid-column:1 / 6;">
    <div class="electionTrackerSpot" id="electionTrackerSpot0" ></div>
    <div class="electionTrackerSpot" id="electionTrackerSpot1" ></div>
    <div class="electionTrackerSpot" id="electionTrackerSpot2" ></div>
    <div id="electionTracker" style="position:absolute" :class="chaosLevel==2?'animated pulse infinite':''" class="electionTrackerSpot filled"></div></div>`,
    data: function() {
        return {
            electionTracker: null
        };
    },
    mounted: function() {
        if (this.electionTracker == null) {
            this.electionTracker = document.getElementById("electionTracker");
            const elStyler = styler(this.electionTracker);
            const newBoundingBox = document
                .getElementById("electionTrackerSpot0")
                .getBoundingClientRect();
            console.log(newBoundingBox);
            tween({
                to: { left: newBoundingBox.left },
                duration: 10
            }).start({ update: elStyler.set });
        }
    },
    watch: {
        chaosLevel: function(newval: number, oldval: number) {
            const elStyler = styler(this.electionTracker);
            const oldBoundingBox = document
                .getElementById("electionTrackerSpot" + oldval)
                .getBoundingClientRect();
            const newBoundingBox = document
                .getElementById("electionTrackerSpot" + newval)
                .getBoundingClientRect();
            tween({
                from: { left: oldBoundingBox.left },
                to: { left: newBoundingBox.left },
                duration: 750
            }).start({ update: elStyler.set });
        }
    }
};
