import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Question, FormResponse } from "@/types/form";

interface ImageResponseRendererProps {
  question: Question;
  responses: FormResponse[];
  isAllResponses: boolean;
}

export function ImageResponseRenderer({ question, responses, isAllResponses }: ImageResponseRendererProps) {
  const responseArray = isAllResponses
    ? responses.map((r) => r.answers[question.id] || {}).filter(Boolean)
    : [responses[0].answers[question.id] || {}];

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-primary/10 rounded-t-lg">
          <TableHead className="text-primary font-semibold">Imagem</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {responseArray.map((answer, index) => (
          <TableRow key={index} className="hover:bg-muted/20">
            <TableCell>
              {answer.image ? (
                <a href={answer.image} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  Ver Imagem
                </a>
              ) : (
                "Sem imagem"
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}