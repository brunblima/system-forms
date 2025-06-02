import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageIcon, Type } from "lucide-react";
import { Question } from "@/types/form";
import { UploadInput } from "../UploadInput";
import { TypeSelector } from "./TypeSelector";

interface ShortAnswerInputProps {
  question: Question;
  onUpdate: (id: string, updates: Partial<Question>) => void;
}

export function ShortAnswerInput({ question, onUpdate }: ShortAnswerInputProps) {
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
        <Label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={question.allowImage}
            onChange={(e) => onUpdate(question.id, { allowImage: e.target.checked })}
            className="rounded border-gray-300"
          />
          <ImageIcon className="h-4 w-4" />
          Permitir imagem
        </Label>
      </div>
      <div className="pl-4 border-l-2 border-gray-200">
        <Input disabled placeholder="Resposta curta" />
      </div>
      {question.allowImage && (
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
      )}
    </div>
  );
}