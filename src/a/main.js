import { mount } from 'svelte';
import '../shared/ui.css';
import './a.css';
import App from './App.svelte';

mount(App, { target: document.getElementById('app') });
