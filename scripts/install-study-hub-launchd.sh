#!/bin/zsh
set -euo pipefail

project_root="$(cd "$(dirname "$0")/.." && pwd)"
npm_bin="$(command -v npm)"
node_bin="$(command -v node)"
runtime_path="$(dirname "$node_bin"):/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
agent_dir="$HOME/Library/LaunchAgents"
log_dir="$project_root/logs"
uid="$(id -u)"

mkdir -p "$agent_dir" "$log_dir"

escape_sed() { print -r -- "$1" | sed 's/[&|]/\\&/g'; }
project_escaped="$(escape_sed "$project_root")"
npm_escaped="$(escape_sed "$npm_bin")"
path_escaped="$(escape_sed "$runtime_path")"

for service in web worker; do
  template="$project_root/ops/launchd/com.namson.study-hub.$service.plist.template"
  target="$agent_dir/com.namson.study-hub.$service.plist"
  sed -e "s|__PROJECT_ROOT__|$project_escaped|g" -e "s|__NPM_BIN__|$npm_escaped|g" -e "s|__PATH__|$path_escaped|g" "$template" > "$target"
  plutil -lint "$target"
done

cd "$project_root"
npm run build

for service in web worker; do
  label="com.namson.study-hub.$service"
  target="$agent_dir/$label.plist"
  launchctl bootout "gui/$uid/$label" >/dev/null 2>&1 || true
  launchctl bootstrap "gui/$uid" "$target"
done

echo "Study Hub web and worker services are installed."
echo "Open http://localhost:3125/study-hub"
