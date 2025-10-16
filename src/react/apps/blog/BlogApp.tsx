import * as React from "react";

type Route = "home" | "blogs" | "post" | "about";
type Post = {
    slug: string;
    title: string;
    date: string;
    embedUrl: string;
    url?: string;
    tags?: string[];
};

export default function BlogApp({winId}: {winId: string}) {
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [route, setRoute] = React.useState<Route>("home");
    const [posts, setPosts] = React.useState<Post[]>([]);
    const [embedUrl, setEmbedUrl] = React.useState<string | null>(null);
    const [selectedTag, setSelectedTag] = React.useState<string | null>(null);

    // Load posts:
    React.useEffect(() => {
        fetch("/api/blogs.json")
        .then((r) => r.json())
        .then((d) => setPosts(d.items || []))
        .catch(() => setPosts([]));
    }, []);

    // Set up blogs:
    const recent = posts[0];
    const featured: Post[] = posts.slice(1, 3);
    const allTags = Array.from(
        new Set(posts.flatMap((p) => p.tags ?? []))
    ).sort();
    const filteredPosts =
        selectedTag ? posts.filter((p) => (p.tags ?? []).includes(selectedTag)) : posts;
    
    const go = (r: Route) => {
        setRoute(r);
        if (r !== "post") setEmbedUrl(null);
    };

    const openPost = (p: Post) => {
        setEmbedUrl(p.embedUrl);
        setRoute("post");
    };

    return (
        <div className={`blog-app ${sidebarOpen ? "blog-app--open" : "blog-app--closed"}`}>
            <div className="blog-togglebar">
                <button
                    className="blog-toggle"
                    aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                    aria-pressed={sidebarOpen}
                    onClick={() => setSidebarOpen((v) => !v)}
                >
                    {sidebarOpen ? "<" : ">"}
                </button>
            </div>

            <div className="blog-sidebar" aria-label="Blog navigation">
                <div className="blog-brand">
                    <div className="blog-brand__title">ZILNULL</div>
                </div>

                <div className="blog-nav">
                    <button
                        className={`blog-nav__item ${route === "blogs" ? "is-active" : ""}`}
                        onClick={() => go("blogs")}
                    >
                        <span className="blog-tab">Blogs</span>
                    </button>

                    <button
                        className={`blog-nav__item ${route === "home" ? "is-active" : ""}`}
                        onClick={() => go("home")}
                    >
                        <span className="blog-tab">Home</span>
                    </button>

                    <button
                        className={`blog-nav__item ${route === "about" ? "is-active" : ""}`}
                        onClick={() => go("about")}
                    >
                        <span className="blog-tab">About Me</span>
                    </button>
                </div>
            </div>

            <div className="blog-main" aria-live="polite">

                {/* HOME PAGE */}
                {route === "home" && (
                    <div className="blog-home">
                        <h2 className="blog-title">Main Page</h2>

                        <div className="blog-hero">
                            <div className="blog-hero__card">
                                { recent ? (
                                    <>
                                        <div className="blog-card__title">{recent.title}</div>
                                        <div className="blog-card__meta">
                                            {new Date(recent.date).toLocaleDateString()}
                                        </div>
                                        <button className="blog-btn" onClick={() => openPost(recent)}>
                                            Read most recent
                                        </button>
                                    </>
                                ) : (
                                    <div className="blog-card__empty">No posts yet</div>
                                )}
                            </div>
                        </div>

                         <div className="blog-featured">
                            {featured.map((p) => (
                                <div key={p.slug} className="blog-featured__card">
                                    <div className="blog-card__title">{p.title}</div>
                                    <div className="blog-card__meta">
                                        {new Date(p.date).toLocaleDateString()}
                                    </div>
                                    <button className="blog-btn" onClick={() => openPost(p)}>
                                        Read
                                    </button>
                                </div>
                            ))}
                            {featured.length === 0 && (
                                <div className="blog-featured__empty">No featured posts yet.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* BLOGS SELECTION PAGE */}
                {route === "blogs" && (
                    <div className="blog-list">
                        <header className="blog-list__head">
                            <h2 className="blog-title">All Blogs</h2>

                            {/* Tag filter (shows only if you add tags in content + API) */}
                            {allTags.length > 0 && (
                                <div className="blog-tags">
                                    <button
                                        className={`blog-tag ${selectedTag === null ? "is-active" : ""}`}
                                        onClick={() => setSelectedTag(null)}
                                    >
                                        All
                                    </button>
                                    {allTags.map((t) => (
                                        <button
                                            key={t}
                                            className={`blog-tag ${selectedTag === t ? "is-active" : ""}`}
                                            onClick={() => setSelectedTag(t)}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </header>

                        <ul className="blog-list__grid">
                            {filteredPosts.map((p) => (
                                <li key={p.slug} className="blog-list__item">
                                    <article className="blog-card">
                                        <header className="blog-card__hd">
                                            <h3 className="blog-card__title">{p.title}</h3>
                                            <time className="blog-card__date">
                                                {new Date(p.date).toLocaleDateString()}
                                            </time>
                                        </header>
                                        <footer className="blog-card__ft">
                                            <button className="blog-btn" onClick={() => openPost(p)}>
                                                Open
                                            </button>
                                        </footer>
                                    </article>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* POST PAGE */}
                {route === "post" && embedUrl && (
                    <section className="blog-viewer">
                        <div className="blog-viewer__bar">
                            <button className="blog-btn" onClick={() => go("blogs")}>
                                ← Back to list
                            </button>
                        </div>
                        <div className="blog-viewer__frame">
                            <iframe
                                src={embedUrl}
                                className="blog-iframe"
                                title="Blog post"
                            />
                        </div>
                    </section>
                )}

                {/* ABOUT ME */}
                {route === "about" && (
                    <section className="blog-about">
                        <h2 className="blog-title">About Me</h2>
                        <p>Write a short intro here (or link to a separate page).</p>
                    </section>
                )}
            </div>
        </div>
    )
}