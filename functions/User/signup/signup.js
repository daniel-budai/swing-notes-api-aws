const { db } = require("../../../services/database/dynamodb");
const { v4: uuidv4 } = require("uuid");
const middy = require("@middy/core");
const jsonBodyParser = require("@middy/http-json-body-parser");
const httpErrorHandler = require("@middy/http-error-handler");

const signup = async (event) => {
  const { username, password } = event.body;

  if (!username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Username and password are required" }),
    };
  }

  const userId = uuidv4();
  const params = {
    TableName: process.env.USERS_TABLE,
    Item: { userId, username, password },
  };

  try {
    await db.put(params);
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "User created" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create user" }),
    };
  }
};

module.exports.handler = middy(signup)
  .use(jsonBodyParser())
  .use(httpErrorHandler());
