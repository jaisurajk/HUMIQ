const plannerRows = Array.from(document.querySelectorAll(".planner-row"));
const completionPercent = document.getElementById("completionPercent");
const alertBox = document.getElementById("alertBox");
const reviewWeekButton = document.getElementById("reviewWeekButton");
const suggestionInput = document.getElementById("strategySuggestion");
const suggestionStatus = document.getElementById("suggestionStatus");
const submitSuggestionButton = document.getElementById("submitSuggestionButton");

const departureFlowState = document.getElementById("departureFlowState");
const departureTimeValue = document.getElementById("departureTimeValue");
const reminderStatus = document.getElementById("reminderStatus");
const setReminderButton = document.getElementById("setReminderButton");
const commuteToWorkButton = document.getElementById("commuteToWorkButton");
const departureTimeNode = document.getElementById("departureTimeNode");

const staggerFlowState = document.getElementById("staggerFlowState");
const staggerSelection = document.getElementById("staggerSelection");
const staggerWarning = document.getElementById("staggerWarning");
const timeSlotButtons = Array.from(document.querySelectorAll(".time-slot-button"));
const slot600Value = document.getElementById("slot600Value");
const slot630Value = document.getElementById("slot630Value");
const slot700Value = document.getElementById("slot700Value");

const carpoolFlowState = document.getElementById("carpoolFlowState");
const createModeButton = document.getElementById("createModeButton");
const joinModeButton = document.getElementById("joinModeButton");
const createCarpoolButton = document.getElementById("createCarpoolButton");
const requestJoinButton = document.getElementById("requestJoinButton");
const acceptRequestButton = document.getElementById("acceptRequestButton");
const cancelCarpoolButton = document.getElementById("cancelCarpoolButton");
const coverCancellationButton = document.getElementById("coverCancellationButton");
const nearbyCarpoolsNode = document.getElementById("nearbyCarpoolsNode");
const pickupNode = document.getElementById("pickupNode");
const contactNode = document.getElementById("contactNode");
const carpoolCommuteNode = document.getElementById("carpoolCommuteNode");
const carpoolModeStatus = document.getElementById("carpoolModeStatus");
const passengerStatus = document.getElementById("passengerStatus");
const driverStatus = document.getElementById("driverStatus");
const pickupStatus = document.getElementById("pickupStatus");
const contactStatus = document.getElementById("contactStatus");
const coverageStatus = document.getElementById("coverageStatus");

const arrivalFlowState = document.getElementById("arrivalFlowState");
const feedbackOptions = Array.from(document.querySelectorAll(".feedback-button"));
const submitArrivalFeedback = document.getElementById("submitArrivalFeedback");
const arrivalStatus = document.getElementById("arrivalStatus");
const feedbackNode = document.getElementById("feedbackNode");
const recordNode = document.getElementById("recordNode");
const updateNode = document.getElementById("updateNode");
const planNode = document.getElementById("planNode");

const baseEnrollment = {
  "Work From Home": 62,
  "Staggered Leave": 71,
  Carpool: 54,
  PTO: 11,
};

const metricTargets = {
  "Work From Home": document.getElementById("countWFH"),
  "Staggered Leave": document.getElementById("countStaggered"),
  Carpool: document.getElementById("countCarpool"),
  PTO: document.getElementById("countPTO"),
};

const baseSlots = {
  "6:00 AM": 9860,
  "6:30 AM": 9420,
  "7:00 AM": 8910,
};

const slotTargets = {
  "6:00 AM": slot600Value,
  "6:30 AM": slot630Value,
  "7:00 AM": slot700Value,
};

const selections = {};
let selectedFeedback = "";
let selectedTimeSlot = "";
let carpoolMode = "driver";

function clearHighlights() {
  [
    departureTimeNode,
    nearbyCarpoolsNode,
    pickupNode,
    contactNode,
    carpoolCommuteNode,
    feedbackNode,
    recordNode,
    updateNode,
    planNode,
  ].forEach((item) => item.classList.remove("is-highlighted"));
}

function setHighlight(node) {
  clearHighlights();
  if (node) {
    node.classList.add("is-highlighted");
  }
}

