import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Question, FormResponse } from "@/types/form";
import { format, parseISO } from "date-fns";

interface DateResponseRendererProps {
  question: Question;
  responses: FormResponse[];
  isAllResponses: boolean;
}

export function DateResponseRenderer({ question, responses, isAllResponses }: DateResponseRendererProps) {
  const responseArray = isAllResponses
    ? responses.map((r) => r.answers[question.id] || {}).filter(Boolean)
    : [responses[0].answers[question.id] || {}];

  return (
    <div className="max-h-64 overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/10 rounded-t-lg">
            <TableHead className="text-primary font-semibold">Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responseArray.map((answer, index) => (
            <TableRow key={index} className="hover:bg-muted/20">
              <TableCell>
                {answer.text ? format(parseISO(answer.text), "dd/MM/yyyy") : "Sem data"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}