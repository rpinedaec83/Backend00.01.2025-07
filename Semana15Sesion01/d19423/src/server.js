require('dotenv').config();
const express =  require('express');
const path = require('path');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const bodyParser = require('body-parser');
const passport = require('passport');
// const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const session = require('express-session');

const con = require('./database/db');

require('./passport');

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET;

app.use(express.static(path.join(__dirname,"public")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

app.use(passport.initialize());
app.use(passport.session());

let username;
let connections = [];

app.get('/',(req,res)=>{
    authenticate(req,res);
})

app.get('/google', googleConfigured, passport.authenticate("google",{ scope:['email']}));

app.get('/google/callback', googleConfigured, passport.authenticate("google",{failureRedirect:"/failed"}), (req,res)=>{
    finishOAuthLogin(req, res);
});

app.get('/github', githubConfigured, passport.authenticate("github",{ scope:['user:email']}));

app.get('/github/callback', githubConfigured, passport.authenticate("github",{failureRedirect:"/failed"}), (req,res)=>{
    finishOAuthLogin(req, res);
});

app.get("/success", (req,res)=>{
    authenticate(req,res);
})


function getOAuthEmail(user) {
    if (user.email) {
        return user.email;
    }

    if (Array.isArray(user.emails) && user.emails.length > 0) {
        const primaryEmail = user.emails.find((item) => item.primary) || user.emails[0];
        return primaryEmail.value || primaryEmail.email;
    }

    return user.username || user.id;
}

function finishOAuthLogin(req, res) {
    const oauthEmail = getOAuthEmail(req.user);

    if (!oauthEmail) {
        return res.redirect('/failed');
    }

    const sql = 'REPLACE INTO login (usermane,password) VALUES(?, ?);';
    con.query(sql, [oauthEmail, 'oauth'], (err,result)=>{
        if(err) throw err;
        req.session.user = oauthEmail;
        username = oauthEmail;
        res.redirect('/chat_start')
    })
}

function googleConfigured(req, res, next) {
    if (!process.env.CLIENTID || !process.env.SECRETID || !process.env.CALLBACKURL) {
        return res.status(500).send('Configura CLIENTID, SECRETID y CALLBACKURL en el archivo .env');
    }

    next();
}

function githubConfigured(req, res, next) {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET || !process.env.GITHUB_CALLBACK_URL) {
        return res.status(500).send('Configura GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET y GITHUB_CALLBACK_URL en el archivo .env');
    }

    next();
}

function chat_start() {
    // ===================================Sockets starts  =========================
    io.sockets.on('connection', function (socket) {
        connections.push(socket);
         //console.log("Connected:  %s Socket running", connections.length);
        // ====================Disconnect==========================================
        socket.on('disconnect', function (data) {
            connections.splice(connections.indexOf(data), 1);
            //console.log('Disconnected : %s sockets running', connections.length);
        });
        socket.on('initial-messages', function (data) {
            var sql = "SELECT * FROM message ";
            con.query(sql, function (err, result, fields) {
                var jsonMessages = JSON.stringify(result);
                // console.log(jsonMessages);
                io.sockets.emit('initial-message', { msg: jsonMessages });
            });
        });

        socket.on('username', function (data) {
            socket.emit('username', { username: username });
            //io.sockets.emit('username', {username: username});
        });
        socket.on('send-message', function (data, user) {
            //console.log(user);
            var sql = "INSERT INTO message (message , user) VALUES ('" + data + "' , '" + user + "')";
            con.query(sql, function (err, result) {
                if (err) throw err;
                //console.log("1 record inserted");
            });
            io.sockets.emit('new-message', { msg: data, username: user });
        })

        socket.on('typing', function (data, user) {
            //console.log(user);
            io.sockets.emit('typing', { msg: data, username: user });
        })
    })
}


function authenticate(req, res){
    if(!req.session.user){
         res.sendFile(__dirname+'/public/login.html')
    }else{
        username = req.session.user;
        res.sendFile(__dirname+'/public/chat.html')
    }
}

function login(req,res){
    let post = req.body;
    username = post.user;
    let password = post.password;
    console.log(req.body)
    let sql = `select * from login where usermane = '${username}' `;
    con.query(sql, (err,result,fields)=>{
        console.log(result);
        if(result.length === 1){
            let jsonString = JSON.stringify(result);
            let jsonData = JSON.parse(jsonString);
            if(password == jsonData[0].password){
                req.session.user = post.user;
                username = post.user;
                res.redirect('/chat_start');
            }
            else{
                res.redirect('/login');
            }
        }
        else{
            res.redirect('/login');
        }
    })
}




app.get('/login', (req,res)=>{
    authenticate(req,res);
});
app.post('/login',(req,res)=>{
    login(req,res);
});

app.get('/chat_start',(req,res)=>{
    authenticate(req,res);
})
app.get('/logout',(req,res)=>{
    console.log("llego el logout");
    delete req.session.user;
    req.session = null;
    res.redirect('/login');
})
chat_start();
server.listen(PORT,()=>{
    console.log("Servidor iniciado");
})
