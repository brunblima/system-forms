import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface AddQuestionButtonProps {
  onClick: () => void;
}

export function AddQuestionButton({ onClick }: AddQuestionButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant="outline"
      className="w-full py-8 border-dashed"
    >
      <PlusCircle className="h-5 w-5 mr-2" />
      Adicionar pergunta
    </Button>
  );
}