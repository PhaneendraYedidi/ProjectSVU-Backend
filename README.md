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
