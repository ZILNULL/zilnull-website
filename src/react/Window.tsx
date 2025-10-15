import * as React from 'react';
import { useDesktop } from './DesktopProvider';
import type { WindowState } from './types';
import { APPS } from "./apps/registry";

export default function Window({ w }: { w: WindowState }) {
    const { dispatch } = useDesktop();
    const ref = React.useRef<HTMLDivElement | null>(null);
    if (w.minimized) return null;

    const style: React.CSSProperties = w.maximized
        ? { left: 0, top: 0, width: '100%', height: '100%' }
        : { left: w.x, top: w.y, width: w.w, height: w.h };

    const AppComponent = APPS[w.appId]?.Component;
    const onFocus = () => dispatch({ type: 'FOCUS', appId: w.id });

    function getParentRect(el: HTMLElement) {
        const parent = (el.offsetParent as HTMLElement) || el.parentElement || document.body;
        return parent.getBoundingClientRect();
    }

    const NoAction = () => {
        return;
    }

    // ===== Moving ======
    const onTitlebarPointerDown = (e: React.PointerEvent) => {
        if (w.maximized) return;
        if (e.button !== 0 && e.pointerType === "mouse") return;

        const elTarget = e.target as Element;
        if (elTarget.closest('.win__controls') || elTarget.closest('.win__btn')) return;

        e.preventDefault();
        const el = ref.current!;
        const rect = el.getBoundingClientRect();
        const parentRect = getParentRect(el);

        const startX = e.clientX;
        const startY = e.clientY;
        const offsetX = startX - rect.left;
        const offsetY = startY - rect.top;
        dispatch({ type: "FOCUS", appId: w.id });

        // Capture pointer:
        el.setPointerCapture?.(e.pointerId);

        const onMove = (ev: PointerEvent) => {
            const nx = Math.round(ev.clientX - offsetX - parentRect.left);
            const ny = Math.round(ev.clientY - offsetY - parentRect.top);
            dispatch({ type: "MOVE", appId: w.id, x: nx, y: ny });
        };

        const onUp = (ev: PointerEvent) => {
            el.releasePointerCapture?.(e.pointerId);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    // ===== Resizing ======
    const onHandlePointerDown = (dir: string) =>
        (e: React.PointerEvent) => {
            if (w.maximized) return;
            if (e.button !== 0 && e.pointerType === "mouse") return;

            e.preventDefault();

            const el = ref.current!;
            const rect = el.getBoundingClientRect();
            const parentRect = getParentRect(el);

            const cs = window.getComputedStyle(el);
            const startW = parseFloat(cs.width);
            const startH = parseFloat(cs.height);
            const startLeft = w.x;
            const startTop  = w.y;
            const startX = e.clientX;
            const startY = e.clientY;

            dispatch({ type: "FOCUS", appId: w.id });
            el.setPointerCapture?.(e.pointerId);

            const west = dir.includes("w");
            const east = dir.includes("e");
            const north = dir.includes("n");
            const south = dir.includes("s");

            const MIN_W = 200, MIN_H = 120;

            const onMove = (ev: PointerEvent) => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;

                let newW = startW;
                let newH = startH;
                let newLeft = startLeft;
                let newTop  = startTop;

                if (east)  newW = startW + dx;
                if (south) newH = startH + dy;
                if (west)  { newW = startW - dx; newLeft = startLeft + dx; }
                if (north) { newH = startH - dy; newTop  = startTop  + dy; }

                if (newW < MIN_W)  { if (west)  newLeft += (newW - MIN_W);  newW = MIN_W; }
                if (newH < MIN_H)  { if (north) newTop  += (newH - MIN_H);  newH = MIN_H; }

                dispatch({
                    type: "RESIZE",
                    appId: w.id,
                    w: Math.round(newW),
                    h: Math.round(newH),
                    x: Math.round(newLeft),
                    y: Math.round(newTop),
                });
            };

        const onUp = (ev: PointerEvent) => {
            (e.target as Element).releasePointerCapture?.(e.pointerId);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    return (
        <div
            ref={ref}
            className={`win${w.maximized ? ' win--maximized' : ''}`}
            id={w.id}
            role="dialog"
            aria-label={w.title}
            aria-modal="false"
            style={{ position: 'absolute', zIndex: w.z, ...style }}
            onMouseDown={onFocus}
        >
            <div className="win__titlebar" onPointerDown={onTitlebarPointerDown} onDoubleClick={() => dispatch({ type: "TOGGLE_MAX", appId: w.id })}>
                <div className="win__title">{w.title}</div>
                <div className="win__controls">
                    <button className="win__btn" aria-label="Minimize/Restore" onClick={(ev) => {ev.stopPropagation(); dispatch({ type: 'TOGGLE_MIN', appId: w.id })}}>—</button>
                    <button className="win__btn" aria-label="Maximize/Restore" onClick={(ev) => {ev.stopPropagation(); dispatch({ type: 'TOGGLE_MAX', appId: w.id })}}>▢</button>
                    <button className="win__btn" aria-label="Close" onClick={(ev) => {ev.stopPropagation(); dispatch({ type: 'CLOSE', appId: w.id })}}>✕</button>
                </div>
            </div>

            <div className="win__content">
                {AppComponent ? <AppComponent winId={w.id} /> : <div style={{ padding: 10 }}>Unknown app: {w.appId}</div>}
            </div>
            
            <div className="win__handle win__handle--n"  data-dir="n" onPointerDown={onHandlePointerDown("n")}/>
            <div className="win__handle win__handle--s"  data-dir="s" onPointerDown={onHandlePointerDown("s")}/>
            <div className="win__handle win__handle--e"  data-dir="e" onPointerDown={onHandlePointerDown("e")}/>
            <div className="win__handle win__handle--w"  data-dir="w" onPointerDown={onHandlePointerDown("w")}/>
            <div className="win__handle win__handle--ne" data-dir="ne" onPointerDown={onHandlePointerDown("ne")}/>
            <div className="win__handle win__handle--nw" data-dir="nw" onPointerDown={onHandlePointerDown("nw")}/>
            <div className="win__handle win__handle--se" data-dir="se" onPointerDown={onHandlePointerDown("se")}/>
            <div className="win__handle win__handle--sw" data-dir="sw" onPointerDown={onHandlePointerDown("sw")}/>
        </div>
    );
}