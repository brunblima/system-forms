import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Question, FormResponse } from "@/types/form";

interface ChoiceResponseRendererProps {
  question: Question;
  responses: FormResponse[];
  isAllResponses: boolean;
}

export function ChoiceResponseRenderer({ question, responses, isAllResponses }: ChoiceResponseRendererProps) {
  const responseArray = isAllResponses
    ? responses.map((r) => r.answers[question.id] || {}).filter(Boolean)
    : [responses[0].answers[question.id] || {}];

  if (isAllResponses) {
    const optionCounts = responseArray.reduce((acc: Record<string, number>, curr) => {
      const text = curr.text || "";
      const options = question.type === "multiple" && text.startsWith("[") ? JSON.parse(text) : [text];
      options.forEach((opt: string) => {
        acc[opt] = (acc[opt] || 0) + 1;
      });
      return acc;
    }, {});
    const chartData = Object.entries(optionCounts).map(([name, value]) => ({ name, value }));

    return (
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
            <YAxis stroke="hsl(var(--foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
            />
            <Bar
              dataKey="value"
              fill={question.type === "checkbox" ? "hsl(var(--chart-2))" : "hsl(var(--chart-1))"}
              radius={4}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-primary/10 rounded-t-lg">
          <TableHead className="text-primary font-semibold">Resposta</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {responseArray.map((answer, index) => (
          <TableRow key={index} className="hover:bg-muted/20">
            <TableCell>{answer.text || "Nenhuma resposta"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}