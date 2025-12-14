import { TimelineEvent } from "../components/TimelineComponent";

export const addTimelineEvent = (
  currentEvents: TimelineEvent[], 
  event: Omit<TimelineEvent, 'id'>
): TimelineEvent[] => {
  const newEvent: TimelineEvent = {
    ...event,
    id: currentEvents.length + 1
  };

  return [newEvent, ...currentEvents];
};