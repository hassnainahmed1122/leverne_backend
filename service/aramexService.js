const axios = require('axios');
const { RefundRequest, RefundItem, Product, sequelize, Customer } = require('../models');
const { emailProcessor } = require('../jobs/email_processor.js');
const { processTamaraRequest } = require('../jobs/tamara_request_processor.js');

function getNextWorkingDay(date) {
    let day = date.getDay(); 

    if (day === 5) {
        date.setDate(date.getDate() + 1);
    } else if (day === 4) {
        date.setDate(date.getDate() + 2);
    }
    else {
        date.setDate(date.getDate() + 1);
    }

    return date;
}
function adjustDates() {
    let now = new Date();

    let pickupDate = getNextWorkingDay(new Date());

    if (pickupDate <= now) {
        pickupDate = getNextWorkingDay(now);
    }
    pickupDate.setHours(13, 30, 0, 0);
    pickupDate.setMinutes(pickupDate.getMinutes() - pickupDate.getTimezoneOffset());

    let readyTime = new Date(pickupDate);
    let lastPickupTime = new Date(pickupDate);
    let closingTime = new Date(pickupDate);

    readyTime.setHours(13, 30, 0, 0);
    readyTime.setMinutes(readyTime.getMinutes() - readyTime.getTimezoneOffset());
    lastPickupTime.setHours(13, 30, 0, 0);
    lastPickupTime.setMinutes(lastPickupTime.getMinutes() - lastPickupTime.getTimezoneOffset());
    closingTime.setHours(13, 30, 0, 0);
    closingTime.setMinutes(closingTime.getMinutes() - closingTime.getTimezoneOffset());

    closingTime.setDate(closingTime.getDate() + 20);

    let shippingDateTime = new Date(pickupDate);
    let dueDate = new Date(pickupDate);

    shippingDateTime.setHours(13, 30, 0, 0);
    shippingDateTime.setMinutes(shippingDateTime.getMinutes() - shippingDateTime.getTimezoneOffset());
    dueDate.setHours(13, 30, 0, 0);
    dueDate.setMinutes(dueDate.getMinutes() - dueDate.getTimezoneOffset());
    dueDate.setDate(dueDate.getDate() + 20);

    const getMillisecondsSinceEpoch = (date) => date.getTime();

    return {
        PickupDate: getMillisecondsSinceEpoch(pickupDate),
        ReadyTime: getMillisecondsSinceEpoch(readyTime),
        LastPickupTime: getMillisecondsSinceEpoch(lastPickupTime),
        ClosingTime: getMillisecondsSinceEpoch(closingTime),
        ShippingDateTime: getMillisecondsSinceEpoch(shippingDateTime),
        DueDate: getMillisecondsSinceEpoch(dueDate)
    };
}

