const express = require('express')
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/User')
const jwt = require('jsonwebtoken')
const cookieParser= require('cookie-parser')
const multer = require('multer')
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs = require('fs')
const Post = require('./models/Post')

var bcrypt = require('bcryptjs')
const app = express();
const salt = bcrypt.genSaltSync(10);
const secret= "ehfnkmvd"


app.use(cors({credentials:true,origin:'http://localhost:5173'}))
app.use(express.json())
app.use(cookieParser())
app.use('/uploads',express.static(__dirname+'/uploads'))

try {
      mongoose.connect("mongodb+srv://1rishi1002:0PYD3ayWvzc9rgfq@cluster0.s5ta0k9.mongodb.net/?retryWrites=true&w=majority").then(()=>{
        console.log("Connected")
      });
    
} catch (error) {
    console.log(error)
    
}
app.post('/register',async (req,res)=>{
    const {username,password}=req.body;
    try {
        const userDoc= await User.create({
            username,
            password:bcrypt.hashSync(password, salt)
        })
        res.json(userDoc)
    } catch (error) {
        res.status(400).json(error)
    }
    
    
})


app.post('/login',async (req,res)=>{
    const {username,password}=req.body;
    const userDoc = await User.findOne({username});
    const passOk= bcrypt.compareSync(password, userDoc.password)
    if(passOk){
        //loggedin
        jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{
            if(err) throw err;
            res.cookie('token',token).json({
                id:userDoc._id,
                username
            })
        })
    }else{
        res.status(400).json('wrong credential')
    }
})

app.get('/profile',(req,res) => {
    const {token}=req.cookies;
    jwt.verify(token,secret,{},(err,info)=>{
        if(err) throw err;
        res.json(info);
    })
})


app.post('/logout',(req,res)=>{
    res.cookie('token','').json('ok');
})


app.post('/post',uploadMiddleware.single('file'),async (req,res)=>{
    const {originalname,path}= req.file;
    const parts= originalname.split('.');
    const ext = parts[parts.length -1]
    const newPath =path+'.'+ext
    fs.renameSync(path,newPath)

    const {token}=req.cookies;
    jwt.verify(token,secret,{},async (err,info)=>{
        if(err) throw err;
        const {title,summary,content}=req.body
        const postDoc = await Post.create({
        title,
        summary,
        content,
        cover:newPath,
        author: info.id
    })
    res.json(postDoc)
    })

    


    
})


app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
    try {
      let newPath = null;
      if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
      }
  
      const { token } = req.cookies;
      const decoded = jwt.verify(token, secret);
      
      const { id, title, summary, content } = req.body;
      
      const postDoc = await Post.findByIdAndUpdate(
        id,
        {
          title,
          summary,
          content,
          cover: newPath ? newPath : null, // If newPath is falsy, set cover to null
        },
        { new: true } // To return the updated document
      );
  
      if (!postDoc) {
        return res.status(400).json('Post not found');
      }
  
      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(decoded.id);
      if (!isAuthor) {
        return res.status(400).json('You are not the author');
      }
  
      res.json(postDoc);
    } catch (error) {
      console.error(error);
      res.status(500).json('Server Error');
    }
  });
  

app.get('/post', async (req,res) => {
    res.json(
      await Post.find()
        .populate('author', ['username'])
        .sort({createdAt: -1})
        .limit(20)
    );
  });


app.get('/post/:id',async (req,res)=>{
    const {id}= req.params
    const postDoc=await Post.findById(id).populate('author',['username'])
    res.json(postDoc)
})

app.listen(4000)


