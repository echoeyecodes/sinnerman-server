import jwt from 'jsonwebtoken'
import { JWT_KEY } from '../constants/jwt.key'

const generateToken = (id: string) : string =>{
    const token = jwt.sign(id, JWT_KEY)
    return token
}

export {generateToken}