const socket = io();

// DOM
const joinSection = document.getElementById("join-section");
const joinForm = document.getElementById("join-form");
const nameInput = document.getElementById("name-input");

const playSection = document.getElementById("play-section");
const welcome = document.getElementById("welcome");
const guessForm = document.getElementById("guess-form");
const guessInput = document.getElementById("guess-input");
const formMsg = document.getElementById("form-msg");
const gameStatus = document.getElementById("game-status");

const boardSection = document.getElementById("board-section");
const board = document.getElementById("board");

const logSection = document.getElementById("log-section");
const log = document.getElementById("log");

const resetHintBtn = document.getElementById("reset-hint");

let myName = null;
let ended = false;

joinForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;

  socket.emit("join", name, (res) => {
    if (!res || !res.ok) return;

    myName = res.name;
    welcome.textContent = `${myName} 님, 환영합니다!`;
    joinSection.classList.add("hidden");
    playSection.classList.remove("hidden");
    boardSection.classList.remove("hidden");
    logSection.classList.remove("hidden");

    renderBoard(res.latestSubmissions || {});
    if (res.gameOver) {
      ended = true;
      gameStatus.textContent = "종료됨";
      disablePlay();
    } else {
      gameStatus.textContent = "진행 중";
      enablePlay();
    }
    addLog(`"${myName}" 이름으로 입장했습니다.`);
  });
});

guessForm.addEventListener("submit", (e) => {
  e.preventDefault();
  formMsg.textContent = "";
  if (ended) return;
  const val = guessInput.value.trim();
  socket.emit("submitGuess", val);
  guessInput.value = "";
  guessInput.focus();
});

socket.on("invalidGuess", (msg) => {
  formMsg.textContent = msg || "유효하지 않은 입력입니다.";
});

socket.on("boardUpdate", (latestSubmissions) => {
  renderBoard(latestSubmissions);
});

socket.on("systemMessage", (msg) => {
  addLog(msg);
});

socket.on("gameOver", ({ answer, winner }) => {
  ended = true;
  gameStatus.textContent = "종료됨";
  disablePlay();
  addLog(`게임 종료! 정답: ${answer}, 승자: ${winner}`);
});

socket.on("reset", (msg) => {
  ended = false;
  gameStatus.textContent = "진행 중";
  enablePlay();
  renderBoard({});
  addLog(msg || "새 게임이 시작되었습니다.");
});

resetHintBtn.addEventListener("click", () => {
  addLog("교사용: 주소창에 /reset 입력하면 새 게임이 시작됩니다.");
});

function renderBoard(latestSubmissions) {
  board.innerHTML = "";

  const arr = Object.values(latestSubmissions).sort((a, b) => b.timestamp - a.timestamp);
  for (const item of arr) {
    const div = document.createElement("div");
    div.className = "entry" + (item.isCorrect ? " correct" : "");
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = item.name;

    const guess = document.createElement("div");
    guess.className = "guess";
    guess.textContent = `제출: ${item.guess}`;

    const hint = document.createElement("div");
    hint.className = "hint";
    if (item.isCorrect) {
      hint.textContent = "정답!";
    } else {
      hint.innerHTML = item.hint === "UP"
        ? `<span class="up">힌트: UP (더 큰 수)</span>`
        : `<span class="down">힌트: DOWN (더 작은 수)</span>`;
    }

    div.appendChild(name);
    div.appendChild(guess);
    div.appendChild(hint);
    board.appendChild(div);
  }
}

function addLog(text) {
  const li = document.createElement("li");
  li.textContent = text;
  log.prepend(li);
}

function disablePlay() {
  guessInput.disabled = true;
  guessForm.querySelector("button").disabled = true;
}

function enablePlay() {
  guessInput.disabled = false;
  guessForm.querySelector("button").disabled = false;
  guessInput.focus();
}