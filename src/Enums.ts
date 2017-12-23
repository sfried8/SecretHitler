export enum Executive_Action {
    NoAction,
    InvestigateLoyalty,
    SpecialElection,
    PolicyPeek,
    Execution
}
export const Setups = {
    3: {
        Liberals: 1,
        Fascists: 1,
        hitlerKnowsFascists: true,
        board: [
            Executive_Action.NoAction,
            Executive_Action.NoAction,
            Executive_Action.PolicyPeek,
            Executive_Action.Execution,
            Executive_Action.Execution
        ]
    },
    5: {
        Liberals: 3,
        Fascists: 1,
        hitlerKnowsFascists: true,
        board: [
            Executive_Action.Execution,
            Executive_Action.NoAction,
            Executive_Action.PolicyPeek,
            Executive_Action.SpecialElection,
            Executive_Action.Execution
        ]
    },
    6: {
        Liberals: 4,
        Fascists: 1,
        hitlerKnowsFascists: true,
        board: [
            Executive_Action.NoAction,
            Executive_Action.NoAction,
            Executive_Action.PolicyPeek,
            Executive_Action.Execution,
            Executive_Action.Execution
        ]
    },
    7: {
        Liberals: 4,
        Fascists: 2,
        hitlerKnowsFascists: false,
        board: [
            Executive_Action.NoAction,
            Executive_Action.InvestigateLoyalty,
            Executive_Action.SpecialElection,
            Executive_Action.Execution,
            Executive_Action.Execution
        ]
    },
    8: {
        Liberals: 5,
        Fascists: 2,
        hitlerKnowsFascists: false,
        board: [
            Executive_Action.NoAction,
            Executive_Action.InvestigateLoyalty,
            Executive_Action.SpecialElection,
            Executive_Action.Execution,
            Executive_Action.Execution
        ]
    },
    9: {
        Liberals: 5,
        Fascists: 3,
        hitlerKnowsFascists: false,
        board: [
            Executive_Action.InvestigateLoyalty,
            Executive_Action.InvestigateLoyalty,
            Executive_Action.SpecialElection,
            Executive_Action.Execution,
            Executive_Action.Execution
        ]
    },
    10: {
        Liberals: 6,
        Fascists: 3,
        hitlerKnowsFascists: false,
        board: [
            Executive_Action.InvestigateLoyalty,
            Executive_Action.InvestigateLoyalty,
            Executive_Action.SpecialElection,
            Executive_Action.Execution,
            Executive_Action.Execution
        ]
    }
};
export enum WinCondition {
    HitlerIsChancellor,
    HitlerWasAssassinated,
    SixFascistPolicies,
    SixLiberalPolicies
}
export enum Role {
    Liberal = "Liberal",
    Fascist = "Fascist",
    Hitler = "Hitler"
}
