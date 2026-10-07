var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import httpStatus6 from "http-status";

// src/app/middleware/globalErrorHandler.ts
import httpStatus from "http-status";
import { ZodError } from "zod";

// src/generated/prisma/client.ts
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.10.0",
  "engineVersion": "0edf323efd1d98336f3f0a68684b56f689b900d3",
  "activeProvider": "postgresql",
  "inlineSchema": 'model AssessmentQuestion {\n  id           String @id @default(uuid())\n  assessmentId String\n  questionId   String\n  order        Int    @default(1)\n\n  assessment Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)\n  question   Question   @relation(fields: [questionId], references: [id], onDelete: Cascade)\n\n  @@unique([assessmentId, questionId])\n  @@map("assessment_questions")\n}\n\nmodel Assessment {\n  id              String           @id @default(uuid())\n  title           String\n  description     String?\n  durationMinutes Int // \u099F\u09BE\u0987\u09AE\u09A1 \u099F\u09C7\u09B8\u09CD\u099F (\u09AF\u09C7\u09AE\u09A8: \u09EC\u09E6 \u09AE\u09BF\u09A8\u09BF\u099F)\n  totalMarks      Int              @default(100)\n  passMarks       Int              @default(40)\n  status          AssessmentStatus @default(DRAFT)\n  recruiterId     String\n  isDeleted       Boolean          @default(false)\n  deletedAt       DateTime?\n  createdAt       DateTime         @default(now())\n  updatedAt       DateTime         @updatedAt\n\n  // Relationships\n  recruiter  User                  @relation("RecruiterAssessments", fields: [recruiterId], references: [id], onDelete: Cascade)\n  questions  AssessmentQuestion[]\n  candidates CandidateAssessment[]\n\n  @@index([recruiterId])\n  @@index([status])\n  @@map("assessments")\n}\n\nmodel AuditLog {\n  id        String   @id @default(uuid())\n  userId    String? // \u0995\u09C7 \u0985\u09CD\u09AF\u09BE\u0995\u09B6\u09A8\u099F\u09BF \u0995\u09B0\u09C7\u099B\u09C7\n  action    String // \u09AF\u09C7\u09AE\u09A8: "USER_ROLE_UPDATED", "ASSESSMENT_DELETED"\n  entity    String // \u09AF\u09C7\u09AE\u09A8: "User", "Assessment", "Payment"\n  entityId  String // \u09AF\u09C7 \u09B0\u09C7\u0995\u09B0\u09CD\u09A1\u09C7 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u09B9\u09DF\u09C7\u099B\u09C7 \u09A4\u09BE\u09B0 ID\n  details   Json? // \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8\u09C7\u09B0 \u0986\u0997\u09C7\u09B0 \u0993 \u09AA\u09B0\u09C7\u09B0 \u09A1\u09C7\u099F\u09BE\n  createdAt DateTime @default(now())\n\n  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)\n\n  @@index([entity, entityId])\n  @@map("audit_logs")\n}\n\nmodel CandidateAssessment {\n  id           String                    @id @default(uuid())\n  candidateId  String\n  assessmentId String\n  status       CandidateAssessmentStatus @default(INVITED)\n  startedAt    DateTime?\n  submittedAt  DateTime?\n  totalScore   Float?                    @default(0)\n  feedback     String? // Recruiter manual review feedback\n  createdAt    DateTime                  @default(now())\n  updatedAt    DateTime                  @updatedAt\n\n  // Relationships\n  candidate   User         @relation(fields: [candidateId], references: [id], onDelete: Cascade)\n  assessment  Assessment   @relation(fields: [assessmentId], references: [id], onDelete: Cascade)\n  submissions Submission[]\n\n  @@unique([candidateId, assessmentId]) // \u098F\u0995\u099C\u09A8 \u0995\u09CD\u09AF\u09BE\u09A8\u09CD\u09A1\u09BF\u09A1\u09C7\u099F \u098F\u0995\u099F\u09BF \u0985\u09CD\u09AF\u09BE\u09B8\u09C7\u09B8\u09AE\u09C7\u09A8\u09CD\u099F\u09C7 \u098F\u0995\u09AC\u09BE\u09B0\u0987 \u0985\u0982\u09B6 \u09A8\u09C7\u09AC\u09C7\n  @@index([candidateId])\n  @@index([assessmentId])\n  @@map("candidate_assessments")\n}\n\nenum UserRole {\n  ADMIN\n  RECRUITER\n  CANDIDATE\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  PENDING\n}\n\nenum AssessmentStatus {\n  DRAFT\n  PUBLISHED\n  ARCHIVED\n}\n\nenum CandidateAssessmentStatus {\n  INVITED\n  IN_PROGRESS\n  SUBMITTED\n  EXPIRED\n  EVALUATED\n}\n\nenum QuestionType {\n  MCQ\n  CODE_SNIPPET\n  WRITTEN\n}\n\nenum Difficulty {\n  EASY\n  MEDIUM\n  HARD\n}\n\nenum PaymentStatus {\n  PENDING\n  COMPLETED\n  FAILED\n  CANCELLED\n}\n\nmodel Payment {\n  id               String        @id @default(uuid())\n  userId           String // \u0995\u09CB\u09A8 Recruiter \u09AA\u09C7 \u0995\u09B0\u09B2\n  amount           Float\n  currency         String        @default("BDT")\n  paymentGateway   String        @default("bKash")\n  transactionId    String?       @unique // bKash trxID\n  paymentID        String?       @unique // bKash paymentID\n  status           PaymentStatus @default(PENDING)\n  creditsPurchased Int           @default(5) // \u0995\u09A4\u0997\u09C1\u09B2\u09CB \u0985\u09CD\u09AF\u09BE\u09B8\u09C7\u09B8\u09AE\u09C7\u09A8\u09CD\u099F \u0995\u09CD\u09B0\u09C7\u09A1\u09BF\u099F \u09AA\u09C7\u09B2\n  createdAt        DateTime      @default(now())\n  updatedAt        DateTime      @updatedAt\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@index([status])\n  @@map("payments")\n}\n\nmodel Question {\n  id            String       @id @default(uuid())\n  title         String\n  description   String // \u09AA\u09CD\u09B0\u09AC\u09B2\u09C7\u09AE \u09B8\u09CD\u099F\u09C7\u099F\u09AE\u09C7\u09A8\u09CD\u099F \u09AC\u09BE \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\n  type          QuestionType @default(MCQ)\n  difficulty    Difficulty   @default(MEDIUM)\n  options       Json? // MCQ \u098F\u09B0 \u0985\u09AA\u09B6\u09A8\u09B8\u09AE\u09C2\u09B9: ["A", "B", "C", "D"]\n  correctAnswer String? // MCQ \u098F\u09B0 \u09B8\u09A0\u09BF\u0995 \u0989\u09A4\u09CD\u09A4\u09B0 (\u0985\u099F\u09CB-\u0987\u09AD\u09CD\u09AF\u09BE\u09B2\u09C1\u09AF\u09BC\u09C7\u09B6\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF)\n  marks         Int          @default(10)\n  isDeleted     Boolean      @default(false)\n  deletedAt     DateTime?\n  createdAt     DateTime     @default(now())\n  updatedAt     DateTime     @updatedAt\n\n  // Relationships\n  assessmentLinks AssessmentQuestion[]\n  submissions     Submission[]\n\n  @@index([type, difficulty])\n  @@map("questions")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Submission {\n  id                    String   @id @default(uuid())\n  candidateAssessmentId String\n  questionId            String\n  answerText            String // \u0995\u09CB\u09A1 \u09AC\u09BE \u09B2\u09BF\u0996\u09BF\u09A4 \u0989\u09A4\u09CD\u09A4\u09B0 \u09AC\u09BE \u09B8\u09BF\u09B2\u09C7\u0995\u09CD\u099F\u09C7\u09A1 \u0985\u09AA\u09B6\u09A8\n  obtainedMarks         Float?   @default(0)\n  isEvaluated           Boolean  @default(false)\n  createdAt             DateTime @default(now())\n  updatedAt             DateTime @updatedAt\n\n  candidateAssessment CandidateAssessment @relation(fields: [candidateAssessmentId], references: [id], onDelete: Cascade)\n  question            Question            @relation(fields: [questionId], references: [id], onDelete: Cascade)\n\n  @@unique([candidateAssessmentId, questionId])\n  @@map("submissions")\n}\n\nmodel User {\n  id           String     @id @default(uuid())\n  email        String     @unique\n  password     String? // GCP Social Login \u098F\u09B0 \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09C7 password null \u09B9\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\n  name         String\n  role         UserRole   @default(CANDIDATE)\n  status       UserStatus @default(ACTIVE)\n  profileImage String?\n  credits      Int        @default(0) // Recruiter assessments \u09AA\u09BE\u09AC\u09B2\u09BF\u09B6 \u0995\u09B0\u09A4\u09C7 \u0995\u09CD\u09B0\u09C7\u09A1\u09BF\u099F \u0995\u09BF\u09A8\u09AC\u09C7\n  isDeleted    Boolean    @default(false)\n  deletedAt    DateTime?\n  createdAt    DateTime   @default(now())\n  updatedAt    DateTime   @updatedAt\n\n  // Relationships\n  recruiterAssessments Assessment[]          @relation("RecruiterAssessments")\n  candidateAttempts    CandidateAssessment[]\n  payments             Payment[]\n  auditLogs            AuditLog[]\n\n  @@index([email])\n  @@index([role, status])\n  @@map("users")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"AssessmentQuestion":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"assessmentId","kind":"scalar","type":"String"},{"name":"questionId","kind":"scalar","type":"String"},{"name":"order","kind":"scalar","type":"Int"},{"name":"assessment","kind":"object","type":"Assessment","relationName":"AssessmentToAssessmentQuestion"},{"name":"question","kind":"object","type":"Question","relationName":"AssessmentQuestionToQuestion"}],"dbName":"assessment_questions","schema":null},"Assessment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"durationMinutes","kind":"scalar","type":"Int"},{"name":"totalMarks","kind":"scalar","type":"Int"},{"name":"passMarks","kind":"scalar","type":"Int"},{"name":"status","kind":"enum","type":"AssessmentStatus"},{"name":"recruiterId","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"recruiter","kind":"object","type":"User","relationName":"RecruiterAssessments"},{"name":"questions","kind":"object","type":"AssessmentQuestion","relationName":"AssessmentToAssessmentQuestion"},{"name":"candidates","kind":"object","type":"CandidateAssessment","relationName":"AssessmentToCandidateAssessment"}],"dbName":"assessments","schema":null},"AuditLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"action","kind":"scalar","type":"String"},{"name":"entity","kind":"scalar","type":"String"},{"name":"entityId","kind":"scalar","type":"String"},{"name":"details","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"AuditLogToUser"}],"dbName":"audit_logs","schema":null},"CandidateAssessment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"candidateId","kind":"scalar","type":"String"},{"name":"assessmentId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"CandidateAssessmentStatus"},{"name":"startedAt","kind":"scalar","type":"DateTime"},{"name":"submittedAt","kind":"scalar","type":"DateTime"},{"name":"totalScore","kind":"scalar","type":"Float"},{"name":"feedback","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"candidate","kind":"object","type":"User","relationName":"CandidateAssessmentToUser"},{"name":"assessment","kind":"object","type":"Assessment","relationName":"AssessmentToCandidateAssessment"},{"name":"submissions","kind":"object","type":"Submission","relationName":"CandidateAssessmentToSubmission"}],"dbName":"candidate_assessments","schema":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"currency","kind":"scalar","type":"String"},{"name":"paymentGateway","kind":"scalar","type":"String"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"paymentID","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"creditsPurchased","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"PaymentToUser"}],"dbName":"payments","schema":null},"Question":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"QuestionType"},{"name":"difficulty","kind":"enum","type":"Difficulty"},{"name":"options","kind":"scalar","type":"Json"},{"name":"correctAnswer","kind":"scalar","type":"String"},{"name":"marks","kind":"scalar","type":"Int"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"assessmentLinks","kind":"object","type":"AssessmentQuestion","relationName":"AssessmentQuestionToQuestion"},{"name":"submissions","kind":"object","type":"Submission","relationName":"QuestionToSubmission"}],"dbName":"questions","schema":null},"Submission":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"candidateAssessmentId","kind":"scalar","type":"String"},{"name":"questionId","kind":"scalar","type":"String"},{"name":"answerText","kind":"scalar","type":"String"},{"name":"obtainedMarks","kind":"scalar","type":"Float"},{"name":"isEvaluated","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"candidateAssessment","kind":"object","type":"CandidateAssessment","relationName":"CandidateAssessmentToSubmission"},{"name":"question","kind":"object","type":"Question","relationName":"QuestionToSubmission"}],"dbName":"submissions","schema":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"profileImage","kind":"scalar","type":"String"},{"name":"credits","kind":"scalar","type":"Int"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"recruiterAssessments","kind":"object","type":"Assessment","relationName":"RecruiterAssessments"},{"name":"candidateAttempts","kind":"object","type":"CandidateAssessment","relationName":"CandidateAssessmentToUser"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToUser"},{"name":"auditLogs","kind":"object","type":"AuditLog","relationName":"AuditLogToUser"}],"dbName":"users","schema":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","recruiterAssessments","candidate","assessment","candidateAssessment","assessmentLinks","submissions","_count","question","candidateAttempts","user","payments","auditLogs","recruiter","questions","candidates","AssessmentQuestion.findUnique","AssessmentQuestion.findUniqueOrThrow","AssessmentQuestion.findFirst","AssessmentQuestion.findFirstOrThrow","AssessmentQuestion.findMany","data","AssessmentQuestion.createOne","AssessmentQuestion.createMany","AssessmentQuestion.createManyAndReturn","AssessmentQuestion.updateOne","AssessmentQuestion.updateMany","AssessmentQuestion.updateManyAndReturn","create","update","AssessmentQuestion.upsertOne","AssessmentQuestion.deleteOne","AssessmentQuestion.deleteMany","having","_avg","_sum","_min","_max","AssessmentQuestion.groupBy","AssessmentQuestion.aggregate","Assessment.findUnique","Assessment.findUniqueOrThrow","Assessment.findFirst","Assessment.findFirstOrThrow","Assessment.findMany","Assessment.createOne","Assessment.createMany","Assessment.createManyAndReturn","Assessment.updateOne","Assessment.updateMany","Assessment.updateManyAndReturn","Assessment.upsertOne","Assessment.deleteOne","Assessment.deleteMany","Assessment.groupBy","Assessment.aggregate","AuditLog.findUnique","AuditLog.findUniqueOrThrow","AuditLog.findFirst","AuditLog.findFirstOrThrow","AuditLog.findMany","AuditLog.createOne","AuditLog.createMany","AuditLog.createManyAndReturn","AuditLog.updateOne","AuditLog.updateMany","AuditLog.updateManyAndReturn","AuditLog.upsertOne","AuditLog.deleteOne","AuditLog.deleteMany","AuditLog.groupBy","AuditLog.aggregate","CandidateAssessment.findUnique","CandidateAssessment.findUniqueOrThrow","CandidateAssessment.findFirst","CandidateAssessment.findFirstOrThrow","CandidateAssessment.findMany","CandidateAssessment.createOne","CandidateAssessment.createMany","CandidateAssessment.createManyAndReturn","CandidateAssessment.updateOne","CandidateAssessment.updateMany","CandidateAssessment.updateManyAndReturn","CandidateAssessment.upsertOne","CandidateAssessment.deleteOne","CandidateAssessment.deleteMany","CandidateAssessment.groupBy","CandidateAssessment.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Question.findUnique","Question.findUniqueOrThrow","Question.findFirst","Question.findFirstOrThrow","Question.findMany","Question.createOne","Question.createMany","Question.createManyAndReturn","Question.updateOne","Question.updateMany","Question.updateManyAndReturn","Question.upsertOne","Question.deleteOne","Question.deleteMany","Question.groupBy","Question.aggregate","Submission.findUnique","Submission.findUniqueOrThrow","Submission.findFirst","Submission.findFirstOrThrow","Submission.findMany","Submission.createOne","Submission.createMany","Submission.createManyAndReturn","Submission.updateOne","Submission.updateMany","Submission.updateManyAndReturn","Submission.upsertOne","Submission.deleteOne","Submission.deleteMany","Submission.groupBy","Submission.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","AND","OR","NOT","id","email","password","name","UserRole","role","UserStatus","status","profileImage","credits","isDeleted","deletedAt","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","every","some","none","candidateAssessmentId","questionId","answerText","obtainedMarks","isEvaluated","title","description","QuestionType","type","Difficulty","difficulty","options","correctAnswer","marks","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","userId","amount","currency","paymentGateway","transactionId","paymentID","PaymentStatus","creditsPurchased","candidateId","assessmentId","CandidateAssessmentStatus","startedAt","submittedAt","totalScore","feedback","action","entity","entityId","details","durationMinutes","totalMarks","passMarks","AssessmentStatus","recruiterId","order","candidateAssessmentId_questionId","candidateId_assessmentId","assessmentId_questionId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "uARTgAEKBQAAsAIAIAoAALECACCaAQAArwIAMJsBAAAPABCcAQAArwIAMJ0BAQAAAAG6AQEA-wEAIdYBAQD7AQAh5QECAP4BACHoAQAAuwIAIAEAAAABACASDwAArgIAIBAAAJcCACARAACDAgAgmgEAALkCADCbAQAAAwAQnAEAALkCADCdAQEA-wEAIaQBAAC6AuQBIqcBIAD_AQAhqAFAAIACACGpAUAAgQIAIaoBQACBAgAhvgEBAPsBACG_AQEA-gEAIeABAgD-AQAh4QECAP4BACHiAQIA_gEAIeQBAQD7AQAhBQ8AAP8DACAQAADgAwAgEQAAtwMAIKgBAAC8AgAgvwEAALwCACASDwAArgIAIBAAAJcCACARAACDAgAgmgEAALkCADCbAQAAAwAQnAEAALkCADCdAQEAAAABpAEAALoC5AEipwEgAP8BACGoAUAAgAIAIakBQACBAgAhqgFAAIECACG-AQEA-wEAIb8BAQD6AQAh4AECAP4BACHhAQIA_gEAIeIBAgD-AQAh5AEBAPsBACEDAAAAAwAgAQAABAAwAgAABQAgEAQAAK4CACAFAACwAgAgCAAAmAIAIJoBAAC3AgAwmwEAAAcAEJwBAAC3AgAwnQEBAPsBACGkAQAAuALYASKpAUAAgQIAIaoBQACBAgAh1QEBAPsBACHWAQEA-wEAIdgBQACAAgAh2QFAAIACACHaAQgAtAIAIdsBAQD6AQAhBwQAAP8DACAFAACABAAgCAAA4QMAINgBAAC8AgAg2QEAALwCACDaAQAAvAIAINsBAAC8AgAgEQQAAK4CACAFAACwAgAgCAAAmAIAIJoBAAC3AgAwmwEAAAcAEJwBAAC3AgAwnQEBAAAAAaQBAAC4AtgBIqkBQACBAgAhqgFAAIECACHVAQEA-wEAIdYBAQD7AQAh2AFAAIACACHZAUAAgAIAIdoBCAC0AgAh2wEBAPoBACHnAQAAtgIAIAMAAAAHACABAAAIADACAAAJACANBgAAtQIAIAoAALECACCaAQAAswIAMJsBAAALABCcAQAAswIAMJ0BAQD7AQAhqQFAAIECACGqAUAAgQIAIbkBAQD7AQAhugEBAPsBACG7AQEA-wEAIbwBCAC0AgAhvQEgAP8BACEDBgAAggQAIAoAAIEEACC8AQAAvAIAIA4GAAC1AgAgCgAAsQIAIJoBAACzAgAwmwEAAAsAEJwBAACzAgAwnQEBAAAAAakBQACBAgAhqgFAAIECACG5AQEA-wEAIboBAQD7AQAhuwEBAPsBACG8AQgAtAIAIb0BIAD_AQAh5gEAALICACADAAAACwAgAQAADAAwAgAADQAgCQUAALACACAKAACxAgAgmgEAAK8CADCbAQAADwAQnAEAAK8CADCdAQEA-wEAIboBAQD7AQAh1gEBAPsBACHlAQIA_gEAIQIFAACABAAgCgAAgQQAIAMAAAAPACABAAAQADACAAABACADAAAACwAgAQAADAAwAgAADQAgAQAAAA8AIAEAAAALACABAAAACwAgDwwAAK4CACCaAQAAqwIAMJsBAAAWABCcAQAAqwIAMJ0BAQD7AQAhpAEAAK0C1AEiqQFAAIECACGqAUAAgQIAIc0BAQD7AQAhzgEIAKwCACHPAQEA-wEAIdABAQD7AQAh0QEBAPoBACHSAQEA-gEAIdQBAgD-AQAhAwwAAP8DACDRAQAAvAIAINIBAAC8AgAgDwwAAK4CACCaAQAAqwIAMJsBAAAWABCcAQAAqwIAMJ0BAQAAAAGkAQAArQLUASKpAUAAgQIAIaoBQACBAgAhzQEBAPsBACHOAQgArAIAIc8BAQD7AQAh0AEBAPsBACHRAQEAAAAB0gEBAAAAAdQBAgD-AQAhAwAAABYAIAEAABcAMAIAABgAIAsMAACqAgAgmgEAAKkCADCbAQAAGgAQnAEAAKkCADCdAQEA-wEAIakBQACBAgAhzQEBAPoBACHcAQEA-wEAId0BAQD7AQAh3gEBAPsBACHfAQAAlgIAIAMMAAD_AwAgzQEAALwCACDfAQAAvAIAIAsMAACqAgAgmgEAAKkCADCbAQAAGgAQnAEAAKkCADCdAQEAAAABqQFAAIECACHNAQEA-gEAIdwBAQD7AQAh3QEBAPsBACHeAQEA-wEAId8BAACWAgAgAwAAABoAIAEAABsAMAIAABwAIBMDAACCAgAgCwAAgwIAIA0AAIQCACAOAACFAgAgmgEAAPkBADCbAQAAHgAQnAEAAPkBADCdAQEA-wEAIZ4BAQD7AQAhnwEBAPoBACGgAQEA-wEAIaIBAAD8AaIBIqQBAAD9AaQBIqUBAQD6AQAhpgECAP4BACGnASAA_wEAIagBQACAAgAhqQFAAIECACGqAUAAgQIAIQEAAAAeACABAAAAAwAgAQAAAAcAIAEAAAAWACABAAAAGgAgAwAAAA8AIAEAABAAMAIAAAEAIAMAAAAHACABAAAIADACAAAJACABAAAADwAgAQAAAAcAIAEAAAABACADAAAADwAgAQAAEAAwAgAAAQAgAwAAAA8AIAEAABAAMAIAAAEAIAMAAAAPACABAAAQADACAAABACAGBQAA3QMAIAoAAK4DACCdAQEAAAABugEBAAAAAdYBAQAAAAHlAQIAAAABARcAACwAIASdAQEAAAABugEBAAAAAdYBAQAAAAHlAQIAAAABARcAAC4AMAEXAAAuADAGBQAA2wMAIAoAAKwDACCdAQEAwgIAIboBAQDCAgAh1gEBAMICACHlAQIAxgIAIQIAAAABACAXAAAxACAEnQEBAMICACG6AQEAwgIAIdYBAQDCAgAh5QECAMYCACECAAAADwAgFwAAMwAgAgAAAA8AIBcAADMAIAMAAAABACAeAAAsACAfAAAxACABAAAAAQAgAQAAAA8AIAUJAAD6AwAgJAAA-wMAICUAAP4DACAmAAD9AwAgJwAA_AMAIAeaAQAAqAIAMJsBAAA6ABCcAQAAqAIAMJ0BAQDfAQAhugEBAN8BACHWAQEA3wEAIeUBAgDjAQAhAwAAAA8AIAEAADkAMCMAADoAIAMAAAAPACABAAAQADACAAABACABAAAABQAgAQAAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIA8PAAD5AwAgEAAAsAMAIBEAALEDACCdAQEAAAABpAEAAADkAQKnASAAAAABqAFAAAAAAakBQAAAAAGqAUAAAAABvgEBAAAAAb8BAQAAAAHgAQIAAAAB4QECAAAAAeIBAgAAAAHkAQEAAAABARcAAEIAIAydAQEAAAABpAEAAADkAQKnASAAAAABqAFAAAAAAakBQAAAAAGqAUAAAAABvgEBAAAAAb8BAQAAAAHgAQIAAAAB4QECAAAAAeIBAgAAAAHkAQEAAAABARcAAEQAMAEXAABEADAPDwAA-AMAIBAAAJQDACARAACVAwAgnQEBAMICACGkAQAAkgPkASKnASAAxwIAIagBQADIAgAhqQFAAMkCACGqAUAAyQIAIb4BAQDCAgAhvwEBAMMCACHgAQIAxgIAIeEBAgDGAgAh4gECAMYCACHkAQEAwgIAIQIAAAAFACAXAABHACAMnQEBAMICACGkAQAAkgPkASKnASAAxwIAIagBQADIAgAhqQFAAMkCACGqAUAAyQIAIb4BAQDCAgAhvwEBAMMCACHgAQIAxgIAIeEBAgDGAgAh4gECAMYCACHkAQEAwgIAIQIAAAADACAXAABJACACAAAAAwAgFwAASQAgAwAAAAUAIB4AAEIAIB8AAEcAIAEAAAAFACABAAAAAwAgBwkAAPMDACAkAAD0AwAgJQAA9wMAICYAAPYDACAnAAD1AwAgqAEAALwCACC_AQAAvAIAIA-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_AQAhqAFAAIACACGpAUAAgQIAIaoBQACBAgAhvgEBAPsBACG_AQEA-wEAIcEBAACUAsEBIsMBAACVAsMBIsQBAACWAgAgxQEBAPoBACHGAQIA_gEAIQEAAACXAQAgAQAAAJcBACARBwAAlwIAIAgAAJgCACCaAQAAkwIAMJsBAACaAQAQnAEAAJMCADCdAQEA-wEAIacBIAD_AQAhqAFAAIACACGpAUAAgQIAIaoBQACBAgAhvgEBAPsBACG_AQEA-wEAIcEBAACUAsEBIsMBAACVAsMBIsQBAACWAgAgxQEBAPoBACHGAQIA_gEAIQUHAADgAwAgCAAA4QMAIKgBAAC8AgAgxAEAALwCACDFAQAAvAIAIAMAAACaAQAgAQAAmwEAMAIAAJcBACADAAAAmgEAIAEAAJsBADACAACXAQAgAwAAAJoBACABAACbAQAwAgAAlwEAIA4HAADeAwAgCAAA3wMAIJ0BAQAAAAGnASAAAAABqAFAAAAAAakBQAAAAAGqAUAAAAABvgEBAAAAAb8BAQAAAAHBAQAAAMEBAsMBAAAAwwECxAGAAAAAAcUBAQAAAAHGAQIAAAABARcAAJ8BACAMnQEBAAAAAacBIAAAAAGoAUAAAAABqQFAAAAAAaoBQAAAAAG-AQEAAAABvwEBAAAAAcEBAAAAwQECwwEAAADDAQLEAYAAAAABxQEBAAAAAcYBAgAAAAEBFwAAoQEAMAEXAAChAQAwDgcAAMgDACAIAADJAwAgnQEBAMICACGnASAAxwIAIagBQADIAgAhqQFAAMkCACGqAUAAyQIAIb4BAQDCAgAhvwEBAMICACHBAQAAxgPBASLDAQAAxwPDASLEAYAAAAABxQEBAMMCACHGAQIAxgIAIQIAAACXAQAgFwAApAEAIAydAQEAwgIAIacBIADHAgAhqAFAAMgCACGpAUAAyQIAIaoBQADJAgAhvgEBAMICACG_AQEAwgIAIcEBAADGA8EBIsMBAADHA8MBIsQBgAAAAAHFAQEAwwIAIcYBAgDGAgAhAgAAAJoBACAXAACmAQAgAgAAAJoBACAXAACmAQAgAwAAAJcBACAeAACfAQAgHwAApAEAIAEAAACXAQAgAQAAAJoBACAICQAAwQMAICQAAMIDACAlAADFAwAgJgAAxAMAICcAAMMDACCoAQAAvAIAIMQBAAC8AgAgxQEAALwCACAPmgEAAIoCADCbAQAArQEAEJwBAACKAgAwnQEBAN8BACGnASAA5AEAIagBQADlAQAhqQFAAOYBACGqAUAA5gEAIb4BAQDfAQAhvwEBAN8BACHBAQAAiwLBASLDAQAAjALDASLEAQAAjQIAIMUBAQDgAQAhxgECAOMBACEDAAAAmgEAIAEAAKwBADAjAACtAQAgAwAAAJoBACABAACbAQAwAgAAlwEAIAEAAAANACABAAAADQAgAwAAAAsAIAEAAAwAMAIAAA0AIAMAAAALACABAAAMADACAAANACADAAAACwAgAQAADAAwAgAADQAgCgYAAMADACAKAACEAwAgnQEBAAAAAakBQAAAAAGqAUAAAAABuQEBAAAAAboBAQAAAAG7AQEAAAABvAEIAAAAAb0BIAAAAAEBFwAAtQEAIAidAQEAAAABqQFAAAAAAaoBQAAAAAG5AQEAAAABugEBAAAAAbsBAQAAAAG8AQgAAAABvQEgAAAAAQEXAAC3AQAwARcAALcBADAKBgAAvwMAIAoAAIIDACCdAQEAwgIAIakBQADJAgAhqgFAAMkCACG5AQEAwgIAIboBAQDCAgAhuwEBAMICACG8AQgA8wIAIb0BIADHAgAhAgAAAA0AIBcAALoBACAInQEBAMICACGpAUAAyQIAIaoBQADJAgAhuQEBAMICACG6AQEAwgIAIbsBAQDCAgAhvAEIAPMCACG9ASAAxwIAIQIAAAALACAXAAC8AQAgAgAAAAsAIBcAALwBACADAAAADQAgHgAAtQEAIB8AALoBACABAAAADQAgAQAAAAsAIAYJAAC6AwAgJAAAuwMAICUAAL4DACAmAAC9AwAgJwAAvAMAILwBAAC8AgAgC5oBAACGAgAwmwEAAMMBABCcAQAAhgIAMJ0BAQDfAQAhqQFAAOYBACGqAUAA5gEAIbkBAQDfAQAhugEBAN8BACG7AQEA3wEAIbwBCACHAgAhvQEgAOQBACEDAAAACwAgAQAAwgEAMCMAAMMBACADAAAACwAgAQAADAAwAgAADQAgEwMAAIICACALAACDAgAgDQAAhAIAIA4AAIUCACCaAQAA-QEAMJsBAAAeABCcAQAA-QEAMJ0BAQAAAAGeAQEAAAABnwEBAPoBACGgAQEA-wEAIaIBAAD8AaIBIqQBAAD9AaQBIqUBAQD6AQAhpgECAP4BACGnASAA_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-wEAIZ8BAQD6AQAhoAEBAPsBACGiAQAA_AGiASKkAQAA_QGkASKlAQEA-gEAIaYBAgD-AQAhpwEgAP8BACGoAUAAgAIAIakBQACBAgAhqgFAAIECACELqwEBAAAAAawBAQAAAAWtAQEAAAAFrgEBAAAAAa8BAQAAAAGwAQEAAAABsQEBAAAAAbIBAQD2AQAhswEBAAAAAbQBAQAAAAG1AQEAAAABC6sBAQAAAAGsAQEAAAAErQEBAAAABK4BAQAAAAGvAQEAAAABsAEBAAAAAbEBAQAAAAGyAQEA-AEAIbMBAQAAAAG0AQEAAAABtQEBAAAAAQSrAQAAAKIBAqwBAAAAogEIrQEAAACiAQiyAQAA9AGiASIEqwEAAACkAQKsAQAAAKQBCK0BAAAApAEIsgEAAPIBpAEiCKsBAgAAAAGsAQIAAAAErQECAAAABK4BAgAAAAGvAQIAAAABsAECAAAAAbEBAgAAAAGyAQIA6AEAIQKrASAAAAABsgEgAO4BACEIqwFAAAAAAawBQAAAAAWtAUAAAAAFrgFAAAAAAa8BQAAAAAGwAUAAAAABsQFAAAAAAbIBQADsAQAhCKsBQAAAAAGsAUAAAAAErQFAAAAABK4BQAAAAAGvAUAAAAABsAFAAAAAAbEBQAAAAAGyAUAA6QEAIQO2AQAAAwAgtwEAAAMAILgBAAADACADtgEAAAcAILcBAAAHACC4AQAABwAgA7YBAAAWACC3AQAAFgAguAEAABYAIAO2AQAAGgAgtwEAABoAILgBAAAaACALmgEAAIYCADCbAQAAwwEAEJwBAACGAgAwnQEBAN8BACGpAUAA5gEAIaoBQADmAQAhuQEBAN8BACG6AQEA3wEAIbsBAQDfAQAhvAEIAIcCACG9ASAA5AEAIQ0JAADrAQAgJAAAiQIAICUAAIkCACAmAACJAgAgJwAAiQIAIKsBCAAAAAGsAQgAAAAFrQEIAAAABa4BCAAAAAGvAQgAAAABsAEIAAAAAbEBCAAAAAGyAQgAiAIAIQ0JAADrAQAgJAAAiQIAICUAAIkCACAmAACJAgAgJwAAiQIAIKsBCAAAAAGsAQgAAAAFrQEIAAAABa4BCAAAAAGvAQgAAAABsAEIAAAAAbEBCAAAAAGyAQgAiAIAIQirAQgAAAABrAEIAAAABa0BCAAAAAWuAQgAAAABrwEIAAAAAbABCAAAAAGxAQgAAAABsgEIAIkCACEPmgEAAIoCADCbAQAArQEAEJwBAACKAgAwnQEBAN8BACGnASAA5AEAIagBQADlAQAhqQFAAOYBACGqAUAA5gEAIb4BAQDfAQAhvwEBAN8BACHBAQAAiwLBASLDAQAAjALDASLEAQAAjQIAIMUBAQDgAQAhxgECAOMBACEHCQAA6AEAICYAAJICACAnAACSAgAgqwEAAADBAQKsAQAAAMEBCK0BAAAAwQEIsgEAAJECwQEiBwkAAOgBACAmAACQAgAgJwAAkAIAIKsBAAAAwwECrAEAAADDAQitAQAAAMMBCLIBAACPAsMBIg8JAADrAQAgJgAAjgIAICcAAI4CACCrAYAAAAABrgGAAAAAAa8BgAAAAAGwAYAAAAABsQGAAAAAAbIBgAAAAAHHAQEAAAAByAEBAAAAAckBAQAAAAHKAYAAAAABywGAAAAAAcwBgAAAAAEMqwGAAAAAAa4BgAAAAAGvAYAAAAABsAGAAAAAAbEBgAAAAAGyAYAAAAABxwEBAAAAAcgBAQAAAAHJAQEAAAABygGAAAAAAcsBgAAAAAHMAYAAAAABBwkAAOgBACAmAACQAgAgJwAAkAIAIKsBAAAAwwECrAEAAADDAQitAQAAAMMBCLIBAACPAsMBIgSrAQAAAMMBAqwBAAAAwwEIrQEAAADDAQiyAQAAkALDASIHCQAA6AEAICYAAJICACAnAACSAgAgqwEAAADBAQKsAQAAAMEBCK0BAAAAwQEIsgEAAJECwQEiBKsBAAAAwQECrAEAAADBAQitAQAAAMEBCLIBAACSAsEBIhEHAACXAgAgCAAAmAIAIJoBAACTAgAwmwEAAJoBABCcAQAAkwIAMJ0BAQD7AQAhpwEgAP8BACGoAUAAgAIAIakBQACBAgAhqgFAAIECACG-AQEA-wEAIb8BAQD7AQAhwQEAAJQCwQEiwwEAAJUCwwEixAEAAJYCACDFAQEA-gEAIcYBAgD-AQAhBKsBAAAAwQECrAEAAADBAQitAQAAAMEBCLIBAACSAsEBIgSrAQAAAMMBAqwBAAAAwwEIrQEAAADDAQiyAQAAkALDASIMqwGAAAAAAa4BgAAAAAGvAYAAAAABsAGAAAAAAbEBgAAAAAGyAYAAAAABxwEBAAAAAcgBAQAAAAHJAQEAAAABygGAAAAAAcsBgAAAAAHMAYAAAAABA7YBAAAPACC3AQAADwAguAEAAA8AIAO2AQAACwAgtwEAAAsAILgBAAALACAOmgEAAJkCADCbAQAAlAEAEJwBAACZAgAwnQEBAN8BACGkAQAAmwLUASKpAUAA5gEAIaoBQADmAQAhzQEBAN8BACHOAQgAmgIAIc8BAQDfAQAh0AEBAN8BACHRAQEA4AEAIdIBAQDgAQAh1AECAOMBACENCQAA6AEAICQAAPABACAlAADwAQAgJgAA8AEAICcAAPABACCrAQgAAAABrAEIAAAABK0BCAAAAASuAQgAAAABrwEIAAAAAbABCAAAAAGxAQgAAAABsgEIAJ4CACEHCQAA6AEAICYAAJ0CACAnAACdAgAgqwEAAADUAQKsAQAAANQBCK0BAAAA1AEIsgEAAJwC1AEiBwkAAOgBACAmAACdAgAgJwAAnQIAIKsBAAAA1AECrAEAAADUAQitAQAAANQBCLIBAACcAtQBIgSrAQAAANQBAqwBAAAA1AEIrQEAAADUAQiyAQAAnQLUASINCQAA6AEAICQAAPABACAlAADwAQAgJgAA8AEAICcAAPABACCrAQgAAAABrAEIAAAABK0BCAAAAASuAQgAAAABrwEIAAAAAbABCAAAAAGxAQgAAAABsgEIAJ4CACENmgEAAJ8CADCbAQAAfgAQnAEAAJ8CADCdAQEA3wEAIaQBAACgAtgBIqkBQADmAQAhqgFAAOYBACHVAQEA3wEAIdYBAQDfAQAh2AFAAOUBACHZAUAA5QEAIdoBCACHAgAh2wEBAOABACEHCQAA6AEAICYAAKICACAnAACiAgAgqwEAAADYAQKsAQAAANgBCK0BAAAA2AEIsgEAAKEC2AEiBwkAAOgBACAmAACiAgAgJwAAogIAIKsBAAAA2AECrAEAAADYAQitAQAAANgBCLIBAAChAtgBIgSrAQAAANgBAqwBAAAA2AEIrQEAAADYAQiyAQAAogLYASIKmgEAAKMCADCbAQAAaAAQnAEAAKMCADCdAQEA3wEAIakBQADmAQAhzQEBAOABACHcAQEA3wEAId0BAQDfAQAh3gEBAN8BACHfAQAAjQIAIA-aAQAApAIAMJsBAABQABCcAQAApAIAMJ0BAQDfAQAhpAEAAKUC5AEipwEgAOQBACGoAUAA5QEAIakBQADmAQAhqgFAAOYBACG-AQEA3wEAIb8BAQDgAQAh4AECAOMBACHhAQIA4wEAIeIBAgDjAQAh5AEBAN8BACEHCQAA6AEAICYAAKcCACAnAACnAgAgqwEAAADkAQKsAQAAAOQBCK0BAAAA5AEIsgEAAKYC5AEiBwkAAOgBACAmAACnAgAgJwAApwIAIKsBAAAA5AECrAEAAADkAQitAQAAAOQBCLIBAACmAuQBIgSrAQAAAOQBAqwBAAAA5AEIrQEAAADkAQiyAQAApwLkASIHmgEAAKgCADCbAQAAOgAQnAEAAKgCADCdAQEA3wEAIboBAQDfAQAh1gEBAN8BACHlAQIA4wEAIQsMAACqAgAgmgEAAKkCADCbAQAAGgAQnAEAAKkCADCdAQEA-wEAIakBQACBAgAhzQEBAPoBACHcAQEA-wEAId0BAQD7AQAh3gEBAPsBACHfAQAAlgIAIBUDAACCAgAgCwAAgwIAIA0AAIQCACAOAACFAgAgmgEAAPkBADCbAQAAHgAQnAEAAPkBADCdAQEA-wEAIZ4BAQD7AQAhnwEBAPoBACGgAQEA-wEAIaIBAAD8AaIBIqQBAAD9AaQBIqUBAQD6AQAhpgECAP4BACGnASAA_wEAIagBQACAAgAhqQFAAIECACGqAUAAgQIAIekBAAAeACDqAQAAHgAgDwwAAK4CACCaAQAAqwIAMJsBAAAWABCcAQAAqwIAMJ0BAQD7AQAhpAEAAK0C1AEiqQFAAIECACGqAUAAgQIAIc0BAQD7AQAhzgEIAKwCACHPAQEA-wEAIdABAQD7AQAh0QEBAPoBACHSAQEA-gEAIdQBAgD-AQAhCKsBCAAAAAGsAQgAAAAErQEIAAAABK4BCAAAAAGvAQgAAAABsAEIAAAAAbEBCAAAAAGyAQgA8AEAIQSrAQAAANQBAqwBAAAA1AEIrQEAAADUAQiyAQAAnQLUASIVAwAAggIAIAsAAIMCACANAACEAgAgDgAAhQIAIJoBAAD5AQAwmwEAAB4AEJwBAAD5AQAwnQEBAPsBACGeAQEA-wEAIZ8BAQD6AQAhoAEBAPsBACGiAQAA_AGiASKkAQAA_QGkASKlAQEA-gEAIaYBAgD-AQAhpwEgAP8BACGoAUAAgAIAIakBQACBAgAhqgFAAIECACHpAQAAHgAg6gEAAB4AIAkFAACwAgAgCgAAsQIAIJoBAACvAgAwmwEAAA8AEJwBAACvAgAwnQEBAPsBACG6AQEA-wEAIdYBAQD7AQAh5QECAP4BACEUDwAArgIAIBAAAJcCACARAACDAgAgmgEAALkCADCbAQAAAwAQnAEAALkCADCdAQEA-wEAIaQBAAC6AuQBIqcBIAD_AQAhqAFAAIACACGpAUAAgQIAIaoBQACBAgAhvgEBAPsBACG_AQEA-gEAIeABAgD-AQAh4QECAP4BACHiAQIA_gEAIeQBAQD7AQAh6QEAAAMAIOoBAAADACATBwAAlwIAIAgAAJgCACCaAQAAkwIAMJsBAACaAQAQnAEAAJMCADCdAQEA-wEAIacBIAD_AQAhqAFAAIACACGpAUAAgQIAIaoBQACBAgAhvgEBAPsBACG_AQEA-wEAIcEBAACUAsEBIsMBAACVAsMBIsQBAACWAgAgxQEBAPoBACHGAQIA_gEAIekBAACaAQAg6gEAAJoBACACuQEBAAAAAboBAQAAAAENBgAAtQIAIAoAALECACCaAQAAswIAMJsBAAALABCcAQAAswIAMJ0BAQD7AQAhqQFAAIECACGqAUAAgQIAIbkBAQD7AQAhugEBAPsBACG7AQEA-wEAIbwBCAC0AgAhvQEgAP8BACEIqwEIAAAAAawBCAAAAAWtAQgAAAAFrgEIAAAAAa8BCAAAAAGwAQgAAAABsQEIAAAAAbIBCACJAgAhEgQAAK4CACAFAACwAgAgCAAAmAIAIJoBAAC3AgAwmwEAAAcAEJwBAAC3AgAwnQEBAPsBACGkAQAAuALYASKpAUAAgQIAIaoBQACBAgAh1QEBAPsBACHWAQEA-wEAIdgBQACAAgAh2QFAAIACACHaAQgAtAIAIdsBAQD6AQAh6QEAAAcAIOoBAAAHACAC1QEBAAAAAdYBAQAAAAEQBAAArgIAIAUAALACACAIAACYAgAgmgEAALcCADCbAQAABwAQnAEAALcCADCdAQEA-wEAIaQBAAC4AtgBIqkBQACBAgAhqgFAAIECACHVAQEA-wEAIdYBAQD7AQAh2AFAAIACACHZAUAAgAIAIdoBCAC0AgAh2wEBAPoBACEEqwEAAADYAQKsAQAAANgBCK0BAAAA2AEIsgEAAKIC2AEiEg8AAK4CACAQAACXAgAgEQAAgwIAIJoBAAC5AgAwmwEAAAMAEJwBAAC5AgAwnQEBAPsBACGkAQAAugLkASKnASAA_wEAIagBQACAAgAhqQFAAIECACGqAUAAgQIAIb4BAQD7AQAhvwEBAPoBACHgAQIA_gEAIeEBAgD-AQAh4gECAP4BACHkAQEA-wEAIQSrAQAAAOQBAqwBAAAA5AEIrQEAAADkAQiyAQAApwLkASICugEBAAAAAdYBAQAAAAEAAAAAAAAB7gEBAAAAAQHuAQEAAAABAe4BAAAAogECAe4BAAAApAECBe4BAgAAAAH0AQIAAAAB9QECAAAAAfYBAgAAAAH3AQIAAAABAe4BIAAAAAEB7gFAAAAAAQHuAUAAAAABCx4AAIgDADAfAACNAwAw6wEAAIkDADDsAQAAigMAMO0BAACLAwAg7gEAAIwDADDvAQAAjAMAMPABAACMAwAw8QEAAIwDADDyAQAAjgMAMPMBAACPAwAwCx4AAOgCADAfAADtAgAw6wEAAOkCADDsAQAA6gIAMO0BAADrAgAg7gEAAOwCADDvAQAA7AIAMPABAADsAgAw8QEAAOwCADDyAQAA7gIAMPMBAADvAgAwCx4AANoCADAfAADfAgAw6wEAANsCADDsAQAA3AIAMO0BAADdAgAg7gEAAN4CADDvAQAA3gIAMPABAADeAgAw8QEAAN4CADDyAQAA4AIAMPMBAADhAgAwCx4AAM4CADAfAADTAgAw6wEAAM8CADDsAQAA0AIAMO0BAADRAgAg7gEAANICADDvAQAA0gIAMPABAADSAgAw8QEAANICADDyAQAA1AIAMPMBAADVAgAwBp0BAQAAAAGpAUAAAAAB3AEBAAAAAd0BAQAAAAHeAQEAAAAB3wGAAAAAAQIAAAAcACAeAADZAgAgAwAAABwAIB4AANkCACAfAADYAgAgARcAALgEADALDAAAqgIAIJoBAACpAgAwmwEAABoAEJwBAACpAgAwnQEBAAAAAakBQACBAgAhzQEBAPoBACHcAQEA-wEAId0BAQD7AQAh3gEBAPsBACHfAQAAlgIAIAIAAAAcACAXAADYAgAgAgAAANYCACAXAADXAgAgCpoBAADVAgAwmwEAANYCABCcAQAA1QIAMJ0BAQD7AQAhqQFAAIECACHNAQEA-gEAIdwBAQD7AQAh3QEBAPsBACHeAQEA-wEAId8BAACWAgAgCpoBAADVAgAwmwEAANYCABCcAQAA1QIAMJ0BAQD7AQAhqQFAAIECACHNAQEA-gEAIdwBAQD7AQAh3QEBAPsBACHeAQEA-wEAId8BAACWAgAgBp0BAQDCAgAhqQFAAMkCACHcAQEAwgIAId0BAQDCAgAh3gEBAMICACHfAYAAAAABBp0BAQDCAgAhqQFAAMkCACHcAQEAwgIAId0BAQDCAgAh3gEBAMICACHfAYAAAAABBp0BAQAAAAGpAUAAAAAB3AEBAAAAAd0BAQAAAAHeAQEAAAAB3wGAAAAAAQqdAQEAAAABpAEAAADUAQKpAUAAAAABqgFAAAAAAc4BCAAAAAHPAQEAAAAB0AEBAAAAAdEBAQAAAAHSAQEAAAAB1AECAAAAAQIAAAAYACAeAADnAgAgAwAAABgAIB4AAOcCACAfAADmAgAgARcAALcEADAPDAAArgIAIJoBAACrAgAwmwEAABYAEJwBAACrAgAwnQEBAAAAAaQBAACtAtQBIqkBQACBAgAhqgFAAIECACHNAQEA-wEAIc4BCACsAgAhzwEBAPsBACHQAQEA-wEAIdEBAQAAAAHSAQEAAAAB1AECAP4BACECAAAAGAAgFwAA5gIAIAIAAADiAgAgFwAA4wIAIA6aAQAA4QIAMJsBAADiAgAQnAEAAOECADCdAQEA-wEAIaQBAACtAtQBIqkBQACBAgAhqgFAAIECACHNAQEA-wEAIc4BCACsAgAhzwEBAPsBACHQAQEA-wEAIdEBAQD6AQAh0gEBAPoBACHUAQIA_gEAIQ6aAQAA4QIAMJsBAADiAgAQnAEAAOECADCdAQEA-wEAIaQBAACtAtQBIqkBQACBAgAhqgFAAIECACHNAQEA-wEAIc4BCACsAgAhzwEBAPsBACHQAQEA-wEAIdEBAQD6AQAh0gEBAPoBACHUAQIA_gEAIQqdAQEAwgIAIaQBAADlAtQBIqkBQADJAgAhqgFAAMkCACHOAQgA5AIAIc8BAQDCAgAh0AEBAMICACHRAQEAwwIAIdIBAQDDAgAh1AECAMYCACEF7gEIAAAAAfQBCAAAAAH1AQgAAAAB9gEIAAAAAfcBCAAAAAEB7gEAAADUAQIKnQEBAMICACGkAQAA5QLUASKpAUAAyQIAIaoBQADJAgAhzgEIAOQCACHPAQEAwgIAIdABAQDCAgAh0QEBAMMCACHSAQEAwwIAIdQBAgDGAgAhCp0BAQAAAAGkAQAAANQBAqkBQAAAAAGqAUAAAAABzgEIAAAAAc8BAQAAAAHQAQEAAAAB0QEBAAAAAdIBAQAAAAHUAQIAAAABCwUAAIYDACAIAACHAwAgnQEBAAAAAaQBAAAA2AECqQFAAAAAAaoBQAAAAAHWAQEAAAAB2AFAAAAAAdkBQAAAAAHaAQgAAAAB2wEBAAAAAQIAAAAJACAeAACFAwAgAwAAAAkAIB4AAIUDACAfAAD0AgAgARcAALYEADARBAAArgIAIAUAALACACAIAACYAgAgmgEAALcCADCbAQAABwAQnAEAALcCADCdAQEAAAABpAEAALgC2AEiqQFAAIECACGqAUAAgQIAIdUBAQD7AQAh1gEBAPsBACHYAUAAgAIAIdkBQACAAgAh2gEIALQCACHbAQEA-gEAIecBAAC2AgAgAgAAAAkAIBcAAPQCACACAAAA8AIAIBcAAPECACANmgEAAO8CADCbAQAA8AIAEJwBAADvAgAwnQEBAPsBACGkAQAAuALYASKpAUAAgQIAIaoBQACBAgAh1QEBAPsBACHWAQEA-wEAIdgBQACAAgAh2QFAAIACACHaAQgAtAIAIdsBAQD6AQAhDZoBAADvAgAwmwEAAPACABCcAQAA7wIAMJ0BAQD7AQAhpAEAALgC2AEiqQFAAIECACGqAUAAgQIAIdUBAQD7AQAh1gEBAPsBACHYAUAAgAIAIdkBQACAAgAh2gEIALQCACHbAQEA-gEAIQmdAQEAwgIAIaQBAADyAtgBIqkBQADJAgAhqgFAAMkCACHWAQEAwgIAIdgBQADIAgAh2QFAAMgCACHaAQgA8wIAIdsBAQDDAgAhAe4BAAAA2AECBe4BCAAAAAH0AQgAAAAB9QEIAAAAAfYBCAAAAAH3AQgAAAABCwUAAPUCACAIAAD2AgAgnQEBAMICACGkAQAA8gLYASKpAUAAyQIAIaoBQADJAgAh1gEBAMICACHYAUAAyAIAIdkBQADIAgAh2gEIAPMCACHbAQEAwwIAIQUeAACrBAAgHwAAtAQAIOsBAACsBAAg7AEAALMEACDxAQAABQAgCx4AAPcCADAfAAD8AgAw6wEAAPgCADDsAQAA-QIAMO0BAAD6AgAg7gEAAPsCADDvAQAA-wIAMPABAAD7AgAw8QEAAPsCADDyAQAA_QIAMPMBAAD-AgAwCAoAAIQDACCdAQEAAAABqQFAAAAAAaoBQAAAAAG6AQEAAAABuwEBAAAAAbwBCAAAAAG9ASAAAAABAgAAAA0AIB4AAIMDACADAAAADQAgHgAAgwMAIB8AAIEDACABFwAAsgQAMA4GAAC1AgAgCgAAsQIAIJoBAACzAgAwmwEAAAsAEJwBAACzAgAwnQEBAAAAAakBQACBAgAhqgFAAIECACG5AQEA-wEAIboBAQD7AQAhuwEBAPsBACG8AQgAtAIAIb0BIAD_AQAh5gEAALICACACAAAADQAgFwAAgQMAIAIAAAD_AgAgFwAAgAMAIAuaAQAA_gIAMJsBAAD_AgAQnAEAAP4CADCdAQEA-wEAIakBQACBAgAhqgFAAIECACG5AQEA-wEAIboBAQD7AQAhuwEBAPsBACG8AQgAtAIAIb0BIAD_AQAhC5oBAAD-AgAwmwEAAP8CABCcAQAA_gIAMJ0BAQD7AQAhqQFAAIECACGqAUAAgQIAIbkBAQD7AQAhugEBAPsBACG7AQEA-wEAIbwBCAC0AgAhvQEgAP8BACEHnQEBAMICACGpAUAAyQIAIaoBQADJAgAhugEBAMICACG7AQEAwgIAIbwBCADzAgAhvQEgAMcCACEICgAAggMAIJ0BAQDCAgAhqQFAAMkCACGqAUAAyQIAIboBAQDCAgAhuwEBAMICACG8AQgA8wIAIb0BIADHAgAhBR4AAK0EACAfAACwBAAg6wEAAK4EACDsAQAArwQAIPEBAACXAQAgCAoAAIQDACCdAQEAAAABqQFAAAAAAaoBQAAAAAG6AQEAAAABuwEBAAAAAbwBCAAAAAG9ASAAAAABAx4AAK0EACDrAQAArgQAIPEBAACXAQAgCwUAAIYDACAIAACHAwAgnQEBAAAAAaQBAAAA2AECqQFAAAAAAaoBQAAAAAHWAQEAAAAB2AFAAAAAAdkBQAAAAAHaAQgAAAAB2wEBAAAAAQMeAACrBAAg6wEAAKwEACDxAQAABQAgBB4AAPcCADDrAQAA-AIAMO0BAAD6AgAg8QEAAPsCADANEAAAsAMAIBEAALEDACCdAQEAAAABpAEAAADkAQKnASAAAAABqAFAAAAAAakBQAAAAAGqAUAAAAABvgEBAAAAAb8BAQAAAAHgAQIAAAAB4QECAAAAAeIBAgAAAAECAAAABQAgHgAArwMAIAMAAAAFACAeAACvAwAgHwAAkwMAIAEXAACqBAAwEg8AAK4CACAQAACXAgAgEQAAgwIAIJoBAAC5AgAwmwEAAAMAEJwBAAC5AgAwnQEBAAAAAaQBAAC6AuQBIqcBIAD_AQAhqAFAAIACACGpAUAAgQIAIaoBQACBAgAhvgEBAPsBACG_AQEA-gEAIeABAgD-AQAh4QECAP4BACHiAQIA_gEAIeQBAQD7AQAhAgAAAAUAIBcAAJMDACACAAAAkAMAIBcAAJEDACAPmgEAAI8DADCbAQAAkAMAEJwBAACPAwAwnQEBAPsBACGkAQAAugLkASKnASAA_wEAIagBQACAAgAhqQFAAIECACGqAUAAgQIAIb4BAQD7AQAhvwEBAPoBACHgAQIA_gEAIeEBAgD-AQAh4gECAP4BACHkAQEA-wEAIQ-aAQAAjwMAMJsBAACQAwAQnAEAAI8DADCdAQEA-wEAIaQBAAC6AuQBIqcBIAD_AQAhqAFAAIACACGpAUAAgQIAIaoBQACBAgAhvgEBAPsBACG_AQEA-gEAIeABAgD-AQAh4QECAP4BACHiAQIA_gEAIeQBAQD7AQAhC50BAQDCAgAhpAEAAJID5AEipwEgAMcCACGoAUAAyAIAIakBQADJAgAhqgFAAMkCACG-AQEAwgIAIb8BAQDDAgAh4AECAMYCACHhAQIAxgIAIeIBAgDGAgAhAe4BAAAA5AECDRAAAJQDACARAACVAwAgnQEBAMICACGkAQAAkgPkASKnASAAxwIAIagBQADIAgAhqQFAAMkCACGqAUAAyQIAIb4BAQDCAgAhvwEBAMMCACHgAQIAxgIAIeEBAgDGAgAh4gECAMYCACELHgAAoQMAMB8AAKYDADDrAQAAogMAMOwBAACjAwAw7QEAAKQDACDuAQAApQMAMO8BAAClAwAw8AEAAKUDADDxAQAApQMAMPIBAACnAwAw8wEAAKgDADALHgAAlgMAMB8AAJoDADDrAQAAlwMAMOwBAACYAwAw7QEAAJkDACDuAQAA7AIAMO8BAADsAgAw8AEAAOwCADDxAQAA7AIAMPIBAACbAwAw8wEAAO8CADALBAAAoAMAIAgAAIcDACCdAQEAAAABpAEAAADYAQKpAUAAAAABqgFAAAAAAdUBAQAAAAHYAUAAAAAB2QFAAAAAAdoBCAAAAAHbAQEAAAABAgAAAAkAIB4AAJ8DACADAAAACQAgHgAAnwMAIB8AAJ0DACABFwAAqQQAMAIAAAAJACAXAACdAwAgAgAAAPACACAXAACcAwAgCZ0BAQDCAgAhpAEAAPIC2AEiqQFAAMkCACGqAUAAyQIAIdUBAQDCAgAh2AFAAMgCACHZAUAAyAIAIdoBCADzAgAh2wEBAMMCACELBAAAngMAIAgAAPYCACCdAQEAwgIAIaQBAADyAtgBIqkBQADJAgAhqgFAAMkCACHVAQEAwgIAIdgBQADIAgAh2QFAAMgCACHaAQgA8wIAIdsBAQDDAgAhBR4AAKQEACAfAACnBAAg6wEAAKUEACDsAQAApgQAIPEBAADGAQAgCwQAAKADACAIAACHAwAgnQEBAAAAAaQBAAAA2AECqQFAAAAAAaoBQAAAAAHVAQEAAAAB2AFAAAAAAdkBQAAAAAHaAQgAAAAB2wEBAAAAAQMeAACkBAAg6wEAAKUEACDxAQAAxgEAIAQKAACuAwAgnQEBAAAAAboBAQAAAAHlAQIAAAABAgAAAAEAIB4AAK0DACADAAAAAQAgHgAArQMAIB8AAKsDACABFwAAowQAMAoFAACwAgAgCgAAsQIAIJoBAACvAgAwmwEAAA8AEJwBAACvAgAwnQEBAAAAAboBAQD7AQAh1gEBAPsBACHlAQIA_gEAIegBAAC7AgAgAgAAAAEAIBcAAKsDACACAAAAqQMAIBcAAKoDACAHmgEAAKgDADCbAQAAqQMAEJwBAACoAwAwnQEBAPsBACG6AQEA-wEAIdYBAQD7AQAh5QECAP4BACEHmgEAAKgDADCbAQAAqQMAEJwBAACoAwAwnQEBAPsBACG6AQEA-wEAIdYBAQD7AQAh5QECAP4BACEDnQEBAMICACG6AQEAwgIAIeUBAgDGAgAhBAoAAKwDACCdAQEAwgIAIboBAQDCAgAh5QECAMYCACEFHgAAngQAIB8AAKEEACDrAQAAnwQAIOwBAACgBAAg8QEAAJcBACAECgAArgMAIJ0BAQAAAAG6AQEAAAAB5QECAAAAAQMeAACeBAAg6wEAAJ8EACDxAQAAlwEAIA0QAACwAwAgEQAAsQMAIJ0BAQAAAAGkAQAAAOQBAqcBIAAAAAGoAUAAAAABqQFAAAAAAaoBQAAAAAG-AQEAAAABvwEBAAAAAeABAgAAAAHhAQIAAAAB4gECAAAAAQQeAAChAwAw6wEAAKIDADDtAQAApAMAIPEBAAClAwAwBB4AAJYDADDrAQAAlwMAMO0BAACZAwAg8QEAAOwCADAEHgAAiAMAMOsBAACJAwAw7QEAAIsDACDxAQAAjAMAMAQeAADoAgAw6wEAAOkCADDtAQAA6wIAIPEBAADsAgAwBB4AANoCADDrAQAA2wIAMO0BAADdAgAg8QEAAN4CADAEHgAAzgIAMOsBAADPAgAw7QEAANECACDxAQAA0gIAMAAAAAAAAAAAAAUeAACZBAAgHwAAnAQAIOsBAACaBAAg7AEAAJsEACDxAQAACQAgAx4AAJkEACDrAQAAmgQAIPEBAAAJACAAAAAAAAHuAQAAAMEBAgHuAQAAAMMBAgseAADTAwAwHwAA1wMAMOsBAADUAwAw7AEAANUDADDtAQAA1gMAIO4BAAClAwAw7wEAAKUDADDwAQAApQMAMPEBAAClAwAw8gEAANgDADDzAQAAqAMAMAseAADKAwAwHwAAzgMAMOsBAADLAwAw7AEAAMwDADDtAQAAzQMAIO4BAAD7AgAw7wEAAPsCADDwAQAA-wIAMPEBAAD7AgAw8gEAAM8DADDzAQAA_gIAMAgGAADAAwAgnQEBAAAAAakBQAAAAAGqAUAAAAABuQEBAAAAAbsBAQAAAAG8AQgAAAABvQEgAAAAAQIAAAANACAeAADSAwAgAwAAAA0AIB4AANIDACAfAADRAwAgARcAAJgEADACAAAADQAgFwAA0QMAIAIAAAD_AgAgFwAA0AMAIAedAQEAwgIAIakBQADJAgAhqgFAAMkCACG5AQEAwgIAIbsBAQDCAgAhvAEIAPMCACG9ASAAxwIAIQgGAAC_AwAgnQEBAMICACGpAUAAyQIAIaoBQADJAgAhuQEBAMICACG7AQEAwgIAIbwBCADzAgAhvQEgAMcCACEIBgAAwAMAIJ0BAQAAAAGpAUAAAAABqgFAAAAAAbkBAQAAAAG7AQEAAAABvAEIAAAAAb0BIAAAAAEEBQAA3QMAIJ0BAQAAAAHWAQEAAAAB5QECAAAAAQIAAAABACAeAADcAwAgAwAAAAEAIB4AANwDACAfAADaAwAgARcAAJcEADACAAAAAQAgFwAA2gMAIAIAAACpAwAgFwAA2QMAIAOdAQEAwgIAIdYBAQDCAgAh5QECAMYCACEEBQAA2wMAIJ0BAQDCAgAh1gEBAMICACHlAQIAxgIAIQUeAACSBAAgHwAAlQQAIOsBAACTBAAg7AEAAJQEACDxAQAABQAgBAUAAN0DACCdAQEAAAAB1gEBAAAAAeUBAgAAAAEDHgAAkgQAIOsBAACTBAAg8QEAAAUAIAQeAADTAwAw6wEAANQDADDtAQAA1gMAIPEBAAClAwAwBB4AAMoDADDrAQAAywMAMO0BAADNAwAg8QEAAPsCADAAAAAAAAAABR4AAI0EACAfAACQBAAg6wEAAI4EACDsAQAAjwQAIPEBAADGAQAgAx4AAI0EACDrAQAAjgQAIPEBAADGAQAgAAAAAAAAAAAHHgAAiAQAIB8AAIsEACDrAQAAiQQAIOwBAACKBAAg7wEAAB4AIPABAAAeACDxAQAAxgEAIAMeAACIBAAg6wEAAIkEACDxAQAAxgEAIAAAAAAABR4AAIMEACAfAACGBAAg6wEAAIQEACDsAQAAhQQAIPEBAADGAQAgAx4AAIMEACDrAQAAhAQAIPEBAADGAQAgAAAAAAAHAwAAtgMAIAsAALcDACANAAC4AwAgDgAAuQMAIJ8BAAC8AgAgpQEAALwCACCoAQAAvAIAIAUPAAD_AwAgEAAA4AMAIBEAALcDACCoAQAAvAIAIL8BAAC8AgAgBQcAAOADACAIAADhAwAgqAEAALwCACDEAQAAvAIAIMUBAAC8AgAgBwQAAP8DACAFAACABAAgCAAA4QMAINgBAAC8AgAg2QEAALwCACDaAQAAvAIAINsBAAC8AgAgDwsAALMDACANAAC0AwAgDgAAtQMAIJ0BAQAAAAGeAQEAAAABnwEBAAAAAaABAQAAAAGiAQAAAKIBAqQBAAAApAECpQEBAAAAAaYBAgAAAAGnASAAAAABqAFAAAAAAakBQAAAAAGqAUAAAAABAgAAAMYBACAeAACDBAAgAwAAAB4AIB4AAIMEACAfAACHBAAgEQAAAB4AIAsAAMsCACANAADMAgAgDgAAzQIAIBcAAIcEACCdAQEAwgIAIZ4BAQDCAgAhnwEBAMMCACGgAQEAwgIAIaIBAADEAqIBIqQBAADFAqQBIqUBAQDDAgAhpgECAMYCACGnASAAxwIAIagBQADIAgAhqQFAAMkCACGqAUAAyQIAIQ8LAADLAgAgDQAAzAIAIA4AAM0CACCdAQEAwgIAIZ4BAQDCAgAhnwEBAMMCACGgAQEAwgIAIaIBAADEAqIBIqQBAADFAqQBIqUBAQDDAgAhpgECAMYCACGnASAAxwIAIagBQADIAgAhqQFAAMkCACGqAUAAyQIAIQ8DAACyAwAgCwAAswMAIA0AALQDACCdAQEAAAABngEBAAAAAZ8BAQAAAAGgAQEAAAABogEAAACiAQKkAQAAAKQBAqUBAQAAAAGmAQIAAAABpwEgAAAAAagBQAAAAAGpAUAAAAABqgFAAAAAAQIAAADGAQAgHgAAiAQAIAMAAAAeACAeAACIBAAgHwAAjAQAIBEAAAAeACADAADKAgAgCwAAywIAIA0AAMwCACAXAACMBAAgnQEBAMICACGeAQEAwgIAIZ8BAQDDAgAhoAEBAMICACGiAQAAxAKiASKkAQAAxQKkASKlAQEAwwIAIaYBAgDGAgAhpwEgAMcCACGoAUAAyAIAIakBQADJAgAhqgFAAMkCACEPAwAAygIAIAsAAMsCACANAADMAgAgnQEBAMICACGeAQEAwgIAIZ8BAQDDAgAhoAEBAMICACGiAQAAxAKiASKkAQAAxQKkASKlAQEAwwIAIaYBAgDGAgAhpwEgAMcCACGoAUAAyAIAIakBQADJAgAhqgFAAMkCACEPAwAAsgMAIAsAALMDACAOAAC1AwAgnQEBAAAAAZ4BAQAAAAGfAQEAAAABoAEBAAAAAaIBAAAAogECpAEAAACkAQKlAQEAAAABpgECAAAAAacBIAAAAAGoAUAAAAABqQFAAAAAAaoBQAAAAAECAAAAxgEAIB4AAI0EACADAAAAHgAgHgAAjQQAIB8AAJEEACARAAAAHgAgAwAAygIAIAsAAMsCACAOAADNAgAgFwAAkQQAIJ0BAQDCAgAhngEBAMICACGfAQEAwwIAIaABAQDCAgAhogEAAMQCogEipAEAAMUCpAEipQEBAMMCACGmAQIAxgIAIacBIADHAgAhqAFAAMgCACGpAUAAyQIAIaoBQADJAgAhDwMAAMoCACALAADLAgAgDgAAzQIAIJ0BAQDCAgAhngEBAMICACGfAQEAwwIAIaABAQDCAgAhogEAAMQCogEipAEAAMUCpAEipQEBAMMCACGmAQIAxgIAIacBIADHAgAhqAFAAMgCACGpAUAAyQIAIaoBQADJAgAhDg8AAPkDACARAACxAwAgnQEBAAAAAaQBAAAA5AECpwEgAAAAAagBQAAAAAGpAUAAAAABqgFAAAAAAb4BAQAAAAG_AQEAAAAB4AECAAAAAeEBAgAAAAHiAQIAAAAB5AEBAAAAAQIAAAAFACAeAACSBAAgAwAAAAMAIB4AAJIEACAfAACWBAAgEAAAAAMAIA8AAPgDACARAACVAwAgFwAAlgQAIJ0BAQDCAgAhpAEAAJID5AEipwEgAMcCACGoAUAAyAIAIakBQADJAgAhqgFAAMkCACG-AQEAwgIAIb8BAQDDAgAh4AECAMYCACHhAQIAxgIAIeIBAgDGAgAh5AEBAMICACEODwAA-AMAIBEAAJUDACCdAQEAwgIAIaQBAACSA-QBIqcBIADHAgAhqAFAAMgCACGpAUAAyQIAIaoBQADJAgAhvgEBAMICACG_AQEAwwIAIeABAgDGAgAh4QECAMYCACHiAQIAxgIAIeQBAQDCAgAhA50BAQAAAAHWAQEAAAAB5QECAAAAAQedAQEAAAABqQFAAAAAAaoBQAAAAAG5AQEAAAABuwEBAAAAAbwBCAAAAAG9ASAAAAABDAQAAKADACAFAACGAwAgnQEBAAAAAaQBAAAA2AECqQFAAAAAAaoBQAAAAAHVAQEAAAAB1gEBAAAAAdgBQAAAAAHZAUAAAAAB2gEIAAAAAdsBAQAAAAECAAAACQAgHgAAmQQAIAMAAAAHACAeAACZBAAgHwAAnQQAIA4AAAAHACAEAACeAwAgBQAA9QIAIBcAAJ0EACCdAQEAwgIAIaQBAADyAtgBIqkBQADJAgAhqgFAAMkCACHVAQEAwgIAIdYBAQDCAgAh2AFAAMgCACHZAUAAyAIAIdoBCADzAgAh2wEBAMMCACEMBAAAngMAIAUAAPUCACCdAQEAwgIAIaQBAADyAtgBIqkBQADJAgAhqgFAAMkCACHVAQEAwgIAIdYBAQDCAgAh2AFAAMgCACHZAUAAyAIAIdoBCADzAgAh2wEBAMMCACENCAAA3wMAIJ0BAQAAAAGnASAAAAABqAFAAAAAAakBQAAAAAGqAUAAAAABvgEBAAAAAb8BAQAAAAHBAQAAAMEBAsMBAAAAwwECxAGAAAAAAcUBAQAAAAHGAQIAAAABAgAAAJcBACAeAACeBAAgAwAAAJoBACAeAACeBAAgHwAAogQAIA8AAACaAQAgCAAAyQMAIBcAAKIEACCdAQEAwgIAIacBIADHAgAhqAFAAMgCACGpAUAAyQIAIaoBQADJAgAhvgEBAMICACG_AQEAwgIAIcEBAADGA8EBIsMBAADHA8MBIsQBgAAAAAHFAQEAwwIAIcYBAgDGAgAhDQgAAMkDACCdAQEAwgIAIacBIADHAgAhqAFAAMgCACGpAUAAyQIAIaoBQADJAgAhvgEBAMICACG_AQEAwgIAIcEBAADGA8EBIsMBAADHA8MBIsQBgAAAAAHFAQEAwwIAIcYBAgDGAgAhA50BAQAAAAG6AQEAAAAB5QECAAAAAQ8DAACyAwAgDQAAtAMAIA4AALUDACCdAQEAAAABngEBAAAAAZ8BAQAAAAGgAQEAAAABogEAAACiAQKkAQAAAKQBAqUBAQAAAAGmAQIAAAABpwEgAAAAAagBQAAAAAGpAUAAAAABqgFAAAAAAQIAAADGAQAgHgAApAQAIAMAAAAeACAeAACkBAAgHwAAqAQAIBEAAAAeACADAADKAgAgDQAAzAIAIA4AAM0CACAXAACoBAAgnQEBAMICACGeAQEAwgIAIZ8BAQDDAgAhoAEBAMICACGiAQAAxAKiASKkAQAAxQKkASKlAQEAwwIAIaYBAgDGAgAhpwEgAMcCACGoAUAAyAIAIakBQADJAgAhqgFAAMkCACEPAwAAygIAIA0AAMwCACAOAADNAgAgnQEBAMICACGeAQEAwgIAIZ8BAQDDAgAhoAEBAMICACGiAQAAxAKiASKkAQAAxQKkASKlAQEAwwIAIaYBAgDGAgAhpwEgAMcCACGoAUAAyAIAIakBQADJAgAhqgFAAMkCACEJnQEBAAAAAaQBAAAA2AECqQFAAAAAAaoBQAAAAAHVAQEAAAAB2AFAAAAAAdkBQAAAAAHaAQgAAAAB2wEBAAAAAQudAQEAAAABpAEAAADkAQKnASAAAAABqAFAAAAAAakBQAAAAAGqAUAAAAABvgEBAAAAAb8BAQAAAAHgAQIAAAAB4QECAAAAAeIBAgAAAAEODwAA-QMAIBAAALADACCdAQEAAAABpAEAAADkAQKnASAAAAABqAFAAAAAAakBQAAAAAGqAUAAAAABvgEBAAAAAb8BAQAAAAHgAQIAAAAB4QECAAAAAeIBAgAAAAHkAQEAAAABAgAAAAUAIB4AAKsEACANBwAA3gMAIJ0BAQAAAAGnASAAAAABqAFAAAAAAakBQAAAAAGqAUAAAAABvgEBAAAAAb8BAQAAAAHBAQAAAMEBAsMBAAAAwwECxAGAAAAAAcUBAQAAAAHGAQIAAAABAgAAAJcBACAeAACtBAAgAwAAAJoBACAeAACtBAAgHwAAsQQAIA8AAACaAQAgBwAAyAMAIBcAALEEACCdAQEAwgIAIacBIADHAgAhqAFAAMgCACGpAUAAyQIAIaoBQADJAgAhvgEBAMICACG_AQEAwgIAIcEBAADGA8EBIsMBAADHA8MBIsQBgAAAAAHFAQEAwwIAIcYBAgDGAgAhDQcAAMgDACCdAQEAwgIAIacBIADHAgAhqAFAAMgCACGpAUAAyQIAIaoBQADJAgAhvgEBAMICACG_AQEAwgIAIcEBAADGA8EBIsMBAADHA8MBIsQBgAAAAAHFAQEAwwIAIcYBAgDGAgAhB50BAQAAAAGpAUAAAAABqgFAAAAAAboBAQAAAAG7AQEAAAABvAEIAAAAAb0BIAAAAAEDAAAAAwAgHgAAqwQAIB8AALUEACAQAAAAAwAgDwAA-AMAIBAAAJQDACAXAAC1BAAgnQEBAMICACGkAQAAkgPkASKnASAAxwIAIagBQADIAgAhqQFAAMkCACGqAUAAyQIAIb4BAQDCAgAhvwEBAMMCACHgAQIAxgIAIeEBAgDGAgAh4gECAMYCACHkAQEAwgIAIQ4PAAD4AwAgEAAAlAMAIJ0BAQDCAgAhpAEAAJID5AEipwEgAMcCACGoAUAAyAIAIakBQADJAgAhqgFAAMkCACG-AQEAwgIAIb8BAQDDAgAh4AECAMYCACHhAQIAxgIAIeIBAgDGAgAh5AEBAMICACEJnQEBAAAAAaQBAAAA2AECqQFAAAAAAaoBQAAAAAHWAQEAAAAB2AFAAAAAAdkBQAAAAAHaAQgAAAAB2wEBAAAAAQqdAQEAAAABpAEAAADUAQKpAUAAAAABqgFAAAAAAc4BCAAAAAHPAQEAAAAB0AEBAAAAAdEBAQAAAAHSAQEAAAAB1AECAAAAAQadAQEAAAABqQFAAAAAAdwBAQAAAAHdAQEAAAAB3gEBAAAAAd8BgAAAAAECBQACCgAGBAkADA8AAxAkARElBAUDBgIJAAsLCgQNGQkOHQoEBAADBQACCA4FCQAIAgYABAoABgMHEQEIEgUJAAcCBxMACBQAAQgVAAEMAAMBDB8DBAMgAAshAA0iAA4jAAIQJgARJwAAAgUAAgoABgIFAAIKAAYFCQARJAASJQATJgAUJwAVAAAAAAAFCQARJAASJQATJgAUJwAVAQ8AAwEPAAMFCQAaJAAbJQAcJgAdJwAeAAAAAAAFCQAaJAAbJQAcJgAdJwAeAQxdAwEMYwMDCQAjJgAkJwAlAAAAAwkAIyYAJCcAJQIEAAMFAAICBAADBQACBQkAKiQAKyUALCYALScALgAAAAAABQkAKiQAKyUALCYALScALgEMAAMBDAADBQkAMyQANCUANSYANicANwAAAAAABQkAMyQANCUANSYANicANwAABQkAPCQAPSUAPiYAPycAQAAAAAAABQkAPCQAPSUAPiYAPycAQAIGAAQKAAYCBgAECgAGBQkARSQARiUARyYASCcASQAAAAAABQkARSQARiUARyYASCcASQAABQkATiQATyUAUCYAUScAUgAAAAAABQkATiQATyUAUCYAUScAUhICARMoARQpARUqARYrARgtARkvDRowDhsyARw0DR01DyA2ASE3ASI4DSg7ECk8Fio9Ais-Aiw_Ai1AAi5BAi9DAjBFDTFGFzJIAjNKDTRLGDVMAjZNAjdODThRGTlSHzpTCjtUCjxVCj1WCj5XCj9ZCkBbDUFcIEJfCkNhDURiIUVkCkZlCkdmDUhpIklqJkprBEtsBExtBE1uBE5vBE9xBFBzDVF0J1J2BFN4DVR5KFV6BFZ7BFd8DVh_KVmAAS9agQEJW4IBCVyDAQldhAEJXoUBCV-HAQlgiQENYYoBMGKMAQljjgENZI8BMWWQAQlmkQEJZ5IBDWiVATJplgE4apgBBmuZAQZsnAEGbZ0BBm6eAQZvoAEGcKIBDXGjATlypQEGc6cBDXSoATp1qQEGdqoBBnerAQ14rgE7ea8BQXqwAQV7sQEFfLIBBX2zAQV-tAEFf7YBBYABuAENgQG5AUKCAbsBBYMBvQENhAG-AUOFAb8BBYYBwAEFhwHBAQ2IAcQBRIkBxQFKigHHAQOLAcgBA4wBygEDjQHLAQOOAcwBA48BzgEDkAHQAQ2RAdEBS5IB0wEDkwHVAQ2UAdYBTJUB1wEDlgHYAQOXAdkBDZgB3AFNmQHdAVM"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("node:buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AnyNull: () => AnyNull2,
  AssessmentQuestionScalarFieldEnum: () => AssessmentQuestionScalarFieldEnum,
  AssessmentScalarFieldEnum: () => AssessmentScalarFieldEnum,
  AuditLogScalarFieldEnum: () => AuditLogScalarFieldEnum,
  CandidateAssessmentScalarFieldEnum: () => CandidateAssessmentScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  QuestionScalarFieldEnum: () => QuestionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  SubmissionScalarFieldEnum: () => SubmissionScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.10.0",
  engine: "0edf323efd1d98336f3f0a68684b56f689b900d3"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  AssessmentQuestion: "AssessmentQuestion",
  Assessment: "Assessment",
  AuditLog: "AuditLog",
  CandidateAssessment: "CandidateAssessment",
  Payment: "Payment",
  Question: "Question",
  Submission: "Submission",
  User: "User"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var AssessmentQuestionScalarFieldEnum = {
  id: "id",
  assessmentId: "assessmentId",
  questionId: "questionId",
  order: "order"
};
var AssessmentScalarFieldEnum = {
  id: "id",
  title: "title",
  description: "description",
  durationMinutes: "durationMinutes",
  totalMarks: "totalMarks",
  passMarks: "passMarks",
  status: "status",
  recruiterId: "recruiterId",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var AuditLogScalarFieldEnum = {
  id: "id",
  userId: "userId",
  action: "action",
  entity: "entity",
  entityId: "entityId",
  details: "details",
  createdAt: "createdAt"
};
var CandidateAssessmentScalarFieldEnum = {
  id: "id",
  candidateId: "candidateId",
  assessmentId: "assessmentId",
  status: "status",
  startedAt: "startedAt",
  submittedAt: "submittedAt",
  totalScore: "totalScore",
  feedback: "feedback",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var PaymentScalarFieldEnum = {
  id: "id",
  userId: "userId",
  amount: "amount",
  currency: "currency",
  paymentGateway: "paymentGateway",
  transactionId: "transactionId",
  paymentID: "paymentID",
  status: "status",
  creditsPurchased: "creditsPurchased",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var QuestionScalarFieldEnum = {
  id: "id",
  title: "title",
  description: "description",
  type: "type",
  difficulty: "difficulty",
  options: "options",
  correctAnswer: "correctAnswer",
  marks: "marks",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SubmissionScalarFieldEnum = {
  id: "id",
  candidateAssessmentId: "candidateAssessmentId",
  questionId: "questionId",
  answerText: "answerText",
  obtainedMarks: "obtainedMarks",
  isEvaluated: "isEvaluated",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var UserScalarFieldEnum = {
  id: "id",
  email: "email",
  password: "password",
  name: "name",
  role: "role",
  status: "status",
  profileImage: "profileImage",
  credits: "credits",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/enums.ts
var UserRole = {
  ADMIN: "ADMIN",
  RECRUITER: "RECRUITER",
  CANDIDATE: "CANDIDATE"
};
var AssessmentStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED"
};
var CandidateAssessmentStatus = {
  INVITED: "INVITED",
  IN_PROGRESS: "IN_PROGRESS",
  SUBMITTED: "SUBMITTED",
  EXPIRED: "EXPIRED",
  EVALUATED: "EVALUATED"
};
var QuestionType = {
  MCQ: "MCQ",
  CODE_SNIPPET: "CODE_SNIPPET",
  WRITTEN: "WRITTEN"
};
var PaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED"
};

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/config/index.ts
import dotenv from "dotenv";
import path2 from "path";
dotenv.config({ path: path2.join(process.cwd(), ".env") });
var config_default = {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bak_url: process.env.APP_URL,
  frontend_url: process.env.FRONTEND_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  google_client_id: process.env.GOOGLE_CLIENT_ID,
  super_admin_name: process.env.SUPER_ADMIN_NAME,
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  tester_admin_name: process.env.TESTER_ADMIN_NAME,
  tester_admin_email: process.env.TESTER_ADMIN_EMAIL,
  tester_admin_password: process.env.TESTER_ADMIN_PASSWORD,
  tester_doctor_name: process.env.TESTER_DOCTOR_NAME,
  tester_doctor_email: process.env.TESTER_DOCTOR_EMAIL,
  tester_doctor_password: process.env.TESTER_DOCTOR_PASSWORD,
  redis_user: process.env.REDIS_USER,
  redis_password: process.env.REDIS_PASSWORD,
  redis_host: process.env.REDIS_HOST,
  redis_port: process.env.REDIS_PORT,
  smtp_user: process.env.SMTP_USER,
  smtp_password: process.env.SMTP_PASSWORD,
  email_sender: process.env.EMAIL_SENDER,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  bkash_base_url: process.env.BKASH_BASE_URL,
  bkash_username: process.env.BKASH_USERNAME,
  bkash_password: process.env.BKASH_PASSWORD,
  bkash_app_key: process.env.BKASH_APP_KEY,
  bkash_app_secret: process.env.BKASH_APP_SECRET,
  bkash_callback_url: process.env.BKASH_CALLBACK_URL
};

// src/app/utils/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};

// src/app/middleware/globalErrorHandler.ts
var globalErrorHandler = async (err, _req, res, _next) => {
  if (config_default.node_env === "development") {
    console.log("Error from Global Error Handler:", err);
  }
  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  let errorMessage = err.message || "Internal Server Error";
  let errorSources = [];
  if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = "Validation Error";
    errorSources = err.issues.map((issue) => {
      return {
        path: String(issue.path[issue.path.length - 1] ?? ""),
        // <--- String() দিয়ে র‍্যাপ করুন
        message: issue.message
      };
    });
  } else if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = "You have provided incorrect field type or missing fields";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Duplicate Key Error: Record already exists";
    } else if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Operation failed: Record not found";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus.UNAUTHORIZED;
      errorMessage = "Database authentication failed. Check credentials";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Can't reach database server";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    errorMessage = "Error occurred during database query execution";
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  } else if (err instanceof Error) {
    errorMessage = err.message;
  }
  res.status(statusCode).json({
    success: false,
    statusCode,
    message: errorMessage,
    errors: errorSources.length > 0 ? errorSources : [{ path: "", message: errorMessage }],
    stack: config_default.node_env === "development" ? err.stack : void 0
  });
};

// src/app/middleware/notFound.ts
import httpStatus2 from "http-status";
var notFound = (req, res) => {
  res.status(httpStatus2.NOT_FOUND).json({
    message: "Route not found",
    path: req.originalUrl,
    date: /* @__PURE__ */ new Date()
  });
};

// src/app/module/auth/auth.route.ts
import { Router } from "express";

// src/app/module/auth/auth.service.ts
import * as bcrypt from "bcryptjs";

// src/app/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, expiresIn) => {
  const token = jwt.sign(payload, secret, {
    expiresIn
  });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return {
      success: true,
      data: verifiedToken
    };
  } catch (error) {
    console.log("Token verification failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
var jwtUtils = {
  createToken,
  verifyToken
};

// src/app/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/lib/googleAuth.ts
import { OAuth2Client } from "google-auth-library";
var googleClient = new OAuth2Client({
  client_id: config_default.google_client_id
});

// src/app/module/auth/auth.service.ts
var googleLogin = async (idToken) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error("Google authentication failed: Invalid token payload");
  }
  const { email, name, picture } = payload;
  let user = await prisma.user.findUnique({
    where: { email }
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: name || "Google User",
        profileImage: picture || null,
        role: UserRole.CANDIDATE,
        // ডিফল্ট রোল
        password: null
        // সোশ্যাল লগইনে পাসওয়ার্ড নাল থাকবে
      }
    });
  }
  if (user.isDeleted || user.status === "BLOCKED") {
    throw new Error("Account is blocked or deactivated");
  }
  const jwtPayload = {
    id: user.id,
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  const refreshToken3 = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_refresh_secret,
    config_default.jwt_refresh_expires_in
  );
  return {
    accessToken,
    refreshToken: refreshToken3,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      credits: user.credits
    }
  };
};
var registerUser = async (payload) => {
  const isUserExist = await prisma.user.findUnique({
    where: { email: payload.email }
  });
  if (isUserExist) {
    throw new Error("User already exists with this email!");
  }
  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const result = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role || UserRole.CANDIDATE,
      credits: payload.role === UserRole.RECRUITER ? 5 : 0
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      credits: true,
      createdAt: true
    }
  });
  return result;
};
var loginUser = async (payload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email }
  });
  if (!user || !user.password) {
    throw new Error("Invalid email or password!");
  }
  if (user.isDeleted || user.status === "BLOCKED") {
    throw new Error("Your account is deactivated or blocked!");
  }
  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password
  );
  if (!isPasswordMatched) {
    throw new Error("Invalid email or password!");
  }
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_access_secret,
    config_default.jwt_access_expires_in
  );
  const refreshToken3 = jwtUtils.createToken(
    jwtPayload,
    config_default.jwt_refresh_secret,
    config_default.jwt_refresh_expires_in
  );
  return {
    accessToken,
    refreshToken: refreshToken3,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      credits: user.credits
    }
  };
};
var refreshToken = async (token) => {
  const verifyResult = jwtUtils.verifyToken(token, config_default.jwt_refresh_secret);
  if (!verifyResult.success || !verifyResult.data) {
    throw new Error("Invalid or expired refresh token!");
  }
  const decoded = verifyResult.data;
  const user = await prisma.user.findUnique({
    where: { id: decoded.id }
  });
  if (!user || user.isDeleted || user.status === "BLOCKED") {
    throw new Error("User does not exist or is blocked!");
  }
  const newAccessToken = jwtUtils.createToken(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "default_jwt_secret",
    process.env.JWT_EXPIRES_IN || "1d"
  );
  return {
    accessToken: newAccessToken
  };
};
var getMyProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      credits: true,
      createdAt: true,
      updatedAt: true
    }
  });
  if (!user) {
    throw new Error("User profile not found!");
  }
  return user;
};
var updateMyProfile = async (userId, payload) => {
  const isUserExist = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!isUserExist) {
    throw new Error("User not found!");
  }
  const updateData = {};
  if (payload.name) updateData.name = payload.name;
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      credits: true,
      createdAt: true,
      updatedAt: true
    }
  });
  return updatedUser;
};
var AuthService = {
  registerUser,
  loginUser,
  refreshToken,
  googleLogin,
  getMyProfile,
  updateMyProfile
};

