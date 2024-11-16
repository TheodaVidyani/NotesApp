const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    //passing the token in the request headers.

    if(!token) return res.sendStatus(401);
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(401);
        req.user = user;
        next();
    });
}

module.exports = authenticateToken; 

 // End of Backend/utilities.js

 //This file is where we, implement token verification and attach the user to the request.