const citiesWithProductType = {
    "AbaAlworood": "RTC",
    "Abha": "RTC",
    "AbhaManhal": "RTC",
    "Abqaiq": "RTD",
    "AbuAjram": "RTC",
    "AbuAreish": "RTC",
    "AdDahinah": "RTD",
    "AdDubaiyah": "RTC",
    "Addayer": "RTC",
    "Adham": "RTD",
    "Afif": "RTD",
    "Aflaj": "RTD",
    "AhadMasarha": "RTD",
    "AhadRufaidah": "RTD",
    "AinDar": "RTD",
    "AlAdari": "RTC",
    "AlAis": "RTC",
    "AlAjfar": "RTD",
    "AlAmmarah": "RTC",
    "AlArdah": "RTC",
    "AlArja": "RTD",
    "AlAsyah": "RTC",
    "AlBada": "RTD",
    "AlBashayer": "RTC",
    "AlBatra": "RTD",
    "AlBijadyah": "RTC",
    "AlDalemya": "RTD",
    "AlFuwaileq": "RTD",
    "AlHait": "RTC",
    "AlHaith": "RTD",
    "AlHassa": "RTC",
    "AlHayathem": "RTC",
    "AlHufayyirah": "RTC",
    "AlHulayfahAsSufla": "RTC",
    "AlIdabi": "RTD",
    "AlJishah": "RTC",
    "AlJumum": "RTC",
    "AlKhishaybi": "RTC",
    "AlKhitah": "RTC",
    "AlLaqayit": "RTC",
    "AlMada": "RTC",
    "AlMadaya": "RTC",
    "AlMadinahAlMunawwarah": "RTD",
    "AlMahani": "RTC",
    "AlMahd": "RTD",
    "AlMidrij": "RTD",
    "AlMoya": "RTD",
    "AlQarin": "RTD",
    "AlUwayqilah": "RTD",
    "AlWasayta": "RTD",
    "AlJsh": "RTC",
    "Alghat": "RTD",
    "Alhada": "RTC",
    "Alnabhanya": "RTC",
    "Alrass": "RTD",
    "Amaq": "RTC",
    "AnNabkAbuQasr": "RTC",
    "AnNafiah": "RTC",
    "AnNuqrah": "RTC",
    "Anak": "RTC",
    "Aqiq": "RTD",
    "Aqool": "RTC",
    "ArRadifah": "RTC",
    "ArRafiah": "RTC",
    "ArRishawiyah": "RTC",
    "Arar": "RTD",
    "Artawiah": "RTC",
    "AsSulaimaniyah": "RTC",
    "AsSulubiayh": "RTC",
    "Asfan": "RTD",
    "AshShaara": "RTC",
    "AshShamli": "RTD",
    "AshShananah": "RTD",
    "AshShimasiyah": "RTD",
    "AshShuqaiq": "RTD",
    "Asheirah": "RTD",
    "AtTuwayr": "RTD",
    "Atawleh": "RTC",
    "AthThybiyah": "RTD",
    "Awamiah": "RTC",
    "AynFuhayd": "RTD",
    "Badaya": "RTC",
    "Bader": "RTC",
    "BadrAlJanoub": "RTD",
    "Baha": "RTC",
    "Bahara": "RTD",
    "BahrAbuSukaynah": "RTC",
    "BahratAlMoujoud": "RTC",
    "Balahmar": "RTC",
    "Balasmar": "RTC",
    "Balqarn": "RTD",
    "BaqaAshSharqiyah": "RTD",
    "Baqaa": "RTD",
    "Baqiq": "RTC",
    "Bareq": "RTD",
    "Batha": "RTC",
    "Biljurashi": "RTC",
    "Birk": "RTC",
    "Bish": "RTD",
    "Bisha": "RTD",
    "Bukeiriah": "RTC",
    "Buraidah": "RTD",
    "Daelim": "RTC",
    "Damad": "RTD",
    "Dammam": "RTD",
    "Darb": "RTD",
    "Daryah": "RTC",
    "Dawadmi": "RTC",
    "Deraab": "RTD",
    "DereIyeh": "RTC",
    "Dhabyah": "RTC",
    "Dhahban": "RTD",
    "Dhahran": "RTD",
    "DhahranAlJanoob": "RTC",
    "Dhurma": "RTC",
    "Diriyah": "RTD",
    "DomatAlJandal": "RTC",
    "Duba": "RTC",
    "Duhknah": "RTD",
    "DulayRashid": "RTC",
    "Farasan": "RTD",
    "Ghazalah": "RTC",
    "Ghtai": "RTC",
    "Gilwa": "RTC",
    "Gizan": "RTC",
    "Hadeethah": "RTC",
    "HaferAlBatin": "RTC",
    "Hail": "RTC",
    "Hajrah": "RTC",
    "HalatAmmar": "RTC",
    "Hali": "RTC",
    "Haqil": "RTD",
    "Harad": "RTC",
    "Harajah": "RTC",
    "Hareeq": "RTC",
    "HaweaTaif": "RTC",
    "Haweyah": "RTC",
    "HawtatBaniTamim": "RTC",
    "HazmAlJalamid": "RTD",
    "Hedeb": "RTD",
    "Hinakeya": "RTD",
    "Hofuf": "RTC",
    "Horaimal": "RTC",
    "HotatSudair": "RTC",
    "Hubuna": "RTD",
    "Huraymala": "RTC",
    "Huroob": "RTD",
    "Jaaraneh": "RTC & RTI",
    "JaAraneh": "RTD",
    "Jafar": "RTC",
    "Jalajel": "RTD",
    "Jeddah": "RTD",
    "Jouf": "RTD",
    "Jubail": "RTD",
    "Kahlah": "RTD",
    "Kara": "RTC",
    "KaraA": "RTC",
    "Karboos": "RTC",
    "Khafji": "RTC",
    "Khaibar": "RTD",
    "Khairan": "RTC",
    "Khamaseen": "RTD",
    "KhamisMushait": "RTD",
    "Kharj": "RTD",
    "Khasawyah": "RTC",
    "Khobar": "RTD",
    "Khodaria": "RTC",
    "Khulais": "RTC",
    "KingAbdullahEconomicCity": "RTD",
    "Kuhaybar": "RTD",
    "Layla": "RTD",
    "Lihyan": "RTC",
    "Lith": "RTC",
    "Majarda": "RTD",
    "MakkahAlMukarramah": "RTC",
    "Mandag": "RTD",
    "MashaAlHadeed": "RTC",
    "Mashar": "RTD",
    "Mecca": "RTC",
    "Midinhab": "RTC",
    "Mizab": "RTC",
    "Mubadala": "RTD",
    "Mulayjah": "RTC",
    "Muna": "RTC",
    "Munifah": "RTD",
    "Murayr": "RTD",
    "Muzahmiah": "RTC",
    "Najran": "RTC",
    "Namas": "RTD",
    "Nebyah": "RTD",
    "Nimran": "RTD",
    "Nisab": "RTC",
    "Nmaas": "RTD",
    "Noa": "RTC",
    "Numira": "RTD",
    "Nuqubah": "RTC",
    "Omul Hala": "RTC",
    "OmulRaka": "RTC",
    "Onayzah": "RTD",
    "Oula": "RTC",
    "Ouwaydah": "RTD",
    "Ozaizah": "RTD",
    "Qadeemah": "RTD",
    "QariyaAlOlya": "RTD",
    "QasrAlHokm": "RTD",
    "Qassab": "RTC",
    "Qatif": "RTD",
    "Qayra": "RTD",
    "Qeiba": "RTC",
    "Qeiteen": "RTC",
    "Qissia": "RTD",
    "Qunfudhah": "RTC",
    "Qurayyat": "RTC",
    "QurayyatAlMulayhan": "RTC",
    "Rabigh": "RTD",
    "Rahima": "RTD",
    "Rahmaniya": "RTC",
    "Ramah": "RTC",
    "Rana": "RTC",
    "Ranyah": "RTC",
    "Rass": "RTC",
    "RasTanura": "RTD",
    "Rashraaf": "RTC",
    "Riyadh": "RTI",
    "RiyadhAlKhabra": "RTC",
    "RiyadhAlkhubra": "RTC",
    "RiyadhAlMusalla": "RTC",
    "RiyadhAlNaseem": "RTC",
    "RiyadhArRimal": "RTC",
    "RiyadhAsSalam": "RTC",
    "RiyadhUthman": "RTC",
    "RiyadhYasmeen": "RTC",
    "RiyadhZone": "RTC",
    "Ruadah": "RTC",
    "Rumaniyah": "RTD",
    "Ruthwah": "RTC",
    "Sabha": "RTC",
    "Safaniyah": "RTD",
    "Sahmiya": "RTC",
    "Saida": "RTC",
    "SaihAlHimma": "RTC",
    "Saihat": "RTD",
    "Sakaka": "RTC",
    "Saleel": "RTD",
    "Salwa": "RTC",
    "Samoodah": "RTC",
    "Samtah": "RTC",
    "Sanamah": "RTD",
    "Sayqiyah": "RTC",
    "Shabrakah": "RTC",
    "Shadqam": "RTD",
    "Shamasiah": "RTD",
    "Shaqra": "RTC",
    "Shari": "RTC",
    "Sharorah": "RTC",
    "Shiyab": "RTC",
    "Shuqaiq": "RTC",
    "Shwaikh": "RTC",
    "Sihma": "RTC",
    "Sikkah": "RTC",
    "Sokkaynah": "RTC",
    "Sulaimania": "RTC",
    "Sulayel": "RTC",
    "Sur": "RTC",
    "Tabarjal": "RTC",
    "Tabuk": "RTC",
    "Tafi": "RTD",
    "Tagyah": "RTC",
    "Tahlia": "RTC",
    "Taif": "RTC",
    "Tamir": "RTC",
    "Tanumah": "RTC",
    "Tarout": "RTD",
    "Tarut": "RTD",
    "Tathleeth": "RTC",
    "Taybah": "RTC",
    "Thadiq": "RTC",
    "Tharmada": "RTC",
    "Thurayban": "RTC",
    "Tihama": "RTC",
    "Towd": "RTC",
    "Tumair": "RTC",
    "Turabah": "RTC",
    "Turaif": "RTC",
    "UglatAsugur": "RTD",
    "UglatHissin": "RTC",
    "Uhaimir": "RTC",
    "Unaizah": "RTC",
    "Unayzah": "RTC",
    "UqlatAlSoqur": "RTC",
    "Uqur": "RTC",
    "Usaylah": "RTC",
    "Usfan": "RTC",
    "Ushaiqer": "RTC",
    "Ushaiqar": "RTC",
    "Uthailah": "RTC",
    "Utayfi": "RTC",
    "WadiAlDawasir": "RTC",
    "WadiAlFaraa": "RTC",
    "WadiAlJamal": "RTC",
    "WadiAdDawasir": "RTC",
    "WadiAlHamra": "RTC",
    "WadiAlSalaa": "RTC",
    "WadiAdDiwasir": "RTC",
    "Waed": "RTC & RTD",
    "Wajh": "RTC",
    "Yadamah": "RTC",
    "Yanbu": "RTC",
    "YanbuAlBahr": "RTC",
    "YanbuAlNakhil": "RTC",
    "YanbuAlSibyan": "RTC",
    "Yudma": "RTC",
    "Zamzam": "RTC",
    "Zareer": "RTC",
    "Zulfi": "RTC"

}
// Example usage
const adjustedDatesValues = adjustDates();
console.log(adjustedDatesValues);

