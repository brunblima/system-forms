"use client";

import { useFormResponses } from "@/hooks/useFormResponses";
import { HeaderComponent } from "./HeaderComponent";
import { AllResponsesTab } from "./AllResponsesTab";
import { IndividualResponsesTab } from "./IndividualResponsesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FormResponsesPage() {
  const {
    formData,
    responseDates,
    selectedDate,
    setSelectedDate,
    selectedResponse,
    setSelectedResponse,
    activeMarker,
    setActiveMarker,
    isLoaded,
    loadError,
    exportToPDF,
    getResponseName,
    filteredResponses,
  } = useFormResponses();

  return (
    <div className="container mx-auto py-5">
      <HeaderComponent title={formData.title} onExport={exportToPDF} />
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-xl p-1 shadow-md">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            Todas as Respostas
          </TabsTrigger>
          <TabsTrigger
            value="individual"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            Respostas Individuais
          </TabsTrigger>
        </TabsList>
        <AllResponsesTab
          questions={formData.questions}
          responses={filteredResponses}
          isLoaded={isLoaded}
          loadError={loadError}
          activeMarker={activeMarker}
          setActiveMarker={setActiveMarker}
        />
        <IndividualResponsesTab
          responseDates={responseDates}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          filteredResponses={filteredResponses}
          getResponseName={getResponseName}
          setSelectedResponse={setSelectedResponse}
          selectedResponse={selectedResponse} // Certifique-se de que isso está aqui
          formData={formData}
          isLoaded={isLoaded}
          loadError={loadError}
          activeMarker={activeMarker}
          setActiveMarker={setActiveMarker}
        />
      </Tabs>
    </div>
  );
}
