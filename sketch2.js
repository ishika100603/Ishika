let t = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background(15, 12, 25);
    t += 0.03;

    let rows = 48;
    let spacing = height / rows;

    noFill();
    strokeWeight(2);

    for (let r = 0; r < rows; r++) {
        let baseY = r * spacing + spacing / 2;
        let yShift = sin(t * 0.9 + r * 0.24) * 18;
        let mouseDist = abs(mouseY - baseY);
        let influence = map(mouseDist, 0, 250, 2.5, 0.2, true);

        let shade = map(r % 3, 0, 2, 220, 50);
        stroke(shade, shade * 0.85, 255, 140);

        beginShape();
        for (let x = 0; x <= width; x += 12) {
            let mouseXInfluence = map(abs(mouseX - x), 0, width * 0.5, 1.8, 0, true);
            let wave = sin(x * 0.014 + t + r * 0.35) * (26 + influence * mouseXInfluence * 10);
            let ripple = cos(t * 1.2 + x * 0.01) * 6;
            vertex(x, baseY + yShift + wave + ripple);
        }
        endShape();
    }

    push();
    blendMode(SCREEN);
    translate(width / 2, height / 2);
    strokeWeight(1.5);
    let spokes = 80;
    for (let i = 0; i < spokes; i++) {
        let angle = (TWO_PI / spokes) * i + t * 0.15;
        let len = width * 0.22 + sin(angle * 5 + t) * 50;
        let alpha = map(sin(t * 1.3 + i), -1, 1, 40, 120);
        let shade = i % 2 === 0 ? 255 : 120;
        stroke(shade, shade * 0.7, 255, alpha);
        line(0, 0, cos(angle) * len, sin(angle) * len);
    }
    pop();
    blendMode(BLEND);

    for (let i = 0; i < 6; i++) {
        let offset = sin(t * 1.6 + i * 2.1) * 40;
        let x = width * (i + 1) / 7 + sin(t * 0.7 + i) * 32;
        let y = height * 0.35 + offset * 0.7;
        stroke(255, 200, 220, 160);
        line(x - 120, y, x + 120, y + offset * 0.5);
        stroke(110, 220, 255, 120);
        line(x - 80, y + 20, x + 80, y - offset * 0.4);
    }
}
