import definePlugin from "@utils/types";
import { Parser } from "@webpack/common";
import katex from "katex";
const katexStyles = "https://cdn.jsdelivr.net/npm/katex@0.17.0/dist/katex.min.css";

const CSS = `
.latex-block, .latex-inline {
    display: inline-block !important;
    white-space: nowrap;
    line-height: 1;
}
.katex-display {
    display: inline-block !important;
    margin: 0 !important;
    padding: 0 !important;
    text-align: left !important;
}
.katex-display > .katex {
    display: inline-block !important;
    text-align: left !important;
}
strong .katex, b .katex, [class*="bold"] .katex {
    font-weight: bold !important;
}
strong .katex *, b .katex *, [class*="bold"] .katex * {
    font-weight: inherit !important;
}
em .latex-block, i .latex-block, [class*="italic"] .latex-block,
em .latex-inline, i .latex-inline, [class*="italic"] .latex-inline {
    transform: skewX(-10deg);
    transform-origin: bottom center;
    font-style: italic !important;
    font-synthesis: style !important;
}
em .katex *, i .katex *, [class*="italic"] .katex * {
    font-style: inherit !important;
}
`;

function LatexRenderer({ mathText, displayMode }: { mathText: string; displayMode: boolean; }) {
    try {
        const html = katex.renderToString(mathText, {
            throwOnError: false,
            displayMode
        });

        return (
            <span
                className={displayMode ? "latex-block" : "latex-inline"}
                style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                    margin: displayMode ? "0.2em 5px" : "0 2px",
                    fontWeight: "inherit",
                    fontStyle: "inherit"
                }}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    } catch (err) {
        return <span style={{ color: "red" }}>[Math Error]</span>;
    }
}

export default definePlugin({
    name: "Latex Renderer",
    description: "Parses Latex math notation into a rendered component",
    authors: [{ name: "Determinated", id: 891294327437930517n }],

    start() {
        if (!document.getElementById("katex-style")) {
            const link = document.createElement("link");
            link.id = "katex-style";
            link.rel = "stylesheet";
            link.href = katexStyles;
            document.head.appendChild(link);
        }

        if (!document.getElementById("latex-overrides")) {
            const style = document.createElement("style");
            style.id = "latex-overrides";
            style.innerHTML = CSS;
            document.head.appendChild(style);
        }

        Parser.defaultRules.latexBlock = {
            order: Parser.defaultRules.inlineCode.order - 1,
            match: (source) => /^\$\$([\s\S]+?)\$\$/.exec(source),
            parse: (capture) => ({ mathText: capture[1], displayMode: true }),
            react: (node) => <LatexRenderer {...node} />
        };

        Parser.defaultRules.latexInline = {
            order: Parser.defaultRules.inlineCode.order - 1,
            match: (source) => {
                if (!source.startsWith('$') || source.startsWith('$$')) return null;

                let braceLevel = 0;
                let escapeNext = false;

                for (let i = 1; i < source.length; i++) {
                    const char = source[i];

                    if (escapeNext) {
                        escapeNext = false;
                        continue;
                    }
                    if (char === '\\') {
                        escapeNext = true;
                        continue;
                    }

                    if (char === '{') {
                        braceLevel++;
                    } else if (char === '}') {
                        if (braceLevel > 0) braceLevel--;
                    } else if (char === '$' && braceLevel === 0) {
                        const matchString = source.slice(0, i + 1);
                        const capture = source.slice(1, i);

                        if (capture.length === 0) return null; // Reject empty $$

                        if (capture.length > 1 && (/^\s/.test(capture) || /\s$/.test(capture))) {
                            return null;
                        }

                        return [matchString, capture];
                    }
                }

                return null;
            },
            parse: (capture) => ({ mathText: capture[1], displayMode: false }),
            react: (node) => <LatexRenderer {...node} />
        };
    },

    stop() {
        delete Parser.defaultRules.latexBlock;
        delete Parser.defaultRules.latexInline;
        document.getElementById("katex-style")?.remove();
        document.getElementById("latex-overrides")?.remove();
    }
});