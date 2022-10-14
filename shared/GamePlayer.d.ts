import { PlayerStates } from './PlayerStates';

export default interface GamePlayer {
    name: string;
    points: number;
    host: boolean;
    state: PlayerStates;
}
