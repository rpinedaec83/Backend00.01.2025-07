const express=require('express')
const cors=require('cors')
require('dotenv').config()

const PORT=process.env.PORT||5000
const SKSTRIPE=process.env.SKSTRIPE
const db=require('./models')
const User=db.User
const Order=db.Order
const session=require('express-session')
const jwt = require('jsonwebtoken');


const stripe=require('stripe')(SKSTRIPE)
const syncDb=require('./db_sync')
const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto123';



const app = express()
const con=require('./db_con')

app.use(express.json())

app.use(cors({
  origin: 'http://localhost:3000', // URL de tu frontend
  credentials: true // permite enviar cookies
}));

app.use(session({
    secret: 'clave-secreta',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: 'lax' } // importante para localhost
}));

app.get('/',(req,res)=>{
     res.send("hola desde el back")
    })
app.post('/login',async (req,res)=>{ 
    console.log("funciona")
       const username=req.body.user
       console.log(username)
       const password=req.body.password
       let verificacion= await User.findOne({
        where:{User:username}
       })
       console.log(verificacion)
       if (!verificacion){
        return res.status(404).json({error:"usuario no encontrado"})
       }
       if(password==verificacion.password){  
            
    const token = jwt.sign({ userId: verificacion.id }, JWT_SECRET, { expiresIn: '1h' });
         res.json({success:true,token,userId:verificacion.id,redirect:'http://localhost:3000/StripePayment'})
       }  
    })


app.post('/api/create-checkout-session',[authMiddleware],async(req,res)=>{
 const { product} = req.body;

  const buyerId=req.userId
 const order = await Order.create({
            Product: product.name,
            Price: product.price * 100, // Stripe usa centavos
            Quantity: product.quantity,
            BuyerId:buyerId
        }); 
    const session=await stripe.checkout.sessions.create({
        payment_method_types:['card'],
        line_items:[
            {
            price_data:{
                currency:"pen",
                product_data:{
                    name:product.name
                },
                unit_amount:product.price * 100
            },
            quantity:product.quantity
            }     
        ],
        mode:"payment",
        success_url:"http://localhost:3000/success",
        cancel_url:"http://localhost:3000/cancel"
    })
    res.json({session})
})


app.post('/api/cancel-payment', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // viene del token JWT
    console.log("Cancelando compra para user:", userId);

    // Busca el último pedido de ese usuario (el que se acaba de crear)
    const lastOrder = await Order.findOne({
      where: { BuyerId: userId },
      order: [['createdAt', 'DESC']]
    });

    if (!lastOrder) {
      return res.status(404).json({ error: 'No se encontró ningún pedido' });
    }

    // Elimina el pedido
    await lastOrder.destroy();

    return res.json({ success: true, message: 'Pedido cancelado y eliminado correctamente' });

  } catch (error) {
    console.error("Error al cancelar pedido:", error);
    res.status(500).json({ error: 'Error interno al cancelar pedido' });
  }
});


app.listen(PORT,async ()=>{try {
    await syncDb()
    console.log("db ok")
} catch (error) {
    console.error("dbm fail",error)
}
console.log(`Servidor iniciado en el puerto ${PORT}`)
})

app.post('/register',(req,res)=>{
    
    const usuarioNuevo={
        User:req.body.User,
        password:req.body.password
    }
    User.create(usuarioNuevo).then(data=>{
        res.status(201).send(data)
    }).catch(error=>{
        return res.status(500).send(error)
    })
    
})

app.post('/logout',logout);


function authMiddleware(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(401).json({ error: "No token" });

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.userId; // guardamos el userId en req
        next();
    } catch(err) {
        return res.status(401).json({ error: "Token inválido" });
    }
}
function logout() {
  localStorage.removeItem("token"); // elimina el JWT
  window.location.href = "http://localhost:3000/login"; // redirige al login
}