const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const formatPhoneNumber = (phoneNumber) => {
    return phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
};


module.exports = {
    generateOtp,
    formatPhoneNumber
}