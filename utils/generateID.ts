import shortid from 'shortid'

function generateID(){
    return shortid.generate()
}

export default generateID