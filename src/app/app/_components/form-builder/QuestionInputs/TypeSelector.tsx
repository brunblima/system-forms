// src/components/form-builder/QuestionInputs/TypeSelector.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionType } from "@/types/form";
import { Type, AlignLeft, List, CheckSquare, MapPin, ImageIcon, FileIcon, Calendar } from "lucide-react";

interface TypeSelectorProps {
  value: QuestionType;
  onChange: (value: QuestionType) => void;
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="max-w-44">
        <SelectValue placeholder="Tipo de resposta" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="short">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span>Resposta curta</span>
          </div>
        </SelectItem>
        <SelectItem value="long">
          <div className="flex items-center gap-2">
            <AlignLeft className="h-4 w-4" />
            <span>Resposta longa</span>
          </div>
        </SelectItem>
        <SelectItem value="multiple">
          <div className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span>Múltipla escolha</span>
          </div>
        </SelectItem>
        <SelectItem value="checkbox">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            <span>Caixas de seleção</span>
          </div>
        </SelectItem>
        <SelectItem value="location">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Localização</span>
          </div>
        </SelectItem>
        <SelectItem value="image">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span>Imagem</span>
          </div>
        </SelectItem>
        <SelectItem value="file">
          <div className="flex items-center gap-2">
            <FileIcon className="h-4 w-4" />
            <span>Upload de arquivo</span>
          </div>
        </SelectItem>
        <SelectItem value="date">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Data</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}