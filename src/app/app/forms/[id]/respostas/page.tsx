"use client";

import { useState, useEffect, useMemo } from "react";
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
import { CalendarIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Importação correta do plugin

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

function MapWrapper({ children }: { children: React.ReactNode }) {
  return <div className="relative h-64 w-full rounded-xl overflow-hidden shadow-md">{children}</div>;
}

interface Question {
  id: string;
  title: string;
  type: string;
  allowImage: boolean;
  isRequired: boolean;
  options?: Record<string, any>;
}

interface FormData {
  id: string;
  title: string;
  questions: Question[];
}

interface FormResponse {
  id: string;
  date: string;
  answers: Record<string, { text?: string; image?: string; location?: string }>;
}

export default function FormResponsesPage() {
  const [formData, setFormData] = useState<FormData>({ id: "", title: "", questions: [] });
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
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/forms/${params.id}/respostas`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch responses");
        const data = await response.json();
        setFormData(data);
        setResponses(data.responses);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as respostas.",
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, [params.id, toast]);

  const responseDates = useMemo(() => responses.map((r) => parseISO(r.date)), [responses]);

  const getResponseName = (response: FormResponse): string => {
    const firstQuestion = formData.questions[0];
    if (!firstQuestion) return "Sem nome";
    const answer = response.answers[firstQuestion.id];
    return answer?.text || "Sem nome";
  };

  const filteredResponses = useMemo(() => {
    if (!selectedDate) return responses;
    return responses.filter((r) => isSameDay(parseISO(r.date), selectedDate));
  }, [responses, selectedDate]);

  const renderResponses = (question: Question, responseData?: FormResponse, isAllResponses: boolean = false) => {
    const responseArray = responseData
      ? [responseData.answers[question.id] || {}]
      : responses.map((r) => r.answers[question.id] || {}).filter(Boolean);

    switch (question.type) {
      case "short":
      case "long":
        return (
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
                        "Sem imagem"
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case "date":
        return (
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
        );
      case "checkbox":
      case "multiple":
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
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }} />
                  <Bar dataKey="value" fill={question.type === "checkbox" ? "hsl(var(--chart-2))" : "hsl(var(--chart-1))"} radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        }
        return (
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/10 rounded-t-lg">
                <TableHead className="text-primary font-semibold">Seleção</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responseArray.map((answer, index) => (
                <TableRow key={index} className="hover:bg-muted/20">
                  <TableCell>{answer.text || "Nenhuma seleção"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
      case "location":
        const locations = responseArray
          .map((answer) => {
            if (!answer.location) return null;
            const parsed = JSON.parse(answer.location);
            return { lat: parsed.latitude, lng: parsed.longitude, image: answer.image || null };
          })
          .filter(Boolean) as { lat: number; lng: number; image: string | null }[];
        if (locations.length === 0) return <p className="text-muted-foreground">Sem localização</p>;
        return (
          <MapWrapper>
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
          </MapWrapper>
        );
      case "image":
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
      default:
        return <p className="text-muted-foreground">Tipo de pergunta não suportado</p>;
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Relatório de Respostas: ${formData.title || "Formulário"}`, 14, 22);

      let yOffset = 30;
      formData.questions.forEach((question, qIndex) => {
        // Título da pergunta
        doc.setFontSize(14);
        doc.text(`${qIndex + 1}. ${question.title}`, 14, yOffset);
        yOffset += 8;

        // Dados da tabela
        const tableData = responses.map((response, rIndex) => {
          const answer = response.answers[question.id] || {};
          let responseText = answer.text || "Sem resposta";
          if (question.type === "location" && answer.location) {
            try {
              const loc = JSON.parse(answer.location);
              responseText = `${loc.latitude}, ${loc.longitude}`;
            } catch {
              responseText = "Localização inválida";
            }
          }
          const imageText = (question.allowImage || question.type === "image") && answer.image ? answer.image : "Sem imagem";
          return [rIndex + 1, responseText, question.allowImage || question.type === "image" ? imageText : "-"];
        });

        // Geração da tabela
        autoTable(doc, {
          startY: yOffset,
          head: [["#", question.type === "location" ? "Localização" : "Resposta", question.allowImage || question.type === "image" ? "Imagem" : ""]],
          body: tableData,
          theme: "striped",
          headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255] },
          styles: { fontSize: 10, cellPadding: 2 },
          margin: { top: 30 },
        });

        // Atualizar yOffset
        yOffset = (doc as any).lastAutoTable.finalY + 15;
      });

      doc.save(`relatorio_respostas_${formData.id || "formulario"}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-5">
      <Card className="mb-6 shadow-lg border-0 bg-gradient-to-r from-background to-secondary rounded-xl">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-3xl text-foreground">Respostas do Formulário: {formData.title}</CardTitle>
          <Button
            onClick={exportToPDF}
            className="bg-accent text-accent-foreground hover:bg-accent/90 border-2 border-accent rounded-lg shadow-sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </CardHeader>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-xl p-1 shadow-md">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Todas as Respostas</TabsTrigger>
          <TabsTrigger value="individual" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Respostas Individuais</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="pt-5">
          {formData.questions.map((question) => (
            <Card key={question.id} className="mb-6 shadow-md border-2 border-muted rounded-xl bg-background">
              <CardHeader className="bg-primary/10 rounded-t-lg">
                <CardTitle className="text-foreground">{question.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">{renderResponses(question, undefined, true)}</CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="individual" className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="col-span-1 md:col-span-4">
              <Card className="shadow-md border-2 border-muted rounded-xl bg-background">
                <CardHeader className="bg-primary/10 rounded-t-lg">
                  <CardTitle className="text-foreground">Respostas do dia</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-primary/10 hover:bg-primary/20 border-2 border-muted rounded-lg shadow-sm",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-accent" />
                        {selectedDate ? format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background border-2 border-muted rounded-lg shadow-md" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        modifiers={{ highlighted: responseDates }}
                        modifiersStyles={{ highlighted: { backgroundColor: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" } }}
                        locale={ptBR}
                        className="bg-background text-foreground rounded-lg"
                      />
                    </PopoverContent>
                  </Popover>
                  {selectedDate && (
                    <div className="mt-4 max-h-[400px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-primary/10 rounded-t-lg">
                            <TableHead className="text-primary font-semibold">Hora</TableHead>
                            <TableHead className="text-primary font-semibold">Nome</TableHead>
                            <TableHead className="text-primary font-semibold">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredResponses.map((response) => (
                            <TableRow key={response.id} className="hover:bg-muted/20">
                              <TableCell>{format(parseISO(response.date), "HH:mm")}</TableCell>
                              <TableCell>{getResponseName(response)}</TableCell>
                              <TableCell>
                                <Button
                                  onClick={() => setSelectedResponse(response)}
                                  className="bg-accent text-accent-foreground hover:bg-accent/90 border-2 border-accent rounded-lg shadow-sm"
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
            </div>
            <div className="col-span-1 md:col-span-8">
              <Card className="shadow-md border-2 border-muted rounded-xl bg-background">
                <CardHeader className="bg-primary/10 rounded-t-lg">
                  <CardTitle className="text-foreground">Detalhes da Resposta</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {selectedResponse ? (
                    formData.questions.map((question) => (
                      <div key={question.id} className="mb-6 p-4 bg-primary/5 border-2 border-muted rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium text-foreground mb-2">{question.title}</h3>
                        {renderResponses(question, selectedResponse)}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-10">Selecione uma resposta para ver os detalhes</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}