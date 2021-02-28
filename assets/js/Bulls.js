import '../css/app.css'
import React, { useState, useEffect } from 'react';
import { ch_join, ch_guess, ch_modifyUser, ch_readyUp } from './socket';

export default function Bulls() {

    // CUR GUESS IS VAL OF INPUT FORM AND USED FOR INPUT VALIDATION
    const [curGuess, setCurGuess] = useState('');
    const [state, setState] = useState({
        user: '',
        players: {},
        observers: [],
        prevWinners: [],
        leaderboard: {},
        gameState: "login",
        gameName: ''
    });


    // used to take input from input fields
    const [gameName, setGameName] = useState('');
    const [userName, setUserName] = useState('');

    // used for local timer
    const [timeLeft, setTimeLeft] = useState(Date.now());

    useEffect(() => {
        setTimeout(() => setTimeLeft(Date.parse(timeLeft) - Date.now()), 1000);
    })

    function guess() {
      // prevent invalid lengths
      if (curGuess.length !== 4) {
        return
      }
  
      ch_guess(curGuess.split(""))
      
      setCurGuess('');
    }
  
    // checks if key pressed was enter, calls guess() if it was
    function handleKeyPress(ev) {
      if (ev.key === 'Enter') {
        guess()
      }
    }
  
    // filter out duplicate characters, filter out non-string chars.
    // HANDLES FORCING NO DUPLICATE NUMBERS
    function handleValueChange(ev) {
      // filter duplicates
      let guessSet = new Set(ev.target.value);
      let uniqueArr = [...guessSet];
      // filter out NaNs
      let result = uniqueArr.filter(c => {
        return !isNaN(c);
      });
  
      // set the curGuess (input value) to the filterd string 
      setCurGuess(result.join(''));
    }

    function login(ev) {
        ch_join(gameName, userName, setState, setTimeLeft)
    }

    function toggleReady() {
        ch_readyUp(!state.players[state.user].ready)
    }

    function backToLogin() {
        setState({
            user: '',
            players: {},
            observers: [],
            prevWinners: [],
            leaderboard: {},
            gameState: "login",
            gameName: ''
        })
    }
  
    
    if (state.gameState === "login") {
        return (
            <div className="loginContainer">
                <input id="gameNameInput" type="text" onChange={event => setGameName(event.target.value)}/>
                <input id="userNameInput" type="text" onChange={event => setUserName(event.target.value)}/>
                <button className="loginButton" onClick={login}>Login</button>
            </div>
        );
    } else if (state.gameState === "waiting") {
        return (
            <>
                <button className="goLoginButton" onClick={backToLogin}>back to login</button>
                <div className="lobbyContainer">
                    <div className="innerLobbyContainer">
                        <div className="lobbyListPlayersContainer">
                            <h2 className="subTitle">Players</h2>
                            {
                                Object.entries(state.players).map(([key, value]) => (
                                    <p className={(value.ready ? "green" : "red")}>{key}</p>
                                ))
                            }
                            <h2 className="subTitle">Observers</h2>
                            {
                                state.observers.map((name) => (
                                    <p>{name}</p>
                                ))
                            }
                        </div>
                        <div className="lobbyUserModifyContainer">
                            <h2>You: {state.user}</h2>
                            {(
                                state.user in state.players ?
                                    <div className="lobbyButtonContainer">
                                        <button className="lobbyButton" onClick={() => {ch_modifyUser(true)}} disabled>Play</button>
                                        <button className="lobbyButton" onClick={() => {toggleReady()}}>{state.players[state.user].ready ? 'unready' : 'ready!'}</button>
                                        <button className="lobbyButton" onClick={() => {ch_modifyUser(false)}}>Observe</button>
                                    </div>
                                    :
                                    <div className="lobbyButtonContainer">
                                        <button className="lobbyButton" onClick={() => {ch_modifyUser(true)}}>Play</button>
                                        <button className="lobbyButton" onClick={() => {toggleReady()}} disabled>Ready?</button>
                                        <button className="lobbyButton" onClick={() => {ch_modifyUser(false)}} disabled>Observe</button>
                                    </div>
                            )}
                            <h2 className="subTitle">Previous Winners:</h2>
                            {
                                state.prevWinners.map((name) => (
                                    <p>{name}</p>
                                ))
                            }
                            <h2 className="subTitle">Leaderboard</h2>
                            {
                                Object.entries(state.leaderboard).map(([key, value]) => (
                                    <p>{key} wins: {value.wins} losses: {value.losses}</p>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </>
        );
    } else {
        return (
            <>
                <button className="goLoginButton" onClick={backToLogin}>back to login</button>
                <h2 className="name">Your name: {state.user}</h2>
                {(
                    state.user in state.players?
                        <div className="outerContainer">
                            <div className="playerGame">
                                <div className="guessContainer">
                                    <input className="inputGuess" type="text" value={curGuess} onKeyDown={handleKeyPress} onChange={handleValueChange} maxLength="4"/>
                                    <button className="loginButton" onClick={guess}>Guess</button>
                                </div>
                                <div className="observeContainer">
                                    <div className="padPlz">
                                        <h2 className="subTitle">Timer</h2>
                                        <p>{timeLeft}</p>
                                    </div>
                                    {
                                        Object.entries(state.players).map(([key, value]) => (
                                            <div className="padPlz">
                                                <h2 className={(key == state.user ? "green subTitle" : "red subTitle")}>{key}</h2>
                                                {
                                                    value.guesses.map((items) => (
                                                        <p>{items.guess} A: {items.bulls} B: {items.cows}</p>
                                                    ))
                                                }
                                            </div>
                                        ))
                                    }
                                    <div className="observerList padPlz">
                                        <h2 className="subTitle">Observers</h2>
                                        {(
                                            state.observers.length > 0 ?

                                            state.observers.map((name) => (
                                                <p>{name}</p>
                                            ))
                                            :
                                            <p>none</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    :
                        <div className="outerContainer">
                            <div className="observeContainer">
                                <div className="padPlz">
                                    <h2 className="subTitle">Timer</h2>
                                    <p>{timeLeft}</p>
                                </div>
                                {
                                    Object.entries(state.players).map(([key, value]) => (
                                        <div className="padPlz">
                                            <h2 className="subTitle">{key}</h2>
                                            {
                                                value.guesses.map((items) => (
                                                    <p>{items.guess} A: {items.bulls} B: {items.cows}</p>
                                                ))
                                            }
                                        </div>
                                    ))
                                }
                                <div className="observerList padPlz">
                                    <h2 className="subTitle">Observers</h2>
                                    {
                                        state.observers.map((name) => (
                                            <p>{name}</p>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                )}
            </>
        );
    }


  }