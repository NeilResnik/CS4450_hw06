import "../css/app.css"

import React, { useState, useEffect } from 'react';

import { ch_join, ch_guess, ch_reset } from './socket';
import GuessRow from './GuessRow';

// WHAT STAYS HERE

// guess history is no longer always 8 long
//  - need to make a reverse then pad function that pads it with nulls and reverses

export default function Bulls() {

  // CUR GUESS IS VAL OF INPUT FORM AND USED FOR INPUT VALIDATION
  const [curGuess, setCurGuess] = useState('');
  const [state, setState] = useState({
    guessHistory: [],
    gameState: "playing",
  })



  let gameMessage = (<h2 className="endMsg"></h2>);

  if (state.gameState === "won") {
    gameMessage = (<h2 className="endMsg">YOU WON!</h2>)
  }

  if (state.gameState === "lost") {
    gameMessage = (<h2 className="endMsg">You lost :(</h2>)
  }

  
  useEffect(() => {
    ch_join(setState);
  });

  function guess() {
    // prevent invalid lengths
    if (curGuess.length !== 4) {
      return
    }

    ch_guess(curGuess.split(""))
    
    setCurGuess('');
  }

  function reset() {
    ch_reset();
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


  return (
    <>
      <div className="MainContainer">
        <div className="HistoryContainer">
          <div className="HistoryRow">
            <div className="Red Number Cell">
              #
            </div>
            <div className="Red Cell">
              Guess
            </div>
            <div className="Red Cell">
              Bulls
            </div>
            <div className="Red Cell">
              Cows
            </div>
          </div>
          {
            state.guessHistory.map((guess, index) => (
              <GuessRow key={index} index={index} guess={guess}/>
            ))
          }
        </div>
        <div className="GuessContainer">
          <input className="InputGuess" type="text" value={curGuess} onKeyDown={handleKeyPress} onChange={handleValueChange} maxLength="4"/>
          <button className="GuessButton" onClick={guess}>Guess</button>
          <button className="ResetButton" onClick={reset}>Reset</button>

        </div>
        <div>
          {gameMessage}
        </div>
      </div>
      <a className="Link" href="http://swoogity.com">Back to Home</a>
    </>
  );
}