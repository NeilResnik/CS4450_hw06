// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

// To use Phoenix channels, the first step is to import Socket,
// and connect at the socket path in "lib/web/endpoint.ex".
//
// Pass the token on params as below. Or remove it
// from the params if you are not using authentication.
import {Socket} from "phoenix"

let socket = new Socket("/socket", {params: {token: ""}})

socket.connect();

let channel = socket.channel("game:1", {});

let state = {
  guessHistory: [],
  gameState: "playing",
};

let callback = null;

// also pad the state with empty if needed
function state_update(st) {
  console.log("NEW STATE", st);
  state = pad(st);
  if (callback) {
    callback(st);
  }
}

function pad(st) {
  let newHistory = st.guessHistory.slice(0)
  newHistory.reverse()

  const missing = 8 - newHistory.length;
  var i;

  for (i = 0; i < missing; ++i) {
    newHistory.push({
      guess: null,
      bulls: null,
      cows: null,
    })
  }

  console.log(Object.assign({}, st, {guessHistory: newHistory}))
  return Object.assign({}, st, {guessHistory: newHistory})
}

export function ch_join(cb) {
  callback = cb;
  callback(state);
}

export function ch_guess(guess) {
  channel.push("guess", guess)
    .receive("ok", state_update)
    .receive("error", resp => {console.log("ch_guess broke", resp)});
}

export function ch_reset() {
  channel.push("reset", [])
    .receive("ok", state_update)
    .receive("error", resp => {console.log("ch_reset broke", resp)});
}


channel.join()
  .receive("ok", state_update)
  .receive("error", resp => {console.log("unable to join", resp)});
