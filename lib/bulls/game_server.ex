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
  end

  def reset(name) do
    GenServer.call(reg(name), {:reset, name})
  end

  def guess(name, guessList) do
    GenServer.call(reg(name), {:guess, name, guessList})
  end

  def peek(name) do
    GenServer.call(reg(name), {:peek, name})
  end

  # implementation

  # modify this to do theeeeeee auto guess and show guesses states
  def init(game) do
    Process.send_after(self(), :pass, 30_000)
    {:ok, game}
  end

  def handle_call({:reset, name}, _from, game) do
    game = Game.new(game[:gameName])
    BackupAgent.put(name, game)
    {:reply, game, game}
  end

  def handle_call({:guess, name, letter}, _from, game) do
    game = Game.guess(game, letter)
    BackupAgent.put(name, game)
    {:reply, game, game}
  end

  def handle_call({:peek, _name}, _from, game) do
    {:reply, game, game}
  end

  # TODO modify this to pass a guess
  def handle_info(:pass, game) do
    game = Game.guess(game, "q")
    HangmanWeb.Endpoint.broadcast!(
      "game:1", # FIXME: Game name should be in state
      "view",
      Game.view(game, ""))
    {:noreply, game}
  end
end