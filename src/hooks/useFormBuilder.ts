import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { FormData, Question } from "@/types/form";
import { normalizeOptions, prepareFormData } from "@/utils/formUtils";
import { arrayMove } from "@dnd-kit/sortable";

export function useFormBuilder(initialData?: FormData) {
  const [formTitle, setFormTitle] = useState(initialData?.title || "");
  const [formDescription, setFormDescription] = useState(initialData?.description || "");
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions.map((q) => ({
      ...q,
      type: q.type.toLowerCase() as Question["type"],
      options: normalizeOptions(q),
    })) || []
  );
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = useCallback(() => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type: "short",
      title: "",
      isRequired: false,
      options: [],
    };
    setQuestions((prev) => [...prev, newQuestion]);
  }, []);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((q) => q.id === active.id);
        const newIndex = items.findIndex((q) => q.id === over.id);
        const updatedQuestions = arrayMove(items, oldIndex, newIndex);
        return updatedQuestions.map((q, index) => ({
          ...q,
          order: index,
        }));
      });
    }
  }, []);

  const saveForm = useCallback(async () => {
    setIsSaving(true); 
    try {
      if (!formTitle.trim()) {
        toast({
          title: "Erro",
          description: "O título do formulário é obrigatório.",
          variant: "destructive",
        });
        return;
      }

      const formData: FormData = { title: formTitle, description: formDescription, questions };
      const preparedData = prepareFormData(formData);

      const url = initialData?.id ? `/api/forms/${initialData.id}/edit` : "/api/createForms";
      const method = initialData?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preparedData),
      });

      const responseData = await response.json();
      if (response.ok) {
        toast({
          title: "Formulário salvo com sucesso!",
          description: "Seu formulário foi salvo no banco de dados.",
        });
        router.push("/app");
      } else {
        throw new Error(`Erro ${response.status}: ${responseData.message || "Erro desconhecido"}`);
      }
    } catch (error) {
      console.error("Erro ao salvar o formulário:", error);
      toast({
        title: "Erro ao salvar formulário",
        description: "Ocorreu um erro ao tentar salvar o formulário. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false); 
    }
  }, [formTitle, formDescription, questions, initialData, toast, router]);

  return {
    formTitle,
    setFormTitle,
    formDescription,
    setFormDescription,
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    handleDragEnd,
    saveForm,
    isSaving
  };
}