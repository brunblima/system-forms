"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useFormBuilder } from "@/hooks/useFormBuilder";
import { useDndSensors } from "@/hooks/useDndSensors";
import { FormData } from "@/types/form";
import { FormHeader } from "./FormHeader";
import { QuestionCard } from "./QuestionCard";
import { AddQuestionButton } from "./AddQuestionButton";
import { SaveFormButton } from "./SaveFormButton";


interface FormBuilderProps {
  initialData?: FormData;
}

export default function FormBuilder({ initialData }: FormBuilderProps) {
  const {
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
  } = useFormBuilder(initialData);
  const sensors = useDndSensors();
  return (
    <div className="container mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-3xl font-bold text-left">
        {initialData ? "Editar Formulário" : "Criar Novo Formulário"}
      </h1>

      <FormHeader
        title={formTitle}
        description={formDescription}
        onTitleChange={setFormTitle}
        onDescriptionChange={setFormDescription}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onUpdate={updateQuestion}
              onDelete={deleteQuestion}
            />
          ))}
        </SortableContext>
      </DndContext>

      <AddQuestionButton onClick={addQuestion} />
      <SaveFormButton onClick={saveForm} isSaving={isSaving} />
    </div>
  );
}