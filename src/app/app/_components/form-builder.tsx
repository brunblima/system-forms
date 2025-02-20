"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle,
  GripVertical,
  ImageIcon,
  Type,
  List,
  CheckSquare,
  AlignLeft,
  Camera,
  Upload,
  Trash2,
  MapPin,
  FileIcon,
  Calendar,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Question {
  id: string;
  type: string;
  title: string;
  isRequired: boolean;
  options?: string[];
  allowImage?: boolean;
  imageUrl?: string;
  location?: string;
  fileUrl?: string;
}

interface FormData {
  id?: string;
  title: string;
  description: string;
  questions: Question[];
}

function LocationInput({
  question,
  updateQuestion,
}: {
  question: Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const captureLocation = useCallback(() => {
    setIsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateQuestion(question.id, {
            location: `${latitude}, ${longitude}`,
          });
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setIsLoading(false);
    }
  }, [question.id, updateQuestion]);

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="text"
        value={question.location || ""}
        readOnly
        placeholder="Latitude, Longitude"
        className="flex-grow"
      />
      <Button
        type="button"
        size="icon"
        onClick={captureLocation}
        disabled={isLoading}
      >
        <MapPin className="h-4 w-4" />
      </Button>
    </div>
  );
}

function FileUploadInput({
  question,
  updateQuestion,
}: {
  question: Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateQuestion(question.id, { fileUrl: file.name });
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        Escolher arquivo
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
      />
      {question.fileUrl && (
        <p className="text-sm text-gray-500">
          Arquivo selecionado: {question.fileUrl}
        </p>
      )}
    </div>
  );
}

