# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

# Configures the endpoint
config :bulls_multiplayer, Bulls_MultiplayerWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "4aDq76sxflH3NeESR6YqVEPy4v7ZQiETxAbi9Q+d/3JHmNQRMJbvxS1awswpHufE",
  render_errors: [view: Bulls_MultiplayerWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: Bulls_Multiplayer.PubSub,
  live_view: [signing_salt: "MWw369rS"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
