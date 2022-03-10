const {db,authDb} = require('../config/connDb.js')
const bcrypt = require('bcrypt')

const handleRegisterNewUser = async (req,res) => {
	//request has to have email,password and name
	const {username,email,psw} = req.body
	if(!username || !email || !psw) return res.status(400).send('All field are required')
	
	try{
		//check if email is already in use
		const duplicate = await authDb.select('email').from('auth').where('email','=',email)
		if(duplicate.length > 0) return res.status(409).send('Account already taken!')
		//hash password
		const salt = bcrypt.genSaltSync(10)
		const hash = bcrypt.hashSync(psw,salt)
		//transaction on different db needed it
		//create auth db and db records
		const authDbInsert = await authDb('auth').insert({ email:email, password:hash})
		const dbUserInsert = await db('user').insert({name:username,email:email})
		//-transaction
		res.sendStatus(200)
	}
	catch(err){
		console.log('err',err)
		res.status(500).json('No possible register you now! Sorry :(')		
	}
}

module.exports = {handleRegisterNewUser}