import axios from "axios"

import { API_BASE_URL } from "@/config/env"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      window.location.pathname !== "/login"
    ) {
      window.location.assign("/login")
    }

    return Promise.reject(error)
  },
)

export default api
