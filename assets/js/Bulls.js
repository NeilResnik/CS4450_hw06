import 'bulma/css/bulma.css'
import '../css/app.scss'
import React, { useState, useEffect } from 'react';
import * as game from './game'
import { ch_join } from './socket'

function Bulls() {
    const [gameState, setGameState] = useState(null);

    let winners = game.get_winners(gameState.players);

    let body = null;
    if (!gameState) {
        body = (
            <div>
                <game.GameSelect stateSetter={setGameState}/>
            </div>
        );
    } else if (gameState.gameState == "waiting") {
        body = (
            <div>
                <game.WaitingRoom players={gameState.players} user={} />
            </div>
        );
    } else {
        body = (
            <div>
               <section className="section">
                   <div className="container has-text-centered">
                        <game.GuessInput enabled={winners.length === 0}/>
                   </div>
               </section>
               <section className="section">
                   <div className="container has-text-centered">
                       <h1 className="title is-size-2">Guesses:</h1>
                       <GuessList />
                   </div>
               </section>
           </div>
        );
    }


    return (
        <div className="Bulls">
            body
        </div>
    );
}

export default Bulls;
