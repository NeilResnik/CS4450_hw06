defmodule BullsWeb.GameChannel do
  use BullsWeb, :channel

  alias Bulls.Game
  alias Bulls.GameServer

  @impl true
  def join("game:" <> name, payload, socket) do

    if authorized?(payload) do
      # either error or start new game
      GameServer.start(name)
      # get the user id and add the user as an observer (to start)
      userId = GameServer.addObserver(name, payload["user"])
      # set the socket to have game name and user id
      socket = socket
      |> assign(:game, name)
      |> assign(:user, userId)
      # get the game!
      game = GameServer.peek(name)
      # get a reduced state (no answer)
      view = Game.view(game)
      view = Map.put(view, :user, userId)
      {:ok, view, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  @impl true
  def handle_in("guess", guessArr, socket) do
    IO.puts "guess"
    # take the user from the socket, have that user guess the guessArr

    name = socket.assigns[:game]
    userId = socket.assigns[:user]

    # get the current game state
    GameServer.guess(name, userId, guessArr)
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (game_channel:lobby).
  @impl true
  def handle_in("modifyUser", payload, socket) do
    IO.puts "modifyUser"
    # get the gamename and user id
    name = socket.assigns[:game]
    IO.puts name
    userId = socket.assigns[:user]
    IO.puts userId

    # get the game, nil if not enough space for another player
    game = GameServer.modifyUser(name, userId, payload["player"])

    # if game not nil, return ok status
    if game do
      view = Game.view(game)
      broadcast(socket, "view", view)
      {:reply, {:ok, view}, socket}
    else
      # get default game
      game1 = GameServer.peek(name)
      view = Game.view(game1)
      {:reply, {:tooManyPlayers, view}, socket}
    end
  end

  # set a user status as ready!
  @impl true
  def handle_in("readyUp", payload, socket) do
    # get the user id and game name
    name = socket.assigns[:game]
    userId = socket.assigns[:user]
    # set ready!
    game = GameServer.setReady(name, userId, payload["ready"])
    # get the viewww
    view = Game.view(game)
    # broadcast view!
    broadcast(socket, "view", view)
    {:reply, {:ok, view}, socket}
  end


  intercept ["view", "endRound"]

  @impl true
  def handle_out("view", msg, socket) do
    userId = socket.assigns[:user]
    # msg = %{msg | user: userId}
    msg = Map.put(msg, :user, userId)
    push(socket, "view", msg)
    {:noreply, socket}
  end

  @impl true
  def handle_out("endRound", msg, socket) do
    userId = socket.assigns[:user]
    msg = Map.put(msg, :user, userId)
    push(socket, "endRound", msg)
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
