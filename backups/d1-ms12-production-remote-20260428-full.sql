PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(1,'0001_init.sql','2026-04-22 17:58:59');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(2,'0002_vault.sql','2026-04-22 17:58:59');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(3,'0001_initial_schema.sql','2026-04-22 23:47:15');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(4,'0003_add_course_details.sql','2026-04-22 23:47:15');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(5,'0003_make_profile_optional.sql','2026-04-22 23:47:16');
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  social_provider TEXT,
  social_id TEXT,
  profile_image_url TEXT,
  terms_agreed INTEGER NOT NULL DEFAULT 0,
  privacy_agreed INTEGER NOT NULL DEFAULT 0,
  marketing_agreed INTEGER NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
, deleted_at TEXT, deletion_reason TEXT);
INSERT INTO "users" ("id","email","name","password_hash","social_provider","social_id","profile_image_url","terms_agreed","privacy_agreed","marketing_agreed","role","created_at","updated_at","deleted_at","deletion_reason") VALUES(1,'pjongsk@daum.net','pjongsk','','kakao','4859950101',NULL,1,1,0,'student','2026-04-22 23:50:56','2026-04-27 23:46:22',NULL,NULL);
INSERT INTO "users" ("id","email","name","password_hash","social_provider","social_id","profile_image_url","terms_agreed","privacy_agreed","marketing_agreed","role","created_at","updated_at","deleted_at","deletion_reason") VALUES(2,'9535mind@gmail.com','박종석','','google','102762649311515470990','https://lh3.googleusercontent.com/a/ACg8ocK5Z_5yd1PbLh_L_KkULLmj4ZREcNG10HuiG6Idxsi3z77VmA=s96-c',0,0,0,'admin','2026-04-25 09:46:55','2026-04-27 23:17:12',NULL,NULL);
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(1,1,'2fa50451-54a1-45fd-b7dd-53d8988f2d07','2026-04-29 23:50:56');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(2,1,'f2a4e8dc-a4dc-43cc-9a2c-53c6952b17d3','2026-04-29 23:51:46');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(3,1,'861603ec-37d7-4ed5-b319-a09e21a6da3a','2026-04-29 23:52:00');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(4,1,'86c253f7-5275-4633-afcc-0a45582dec74','2026-04-29 23:52:40');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(5,1,'ca040a16-b48e-4c8a-b86b-2bc1e4fef3ae','2026-04-29 23:53:30');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(6,1,'0132d4eb-128c-49dd-afc6-6562283c7069','2026-04-29 23:58:54');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(7,1,'66f3054f-7024-48ff-bb11-bcf462913c93','2026-04-29 23:59:08');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(8,1,'383c63bd-e055-4fe0-a2c1-9f7d193f2e9b','2026-04-30 00:13:30');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(9,1,'7d64d56f-ec9e-44c6-ae44-2ced3151a990','2026-04-30 00:25:15');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(10,1,'d0c33b4c-17c6-46a1-b114-3ca25f094844','2026-04-30 00:25:27');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(11,1,'24a48d4e-cec1-400e-aec1-5778f29a4a00','2026-04-30 00:26:59');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(12,1,'3a3472e4-514b-4e00-96fe-c91af6b521ec','2026-04-30 00:27:04');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(13,1,'58040f50-3d50-430d-979b-608d575519e3','2026-04-30 00:28:04');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(14,1,'be1d63ea-311f-4f3a-ae2e-8fe681bb0c30','2026-04-30 00:28:25');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(15,1,'2af1c4b4-19d9-4dc8-8106-be4fefe7b7ab','2026-04-30 00:28:26');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(16,1,'e8a3daae-de78-4f5b-bed0-f02c4820b1bb','2026-04-30 00:30:04');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(17,1,'6a1a8395-ce17-4d43-9704-c326a991fab1','2026-04-30 00:30:06');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(18,1,'0a00001f-2861-4658-9b54-65cd7d632974','2026-04-30 00:30:14');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(19,1,'d9d5211d-161b-485d-ad3b-1d67bfb5ec4d','2026-04-30 00:30:31');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(20,1,'628844ae-8ffb-41b4-96ff-a0eb18755aee','2026-04-30 00:35:26');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(21,1,'001da46a-61cd-492d-99d9-a80d90072ed4','2026-04-30 00:37:17');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(22,1,'a1c5a1cc-f8e1-4925-b5ae-1a1ba8c9c241','2026-04-30 00:39:18');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(23,1,'94f65a71-9784-4c27-a749-a1a133dc678f','2026-04-30 00:39:19');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(24,1,'cc88bffb-7fe9-4a0f-bad7-a5382c928f48','2026-04-30 00:40:07');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(25,1,'2f678ffe-2b9f-4555-9511-8b8423407878','2026-04-30 00:50:48');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(26,1,'d4c5935c-75a0-4e7f-8e07-ad79b3ea01a0','2026-04-30 00:50:52');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(27,1,'66e63971-3a03-4685-bac5-2204715a9032','2026-04-30 00:52:24');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(28,1,'78fec349-2939-4c5e-86bd-c28aa05dbd58','2026-04-30 00:52:30');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(29,1,'06eb8db2-5ee8-4de0-be8a-4d616a97681a','2026-04-30 00:56:14');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(30,1,'472e9298-b421-42ab-aaf1-3f53d5acaa33','2026-04-30 01:04:34');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(31,1,'cee9bd41-594b-4c42-8aa7-8fa07f2805c0','2026-04-30 01:04:50');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(32,1,'4c4ac5e2-36b0-482a-99fb-9638f1f20f4e','2026-04-30 01:06:39');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(33,1,'f20f4071-c34b-443f-8477-b2bc1d61725c','2026-04-30 01:15:50');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(34,1,'fc8e3658-26e2-43f3-82e7-c9319c2c21f1','2026-04-30 01:20:36');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(35,1,'5f00327b-3e84-42c4-bd69-f34190847f0b','2026-04-30 01:20:42');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(36,1,'da4695d6-0215-46b3-bc6f-06221824062d','2026-04-30 01:20:52');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(37,1,'6e5e2d70-06d2-43c6-93f2-8234a27f19ec','2026-04-30 01:21:11');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(38,1,'5356823b-8678-4f72-ace2-cb90a592ec49','2026-04-30 01:21:31');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(39,1,'0556ffba-230f-4cec-b839-417bdf606201','2026-04-30 01:26:49');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(40,1,'70958ad5-3188-44fa-bb85-3ed796057601','2026-04-30 01:26:56');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(41,1,'dfcd95f8-eb7a-47d1-aace-0482a76ee796','2026-04-30 01:44:16');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(42,1,'edbaf6fd-1723-4730-8ede-ea93be11765d','2026-04-30 01:44:35');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(43,1,'0e8159ff-9d08-4cac-a276-b65da7376218','2026-04-30 01:44:44');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(44,1,'9bd31530-f024-406c-af75-c84fcc5f0a4d','2026-04-30 01:45:00');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(45,1,'eab5b5e6-6f00-4b04-913e-bed30e40fd98','2026-04-30 01:56:13');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(46,1,'e1fc8548-d6b0-43e9-a312-6df8bcd69156','2026-04-30 01:56:17');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(47,1,'d67ec622-a26f-4ec2-9c6b-b7de364f0296','2026-04-30 01:59:45');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(48,1,'86a3cb86-4a2a-4e22-af22-5f74a8ae537f','2026-04-30 02:02:23');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(49,1,'5932d3ae-ca05-467a-909a-59971f2df090','2026-04-30 02:02:26');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(50,1,'edab70a8-6acc-43dd-9466-ebe4406c11b0','2026-04-30 02:13:35');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(51,1,'9096dde3-fe8e-480a-bd59-9dae35fb6500','2026-04-30 02:13:48');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(52,1,'9204cf2c-6d0f-44c2-9a1d-0c82e1d6801d','2026-04-30 02:20:09');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(53,1,'47270965-5cb3-4d05-9d69-87d9748b1de6','2026-04-30 02:28:54');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(54,1,'a8459c22-894a-4b91-a2f6-792e92a0a4f4','2026-04-30 02:29:20');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(56,1,'e0941996-eebd-4c94-98e9-c9b6ef558801','2026-04-30 02:42:18');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(57,1,'bed50adc-dbdf-4547-a9cc-c93e100458f8','2026-04-30 02:44:20');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(58,1,'89eff049-c319-4d0b-8683-dfdf501f25ae','2026-04-30 09:32:35');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(59,1,'56e06f4e-03e4-4a86-8037-851072a82bb6','2026-05-01 07:40:59');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(60,1,'c38d91f5-5cb5-4621-aafa-c47a771d3ff9','2026-05-01 07:41:32');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(61,1,'41d0ffe8-a0fb-4a24-92b8-da251e49871b','2026-05-01 07:58:05');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(62,1,'c688a242-f943-42a7-8edf-26141fd90532','2026-05-01 07:58:43');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(63,1,'f634b982-2174-4870-90db-9c59c0c667e1','2026-05-01 09:06:25');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(64,1,'0884094b-a495-4eab-b809-8ec732a4786b','2026-05-01 09:20:49');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(65,1,'3b593833-505d-424e-9128-a5ea56206a0d','2026-05-01 09:36:44');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(66,1,'24c349ac-2d00-48d5-99ff-54ba6840fcc5','2026-05-01 11:48:53');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(67,1,'f9b508cc-b206-4026-9552-c51b246feb7f','2026-05-01 12:16:13');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(68,1,'2fedf6c8-b3ce-4924-ae3e-f8eaecd619de','2026-05-01 12:42:01');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(69,1,'713a6139-87d1-425d-91e3-0f9722bd9ee3','2026-05-01 12:47:14');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(70,1,'bd4afed3-32ba-469b-9677-c9d56c078943','2026-05-01 23:38:16');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(71,1,'2bc22c01-a147-4ab8-850f-3295127b0cb1','2026-05-01 23:43:08');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(72,2,'82bc5d0b-2aa4-4df9-9487-b24db0dd5624','2026-05-02 09:46:55');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(73,2,'dca2ef71-a1b1-45d5-ab09-aecd4343223a','2026-05-02 10:46:52');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(74,2,'5430a332-8476-453c-a26e-1bb0f2d0035d','2026-05-02 10:47:09');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(75,2,'32d49aba-326a-4183-aa75-8fe55726cc34','2026-05-02 10:48:12');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(76,2,'99ff84a4-cfb6-47ea-a1bc-4bb703bf4858','2026-05-02 10:48:35');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(77,2,'58f7b1af-b6bd-479d-8456-419e757d6cc7','2026-05-02 10:58:09');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(78,2,'29ddf70d-a8d9-452e-ada6-cfd65ffc3f14','2026-05-02 10:58:21');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(79,1,'61007ba7-e691-4099-a790-15d3c0116fbf','2026-05-02 11:02:17');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(80,1,'0c7fbad4-a691-4300-bfca-e9d4bfaa35f1','2026-05-02 11:16:13');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(81,2,'bed252fe-7262-4327-b6bf-d46d43755918','2026-05-02 11:16:51');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(82,2,'0afd171a-08e7-4a0c-a906-c3603effdfc3','2026-05-02 11:52:35');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(83,2,'ed80b2e1-eacf-4c00-8435-29c4f479ab2c','2026-05-02 11:56:14');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(84,2,'11ac5768-be95-4c5c-a9d4-910152296b19','2026-05-02 12:08:22');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(85,2,'5845643b-cc09-4567-b979-773927eb4cee','2026-05-02 12:19:58');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(86,2,'59f9e28e-c500-4711-9819-d0614f5e907d','2026-05-02 12:20:14');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(102,2,'d0ccc5ee-2d60-429a-8811-3f436873791c','2026-05-03 22:55:31');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(110,1,'e144b3b9-10b4-4f6e-81be-d19a8fe554fb','2026-05-03 23:22:20');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(122,2,'585e21f1-0563-4c4a-9e56-e33d0bfd1ca6','2026-05-04 01:34:24');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(151,1,'169573d0-fe81-4037-bc24-6e35073131d0','2026-05-04 04:53:47');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(158,1,'10980838-bfc6-420e-8054-2b8b2bb7c69b','2026-05-04 09:24:17');
INSERT INTO "sessions" ("id","user_id","session_token","expires_at") VALUES(170,1,'97aa36f1-edd5-4cf6-b7a7-46b8ff3fe9f2','2026-05-04 11:39:09');
CREATE TABLE ms12_meetings (
  id TEXT PRIMARY KEY NOT NULL,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  summary TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE ms12_vault_documents (
  id TEXT PRIMARY KEY NOT NULL,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id INTEGER,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, duration_days INTEGER DEFAULT 30, total_lessons INTEGER DEFAULT 0, total_hours REAL DEFAULT 0,
  FOREIGN KEY (instructor_id) REFERENCES users(id)
);
CREATE TABLE enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER DEFAULT 0,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',5);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('users',2);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('sessions',183);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_ms12_meetings_user ON ms12_meetings(user_id);
CREATE INDEX idx_ms12_vault_user ON ms12_vault_documents(user_id);
CREATE INDEX idx_ms12_vault_updated ON ms12_vault_documents(user_id, updated_at DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
