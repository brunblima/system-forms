// app/app/forms/[id]/success/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const params = useParams();

  const handleBackToForm = () => {
    router.push(`/app/forms/${params.id}/responder`);
  };

  const handleBackHome = () => {
    router.push(`/`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="max-w-md w-full text-center py-8">
        <CardHeader>
          <CheckCircle className="mx-auto mb-4 w-12 h-12 text-green-500" />
          <CardTitle className="text-2xl">Obrigado pela sua resposta!</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-6">
            Sua resposta foi enviada com sucesso. Agradecemos sua participação.
          </CardDescription>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={handleBackHome}>
              Voltar à Página Inicial
            </Button>
            <Button onClick={handleBackToForm}>
              Ver Formulário
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
