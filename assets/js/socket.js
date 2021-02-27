// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

// To use Phoenix channels, the first step is to import Socket,
// and connect at the socket path in "lib/web/endpoint.ex".
//
// Pass the token on params as below. Or remove it
// from the params if you are not using authentication.
import {Socket} from "phoenix"

let socket = new Socket("/socket", {params: {token: ""}})

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "lib/web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "lib/web/templates/layout/app.html.eex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/3" function
// in "lib/web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket, _connect_info) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, connect to the socket:
socket.connect()

// Based on Nat Tuck's code at
//https://github.com/NatTuck/scratch-2021-01/blob/master/4550/0216/hangman/assets/js/socket.js
let channel = null;
let callback = null;

function convert_state(st) {
    let guesses = [];
    let results = [];
    for (const record of st.guessHistory){
        if(record.guess) {
            guesses.unshift(record.guess);
        }
        if(record.bulls && record.cows) {
            results.unshift(record.bulls + "A" + record.cows + "B");
        }
    }
    return {
        guesses: guesses,
        results: results
    }
}

function state_update(state) {
    if(callback) {
        callback(state);
    }
}

export function set_callback(cb) {
    callback = cb;
}

export function ch_join(gameName, userName) {
    channel = socket.channel("game:" + gameName, {user: userName})
    channel.on("view", state_update);
    channel.join()
           .receive("ok", state_update)
           .receive("error", resp => { console.log("Unable to join:", resp) })
}

export function ch_push(key, payload){
    channel.push(key, payload)
           .receive("ok", state_update)
           .receive("error", (resp) => {
             console.log("Unable to push:", resp)
           });
}

export function ch_reset(){
    channel.push("reset", {})
           .receive("view", state_update)
           .receive("error", (resp) => {
             console.log("Unable to reset:", resp)
           });
}

if(channel) {
    channel.on("view", state_update);
}