// src/app/utils/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/app/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
    meta: data.meta
  });
};

// src/app/module/auth/auth.controller.ts
var googleLogin2 = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) throw new Error("Google idToken is required");
    const result = await AuthService.googleLogin(idToken);
    return res.status(200).json({
      success: true,
      message: "Google login successful",
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Google authentication failed",
      errors: [{ path: "googleLogin", message: error.message }]
    });
  }
};
var register = async (req, res) => {
  try {
    const result = await AuthService.registerUser(req.body);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to register user",
      errors: [{ path: "register", message: error.message }]
    });
  }
};
var login = async (req, res) => {
  try {
    const result = await AuthService.loginUser(req.body);
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1e3 * 60 * 60 * 24
      // 24 hour or 1 day
    });
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1e3 * 60 * 60 * 24 * 7
      // 7 days
    });
    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Login failed",
      errors: [{ path: "login", message: error.message }]
    });
  }
};
var logout = catchAsync(async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged out successfully",
    data: null
  });
});
var refreshToken2 = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is missing!",
        errors: [{ path: "refreshToken", message: "Token required" }]
      });
    }
    const result = await AuthService.refreshToken(token);
    return res.status(200).json({
      success: true,
      message: "New access token generated successfully",
      data: result
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Token refresh failed",
      errors: [{ path: "refreshToken", message: error.message }]
    });
  }
};
var getMyProfile2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await AuthService.getMyProfile(user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile retrieved successfully",
    data: result
  });
});
var updateMyProfile2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await AuthService.updateMyProfile(user.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile updated successfully",
    data: result
  });
});
var AuthController = {
  register,
  login,
  refreshToken: refreshToken2,
  googleLogin: googleLogin2,
  getMyProfile: getMyProfile2,
  updateMyProfile: updateMyProfile2,
  logout
};

