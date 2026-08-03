(function () {
    const texturePaths = window.CANVAS3_CUBE_TEXTURES || [];
    const cubeSize = 1.15;
    const spacing = 2.5;
    const cols = 5;
    const stackOverlap = cubeSize - 0.02;
    const halfSize = cubeSize / 2;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 18, 55);

    const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, 6, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    renderer.outputEncoding = THREE.sRGBEncoding;

    if (!document.querySelector('.canvas-base')) {
        const base = document.createElement('div');
        base.className = 'canvas-base';
        base.setAttribute('aria-hidden', 'true');
        document.body.prepend(base);
        document.body.classList.add('has-canvas-base');
    }

    document.body.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 5;
    controls.maxDistance = 32;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(0, cubeSize * 0.5, 0);
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
    };

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff2dd, 1.15);
    keyLight.position.set(6, 12, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x9ec8ff, 0.6);
    fillLight.position.set(-8, 5, -6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(0, 3, -10);
    scene.add(rimLight);

    const textureCache = {};
    const loader = new THREE.TextureLoader();
    const cubes = [];
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const planeHit = new THREE.Vector3();
    const dragOffset = new THREE.Vector3();

    let mirrorReflector = null;
    let selectedCube = null;
    let isDragging = false;
    let dragMode = null;
    let dragStart = { x: 0, y: 0 };
    let cubeDragStart = { rotX: 0, rotY: 0, liftY: 0, posX: 0, posZ: 0 };
    let lastClickTime = 0;
    let cubeIdCounter = 0;
    let dragPlaneY = cubeSize / 2;

    function aabbAt(x, y, z) {
        return {
            minX: x - halfSize,
            maxX: x + halfSize,
            minY: y - halfSize,
            maxY: y + halfSize,
            minZ: z - halfSize,
            maxZ: z + halfSize,
        };
    }

    function aabbForCube(cube) {
        return aabbAt(cube.position.x, cube.position.y, cube.position.z);
    }

    function aabbOverlap(a, b) {
        return (
            a.minX < b.maxX &&
            a.maxX > b.minX &&
            a.minY < b.maxY &&
            a.maxY > b.minY &&
            a.minZ < b.maxZ &&
            a.maxZ > b.minZ
        );
    }

    function collidesAt(cube, x, y, z) {
        const box = aabbAt(x, y, z);
        for (const other of cubes) {
            if (other === cube) continue;
            if (aabbOverlap(box, aabbForCube(other))) return true;
        }
        return false;
    }

    function overlapsXZAt(cube, x, z, other) {
        return (
            Math.abs(x - other.position.x) < stackOverlap &&
            Math.abs(z - other.position.z) < stackOverlap
        );
    }

    function getSupportY(cube, x, z, maxY = Infinity) {
        let y = halfSize;
        for (const other of cubes) {
            if (other === cube) continue;
            if (!overlapsXZAt(cube, x, z, other)) continue;
            const otherTop = other.position.y + halfSize;
            if (otherTop <= maxY + 0.001) {
                y = Math.max(y, otherTop + halfSize);
            }
        }
        return y;
    }

    function separationOnXZ(cube, other) {
        const dy = Math.abs(cube.position.y - other.position.y);
        if (dy >= cubeSize - 0.02) return null;

        const dx = cube.position.x - other.position.x;
        const dz = cube.position.z - other.position.z;
        const overlapX = cubeSize - Math.abs(dx);
        const overlapZ = cubeSize - Math.abs(dz);

        if (overlapX <= 0 || overlapZ <= 0) return null;

        if (overlapX < overlapZ) {
            return { x: (dx >= 0 ? 1 : -1) * overlapX * 0.5, z: 0 };
        }
        return { x: 0, z: (dz >= 0 ? 1 : -1) * overlapZ * 0.5 };
    }

    function resolveHorizontalPenetration(cube) {
        for (let pass = 0; pass < 10; pass++) {
            let moved = false;
            for (const other of cubes) {
                if (other === cube) continue;
                const sep = separationOnXZ(cube, other);
                if (!sep) continue;
                const nextX = cube.position.x + sep.x;
                const nextZ = cube.position.z + sep.z;
                if (!collidesAt(cube, nextX, cube.position.y, nextZ)) {
                    cube.position.x = nextX;
                    cube.position.z = nextZ;
                    moved = true;
                }
            }
            if (!moved) break;
        }
    }

    function tryMoveHorizontal(cube, targetX, targetZ, fixedY) {
        const startX = cube.position.x;
        const startZ = cube.position.z;

        if (!collidesAt(cube, targetX, fixedY, targetZ)) {
            cube.position.set(targetX, fixedY, targetZ);
            return;
        }

        if (!collidesAt(cube, targetX, fixedY, startZ)) {
            cube.position.x = targetX;
            cube.position.y = fixedY;
            return;
        }

        if (!collidesAt(cube, startX, fixedY, targetZ)) {
            cube.position.z = targetZ;
            cube.position.y = fixedY;
            return;
        }

        cube.position.y = fixedY;
    }

    function snapStackY(cube) {
        const y = getSupportY(cube, cube.position.x, cube.position.z);
        cube.position.y = y;
        cube.userData.isLifted = false;
        resolveHorizontalPenetration(cube);
    }

    function settleCubeY(cube) {
        const stackY = getSupportY(cube, cube.position.x, cube.position.z, cube.position.y);
        if (cube.position.y <= stackY + cubeSize * 0.2) {
            cube.position.y = stackY;
            cube.userData.isLifted = false;
            resolveHorizontalPenetration(cube);
        } else {
            cube.userData.isLifted = true;
        }
    }

    function finalizeCubePlacement(cube) {
        if (cube.userData.isLifted) {
            settleCubeY(cube);
            if (cube.userData.isLifted) {
                resolveHorizontalPenetration(cube);
            } else {
                resolveHorizontalPenetration(cube);
                cube.position.y = getSupportY(cube, cube.position.x, cube.position.z);
            }
            return;
        }
        snapStackY(cube);
        resolveHorizontalPenetration(cube);
        cube.position.y = getSupportY(cube, cube.position.x, cube.position.z);
    }

    function loadTexture(path) {
        if (textureCache[path]) return textureCache[path];
        const texture = loader.load(path);
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        textureCache[path] = texture;
        return texture;
    }

    function makeCubeMaterial(texturePath) {
        return new THREE.MeshStandardMaterial({
            map: loadTexture(texturePath),
            color: 0xffffff,
            roughness: 0.42,
            metalness: 0.06,
            emissive: 0x000000,
            emissiveIntensity: 0,
        });
    }

    function tryMoveVertical(cube, targetY, fixedX, fixedZ) {
        const minY = halfSize;
        targetY = Math.max(minY, targetY);
        if (!collidesAt(cube, fixedX, targetY, fixedZ)) {
            cube.position.set(fixedX, targetY, fixedZ);
            return;
        }
        let y = targetY;
        while (y >= minY && collidesAt(cube, fixedX, y, fixedZ)) {
            y -= 0.04;
        }
        if (y >= minY && !collidesAt(cube, fixedX, y, fixedZ)) {
            cube.position.set(fixedX, y, fixedZ);
        }
    }

    function createMirror() {
        const size = 70;

        if (typeof THREE.Reflector !== 'undefined') {
            mirrorReflector = new THREE.Reflector(new THREE.PlaneGeometry(size, size), {
                clipBias: 0.003,
                textureWidth: Math.floor(window.innerWidth * renderer.getPixelRatio()),
                textureHeight: Math.floor(window.innerHeight * renderer.getPixelRatio()),
                color: 0x505050,
            });
            mirrorReflector.rotation.x = -Math.PI / 2;
            mirrorReflector.position.y = 0.002;
            scene.add(mirrorReflector);
        } else {
            mirrorReflector = new THREE.Mesh(
                new THREE.PlaneGeometry(size, size),
                new THREE.MeshStandardMaterial({
                    color: 0x1a1a1a,
                    metalness: 0.95,
                    roughness: 0.08,
                })
            );
            mirrorReflector.rotation.x = -Math.PI / 2;
            mirrorReflector.position.y = 0.002;
            scene.add(mirrorReflector);
        }

        const fadeCanvas = document.createElement('canvas');
        fadeCanvas.width = 512;
        fadeCanvas.height = 512;
        const ctx = fadeCanvas.getContext('2d');
        const gradient = ctx.createRadialGradient(256, 256, 40, 256, 256, 360);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.55, 'rgba(0, 0, 0, 0.12)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.62)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        const fadeTexture = new THREE.CanvasTexture(fadeCanvas);
        const fadeMat = new THREE.MeshBasicMaterial({
            map: fadeTexture,
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
        });
        const fadePlane = new THREE.Mesh(new THREE.PlaneGeometry(size, size), fadeMat);
        fadePlane.rotation.x = -Math.PI / 2;
        fadePlane.position.y = 0.004;
        fadePlane.renderOrder = 1;
        scene.add(fadePlane);
    }

    function createTexturedCube(texturePath, textureIndex, options = {}) {
        const row = Math.floor(textureIndex / cols);
        const itemsInRow = row === 2 ? 4 : cols;
        const indexInRow = row === 2 ? textureIndex - 10 : textureIndex % cols;
        const defaultX = (indexInRow - (itemsInRow - 1) / 2) * spacing;
        const defaultZ = (row - 1) * spacing;

        const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const material = makeCubeMaterial(texturePath);
        const cube = new THREE.Mesh(geometry, material);

        cube.position.set(
            options.x ?? defaultX,
            options.y ?? cubeSize / 2,
            options.z ?? defaultZ
        );

        if (options.rotation) {
            cube.rotation.copy(options.rotation);
        }

        cube.userData.textureIndex = textureIndex;
        cube.userData.texturePath = texturePath;
        cube.userData.id = cubeIdCounter++;
        cube.userData.isLifted = false;
        scene.add(cube);
        cubes.push(cube);
        snapStackY(cube);
        return cube;
    }

    texturePaths.forEach((path, index) => createTexturedCube(path, index));
    createMirror();

    function setSelectedCube(cube) {
        if (selectedCube && selectedCube.material.emissive) {
            selectedCube.material.emissive.setHex(0x000000);
            selectedCube.material.emissiveIntensity = 0;
        }
        selectedCube = cube;
        if (selectedCube && selectedCube.material.emissive) {
            selectedCube.material.emissive.setHex(0x445566);
            selectedCube.material.emissiveIntensity = 0.14;
        }
        updateDuplicateBtn();
    }

    function updateDuplicateBtn() {
        const btn = document.getElementById('duplicate-btn');
        if (btn) btn.disabled = !selectedCube;
    }

    function duplicateCube(source) {
        const clone = createTexturedCube(source.userData.texturePath, source.userData.textureIndex, {
            x: source.position.x + cubeSize * 1.05,
            y: source.position.y,
            z: source.position.z + cubeSize * 0.35,
            rotation: source.rotation.clone(),
        });
        finalizeCubePlacement(clone);
        setSelectedCube(clone);
        return clone;
    }

    function getIntersectedCube(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(cubes, false);
        return hits.length ? hits[0].object : null;
    }

    function pickOnPlane(event, yLevel, target) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        dragPlane.normal.set(0, 1, 0);
        dragPlane.constant = -yLevel;
        return raycaster.ray.intersectPlane(dragPlane, target);
    }

    renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());

    function beginCubeDrag(hit, event, mode) {
        setSelectedCube(hit);
        isDragging = true;
        dragMode = mode;
        controls.enabled = false;
        dragStart = { x: event.clientX, y: event.clientY };
        cubeDragStart = {
            rotX: hit.rotation.x,
            rotY: hit.rotation.y,
            liftY: hit.position.y,
            posX: hit.position.x,
            posZ: hit.position.z,
        };

        if (mode === 'move') {
            if (event.ctrlKey || event.metaKey) {
                hit.userData.isLifted = true;
            } else if (!hit.userData.isLifted) {
                hit.userData.isLifted = false;
            }
            dragPlaneY = hit.position.y;
        }

        if (pickOnPlane(event, hit.position.y, planeHit)) {
            dragOffset.copy(planeHit).sub(hit.position);
        }

        renderer.domElement.setPointerCapture(event.pointerId);
    }

    renderer.domElement.addEventListener('pointerdown', (event) => {
        const hit = getIntersectedCube(event);

        if (event.button !== 0) return;

        const now = performance.now();

        if (hit && now - lastClickTime < 320) {
            duplicateCube(hit);
            lastClickTime = 0;
            return;
        }
        lastClickTime = now;

        if (hit) {
            if (event.shiftKey) {
                beginCubeDrag(hit, event, 'rotate');
            } else {
                beginCubeDrag(hit, event, 'move');
            }
        } else {
            setSelectedCube(null);
            controls.enabled = true;
        }
    });

    renderer.domElement.addEventListener('pointermove', (event) => {
        if (!isDragging || !selectedCube) return;

        if (dragMode === 'rotate') {
            const deltaX = event.clientX - dragStart.x;
            const deltaY = event.clientY - dragStart.y;
            selectedCube.rotation.y = cubeDragStart.rotY + deltaX * 0.012;
            selectedCube.rotation.x = cubeDragStart.rotX + deltaY * 0.012;
            return;
        }

        if (dragMode !== 'move') return;

        const ctrlHeld = event.ctrlKey || event.metaKey;

        if (ctrlHeld) {
            selectedCube.userData.isLifted = true;
            const deltaY = (dragStart.y - event.clientY) * 0.02;
            const targetY = Math.max(cubeSize / 2, cubeDragStart.liftY + deltaY);
            tryMoveVertical(
                selectedCube,
                targetY,
                selectedCube.position.x,
                selectedCube.position.z
            );
            return;
        }

        if (pickOnPlane(event, dragPlaneY, planeHit)) {
            const targetX = planeHit.x - dragOffset.x;
            const targetZ = planeHit.z - dragOffset.z;
            tryMoveHorizontal(selectedCube, targetX, targetZ, dragPlaneY);
        }
    });

    function endDrag(event) {
        if (!isDragging) return;

        if (selectedCube && dragMode === 'move') {
            finalizeCubePlacement(selectedCube);
        }

        isDragging = false;
        dragMode = null;
        controls.enabled = true;
        if (event && event.pointerId !== undefined) {
            try {
                renderer.domElement.releasePointerCapture(event.pointerId);
            } catch (_) { /* ignore */ }
        }
    }

    renderer.domElement.addEventListener('pointerup', endDrag);
    renderer.domElement.addEventListener('pointercancel', endDrag);

    document.getElementById('duplicate-btn')?.addEventListener('click', () => {
        if (selectedCube) duplicateCube(selectedCube);
    });

    window.addEventListener('keydown', (event) => {
        if ((event.key === 'd' || event.key === 'D') && selectedCube && !event.metaKey && !event.ctrlKey) {
            duplicateCube(selectedCube);
        }
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

        if (mirrorReflector && mirrorReflector.getRenderTarget) {
            const target = mirrorReflector.getRenderTarget();
            target.setSize(
                Math.floor(window.innerWidth * renderer.getPixelRatio()),
                Math.floor(window.innerHeight * renderer.getPixelRatio())
            );
        }
    });
})();
