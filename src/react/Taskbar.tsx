import * as React from "react";
import { useDesktop } from './DesktopProvider';
import { APPS } from "./apps/registry";

function byZDesc(a: { z: number }, b: { z: number }) { return b.z - a.z; }

function windowsForApp(state: any, appId: string) {
    const all = state.order.map((id: string) => state.windows[id]).filter((w: any) => w.appId === appId);
    const visibles = all.filter((w: any) => !w.minimized).sort(byZDesc);
    const minimized = all.filter((w: any) =>  w.minimized).sort(byZDesc);
    return { all, visibles, minimized };
}

function anyWindowForApp(state: any, appId: string) {
    return state.order.some((id: string) => {
        const w = state.windows[id];
        return w.appId === appId;
    });
}

function isWindowOnTop(state: any, appId: string) {
    if (state.order.length == 0) return;
    const sorted = state.order.map((id: string) => state.windows[id]).sort(byZDesc);
    return sorted[0].appId === appId && !sorted[0].minimized;
}

function anyVisibleForApp(state: any, appId: string) {
    return state.order.some((id: string) => {
        const w = state.windows[id];
        return w.appId === appId && !w.minimized;
    });
}

export default function Taskbar() {
    const { state, dispatch } = useDesktop();
    const windowsFrontToBack = [...state.order].reverse().map(id => state.windows[id]);
    const visibleAppIds = new Set(
        windowsFrontToBack.filter(w => !w.minimized).map(w => w.appId)
    );

    const handleAppClick = (appId: string) => {
        const meta = APPS[appId];
        if (!meta) return;

        const { visibles, minimized } = windowsForApp(state, appId);

        if (visibles.length > 0) {
            const top = visibles[0];
            dispatch({ type: "TOGGLE_MIN", appId: top.id });
            return;
        }

        if (minimized.length > 0) {
            const top = minimized[0];
            dispatch({ type: "TOGGLE_MIN", appId: top.id });
            dispatch({ type: "FOCUS", appId: top.id });
            return;
        }

        dispatch({
            type: "OPEN",
            appId,
            init: { title: meta.title, w: meta.size?.w, h: meta.size?.h },
        });
    };

    return (
        <div className="taskbar" aria-label="Taskbar" style={{ pointerEvents: "auto" }}>
            <div className="taskbar__left">
                <button className="taskbar__start" title="Start" aria-label="Start">⊞</button>

                <div className="taskbar__apps" role="list">
                    {state.pinned.map((appId) => {
                        const meta = APPS[appId];
                        if (!meta) return null;
                        const isActive = anyWindowForApp(state, appId);
                        const isTop = isWindowOnTop(state, appId);

                        return (
                            <button
                                key={appId}
                                className={`taskbar__icon ${isActive ? "is-active" : ""} ${isTop ? "is-top" : ""}`}
                                role="listitem"
                                title={meta.title}
                                aria-label={meta.title}
                                type="button"
                                onClick={() => handleAppClick(appId)}
                            >
                                {meta.iconUrl
                                    ? <img className="taskbar__iconimg" src={meta.iconUrl} alt="" />
                                    : <span className="taskbar__dot" aria-hidden="true" />
                                }
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="taskbar__right">
                <Clock />
            </div>
        </div>
    );
}

function Clock() {
    const [text, setText] = React.useState(() => formatTime(new Date()));
    React.useEffect(() => {
        const i = setInterval(() => setText(formatTime(new Date())), 60_000);
        return () => clearInterval(i);
    }, []);
    return <time className="taskbar__clock">{text}</time>;
}

function formatTime(d: Date) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}