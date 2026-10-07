export interface IInviteCandidate {
  assessmentId: string;
  candidateEmail: string;
}

export interface ISubmitAnswer {
  questionId: string;
  answerText: string;
}

export interface IAssessmentSubmissionPayload {
  answers: ISubmitAnswer[];
}