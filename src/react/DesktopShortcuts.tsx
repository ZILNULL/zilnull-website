import * as React from "react";
import { useDesktop } from "./DesktopProvider";
import { APPS } from "./apps/registry";

function byZDesc(a: { z: number }, b: { z: number }) { return b.z - a.z; }

function windowsForApp(state: any, appId: string) {
  const all = state.order.map((id: string) => state.windows[id]).filter((w: any) => w.appId === appId);
  const visibles  = all.filter((w: any) => !w.minimized).sort(byZDesc);
  const minimized = all.filter((w: any) =>  w.minimized).sort(byZDesc);
  return { all, visibles, minimized };
}

export default function DesktopShortcuts({ shortcuts }: { shortcuts: string[] }) {
  const { state, dispatch } = useDesktop();
  const [selected, setSelected] = React.useState<string | null>(null);

  const handleDoubleClick = (appId: string) => {
    const meta = APPS[appId];
    if (!meta) return;
    
    dispatch({
      type: "OPEN",
      appId,
      init: { title: meta.title, w: meta.size?.w, h: meta.size?.h },
    });
  };

  return (
    <div className="desktop" aria-label="Desktop">
      <ul className="desktop__grid" role="list">
        {shortcuts.map((appId) => {
          const meta = APPS[appId];
          if (!meta) return null;
          const isSelected = selected === appId;

          return (
            <li key={appId} role="listitem">
              <button
                type="button"
                className={`desktop__icon ${isSelected ? "is-selected" : ""}`}
                title={meta.title}
                aria-label={meta.title}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(appId);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleDoubleClick(appId);
                }}
                onBlur={() => setSelected((s) => (s === appId ? null : s))}
              >
                {meta.iconUrl
                  ? <img className="desktop__img" src={meta.iconUrl} alt="" />
                  : <span className="desktop__dot" aria-hidden="true" />
                }
                <span className="desktop__label">{meta.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
