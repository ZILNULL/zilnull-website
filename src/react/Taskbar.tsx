import * as React from "react";
import { useDesktop } from './DesktopProvider';
import { APPS } from "./apps/registry";
import CtxMenu, { type CtxMenuItem } from "./CtxMenu";

type Ctx = { open: boolean; x: number; y: number; appId: string | null };
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
    const [ctx, setCtx] = React.useState<Ctx>({ open: false, x: 0, y: 0, appId: null });
    const windowsFrontToBack = [...state.order].reverse().map(id => state.windows[id]);
    const visibleAppIds = new Set(
        windowsFrontToBack.filter(w => !w.minimized).map(w => w.appId)
    );

    const openContextMenu = (e:React.MouseEvent, appId:string) => {
        e.preventDefault();
        e.stopPropagation();
        setCtx({ open:true, x:e.clientX, y:e.clientY, appId });
    };

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
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setCtx({ open: true, x: e.clientX, y: e.clientY, appId });
                                }}
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

            {ctx.open && ctx.appId && (
                <TaskbarCtxMenu
                    x={ctx.x}
                    y={ctx.y}
                    appId={ctx.appId}
                    onClose={() => setCtx(c => ({...c, open:false}))}
                />
            )}
        </div>
    );
}

function TaskbarCtxMenu(
    { x, y, appId, onClose } :
    { x:number; y:number; appId:string; onClose:()=>void;}
) {
    const { state, dispatch } = useDesktop();
    const meta = APPS[appId];
    const { all, minimized, visibles } = windowsForApp(state, appId);

    const items: CtxMenuItem[] = [
        ...(meta ? [{ type:"label", label: "" } as const] : []),
        { type:"item", label:"Open (new window)", onSelect: () => {
            if (!meta) return;
            dispatch({ type:"OPEN", appId, init:{ title: meta.title, w: meta.size?.w, h: meta.size?.h }});
        }},
        { type:"separator" },
        { type:"label", label:"Current windows" },
        ...(all.length === 0
            ? [{ type:"item", label:"None", onSelect: () => {}, disabled: true } as const]
            : all.map((w:any, i:number) => ({
                type: "item",
                label: `Window #${i+1} ${w.minimized ? "- Open" : "- Minimize"}`,
                onSelect: () => {
                    dispatch({ type:"TOGGLE_MIN", appId: w.id });
                    dispatch({ type:"FOCUS", appId: w.id });
                }
                }) as CtxMenuItem)
        ),
        { type:"separator" },
        { type:"item", label:"Restore all", onSelect: () => dispatch({ type:"RESTORE_ALL_APP", appId }), disabled: minimized.length===0 },
        { type:"item", label:"Minimize all", onSelect: () => dispatch({ type:"MINIMIZE_ALL_APP", appId }), disabled: visibles.length===0 },
    ];

    return <CtxMenu x={x} y={y} items={items} onClose={onClose} title={meta?.title ?? appId} />;
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