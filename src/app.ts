import express, { json } from 'express';
import fs from 'fs';
import { Player, Seed, PlayerSeed } from './model/playerModel';
import { User } from './model/userModel';
import cors from 'cors';
import { Pair } from './model/pairModel';
import { Draw } from './model/drawModel';

const app = express();
const port = 80;

app.use(cors())
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());


// Parse JSON bodies (as sent by API clients)
app.use(express.json());

const getPlayers = () => {
  let players: Player[] = [];
  try {
    players = JSON.parse(fs.readFileSync('data/players.json').toString()) as Player[];
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


const getPairs = () => {

  try {
    const pairs: Pair[] = JSON.parse(fs.readFileSync('data/pairs.json').toString()) as Pair[];
    return pairs;
  }
  catch (e) {
    console.log(e);
    return []
  }
}

const updatePairs = (pairs: Pair[]) => {
  try {
    fs.writeFileSync('data/pairs.json', JSON.stringify(pairs));
    return true
  }
  catch (e) {
    console.log(e);
    return false
  }
}

const getExternalPairs = () => {

  try {
    const pairs: Pair[] = JSON.parse(fs.readFileSync('data/externalPairs.json').toString()) as Pair[];
    return pairs;
  }
  catch (e) {
    console.log(e);
    return []
  }
}

const updateExternalPairs = (pairs: Pair[]) => {
  try {
    fs.writeFileSync('data/externalPairs.json', JSON.stringify(pairs));
    return true
  }
  catch (e) {
    console.log(e);
    return false
  }
}

const getDraw = () => {

  try {
    const draws: Draw[] = JSON.parse(fs.readFileSync('data/draw.json').toString()) as Draw[];
    return draws;
  }
  catch (e) {
    console.log(e);
    return []
  }
}

const updateDraw = (draws: Draw[]) => {
  try {
    fs.writeFileSync('data/draw.json', JSON.stringify(draws));
    return true
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
  const playerSeeds: PlayerSeed[] = []
  players.forEach(p => {
    const points = p.voteReceived.first.length * 4
      + p.voteReceived.second.length * 3
      + p.voteReceived.third.length * 2
      + p.voteReceived.fourth.length * 1
    playerSeeds.push({ name: p.name, score: points, hand: p.hand, style: p.style, details: p.details })
  })
  res.send(playerSeeds.sort((a, b) => b.score - a.score));
});

app.get('/pairs', async (req, res) => {
  const pairs = getPairs();
  if (pairs.length == 0) {
    const players = getPlayers();
    const playerSeeds: Seed[] = []
    players.forEach(p => {
      const points = p.voteReceived.first.length * 4
        + p.voteReceived.second.length * 3
        + p.voteReceived.third.length * 2
        + p.voteReceived.fourth.length * 1
      playerSeeds.push({ name: p.name, score: points, })
    });
    playerSeeds.sort((a, b) => b.score - a.score);
    const divider = playerSeeds.length / 2;
    const topHalf = playerSeeds.map(p => p.name).slice(0, divider);
    let bottomHalf = playerSeeds.map(p => p.name).slice(divider, playerSeeds.length);
    topHalf.forEach((player1, index) => {
      const player2 = bottomHalf[Math.floor(Math.random() * bottomHalf.length)];
      pairs.push({ seed: index + 1, player1: player1, player2: player2 })
      bottomHalf = bottomHalf.filter(b => b !== player2)
    })
    updatePairs(pairs);
  }
  res.send(pairs);
});

app.get('/pairs/status', async (req, res) => {
  const pairs = getPairs();
  res.send(pairs.length > 0);

});

app.post('/pairs/reset', async (req, res) => {
  try {
    updatePairs([])
    res.send(true);
  }
  catch (e) {
    console.log(e);
    res.send(false);
  }

});

app.get('/externalPairs', async (req, res) => {
  const pairs = getExternalPairs();
  res.send(pairs);

});

app.post('/externalPairs', async (req, res) => {
  try {
    if (req.body.pairs && req.body.pairs.length === 2)
      res.send(updateExternalPairs(req.body.pairs));
    res.send(false);
  }
  catch (e) {
    console.log(e);
    res.send(false);
  }

});

app.get('/draw', async (req, res) => {
  let groups: Draw[] = getDraw();
  const pairs = getPairs();
  const externalPairs = getExternalPairs();
  if (groups.length === 0 && pairs && pairs.length > 0 && externalPairs && externalPairs.length > 0) {
    const seed1Pair = pairs.find(p => p.seed === 1)!;
    const seed2Pair = pairs.find(p => p.seed === 2)!;
    const filteredPair = pairs.filter(p => p.seed !== 1 && p.seed !== 2)
    const group1NextPair = filteredPair[Math.floor(Math.random() * filteredPair.length)];
    const group2NextPair = filteredPair.find(p => p.seed !== group1NextPair.seed)!
    const group1ExternalPair = externalPairs[Math.floor(Math.random() * externalPairs.length)];
    const group2ExternalPair = externalPairs.find(p => p.seed !== group1ExternalPair.seed)!
    groups.push({ group: "Group A", pairs: [seed1Pair, group1NextPair, group1ExternalPair] })
    groups.push({ group: "Group B", pairs: [seed2Pair, group2NextPair, group2ExternalPair] })
    updateDraw(groups)
  }
  res.send(groups);
})

app.get('/draw/status', async (req, res) => {
  const draw = getDraw();
  res.send(draw.length > 0);

});

app.post('/draw/reset', async (req, res) => {
  try {
    updateDraw([])
    res.send(true);
  }
  catch (e) {
    console.log(e);
    res.send(false);
  }

});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



