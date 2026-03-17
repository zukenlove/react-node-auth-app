 const config = {
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET_KEY as string,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET_KEY as string,
  accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION as string,
  refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION as string,
};

export default config;