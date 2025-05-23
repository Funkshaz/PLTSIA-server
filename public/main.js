window.onload = (event) => {
    // for (let i = 0; i < 10; i++) {
    //     let newPlant = document.createElement("plant");
    //     document.getElementById("plantContainer").appendChild(newPlant);
    // }
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

function plantSeed(event, seed) {
    console.log("planting seed");
    let plant = document.createElement("plant-");
    plant.style.background = seed.color;
    event.target.appendChild(plant);
    console.log(seed.plantedTimeStamp);
}

async function getServerTime() {
    const response = await fetch("/timestamp");
    if (!response.ok) throw new Error("Failed to fetch timestamp");
    const data = await response.json();
    return data;
}