// src/app/middleware/checkAuth.ts
import httpStatus3 from "http-status";
var auth = (...requiredRoles) => {
  return catchAsync(async (req, res, next) => {
    const token = req.cookies?.accessToken ? req.cookies.accessToken : req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : req.headers.authorization;
    if (!token) {
      throw new AppError(
        httpStatus3.UNAUTHORIZED,
        "You are not logged in. Please log in to access this resource."
      );
    }
    const verifiedToken = jwtUtils.verifyToken(
      token,
      config_default.jwt_access_secret || process.env.JWT_SECRET || "default_jwt_secret"
    );
    if (!verifiedToken.success) {
      throw new AppError(
        httpStatus3.UNAUTHORIZED,
        verifiedToken.error || "Invalid or expired token."
      );
    }
    const decoded = verifiedToken.data;
    const targetUserId = decoded.userId || decoded.id;
    const user = await prisma.user.findUnique({
      where: {
        id: targetUserId
      }
    });
    if (!user || user.isDeleted) {
      throw new AppError(
        httpStatus3.UNAUTHORIZED,
        "User not found. Please log in again."
      );
    }
    if (user.status === "BLOCKED") {
      throw new AppError(
        httpStatus3.FORBIDDEN,
        "Your account has been blocked. Please contact support."
      );
    }
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      throw new AppError(
        httpStatus3.FORBIDDEN,
        "Forbidden. You don't have permission to access this resource."
      );
    }
    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    next();
  });
};

