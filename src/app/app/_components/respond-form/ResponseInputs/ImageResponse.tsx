import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Upload, XCircle } from "lucide-react";
import { Question } from "@/types/form";

interface ImageResponseProps {
  question: Question;
  imageResponse?: File;
  onImageUpload: (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (questionId: string) => void;
}

export function ImageResponse({
  question,
  imageResponse,
  onImageUpload,
  onRemoveImage,
}: ImageResponseProps) {
  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => document.getElementById(`image-${question.id}`)?.click()}
      >
        <Upload className="h-4 w-4 mr-2" /> Carregar imagem
      </Button>
      <input
        type="file"
        id={`image-${question.id}`}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => onImageUpload(question.id, e)}
      />
      {imageResponse && (
        <div className="relative mt-2 w-24 h-24">
          <img
            src={URL.createObjectURL(imageResponse)}
            alt="Imagem carregada"
            className="w-full h-full object-cover rounded-md"
          />
          <button
            type="button"
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
            onClick={() => onRemoveImage(question.id)}
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
