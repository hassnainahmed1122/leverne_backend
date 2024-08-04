const { parse } = require('json2csv'); // Use json2csv to generate CSV data
const { send365Email } = require('./emailService');
const { RefundRequest, RefundItem, Customer, Product, Order } = require('../models');

async function getRefundRequestsData() {
    try {
        const refundRequests = await RefundRequest.findAll({
            include: [
                {
                    model: RefundItem,
                    as: 'refundItems', // Ensure alias matches model definition
                    include: [{ model: Product, as: 'product' }]
                },
                {
                    model: Customer,
                    as: 'customer' // Ensure alias matches model definition
                },
                {
                    model: Order,
                    as: 'order' // Ensure alias matches model definition
                }
            ]
        });
        return refundRequests;
    } catch (error) {
        console.error('Error fetching refund requests:', error);
        throw error;
    }
}

function transformRefundRequestsData(refundRequests) {
    return refundRequests.map(refundRequest => {
        return {
            'Return Policy #': '123454688', // Placeholder
            'Salla Reference ID': refundRequest.order?.salla_reference_id || '', // Use optional chaining
            'Return Order Number': refundRequest.uuid || '',
            'Customer Name': `${refundRequest.first_name} ${refundRequest.last_name}` || '',
            'Customer Phone Number': refundRequest.customer?.mobile_number || '', // Use optional chaining
            'Return Request Date': new Date(refundRequest.createdAt).toISOString().split('T')[0],
            'Return Status': refundRequest.return_status || 'pending',
            'Payment Method': refundRequest.payment_method || '',
            'Amount to Transfer to Customer': refundRequest.refund_amount || 0,
            'IBAN': refundRequest.iban || '',
            'Bank Code': '' // Placeholder
        };
    });
}

async function createCsvReport(data) {
    // Define CSV header and fields
    const fields = [
        { label: 'Return Policy #', value: 'Return Policy #' },
        { label: 'Salla Reference ID', value: 'Salla Reference ID' },
        { label: 'Return Order Number', value: 'Return Order Number' },
        { label: 'Customer Name', value: 'Customer Name' },
        { label: 'Customer Phone Number', value: 'Customer Phone Number' },
        { label: 'Return Request Date', value: 'Return Request Date' },
        { label: 'Return Status', value: 'Return Status' },
        { label: 'Payment Method', value: 'Payment Method' },
        { label: 'Amount to Transfer to Customer', value: 'Amount to Transfer to Customer' },
        { label: 'IBAN', value: 'IBAN' },
        { label: 'Bank Code', value: 'Bank Code' }
    ];

    // Convert JSON data to CSV
    return parse(data, { fields });
}

async function generateReportAndSendEmail(reportType, data) {
    try {
        // Generate CSV data as a string
        const refundRequests = await getRefundRequestsData();
        const transformedData = transformRefundRequestsData(refundRequests);
        const csvData = await createCsvReport(transformedData); // Ensure to await here
        console.log(`CSV data generated for ${reportType}`);

        // Send email with CSV data as attachment
        await send365Email({
            to: 'hassnainahmed111222@gmail.com',
            subject: `Daily ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
            text: 'Please find the attached report.',
            html: '<p>Please find the attached report.</p>',
            attachments: [
                {
                    filename: `${new Date().toISOString().split('T')[0]}_reports_${reportType}.csv`,
                    content: csvData,
                    encoding: 'utf-8'
                }
            ]
        });

        console.log(`Report for ${reportType} generated and sent successfully.`);
    } catch (error) {
        console.error(`Failed to generate and send report for ${reportType}:`, error);
        throw error;
    }
}

module.exports = { generateReportAndSendEmail };
