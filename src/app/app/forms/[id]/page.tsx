import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getFormResponses(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/forms/${id}/responses`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error("Failed to fetch form responses");
  }
  return res.json();
}

export default async function FormResponsesPage({
  params,
}: {
  params: { id: string };
}) {
  let formData;
  try {
    formData = await getFormResponses(params.id);
  } catch (error) {
    notFound();
  }

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">
        Respostas do Formulário: {formData.title}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Respostas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pergunta</TableHead>
                <TableHead>Respostas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.questions.map((question: any) => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium">
                    {question.title}
                  </TableCell>
                  <TableCell>
                    {question.responses.map((response: any, index: number) => (
                      <div key={index} className="mb-2">
                        {question.type === "file" ? (
                          <a
                            href={response}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Ver arquivo
                          </a>
                        ) : question.type === "location" ? (
                          `Latitude: ${response.latitude}, Longitude: ${response.longitude}`
                        ) : Array.isArray(response) ? (
                          response.join(", ")
                        ) : (
                          response
                        )}
                      </div>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
