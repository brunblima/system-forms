import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { Question, FormResponse } from "@/types/form";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

interface LocationResponseRendererProps {
  question: Question;
  responses: FormResponse[];
  isAllResponses: boolean;
  isLoaded: boolean;
  loadError?: Error;
  activeMarker: number | null;
  setActiveMarker: (marker: number | null) => void;
}

export function LocationResponseRenderer({
  question,
  responses,
  isAllResponses,
  isLoaded,
  loadError,
  activeMarker,
  setActiveMarker,
}: LocationResponseRendererProps) {
  const responseArray = isAllResponses
    ? responses.map((r) => r.answers[question.id] || {}).filter(Boolean)
    : [responses[0].answers[question.id] || {}];

  const locations = responseArray
    .map((answer) => {
      if (!answer.location) return null;
      const parsed = JSON.parse(answer.location);
      return {
        lat: parsed.latitude,
        lng: parsed.longitude,
        image: answer.image || null,
      };
    })
    .filter(Boolean) as { lat: number; lng: number; image: string | null }[];

  if (locations.length === 0) return <p className="text-muted-foreground">Sem localização</p>;

  return (
    <div className="relative h-64 w-full rounded-xl overflow-hidden shadow-md">
      {isLoaded && !loadError ? (
        <GoogleMap mapContainerStyle={mapContainerStyle} center={locations[0]} zoom={13}>
          {locations.map((loc, index) => (
            <Marker key={index} position={loc} onClick={() => setActiveMarker(index)}>
              {activeMarker === index && (
                <InfoWindow position={loc} onCloseClick={() => setActiveMarker(null)}>
                  {loc.image ? (
                    <a href={loc.image} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      Ver Imagem
                    </a>
                  ) : (
                    <p>Sem imagem</p>
                  )}
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      ) : (
        <p className="text-muted-foreground">{loadError ? "Erro ao carregar mapa" : "Carregando mapa..."}</p>
      )}
    </div>
  );
}