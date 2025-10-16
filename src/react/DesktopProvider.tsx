import * as React from 'react';
import type { DesktopState, DesktopAction, WindowState } from './types';

function newId(appId: string) {
  return `win-${appId}-${Math.random().toString(36).slice(2,7)}`;
}

const DesktopCtx = React.createContext<{
    state: DesktopState;
    dispatch: React.Dispatch<DesktopAction>;
}>({
    state: { windows: {}, order: [], pinned: [] },
    dispatch: () => {},
});

function reducer(state: DesktopState, action: DesktopAction): DesktopState {
    switch (action.type) {
        case 'OPEN': {
            const id = (action.init?.id as string) ?? newId(action.appId);
            const top = (state.order.length
                ? Math.max(...state.order.map(i => state.windows[i].z))
                : 1000) + 1;

            const win: WindowState = {
                id,
                appId: action.appId,
                title: action.init?.title ?? action.appId,
                x: action.init?.x ?? 80,
                y: action.init?.y ?? 60,
                w: action.init?.w ?? 520,
                h: action.init?.h ?? 340,
                minimized: false,
                maximized: false,
                z: top,
            };

            return {
                ...state,
                windows: { ...state.windows, [id]: win },
                order: [...state.order, id],
                activeId: id,
            };
        }
        case 'FOCUS': {
            const id = action.appId;
            if (!state.windows[id]) return state;
            const top = (state.order.length
                ? Math.max(...state.order.map(i => state.windows[i].z))
                : 1000) + 1;

            return {
                ...state,
                windows: { ...state.windows, [id]: { ...state.windows[id], z: top } },
                activeId: id,
            };
        }
        case 'CLOSE': {
            const id = action.appId;
            if (!state.windows[id]) return state;
            const { [id]: _remove, ...rest } = state.windows;

            return {
                ...state,
                windows: rest,
                order: state.order.filter(wid => wid !== id),
                activeId: state.activeId === id ? undefined : state.activeId,
            };
        }
        case 'TOGGLE_MIN': {
            const id = action.appId;
            const w = state.windows[id]; if (!w) return state;
            return {
                ...state,
                windows: { ...state.windows, [id]: { ...w, minimized: !w.minimized }},
            };
        }
        case 'TOGGLE_MAX': {
            const id = action.appId;
            const w = state.windows[id]; if (!w) return state;
            return {
                ...state,
                windows: { ...state.windows, [id]: { ...w, maximized: !w.maximized }},
            };
        }
        case 'MOVE': {
            const w = state.windows[action.appId]; if (!w) return state;

            return {
                ...state,
                windows: { ...state.windows, [action.appId]: { ...w, x: action.x, y: action.y } },
            };
            }
        case 'RESIZE': {
            const w = state.windows[action.appId]; if (!w) return state;

            const MIN_W = 200, MIN_H = 120;
            const nextW = Math.max(MIN_W, Math.round(action.w));
            const nextH = Math.max(MIN_H, Math.round(action.h));
            const nextX = action.x ?? w.x;
            const nextY = action.y ?? w.y;
            
            return {
                ...state,
                windows: {
                    ...state.windows,
                    [action.appId]: { ...w, w: nextW, h: nextH, x: nextX, y: nextY },
                },
            };
        }
        default:
            return state;
    }
}

export function DesktopProvider({ children, pinned, }: {children: React.ReactNode; pinned: string[];}) {
    const [state, dispatch] = React.useReducer(reducer, {
        windows: {},
        order: [],
        pinned,
    });

    return (
        <DesktopCtx.Provider value={{ state, dispatch }}>
            {children}
        </DesktopCtx.Provider>
    );
}

export function useDesktop() {
    return React.useContext(DesktopCtx);
}