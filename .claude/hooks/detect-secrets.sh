#!/bin/bash
# シークレットパターン検出フック（PreToolUse用）
# git commit時にステージされたファイルからシークレットパターンを検出しブロック

input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name // empty')
command=$(echo "$input" | jq -r '.tool_input.command // empty')

# Bashツール以外はスキップ
if [[ "$tool_name" != "Bash" ]]; then
  exit 0
fi

# git commitコマンドかチェック
if [[ ! "$command" =~ git[[:space:]]+commit ]]; then
  exit 0
fi

# ステージされたファイルの内容をチェック
staged_diff=$(git diff --cached --diff-filter=ACM 2>/dev/null)
if [[ -z "$staged_diff" ]]; then
  exit 0
fi

# シークレットパターン（大文字小文字区別なし）
patterns=(
  'password\s*[:=]'
  'api[_-]?key\s*[:=]'
  'secret[_-]?key\s*[:=]'
  'access[_-]?token\s*[:=]'
  'private[_-]?key'
  'credentials\s*[:=]'
  'BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY'
  'AKIA[0-9A-Z]{16}'
)

found=""
for pattern in "${patterns[@]}"; do
  matches=$(echo "$staged_diff" | grep -inE "^\+" | grep -iE "$pattern" 2>/dev/null)
  if [[ -n "$matches" ]]; then
    found="$found$matches"$'\n'
  fi
done

if [[ -n "$found" ]]; then
  echo "ERROR: ステージされたファイルにシークレットパターンを検出しました:" >&2
  echo "$found" | head -5 >&2
  echo "シークレットを除去してから再度コミットしてください。" >&2
  exit 2
fi

exit 0
