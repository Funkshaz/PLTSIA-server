const API_URL = "https://pltsia-server.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const soilTiles = document.querySelectorAll(".soil-tile");

    function addCarrotToTile(tile) {
        tile.classList.add("planted");
        const img = document.createElement("img");
        img.src = "assets/carrot.png";
        img.alt = "Carrot";
        tile.appendChild(img);
    }

    // Load saved seeds
    fetch(`${API_URL}/plantings`)
        .then((res) => res.json())
        .then((data) => {
            data.forEach((seed) => {
                const tile = document.querySelector(
                    `.soil-tile[data-id="${seed.tileId}"]`
                );
                if (tile) addCarrotToTile(tile);
            });
        });

    // Click to plant
    soilTiles.forEach((tile) => {
        tile.addEventListener("click", () => {
            if (tile.classList.contains("planted")) return;

            const tileId = tile.dataset.id;
            const seedType = "carrot";
            const plantedAt = new Date().toISOString();

            fetch(`${API_URL}/plant`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tileId, type: seedType, plantedAt }),
            })
                .then((res) => {
                    if (res.status === 409) return alert("Already planted!");
                    if (!res.ok) throw new Error("Failed to plant");
                    addCarrotToTile(tile);
                })
                .catch((err) => {
                    console.error(err);
                    alert("Could not plant seed.");
                });
        });
    });
});
