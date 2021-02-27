## DESIGN DECISIONS:

 - react tries to prevent invalid inputs as the user types
 - elixir double checks that guesses are valid
 - elixir ensures game is playing before accepting a guess 
  - does not accept if game is over
 - elixir state stores
  - answer (the num to guess)
  - guessHistory (list of guesses and their results)
  - gameState (playing, won, or lost)


# Bulls_Multiplayer

To start your Phoenix server:

  * Install dependencies with `mix deps.get`
  * Install Node.js dependencies with `npm install` inside the `assets` directory
  * Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Learn more

  * Official website: https://www.phoenixframework.org/
  * Guides: https://hexdocs.pm/phoenix/overview.html
  * Docs: https://hexdocs.pm/phoenix
  * Forum: https://elixirforum.com/c/phoenix-forum
  * Source: https://github.com/phoenixframework/phoenix
