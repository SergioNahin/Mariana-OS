import './styles/global.css';
import './app/mariana-app.js';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Mariana OS root element (#app) was not found.');
}

app.replaceChildren(document.createElement('mariana-app'));
