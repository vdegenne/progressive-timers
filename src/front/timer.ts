import '@material/mwc-icon';
import {css, customElement, html, LitElement, property} from 'lit-element';
import {toMilliseconds} from 'stringytime';
import {AppContainer} from './app';

declare let app: AppContainer;

@customElement('timer-element')
export class TimerElement extends LitElement {
  @property() name = '';
  @property() initialTime = '1m';
  @property() rest = '10m';
  @property() increaseTime = '30s';

  protected _level = 0;
  @property() protected _countDown = 0;

  @property({reflect: true})
  protected state: 'stopped'|'paused'|'running' = 'stopped';

  @property({type: Boolean, reflect: true}) protected notified = false;

  protected _interval?: NodeJS.Timeout;

  public static styles = [css`
    :host {
      display: block;
      padding: 8px 8px 8px 16px;
    }

    :host([state=stopped]) {
      background-color: grey;
      color: white;
    }
    :host([state=running]) {
      background-color: red;
      color: white;
    }
    :host([state=paused]) {
      background-color: green;
      color: white;
    }

    :host([notified]) {
      border: 5px solid #FFEB3B;
      /* color: black; */
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    header > div:first-of-type {
      margin: 0 26px 0 0;
    }

    mwc-icon {
      font-size: 34px;
      user-select: none;
      cursor: pointer;
      vertical-align: bottom;
    }

    #content {
      padding: 8px;
      text-align: center;
    }
  `];

  protected render() {
    return html`
    <header>
      <div>${this.name}</div>
      <div>
        <mwc-icon @click=${this.toggleRun}>
          ${this.state === 'stopped' ? 'play_arrow' : 'stop'}
        </mwc-icon>
        <mwc-icon @click=${this.destruct}>delete</mwc-icon>
      </div>
    </header>

    <div id="content">
      ${
        this._countDown !== 0 ?
            this._countDown :
            `${this.initialTime}/${this.rest}/${this.increaseTime}`}
    </div>
    `;
  }

  constructor() {
    super();
    this.addEventListener('mouseenter', () => {
      this.notified = false;
    });
  }

  protected destruct() {
    const answer = confirm('are you sure ?');
    if (!answer) {
      return;
    }
    app.timers.splice(app.timers.indexOf(this), 1);
    app.saveTimers();
    app.requestUpdate();
  }

  protected toggleRun() {
    if (this.state === 'stopped') {
      // ask how to start the timer
      app.onStartStateDialogClosing = (e) => {
        switch (e.detail.action) {
          case 'initial':
            this.run(this._level);
            break;
          case 'resting':
            this.state = 'running';
            this.nextAction(false);
            break;
          default:
            // do nothing
            break;
        }
      };
      app.startTimeDialog.open = true;
    } else {
      this.stop();
    }
  }

  protected stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = undefined;
    }
    // reset
    this._level = 0;
    this._countDown = 0;
    this.state = 'stopped';
  }

  protected run(level: number) {
    this._countDown = (toMilliseconds(this.initialTime) / 1000) +
        (level * toMilliseconds(this.increaseTime)) / 1000;
    this._interval = setInterval(() => {
      if (--this._countDown === 0) {
        clearInterval(this._interval!);
        this.nextAction();
      }
    }, 1000);
    this.state = 'running';
  }

  protected nextAction(notify = true) {
    if (this.state === 'running') {
      this.pause();
      this._countDown = toMilliseconds(this.rest) / 1000;  // reduce to seconds
      this._interval = setInterval(() => {
        if (--this._countDown === 0) {
          clearInterval(this._interval!);
          this.nextAction();
        }
      }, 1000);
    } else if (this.state === 'paused') {
      this._level++;
      this.run(this._level);
    }

    if (notify) {
      this.notify();
    }
  }

  notify() {
    this.notified = true;
    app.trumpet();
  }

  protected pause() {
    this.state = 'paused';
  }

  toJSON() {
    return {
      name: this.name, initialTime: this.initialTime, rest: this.rest,
          increaseTime: this.increaseTime
    }
  }
}
