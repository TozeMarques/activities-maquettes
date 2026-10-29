import { mount } from 'svelte';
import '../shared/ui.css';
import './c.css';
import App from './App.svelte';

mount(App, { target: document.getElementById('app') });
