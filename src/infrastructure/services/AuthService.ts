import { RegisterCommand } from '../../application/commands/RegisterCommand'
import type { RegisterResult } from '../../domain/models/RegisterResult'
import { LoginCommand } from '../../application/commands/LoginCommand'
import type { LoginResult } from '../../domain/models/LoginResult'
import { http } from '../../shared/utils/http'
import { logger } from '../../shared/logging/logger'

export class AuthService {
  static async register(command: RegisterCommand): Promise<RegisterResult> {
    console.log('Executing register command:', command)
    try {
      const response = await http.post('/api/auth/register', {
        fullName: command.name,
        email: command.email,
        password: command.password,
        confirmPassword: command.confirmPassword
      })

      logger.info('Usuário registrado com sucesso', response.data)
      return {
        success: true,
        message: 'Registro realizado com sucesso',
        userId: response.data.Id
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao registrar usuário'
      logger.error('Erro no registro', error)
      return {
        success: false,
        message: errorMessage
      }
    }
  }

  static async login(command: LoginCommand): Promise<LoginResult> {
    try {
      const response = await http.post('/api/auth/login', {
        email: command.email,
        password: command.password
      }, {
        withCredentials: true
      })

      return {
        success: true,
        message: 'Login realizado com sucesso',
        user: {
          email: response.data.email,
          fullName: response.data.fullName,
          roles: response.data.roles
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao autenticar usuário'
      logger.error('Erro no login', error)
      return {
        success: false,
        message: errorMessage
      }
    }
  }

  static async checkAuth(): Promise<LoginResult> {
    try {
      const response = await http.get('/api/auth/me', {
        withCredentials: true
      })

      return {
        success: true,
        message: 'Usuário autenticado',
        user: {
          email: response.data.email,
          fullName: response.data.fullName,
          roles: response.data.roles
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Não autenticado'
      }
    }
  }

  static async logout(): Promise<{ success: boolean; message: string }> {
    try {
      await http.post(
        '/api/auth/logout',
        {},
        {
          withCredentials: true
        }
      )

      logger.info('Logout realizado com sucesso')
      return {
        success: true,
        message: 'Logout realizado com sucesso'
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer logout'
      logger.error('Erro no logout', error)
      return {
        success: false,
        message: errorMessage
      }
    }
  }
}