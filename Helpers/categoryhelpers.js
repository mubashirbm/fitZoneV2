const db=require('../confiq/connection')
const collections=require('../confiq/collections')
const bcrypt=require('bcrypt')
const { response, get } = require('../app')
const objectId =require('mongodb').ObjectId

module.exports={
    
    addCategory:(admindata)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                admindata.category=admindata.category.toUpperCase()
                let catExist=await db.get().collection(collections.CATEGORY_COLLECTIONS).findOne(({category:admindata.category}))
                if (catExist){
                    resolve({Exist:true})
                    console.log("true");
                }else{
                    db.get().collection(collections.CATEGORY_COLLECTIONS).insertOne(admindata)
                    
                        resolve({Exist:false})
                        console.log("false");
                }
            } catch (error) {
                reject(error)
                
            }

           
        })
        },


        getAllCategory:(catId)=>{
            console.log('get all category');
            return new Promise(async(resolve,reject)=>{
                try {
                    let category=await db.get().collection(collections.CATEGORY_COLLECTIONS).find().toArray()
                    resolve(category)
                } catch (error) {
                    reject(error)
                }
               
            })
        },

        deleteCategory:(categoryId)=>{
            return new Promise((resolve,reject)=>{

               try {
                db.get().collection(collections.CATEGORY_COLLECTIONS).remove({_id:objectId(categoryId)}).then((response)=>{
                    resolve(true)
                })
               } catch (error) {
                reject(error)
                
               }
            })
        },
        
        
    }
    


    //     console.log("category");
    //     let ucase=category.category
    //     uppercase=ucase.toUpperCase()
    //     console.log(uppercase);
    //     db.get().collection(collections.CATEGORY_COLLECTIONS).insertOne(category).then((data)=>{
    //         let id=data.insertedId.toString()
    //         console.log(id);
    //         callback(id)
    //     })
    // },
    // addCategory:(category)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         db.get().collection(collections.CATEGORY_COLLECTIONS).insertOne(category).then((data)=>{
    //     resolve(data)
    // })
            
    //     })
    // },


    // addCategory : (cataData)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         try {
                
    //             cataData.category = cataData.category.toUpperCase();
    
    //             let categoryExist = await db.get().collection(collections.CATEGORY_COLLECTIONS).findOne({category:cataData.category,})
    
    //             if (categoryExist){
    //                 resolve({exist:true})
    //             }else{
    //                 db.get().collection(collections.CATEGORY_COLLECTIONS).insertOne(cataData)
    //                 resolve({exist:false})
    //             }
    //         } catch (error) {
    //             reject(error)
    //         }
          
           
    //     })
        
    // },




   
    // categoryDetails:(catId)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         db.get().collection(collections.CATEGORY_COLLECTIONS).findOne({_id:objectId(catId)}).then((response)=>{
    //             resolve(response)
    //         })
    //     })

    // },
        
    // updateCategory:(catId,editcat)=>{
    //     return new Promise((resolve,reject)=>{
    //         db.get().collection(collections.CATEGORY_COLLECTIONS).updateOne({_id:objectId(prodId)},{$set:{
    //             name:editproduct.name,
    //             category:editproduct.category,
    //             description:editproduct.description,
    //             price:editproduct.price
    //         }}).then((response)=>{
    //             resolve(prodId)
    //         })
    //     }
    //     )
    // },

   