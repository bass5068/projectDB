const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const dbConnection = require('./database.js');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.urlencoded({extended:false}));

// SET OUR VIEWS AND VIEW ENGINE
app.set('views', path.join(__dirname,'views'));
app.set('view engine','ejs');

// APPLY COOKIE SESSION MIDDLEWARE
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge:  3600 * 1000 // 1hr
}));

// DECLARING CUSTOM MIDDLEWARE
const ifNotLoggedin = (req, res, next) => {
    if(!req.session.isLoggedIn){
        return res.render('register');
    }
    next();
}
const ifLoggedin = (req,res,next) => {
    if(req.session.isLoggedIn){
        return res.redirect('/home');
    }
    next();
}
// END OF CUSTOM MIDDLEWARE
// ROOT PAGE
app.get('/', ifNotLoggedin, (req,res,next) => {
    dbConnection.execute("SELECT `user_name` FROM `nusers` WHERE `id`=?",[req.session.userID])
    .then(([rows]) => {
        res.render('home',{
            name:rows[0].user_name
        });
    });
    
});// END OF ROOT PAGE


// REGISTER PAGE
app.post('/register', ifLoggedin, 
// post data validation(using express-validator)
[
    body('user_email','Invalid email address!').isEmail().custom((value) => {
        return dbConnection.execute('SELECT `email` FROM `nusers` WHERE `email`=?', [value])
        .then(([rows]) => {
            if(rows.length > 0){
                return Promise.reject('This E-mail already in use!');
            }
            return true;
        });
    }),
    body('user_name','Username is Empty!').trim().not().isEmpty(),
    body('user_pass','The password must be of minimum length 6 characters').trim().isLength({ min: 6 }),
],// end of post data validation
(req,res,next) => {

    const validation_result = validationResult(req);
    const {user_name, user_pass, user_email} = req.body;
    // IF validation_result HAS NO ERROR
    if(validation_result.isEmpty()){
        // password encryption (using bcryptjs)
        bcrypt.hash(user_pass, 12).then((hash_pass) => {
            // INSERTING USER INTO DATABASE
            dbConnection.execute("INSERT INTO `nusers`(`user_name`,`email`,`password`) VALUES(?,?,?)",[user_name,user_email, hash_pass])
            .then(result => {
                res.send(`your account has been created successfully, Now you can <a href="/">Login</a>`);
            }).catch(err => {
                // THROW INSERTING USER ERROR'S
                if (err) throw err;
            });
        })
        .catch(err => {
            // THROW HASING ERROR'S
            if (err) throw err;
        })
    }
    else{
        // COLLECT ALL THE VALIDATION ERRORS
        let allErrors = validation_result.errors.map((error) => {
            return error.msg;
        });
        // REDERING login-register PAGE WITH VALIDATION ERRORS
        res.render('register',{
            register_error:allErrors,
            old_data:req.body
        });
    }
});// END OF REGISTER PAGE


// LOGIN PAGE
app.post('/', ifLoggedin, [
    body('user_email').custom((value) => {
        return dbConnection.execute('SELECT email FROM nusers WHERE email=?', [value])
        .then(([rows]) => {
            if(rows.length == 1){
                return true;
                
            }
            return Promise.reject('Invalid Email Address!');
            
        });
    }),
    body('user_pass','Password is empty!').trim().not().isEmpty(),
], (req, res) => {
    const validation_result = validationResult(req);
    const {user_pass, user_email} = req.body;
    if(validation_result.isEmpty()){
        
        dbConnection.execute("SELECT * FROM nusers WHERE email =?",[user_email])
        .then(([rows]) => {
            bcrypt.compare(user_pass, rows[0].password).then(compare_result => {
                if(compare_result === true){
                    req.session.isLoggedIn = true;
                    req.session.userID = rows[0].id;

                    res.redirect('/');
                }
                else{
                    res.render('register',{
                        login_errors:['Invalid Password!']
                    });
                }
            })
            .catch(err => {
                if (err) throw err;
            });


        }).catch(err => {
            if (err) throw err;
        });
    }
    else{
        let allErrors = validation_result.errors.map((error) => {
            return error.msg;
        });
        // REDERING login-register PAGE WITH LOGIN VALIDATION ERRORS
        res.render('register',{
            login_errors:allErrors
        });
    }
});
// END OF LOGIN PAGE

//Play music by song_id
app.get('/playing', (req, res) => {
    const song_id = req.query.song_id;
    const songLinks = [];

    const promises = [];
    for (let i = song_id; i < song_id + 5; i++) {
        const promise = dbConnection.execute("SELECT songLink FROM nsongs WHERE song_id = ?", [i])
            .then(([rows]) => {
                if (rows.length > 0) {
                    songLinks.push(rows[0].songLink);
                }
            })
            .catch(err => {
                console.log(err);
                res.send('An error occurred while fetching the song data.');
            });
        promises.push(promise);
    }

    Promise.all(promises)
        .then(() => {
            res.render('playing', { name: 'art', songLink1: songLinks[0], songLink2: songLinks[1], songLink3: songLinks[2], songLink4: songLinks[3], songLink5: songLinks[4], song_id: song_id });
        })
        .catch(err => {
            console.log(err);
            res.send('An error occurred while fetching the song data.');
        });
});


//Play music by album_id
app.get('/playing', (req, res) => {
    const album_id = req.query.album_id;
    const songLinks = [];

    const promises = [];
    dbConnection.execute("SELECT songLink FROM nsongs WHERE album_id = ?", [album_id])
        .then(([rows]) => {
            for (let i = 0; i < rows.length && i < 10; i++) {
                songLinks.push(rows[i].songLink);
            }
            const songLink1 = songLinks[0] || "";
            const songLink2 = songLinks[1] || "";
            const songLink3 = songLinks[2] || "";
            const songLink4 = songLinks[3] || "";
            const songLink5 = songLinks[4] || "";
            const songLink6 = songLinks[5] || "";
            const songLink7 = songLinks[6] || "";
            const songLink8 = songLinks[7] || "";
            const songLink9 = songLinks[8] || "";
            const songLink10 = songLinks[9] || "";

            res.render('playing', { 
                name: 'art', 
                songLink1, 
                songLink2, 
                songLink3, 
                songLink4, 
                songLink5, 
                songLink6, 
                songLink7, 
                songLink8, 
                songLink9, 
                songLink10 
            });
        })
        .catch(err => {
            console.log(err);
            res.send('An error occurred while fetching the song data.');
        });
});







app.get('/playing',(req,res)=>{

    res.render('playing');
});

app.get('home',(req,res)=>{
    res.render('home');
});

// ดึงข้อมูลลิ้งค์เพลงจาก MySQL Database

// LOGOUT
app.get('/logout',(req,res)=>{
    //session destroy
    req.session = null;
    res.redirect('/');
});
// END OF LOGOUT

app.use('/', (req,res) => {
    res.status(404).send('<h1>404 Page Not Found!</h1>');
});



app.listen(3000, () => console.log("Server is Running..."));