defmodule Bulls_Multiplayer.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      Bulls_MultiplayerWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: Bulls_Multiplayer.PubSub},
      # Start the Endpoint (http/https)
      Bulls_MultiplayerWeb.Endpoint,
      # Start a worker by calling: Bulls_Multiplayer.Worker.start_link(arg)
      # {Bulls_Multiplayer.Worker, arg}
      # Bulls_Multiplayer.BackupAgent,
      Bulls_Multiplayer.GameSup
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Bulls_Multiplayer.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    Bulls_MultiplayerWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
