import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; 
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import axios from 'axios';

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client); // client is DynamoDB client

export async function postOrders (event:any): Promise<any> {
    console.log("event: ", event);
     console.log("evenRb: ", event.Records[0].body);
    const eventParse = JSON.parse(event.Records[0].body);
    console.log("evenParse: ", eventParse);
    const infoUser = eventParse.queryStringParameters;
    console.log("productInOrder: ", infoUser);
    if (infoUser != undefined){
        const products = await getProductsInCart(infoUser.id_user);
        console.log ("products: ", products)
        const errorr = await validation(infoUser, products);
        if(products != undefined && errorr != undefined) {
            console.log("error.statusCode: ",errorr.statusCode)
            if (errorr.statusCode == 200){
                const freight = await calcFrete(infoUser.cep)
                const priceProductOrder = priceOfAllProducts(products);
                const priceOrder = Number(priceProductOrder)+Number(freight);
                console.log('Entrando aqui:SE');
                const params = {
                    TableName: 'orders-cdk',
                    Item: {
                        userId: infoUser.id_user,
                        date: new Date().toISOString(),
                        products: products,
                        priceProducts: priceProductOrder,
                        freight: freight,
                        priceOrder: priceOrder,
                        // adicionar endereço
                    }
                };
                    
                const input = new PutCommand(params);
                // console.log(params.Item);
                await dynamodb.send(input);
                // mudando status do carrinho para disable
                // console.log("products: ", products);
                for (const product of products) {await putDisabledStatus(product)};
            
                const response = {
                    statusCode: 200,
                    body: "item added successfully!"
                };
                        
                return response;
            } else {
                console.log('Entrando aqui:SENAO')
                console.log("error: ", errorr);
                return errorr;
                    
            }   
        } else {
            return 'product or validation is undefined'
        } 
    } else {
        return 'input is undefined'
    }
}
// Validando parametros
const validation = async (params:any, products:any) => {
    let j = 0;
    for (const product of products) {
        const response = await modifyStock(product);
            if(response.body == "ConditionalCheckFailedException"){
            j++;
            // console.log("Passei aqui, valor do J: ", j);
        }
    }
    
    
    if (!params.id_user) {
        const response = {
            statusCode: 400,
            body: JSON.stringify({ message: "ERRO:Missing id_user" }),
        };
        return response;
        
    } else if (j>0) {
         const response = {
             statusCode: 400,
             body: JSON.stringify({ message: "ERRO: Stock not enough!" }),
         };
         return response;
         
    } else if (products.length == 0) {
        const response = {
            statusCode: 400,
            body: JSON.stringify({ message: "ERRO:No product in cart!" }),
        };
        return response;
        
    } else if (await calcFrete(params.cep) == "invalid cep!") {
        const response = {
            statusCode: 400,
            body: JSON.stringify({ message: "ERRO:invalid cep!" }),
        };
        return response;
        
    } else {
        const response = {
            statusCode: 200,
            body: JSON.stringify({ message: "Message: No error request" }),
        };
        return response;
    }
};

const getProductsInCart = async (id_user:any) => {
    
    const params = new QueryCommand({
        TableName: 'cart-cdk',
        KeyConditionExpression: 'userId = :id_user',
        ExpressionAttributeValues: {
            ':id_user': id_user,
        }
    });
    
    const responsedb = await dynamodb.send(params);
    const activedItem = responsedb.Items?.map(element =>(productActivedInCart(element)));
    console.log("activedItem: ", activedItem);
    if (activedItem != undefined) {
        const dados = responsedb.Items?.filter((item, index) => {
    
            return activedItem[index];
        });

        return dados;
    } else {
        return 'ERRO:No product in cart!'
    }
};

const productActivedInCart = (db:any) =>{
    // definindo data para comparação
    const nowDate = new Date().toISOString();
    //console.log(nowDate);
    const statusActived = (db.actived) ? true : false;
    // fazendo verificação de qtd e data
    const qtdNotZero = (Number(db.qtd_product) > 0) ? true : false;
    const dataNotExpired = (db.date_expiration > nowDate) ? true : false;
    
    
    return (qtdNotZero && dataNotExpired && statusActived) ? true : false;
};

const putDisabledStatus = async (element:any) => {
    if (element != undefined) {
        console.log("element(put): ", element);
        const params = {
            TableName: 'cart-cdk',
            Item: {
                image: element.image,
                category: element.category,
                name: element.name,
                userId: element.userId,
                productId: element.productId,
                qtd_product: 0,
                size: element.size,
                amount: element.amount,
                date_expiration: element.date_expiration,
                actived: false
            }
        };
        // console.log(params.Item);
        
        const input = new PutCommand(params);
            
        await dynamodb.send(input);
 
    } else {
        console.log ('Product is undefined')
    }
};

const modifyStock = async (element:any) => {
    console.log("element(modify): ", element);
    try{
        var params = {
            TableName: 'products-cdk',
            Key: { id : element.productId },
            UpdateExpression: 'set #qtdStock = #qtdStock - :qtdSale',
            ConditionExpression: '#qtdStock > :qtdSale ',
            ExpressionAttributeNames: {'#qtdStock' : 'qtd_estoque'},
            ExpressionAttributeValues: {
                ':qtdSale' : element.qtd_product,
            },
            ReturnValuesOnConditionCheckFailure: 'ALL_OLD'
        };
        
        // console.log("params(modify): ", params);
        
        const input = new UpdateCommand(params);
            
        await dynamodb.send(input);
        
        const response = {
            statusCode:200,
            body: JSON.stringify({ message: "Okay, enough stock!" })
        };
        
        return response;
    }catch (err:any) {
        // console.log(Object.keys(err))
        // console.log("err.name: ", err.name);
        const response = {
            statusCode:400,
            body: JSON.stringify(err.name)
        };
        
        return response;
    }
};

const calcFrete = async (cepTratado:any) => {
    // console.log("cepTratado(calcFrete):", cepTratado)
    var validacep = /^[0-9]{8}$/;
    
    if(validacep.test(cepTratado)){
        // console.log("SE");
        //console.log("cep válido!");
        const src = 'https://viacep.com.br/ws/'+ cepTratado + '/json/';
        const callback = await axios.get(src);
        // console.log(callback.data);
        // console.log("callback.data: ", callback.data)
        const ddd = callback.data.ddd;
        const frete = Number(ddd)/10*3;
        
        return String(frete.toFixed(2));
    } else {
        // console.log("SENAO");
        return "invalid cep!";
    }
    
};

const priceOfAllProducts = (products:any) => {
    let price = 0;
    for (const product of products){
        price += product.amount*product.qtd_product;
    } 
    return price;
}
