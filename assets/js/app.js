if (window.lucide) {
  window.lucide.createIcons();
}

const LOGIN_KEY = "sutaClinicUser";
const LOGIN_PAGE = "../index.html";
const APPOINTMENT_KEY = "sutaClinicAppointments";
const QUEUE_KEY = "sutaClinicQueue";
const APPOINTMENT_RESET_KEY = "sutaClinicDataResetV2";
const NOW_SERVING_KEY = "sutaClinicNowServing";
let gamepadLoopStarted = false;
const gamepadButtonState = new Map();
const ARC_B1_BUTTON_INDEX = 1;
const ARC_B11_BUTTON_INDEX = 11;

const defaultAppointments = [];
const defaultQueue = [];
const samplePatients = [
  { haNumber: "HA-25001", fullName: "Narisa Boonmee", gender: "Female", dateOfBirth: "1992-03-14", phoneNumber: "081-234-5678", email: "narisa.boonmee@example.com", nationalId: "TH1234567890", appointmentDate: "2026-05-21", appointmentTime: "08:00 AM", testType: "CBC", notes: "Fatigue and dizziness for 2 days" },
  { haNumber: "HA-25002", fullName: "Somchai Prasert", gender: "Male", dateOfBirth: "1988-11-02", phoneNumber: "082-345-6789", email: "somchai.prasert@example.com", nationalId: "TH2345678901", appointmentDate: "2026-05-21", appointmentTime: "08:30 AM", testType: "FBS", notes: "Fasting blood sugar follow-up" },
  { haNumber: "HA-25003", fullName: "Pimchanok Saelim", gender: "Female", dateOfBirth: "1995-07-19", phoneNumber: "083-456-7890", email: "pimchanok.saelim@example.com", nationalId: "TH3456789012", appointmentDate: "2026-05-21", appointmentTime: "09:00 AM", testType: "Lipid Profile", notes: "Annual wellness laboratory check" },
  { haNumber: "HA-25004", fullName: "Anan Chaiyasit", gender: "Male", dateOfBirth: "1979-01-25", phoneNumber: "084-567-8901", email: "anan.chaiyasit@example.com", nationalId: "TH4567890123", appointmentDate: "2026-05-21", appointmentTime: "09:30 AM", testType: "Liver Function Test", notes: "Mild abdominal discomfort and physician referral" },
  { haNumber: "HA-25005", fullName: "Supansa Kittipong", gender: "Female", dateOfBirth: "2001-09-08", phoneNumber: "085-678-9012", email: "supansa.kittipong@example.com", nationalId: "TH5678901234", appointmentDate: "2026-05-21", appointmentTime: "10:00 AM", testType: "Thyroid Panel", notes: "Weight fluctuation and tiredness" },
  { haNumber: "HA-25006", fullName: "Thanawat Rojanaporn", gender: "Male", dateOfBirth: "1985-05-30", phoneNumber: "086-789-0123", email: "thanawat.rojanaporn@example.com", nationalId: "TH6789012345", appointmentDate: "2026-05-21", appointmentTime: "10:30 AM", testType: "Urinalysis", notes: "Routine urine screening" },
  { haNumber: "HA-25007", fullName: "Kanyarat Meesuk", gender: "Female", dateOfBirth: "1997-12-11", phoneNumber: "087-890-1234", email: "kanyarat.meesuk@example.com", nationalId: "TH7890123456", appointmentDate: "2026-05-21", appointmentTime: "11:00 AM", testType: "HbA1c", notes: "Diabetes monitoring review" },
  { haNumber: "HA-25008", fullName: "Peerawat Suksri", gender: "Male", dateOfBirth: "1990-04-21", phoneNumber: "088-901-2345", email: "peerawat.suksri@example.com", nationalId: "TH8901234567", appointmentDate: "2026-05-21", appointmentTime: "01:00 PM", testType: "CBC", notes: "Pre-employment medical exam" },
  { haNumber: "HA-25009", fullName: "Chutima Wattanakul", gender: "Female", dateOfBirth: "1983-08-16", phoneNumber: "089-012-3456", email: "chutima.wattanakul@example.com", nationalId: "TH9012345678", appointmentDate: "2026-05-21", appointmentTime: "01:30 PM", testType: "FBS", notes: "Follow-up after previous elevated glucose" },
  { haNumber: "HA-25010", fullName: "Phakorn Intarasuk", gender: "Male", dateOfBirth: "1999-06-05", phoneNumber: "080-123-4567", email: "phakorn.intarasuk@example.com", nationalId: "TH0123456789", appointmentDate: "2026-05-21", appointmentTime: "02:00 PM", testType: "Lipid Profile", notes: "Check cholesterol after diet program" }
];

