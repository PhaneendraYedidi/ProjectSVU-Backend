type Mode =
  | "practice"       // general practice (random)
  | "revise"         // weak areas revision
  | "topic"          // topic-wise practice
  | "year"           // year-wise questions
  | "mock"           // full mock test


To run the server with debugging (vscode debugging)
    "dev": "ts-node src/server.ts",
To run the server without debugging
    "dev": "nodemon --exec ts-node src/server.ts",


Next Steps:
1️⃣ Mock Test Engine (server evaluation)
2️⃣ Dashboard analytics (mixed data)
3️⃣ Subscription upgrade + enforcement
4️⃣ Adaptive difficulty
5️⃣ AI layer