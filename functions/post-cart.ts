import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; 
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { int } from "aws-sdk/clients/datapipeline";

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client); // client is DynamoDB client

export async function postCart (event:any): Promise<any> {
   // console.log(event);
   const productInCart = event.queryStringParameters;
    
   // verificando se ha erros de badRequest
   const error = validation(productInCart);
   // Calculando valor atual da quantidade de produtos
   const qtdProduct = await manegeCart(productInCart.action, productInCart.qtd_product, productInCart.id_user, productInCart.id_product);
   const product = await  getQtdProduct(productInCart.id_user, productInCart.id_product);
   
   // console.log("produc.image: ", product.image);
   const actived = true
   if (error == "notErrorRequest") { // validação
       const params = {
           TableName: 'cart-cdk',
           Item: {
               id_user: productInCart.id_user,
               id_product: productInCart.id_product,
               qtd_product: qtdProduct,
               size: productInCart.size,
               date_expiration: dataExpiration(),
               actived: actived,
               name: product.name,
               category: product.category,
               image: product.image,
               amount: product.price
           }
       };
       
       const input = new PutCommand(params);

       const responsedb = await dynamodb.send(input);
       // console.log("input: ",input);
       const payloadLambda = 
       {
           "queryStringParameters": {
               "id_user": productInCart.id_user
           }
       };
       
       // Atualizando conteúdo da página
       const client = new LambdaClient({});
       const inputLambda = { // InvocationRequest
         FunctionName: "Dev-Training-Api-Cart-getProductInCart",
         Payload: JSON.stringify(payloadLambda),
       };
       
       const command = new InvokeCommand(inputLambda);
       const responseLambda = await client.send(command);
       
       const asciiDecoder = new TextDecoder('ascii');
       const data = asciiDecoder.decode(responseLambda.Payload);
       //console.log(JSON.parse(data));
       
       const dataFromLambda = JSON.parse(data)
       
       const response = {
           statusCode: 200,
           body: dataFromLambda.body
       };
       return response;

   }
   else {
       return error; // erro dado pela validação 
   }
}

// criando um prazo de validade de um dia para os itens do carrinho
const dataExpiration = () => {
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var tomorrowIso = new Date(tomorrow).toISOString();

    return tomorrowIso;
};

// Validando parametros
const validation = (params:any) => {
    if (!params.id_user) {
        const response = {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing id_user" }),
        };
        return response;
    }
    else if (!params.id_product) {
        const response = {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing id_product" }),
        };
        return response;
    }
    else if (!params.qtd_product) {
        const response = {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing qtd_product" }),
        };
        return response;
    }
    else if (!params.action) {
        if (params.action != "add" && params.action != "remove") {
            const response = {
                statusCode: 400,
                body: JSON.stringify({ message: "Action is not add or remove" }),
            };
            return response;
        }
        const response = {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing action" }),
        };
        return response;
    }
    else {
        return "notErrorRequest";
    }
};

// Definindo quantidade de produtos
const manegeCart = async (action:string, qtd:int, id_user:string, id_product:string): Promise<number> => {
    const qtdInBD:any = await  getQtdProduct(id_user, id_product);
    //console.log("qtdInBD: ", qtdInBD);
     if(action == "add") {
         if(qtdInBD.qtd_product == undefined){
             return qtd;
         }
         return Number(qtdInBD.qtd_product) + Number(qtd);
     }else if(action == "change"){
         return qtd;
     } else {
         return Number(qtdInBD.qtd_product) - Number(qtd);
     }
};

const auxGetDataProduct = async (id_product:string) => {
    const params = new QueryCommand({
        TableName: 'products-cdk',
        KeyConditionExpression: 'id_product = :id_product',
        ExpressionAttributeValues: {
            ':id_product': id_product
        }
    });

    const responsedb = await dynamodb.send(params);
    return responsedb.Items;
};

const getQtdProduct = async (id_user:string, id_product:string):Promise<any> => {
    
    const getAux = await auxGetDataProduct(id_product);
    //console.log("getAux[0].nome: ", getAux[0].nome);
    //console.log("getAux[0].categoria: ", getAux[0].categoria);
    //console.log("getAux[0].images.principal: ", getAux[0].images.principal);
    // console.log("getAux:", getAux[0].price)
    
    const params = new QueryCommand({
        TableName: 'cart-cdk',
        KeyConditionExpression: 'id_user = :id_user and id_product = :id_product',
        ExpressionAttributeValues: {
            ':id_user': id_user,
            ':id_product': id_product
        }
    });
    const responsedb = await dynamodb.send(params);
    // console.log("Items: ", responsedb.Items[0].qtd_product);
    // console.log("lengh: ", responsedb.Items.length);
    // console.log("chegou aqui:getQtdProduct");
    if(getAux){
        if(responsedb.Items?.length == undefined || responsedb.Items[0] == undefined){
            //console.log("chegou aqui:getQtdProductSe");
            const dados = {
                qtd_product: undefined,
                price: getAux[0].price,
                name: getAux[0].nome,
                category: getAux[0].categoria,
                image: getAux[0].images.principal
            };
            return dados;
        } else {
            //console.log("chegou aqui:getQtdProductSeN");
            //console.log(responsedb.Items[0]);
            const dados = {
                qtd_product: responsedb.Items[0].qtd_product,
                price: getAux[0].price,
                name: getAux[0].nome,
                category: getAux[0].categoria,
                image: getAux[0].images.principal
            };
            return dados;
        }   
    } else {
        const response = {
            body: "nenhum item!"
        };
        return response.body;
    }
};