function readCollection(key, fallback) {
  const raw = localStorage.getItem(key);

  if (!raw) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return [...fallback];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...fallback];
  } catch {
    return [...fallback];
  }
}

function writeCollection(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readObject(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeObject(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeArcButtonId(input) {
  if (typeof input === "string") {
    return input.trim().toUpperCase();
  }

  if (input && typeof input === "object") {
    if (typeof input.buttonId === "string") {
      return input.buttonId.trim().toUpperCase();
    }

    if (typeof input.button === "string") {
      return input.button.trim().toUpperCase();
    }
  }

  return "";
}

function resetDemoDataOnce() {
  if (localStorage.getItem(APPOINTMENT_RESET_KEY) === "done") {
    return;
  }

  writeCollection(APPOINTMENT_KEY, []);
  writeCollection(QUEUE_KEY, []);
  localStorage.removeItem(NOW_SERVING_KEY);
  localStorage.setItem(APPOINTMENT_RESET_KEY, "done");
}

function getStatusClass(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "in progress") {
    return "status-progress";
  }

  if (normalized === "being called") {
    return "status-calling";
  }

  if (normalized === "waiting") {
    return "status-waiting";
  }

  if (normalized === "completed") {
    return "status-completed";
  }

  if (normalized === "pending") {
    return "status-pending";
  }

  if (normalized === "hold") {
    return "status-pending";
  }

  if (normalized === "no show") {
    return "status-noshow";
  }

  return "status-pending";
}

function renderDashboardTables() {
  const queueBody = document.getElementById("dashboardQueueTableBody");
  const completedQueueBody = document.getElementById("dashboardCompletedQueueTableBody");
  const holdListBody = document.getElementById("dashboardHoldListBody");

  if (!queueBody && !completedQueueBody && !holdListBody) {
    return;
  }

  const queue = readCollection(QUEUE_KEY, defaultQueue);
  const nowServing = readObject(NOW_SERVING_KEY, null);
  const activeQueue = queue.filter((item) => !["Completed", "No Show"].includes(item.status));
  const completedQueue = queue.filter((item) => item.status === "Completed");
  const holdQueue = queue.filter((item) => item.status === "Hold");

  if (queueBody) {
    queueBody.innerHTML = activeQueue.length
      ? activeQueue.slice(0, 5).map((item) => `
      <tr>
        <td>${item.token}</td>
        <td>${item.haNumber} - ${item.fullName}</td>
        <td><span class="status-badge ${getStatusClass(item.status)}">${item.status}</span></td>
        <td>${item.estimatedWait}</td>
        <td>${item.counter}</td>
      </tr>
    `).join("")
      : `<tr><td colspan="5" class="empty-copy">No patients in queue yet.</td></tr>`;
  }

  if (completedQueueBody) {
    completedQueueBody.innerHTML = completedQueue.length
      ? completedQueue.slice(0, 5).map((item) => `
      <tr>
        <td>${item.token}</td>
        <td>${item.haNumber} - ${item.fullName}</td>
        <td><span class="status-badge ${getStatusClass(item.status)}">${item.status}</span></td>
        <td>${item.estimatedWait}</td>
        <td>${item.counter}</td>
      </tr>
    `).join("")
      : `<tr><td colspan="5" class="empty-copy">No completed patients yet.</td></tr>`;
  }

  if (holdListBody) {
    holdListBody.innerHTML = holdQueue.length
      ? holdQueue.slice(0, 5).map((item) => `
      <tr>
        <td>${item.token}</td>
        <td>${item.haNumber} - ${item.fullName}</td>
        <td><span class="status-badge ${getStatusClass(item.status)}">${item.status}</span></td>
      </tr>
    `).join("")
      : `<tr><td colspan="3" class="empty-copy">No patients on hold.</td></tr>`;
  }

  const appointmentCount = document.getElementById("dashboardAppointmentCount");
  const queueCount = document.getElementById("dashboardQueueCount");
  const completedCount = document.getElementById("dashboardCompletedCount");
  const holdCount = document.getElementById("dashboardHoldCount");
  const noShowCount = document.getElementById("dashboardNoShowCount");
  const queueSummaryTotal = document.getElementById("queueSummaryTotal");
  const holdListCount = document.getElementById("holdListCount");

  if (appointmentCount) {
    appointmentCount.textContent = String(readCollection(APPOINTMENT_KEY, defaultAppointments).length);
  }

  if (queueCount) {
    queueCount.textContent = String(activeQueue.length);
  }

  if (completedCount) {
    completedCount.textContent = String(completedQueue.length);
  }

  if (holdCount) {
    holdCount.textContent = String(holdQueue.length);
  }

  if (noShowCount) {
    noShowCount.textContent = String(queue.filter((item) => item.status === "No Show").length);
  }

  if (queueSummaryTotal) {
    queueSummaryTotal.textContent = String(activeQueue.length);
  }

  if (holdListCount) {
    holdListCount.textContent = `${holdQueue.length} patients on hold`;
  }

  const queueCountInProgress = document.getElementById("queueCountInProgress");
  const queueCountWaiting = document.getElementById("queueCountWaiting");
  const queueCountCompleted = document.getElementById("queueCountCompleted");
  const queueCountNoShow = document.getElementById("queueCountNoShow");
  const nowServingToken = document.getElementById("nowServingToken");
  const nowServingPatient = document.getElementById("nowServingPatient");
  const holdCurrentPatientButton = document.getElementById("holdCurrentPatientButton");
  const callNextPatientButton = document.getElementById("callNextPatientButton");
  const nextCallablePatient = activeQueue.find((item) => item.status === "Waiting" || item.status === "Pending" || item.status === "Hold");
  const completedQueueCount = document.getElementById("completedQueueCount");

  if (queueCountInProgress) {
    queueCountInProgress.textContent = String(queue.filter((item) => item.status === "Being Called").length);
  }

  if (queueCountWaiting) {
    queueCountWaiting.textContent = String(queue.filter((item) => item.status === "Waiting" || item.status === "Pending").length);
  }

  if (queueCountCompleted) {
    queueCountCompleted.textContent = String(queue.filter((item) => item.status === "Completed").length);
  }

  if (queueCountNoShow) {
    queueCountNoShow.textContent = String(queue.filter((item) => item.status === "No Show").length);
  }

  if (completedQueueCount) {
    completedQueueCount.textContent = `${completedQueue.length} completed`;
  }

  if (nowServingToken) {
    nowServingToken.textContent = nowServing?.token || "-";
  }

  if (nowServingPatient) {
    nowServingPatient.textContent = nowServing ? `${nowServing.haNumber} - ${nowServing.fullName}` : "Waiting for first patient call";
  }

  if (holdCurrentPatientButton) {
    holdCurrentPatientButton.disabled = !nowServing?.token;
  }

  if (callNextPatientButton) {
    callNextPatientButton.disabled = Boolean(nowServing?.token) || !nextCallablePatient;
  }
}

function renderQueueManagementTable() {
  const queueBody = document.getElementById("queueManagementTableBody");
  if (!queueBody) {
    return;
  }

  const queue = readCollection(QUEUE_KEY, defaultQueue);
  const activeQueue = queue.filter((item) => !["Completed", "No Show"].includes(item.status));
  queueBody.innerHTML = activeQueue.length
    ? activeQueue.map((item) => `
    <tr>
      <td>${item.token}</td>
      <td>${item.haNumber} - ${item.fullName}</td>
      <td><span class="status-badge ${getStatusClass(item.status)}">${item.status}</span></td>
      <td>${item.estimatedWait}</td>
      <td>${item.counter}</td>
      <td>${buildQueueActions(item)}</td>
    </tr>
  `).join("")
    : `<tr><td colspan="6" class="empty-copy">No queue records yet.</td></tr>`;

  const queueTableCount = document.getElementById("queueTableCount");
  if (queueTableCount) {
    queueTableCount.textContent = `${activeQueue.length} active tokens`;
  }
}

function parseTokenValue(token) {
  const value = String(token || "").trim().toUpperCase();
  const match = /^([A-Z])(\d{2})$/.exec(value);
  if (!match) {
    return -1;
  }

  const letterIndex = match[1].charCodeAt(0) - 65;
  const number = Number.parseInt(match[2], 10);
  return (letterIndex * 100) + number;
}

function formatTokenValue(value) {
  const normalized = ((value % 2600) + 2600) % 2600;
  const letterIndex = Math.floor(normalized / 100);
  const number = normalized % 100;
  return `${String.fromCharCode(65 + letterIndex)}${String(number).padStart(2, "0")}`;
}

function getNextToken(queue) {
  const tokenValues = queue
    .map((item) => parseTokenValue(item.token))
    .filter((value) => value >= 0);

  const nextValue = tokenValues.length ? Math.max(...tokenValues) + 1 : 0;
  return formatTokenValue(nextValue);
}

function tokenSequenceFrom(startNumber, count) {
  return Array.from({ length: count }, (_, index) => formatTokenValue(startNumber + index));
}

function buildQueueActions(item) {
  const canCall = item.status === "Waiting" || item.status === "Pending" || item.status === "Hold";
  const canComplete = item.status === "Being Called";

  return `
    <div class="queue-actions">
      <button class="queue-action-button call" type="button" data-queue-call="${item.token}" ${canCall ? "" : "disabled"}>Call</button>
      <button class="queue-action-button complete" type="button" data-queue-complete="${item.token}" ${canComplete ? "" : "disabled"}>Complete</button>
    </div>
  `;
}

function syncAppointmentStatus(queueItem, nextStatus) {
  const appointments = readCollection(APPOINTMENT_KEY, defaultAppointments);
  const updatedAppointments = appointments.map((appointment) => {
    if (appointment.haNumber === queueItem.haNumber && appointment.fullName === queueItem.fullName) {
      return { ...appointment, status: nextStatus };
    }

    return appointment;
  });

  writeCollection(APPOINTMENT_KEY, updatedAppointments);
}

function callQueuePatient(token) {
  const queue = readCollection(QUEUE_KEY, defaultQueue);
  const updatedQueue = queue.map((item) => {
    if (item.token === token && (item.status === "Waiting" || item.status === "Pending" || item.status === "Hold")) {
      return { ...item, status: "Being Called", estimatedWait: "Now", counter: "Counter 1" };
    }

    return item;
  });

  const selectedPatient = updatedQueue.find((item) => item.token === token);
  if (!selectedPatient) {
    return;
  }

  writeCollection(QUEUE_KEY, updatedQueue);
  writeObject(NOW_SERVING_KEY, {
    token: selectedPatient.token,
    haNumber: selectedPatient.haNumber,
    fullName: selectedPatient.fullName
  });
  syncAppointmentStatus(selectedPatient, "Being Called");
  renderDashboardTables();
  renderQueueManagementTable();
}

function completeQueuePatient(token) {
  const queue = readCollection(QUEUE_KEY, defaultQueue);
  const updatedQueue = queue.map((item) => {
    if (item.token === token && item.status === "Being Called") {
      return { ...item, status: "Completed", estimatedWait: "-", counter: "Completed" };
    }

    return item;
  });

  const selectedPatient = updatedQueue.find((item) => item.token === token);
  if (!selectedPatient) {
    return;
  }

  writeCollection(QUEUE_KEY, updatedQueue);
  syncAppointmentStatus(selectedPatient, "Completed");

  localStorage.removeItem(NOW_SERVING_KEY);
  renderDashboardTables();
  renderQueueManagementTable();
}

function holdQueuePatient(token) {
  const queue = readCollection(QUEUE_KEY, defaultQueue);
  const targetIndex = queue.findIndex((item) => item.token === token && item.status === "Being Called");
  if (targetIndex === -1) {
    return;
  }

  const reorderedQueue = [...queue];
  const [heldPatient] = reorderedQueue.splice(targetIndex, 1);
  const heldRecord = {
    ...heldPatient,
    status: "Hold",
    estimatedWait: "After 10 people",
    counter: "Hold Queue"
  };

  const activePatients = reorderedQueue.filter((item) => !["Completed", "No Show"].includes(item.status));
  const insertIndex = Math.min(reorderedQueue.length, activePatients.length >= 10 ? 10 : reorderedQueue.length);
  reorderedQueue.splice(insertIndex, 0, heldRecord);

  writeCollection(QUEUE_KEY, reorderedQueue);
  syncAppointmentStatus(heldRecord, "Waiting");

  localStorage.removeItem(NOW_SERVING_KEY);
  renderDashboardTables();
  renderQueueManagementTable();
}

function resetDashboardData() {
  writeCollection(APPOINTMENT_KEY, []);
  writeCollection(QUEUE_KEY, []);
  localStorage.removeItem(NOW_SERVING_KEY);
  renderDashboardTables();
  renderQueueManagementTable();
}

function triggerB1HoldFlow() {
  const nowServing = readObject(NOW_SERVING_KEY, null);
  if (nowServing?.token) {
    holdQueuePatient(nowServing.token);
  }
}

function triggerB11QueueFlow() {
  const nowServing = readObject(NOW_SERVING_KEY, null);
  if (nowServing?.token) {
    completeQueuePatient(nowServing.token);
    return;
  }

  const queue = readCollection(QUEUE_KEY, defaultQueue);
  const nextCallablePatient = queue.find((item) => item.status === "Waiting" || item.status === "Pending" || item.status === "Hold");
  if (nextCallablePatient?.token) {
    callQueuePatient(nextCallablePatient.token);
  }
}

function checkGamepadB1Input() {
  if (!navigator.getGamepads) {
    return;
  }

  const gamepads = navigator.getGamepads();
  for (const gamepad of gamepads) {
    if (!gamepad) {
      continue;
    }

    const button = gamepad.buttons?.[ARC_B1_BUTTON_INDEX];
    const isPressed = Boolean(button && button.pressed);
    const previousPressed = gamepadButtonState.get(`b1-${gamepad.index}`) || false;

    if (isPressed && !previousPressed) {
      triggerB1HoldFlow();
    }

    gamepadButtonState.set(`b1-${gamepad.index}`, isPressed);
  }
}

function checkGamepadB11Input() {
  if (!navigator.getGamepads) {
    return;
  }

  const gamepads = navigator.getGamepads();
  for (const gamepad of gamepads) {
    if (!gamepad) {
      continue;
    }

    const button = gamepad.buttons?.[ARC_B11_BUTTON_INDEX];
    const isPressed = Boolean(button && button.pressed);
    const previousPressed = gamepadButtonState.get(gamepad.index) || false;

    if (isPressed && !previousPressed) {
      triggerB11QueueFlow();
    }

    gamepadButtonState.set(gamepad.index, isPressed);
  }
}

function startGamepadPolling() {
  if (gamepadLoopStarted || !navigator.getGamepads) {
    return;
  }

  gamepadLoopStarted = true;

  const loop = () => {
    checkGamepadB1Input();
    checkGamepadB11Input();
    window.requestAnimationFrame(loop);
  };

  window.requestAnimationFrame(loop);
}

function setActiveNav() {
  const page = document.body.dataset.page;
  if (!page) {
    return;
  }

  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("is-active", link.dataset.nav === page);
  });
}

