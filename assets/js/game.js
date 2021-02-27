import 'bulma/css/bulma.css'
import '../css/app.scss'
import React, { useEffect, useState } from 'react';
import { ch_join, ch_push, ch_reset } from './socket';

function guess(text){
    if(text.length < 4) {
        return;
    }
    ch_push("guess", text.split(""));
}

export function GameSelect() {
    const [gameName, setGameName] = useState("");
    const [userName, setUserName] = useState("");

    function validate() {
        return gameName !== "" && userName !== "";
    }

    function onKeypress(event) {
        if(event.key === "Enter" && validate()){
            ch_join(gameName, userName);
        }
    }

    return (
        <div className="field has-addons has-addons-centered">
            <div className="control">
                <input className="input"
                    type="text" 
                    placeholder="Game"
                    onChange={(event) => { setGameName(event.target.value) }}
                    onKeyPress={onKeypress}
                    value={gameName}/>
            </div>
            <div className="control">
                <input className="input"
                    type="text" 
                    placeholder="User"
                    onChange={(event) => { setUserName(event.target.value); }}
                    onKeyPress={onKeypress}
                    value={userName}/>
            </div>
            <div className="control">
                <button className="button is-primary"
                        onClick={() => { if(validate()) { ch_join(gameName, userName);  }}}>
                    Join Game 
                </button>
            </div>
        </div>
    );
}

export function WaitingRoom({players, observers, userId}) {
    function get_radio(pname, id, observer, ready) {
        return (
            <li key={pname + id}>
                <h4 className="title is-size-4">{pname}</h4>
                    <div className="control">
                        <label className="radio">
                            <input 
                                type="radio"
                                id={pname + id + "ready"}
                                checked={!observer && ready}
                                onChange={() => {
                                    if(document.getElementById(pname + id + "ready").checked) {
                                        ch_push("modifyUser", {player: true});
                                        ch_push("readyUp", {ready: true});
                                    }
                                }}
                                disabled={id !== userId}/>
                            Ready
                        </label>
                        <label className="radio">
                            <input 
                                type="radio"
                                id={pname + id + "notready"}
                                checked={!observer && !ready}
                                onChange={() => {
                                    if(document.getElementById(pname + id + "notready").checked) {
                                        ch_push("modifyUser", {player: true});
                                        ch_push("readyUp", {ready: false});
                                    }
                                }}
                                disabled={id !== userId}/>
                            Not Ready
                        </label>
                        <label className="radio">
                            <input 
                                type="radio"
                                id={pname + id + "observe"}
                                checked={observer}
                                onChange={() => {
                                    if(document.getElementById(pname + id + "observe").checked) {
                                        ch_push("modifyUser", {player: false});
                                    }
                                }}
                                disabled={id !== userId}/>
                            Observe
                        </label>
                    </div>
            </li>
        );
    }

    let player_states = [];
    for(const [id, p] of Object.entries(players)) {
        player_states.push(get_radio(p.user, id, false, p.ready));
    }
    for(const o of observers) {
        player_states.push(get_radio(o, o, true, false));
    }
    return (
        <div className="content has-text-centered">
            <ul className="no-marker">
                {player_states}
            </ul>
        </div>
    );
}

export function GuessInput({enabled}) {
    const [text, setText] = useState("");

    function updateText(event) {
        let checked = "";
        for (let c of event.target.value) {
            if (checked.length < 4 && !checked.includes(c)
                && c >= '0' && c <= '9') {
                checked += c;
            }
        }
        setText(checked);
    }

    function onKeypress(event) {
        if(event.key === "Enter" && text.length === 4){
            guess(text);
        }
    }

    return (
        <div className="field has-addons has-addons-centered">
            <div className="control">
                <input className="input"
                    type="text" 
                    placeholder="Guess"
                    onChange={updateText}
                    onKeyPress={onKeypress}
                    disabled={!enabled}
                    value={text}/>
            </div>
            <div className="control">
                <button className="button is-primary"
                        disabled={!enabled || text.length !== 4}
                        onClick={() => { 
                            guess(text);
                        }}>
                    Guess 
                </button>
            </div>
        </div>
    );
}

export function ObserverList(observers){
    return (
        <div className="content">
            <ul>
                {Object.entries(observers).map(function([id, o]) {
                    return(
                        <li key={o + id}>
                            <p>{o}</p>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export function ResultList({players}) {
    let cols = [];
    for(const [_id, pobj] of Object.entries(players)) {
        cols.push((
            <div className="column">
                <h3 className="title is-size-3"> {pobj.user} </h3>
                <ul className="no-marker">
                    {pobj.guesses.map((result, i) => {
                        return (
                            <li key={result.guess+i}>
                                <p>{result.guess + ": " + result.bulls + "A" + result.cows + "B"}</p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        ));
    }

    return (
        <div className="content">
            <div className="columns">
                {cols}
            </div>
        </div>
    );
}

export function WinnerList({winners}) {
    if(winners.length === 0) return null;
    return (
        <div className="content">
            <ul className="no-marker">
                {winners.map(function(name, i){
                    return (
                        <li key={name + i}>
                            <p>{name}</p>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export function Timer({timeout}) {
    function getTimeLeft() {
        return (timeout - Date.now()) / 1000;
    }

    const [timeLeft, setTimeLeft] = useState(getTimeLeft());
    useEffect(() => {
        const timer = setTimeout(() => {
            let tl = getTimeLeft();
            if(tl >= 0) {
                setTimeLeft(Math.round(tl));
            } else {
                setTimeLeft(0);
            }
        }, 1000);
        return () => clearTimeout(timer);
    });
    return (
        <div>
            <p>{timeLeft}</p>
        </div>
    );
}
