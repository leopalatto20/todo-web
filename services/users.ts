import { api } from "./api"
import type { UserProfileResponse, CreateUserDto } from "@/types"

export const userService = {
  register: (dto: CreateUserDto) => api.post("/users", dto),

  getProfile: () =>
    api.get<UserProfileResponse>("/users/me").then((r) => r.data),
}
