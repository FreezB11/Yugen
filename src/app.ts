import express, { NextFunction, Request, Response } from 'express'
import dbroute from './router/dbroute'
import * as http from 'http'
import logging from './config/logging'
import register from './pages/register'
import login from './pages/login'
import delete_usr from './pages/delete'
import home from './pages/home'
import db from './db'
import { encrypt_password } from './crypto/encrypt'
import { decrypt_password } from './crypto/decrypt'
import { User } from './model/user.model'
import * as color from 'colors'
import * as fs from 'fs'
import {readFileSync, promises as fsPromises} from 'fs';
import * as yaml from 'yaml'

color.enable()


const NAMESPACE = 'Server'
const app = express()
const httpServer = http.createServer(app)
 
app.use((req, res, next) => {
    /** Log the req */
    logging.info(NAMESPACE.blue, `METHOD: [${req.method.red}] - URL: [${req.url.green}] - IP: [${req.socket.remoteAddress}]`);
    res.on('finish', () => {
        /** Log the res */
        logging.info(NAMESPACE.blue, `METHOD: [${req.method.red}] - URL: [${req.url.green}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    })
    next();
})

app.use(express.json());       
app.use(express.urlencoded({extended: true})); 
app.use(express.static(__dirname + '/public'));

app.get('/',home.home)
app.get('/register',register.register )

app.post('/register',(req:Request,res:Response,next:NextFunction)=>{
    const username = req.body.username
    const mail = req.body.email
    const password = req.body.password
    const fname = db.crypt(mail)
    if (username == 0 || mail == 0 || password == 0){
        res.status(400).json({message:"field mandatory"})
    }
    if (db.check_usr(mail) == true){
        res.status(400).json({message:"already exists!!"})
    }
    else{      
        if (db.check_usr(mail) == true){
            res.status(400).json({message:"already exists!!"})
        }
        db.add_usr(fname,username,mail,password)
        res.redirect('/db')
    }
})

app.get('/login',login.login)

app.post('/login',(req:Request,res:Response,next:NextFunction)=>{
    const mail = req.body.email
    const password = req.body.password
    const val = db.check_usr(mail)

    if (val == true){
        const t = db.verify_usr(mail,password)
        if (t == true){
            res.status(400).json({message:"login success"})
        }
        else{
            res.status(400).json({message:"login failed"})
        }
         res.redirect('/db')
        console.log("func executing!....")
    }
    else{
        res.status(400).json({message:"User doesn't exist"})
    }
})

app.get('/delete',delete_usr.delete_usr)
app.post('/delete',(req:Request,res:Response,next:NextFunction)=>{
    const mail = req.body.email
    const password = req.body.password
    const val = db.check_usr(mail)
    if(val == true){
        db.delete_usr(mail)
        res.status(400).json({message:"usr deleted successfully"})
    }
})

app.use('/db',dbroute)
export = app; httpServer;
