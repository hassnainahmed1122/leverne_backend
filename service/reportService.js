const { parse } = require('json2csv'); // Use json2csv to generate CSV data
const { send365Email } = require('./emailService');

async function createCsvReport(data) {
    // Define CSV header and fields
    const fields = [
        { label: 'Return Policy #', value: 'return_policy_number' },
        { label: 'Salla Reference ID', value: 'salla_reference_id' },
        { label: 'Return Order Number', value: 'return_order_number' },
        { label: 'Customer Name', value: 'customer_name' },
        { label: 'Customer Phone Number', value: 'customer_phone_number' },
        { label: 'Return Request Date', value: 'return_request_date' },
        { label: 'Return Status', value: 'return_status' },
        { label: 'Payment Method', value: 'payment_method' },
        { label: 'Amount to Transfer to Customer', value: 'amount_to_transfer' },
        { label: 'IBAN', value: 'iban' },
        { label: 'Bank Code', value: 'bank_code' }
    ];

    // Convert JSON data to CSV
    return parse(data, { fields });
}

async function generateReportAndSendEmail(reportType, data) {
    try {
        // Generate CSV data as a string
        const csvData = await createCsvReport(data);
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