// src/app/middleware/validateRequest.ts
import httpStatus4 from "http-status";
var validateRequest = (zodSchema) => {
  return catchAsync((req, res, next) => {
    const payload = req.body ?? {};
    const result = zodSchema.safeParse(payload);
    if (!result.success) {
      console.log(result.error);
      console.log(result.error.issues);
      throw new AppError(httpStatus4.BAD_REQUEST, result.error.issues[0].message);
    }
    req.body = result.data;
    next();
  });
};

// src/app/module/auth/auth.validation.ts
import { z } from "zod";
var registerSchema = z.object({
  name: z.string("Not A String!!!!!").min(3, "Name must atleast 3 characters long!!!").max(10),
  email: z.email("Not email!!"),
  password: z.string().min(8, "Password Must Minimum 8 Characters Long.")
});
var loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password Must Minimum 8 Characters Long.")
});
var refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().min(1, "Refresh token is required")
  })
});
var AuthValidation = {
  registerSchema,
  loginSchema,
  refreshTokenValidationSchema
};

// src/app/module/auth/auth.route.ts
var router = Router();
router.post(
  "/register",
  validateRequest(AuthValidation.registerSchema),
  // <--- এখানে যোগ করুন
  AuthController.register
);
router.post("/google-login", AuthController.googleLogin);
router.post(
  "/login",
  validateRequest(AuthValidation.loginSchema),
  AuthController.login
);
router.post("/logout", AuthController.logout);
router.post("/refresh-token", AuthController.refreshToken);
router.get("/me", auth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN), AuthController.getMyProfile);
router.patch(
  "/me",
  auth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  AuthController.updateMyProfile
);
var AuthRoutes = router;

