const aws = require('aws-sdk');
aws.config.update({ region: 'us-east-1' });
module.exports.sendMessage = async(params) => {
    let sqs = new aws.SQS();
    return sqs.sendMessage(params).promise();
}
module.exports.insertOrder = async(order) => {
    console.log("Guardar un pedido fue llamado");
    order.delivery_status = "READY_FOR_DELIVERY";

    const params = {
        TableName: process.env.COMPLETED_ORDER_TABLE,
        Item: order
    }
    let dynamo = new aws.DynamoDB.DocumentClient();
    return dynamo.put(params).promise();
}

module.exports.deliveryOrder = async(orderId) => {
    console.log("Guardar un pedido fue llamado");

    const params = {
        TableName: process.env.COMPLETED_ORDER_TABLE,
        Key: {
            orderId
        },
        ConditionExpression: "attribute_exists(orderId)",
        UpdateExpression: " set delivery_status = :se",
        ExpressionAttributeValues: {
            ":se": "DELIVERED"
        },
        ReturnValues: "ALL_NEW"
    }
    let dynamo = new aws.DynamoDB.DocumentClient();
    return dynamo.update(params).promise();
}


module.exports.checkOrder = async(orderId) => {
    console.log("consulta pedido y estado");
    console.log(orderId);

    const params = {
        Key: {
            orderId
        },
        TableName: process.env.COMPLETED_ORDER_TABLE
    }
    let dynamo = new aws.DynamoDB.DocumentClient();
    return dynamo.get(params).promise();
}