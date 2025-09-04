const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // Render 배포시 같은 출처로 접근하므로 문제 없지만, 프리뷰나 다른 도메인 접속 편의용
});

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

// --------- Game State ----------
let answer = makeAnswer();
let gameOver = false;
// latestSubmissions: { [name]: { name, guess, isCorrect, hint, timestamp } }
let latestSubmissions = {};
// 연결된 이름 집합(중복 방지)
const connectedNames = new Set();

function makeAnswer() {
  // 3자리 수(100~999) - 앞자리 0 허용 안 함
  const n = Math.floor(Math.random() * 900) + 100;
  console.log("[GAME] New answer:", n);
  return n;
}

function findWinnerName() {
  for (const k in latestSubmissions) {
    if (latestSubmissions[k].isCorrect) return k;
  }
  return null;
}

io.on("connection", (socket) => {
  socket.on("join", (rawName, ack) => {
    let name = String(rawName || "").trim();
    if (!name) name = "참가자";

    let assigned = name;
    let k = 2;
    while (connectedNames.has(assigned)) {
      assigned = `${name}#${k++}`;
    }
    connectedNames.add(assigned);
    socket.data.name = assigned;

    ack?.({
      ok: true,
      name: assigned,
      gameOver,
      latestSubmissions
    });

    io.emit("systemMessage", `${assigned} 님이 참여했습니다.`);
  });

  socket.on("submitGuess", (guess) => {
    const name = socket.data.name;
    if (!name) return;

    if (gameOver) {
      socket.emit("gameOver", {
        answer,
        winner: findWinnerName()
      });
      return;
    }

    const num = Number(guess);
    // 앞자리 0 금지: 100~999만 허용
    if (!Number.isInteger(num) || num < 100 || num > 999) {
      socket.emit("invalidGuess", "3자리 정수(100~999)를 입력하세요.");
      return;
    }

    const isCorrect = num === answer;
    const hint = isCorrect ? "" : (num < answer ? "UP" : "DOWN");

    latestSubmissions[name] = {
      name,
      guess: num,
      isCorrect,
      hint,
      timestamp: Date.now()
    };

    io.emit("boardUpdate", latestSubmissions);

    if (isCorrect) {
      gameOver = true;
      io.emit("gameOver", { answer, winner: name });
    }
  });

  socket.on("disconnect", () => {
    const name = socket.data.name;
    if (name) connectedNames.delete(name);
  });
});

// 교사용 리셋 엔드포인트
app.get("/reset", (req, res) => {
  answer = makeAnswer();
  gameOver = false;
  latestSubmissions = {};
  io.emit("reset", "새 게임이 시작되었습니다!");
  res.send("Game has been reset. 새로운 정답이 설정되었습니다.");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});