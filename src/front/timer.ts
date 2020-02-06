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

  protected _interval?: NodeJS.Timeout;

  public static styles = [css`
    :host {
      display: block;
      padding: 8px 16px;
      min-width: 100px;
    }

    :host([state=stopped]) {
      background-color: black;
      color: white;
    }
    :host([state=running]) {
      background-color: #4caf50;
      color: white;
    }
    :host([state=paused]) {
      background-color: grey;
      color: white;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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
      </div>
    </header>

    <div id="content">
      ${this._countDown !== 0 ? this._countDown : this.initialTime}
    </div>
    `;
  }

  protected toggleRun() {
    (this.state === 'running') ? this.stop() : this.run(this._level);
  }

  protected stop() {
    this.state = 'stopped';
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = undefined;
    }
    // reset
    this._level = 0;
    this._countDown = 0;
  }

  protected run(level: number) {
    this.state = 'running';
    this._countDown = (toMilliseconds(this.initialTime) / 1000) +
        (level * toMilliseconds(this.increaseTime)) / 1000;
    this._interval = setInterval(() => {
      if (--this._countDown === 0) {
        clearInterval(this._interval!);
        this.nextAction();
      }
    }, 1000);
  }

  protected nextAction() {
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
