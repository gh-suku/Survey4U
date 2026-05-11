// Survey4U Types
export type QuestionType = 'text' | 'voice' | 'multiple-choice';

export interface Admin {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  admin_id: string;
  title: string;
  description?: string;
  slug: string;
  qr_code_url?: string;
  status: 'draft' | 'published' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  event_id: string;
  question_text: string;
  question_type: QuestionType;
  options?: string[];
  order_number: number;
  is_required: boolean;
  is_default: boolean;
  created_at: string;
}

export interface Response {
  id: string;
  event_id: string;
  question_id: string;
  session_id: string;
  responder_name?: string;
  responder_email?: string;
  answer_text?: string;
  answer_audio_url?: string;
  response_type: 'text' | 'voice';
  created_at: string;
}

export interface EventWithQuestions extends Event {
  questions: Question[];
}

export interface ResponseWithQuestion extends Response {
  question_text: string;
  question_type: QuestionType;
}

export interface GroupedResponse {
  session_id: string;
  responder_name?: string;
  responder_email?: string;
  created_at: string;
  answers: Array<{
    question_id: string;
    question_text: string;
    question_type: QuestionType;
    answer_text?: string;
    answer_audio_url?: string;
    response_type: 'text' | 'voice';
  }>;
}

export interface AnalysisResult {
  executiveSummary: string;
  themes: Array<{
    name: string;
    description: string;
    evidenceCount?: number;
  }>;
  useCases: Array<{
    title: string;
    description: string;
    priority?: string;
  }>;
  recommendations: string[];
}
