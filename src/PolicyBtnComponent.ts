import { tween, styler } from "popmotion";
import { easeIn } from "popmotion/easing";
export const PolicyBtn = {
    template: `<button @click="policyChoiceClick()" class="noBorder policyBtn">
    <img :src="isLiberal ? '../img/liberalpolicy.png' : '../img/fascistpolicy.png'">
    </button>`,
    props: ["pcIndex", "isLiberal"],
    methods: {
        policyChoiceClick: function() {
            this.$emit("policy-choice-click", this.pcIndex);
        }
    }
};

export const PolicyChoiceGroup = {
    template: `<transition-group name="policy-anim" @before-enter="policyAnimBeforeEnter" @enter="policyAnimEnter" @leave="discardPolicyLeave">
                        <policy-btn @policy-choice-click="policyChoiceClick" v-for="(p,index) in policyChoices" :pcIndex="index" :isLiberal="p.isLiberal" :key="p.id">
                        </policy-btn>
                    </transition-group>`,
    props: ["policyChoices"],
    data: function() {
        return { discardingPolicy: true, lastSize: 0 };
    },
    watch: {
        policyChoices: function(val, oldVal) {
            const newSize = val.length;
            if (newSize > this.lastSize) {
                this.discardingPolicy = true;
            }
            this.lastSize = newSize;
        }
    },
    methods: {
        policyChoiceClick: function(index: number) {
            this.$emit("policy-choice-click", index);
        },
        policyAnimEnter: function(el, done) {
            const elStyler = styler(el);
            tween({
                from: { rotateX: -90 },
                to: { rotateX: 0 },
                duration: 750
            }).start({ update: elStyler.set, complete: done });
        },
        policyAnimBeforeEnter: function(el: HTMLElement, done) {
            // el.style.transform = "rotate3d(1, 0, 0, -90deg)";
        },
        discardPolicyLeave: function(el: Element, done: any) {
            const elStyler = styler(el);
            tween({
                from: { y: 0, opacity: 1 },
                to: {
                    y: this.discardingPolicy ? 300 : -300,
                    opacity: this.discardingPolicy ? 0 : 1
                },
                ease: easeIn,
                duration: 750
            }).start({ update: elStyler.set, complete: done });
            this.discardingPolicy = false;
        }
    }
};
