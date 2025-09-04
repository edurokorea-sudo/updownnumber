# 3자리 UP/DOWN 게임 (Render 배포용)

학생들은 이름(ID)을 입력하고 3자리 수(100~999)를 추측합니다. 메인 화면에 **누가 몇을 냈는지** 보이고, **정답자는 초록 하이라이트**, 오답자는 **UP/DOWN 힌트**가 뜹니다. 정답이 나오면 게임 종료.

## 기능
1. 이름으로 참여(이름=아이디, 중복 시 `#2`, `#3`… 자동 부여)
2. 서버가 무작위 3자리 수(100~999)를 생성(앞자리 0 허용 안 함)
3. 학생 제출 실시간 표시 (Socket.IO)
4. 정답자 CSS 하이라이트, 오답자에 UP/DOWN 힌트
5. 정답 나오면 게임 자동 종료
6. `/reset` 접속으로 새 게임 시작

## 로컬 실행
```bash
npm install
npm start
# http://localhost:3000
```

## GitHub 업로드
1. 이 폴더 전체를 GitHub 저장소에 커밋/푸시합니다.

## Render로 배포(두 가지 방법 중 택1)
### (A) 대시보드에서 새 Web Service
1. Render 로그인 → **New +** → **Web Service**.
2. GitHub 저장소 선택.
3. Build Command: `npm install`, Start Command: `npm start` (자동 감지됨)
4. 생성 후 배포 URL로 접속하여 사용.

### (B) Blueprint로 배포
1. 저장소 루트에 포함된 `render.yaml` 그대로 둡니다.
2. Render → **New +** → **Blueprint** → 해당 저장소 선택.
3. 생성 후 배포 URL로 접속.

> Render는 `PORT` 환경변수를 제공합니다. 서버는 이를 자동 사용하도록 작성되어 있습니다.

## 교사용
- 새 게임 시작: 배포된 도메인 뒤에 `/reset` 경로로 접속  
  예: `https://your-service.onrender.com/reset`

## 기타
- 다중 네트워크/외부 접속이 가능하도록 인터넷에 배포하는 구조입니다.
- Socket.IO는 같은 출처에서 로드되며, 필요 시 CORS 설정을 조정하세요.
