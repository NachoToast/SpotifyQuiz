import { RequestHandler } from 'express';
import { gameCodeMap, io } from '..';
import Game from '../classes/Game';

/** IP addresses that have created a game. */
export const gameOwners = new Set<string>();

const createGame: RequestHandler = (req, res) => {
    if (gameOwners.has(req.ip)) {
        res.status(403).json({
            title: 'Game Already Exists',
            subtitle: 'You already have a game in progress',
        });
        return;
    }

    const game = new Game(io);
    console.log(`Game "${game.code}" Created`);
    gameOwners.add(req.ip);
    gameCodeMap.set(game.code, game);

    game.onClose = () => {
        console.log(`Game "${game.code}" Closed`);
        gameOwners.delete(req.ip);
        gameCodeMap.delete(game.code);
    };

    // host has 10 seconds to join the lobby before we destroy it
    setTimeout(() => {
        if (game.numPlayers === 0) {
            console.log(`Closing "${game.code}" (Inactive)`);
            game.shutdown();
        }
    }, 10_000);

    res.status(200).send(game.code);
};

export default createGame;
