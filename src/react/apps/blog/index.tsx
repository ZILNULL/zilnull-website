import * as React from "react";
import type { AppMeta } from "../../types.ts";
import BlogApp from "./BlogApp.tsx";

const meta: AppMeta = {
    id: "blog",
    title: "Blog",
    size: { w: 640, h: 420 },
    Component: BlogApp,
};

export default meta;