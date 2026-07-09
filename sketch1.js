function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1);
    noLoop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    redraw();
}

function draw() {
    randomSeed(23);
    noiseSeed(23);

    background(12, 10, 22);

    // Vertical gradient sky
    noStroke();
    for (let y = 0; y < height * 0.58; y++) {
        let t = y / (height * 0.58);
        fill(lerpColor(color(18, 12, 30), color(140, 70, 95), t));
        rect(0, y, width, 1);
    }

    // Soft radial glow behind the main illusion
    const glow = color(255, 240, 210, 32);
    for (let r = 280; r > 0; r -= 18) {
        fill(red(glow), green(glow), blue(glow), alpha(glow) * (r / 280) * 0.35);
        ellipse(width * 0.5, height * 0.4, r + 120, r);
    }

    // Horizon grid plane
    const horizon = height * 0.58;
    stroke(210, 190, 170, 120);
    strokeWeight(1.2);
    for (let i = 0; i < 15; i++) {
        const y = lerp(horizon, height * 0.92, i / 14);
        const x1 = width * 0.08 + pow(i / 14, 1.8) * width * 0.44;
        const x2 = width * 0.92 - pow(i / 14, 1.8) * width * 0.44;
        line(x1, y, x2, y);
    }
    for (let i = 0; i < 11; i++) {
        const t = i / 10;
        const x = lerp(width * 0.12, width * 0.88, t);
        beginShape();
        for (let j = 0; j < 16; j++) {
            const y = map(j, 0, 15, horizon, height * 0.92);
            vertex(x + map(j, 0, 15, 0, (x - width * 0.5) * 0.4), y);
        }
        endShape();
    }

    // Floating panel arrangement
    noFill();
    stroke(255, 255, 255, 180);
    strokeWeight(2);
    for (let i = 0; i < 4; i++) {
        const w = width * 0.16;
        const h = height * 0.18;
        const x = width * 0.14 + i * (w + 24);
        const y = height * 0.16 + sin(i * 1.2) * 24;
        beginShape();
        vertex(x, y);
        vertex(x + w, y + 8);
        vertex(x + w - 20, y + h + 20);
        vertex(x - 10, y + h);
        endShape(CLOSE);
    }

    // Central floating architecture
    push();
    translate(width * 0.5, height * 0.42);
    rotate(-PI / 18);
    fill(45, 25, 60, 200);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, width * 0.22, height * 0.32, 38);
    fill(255, 255, 255, 16);
    rect(0, 0, width * 0.16, height * 0.24, 32);
    pop();

    // Illusion windows and frames
    stroke(255, 210, 180, 200);
    strokeWeight(3);
    noFill();
    const frameW = width * 0.18;
    const frameH = height * 0.22;
    for (let i = -1; i <= 1; i++) {
        const fx = width * 0.5 + i * (frameW + 12);
        const fy = height * 0.42 + i * 12;
        rectMode(CENTER);
        rect(fx, fy, frameW, frameH, 26);
    }

    // Concentric rings and optical void
    noFill();
    stroke(255, 255, 255, 110);
    strokeWeight(1.4);
    for (let i = 0; i < 7; i++) {
        ellipse(width * 0.52, height * 0.42, 240 - i * 26, 220 - i * 24);
    }
    fill(18, 12, 22);
    noStroke();
    ellipse(width * 0.52, height * 0.42, 52, 46);

    // Abstract floating shapes
    for (let i = 0; i < 5; i++) {
        const px = width * (0.14 + i * 0.16);
        const py = height * (0.28 + sin(i * 1.3) * 0.06);
        const d = 36 + i * 5;
        fill(255, 245, 210, 160);
        noStroke();
        ellipse(px, py, d, d * 1.2);
        stroke(255, 200, 170, 140);
        strokeWeight(2);
        line(px - d * 0.5, py, px + d * 0.5, py);
        line(px, py - d * 0.4, px, py + d * 0.4);
    }

    // Diagonal illusion stripes
    stroke(255, 255, 255, 24);
    strokeWeight(2);
    for (let i = -12; i <= 12; i += 2) {
        const x = width * 0.08 + i * 24;
        line(x, height * 0.15, x + width * 0.12, height * 0.55);
    }

    // Edge doodles and graphic accents
    stroke(220, 180, 145, 160);
    strokeWeight(2);
    noFill();
    beginShape();
    vertex(width * 0.03, height * 0.14);
    bezierVertex(width * 0.08, height * 0.05, width * 0.18, height * 0.18, width * 0.07, height * 0.24);
    bezierVertex(width * 0.02, height * 0.28, width * 0.12, height * 0.31, width * 0.16, height * 0.39);
    endShape();
    beginShape();
    vertex(width * 0.95, height * 0.12);
    bezierVertex(width * 0.92, height * 0.19, width * 0.82, height * 0.14, width * 0.86, height * 0.29);
    bezierVertex(width * 0.89, height * 0.37, width * 0.97, height * 0.33, width * 0.99, height * 0.41);
    endShape();

    // Minimal floating geometry attachments
    fill(255, 255, 255, 170);
    noStroke();
    for (let i = 0; i < 10; i++) {
        const px = random(width * 0.12, width * 0.88);
        const py = random(height * 0.08, height * 0.55);
        circle(px, py, random(3, 7));
    }

    stroke(255, 210, 190, 120);
    strokeWeight(1);
    for (let i = 0; i < 8; i++) {
        const px = random(width * 0.18, width * 0.82);
        const py = random(height * 0.12, height * 0.5);
        line(px - 6, py - 5, px + 8, py + 4);
        line(px + 5, py - 7, px - 9, py + 9);
    }
}
