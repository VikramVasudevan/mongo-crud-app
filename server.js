const app = require("./app");
const mongodb = require("./mongodb/mongodb.utils");
let port = process.env.PORT || 19090;
mongodb.connect();
app.listen(port, () => {
  console.log("running ecop cas integration app in port ", port);
});
