import * as React from "react";

type Project = {
    id: string;
    title: string;
    type: string;
    description?: string;
    cover?: string;
    embedUrl: string;
    url?: string;
};

type Part = {
    slug: string;
    title: string;
    order: number;
    date?: string;
    tags?: string[];
    embedUrl: string;
    url?: string;
};

export default function LogsApp({ winId, initial }: { winId: string, initial?: any }) {
    const [sidebarOpen, setSidebarOpen] = React.useState(true);

    const [projects, setProjects] = React.useState<Project[]>([]);
    const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
    const [partsByProject, setPartsByProject] = React.useState<Record<string, Part[]>>({});

    const [activeProject, setActiveProject] = React.useState<Project | null>(null);
    const [activePartSlug, setActivePartSlug] = React.useState<string | null>(null);
    const [embedUrl, setEmbedUrl] = React.useState<string | null>(null);

    const [initialApplied, setInitialApplied] = React.useState(false);

    React.useEffect(() => {
    fetch("/api/logs/index.json")
        .then(r => r.json())
        .then(d => setProjects(d.items || []))
        .catch(() => setProjects([]));
    }, []);

    const getProjectKey = (p: Project) => p.id;
    const ensurePartsLoaded = React.useCallback(async (project: Project) => {
        const key = getProjectKey(project);
        if (partsByProject[key]) return partsByProject[key];

        const res = await fetch(`/api/logs/${encodeURIComponent(key)}.json`);
        const data = await res.json();
        const parts: Part[] = data.parts || [];
        setPartsByProject(prev => ({ ...prev, [key]: parts }));
        return parts;
    }, [partsByProject]);

    const toggleProject = async (project: Project) => {
        const id = project.id;
        const next = new Set(expanded);
        const isExpanding = !next.has(id);

        if (isExpanding) {
            next.add(id);
            setExpanded(next);
            await ensurePartsLoaded(project);
            setActiveProject(project);
            setActivePartSlug(null);
            setEmbedUrl(project.embedUrl);
        } else {
            next.delete(id);
            setExpanded(next);
        }
    };

    const openPart = (project: Project, part: Part) => {
        setActiveProject(project);
        setActivePartSlug(part.slug);
        setEmbedUrl(part.embedUrl);
    };

    React.useEffect(() => {
        if (!initial || initialApplied || projects.length === 0) return;
        if (initial.route === "home") {
            setInitialApplied(true);
            return;
        }

        const wanted = initial.projectId.toLowerCase();
        const proj = projects.find(
            p => p.id.toLowerCase() === wanted || (p.id && p.id.toLowerCase() === wanted)
        );
        if (!proj) { setInitialApplied(true); return; }

        (async () => {
            const id = proj.id;
            const next = new Set(expanded); next.add(id);
            setExpanded(next);
            const parts = await ensurePartsLoaded(proj);

            if (initial.route === "viewer" && initial.partSlug) {
                const part = parts.find(pt => pt.slug.toLowerCase() === initial.partSlug.toLowerCase());
                if (part) {
                    openPart(proj, part);
                } else {
                    setActiveProject(proj);
                    setActivePartSlug(null);
                    setEmbedUrl(proj.embedUrl);
                }
            } else {
                setActiveProject(proj);
                setActivePartSlug(null);
                setEmbedUrl(proj.embedUrl);
            }
            setInitialApplied(true);
        })();
    }, [initial, initialApplied, projects, expanded, ensurePartsLoaded]);

    return (
        <div className="logs-app">
            <div className={`logs-togglebar ${sidebarOpen ? "is--open" : ""}`}>
                <button
                    className="logs-toggle"
                    onClick={() => setSidebarOpen(o => !o)}
                    aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                    title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                >
                    ☰
                </button>
            </div>

            <div className="logs-app__content">
                <aside className={`logs-sidebar ${sidebarOpen ? "" : "is--closed"}`} aria-label="Logs navigation">
                    <div className="logs-left__hd">Logs</div>
                    <ul className="logs-tree__list" role="tree">
                    {projects.map((p) => {
                        const key = getProjectKey(p);
                        const isExpanded = expanded.has(p.id);
                        const isActiveProject = activeProject?.id === p.id;
                        const parts = partsByProject[key] || [];
                        return (
                        <li key={p.id} role="treeitem" aria-expanded={isExpanded} className="logs-tree__node">
                            <button
                                className={`logs-tree__project ${isActiveProject ? "is-active" : ""}`}
                                onClick={() => toggleProject(p)}
                                title={p.title}
                            >
                                <span className={`caret ${isExpanded ? "open" : ""}`} aria-hidden="true">▶</span>
                                <span className="logs-proj__title">{p.title}</span>
                            </button>

                            {isExpanded && (
                            <ul className="logs-tree__parts" role="group">
                                {parts.length === 0 && (
                                <li className="logs-part logs-part--empty" role="none">
                                    <span>Loading…</span>
                                </li>
                                )}
                                {parts.map((part) => {
                                const isActivePart = activePartSlug?.toLowerCase() === part.slug.toLowerCase();
                                return (
                                    <li key={part.slug} role="treeitem" className="logs-tree__leaf">
                                    <button
                                        className={`logs-part ${isActivePart ? "is-active" : ""}`}
                                        onClick={() => openPart(p, part)}
                                        onDoubleClick={() => openPart(p, part)}
                                        title={part.title}
                                    >
                                        <span className="logs-part__ord">{String(part.order ?? 0).padStart(2, "0")}.</span>
                                        <span className="logs-part__title">{part.title}</span>
                                    </button>
                                    </li>
                                );
                                })}
                            </ul>
                            )}
                        </li>
                        );
                    })}
                    </ul>
                </aside>

                <section className="logs-main" aria-label="Viewer">
                    <div className="logs-viewer">
                    {embedUrl ? (
                        <iframe className="logs-iframe" src={embedUrl} title="Log viewer" />
                    ) : (
                        <div className="logs-empty">Select a project or part.</div>
                    )}
                    </div>
                </section>
            </div>
        </div>
        );

}
