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
        return { discardingPolicy: true, lastSize: 0, x: 0, y: 0 };
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
                from: { rotateX: -90, x: -this.x, y: 250 - this.y, scale: 0.5 },
                to: { rotateX: 0, x: 0, y: 0, scale: 1 },
                duration: 750
            }).start({ update: elStyler.set, complete: done });
        },
        policyAnimBeforeEnter: function(el: HTMLElement, done) {
            let rect = el.getBoundingClientRect();
            this.x = rect.left;
            this.y = rect.top;
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
