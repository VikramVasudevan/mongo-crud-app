const mainRouter = require('./routes');
// Import express
let express = require('express');
var cors = require('cors');
const path = require('path');
const BodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');
require('./mongodb/mongodb.utils').connect();
// Initialize the app
let app = express();

app.use(basicAuth({
    users: { admin: 'supersecret123' },
    challenge: true // <--- needed to actually show the login dialog!
}));

app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, "public"))); // <- this line will us public directory as your static assets
app.use("/styles/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))); // <- This will use the contents of 'bootstrap/dist/css' which is placed in your node_modules folder as if it is in your '/styles/css' directory.
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/static', express.static('./node_modules/font-awesome'))
app.use('/js', express.static(path.join(__dirname, 'node_modules/sweetalert2/dist')))

//this helps the express middleware to handle the json body request we call with the endpoint
app.use(express.json({ limit: '10mb' }));

app.use(cors());
app.use(BodyParser.urlencoded({
    limit: '10mb',
    extended: false
}));
// Parse application/json
app.use(BodyParser.json({ limit: '10mb' }));


app.get('/', (req, res) => {
    res.render('index', { title: 'Mongo CRUD App | Admin Module | Home', message: 'Welcome to Mongo Crud App | Admin Module | Home' })
})
app.use('/admin', mainRouter);

module.exports = app;