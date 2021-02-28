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
let restartTimer = null;

function state_update(state) {
    console.log(state);
    callback(state);
}

function end_round(state) {
    console.log('round over:')
    console.log(state);
    callback(state);
    restartTimer(state.end);
}

export function ch_join(gameName, userName, cb, rt) {
    channel = socket.channel("game:" + gameName, {user: userName})
    callback = cb
    restartTimer = rt
    channel.join()
           .receive("ok", state_update)
           .receive("error", resp => { console.log("Unable to join:", resp) })
    channel.on("view", state_update);
    channel.on("endRound", end_round);
}

export function ch_guess(guess){
    channel.push("guess", guess)
           /*.receive("ok", (resp) => {
                console.log("guess went through!", resp)
            })
           .receive("error", (resp) => {
             console.log("Unable to guess:", resp)
           });*/
}

export function ch_modifyUser(player){
    channel.push("modifyUser", {player: player})
           .receive("view", state_update)
           .receive("tooManyPlayers", state_update)
           .receive("error", (resp) => {
             console.log("err:", resp)
           });
}

export function ch_readyUp(ready){
    channel.push("readyUp", {ready: ready})
           .receive("view", state_update)
           .receive("error", (resp) => {
             console.log("err:", resp)
           });
}
