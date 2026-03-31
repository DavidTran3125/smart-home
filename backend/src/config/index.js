import dotenv from "dotenv";

dotenv.config();

export default {
  aio_username: process.env.AIO_USERNAME,
  aio_key: process.env.AIO_KEY,
  mongo_uri: process.env.MONGO_URI,
};
