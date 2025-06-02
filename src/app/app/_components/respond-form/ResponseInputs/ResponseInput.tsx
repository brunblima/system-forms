import { memo } from "react";
import { Question } from "@/types/form";
import { ShortAnswerResponse } from "./ShortAnswerResponse";
import { LongAnswerResponse } from "./LongAnswerResponse";
import { MultipleChoiceResponse } from "./MultipleChoiceResponse";
import { CheckboxResponse } from "./CheckboxResponse";
import { LocationResponse } from "./LocationResponse";
import { ImageResponse } from "./ImageResponse";
import { DateResponse } from "./DataResponse";

interface ResponseInputProps {
  question: Question;
  response: any;
  imageResponse?: File;
  onInputChange: (questionId: string, value: any) => void;
  onImageUpload: (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onCaptureLocation: (questionId: string) => void;
  onRemoveImage: (questionId: string) => void;
}

export function ResponseInput({
  question,
  response,
  imageResponse,
  onInputChange,
  onImageUpload,
  onCaptureLocation,
  onRemoveImage,
}: ResponseInputProps) {
  const props = {
    question,
    response,
    imageResponse,
    onInputChange,
    onImageUpload,
    onCaptureLocation,
    onRemoveImage,
  };

  switch (question.type.toLowerCase()) {
    case "short":
      return <ShortAnswerResponse {...props} />;
    case "long":
      return <LongAnswerResponse {...props} />;
    case "checkbox":
      return <MultipleChoiceResponse {...props} />;
    case "multiple":
      return <CheckboxResponse {...props} />;
    case "location":
      return <LocationResponse {...props} />;
    case "image":
      return <ImageResponse {...props} />;
    case "date":
      return <DateResponse {...props} />;
    default:
      return null;
  }
}
