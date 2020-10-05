import randomatic from 'randomatic'

function generateOTP(){
    return randomatic("0", 6);
}

export default generateOTP;