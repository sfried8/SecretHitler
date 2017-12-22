const Executive_Action =
    {
        NoAction: 0,
        InvestigateLoyalty: 1,
        SpecialElection: 2,
        PolicyPeek: 3,
        Execution: 4
    };
const Setups = {
    3: {Liberals: 1, Fascists: 1, hitlerKnowsFascists: true, board:[Executive_Action.NoAction, Executive_Action.NoAction, Executive_Action.PolicyPeek, Executive_Action.Execution, Executive_Action.Execution] },
    5: {Liberals: 3, Fascists: 1, hitlerKnowsFascists: true, board:[Executive_Action.Execution, Executive_Action.NoAction, Executive_Action.PolicyPeek, Executive_Action.SpecialElection, Executive_Action.Execution]},
    6: {Liberals: 4, Fascists: 1, hitlerKnowsFascists: true, board:[Executive_Action.NoAction, Executive_Action.NoAction, Executive_Action.PolicyPeek, Executive_Action.Execution, Executive_Action.Execution]},
    7: {Liberals: 4, Fascists: 2, hitlerKnowsFascists: false, board:[Executive_Action.NoAction, Executive_Action.InvestigateLoyalty, Executive_Action.SpecialElection, Executive_Action.Execution, Executive_Action.Execution]},
    8: {Liberals: 5, Fascists: 2, hitlerKnowsFascists: false, board:[Executive_Action.NoAction, Executive_Action.InvestigateLoyalty, Executive_Action.SpecialElection, Executive_Action.Execution, Executive_Action.Execution]},
    9: {Liberals: 5, Fascists: 3, hitlerKnowsFascists: false, board:[Executive_Action.InvestigateLoyalty, Executive_Action.InvestigateLoyalty, Executive_Action.SpecialElection, Executive_Action.Execution, Executive_Action.Execution]},
    10: {Liberals: 6, Fascists: 3, hitlerKnowsFascists: false, board:[Executive_Action.InvestigateLoyalty, Executive_Action.InvestigateLoyalty, Executive_Action.SpecialElection, Executive_Action.Execution, Executive_Action.Execution]}
};
const WinCondition = {
    HitlerIsChancellor: 0,
    HitlerWasAssassinated: 1,
    SixFascistPolicies: 2,
    SixLiberalPolicies: 3
};
const Role = {
    Liberal: "Liberal",
    Fascist: "Fascist",
    Hitler: "Hitler"
};
module.exports = {
    Executive_Action: Executive_Action,
    Setups: Setups,
    WinCondition: WinCondition,
    Role: Role
}