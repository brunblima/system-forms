import { Question, FormData } from "@/types/form";

export function normalizeOptions(question: Question): string[] {
  const normalizedType = question.type.toLowerCase();
  if (!["checkbox", "multiple"].includes(normalizedType)) return [];

  let normalizedOptions: string[] = [];
  if (question.options && typeof question.options === "object" && "set" in question.options) {
    normalizedOptions = Array.isArray(question.options.set)
      ? question.options.set.filter((opt) => opt.trim() !== "")
      : [];
  } else if (Array.isArray(question.options)) {
    normalizedOptions = question.options.filter((opt) => opt.trim() !== "");
  }
  return normalizedOptions;
}

export function prepareFormData(formData: FormData) {
  return {
    title: formData.title.trim(),
    description: formData.description.trim() || "",
    questions: formData.questions.map((question, index) => ({
      id: question.id,
      title: question.title.trim(),
      type: question.type.toLowerCase(),
      isRequired: question.isRequired || false,
      allowImage: question.allowImage || false,
      order: index,
      options: ["checkbox", "multiple"].includes(question.type.toLowerCase())
        ? (Array.isArray(question.options) ? question.options : [])
        : undefined,
    })),
  };
}