function getScheduledCount() {
  return plannerRows.reduce((count, row) => {
    const day = row.dataset.day;
    return count + (selections[day] ? 1 : 0);
  }, 0);
}

function hasStrategy(strategy) {
  return Object.values(selections).includes(strategy);
}

function renderEnrollment() {
  const enrollment = { ...baseEnrollment };

  Object.values(selections).forEach((strategy) => {
    if (enrollment[strategy] !== undefined) {
      enrollment[strategy] += 1;
    }
  });

  Object.entries(metricTargets).forEach(([strategy, node]) => {
    node.textContent = enrollment[strategy];
  });
}

function renderStaggerModule() {
  const staggerSelected = hasStrategy("Staggered Leave");

  Object.entries(baseSlots).forEach(([slot, count]) => {
    const total = count + (selectedTimeSlot === slot ? 1 : 0);
    slotTargets[slot].textContent = `${total.toLocaleString()} / 10,000`;
  });

  if (!staggerSelected) {
    staggerFlowState.textContent = "Not needed this week";
    staggerWarning.textContent = "Choose staggered leave on a weekday to assign a time slot.";
    return;
  }

  if (!selectedTimeSlot) {
    staggerFlowState.textContent = "Slot needed";
    staggerWarning.textContent = "This commuter picked staggered leave but has not chosen a departure wave.";
    return;
  }

  staggerFlowState.textContent = "Balanced assignment";
  staggerSelection.textContent = selectedTimeSlot;
  staggerWarning.textContent = `Assigned to ${selectedTimeSlot}. Crowding stays distributed across waves.`;
}

function renderWeekStatus() {
  const missingDays = plannerRows
    .map((row) => row.dataset.day)
    .filter((day) => !selections[day]);

  const percent = Math.round((getScheduledCount() / plannerRows.length) * 100);
  completionPercent.textContent = `${percent}%`;

  if (missingDays.length === 0) {
    alertBox.className = "alert-banner success";
    alertBox.textContent =
      "All weekdays are scheduled. This commuter is fully enrolled in the weekly strategy plan.";
  } else {
    alertBox.className = "alert-banner warning";
    alertBox.textContent = `Action required: ${missingDays.join(", ")} ${missingDays.length === 1 ? "is" : "are"} still unscheduled.`;
  }

  if (hasStrategy("Staggered Leave") && !selectedTimeSlot) {
    alertBox.className = "alert-banner warning";
    alertBox.textContent += " Staggered leave is selected, but no departure wave is assigned yet.";
  }

  renderEnrollment();
  renderStaggerModule();
}

function setCarpoolMode(mode) {
  carpoolMode = mode;
  createModeButton.classList.toggle("is-active", mode === "driver");
  joinModeButton.classList.toggle("is-active", mode === "rider");

  if (mode === "driver") {
    carpoolModeStatus.textContent = "Driver creating group";
    carpoolFlowState.textContent = "Driver setup";
  } else {
    carpoolModeStatus.textContent = "Rider joining existing carpool";
    carpoolFlowState.textContent = "Rider browsing";
  }
}

plannerRows.forEach((row) => {
  const day = row.dataset.day;
  const buttons = Array.from(row.querySelectorAll(".strategy-button"));
  const stateLabel = row.querySelector(".selection-state");

  row.classList.add("is-incomplete");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.remove("is-selected"));
      button.classList.add("is-selected");

      selections[day] = button.dataset.strategy;
      stateLabel.textContent = button.dataset.strategy;

      row.classList.remove("is-incomplete");
      row.classList.add("is-complete");

      renderWeekStatus();
    });
  });
});

reviewWeekButton.addEventListener("click", () => {
  renderWeekStatus();
  alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
});

submitSuggestionButton.addEventListener("click", () => {
  const value = suggestionInput.value.trim();

  if (!value) {
    suggestionStatus.textContent =
      "Enter a strategy idea before submitting it to the admin review queue.";
    return;
  }

  suggestionStatus.textContent =
    `Submitted: "${value}" has been queued for administrator review.`;
  suggestionInput.value = "";
});

