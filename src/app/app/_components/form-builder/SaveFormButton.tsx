import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SaveFormButtonProps {
  onClick: () => void;
  isSaving: boolean;
}

export function SaveFormButton({ onClick, isSaving }: SaveFormButtonProps) {
  return (
    <Button onClick={onClick} className="w-full" disabled={isSaving}>
      {isSaving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Salvando...
        </>
      ) : (
        "Salvar Formulário"
      )}
    </Button>
  );
}
