import { memo } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question } from "@/types/form";
import { ImageResponse } from "./ImageResponse";

interface ResponseInputProps {
  question: Question;
  response: any;
  imageResponse?: File;
  onInputChange: (questionId: string, value: any) => void;
  onImageUpload: (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onCaptureLocation: (questionId: string) => void;
  onRemoveImage: (questionId: string) => void;
}

export function MultipleChoiceResponse({
  question,
  response,
  imageResponse,
  onInputChange,
  onImageUpload,
  onRemoveImage,
}: ResponseInputProps) {
  return (
    <div className="space-y-4">
      {question.options && question.options.length > 0 && (
        <RadioGroup
          value={response || ""}
          onValueChange={(value) => onInputChange(question.id, value)}
        >
          {question.options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${question.id}-${option}`} />
              <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      )}
      {question.allowImage && (
        <ImageResponse
          question={question}
          imageResponse={imageResponse}
          onImageUpload={onImageUpload}
          onRemoveImage={onRemoveImage}
        />
      )}
    </div>
  );
}
