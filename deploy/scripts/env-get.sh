#!/usr/bin/env bash
# Le o valor de uma chave de um arquivo .env sem imprimir o restante do arquivo.
# Uso: env-get.sh <arquivo.env> <CHAVE>
set -euo pipefail

file="${1:?arquivo .env obrigatorio}"
key="${2:?chave obrigatoria}"

line="$(grep -E "^${key}=" "$file" | head -n1 || true)"
[ -n "$line" ] || exit 1

value="${line#*=}"
value="${value%$'\r'}"

if [ "${#value}" -ge 2 ]; then
  first="${value:0:1}"
  last="${value: -1}"
  if [ "$first" = "$last" ] && { [ "$first" = '"' ] || [ "$first" = "'" ]; }; then
    value="${value:1:${#value}-2}"
  fi
fi

printf '%s' "$value"
