/*
  - Construa uma aplicação de conversão de moedas. O HTML e CSS são os que você
    está vendo no browser;
  - Você poderá modificar a marcação e estilos da aplicação depois. No momento, 
    concentre-se em executar o que descreverei abaixo;
    - Quando a página for carregada: 
      - Popule os <select> com tags <option> que contém as moedas que podem ser
        convertidas. "BRL" para real brasileiro, "EUR" para euro, "USD" para 
        dollar dos Estados Unidos, etc.
      - O option selecionado por padrão no 1º <select> deve ser "USD" e o option
        no 2º <select> deve ser "BRL";
      - O parágrafo com data-js="converted-value" deve exibir o resultado da 
        conversão de 1 USD para 1 BRL;
      - Quando um novo número for inserido no input com 
        data-js="currency-one-times", o parágrafo do item acima deve atualizar 
        seu valor;
      - O parágrafo com data-js="conversion-precision" deve conter a conversão 
        apenas x1. Exemplo: 1 USD = 5.0615 BRL;
      - O conteúdo do parágrafo do item acima deve ser atualizado à cada 
        mudança nos selects;
      - O conteúdo do parágrafo data-js="converted-value" deve ser atualizado à
        cada mudança nos selects e/ou no input com data-js="currency-one-times";
      - Para que o valor contido no parágrafo do item acima não tenha mais de 
        dois dígitos após o ponto, você pode usar o método toFixed: 
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
    - Para obter as moedas com os valores já convertidos, use a Exchange rate 
      API: https://www.exchangerate-api.com/;
      - Para obter a key e fazer requests, você terá que fazer login e escolher
        o plano free. Seus dados de cartão de crédito não serão solicitados.
*/

const currenciesOneContainer = document.querySelector('[data-js="currencies-container"]');
const currencyOneEl = document.querySelector('[data-js="currency-one"]');
const currencyTwoEl = document.querySelector('[data-js="currency-two"]');
const currencyTimesOneEl = document.querySelector('[data-js="currency-one-times"]');
const convertedValueEl = document.querySelector('[data-js="converted-value"]');
const conversionPrecisionEl = document.querySelector('[data-js="conversion-precision"]');


const showAlert = (message) => {
    const div = document.createElement('div');
    div.textContent = message
    div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show');
    div.setAttribute('role', 'alert');

    const button = document.createElement('button');
    button.classList.add('btn-close');
    button.setAttribute('type', 'button');
    button.setAttribute('data-dismiss', 'alert');
    button.setAttribute('aria-label', 'close');
    button.addEventListener('click', () => div.remove());

    div.appendChild(button)
    currenciesOneContainer.insertAdjacentElement('afterend', div);
}


const state = (() => {
    let exchangeRate = {}
    return {
        getExchangeRate: () => exchangeRate,
        setExchangeRate: (rate) => {
            if(!rate.conversion_rates)  {
                showAlert('O objeto precisa conter a propriedade conversion_rates.');
                return;
            }
            exchangeRate = rate;
            return exchangeRate;
        },
    }
})()


const getUrl = (currency) => `https://v6.exchangerate-api.com/v6/8ff9fc0d9cc87551a5790385/latest/${currency}`;

const getErrorMessage = (errorType) => ({
    'unsupported-code': 'Moeda não suportada',
    'malformed-request': 'Requisição mal formada',
    'invalid-key': 'A chave de acesso é inválida.',
    'inactive-account': 'Sua conta está inativa.',
    'quota-reached': 'Sua conta atingiu o limite de requisições.',
})[errorType] || 'Ocorreu um erro no servidor.';





async function fetchExchangeRate(currency) {
    try {
        const response = await fetch(getUrl(currency));
        if (!response.ok) 
            throw new Error("Erro de Conexão com a internet");
        data = await response.json();
        if (data.result == 'error') 
            throw new Error(getErrorMessage(data['error-type']));
        return data;
    }
    catch (error) {
        showAlert(error.message);
    }
}

const showInitialInfo = (exchangeRate) => {
    const getOptions = selectedCurrency => Object.keys(exchangeRate.conversion_rates)
    .map(currency => `<option ${currency == selectedCurrency ? 'selected' : ''}>${currency}</option>`)
    .join('');

    currencyOneEl.innerHTML = getOptions('USD');
    currencyTwoEl.innerHTML = getOptions('BRL');

    convertedValueEl.textContent = exchangeRate.conversion_rates.BRL.toFixed(2);
    conversionPrecisionEl.textContent = `1 USD = ${exchangeRate.conversion_rates.BRL} BRL`;
};

const showUpdatedRates = (exchangeRate) => {
    convertedValueEl.textContent = (currencyTimesOneEl.value * exchangeRate.conversion_rates[currencyTwoEl.value]).toFixed(2);
    conversionPrecisionEl.textContent = `1 ${currencyOneEl.value} = ${1 * exchangeRate.conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value}`;
}

const init = async () => {
    const exchangeRate = state.setExchangeRate(await fetchExchangeRate('USD'));
    if(exchangeRate && exchangeRate.conversion_rates) {
        showInitialInfo(exchangeRate);
    }
}

currencyOneEl.addEventListener('input', async (el) => {
    const exchangeRate = state.setExchangeRate(await fetchExchangeRate(el.target.value));
    console.log(exchangeRate);
    showUpdatedRates(exchangeRate);
});

currencyTwoEl.addEventListener('input', (el) => {
    showUpdatedRates(state.getExchangeRate());
});

currencyTimesOneEl.addEventListener('input', (el) => {
    const exchangeRate = state.getExchangeRate();
    convertedValueEl.textContent = (el.target.value * exchangeRate.conversion_rates[currencyTwoEl.value]).toFixed(2);
});


init();