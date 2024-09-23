const middy = require("@middy/core");
const createError = require("http-errors");
const { verifyToken } = require("../jwt/jwtUtils");

const authMiddleware = () => {
  return {
    before: async (handler) => {
      const { headers } = handler.event;
      const authToken = headers.Authorization || headers.authorization;

      if (!authToken) {
        throw new createError.Unauthorized("Unauthorized");
      }

      try {
        const token = authToken.split(" ")[1]; // Extract the token part
        console.log("Token extracted:", token);
        const decoded = verifyToken(token);
        console.log("Token decoded:", decoded);
        handler.event.user = decoded;
      } catch (error) {
        console.error("Token verification failed:", error.message);
        throw new createError.Unauthorized("Unauthorized");
      }
    },
  };
};

module.exports = authMiddleware;
