import redis from "redis";
import {promisify} from 'util'

const client = redis.createClient()

async function deleteUserCacheByEmail(email : string){
    return promisify(() =>{
        client.del(`${email}`)
    }).bind(client)
}

export {deleteUserCacheByEmail}