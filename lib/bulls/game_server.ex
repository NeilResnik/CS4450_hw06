# based on code from Nat's scratch repo
defmodule Bulls.GameServer do
  use GenServer

  alias Bulls.BackupAgent
  alias Bulls.Game
  alias Bulls.GameSup

  # public interface
  def register(name) do
    {:via, Registry, {Bulls.GameReg, name}}
  end

  def start(name) do
    spec = %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [name]},
      restart: :permanent,
      type: :worker
    }
    GameSup.start_child(spec)
  end

  def start_link(name) do
    game = BackupAgent.get(name) || Game.new(name)
    GenServer.start_link(
      __MODULE__,
      game,
      name: reg(name)
    )
    # not sure if this is necessary, seems necessary
    BackupAgent.put(name, game)
  end
  
  #def reset(name) do
    #GenServer.call(reg(name), {:reset, name})
  #end

  def guess(name, userId, guessArr) do
    GenServer.call(reg(name), {:guess, name, userId, guessArr})
  end

  def peek(name) do
    GenServer.call(reg(name), {:peek, name})
  end

  # add a new player to the game
  # name: string: game name
  # user: string: user name
  def addObserver(name, user) do
    GenServer.call(reg(name), {:addObserver, name, user})
  end

  # toggle a user between player and observer
  # name: string: game name
  # userId: int: id of the user
  # player: boolean: true if wants to become a player, false if become observer 
  def modifyUser(name, userId, player) do
    GenServer.call(reg(name), {:modifyUser, name, userId, player})
  end


  # set a player as ready or not, do nothing if observer
  # name: string: game name
  # userId: int: id of user
  # ready: boolean, true if ready, false if not
  def setReady(name, userId, ready) do
    GenServer.call(reg(name), {:setReady, name, userId, ready})
  end

  # implementation


  def handle_call({:reset, name}, _from, game) do
    game = Game.new(game[:gameName])
    BackupAgent.put(name, game)
    {:reply, game, game}
  end

  def handle_call({:guess, name, userId, guessArr}, _from, game) do
    game = Game.addGuess(game, userId, guessArr)
    BackupAgent.put(name, game)
    {:reply, game, game}
  end

  def handle_call({:peek, _name}, _from, game) do
    {:reply, game, game}
  end

  # add an observer
  def handle_call({:addObserver, name, user}, _from, game) do
    # add an observer and return th id!
    game1 = Game.addObserver(game, user)
    BackupAgent.put(name, game1)
    {:reply, game, game}
  end

  # toggle user from player to observer or vice versa
  def handle_call({:modifyUser, name, userId, player}, _from, game) do
    game = Game.modifyUser(game, userId, player)
    if game do
      BackupAgent.put(name, game)
    end
    {:reply, game, game}
  end

  # toggle the ready state of a player, if all ready then start timer!
  def handle_call({:setReady, name, userId, ready}, _from, game) do
    game = Game.setReady(game, userId, ready)
    if game.gameState == "playing" do
      Process.send_after(self(), :doGuesses, 30_000)
      {:ok, name}
    end
    BackupAgent.put(name, game)
    {:reply, game, game}
  end

  # TODO modify this to pass a guess
  def handle_info(:doGuesses, name) do
    game = reg(name)
    game = Game.doGuesses(game)
    BullsWeb.Endpoint.broadcast!(
      "game:#{name}",
      "view",
      Game.view(game))
    if game.gameState == "playing" do
      # nobody has won, start next timer
      Process.send_after(self(), :doGuesses, 30_000)
      {:ok, name}
    end
    {:noreply, game}
  end
end