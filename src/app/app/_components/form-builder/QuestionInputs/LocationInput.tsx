// src/components/form-builder/QuestionInputs/LocationInput.tsx
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { Question } from "@/types/form";
import { TypeSelector } from "./TypeSelector";

interface LocationInputProps {
  question: Question;
  onUpdate: (id: string, updates: Partial<Question>) => void;
}

export function LocationInput({ question, onUpdate }: LocationInputProps) {
  const [isLoading, setIsLoading] = useState(false);

  const captureLocation = useCallback(() => {
    setIsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onUpdate(question.id, { location: `${latitude}, ${longitude}` });
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setIsLoading(false);
    }
  }, [question.id, onUpdate]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          value={question.title}
          onChange={(e) => onUpdate(question.id, { title: e.target.value })}
          placeholder="Pergunta"
          className="text-lg flex-1"
        />
        <TypeSelector value={question.type} onChange={(value) => onUpdate(question.id, { type: value })} />
      </div>
      <div className="flex items-center gap-2">
        <Label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={question.isRequired}
            onChange={(e) => onUpdate(question.id, { isRequired: e.target.checked })}
            className="rounded border-gray-300"
          />
          Obrigatória
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          value={question.location || ""}
          readOnly
          placeholder="Latitude, Longitude"
          className="flex-grow"
        />
        <Button
          type="button"
          size="icon"
          onClick={captureLocation}
          disabled={isLoading}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}