function applyUserName() {
  const savedUser = localStorage.getItem(LOGIN_KEY) || "Admin User";
  document.querySelectorAll("[data-user-name]").forEach((node) => {
    node.textContent = savedUser;
  });
}

function protectPrivatePages() {
  if (!document.body.dataset.requiresAuth) {
    return;
  }

  if (!localStorage.getItem(LOGIN_KEY)) {
    window.location.href = LOGIN_PAGE;
  }
}

function bindLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!username || !password) {
      return;
    }

    localStorage.setItem(LOGIN_KEY, username);
    window.location.href = "pages/dashboard.html";
  });
}

function bindSidebarToggle() {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");

  if (!sidebar || !sidebarToggle) {
    return;
  }

  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("is-open");
  });
}

function bindLogout() {
  document.querySelectorAll("[data-logout]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem(LOGIN_KEY);
      window.location.href = LOGIN_PAGE;
    });
  });
}

function bindSettingsForm() {
  const settingsForm = document.getElementById("settingsForm");
  if (!settingsForm) {
    return;
  }

  settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameInput = settingsForm.querySelector("#displayName");
    if (nameInput && nameInput.value.trim()) {
      localStorage.setItem(LOGIN_KEY, nameInput.value.trim());
      applyUserName();
    }
  });
}

