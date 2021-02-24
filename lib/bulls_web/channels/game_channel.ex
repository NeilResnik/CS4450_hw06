defmodule BullsWeb.GameChannel do
  use BullsWeb, :channel

  alias Bulls.Game
  alias Bulls.GameServer

  @impl true
  def join("game:" <> id, payload, socket) do

    # check if the game id exists, add user to that game

    # then create a new game as needed
    if authorized?(payload) do
      game = Game.new(id)
      game = Game.addPlayer(payload[:user])
      socket = assign(socket, :game, game)
      view = Game.view(game)
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


    game0 = socket0.assigns[:game]
    game1 = Game.guess(game0, guessArr)
    socket1 = assign(socket0, :game, game1)
    view = Game.view(game1)
    {:reply, {:ok, view}, socket1}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (game_channel:lobby).
  @impl true
  def handle_in("modifyUser", _, socket) do

    # take the user from the socket, if player, make player, if observer make observer

    game = Game.new
    socket = assign(socket, :game, game)
    view = Game.view(game)
    {:reply, {:ok, view}, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
