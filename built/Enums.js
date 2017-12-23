"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Executive_Action;
(function (Executive_Action) {
    Executive_Action[Executive_Action["NoAction"] = 0] = "NoAction";
    Executive_Action[Executive_Action["InvestigateLoyalty"] = 1] = "InvestigateLoyalty";
    Executive_Action[Executive_Action["SpecialElection"] = 2] = "SpecialElection";
    Executive_Action[Executive_Action["PolicyPeek"] = 3] = "PolicyPeek";
    Executive_Action[Executive_Action["Execution"] = 4] = "Execution";
})(Executive_Action = exports.Executive_Action || (exports.Executive_Action = {}));
exports.Setups = {
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
var WinCondition;
(function (WinCondition) {
    WinCondition[WinCondition["HitlerIsChancellor"] = 0] = "HitlerIsChancellor";
    WinCondition[WinCondition["HitlerWasAssassinated"] = 1] = "HitlerWasAssassinated";
    WinCondition[WinCondition["SixFascistPolicies"] = 2] = "SixFascistPolicies";
    WinCondition[WinCondition["SixLiberalPolicies"] = 3] = "SixLiberalPolicies";
})(WinCondition = exports.WinCondition || (exports.WinCondition = {}));
var Role;
(function (Role) {
    Role["Liberal"] = "Liberal";
    Role["Fascist"] = "Fascist";
    Role["Hitler"] = "Hitler";
})(Role = exports.Role || (exports.Role = {}));
