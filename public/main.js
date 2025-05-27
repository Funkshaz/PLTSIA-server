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
        img.src = "/assets/carrot.PNG"; // replace with other crops
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

    // Get existing plantings
    fetch("/plantings", { credentials: "include" })
        .then((res) =>
            res.status === 401 ? (location.href = "/login.html") : res.json()
        )
        .then((data) =>
            data.forEach((p) => plantSeed(p.tileId, p.type, p.plantedAt))
        );
}

// Camera movement with arrow keys
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") camX -= 20;
    if (e.key === "ArrowLeft") camX += 20;
    if (e.key === "ArrowDown") camY -= 20;
    if (e.key === "ArrowUp") camY += 20;
    gameArea.style.transform = `translate(${camX}px, ${camY}px)`;
});

setupGarden();