function bindAppointmentForm() {
  const form = document.getElementById("appointmentBookingForm");
  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const appointments = readCollection(APPOINTMENT_KEY, defaultAppointments);
    const queue = readCollection(QUEUE_KEY, defaultQueue);

    const appointment = {
      haNumber: String(formData.get("haNumber") || "").trim(),
      fullName: String(formData.get("fullName") || "").trim(),
      time: String(formData.get("appointmentTime") || "").trim(),
      testType: String(formData.get("laboratoryTestType") || "").trim(),
      status: "Pending"
    };

    const queueItem = {
      token: getNextToken(queue),
      haNumber: appointment.haNumber,
      fullName: appointment.fullName,
      status: "Waiting",
      estimatedWait: "30 min",
      counter: "Counter 1"
    };

    appointments.unshift(appointment);
    queue.unshift(queueItem);

    writeCollection(APPOINTMENT_KEY, appointments);
    writeCollection(QUEUE_KEY, queue);

    form.reset();
    window.location.href = "dashboard.html";
  });
}

function bindSamplePatientsButton() {
  const button = document.getElementById("fillSamplePatientsButton");
  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    const sampleAppointments = samplePatients.map((patient) => ({
      haNumber: patient.haNumber,
      fullName: patient.fullName,
      time: patient.appointmentTime,
      testType: patient.testType,
      status: "Pending"
    }));

    const tokens = tokenSequenceFrom(0, samplePatients.length);
    const sampleQueue = samplePatients.map((patient, index) => ({
      token: tokens[index],
      haNumber: patient.haNumber,
      fullName: patient.fullName,
      status: "Waiting",
      estimatedWait: `${(index + 1) * 5} min`,
      counter: "Counter 1"
    }));

    writeCollection(APPOINTMENT_KEY, sampleAppointments);
    writeCollection(QUEUE_KEY, sampleQueue);
    localStorage.removeItem(NOW_SERVING_KEY);
    window.location.href = "dashboard.html";
  });
}

