import express, { json } from 'express';
import fs from 'fs';
import { Player, Seed } from './model/playerModel';
import { User } from './model/userModel';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors())
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());


// Parse JSON bodies (as sent by API clients)
app.use(express.json());

const getPlayers = () => {
  let players: Player[] = [];
  try {
    players = JSON.parse(fs.readFileSync('data/players.json').toString());
    return players;

  }
  catch (e) {
    console.log(e);
    return players
  }

}

const updatePlayers = (players: Player[]) => {
  try {
    fs.writeFileSync('data/players.json', JSON.stringify(players));
    return true;
  }
  catch (e) {
    console.log(e);
    return false
  }

}

app.post('/login', async (req, res) => {
  const user: User = req.body.user;
  if (!user) return false
  const players = getPlayers();
  const isValid = players.find(p => p.name === user.name)?.secret === user.secret;
  res.send(isValid);
});


app.get('/players', async (req, res) => {
  const players = getPlayers();
  res.send(players.map(p => p.name));
});


app.post('/vote', async (req, res) => {

  const toBeUpdatedPlayer: Player = req.body.player
  const existingPlayers: Player[] = getPlayers();

  const existingPlayer = existingPlayers.find(p => p.name.toLowerCase() === toBeUpdatedPlayer.name.toLowerCase());
  if (!existingPlayer) res.send(false)

  //Update vote given
  existingPlayer!.voteGiven = toBeUpdatedPlayer.voteGiven;

  //Remove the player's vote from existing players
  existingPlayers.forEach(existingPlayer => {
    existingPlayer.voteReceived.first = existingPlayer.voteReceived.first.filter(p => p.toLowerCase() !== toBeUpdatedPlayer.name.toLowerCase())
    existingPlayer.voteReceived.second = existingPlayer.voteReceived.second.filter(p => p.toLowerCase() !== toBeUpdatedPlayer.name.toLowerCase())
    existingPlayer.voteReceived.third = existingPlayer.voteReceived.third.filter(p => p.toLowerCase() !== toBeUpdatedPlayer.name.toLowerCase())
    existingPlayer.voteReceived.fourth = existingPlayer.voteReceived.fourth.filter(p => p.toLowerCase() !== toBeUpdatedPlayer.name.toLowerCase())
  });

  //Update first vote
  const toBeUpdatedFirstVotePlayer = existingPlayers.find(p => p.name.toLowerCase() === toBeUpdatedPlayer.voteGiven.first.toLowerCase());
  if (toBeUpdatedFirstVotePlayer) {
    toBeUpdatedFirstVotePlayer.voteReceived.first.push(toBeUpdatedPlayer.name)
  }

  //Update second vote
  const toBeUpdatedSecondVotePlayer = existingPlayers.find(p => p.name.toLowerCase() === toBeUpdatedPlayer.voteGiven.second.toLowerCase());
  if (toBeUpdatedSecondVotePlayer) {
    toBeUpdatedSecondVotePlayer.voteReceived.second.push(toBeUpdatedPlayer.name)
  }

  //Update third vote
  const toBeUpdatedThirdVotePlayer = existingPlayers.find(p => p.name.toLowerCase() === toBeUpdatedPlayer.voteGiven.third.toLowerCase());
  if (toBeUpdatedThirdVotePlayer) {
    toBeUpdatedThirdVotePlayer.voteReceived.third.push(toBeUpdatedPlayer.name)
  }

  //Update fourth vote
  const toBeUpdatedFourthVotePlayer = existingPlayers.find(p => p.name.toLowerCase() === toBeUpdatedPlayer.voteGiven.fourth.toLowerCase());
  if (toBeUpdatedFourthVotePlayer) {
    toBeUpdatedFourthVotePlayer.voteReceived.fourth.push(toBeUpdatedPlayer.name)
  }


  res.send(updatePlayers(existingPlayers))

});

app.get('/votegiven', async (req, res) => {
  const players = getPlayers();
  res.send(players.find(p => p.name === req.query.user)?.voteGiven);
});


app.get('/seed', async (req, res) => {
  const players = getPlayers();
  const playerSeeds: Seed[] = []
  players.forEach(p => {
    const points = p.voteReceived.first.length * 4
      + p.voteReceived.second.length * 3
      + p.voteReceived.third.length * 2
      + p.voteReceived.fourth.length * 1
    playerSeeds.push({ name: p.name, score: points, hand: p.hand, style: p.style, details: p.details })
  })
  res.send(playerSeeds.sort((a, b) => b.score - a.score));
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


