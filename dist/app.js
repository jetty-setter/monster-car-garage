const truckName = document.querySelector("#truck-name");
const truckPaint = document.querySelector("#truck-paint");
const truckTitle = document.querySelector("#truck-title");
const buildStatus = document.querySelector(".build-status");
const paintSwatches = document.querySelectorAll(".paint-swatch");
const previewButton = document.querySelector("#preview-button");
const saveButton = document.querySelector("#save-button");
const nameInput = document.querySelector("#truck-name-input");
const truckForm = document.querySelector("#truck-form");
const garageCards = document.querySelector("#garage-cards");
const garageCount = document.querySelector("#garage-count");
const garageStatus = document.querySelector("#garage-status");
const refreshButton = document.querySelector("#refresh-garage");
const newTruckButton = document.querySelector("#new-truck");

let currentTruck = null;
let savedTrucks = [];
let busy = false;

function showFeedback(message, state = "info") {
    buildStatus.textContent = message;
    buildStatus.dataset.state = state;
}

function applyPaint(color) {
    truckPaint.setAttribute("fill", color);
    if (currentTruck) currentTruck.color = color;
    paintSwatches.forEach((swatch) => {
        const selected = swatch.dataset.color === color;
        swatch.classList.toggle("selected", selected);
        swatch.setAttribute("aria-pressed", String(selected));
    });
}

function renderTruck(truck) {
    currentTruck = { ...truck, color: truck.color.toLowerCase() };
    truckName.textContent = truck.name;
    truckTitle.textContent = `${truck.name} — monster pickup`;
    nameInput.value = truck.name;
    applyPaint(currentTruck.color);
}

function setBusy(value, action = "") {
    busy = value;
    const disabled = value || !currentTruck;
    previewButton.disabled = disabled;
    saveButton.disabled = disabled;
    nameInput.disabled = disabled;
    paintSwatches.forEach((swatch) => { swatch.disabled = disabled; });
    refreshButton.disabled = value;
    newTruckButton.disabled = value;
    garageCards.querySelectorAll("button").forEach((button) => {
        button.disabled = value;
    });
    previewButton.textContent = value && action === "preview" ? "Checking…" : "Preview";
    saveButton.textContent = value && action === "save" ? "Saving…" :
        /^\d+$/.test(currentTruck?.id ?? "") ? "Save a copy" : "Save truck";
    truckForm.setAttribute("aria-busy", String(value));
}

async function requestJson(path, options = {}) {
    const response = await fetch(path, options);
    if (!response.ok) {
        const message = response.status === 400 ? "The backend rejected this design. Check the name and paint." :
            response.status === 404 ? "That truck could not be found." :
            `The backend returned an error (${response.status}).`;
        throw new Error(message);
    }
    return response.json();
}

// The URL remembers which stored truck to load after refreshing the page.
function rememberTruck(id) {
    const url = new URL(window.location.href);
    if (/^\d+$/.test(id)) url.searchParams.set("truck", id);
    else url.searchParams.delete("truck");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
}

async function openTruck(id, scrollToWorkshop = false) {
    if (busy) return;
    setBusy(true);
    showFeedback("Loading your truck…");
    try {
        const truck = await requestJson(`/api/trucks/${encodeURIComponent(id)}`);
        renderTruck(truck);
        rememberTruck(truck.id);
        showFeedback(id === "demo" ? "Pick a name and paint. Preview checks it; Save stores it." :
            `Loaded “${truck.name}” from your garage. Changes can be saved as a new copy.`, "success");
        if (scrollToWorkshop) {
            const workshop = document.querySelector("#workshop");
            workshop.scrollIntoView({ behavior: "auto", block: "start" });
            workshop.focus({ preventScroll: true });
        }
    } catch (error) {
        console.error("Unable to load truck:", error);
        showFeedback(`${error.message} Choose a saved truck or start a new one.`, "error");
    } finally {
        setBusy(false);
    }
}

function renderGarage() {
    garageCards.replaceChildren();
    garageCount.textContent = String(savedTrucks.length);
    garageStatus.textContent = savedTrucks.length ?
        "Stored in your local database. Open a truck to work on a copy." :
        "Your garage is empty. Name a truck above and save it here.";

    savedTrucks.forEach((truck) => {
        const card = document.createElement("article");
        card.className = "garage-card";
        const chip = document.createElement("span");
        chip.className = "garage-chip";
        chip.setAttribute("aria-hidden", "true");
        chip.style.backgroundColor = /^#[0-9a-f]{6}$/i.test(truck.color) ? truck.color : "#ba5831";
        const details = document.createElement("div");
        const heading = document.createElement("h3");
        heading.textContent = truck.name;
        const number = document.createElement("p");
        number.textContent = `Truck #${truck.id} · ${truck.color}`;
        details.append(heading, number);
        const openButton = document.createElement("button");
        openButton.type = "button";
        openButton.className = "secondary-button";
        openButton.textContent = "Open truck";
        openButton.setAttribute("aria-label", `Open ${truck.name}, truck ${truck.id}`);
        openButton.disabled = busy;
        openButton.addEventListener("click", () => openTruck(truck.id, true));
        card.append(chip, details, openButton);
        garageCards.append(card);
    });
}

async function refreshGarage() {
    if (busy) return;
    setBusy(true);
    garageStatus.textContent = "Loading saved trucks…";
    try {
        savedTrucks = await requestJson("/api/trucks");
        renderGarage();
    } catch (error) {
        console.error("Unable to load garage:", error);
        garageStatus.textContent = `${error.message} Use Refresh to try again.`;
    } finally {
        setBusy(false);
    }
}

async function submitDesign(action) {
    if (busy || !currentTruck) return;
    const name = nameInput.value.trim();
    if (!name || name.length > 40) {
        showFeedback("Choose a name between 1 and 40 characters.", "error");
        nameInput.focus();
        return;
    }

    const design = { name, color: currentTruck.color };
    setBusy(true, action);
    showFeedback(action === "save" ? "Saving to your garage…" : "Checking the preview…");
    try {
        const truck = await requestJson(action === "save" ? "/api/trucks" : "/api/trucks/preview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(design)
        });
        renderTruck(truck);
        if (action === "save") {
            savedTrucks = [truck, ...savedTrucks.filter((saved) => saved.id !== truck.id)];
            renderGarage();
            rememberTruck(truck.id);
            showFeedback(`✓ Saved “${truck.name}” as truck #${truck.id}. It is now in Our garage.`, "success");
        } else {
            showFeedback(`✓ Preview applied: ${truck.name}. This preview is not saved.`, "success");
        }
    } catch (error) {
        console.error("Unable to submit design:", error);
        showFeedback(`${error.message} Your on-screen design has not been discarded.`, "error");
    } finally {
        setBusy(false);
    }
}

// Events are registered once, rather than each time a truck loads.
paintSwatches.forEach((swatch) => {
    swatch.addEventListener("click", () => {
        if (busy || !currentTruck) return;
        applyPaint(swatch.dataset.color);
        showFeedback("Paint changed on-screen. Save to keep a new copy.");
    });
});
nameInput.addEventListener("input", () => {
    showFeedback("Name changed on-screen. Preview it or save a new copy.");
});
previewButton.addEventListener("click", () => submitDesign("preview"));
truckForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitDesign("save");
});
refreshButton.addEventListener("click", refreshGarage);
newTruckButton.addEventListener("click", () => openTruck("demo", true));

async function initialize() {
    const requestedId = new URL(window.location.href).searchParams.get("truck");
    await openTruck(requestedId && /^\d+$/.test(requestedId) ? requestedId : "demo");
    await refreshGarage();
}

initialize();
