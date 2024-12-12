"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import FormBuilder from "@/app/app/_components/form-builder";

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams(); // Usa o hook para obter o ID
  const [form, setForm] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const id = params?.id; // Obtenha o ID de params
        if (!id) {
          throw new Error("ID do formulário não foi fornecido");
        }

        const response = await fetch(`/api/getForms/${id}`);
        if (!response.ok) {
          throw new Error(
            `Erro ao carregar formulário: ${response.statusText}`,
          );
        }

        const data = await response.json();
        console.log("Dados do formulário:", data); // Confirma os dados recebidos
        setForm(data);
      } catch (error) {
        console.error("Erro ao buscar formulário:", error);
        alert("Não foi possível carregar o formulário.");
        router.push("/app");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [params, router]);

  
  return (
    <>
      <FormBuilder initialData={form} />
    </>
  );
}
