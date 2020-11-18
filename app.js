const express=require('express')
const graphqlHTTP=require('express-graphql').graphqlHTTP;
const {buildSchema}=require('graphql')
const dotenv=require('dotenv')
const cookieParser = require('cookie-parser');
const path=require('path');
const mysql = require('mysql');
const morgan=require('morgan')
const cors=require('cors')
dotenv.config()



const pool = mysql.createPool({
    "host": '127.0.0.1',
    "port": '3306',
    "user": 'root',
    "password": process.env.DB_PASSWORD,
    "database": 'seventeen'
});

const app=express();
const schema=buildSchema(`
    type Query{
        albums(id:Int):[albums]
        members(id:Int):[members]
    }
    type albums{
        id:Int
        title:String
        when:String
        img:String
        part:String
        link:String
    }
    type members{
        id:Int
        name:String
        birth:String
        part:String
        src:String
    }
`);

const root={
    albums:({id})=>{
        return new Promise(function(resolve) {
            if(id){
                pool.query(`select * from albums where id=${id}`, function (err, res) {
                    resolve(res)
                })
            }else{
                pool.query('select * from albums', function (err, res) {
                    resolve(res)
                })
            }
        })
    },
    members:({part,id})=>{
        return new Promise(function(resolve) {
            if (!part && !id) {
                pool.query('select * from members', function (err, res) {
                    resolve(res)
                })
            }else if(!part&&id){
                pool.query(`select * from members where id=${id}`, function (err, res) {
                    resolve(res)
                })
            }
        })
    }
}
app.use(cors({
    origin: 'http://localhost:3050',
    credentials: true,
}));

app.use(morgan('dev'))
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use('/', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));


app.use('/graphql',graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}))


app.use(()=>(err,req,res,next)=>{
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(3050,()=>{
    console.log('start')
})