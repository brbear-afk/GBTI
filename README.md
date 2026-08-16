# 글BTI

사용자가 작성한 글을 다섯 개의 문체 축으로 분석해 32개 유형 중 하나로 보여주는 서비스입니다.

## 프로젝트 구조

```text
.
├─ frontend/    Next.js 프론트엔드 (독립 배포)
├─ backend/     NestJS 백엔드 (독립 배포)
├─ backend/src/question/bank/  배포용 문제은행 데이터
├─ Rubric.md    문체 평가 기준
└─ glBTI_MVP_planning.md
```

두 애플리케이션은 각각 자체 `package.json`과 환경변수 파일을 사용합니다. 배포할 때 해당 폴더를 프로젝트 루트로 지정합니다.

## 로컬 실행

```powershell
cd backend
npm install
Copy-Item .env.example .env
# .env의 TEST_TOKEN_SECRET을 32자 이상의 임의 문자열로 변경
# .env의 GEMINI_API_KEY에 Google AI Studio에서 발급한 키 입력
npm run start:dev
```

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Gemini 모델과 timeout은 백엔드의 `GEMINI_MODEL`, `GEMINI_TIMEOUT_MS`로 변경할 수 있습니다. API 키는 프론트엔드 환경변수에 넣지 않습니다.

분석 API는 IP당 5분에 4회로 제한되며, 초과하면 `429 Too Many Requests`와 `Retry-After` 헤더를 반환합니다. 로컬에서는 `TRUST_PROXY_HOPS=0`을 사용하고, 리버스 프록시 뒤에 배포할 때는 실제 프록시 홉 수로 설정해야 클라이언트 IP를 올바르게 구분할 수 있습니다.
