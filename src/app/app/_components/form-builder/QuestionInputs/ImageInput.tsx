// src/components/form-builder/QuestionInputs/ImageInput.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Question } from "@/types/form";
import { UploadInput } from "../UploadInput";
import { TypeSelector } from "./TypeSelector";

interface ImageInputProps {
  question: Question;
  onUpdate: (id: string, updates: Partial<Question>) => void;
}

export function ImageInput({ question, onUpdate }: ImageInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          value={question.title}
          onChange={(e) => onUpdate(question.id, { title: e.target.value })}
          placeholder="Pergunta"
          className="text-lg flex-1"
        />
        <TypeSelector value={question.type} onChange={(value) => onUpdate(question.id, { type: value })} />
      </div>
      <div className="flex items-center gap-2">
        <Label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={question.isRequired}
            onChange={(e) => onUpdate(question.id, { isRequired: e.target.checked })}
            className="rounded border-gray-300"
          />
          Obrigatória
        </Label>
      </div>
      <UploadInput
        accept="image/*"
        onFileSelect={(file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            onUpdate(question.id, { imageUrl: reader.result as string });
          };
          reader.readAsDataURL(file);
        }}
        preview={question.imageUrl && (
          <img src={question.imageUrl} alt="Preview" className="max-w-full h-auto rounded-md" />
        )}
      />
    </div>
  );
}