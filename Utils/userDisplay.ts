/**
 * Formats the user's display name.
 * If the target user's UUID matches the current user's UUID, returns "You".
 * Otherwise, returns the target user's name or a fallback.
 *
 * @param name - The name to display if not the current user.
 * @param targetUserUUID - The UUID of the user associated with the item.
 * @param currentUserUUID - The UUID of the currently logged-in user.
 * @returns The formatted display string.
 */
export const formatUserDisplay = (
  name: string | null | undefined,
  targetUserUUID: string | null | undefined,
  currentUserUUID: string | null | undefined
): string => {
  if (targetUserUUID && currentUserUUID && targetUserUUID === currentUserUUID) {
    return "You";
  }
  return name || "—";
};
