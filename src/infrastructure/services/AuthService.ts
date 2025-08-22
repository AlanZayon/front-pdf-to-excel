import { RegisterCommand } from '../../application/commands/RegisterCommand'
import type { RegisterResult } from '../../domain/models/RegisterResult'
import { LoginCommand } from '../../application/commands/LoginCommand'
import type { LoginResult } from '../../domain/models/LoginResult'
import { ChangePasswordCommand } from '../../application/commands/ChangePasswordCommand'
import type { ChangePasswordResult } from '../../domain/models/ChangePasswordResult'
import { http } from '../../shared/utils/http'
import { logger } from '../../shared/logging/logger'

export class AuthService {
  static async register(command: RegisterCommand): Promise<RegisterResult> {
    try {
      const response = await http.post('/api/auth/register', {
        fullName: command.name,
        email: command.email,
        password: command.password,
        confirmPassword: command.confirmPassword
      });


      return {
        success: true,
        message: 'Registro realizado com sucesso',
        userId: response.data.data.Id
      };
    } catch (error: any) {
      logger.error('Erro no registro', error);

      if (error.response?.data) {
        const apiError = error.response.data;

        return {
          success: false,
          message: apiError.message || 'Erro ao registrar usuário',
          errors: apiError.errors,
          exception: apiError.exception
        };
      }

      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  static async login(command: LoginCommand): Promise<LoginResult> {
    try {
      const response = await http.post('/api/auth/login', {
        email: command.email,
        password: command.password
      }, {
        withCredentials: true
      });

      return {
        success: true,
        message: 'Login realizado com sucesso',
        user: {
          email: response.data.data.Email,
          fullName: response.data.data.FullName,
          roles: response.data.data.Roles
        }
      };
    } catch (error: any) {
      logger.error('Erro no login', error);

      if (error.response?.data) {
        const apiError = error.response.data;

        if (apiError.errors) {
          return {
            success: false,
            message: apiError.message || 'Erro ao autenticar usuário',
            errors: apiError.errors,
            fieldErrors: {
              email: apiError.errors['EmailNotFound'] || apiError.errors['Email'],
              password: apiError.errors['InvalidPassword'] || apiError.errors['Password']
            }
          };
        }

        return {
          success: false,
          message: apiError.message || 'Erro ao autenticar usuário'
        };
      }

      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  static async changePassword(command: ChangePasswordCommand): Promise<ChangePasswordResult> {
    try {
      const response = await http.post(
        '/api/auth/change-password',
        {
          currentPassword: command.currentPassword,
          newPassword: command.newPassword,
          confirmPassword: command.confirmPassword
        },
        {
          withCredentials: true
        }
      );


      return {
        success: true,
        message: response.data.message || 'Senha alterada com sucesso'
      };
    } catch (error: any) {
      logger.error('Erro ao alterar senha', error);

      if (error.response?.data) {
        const apiError = error.response.data;

        // Mapear erros específicos para campos
        const fieldErrors: any = {};
        
        if (apiError.errors) {
          // Mapear erros comuns de senha
          apiError.errors.forEach((error: any) => {
            if (error.code?.includes('Password')) {
              fieldErrors.newPassword = error.description;
            } else if (error.code?.includes('CurrentPassword') || error.code?.includes('InvalidPassword')) {
              fieldErrors.currentPassword = error.description;
            } else if (error.code?.includes('PasswordMismatch')) {
              fieldErrors.confirmPassword = error.description;
            }
          });

          return {
            success: false,
            message: apiError.message || 'Erro ao alterar senha',
            errors: apiError.errors,
            fieldErrors
          };
        }

        return {
          success: false,
          message: apiError.message || 'Erro ao alterar senha',
          exception: apiError.exception
        };
      }

      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
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

  static async deleteUser(): Promise<{
    success: boolean;
    message: string;
    errors?: any[]
  }> {
    try {
      await http.delete(
        '/api/auth/deleteUser',
        {
          withCredentials: true
        }
      );

      return {
        success: true,
        message: 'Conta excluída com sucesso'
      };
    } catch (error: any) {
      logger.error('Erro ao excluir usuário', error);

      if (error.response?.data) {
        const apiError = error.response.data;

        return {
          success: false,
          message: apiError.message || 'Erro ao excluir conta',
          errors: apiError.errors
        };
      }

      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }
}