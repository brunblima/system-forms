"use client";

import { useState, useEffect, useMemo, Key } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isSameDay, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

function MapWrapper({ children }: { children: React.ReactNode }) {
  return <div className="relative h-64 w-full">{children}</div>;
}

interface FormData {
  id: string;
  title: string;
  questions: {
    id: string;
    title: string;
    type: string;
    allowImage: boolean;
    isRequired: boolean;
    options?: Record<string, any>;
  }[];
}

interface FormResponse {
  id: string;
  date: string;
  [key: string]: any;
}

export default function FormResponsesPage() {
  const [formData, setFormData] = useState<FormData>({
    id: "",
    title: "",
    questions: [],
  });
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const { toast } = useToast();
  const params = useParams();
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    version: "weekly",
    language: "pt-BR",
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(
    null
  );
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/forms/${params.id}/respostas`);
        if (!response.ok) {
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do formulário.",
            variant: "destructive",
          });
          return;
        }

        const data = await response.json();
        setFormData(data);
        setResponses(data.responses);
      } catch (error) {
        console.error("Erro ao buscar os dados do formulário:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do formulário.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [params.id, toast]);

  const responseDates = useMemo(() => {
    return responses.map((response) => parseISO(response.date));
  }, [responses]);

  const getFirstResponseName = (responses: FormResponse[]): string => {
    if (responses.length === 0) return "Sem nome";

    // Pega a primeira resposta
    const firstResponse = responses[0];
    const firstKey = Object.keys(firstResponse).find(
      (key) => key !== "date" && key !== "id"
    );

    if (firstKey && firstResponse[firstKey]?.text) {
      return firstResponse[firstKey].text;
    }

    return "Sem nome";
  };

  const filteredResponses = useMemo(() => {
    if (!selectedDate) return [];
    return responses.filter((response) => {
      return isSameDay(parseISO(response.date), selectedDate);
    });
  }, [responses, selectedDate]);

  const firstResponderName = useMemo(
    () => getFirstResponseName(filteredResponses),
    [filteredResponses]
  );

  const renderResponses = (
    question: { id: string; title: string; type: string; allowImage: boolean },
    responseData?: FormResponse
  ) => {
    const responseArray = Array.isArray(responseData?.[question.id])
      ? responseData?.[question.id]
      : responseData?.[question.id]
      ? [responseData[question.id]]
      : responses.map((r) => r[question.id] || []).flat();

    switch (question.type) {
      case "short":
      case "long":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resposta</TableHead>
                {question.allowImage && <TableHead>Imagem</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {responseArray.map((answer: any, index: number) => {
                const { text = "Sem texto", image } =
                  typeof answer === "object" ? answer : { text: answer };

                return (
                  <TableRow key={index}>
                    <TableCell>{text}</TableCell>
                    <TableCell>
                      {image ? (
                        <a
                          href={image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Ver Imagem
                        </a>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        );
      case "multiple":
        // Contabiliza múltiplas respostas por usuário
        const multipleData = responseArray.reduce((acc: any, curr: any) => {
          const keys = Array.isArray(curr) ? curr : [curr]; // Suporte a várias respostas
          keys.forEach((key) => {
            const text =
              typeof key === "object" && key !== null ? key.text : key; // Extrai texto se for objeto
            acc[text] = (acc[text] || 0) + 1;
          });
          return acc;
        }, {});
        const multipleChartData = Object.entries(multipleData).map(
          ([name, value]) => ({
            name,
            value,
          })
        );

        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={multipleChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case "checkbox":
        // Conta apenas uma resposta por usuário
        const checkboxData = responseArray.reduce((acc: any, curr: any) => {
          const key = Array.isArray(curr) ? curr[0] : curr; // Considera apenas a primeira resposta
          const text = typeof key === "object" && key !== null ? key.text : key; // Extrai texto se for objeto
          acc[text] = (acc[text] || 0) + 1;
          return acc;
        }, {});
        const checkboxChartData = Object.entries(checkboxData).map(
          ([name, value]) => ({
            name,
            value,
          })
        );

        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={checkboxChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case "location":
        const locations = responseArray
          .map((response: { location: string; image?: string }) => {
            if (!response || !response.location) return null;
            try {
              const parsed = JSON.parse(response.location);
              if (
                typeof parsed.latitude === "number" &&
                typeof parsed.longitude === "number"
              ) {
                return {
                  lat: parsed.latitude,
                  lng: parsed.longitude,
                  image: response.image || null,
                };
              }
              return null;
            } catch (error) {
              console.error(
                "Erro ao parsear localização:",
                error,
                response.location
              );
              return null;
            }
          })
          .filter(
            (
              loc: any
            ): loc is { lat: number; lng: number; image: string | null } =>
              loc !== null
          );

        if (locations.length === 0)
          return <p>Nenhuma localização registrada</p>;

        const handleMarkerClick = (index: number) => {
          setActiveMarker((prev) => (prev === index ? null : index));
        };

        const center = locations[0];

        return (
          <MapWrapper>
            {loadError && (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">
                  Erro ao carregar o mapa. Por favor, verifique a chave da API.
                </p>
              </div>
            )}
            {!isLoaded ? (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Carregando mapa...</p>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={13}
                options={{
                  gestureHandling: "cooperative",
                  disableDefaultUI: true,
                  zoomControl: true,
                }}
              >
                {locations.map(
                  (
                    location: {
                      lat: number;
                      lng: number;
                      image: string | null;
                    },
                    index: number
                  ) => (
                    <Marker
                      key={index}
                      position={location}
                      onClick={() => handleMarkerClick(index)}
                    >
                      {activeMarker === index && (
                        <InfoWindow
                          position={location}
                          onCloseClick={() => setActiveMarker(null)}
                        >
                          {location.image ? (
                            <a
                              href={location.image}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              Ver Imagem
                            </a>
                          ) : (
                            <p>Sem imagem</p>
                          )}
                        </InfoWindow>
                      )}
                    </Marker>
                  )
                )}
              </GoogleMap>
            )}
          </MapWrapper>
        );

      case "file":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Arquivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responseArray.map(
                (
                  response: string | undefined,
                  index: Key | null | undefined
                ) => (
                  <TableRow key={index}>
                    <TableCell>
                      <a
                        href={response}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Ver arquivo {(index as number) + 1}
                      </a>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        );
      case "image":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resposta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responseArray.map(
                (
                  answer: { image: string | undefined },
                  index: Key | null | undefined
                ) => (
                  <TableRow key={index}>
                    <TableCell>
                      {answer.image ? (
                        <a
                          href={answer.image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Ver Imagem
                        </a>
                      ) : (
                        "Sem imagem"
                      )}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        );

      default:
        return <p>Tipo de pergunta não suportado</p>;
    }
  };

  return (
    <div className="container mx-auto py-5">
      <Card className="border-t-8 border-t-primary mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">
            Respostas do Formulário: {formData.title}
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">Todas as Respostas</TabsTrigger>
          <TabsTrigger value="individual">Respostas Individuais</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="pt-5">
          {formData.questions.map((question) => (
            <Card key={question.id} className="mb-6">
              <CardHeader>
                <CardTitle>{question.title}</CardTitle>
              </CardHeader>
              <CardContent>{renderResponses(question)}</CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="individual" className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1 md:col-span-1">
              <CardHeader>
                <CardTitle className="truncate">Respostas do dia</CardTitle>
              </CardHeader>
              <CardContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal truncate",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "d 'de' MMMM 'de' yyyy", {
                          locale: ptBR,
                        })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      modifiers={{
                        highlighted: responseDates,
                      }}
                      modifiersStyles={{
                        highlighted: {
                          backgroundColor: "#0284c7",
                          color: "white",
                        },
                      }}
                      locale={ptBR}
                      formatters={{
                        formatCaption: (date) =>
                          format(date, "LLLL yyyy", { locale: ptBR }),
                        formatWeekdayName: (date) =>
                          format(date, "EEEEE", { locale: ptBR }),
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {selectedDate && (
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Hora</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResponses.map((response) => (
                          <TableRow key={response.id}>
                            <TableCell>
                              {format(parseISO(response.date), "HH:mm")}
                            </TableCell>
                            <TableCell>
                              {response.id === filteredResponses[0]?.id
                                ? firstResponderName
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <Button
                                onClick={() => setSelectedResponse(response)}
                              >
                                Ver
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Detalhes da Resposta</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedResponse ? (
                  formData.questions.map((question) => (
                    <Card key={question.id} className="mb-6">
                      <CardHeader>
                        <CardTitle>{question.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderResponses(question, selectedResponse)}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">
                    Selecione uma resposta para ver os detalhes
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
