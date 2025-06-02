import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface HeaderComponentProps {
  title: string;
  onExport: () => void;
}

export function HeaderComponent({ title, onExport }: HeaderComponentProps) {
  return (
    <Card className="mb-6 shadow-lg border-0 bg-gradient-to-r from-background to-secondary rounded-xl">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-3xl text-foreground">Respostas do Formulário: {title}</CardTitle>
        <Button
          onClick={onExport}
          className="bg-accent text-accent-foreground hover:bg-accent/90 border-2 border-accent rounded-lg shadow-sm"
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </CardHeader>
    </Card>
  );
}