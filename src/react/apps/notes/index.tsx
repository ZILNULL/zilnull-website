import * as React from "react";
import type { AppMeta } from "../../types.ts";

function NotesApp({ winId }: { winId: string }) {
    return (
        <div style={{ padding: 10 }}>
            <h2 style={{ margin: "0 0 8px 0" }}>Notes</h2>
            <textarea style={{ width: "100%", height: 220 }} />
        </div>
    );
}

const meta: AppMeta = {
    id: "notes",
    title: "Notes",
    size: { w: 420, h: 300 },
    iconUrl: "/images/notes_icon.png",
    maximized: false,
    Component: NotesApp,
};

export default meta;