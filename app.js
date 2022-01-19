const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const ejs=require('ejs');
const multer=require('multer');
var fs = require('fs');
var path = require('path')
const qr=require('qrcode');
const nodemailer = require('nodemailer');
mongoose.connect('mongodb://localhost:27017/rubixdb');
var search="";
var pincode="";
// oc259c
const rSchema={
	hospital:String,
	pincode:String,
	blood:String,
	quan:String,
}
const patientSchema={
	Name:String,
	email:String,
	phone:String,
}
const bedSchema={
	pincode:String,
	bed:String,
}
const oxygenSchema={
	pincode:String,
	Quantity:String,
}
var imageSchema = new mongoose.Schema({
    name: String,
    desc: String,
    img:
    {
        data: Buffer,
        contentType: String
    }
});
const slotSchema={
	hospital:String,
	timing:String,
}
const slot_bookingSchema={
patient_name:String,
patient_email:String,
patient_phone:String,
patient_time:String,
}
const userSchema={

	name:String,
	password:String,
}
const Rp=mongoose.model('Rp',rSchema);
const slot_book=mongoose.model('slot_book',slotSchema);
const slot_booking=mongoose.model('slot_booking',slot_bookingSchema);
const User=mongoose.model('User',userSchema);
const O2=mongoose.model('O2',oxygenSchema);
const Patient=mongoose.model('Patient',patientSchema);
const image=mongoose.model('image',imageSchema);
const Bed=mongoose.model('Bed',bedSchema);
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "icare9519@gmail.com",
      pass: "Icare21@#",
    },
});


function exportMail(receiver, subject, html){
    let info = transporter.sendMail({
        from: 'petozone update', // sender address
        to: receiver, // list of receivers
        subject: "", // Subject line
        text: "", // plain text body
        html: html, // html body
    });
}


app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.get("/",(req,res)=>{
res.render("index");
})
app.post("/det",(req,res)=>{
var post=new Rp({
	hospital:req.body.hospital,
		pincode:req.body.pincode,
		blood:req.body.blood,
		quan:req.body.quan,
	})
	post.save();
	res.redirect("/blood_page")
})

app.post("/confirm_appointment", async (req,res) => {
    // const doc_id = req.body.doc_id;
    const email = req.body.email;
    const timing = req.body.timing;
	console.log(email);
    // const name = req.body.name;
    
        const html = `
        <html>
        <head>
        </head>
        <style>
            .header{
                text-align: center;
                background-color:black ;
                color: beige;
                font-size: medium;
            }
            .container{
                color: black;
                font-size: medium;

            }
            .text{
                font-size: medium;
                text-align: center;


            }
            .footer{
                background-color: black;
                color: white;
            }
        </style>
        <body style="background-color:rgb(193, 250, 250);">
         <div class="header" style=" text-align: center;
         background-color:black ;">  <h1>Congratulation!!!!</h1></div>
         <hr>
         <div class="container">
             <h2><i>DEAR SIR/MADAM,</i></h2>
            <div class="text" style=" text-align: center;"> <P><b><i>We are here to inform you that you have succesfully booked an appoinment with are verified doctor <br>
                 and it is your first appointment so it will be free of cost.Other details like video calling link will be <br> sent to you
                 your registered mobile number as your mentioned timing.:):):)</b></i>
             </P>
            </div>
         </div>
         <hr>
         <div class="footer">
             <h2><i>Thank You!!</i></h2>

             <h3><i>Regards:i-Care</i></h3>
         </div>

        </body>
        </html>



        `
        exportMail(email, "Confirmation for booking", html)
    
})

app.get('/oxygen_cylinder',(req,res)=>{
	O2.find({pincode:pincode},(err,data)=>{
		if(err){
			console.log(err);
		}
		else{
			res.render('oxygen_cylinder',{data:data});
		}
})
})
app.get("/detail/:id",(req,res)=>{
	const id=req.params.id;
image.findById(id,(err,post)=>{
		if(err) console.log(err);
		else{
			qr.toDataURL(post.img.dat ,(er,src)=>{
				if(er) console.log(er);
				else res.render("qr",{src:src});
			})
		}
	})
})
app.get('/blood',(req,res)=>{
	Rp.find({},(err,data)=>{
		if(err){
			console.log(err);
		}
		else{
			res.render('blood',{cd1:data});
		}
})
})
var email="";
app.post('/patient_detail',(req,res)=>{
	var obj=new Patient({
		Name:req.body.First_name,
		email:req.body.email,
		phone:req.body.phone,

	})
	obj.save();
	
	email=req.body.email;
	res.redirect('/book')
})

