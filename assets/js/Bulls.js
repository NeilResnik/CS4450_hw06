import 'bulma/css/bulma.css'
import '../css/app.scss'
import React, { useEffect, useState } from 'react';
import { Back, GameSelect, GuessInput, ResultList, Timer, WaitingRoom, WinnerList } from './game'
import { set_callback } from './socket'

function Bulls() {
    const [gameState, setGameState] = useState({});
    const [timeOut, setTimeOut] = useState(0);

    useEffect(() => {
        set_callback((st) => {
            setTimeOut(Date.now() + 30000);
            console.log(st);
            setGameState(st);
        });
    }, []);

    let body = null;
    if (Object.entries(gameState).length === 0) {
        body = (
            <div className="content">
                <GameSelect />
            </div>
        );
    } else if (gameState.gameState === "waiting") {
        body = (
            <div className="content">
                <div>
                    <Back />
                </div>
                <div className="has-text-centered">
                    <h1 className="title is-size-1"> {gameState.gameName} </h1>
                        <WaitingRoom players={gameState.players}
                                     observers={gameState.observers}
                                     userId={gameState.user}
                                     winners={gameState.prevWinners}/>
                </div>
            </div>
        );
    } else if (gameState.gameState === "playing"){
        body = (
            <div className="content">
                <Back />
               <section className="section">
                   <div className="container has-text-centered">
                       <h1 className="title is-size-1"> {gameState.gameName} </h1>
                       <Timer timeout={timeOut} />
                       <GuessInput enabled={gameState.prevWinners.length === 0} />
                   </div>
               </section>
               <section className="section">
                   <WinnerList winners={gameState.prevWinners} />
                   <div className="container has-text-centered">
                       <h2 className="title is-size-2">Guesses:</h2>
                       <ResultList players={gameState.players} />
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
