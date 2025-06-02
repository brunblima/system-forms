import { memo } from "react";
import { Textarea } from "@/components/ui/textarea";
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

export function LongAnswerResponse({
  question,
  response,
  imageResponse,
  onInputChange,
  onImageUpload,
  onRemoveImage,
}: ResponseInputProps) {
  return (
    <div className="space-y-4">
      <Textarea
        id={question.id}
        value={response || ""}
        onChange={(e) => onInputChange(question.id, e.target.value)}
      />
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

