const API_URL = 'https://pltsia-server.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
  const soilTiles = document.querySelectorAll('.soil-tile');

  soilTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const seedType = 'carrot'; // Or use a dropdown/input if you want dynamic types
      const plantedAt = new Date().toISOString();

      fetch(`${API_URL}/plant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: seedType, plantedAt }),
      })
      .then(response => {
        if (!response.ok) throw new Error('Failed to plant seed');
        return response.text();
      })
      .then(msg => {
        console.log(msg);
        tile.classList.add('planted');
        tile.textContent = seedType[0].toUpperCase(); // Show the first letter of the seed type
      })
      .catch(err => {
        console.error('Error:', err);
        alert('Could not plant seed. Please try again.');
      });
    });
  });
});