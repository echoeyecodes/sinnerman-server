import bcrypt from 'bcryptjs'

export default function verifyPassword(password: string, reference: string) : boolean{
    const isValid = bcrypt.compareSync(password, reference)
    return isValid
}