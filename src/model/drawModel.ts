import { Pair } from "./pairModel";

export interface Draw {
    group: "Group A" | "Group B"
    pairs: Pair[]
}