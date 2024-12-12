"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  PlusCircle,
  FileText,
  Calendar,
  Edit,
  BarChart,
  EllipsisVertical,
  Share,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HomeProps {
  userId: string;
}

export default function Home() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    formId: "",
    formTitle: "",
  });

  useEffect(() => {
    async function fetchForms() {
      try {
        const res = await fetch(`/api/getForms/`);
        if (!res.ok) throw new Error(`Erro na resposta: ${res.statusText}`);

        const data = await res.json();
        setForms(data);
      } catch (error) {
        console.error("Erro ao carregar formulários:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchForms();
  }, []);

  async function handleDeleteForm(id: string) {
    try {
      const response = await fetch(`/api/deleteForm/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir o formulário");

      // Sucesso, adicione qualquer lógica adicional (como redirecionamento)
      alert("Formulário excluído com sucesso");
    } catch (error) {
      console.error("Erro ao excluir o formulário:", error);
      alert("Erro ao excluir o formulário");
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meus Formulários</h1>
        <Link href="/app/create">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Criar Formulário
          </Button>
        </Link>
      </div>

      {loading ? (
        <p>Carregando formulários...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms.length > 0 ? (
            forms.map((form) => (
              <Card key={form.id} className="group">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <CardTitle className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="line-clamp-1">{form.title}</span>
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <EllipsisVertical className="h-5 w-5 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/app/forms/${form.id}/edit`}
                          className="flex"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link
                          href={`/app/forms/${form.id}/respostas`}
                          className="flex"
                        >
                          <BarChart className="h-4 w-4 mr-2" />
                          <span>Ver respostas</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          const publicUrl = `${window.location.origin}/app/forms/${form.id}/responder`;
                          navigator.clipboard.writeText(publicUrl);
                          alert("Link copiado para a área de transferência!");
                        }}
                      >
                        <Share className="h-4 w-4 mr-2" />
                        <span>Compartilhar</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            formId: form.id,
                            formTitle: form.title,
                          })
                        }
                        className="text-red-500 hover:bg-red-100"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        <span>Excluir</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    Criado em{" "}
                    {new Date(form.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="text-sm text-muted-foreground">
                    Respostas: {form.responses}
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="text-center p-12">
              <div className="flex flex-col items-center gap-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">
                  Nenhum formulário criado
                </h2>
                <p className="text-muted-foreground">
                  Comece criando seu primeiro formulário
                </p>
                <Link href="/app/create">
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Criar Formulário
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      )}

      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Excluir Formulário</DialogTitle>
          </DialogHeader>

          <span>
            Tem certeza que deseja excluir o formulário
            {deleteDialog.formTitle}?
          </span>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() =>
                setDeleteDialog({ open: false, formId: "", formTitle: "" })
              }
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteForm(deleteDialog.formId)} // Correção aqui
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
