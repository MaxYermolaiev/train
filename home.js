const { EventEmitter } = require ('events');

class Bank extends  EventEmitter{
    constructor() {
        super()
        this.users = [];
        this.init()
    }
    init(){
        this.on('error',(error)=>{
            console.error(error)
        })
        this.on('created',(user)=>{
            console.error(`${user.name} was created`)
        })
        //not implemented yet
        this.on('add',(amount,cb)=>{
            cb.call(this,amount)
        })
        this.on('get',(amount,cb)=>{
            cb.call(this,amount)
        })
        this.on('withdraw',(amount,cb)=>{
            cb.call(this,amount)
        })
    }
    register(data){
        let {name,balance,limit}=data;

        if(this.__find(name,'name')>=0){
            this.emit('error',ReferenceError(`User: ${name} already exist`))
            return this;
        }else if(!this.__is_numeric(balance)||balance<0){
            this.emit('error',ReferenceError('User balance should be number'))
            return this;
        }else{
            data.id= this.users.length===0?0:this.users.length;
            this.users.push(data)
            this.emit('created',data);
            return data;
        }
    }
    add({id,amount}){
        let index = this.__find(id,'id')
        if(index<0){
            this.emit('error',ReferenceError('User not found exist'))
            return this;
        }
        if(!this.__is_numeric(amount)||amount<=0){
            this.emit('error',RangeError(`Amount ${amount} is not valid`))
            return this;
        }
        this.users[index].balance += amount;
        this.emit('add',amount,(v)=> console.log(`Balance was replenished by ${v}₴`))
    }
    get({id}){
        let index = this.__find(id,'id')
        if(index<0){
            this.emit('error',ReferenceError('User not found exist'))
            return this;
        }

        this.emit('get',this.users[index].balance,(v)=> console.log(`User balance is ${v}₴`))
    }
    withdraw({id,amount}){

        let index = this.__find(id,'id')
        if(index<0){
            this.emit('error',ReferenceError('User not found exist'))
            return this;
        }
        if(!this.__is_numeric(amount)||this.users[index].balance - amount<0){
            this.emit('error',RangeError(`Lack of money, try less  ${this.users[index].balance}`))
            return this;
        }
        this.users[index].balance-=amount;
        this.emit('withdraw',this.users[index].balance,(v)=> console.log(`User balance is ${v}₴,withdrew is ${amount}`))
    }
    send(data){
        let {sender, recipient,amount} = data;

        let sender_index = this.__find(sender,'id');
        let recipient_index = this.__find(recipient,'id');
        if(sender_index<0||recipient_index<0){
            this.emit('error',ReferenceError('sender or recipient not found exist'))
            return this;
        }
        if(!this.__is_numeric(amount)||this.users[recipient_index].balance - amount<0){
            this.emit('error',RangeError(`Lack of money in sender side, try less  ${this.users[recipient_index].balance}`))
            return this;
        }
        this.users[recipient_index].balance +=amount
        this.users[sender_index].balance -=amount
        console.log(recipient_index,sender_index,this.users[recipient_index].balance,this.users[sender_index].balance)
    }
    change_limit=(data)=>{
        let {id} = data
        let person = this.__get_person(id,'id','change limit');
        if(!person)return
        console.log(person,this,this.name)
    }
    __get_person(id,field,err_func){
        let __id = this.__find(id,field);
        if(__id<0){
            this.emit('error',ReferenceError(`User not found, root: ${err_func}`))
            return;
        }
        else{
            return this.users[__id]
        }
    }
    __find=(value,field)=> this.users.findIndex(user=>value===user[field])
    __is_numeric=v=>isFinite(v)&&!isNaN(v)
}


const bank = new Bank();
const personId = bank.register({
    name: 'Oliver White',
    balance: 700,
    limit: amount => amount < 10
});

const personId3 = bank.register({
    name: 'Oliver Black',
    balance: 700,
    limit: amount => amount < 10
});
bank.get({id:personId3.id})
bank.add({id:personId3.id,amount:10})
bank.get({id:personId3.id})
bank.withdraw({id:personId3.id, amount:50});
bank.send({sender:personId3.id,recipient:personId.id, amount:600});
bank.change_limit(354)
/*
bank.emit('withdraw', personId, 5);
bank.emit('get', personId, (amount) => {
    console.log(`I have ${amount}₴`); // I have 695₴
});
// Вариант 1
bank.emit('changeLimit', personId, (amount, currentBalance,
                                    updatedBalance) => {
    return amount < 100 && updatedBalance > 700;
});
bank.emit('withdraw', personId, 5); // Error
// Вариант 2
bank.emit('changeLimit', personId, (amount, currentBalance,
                                    updatedBalance) => {
    return amount < 100 && updatedBalance > 700 && currentBalance > 800;
});
// Вариант 3
bank.emit('changeLimit', personId, (amount, currentBalance) => {
    return currentBalance > 800;
});
// Вариант 4
bank.emit('changeLimit', personId, (amount, currentBalance,
                                    updatedBalance) => {
    return updatedBalance > 900;
});*/