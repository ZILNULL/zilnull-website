(() => {
    let zStack = 1000;

    const bumpZ = (win) => {
        zStack += 1;
        win.style.zIndex = String(zStack);
        win.focus?.();
    };

    const getBounds = (win) => {
        const parent = win.parentElement;
        return parent?.getBoundingClientRect();
    };

    const startUserDrag = () => document.body.classList.add('is-user-dragging');
    const endUserDrag   = () => document.body.classList.remove('is-user-dragging');

    document.addEventListener('pointerdown', (e) => {
        const win = e.target.closest('.win');
        if (!win) return;
        bumpZ(win);
    });

    document.addEventListener('pointerdown', (e) => {
        const bar = e.target.closest('.win__titlebar');
        if (!bar) return;
        const win = bar.closest('.win');
        if (!win || win.dataset.movable !== '1') return;
        if (e.target.closest('button,[data-win-btn]')) return;
        if (win.classList.contains('win--maximized')) return;

        bumpZ(win);

        const style = getComputedStyle(win);
        const startLeft = parseFloat(style.left) || 0;
        const startTop  = parseFloat(style.top)  || 0;
        const startX = e.clientX, startY = e.clientY;
        const bounds = getBounds(win);
        const rect   = win.getBoundingClientRect();

        const onMove = (ev) => {
            let left = startLeft + (ev.clientX - startX);
            let top  = startTop  + (ev.clientY - startY);

            if (bounds) {
                const maxLeft = bounds.width  - rect.width;
                const maxTop  = bounds.height - rect.height;
                left = Math.max(0, Math.min(left, maxLeft));
                top  = Math.max(0, Math.min(top,  maxTop));
            }

            win.style.left = left + 'px';
            win.style.top  = top  + 'px';
        };

        const onUp = () => {
            endUserDrag();
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
        };

        startUserDrag();
        win.setPointerCapture?.(e.pointerId);
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
    });

    document.addEventListener('pointerdown', (e) => {
        const h = e.target.closest('.win__handle');
        if (!h) return;
        const win = h.closest('.win');
        if (!win || win.dataset.resizable !== '1') return;
        if (win.classList.contains('win--maximized')) return;

        bumpZ(win);

        const dir = h.getAttribute('data-dir') || '';
        const style = getComputedStyle(win);
        const start = {
            x: e.clientX, y: e.clientY,
            left: parseFloat(style.left) || 0,
            top:  parseFloat(style.top)  || 0,
            width:  parseFloat(style.width)  || 0,
            height: parseFloat(style.height) || 0,
        };
        const bounds = getBounds(win);

        const minW = 260; // tweak or make data- props later
        const minH = 160;

        const onMove = (ev) => {
            const dx = ev.clientX - start.x;
            const dy = ev.clientY - start.y;

            let left = start.left;
            let top  = start.top;
            let w = start.width;
            let h = start.height;

            // Horizontal
            if (dir.includes('e')) w = Math.max(minW, start.width + dx);
            if (dir.includes('w')) {
                w = Math.max(minW, start.width - dx);
                left = start.left + (start.width - w);
            }
            // Vertical
            if (dir.includes('s')) h = Math.max(minH, start.height + dy);
            if (dir.includes('n')) {
                h = Math.max(minH, start.height - dy);
                top = start.top + (start.height - h);
            }

            // Constrain to parent bounds if available
            if (bounds) {
                const maxLeft = bounds.width  - w;
                const maxTop  = bounds.height - h;
                left = Math.max(0, Math.min(left, maxLeft));
                top  = Math.max(0, Math.min(top,  maxTop));
            }

            win.style.left = left + 'px';
            win.style.top  = top  + 'px';
            win.style.width  = w + 'px';
            win.style.height = h + 'px';
        };

        const onUp = () => {
            endUserDrag();
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
        };

        startUserDrag();
        win.setPointerCapture?.(e.pointerId);
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
    });

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-win-btn]');
        if (!btn) return;

        const win = btn.closest('.win');
        if (!win) return;

        const action = btn.getAttribute('data-win-btn');

        if (action === 'close') {
            win.remove();
            return;
        }

        if (action === 'maximize') {
            if (win.classList.contains('win--minimized')) {
                win.classList.toggle('win--minimized');
            }
            win.classList.toggle('win--maximized');
            return;
        }

        if (action === 'minimize') {
            if (win.classList.contains('win--maximized')) {
                win.classList.toggle('win--maximized');
            }
            win.classList.toggle('win--minimized');
            return;
        }
    });
})();