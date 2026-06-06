import type { View } from "react-big-calendar";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { t } from "@lingui/core/macro";
import {
  format,
  getDay,
  parse,
  startOfWeek,
} from "date-fns";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";

import { useLocalisation } from "~/hooks/useLocalisation";

import "react-big-calendar/lib/css/react-big-calendar.css";

interface CalendarCard {
  publicId: string;
  title: string;
  dueDate?: Date | string | null;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: CalendarCard;
}

const CalendarView = ({
  cards,
  isTemplate = false,
  boardId,
}: {
  cards: CalendarCard[];
  isTemplate?: boolean;
  boardId?: string | null;
}) => {
  const router = useRouter();
  const { dateLocale } = useLocalisation();
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(new Date());

  const localizer = useMemo(
    () =>
      dateFnsLocalizer({
        format,
        parse,
        startOfWeek: () => startOfWeek(new Date(), { locale: dateLocale }),
        getDay,
        locales: { [dateLocale.code]: dateLocale },
      }),
    [dateLocale],
  );

  const events = useMemo<CalendarEvent[]>(
    () =>
      cards.reduce<CalendarEvent[]>((acc, card) => {
        if (card.dueDate == null) return acc;
        const due = new Date(card.dueDate);
        acc.push({
          id: card.publicId,
          title: card.title,
          start: due,
          end: due,
          resource: card,
        });
        return acc;
      }, []),
    [cards],
  );

  const handleSelectEvent = (event: CalendarEvent) => {
    const path = isTemplate
      ? `/templates/${boardId}/cards/${event.id}`
      : `/cards/${event.id}`;
    void router.push(path);
  };

  return (
    <div className="h-full w-full overflow-x-auto p-4 md:p-6">
      <div className="kan-calendar h-[calc(100vh-200px)] min-w-[640px] text-light-1000 dark:text-dark-1000">
        <Calendar<CalendarEvent>
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={["month", "week", "agenda"]}
          view={view}
          onView={(nextView) => setView(nextView)}
          date={date}
          onNavigate={(nextDate) => setDate(nextDate)}
          onSelectEvent={handleSelectEvent}
          popup
          culture={dateLocale.code}
          messages={{
            month: t`Month`,
            week: t`Week`,
            agenda: t`Agenda`,
            today: t`Today`,
            previous: t`Back`,
            next: t`Next`,
            date: t`Date`,
            time: t`Time`,
            event: t`Event`,
            noEventsInRange: t`No cards with due dates in this range`,
            showMore: (count) => t`+${count} more`,
          }}
        />
      </div>
    </div>
  );
};

export default CalendarView;
