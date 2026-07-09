const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080810);
scene.fog = new THREE.Fog(0x080810, 6, 24);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.2, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.target.set(0, 1.3, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.16);
scene.add(ambientLight);

const keyLight = new THREE.PointLight(0xffb36b, 30, 14, 2);
keyLight.position.set(2.5, 3.5, 2.5);
scene.add(keyLight);

const fillLight = new THREE.PointLight(0x5aa9ff, 24, 14, 2);
fillLight.position.set(-3.2, 2.0, 3.0);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0x7d5cff, 0.8);
rimLight.position.set(0, 2, -6);
scene.add(rimLight);

const floor = new THREE.Mesh(
    new THREE.BoxGeometry(20, 0.2, 20),
    new THREE.MeshPhysicalMaterial({ color: 0x12121a, roughness: 0.95, metalness: 0.05 })
);
floor.position.y = -0.1;
scene.add(floor);

const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.3, 1.2, 32),
    new THREE.MeshStandardMaterial({ color: 0x2d2d3d, roughness: 0.25, metalness: 0.3 })
);
pedestal.position.y = 0.6;
scene.add(pedestal);

const orb = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 48, 48),
    new THREE.MeshPhysicalMaterial({ color: 0xff8a5b, roughness: 0.15, metalness: 0.75, clearcoat: 0.8, clearcoatRoughness: 0.1 })
);
orb.position.set(-1.2, 1.8, 0.2);
scene.add(orb);

const box = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.4, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x74b9ff, roughness: 0.7, metalness: 0.2 })
);
box.position.set(1.4, 1.6, -0.8);
scene.add(box);

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.8, 0.22, 16, 64),
    new THREE.MeshPhysicalMaterial({ color: 0xf2dc6d, roughness: 0.35, metalness: 0.6, clearcoat: 0.6 })
);
torus.position.set(0.1, 2.2, 1.2);
torus.rotation.x = Math.PI / 2.4;
scene.add(torus);

function animate() {
    requestAnimationFrame(animate);

    orb.rotation.y += 0.008;
    box.rotation.y += 0.005;
    torus.rotation.z += 0.007;

    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
