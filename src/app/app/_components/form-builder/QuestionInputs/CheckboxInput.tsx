// src/components/form-builder/QuestionInputs/CheckboxInput.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import { Question } from "@/types/form";
import { TypeSelector } from "./TypeSelector";

interface CheckboxInputProps {
  question: Question;
  onUpdate: (id: string, updates: Partial<Question>) => void;
}

export function CheckboxInput({ question, onUpdate }: CheckboxInputProps) {
  const options = question.options || [];

  const addOption = () => {
    const newOptions = [...options, `Opção ${options.length + 1}`];
    onUpdate(question.id, { options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onUpdate(question.id, { options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onUpdate(question.id, { options: newOptions });
  };

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
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border border-gray-300" />
            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeOption(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          className="text-sm"
          onClick={addOption}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar opção
        </Button>
      </div>
    </div>
  );
}