import app from "./src/app.js";

import connectDB from "./src/db/db.js";
import { connect } from "./src/broker/rabbit.js";

connectDB();
connect();

app.listen(3001, () => {
    console.log("Server is running on port 3001");
})




// MONGO_URI=mongodb://localhost:27017/spotify-auth
// JWT_SECRET=595d55faadb14c502768aba283db6d6d
// CLIENT_ID=966860407497-2gijj8gjsncqr5afnlgn0r02fnsnjl5t.apps.googleusercontent.com
// CLIENT_SECRET=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
// RABBITMQ_URI=amqps://yozdwlbb:WaZsolAPXI8VPCKpi6pIzMsWCBcxdgIj@fuji.lmq.cloudamqp.com/yozdwlbb
