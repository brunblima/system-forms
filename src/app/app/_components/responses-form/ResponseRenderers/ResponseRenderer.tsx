import { Question, FormResponse } from "@/types/form";
import { TextResponseRenderer } from "./TextResponseRenderer";
import { DateResponseRenderer } from "./DateResponseRenderer";
import { ChoiceResponseRenderer } from "./ChoiceResponseRenderer";
import { LocationResponseRenderer } from "./LocationResponseRenderer";
import { ImageResponseRenderer } from "./ImageResponseRenderer";

interface ResponseRendererProps {
  question: Question;
  responses: FormResponse[];
  isAllResponses: boolean;
  isLoaded: boolean;
  loadError?: Error;
  activeMarker: number | null;
  setActiveMarker: (marker: number | null) => void;
}

export function ResponseRenderer({
  question,
  responses,
  isAllResponses,
  isLoaded,
  loadError,
  activeMarker,
  setActiveMarker,
}: ResponseRendererProps) {
  switch (question.type) {
    case "short":
    case "long":
      return <TextResponseRenderer question={question} responses={responses} isAllResponses={isAllResponses} />;
    case "date":
      return <DateResponseRenderer question={question} responses={responses} isAllResponses={isAllResponses} />;
    case "checkbox":
    case "multiple":
      return <ChoiceResponseRenderer question={question} responses={responses} isAllResponses={isAllResponses} />;
    case "location":
      return (
        <LocationResponseRenderer
          question={question}
          responses={responses}
          isAllResponses={isAllResponses}
          isLoaded={isLoaded}
          loadError={loadError}
          activeMarker={activeMarker}
          setActiveMarker={setActiveMarker}
        />
      );
    case "image":
      return <ImageResponseRenderer question={question} responses={responses} isAllResponses={isAllResponses} />;
    default:
      return <p className="text-muted-foreground">Tipo de pergunta não suportado</p>;
  }
}