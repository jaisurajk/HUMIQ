const plannerRows = Array.from(document.querySelectorAll(".planner-row"));
const completionPercent = document.getElementById("completionPercent");
const alertBox = document.getElementById("alertBox");
const reviewWeekButton = document.getElementById("reviewWeekButton");
const suggestionInput = document.getElementById("strategySuggestion");
const suggestionStatus = document.getElementById("suggestionStatus");
const submitSuggestionButton = document.getElementById("submitSuggestionButton");

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

const selections = {};

function getScheduledCount() {
  return plannerRows.reduce((count, row) => {
    const day = row.dataset.day;
    return count + (selections[day] ? 1 : 0);
  }, 0);
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

  renderEnrollment();
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

renderWeekStatus();
