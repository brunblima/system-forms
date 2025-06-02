"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export function useFetchForm() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const id = params?.id;
        if (!id) {
          throw new Error("ID do formulário não foi fornecido");
        }

        const response = await fetch(`/api/getForms/${id}`);
        if (!response.ok) {
          throw new Error(`Erro ao carregar formulário: ${response.statusText}`);
        }

        const data = await response.json();
        setForm(data);
      } catch (error: any) {
        console.error("Erro ao buscar formulário:", error);
        setError(error.message);
        router.push("/app");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [params, router]);

  return { form, loading, error };
}