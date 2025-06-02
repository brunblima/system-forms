"use client";

import FormBuilder from "@/app/app/_components/form-builder/FormBuilder";
import { useFetchForm } from "@/hooks/useFetchForm";

export default function EditFormPage() {
  const { form, loading, error } = useFetchForm();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!form) {
    return null;
  }

  return <FormBuilder initialData={form} />;
}