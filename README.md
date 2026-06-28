# Latex Renderer

A Vencord userplugin that parses and renders LaTeX mathematical notation in message components using [KaTeX](https://katex.org/).

## Features

- **Inline Support**: Render math within sentences using `$ ... $` syntax.
- **Block Support**: Render standalone math blocks using `$$ ... $$` syntax.
- **Discord Integration**: Specialized CSS overrides to ensure LaTeX renders correctly inside bolded (`**`) or italicized (`*`) text.

## Install

Follow the [official Vencord documentation](https://docs.vencord.dev/installing/custom-plugins/) for installing custom plugins

Drop the index.tsx inside `src/userplugins/latexRenderer/`
