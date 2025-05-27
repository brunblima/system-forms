"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Upload, XCircle, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";

interface Question {
  id: string;
  type: string;
  title: string;
  isRequired: boolean;
  options?: string[];
  allowImage?: boolean;
}

interface FormDataType {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function RespondForm() {
  const [formData, setFormData] = useState<FormDataType>({
    id: "",
    title: "",
    description: "",
    questions: [],
  });
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [imageResponses, setImageResponses] = useState<Record<string, File>>(
    {}
  );
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchForm() {
      try {
        const res = await fetch(`/api/getForms/${params.id}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch form data");
        const data = await res.json();
        setFormData(data);
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast({
          title: "Erro ao carregar o formulário",
          description: "Não foi possível carregar os dados do formulário.",
          variant: "destructive",
        });
      }
    }
    fetchForm();
  }, [params.id, toast]);

  const handleInputChange = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleImageUpload = async (
    questionId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Compacta a imagem
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
  };

  const captureLocation = (questionId: string) => {
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
  };

  const removeImage = (questionId: string) => {
    setImageResponses((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação de obrigatoriedade
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

      // Adiciona respostas textuais e localização
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

      // Anexa imagens renomeadas
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
  };

  if (!formData.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="border-t-8 border-t-primary mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{formData.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{formData.description}</p>
        </CardContent>
      </Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        {formData.questions.map((question) => (
          <Card key={question.id}>
            <CardContent className="pt-6">
              <Label htmlFor={question.id} className="text-lg font-medium">
                {question.title}
                {question.isRequired && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <div className="mt-4 space-y-4">
                {question.type === "short" && (
                  <Input
                    id={question.id}
                    onChange={(e) =>
                      handleInputChange(question.id, e.target.value)
                    }
                  />
                )}
                {question.type === "long" && (
                  <Textarea
                    id={question.id}
                    onChange={(e) =>
                      handleInputChange(question.id, e.target.value)
                    }
                  />
                )}
                {question.type === "date" && (
                  <Input
                    type="date"
                    id={question.id}
                    onChange={(e) =>
                      handleInputChange(question.id, e.target.value)
                    }
                  />
                )}
                {question.type === "checkbox" && question.options && (
                  <RadioGroup
                    onValueChange={(value) =>
                      handleInputChange(question.id, value)
                    }
                  >
                    {question.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={option}
                          id={`${question.id}-${option}`}
                        />
                        <Label htmlFor={`${question.id}-${option}`}>
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {question.type === "multiple" && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question.id}-${option}`}
                          onCheckedChange={(checked) => {
                            const current = responses[question.id] || [];
                            const next = checked
                              ? [...current, option]
                              : current.filter((v: string) => v !== option);
                            handleInputChange(question.id, next);
                          }}
                        />
                        <Label htmlFor={`${question.id}-${option}`}>
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
                {question.type === "location" && (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={
                        responses[question.id]
                          ? `${responses[question.id].latitude}, ${
                              responses[question.id].longitude
                            }`
                          : ""
                      }
                      readOnly
                      placeholder="Latitude, Longitude"
                      className="flex-grow"
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => captureLocation(question.id)}
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {(question.type === "image" || question.allowImage) && (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById(`image-${question.id}`)?.click()
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" /> Carregar imagem
                    </Button>
                    <input
                      type="file"
                      id={`image-${question.id}`}
                      className="hidden"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleImageUpload(question.id, e)}
                    />
                    {imageResponses[question.id] && (
                      <div className="relative mt-2 w-24 h-24">
                        <img
                          src={URL.createObjectURL(imageResponses[question.id])}
                          alt="Imagem carregada"
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          onClick={() => removeImage(question.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
            </>
          ) : (
            "Enviar Resposta"
          )}
        </Button>
      </form>
    </div>
  );
}
