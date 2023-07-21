import axios from 'axios';

export async function SearchAdress (event:any): Promise<any> {
    const cep = event.queryStringParameters.cep;
    
    //console.log("cep: ", cep);
    
    const cepTratado = cep.replace(/\D/g, '');
    
    //console.log("cepTratado: ",cepTratado);
    
    const address = await gerandoAddress(cepTratado);
    
    const response = {
        statusCode: 200,
        body: JSON.stringify(address),
    };
    
    return response;
}

const calcFrete = (ddd:any) => {
    const frete = ddd/10*3;
    return frete.toFixed(2);
};

const gerandoAddress = async (cepTratado:any) => {
    
    var validacep = /^[0-9]{8}$/;
    
    if(validacep.test(cepTratado)){
        //console.log("cep válido!");
        const src = 'https://viacep.com.br/ws/'+ cepTratado + '/json/';
        const callback = await axios.get(src);
       // console.log(callback.data);
        
        const freight = calcFrete(callback.data.ddd);
        
        const address  = {
            cep: callback.data.cep,
            street: callback.data.logradouro,
            neighborhood: callback.data.bairro,
            city: callback.data.localidade,
            state: callback.data.uf,
            freight: freight
        };
        return address;
    } else {
        return "invalid cep!";
    }
}