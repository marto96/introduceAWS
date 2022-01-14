'use strict';
const { v4: uuidv4 } = require('uuid');
const QUEUE_URL = process.env.PENDING_ORDER_QUEUE;
const { sendMessage, insertOrder, deliveryOrder, checkOrder } = require('./awsConfig/awsConfig')


module.exports.hacerPedido = async(event) => {
    const orderId = uuidv4();
    try {
        const body = JSON.parse(event.body);
        const order = {
            orderId,
            name: body.name,
            address: body.address,
            pizzas: body.pizzas,
            timestamp: Date.now()
        };
        console.log("order", order)
        const params = {
            MessageBody: JSON.stringify(order),
            QueueUrl: QUEUE_URL
        }
        let sendMsj = await sendMessage(params)
        console.log("sendMsj", sendMsj)
        return {
            status: {
                code: 200,
                body: JSON.stringify(sendMsj)
            }
        }
        // return sendResponse(200, sendMsj)
    } catch (e) {
        console.log("order error", e)
        return sendResponse(500, e)
    }

};

module.exports.prepararPedido = async(event) => {
    console.log('preparPedido fue llamada');
    console.log(event);
    const order = JSON.parse(event.Records[0].body);
    return insertOrder(order)
}


module.exports.enviarPedido = async(event) => {
    console.log("enviar Pedido")
    console.log(event)
    const record = event.Records[0];
    if (record.eventName == 'INSERT') {
        console.log("delivery Order");
        const orderId = record.dynamodb.Keys.orderId.S;
        return deliveryOrder(orderId)
            .then(data => {
                console.log(data);
                return true
            })
    } else {
        console.log("is not a new record")
        return true
    }

}


module.exports.checkearEstadoPedido = async(event) => {
    console.log("consultar Pedido")
    console.log(event)
    const body = event.pathParameters;
    console.log("body", body)
    console.log("body", body.ordenId)


    return checkOrder(body.ordenId)
        .then(data => {
            console.log(data);
            console.log(JSON.stringify("El estado de la orden " + data.Item.orderId + " es " + data.Item.delivery_status))
            return {
                statusCode: 200,
                body: JSON.stringify("El estado de la orden " + data.Item.orderId + " es " + data.Item.delivery_status)

            }
        })


}

const sendResponse = async(statusCode, message) => {
    console.log("llega aqui", statusCode)
    console.log("llega aqui", message)

    return {
        statusCode: statusCode,
        body: JSON.stringify(message)
    };
}