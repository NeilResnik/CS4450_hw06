import 'bulma/css/bulma.css'
import '../css/app.scss'
import React, { useState } from 'react';
import * as game from './game'

function Bulls() {
    const [gameState, setGameState] = useState({});
    const [timeOut, setTimeOut] = useState(0);


    let body = null;
    if (Object.entries(gameState).length === 0) {
        body = (
            <div>
                <game.GameSelect stateSetters={[setGameState, (_) => { setTimeOut(Date.now() + 30000); }]}/>
            </div>
        );
    } else if (gameState.gameState === "waiting") {
        body = (
            <div>
                <game.WaitingRoom players={gameState.players} user={gameState.userId} />
            </div>
        );
    } else {
        body = (
            <div>
               <section className="section">
                   <div className="container has-text-centered">
                       <game.Timer timeout={timeOut}/>
                        <game.GuessInput enabled={get_winners(gameState.players).length === 0}/>
                   </div>
               </section>
               <section className="section">
                   <div className="container has-text-centered">
                       <h1 className="title is-size-2">Guesses:</h1>
                       <game.ResultList players={gameState.players} />
                   </div>
               </section>
           </div>
        );
    }


    return (
        <div className="Bulls">
            {body}
        </div>
    );
}

export default Bulls;
