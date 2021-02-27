defmodule Bulls_MultiplayerWeb.PageController do
  use Bulls_MultiplayerWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