// src/app/module/assessment/assessment.route.ts
import { Router as Router2 } from "express";

// src/app/module/assessment/assessment.service.ts
var createQuestion = async (payload) => {
  const result = await prisma.question.create({
    data: {
      title: payload.title,
      description: payload.description,
      type: payload.type,
      difficulty: payload.difficulty,
      options: payload.options ? payload.options : prismaNamespace_exports.JsonNull,
      correctAnswer: payload.correctAnswer || null,
      marks: payload.marks || 10
    }
  });
  return result;
};
var getAllQuestions = async () => {
  return await prisma.question.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" }
  });
};
var createAssessment = async (recruiterId, payload) => {
  const recruiter = await prisma.user.findUnique({
    where: { id: recruiterId }
  });
  if (!recruiter || recruiter.credits < 1) {
    throw new Error("Insufficient credits! Please purchase credits via bKash to create assessments.");
  }
  const result = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: recruiterId },
      data: { credits: { decrement: 1 } }
    });
    const newAssessment = await tx.assessment.create({
      data: {
        title: payload.title,
        description: payload.description,
        durationMinutes: Number(payload.durationMinutes),
        totalMarks: payload.totalMarks || 100,
        passMarks: payload.passMarks || 40,
        status: AssessmentStatus.PUBLISHED,
        recruiterId
      }
    });
    if (payload.questionIds && payload.questionIds.length > 0) {
      const links = payload.questionIds.map((qId, index) => ({
        assessmentId: newAssessment.id,
        questionId: qId,
        order: index + 1
      }));
      await tx.assessmentQuestion.createMany({ data: links });
    }
    return newAssessment;
  });
  return result;
};
var getAllAssessments = async (filters) => {
  const { searchTerm, status, page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc" } = filters;
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;
  const andConditions = [{ isDeleted: false }];
  if (searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } }
      ]
    });
  }
  if (status) {
    andConditions.push({ status });
  }
  const whereConditions = { AND: andConditions };
  const [data, total] = await Promise.all([
    prisma.assessment.findMany({
      where: whereConditions,
      skip,
      take: limitNum,
      orderBy: { [sortBy]: sortOrder },
      include: {
        recruiter: {
          select: { id: true, name: true, email: true }
        },
        _count: { select: { questions: true, candidates: true } }
      }
    }),
    prisma.assessment.count({ where: whereConditions })
  ]);
  return {
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    data
  };
};
var getSingleAssessment = async (id) => {
  const result = await prisma.assessment.findFirst({
    where: { id, isDeleted: false },
    include: {
      questions: {
        include: { question: true },
        orderBy: { order: "asc" }
      },
      recruiter: { select: { id: true, name: true, email: true } }
    }
  });
  if (!result) {
    throw new Error("Assessment not found!");
  }
  return result;
};
var softDeleteAssessment = async (id, userId, role) => {
  const assessment = await prisma.assessment.findUnique({ where: { id } });
  if (!assessment || assessment.isDeleted) {
    throw new Error("Assessment not found!");
  }
  if (role !== "ADMIN" && assessment.recruiterId !== userId) {
    throw new Error("You are not authorized to delete this assessment!");
  }
  const result = await prisma.assessment.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  return result;
};
var AssessmentService = {
  createQuestion,
  getAllQuestions,
  createAssessment,
  getAllAssessments,
  getSingleAssessment,
  softDeleteAssessment
};

