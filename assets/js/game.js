import 'bulma/css/bulma.css'
import '../css/app.scss'
import React, { useState } from 'react';
import { ch_push, ch_reset } from './socket';

function guess(text){
    if(text.length < 4) {
        return;
    }
    ch_push("guess", text.split(""));
}

export function GameSelect({stateSetter}) {
    const [gameName, setGameName] = useState("");
    const [userName, setUserName] = useState("");

    function validate() {
        return gameName !== "" && userName !== "";
    }

    function onKeypress(event) {
        if(event.key === "Enter" && validate()){
            ch_join(gameName, userName, stateSetter);
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
                        onClick={() => { if(validate()) { ch_join(gameName, userName, stateSetter);  }}}>
                    Join Game 
                </button>
            </div>
        </div>
    );
}

export function WaitingRoom({players, user}) {
    const [status, setStatue] = useState(false);
    return (
        <div>
            <ul className="no-marker">
                {players.map(function(p, i){
                    <li key={p + i}>
                        <p>p.name</p>
                            <label className="checkbox">
                                <input 
                                    type="checkbox"
                                    id={p + i + "checkbox"}
                                    checked={p.ready}
                                    onChange={ch_push("readyUp",
                                                      {ready: document.getElementById(p + i + "checkbox").checked})}
                                    disabled={p.name === user}/>
                                Ready
                            </label>
                    </li>
                })}
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
                        onClick={() => { guess(text); }}>
                    Guess 
                </button>
            </div>
            <div className="control">
                <button className="button is-danger"
                    onClick={() => ch_reset({})}>
                    Reset
                </button>
            </div>
        </div>
    );
}

export function ObserverList({observers}){
    return (
        <div className="content">
            <ul>
                {observers.map(function(o, i) {
                    return(
                        <li key={o + i}>
                            <p>{o}</p>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export function ResultList({players}) {
    if(players.length < 1) return (<div className="content"></div>);
    let rounds = [];
    let first = true;
    for(const p of players) {
        let i = 0;
        for(const r of p.results) {
            let result_string = p.name + ": " + r.bulls + "A" + r.cows + "B";
            if (first) {
                rounds.append([result_string]);
            } else {
                rounds[i].append(result_string);
            }
            i += 1;
        }
        first = false;
    }
    return(
        <div className="content">
            <ul className="no-marker">
                {rounds.map(function(results, i){
                    return (
                        <li key={i}>
                            <ul className="no-marker">
                                {Object.entries(results).map(function(rstr) {
                                    return (
                                        <li key={rstr}>
                                            <p>rstr</p>
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export function get_winners(players) {
    let winners = [];
    for(const p of players) {
        if (p.results.length > 0 && p.results[0].bulls === 4) {
            winners.append(p.name)
        }
    }
    return winners;
}

export function WinnerList({winners}) {
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
