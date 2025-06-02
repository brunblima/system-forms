export type QuestionType = "short" | "long" | "multiple" | "checkbox" | "location" | "image" | "file" | "date";
export interface Question {
    id: string;
    type: QuestionType;
    title: string;
    isRequired: boolean;
    allowImage?: boolean;
    options?: string[];
    imageUrl?: string;
    location?: string;
    fileUrl?: string;
  }
  
  export interface FormData {
    id?: string;
    title: string;
    description: string;
    questions: Question[];
  }

  export interface FormResponse {
    id: string;
    date: string;
    answers: Record<string, { text?: string; image?: string; location?: string }>;
  }