// src/app/module/assessment/assessment.controller.ts
var createQuestion2 = async (req, res) => {
  try {
    const result = await AssessmentService.createQuestion(req.body);
    return res.status(201).json({
      success: true,
      message: "Question added to Problem Bank successfully",
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create question",
      errors: [{ path: "createQuestion", message: error.message }]
    });
  }
};
var getAllQuestions2 = async (req, res) => {
  try {
    const result = await AssessmentService.getAllQuestions();
    return res.status(200).json({
      success: true,
      message: "Questions fetched successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch questions",
      errors: [{ path: "getAllQuestions", message: error.message }]
    });
  }
};
var createAssessment2 = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const result = await AssessmentService.createAssessment(recruiterId, req.body);
    return res.status(201).json({
      success: true,
      message: "Assessment created and published successfully",
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create assessment",
      errors: [{ path: "createAssessment", message: error.message }]
    });
  }
};
var getAllAssessments2 = async (req, res) => {
  try {
    const filters = req.query;
    const result = await AssessmentService.getAllAssessments(filters);
    return res.status(200).json({
      success: true,
      message: "Assessments retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch assessments",
      errors: [{ path: "getAllAssessments", message: error.message }]
    });
  }
};
var getSingleAssessment2 = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await AssessmentService.getSingleAssessment(id);
    return res.status(200).json({
      success: true,
      message: "Assessment details retrieved successfully",
      data: result
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || "Assessment not found",
      errors: [{ path: "getSingleAssessment", message: error.message }]
    });
  }
};
var deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await AssessmentService.softDeleteAssessment(id, req.user.id, req.user.role);
    return res.status(200).json({
      success: true,
      message: "Assessment deleted successfully (Soft delete)",
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete assessment",
      errors: [{ path: "deleteAssessment", message: error.message }]
    });
  }
};
var AssessmentController = {
  createQuestion: createQuestion2,
  getAllQuestions: getAllQuestions2,
  createAssessment: createAssessment2,
  getAllAssessments: getAllAssessments2,
  getSingleAssessment: getSingleAssessment2,
  deleteAssessment
};

