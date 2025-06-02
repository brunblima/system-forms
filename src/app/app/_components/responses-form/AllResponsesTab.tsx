import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Question, FormResponse } from "@/types/form";
import { ResponseRenderer } from "./ResponseRenderers/ResponseRenderer";

interface AllResponsesTabProps {
  questions: Question[];
  responses: FormResponse[];
  isLoaded: boolean;
  loadError?: Error;
  activeMarker: number | null;
  setActiveMarker: (marker: number | null) => void;
}

export function AllResponsesTab({ questions, responses, isLoaded, loadError, activeMarker, setActiveMarker }: AllResponsesTabProps) {
  return (
    <TabsContent value="all" className="pt-5">
      {questions.map((question) => (
        <Card key={question.id} className="mb-6 shadow-md border-2 border-muted rounded-xl bg-background">
          <CardHeader className="bg-primary/10 rounded-t-lg">
            <CardTitle className="text-foreground">{question.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponseRenderer
              question={question}
              responses={responses}
              isAllResponses={true}
              isLoaded={isLoaded}
              loadError={loadError}
              activeMarker={activeMarker}
              setActiveMarker={setActiveMarker}
            />
          </CardContent>
        </Card>
      ))}
    </TabsContent>
  );
}