import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { FormData, FormResponse } from "@/types/form";
import { parseISO, isSameDay } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useJsApiLoader } from "@react-google-maps/api";

export function useFormResponses() {
  const [formData, setFormData] = useState<FormData>({
    id: "",
    title: "",
    description: "",
    questions: [],
  });
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const { toast } = useToast();
  const params = useParams();

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    version: "weekly",
    language: "pt-BR",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/forms/${params.id}/respostas`, {
          cache: "no-store",
        });
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

  const getResponseName = useCallback((response: FormResponse): string => {
    const firstQuestion = formData.questions[0];
    if (!firstQuestion) return "Sem nome";
    const answer = response.answers[firstQuestion.id];
    return answer?.text || "Sem nome";
  }, [formData.questions]);

  const filteredResponses = useMemo(() => {
    if (!selectedDate) return responses;
    return responses.filter((r) => isSameDay(parseISO(r.date), selectedDate));
  }, [responses, selectedDate]);

  const exportToPDF = useCallback(() => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Relatório de Respostas: ${formData.title || "Formulário"}`, 14, 22);

      let yOffset = 30;
      formData.questions.forEach((question, qIndex) => {
        doc.setFontSize(14);
        doc.text(`${qIndex + 1}. ${question.title}`, 14, yOffset);
        yOffset += 8;

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
          const imageText =
            (question.allowImage || question.type === "image") && answer.image
              ? answer.image
              : "Sem imagem";
          return [
            rIndex + 1,
            responseText,
            question.allowImage || question.type === "image" ? imageText : "-",
          ];
        });

        autoTable(doc, {
          startY: yOffset,
          head: [
            [
              "#",
              question.type === "location" ? "Localização" : "Resposta",
              question.allowImage || question.type === "image" ? "Imagem" : "",
            ],
          ],
          body: tableData,
          theme: "striped",
          headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255] },
          styles: { fontSize: 10, cellPadding: 2 },
          margin: { top: 30 },
        });

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
  }, [formData, responses, toast]);

  return {
    formData,
    responses,
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
  };
}