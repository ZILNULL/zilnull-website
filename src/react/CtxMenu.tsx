import * as React from "react";
import { createPortal } from "react-dom";

export type CtxMenuItem =
    | { type: "item"; label: string; onSelect: () => void; disabled?: boolean }
    | { type: "separator" }
    | { type: "label"; label: string };

export default function CtxMenu(
    { x, y, items, onClose, title, }: 
    { x: number; y: number; items: CtxMenuItem[]; onClose: () => void; title?: string;}
) {
    const ref = React.useRef<HTMLDivElement | null>(null);
    const [pos, setPos] = React.useState<{ left: number; top: number }>({ left: x, top: y });

    React.useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            if (e.button !== 0) return; // ignore right/middle
            if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return;
            onClose();
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };

        window.addEventListener("mousedown", onMouseDown, true);
        window.addEventListener("keydown", onKey, true);
        return () => {
            window.removeEventListener("mousedown", onMouseDown, true);
            window.removeEventListener("keydown", onKey, true);
        };
    }, [onClose]);

    React.useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;

        const mw = el.offsetWidth;
        const mh = el.offsetHeight;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const left = Math.min(Math.max(8, x), Math.max(8, vw - mw - 8));
        const top = Math.min(Math.max(8, y), Math.max(8, vh - mh - 8));
        setPos({ left, top });

    }, [x, y]);

    const menu = (
        <div
            ref={ref}
            className="ctxmenu"
            style={{ position: "fixed", left: pos.left, top: pos.top, zIndex: 99999 }}
            role="menu"
            onContextMenu={(e) => e.preventDefault()}
        >
        {title && <div className="ctxmenu__hd">{title}</div>}
        {items.map((it, i) => {
            if (it.type === "separator") {
                return <div key={`sep-${i}`} className="ctxmenu__sep" />;
            }
            if (it.type === "label") {
                return (
                    <div key={`lbl-${i}`} className="ctxmenu__subhd">
                        {it.label}
                    </div>
                );
            }

            return (
                <button
                    key={`itm-${i}`}
                    className="ctxmenu__item"
                    role="menuitem"
                    disabled={it.disabled}
                    onClick={() => {
                        if (!it.disabled) it.onSelect();
                        onClose();
                    }}
                >
                    {it.label}
                </button>
            );
        })}
        </div>
    );

    return createPortal(menu, document.body);
}
