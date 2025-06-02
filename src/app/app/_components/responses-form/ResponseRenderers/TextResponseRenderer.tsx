import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Question, FormResponse } from "@/types/form";

interface TextResponseRendererProps {
  question: Question;
  responses: FormResponse[];
  isAllResponses: boolean;
}

export function TextResponseRenderer({ question, responses, isAllResponses }: TextResponseRendererProps) {
  const responseArray = isAllResponses
    ? responses.map((r) => r.answers[question.id] || {}).filter(Boolean)
    : [responses[0].answers[question.id] || {}];

  return (
    <div className="max-h-64 overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/10 rounded-t-lg">
            <TableHead className="text-primary font-semibold">Resposta</TableHead>
            {question.allowImage && <TableHead className="text-primary font-semibold">Imagem</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {responseArray.map((answer, index) => (
            <TableRow key={index} className="hover:bg-muted/20">
              <TableCell>{answer.text || "Sem texto"}</TableCell>
              {question.allowImage && (
                <TableCell>
                  {answer.image ? (
                    <a href={answer.image} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      Ver Imagem
                    </a>
                  ) : (
                    "Imagem não enviada"
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}