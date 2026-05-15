#!/usr/bin/env sh

# Git GUI clients often run hooks with a minimal PATH.
export PATH="$HOME/Library/pnpm:$HOME/.local/share/pnpm:/opt/homebrew/bin:/usr/local/bin:$PATH"

if [ -d "$HOME/.nvm/versions/node" ]; then
  for node_bin in "$HOME"/.nvm/versions/node/*/bin; do
    [ -d "$node_bin" ] && export PATH="$node_bin:$PATH"
  done
fi

run_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    pnpm "$@"
  elif command -v corepack >/dev/null 2>&1; then
    corepack pnpm "$@"
  else
    echo "pnpm/corepack not found. Install Node.js with Corepack or add pnpm to PATH." >&2
    exit 127
  fi
}
