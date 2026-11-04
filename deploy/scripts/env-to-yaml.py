#!/usr/bin/env python3
"""Converte um arquivo .env em YAML aceito por `gcloud run --env-vars-file`.

- Remove aspas simples/duplas externas dos valores.
- Normaliza CORS_ORIGINS (trim, remove barra final, deduplica) e valida o esquema.
- Serializa cada valor como string JSON, que e um escalar valido em YAML,
  preservando JSON inline, virgulas, aspas e sequencias \\n.

Uso: env-to-yaml.py <arquivo.env>
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

SCHEME_RE = re.compile(r"^https?://", re.IGNORECASE)


def normalize_origins(raw: str) -> str:
    origins: list[str] = []
    for part in raw.split(","):
        origin = part.strip().rstrip("/")
        if not origin:
            continue
        if not SCHEME_RE.match(origin):
            raise SystemExit(
                f"ERRO: CORS_ORIGINS invalido (sem esquema http/https): {origin}"
            )
        if origin not in origins:
            origins.append(origin)
    if not origins:
        raise SystemExit("ERRO: CORS_ORIGINS vazio")
    return ",".join(origins)


def parse_env(path: Path) -> dict[str, str]:
    entries: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
            value = value[1:-1]
        if key == "CORS_ORIGINS":
            value = normalize_origins(value)
        entries[key] = value
    return entries


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("uso: env-to-yaml.py <arquivo.env>")

    path = Path(sys.argv[1])
    if not path.is_file():
        raise SystemExit(f"ERRO: arquivo de ambiente nao encontrado: {path}")

    entries = parse_env(path)
    for key in sorted(entries):
        print(f"{key}: {json.dumps(entries[key], ensure_ascii=False)}")


if __name__ == "__main__":
    main()
