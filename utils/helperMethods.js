const { RefundRequest } = require('../models')

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const formatPhoneNumber = (phoneNumber) => {
    return phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
};

const generateEmailTemplate = (city, returnRequestId, aramexPolicyNumber) => {
    if (city.toLowerCase() === 'riyadh') {
        return {
            subject: 'طلب استرجاع من عطور ثنيان',
            text: `عميلنا العزيز،
تم تسجيل طلب الارجاع برقم: ${returnRequestId}
رقم بوليصة الشحن: ${aramexPolicyNumber}

سوف يتم التواصل معكم من قبل شركة الشحن ارامكس لاستلام المنتجات وسيتم المراجعة واعادة المبلغ في مدة لاتتجاوز ٥-٧ ايام عمل من تاريخ استلام المنتجات.

نتشرّف بخدمتكم دائماً.
عطور ثنيان،`,
            html: `<p>عميلنا العزيز،</p>
<p>تم تسجيل طلب الارجاع برقم: ${returnRequestId}</p>
<p>رقم بوليصة الشحن: ${aramexPolicyNumber}</p>
<p>سوف يتم التواصل معكم من قبل شركة الشحن ارامكس لاستلام المنتجات وسيتم المراجعة واعادة المبلغ في مدة لاتتجاوز ٥-٧ ايام عمل من تاريخ استلام المنتجات.</p>
<p>نتشرّف بخدمتكم دائماً.<br/>عطور ثنيان،</p>`
        };
    } else {
        return {
            subject: 'طلب استرجاع من عطور ثنيان',
            text: `عميلنا العزيز،
تم تسجيل طلب الارجاع برقم: ${returnRequestId}
رقم بوليصة الشحن: ${aramexPolicyNumber}

الرجاء تسليم المنتجات لأقرب فرع ارامكس وسيتم المراجعة واعادة المبلغ في مدة لاتتجاوز ٥-٧ ايام عمل من تاريخ استلام المنتجات.

نتشرّف بخدمتكم دائماً.
عطور ثنيان،`,
            html: `<p>عميلنا العزيز،</p>
<p>تم تسجيل طلب الارجاع برقم: ${returnRequestId}</p>
<p>رقم بوليصة الشحن: ${aramexPolicyNumber}</p>
<p>الرجاء تسليم المنتجات لأقرب فرع ارامكس وسيتم المراجعة واعادة المبلغ في مدة لاتتجاوز ٥-٧ ايام عمل من تاريخ استلام المنتجات.</p>
<p>نتشرّف بخدمتكم دائماً.<br/>عطور ثنيان،</p>`
        };
    }
}

const generateUnique8DigitNumber = async () => {
    let unique = false;
    let uniqueNumber = '';
    while (!unique) {
        uniqueNumber = Math.floor(10000000 + Math.random() * 90000000).toString(); // Generate an 8-digit number
        const existingRecord = await RefundRequest.findOne({ where: { uuid: uniqueNumber } });
        if (!existingRecord) {
            unique = true;
        }
    }
    return uniqueNumber;
};


module.exports = {
    generateOtp,
    formatPhoneNumber,
    generateEmailTemplate,
    generateUnique8DigitNumber
}