function adjustProductType(data) {
    return citiesWithProductType[data]
}

const aramexConfig = {
    url: 'https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreatePickup',
    headers: {
        'Content-Type': 'application/json'
    }
};



const trackingConfig = {
    url: 'https://ws.aramex.net/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments',
    headers: {
        'Content-Type': 'application/json'
    },
    data: {
        "ClientInfo": {
            "UserName": process.env.ARAMEX_USERNAME,
            "Password": process.env.ARAMEX_PASSWORD,
            "Version": process.env.ARAMEX_VERSION,
            "AccountNumber": process.env.ARAMEX_ACCOUNT_NUMBER,
            "AccountPin": process.env.ARAMEX_ACCOUNT_PIN,
            "AccountEntity": process.env.ARAMEX_ACCOUNT_ENTITY,
            "AccountCountryCode": process.env.ARAMEX_ACCOUNT_COUNTRY_CODE,
            "Source": parseInt(process.env.ARAMEX_SOURCE, 10)
        },
        "GetLastTrackingUpdateOnly": false,
        "Shipments": [],
        "Transaction": {
            "Reference1": "",
            "Reference2": "",
            "Reference3": "",
            "Reference4": "",
            "Reference5": ""
        }
    }
};

async function getRefundRequestDetails(refund_order_id) {
    try {
        const refundRequest = await RefundRequest.findOne({
            where: { id: refund_order_id },
            include: [
                {
                    model: RefundItem,
                    as: 'refundItems',
                    include: [
                        {
                            model: Product,
                            as: 'product'
                        }
                    ]
                },
                {
                    model: Customer,
                    as: 'customer'
                }
            ]
        });

        if (!refundRequest) {
            throw new Error(`RefundRequest with ID ${refund_order_id} not found`);
        }

        return refundRequest;
    } catch (error) {
        console.error('Error fetching refund request details:', error);
        throw error;
    }
}
function extractErrorText(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const paragraphs = doc.querySelectorAll('#content p');
    const errorText = Array.from(paragraphs).map(p => p.textContent.trim()).join(' ');
    return errorText || 'Error text not found';
}

