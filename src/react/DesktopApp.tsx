import * as React from "react";
import { DesktopProvider } from './DesktopProvider';
import Taskbar from "./Taskbar.tsx";
import WindowsLayer from './WindowsLayer.tsx';

export default function DesktopApp({pinnedApps}: {pinnedApps: string[]}) {
    return (
        <div style={{ position: "absolute", inset: 0}}>
            <DesktopProvider pinned={pinnedApps}>
                <WindowsLayer />
                <Taskbar />
            </DesktopProvider>
        </div>
    );
}