function ImageUploadInput({
  question,
  updateQuestion,
}: {
  question: Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateQuestion(question.id, { imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        Escolher imagem
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
      {question.imageUrl && (
        <div className="mt-2">
          <img
            src={question.imageUrl}
            alt="Imagem carregada"
            className="max-w-full h-auto rounded-md"
          />
        </div>
      )}
    </div>
  );
}

function SortableQuestion({
  question,
  updateQuestion,
  deleteQuestion,
}: {
  question: Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateQuestion(question.id, { imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card ref={setNodeRef} style={style} className="relative group mb-4">
      <div
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      <CardContent className="pt-6 pl-10">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 w-full">
              <Input
                value={question.title}
                onChange={(e) =>
                  updateQuestion(question.id, { title: e.target.value })
                }
                placeholder="Pergunta"
                className="text-lg "
              />
            </div>
            <Select
              value={question.type}
              onValueChange={(value) =>
                updateQuestion(question.id, { type: value })
              }
            >
              <SelectTrigger className="max-w-44">
                <SelectValue placeholder="Tipo de resposta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    <span>Resposta curta</span>
                  </div>
                </SelectItem>
                <SelectItem value="long">
                  <div className="flex items-center gap-2">
                    <AlignLeft className="h-4 w-4" />
                    <span>Resposta longa</span>
                  </div>
                </SelectItem>
                <SelectItem value="multiple">
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    <span>Múltipla escolha</span>
                  </div>
                </SelectItem>
                <SelectItem value="checkbox">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    <span>Caixas de seleção</span>
                  </div>
                </SelectItem>
                <SelectItem value="location">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Localização</span>
                  </div>
                </SelectItem>
                <SelectItem value="image">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Imagem</span>
                  </div>
                </SelectItem>
                <SelectItem value="file">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4" />
                    <span>Upload de arquivo</span>
                  </div>
                </SelectItem>
                <SelectItem value="date">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Data</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteQuestion(question.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={question.isRequired}
                onChange={(e) =>
                  updateQuestion(question.id, { isRequired: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <span>Obrigatória</span>
            </Label>
          </div>

          {(question.type === "short" || question.type === "long") && (
            <div className="pl-4 border-l-2 border-gray-200">
              {question.type === "short" ? (
                <Input disabled placeholder="Resposta curta" />
              ) : (
                <Textarea disabled placeholder="Resposta longa" />
              )}
            </div>
          )}

          {question.type === "date" && (
            <div className="pl-4 border-l-2 border-gray-200">
              <Input type="date" disabled placeholder="Escolha uma data" />
            </div>
          )}

          {(question.type === "multiple" || question.type === "checkbox") && (
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  {question.type === "checkbox" ? (
                    <div className="h-4 w-4 rounded-full border border-gray-300" />
                  ) : (
                    <div className="h-4 w-4 rounded border border-gray-300" />
                  )}
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[index] = e.target.value;
                      updateQuestion(question.id, { options: newOptions });
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newOptions = [...(question.options || [])];
                      newOptions.splice(index, 1);
                      updateQuestion(question.id, { options: newOptions });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                className="text-sm"
                onClick={() => {
                  const options = question.options || [];
                  updateQuestion(question.id, {
                    options: [...options, `Opção ${options.length + 1}`],
                  });
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar opção
              </Button>
            </div>
          )}

          {question.type === "location" && (
            <LocationInput
              question={question}
              updateQuestion={updateQuestion}
            />
          )}

          {question.type === "file" && (
            <FileUploadInput
              question={question}
              updateQuestion={updateQuestion}
            />
          )}

          {question.type === "image" && (
            <ImageUploadInput
              question={question}
              updateQuestion={updateQuestion}
            />
          )}

          {question.type !== "file" &&
            question.type !== "image" &&
            question.type !== "multiple" &&
            question.type !== "checkbox" &&
            question.type !== "date" && (
              <div className="flex items-center gap-2">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={question.allowImage}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        allowImage: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <ImageIcon className="h-4 w-4" />
                  Permitir resposta com imagem
                </Label>
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
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {question.imageUrl && (
                <div className="mt-2">
                  <Image
                    src={question.imageUrl}
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
  );
}

export default function FormBuilder({
  initialData,
}: {
  initialData?: FormData;
}) {
  const [formTitle, setFormTitle] = useState(initialData?.title || "");
  const [formDescription, setFormDescription] = useState(
    initialData?.description || ""
  );
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions || []
  );
  const { toast } = useToast();
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type: "short",
      title: "",
      isRequired: false,
      allowImage: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((q) => q.id === active.id);
        const newIndex = items.findIndex((q) => q.id === over.id);
        const updatedQuestions = arrayMove(items, oldIndex, newIndex);
        // Atualiza a ordem de cada pergunta após movimentar
        return updatedQuestions.map((q, index) => ({
          ...q,
          order: index,
        }));
      });
    }
  };

  const saveForm = async () => {
    try {
      const formData = {
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        questions: questions.map((question, index) => ({
          id: question.id,
          title: question.title.trim(),
          type: question.type,
          isRequired: question.isRequired || false,
          allowImage: question.allowImage || false,
          order: index,
          options: question.options || [],
        })),
      };

      console.log(
        "Dados enviados ao backend:",
        JSON.stringify(formData, null, 2)
      );

      const url = initialData?.id
        ? `/api/forms/${initialData.id}/edit`
        : "/api/createForms";
      const method = initialData?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log("Resposta do servidor:", response.status, responseData);

      if (response.ok) {
        toast({
          title: "Formulário salvo com sucesso!",
          description: "Seu formulário foi salvo no banco de dados.",
        });
        router.push("/app");
      } else {
        throw new Error(
          `Erro ${response.status}: ${
            responseData.message || "Erro desconhecido"
          }`
        );
      }
    } catch (error) {
      console.error("Erro ao salvar o formulário:", error);
      toast({
        title: "Erro ao salvar o formulário",
        description:
          "Ocorreu um erro ao tentar salvar o formulário. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-3xl font-bold text-left">
        {initialData ? "Editar Formulário" : "Criar Novo Formulário"}
      </h1>

      <Card className="border-t-8 border-t-primary">
        <CardContent className="pt-6 space-y-4">
          <Input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="text-2xl font-bold border-none px-3 focus-visible:ring-0"
            placeholder="Título do formulário"
          />
          <Textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            className="border-none resize-none focus-visible:ring-0"
            placeholder="Descrição do formulário"
          />
        </CardContent>
      </Card>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={questions}
          strategy={verticalListSortingStrategy}
        >
          {questions.map((question) => (
            <SortableQuestion
              key={question.id}
              question={question}
              updateQuestion={updateQuestion}
              deleteQuestion={deleteQuestion}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button
        onClick={addQuestion}
        variant="outline"
        className="w-full py-8 border-dashed"
      >
        <PlusCircle className="h-5 w-5 mr-2" />
        Adicionar pergunta
      </Button>

      <Button onClick={saveForm} className="w-full">
        Salvar Formulário
      </Button>
    </div>
  );
}
