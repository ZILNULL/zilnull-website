import * as React from "react";
import type { AppMeta } from "../../types.ts";
import LogsApp from "./LogsApp";

const meta: AppMeta = {
  id: "logs",
  title: "Logs",
  size: { w: 980, h: 600 },
  maximized: true,
  Component: LogsApp,
  iconUrl: "/images/logs_icon.png",
}

export default meta;