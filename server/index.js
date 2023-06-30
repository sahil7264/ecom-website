const express = require('express')
const app = express();
const config = require('./database/config');
const users = require('./database/user');
const products = require('./database/products')
const cors = require('cors');
const Jwt = require('jsonwebtoken');
const jwtkey = 'sahilshile';
//middleware use to get data from server
app.use(express.json());
app.use(cors());

//middleware vs funtion 
//in middleware there is req,resp,next parameters has been send
function verifyToken(req, resp, next) {
    // console.log("Called middlleware");
    let token = req.headers['authorization'];//get token
    if (token) {
        token = token.split(' ')[1];
        Jwt.verify(token,jwtkey,(err,valid)=>{
            if(err) resp.status(401).send({result:"Please provide valid token"});
            else next();
        })
    }
    else{
        resp.status(403).send({result : "Please add token with header"})
    }
    next();//send back to route
}

app.post('/signup', async (req, resp) => {
    let user = new users(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.pass;
    Jwt.sign({ result }, jwtkey, { expiresIn: "2h" }, (err, token) => {
        if (err) resp.send({ result: "Something went wrong" });
        resp.send({ result, auth: token });
    })
});

app.post('/login', async (req, resp) => {
    if (req.body.pass && req.body.email) {
        console.log(req.body);
        let ans = await users.findOne(req.body).select("-pass");
        if (ans) {
            Jwt.sign({ ans }, jwtkey, { expiresIn: "2h" }, (err, token) => {
                if (err) resp.send({ result: "Something went wrong" });
                resp.send({ ans, auth: token });
            })
        }
        else {
            resp.send({ result: "User not found" });
        }
    }
})
app.post('/add-product',verifyToken, async (req, resp) => {
    let product = new products(req.body);
    let result = await product.save();
    result = result.toObject();
    if (result) resp.send(result);
});

app.post('/list-product',verifyToken,async (req, resp) => {
    let result = await products.find();
    if (result) resp.send(result);
})
app.get("/product/:id",verifyToken, async (req, resp) => {
    let result = await products.find({ _id: req.params.id });
    if (result) resp.send(result);
    else resp.send({ "result": "No Result Found" })
})

app.delete('/delete/:id',verifyToken, async (req, resp) => {
    const result = await products.deleteOne({ _id: req.params.id });
    resp.send(result);
})

app.put('/product/:id',verifyToken, async (req, resp) => {
    const result = await products.updateOne({ _id: req.params.id }, { $set: req.body });
    resp.send(result);
});

app.get('/search/:key', verifyToken, async (req, resp) => {
    const result = await products.find({
        "$or": [
            { productName: { $regex: req.params.key } },
            //    {productCategory:{$regex:req.params.key}},
            //    {productCompany:{$regex:req.params.key}},
        ]
    });
    resp.send(result);
})

app.listen(2600, () => {
    console.log("server started");
});