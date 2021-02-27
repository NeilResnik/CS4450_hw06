#!/bin/bash

export SECRET_KEY_BASE=W68eso5YQOlbtvSNUR50N/HDWj6IaEhAwMR3LtzuBEQAefwYVbX84bvoTA7XtiGi
export MIX_ENV=prod
export PORT=4792

echo "Stopping old copy of app, if any..."

_build/prod/rel/bulls/bin/bulls_multiplayer stop || true

echo "Starting app..."

export PORT=4780
_build/prod/rel/bulls/bin/bulls_multiplayer start

# TODO: Add a systemd service file
#       to start your app on system boot.

