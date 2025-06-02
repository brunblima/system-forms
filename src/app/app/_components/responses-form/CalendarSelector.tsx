import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CalendarSelectorProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  responseDates: Date[];
}

export function CalendarSelector({ selectedDate, setSelectedDate, responseDates }: CalendarSelectorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-primary/10 hover:bg-primary/20 border-2 border-muted rounded-lg shadow-sm",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-accent" />
          {selectedDate ? format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-background border-2 border-muted rounded-lg shadow-md" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={{ highlighted: responseDates }}
          modifiersStyles={{
            highlighted: { backgroundColor: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" },
          }}
          locale={ptBR}
          className="bg-background text-foreground rounded-lg"
        />
      </PopoverContent>
    </Popover>
  );
}