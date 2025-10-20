import * as React from "react";
import { DesktopProvider } from './DesktopProvider';
import Taskbar from "./Taskbar.tsx";
import WindowsLayer from './WindowsLayer.tsx';
import DesktopShortcuts from "./DesktopShortcuts.tsx";

export default function DesktopApp({pinnedApps, shortcuts = pinnedApps}: {pinnedApps: string[], shortcuts?: string[]}) {
    return (
        <div style={{ position: "absolute", inset: 0}}>
            <DesktopProvider pinned={pinnedApps}>
                <DesktopShortcuts shortcuts={shortcuts} />
                <WindowsLayer />
                <Taskbar />
            </DesktopProvider>
        </div>
    );
}