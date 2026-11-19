import { mount } from 'svelte';
import '../shared/ui.css';
import './d.css';
import App from './App.svelte';

mount(App, { target: document.getElementById('app') });