function extractShipmentData(response) {
    if (response && response.ProcessedPickup && response.ProcessedPickup.ProcessedShipments && response.ProcessedPickup.ProcessedShipments.length > 0) {
        const shipment = response.ProcessedPickup.ProcessedShipments[0];
        return {
            ID: shipment.ID,
            LabelURL: shipment.ShipmentLabel.LabelURL
        };
    } else {
        return null;
    }
}

async function createPickup(refund_order_id) {
    console.log('create shipment process started')
    try {
        const refundRequest = await getRefundRequestDetails(refund_order_id);

        if (!refundRequest) {
            throw new Error(`RefundRequest with ID ${refund_order_id} not found`);
        }

        const { customer, refundItems, city } = refundRequest;
        const { address, first_name, last_name, email, mobile_number } = customer;
        const pickupAddress = address.split(','); // Assuming address is comma-separated
        const pickupAddressLine1 = pickupAddress[0] || "";
        const pickupAddressLine2 = pickupAddress[1] || "";

        const payload = {
            "ClientInfo": {
                "UserName": process.env.ARAMEX_USERNAME,
                "Password": process.env.ARAMEX_PASSWORD,
                "Version": process.env.ARAMEX_VERSION,
                "AccountNumber": process.env.ARAMEX_ACCOUNT_NUMBER,
                "AccountPin": process.env.ARAMEX_ACCOUNT_PIN,
                "AccountEntity": process.env.ARAMEX_ACCOUNT_ENTITY,
                "AccountCountryCode": process.env.ARAMEX_ACCOUNT_COUNTRY_CODE,
                "Source": parseInt(process.env.ARAMEX_SOURCE, 10)
            },
            "LabelInfo": {
                "ReportID": 9201,
                "ReportType": "URL"
            },
            "Pickup": {
                "PickupAddress": {
                    "Line1": pickupAddressLine1,
                    "Line2": pickupAddressLine2,
                    "Line3": "",
                    "PostCode": "",
                    "City": city || "Riyadh",
                    "CountryCode": "SA"
                },
                "PickupContact": {
                    "Department": "",
                    "PersonName": `${first_name} ${last_name}`,
                    "Title": "",
                    "CompanyName": "",
                    "PhoneNumber1": mobile_number,
                    "PhoneNumber1Ext": "",
                    "PhoneNumber2": "",
                    "PhoneNumber2Ext": "",
                    "FaxNumber": "",
                    "CellPhone": mobile_number,
                    "EmailAddress": email,
                    "Type": ""
                },
                "PickupLocation": "Office",
                "PickupDate": `/Date(${adjustedDatesValues.PickupDate})/`,
                "ReadyTime": `/Date(${adjustedDatesValues.ReadyTime})/`,
                "LastPickupTime": `/Date(${adjustedDatesValues.LastPickupTime})/`,
                "ClosingTime": `/Date(${adjustedDatesValues.ClosingTime})/`,
                "Comments": "Pickup request for refund",
                "Reference1": "TEST",
                "Reference2": "",
                "Vehicle": "",
                "Shipments": [{
                    "Reference1": refundRequest.uuid,
                    "Reference2": "",
                    "Reference3": "",
                    "Shipper": {
                        "Reference1": "",
                        "Reference2": "",
                        "AccountNumber": process.env.ARAMEX_ACCOUNT_NUMBER,
                        "PartyAddress": {
                            "Line1": pickupAddressLine1,
                            "Line2": pickupAddressLine2,
                            "Line3": "",
                            "PostCode": "",
                            "City": city,
                            "CountryCode": "SA",
                            "Longitude": 0,
                            "Latitude": 0,
                            "BuildingNumber": null,
                            "BuildingName": null,
                            "Floor": null,
                            "Apartment": null,
                            "POBox": null,
                            "Description": null
                        },
                        "Contact": {
                            "Department": "",
                            "PersonName": `${first_name} ${last_name}`,
                            "Title": "",
                            "CompanyName": "",
                            "PhoneNumber1": mobile_number,
                            "PhoneNumber1Ext": "",
                            "PhoneNumber2": "",
                            "PhoneNumber2Ext": "",
                            "FaxNumber": "",
                            "CellPhone": mobile_number,
                            "EmailAddress": email,
                            "Type": "Business"
                        }
                    },
                    "Consignee": {
                        "Reference1": "",
                        "Reference2": "",
                        "AccountNumber": process.env.ARAMEX_ACCOUNT_NUMBER,
                        "PartyAddress": {
                            "Line1": pickupAddressLine1,
                            "Line2": pickupAddressLine2,
                            "Line3": "",
                            "PostCode": "",
                            "City": city,
                            "StateOrProvinceCode": "",
                            "CountryCode": "SA",
                            "Longitude": 0,
                            "Latitude": 0,
                            "BuildingNumber": "",
                            "BuildingName": "",
                            "Floor": "",
                            "Apartment": "",
                            "POBox": null,
                            "Description": ""
                        },
                        "Contact": {
                            "Department": "",
                            "PersonName": "Silva",
                            "Title": "",
                            "CompanyName": "Thnyan",
                            "PhoneNumber1": "+966596520823",
                            "PhoneNumber1Ext": "",
                            "PhoneNumber2": "",
                            "PhoneNumber2Ext": "",
                            "FaxNumber": "",
                            "CellPhone": "+966596520823",
                            "EmailAddress": "",
                            "Type": ""
                        }
                    },
                    "ThirdParty": {
                        "Reference1": "",
                        "Reference2": "",
                        "AccountNumber": "",
                        "PartyAddress": {
                            "Line1": "",
                            "Line2": "",
                            "Line3": "",
                            "City": "",
                            "StateOrProvinceCode": "",
                            "PostCode": "",
                            "CountryCode": "",
                            "Longitude": 0,
                            "Latitude": 0,
                            "BuildingNumber": null,
                            "BuildingName": null,
                            "Floor": null,
                            "Apartment": null,
                            "POBox": null,
                            "Description": null
                        },
                        "Contact": {
                            "Department": "",
                            "PersonName": "",
                            "Title": "",
                            "CompanyName": "",
                            "PhoneNumber1": "",
                            "PhoneNumber1Ext": "",
                            "PhoneNumber2": "",
                            "PhoneNumber2Ext": "",
                            "FaxNumber": "",
                            "CellPhone": "",
                            "EmailAddress": "",
                            "Type": ""
                        }
                    },
                    "ShippingDateTime": `/Date(${adjustedDatesValues.ShippingDateTime})/`,
                    "DueDate": `/Date(${adjustedDatesValues.DueDate})/`,
                    "Comments": "Refund shipment",
                    "PickupLocation": "Reception",
                    "OperationsInstructions": "Fragile",
                    "AccountingInstrcutions": "Get us a discount please",
                    "Details": {
                        "Dimensions": null,
                        "ActualWeight": {
                            "Unit": "KG",
                            "Value": parseFloat(refundItems.reduce((total, item) => total + parseFloat(item.product.weight), 0)).toFixed(2),
                        },
                        "ChargeableWeight": null,
                        "DescriptionOfGoods": "perfumes",
                        "GoodsOriginCountry": "SA",
                        "NumberOfPieces": refundItems.reduce((total, item) => total + item.quantity, 0),
                        "ProductGroup": "DOM",
                        "ProductType": adjustProductType(city) || "RTC",
                        "PaymentType": "C",
                        "PaymentOptions": "",
                        "CustomsValueAmount": null,
                        "CashOnDeliveryAmount": null,
                        "InsuranceAmount": null,
                        "CashAdditionalAmount": null,
                        "CashAdditionalAmountDescription": "",
                        "CollectAmount": null,
                        "Services": "",
                        "Items": refundItems.map(item => ({
                            "PackageType": "Box",
                            "Quantity": item.quantity,
                            "Weight": {
                                "Unit": "Kg",
                                "Value": item.product.weight
                            },
                            "Reference": item.gtin,
                            "GoodsDescription": item.description,
                            "CountryOfOrigin": "SA"
                        }))
                    },
                    "Attachments": [],
                    "ForeignHAWB": "",
                    "TransportType": 0,
                    "PickupGUID": null,
                    "Number": "",
                    "ScheduledDelivery": null
                }],
                "PickupItems": refundItems.map(item => ({
                    "ProductGroup": "DOM",
                    "ProductType": adjustProductType(city) || "RTC",
                    "NumberOfShipments": 1,
                    "PackageType": "Box",
                    "Payment": "C",
                    "ShipmentWeight": {
                        "Unit": "KG",
                        "Value": parseFloat(item.product.weight).toFixed(2)
                    },
                    "ShipmentVolume": null,
                    "NumberOfPieces": item.quantity,
                    "CashAmount": null,
                    "ExtraCharges": null,
                    "ShipmentDimensions": {
                        "Length": 0,
                        "Width": 0,
                        "Height": 0,
                        "Unit": ""
                    },
                    "Comments": "Test"
                })),
                "Status": "Ready"
            },
            "Transaction": {
                "Reference1": "",
                "Reference2": "",
                "Reference3": "",
                "Reference4": "",
                "Reference5": ""
            }
        };



        const response = await axios.post(aramexConfig.url, payload, {
            headers: aramexConfig.headers
        });

        console.log('testing...........................', JSON.stringify(payload))


        const { ID, LabelURL } = extractShipmentData(response?.data)
        if (refundRequest && ID && LabelURL) {
            refundRequest.aramex_policy_number = ID;
            await refundRequest.save();
            await emailProcessor({
                data: {
                    to: customer.email,
                    city: refundRequest.city,
                    returnRequestId: refundRequest.uuid,
                    aramexPolicyNumber: ID,
                    url: LabelURL
                }
            });
        }
        return response.data;
    } catch (error) {
        console.log('Error creating pickup:', error.response.data);
        throw new Error(`Error creating pickup: ${extractErrorText(error.response.data)}`);
    }
}

const trackShipments = async (trackingNumbers) => {
    try {
        const response = await axios.post(trackingConfig.url, {
            ...trackingConfig.data,
            Shipments: trackingNumbers,
        }, {
            headers: trackingConfig.headers,
        });

        const trackingResults = response.data.TrackingResults;

        for (const result of trackingResults) {
            const waybillNumber = result.Key;

            const pickedUpStatus = result.Value.some(update =>
                update.UpdateCode === "SH012" &&
                update.UpdateDescription === "Picked Up From Shipper"
            );

            if (pickedUpStatus) {
                const refundRequest = await RefundRequest.findOne({
                    where: { aramex_policy_number: waybillNumber },
                });

                if (refundRequest) {
                    try {
                        await refundRequest.update({ return_status: "picked up" });
                
                        await processTamaraRequest({
                            data: {
                                refund_record_id: refundRequest.id,
                            }
                        });
                    } catch (error) {
                        console.error('Error processing Tamara request:', error);
                    }
                }
            }
        }
    } catch (error) {
        throw new Error(`Error tracking shipments: ${error.message}`);
    }
};


module.exports = { createPickup, trackShipments };