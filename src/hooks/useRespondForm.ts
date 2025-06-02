import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { FormData, Question } from "@/types/form";
import imageCompression from "browser-image-compression";

export function useRespondForm(initialData?: FormData) {
  const [formData, setFormData] = useState<FormData>({
    id: "",
    title: "",
    description: "",
    questions: [],
  });
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [imageResponses, setImageResponses] = useState<Record<string, File>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchForm() {
      if (initialData) {
        setFormData(initialData);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await fetch(`/api/getForms/${params.id}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch form data");
        const data = await res.json();
        const questionsWithOptions = data.questions.map((q: Question) => {
          const normalizedType = q.type.toLowerCase();
          let normalizedOptions: string[] = [];
          if (["checkbox", "multiple"].includes(normalizedType)) {
            normalizedOptions = Array.isArray(q.options)
              ? q.options.filter((opt) => opt.trim() !== "")
              : [];
          }
          return {
            ...q,
            type: normalizedType,
            options: normalizedOptions,
          };
        });
        setFormData({ ...data, questions: questionsWithOptions });
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast({
          title: "Erro ao carregar o formulário",
          description: "Não foi possível carregar os dados do formulário.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchForm();
  }, [params.id, toast, initialData]);

  const handleInputChange = useCallback((questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleImageUpload = useCallback(
    async (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressed = await imageCompression(file, options);
        if (compressed.size > 5 * 1024 * 1024) {
          toast({
            title: "Erro",
            description: "Imagem ainda maior que 5MB após compressão.",
            variant: "destructive",
          });
          return;
        }
        setImageResponses((prev) => ({
          ...prev,
          [questionId]: compressed as File,
        }));
      } catch (err) {
        console.error("Erro ao compactar imagem:", err);
        toast({
          title: "Erro",
          description: "Falha ao processar a imagem.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const captureLocation = useCallback(
    (questionId: string) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            handleInputChange(questionId, { latitude, longitude });
          },
          (error) => {
            console.error("Error getting location:", error);
            toast({
              title: "Erro ao capturar localização",
              description: "Verifique as permissões do navegador.",
              variant: "destructive",
            });
          }
        );
      } else {
        toast({
          title: "Geolocalização não suportada",
          description: "Seu navegador não suporta geolocalização.",
          variant: "destructive",
        });
      }
    },
    [handleInputChange, toast]
  );

  const removeImage = useCallback((questionId: string) => {
    setImageResponses((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      for (const q of formData.questions) {
        if (q.isRequired && !responses[q.id] && !imageResponses[q.id]) {
          toast({
            title: "Erro",
            description: `A pergunta "${q.title}" é obrigatória.`,
            variant: "destructive",
          });
          return;
        }
      }

      setSubmitting(true);
      try {
        const payload = new FormData();

        const respObj = formData.questions.reduce((acc, q) => {
          const r = responses[q.id];
          acc[q.id] = {
            text: r ?? null,
            latitude: r?.latitude ?? null,
            longitude: r?.longitude ?? null,
          };
          return acc;
        }, {} as Record<string, any>);
        payload.append("responses", JSON.stringify(respObj));

        Object.entries(imageResponses).forEach(([id, file]) => {
          const ext = file.name.split(".").pop();
          const timestamp = Date.now();
          const newName = `${id}-${timestamp}.${ext}`;
          const renamed = new File([file], newName, { type: file.type });
          payload.append(`image-${id}`, renamed);
        });

        const res = await fetch(`/api/forms/${params.id}/responder`, {
          method: "POST",
          body: payload,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Erro ao enviar");
        }

        toast({
          title: "Sucesso!",
          description: "Resposta enviada com sucesso.",
        });
        router.push(`/app/forms/${params.id}/success`);
      } catch (error: any) {
        console.error("Erro ao enviar:", error);
        toast({
          title: "Erro ao enviar resposta",
          description: error.message || "Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    },
    [formData, responses, imageResponses, params.id, router, toast]
  );

  return {
    formData,
    responses,
    imageResponses,
    handleInputChange,
    handleImageUpload,
    captureLocation,
    removeImage,
    handleSubmit,
    submitting,
    isLoading,
  };
}