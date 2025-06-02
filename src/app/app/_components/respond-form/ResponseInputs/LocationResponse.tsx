import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
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

export function LocationResponse({
  question,
  response,
  imageResponse,
  onCaptureLocation,
  onImageUpload,
  onRemoveImage,
}: ResponseInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          value={response ? `${response.latitude}, ${response.longitude}` : ""}
          readOnly
          placeholder="Latitude, Longitude"
          className="flex-grow"
        />
        <Button
          type="button"
          size="icon"
          onClick={() => onCaptureLocation(question.id)}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
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
