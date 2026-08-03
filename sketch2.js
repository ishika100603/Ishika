(function () {
    const SKETCH_SRC = 'canvas2-sketch/sketch.png';
    const PHASE_ORDER = ['trunk', 'columns', 'arches', 'leaves', 'detail'];
    const PHASE_GAP_MS = 320;
    const TRACE_TIMEOUT_MS = 14000;
    const MAX_ANIMATION_MS = 75000;
    const CANVAS_SEGMENT_MS = 12;

    const TRACE_OPTIONS = {
        ltres: 1,
        qtres: 1,
        pathomit: 10,
        rightangleenhance: false,
        colorsampling: 0,
        numberofcolors: 2,
        mincolorratio: 0,
        colorquantcycles: 1,
        strokewidth: 0,
        linefilter: true,
        scale: 0.55,
        roundcoords: 1,
        viewbox: true,
        desc: false,
        lcpr: 0,
        qcpr: 0,
        blurradius: 0,
        blurdelta: 0,
    };

    const stage = document.getElementById('sketch-stage');
    const statusEl = document.getElementById('sketch-status');
    const speed2Btn = document.getElementById('speed-2x-btn');

    let paths = [];
    let svgEl = null;
    let viewBox = { width: 1, height: 1 };
    let traceStarted = false;
    let animationTimers = [];
    let canvasReplay = null;
    let playbackSpeed = 1;

    function setStatus(text) {
        if (statusEl) statusEl.textContent = text;
    }

    function msAtSpeed(ms) {
        return Math.max(1, Math.round(ms / playbackSpeed));
    }

    function clearAnimationTimers() {
        animationTimers.forEach((id) => clearTimeout(id));
        animationTimers = [];
    }

    function updateSpeedBtn() {
        if (!speed2Btn) return;
        const active = playbackSpeed === 2;
        speed2Btn.classList.toggle('is-active', active);
        speed2Btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        speed2Btn.textContent = active ? '2× Speed on' : '2× Speed';
    }

    function getViewBox(svg) {
        if (svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width) {
            return {
                width: svg.viewBox.baseVal.width,
                height: svg.viewBox.baseVal.height,
            };
        }
        const box = svg.getBBox();
        return { width: box.width || 1, height: box.height || 1 };
    }

    function stripFrameGeometry(svg) {
        svg.querySelectorAll('rect').forEach((node) => node.remove());

        const vb = getViewBox(svg);
        svg.querySelectorAll('path, polygon, polyline').forEach((node) => {
            const box = node.getBBox();
            if (!box.width || !box.height) return;
            if (box.width > vb.width * 0.92 && box.height > vb.height * 0.92) {
                node.remove();
            }
        });
    }

    function classifyPath(path) {
        const box = path.getBBox();
        if (!box.width && !box.height) return 'detail';

        const cx = (box.x + box.width / 2) / viewBox.width;
        const cy = (box.y + box.height / 2) / viewBox.height;
        const nw = box.width / viewBox.width;
        const aspect = box.height / Math.max(box.width, 0.5);

        if (cx > 0.36 && cx < 0.66 && cy > 0.18 && cy < 0.96 && aspect > 1.6 && nw < 0.2) {
            return 'trunk';
        }
        if (cy < 0.34 && !(aspect > 2.2 && nw < 0.14)) return 'leaves';
        if (cy > 0.56 && cy < 0.9 && nw > 0.07 && aspect < 2.1) return 'arches';
        if (cy > 0.54 && aspect > 0.95 && nw < 0.11 && box.height / viewBox.height > 0.08) {
            return 'columns';
        }
        return 'detail';
    }

    function sortWithinLayer(layer, list) {
        return list.slice().sort((a, b) => {
            const boxA = a.getBBox();
            const boxB = b.getBBox();
            const cyA = boxA.y + boxA.height / 2;
            const cyB = boxB.y + boxB.height / 2;
            const cxA = boxA.x + boxA.width / 2;
            const cxB = boxB.x + boxB.width / 2;

            if (layer === 'trunk') return cyB - cyA;
            if (layer === 'columns') return cxA - cxB;
            if (layer === 'arches' || layer === 'leaves') return cyA - cyB || cxA - cxB;
            if (layer === 'detail') {
                return (a.getTotalLength() || 0) - (b.getTotalLength() || 0) || cyA - cyB;
            }
            return cyA - cyB;
        });
    }

    function buildPhaseGroups(pathList) {
        const groups = { trunk: [], columns: [], arches: [], leaves: [], detail: [] };
        pathList.forEach((path) => groups[classifyPath(path)].push(path));

        const sortedColumns = sortWithinLayer('columns', groups.columns);
        const columnHint = Math.max(3, Math.ceil(sortedColumns.length * 0.38));
        groups.detail.push(...sortedColumns.slice(columnHint));
        groups.columns = sortedColumns.slice(0, columnHint);

        PHASE_ORDER.forEach((layer) => {
            if (layer !== 'columns') groups[layer] = sortWithinLayer(layer, groups[layer]);
        });

        return groups;
    }

    function pathDuration(length) {
        return Math.min(1400, Math.max(90, length * 0.75));
    }

    function stylePaths(pathList) {
        pathList.forEach((path) => {
            const length = path.getTotalLength() || 1;
            path.style.fill = 'none';
            path.style.stroke = '#18243a';
            path.style.strokeWidth = '1.15';
            path.style.strokeLinecap = 'round';
            path.style.strokeLinejoin = 'round';
            path.style.vectorEffect = 'non-scaling-stroke';
            path.style.strokeDasharray = `${length}`;
            path.style.strokeDashoffset = `${length}`;
            path.style.transition = 'none';
            path.dataset.length = String(length);
            path.dataset.duration = String(Math.round(pathDuration(length)));
        });
    }

    function resetPaths() {
        paths.forEach((path) => {
            path.style.transition = 'none';
            path.style.strokeDashoffset = path.dataset.length || '0';
        });
    }

    function beginDrawing() {
        if (svgEl) svgEl.classList.add('is-drawing');
    }

    function animatePaths() {
        if (!paths.length) return;

        clearAnimationTimers();
        resetPaths();
        beginDrawing();
        setStatus('Drawing…');
        stage?.setAttribute('aria-busy', 'true');

        const groups = buildPhaseGroups(paths);
        const ordered = PHASE_ORDER.flatMap((phase) => groups[phase]);
        const stagger = msAtSpeed(Math.max(6, Math.min(18, Math.floor(MAX_ANIMATION_MS / Math.max(ordered.length, 1)))));

        let cursor = msAtSpeed(PHASE_GAP_MS);
        let totalEnd = 0;

        ordered.forEach((path) => {
            const duration = msAtSpeed(Number(path.dataset.duration) || 120);
            const delay = cursor;

            animationTimers.push(setTimeout(() => {
                path.style.transition = `stroke-dashoffset ${duration}ms linear`;
                path.style.strokeDashoffset = '0';
            }, delay));

            cursor += stagger;
            totalEnd = Math.max(totalEnd, delay + duration);
        });

        animationTimers.push(setTimeout(() => {
            setStatus('');
            stage?.setAttribute('aria-busy', 'false');
        }, totalEnd + msAtSpeed(100)));
    }

    function mountSvg(svgString) {
        traceStarted = true;
        canvasReplay = null;

        try {
            stage.innerHTML = svgString;
            svgEl = stage.querySelector('svg');
            if (!svgEl) throw new Error('No SVG');

            stripFrameGeometry(svgEl);
            viewBox = getViewBox(svgEl);

            svgEl.setAttribute('class', 'sketch-svg');
            svgEl.setAttribute('role', 'img');
            svgEl.setAttribute('aria-label', 'Animated architectural sketch');
            svgEl.setAttribute('overflow', 'visible');

            paths = [...svgEl.querySelectorAll('path, polyline, polygon, line')];
            if (!paths.length) throw new Error('No paths');

            stylePaths(paths);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => animatePaths());
            });
        } catch (err) {
            console.warn('SVG mount failed, using canvas fallback', err);
            canvasFallback();
        }
    }

    function classifySegment(seg, width, height) {
        const cx = ((seg.x1 + seg.x2) / 2) / width;
        const cy = seg.y / height;
        const nw = Math.abs(seg.x2 - seg.x1) / width;

        if (cx > 0.36 && cx < 0.66 && cy > 0.18 && nw < 0.2) return 'trunk';
        if (cy < 0.34) return 'leaves';
        if (cy > 0.56 && cy < 0.9 && nw > 0.04) return 'arches';
        if (cy > 0.54 && nw < 0.08) return 'columns';
        return 'detail';
    }

    function canvasFallback() {
        traceStarted = true;
        setStatus('Drawing…');
        paths = [];
        svgEl = null;

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxW = 640;
            const scale = Math.min(1, maxW / img.width);
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.className = 'sketch-canvas-fallback';
            stage.innerHTML = '';
            stage.appendChild(canvas);

            const off = document.createElement('canvas');
            off.width = canvas.width;
            off.height = canvas.height;
            const offCtx = off.getContext('2d');
            offCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const { data, width, height } = offCtx.getImageData(0, 0, canvas.width, canvas.height);

            const segments = [];
            for (let y = 0; y < height; y += 1) {
                let runStart = -1;
                for (let x = 0; x <= width; x++) {
                    const draw = x < width && data[(y * width + x) * 4 + 3] > 20 &&
                        (data[(y * width + x) * 4] + data[(y * width + x) * 4 + 1] + data[(y * width + x) * 4 + 2]) / 3 < 210;
                    if (draw && runStart < 0) runStart = x;
                    if ((!draw || x === width) && runStart >= 0) {
                        if (x - runStart > 1) segments.push({ x1: runStart, y, x2: x - 1 });
                        runStart = -1;
                    }
                }
            }

            const groups = { trunk: [], columns: [], arches: [], leaves: [], detail: [] };
            segments.forEach((seg) => groups[classifySegment(seg, width, height)].push(seg));

            const columnHint = Math.max(3, Math.ceil(groups.columns.length * 0.38));
            groups.detail.push(...groups.columns.slice(columnHint));
            groups.columns = groups.columns.slice(0, columnHint);

            const ordered = PHASE_ORDER.flatMap((phase) => groups[phase]);
            let drawn = 0;
            const batch = 8 * playbackSpeed;

            function drawFrame() {
                ctx.clearRect(0, 0, width, height);
                ctx.strokeStyle = '#18243a';
                ctx.lineWidth = 1.1;
                ctx.lineCap = 'round';
                const end = Math.min(ordered.length, drawn + batch);
                ctx.beginPath();
                for (let i = drawn; i < end; i++) {
                    const s = ordered[i];
                    ctx.moveTo(s.x1, s.y);
                    ctx.lineTo(s.x2, s.y);
                }
                ctx.stroke();
                drawn = end;
                if (drawn < ordered.length) {
                    animationTimers.push(setTimeout(drawFrame, msAtSpeed(16)));
                } else {
                    setStatus('');
                    stage?.setAttribute('aria-busy', 'false');
                }
            }

            canvasReplay = () => {
                drawn = 0;
                setStatus('Drawing…');
                stage?.setAttribute('aria-busy', 'true');
                drawFrame();
            };

            drawFrame();
        };
        img.onerror = () => {
            setStatus('Could not load sketch.');
            stage?.setAttribute('aria-busy', 'false');
        };
        img.src = SKETCH_SRC;
    }

    function traceWithImageTracer() {
        if (typeof ImageTracer === 'undefined') {
            canvasFallback();
            return;
        }

        setStatus('Tracing sketch…');
        const timer = setTimeout(() => {
            if (!traceStarted) canvasFallback();
        }, TRACE_TIMEOUT_MS);

        ImageTracer.imageToSVG(
            SKETCH_SRC,
            (svgString) => {
                clearTimeout(timer);
                if (!traceStarted) mountSvg(svgString);
            },
            TRACE_OPTIONS
        );
    }

    function startSketch() {
        setStatus('Loading sketch…');
        stage.innerHTML = '';
        clearAnimationTimers();
        traceStarted = false;
        canvasReplay = null;
        traceWithImageTracer();
    }

    function replaySketch() {
        clearAnimationTimers();
        if (canvasReplay) {
            setStatus('Drawing…');
            stage?.setAttribute('aria-busy', 'true');
            canvasReplay();
            return;
        }
        if (paths.length) {
            animatePaths();
            return;
        }
        startSketch();
    }

    function toggleSpeed2x() {
        playbackSpeed = playbackSpeed === 2 ? 1 : 2;
        updateSpeedBtn();
    }

    speed2Btn?.addEventListener('click', toggleSpeed2x);

    stage?.addEventListener('dblclick', (event) => {
        event.preventDefault();
        replaySketch();
    });

    updateSpeedBtn();
    startSketch();
})();
