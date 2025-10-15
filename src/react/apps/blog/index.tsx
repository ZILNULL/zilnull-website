import * as React from "react";
import type { AppMeta } from "../../types.ts";


function BlogApp({ winId }: { winId: string }) {
    const [items, setItems] = React.useState<
        { title: string; date: string; embedUrl: string }[]
    >([]);
    const [embed, setEmbed] = React.useState<string | null>(null);

    React.useEffect(() => {
        fetch("/api/blogs.json").then(r => r.json()).then(d => setItems(d.items || []));
    }, []);

    if (embed) {
        return (
        <div style={{ position: "absolute", inset: 0 }}>
            <iframe src={embed} style={{ width: "100%", height: "100%", border: 0, background: "transparent" }} />
        </div>
        );
    }

    return (
        <div style={{ padding: 10 }}>
        <h2 style={{ margin: "0 0 8px 0" }}>Blog</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
            {items.map(p => (
            <li key={p.embedUrl}>
                <button
                    onClick={() => setEmbed(p.embedUrl)}
                    style={{
                        width: "100%", textAlign: "left", padding: "8px 10px",
                        border: "1px solid var(--border-color,#292828)",
                        background: "var(--background-color,#fff)",
                        color: "var(--text-color,#000)", borderRadius: 8, cursor: "pointer"
                    }}
                >
                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                    <div style={{ opacity: .7, fontSize: ".85em" }}>{new Date(p.date).toLocaleDateString()}</div>
                </button>
            </li>
            ))}
        </ul>
        </div>
    );
}

const meta: AppMeta = {
    id: "blog",
    title: "Blog",
    size: { w: 640, h: 420 },
    Component: BlogApp,
};

export default meta;