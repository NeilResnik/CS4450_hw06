defmodule BullsWeb.GameChannel do
  use BullsWeb, :channel

  alias Bulls.Game
  alias Bulls.GameServer

  @impl true
  def join("game:" <> name, payload, socket) do

    if authorized?(payload) do
      # either get the backup or start new game
      GameServer.start(name)
      # get the user id and add the user as an observer (to start)
      userId = GameServer.addObserver(name, payload.user)
      # set the socket to have game name and user id
      socket = socket
      |> assign(:game, name)
      |> assign(:user, userId)
      # get the game!
      game = GameServer.peek(name)
      # get a reduced state (no answer)
      view = Game.view(user, game)
      {:ok, view, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  @impl true
  def handle_in("guess", guessArr, socket0) do
    # take the user from the socket, have that user guess the guessArr

    # TODO
    game0 = socket0.assigns[:game]
    game1 = Game.guess(game0, guessArr)
    socket1 = assign(socket0, :game, game1)
    view = Game.view(game1)
    {:reply, {:ok, view}, socket1}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (game_channel:lobby).
  @impl true
  def handle_in("modifyUser", payload, socket) do
    # get the gamename and user id
    name = socket.assigns[:game]
    userId = socket.assigns[:user]

    # get the game, nil if not enough space for another player
    game = GameServer.modifyUser(name, userId, payload.player)

    # if game not nil, return ok status
    if game do
      view = Game.view(userId, game)
      {:reply, {:ok, view}, socket}
    else
      # get default game
      game1 = GameServer.peek(name)
      view = Game.view(userId, game1)
      {:reply, {:tooManyPlayers, view}, socket}
    end
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
