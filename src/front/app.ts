import './timer';
import '@material/mwc-button';
import '@material/mwc-dialog';
import '@material/mwc-textfield';

import {Dialog} from '@material/mwc-dialog';
import {resetForm, serializeForm, validateForm} from '@vdegenne/mwc-forms-util';
import {css, customElement, html, LitElement, property, query} from 'lit-element';

import {globalStyles} from './global-styles';
import {TimerElement} from './timer';

@customElement('app-container')
export class AppContainer extends LitElement {
  /** app timers */
  @property() protected timers: TimerElement[] = [];

  @query('mwc-dialog') dialog: Dialog;

  constructor() {
    super();
    // @ts-ignore
    window.app = this;

    this.loadTimers();
  }

  public static styles = [
    globalStyles,
    css`
    :host {
      display: block;
      --mdc-theme-primary: #4caf50;
    }

    form {
      display: flex;
      flex-direction: column;
    }
    form > * {
      margin: 5px 0;
    }

    #timers {
      display: flex;
      flex-wrap: wrap;
      margin: 20px;
    }

    #timers > timer-element {
      margin: 0 0 0 10px;
    }
    `
  ];

  protected render() {
    return html`

    <div id="timers">${this.timers}</div>

    <mwc-dialog heading="Add Timer" open
        @closing=${this.onAddTimerDialogClosing}>
      <form>
        <mwc-textfield label="name" dialogInitialFocus required></mwc-textfield>
        <mwc-textfield value="3m" label="initial" name="initialTime" required></mwc-textfield>
        <mwc-textfield value="10m" label="rest" required></mwc-textfield>
        <mwc-textfield value="1m" label="increaseTime" required></mwc-textfield>
      </form>
      <mwc-button slot="secondaryAction" dialogAction="cancel">cancel</mwc-button>
      <mwc-button unelevated slot="primaryAction" dialogAction="add">add</mwc-button>
    </mwc-dialog>

    <div style="text-align:center">
      <mwc-button unelevated
          @click=${this.openAddTimerDialog}
          
          icon="add">
        add a timer
      </mwc-button>
    </div>
    `;
  }

  protected onAddTimerDialogClosing(e: CustomEvent) {
    const form = this.dialog.querySelector('form')!;

    if (e.detail.action === 'add') {
      if (!validateForm(form)) {
        this.dialog.open = true;
        return;
      }

      const timer = serializeForm(form);

      const timerElement = new TimerElement;

      Object.assign(timerElement, timer);
      this.addTimerElement(timerElement);
      resetForm(form);
    }
  }

  protected addTimerElement(timerElement: TimerElement) {
    this.timers.push(timerElement);
    this.requestUpdate();
  }

  public openAddTimerDialog() {
    this.shadowRoot!.querySelector('mwc-dialog')!.open = true;
  }

  public trumpet() {
    const audio = new Audio('./trumpet.wav');
    audio.play();
  }

  protected loadTimers() {
    if (localStorage.getItem('progtimers')) {
      this.timers = JSON.parse(localStorage.getItem('progtimers')!);
    } else {
      this.timers = [];
    }
  }

  protected saveTimers() {
    localStorage.setItem('progtimers', JSON.stringify(this.timers));
  }
};