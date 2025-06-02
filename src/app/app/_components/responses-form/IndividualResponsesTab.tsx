import { TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { CalendarSelector } from "./CalendarSelector";
import { ResponseDetails } from "./ResponseDetails";
import { FormData, FormResponse } from "@/types/form";

// Definindo a interface das props do componente
interface IndividualResponsesTabProps {
  responseDates: Date[];
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  filteredResponses: FormResponse[];
  getResponseName: (response: FormResponse) => string;
  setSelectedResponse: (response: FormResponse | null) => void;
  selectedResponse: FormResponse | null; // Adicionado selectedResponse às props
  formData: FormData;
  isLoaded: boolean;
  loadError?: Error;
  activeMarker: number | null;
  setActiveMarker: (marker: number | null) => void;
}

// Definindo o componente com as props tipadas
export function IndividualResponsesTab({
  responseDates,
  selectedDate,
  setSelectedDate,
  filteredResponses,
  getResponseName,
  setSelectedResponse,
  selectedResponse, // Agora acessível como prop
  formData,
  isLoaded,
  loadError,
  activeMarker,
  setActiveMarker,
}: IndividualResponsesTabProps) {
  return (
    <TabsContent value="individual" className="pt-5">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-4">
          <Card className="shadow-md border-2 border-muted rounded-xl bg-background">
            <CardHeader className="bg-primary/10 rounded-t-lg">
              <CardTitle className="text-foreground">Respostas do dia</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <CalendarSelector
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                responseDates={responseDates}
              />
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
          <ResponseDetails
            selectedResponse={selectedResponse} // Passando a prop corretamente
            questions={formData.questions}
            isLoaded={isLoaded}
            loadError={loadError}
            activeMarker={activeMarker}
            setActiveMarker={setActiveMarker}
          />
        </div>
      </div>
    </TabsContent>
  );
}