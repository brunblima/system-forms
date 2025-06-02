// src/components/form-builder/QuestionInputs/DateInput.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Question } from "@/types/form";
import { TypeSelector } from "./TypeSelector";

interface DateInputProps {
  question: Question;
  onUpdate: (id: string, updates: Partial<Question>) => void;
}

export function DateInput({ question, onUpdate }: DateInputProps) {
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
      <div className="pl-4 border-l-2 border-gray-200">
        <Input type="date" disabled placeholder="Escolha uma data" />
      </div>
    </div>
  );
}