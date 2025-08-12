export interface LoginResult {
  success: boolean
  message: string
  user?: {
    email: string
    fullName: string
    roles: string[]
  }
}