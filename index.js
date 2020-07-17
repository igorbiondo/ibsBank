const express = require('express')
const app = express()
const sqlite = require('sqlite')
const sqlite3 = require('sqlite3').verbose()
const bodyParser = require('body-parser')
const { request } = require('express')

const path = require('path')


const dbConnection = sqlite.open({
    filename:'banco.sqlite',
    driver: sqlite3.Database}
    
)
const reso = async() => {
    db = await dbConnection
    path.resolve(__dirname,'banco.sqlite')
}
reso()
const port = process.env.PORT || 3000

app.set('views', path.join(__dirname,'views'))
app.set('view engine', 'ejs')   //define os parametros para encontrar os arquivos ejs
app.use(express.static(path.join(__dirname,'public')))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req,res) => {
    res.render('home')

})
app.get('/gerente/apagarcliente/:id', async (req, res) => {
    const db = await dbConnection
    await db.run('delete from clientes where id == '+req.params.id)
    res.redirect('/gerencia/')
})
app.get('/minha-conta/:id', async(req,res) => {
    const conta = req.params.id
    const db = await dbConnection
    const clienteDb = await db.all('SELECT * FROM clientes WHERE id ='+conta)
    res.render('minha-conta', {
        clienteDb
    })
    app.post('/minha-conta/:id', async(req,res) =>{
        const {deposita} = req.body
        const {saca} = req.body
        const { id } = req.params
        const db = await dbConnection
        const saldoVetor = await db.all('SELECT saldo FROM clientes WHERE id ='+id)
        const saldo = saldoVetor[0]
        const saldoAtual = parseFloat(saldo.saldo)
        if(deposita){
            const paraDeposito = parseFloat(deposita)
            const depositar = saldoAtual+paraDeposito
            await db.run(`update clientes set saldo = ${depositar} where id = ${id}`)
        }else{
        
        const paraSaque = parseFloat(saca)  
        const sacar = saldoAtual-paraSaque
        await db.run(`update clientes set saldo = ${sacar} where id = ${id}`)
      
        }
        res.redirect('/minha-conta/'+id)  
          
        
    })

})
    
app.get('/nova-conta', (req,res) => {
    res.render('nova-conta')

})
app.get('/gerencia', async(req,res) => {
    const db = await dbConnection
    const clienteDb = await db.all('SELECT * FROM clientes')
    res.render('gerencia', {
        clienteDb
    })

})
app.post('/nova-conta', async(req,res) =>{
    const {nome,rg,cpf,telefone,senha } = req.body
    const db = await dbConnection
    await db.run(`insert into clientes(cliente, rg, cpf, telefone,senha) values('${nome}', '${rg}', '${cpf}', '${telefone}', '${senha}')`)
    res.redirect('/')   
    
})

 app.post('/', async(req,res) => {
    const {agencia, conta, senha} = req.body
    const db = await dbConnection
    const clienteDb = await db.all('SELECT * FROM clientes WHERE id ='+conta)
    const cliente = clienteDb[0]
    if(conta == 1){
        if (senha == cliente.senha){
            res.redirect('/gerencia')
        }else{        
            res.redirect('/') 
        }
    }else{
        if (senha == cliente.senha){
            res.redirect('/minha-conta/'+cliente.id)
        }else{
            res.redirect('/') 
        }
    }

    
    
}) 

const init = async () => {
    const db = await dbConnection
    await db.run('create table if not exists clientes (id INTEGER PRIMARY KEY , cliente TEXT, rg INTEGER, cpf INTEGER, telefone INTEGER, senha INTEGER, saldo INT DEFAULT 0);')
    
}
init()

app.listen(port, (err) => {
    if(err){
        console.log('Servidor nao iniciado')
    }else{
        console.log('Servidor ibsBank rodando...')
    }
})