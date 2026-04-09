-- 챗봇 최우선 지식 베이스 + 관리자용 대화 로그
CREATE TABLE IF NOT EXISTS chatbot_knowledge (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_keyword TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_active ON chatbot_knowledge(is_active);

CREATE TABLE IF NOT EXISTS chatbot_conversation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  user_message TEXT NOT NULL,
  assistant_reply TEXT NOT NULL,
  source TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_chatbot_conv_created ON chatbot_conversation_logs(created_at);
