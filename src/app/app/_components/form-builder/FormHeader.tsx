import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormHeaderProps {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

export function FormHeader({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: FormHeaderProps) {
  return (
    <Card className="border-t-4 border-t-primary shadow-sm">
      <CardContent className="pt-6 space-y-4">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-2xl font-bold border-none px-3 focus-visible:ring-0"
          placeholder="Título do formulário"
        />
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="border-none resize-none focus-visible:ring-0"
          placeholder="Descrição do formulário"
        />
      </CardContent>
    </Card>
  );
}