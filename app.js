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
/* Html Elements */
const currenciesOneContainer = document.querySelector('[data-js="currencies-container"]');
const currencyOneEl = document.querySelector('[data-js="currency-one"]');
const currencyTwoEl = document.querySelector('[data-js="currency-two"]');
const currencyTimesOneEl = document.querySelector('[data-js="currency-one-times"]');
const convertedValueEl = document.querySelector('[data-js="converted-value"]');
const conversionPrecisionEl = document.querySelector('[data-js="conversion-precision"]');


/**
 * Mostra um alerta de erro
 * @param {string} message
 */
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

/**
 * Atualiza o valor da conversão
 */
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

/**
 * Concatena a url da chamada da api com a moeda
 * @param {string} currency 
 * @returns {string}
 */
const getUrl = (currency) => `https://v6.exchangerate-api.com/v6/8ff9fc0d9cc87551a5790385/latest/${currency}`;

/**
 * Retorna a mensagem de erro correspondente ao tipo de erro
 * @param {string} errorType 
 * @returns {string}
 */
const getErrorMessage = (errorType) => ({
    'unsupported-code': 'Moeda não suportada',
    'malformed-request': 'Requisição mal formada',
    'invalid-key': 'A chave de acesso é inválida.',
    'inactive-account': 'Sua conta está inativa.',
    'quota-reached': 'Sua conta atingiu o limite de requisições.',
})[errorType] || 'Ocorreu um erro no servidor.';

/**
 * Faz a requisição para obter os valores de conversão e trata possíveis erros
 * @param {string} currency 
 * @returns 
 */
async function fetchExchangeRate(currency) {
    try {
        const response = await fetch(getUrl(currency));

        if (!response.ok) 
            throw new Error("Erro de Conexão com a internet");

        data = await response.json();

        if (data.result == 'error') 
            throw new Error(getErrorMessage(data['error-type']));

        return state.setExchangeRate(data);
    }
    catch (error) {
        showAlert(error.message);
    }
}

/**
 * Cria uma lista de elementos <option> para um select
 * @param {object} selectedCurrency 
 * @returns {string}
 */
const getOptions = (selectedCurrency, conversion_rates) => {
    const selectedAttribute = currency => (currency == selectedCurrency) ? 'selected' : '';
    return Object.keys(conversion_rates)
        .map(currency => `<option ${selectedAttribute(currency)}>${currency}</option>`)
        .join('');
}

/**
 * Monta o Select para mostrar as moedas disponíveis
 * @param {object} param
 */
const showInitialInfo = ({ conversion_rates }) => {
    currencyOneEl.innerHTML = getOptions('USD', conversion_rates);
    currencyTwoEl.innerHTML = getOptions('BRL', conversion_rates);
    convertedValueEl.textContent = conversion_rates.BRL.toFixed(2);
    conversionPrecisionEl.textContent = `1 USD = ${conversion_rates.BRL} BRL`;
};

/**
 * Atualiza o valor textual dos elementos do DOM
 * @param {object} param
 */
const showUpdatedRates = ({ conversion_rates }) => {
    convertedValueEl.textContent = (currencyTimesOneEl.value * conversion_rates[currencyTwoEl.value]).toFixed(2);
    conversionPrecisionEl.textContent = `1 ${currencyOneEl.value} = ${1 * conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value}`;
}

/**
 * Função que é executada na incialização do script
 */
const init = async () => {
    const exchangeRate = await fetchExchangeRate('USD');
    if(exchangeRate && exchangeRate.conversion_rates) {
        showInitialInfo(exchangeRate);
    }
}

/**
 * Função que é executada quando ocorre um evento de mudança no primeiro select
 */
currencyOneEl.addEventListener('input', async (el) => {
    const exchangeRate = await fetchExchangeRate(el.target.value);
    showUpdatedRates(exchangeRate);
});

/**
 * Função que é executada quando ocorre um evento de mudança no segundo select
 */
currencyTwoEl.addEventListener('input', (el) => {
    showUpdatedRates(state.getExchangeRate());
});

/**
 * Função que é executada quando ocorre um evento de mudança no input de valores
 */
currencyTimesOneEl.addEventListener('input', (el) => {
    const { conversion_rates } = state.getExchangeRate();
    convertedValueEl.textContent = (el.target.value * conversion_rates[currencyTwoEl.value]).toFixed(2);
});


init();