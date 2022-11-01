const app = require("./app");
const mongodb = require("./mongodb/mongodb.utils");
let port = process.env.PORT || 3000;
mongodb.connect();
app.listen(port, () => {
  console.log("running mongodb crud app in port ", port);
});
