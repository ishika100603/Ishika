const scene = new THREE.Scene();
scene.background = new THREE.Color(0x060606);
scene.fog = new THREE.Fog(0x060606, 6, 24);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1.2, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffd9a0, 1.3);
keyLight.position.set(4, 6, 4);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x7cc7ff, 0.7);
fillLight.position.set(-5, 2, 3);
scene.add(fillLight);

const floor = new THREE.Mesh(
    new THREE.BoxGeometry(14, 0.2, 14),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95 })
);
floor.position.y = -0.1;
scene.add(floor);

const group = new THREE.Group();
scene.add(group);

const box = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.6, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x7f5cff, roughness: 0.35, metalness: 0.2 })
);
box.position.set(-2, 1.2, 0);
group.add(box);

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xff6b6b, roughness: 0.2, metalness: 0.3 })
);
sphere.position.set(1.5, 1.2, 0.8);
group.add(sphere);

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.3, 16, 80),
    new THREE.MeshStandardMaterial({ color: 0x2ed3c9, roughness: 0.4, metalness: 0.5 })
);
torus.position.set(0, 1.6, -2.3);
torus.rotation.x = Math.PI / 2.3;
group.add(torus);

const pivot = new THREE.Group();
scene.add(pivot);

const ring = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.5, 0.15, 80, 16),
    new THREE.MeshStandardMaterial({ color: 0xf7f7f7, roughness: 0.2, metalness: 0.7 })
);
ring.position.set(0, 1.6, 0);
pivot.add(ring);

function animate() {
    requestAnimationFrame(animate);

    group.rotation.y += 0.005;
    pivot.rotation.y += 0.01;
    ring.rotation.x += 0.01;

    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