setReminderButton.addEventListener("click", () => {
  reminderStatus.textContent = "7:20 AM text reminder set";
  departureFlowState.textContent = "Reminder scheduled";
  departureTimeValue.textContent = "7:40 AM";
  setReminderButton.classList.add("is-complete");
  setHighlight(departureTimeNode);
});

commuteToWorkButton.addEventListener("click", () => {
  departureFlowState.textContent = "Commuting";
  commuteToWorkButton.classList.add("is-complete");
  setHighlight(departureTimeNode);
  arrivalFlowState.textContent = "Arrival expected";
  arrivalStatus.textContent =
    "Trip started. When the commute ends, submit feedback so the system can refine tomorrow’s plan.";
});

timeSlotButtons.forEach((button) => {
  button.addEventListener("click", () => {
    timeSlotButtons.forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
    selectedTimeSlot = button.dataset.timeSlot;
    staggerSelection.textContent = selectedTimeSlot;
    renderStaggerModule();
  });
});

createModeButton.addEventListener("click", () => setCarpoolMode("driver"));
joinModeButton.addEventListener("click", () => setCarpoolMode("rider"));

createCarpoolButton.addEventListener("click", () => {
  setCarpoolMode("driver");
  driverStatus.textContent = "Carpool created";
  pickupStatus.textContent = "Pickup points shared";
  contactStatus.textContent = "Driver phone ready to share";
  carpoolFlowState.textContent = "Waiting for rider requests";
  createCarpoolButton.classList.add("is-complete");
  setHighlight(nearbyCarpoolsNode);
});

requestJoinButton.addEventListener("click", () => {
  setCarpoolMode("rider");
  passengerStatus.textContent = "Join request sent";
  carpoolFlowState.textContent = "Passenger requested";
  requestJoinButton.classList.add("is-complete");
  setHighlight(nearbyCarpoolsNode);
});

acceptRequestButton.addEventListener("click", () => {
  setCarpoolMode("driver");
  driverStatus.textContent = "Accepted by driver";
  pickupStatus.textContent = "Pickup confirmed at 7:25 AM";
  contactStatus.textContent = "Numbers exchanged";
  carpoolFlowState.textContent = "Pickup coordinated";
  acceptRequestButton.classList.add("is-complete");
  setHighlight(contactNode);
  carpoolCommuteNode.classList.add("is-highlighted");
  arrivalFlowState.textContent = "Carpool in progress";
  arrivalStatus.textContent =
    "Carpool coordination is complete. After arrival, capture feedback to update the next plan.";
});

cancelCarpoolButton.addEventListener("click", () => {
  coverageStatus.textContent = "Cancellation reported";
  carpoolFlowState.textContent = "Coverage needed";
  cancelCarpoolButton.classList.add("is-complete");
  setHighlight(contactNode);
});

coverCancellationButton.addEventListener("click", () => {
  coverageStatus.textContent = "Backup rider / driver assigned";
  contactStatus.textContent = "Replacement contact shared";
  carpoolFlowState.textContent = "Coverage confirmed";
  coverCancellationButton.classList.add("is-complete");
  setHighlight(carpoolCommuteNode);
});

feedbackOptions.forEach((button) => {
  button.addEventListener("click", () => {
    feedbackOptions.forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
    selectedFeedback = button.dataset.feedback;
    setHighlight(feedbackNode);
  });
});

submitArrivalFeedback.addEventListener("click", () => {
  if (!selectedFeedback) {
    arrivalStatus.textContent =
      "Choose a feedback option before submitting arrival data.";
    return;
  }

  setHighlight(recordNode);

  let updateMessage = "The current departure timing remains in place for the next commute.";
  if (selectedFeedback === "Too Early") {
    updateMessage = "The next recommended departure has been shifted 10 minutes later.";
  }
  if (selectedFeedback === "Too Late") {
    updateMessage = "The next recommended departure has been shifted 10 minutes earlier.";
  }

  recordNode.classList.add("is-highlighted");
  updateNode.classList.add("is-highlighted");
  planNode.classList.add("is-highlighted");

  arrivalFlowState.textContent = "Plan updated";
  arrivalStatus.textContent = `${selectedFeedback} feedback recorded. ${updateMessage}`;
});

setCarpoolMode("driver");
renderWeekStatus();
