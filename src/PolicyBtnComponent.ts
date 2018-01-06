import { tween, styler } from "popmotion";
import { easeIn } from "popmotion/easing";
export const PolicyBtn = {
    template: `<button @click="policyChoiceClick" class="noBorder policyBtn" :class="isSelected?'selected':''">
    <img :src="isLiberal ? '../img/liberalpolicy.png' : '../img/fascistpolicy.png'">
    </button>`,
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

export const PolicyChoiceGroup = {
    template: `<div><transition-group name="policy-anim" @before-enter="policyAnimBeforeEnter" @enter="policyAnimEnter" @leave="discardPolicyLeave">
                        <policy-btn @policy-choice-click="policyChoiceClick" v-for="(p,index) in policyChoices" :pcIndex="index" :isLiberal="p.isLiberal" :key="p.id">
                        </policy-btn>

                    </transition-group>                        <br/>
                        <mt-button @click="submitChoices" v-show="policyChoices.length > 0" :disabled="disableSubmit">Submit</mt-button></div>`,
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
    computed: {
        disableSubmit: function() {
            return (
                this.policyChoices.filter((x: any) => x.isSelected).length !=
                this.policyChoices.length - 1
            );
        }
    },
    methods: {
        policyChoiceClick: function(index: number) {
            this.policyChoices[index].isSelected = !this.policyChoices[index]
                .isSelected;
        },
        policyAnimEnter: function(el, done) {
            const elStyler = styler(el);
            tween({
                from: {
                    rotateX: -90,
                    x: -this.x,
                    y: 250 - this.y,
                    scale: 0.5
                },
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
            el.classList.remove("selected");
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
        },
        submitChoices: function() {
            const selected = this.policyChoices.filter(
                (x: any) => x.isSelected
            );
            this.$emit("policy-choice-click", selected);
        }
    }
};