// src/app/module/assessment/assessment.validation.ts
import { z as z2 } from "zod";
var AssessmentValidation = {
  createAssessmentSchema: z2.object({
    body: z2.object({
      title: z2.string({ message: "Title is required" }).min(1, "Title cannot be empty"),
      durationMinutes: z2.number({ message: "Duration is required" }).positive("Duration must be positive"),
      totalMarks: z2.number({ message: "Total marks is required" }).positive("Total marks must be positive"),
      passMarks: z2.number({ message: "Pass marks is required" }).positive("Pass marks must be positive"),
      questionIds: z2.array(z2.string(), { message: "Question IDs are required" }).min(1, "At least one question is required")
    })
  })
};

// src/app/module/assessment/assessment.route.ts
var router2 = Router2();
router2.post(
  "/questions",
  auth(UserRole.ADMIN, UserRole.RECRUITER),
  AssessmentController.createQuestion
);
router2.get(
  "/questions",
  auth(UserRole.ADMIN, UserRole.RECRUITER),
  AssessmentController.getAllQuestions
);
router2.post(
  "/",
  auth(UserRole.RECRUITER, UserRole.ADMIN),
  validateRequest(AssessmentValidation.createAssessmentSchema),
  AssessmentController.createAssessment
);
router2.get(
  "/",
  auth(UserRole.ADMIN, UserRole.RECRUITER),
  AssessmentController.getAllAssessments
);
router2.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.RECRUITER),
  AssessmentController.getSingleAssessment
);
router2.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.RECRUITER),
  AssessmentController.deleteAssessment
);
var AssessmentRoutes = router2;

// src/app/module/submission/submission.route.ts
import { Router as Router3 } from "express";

// src/app/module/submission/submission.service.ts
var inviteCandidate = async (recruiterId, payload) => {
  const assessment = await prisma.assessment.findFirst({
    where: { id: payload.assessmentId, isDeleted: false }
  });
  if (!assessment) {
    throw new Error("Assessment not found!");
  }
  if (assessment.recruiterId !== recruiterId) {
    throw new Error("You are not authorized to invite candidates to this assessment!");
  }
  const candidate = await prisma.user.findUnique({
    where: { email: payload.candidateEmail }
  });
  if (!candidate) {
    throw new Error("Candidate not registered with this email!");
  }
  const existingInvitation = await prisma.candidateAssessment.findUnique({
    where: {
      candidateId_assessmentId: {
        candidateId: candidate.id,
        assessmentId: payload.assessmentId
      }
    }
  });
  if (existingInvitation) {
    throw new Error("Candidate is already invited to this assessment!");
  }
  const invitation = await prisma.candidateAssessment.create({
    data: {
      candidateId: candidate.id,
      assessmentId: payload.assessmentId,
      status: CandidateAssessmentStatus.INVITED
    },
    include: {
      candidate: { select: { id: true, name: true, email: true } },
      assessment: { select: { id: true, title: true, durationMinutes: true } }
    }
  });
  return invitation;
};
var getMyAssignedAssessments = async (candidateId) => {
  const results = await prisma.candidateAssessment.findMany({
    where: { candidateId },
    include: {
      assessment: {
        select: {
          id: true,
          title: true,
          description: true,
          durationMinutes: true,
          totalMarks: true,
          passMarks: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return results;
};
var startAssessment = async (candidateAssessmentId, candidateId) => {
  const attempt = await prisma.candidateAssessment.findUnique({
    where: { id: candidateAssessmentId },
    include: {
      assessment: {
        include: {
          questions: {
            include: {
              question: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  type: true,
                  options: true,
                  marks: true
                  // correctAnswer ক্যান্ডিডেটকে দেখানো যাবে না (Security)
                }
              }
            },
            orderBy: { order: "asc" }
          }
        }
      }
    }
  });
  if (!attempt || attempt.candidateId !== candidateId) {
    throw new Error("Assessment attempt record not found!");
  }
  if (attempt.status === CandidateAssessmentStatus.SUBMITTED) {
    throw new Error("You have already submitted this assessment!");
  }
  let startedAt = attempt.startedAt;
  if (!startedAt) {
    startedAt = /* @__PURE__ */ new Date();
    await prisma.candidateAssessment.update({
      where: { id: attempt.id },
      data: {
        status: CandidateAssessmentStatus.IN_PROGRESS,
        startedAt
      }
    });
  }
  return {
    attemptId: attempt.id,
    startedAt,
    durationMinutes: attempt.assessment.durationMinutes,
    assessment: {
      title: attempt.assessment.title,
      questions: attempt.assessment.questions.map((q) => q.question)
    }
  };
};
var submitAssessment = async (candidateAssessmentId, candidateId, payload) => {
  const attempt = await prisma.candidateAssessment.findUnique({
    where: { id: candidateAssessmentId },
    include: {
      assessment: {
        include: {
          questions: {
            include: { question: true }
          }
        }
      }
    }
  });
  if (!attempt || attempt.candidateId !== candidateId) {
    throw new Error("Attempt record not found!");
  }
  if (attempt.status === CandidateAssessmentStatus.SUBMITTED) {
    throw new Error("This assessment has already been submitted!");
  }
  const questionMap = /* @__PURE__ */ new Map();
  attempt.assessment.questions.forEach((item) => {
    questionMap.set(item.question.id, item.question);
  });
  let totalCalculatedScore = 0;
  const submissionsData = [];
  for (const ans of payload.answers) {
    const question = questionMap.get(ans.questionId);
    let obtainedMarks = 0;
    let isEvaluated = false;
    if (question) {
      if (question.type === QuestionType.MCQ) {
        if (question.correctAnswer && question.correctAnswer.trim().toLowerCase() === ans.answerText.trim().toLowerCase()) {
          obtainedMarks = question.marks;
        }
        isEvaluated = true;
      } else {
        obtainedMarks = 0;
        isEvaluated = false;
      }
      totalCalculatedScore += obtainedMarks;
      submissionsData.push({
        candidateAssessmentId: attempt.id,
        questionId: ans.questionId,
        answerText: ans.answerText,
        obtainedMarks,
        isEvaluated
      });
    }
  }
  const result = await prisma.$transaction(async (tx) => {
    for (const sub of submissionsData) {
      await tx.submission.upsert({
        where: {
          candidateAssessmentId_questionId: {
            candidateAssessmentId: sub.candidateAssessmentId,
            questionId: sub.questionId
          }
        },
        update: {
          answerText: sub.answerText,
          obtainedMarks: sub.obtainedMarks,
          isEvaluated: sub.isEvaluated
        },
        create: sub
      });
    }
    const updatedAttempt = await tx.candidateAssessment.update({
      where: { id: attempt.id },
      data: {
        status: CandidateAssessmentStatus.SUBMITTED,
        submittedAt: /* @__PURE__ */ new Date(),
        totalScore: totalCalculatedScore
      }
    });
    return updatedAttempt;
  });
  return {
    attemptId: result.id,
    status: result.status,
    totalScore: result.totalScore,
    submittedAt: result.submittedAt
  };
};
var getSubmissionResult = async (candidateAssessmentId, userId, role) => {
  const result = await prisma.candidateAssessment.findUnique({
    where: { id: candidateAssessmentId },
    include: {
      candidate: { select: { id: true, name: true, email: true } },
      assessment: { select: { id: true, title: true, totalMarks: true, passMarks: true, recruiterId: true } },
      submissions: {
        include: {
          question: {
            select: { id: true, title: true, type: true, marks: true, correctAnswer: true }
          }
        }
      }
    }
  });
  if (!result) {
    throw new Error("Result not found!");
  }
  if (role === "CANDIDATE" && result.candidateId !== userId) {
    throw new Error("Access denied!");
  }
  if (role === "RECRUITER" && result.assessment.recruiterId !== userId) {
    throw new Error("Access denied!");
  }
  return result;
};
var getSubmissionsByAssessmentId = async (assessmentId, userId, userRole) => {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId }
  });
  if (!assessment) {
    throw new Error("Assessment not found!");
  }
  if (userRole === "RECRUITER" && assessment.recruiterId !== userId) {
    throw new Error("You are not authorized to view submissions for this assessment!");
  }
  const candidateAssessments = await prisma.candidateAssessment.findMany({
    where: { assessmentId },
    include: {
      candidate: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return {
    assessment: {
      id: assessment.id,
      title: assessment.title,
      totalMarks: assessment.totalMarks,
      passMarks: assessment.passMarks
    },
    totalCandidates: candidateAssessments.length,
    candidates: candidateAssessments
  };
};
var SubmissionService = {
  inviteCandidate,
  getMyAssignedAssessments,
  startAssessment,
  submitAssessment,
  getSubmissionResult,
  getSubmissionsByAssessmentId
};

// src/app/module/submission/submission.controller.ts
var inviteCandidate2 = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const result = await SubmissionService.inviteCandidate(recruiterId, req.body);
    return res.status(201).json({
      success: true,
      message: "Candidate invited successfully to the assessment",
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to invite candidate",
      errors: [{ path: "inviteCandidate", message: error.message }]
    });
  }
};
var getMyAssignedAssessments2 = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const result = await SubmissionService.getMyAssignedAssessments(candidateId);
    return res.status(200).json({
      success: true,
      message: "Assigned assessments retrieved successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch assessments",
      errors: [{ path: "getMyAssignedAssessments", message: error.message }]
    });
  }
};
var startAssessment2 = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const candidateId = req.user.id;
    const result = await SubmissionService.startAssessment(attemptId, candidateId);
    return res.status(200).json({
      success: true,
      message: "Assessment exam started successfully",
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to start assessment",
      errors: [{ path: "startAssessment", message: error.message }]
    });
  }
};
var submitAssessment2 = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const candidateId = req.user.id;
    const result = await SubmissionService.submitAssessment(attemptId, candidateId, req.body);
    return res.status(200).json({
      success: true,
      message: "Assessment submitted and evaluated successfully",
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to submit assessment",
      errors: [{ path: "submitAssessment", message: error.message }]
    });
  }
};
var getSubmissionResult2 = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const result = await SubmissionService.getSubmissionResult(attemptId, userId, role);
    return res.status(200).json({
      success: true,
      message: "Assessment report and results fetched successfully",
      data: result
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || "Failed to fetch result",
      errors: [{ path: "getSubmissionResult", message: error.message }]
    });
  }
};
var getSubmissionsByAssessment = catchAsync(async (req, res) => {
  const { assessmentId } = req.params;
  const user = req.user;
  const result = await SubmissionService.getSubmissionsByAssessmentId(
    assessmentId,
    user.id,
    user.role
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assessment candidate submissions retrieved successfully",
    data: result
  });
});
var SubmissionController = {
  inviteCandidate: inviteCandidate2,
  getMyAssignedAssessments: getMyAssignedAssessments2,
  startAssessment: startAssessment2,
  submitAssessment: submitAssessment2,
  getSubmissionResult: getSubmissionResult2,
  getSubmissionsByAssessment
};

