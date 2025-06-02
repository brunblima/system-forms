import { Question } from "@/types/form";
import { ShortAnswerInput } from "./ShortAnswerInput";
import { LongAnswerInput } from "./LongAnswerInput";
import { MultipleChoiceInput } from "./MultipleChioceInput";
import { CheckboxInput } from "./CheckboxInput";
import { LocationInput } from "./LocationInput";
import { ImageInput } from "./ImageInput";
import { FileInput } from "./FileInput";
import { DateInput } from "./DateInput";

interface QuestionInputProps {
  question: Question;
  onUpdate: (id: string, updates: Partial<Question>) => void;
}

export function QuestionInput({ question, onUpdate }: QuestionInputProps) {
  switch (question.type) {
    case "short":
      return <ShortAnswerInput question={question} onUpdate={onUpdate} />;
    case "long":
      return <LongAnswerInput question={question} onUpdate={onUpdate} />;
    case "multiple":
      return <MultipleChoiceInput question={question} onUpdate={onUpdate} />;
    case "checkbox":
      return <CheckboxInput question={question} onUpdate={onUpdate} />;
    case "location":
      return <LocationInput question={question} onUpdate={onUpdate} />;
    case "image":
      return <ImageInput question={question} onUpdate={onUpdate} />;
    case "file":
      return <FileInput question={question} onUpdate={onUpdate} />;
    case "date":
      return <DateInput question={question} onUpdate={onUpdate} />;
    default:
      return null;
  }
}