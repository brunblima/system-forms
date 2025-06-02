import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface FormHeaderProps {
  title: string;
  description: string;
}

export function FormHeader({ title, description }: FormHeaderProps) {
  return (
    <Card className="border-t-8 border-t-primary mb-6">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}