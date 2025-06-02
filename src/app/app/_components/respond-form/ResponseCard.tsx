import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Question } from "@/types/form";
import { ResponseInput } from "./ResponseInputs/ResponseInput";

interface ResponseCardProps {
  question: Question;
  response: any;
  imageResponse?: File;
  onInputChange: (questionId: string, value: any) => void;
  onImageUpload: (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onCaptureLocation: (questionId: string) => void;
  onRemoveImage: (questionId: string) => void;
}

export function ResponseCard({
  question,
  response,
  imageResponse,
  onInputChange,
  onImageUpload,
  onCaptureLocation,
  onRemoveImage,
}: ResponseCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Label htmlFor={question.id} className="text-lg font-medium">
          {question.title}
          {question.isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="mt-4 space-y-4">
          <ResponseInput
            question={question}
            response={response}
            imageResponse={imageResponse}
            onInputChange={onInputChange}
            onImageUpload={onImageUpload}
            onCaptureLocation={onCaptureLocation}
            onRemoveImage={onRemoveImage}
          />
        </div>
      </CardContent>
    </Card>
  );
}