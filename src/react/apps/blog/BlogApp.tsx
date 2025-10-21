import * as React from "react";

type Route = "home" | "blogs" | "post" | "about";
type Post = {
    slug: string;
    title: string;
    date: string;
    embedUrl: string;
    url?: string;
    tags?: string[];
    thumbnail?: string;
    description?: string;
};

export default function BlogApp({winId, initial}: {winId: string, initial?:any }) {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
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

    React.useEffect(() => {
        if (initial?.postSlug) {
            setEmbedUrl(`/embed/blog/${encodeURIComponent(initial.postSlug)}/`);
            setRoute("post");
        } else if (initial?.route === "blogs") {
            setRoute("blogs");
        } else if (initial?.route === "home") {
            setRoute("home");
        }
    }, [initial]);

    // Set up blogs:
    const recent = posts[0];
    const featured: Post[] = posts.slice(1, 3);
    const allTags = Array.from(
        new Set(posts.flatMap((p) => p.tags ?? []))
    ).sort();
    const filteredPosts =
        selectedTag ? posts.filter((p) => (p.tags ?? []).includes(selectedTag)) : posts;
    
    const go = (r: Route) => {
        setSidebarOpen(false);
        setRoute(r);
        if (r !== "post") setEmbedUrl(null);
    };

    const openPost = (p: Post) => {
        setEmbedUrl(p.embedUrl);
        setRoute("post");
    };

    return (
        <div className={`blog-app`}>
            <div className={`blog-togglebar ${sidebarOpen ? "is--open" : "is--closed"}`}>
                <button
                    className={`blog-toggle`}
                    aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                    aria-pressed={sidebarOpen}
                    onClick={() => setSidebarOpen((v) => !v)}
                >
                    {sidebarOpen ? " < " : " > "}
                </button>
            </div>

            <div className={`blog-app__content`}>
                <div className={`blog-sidebar ${sidebarOpen ? "is--open" : "is--closed"}`} aria-label="Blog navigation">
                    <div className="blog-brand">
                        <div className="blog-brand__title" data-text="ZIL∅">ZIL∅</div>
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
                            <h2 className="blog-title">echo "Welcome! :)"</h2>

                            <div className="blog-hero">
                                <div className="blog-hero__card">
                                    { recent ? (
                                        <>
                                            <div className="blog-card__preview" onClick={() => openPost(recent)}>
                                                <img src={recent.thumbnail} className="blog-card__preview-img" />
                                            </div>
                                            <div className="blog-card__title">{recent.title}</div>
                                            <div className="blog-card__meta">
                                                {new Date(recent.date).toLocaleDateString() + " - " + recent.description}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="blog-card__empty">No posts yet</div>
                                    )}
                                </div>
                            </div>

                            <div className="blog-featured__title">Featured Blogs:</div>
                            <hr />

                            <div className="blog-featured">
                                {featured.map((p) => (
                                    <div key={p.slug} className="blog-featured__card">
                                        <div className="blog-card__preview" onClick={() => openPost(p)}>
                                            <img src={p.thumbnail} className="blog-card__preview-img" />
                                        </div>
                                        <div className="blog-card__title">{p.title}</div>
                                        <div className="blog-card__meta">
                                            {new Date(p.date).toLocaleDateString() + " - " + p.description}
                                        </div>
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

                            <hr />

                            <ul className="blog-list__grid">
                                {filteredPosts.map((p) => (
                                    <div key={p.slug} className="blog-list__item">
                                        <article className="blog-featured__card">
                                            <div className="blog-card__preview" onClick={() => openPost(p)}>
                                                <img src={p.thumbnail} className="blog-card__preview-img" />
                                            </div>
                                            <div className="blog-card__title">{p.title}</div>
                                            <div className="blog-card__meta">
                                                {new Date(p.date).toLocaleDateString() + " - " + p.description}
                                            </div>
                                        </article>
                                    </div>
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
                            <div className="blog-about__contact-me">
                                <span className="contact-me-text">Find me:</span>
                                <img src="/images/bsky_logo.png" onClick={() => window.open("https://bsky.app/profile/zilnull.bsky.social")} />
                                <img src="/images/x_logo.jpg" onClick={() => window.open("https://x.com/zilnull")} />
                                <img src="/images/github_logo.png" onClick={() => window.open("https://github.com/ZILNULL")} />
                            </div>
                            <h2 className="blog-title">About Me</h2>
                            <p>Hi, I'm <span className="text-bold">Zil∅</span>, also known as <span className="text-bold">ZILNULL</span>! You can call me Zil, though. I think we'll both agree that's shorter, easier, and doesn't require you to copy and paste a special character every time you want to use my name.</p>
                            <h3>I'm a [thing] on the Internet!</h3>
                            <div className="blog-about__image"><img src="/images/zilnull_what_transparent.png" /></div>
                            <p>I have a passion for web development, game design, and programming in general. I've been doing it since I was in middle school, and since then I've gained a lot of experience in a variety of fields: Python, web dev, database management, Artificial Intelligence, etc.</p>
                            <p>Of course, outside of coding, I also really have many more interests:</p>
                            <ul>
                                <li>Pokémon</li>
                                <li>Visual Novels</li>
                                <li>Philosphy</li>
                                <li>Animation and painting</li>
                            </ul>
                            <p>I hope we can get along! I like to think I'm a pretty approachable person, as long as my boundaries are respected. Feel free to reach out. :)</p>
                            <h3>FAQ</h3>
                            <ul>
                                <li><span className="text-bold">What's your gender?</span> I'm a [thing]!</li>
                                <li><span className="text-bold">What's your age?</span> I'm [number over 18] years old!</li>
                                <li><span className="text-bold">What's your real name?</span> It's on the first paragraph... What, do you want my ID?</li>
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        </div>
    )
}