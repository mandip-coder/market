// Utility to batch timeline events and reduce re-renders
// This prevents creating timeline events on every single action

type PendingTimelineEvent = {
  event: any;
  timestamp: number;
};

let pendingEvents: PendingTimelineEvent[] = [];
let batchTimeout: NodeJS.Timeout | null = null;

/**
 * Batch timeline events to reduce the number of state updates
 * Events are collected for 100ms and then flushed together
 */
export function batchTimelineEvent(event: any, callback: (events: any[]) => void) {
  pendingEvents.push({
    event,
    timestamp: Date.now()
  });

  // Clear existing timeout
  if (batchTimeout) {
    clearTimeout(batchTimeout);
  }

  // Set new timeout to flush events
  batchTimeout = setTimeout(() => {
    if (pendingEvents.length > 0) {
      const eventsToFlush = pendingEvents.map(pe => pe.event);
      pendingEvents = [];
      callback(eventsToFlush);
    }
    batchTimeout = null;
  }, 100); // Batch for 100ms
}

/**
 * Immediately flush any pending timeline events
 */
export function flushTimelineEvents(callback: (events: any[]) => void) {
  if (batchTimeout) {
    clearTimeout(batchTimeout);
    batchTimeout = null;
  }

  if (pendingEvents.length > 0) {
    const eventsToFlush = pendingEvents.map(pe => pe.event);
    pendingEvents = [];
    callback(eventsToFlush);
  }
}
