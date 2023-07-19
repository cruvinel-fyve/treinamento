import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; 
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import axios from 'axios';

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client); // client is DynamoDB client

export async function postOrders (event:any): Promise<any> {
// console.log("event: ", event);
    // console.log("evenRb: ", event.Records[0].body);
    const eventParse = JSON.parse(event.Records[0].body);
    // console.log("evenParse: ", eventParse);
    const productInOrder = eventParse.queryStringParameters;
    const products = await getDataProduct(productInOrder.id_user);
    //////////////////////////////////////////////
    // Fazer lógica para calcular valor da venda//
    //////////////////////////////////////////////
    const cep = productInOrder.cep;
    const cepTratado = cep.replace(/\D/g, '');

    // verificando se ha erros de badRequest
    const error = validation(productInOrder, products); 
    
    const freight = calcFrete(cepTratado)
    if(await freight == "invalid cep!"){error.body = await freight;}
    
    if (error.body == "notErrorRequest" || error.body != "invalid cep!") { // validação
        //const priceOrder = priceProductOrder + freight;
        const params = {
            TableName: 'orders-cdk',
            Item: {
                id_user: productInOrder.id_user,
                data: new Date().toISOString(),
                products: products,
                //priceProducts: priceProductOrder,
                //priceOrder: priceOrder,
            }
        };
        if(products){
            let j = 0;
            for (const product of products) {
                const response = await modifyStock(product);
                if(response.body == "ConditionalCheckFailedException"){
                    j++;
                    // console.log("Passei aqui, valor do J: ", j);
                }
            }
            
            if(j >= 0){
                const input = new PutCommand(params);
                // console.log(params.Item);
                await dynamodb.send(input);
                // mudando status do carrinho para disable
                // console.log("products: ", products);
                for (const product of products) await putDisabledStatus(product);    
        
                const response = {
                    statusCode: 200,
                    body: "item added successfully!"
                };
                
                return response;
            } else {
                
                return "ERRO:ConditionalCheckFailedException"
            }   
        }
    }
    else {
        
        return error; // erro dado pela validação 
    }
}
// Validando parametros
const validation = (params:any, products:any) => {
    if (!params.id_user) {
        const response = {
            statusCode: 400,
            body: JSON.stringify({ message: "ERRO:Missing id_user" }),
        };
        return response;
    }
    // else if (!params.id_product) {
    //     const response = {
    //         statusCode: 400,
    //         body: JSON.stringify({ message: "Missing id_product" }),
    //     };
    //     return response;
    // } 
    else if (products.length == 0) {
        const response = {
            statusCode: 400,
            body: JSON.stringify({ message: "ERRO:No product in cart!" }),
        };
        return response;
    }else {
        const response = {
            statusCode: 200,
            body: JSON.stringify({ message: "MESSAGE:notErrorRequest!" }),
        };
        return response;
    }
};

const getDataProduct = async (id_user:string) => {
    
    const params = new QueryCommand({
        TableName: 'cart-cdk',
        KeyConditionExpression: 'id_user = :id_user',
        ExpressionAttributeValues: {
            ':id_user': id_user,
        }
    });

    const responsedb = await dynamodb.send(params);
    const activedItem = responsedb.Items?.map(element =>(productActivedInCart(element)));
    // console.log("activedItem: ", activedItem);
    
    const dados = responsedb.Items?.filter((item, index) => {
        if(activedItem){
            return activedItem[index];
        } else {
            return "Nenhum produto encontrado!"
        }
        
    });
    
    return dados;
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
    // console.log("element.id_product(put): ", element.id_product);
    const params = {
        TableName: 'cart-cdk',
        Item: {
            image: element.image,
            category: element.category,
            name: element.name,
            id_user: element.id_user,
            id_product: element.id_product,
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
    // console.log("responsedbput: ", responsedb);
};

const modifyStock = async (element:any) => {
    //console.log("element.id_product(modify): ", element.id_product);
    try{
        var params = {
            TableName: 'products-cdk',
            Key: { id_product : element.id_product },
            UpdateExpression: 'set #qtdStock = #qtdStock - :qtdSale',
            ConditionExpression: '#qtdStock > :minInStock',
            ExpressionAttributeNames: {'#qtdStock' : 'qtd_estoque'},
            ExpressionAttributeValues: {
                ':qtdSale' : element.qtd_product,
                ':minInStock' : 0,
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

const calcFrete = async (cepTratado:string): Promise<string> => {
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
        
        return frete.toFixed(2);
    } else {
        // console.log("SENAO");
        return "invalid cep!";
    }
    
};