function bindQueueActions() {
  document.addEventListener("click", (event) => {
    const callButton = event.target.closest("[data-queue-call]");
    if (callButton) {
      callQueuePatient(callButton.dataset.queueCall);
      return;
    }

    const completeButton = event.target.closest("[data-queue-complete]");
    if (completeButton) {
      completeQueuePatient(completeButton.dataset.queueComplete);
    }
  });
}

function bindHeaderQueueControls() {
  const holdButton = document.getElementById("holdCurrentPatientButton");
  const callButton = document.getElementById("callNextPatientButton");
  const resetButton = document.getElementById("resetDashboardButton");

  if (holdButton) {
    holdButton.addEventListener("click", () => {
      const nowServing = readObject(NOW_SERVING_KEY, null);
      if (nowServing?.token) {
        holdQueuePatient(nowServing.token);
      }
    });
  }

  if (callButton) {
    callButton.addEventListener("click", () => {
      const nowServing = readObject(NOW_SERVING_KEY, null);
      if (nowServing?.token) {
        completeQueuePatient(nowServing.token);
        return;
      }

      const queue = readCollection(QUEUE_KEY, defaultQueue);
      const nextCallablePatient = queue.find((item) => item.status === "Waiting" || item.status === "Pending" || item.status === "Hold");
      if (nextCallablePatient?.token) {
        callQueuePatient(nextCallablePatient.token);
      }
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", resetDashboardData);
  }
}

function bindArcButtonListeners() {
  window.addEventListener("gamepadconnected", () => {
    startGamepadPolling();
  });

  window.addEventListener("gamepaddisconnected", (event) => {
    gamepadButtonState.delete(event.gamepad?.index);
  });

  window.addEventListener("message", (event) => {
    const payload = event.data;
    const buttonId = normalizeArcButtonId(payload);
    const messageType = payload && typeof payload === "object" ? String(payload.type || "").toLowerCase() : "";

    if (buttonId === "B1" && (!messageType || messageType === "arc-button")) {
      triggerB1HoldFlow();
    }

    if (buttonId === "B11" && (!messageType || messageType === "arc-button")) {
      triggerB11QueueFlow();
    }
  });

  window.addEventListener("arc-button", (event) => {
    const buttonId = normalizeArcButtonId(event.detail);
    if (buttonId === "B1") {
      triggerB1HoldFlow();
    }

    if (buttonId === "B11") {
      triggerB11QueueFlow();
    }
  });
}

protectPrivatePages();
resetDemoDataOnce();
setActiveNav();
applyUserName();
bindLoginForm();
bindSidebarToggle();
bindLogout();
bindSettingsForm();
bindAppointmentForm();
bindSamplePatientsButton();
bindQueueActions();
bindHeaderQueueControls();
bindArcButtonListeners();
startGamepadPolling();
renderDashboardTables();
renderQueueManagementTable();

window.handleArcButton = (buttonInput) => {
  const buttonId = normalizeArcButtonId(buttonInput);
  if (buttonId === "B1") {
    triggerB1HoldFlow();
    return;
  }

  if (buttonId === "B11") {
    triggerB11QueueFlow();
  }
};
