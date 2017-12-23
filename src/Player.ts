import { Role } from "./Enums";
export class Player {
    dead: boolean;
    role: Role;
    constructor(public index: number, public name: string, public id: number) {
        this.dead = false;
    }
}
