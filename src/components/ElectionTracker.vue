<template>
    <div class="electionTrackerContainer">
        <div class="electionTrackerSpot" id="electionTrackerSpot0" ></div>
        <div class="electionTrackerSpot" id="electionTrackerSpot1" ></div>
        <div class="electionTrackerSpot" id="electionTrackerSpot2" ></div>
        <div id="electionTracker" :class="pulseClass" class="electionTrackerToken"></div>
    </div>

</template>
<script lang="ts">
import { tween, styler } from "popmotion";

export default {
    props: ["chaosLevel"],
    data: function() {
        return {
            electionTracker: null as HTMLElement
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
            } as any).start({ update: elStyler.set });
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
            } as any).start({ update: elStyler.set });
        }
    },
    computed: {
        pulseClass: function() {
            return this.chaosLevel == 2 ? "animated pulse infinite" : "";
        }
    }
};
</script>
<style>
.electionTrackerContainer {
    display: flex;
    justify-content: space-around;
    grid-column: 1 / 6;
}
.electionTrackerSpot,
.electionTrackerToken {
    width: 30px;
    height: 30px;
    border-radius: 18px;
    border: 3px solid #fbb969;
}
.electionTrackerToken {
    position: absolute;
    background-color: #fbb969;
}
.electionTrackerToken.pulse {
    background-color: #ff2919;
}
</style>
