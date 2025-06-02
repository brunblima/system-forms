import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";
import { Question } from "@/types/form";
import { QuestionInput } from "./QuestionInputs/QuestionInput";

interface QuestionCardProps {
  question: Question;
  onUpdate: (id: string, updates: Partial<Question>) => void;
  onDelete: (id: string) => void;
}

export function QuestionCard({
  question,
  onUpdate,
  onDelete,
}: QuestionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: question.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!question) {
    return null; // Isso está OK, desde que venha após o hook
  }
  
  return (
    <Card ref={setNodeRef} style={style} className="relative mb-4 shadow-sm">
      <div
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      <CardContent className="pt-6 pl-10 space-y-4">
        <QuestionInput question={question} onUpdate={onUpdate} />
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(question.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
