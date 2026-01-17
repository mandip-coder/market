import { FetchUsersParams } from "./user.types";

export const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (params?: FetchUsersParams) => 
    params ? [...usersKeys.lists(), params] as const : usersKeys.lists(),
};