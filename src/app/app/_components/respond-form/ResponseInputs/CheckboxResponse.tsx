import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
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

export function CheckboxResponse({
  question,
  response,
  imageResponse,
  onInputChange,
  onImageUpload,
  onRemoveImage,
}: ResponseInputProps) {
  const currentResponses = Array.isArray(response) ? response : [];

  return (
    <div className="space-y-4">
      {question.options && question.options.length > 0 && (
        <div className="space-y-2">
          {question.options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`${question.id}-${option}`}
                checked={currentResponses.includes(option)}
                onCheckedChange={(checked) => {
                  const next = checked
                    ? [...currentResponses, option]
                    : currentResponses.filter((v: string) => v !== option);
                  onInputChange(question.id, next);
                }}
              />
              <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
            </div>
          ))}
        </div>
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
