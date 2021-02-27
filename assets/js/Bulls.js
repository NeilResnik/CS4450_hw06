import 'bulma/css/bulma.css'
import '../css/app.scss'
import React, { useEffect, useState } from 'react';
import { GameSelect, GuessInput, ResultList, Timer, WaitingRoom, WinnerList } from './game'
import { set_callback } from './socket'

function Bulls() {
    const [gameState, setGameState] = useState({});
    const [timeOut, setTimeOut] = useState(0);

    useEffect(() => {
        set_callback((st) => {
            console.log("callback");
            // console.log("setTimeOut");
            setTimeOut(Date.now() + 30000);
            // console.log("setGameState");
            console.log(st);
            setGameState(st);
            console.log("callback over");
        });
    }, []);

    let body = null;
    if (Object.entries(gameState).length === 0) {
        body = (
            <div>
                <GameSelect />
            </div>
        );
    } else if (gameState.gameState === "waiting") {
        body = (
            <div>
                <h1> {gameState.gameName} </h1>
                <WaitingRoom players={gameState.players} observers={gameState.observers} user={gameState.userId} />
            </div>
        );
    } else if (gameState.gameState === "playing"){
        body = (
            <div>
               <section className="section">
                   <div className="container has-text-centered">
                       <h1> {gameState.gameName} </h1>
                       <Timer timeout={timeOut} />
                       <GuessInput enabled={gameState.prevWinners.length === 0} />
                   </div>
               </section>
               <section className="section">
                   <WinnerList winners={gameState.prevWinners} />
                   <div className="container has-text-centered">
                       <h1 className="title is-size-2">Guesses:</h1>
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
