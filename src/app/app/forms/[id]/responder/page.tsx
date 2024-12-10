"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Upload, Camera } from "lucide-react";
import Image from "next/image";

interface Question {
  id: string;
  type: string;
  title: string;
  isRequired: boolean;
  options?: string[];
  allowImage?: boolean;
}

interface FormData {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function RespondForm() {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [imageResponses, setImageResponses] = useState<Record<string, string>>(
    {},
  );
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const res = await fetch(`/api/getForms/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch form data");
        const data = await res.json();
        setFormData(data);
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast({
          title: "Erro ao carregar o formulário",
          description:
            "Não foi possível carregar os dados do formulário. Por favor, tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    };

    fetchFormData();
  }, [params.id, toast]);

  const handleInputChange = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleImageUpload = (
    questionId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageResponses((prev) => ({
          ...prev,
          [questionId]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
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
            description:
              "Não foi possível obter sua localização. Por favor, verifique as permissões do seu navegador.",
            variant: "destructive",
          });
        },
      );
    } else {
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedResponses = {
        ...responses,
        ...Object.fromEntries(
          Object.entries(imageResponses).map(([key, value]) => [
            key,
            { imageData: value },
          ]),
        ),
      };

      const res = await fetch(`/api/forms/${params.id}/responder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedResponses),
      });

      if (!res.ok) throw new Error("Failed to submit form");

      toast({
        title: "Resposta enviada com sucesso!",
        description: "Obrigado por responder ao formulário.",
      });

      router.push("/");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Erro ao enviar resposta",
        description:
          "Ocorreu um erro ao enviar sua resposta. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (!formData) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto max-w-3xl py-10">
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
          <Card key={question.id} className="relative group">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label htmlFor={question.id} className="text-lg font-medium">
                  {question.title}
                  {question.isRequired && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                {question.type === "short" && (
                  <Input
                    id={question.id}
                    required={question.isRequired}
                    onChange={(e) =>
                      handleInputChange(question.id, e.target.value)
                    }
                  />
                )}
                {question.type === "long" && (
                  <Textarea
                    id={question.id}
                    required={question.isRequired}
                    onChange={(e) =>
                      handleInputChange(question.id, e.target.value)
                    }
                  />
                )}
                {question.type === "multiple" && (
                  <RadioGroup
                    onValueChange={(value) =>
                      handleInputChange(question.id, value)
                    }
                    required={question.isRequired}
                  >
                    {question.options?.map((option) => (
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
                {question.type === "checkbox" && (
                  <div className="space-y-2">
                    {question.options?.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question.id}-${option}`}
                          onCheckedChange={(checked) => {
                            const currentValue = responses[question.id] || [];
                            const newValue = checked
                              ? [...currentValue, option]
                              : currentValue.filter(
                                  (v: string) => v !== option,
                                );
                            handleInputChange(question.id, newValue);
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
                          ? `${responses[question.id].latitude}, ${responses[question.id].longitude}`
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
                {question.type === "file" && (
                  <div className="space-y-2">
                    <Input
                      type="file"
                      id={question.id}
                      required={question.isRequired}
                      onChange={(e) =>
                        handleInputChange(question.id, e.target.files?.[0])
                      }
                    />
                    {responses[question.id] && (
                      <p className="text-sm text-gray-500">
                        Arquivo selecionado: {responses[question.id].name}
                      </p>
                    )}
                  </div>
                )}
                {question.allowImage && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Carregar imagem
                      </Button>
                      <Button type="button" variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Tirar foto
                      </Button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(question.id, e)}
                    />
                    {imageResponses[question.id] && (
                      <div className="mt-2">
                        <Image
                          src={imageResponses[question.id]}
                          alt="Uploaded"
                          className="max-w-full h-auto rounded-md"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        <Button type="submit" className="w-full">
          Enviar Resposta
        </Button>
      </form>
    </div>
  );
}
