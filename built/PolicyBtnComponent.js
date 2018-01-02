"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const popmotion_1 = require("popmotion");
const easing_1 = require("popmotion/easing");
exports.PolicyBtn = {
    template: `<button @click="policyChoiceClick()" class="noBorder policyBtn">
    <img :src="isLiberal ? '../img/liberalpolicy.png' : '../img/fascistpolicy.png'">
    </button>`,
    props: ["pcIndex", "isLiberal"],
    methods: {
        policyChoiceClick: function () {
            this.$emit("policy-choice-click", this.pcIndex);
        }
    }
};
exports.PolicyChoiceGroup = {
    template: `<transition-group name="policy-anim" @before-enter="policyAnimBeforeEnter" @enter="policyAnimEnter" @leave="discardPolicyLeave">
                        <policy-btn @policy-choice-click="policyChoiceClick" v-for="(p,index) in policyChoices" :pcIndex="index" :isLiberal="p.isLiberal" :key="p.id">
                        </policy-btn>
                    </transition-group>`,
    props: ["policyChoices"],
    data: function () {
        return { discardingPolicy: true, lastSize: 0 };
    },
    watch: {
        policyChoices: function (val, oldVal) {
            const newSize = val.length;
            if (newSize > this.lastSize) {
                this.discardingPolicy = true;
            }
            this.lastSize = newSize;
        }
    },
    methods: {
        policyChoiceClick: function (index) {
            this.$emit("policy-choice-click", index);
        },
        policyAnimEnter: function (el, done) {
            const elStyler = popmotion_1.styler(el);
            popmotion_1.tween({
                from: { rotateX: -90 },
                to: { rotateX: 0 },
                duration: 750
            }).start({ update: elStyler.set, complete: done });
        },
        policyAnimBeforeEnter: function (el, done) {
            // el.style.transform = "rotate3d(1, 0, 0, -90deg)";
        },
        discardPolicyLeave: function (el, done) {
            const elStyler = popmotion_1.styler(el);
            popmotion_1.tween({
                from: { y: 0, opacity: 1 },
                to: {
                    y: this.discardingPolicy ? 300 : -300,
                    opacity: this.discardingPolicy ? 0 : 1
                },
                ease: easing_1.easeIn,
                duration: 750
            }).start({ update: elStyler.set, complete: done });
            this.discardingPolicy = false;
        }
    }
};