// src/app/module/submission/submission.route.ts
var router3 = Router3();
router3.post(
  "/invite",
  auth(UserRole.RECRUITER, UserRole.ADMIN),
  SubmissionController.inviteCandidate
);
router3.get(
  "/my-assessments",
  auth(UserRole.CANDIDATE),
  SubmissionController.getMyAssignedAssessments
);
router3.post(
  "/start/:attemptId",
  auth(UserRole.CANDIDATE),
  SubmissionController.startAssessment
);
router3.post(
  "/submit/:attemptId",
  auth(UserRole.CANDIDATE),
  SubmissionController.submitAssessment
);
router3.get(
  "/results/:attemptId",
  auth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  SubmissionController.getSubmissionResult
);
router3.get(
  "/assessment/:assessmentId",
  auth(UserRole.RECRUITER, UserRole.ADMIN),
  SubmissionController.getSubmissionsByAssessment
);
var SubmissionRoutes = router3;

// src/app/module/payment/payment.route.ts
import { Router as Router4 } from "express";

// src/app/lib/bkash.ts
import httpStatus5 from "http-status";

// src/app/lib/redis.ts
import { createClient } from "redis";
var redisClient = createClient({
  username: config_default.redis_user,
  password: config_default.redis_password,
  socket: {
    host: config_default.redis_host,
    port: Number(config_default.redis_port),
    // সকেট ড্রপ করলে অটো রিকানেক্ট পলিসি
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("Redis: Max reconnect attempts reached");
        return new Error("Redis connection failed");
      }
      return Math.min(retries * 100, 3e3);
    }
  }
});
redisClient.on("error", (err) => {
  console.warn("\u26A0\uFE0F Redis Client Warning:", err.message);
});
redisClient.on("connect", () => {
  console.log("\u2705 Redis Client Connected");
});
redisClient.on("reconnecting", () => {
  console.log("\u{1F504} Redis Client Reconnecting...");
});

// src/app/lib/bkash.ts
var getBkashIdToken = async () => {
  try {
    const IdTokenKey = "bkash:idToken";
    const RefreshTokenKey = "bkash:refreshToken";
    let bkashIdToken = await redisClient.get(IdTokenKey);
    const bkashIdTokenTTL = await redisClient.ttl(IdTokenKey);
    const bkashRefreshToken = await redisClient.get(RefreshTokenKey);
    const bkashRefreshTokenTTL = await redisClient.ttl(RefreshTokenKey);
    if ((bkashIdTokenTTL <= 600 || !bkashIdToken) && bkashRefreshToken && bkashRefreshTokenTTL > 600) {
      const refreshTokenResponse = await fetch(
        `${config_default.bkash_base_url}/tokenized/checkout/token/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            username: config_default.bkash_username,
            password: config_default.bkash_password
          },
          body: JSON.stringify({
            app_key: config_default.bkash_app_key,
            app_secret: config_default.bkash_app_secret,
            refresh_token: bkashRefreshToken
          })
        }
      );
      if (!refreshTokenResponse.ok) {
        throw new AppError(httpStatus5.BAD_GATEWAY, "Bkash Access Token Grant Failed");
      }
      const bkashRefreshTokenResult = await refreshTokenResponse.json();
      bkashIdToken = bkashRefreshTokenResult.id_token;
      await redisClient.set(IdTokenKey, bkashIdToken, {
        expiration: {
          type: "EX",
          value: 60 * 60
        }
      });
      return bkashIdToken;
    }
    if (bkashIdTokenTTL > 600) {
      return bkashIdToken;
    }
    const response = await fetch(
      `${config_default.bkash_base_url}/tokenized/checkout/token/grant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: config_default.bkash_username,
          password: config_default.bkash_password
        },
        body: JSON.stringify({
          app_key: config_default.bkash_app_key,
          app_secret: config_default.bkash_app_secret
        })
      }
    );
    if (!response.ok) {
      throw new AppError(httpStatus5.BAD_GATEWAY, "Bkash Access Token Grant Failed");
    }
    const result = await response.json();
    await redisClient.set(IdTokenKey, result.id_token, {
      expiration: {
        type: "EX",
        value: 60 * 60
        // 1hour
      }
    });
    await redisClient.set(RefreshTokenKey, result.refresh_token, {
      expiration: {
        type: "EX",
        value: 60 * 60 * 24 * 28
        // 28 days
      }
    });
    bkashIdToken = result.id_token;
    return bkashIdToken;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(httpStatus5.BAD_GATEWAY, error.message);
  }
};

// src/app/module/payment/payment.service.ts
var initiatePayment = async (userId, payload) => {
  const bkashIdToken = await getBkashIdToken();
  const invoiceNumber = `INV-${Date.now()}`;
  const callbackURL = `http://localhost:5000/api/v1/payments/callback`;
  const response = await fetch(
    "https://tokenized.sandbox.bka.sh/v2/tokenized-checkout/payment/create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: bkashIdToken,
        "X-App-Key": config_default.bkash_app_key
      },
      body: JSON.stringify({
        payerReference: userId.slice(0, 11),
        // স্যান্ডবক্সে রেফারেন্স স্ট্রিং
        callbackURL,
        amount: String(payload.amount),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: invoiceNumber,
        subMerchantName: "AssessmentPlatform",
        merchantAssociationInfo: "MI05MID54RF09123456789"
      })
    }
  );
  const result = await response.json();
  console.log(result);
  if (result && result.paymentId) {
    const paymentRecord = await prisma.payment.create({
      data: {
        userId,
        amount: Number(payload.amount),
        currency: "BDT",
        paymentGateway: "bKash",
        paymentID: result.paymentId,
        creditsPurchased: Number(payload.creditsPurchased) || 5,
        status: PaymentStatus.PENDING
      }
    });
    return {
      paymentRecord,
      bkashURL: result.bkashURL,
      paymentID: result.paymentID
    };
  }
  throw new Error(result.statusMessage || "Failed to create bKash payment");
};
var handleCallback = async (query) => {
  const { paymentID, status } = query;
  if (!paymentID) throw new Error("Payment ID is missing");
  if (!status) throw new Error("Payment status is missing");
  if (status === "cancel") {
    await prisma.payment.updateMany({
      where: { paymentID },
      data: { status: PaymentStatus.CANCELLED }
    });
    return {
      success: false,
      message: "Payment cancelled by user",
      status: "cancel",
      paymentID
    };
  }
  if (status === "failure") {
    await prisma.payment.updateMany({
      where: { paymentID },
      data: { status: PaymentStatus.FAILED }
    });
    return {
      success: false,
      message: "Payment failed during checkout",
      status: "failure",
      paymentID
    };
  }
  if (status === "success") {
    const bkashIdToken = await getBkashIdToken();
    const executedResponse = await fetch(
      "https://tokenized.sandbox.bka.sh/v2/tokenized-checkout/payment/execute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: bkashIdToken,
          "X-App-Key": config_default.bkash_app_key
        },
        body: JSON.stringify({
          paymentId: paymentID
        })
      }
    );
    const executedResult = await executedResponse.json();
    if (executedResult.transactionStatus !== "Completed" || !executedResult.trxId) {
      await prisma.payment.updateMany({
        where: { paymentID },
        data: { status: PaymentStatus.FAILED }
      });
      throw new Error(executedResult.statusMessage || "bKash Execution Failed");
    }
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { paymentID }
      });
      if (!payment) {
        throw new Error("Payment record not found in system!");
      }
      if (payment.status === PaymentStatus.COMPLETED) {
        return payment;
      }
      const completedPayment = await tx.payment.update({
        where: { paymentID },
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId: executedResult.trxId
        }
      });
      await tx.user.update({
        where: { id: payment.userId },
        data: {
          credits: { increment: payment.creditsPurchased }
        }
      });
      await tx.auditLog.create({
        data: {
          userId: payment.userId,
          action: "CREDIT_PURCHASE_COMPLETED",
          entity: "Payment",
          entityId: completedPayment.id,
          details: {
            trxId: executedResult.trxId,
            creditsAdded: payment.creditsPurchased,
            amount: payment.amount
          }
        }
      });
      return completedPayment;
    });
    return {
      success: true,
      message: "Payment completed and assessment credits added!",
      trxId: executedResult.trxId,
      data: result
    };
  }
  throw new Error("Invalid payment status received");
};
var refundPayment = async (payload) => {
  const bkashIdToken = await getBkashIdToken();
  const refundResponse = await fetch(
    "https://tokenized.sandbox.bka.sh/v2/tokenized-checkout/refund/payment/transaction",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: bkashIdToken,
        "X-App-Key": config_default.bkash_app_key
      },
      body: JSON.stringify({
        paymentId: payload.paymentId,
        refundAmount: Number(payload.refundAmount),
        trxId: payload.trxId,
        reason: payload.reason || "Assessment cancellation or billing adjustment",
        sku: "DEV-CREDIT-PKG"
      })
    }
  );
  const refundResult = await refundResponse.json();
  if (refundResult && refundResult.statusCode === "0000") {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { paymentID: payload.paymentId }
      });
      if (payment) {
        await tx.user.update({
          where: { id: payment.userId },
          data: {
            credits: { decrement: payment.creditsPurchased }
          }
        });
      }
      await tx.auditLog.create({
        data: {
          action: "PAYMENT_REFUNDED",
          entity: "Payment",
          entityId: payload.paymentId,
          details: refundResult
        }
      });
    });
    return {
      message: "Refund processed successfully",
      refundResult
    };
  }
  throw new Error(refundResult.statusMessage || "Refund processing failed");
};
var getMyPayments = async (userId) => {
  return await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
};
var getAllPayments = async () => {
  return await prisma.payment.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};
var PaymentService = {
  initiatePayment,
  handleCallback,
  refundPayment,
  getMyPayments,
  getAllPayments
};

// src/app/module/payment/payment.controller.ts
var initiatePayment2 = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await PaymentService.initiatePayment(userId, req.body);
    console.log(result, "result from service file");
    return res.status(200).json({
      success: true,
      message: "bKash payment URL generated successfully",
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to initiate payment",
      errors: [{ path: "initiatePayment", message: error.message }]
    });
  }
};
var handleCallback2 = async (req, res) => {
  try {
    const result = await PaymentService.handleCallback(req.query);
    return res.status(200).json({
      success: result.success,
      message: result.message,
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Callback processing failed",
      errors: [{ path: "handleCallback", message: error.message }]
    });
  }
};
var refundPayment2 = async (req, res) => {
  try {
    const result = await PaymentService.refundPayment(req.body);
    return res.status(200).json({
      success: true,
      message: "Payment refunded successfully",
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Refund failed",
      errors: [{ path: "refundPayment", message: error.message }]
    });
  }
};
var getMyPayments2 = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await PaymentService.getMyPayments(userId);
    return res.status(200).json({
      success: true,
      message: "Payment history fetched successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payments",
      errors: [{ path: "getMyPayments", message: error.message }]
    });
  }
};
var getAllPayments2 = async (req, res) => {
  try {
    const result = await PaymentService.getAllPayments();
    return res.status(200).json({
      success: true,
      message: "All payments fetched successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payments",
      errors: [{ path: "getAllPayments", message: error.message }]
    });
  }
};
var PaymentController = {
  initiatePayment: initiatePayment2,
  handleCallback: handleCallback2,
  refundPayment: refundPayment2,
  getMyPayments: getMyPayments2,
  getAllPayments: getAllPayments2
};

// src/app/module/payment/payment.route.ts
var router4 = Router4();
router4.get("/callback", PaymentController.handleCallback);
router4.post(
  "/initiate",
  auth(UserRole.RECRUITER, UserRole.ADMIN),
  PaymentController.initiatePayment
);
router4.get(
  "/my-history",
  auth(UserRole.RECRUITER, UserRole.ADMIN),
  PaymentController.getMyPayments
);
router4.get(
  "/all",
  auth(UserRole.ADMIN),
  PaymentController.getAllPayments
);
router4.post(
  "/refund",
  auth(UserRole.ADMIN),
  PaymentController.refundPayment
);
var PaymentRoutes = router4;

// src/app/module/admin/admin.route.ts
import { Router as Router5 } from "express";

// src/app/module/admin/admin.service.ts
var getDashboardStats = async () => {
  const [totalUsers, totalAssessments, totalAttempts, totalRevenue] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.assessment.count({ where: { isDeleted: false } }),
    prisma.candidateAssessment.count(),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true }
    })
  ]);
  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true }
  });
  return {
    totalUsers,
    totalAssessments,
    totalAttempts,
    totalRevenue: totalRevenue._sum.amount || 0,
    usersByRole
  };
};
var getAllUsers = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const whereCondition = { isDeleted: false };
  if (query.role) whereCondition.role = query.role;
  if (query.status) whereCondition.status = query.status;
  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        credits: true,
        createdAt: true
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.count({ where: whereCondition })
  ]);
  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data
  };
};
var updateUserRoleOrStatus = async (adminId, targetUserId, payload) => {
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw new Error("User not found!");
  const updatedUser = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: targetUserId },
      data: payload,
      select: { id: true, name: true, email: true, role: true, status: true }
    });
    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: "USER_PERMISSION_CHANGED",
        entity: "User",
        entityId: targetUserId,
        details: payload
      }
    });
    return updated;
  });
  return updatedUser;
};
var getAuditLogs = async () => {
  return await prisma.auditLog.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, role: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });
};
var AdminService = {
  getDashboardStats,
  getAllUsers,
  updateUserRoleOrStatus,
  getAuditLogs
};

// src/app/module/admin/admin.controller.ts
var getDashboardStats2 = async (req, res) => {
  try {
    const result = await AdminService.getDashboardStats();
    return res.status(200).json({ success: true, message: "Dashboard stats fetched", data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};
var getAllUsers2 = async (req, res) => {
  try {
    const result = await AdminService.getAllUsers(req.query);
    return res.status(200).json({ success: true, message: "Users fetched", data: result.data, meta: result.meta });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};
var updateUserRoleOrStatus2 = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const result = await AdminService.updateUserRoleOrStatus(adminId, id, req.body);
    return res.status(200).json({ success: true, message: "User updated successfully", data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message, errors: [error.message] });
  }
};
var getAuditLogs2 = async (req, res) => {
  try {
    const result = await AdminService.getAuditLogs();
    return res.status(200).json({ success: true, message: "Audit logs fetched", data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, errors: [error.message] });
  }
};
var AdminController = {
  getDashboardStats: getDashboardStats2,
  getAllUsers: getAllUsers2,
  updateUserRoleOrStatus: updateUserRoleOrStatus2,
  getAuditLogs: getAuditLogs2
};

// src/app/module/admin/admin.route.ts
var router5 = Router5();
router5.get("/dashboard-stats", auth(UserRole.ADMIN), AdminController.getDashboardStats);
router5.get("/users", auth(UserRole.ADMIN), AdminController.getAllUsers);
router5.patch("/users/:id", auth(UserRole.ADMIN), AdminController.updateUserRoleOrStatus);
router5.get("/audit-logs", auth(UserRole.ADMIN), AdminController.getAuditLogs);
var AdminRoutes = router5;

// src/app.ts
var app = express();
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/assessments", AssessmentRoutes);
app.use("/api/v1/submissions", SubmissionRoutes);
app.use("/api/v1/payments", PaymentRoutes);
app.use("/api/v1/admin", AdminRoutes);
app.get("/", async (req, res) => {
  res.status(httpStatus6.OK).json({
    success: true,
    message: "Welcome to Developer Assessment & Coding Platform Backend"
  });
});
app.use(globalErrorHandler);
app.use(notFound);
var app_default = app;
export {
  app_default as default
};
