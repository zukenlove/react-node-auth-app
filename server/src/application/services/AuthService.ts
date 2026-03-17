import jwt from "jsonwebtoken";
import type { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";
import config from "../../application/Config"

export class AuthService {
  constructor(private userRepository: PrismaUserRepository) {}

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    await user.validatePassword(password);

    const accessExpiration = config.accessTokenExpiration;

    if (!accessExpiration) {
        throw new Error("ACCESS_TOKEN_EXPIRATION is not defined");
    }

    const accessToken = jwt.sign(
    { userId: user.getId() },
    config.accessTokenSecret,
    { expiresIn: config.accessTokenExpiration as jwt.SignOptions["expiresIn"] }
    );

    
    const refreshToken = jwt.sign(
    { userId: user.getId() },
    config.refreshTokenSecret,
    { expiresIn: config.refreshTokenExpiration as jwt.SignOptions["expiresIn"] }
    );

    return {
      user,
      accessToken,
      refreshToken
    };
  }
}