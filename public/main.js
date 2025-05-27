const gameArea = document.getElementById("game-area");
let camX = 0,
    camY = 0;

function logout() {
    fetch("/logout", { method: "POST", credentials: "include" }).then(
        () => (location.href = "/login.html")
    );
}

function plantSeed(tileId, type, plantedAt) {
    const tile = document.querySelector(`[data-id="${tileId}"]`);
    if (tile && !tile.querySelector("img")) {
        const img = document.createElement("img");
        img.src = "/assets/carrot.png";
        img.style.width = "100%";
        tile.appendChild(img);
    }
}

function placeTile(x, y, tileId) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.style.left = `${x}px`;
    tile.style.top = `${y}px`;
    tile.dataset.id = tileId;

    tile.addEventListener("click", () => {
        fetch("/plant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                tileId,
                type: "carrot",
                plantedAt: Date.now(),
            }),
        }).then((res) => {
            if (res.ok) plantSeed(tileId, "carrot", Date.now());
        });
    });

    gameArea.appendChild(tile);
}

function setupGarden() {
    const centerX = 1000;
    const centerY = 1000;
    const rings = 4;
    const tilesPerRing = 16;
    const ringSpacing = 160;

    for (let r = 1; r <= rings; r++) {
        const radius = r * ringSpacing;
        for (let i = 0; i < tilesPerRing; i++) {
            const angle = ((2 * Math.PI) / tilesPerRing) * i;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            placeTile(x, y, `${r}-${i}`);
        }
    }

    fetch("/plantings", { credentials: "include" })
        .then((res) =>
            res.status === 401 ? (location.href = "/login.html") : res.json()
        )
        .then((data) =>
            data.forEach((p) => plantSeed(p.tileId, p.type, p.plantedAt))
        );
}

// Arrow keys scroll
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") camX -= 20;
    if (e.key === "ArrowLeft") camX += 20;
    if (e.key === "ArrowDown") camY -= 20;
    if (e.key === "ArrowUp") camY += 20;
    gameArea.style.transform = `translate(${camX}px, ${camY}px)`;
});

// Drag-to-scroll (touch + mouse)
let isDragging = false;
let startX, startY;

function onTouchStart(e) {
    if (e.button === 1 || e.touches) {
        // middle mouse or touch
        isDragging = true;
        const touch = e.touches ? e.touches[0] : e;
        startX = touch.clientX;
        startY = touch.clientY;
        e.preventDefault(); // prevent middle-click scrolling
    }
}

function onTouchMove(e) {
    if (!isDragging) return;
    const touch = e.touches ? e.touches[0] : e;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    camX += dx;
    camY += dy;
    gameArea.style.transform = `translate(${camX}px, ${camY}px)`;

    startX = touch.clientX;
    startY = touch.clientY;
}

function onTouchEnd() {
    isDragging = false;
}

const container = document.getElementById("game-container");
container.addEventListener("mousedown", onTouchStart);
container.addEventListener("mousemove", onTouchMove);
container.addEventListener("mouseup", onTouchEnd);
container.addEventListener("mouseleave", onTouchEnd);

container.addEventListener("touchstart", onTouchStart);
container.addEventListener("touchmove", onTouchMove);
container.addEventListener("touchend", onTouchEnd);
container.addEventListener("touchcancel", onTouchEnd);

// Scroll buttons
let scrollInterval;

function startScroll(dx, dy) {
    stopScroll();
    scrollInterval = setInterval(() => {
        camX += dx;
        camY += dy;
        gameArea.style.transform = `translate(${camX}px, ${camY}px)`;
    }, 30);
}

function stopScroll() {
    clearInterval(scrollInterval);
}

function setupScrollButtons() {
    const directions = {
        up: [0, 10],
        down: [0, -10],
        left: [10, 0],
        right: [-10, 0],
        "up-left": [7, 7],
        "up-right": [-7, 7],
        "down-left": [7, -7],
        "down-right": [-7, -7],
    };

    Object.entries(directions).forEach(([id, [dx, dy]]) => {
        const btn = document.getElementById(id);
        btn.addEventListener("mousedown", () => startScroll(dx, dy));
        btn.addEventListener("touchstart", () => startScroll(dx, dy));
        btn.addEventListener("mouseup", stopScroll);
        btn.addEventListener("mouseleave", stopScroll);
        btn.addEventListener("touchend", stopScroll);
    });
}

setupGarden();
setupScrollButtons();