app.post("/se",(req,res)=>{
	const pincode=req.body.pin;
	Rp.find({pincode:pincode,blood:req.body.bloodgroup},(err,cd)=>{
		if(err) console.log(err)
		else{
			res.render("blood",{cd1:cd});
		}
	})
})
app.get("/upd",(req,res)=>{
	Rp.find({},(er,cd)=>{
		if(er) console.log(er)
		else{
			res.render("upd",{user:cd})
		}
	})
	// res.render("upd");
})
var storage=multer.diskStorage({
	destination:(req,file,cb)=>{
		cb(null,'uploads')
	},
	filename:(req,file,cb)=>{
cb(null,file.fieldname+"-"+Date.now())
	}
});
var upload=multer({storage: storage})
app.get("/up",(req,res)=>{
	image.find({},(er,cd)=>{
		if(er) console.log(er)
		else{
			res.render("up",{item:cd})
		}
	})
})
app.get('/hospital_login',(req,res)=>{
	res.render("hospital_login");
})
app.get("/Bed",(req,res)=>{
	Bed.find({pincode:pincode},(er,cd)=>{	
		if(er) console.log(er)
		else{
			res.render("Bed",{data:cd})
		}
	})

})
app.post('/addbed',(req,res)=>{
	var obj=new Bed({
		pincode:pincode,
		bed:req.body.oq,
	})
	obj.save();
	res.redirect('/Bed');
})
app.post("/pic",upload.single('image'),(req,res,next)=>{
	var pbj=new image({
		name:req.body.name,
		desc:req.body.desc,
		img:{
			data:fs.readFileSync(path.join(__dirname+'/uploads/'+req.file.filename)),
		contentType:'image/png'
		}
	})
	// pbj.save();
	pbj.save();
	res.redirect("/up");
})

app.post("/up",(req,res)=>{

	var ui=req.body.ui;
	var qua=req.body.quantity;
	

	// User.findOneAndUpdate({_id:ui},(er,cd)=>{
	//     if(er){
	//         console.log(er);
	//     }else{
		
	//     }

	// })
	Rp.findOneAndUpdate({_id: ui}, {$set: { quan:qua}}, {new: true}, (err, doc) => {
		if (err) {
			console.log("Something wrong when updating data!");
		}
		res.redirect("/blood_page");
	});
})
app.post('/add',(req,res)=>{
	var obj=new O2({
		pincode:pincode,
		Quantity:req.body.oq,
	})
	obj.save();
	res.redirect('/oxygen_cylinder');
})
app.post("/upo",(req,res)=>{

	var ui=req.body.ui;
	var qua=req.body.quantity;
	

	// User.findOneAndUpdate({_id:ui},(er,cd)=>{
	//     if(er){
	//         console.log(er);
	//     }else{
		
	//     }

	// })
	O2.findOneAndUpdate({_id: ui}, {$set: { Quantity:qua}}, {new: true}, (err, doc) => {
		if (err) {
			console.log("Something wrong when updating data!");
		}else{
		res.redirect("/oxygen_cylinder");
		}
	});
})
app.get("/create",(req,res)=>{
	res.render("create");
})
app.post("/book_slot",(req,res)=>{
	var hospital_name=req.body.hname;
	var time=req.body.timing;
	var post=new slot_book({
		hospital:hospital_name,
		timing:time,
	})
	post.save();

})
app.get('/book',(req,res)=>{
	slot_book.find({},(er,cd)=>{
		if(er) console.log(er)
		else{
			res.render("book",{book:cd})
		}
	})
})
app.get('/patient_register',(req,res)=>{
	res.render("patient_register");
})
app.post('/delete',(req,res)=>{
	var id=req.body.ui;
	var time1="";
	console.log(email)
slot_book.findById(id,(er,cd)=>{
	if(er) console.log(er);
	else {
		
		var obj=new slot_booking({
			patient_email:email,
			patient_time:cd.timing,
		})
		obj.save();
		
		
	}
})


	slot_book.findByIdAndRemove(id,(er,cd)=>{
		if(er) console.log(er)
		else{
			res.redirect("/book");
		}
	})
})
app.get('/patient_book',(req,res)=>{
	slot_booking.find({},(er,cd)=>{
		if(er) console.log(er);
		else{
			res.render('patient_book',{cd1:cd})
		}
	})
})
app.get('/hospital',(req,res)=>{
	res.render('hospital');
})
app.get('/hospital_login',(req,res)=>{
	res.render('hospital_login');
})
app.post('/login',(req,res)=>{
	
pincode=req.body.pincode;
res.redirect('/hospital')
})
app.get('/blood_page',(req,res)=>{
	Rp.find({pincode:pincode},(er,cd)=>{
		if(er) console.log(er)
		else{

			res.render('blood_page',{cd1:cd});
		}
	})
})
app.post('/logi',(req,res)=>{
	search=req.body.username;
	var post=new User({
		name:req.body.username,
		password:req.body.password,
	})
post.save();
res.redirect('/book')
})
app.listen(80,(req,res)=>{
	console.log("chalu hgya");
})