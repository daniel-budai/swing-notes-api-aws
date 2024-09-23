const { db } = require("../../../services/database/dynamodb");
const middy = require("@middy/core");
const jsonBodyParser = require("@middy/http-json-body-parser");
const httpErrorHandler = require("@middy/http-error-handler");
const { generateToken } = require("../../../jwt/jwtUtils");

const login = async (event) => {
  console.log("Event body:", event.body);
  const { username, password } = event.body;

  const params = {
    TableName: process.env.USERS_TABLE,
    IndexName: "username-index",
    KeyConditionExpression: "username = :username",
    ExpressionAttributeValues: {
      ":username": username,
    },
  };

  try {
    const result = await db.query(params);
    console.log("Query result:", result);
    const user = result.Items[0];

    if (!user || user.password !== password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    // Generate JWT
    const token = generateToken(user.userId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Logged in", token }),
    };
  } catch (error) {
    console.error("Error logging in:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not log in" }),
    };
  }
};

module.exports.handler = middy(login)
  .use(jsonBodyParser())
  .use(httpErrorHandler());
