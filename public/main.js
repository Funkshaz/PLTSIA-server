const API_URL = 'https://pltsia-server.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  const soilTiles = document.querySelectorAll('.soil-tile');

  // Load existing plantings from server
  fetch(`${API_URL}/plantings`)
    .then(res => res.json())
    .then(data => {
      data.forEach(seed => {
        const tile = document.querySelector(`.soil-tile[data-id="${seed.tileId}"]`);
        if (tile) {
          tile.classList.add('planted');
          tile.textContent = seed.type[0].toUpperCase();
        }
      });
    })
    .catch(err => {
      console.error('Failed to load plantings:', err);
    });

  // Plant a seed on tile click
  soilTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      if (tile.classList.contains('planted')) return;

      const tileId = tile.dataset.id;
      const seedType = 'carrot'; // could be dynamic
      const plantedAt = new Date().toISOString();

      fetch(`${API_URL}/plant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tileId, type: seedType, plantedAt }),
      })
      .then(res => {
        if (res.status === 409) {
          alert('This tile is already planted!');
        } else if (!res.ok) {
          throw new Error('Planting failed');
        } else {
          tile.classList.add('planted');
          tile.textContent = seedType[0].toUpperCase();
        }
      })
      .catch(err => {
        console.error(err);
        alert('Could not plant seed. Please try again.');
      });
    });
  });
});
