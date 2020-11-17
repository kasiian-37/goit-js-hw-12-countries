import { fetchCountries } from './fetchCountries';
import { debounce } from 'lodash';
import { onNotify } from './pNotify';
import countryQuery from '../templates/countryQuery.hbs';
import countryQueryList from '../templates/countriesQueryList.hbs';

export class CountriesQuery {
  constructor({ input, section, delay = 500 }) {
    this._refs = {
      input: document.querySelector(input),
      section: document.querySelector(section),
    };
    this._delay = delay;
  }
  init() {
    this._refs.input.focus();
    this._refs.input.addEventListener(
      'input',
      debounce(this.onInput.bind(this), this._delay),
    );
  }

  render(htmlString, delay = 250) {
    setTimeout(() => {
      this._refs.section.innerHTML = htmlString;
    }, delay);
  }

  createCountriesListMarkup(country) {
    this.render(countryQueryList(country));
    onNotify(
      'This is a list of countries you could be looking for.',
      'info',
      'Choose one!',
    );
  }

  createOneCountryMarkup(country) {
    this.render(countryQuery(country));
    onNotify(
      'Your request have been succesfully done! This is country you have searched.',
      'info',
      'Congratulations!',
    );
  }
  onDataReceived(data) {
    if (data.status === 404) {
      onNotify(`${data.message}`, 'error', data.status);
      return;
    }
    if (data.hasOwnProperty('name')) {
      this.createOneCountryMarkup(data);
      return;
    }
    if (data.length > 10) {
      onNotify(
        `Too many countries found: ${data.length}. Please enter a more specific query!`,
        'error',
        'ERROR',
      );
      return;
    }
    if (data.length === 1) {
      this.createOneCountryMarkup(data[0]);
      return;
    }
    this.createCountriesListMarkup(data);
  }
  onInput(event) {
    const countryName = event.target.value.trim();
    if (countryName === '') {
      this._refs.section.innerHTML = '';
      return;
    }
    fetchCountries(countryName)
      .then(this.onDataReceived.bind(this))
      .catch(console.log);
  }
}
