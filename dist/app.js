"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const port = 3000;
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express_1.default.urlencoded());
// Parse JSON bodies (as sent by API clients)
app.use(express_1.default.json());
const getPlayers = () => {
    let players = [];
    try {
        players = JSON.parse(fs_1.default.readFileSync('data/players.json').toString());
        return players;
    }
    catch (e) {
        console.log(e);
        return players;
    }
};
const updatePlayers = (players) => {
    try {
        fs_1.default.writeFileSync('data/players.json', JSON.stringify(players));
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
};
app.get('/players', async (req, res) => {
    let players = getPlayers();
    console.log(players);
    res.send(players);
});
// player = {name:"abhishek srivastava", voteGiven:{first:"Rishi",second:"Ajay", third:"Abhishek", fourt:"Aakash"}}
// existingPlayers =
// [
//{
//name:"abhishek srivastava", 
//voteGiven:{first:"Ajay",second:"Rishi", third:"Abhishek", fourt:"Aakash"}, 
//"voteReceived": { "first": [], "second": [], "third": [], "fourth": []
// },
//{
//name:"ajay sharma", 
//voteGiven:{first:"Ajay",second:"Abhishek", third:"Vipin", fourt:"Aakash"}, 
//"voteReceived": { "first": ["abhishek"], "second": [], "third": [], "fourth": []
// }
//]
//
app.post('/vote', async (req, res) => {
    const toBeUpdatedPlayer = req.body.player;
    const existingPlayers = getPlayers();
    const existingPlayer = existingPlayers.find(p => p.name.toLowerCase() === toBeUpdatedPlayer.name.toLowerCase());
    if (existingPlayer) {
        if (toBeUpdatedPlayer.voteGiven.first !== existingPlayer.voteGiven.first) {
            const existingPlayerFirstVotePlayer = existingPlayers.find(p => p.name.toLowerCase() === existingPlayer.voteGiven.first);
            if (existingPlayerFirstVotePlayer) {
                existingPlayerFirstVotePlayer.voteReceived.first = existingPlayerFirstVotePlayer.voteReceived.first.filter(p => p != existingPlayer.voteGiven.first);
            }
            const toBeUpdatedFirstVotePlayer = existingPlayers.find(p => p.name.toLowerCase() === toBeUpdatedPlayer.voteGiven.first);
            if (toBeUpdatedFirstVotePlayer) {
                toBeUpdatedFirstVotePlayer.voteReceived.first.push(toBeUpdatedPlayer.voteGiven.first);
            }
        }
        if (toBeUpdatedPlayer.voteGiven.second !== existingPlayer.voteGiven.second) {
            const existingPlayerSecondVotePlayer = existingPlayers.find(p => p.name.toLowerCase() === existingPlayer.voteGiven.second);
            if (existingPlayerSecondVotePlayer) {
                existingPlayerSecondVotePlayer.voteReceived.second = existingPlayerSecondVotePlayer.voteReceived.second.filter(p => p != existingPlayer.voteGiven.second);
            }
            const toBeUpdatedSecondVotePlayer = existingPlayers.find(p => p.name.toLowerCase() === toBeUpdatedPlayer.voteGiven.second);
            if (toBeUpdatedSecondVotePlayer) {
                toBeUpdatedSecondVotePlayer.voteReceived.second.push(toBeUpdatedPlayer.voteGiven.second);
            }
        }
        if (toBeUpdatedPlayer.voteGiven.third !== existingPlayer.voteGiven.third) {
            const existingPlayerThirdVotePlayer = existingPlayers.find(p => p.name.toLowerCase() === existingPlayer.voteGiven.third);
            if (existingPlayerThirdVotePlayer) {
                existingPlayerThirdVotePlayer.voteReceived.third = existingPlayerThirdVotePlayer.voteReceived.third.filter(p => p != existingPlayer.voteGiven.third);
            }
            const toBeUpdatedThirdVotePlayer = existingPlayers.find(p => p.name.toLowerCase() === toBeUpdatedPlayer.voteGiven.third);
            if (toBeUpdatedThirdVotePlayer) {
                toBeUpdatedThirdVotePlayer.voteReceived.third.push(toBeUpdatedPlayer.voteGiven.third);
            }
        }
        if (toBeUpdatedPlayer.voteGiven.fourth !== existingPlayer.voteGiven.fourth) {
            const existingPlayerFourthVotePlayer = existingPlayers.find(p => p.name.toLowerCase() === existingPlayer.voteGiven.fourth);
            if (existingPlayerFourthVotePlayer) {
                existingPlayerFourthVotePlayer.voteReceived.fourth = existingPlayerFourthVotePlayer.voteReceived.fourth.filter(p => p != existingPlayer.voteGiven.fourth);
            }
            const toBeUpdatedFourthVotePlayer = existingPlayers.find(p => p.name.toLowerCase() === toBeUpdatedPlayer.voteGiven.fourth);
            if (toBeUpdatedFourthVotePlayer) {
                toBeUpdatedFourthVotePlayer.voteReceived.fourth.push(toBeUpdatedPlayer.voteGiven.fourth);
            }
        }
        existingPlayer.voteGiven = toBeUpdatedPlayer.voteGiven;
        res.send(updatePlayers(existingPlayers));
    }
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
