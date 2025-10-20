import * as React from "react";
import { DesktopProvider, useDesktop } from './DesktopProvider';
import Taskbar from "./Taskbar.tsx";
import WindowsLayer from './WindowsLayer.tsx';
import DesktopShortcuts from "./DesktopShortcuts.tsx";
import type { InitialWin } from './types';
import { APPS } from "./apps/registry";

export default function DesktopApp({
    pinnedApps, 
    shortcuts = pinnedApps, 
    initialWindows = []
}: {
    pinnedApps: string[],
    shortcuts?: string[], 
    initialWindows?: InitialWin[],
}) {
    return (
        <div style={{ position: "absolute", inset: 0}}>
            <DesktopProvider pinned={pinnedApps}>
                <InitialOpener items={initialWindows} />
                <DeepLinkOpener />
                <DesktopShortcuts shortcuts={shortcuts} />
                <WindowsLayer />
                <Taskbar />
            </DesktopProvider>
        </div>
    );
}

function InitialOpener({ items }: { items: InitialWin[] }) {
    const { dispatch } = useDesktop();
    React.useEffect(() => {
        if (!items?.length) return;
        for (const it of items) {
            const meta = APPS[it.appId as keyof typeof APPS];
            if (!meta) continue;
            dispatch({
                type: 'OPEN',
                appId: it.appId,
                init: {
                    title: it.init?.title ?? meta.title,
                    w: it.init?.w ?? meta.size?.w,
                    h: it.init?.h ?? meta.size?.h,
                    ...it.init,
                },
                payload: it.payload,
            });
        }
    }, []);
    return null;
}

function DeepLinkOpener() {
    const { dispatch } = useDesktop();

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const open = params.get('open');
        if (!open) return;

        const specs = open.split(',').map(s => s.trim()).filter(Boolean);
        for (const spec of specs) {
            const [appIdRaw, rest] = spec.split(':');
            const appId = appIdRaw as keyof typeof APPS;
            if (!APPS[appId]) continue;

            // Build payload if any
            let payload: any = undefined;
            if (rest && appId === 'blog') {
                payload = { postSlug: rest, route: 'post' };
            }

            dispatch({
                type: 'OPEN',
                appId: appId as string,
                init: { title: APPS[appId].title, w: APPS[appId].size?.w, h: APPS[appId].size?.h },
                payload,
            });
        }
    }, [dispatch]);

    return null;
}