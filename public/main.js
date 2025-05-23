window.onload = async () => {
    const response = await fetch("/plants");
    const savedSeeds = await response.json();

    const pots = document.querySelectorAll("pot-");
    for (let i = 0; i < savedSeeds.length; i++) {
        const seed = savedSeeds[i];
        const plant = document.createElement("plant-");
        plant.style.background = seed.color;
        plant.innerHTML = seed.timestamp;
        pots[seed.position || 0].appendChild(plant);
        pots[seed.position || 0].hasPlant = true; // Mark as filled
    }
};

function changeColor(event) {
    event.target.style = "background-color: red";
}

function resetColor(event) {
    event.target.style = "background-color: initial";
}

class Plant extends HTMLElement {
    constructor() {
        super();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // Respond to attribute changes
        if (name == "state") {
            if (newValue == "seed") {
                this.style.background = "red";
            }
        }
    }

    static get observedAttributes() {
        return ["state"]; // List of attributes to watch for changes
    }
}

class Pot extends HTMLElement {
    constructor() {
        super();
        this.addEventListener("click", this.handleClick.bind(this));
        this.hasPlant = false;
    }

    handleClick(event) {
        if (!this.hasPlant) {
            plantSeed(event, selectedSeed);
            this.hasPlant = true;
        } else {
            this.showMessage("Full!");
        }
    }

    showMessage(message) {
        let messageBox = document.createElement("div");
        messageBox.classList.add("message-box");
        messageBox.innerHTML += `${message}`;
        this.appendChild(messageBox);
        setTimeout(function () {
            messageBox.remove();
        }, 2000);
    }
}

class Room extends HTMLElement {
    constructor() {
        super();
    }
}

class Seed {
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this.plantedTimeStamp = getServerTime();
    }
}

customElements.define("plant-", Plant);
customElements.define("pot-", Pot);
customElements.define("room-", Room);

let rose = new Seed("Rose", "red");
let selectedSeed = rose;

async function plantSeed(event, seed) {
    console.log("planting seed");
    const timestamp = await getServerTime();
    seed.plantedTimeStamp = timestamp;
    let plant = document.createElement("plant-");
    plant.style.background = seed.color;
    plant.innerHTML = seed.plantedTimeStamp;
    event.target.appendChild(plant);
    console.log(seed.plantedTimeStamp);

    await fetch("/plant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: seed.name,
            color: seed.color,
            timestamp: timestamp,
            position: event.target.dataset.index || 0, // Optional: which pot?
        }),
    });
}

async function getServerTime() {
    const response = await fetch("/timestamp");
    if (!response.ok) throw new Error("Failed to fetch timestamp");
    const data = await response.json();
    return data.timestamp;
}
