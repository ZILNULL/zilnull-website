import * as React from "react";

type Item = {
    url: string;
    filename: string;
    base: string;
    alt?: string;
    description?: string;
    tags?: string[];
    date?: string;
};

export default function GalleryApp({ winId }: { winId: string }) {
    const [items, setItems] = React.useState<Item[]>([]);
    const [selected, setSelected] = React.useState<number | null>(null);
    const [active, setActive] = React.useState<number | null>(null);

    React.useEffect(() => {
        fetch("/api/gallery.json").then(r => r.json())
        .then(d => setItems(d.items || []))
        .catch(() => setItems([]));
    }, []);

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSelected(null);
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const zoom = (idx: number) => setSelected(idx);
    const closeZoom = () => setSelected(null);

    return (
        <div className="gal-app">
            {selected === null && (
                <div className="gal-grid" role="list">
                    {items.map((it, idx) => {
                        const isActive = active === idx;
                        return (
                            <button
                                key={it.url}
                                role="listitem"
                                className={`gal-tile ${isActive ? "is-active" : ""}`}
                                onClick={() => zoom(idx)}
                                title={it.alt || it.base}
                            >
                                <img className="gal-thumb" src={it.url} alt={it.alt || it.base} />
                                <span className="gal-name">{it.filename}</span>
                            </button>
                        );
                    })}
                </div>
            )}
            

            {selected !== null && items[selected] && (
                <div
                    className="gal-zoom"
                    aria-modal="true"
                    role="dialog"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeZoom();
                    }}
                    >
                    <div className="gal-zoom__inner">
                        <div className="gal-zoom__imgwrap">
                            <img className="gal-zoom__img" src={items[selected].url} alt={items[selected].alt || items[selected].base} />
                        </div>
                        <div className="gal-zoom__caption">
                            <div className="gal-zoom__title">{items[selected].alt || items[selected].base}</div>
                            {items[selected].description && (
                                <div className="gal-zoom__desc">{items[selected].description}</div>
                            )}
                            <div className="gal-zoom__meta">
                                <span>{items[selected].filename}</span>

                                {items[selected].date && (
                                    <span> · {new Date(items[selected].date).toLocaleDateString()}</span>
                                )}

                                {items[selected].tags?.length ? (
                                    <span> · {items[selected].tags.join(", ")}</span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
