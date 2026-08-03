(function () {
    const FACE_TEXTURES = [
        'canvas3-pyramid/face-book.png',
        'canvas3-pyramid/face-book.png',
        'canvas3-pyramid/face-book.png',
        'canvas3-pyramid/face-book.png',
    ];

    const PYRAMID_HEIGHT = 5.6;
    const PYRAMID_RADIUS = 3.35;
    const PYRAMID_Y = 1.85;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.038);

    const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 120);
    const viewTarget = new THREE.Vector3(0, PYRAMID_Y, 0);
    const openingRadius = 13.2;
    const openingAzimuth = Math.PI / 4;
    const openingPolar = Math.PI * 0.32;

    camera.position.set(
        viewTarget.x + openingRadius * Math.sin(openingPolar) * Math.sin(openingAzimuth),
        viewTarget.y + openingRadius * Math.cos(openingPolar),
        viewTarget.z + openingRadius * Math.sin(openingPolar) * Math.cos(openingAzimuth)
    );
    camera.lookAt(viewTarget);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = 6.5;
    controls.maxDistance = 20;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.target.copy(viewTarget);
    controls.update();

    const ambientLight = new THREE.AmbientLight(0x120604, 0.22);
    scene.add(ambientLight);

    const lampGroup = new THREE.Group();
    scene.add(lampGroup);

    function makeShadeMaterial(texture) {
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        return new THREE.MeshStandardMaterial({
            map: texture,
            emissiveMap: texture,
            emissive: new THREE.Color(0xe8a860),
            emissiveIntensity: 0.88,
            color: 0xfff6ea,
            roughness: 0.78,
            metalness: 0.04,
            transparent: true,
            opacity: 0.82,
            side: THREE.DoubleSide,
            depthWrite: true,
        });
    }

    function addLampStand() {
        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.2, 1.35, 20),
            new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.42, metalness: 0.55 })
        );
        stem.position.y = 0.72;
        lampGroup.add(stem);

        const foot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.72, 0.82, 0.18, 24),
            new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.38, metalness: 0.62 })
        );
        foot.position.y = 0.09;
        lampGroup.add(foot);

        const neck = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.34, 0.28, 20),
            new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.4, metalness: 0.5 })
        );
        neck.position.y = 1.48;
        lampGroup.add(neck);
    }

    function addInnerLampGlow() {
        const glowGroup = new THREE.Group();
        glowGroup.position.y = PYRAMID_Y;
        lampGroup.add(glowGroup);

        const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.46, 32, 32),
            new THREE.MeshBasicMaterial({
                color: 0xfff8e8,
                transparent: true,
                opacity: 0.72,
                depthWrite: false,
            })
        );
        bulb.position.y = -0.38;
        bulb.renderOrder = 3;
        glowGroup.add(bulb);

        const filament = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 16, 16),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.95,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            })
        );
        filament.position.y = -0.38;
        filament.renderOrder = 4;
        glowGroup.add(filament);

        const core = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.42, 0),
            new THREE.MeshBasicMaterial({
                color: 0xffb860,
                transparent: true,
                opacity: 0.45,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            })
        );
        core.position.y = -0.38;
        core.renderOrder = 2;
        glowGroup.add(core);

        const innerLight = new THREE.PointLight(0xffc878, 7.5, 16, 1.5);
        innerLight.position.set(0, -0.45, 0);
        glowGroup.add(innerLight);

        const warmLight = new THREE.PointLight(0xd89048, 5.2, 13, 1.7);
        warmLight.position.set(0, -0.85, 0);
        glowGroup.add(warmLight);

        const upperLight = new THREE.PointLight(0xffc878, 3.4, 11, 1.8);
        upperLight.position.set(0, 0.35, 0);
        glowGroup.add(upperLight);

        return { core, innerLight, warmLight, bulb, filament };
    }

    function buildLampShade(materials) {
        const geometry = new THREE.CylinderGeometry(0.001, PYRAMID_RADIUS, PYRAMID_HEIGHT, 4, 1, true);
        geometry.rotateY(Math.PI / 4);

        const shade = new THREE.Mesh(geometry, materials);
        shade.position.y = PYRAMID_Y;
        shade.renderOrder = 1;
        lampGroup.add(shade);

        return shade;
    }

    const loader = new THREE.TextureLoader();
    let glow = null;
    const clock = new THREE.Clock();

    Promise.all(FACE_TEXTURES.map((src) => new Promise((resolve, reject) => {
        loader.load(src, resolve, undefined, reject);
    }))).then((textures) => {
        const materials = textures.map((texture) => makeShadeMaterial(texture));
        buildLampShade(materials);
        addLampStand();
        glow = addInnerLampGlow();
    }).catch((err) => {
        console.error('Failed to load pyramid textures', err);
    });

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.MeshStandardMaterial({ color: 0x030303, roughness: 1, metalness: 0 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    function animate() {
        requestAnimationFrame(animate);

        const t = clock.getElapsedTime();
        const pulse = 0.76 + Math.sin(t * 1.7) * 0.13 + Math.sin(t * 3.4) * 0.05;

        if (glow) {
            glow.innerLight.intensity = 6.4 + pulse * 2.8;
            glow.warmLight.intensity = 4.2 + pulse * 1.8;
            glow.core.material.opacity = 0.34 + pulse * 0.16;
            glow.core.scale.setScalar(0.88 + pulse * 0.1);
            glow.bulb.material.opacity = 0.62 + pulse * 0.14;
            glow.filament.material.opacity = 0.82 + pulse * 0.12;
        }

        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();
