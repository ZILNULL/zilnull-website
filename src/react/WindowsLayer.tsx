import * as React from 'react';
import { useDesktop } from './DesktopProvider';
import Window from './Window';

export default function WindowsLayer() {
  const { state } = useDesktop();
  const ordered = [...state.order].sort((a, b) => state.windows[a].z - state.windows[b].z);

  return (
    <>
        {ordered.map((id) => {
            const w = state.windows[id];
            return <Window key={id} w={w} />;
        })}
    </>
  );
}