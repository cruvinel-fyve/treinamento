import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // ES6 import
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"; // ES6 import

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client); // client is DynamoDB client

export async function getCart (event:any): Promise<any> {
    //console.log(event);
    const productInCart = event.queryStringParameters;
    
    const params = new QueryCommand({
        TableName: 'cart-cdk',
        KeyConditionExpression: '#id_user = :id_user',
        ExpressionAttributeValues: {
            ':id_user': productInCart.id_user
        },
        ExpressionAttributeNames: {'#id_user': 'userId'}
    });

    const responsedb = await dynamodb.send(params);
    
    // console.log("responsedb: ", responsedb.Items[0]);
    const activedItem = responsedb.Items?.map(element =>(productActivedInCart(element)));
    // console.log("activedItem ", activedItem[0]);
    
    // atualizando banco de dados
    if(activedItem) {
        await responsedb.Items?.map((element, index) => putActivedStatus(element, activedItem[index]));
    
        const dados = responsedb.Items?.filter((item, index) => {
            return activedItem[index];
        });
        
        // console.log("dados: ", dados);
        
        const response = {
                statusCode: 200,
                body: JSON.stringify(dados),
        };
        return response;
    } else {
        const response = {
            body: JSON.stringify("Nenhum item no carrinho!"),
        };
        return response.body;
    }
}

// verificando a data e a quantidade
const productActivedInCart = (db:any) =>{
    // definindo data para comparação
    const nowDate = new Date().toISOString();
    // console.log(nowDate);
    // console.log(db);
    // fazendo verificação de qtd e data
    const qtdNotZero = (db.qtd_product > 0) ? true : false;
    const dataNotExpired = (db.date_expiration > nowDate) ? true : false;
    
    return (qtdNotZero && dataNotExpired) ? true : false;
};

const putActivedStatus = async (element:any, activedOrNot:boolean) => {
    const params = {
        TableName: 'cart-cdk',
        Item: {
            id_user: element.id_user,
            id_product: element.id_product,
            qtd_product: element.qtd_product,
            size: element.size,
            price: element.price,
            date_expiration: element.date_expiration,
            actived: activedOrNot
        }
    };
        const input = new PutCommand(params);
        
        // console.log(params.Item);
        
        const responsedb = await dynamodb.send(input);
        console.log("responsedbput: ", responsedb);
};
