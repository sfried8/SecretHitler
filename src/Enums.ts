export enum Executive_Action {
    NoAction,
    InvestigateLoyalty,
    SpecialElection,
    PolicyPeek,
    Execution
}
export interface Setup {
    Liberals: number;
    Fascists: number;
    hitlerKnowsFascists: boolean;
    board: Executive_Action[];
}
export enum GameState {
    Idle,
    PresidentNominateChancellor,
    VoteForChancellor,
    PresidentChoosePolicies,
    ChancellorChoosePolicy,
    PresidentChooseExecutiveActionTarget,
    ChancellorRequestVeto
}

export const Setups: any = {
    3: <Setup>{
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
    5: <Setup>{
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
    6: <Setup>{
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
    7: <Setup>{
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
    8: <Setup>{
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
    9: <Setup>{
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
    10: <Setup>{
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
