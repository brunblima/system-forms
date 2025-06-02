"use client";

import { useRespondForm } from "@/hooks/useRespondForm";
import { FormData } from "@/types/form";
import { FormHeader } from "./FormHeader";
import { ResponseCard } from "./ResponseCard";
import { SubmitResponseButton } from "./SubmitResponseButton";
import { Loader2 } from "lucide-react";

interface RespondFormProps {
  initialData?: FormData;
}

export default function RespondForm({ initialData }: RespondFormProps) {
  const {
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
  } = useRespondForm(initialData);

  if (isLoading || !formData.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <FormHeader title={formData.title} description={formData.description} />
      <form onSubmit={handleSubmit} className="space-y-6">
        {formData.questions.map((question) => (
          <ResponseCard
            key={question.id}
            question={question}
            response={responses[question.id]}
            imageResponse={imageResponses[question.id]}
            onInputChange={handleInputChange}
            onImageUpload={handleImageUpload}
            onCaptureLocation={captureLocation}
            onRemoveImage={removeImage}
          />
        ))}
        <SubmitResponseButton submitting={submitting} />
      </form>
    </div>
  );
}