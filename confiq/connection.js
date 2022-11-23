const mongoClient=require('mongodb').MongoClient

const state={
    db:null
}

module.exports.connect=function(done){
    const url='mongodb://localhost:27017'
    // const url='mongodb+srv://mubashir:mubashir@cluster0.hshbtaq.mongodb.net/test'
    const dbname='shopping'
    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)

        state.db=data.db(dbname)
        done()
    })
    
}   
module.exports.get=function(){
    return state.db
}

