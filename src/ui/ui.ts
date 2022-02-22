import { Notifications } from './notifications';

export const MAIN_UI_ELEMENT = document.createElement('div')
MAIN_UI_ELEMENT.id = 'main-element';
document.body.appendChild(MAIN_UI_ELEMENT)

export const NOTIFICATIONS = new Notifications()

