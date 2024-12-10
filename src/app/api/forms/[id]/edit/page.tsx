import { notFound } from "next/navigation";
import FormBuilder from "@/app/app/_components/form-builder";
import { Toaster } from "@/components/ui/toaster";

async function getFormData(id: string) {
  // In a real application, fetch the form data from your API or database
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/forms/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch form data");
  }
  return res.json();
}

export default async function EditFormPage({
  params,
}: {
  params: { id: string };
}) {
  let formData;
  try {
    formData = await getFormData(params.id);
  } catch (error) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Editar Formulário</h1>
        <FormBuilder initialData={formData} />
      </div>
      <Toaster />
    </main>
  );
}
