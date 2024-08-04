const { parse } = require('json2csv'); // Use json2csv to generate CSV data
const { send365Email } = require('./emailService');
const { RefundRequest, RefundItem, Customer, Product, Order } = require('../models');

// Fetch refund requests from the database
async function getRefundRequestsData() {
    try {
        const refundRequests = await RefundRequest.findAll({
            include: [
                {
                    model: RefundItem,
                    as: 'refundItems',
                    include: [{ model: Product, as: 'product' }]
                },
                {
                    model: Customer,
                    as: 'customer'
                },
                {
                    model: Order,
                    as: 'order'
                }
            ]
        });
        return refundRequests;
    } catch (error) {
        console.error('Error fetching refund requests:', error);
        throw error;
    }
}

// Transform refund requests data for CSV
function transformRefundRequestsData(refundRequests, reportType) {
    return refundRequests.map(refundRequest => {
        const baseData = {
            'Salla Reference ID': refundRequest.order?.salla_reference_id || '',
            'Return Order Number': refundRequest.uuid || '',
            'Customer Name': `${refundRequest.first_name} ${refundRequest.last_name}` || '',
            'Customer Phone Number': refundRequest.customer?.mobile_number || '',
            'Return Request Date': new Date(refundRequest.createdAt).toISOString().split('T')[0],
            'Return Status': refundRequest.return_status || 'pending',
            'Payment Method': refundRequest.payment_method || '',
            'Amount to Transfer to Customer': refundRequest.refund_amount || 0,
            'IBAN': refundRequest.iban || '',
            'Bank Code': '' // Placeholder
        };

        if (reportType !== 'finance') {
            baseData['Return Policy #'] = '123454688'; // Placeholder
        }

        return baseData;
    });
}

// Create CSV report with conditional fields
async function createCsvReport(data, reportType) {
    // Define CSV header and fields
    const fields = [
        ...(reportType !== 'finance' ? [{ label: 'Return Policy #', value: 'Return Policy #' }] : []),
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

// Generate report and send email with CSV data
async function generateReportAndSendEmail(reportType, data) {
    try {
        const refundRequests = await getRefundRequestsData();
        const transformedData = transformRefundRequestsData(refundRequests, reportType);
        const csvData = await createCsvReport(transformedData, reportType); // Ensure to pass reportType here
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
