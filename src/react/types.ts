export type AppId = string;
export type WinId = string;

export type WindowState = {
    id: WinId;
    appId: AppId;
    title: string;
    x: number; y: number;
    w: number; h: number;
    minimized: boolean;
    maximized: boolean;
    z: number;
};

export type DesktopState = {
    windows: Record<WinId, WindowState>;
    order: WinId[];
    activeId?: WinId;
    pinned: AppId[];
};

export type AppMeta = {
  id: AppId;
  title: string;
  size?: { w: number; h: number };
  Icon?: React.ComponentType<{ className?: string }>;
  Component: React.ComponentType<{ winId: string }>;
};

export type DesktopAction =
    | { type: 'OPEN'; appId: AppId; init?: Partial<WindowState> }
    | { type: 'FOCUS'; appId: AppId; }
    | { type: 'CLOSE'; appId: AppId; }
    | { type: 'TOGGLE_MIN'; appId: AppId }
    | { type: 'TOGGLE_MAX'; appId: AppId }
    | { type: 'MOVE'; appId: WinId; x: number; y: number }
    | { type: 'RESIZE'; appId: WinId; w: number; h: number; x?: number; y?: number };

