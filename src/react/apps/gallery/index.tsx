import * as React from "react";
import type { AppMeta } from "../../types.ts";
import GalleryApp from "./GalleryApp";

const meta: AppMeta = {
    id: "gallery",
    title: "Gallery",
    size: { w: 820, h: 540 },
    Component: GalleryApp,
    iconUrl: "/images/gallery_icon.png",
    maximized: false,
}

export default meta;