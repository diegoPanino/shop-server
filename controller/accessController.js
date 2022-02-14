const signIn = (req,res) => {
	const {username,email,psw} = req.body
	const hash = bcrypt.hashSync(psw,salt)
	db('user').insert({
		name:username,
		email:email,
		password:hash
	})
	.then(queryResult => {
		res.sendStatus(200)
	})
	.catch(err => {
		switch(err.code){
			case '23505': {
				res.status(400).send({error:'Account already taken!'})
				break
			}
			default:{
				res.status(400).json('No possible register you! Sorry :(')		
				break
			}
		}
	})
}