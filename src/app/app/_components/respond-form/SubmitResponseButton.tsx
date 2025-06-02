import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitResponseButtonProps {
  submitting: boolean;
}

export function SubmitResponseButton({ submitting }: SubmitResponseButtonProps) {
  return (
    <Button type="submit" className="w-full" disabled={submitting}>
      {submitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
        </>
      ) : (
        "Enviar Resposta"
      )}
    </Button>
  );
}