import { Player } from "./Player";
import { Policy, PolicyDeck } from "./Policy";
import { Election } from "./Election";
import { Executive_Action, WinCondition, Setup, GameState } from "./Enums";
export interface EnactedPolicies {
    liberals: number;
    fascists: number;
}
export interface GameData {
    players: Player[];
    liberals: Player[];
    fascists: Player[];
    hitler: Player;
    president: Player;
    presidentIndex: number;
    chancellor: Player;
    lastChancellor: Player;
    chancellorNominee: Player;
    gameRules: Setup;
    enactedPolicies: EnactedPolicies;
    policyDeck: PolicyDeck;
    lastPolicy: Policy;
    chaosLevel: number;
    lastExecutiveAction: Executive_Action;
    lastExecutiveActionTarget: Player;
    currentElection: Election;
    electionArchive: Election[];
    presidentPolicies: Policy[];
    chancellorPolicies: Policy[];
    gameOverReason: WinCondition;
    gameState: GameState;
}
