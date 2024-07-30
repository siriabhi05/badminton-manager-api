import { User } from "./userModel";

interface VoteGiven {
    first: string,
    second: string,
    third: string,
    fourth: string
}
interface VoteReceived {
    first: string[],
    second: string[],
    third: string[],
    fourth: string[]
}

interface PlayerAttribute {
    hand: "Left" | "Right",
    style: "Attack" | "Defence" | "Balanced"
    details: string
}

export interface Player extends User, PlayerAttribute {
    voteGiven: VoteGiven
    voteReceived: VoteReceived
}

export interface Seed{
    name: string
    score: number
}

export interface PlayerSeed extends PlayerAttribute, Seed {
    
}