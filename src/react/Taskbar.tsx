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
            init: { title: meta.title, w: meta.size?.w, h: meta.size?.h, maximized: meta.maximized },
        });
    };

    return (
        <div className="taskbar" aria-label="Taskbar" style={{ pointerEvents: "auto" }}>
            <div className="taskbar__left">
                <div className="taskbar__start" title="Start" aria-label="Start">
                    <img src="/images/logo_start_zilo.png" />
                    <span className="taskbar__start-text">START</span>
                </div>

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
                                <div className="taskbar__icontext"><span>{meta.title}</span></div>
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
    const [now, setNow] = React.useState(() => new Date());

    React.useEffect(() => {
        const step = 60_000;
        const msUntilNextMinute = step - (Date.now() % step);

        const t0 = window.setTimeout(() => {
            setNow(new Date());
            const i = window.setInterval(() => setNow(new Date()), step);
            return () => clearInterval(i);
        }, msUntilNextMinute);

        return () => clearTimeout(t0);
    }, []);

    const formatter = React.useMemo(
        () =>
        new Intl.DateTimeFormat(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        }),
        []
    );

    return (
        <div className="taskbar__clock">
            <time className="taskbar__clock-time" dateTime={now.toISOString()}>
                {formatter.format(now)}
            </time>
        </div>
    );
}