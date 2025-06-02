import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Question, FormResponse } from "@/types/form";
import { ResponseRenderer } from "./ResponseRenderers/ResponseRenderer";

interface ResponseDetailsProps {
  selectedResponse: FormResponse | null;
  questions: Question[];
  isLoaded: boolean;
  loadError?: Error;
  activeMarker: number | null;
  setActiveMarker: (marker: number | null) => void;
}

export function ResponseDetails({ selectedResponse, questions, isLoaded, loadError, activeMarker, setActiveMarker }: ResponseDetailsProps) {
  return (
    <Card className="shadow-md border-2 border-muted rounded-xl bg-background">
      <CardHeader className="bg-primary/10 rounded-t-lg">
        <CardTitle className="text-foreground">Detalhes da Resposta</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {selectedResponse ? (
          questions.map((question) => (
            <div key={question.id} className="mb-6 p-4 bg-primary/5 border-2 border-muted rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-foreground mb-2">{question.title}</h3>
              <ResponseRenderer
                question={question}
                responses={[selectedResponse]}
                isAllResponses={false}
                isLoaded={isLoaded}
                loadError={loadError}
                activeMarker={activeMarker}
                setActiveMarker={setActiveMarker}
              />
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-10">Selecione uma resposta para ver os detalhes</p>
        )}
      </CardContent>
    </Card>
  );
}